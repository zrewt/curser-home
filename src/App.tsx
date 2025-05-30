import React, { useState } from 'react';
import './App.css';
import { Question, Difficulty } from './types';
import { api } from './services/api';

type Sport = 'basketball' | 'football' | 'baseball' | 'hockey' | 'soccer' | 'all';

function App() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | null>(null);
  const [selectedSport, setSelectedSport] = useState<Sport | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [shuffledAnswers, setShuffledAnswers] = useState<string[]>([]);

  const fetchQuestions = async (difficulty: Difficulty, sport: Sport) => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getQuestions(5, difficulty, sport);
      
      if (!data || data.length === 0) {
        setError('No questions available. Please try again.');
        setSelectedDifficulty(null);
        setSelectedSport(null);
        return;
      }
      setQuestions(data);
      setSelectedDifficulty(difficulty);
      setSelectedSport(sport);
      setCurrentQuestion(0);
      setScore(0);
      setShowScore(false);
      
      // Set initial shuffled answers
      const answers = [
        data[0].correct_answer,
        ...data[0].incorrect_answers
      ].sort(() => Math.random() - 0.5);
      setShuffledAnswers(answers);
    } catch (error) {
      console.error('Error fetching questions:', error);
      setError('Failed to fetch questions. Please try again later.');
      setSelectedDifficulty(null);
      setSelectedSport(null);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerClick = (selectedAnswer: string) => {
    setSelectedAnswer(selectedAnswer);
    
    if (questions[currentQuestion]?.correct_answer === selectedAnswer) {
      setScore(score + 1);
    }

    setTimeout(() => {
      const nextQuestion = currentQuestion + 1;
      if (nextQuestion < questions.length) {
        setCurrentQuestion(nextQuestion);
        setSelectedAnswer(null);
        const answers = [
          questions[nextQuestion].correct_answer,
          ...questions[nextQuestion].incorrect_answers
        ].sort(() => Math.random() - 0.5);
        setShuffledAnswers(answers);
      } else {
        setShowScore(true);
      }
    }, 1000);
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setScore(0);
    setShowScore(false);
    setSelectedDifficulty(null);
    setSelectedSport(null);
    setSelectedAnswer(null);
    setQuestions([]);
    setShuffledAnswers([]);
  };

  if (loading) {
    return (
      <div className="App">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Loading questions...</p>
        </div>
      </div>
    );
  }

  if (!selectedDifficulty || !selectedSport || questions.length === 0) {
    return (
      <div className="App">
        <header className="App-header">
          <h1>🏆 Daily Sports Quiz 🏆</h1>
          <p className="subtitle">Test your knowledge of various sports!</p>
        </header>
        <div className="selection-container">
          <div className="difficulty-selection">
            <h2>Select Difficulty</h2>
            <div className="difficulty-buttons">
              <button 
                className={`difficulty-button easy ${selectedDifficulty === 'easy' ? 'selected' : ''}`}
                onClick={() => setSelectedDifficulty('easy')}
              >
                Easy
              </button>
              <button 
                className={`difficulty-button medium ${selectedDifficulty === 'medium' ? 'selected' : ''}`}
                onClick={() => setSelectedDifficulty('medium')}
              >
                Medium
              </button>
              <button 
                className={`difficulty-button hard ${selectedDifficulty === 'hard' ? 'selected' : ''}`}
                onClick={() => setSelectedDifficulty('hard')}
              >
                Hard
              </button>
            </div>
          </div>
          <div className="sport-selection">
            <h2>Select Sport</h2>
            <div className="sport-buttons">
              <button 
                className={`sport-button ${selectedSport === 'basketball' ? 'selected' : ''}`}
                onClick={() => setSelectedSport('basketball')}
              >
                🏀 Basketball
              </button>
              <button 
                className={`sport-button ${selectedSport === 'football' ? 'selected' : ''}`}
                onClick={() => setSelectedSport('football')}
              >
                🏈 Football
              </button>
              <button 
                className={`sport-button ${selectedSport === 'baseball' ? 'selected' : ''}`}
                onClick={() => setSelectedSport('baseball')}
              >
                ⚾ Baseball
              </button>
              <button 
                className={`sport-button ${selectedSport === 'hockey' ? 'selected' : ''}`}
                onClick={() => setSelectedSport('hockey')}
              >
                🏒 Hockey
              </button>
              <button 
                className={`sport-button ${selectedSport === 'soccer' ? 'selected' : ''}`}
                onClick={() => setSelectedSport('soccer')}
              >
                ⚽ Soccer
              </button>
              <button 
                className={`sport-button ${selectedSport === 'all' ? 'selected' : ''}`}
                onClick={() => setSelectedSport('all')}
              >
                🏆 All Sports
              </button>
            </div>
          </div>
          {selectedDifficulty && selectedSport && (
            <button 
              className="start-quiz-button"
              onClick={() => fetchQuestions(selectedDifficulty, selectedSport)}
            >
              Start Quiz
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>🏆 Sports Quiz 🏆</h1>
        <p className="subtitle">Test your knowledge of various sports!</p>
        <div className="quiz-info">
          <div className="difficulty-badge">
            {selectedDifficulty?.charAt(0).toUpperCase() + selectedDifficulty?.slice(1)}
          </div>
          <div className="sport-badge">
            {selectedSport === 'all' ? 'All Sports' : selectedSport.charAt(0).toUpperCase() + selectedSport.slice(1)}
          </div>
        </div>
        {error && (
          <p className="error-notice">{error}</p>
        )}
      </header>
      <main className="App-main">
        {showScore ? (
          <div className="score-section">
            <h2>Quiz Complete! 🎉</h2>
            <p>You scored {score} out of {questions.length}</p>
            <p className="score-percentage">
              {Math.round((score / questions.length) * 100)}%
            </p>
            <button onClick={resetQuiz}>Try Another Quiz</button>
          </div>
        ) : (
          <div className="question-section">
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
              ></div>
            </div>
            <h2>Question {currentQuestion + 1} of {questions.length}</h2>
            <p>{questions[currentQuestion]?.question}</p>
            <div className="answer-buttons">
              {shuffledAnswers.map((answer, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswerClick(answer)}
                  className="answer-button"
                  disabled={selectedAnswer !== null}
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

