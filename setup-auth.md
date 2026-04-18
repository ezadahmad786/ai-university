# Ganaie AI University - Authentication System Setup

## 🚀 Quick Start Guide

### 1. Backend Setup

```bash
# Navigate to backend directory
cd "d:\OneDrive\Documents\Ai-University\backend"

# Install required packages
pip install -r requirements_auth.txt

# Set environment variables
# Create .env file with:
JWT_SECRET_KEY=your-secret-key-here

# Start the authentication server
python auth_app.py
```

### 2. Frontend Setup

```bash
# Navigate to frontend directory
cd "d:\OneDrive\Documents\Ai-University\frontend"

# Install required packages
npm install

# Start the React development server
npm start
```

### 3. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://127.0.0.1:5000

### 4. Test Authentication

1. **Signup**: Create new account
2. **Login**: Sign in with existing account
3. **Dashboard**: View quiz history (after taking quizzes)
4. **Chat**: AI-powered learning interface

## 🔧 API Endpoints

### POST /signup
```json
Input:
{
  "email": "user@example.com",
  "password": "password123"
}

Output:
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "email": "user@example.com"
  }
}
```

### POST /login
```json
Input:
{
  "email": "user@example.com",
  "password": "password123"
}

Output:
{
  "message": "Login successful",
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com"
  }
}
```

### GET /profile (Protected)
```json
Headers:
Authorization: Bearer <token>

Output:
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "created_at": "2024-01-01 12:00:00"
  }
}
```

## 🗄️ Database Structure

SQLite Database: `users.db`

Table: `users`
- `id` (INTEGER PRIMARY KEY AUTOINCREMENT)
- `email` (TEXT UNIQUE NOT NULL)
- `password` (TEXT NOT NULL)
- `created_at` (TEXT NOT NULL)

## 🔒 Security Features

- **Password Hashing**: bcrypt for secure password storage
- **JWT Authentication**: Secure token-based authentication
- **Input Validation**: Server-side validation for all inputs
- **CORS Protection**: Cross-origin resource sharing enabled
- **Error Handling**: Comprehensive error responses

## 🎯 Features Implemented

### Backend (auth_app.py)
- ✅ SQLite database integration
- ✅ User registration with password hashing
- ✅ User login with JWT token generation
- ✅ Protected profile endpoint
- ✅ Comprehensive error handling
- ✅ Input validation
- ✅ CORS configuration

### Frontend (AppAuth.tsx)
- ✅ Login/Signup forms
- ✅ JWT token management
- ✅ Protected routes
- ✅ Loading states
- ✅ Error handling
- ✅ Responsive design
- ✅ Dashboard integration

## 🚀 Running the System

1. **Start Backend**:
   ```bash
   cd "d:\OneDrive\Documents\Ai-University\backend"
   python auth_app.py
   ```

2. **Start Frontend**:
   ```bash
   cd "d:\OneDrive\Documents\Ai-University\frontend"
   npm start
   ```

3. **Open Browser**:
   Navigate to http://localhost:3000

## 🐛 Troubleshooting

### Backend Issues:
- **ModuleNotFoundError**: Install required packages with `pip install -r requirements_auth.txt`
- **Database Error**: Ensure write permissions in backend directory
- **Port 5000 in use**: Change port in `app.run(port=5001)`

### Frontend Issues:
- **CORS Error**: Ensure backend is running and CORS is enabled
- **API Connection Failed**: Check backend URL and port
- **Token Storage**: Check browser localStorage

## 📱 Testing

Create test accounts:
- Email: `test@example.com`, Password: `password123`
- Email: `demo@example.com`, Password: `demo123`

## 🎉 Success Indicators

✅ Backend running: "Backend is running correctly" at /test
✅ Database created: "Database initialized successfully" in logs
✅ Frontend connected: No "Failed to connect to server" errors
✅ Signup working: New users can create accounts
✅ Login working: Users can authenticate and get tokens
✅ Protected routes working: JWT tokens properly validated
