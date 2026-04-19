import React, { useState } from 'react';
import './Auth.css';
import { API_BASE_URL } from '../config';

interface SignupProps {
  onSignup: (token: string, user: any) => void;
  onToggleMode: () => void;
}

const Signup: React.FC<SignupProps> = ({ onSignup, onToggleMode }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    try {
      console.log("API URL:", API_BASE_URL);
      const apiUrl = `${API_BASE_URL}/register`;
      console.log('API URL for registration:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username.trim(),
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
        // Auto-login after successful registration
        console.log("API URL:", API_BASE_URL);
        const loginApiUrl = `${API_BASE_URL}/login`;
        console.log('API URL for auto-login:', loginApiUrl);
        
        const loginResponse = await fetch(loginApiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: email.trim(),
            password
          })
        });

        console.log("Login response status:", loginResponse.status);

        // Better JSON parsing for login response
        const loginText = await loginResponse.text();
        console.log("Raw login response text:", loginText);
        
        let loginData;
        try {
          loginData = JSON.parse(loginText);
        } catch (error) {
          console.error("Invalid login JSON response:", loginText);
          setError('Account created but login failed. Please try logging in.');
          setIsLoading(false);
          return;
        }

        if (loginResponse.ok) {
          // Store token in localStorage
          localStorage.setItem('token', loginData.access_token);
          localStorage.setItem('user', JSON.stringify(loginData.user));
          
          // Call parent signup handler
          onSignup(loginData.access_token, loginData.user);
        } else {
          setError('Account created but login failed. Please try logging in.');
        }
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (err) {
      setError('Failed to connect to server');
      console.error('Signup error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Create Account</h2>
          <p>Join Ganaie AI University</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Choose a username"
              required
              disabled={isLoading}
            />
          </div>

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
              placeholder="Create a password (min. 6 characters)"
              required
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
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
            {isLoading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account?{' '}
            <button onClick={onToggleMode} className="link-button">
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
