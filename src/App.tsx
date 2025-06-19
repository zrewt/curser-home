import React, { useState, useEffect } from 'react';
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

  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [timerId, setTimerId] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  useEffect(() => {
    if (timeLeft === null || showScore) return;
    if (timeLeft === 0) {
      handleAnswerClick('');
      return;
    }
    const id = setTimeout(() => setTimeLeft((prev) => (prev ? prev - 1 : null)), 1000);
    setTimerId(id);
    return () => clearTimeout(id);
  }, [timeLeft]);

  const getTimeByDifficulty = (difficulty: Difficulty): number => {
    switch (difficulty) {
      case 'easy': return 15;
      case 'medium': return 7;
      case 'hard': return 3;
      default: return 10;
    }
  };

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
      const answers = [data[0].correct_answer, ...data[0].incorrect_answers].sort(() => Math.random() - 0.5);
      setShuffledAnswers(answers);
      setTimeLeft(getTimeByDifficulty(difficulty));
    } catch (error) {
      console.error('Error fetching questions:', error);
      setError('Failed to fetch questions. Please try again later.');
      setSelectedDifficulty(null);
      setSelectedSport(null);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerClick = (answer: string) => {
    setSelectedAnswer(answer);
    if (questions[currentQuestion]?.correct_answer === answer) {
      setScore(score + 1);
    }
    clearTimeout(timerId!);
    setTimeout(() => {
      const next = currentQuestion + 1;
      if (next < questions.length) {
        setCurrentQuestion(next);
        setSelectedAnswer(null);
        const answers = [questions[next].correct_answer, ...questions[next].incorrect_answers].sort(() => Math.random() - 0.5);
        setShuffledAnswers(answers);
        setTimeLeft(getTimeByDifficulty(selectedDifficulty!));
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
    setTimeLeft(null);
    clearTimeout(timerId!);
  };

  const copyResultsToClipboard = () => {
    if (!selectedSport || !selectedDifficulty) return;
    const result = `🏆 Sports Quiz Results 🏆\n\nSport: ${selectedSport === 'all' ? 'All Sports' : selectedSport}\nDifficulty: ${selectedDifficulty}\nScore: ${score} out of ${questions.length} (${Math.round((score / questions.length) * 100)}%)`;
    navigator.clipboard.writeText(result)
      .then(() => setToastMessage('Results copied to clipboard!'))
      .catch(() => setToastMessage('Failed to copy results.'));
  };

  const isInQuiz = questions.length > 0 && !showScore && !loading;

  return (
    <div className="App">
      <header className="App-header">
        <h1>🏆 Sports Quiz 🏆</h1>
        <p className="subtitle">Test your knowledge of various sports!</p>
        {isInQuiz && (
          <div className="quiz-info">
            <div className="difficulty-badge">{selectedDifficulty}</div>
            <div className="sport-badge">{selectedSport}</div>
            <div className="timer">⏳ {timeLeft}s</div>
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
                {['easy', 'medium', 'hard'].map((d) => (
                  <button key={d} className={`difficulty-button ${d} ${selectedDifficulty === d ? 'selected' : ''}`} onClick={() => setSelectedDifficulty(d as Difficulty)}>{d.charAt(0).toUpperCase() + d.slice(1)}</button>
                ))}
              </div>
            </div>
            <div className="sport-selection">
              <h2>Select Sport</h2>
              <div className="sport-buttons">
                {['🏀 basketball', '🏈 football', '⚾ baseball', '🏒 hockey', '⚽ soccer', '🏆 all'].map((s) => (
                  <button key={s} className={`sport-button ${selectedSport === s ? 'selected' : ''}`} onClick={() => setSelectedSport(s as Sport)}>{s}</button>
                ))}
              </div>
            </div>
            {selectedDifficulty && selectedSport && <button className="start-quiz-button" onClick={() => fetchQuestions(selectedDifficulty, selectedSport)}>Start Quiz</button>}
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