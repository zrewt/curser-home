import React from 'react';

interface NavbarProps {
  error: string | null;
  selectedDifficulty: string | null;
  selectedSport: string | null;
  isInQuiz: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ error, selectedDifficulty, selectedSport, isInQuiz }) => {
  return (
    <header className="App-header">
      <h1 style={{ fontWeight: 'bold', fontSize: '2.5em' }}>scoretrivia</h1>
      <p className="subtitle" style={{ fontSize: '1.3em', marginTop: '-0.5em', marginBottom: '1em' }}>sports quiz</p>
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