const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Use persistent storage path on Render, or local during development
const dbDir = process.env.DB_PATH || path.join(__dirname, 'data');
const dbPath = path.join(dbDir, 'finance.db');

// Ensure db directory exists
const fs = require('fs');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
  console.log(`Created database directory: ${dbDir}`);
}

// Check file permissions and disk space
try {
  const stats = fs.statSync(dbDir);
  console.log(`Database directory permissions: ${stats.mode.toString(8)}`);
} catch (err) {
  console.warn(`Warning: Could not get directory stats: ${err.message}`);
}

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log(`✓ Connected to SQLite database at ${dbPath}`);
  }
});

// Enable persistent connection
db.configure('busyTimeout', 5000);
db.run('PRAGMA journal_mode = WAL;', (err) => {
  if (err) console.warn('Warning: Could not set WAL mode:', err);
  else console.log('✓ Database WAL mode enabled for durability');
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

    // Trips table
    db.run(`
      CREATE TABLE IF NOT EXISTS trips (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        trip_name TEXT NOT NULL,
        start_date TEXT,
        end_date TEXT,
        destination TEXT,
        budget REAL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Trip Expenses table
    db.run(`
      CREATE TABLE IF NOT EXISTS trip_expenses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        trip_id INTEGER NOT NULL,
        particulars TEXT NOT NULL,
        amount REAL NOT NULL,
        classification TEXT NOT NULL,
        mode_of_payment TEXT NOT NULL,
        bank_name TEXT,
        e_wallet_name TEXT,
        payer TEXT NOT NULL,
        receipt_url TEXT,
        reference_number TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE
      )
    `);

    // Log success after a small delay to ensure tables are created
    setTimeout(() => {
      db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
        if (err) {
          console.error('Error retrieving tables:', err);
        } else {
          console.log(`✓ Database schema initialized with ${tables.length} tables: ${tables.map(t => t.name).join(', ')}`);
        }
      });
    }, 100);
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
