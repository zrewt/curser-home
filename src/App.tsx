import React, { useState, useEffect } from 'react';
import './App.css';

interface Question {
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
}

// Backup questions in case API is rate limited
const backupQuestions: Question[] = [
  {
    question: "What is the name of Manchester United's home stadium?",
    correct_answer: "Old Trafford",
    incorrect_answers: ["Anfield", "Emirates Stadium", "Stamford Bridge"]
  },
  {
    question: "Which country won the FIFA World Cup in 2022?",
    correct_answer: "Argentina",
    incorrect_answers: ["France", "Brazil", "Portugal"]
  },
  {
    question: "Who won the NBA Championship in 2023?",
    correct_answer: "Denver Nuggets",
    incorrect_answers: ["Los Angeles Lakers", "Boston Celtics", "Miami Heat"]
  },
  {
    question: "Which tennis player has won the most Grand Slam titles?",
    correct_answer: "Novak Djokovic",
    incorrect_answers: ["Roger Federer", "Rafael Nadal", "Pete Sampras"]
  },
  {
    question: "In which sport would you perform a slam dunk?",
    correct_answer: "Basketball",
    incorrect_answers: ["Volleyball", "Tennis", "Golf"]
  },
  {
    question: "Which team won the Super Bowl in 2024?",
    correct_answer: "Kansas City Chiefs",
    incorrect_answers: ["San Francisco 49ers", "Baltimore Ravens", "Detroit Lions"]
  },
  {
    question: "Who holds the record for most Olympic gold medals?",
    correct_answer: "Michael Phelps",
    incorrect_answers: ["Usain Bolt", "Carl Lewis", "Mark Spitz"]
  },
  {
    question: "Which country won the Rugby World Cup in 2023?",
    correct_answer: "South Africa",
    incorrect_answers: ["New Zealand", "England", "France"]
  },
  {
    question: "In which sport would you use a 'green jacket' as a prize?",
    correct_answer: "Golf",
    incorrect_answers: ["Tennis", "Boxing", "Horse Racing"]
  },
  {
    question: "Which team has won the most UEFA Champions League titles?",
    correct_answer: "Real Madrid",
    incorrect_answers: ["Barcelona", "Bayern Munich", "AC Milan"]
  }
];

function App() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [timeUntilNextQuiz, setTimeUntilNextQuiz] = useState('');
  const [usingBackup, setUsingBackup] = useState(false);

  // Function to get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const now = new Date();
    return `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
  };

  // Function to get backup questions for today
  const getBackupQuestions = () => {
    const today = getTodayDate();
    const seed = today.split('-').reduce((acc, val) => acc + parseInt(val), 0);
    const shuffled = [...backupQuestions].sort(() => {
      return Math.sin(seed + Math.random()) - 0.5;
    });
    return shuffled.slice(0, 3);
  };

  // Function to calculate time until next quiz
  const updateTimeUntilNextQuiz = () => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const diff = tomorrow.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    setTimeUntilNextQuiz(`${hours}h ${minutes}m until next quiz`);
  };

  // Function to decode HTML entities
  const decodeHTML = (html: string) => {
    const txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
  };

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          'https://opentdb.com/api.php?amount=3&category=21&type=multiple'
        );
        
        if (response.status === 429) {
          // If rate limited, use backup questions
          setQuestions(getBackupQuestions());
          setUsingBackup(true);
        } else {
          const data = await response.json();
          if (data.results && data.results.length > 0) {
            // Decode HTML entities in questions and answers
            const decodedQuestions = data.results.map((q: Question) => ({
              question: decodeHTML(q.question),
              correct_answer: decodeHTML(q.correct_answer),
              incorrect_answers: q.incorrect_answers.map(decodeHTML)
            }));
            setQuestions(decodedQuestions);
            setUsingBackup(false);
          } else {
            setQuestions(getBackupQuestions());
            setUsingBackup(true);
          }
        }
      } catch (error) {
        console.error('Error fetching questions:', error);
        setQuestions(getBackupQuestions());
        setUsingBackup(true);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
    updateTimeUntilNextQuiz();
    const interval = setInterval(updateTimeUntilNextQuiz, 60000);
    
    return () => clearInterval(interval);
  }, []);

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
        <h1>🏆 Daily Sports Quiz 🏆</h1>
        <p className="subtitle">Test your sports knowledge!</p>
        <p className="timer">{timeUntilNextQuiz}</p>
        {usingBackup && (
          <p className="backup-notice">Using backup questions due to API limit</p>
        )}
      </header>
      <main className="App-main">
        {showScore ? (
          <div className="score-section">
            <h2>Quiz Complete!</h2>
            <p>You scored {score} out of {questions.length}</p>
            <p>Percentage: {Math.round((score / questions.length) * 100)}%</p>
            <button onClick={resetQuiz}>Try Again</button>
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
