# Frontend API Fix - VITE_API_URL Implementation

## Problem
Frontend deployed on Vercel cannot connect to backend due to hardcoded API URLs.

## Solution
Updated all frontend components to use `import.meta.env.VITE_API_URL` instead of hardcoded URLs.

## Files Updated

### 1. config.ts
```typescript
// BEFORE
export const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://ganaie-ai-university.onrender.com'
  : 'http://127.0.0.1:5000';

// AFTER
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';
```

### 2. components/AuthNew.tsx
```typescript
// BEFORE
const response = await fetch(`${process.env.NODE_ENV === 'production' ? 'https://ganaie-ai-university.onrender.com' : 'http://127.0.0.1:5000'}${endpoint}`, {

// AFTER
const response = await fetch(`${import.meta.env.VITE_API_URL}${endpoint}`, {
```

### 3. App.tsx
```typescript
// BEFORE
const response = await fetch('http://127.0.0.1:5000/chat', {

// AFTER
const response = await fetch(`${import.meta.env.VITE_API_URL}/chat`, {
```

### 4. components/Dashboard.tsx
```typescript
// BEFORE
const response = await fetch('http://127.0.0.1:5000/history', {

// AFTER
const response = await fetch(`${import.meta.env.VITE_API_URL}/history`, {
```

### 5. components/QuizGenerator.tsx
```typescript
// BEFORE (quiz endpoint)
const response = await fetch('http://127.0.0.1:5000/quiz', {

// AFTER
const response = await fetch(`${import.meta.env.VITE_API_URL}/quiz`, {

// BEFORE (save-quiz endpoint)
const response = await fetch('http://127.0.0.1:5000/save-quiz', {

// AFTER
const response = await fetch(`${import.meta.env.VITE_API_URL}/save-quiz`, {
```

## Environment Variables Required

### For Vercel Deployment
Add to Vercel environment variables:
```
VITE_API_URL=https://your-render-backend-url.onrender.com
```

### For Local Development
Create `.env` file in frontend root:
```
VITE_API_URL=http://127.0.0.1:5000
```

## API Endpoints Updated

1. **Authentication:**
   - `POST /login`
   - `POST /register`

2. **Chat:**
   - `POST /chat`

3. **Quiz:**
   - `POST /quiz`
   - `POST /save-quiz`

4. **Dashboard:**
   - `GET /history`

## Benefits

1. **Environment Flexibility:** Works in both development and production
2. **Centralized Configuration:** Single source of truth for API URL
3. **Easy Deployment:** Change backend URL without code changes
4. **CORS Compatibility:** Properly configured for Vercel + Render

## Testing

### Local Development
```bash
# In frontend/.env
VITE_API_URL=http://127.0.0.1:5000

# Start both backend and frontend
python backend/app.py
npm start
```

### Production Deployment
```bash
# In Vercel environment variables
VITE_API_URL=https://ganaie-ai-university-api.onrender.com

# Deploy to Vercel
vercel --prod
```

## Expected Results

- Frontend successfully connects to backend
- No "Failed to connect to server" errors
- All API calls work correctly
- Authentication flow completes
- Chat functionality works
- Quiz system functions properly

## Troubleshooting

### If API calls still fail:
1. Check VITE_API_URL is set correctly in Vercel
2. Verify backend is deployed and accessible
3. Check CORS configuration in backend
4. Check browser console for specific error messages

### Common Issues:
- Missing VITE_API_URL environment variable
- Incorrect backend URL
- CORS issues
- Backend not running/deployed

## Final Code Structure

All frontend components now use:
```typescript
fetch(`${import.meta.env.VITE_API_URL}/endpoint`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}` // For protected routes
  },
  body: JSON.stringify(data)
})
```

This ensures consistent API calls across the entire application.
