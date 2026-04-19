import React, { useState } from 'react';
import './AuthNew.css';

interface AuthNewProps {
  onAuthSuccess: (token: string, user: any) => void;
  mode: 'login' | 'signup';
  onToggleMode: () => void;
}

const AuthNew: React.FC<AuthNewProps> = ({ onAuthSuccess, mode, onToggleMode }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const API = import.meta.env.VITE_API_URL;
      console.log("API URL:", API);
      const endpoint = mode === 'login' ? '/login' : '/register';
      const response = await fetch(`${API}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          password: password
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Store token in localStorage
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Call parent success handler
        onAuthSuccess(data.access_token, data.user);
      } else {
        setError(data.error || `${mode} failed`);
      }
    } catch (err) {
      setError('Failed to connect to server');
      console.error(`${mode} error:`, err);
    } finally {
      setIsLoading(false);
    }
  };

  const isLogin = mode === 'login';

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
          <p>
            {isLogin 
              ? 'Sign in to access Ganaie AI University' 
              : 'Join Ganaie AI University'}
          </p>
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
              placeholder={isLogin ? "Enter your password" : "Create a password (min. 6 characters)"}
              required
              disabled={isLoading}
              minLength={6}
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button
            type="submit"
            className="auth-button"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="loading-spinner"></span>
            ) : (
              isLogin ? 'Sign In' : 'Create Account'
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
            <button onClick={onToggleMode} className="link-button">
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthNew;
