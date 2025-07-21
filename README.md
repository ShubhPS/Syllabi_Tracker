# 🗺️ Syllabi_Tracker

Convert any PDF syllabus into an interactive, AI-generated learning roadmap with curated resources like links and YouTube videos — customized for your course and study style.

[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen)](https://syllabi-tracker.vercel.app/)


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
- **Curated Resource Cards**: URLs, videos, and reading suggestions  
- **Compact UI** with module expansion, progress bars, and checklist states  
- **Error handling** and user feedback for smoother experience  
- **Responsive Design** optimized for desktop and mobile devices
- **Progress Persistence** to save your learning journey

---

## 🎬 Demo & Screenshots

### 🌐 Live Demo
Try the live application: **[Syllabi_Tracker Demo]((https://syllabi-tracker.vercel.app/))**

### 📸 How It Works

1. **Upload Your Syllabus**
   ![Upload Interface](services/Screenshot(313).png)
   *Simply drag and drop or select your PDF syllabus file*

2. **AI-Generated Roadmap**
   ![Generated Roadmap]((services/Screenshot(314).png))
   *View your structured learning path with expandable modules*

3. **Curated Resources**
   ![Resource Cards](services/Screenshot(315).png)
   *Access personalized study materials for each topic*

4. **Progress Tracking**
   ![Progress Tracking](services/Screenshot(316).png)
   *Monitor your learning journey with interactive checkboxes*


---

## 🛠️ Technologies

- **Frontend**: Next.js / React  
- **Backend**: Node.js + Gemini API integration via OpenAI-compatible SDK
- **State**: Local component state or optional backend persistence  
- **PDF Processing**: Client‑side PDF upload parsing flow
- **Styling**: Tailwind CSS / CSS Modules
- **Deployment**: Vercel / Netlify

---

## 🎯 Motivation

This tool bridges the gap between static course outlines and actionable study plans. Instead of manually breaking down topics and finding resources, learners can get instantly guided with relevant content — making self‑study less overwhelming and more structured.

---

## 📦 Prerequisites

- **Node.js** (v16+) installed on your system  
- **Gemini API key** from Google AI Studio
- **Git** for cloning the repository

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
Create a `.env.local` file in the root directory:
```bash
echo "GEMINI_API_KEY=your_actual_api_key_here" > .env.local
```

### 4. Get Your Gemini API Key
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy and paste it into your `.env.local` file

### 5. Start Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

---

## 🚀 Deployment

This project can be easily deployed on various platforms:

### Vercel (Recommended)
1. Fork this repository
2. Connect your GitHub account to [Vercel](https://vercel.com)
3. Import the project and add your `GEMINI_API_KEY` in environment variables
4. Deploy with one click!


### Other Platforms
The app works on any platform that supports Node.js applications.

---

## 📝 Usage

1. **Upload PDF**: Click the upload area or drag-drop your syllabus PDF
2. **Wait for Processing**: The AI analyzes your document (usually takes 10-30 seconds)
3. **Explore Roadmap**: Browse through generated modules and topics
4. **Access Resources**: Click on topics to view curated learning materials
5. **Track Progress**: Check off completed topics to monitor your advancement

---

## 🔧 API Reference

### Gemini Integration
The app uses Google's Gemini API for intelligent content analysis:

```javascript
// Example API call structure
const response = await gemini.generateContent({
  model: "gemini-pro",
  prompt: `Analyze this syllabus and create a learning roadmap...`,
  maxTokens: 2000
});
```

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

### Ways to Contribute
- 🐛 Report bugs and issues
- 💡 Suggest new features
- 📚 Improve documentation
- 🔧 Submit pull requests
- ⭐ Star the repository

### Development Process
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Test thoroughly
5. Commit: `git commit -m 'Add amazing feature'`
6. Push: `git push origin feature/amazing-feature`
7. Open a Pull Request

### Code Style
- Follow existing code formatting
- Add comments for complex logic
- Include tests for new features
- Update documentation as needed

---

## 📋 TODO

### 🚧 Upcoming Features
- [ ] **Multi-language Support** (Spanish, French, etc.)
- [ ] **Export Roadmap** as PDF or PNG
- [ ] **Collaborative Learning** - Share roadmaps with classmates
- [ ] **Integration with Learning Platforms** (Khan Academy, Coursera)
- [ ] **Mobile App** for iOS and Android
- [ ] **Advanced Analytics** with learning insights
- [ ] **Offline Mode** for downloaded content
- [ ] **Calendar Integration** for study scheduling

### 🐛 Known Issues
- [ ] Large PDF files (>10MB) may timeout
- [ ] Complex mathematical formulas might not parse perfectly
- [ ] Limited support for non-English syllabi

### 🔧 Technical Improvements
- [ ] Add unit and integration tests
- [ ] Implement caching for faster repeated uploads
- [ ] Database integration for user profiles
- [ ] Real-time collaboration features

---

## 🐛 Troubleshooting

### Common Issues

**PDF Upload Fails**
- Ensure PDF is under 10MB
- Check if PDF is text-readable (not scanned image)
- Try refreshing the page

**API Errors**
- Verify your `GEMINI_API_KEY` is correct
- Check API quota limits
- Ensure stable internet connection

**Roadmap Not Generating**
- Make sure your PDF contains a clear syllabus structure
- Try with a different, simpler syllabus first
- Check browser console for error messages

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Acknowledgments

- **Google AI** for the powerful Gemini API
- **Next.js Team** for the amazing React framework
- **Vercel** for seamless deployment platform
- **Open Source Community** for inspiration and resources

---

## 📧 Contact & Support

- **Developer**: [Your Name](https://github.com/ShubhPS)
- **Email**: shubhpsingh2616@example.com

---

## ⭐ Show Your Support

If this project helped you, please consider:
- ⭐ Starring the repository
- 🍴 Forking for your own modifications  

---

**Made with ❤️ by [ShubhPS](https://github.com/ShubhPS)**
