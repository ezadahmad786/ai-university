import React, { useState } from 'react';

interface QuizQuestion {
  question: string;
  options: string[];
  answer: string;
  explanation: string;
}

interface QuizData {
  quiz: QuizQuestion[];
  subject: string;
  topic: string;
  difficulty: string;
  total_questions: number;
}

interface QuizGeneratorProps {
  subject: string;
  onBackToChat: () => void;
}

const QuizGenerator: React.FC<QuizGeneratorProps> = ({ subject, onBackToChat }) => {
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [numQuestions, setNumQuestions] = useState(5);
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<{ [key: number]: string }>({});
  const [showResults, setShowResults] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  const generateQuiz = async () => {
    if (!topic.trim()) {
      setError('Please enter a topic');
      return;
    }

    setIsGenerating(true);
    setError('');
    setShowResults(false);
    setCurrentQuestionIndex(0);
    setUserAnswers({});

    try {
      const API = import.meta.env.VITE_API_URL;
      console.log("API URL:", API);
      const response = await fetch(`${API}/quiz`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject,
          topic: topic.trim(),
          difficulty,
          num_questions: numQuestions
        })
      });

      const data = await response.json();

      if (response.ok) {
        setQuizData(data);
        console.log('Quiz generated:', data);
      } else {
        setError(data.error || 'Failed to generate quiz');
      }
    } catch (err) {
      setError('Failed to connect to server');
      console.error('Quiz generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAnswerSelect = (questionIndex: number, answer: string) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionIndex]: answer
    }));
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < (quizData?.quiz.length || 0) - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      displayResults();
    }
  };

  const displayResults = async () => {
    const score = calculateScore();
    const total = quizData?.quiz.length || 0;
    
    // Save quiz result before showing results
    await saveQuizResult(score, total);
    
    setShowResults(true);
  };

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const calculateScore = () => {
    if (!quizData || !quizData.quiz) return 0;
    
    let correct = 0;
    quizData.quiz.forEach((question, index) => {
      if (userAnswers[index] === question.answer) {
        correct++;
      }
    });
    return correct;
  };

  const saveQuizResult = async (score: number, total: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found, cannot save quiz result');
        return;
      }

      if (!quizData || !quizData.subject) {
        console.error('No quiz data available, cannot save result');
        return;
      }

      const API = import.meta.env.VITE_API_URL;
      console.log("API URL:", API);
      const response = await fetch(`${API}/save-quiz`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject: quizData.subject,
          score: score,
          total_questions: total
        })
      });

      const data = await response.json();

      if (response.ok) {
        console.log('Quiz result saved:', data.result);
      } else {
        console.error('Failed to save quiz result:', data.error);
      }
    } catch (err) {
      console.error('Error saving quiz result:', err);
    }
  };

  const resetQuiz = () => {
    setQuizData(null);
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setShowResults(false);
    setTopic('');
    setError('');
  };

  if (!quizData) {
    return (
      <div className="quiz-generator">
        <div className="quiz-header">
          <button onClick={onBackToChat} className="back-button">
            &larr; Back to Chat
          </button>
          <h2>Generate Quiz</h2>
          <p>Subject: {subject}</p>
        </div>

        <div className="quiz-form">
          <div className="form-group">
            <label htmlFor="topic">Topic:</label>
            <input
              id="topic"
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., Pythagorean theorem, Photosynthesis, For loops"
              className="topic-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="difficulty">Difficulty:</label>
            <select
              id="difficulty"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as 'easy' | 'medium' | 'hard')}
              className="difficulty-select"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="numQuestions">Number of Questions:</label>
            <select
              id="numQuestions"
              value={numQuestions}
              onChange={(e) => setNumQuestions(Number(e.target.value))}
              className="num-questions-select"
            >
              <option value={3}>3 Questions</option>
              <option value={5}>5 Questions</option>
              <option value={10}>10 Questions</option>
            </select>
          </div>

          {error && <div className="error-message">{error}</div>}

          <button
            onClick={generateQuiz}
            disabled={isGenerating || !topic.trim()}
            className="generate-button"
          >
            {isGenerating ? 'Generating...' : 'Generate Quiz'}
          </button>
        </div>
      </div>
    );
  }

  if (showResults) {
    const score = calculateScore();
    const percentage = Math.round((score / quizData.quiz.length) * 100);

    return (
      <div className="quiz-results">
        <div className="results-header">
          <h2>Quiz Results</h2>
          <div className="score-display">
            <div className="score-circle">
              <span className="score-number">{score}/{quizData.quiz.length}</span>
            </div>
            <span className="score-percentage">{percentage}%</span>
          </div>
        </div>

        <div className="results-details">
          <h3>Review Answers:</h3>
          {quizData.quiz.map((question, index) => {
            const userAnswer = userAnswers[index];
            const isCorrect = userAnswer === question.answer;
            
            return (
              <div key={index} className={`result-question ${isCorrect ? 'correct' : 'incorrect'}`}>
                <div className="question-number">Question {index + 1}</div>
                <div className="question-text">{question.question}</div>
                
                <div className="options-review">
                  {question.options.map((option, optionIndex) => {
                    const optionLetter = String.fromCharCode(65 + optionIndex);
                    const isUserAnswer = userAnswer === optionLetter;
                    const isCorrectAnswer = question.answer === optionLetter;
                    
                    return (
                      <div
                        key={optionIndex}
                        className={`option-review ${
                          isUserAnswer ? 'user-selected' : ''
                        } ${isCorrectAnswer ? 'correct-answer' : ''}`}
                      >
                        <span className="option-letter">{optionLetter}.</span>
                        <span className="option-text">{option}</span>
                        {isCorrectAnswer && <span className="correct-indicator">Correct</span>}
                        {isUserAnswer && !isCorrectAnswer && <span className="incorrect-indicator">Your answer</span>}
                      </div>
                    );
                  })}
                </div>

                <div className="explanation-box">
                  <div className="explanation-header">
                    <span className="explanation-icon">?</span>
                    <span className="explanation-title">Explanation</span>
                  </div>
                  <div className="explanation-text">
                    {question.explanation}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="results-actions">
          <button onClick={resetQuiz} className="new-quiz-button">
            Generate New Quiz
          </button>
          <button onClick={() => window.location.href = '/dashboard'} className="dashboard-button">
            View Dashboard
          </button>
          <button onClick={onBackToChat} className="back-to-chat-button">
            Back to Chat
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = quizData.quiz[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quizData.quiz.length) * 100;

  return (
    <div className="quiz-active">
      <div className="quiz-header">
        <button onClick={onBackToChat} className="back-button">
          &larr; Back to Chat
        </button>
        <h2>{quizData.topic} Quiz</h2>
        <div className="quiz-info">
          <span className="subject-tag">{quizData.subject}</span>
          <span className="difficulty-tag">{quizData.difficulty}</span>
        </div>
      </div>

      <div className="progress-bar">
        <div 
          className="progress-fill" 
          style={{ width: `${progress}%` }}
        ></div>
        <span className="progress-text">
          Question {currentQuestionIndex + 1} of {quizData.quiz.length}
        </span>
      </div>

      <div className="question-card">
        <div className="question-content">
          <h3>{currentQuestion.question}</h3>
        </div>

        <div className="options-container">
          {currentQuestion.options.map((option, index) => {
            const optionLetter = String.fromCharCode(65 + index);
            const isSelected = userAnswers[currentQuestionIndex] === optionLetter;
            
            return (
              <label
                key={index}
                className={`option-label ${isSelected ? 'selected' : ''}`}
              >
                <input
                  type="radio"
                  name={`question-${currentQuestionIndex}`}
                  value={optionLetter}
                  checked={isSelected}
                  onChange={() => handleAnswerSelect(currentQuestionIndex, optionLetter)}
                />
                <span className="option-marker">{optionLetter}</span>
                <span className="option-text">{option}</span>
              </label>
            );
          })}
        </div>
      </div>

      <div className="quiz-navigation">
        <button
          onClick={previousQuestion}
          disabled={currentQuestionIndex === 0}
          className="nav-button previous"
        >
          Previous
        </button>
        
        <button
          onClick={nextQuestion}
          disabled={!userAnswers[currentQuestionIndex]}
          className="nav-button next"
        >
          {currentQuestionIndex === quizData.quiz.length - 1 ? 'Finish' : 'Next'}
        </button>
      </div>
    </div>
  );
};

export default QuizGenerator;
