import React, { useState } from 'react';
import './Auth.css';

interface LoginProps {
  onLogin: (token: string, user: any) => void;
  onToggleMode: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, onToggleMode }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const API = import.meta.env.VITE_API_URL;
      console.log("API URL:", API);
      const apiUrl = `${API}/login`;
      console.log('API URL for login:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          password
        })
      });

      console.log("Response status:", response.status);
      console.log("Response headers:", response.headers);

      // Better JSON parsing with error handling
      const text = await response.text();
      console.log("Raw response text:", text);
      
      let data;
      try {
        data = JSON.parse(text);
      } catch (error) {
        console.error("Invalid JSON response:", text);
        console.error("JSON parsing error:", error);
        setError('Server returned invalid response');
        setIsLoading(false);
        return;
      }

      if (response.ok) {
        // Store token in localStorage
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Call parent login handler
        onLogin(data.access_token, data.user);
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Failed to connect to server');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Welcome Back</h2>
          <p>Sign in to access Ganaie AI University</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              disabled={isLoading}
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button
            type="submit"
            className="auth-button"
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Don't have an account?{' '}
            <button onClick={onToggleMode} className="link-button">
              Sign up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
