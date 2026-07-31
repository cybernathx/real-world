const { db } = require('../db/database');

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    try {
      const info = db.prepare(sql).run(params);
      resolve({ lastID: info.lastInsertRowid, changes: info.changes });
    } catch (err) {
      reject(err);
    }
  });
}

function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    try {
      const row = db.prepare(sql).get(params);
      resolve(row);
    } catch (err) {
      reject(err);
    }
  });
}

function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    try {
      const rows = db.prepare(sql).all(params);
      resolve(rows);
    } catch (err) {
      reject(err);
    }
  });
}

module.exports = {
  run,
  get,
  all
};
