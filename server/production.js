import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import { GoogleGenAI } from '@google/genai';
import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load Firebase service account from environment or JSON file
let serviceAccount;
try {
  // First try to load from environment variable (for production)
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    console.log('Firebase service account loaded from environment variable');
  } else {
    // Fallback to JSON file (for local development)
    try {
      serviceAccount = JSON.parse(readFileSync(path.join(__dirname, '..', 'syllabus-ai-4d341-firebase-adminsdk-fbsvc-e21a21a5f5.json'), 'utf8'));
      console.log('Firebase service account loaded from JSON file');
    } catch (error) {
      console.warn('Firebase service account file not found:', error.message);
    }
  }
} catch (error) {
  console.warn('Firebase service account not found, Firebase features will be disabled');
}

// Initialize Firebase Admin if service account is available
let db = null;
if (serviceAccount) {
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
const ENVIRONMENT = process.env.ENVIRONMENT || 'development';

const app = express();

// Configure CORS
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return callback(null, true);
    }
    if (origin.includes('vercel.app') || origin.includes('netlify.app') || origin.includes('railway.app') || origin.includes('render.com')) {
      return callback(null, true);
    }
    callback(null, true);
  },
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '25mb' }));

// Handle preflight requests for all routes
app.options('*', cors(corsOptions));

// Serve static files in production
if (ENVIRONMENT === 'production') {
  const staticPath = path.join(__dirname, '..');
  app.use(express.static(staticPath));
  console.log(`Serving static files from: ${staticPath}`);
}

// API Routes
app.post('/api/generate', async (req, res) => {
  try {
    if (!GEMINI_API_KEY) return res.status(500).json({ error: 'Server GEMINI_API_KEY not set' });
    const { mimeType, base64, prompt: clientPrompt, userId } = req.body || {};
    if (!mimeType || !base64) return res.status(400).json({ error: 'mimeType and base64 required' });
    if (!userId) return res.status(400).json({ error: 'userId is required' });

    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
    const filePart = { inlineData: { mimeType, data: base64 } };
    const prompt = clientPrompt || 'Generate roadmap JSON strictly following the schema and rules.';
    const resp = await ai.models.generateContent({ 
      model: 'gemini-2.5-pro', 
      contents: [{ text: prompt }, filePart], 
      config: { responseMimeType: 'application/json', temperature: 0.2 } 
    });
    const text = (resp.text || '').trim();
    const roadmapData = JSON.parse(text);

    // Save the generated roadmap to Firestore (if available)
    let roadmapId = null;
    if (db) {
      try {
        const roadmapRef = await db.collection('users').doc(userId).collection('courses').add(roadmapData);
        roadmapId = roadmapRef.id;
        console.log('Roadmap saved to Firestore with ID:', roadmapId);
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

// Health endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    ok: true, 
    hasKey: Boolean(GEMINI_API_KEY),
    environment: ENVIRONMENT,
    port: PORT,
    firebaseEnabled: Boolean(db)
  });
});

// Test endpoint
app.get('/api/generate/test', async (req, res) => {
  try {
    if (!GEMINI_API_KEY) return res.status(500).json({ error: 'Server GEMINI_API_KEY not set' });
    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
    const r = await ai.models.generateContent({ 
      model: 'gemini-2.5-pro', 
      contents: [{ text: 'Return {"ok":true} as JSON only' }], 
      config: { responseMimeType: 'application/json' } 
    });
    res.json({ text: r.text });
  } catch (e) {
    console.error('Gemini test failed:', e?.message || e);
    res.status(500).json({ error: e?.message || 'Test failed' });
  }
});

// Catch-all handler: send back index.html for SPA routes in production
if (ENVIRONMENT === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📱 Environment: ${ENVIRONMENT}`);
  console.log(`🔑 Gemini API Key: ${Boolean(GEMINI_API_KEY) ? 'Loaded' : 'Missing'}`);
  console.log(`🔥 Firebase: ${Boolean(db) ? 'Connected' : 'Disabled'}`);
});
