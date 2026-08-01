const { all, get } = require('../models/dbHelper');

async function getAdminStats(req, res, next) {
  try {
    const totalStudents = await get('SELECT COUNT(*) AS count FROM students');
    const totalExams = await get('SELECT COUNT(*) AS count FROM results');
    const averageScore = await get('SELECT AVG(percentage) AS avgScore FROM results');
    const highestScore = await get('SELECT MAX(percentage) AS maxScore FROM results');
    const difficultSubject = await get(
      'SELECT subjects.name, AVG(results.percentage) AS avg_percentage FROM results JOIN subjects ON subjects.id = results.subject_id GROUP BY subjects.id ORDER BY avg_percentage ASC LIMIT 1'
    );
    res.json({
      totalStudents: totalStudents.count,
      totalExams: totalExams.count,
      averageScore: Number((averageScore.avgScore || 0).toFixed(2)),
      highestScore: Number((highestScore.maxScore || 0).toFixed(2)),
      mostDifficultSubject: difficultSubject ? difficultSubject.name : null
    });
  } catch (err) {
    next(err);
  }
}

async function viewStudents(req, res, next) {
  try {
    const students = await all('SELECT id, name, email, role, created_at FROM students ORDER BY id DESC');
    res.json({ students });
  } catch (err) {
    next(err);
  }
}

async function manageQuestions(req, res, next) {
  try {
    const filters = [];
    const params = [];

    if (req.query.subjectId) {
      filters.push('q.subject_id = ?');
      params.push(Number(req.query.subjectId));
    }

    if (req.query.q) {
      filters.push('q.text LIKE ?');
      params.push(`%${req.query.q}%`);
    }

    let sql = 'SELECT q.id, q.text, q.correct_answer, q.difficulty, q.subject_id, s.name AS subject FROM questions q JOIN subjects s ON s.id = q.subject_id';
    if (filters.length) {
      sql += ' WHERE ' + filters.join(' AND ');
    }
    sql += ' ORDER BY q.id DESC';

    const questions = await all(sql, params);
    res.json({ questions });
  } catch (err) {
    next(err);
  }
}

async function manageSubjects(req, res, next) {
  try {
    const subjects = await all(
      'SELECT s.id, s.name, s.description, s.difficulty, COUNT(q.id) AS questionCount FROM subjects s LEFT JOIN questions q ON q.subject_id = s.id GROUP BY s.id ORDER BY s.name'
    );
    res.json({ subjects });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAdminStats,
  viewStudents,
  manageQuestions,
  manageSubjects
};
