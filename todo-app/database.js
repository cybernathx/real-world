const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'todo.db');
let db;

function initialize() {
  db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('Failed to connect to SQLite database:', err.message);
      return;
    }
    console.log('Connected to SQLite database.');
  });

  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      completed INTEGER NOT NULL DEFAULT 0,
      priority TEXT NOT NULL DEFAULT 'Medium',
      created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
    )
  `;

  db.run(createTableQuery, (err) => {
    if (err) {
      console.error('Failed to create tasks table:', err.message);
    }
  });
  // Ensure priority column exists for older databases
  db.all("PRAGMA table_info(tasks)", [], (err, rows) => {
    if (err) {
      console.error('Failed to read table info for tasks:', err.message);
      return;
    }
    const hasPriority = rows && rows.some((r) => r.name === 'priority');
    if (!hasPriority) {
      db.run("ALTER TABLE tasks ADD COLUMN priority TEXT NOT NULL DEFAULT 'Medium'", (addErr) => {
        if (addErr) {
          console.error('Failed to add priority column to tasks table:', addErr.message);
        } else {
          console.log("Added 'priority' column to tasks table with default 'Medium'.");
        }
      });
    }
  });
}

function getDb() {
  if (!db) {
    throw new Error('Database connection is not initialized.');
  }
  return db;
}

module.exports = { initialize, getDb };
