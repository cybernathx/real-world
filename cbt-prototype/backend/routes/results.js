const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { getResultsByStudent, submitResult } = require('../controllers/resultController');

router.use(verifyToken);
router.get('/student/:studentId', getResultsByStudent);
router.post('/', submitResult);

module.exports = router;
