const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { get, run } = require('../models/dbHelper');
const secret = process.env.JWT_SECRET || 'change_this_secret';

function validateEmail(email) {
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
}

async function registerUser(req, res, next) {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }
    if (!validateEmail(email)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }
    const existing = await get('SELECT id FROM students WHERE email = ?', [email.toLowerCase()]);
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' });
    }
    const hashed = await bcrypt.hash(password, 10);
    const result = await run(
      'INSERT INTO students (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name.trim(), email.toLowerCase(), hashed, 'student']
    );
    const user = { id: result.lastID, name: name.trim(), email: email.toLowerCase(), role: 'student' };
    const token = jwt.sign(user, secret, { expiresIn: '8h' });
    res.status(201).json({ user, token });
  } catch (err) {
    next(err);
  }
}

async function loginUser(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    const user = await get('SELECT id, name, email, password, role FROM students WHERE email = ?', [email.toLowerCase()]);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const payload = { id: user.id, name: user.name, email: user.email, role: user.role };
    const token = jwt.sign(payload, secret, { expiresIn: '8h' });
    res.json({ user: payload, token });
  } catch (err) {
    next(err);
  }
}

function getCurrentUser(req, res) {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  res.json({ user: req.user });
}

function logoutUser(req, res) {
  res.json({ message: 'Logout successful' });
}

module.exports = {
  registerUser,
  loginUser,
  getCurrentUser,
  logoutUser
};
