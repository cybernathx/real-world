const { all, get } = require('../models/dbHelper');

async function getStudentDashboard(req, res, next) {
  try {
    const studentId = req.user.id;

    const totalSubjects = await get('SELECT COUNT(*) AS count FROM subjects');
    const totalCompleted = await get('SELECT COUNT(*) AS count FROM results WHERE student_id = ?', [studentId]);
    const average = await get('SELECT AVG(percentage) AS avgScore FROM results WHERE student_id = ?', [studentId]);
    const recentAttempts = await all(
      'SELECT r.id, s.name AS subject, r.score, r.total, r.percentage, r.grade, r.time_used, r.created_at FROM results r JOIN subjects s ON s.id = r.subject_id WHERE r.student_id = ? ORDER BY r.created_at DESC LIMIT 5',
      [studentId]
    );

    res.json({
      welcome: `Welcome back, ${req.user.name}`,
      availableExams: totalSubjects.count,
      completedExams: totalCompleted.count,
      averageScore: Number((average.avgScore || 0).toFixed(1)),
      recentAttempts,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getStudentDashboard,
};
