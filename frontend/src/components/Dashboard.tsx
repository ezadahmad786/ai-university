import React, { useState, useEffect } from 'react';
import './Dashboard.css';

interface QuizResult {
  id: number;
  subject: string;
  score: number;
  total_questions: number;
  percentage: number;
  date: string;
}

interface DashboardProps {
  onBackToChat: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onBackToChat }) => {
  const [history, setHistory] = useState<QuizResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login to view history');
        setIsLoading(false);
        return;
      }

      const response = await fetch('http://127.0.0.1:5000/history', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      const data = await response.json();

      if (response.ok) {
        setHistory(data.history);
      } else {
        setError(data.error || 'Failed to fetch history');
      }
    } catch (err) {
      setError('Failed to connect to server');
      console.error('History fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return '#10b981'; // green
    if (percentage >= 60) return '#f59e0b'; // yellow
    return '#ef4444'; // red
  };

  const getBestScore = (subject: string) => {
    const subjectResults = history.filter(h => h.subject === subject);
    if (subjectResults.length === 0) return 0;
    return Math.max(...subjectResults.map(r => r.percentage));
  };

  const getAverageScore = (subject: string) => {
    const subjectResults = history.filter(h => h.subject === subject);
    if (subjectResults.length === 0) return 0;
    const sum = subjectResults.reduce((acc, r) => acc + r.percentage, 0);
    return Math.round(sum / subjectResults.length);
  };

  const uniqueSubjects = Array.from(new Set(history.map(h => h.subject)));

  if (isLoading) {
    return (
      <div className="dashboard-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading your quiz history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <div className="error-state">
          <p>{error}</p>
          <button onClick={fetchHistory} className="retry-button">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h2>Your Learning Dashboard</h2>
        <button onClick={onBackToChat} className="back-button">
          Back to Chat
        </button>
      </header>

      {history.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📚</div>
          <h3>No quiz attempts yet</h3>
          <p>Take your first quiz to start tracking your progress!</p>
        </div>
      ) : (
        <>
          {/* Subject Summary */}
          <div className="subject-summary">
            <h3>Subject Performance</h3>
            <div className="subject-cards">
              {uniqueSubjects.map(subject => (
                <div key={subject} className="subject-card">
                  <h4>{subject}</h4>
                  <div className="subject-stats">
                    <div className="stat">
                      <span className="stat-label">Best Score</span>
                      <span className="stat-value" style={{ color: getScoreColor(getBestScore(subject)) }}>
                        {getBestScore(subject)}%
                      </span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">Average</span>
                      <span className="stat-value" style={{ color: getScoreColor(getAverageScore(subject)) }}>
                        {getAverageScore(subject)}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quiz History */}
          <div className="quiz-history">
            <h3>Quiz History</h3>
            <div className="history-list">
              {history.map((result) => (
                <div key={result.id} className="history-card">
                  <div className="history-header">
                    <h4>{result.subject}</h4>
                    <span className="history-date">
                      {formatDate(result.date)}
                    </span>
                  </div>
                  <div className="history-content">
                    <div className="score-display">
                      <span className="score-text">
                        {result.score}/{result.total_questions}
                      </span>
                      <span 
                        className="percentage-badge"
                        style={{ 
                          backgroundColor: getScoreColor(result.percentage),
                          color: 'white'
                        }}
                      >
                        {result.percentage}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
