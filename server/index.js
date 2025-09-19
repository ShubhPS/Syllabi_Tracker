import dotenv from 'dotenv';
dotenv.config({ path: './server/.env' });
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { GoogleGenAI } from '@google/genai';

const PORT = process.env.PORT || 5179;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const app = express();
app.use(cors());
app.use(express.json({ limit: '25mb' }));

let db;
async function initDb() {
  db = await open({ filename: './server/data.db', driver: sqlite3.Database });
  await db.exec(`
    PRAGMA journal_mode=WAL;
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS roadmaps (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      data_json TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id)
    );
  `);
}

// Note: Authentication removed as requested. Endpoints are open.

app.post('/api/auth/register', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  const password_hash = await bcrypt.hash(password, 10);
  try {
    const result = await db.run('INSERT INTO users (email, password_hash) VALUES (?, ?)', email, password_hash);
    res.json({ ok: true, userId: result.lastID });
  } catch (e) {
    if (String(e).includes('UNIQUE')) return res.status(409).json({ error: 'Email already registered' });
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body || {};
  const user = await db.get('SELECT * FROM users WHERE email = ?', email);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
  res.json({ ok: true, userId: user.id });
});

app.get('/api/roadmaps/:userId', async (req, res) => {
  const rows = await db.all('SELECT id, title, created_at, updated_at FROM roadmaps WHERE user_id = ? ORDER BY updated_at DESC', req.params.userId);
  res.json(rows);
});

app.post('/api/roadmaps/:userId', async (req, res) => {
  const { title, data } = req.body || {};
  if (!title || !data) return res.status(400).json({ error: 'title and data required' });
  const result = await db.run('INSERT INTO roadmaps (user_id, title, data_json) VALUES (?, ?, ?)', req.params.userId, title, JSON.stringify(data));
  res.json({ id: result.lastID });
});

app.get('/api/roadmaps/:userId/:id', async (req, res) => {
  const row = await db.get('SELECT * FROM roadmaps WHERE id = ? AND user_id = ?', req.params.id, req.params.userId);
  if (!row) return res.status(404).json({ error: 'Not found' });
  res.json({ id: row.id, title: row.title, data: JSON.parse(row.data_json), created_at: row.created_at, updated_at: row.updated_at });
});

app.put('/api/roadmaps/:userId/:id', async (req, res) => {
  const { title, data } = req.body || {};
  const result = await db.run('UPDATE roadmaps SET title = COALESCE(?, title), data_json = COALESCE(?, data_json), updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?', title || null, data ? JSON.stringify(data) : null, req.params.id, req.params.userId);
  if (result.changes === 0) return res.status(404).json({ error: 'Not found' });
  res.json({ ok: true });
});

app.delete('/api/roadmaps/:userId/:id', async (req, res) => {
  const result = await db.run('DELETE FROM roadmaps WHERE id = ? AND user_id = ?', req.params.id, req.params.userId);
  if (result.changes === 0) return res.status(404).json({ error: 'Not found' });
  res.json({ ok: true });
});

// Secure Gemini proxy endpoint
app.post('/api/generate', async (req, res) => {
  try {
    if (!GEMINI_API_KEY) return res.status(500).json({ error: 'Server GEMINI_API_KEY not set' });
    const { mimeType, base64, prompt: clientPrompt } = req.body || {};
    if (!mimeType || !base64) return res.status(400).json({ error: 'mimeType and base64 required' });
    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
    const filePart = { inlineData: { mimeType, data: base64 } };
    const prompt = clientPrompt || 'Generate roadmap JSON strictly following the schema and rules.';
    const resp = await ai.models.generateContent({ model: 'gemini-2.5-pro', contents: [{ text: prompt }, filePart], config: { responseMimeType: 'application/json', temperature: 0.2 } });
    const text = (resp.text || '').trim();
    res.json({ text });
  } catch (e) {
    console.error('Gemini generation failed:', e?.message || e, e?.stack || '');
    const message = e?.message || 'Generation failed';
    res.status(500).json({ error: message });
  }
});

// Health endpoint to verify server is reachable and key loaded
app.get('/api/health', (req, res) => {
  res.json({ ok: true, hasKey: Boolean(GEMINI_API_KEY) });
});

// Simple key test endpoint (no PDF) to isolate key/network issues
app.get('/api/generate/test', async (req, res) => {
  try {
    if (!GEMINI_API_KEY) return res.status(500).json({ error: 'Server GEMINI_API_KEY not set' });
    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
    const r = await ai.models.generateContent({ model: 'gemini-2.5-pro', contents: [{ text: 'Return {"ok":true} as JSON only' }], config: { responseMimeType: 'application/json' } });
    res.json({ text: r.text });
  } catch (e) {
    console.error('Gemini test failed:', e?.message || e);
    res.status(500).json({ error: e?.message || 'Test failed' });
  }
});

initDb().then(() => {
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT} (hasKey=${Boolean(GEMINI_API_KEY)})`));
});


