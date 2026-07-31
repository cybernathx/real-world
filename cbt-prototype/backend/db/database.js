const Database = require('better-sqlite3');
const fs = require('fs').promises;
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, 'cbt.db');
const schemaPath = path.join(__dirname, 'schema.sql');
const seedPath = path.join(__dirname, 'seed.sql');

const db = new Database(dbPath);

async function runSqlFile(filePath) {
  const sql = await fs.readFile(filePath, 'utf8');
  db.exec(sql);
}

function runStatement(sql, params = []) {
  const statement = db.prepare(sql);
  return statement.run(params);
}

function getStatement(sql, params = []) {
  const statement = db.prepare(sql);
  return statement.get(params);
}

async function seedAdminUser() {
  const email = process.env.ADMIN_EMAIL || 'admin@cbt.app';
  const password = process.env.ADMIN_PASSWORD || 'admin123';
  
  // Check if admin already exists to avoid unnecessary hashing
  const existing = getStatement('SELECT id FROM students WHERE email = ? AND role = ? LIMIT 1', [email.toLowerCase(), 'admin']);
  
  if (!existing) {
    const hashedPassword = await bcrypt.hash(password, 10);
    // Use INSERT OR IGNORE to handle race conditions where another process might insert simultaneously
    try {
      runStatement(
        'INSERT OR IGNORE INTO students (name, email, password, role) VALUES (?, ?, ?, ?)',
        ['Admin User', email.toLowerCase(), hashedPassword, 'admin']
      );
      console.log('Default admin user created:', email);
    } catch (error) {
      // If INSERT OR IGNORE silently fails, verify the user exists
      const verifyAdmin = getStatement('SELECT id FROM students WHERE email = ? AND role = ? LIMIT 1', [email.toLowerCase(), 'admin']);
      if (verifyAdmin) {
        console.log('Admin user already exists:', email);
      } else {
        throw error;
      }
    }
  }
}

async function initializeDatabase() {
  try {
    await runSqlFile(schemaPath);
    await runSqlFile(seedPath);
    await seedAdminUser();
    console.log('SQLite database initialized.');
  } catch (error) {
    console.error('Database initialization failed:', error.message);
    process.exit(1);
  }
}

module.exports = {
  db,
  initializeDatabase
};
