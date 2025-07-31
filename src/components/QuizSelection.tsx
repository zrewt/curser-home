import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Difficulty } from '../types';

type Sport = 'basketball' | 'football' | 'baseball' | 'hockey' | 'soccer' | 'all';

interface QuizSelectionProps {
  onStartQuiz: (difficulty: Difficulty, sport: Sport, count: number) => void;
  onDailyQuiz: () => void;
  loading: boolean;
}

const QuizSelection: React.FC<QuizSelectionProps> = ({ onStartQuiz, onDailyQuiz, loading }) => {
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | null>(null);
  const [selectedSport, setSelectedSport] = useState<Sport | null>(null);
  const [numQuestions, setNumQuestions] = useState<number | null>(null);
  const navigate = useNavigate();

  const handleStartQuiz = () => {
    if (selectedDifficulty && selectedSport && numQuestions) {
      onStartQuiz(selectedDifficulty, selectedSport, numQuestions);
      navigate('/quiz');
    }
  };

  const handleDailyQuiz = () => {
    onDailyQuiz();
    navigate('/quiz');
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }}>
        <button onClick={handleDailyQuiz} disabled={loading} className="daily-quiz-btn">
          Daily Quiz (5 Medium Sports Questions)
        </button>
      </div>
      
      {/* Quick Access Links */}
      <div style={{ margin: '2rem 0', textAlign: 'center' }}>
        <h3>Quick Access</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center', marginTop: '1rem' }}>
          <Link to="/easy-basketball" className="quick-link">Easy Basketball</Link>
          <Link to="/medium-basketball" className="quick-link">Medium Basketball</Link>
          <Link to="/hard-basketball" className="quick-link">Hard Basketball</Link>
          <Link to="/easy-football" className="quick-link">Easy Football</Link>
          <Link to="/medium-football" className="quick-link">Medium Football</Link>
          <Link to="/hard-football" className="quick-link">Hard Football</Link>
          <Link to="/easy-soccer" className="quick-link">Easy Soccer</Link>
          <Link to="/medium-soccer" className="quick-link">Medium Soccer</Link>
          <Link to="/hard-soccer" className="quick-link">Hard Soccer</Link>
          <Link to="/easy-baseball" className="quick-link">Easy Baseball</Link>
          <Link to="/medium-baseball" className="quick-link">Medium Baseball</Link>
          <Link to="/hard-baseball" className="quick-link">Hard Baseball</Link>
          <Link to="/easy-hockey" className="quick-link">Easy Hockey</Link>
          <Link to="/medium-hockey" className="quick-link">Medium Hockey</Link>
          <Link to="/hard-hockey" className="quick-link">Hard Hockey</Link>
          <Link to="/easy-all" className="quick-link">Easy All Sports</Link>
          <Link to="/medium-all" className="quick-link">Medium All Sports</Link>
          <Link to="/hard-all" className="quick-link">Hard All Sports</Link>
        </div>
      </div>
      
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
                style={{ 
                  padding: '1rem 2rem', 
                  fontSize: '1.1rem', 
                  borderRadius: '8px', 
                  border: numQuestions === n ? '3px solid #1877f2' : '2px solid #e2e8f0', 
                  background: numQuestions === n ? '#e7f3ff' : '#f0f2f5', 
                  fontWeight: 600, 
                  cursor: 'pointer' 
                }}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
        
        {selectedDifficulty && selectedSport && numQuestions && (
          <button
            className="start-quiz-button"
            onClick={handleStartQuiz}
          >
            Start Quiz
          </button>
        )}
      </div>
    </div>
  );
};

export default QuizSelection; 