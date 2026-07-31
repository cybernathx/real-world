const express = require('express');
const router = express.Router();
const { verifyToken, requireAdmin } = require('../middleware/auth');
const { getAdminStats, manageQuestions, manageSubjects, viewStudents } = require('../controllers/adminController');

router.use(verifyToken);
router.use(requireAdmin);

router.get('/stats', getAdminStats);
router.get('/students', viewStudents);
router.get('/questions', manageQuestions);
router.get('/subjects', manageSubjects);

module.exports = router;
