import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Question } from '../types';

interface QuizTakingProps {
  questions: Question[];
  currentQuestion: number;
  score: number;
  showScore: boolean;
  selectedAnswer: string | null;
  shuffledAnswers: string[];
  timer: number;
  selectedDifficulty: string | null;
  selectedSport: string | null;
  isDailyQuiz: boolean;
  onAnswerClick: (answer: string) => void;
  onResetQuiz: () => void;
  onCopyResults: () => void;
}

const QuizTaking: React.FC<QuizTakingProps> = ({
  questions,
  currentQuestion,
  score,
  showScore,
  selectedAnswer,
  shuffledAnswers,
  timer,
  selectedDifficulty,
  selectedSport,
  isDailyQuiz,
  onAnswerClick,
  onResetQuiz,
  onCopyResults
}) => {
  const navigate = useNavigate();

  const handleResetQuiz = () => {
    onResetQuiz();
    navigate('/');
  };

  if (showScore) {
    return (
      <div className="score-section">
        <h2>Quiz Complete!</h2>
        <p>You scored {score} out of {questions.length}</p>
        <p className="score-percentage">
          {Math.round((score / questions.length) * 100)}%
        </p>
        <div className="score-buttons">
          <button onClick={handleResetQuiz}>Try Another Quiz</button>
          <button onClick={onCopyResults} className="share-button">
            Copy Results 📋
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {isDailyQuiz && <h2 className="daily-quiz-heading">Daily Quiz</h2>}
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
              onClick={() => onAnswerClick(answer)}
              className="answer-button"
              disabled={selectedAnswer !== null}
            >
              {answer}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuizTaking; 