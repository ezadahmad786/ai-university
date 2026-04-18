# Ganaie AI University - Deployment Checklist

## Backend (Flask + Render)

### Pre-Deployment Checks
- [ ] app.py uses dynamic port: `port = int(os.environ.get("PORT", 5000))`
- [ ] app.py uses host: `app.run(host="0.0.0.0", port=port, debug=False)`
- [ ] CORS configured for production origins
- [ ] requirements.txt includes all dependencies
- [ ] Environment variables documented (JWT_SECRET_KEY, OPENROUTER_API_KEY)

### Render Deployment
- [ ] Create Render account
- [ ] Connect GitHub repository
- [ ] Create Web Service with settings:
  - Root Directory: `backend`
  - Build Command: `pip install -r requirements.txt`
  - Start Command: `python app.py`
- [ ] Add environment variables
- [ ] Deploy successfully
- [ ] Test backend URL: `https://your-app.onrender.com`

## Frontend (React + Vercel)

### Pre-Deployment Checks
- [ ] API URLs updated to production backend
- [ ] Build works: `npm run build`
- [ ] No build errors
- [ ] Environment variables set (NODE_ENV=production)

### Vercel Deployment
- [ ] Create Vercel account
- [ ] Connect GitHub repository
- [ ] Import project with settings:
  - Root Directory: `frontend`
  - Framework: React
  - Build Command: `npm run build`
  - Output Directory: `dist`
- [ ] Deploy successfully
- [ ] Test frontend URL: `https://your-app.vercel.app`

## Integration Testing

### API Connection
- [ ] Frontend can reach backend
- [ ] CORS properly configured
- [ ] No CORS errors in browser console

### Authentication Flow
- [ ] User registration works
- [ ] User login works
- [ ] JWT token stored in localStorage
- [ ] Protected routes accessible

### Full Application Test
- [ ] Chat interface works
- [ ] Quiz system works
- [ ] Dashboard accessible
- [ ] Logout works

## Final URLs

### Live Application
- Frontend URL: `https://ganaie-ai-university.vercel.app`
- Backend URL: `https://ganaie-ai-university-api.onrender.com`

### API Endpoints
- Register: `https://ganaie-ai-university-api.onrender.com/register`
- Login: `https://ganaie-ai-university-api.onrender.com/login`
- Profile: `https://ganaie-ai-university-api.onrender.com/profile`

## Success Confirmation

### Backend Success
- [ ] Backend responds to health check
- [ ] Database initialized
- [ ] Authentication endpoints working
- [ ] JWT tokens generated

### Frontend Success
- [ ] Application loads without errors
- [ ] Forms render correctly
- [ ] API calls successful
- [ ] User experience smooth

### Production Ready
- [ ] Application accessible worldwide
- [ ] Auto-deployment working
- [ ] Error handling functional
- [ ] Professional appearance

---

## Quick Commands

### Backend Test
```bash
cd backend
python app.py
# Should start on port 5000 locally
```

### Frontend Test
```bash
cd frontend
npm run build
# Should complete without errors
```

### Git Commands
```bash
git add .
git commit -m "Ready for production deployment"
git push origin main
```

### Live Testing
```bash
# Test backend API
curl https://ganaie-ai-university-api.onrender.com/

# Test registration
curl -X POST https://ganaie-ai-university-api.onrender.com/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

---

## Troubleshooting Notes

### Common Issues
1. **CORS Error**: Add Vercel URL to backend CORS origins
2. **Build Error**: Check package.json and run npm install
3. **Deploy Error**: Check Render logs for missing dependencies
4. **API Error**: Verify backend URL in frontend is correct

### Debug Steps
1. Check browser console for errors
2. Check Render deployment logs
3. Check Vercel deployment logs
4. Test API endpoints directly
5. Verify environment variables

---

## Deployment Status

### Current Status
- Backend: Ready for deployment
- Frontend: Ready for deployment
- Documentation: Complete
- Checklist: Ready

### Next Steps
1. Create GitHub repository
2. Deploy backend to Render
3. Deploy frontend to Vercel
4. Test live application
5. Update CORS origins if needed

---

**Your AI University is ready for production deployment!**
