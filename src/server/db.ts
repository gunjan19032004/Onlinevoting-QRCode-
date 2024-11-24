import Database from 'better-sqlite3';
import { join } from 'path';

const db = new Database(join(process.cwd(), 'database.sqlite'));

// Initialize database tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE,
    password TEXT,
    name TEXT,
    role TEXT DEFAULT 'user'
  );

  CREATE TABLE IF NOT EXISTS polls (
    id TEXT PRIMARY KEY,
    title TEXT,
    description TEXT,
    startDate TEXT,
    endDate TEXT,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS options (
    id TEXT PRIMARY KEY,
    pollId TEXT,
    text TEXT,
    FOREIGN KEY (pollId) REFERENCES polls (id)
  );

  CREATE TABLE IF NOT EXISTS votes (
    id TEXT PRIMARY KEY,
    userId TEXT,
    pollId TEXT,
    optionId TEXT,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users (id),
    FOREIGN KEY (pollId) REFERENCES polls (id),
    FOREIGN KEY (optionId) REFERENCES options (id),
    UNIQUE(userId, pollId)
  );
`);

export default db;