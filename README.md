# 🗺️ Syllabi_Tracker

Convert any PDF syllabus into an interactive, AI-generated learning roadmap with curated resources like links and YouTube videos — customized for your course and study style.

---

## 🚀 Overview

**Syllabi_Tracker** helps learners by analyzing uploaded syllabus PDFs to automatically generate:

- 🧱 A structured roadmap with modules and topics  
- 🎯 Personalized curated resources (articles, videos, docs) per topic  
- 📊 Progress tracking to monitor what’s completed  

Built using the powerful Gemini API, the app delivers precise, context-aware guidance for efficient learning plans.

---

## ✨ Features

- **Auto‑generate Learning Roadmap** from syllabus PDF  
- **Curated Resource Cards**: URLs, videos, and reading suggestions  
- **Compact UI** with module expansion, progress bars, and checklist states  
- **Error handling** and user feedback for smoother experience  

---

## 🛠️ Technologies

- **Frontend**: React  
- **Backend**: Node.js + Gemini API integration via OpenAI-compatible SDK :contentReference[oaicite:1]{index=1}  
- **State**: Local component state or optional backend persistence  
- **PDF Processing**: Client‑side PDF upload parsing flow

---

## 🎯 Motivation

This tool bridges the gap between static course outlines and actionable study plans. Instead of manually breaking down topics and finding resources, learners can get instantly guided with relevant content — making self‑study less overwhelming and more structured.

---

## 📦 Prerequisites

- **Node.js** (v16+) installed on your system  
- **Gemini API key**, set `GEMINI_API_KEY` in `.env.local` (only referenced once — no repetition elsewhere)

---

## 🧪 Installation & Local Setup

```bash
# Clone repository
git clone https://github.com/ShubhPS/Syllabi_Tracker.git
cd Syllabi_Tracker

# Install dependencies
npm install

# Create `.env.local` with GEMINI_API_KEY
echo "GEMINI_API_KEY=your_key_here" > .env.local

# Start development server
npm run dev
