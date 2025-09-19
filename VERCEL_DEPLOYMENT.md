# Vercel Deployment Guide for Syllabus to Roadmap Generator

## Prerequisites
1. GitHub account with your code pushed
2. Vercel account (free tier available)
3. Gemini API key
4. Firebase project setup

## Step-by-Step Vercel Deployment

### 1. Prepare Your Repository
Ensure your code is pushed to GitHub with the `vercel.json` configuration file.

### 2. Connect to Vercel
1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click "New Project"
3. Import your `Syllabi_Tracker` repository
4. Vercel will auto-detect it as a Node.js project

### 3. Configure Environment Variables
In Vercel dashboard, add these environment variables:
```
GEMINI_API_KEY=your_actual_gemini_api_key_here
```

### 4. Update Frontend API Configuration
After deployment, update the API base URL in `index.html`:
```html
<script>window.API_BASE = 'https://your-vercel-app.vercel.app';</script>
```

### 5. Firebase Service Account Setup
Since the service account JSON cannot be committed to Git:

**Option A: Environment Variables (Recommended)**
1. Copy your Firebase service account JSON content
2. In Vercel, add environment variable:
   ```
   FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"your-project",...}
   ```
3. Update `server/index.js` to read from environment:
   ```javascript
   let serviceAccount;
   try {
     serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT 
       ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
       : JSON.parse(readFileSync('../syllabus-ai-4d341-firebase-adminsdk-fbsvc-e21a21a5f5.json', 'utf8'));
   } catch (error) {
     console.warn('Firebase service account not found, Firebase features will be disabled');
   }
   ```

**Option B: Manual Upload**
Upload the service account file directly to Vercel through their dashboard.

### 6. Deploy
Click "Deploy" and Vercel will:
- Build your application
- Deploy frontend as static files
- Deploy backend as serverless functions
- Provide you with a live URL

### 7. Custom Domain (Optional)
Add a custom domain in Vercel's domain settings if desired.
