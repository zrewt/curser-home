import React, { useState } from 'react';
import './App.css';
import { Question, Difficulty } from './types';
import { api } from './services/api';
import Navbar from './components/Navbar';

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

  // 🔥 Share Score Function
  const shareResults = () => {
    if (!selectedSport || !selectedDifficulty) return;

    const resultText = `🏆 I scored ${score}/${questions.length} in a ${selectedDifficulty.toUpperCase()} ${selectedSport.toUpperCase()} quiz on ScoreTrivia.com! Can you beat me?`;

    if (navigator.share) {
      navigator.share({
        title: 'My Score on ScoreTrivia',
        text: resultText,
        url: window.location.href,
      })
      .then(() => setToastMessage('Thanks for sharing!'))
      .catch((err) => {
        console.error('Share failed:', err);
        setToastMessage('Sharing not completed.');
      });
    } else {
      setToastMessage('Sharing is not supported on this browser.');
    }
  };

  const isInQuiz = questions.length > 0 && !showScore && !loading;

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestion, isInQuiz, selectedDifficulty]);

  return (
    <div className="App">
      <Navbar
        error={error}
        selectedDifficulty={selectedDifficulty}
        selectedSport={selectedSport}
        isInQuiz={isInQuiz}
      />
      <main className="App-main">
        {loading ? (
          <div className="loading">
            <div className="loading-spinner"></div>
            <p>Loading questions...</p>
          </div>
        ) : !selectedDifficulty || !selectedSport || questions.length === 0 ? (
          <div>
            {/* ... selection UI remains unchanged ... */}
          </div>
        ) : showScore ? (
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
              {/* 🔥 Share Button Added */}
              <button onClick={shareResults} className="share-button">
                Share My Score 🔗
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
            <div className={`timer${selectedDifficulty ? ` ${selectedDifficulty}` : ''}${timer <= 3 ? ' low-time' : ''}`}>
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
