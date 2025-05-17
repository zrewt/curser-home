import React, { useState, useEffect } from 'react';
import './App.css';

interface Question {
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
}

// Backup questions focused on soccer, baseball, basketball, and football
const backupQuestions: Question[] = [
  // Soccer Questions
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
    question: "How many players are on a soccer team?",
    correct_answer: "11",
    incorrect_answers: ["10", "12", "9"]
  },
  {
    question: "Which team has won the most UEFA Champions League titles?",
    correct_answer: "Real Madrid",
    incorrect_answers: ["Barcelona", "Bayern Munich", "AC Milan"]
  },
  // Basketball Questions
  {
    question: "Who won the NBA Championship in 2023?",
    correct_answer: "Denver Nuggets",
    incorrect_answers: ["Los Angeles Lakers", "Boston Celtics", "Miami Heat"]
  },
  {
    question: "How many points is a three-pointer worth in basketball?",
    correct_answer: "3",
    incorrect_answers: ["2", "4", "1"]
  },
  {
    question: "Which team does LeBron James play for?",
    correct_answer: "Los Angeles Lakers",
    incorrect_answers: ["Boston Celtics", "Miami Heat", "Cleveland Cavaliers"]
  },
  // Baseball Questions
  {
    question: "How many innings are in a standard baseball game?",
    correct_answer: "9",
    incorrect_answers: ["7", "8", "10"]
  },
  {
    question: "Which team won the World Series in 2023?",
    correct_answer: "Texas Rangers",
    incorrect_answers: ["Arizona Diamondbacks", "Houston Astros", "New York Yankees"]
  },
  {
    question: "How many players are on a baseball field at once?",
    correct_answer: "9",
    incorrect_answers: ["10", "8", "11"]
  },
  // Football Questions
  {
    question: "Which team won the Super Bowl in 2024?",
    correct_answer: "Kansas City Chiefs",
    incorrect_answers: ["San Francisco 49ers", "Baltimore Ravens", "Detroit Lions"]
  },
  {
    question: "How many points is a touchdown worth in football?",
    correct_answer: "6",
    incorrect_answers: ["7", "5", "4"]
  },
  {
    question: "Which team does Patrick Mahomes play for?",
    correct_answer: "Kansas City Chiefs",
    incorrect_answers: ["San Francisco 49ers", "Baltimore Ravens", "Detroit Lions"]
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
          setQuestions(getBackupQuestions());
          setUsingBackup(true);
        } else {
          const data = await response.json();
          if (data.results && data.results.length > 0) {
            // Filter for only soccer, baseball, basketball, and football questions
            const filteredQuestions = data.results.filter((q: Question) => {
              const questionText = q.question.toLowerCase();
              return questionText.includes('soccer') || 
                     questionText.includes('football') || 
                     questionText.includes('baseball') || 
                     questionText.includes('basketball') ||
                     questionText.includes('nba') ||
                     questionText.includes('mlb') ||
                     questionText.includes('nfl');
            });

            if (filteredQuestions.length >= 3) {
              const decodedQuestions = filteredQuestions.slice(0, 3).map((q: Question) => ({
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
        <p className="subtitle">Test your knowledge of Soccer, Baseball, Basketball, and Football!</p>
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

