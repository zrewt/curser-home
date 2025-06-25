import React, { useState } from 'react';
import './App.css';
import { Question, Difficulty } from './types';
import { api } from './services/api';
import { SignIn, SignUp, UserButton, SignedIn, SignedOut } from "@clerk/clerk-react";

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
  const [timer, setTimer] = useState<number>(0);
  const timerRef = React.useRef<NodeJS.Timeout | null>(null);
  const [numQuestions, setNumQuestions] = useState<number | null>(null);

  React.useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Helper to get time per question based on difficulty
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

      // Set initial shuffled answers
      const answers = [
        data[0].correct_answer,
        ...data[0].incorrect_answers
      ].sort(() => Math.random() - 0.5);
      setShuffledAnswers(answers);
      setTimer(getTimePerQuestion(difficulty)); // Set timer for first question
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
        setTimer(getTimePerQuestion(selectedDifficulty)); // Reset timer for next question
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

  // Check if user is actively taking a quiz (not on selection screen or score screen)
  const isInQuiz = questions.length > 0 && !showScore && !loading;

  // Timer effect: runs on question or difficulty change
  React.useEffect(() => {
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
          // Time's up, treat as unanswered
          setSelectedAnswer(''); // Mark as no answer
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestion, isInQuiz, selectedDifficulty]);

  // Always show header/navbar
  return (
    <div className="App">
      <header className="App-header">
        <h1>🏆 Sports Quiz 🏆</h1>
        <p className="subtitle">Test your knowledge of various sports!</p>
        {/* Only show quiz info when actively taking a quiz */}
        {isInQuiz && selectedDifficulty && selectedSport && (
          <div className="quiz-info">
            <div className="difficulty-badge">
              {selectedDifficulty.charAt(0).toUpperCase() + selectedDifficulty.slice(1)}
            </div>
            <div className="sport-badge">
              {selectedSport === 'all' ? 'All Sports' : selectedSport.charAt(0).toUpperCase() + selectedSport.slice(1)}
            </div>
          </div>
        )}
        {error && (
          <p className="error-notice">{error}</p>
        )}
      </header>
      <main className="App-main">
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
                  Share Results 📋
                </button>
              </div>
            </div>
          ) : (
            <div className="question-section">
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                ></div>
              </div>
              {/* Timer display */}
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
      <SignedIn>
        <UserButton />
        <p>You are signed in!</p>
      </SignedIn>
      <SignedOut>
        <SignIn path="/sign-in" routing="path" />
        <SignUp path="/sign-up" routing="path" />
      </SignedOut>
    </div>
  );
}

export default App;