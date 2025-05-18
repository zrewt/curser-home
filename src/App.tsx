import React, { useState, useEffect } from 'react';
import './App.css';
import { Question } from './types';
import { api } from './services/api';

function App() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [difficulties, setDifficulties] = useState<string[]>([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);
  const [showDifficultySelection, setShowDifficultySelection] = useState(true);

  useEffect(() => {
    const fetchDifficulties = async () => {
      try {
        const data = await api.getDifficulties();
        setDifficulties(data);
      } catch (error) {
        console.error('Error fetching difficulties:', error);
        setError('Failed to fetch difficulty levels. Please try again later.');
      }
    };

    fetchDifficulties();
  }, []);

  const fetchQuestions = async (difficulty?: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getQuestions(5, difficulty);
      setQuestions(data);
      setShowDifficultySelection(false);
    } catch (error) {
      console.error('Error fetching questions:', error);
      setError('Failed to fetch questions. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleDifficultySelect = (difficulty: string) => {
    setSelectedDifficulty(difficulty);
    fetchQuestions(difficulty);
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
    setShowDifficultySelection(true);
  };

  if (loading) {
    return (
      <div className="App">
        <div className="loading">Loading questions...</div>
      </div>
    );
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>🏆 Sports Quiz 🏆</h1>
        <p className="subtitle">Test your knowledge of Soccer, Baseball, Basketball, and Football!</p>
        {error && (
          <p className="error-notice">{error}</p>
        )}
      </header>
      <main className="App-main">
        {showDifficultySelection ? (
          <div className="difficulty-selection">
            <h2>Select Difficulty</h2>
            <div className="difficulty-buttons">
              {difficulties.map((difficulty) => (
                <button
                  key={difficulty}
                  onClick={() => handleDifficultySelect(difficulty)}
                  className="difficulty-button"
                >
                  {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                </button>
              ))}
            </div>
          </div>
        ) : showScore ? (
          <div className="score-section">
            <h2>Quiz Complete!</h2>
            <p>You scored {score} out of {questions.length}</p>
            <p>Percentage: {Math.round((score / questions.length) * 100)}%</p>
            <p>Difficulty: {selectedDifficulty ? selectedDifficulty.charAt(0).toUpperCase() + selectedDifficulty.slice(1) : 'Random'}</p>
            <button onClick={resetQuiz}>New Quiz</button>
          </div>
        ) : (
          <div className="question-section">
            <h2>Question {currentQuestion + 1}</h2>
            <p className="difficulty-indicator">
              Difficulty: {selectedDifficulty ? selectedDifficulty.charAt(0).toUpperCase() + selectedDifficulty.slice(1) : 'Random'}
            </p>
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

