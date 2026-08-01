const { all, get } = require('../models/dbHelper');

async function getAdminStats(req, res, next) {
  try {
    const totalStudents = await get('SELECT COUNT(*) AS count FROM students');
    const totalExams = await get('SELECT COUNT(*) AS count FROM results');
    const totalQuestions = await get('SELECT COUNT(*) AS count FROM questions');
    const totalSubjects = await get('SELECT COUNT(*) AS count FROM subjects');
    const averageScore = await get('SELECT AVG(percentage) AS avgScore FROM results');
    const highestScore = await get('SELECT MAX(percentage) AS maxScore FROM results');
    const difficultSubject = await get(
      'SELECT subjects.name, AVG(results.percentage) AS avg_percentage FROM results JOIN subjects ON subjects.id = results.subject_id GROUP BY subjects.id ORDER BY avg_percentage ASC LIMIT 1'
    );
    // Recent activity (last 5 attempts)
    const recentActivity = await all(
      'SELECT r.id, r.score, r.percentage, r.grade, r.time_used, r.created_at, s.name AS subject, st.name AS student_name, st.email AS student_email FROM results r JOIN subjects s ON s.id = r.subject_id JOIN students st ON st.id = r.student_id ORDER BY r.created_at DESC LIMIT 5'
    );

    res.json({
      totalStudents: totalStudents.count,
      totalExams: totalExams.count,
      totalQuestions: totalQuestions.count,
      totalSubjects: totalSubjects.count,
      averageScore: Number((averageScore.avgScore || 0).toFixed(2)),
      highestScore: Number((highestScore.maxScore || 0).toFixed(2)),
      mostDifficultSubject: difficultSubject ? difficultSubject.name : null,
      recentActivity
    });
  } catch (err) {
    next(err);
  }
}

// Admin: fetch candidate records with search/filter/pagination
async function getCandidateRecords(req, res, next) {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Number(req.query.limit) || 20);
    const offset = (page - 1) * limit;

    const filters = [];
    const params = [];

    if (req.query.subjectId) {
      filters.push('r.subject_id = ?');
      params.push(Number(req.query.subjectId));
    }

    if (req.query.q) {
      filters.push('(st.name LIKE ? OR st.email LIKE ?)');
      params.push(`%${req.query.q}%`, `%${req.query.q}%`);
    }

    let where = '';
    if (filters.length) where = 'WHERE ' + filters.join(' AND ');

    const totalRow = await get(`SELECT COUNT(*) AS count FROM results r JOIN students st ON st.id = r.student_id ${where}`, params);
    const total = totalRow.count;

    const sql = `SELECT r.id, r.student_id, st.name AS student_name, st.email AS student_email, r.subject_id, s.name AS subject, r.score, r.total, r.percentage, r.grade, r.time_used, r.created_at FROM results r JOIN students st ON st.id = r.student_id JOIN subjects s ON s.id = r.subject_id ${where} ORDER BY r.created_at DESC LIMIT ? OFFSET ?`;
    const rows = await all(sql, params.concat([limit, offset]));

    res.json({ records: rows, total, page, limit });
  } catch (err) {
    next(err);
  }
}

async function getStudentHistory(req, res, next) {
  try {
    const studentId = parseInt(req.params.studentId, 10);
    if (Number.isNaN(studentId)) return res.status(400).json({ error: 'Invalid student id' });

    const rows = await all(
      'SELECT r.id, r.subject_id, s.name AS subject, r.score, r.total, r.percentage, r.grade, r.time_used, r.created_at FROM results r JOIN subjects s ON s.id = r.subject_id WHERE r.student_id = ? ORDER BY r.created_at DESC',
      [studentId]
    );

    res.json({ results: rows });
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
  getCandidateRecords,
  getStudentHistory,
  viewStudents,
  manageQuestions,
  manageSubjects
};
