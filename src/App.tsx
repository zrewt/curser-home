import React, { useState, useEffect, useRef } from 'react';
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
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [timer, setTimer] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  useEffect(() => {
    if (!selectedDifficulty || showScore || selectedAnswer !== null) return;

    const duration = selectedDifficulty === 'easy' ? 15 : selectedDifficulty === 'medium' ? 7 : 3;
    setTimer(duration);

    timerRef.current && clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleAnswerClick(''); // Empty = skipped
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current!);
  }, [currentQuestion, selectedDifficulty, selectedAnswer, showScore]);

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
      setSelectedAnswer(null);
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

  const handleAnswerClick = (selected: string) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(selected);
    clearInterval(timerRef.current!);

    if (questions[currentQuestion]?.correct_answer === selected) {
      setScore(score + 1);
    }

    setTimeout(() => {
      const next = currentQuestion + 1;
      if (next < questions.length) {
        setCurrentQuestion(next);
        setSelectedAnswer(null);
        const answers = [
          questions[next].correct_answer,
          ...questions[next].incorrect_answers
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
    clearInterval(timerRef.current!);
  };

  const copyResultsToClipboard = () => {
    if (!selectedSport || !selectedDifficulty) return;

    const resultText = `🏆 Sports Quiz Results 🏆\n\nSport: ${selectedSport === 'all' ? 'All Sports' : selectedSport.charAt(0).toUpperCase() + selectedSport.slice(1)}\nDifficulty: ${selectedDifficulty.charAt(0).toUpperCase() + selectedDifficulty.slice(1)}\nScore: ${score} out of ${questions.length} (${Math.round((score / questions.length) * 100)}%)`;

    navigator.clipboard.writeText(resultText)
      .then(() => setToastMessage('Results copied to clipboard!'))
      .catch(() => setToastMessage('Failed to copy results.'));
  };

  const isInQuiz = questions.length > 0 && !showScore && !loading;

  return (
    <div className="App">
      <header className="App-header">
        <h1>🏆 Sports Quiz 🏆</h1>
        <p className="subtitle">Test your knowledge of various sports!</p>
        {isInQuiz && selectedDifficulty && selectedSport && (
          <div className="quiz-info">
            <div className="difficulty-badge">
              {selectedDifficulty.charAt(0).toUpperCase() + selectedDifficulty.slice(1)}
            </div>
            <div className="sport-badge">
              {selectedSport === 'all' ? 'All Sports' : selectedSport.charAt(0).toUpperCase() + selectedSport.slice(1)}
            </div>
            <div className="timer">⏱️ {timer}s</div>
          </div>
        )}
        {error && <p className="error-notice">{error}</p>}
      </header>
      <main className="App-main">
        {loading ? (
          <div className="loading"><div className="loading-spinner"></div><p>Loading questions...</p></div>
        ) : !selectedDifficulty || !selectedSport || questions.length === 0 ? (
          <div className="selection-container">
            <div className="difficulty-selection">
              <h2>Select Difficulty</h2>
              <div className="difficulty-buttons">
                {['easy', 'medium', 'hard'].map(d => (
                  <button key={d} onClick={() => setSelectedDifficulty(d as Difficulty)} className={`difficulty-button ${d} ${selectedDifficulty === d ? 'selected' : ''}`}>{d.charAt(0).toUpperCase() + d.slice(1)}</button>
                ))}
              </div>
            </div>
            <div className="sport-selection">
              <h2>Select Sport</h2>
              <div className="sport-buttons">
                {['basketball', 'football', 'baseball', 'hockey', 'soccer', 'all'].map(s => (
                  <button key={s} onClick={() => setSelectedSport(s as Sport)} className={`sport-button ${selectedSport === s ? 'selected' : ''}`}>{s === 'all' ? '🏆 All Sports' : `${s === 'basketball' ? '🏀' : s === 'football' ? '🏈' : s === 'baseball' ? '⚾' : s === 'hockey' ? '🏒' : '⚽'} ${s.charAt(0).toUpperCase() + s.slice(1)}`}</button>
                ))}
              </div>
            </div>
            {selectedDifficulty && selectedSport && (
              <button className="start-quiz-button" onClick={() => fetchQuestions(selectedDifficulty, selectedSport)}>Start Quiz</button>
            )}
          </div>
        ) : showScore ? (
          <div className="score-section">
            <h2>Quiz Complete! 🎉</h2>
            <p>You scored {score} out of {questions.length}</p>
            <p className="score-percentage">{Math.round((score / questions.length) * 100)}%</p>
            <div className="score-buttons">
              <button onClick={resetQuiz}>Try Another Quiz</button>
              <button onClick={copyResultsToClipboard} className="share-button">Share Results 📋</button>
            </div>
          </div>
        ) : (
          <div className="question-section">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}></div>
            </div>
            <h2>Question {currentQuestion + 1} of {questions.length}</h2>
            <p>{questions[currentQuestion]?.question}</p>
            <div className="answer-buttons">
              {shuffledAnswers.map((answer, index) => (
                <button key={index} onClick={() => handleAnswerClick(answer)} className="answer-button" disabled={selectedAnswer !== null}>{answer}</button>
              ))}
            </div>
          </div>
        )}
      </main>
      {toastMessage && <div className="toast">{toastMessage}</div>}
    </div>
  );
}

export default App;