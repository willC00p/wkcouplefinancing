const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'finance.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Connected to SQLite database');
  }
});

// Initialize database schema
const initializeDatabase = () => {
  db.serialize(() => {
    // Expenses table
    db.run(`
      CREATE TABLE IF NOT EXISTS expenses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL,
        particulars TEXT NOT NULL,
        deadline TEXT NOT NULL,
        pay_to TEXT NOT NULL,
        total_amount REAL NOT NULL,
        status TEXT NOT NULL DEFAULT 'unpaid',
        partial_amount_paid REAL DEFAULT 0,
        custom_payer TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Contributions table
    db.run(`
      CREATE TABLE IF NOT EXISTS contributions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        payer TEXT NOT NULL,
        total_amount REAL NOT NULL,
        number_of_people INTEGER NOT NULL,
        split_amount REAL NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Contribution participants table
    db.run(`
      CREATE TABLE IF NOT EXISTS contribution_participants (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        contribution_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        amount_due REAL NOT NULL,
        amount_paid REAL DEFAULT 0,
        status TEXT DEFAULT 'unpaid',
        FOREIGN KEY (contribution_id) REFERENCES contributions(id) ON DELETE CASCADE
      )
    `);

    console.log('Database schema initialized');
  });
};

// Helper function to run queries with promise support
const dbRun = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
};

// Helper function to get single row
const dbGet = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

// Helper function to get all rows
const dbAll = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

module.exports = {
  db,
  initializeDatabase,
  dbRun,
  dbGet,
  dbAll
};
