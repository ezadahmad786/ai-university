# Ganaie AI University

An AI-powered learning platform where students can chat with AI tutors, select subjects, and interact with AI avatar teachers.

## Project Structure

```
Ai-University/
  frontend/          # React frontend
  backend/           # Flask backend API
  README.md
```

## Setup Instructions

### Frontend Setup (React)

1. Navigate to frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start development server:
   ```bash
   npm start
   ```

### Backend Setup (Flask)

1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Create virtual environment:
   ```bash
   python -m venv venv
   ```

3. Activate virtual environment:
   - Windows: `venv\Scripts\activate`
   - Mac/Linux: `source venv/bin/activate`

4. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

5. Create .env file (copy from .env.example):
   ```bash
   cp .env.example .env
   ```

6. Start Flask server:
   ```bash
   python app.py
   ```

## Features

- **Chat Interface**: Real-time conversation with AI tutor
- **Subject Selection**: Physics, Biology, Python programming
- **AI Avatar Teacher**: Text-to-speech with animated avatar
- **Progress Tracking**: Monitor learning progress

## Development Plan

1. Step 1: Project setup (completed)
2. Step 2: Chat UI
3. Step 3: Backend API
4. Step 4: AI integration
5. Step 5: Text-to-speech
6. Step 6: AI avatar
7. Step 7: Connect everything

## Running the Full System

1. Start backend server (port 5000)
2. Start frontend server (port 3000)
3. Open browser to http://localhost:3000

## Free Alternatives Used

- Mock AI responses (no OpenAI API required for MVP)
- Web Speech API for text-to-speech
- CSS animations for avatar
