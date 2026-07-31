const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { getStudentDashboard } = require('../controllers/dashboardController');

router.get('/me', verifyToken, getStudentDashboard);

module.exports = router;
