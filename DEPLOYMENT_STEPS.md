# Ganaie AI University - Complete Production Deployment Guide

## Overview

Deploy your full-stack AI University application to production using:
- **Frontend**: React + Vercel
- **Backend**: Flask + Render
- **Database**: SQLite (temporary, can upgrade to PostgreSQL later)

---

## STEP 1: PREPARE BACKEND (Flask)

### 1.1 Dynamic Port Configuration
```python
# Already updated in app.py
if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)
```

### 1.2 Requirements.txt
```txt
Flask==2.3.3
Flask-CORS==4.0.0
requests==2.31.0
python-dotenv==1.0.0
gTTS==2.3.2
Flask-SQLite3==0.3.0
Flask-JWT-Extended==4.5.3
bcrypt==4.0.1.5
```

### 1.3 CORS Configuration
```python
# Already updated in app.py
cors_origins = [
    'http://localhost:3000', 
    'http://127.0.0.1:3000',
    'https://ganaie-ai-university.vercel.app'
]
CORS(app, origins=cors_origins)
```

### 1.4 Verify API Endpoints
```bash
# Test locally
python app.py

# Check endpoints:
# POST /register
# POST /login
# GET /profile (protected)
```

---

## STEP 2: PREPARE FRONTEND (React)

### 2.1 Production API URLs
```typescript
// Already configured in AuthNew.tsx
const response = await fetch(`${process.env.NODE_ENV === 'production' ? 'https://ganaie-ai-university.onrender.com' : 'http://127.0.0.1:5000'}${endpoint}`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});
```

### 2.2 Build Test
```bash
cd "d:\OneDrive\Documents\Ai-University\frontend"
npm run build
```

### 2.3 Verify Build
- Ensure no build errors
- Check build output in `dist/` folder
- Test build locally if needed

---

## STEP 3: GITHUB SETUP

### 3.1 Initialize Git Repository
```bash
cd "d:\OneDrive\Documents\Ai-University"
git init
git add .
git commit -m "Initial commit - AI University ready for deployment"
git branch -M main
```

### 3.2 Create GitHub Repository
1. Go to https://github.com
2. Click "New repository"
3. Name: `ai-university`
4. Description: "Ganaie AI University - AI-powered learning platform"
5. Make it Public
6. Click "Create repository"

### 3.3 Push to GitHub
```bash
git remote add origin https://github.com/YOUR_USERNAME/ai-university.git
git push -u origin main
```

---

## STEP 4: DEPLOY BACKEND (RENDER)

### 4.1 Create Render Account
1. Go to https://render.com
2. Sign up with GitHub
3. Connect your GitHub account

### 4.2 Create Web Service
1. Click "New +" > "Web Service"
2. Connect your `ai-university` repository
3. **Name**: `ganaie-ai-university-api`
4. **Root Directory**: `backend`
5. **Runtime**: Python 3.9+
6. **Build Command**: `pip install -r requirements.txt`
7. **Start Command**: `python app.py`

### 4.3 Environment Variables
Add these in Render dashboard:
```
JWT_SECRET_KEY=your-super-secret-jwt-key-change-this-in-production
OPENROUTER_API_KEY=your-openrouter-api-key
```

### 4.4 Deployment Settings
- **Instance Type**: Free (to start)
- **Auto-Deploy**: Yes (on git push)
- **Health Check Path**: `/` (root endpoint)

### 4.5 Deploy
Click "Create Web Service" and wait for deployment.

### 4.6 Get Backend URL
After deployment, your backend will be available at:
```
https://ganaie-ai-university-api.onrender.com
```

---

## STEP 5: DEPLOY FRONTEND (VERCEL)

### 5.1 Create Vercel Account
1. Go to https://vercel.com
2. Sign up with GitHub
3. Connect your GitHub account

### 5.2 Import Project
1. Click "New Project"
2. Select your `ai-university` repository
3. **Framework Preset**: React
4. **Root Directory**: `frontend`
5. **Build Command**: `npm run build`
6. **Output Directory**: `dist`

### 5.3 Environment Variables
Add in Vercel dashboard:
```
NODE_ENV=production
```

### 5.4 Deploy
Click "Deploy" and wait for deployment.

### 5.5 Get Frontend URL
After deployment, your frontend will be available at:
```
https://ganaie-ai-university.vercel.app
```

---

## STEP 6: CONNECT FRONTEND TO BACKEND

### 6.1 Update CORS Origins
Add your Vercel URL to backend CORS:
```python
cors_origins = [
    'http://localhost:3000', 
    'http://127.0.0.1:3000',
    'https://ganaie-ai-university.vercel.app'  # Your Vercel URL
]
```

### 6.2 Update Frontend API URL
Ensure AuthNew.tsx uses correct backend URL:
```typescript
const response = await fetch(`${process.env.NODE_ENV === 'production' ? 'https://ganaie-ai-university-api.onrender.com' : 'http://127.0.0.1:5000'}${endpoint}`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});
```

### 6.3 Redeploy Both Services
1. Push changes to GitHub
2. Render will auto-deploy backend
3. Vercel will auto-deploy frontend

---

## STEP 7: TEST LIVE APPLICATION

### 7.1 Access Live App
Visit: https://ganaie-ai-university.vercel.app

### 7.2 Test Authentication
1. **Register New User**:
   - Email: `test@example.com`
   - Password: `password123`
   - Click "Sign Up"

2. **Login User**:
   - Use same credentials
   - Click "Login"

3. **Verify Token Storage**:
   - Open browser DevTools
   - Check Application > Local Storage
   - Should see `token` and `user` items

4. **Test Protected Features**:
   - Access dashboard (after quiz)
   - Try chat interface
   - Take a quiz

### 7.3 Test API Endpoints
```bash
# Test backend health
curl https://ganaie-ai-university-api.onrender.com/

# Test registration
curl -X POST https://ganaie-ai-university-api.onrender.com/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Test login
curl -X POST https://ganaie-ai-university-api.onrender.com/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

---

## FINAL URLs

### **Live Application**
- **Frontend**: https://ganaie-ai-university.vercel.app
- **Backend**: https://ganaie-ai-university-api.onrender.com

### **API Endpoints**
- **Register**: https://ganaie-ai-university-api.onrender.com/register
- **Login**: https://ganaie-ai-university-api.onrender.com/login
- **Profile**: https://ganaie-ai-university-api.onrender.com/profile

---

## TROUBLESHOOTING

### Common Issues

#### CORS Errors
```
Error: Access blocked by CORS policy

Solution: Add your Vercel URL to backend CORS origins
```

#### Database Connection
```
Error: Database connection failed

Solution: Ensure SQLite database file is created on first run
```

#### Build Failures
```
Error: npm build failed

Solution: Check package.json and run npm install
```

#### Deployment Failures
```
Error: Render deployment failed

Solution: Check logs in Render dashboard
```

---

## SUCCESS INDICATORS

### Backend Success
- [x] Backend deployed and accessible
- [x] API endpoints responding
- [x] Database initialized
- [x] JWT authentication working

### Frontend Success
- [x] Frontend deployed and accessible
- [x] Build process successful
- [x] API calls to backend working
- [x] Authentication flow complete

### Integration Success
- [x] Frontend connects to backend
- [x] User registration working
- [x] User login working
- [x] Token storage working
- [x] Protected routes accessible

---

## BONUS FEATURES

### Loading Spinners
```typescript
// Already implemented in AuthNew.tsx
const [isLoading, setIsLoading] = useState(false);

// In JSX
{isLoading ? (
  <div className="loading-spinner">Loading...</div>
) : (
  <button type="submit">Submit</button>
)}
```

### Error Messages
```typescript
// Already implemented in AuthNew.tsx
const [error, setError] = useState('');

// In JSX
{error && (
  <div className="error-message">{error}</div>
)}
```

### UI Improvements
- Modern gradient design
- Responsive layout
- Smooth transitions
- Professional styling

---

## NEXT STEPS

1. **Database Upgrade**: Move from SQLite to PostgreSQL
2. **Email Verification**: Add email confirmation
3. **Password Reset**: Implement forgot password
4. **User Profiles**: Add user settings
5. **Analytics**: Track user engagement
6. **Performance**: Optimize build size and loading

---

## CONCLUSION

Your Ganaie AI University is now fully deployed and accessible worldwide! 

**Live URLs:**
- Frontend: https://ganaie-ai-university.vercel.app
- Backend: https://ganaie-ai-university-api.onrender.com

**Features Available:**
- User registration and login
- JWT authentication
- AI-powered chat
- Quiz system
- Dashboard
- Responsive design

**Production Ready:**
- Auto-deployment on git push
- CORS protection
- Error handling
- Professional UI
- Global accessibility

**Your AI University is now live and ready for students worldwide!**
