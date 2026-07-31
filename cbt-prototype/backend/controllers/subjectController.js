const { all, get } = require('../models/dbHelper');

async function listSubjects(req, res, next) {
  try {
    const subjects = await all('SELECT id, name, description, difficulty FROM subjects ORDER BY name');
    res.json({ subjects });
  } catch (err) {
    next(err);
  }
}

async function getSubjectById(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'Invalid subject id' });
    }
    const subject = await get('SELECT id, name, description, difficulty FROM subjects WHERE id = ?', [id]);
    if (!subject) {
      return res.status(404).json({ error: 'Subject not found' });
    }
    const questionCount = await get('SELECT COUNT(*) AS count FROM questions WHERE subject_id = ?', [id]);
    res.json({ subject: { ...subject, questionCount: questionCount.count } });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listSubjects,
  getSubjectById
};
