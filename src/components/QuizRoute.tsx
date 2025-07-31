import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Difficulty } from '../types';

type Sport = 'basketball' | 'football' | 'baseball' | 'hockey' | 'soccer' | 'all';

interface QuizRouteProps {
  onStartQuiz: (difficulty: Difficulty, sport: Sport, count: number) => void;
  onDailyQuiz: () => void;
  loading: boolean;
}

const QuizRoute: React.FC<QuizRouteProps> = ({ onStartQuiz, onDailyQuiz, loading }) => {
  const { difficulty, sport } = useParams<{ difficulty: string; sport: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    if (difficulty && sport && !loading) {
      const validDifficulties: Difficulty[] = ['easy', 'medium', 'hard'];
      const validSports: Sport[] = ['basketball', 'football', 'baseball', 'hockey', 'soccer', 'all'];
      
      if (validDifficulties.includes(difficulty as Difficulty) && validSports.includes(sport as Sport)) {
        onStartQuiz(difficulty as Difficulty, sport as Sport, 10); // Default to 10 questions
        navigate('/quiz');
      } else {
        // Invalid route, redirect to home
        navigate('/');
      }
    }
  }, [difficulty, sport, loading, onStartQuiz, navigate]);

  return (
    <div className="loading">
      <div className="loading-spinner"></div>
      <p>Loading quiz...</p>
    </div>
  );
};

export default QuizRoute; 