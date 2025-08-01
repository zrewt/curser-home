import React from 'react';

interface NavbarProps {
  error: string | null;
  selectedDifficulty: string | null;
  selectedSport: string | null;
  isInQuiz: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ error, selectedDifficulty, selectedSport, isInQuiz }) => {
  const handleLogoClick = () => {
    // Reset the quiz state by refreshing the page
    window.location.href = '/';
  };

  return (
    <header className="App-header">
      <div className="logo-container">
        <h1 
          style={{ 
            fontWeight: 'bold', 
            fontSize: '3.5em',
            cursor: 'pointer',
            userSelect: 'none'
          }}
          onClick={handleLogoClick}
          title="Click to go back to home"
        >
          ScoreTrivia
        </h1>
      </div>
      <p className="subtitle" style={{ fontSize: '1.7em', marginTop: '-0.5em', marginBottom: '1em' }}>Unlimited Sports Quizzes</p>
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
  );
};

export default Navbar; 