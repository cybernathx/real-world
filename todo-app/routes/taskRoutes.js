const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');

router.get('/', taskController.showTasks);
router.post('/tasks', taskController.createTask);
router.post('/tasks/:id/complete', taskController.markTaskComplete);
router.post('/tasks/:id/delete', taskController.deleteTask);

module.exports = router;
