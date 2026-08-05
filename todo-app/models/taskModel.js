const dbModule = require('../database');

function getDb() {
  return dbModule.getDb();
}

function getAllTasks() {
  return new Promise((resolve, reject) => {
    const sql = `SELECT id, title, completed, priority, created_at FROM tasks ORDER BY completed ASC, created_at DESC`;
    getDb().all(sql, [], (err, rows) => {
      if (err) {
        return reject(err);
      }
      const tasks = rows.map((row) => ({
        id: row.id,
        title: row.title,
        completed: Boolean(row.completed),
        priority: row.priority || 'Medium',
        created_at: row.created_at
      }));
      resolve(tasks);
    });
  });
}

function createTask(title, priority = 'Medium') {
  return new Promise((resolve, reject) => {
    const sql = `INSERT INTO tasks (title, completed, priority) VALUES (?, 0, ?)`;
    getDb().run(sql, [title, priority], function (err) {
      if (err) {
        return reject(err);
      }
      resolve(this.lastID);
    });
  });
}

function markTaskComplete(id) {
  return new Promise((resolve, reject) => {
    const sql = `UPDATE tasks SET completed = 1 WHERE id = ?`;
    getDb().run(sql, [id], function (err) {
      if (err) {
        return reject(err);
      }
      resolve(this.changes);
    });
  });
}

function deleteTask(id) {
  return new Promise((resolve, reject) => {
    const sql = `DELETE FROM tasks WHERE id = ?`;
    getDb().run(sql, [id], function (err) {
      if (err) {
        return reject(err);
      }
      resolve(this.changes);
    });
  });
}

module.exports = {
  getAllTasks,
  createTask,
  markTaskComplete,
  deleteTask
};
