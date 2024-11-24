import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import db from './db.js';

const app = express();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

app.use(cors());
app.use(express.json());

// Auth routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    // Check if user already exists
    const existingUser = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const id = randomUUID();
    
    db.prepare('INSERT INTO users (id, email, password, name) VALUES (?, ?, ?, ?)')
      .run(id, email, hashedPassword, name);

    const token = jwt.sign(
      { id, email, name, role: 'user' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ token });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(400).json({ error: 'Registration failed' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Invalid password' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(400).json({ error: 'Login failed' });
  }
});

// Protected routes middleware
const auth = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      throw new Error('No token provided');
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Please authenticate' });
  }
};

// Admin middleware
const adminAuth = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// Poll routes
app.post('/api/polls', auth, adminAuth, (req, res) => {
  try {
    const { title, description, startDate, endDate, options } = req.body;
    const pollId = randomUUID();

    db.prepare(
      'INSERT INTO polls (id, title, description, startDate, endDate) VALUES (?, ?, ?, ?, ?)'
    ).run(pollId, title, description, startDate, endDate);

    for (const optionText of options) {
      db.prepare(
        'INSERT INTO options (id, pollId, text) VALUES (?, ?, ?)'
      ).run(randomUUID(), pollId, optionText);
    }

    const poll = db.prepare('SELECT * FROM polls WHERE id = ?').get(pollId);
    const pollOptions = db.prepare('SELECT * FROM options WHERE pollId = ?').all(pollId);

    res.json({ ...poll, options: pollOptions });
  } catch (error) {
    console.error('Create poll error:', error);
    res.status(400).json({ error: 'Failed to create poll' });
  }
});

app.get('/api/polls', auth, (req, res) => {
  try {
    const polls = db.prepare(`
      SELECT 
        p.*,
        json_group_array(
          json_object(
            'id', o.id,
            'text', o.text,
            'votes', (
              SELECT COUNT(*) 
              FROM votes v 
              WHERE v.optionId = o.id
            )
          )
        ) as options
      FROM polls p
      LEFT JOIN options o ON p.id = o.pollId
      GROUP BY p.id
    `).all();

    res.json(polls.map(poll => ({
      ...poll,
      options: JSON.parse(poll.options)
    })));
  } catch (error) {
    console.error('Get polls error:', error);
    res.status(400).json({ error: 'Failed to fetch polls' });
  }
});

app.post('/api/votes', auth, (req, res) => {
  try {
    const { pollId, optionId } = req.body;
    const userId = req.user.id;

    db.prepare(
      'INSERT INTO votes (id, userId, pollId, optionId) VALUES (?, ?, ?, ?)'
    ).run(randomUUID(), userId, pollId, optionId);

    res.json({ success: true });
  } catch (error) {
    console.error('Vote error:', error);
    res.status(400).json({ error: 'Failed to cast vote' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});