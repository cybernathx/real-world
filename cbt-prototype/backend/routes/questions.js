const express = require('express');
const router = express.Router();
const { getQuestions, getQuestionById, searchQuestions } = require('../controllers/questionController');

router.get('/', getQuestions);
router.get('/search', searchQuestions);
router.get('/:id', getQuestionById);

module.exports = router;
