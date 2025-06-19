import React, { useState, useEffect } from 'react';
import './App.css';
import { Question, Difficulty } from './types';
import { api } from './services/api';
import NicknameModal from './components/NicknameModal';
import LeaderboardModal from './components/LeaderboardModal';

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

  // Nickname and leaderboard state
  const [nickname, setNickname] = useState<string | null>(null);
  const [showNicknameModal, setShowNicknameModal] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboard, setLeaderboard] = useState<{ nickname: string; score: number; difficulty: string }[]>([]);

  // Helper to get today's date string
  const getToday = () => new Date().toISOString().slice(0, 10);

  // On mount, check for nickname and leaderboard for today
  useEffect(() => {
    const today = getToday();
    const stored = localStorage.getItem('nickname-info');
    let showModal = true;
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.date === today && parsed.nickname) {
          setNickname(parsed.nickname);
          showModal = false;
        }
      } catch {}
    }
    setShowNicknameModal(showModal);

    // Load leaderboard for today
    const lb = localStorage.getItem('leaderboard-' + today);
    if (lb) {
      try {
        setLeaderboard(JSON.parse(lb));
      } catch {
        setLeaderboard([]);
      }
    } else {
      setLeaderboard([]);
    }
  }, []);

  // Save nickname to localStorage (do NOT add to leaderboard here)
  const handleNicknameSubmit = (nick: string) => {
    setNickname(nick);
    setShowNicknameModal(false);
    localStorage.setItem('nickname-info', JSON.stringify({ nickname: nick, date: getToday() }));
  };

  // Only add/update leaderboard when quiz is completed
  useEffect(() => {
    if (showScore && nickname && selectedDifficulty) {
      const today = getToday();
      setLeaderboard(prev => {
        let updated = prev.map(e =>
          e.nickname === nickname && e.difficulty === selectedDifficulty && score > e.score ? { ...e, score } : e
        );
        // If not present, add
        if (!updated.some(e => e.nickname === nickname && e.difficulty === selectedDifficulty)) {
          updated = [...updated, { nickname, score, difficulty: selectedDifficulty }];
        }
        localStorage.setItem('leaderboard-' + today, JSON.stringify(updated));
        return updated;
      });
    }
  }, [showScore, nickname, score, selectedDifficulty]);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

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

  // Always show header/navbar
  return (
    <div className="App">
      <header className="App-header">
        <h1>🏆 Sports Quiz 🏆</h1>
        <p className="subtitle">Test your knowledge of various sports!</p>
        <button onClick={() => setShowLeaderboard(true)} style={{ position: 'absolute', top: 16, right: 16 }}>
          Leaderboard
        </button>
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
        ) : (
          showScore ? (
            <div className="score-section">
              <h2>Quiz Complete! 🎉</h2>
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
      <NicknameModal isOpen={showNicknameModal} onSubmit={handleNicknameSubmit} />
      <LeaderboardModal isOpen={showLeaderboard} leaderboard={leaderboard.sort((a, b) => b.score - a.score)} onClose={() => setShowLeaderboard(false)} />
    </div>
  );
}

export default App;