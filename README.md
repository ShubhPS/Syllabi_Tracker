# Syllabus to Roadmap Generator (Pure JS)

## Run

1. Backend
   - Create `server/.env`:
     - `PORT=5179`
     - `GEMINI_API_KEY=YOUR_KEY`
   - Start everything: `npm start`
   - Health check: http://localhost:5179/api/health

2. Frontend
   - Opens at http://localhost:5173
   - `index.html` points to backend via `window.API_BASE`.

## Project Layout
- `app.jsx` — frontend UI (React via CDN + Babel)
- `services/geminiService.mjs` — calls backend `/api/generate`
- `server/` — Express + SQLite + Gemini proxy
- `index.html` — app shell and config

## Notes
- Do not put API keys in the frontend.
- Keep `server/.env` out of version control.


