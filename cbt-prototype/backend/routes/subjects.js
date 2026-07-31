const express = require('express');
const router = express.Router();
const { listSubjects, getSubjectById } = require('../controllers/subjectController');

router.get('/', listSubjects);
router.get('/:id', getSubjectById);

module.exports = router;
