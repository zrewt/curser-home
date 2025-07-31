import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import { Question, Difficulty } from './types';
import { api } from './services/api';
import Navbar from './components/Navbar';

type Sport = 'basketball' | 'football' | 'baseball' | 'hockey' | 'soccer' | 'all';

function App() {
  console.log('App render start');

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
  const [timer, setTimer] = useState<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [numQuestions, setNumQuestions] = useState<number | null>(null);
  const [isDailyQuiz, setIsDailyQuiz] = useState(false);
  const [lastDailyQuizDate, setLastDailyQuizDate] = useState<string | null>(null);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const getTimePerQuestion = (difficulty: Difficulty | null) => {
    if (difficulty === 'easy') return 15;
    if (difficulty === 'medium') return 7;
    if (difficulty === 'hard') return 4;
    return 0;
  };

  const fetchQuestions = async (difficulty: Difficulty, sport: Sport, count: number) => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getQuestions(count, difficulty, sport);

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

      const answers = [
        data[0].correct_answer,
        ...data[0].incorrect_answers
      ].sort(() => Math.random() - 0.5);
      setShuffledAnswers(answers);
      setTimer(getTimePerQuestion(difficulty));
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
    if (timerRef.current) clearInterval(timerRef.current);

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
        setTimer(getTimePerQuestion(selectedDifficulty));
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
    setTimer(0);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const copyResultsToClipboard = () => {
    if (!selectedSport || !selectedDifficulty) return;

    const resultText = `🏆 Sports Quiz Results 🏆\n\nSport: ${selectedSport === 'all' ? 'All Sports' : selectedSport.charAt(0).toUpperCase() + selectedSport.slice(1)}\nDifficulty: ${selectedDifficulty.charAt(0).toUpperCase() + selectedDifficulty.slice(1)}\nScore: ${score} out of ${questions.length} (${Math.round((score / questions.length) * 100)}%)`;

    navigator.clipboard.writeText(resultText)
      .then(() => {
        setToastMessage('Results copied to clipboard!');
      })
      .catch((err) => {
        console.error('Failed to copy results:', err);
        setToastMessage('Failed to copy results. Please try again.');
      });
  };

  const isInQuiz = questions.length > 0 && !showScore && !loading;

  useEffect(() => {
    if (!isInQuiz) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    setTimer(getTimePerQuestion(selectedDifficulty));
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          setSelectedAnswer('');
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
              setTimer(getTimePerQuestion(selectedDifficulty));
            } else {
              setShowScore(true);
            }
          }, 1000);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentQuestion, isInQuiz, selectedDifficulty]);

  // Helper to get today's date string
  const getTodayString = () => {
    const now = new Date();
    return `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
  };

  // Fetch daily quiz
  const fetchDailyQuiz = async () => {
    setLoading(true);
    setError(null);
    setIsDailyQuiz(true);
    try {
      const data = await api.getDailyQuiz();
      setQuestions(data);
      setSelectedDifficulty('easy');
      setSelectedSport('all');
      setCurrentQuestion(0);
      setScore(0);
      setShowScore(false);
      setIsDailyQuiz(true);
      setLastDailyQuizDate(getTodayString());
      const answers = [
        data[0].correct_answer,
        ...data[0].incorrect_answers
      ].sort(() => Math.random() - 0.5);
      setShuffledAnswers(answers);
      setTimer(getTimePerQuestion('medium'));
    } catch (error) {
      setError('Failed to fetch daily quiz. Please try again later.');
      setIsDailyQuiz(false);
    } finally {
      setLoading(false);
    }
  };

  // Refetch daily quiz at midnight
  useEffect(() => {
    if (isDailyQuiz) {
      const interval = setInterval(() => {
        const today = getTodayString();
        if (lastDailyQuizDate && lastDailyQuizDate !== today) {
          fetchDailyQuiz();
        }
      }, 60 * 1000); // check every minute
      return () => clearInterval(interval);
    }
  }, [isDailyQuiz, lastDailyQuizDate]);

  console.log('App render end');

  return (
    <div className="App">
      <Navbar
        error={error}
        selectedDifficulty={selectedDifficulty}
        selectedSport={selectedSport}
        isInQuiz={isInQuiz}
      />
      <main className="App-main">
        {(!selectedDifficulty || !selectedSport || questions.length === 0) && (
          <div style={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }}>
            <button onClick={fetchDailyQuiz} disabled={loading} className="daily-quiz-btn">
              Daily Quiz (5 Medium Sports Questions)
            </button>
          </div>
        )}
        {isDailyQuiz && <h2 className="daily-quiz-heading">Daily Quiz</h2>}
        {loading ? (
          <div className="loading">
            <div className="loading-spinner"></div>
            <p>Loading questions...</p>
          </div>
        ) : !selectedDifficulty || !selectedSport || questions.length === 0 ? (
          <div>
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
              <div className="num-questions-selection" style={{ marginTop: '2rem' }}>
                <h2>Select Number of Questions</h2>
                <div className="num-questions-buttons" style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                  {[5, 10, 15].map((n) => (
                    <button
                      key={n}
                      className={`num-questions-button${numQuestions === n ? ' selected' : ''}`}
                      onClick={() => setNumQuestions(n)}
                      style={{ padding: '1rem 2rem', fontSize: '1.1rem', borderRadius: '8px', border: numQuestions === n ? '3px solid #1877f2' : '2px solid #e2e8f0', background: numQuestions === n ? '#e7f3ff' : '#f0f2f5', fontWeight: 600, cursor: 'pointer' }}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
              {selectedDifficulty && selectedSport && numQuestions && (
                <button
                  className="start-quiz-button"
                  onClick={() => fetchQuestions(selectedDifficulty, selectedSport, numQuestions)}
                >
                  Start Quiz
                </button>
              )}
            </div>
          </div>
        ) : (
          showScore ? (
            <div className="score-section">
              <h2>Quiz Complete!</h2>
              <p>You scored {score} out of {questions.length}</p>
              <p className="score-percentage">
                {Math.round((score / questions.length) * 100)}%
              </p>
              <div className="score-buttons">
                <button onClick={resetQuiz}>Try Another Quiz</button>
                <button onClick={copyResultsToClipboard} className="share-button">
                  Copy Results 📋
                </button>
              </div>
            </div>
          ) : (
            <div className="quiz-card">
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                ></div>
              </div>
              <div
                className={`timer${selectedDifficulty ? ` ${selectedDifficulty}` : ''}${timer <= 3 ? ' low-time' : ''}`}
              >
                {timer}s
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
          )
        )}
      </main>
      {toastMessage && (
        <div className="toast">
          {toastMessage}
        </div>
      )}
    </div>
  );
}

export default App;
