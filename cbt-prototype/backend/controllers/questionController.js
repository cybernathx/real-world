const { all, get } = require('../models/dbHelper');

function buildFilters(query) {
  const filters = [];
  const params = [];

  if (query.subjectId) {
    filters.push('subject_id = ?');
    params.push(Number(query.subjectId));
  }

  if (query.difficulty) {
    filters.push('difficulty = ?');
    params.push(query.difficulty);
  }

  if (query.q) {
    filters.push('text LIKE ?');
    params.push(`%${query.q}%`);
  }

  return { filters, params };
}

async function getQuestions(req, res, next) {
  try {
    const { subjectId, difficulty, random, limit, includeAnswer } = req.query;
    const { filters, params } = buildFilters({ subjectId, difficulty });
    let sql = 'SELECT id, subject_id, text, option_a, option_b, option_c, option_d, difficulty';
    if (includeAnswer === 'true') sql += ', correct_answer, explanation';
    sql += ' FROM questions';
    if (filters.length) sql += ' WHERE ' + filters.join(' AND ');
    if (random === 'true') sql += ' ORDER BY RANDOM()';
    else sql += ' ORDER BY id';
    if (limit) sql += ' LIMIT ' + Number(limit);

    const questions = await all(sql, params);
    res.json({ questions });
  } catch (err) {
    next(err);
  }
}

async function getQuestionById(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'Invalid question id' });
    }
    const question = await get(
      'SELECT id, subject_id, text, option_a, option_b, option_c, option_d, difficulty, correct_answer, explanation FROM questions WHERE id = ?',
      [id]
    );
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }
    res.json({ question });
  } catch (err) {
    next(err);
  }
}

async function searchQuestions(req, res, next) {
  try {
    const { q, subjectId, difficulty } = req.query;
    if (!q) {
      return res.status(400).json({ error: 'Query text is required' });
    }
    const { filters, params } = buildFilters({ subjectId, difficulty });
    filters.push('(text LIKE ? OR option_a LIKE ? OR option_b LIKE ? OR option_c LIKE ? OR option_d LIKE ?)');
    params.push(`%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`);
    const questions = await all(
      'SELECT id, subject_id, text, option_a, option_b, option_c, option_d, difficulty FROM questions WHERE ' + filters.join(' AND '),
      params
    );
    res.json({ questions });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getQuestions,
  getQuestionById,
  searchQuestions
};
