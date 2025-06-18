import React, { useState } from 'react';

interface LeaderboardEntry {
  nickname: string;
  score: number;
  difficulty: string;
}

interface LeaderboardModalProps {
  isOpen: boolean;
  leaderboard: LeaderboardEntry[];
  onClose: () => void;
}

const LeaderboardModal: React.FC<LeaderboardModalProps> = ({ isOpen, leaderboard, onClose }) => {
  const [activeTab, setActiveTab] = useState<'easy' | 'medium' | 'hard'>('easy');

  if (!isOpen) return null;

  // Filter leaderboard by active difficulty
  const filteredLeaderboard = leaderboard.filter(entry => entry.difficulty === activeTab);

  return (
    <div className="modal-overlay leaderboard-modal">
      <div className="modal-box">
        <h2>Leaderboard</h2>
        
        {/* Difficulty Tabs */}
        <div className="difficulty-tabs">
          <button 
            className={`tab-button ${activeTab === 'easy' ? 'active' : ''}`}
            onClick={() => setActiveTab('easy')}
          >
            Easy
          </button>
          <button 
            className={`tab-button ${activeTab === 'medium' ? 'active' : ''}`}
            onClick={() => setActiveTab('medium')}
          >
            Medium
          </button>
          <button 
            className={`tab-button ${activeTab === 'hard' ? 'active' : ''}`}
            onClick={() => setActiveTab('hard')}
          >
            Hard
          </button>
        </div>

        <ol>
          {filteredLeaderboard.length === 0 ? (
            <li>No entries yet for {activeTab} difficulty.</li>
          ) : (
            filteredLeaderboard.map((entry, idx) => (
              <li key={idx}>
                <div className="entry-info">
                  <span className="nickname">{entry.nickname}</span>
                </div>
                <span className="score">{entry.score}</span>
              </li>
            ))
          )}
        </ol>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default LeaderboardModal;