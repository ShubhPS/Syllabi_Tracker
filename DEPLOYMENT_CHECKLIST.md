# Quick Deployment Checklist

## Before Deploying

### 1. Environment Variables Needed
- `GEMINI_API_KEY`: Your Google Gemini API key
- `FIREBASE_SERVICE_ACCOUNT`: JSON string of your Firebase service account (optional but recommended)

### 2. Firebase Service Account Options
**Option A: Environment Variable (Recommended for production)**
```bash
FIREBASE_SERVICE_ACCOUNT='{"type":"service_account","project_id":"your-project-id",...}'
```

**Option B: File Upload**
Upload your `*-firebase-adminsdk-*.json` file directly to the hosting platform

### 3. Update API Base URL
After deployment, update `index.html`:
```javascript
window.API_BASE = 'https://your-deployed-backend-url.com';
```

## Platform Recommendations

### Choose Vercel if:
- ✅ You prefer serverless functions
- ✅ You want automatic deployments from GitHub
- ✅ You need fast global CDN for static files
- ✅ You're comfortable with serverless architecture

### Choose Render if:
- ✅ You prefer traditional server hosting
- ✅ You need persistent server state
- ✅ You want simpler configuration
- ✅ You need database hosting in the same platform

## Post-Deployment Testing

1. Test the health endpoint: `GET /api/health`
2. Test Gemini integration: `GET /api/generate/test`
3. Upload a sample PDF and verify full functionality
4. Check Firebase authentication and data persistence

## Common Issues & Solutions

### CORS Errors
Add your frontend domain to CORS configuration in `server/index.js`:
```javascript
app.use(cors({
  origin: ['https://your-frontend-domain.com', 'http://localhost:5173']
}));
```

### Firebase Connection Issues
- Verify environment variables are set correctly
- Check Firebase project settings
- Ensure service account has proper permissions

### API Key Issues
- Verify `GEMINI_API_KEY` is set in environment variables
- Test the key with the `/api/generate/test` endpoint
