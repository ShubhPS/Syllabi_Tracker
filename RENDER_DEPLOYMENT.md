# Render Deployment Guide for Syllabus to Roadmap Generator

## Prerequisites
1. GitHub account with your code pushed
2. Render account (free tier available)
3. Gemini API key
4. Firebase project setup

## Step-by-Step Render Deployment

### 1. Create Web Service for Backend
1. Go to [render.com](https://render.com) and sign in with GitHub
2. Click "New" → "Web Service"
3. Connect your `Syllabi_Tracker` repository
4. Configure the service:
   - **Name**: `syllabi-tracker-backend`
   - **Region**: Choose closest to your users
   - **Branch**: `main`
   - **Root Directory**: `server`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

### 2. Configure Backend Environment Variables
In Render dashboard, add these environment variables:
```
GEMINI_API_KEY=your_actual_gemini_api_key_here
PORT=10000
```

### 3. Create Static Site for Frontend
1. Click "New" → "Static Site"
2. Connect the same repository
3. Configure the static site:
   - **Name**: `syllabi-tracker-frontend`
   - **Branch**: `main`
   - **Root Directory**: Leave empty (root)
   - **Build Command**: `echo "No build needed"`
   - **Publish Directory**: `.`

### 4. Update Frontend Configuration
After backend deployment, update the API base URL in `index.html`:
```html
<script>window.API_BASE = 'https://syllabi-tracker-backend.onrender.com';</script>
```

### 5. Firebase Service Account Setup

**Method 1: Environment Variables (Recommended)**
1. In your backend service environment variables, add:
   ```
   FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"your-project",...}
   ```
2. Update `server/index.js`:
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

**Method 2: Upload via Dashboard**
Upload the service account file through Render's file upload feature.

### 6. Deploy Both Services
Both services will auto-deploy when you push to GitHub.

### 7. CORS Configuration
Make sure your backend allows requests from your frontend domain:
```javascript
app.use(cors({
  origin: ['https://syllabi-tracker-frontend.onrender.com', 'http://localhost:5173']
}));
```

## Important Notes for Render

### Free Tier Limitations
- Backend service goes to sleep after 15 minutes of inactivity
- Cold start delays (30-60 seconds) on first request
- 750 hours/month limit

### Performance Tips
1. Keep the service awake with a health check ping
2. Consider upgrading to paid tier for better performance
3. Use Render's caching features

### Alternative: Single Service Deployment
You can also deploy as a single service by serving static files from Express:
```javascript
app.use(express.static('.'));
```
This approach uses only one Render service but requires build configuration.
