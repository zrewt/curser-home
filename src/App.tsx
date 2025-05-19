import React, { useState, useEffect } from 'react';
import './App.css';
import { Question, Difficulty } from './types';
import { api } from './services/api';

function App() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | null>(null);

  const fetchQuestions = async (difficulty: Difficulty) => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getQuestions(5, difficulty);
      setQuestions(data);
      setSelectedDifficulty(difficulty);
    } catch (error) {
      console.error('Error fetching questions:', error);
      setError('Failed to fetch questions. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerClick = (selectedAnswer: string) => {
    if (questions[currentQuestion]?.correct_answer === selectedAnswer) {
      setScore(score + 1);
    }

    const nextQuestion = currentQuestion + 1;
    if (nextQuestion < questions.length) {
      setCurrentQuestion(nextQuestion);
    } else {
      setShowScore(true);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setScore(0);
    setShowScore(false);
    setSelectedDifficulty(null);
  };

  if (loading) {
    return (
      <div className="App">
        <div className="loading">Loading questions...</div>
      </div>
    );
  }

  if (!selectedDifficulty) {
    return (
      <div className="App">
        <header className="App-header">
          <h1>🏆 Sports Quiz 🏆</h1>
          <p className="subtitle">Test your knowledge of Soccer, Baseball, Basketball, and Football!</p>
        </header>
        <div className="difficulty-selection">
          <h2>Select Difficulty</h2>
          <div className="difficulty-buttons">
            <button 
              className="difficulty-button easy"
              onClick={() => fetchQuestions('easy')}
            >
              Easy
            </button>
            <button 
              className="difficulty-button medium"
              onClick={() => fetchQuestions('medium')}
            >
              Medium
            </button>
            <button 
              className="difficulty-button hard"
              onClick={() => fetchQuestions('hard')}
            >
              Hard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>🏆 Sports Quiz 🏆</h1>
        <p className="subtitle">Test your knowledge of Soccer, Baseball, Basketball, and Football!</p>
        <div className="difficulty-badge">
          {selectedDifficulty.charAt(0).toUpperCase() + selectedDifficulty.slice(1)}
        </div>
        {error && (
          <p className="error-notice">{error}</p>
        )}
      </header>
      <main className="App-main">
        {showScore ? (
          <div className="score-section">
            <h2>Quiz Complete!</h2>
            <p>You scored {score} out of {questions.length}</p>
            <p>Percentage: {Math.round((score / questions.length) * 100)}%</p>
            <button onClick={resetQuiz}>New Quiz</button>
          </div>
        ) : (
          <div className="question-section">
            <h2>Question {currentQuestion + 1}</h2>
            <p>{questions[currentQuestion]?.question}</p>
            <div className="answer-buttons">
              {[
                questions[currentQuestion]?.correct_answer,
                ...questions[currentQuestion]?.incorrect_answers
              ]
                .sort(() => Math.random() - 0.5)
                .map((answer, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswerClick(answer)}
                    className="answer-button"
                  >
                    {answer}
                  </button>
                ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;

