# 🗺️ Syllabi_Tracker

Convert any PDF syllabus into an interactive, AI-generated learning roadmap with curated resources like links and YouTube videos — customized for your course and study style.

---

## 🚀 Overview

**Syllabi_Tracker** helps learners by analyzing uploaded syllabus PDFs to automatically generate:
- 🧱 A structured roadmap with modules and topics  
- 🎯 Personalized curated resources (articles, videos, docs) per topic  
- 📊 Progress tracking to monitor what's completed  

Built using the powerful Gemini API, the app delivers precise, context-aware guidance for efficient learning plans.

---

## ✨ Features

- **Auto‑generate Learning Roadmap** from syllabus PDF  
- **Curated Resource Cards**: URLs, videos, and reading suggestions from Indian YouTube educators
- **Compact UI** with module expansion, progress bars, and checklist states  
- **Error handling** and user feedback for smoother experience  
- **Responsive Design** optimized for desktop and mobile devices
- **Progress Persistence** to save your learning journey
- **Firebase Authentication** for user accounts
- **Real-time Database** storage with Firestore

---

## 🛠️ Technologies

- **Frontend**: React with CDN + Babel
- **Backend**: Node.js + Express + Gemini API integration
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **PDF Processing**: Gemini's native PDF parsing
- **Styling**: Tailwind CSS
- **Deployment**: Vercel

---

## 🧪 Installation & Local Setup

### 1. Clone the Repository
```bash
git clone https://github.com/ShubhPS/Syllabi_Tracker.git
cd Syllabi_Tracker
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
Create a `server/.env` file:
```bash
GEMINI_API_KEY=your_gemini_api_key_here
```

### 4. Firebase Setup
1. Create a Firebase project at https://console.firebase.google.com
2. Download the service account JSON file
3. Place it in root directory (it's gitignored for security)
4. Update the Firebase config in `services/firebase.js`

### 5. Start Development Server
```bash
npm start
```

Open [http://localhost:5173](http://localhost:5173) to view the application.

---

## 🚀 Deployment on Vercel

### Security Setup ⚠️
**Critical:** Sensitive files are automatically excluded via `.gitignore`:
- Firebase service account JSON files (`*-firebase-adminsdk-*.json`)
- Environment variables (`.env*` files)
- Node modules and build artifacts

### Deployment Steps
1. **Push to GitHub** (sensitive files will be ignored)
2. **Connect to Vercel** and import your repository
3. **Add Environment Variables** in Vercel dashboard:
   ```
   GEMINI_API_KEY=your_actual_gemini_key
   ```
4. **Deploy** - Vercel will handle the rest!

### Vercel Configuration
The included `vercel.json` configures:
- Node.js serverless functions for the backend
- Static file serving for the frontend
- Proper API routing

---

## 📋 Security & Best Practices

🔒 **Security Measures Implemented:**
- ✅ Firebase service account keys gitignored
- ✅ API keys use environment variables only
- ✅ No sensitive data in frontend code
- ✅ Proper CORS configuration
- ✅ Vercel serverless function security

**Files Safe to Commit:**
- All application code (`app.jsx`, `index.html`, etc.)
- Configuration files (`package.json`, `vercel.json`)
- Public Firebase config (API keys are designed to be public)

**Files Never Committed:**
- `*-firebase-adminsdk-*.json` (service account keys)
- `.env` files (API keys and secrets)
- `node_modules/`

---

## 📝 Usage

1. **Upload PDF**: Drag-drop your syllabus PDF or text file
2. **AI Processing**: Wait for Gemini to analyze (10-30 seconds)
3. **Explore Roadmap**: Browse generated modules and topics
4. **Access Resources**: View curated YouTube videos from popular Indian educators like:
   - CodeWithHarry
   - Apna College
   - Chai aur Code
5. **Track Progress**: Check off completed topics and save progress

---

## 🎯 Key Features

### AI-Powered Resource Curation
The app specifically finds educational content from trusted Indian YouTube channels and provides:
- Video tutorials with descriptions
- Reading materials and documentation
- Structured learning paths
- Estimated time requirements

### Modern UI Design
- Purple-to-cyan gradient backgrounds
- Glass morphism effects
- Interactive topic cards
- Responsive mobile design
- Progress visualization

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and test thoroughly
4. Commit: `git commit -m 'Add amazing feature'`
5. Push: `git push origin feature/amazing-feature`
6. Submit a pull request

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

## 📧 Contact

- **Developer**: [ShubhPS](https://github.com/ShubhPS)
- **Repository**: [Syllabi_Tracker](https://github.com/ShubhPS/Syllabi_Tracker)

---

**Made with ❤️ by [ShubhPS](https://github.com/ShubhPS)**
