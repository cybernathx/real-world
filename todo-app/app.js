const express = require('express');
const path = require('path');
const taskRoutes = require('./routes/taskRoutes');
const db = require('./database');
const taskModel = require('./models/taskModel');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse HTML form data
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Set public assets and view engine
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Ensure database is initialized before routes use it
db.initialize();

// Use task routes for the root path
app.use('/', taskRoutes);

// 404 handler - render error page with safe counts for header partial
app.use(async (req, res, next) => {
  try {
    const tasks = await taskModel.getAllTasks();
    const completedCount = tasks.filter((t) => t.completed).length;
    const pendingCount = tasks.length - completedCount;
    res.status(404).render('error', {
      message: 'Page not found. Please check the URL and try again.',
      pendingCount,
      completedCount,
    });
  } catch (err) {
    // If database is unavailable, render error with defaults
    res.status(404).render('error', {
      message: 'Page not found. Please check the URL and try again.',
      pendingCount: 0,
      completedCount: 0,
    });
  }
});

// Global error handler - include counts for header partial when rendering error page
app.use(async (err, req, res, next) => {
  console.error(err);
  try {
    const tasks = await taskModel.getAllTasks();
    const completedCount = tasks.filter((t) => t.completed).length;
    const pendingCount = tasks.length - completedCount;
    res.status(500).render('error', {
      message: 'An unexpected error occurred. Please try again later.',
      pendingCount,
      completedCount,
    });
  } catch (dbErr) {
    console.error('Error fetching task counts for error page:', dbErr);
    res.status(500).render('error', {
      message: 'An unexpected error occurred. Please try again later.',
      pendingCount: 0,
      completedCount: 0,
    });
  }
});

app.listen(PORT, () => {
  console.log(`To-Do app is running at http://localhost:${PORT}`);
});
