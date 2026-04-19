import React, { useState, useEffect } from 'react';
import './App.css';
import { API_BASE_URL } from './config';
import MarkdownRenderer from './components/MarkdownRenderer';
import EnhancedImageRenderer from './components/EnhancedImageRenderer';
import QuizGenerator from './components/QuizGenerator';
import Login from './components/Login';
import Signup from './components/Signup';
import Dashboard from './components/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import './components/Quiz.css';
import './components/Auth.css';
import './components/Dashboard.css';
import './components/EnhancedImageRenderer.css';

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

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
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

    const userMessage: Message = {
      id: Date.now(),
      text: inputText,
      sender: 'user',
      timestamp: new Date()
    };

    // Add user message to chat
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      // Send message to backend API
      console.log("API URL:", API_BASE_URL);
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputText,
          subject: selectedSubject,
          mode: responseMode
        })
      });

      const data = await response.json();
      
      // Debug: Log full response
      console.log('API Response:', data);

      if (response.ok && data) {
        // Handle new response format: {"response": "text"}
        const responseText = data.response || data.text || data.reply || 'No response received';
        
        if (!responseText) {
          console.error('Empty response received:', data);
          setMessages(prev => [...prev, {
            id: Date.now() + 1,
            text: 'Error: Received empty response from server',
            sender: 'ai',
            timestamp: new Date()
          }]);
          return;
        }

        const aiMessage: Message = {
          id: Date.now() + 1,
          text: responseText,
          sender: 'ai',
          timestamp: new Date()
        };
        console.log('Created AI message:', aiMessage);
        setMessages(prev => [...prev, aiMessage]);
      } else {
        // Handle error response
        const errorText = data?.error || data?.message || 'Failed to get response';
        const errorMessage: Message = {
          id: Date.now() + 1,
          text: `Error: ${errorText}`,
          sender: 'ai',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      // Handle network error
      console.error('Network error:', error);
      const errorMessage: Message = {
        id: Date.now() + 1,
        text: 'Error: Could not connect to the server. Please check if the backend is running.',
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Safe image extraction function
  const extractImageUrl = (text: string): string => {
    if (!text) return "https://source.unsplash.com/600x400/?education";
    
    try {
      const match = text.match(/\!\[.*?\]\((.*?)\)/);
      if (match && match[1] && match[1].startsWith("http")) {
        return match[1];
      }
    } catch (e) {
      console.error("Image extraction error:", e);
    }
    
    return "https://source.unsplash.com/600x400/?education";
  };

  const handleQuizMode = () => {
    setShowQuiz(true);
  };

  const handleBackToChat = () => {
    setShowQuiz(false);
  };

  const handleLogin = (token: string, user: any) => {
    setIsAuthenticated(true);
    setCurrentUser(user);
  };

  const handleSignup = (token: string, user: any) => {
    setIsAuthenticated(true);
    setCurrentUser(user);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setCurrentUser(null);
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
    return authMode === 'login' ? (
      <Login onLogin={handleLogin} onToggleMode={toggleAuthMode} />
    ) : (
      <Signup onSignup={handleSignup} onToggleMode={toggleAuthMode} />
    );
  }

  return (
    <ProtectedRoute>
      <div className="App">
        <header className="App-header">
          <div className="header-content">
            <div>
              <h1>Ganaie AI University</h1>
              <p>Your AI-powered learning platform</p>
            </div>
            <div className="user-info">
              <span className="welcome-text">Welcome, {currentUser?.username}!</span>
              <button onClick={handleLogout} className="logout-button">
                Logout
              </button>
            </div>
          </div>
        </header>
        
        <main className="chat-container">
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
                          <>
                            <MarkdownRenderer content={message.text} />
                            <EnhancedImageRenderer text={message.text} />
                          </>
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
    </ProtectedRoute>
  );
};

export default App;
