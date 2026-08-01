const express = require('express');
const router = express.Router();
const { verifyToken, requireAdmin } = require('../middleware/auth');
const { getAdminStats, manageQuestions, manageSubjects, viewStudents } = require('../controllers/adminController');
const { getCandidateRecords, getStudentHistory } = require('../controllers/adminController');
const { createQuestion, updateQuestion } = require('../controllers/questionController');

router.use(verifyToken);
router.use(requireAdmin);

router.get('/stats', getAdminStats);
router.get('/candidates', getCandidateRecords);
router.get('/candidates/:studentId/history', getStudentHistory);
router.get('/students', viewStudents);
router.get('/questions', manageQuestions);
router.post('/questions', createQuestion);
router.put('/questions/:id', updateQuestion);
router.get('/subjects', manageSubjects);

module.exports = router;
