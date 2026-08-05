const { getTaskStatistics } = require('../utils/taskHelpers');
const taskModel = require('../models/taskModel');

async function showTasks(req, res, next) {
  try {
    const tasks = await taskModel.getAllTasks();
    const stats = getTaskStatistics(tasks);

    res.render('index', {
      tasks,
      ...stats,
      error: null,
      titleValue: '',
      priorityValue: 'Medium',
      dueDateValue: ''
    });
  } catch (error) {
    next(error);
  }
}

async function createTask(req, res, next) {
  try {
    const title = (req.body.title || '').trim();
    const rawPriority = (req.body.priority || 'Medium').trim();
    const allowed = ['Low', 'Medium', 'High'];
    const priority = allowed.includes(rawPriority) ? rawPriority : 'Medium';
    // due date is optional; empty string -> null in DB
    const rawDueDate = (req.body.dueDate || '').trim();
    const dueDate = rawDueDate === '' ? null : rawDueDate;

    if (!title) {
      const tasks = await taskModel.getAllTasks();
      return res.status(400).render('index', {
        tasks,
        ...getTaskStatistics(tasks),
        error: 'Task title cannot be empty. Please enter a valid title.',
        titleValue: '',
        priorityValue: priority,
        dueDateValue: rawDueDate
      });
    }

    if (title.length > 255) {
      const tasks = await taskModel.getAllTasks();
      return res.status(400).render('index', {
        tasks,
        ...getTaskStatistics(tasks),
        error: 'Task title must be 255 characters or fewer.',
        titleValue: title,
        priorityValue: priority,
        dueDateValue: rawDueDate
      });
    }
    
    await taskModel.createTask(title, priority, dueDate);
    res.redirect('/');
  } catch (error) {
    next(error);
  }
}

async function markTaskComplete(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      throw new Error('Invalid task ID.');
    }

    await taskModel.markTaskComplete(id);
    res.redirect('/');
  } catch (error) {
    next(error);
  }
}

async function deleteTask(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      throw new Error('Invalid task ID.');
    }

    await taskModel.deleteTask(id);
    res.redirect('/');
  } catch (error) {
    next(error);
  }
}

module.exports = {
  showTasks,
  createTask,
  markTaskComplete,
  deleteTask
};
