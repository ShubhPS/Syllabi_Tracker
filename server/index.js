
import dotenv from 'dotenv';
dotenv.config({ path: './server/.env' });
import express from 'express';
import cors from 'cors';
import { GoogleGenAI } from '@google/genai';
import admin from 'firebase-admin';
import { readFileSync } from 'fs';

// Load Firebase service account from JSON file
let serviceAccount;
try {
  serviceAccount = JSON.parse(readFileSync('../syllabus-ai-4d341-firebase-adminsdk-fbsvc-e21a21a5f5.json', 'utf8'));
} catch (error) {
  console.warn('Firebase service account file not found, Firebase features will be disabled');
}

// Initialize Firebase Admin if service account is available
let db = null;
if (serviceAccount) { // Enable Firebase if service account is available
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    db = admin.firestore();
    console.log('Firebase Admin initialized successfully');
  } catch (error) {
    console.warn('Firebase Admin initialization failed:', error.message);
  }
} else {
  console.log('Firebase Admin disabled - running without database features');
}


const PORT = process.env.PORT || 5179;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const app = express();
app.use(cors());
app.use(express.json({ limit: '25mb' }));

// Secure Gemini proxy endpoint
app.post('/api/generate', async (req, res) => {
  try {
    if (!GEMINI_API_KEY) return res.status(500).json({ error: 'Server GEMINI_API_KEY not set' });
    const { mimeType, base64, prompt: clientPrompt, userId } = req.body || {};
    if (!mimeType || !base64) return res.status(400).json({ error: 'mimeType and base64 required' });
    if (!userId) return res.status(400).json({ error: 'userId is required' });

    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
    const filePart = { inlineData: { mimeType, data: base64 } };
    const prompt = clientPrompt || 'Generate roadmap JSON strictly following the schema and rules.';
    const resp = await ai.models.generateContent({ model: 'gemini-2.5-pro', contents: [{ text: prompt }, filePart], config: { responseMimeType: 'application/json', temperature: 0.2 } });
    const text = (resp.text || '').trim();
    const roadmapData = JSON.parse(text);

    // Save the generated roadmap to Firestore (if available)
    let roadmapId = null;
    if (db) {
      try {
        const roadmapRef = await db.collection('users').doc(userId).collection('courses').add(roadmapData);
        roadmapId = roadmapRef.id;
      } catch (dbError) {
        console.warn('Failed to save to Firestore:', dbError.message);
      }
    }

    res.json({ text, roadmapId });
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

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT} (hasKey=${Boolean(GEMINI_API_KEY)})`));


