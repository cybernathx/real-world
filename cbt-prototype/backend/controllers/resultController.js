const { get, run, all } = require('../models/dbHelper');

async function getResultsByStudent(req, res, next) {
  try {
    const studentId = parseInt(req.params.studentId, 10);
    if (Number.isNaN(studentId)) {
      return res.status(400).json({ error: 'Invalid student id' });
    }
    if (req.user.role !== 'admin' && req.user.id !== studentId) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const results = await all(
      'SELECT r.id, r.subject_id, s.name AS subject_name, r.score, r.total, r.percentage, r.grade, r.time_used, r.created_at FROM results r JOIN subjects s ON s.id = r.subject_id WHERE r.student_id = ? ORDER BY r.created_at DESC',
      [studentId]
    );
    res.json({ results });
  } catch (err) {
    next(err);
  }
}

async function submitResult(req, res, next) {
  try {
    const { subjectId, score, total, percentage, grade, timeUsed } = req.body;
    const studentId = req.body.studentId || req.user.id;
    if (!studentId || !subjectId || score == null || total == null || percentage == null || !grade || timeUsed == null) {
      return res.status(400).json({ error: 'studentId, subjectId, score, total, percentage, grade, and timeUsed are required' });
    }
    if (req.user.role !== 'admin' && req.user.id !== studentId) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const result = await run(
      'INSERT INTO results (student_id, subject_id, score, total, percentage, grade, time_used) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [studentId, subjectId, score, total, percentage, grade, timeUsed]
    );
    await run(
      "INSERT INTO attempts (student_id, result_id, status, question_count, completed_at) VALUES (?, ?, ?, ?, datetime('now'))",
      [studentId, result.lastID, 'completed', total]
    );
    res.status(201).json({ message: 'Result submitted', resultId: result.lastID });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getResultsByStudent,
  submitResult
};
