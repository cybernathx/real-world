const dbModule = require('../database');

function getDb() {
  return dbModule.getDb();
}

function getAllTasks() {
  return new Promise((resolve, reject) => {
    const sql = ` SELECT id, title, completed, priority, due_date, created_at FROM tasks `;
    getDb().all(sql, [], (err, rows) => {
      if (err) {
        return reject(err);
      }
      const tasks = rows.map((row) => {
        const dueDateRaw = row.due_date || null;
        // compute isOverdue: not completed, has due date, due_date < today
        let isOverdue = false;
        if (dueDateRaw && !row.completed) {
          try {
            const due = new Date(dueDateRaw);
            const today = new Date();
            // normalize to local date start (00:00:00)
            today.setHours(0, 0, 0, 0);
            if (due < today) {
              isOverdue = true;
            }
          } catch (e) {
            isOverdue = false;
          }
        }
        return {
          id: row.id,
          title: row.title,
          completed: Boolean(row.completed),
          priority: row.priority || 'Medium',
          due_date: dueDateRaw,
          isOverdue,
          created_at: row.created_at
        };
      });
      resolve(tasks);
    });
  });
}

function createTask(title, priority = 'Medium', dueDate = null) {
  return new Promise((resolve, reject) => {
    const sql = `INSERT INTO tasks (title, completed, priority, due_date) VALUES (?, 0, ?, ?)`;
    // pass null for due_date when not provided
    
    getDb().run(sql, [title, priority, dueDate], function (err) {
      if (err) {
        return reject(err);
      }

      getDb().get(
        'SELECT * FROM tasks WHERE id = ?',
        [this.lastID],
        (selectErr, row) => {
          if (selectErr) {
            console.error(selectErr);
          } else {
          }
        }
      );

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
