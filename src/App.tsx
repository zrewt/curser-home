import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import { Question, Difficulty } from './types';
import { api } from './services/api';
import Navbar from './components/Navbar';
import QuizSelection from './components/QuizSelection';
import QuizTaking from './components/QuizTaking';
import QuizRoute from './components/QuizRoute';

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
      setSelectedDifficulty('medium');
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
    <Router>
      <div className="App">
        <Navbar
          error={error}
          selectedDifficulty={selectedDifficulty}
          selectedSport={selectedSport}
          isInQuiz={isInQuiz}
        />
        <main className="App-main">
          <Routes>
            <Route 
              path="/" 
              element={
                <QuizSelection
                  onStartQuiz={fetchQuestions}
                  onDailyQuiz={fetchDailyQuiz}
                  loading={loading}
                />
              } 
            />
            <Route 
              path="/quiz" 
              element={
                questions.length > 0 ? (
                  <QuizTaking
                    questions={questions}
                    currentQuestion={currentQuestion}
                    score={score}
                    showScore={showScore}
                    selectedAnswer={selectedAnswer}
                    shuffledAnswers={shuffledAnswers}
                    timer={timer}
                    selectedDifficulty={selectedDifficulty}
                    selectedSport={selectedSport}
                    isDailyQuiz={isDailyQuiz}
                    onAnswerClick={handleAnswerClick}
                    onResetQuiz={resetQuiz}
                    onCopyResults={copyResultsToClipboard}
                  />
                ) : (
                  <Navigate to="/" replace />
                )
              } 
            />
            <Route 
              path="/:difficulty-:sport" 
              element={
                <QuizRoute
                  onStartQuiz={fetchQuestions}
                  onDailyQuiz={fetchDailyQuiz}
                  loading={loading}
                />
              } 
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        {toastMessage && (
          <div className="toast">
            {toastMessage}
          </div>
        )}
      </div>
    </Router>
  );
}

export default App;
