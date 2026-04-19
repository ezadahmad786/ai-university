import React, { useState, useEffect } from 'react';
import './AppAuth.css';
import AuthNew from './components/AuthNew';
import Dashboard from './components/Dashboard';
import MarkdownRenderer from './components/MarkdownRenderer';
import QuizGenerator from './components/QuizGenerator';
import './components/Quiz.css';
import './components/AuthNew.css';
import './components/Dashboard.css';
// Removed API_BASE_URL import - using direct environment variable

// Type definitions for our chat messages
interface Message {
  id: number;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

// Subject options for the dropdown
const subjects = [
  'General',
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'Programming',
  'Computer Science',
  'English',
  'Arts & Humanities'
];

function AppAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [showDashboard, setShowDashboard] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('General');
  const [responseMode, setResponseMode] = useState<'simple' | 'detailed'>('simple');
  const [isLoading, setIsLoading] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);

  // Check authentication on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      setIsAuthenticated(true);
      setCurrentUser(JSON.parse(user));
    }
  }, []);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    const chatContainer = document.getElementById('chat-container');
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }, [messages]);

  // Handle sending message to backend
  const sendMessage = async () => {
    if (!inputText.trim()) return;

    setIsLoading(true);
    const userMessage: Message = {
      id: Date.now(),
      text: inputText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');

    try {
      const API = import.meta.env.VITE_API_URL;
      console.log("API URL for login:", API);
      
      const response = await fetch(`${API}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          password
        })
      });

      const data = await response.json();

      if (response.ok) {
        const aiMessage: Message = {
          id: Date.now(),
          text: data.response,
          sender: 'ai',
          timestamp: new Date()
        };

        setMessages(prev => [...prev, aiMessage]);
      } else {
        console.error('Failed to send message:', data.error);
      }
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleQuizMode = () => {
    setShowQuiz(true);
  };

  const handleBackToChat = () => {
    setShowQuiz(false);
  };

  const handleAuthSuccess = (token: string, user: any) => {
    setIsAuthenticated(true);
    setCurrentUser(user);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setCurrentUser(null);
    setShowDashboard(false);
    setShowQuiz(false);
    setMessages([]);
  };

  const toggleAuthMode = () => {
    setAuthMode(authMode === 'login' ? 'signup' : 'login');
  };

  const handleShowDashboard = () => {
    setShowDashboard(true);
  };

  const handleBackFromDashboard = () => {
    setShowDashboard(false);
  };

  // Show login/signup if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="app-container">
        <AuthNew 
          onAuthSuccess={handleAuthSuccess} 
          mode={authMode} 
          onToggleMode={toggleAuthMode} 
        />
      </div>
    );
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-content">
          <div>
            <h1>Ganaie AI University</h1>
            <p>Your AI-powered learning platform</p>
          </div>
          <div className="user-info">
            <span className="welcome-text">Welcome, {currentUser?.email}!</span>
            <button onClick={handleLogout} className="logout-button">
              Logout
            </button>
          </div>
        </div>
      </header>
      
      <main className="main-content">
        {showDashboard ? (
          <Dashboard onBackToChat={handleBackFromDashboard} />
        ) : showQuiz ? (
          <QuizGenerator 
            subject={selectedSubject} 
            onBackToChat={handleBackToChat} 
          />
        ) : (
          <div className="chat-window">
            {/* Chat messages display area */}
            <div id="chat-container" className="messages-container">
              {messages.length === 0 ? (
                <div className="welcome-message">
                  Welcome! Ask me anything about Physics, Biology, or Python programming.
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`message ${message.sender === 'user' ? 'user-message' : 'ai-message'}`}
                  >
                    <div className="message-content">
                      {message.sender === 'ai' ? (
                        <MarkdownRenderer content={message.text} />
                      ) : (
                        <div className="user-text">{message.text}</div>
                      )}
                    </div>
                    <div className="message-time">
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                ))
              )}
              
              {/* Loading indicator */}
              {isLoading && (
                <div className="message ai-message">
                  <div className="message-content loading">
                    Thinking...
                  </div>
                </div>
              )}
            </div>

            {/* Subject selector and input area */}
            <div className="input-area">
              {/* Subject selector dropdown */}
              <div className="subject-selector">
                <label htmlFor="subject-select" className="subject-label">
                  Subject:
                </label>
                <select
                  id="subject-select"
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="subject-dropdown"
                  disabled={isLoading}
                >
                  {subjects.map((subject) => (
                    <option key={subject} value={subject}>
                      {subject}
                    </option>
                  ))}
                </select>
              </div>

              {/* Response mode selector */}
              <div className="mode-selector">
                <label htmlFor="mode-select" className="mode-label">
                  Response:
                </label>
                <div className="mode-toggle">
                  <button
                    className={`mode-button ${responseMode === 'simple' ? 'active' : ''}`}
                    onClick={() => setResponseMode('simple')}
                    disabled={isLoading}
                  >
                    Simple
                  </button>
                  <button
                    className={`mode-button ${responseMode === 'detailed' ? 'active' : ''}`}
                    onClick={() => setResponseMode('detailed')}
                    disabled={isLoading}
                  >
                    Detailed
                  </button>
                </div>
              </div>

              {/* Chat input area */}
              <div className="input-container">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={`Ask about ${selectedSubject.toLowerCase()}...`}
                  className="chat-input"
                  disabled={isLoading}
                />
                <button
                  onClick={sendMessage}
                  disabled={isLoading || !inputText.trim()}
                  className="send-button"
                >
                  {isLoading ? '...' : 'Send'}
                </button>
                <button
                  onClick={handleQuizMode}
                  disabled={isLoading}
                  className="quiz-button"
                >
                  Quiz
                </button>
                <button
                  onClick={handleShowDashboard}
                  disabled={isLoading}
                  className="dashboard-nav-button"
                >
                  Dashboard
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AppAuth;
