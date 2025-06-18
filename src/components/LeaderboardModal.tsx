import React from 'react';

interface LeaderboardEntry {
  nickname: string;
  score: number;
}

interface LeaderboardModalProps {
  isOpen: boolean;
  leaderboard: LeaderboardEntry[];
  onClose: () => void;
}

const LeaderboardModal: React.FC<LeaderboardModalProps> = ({ isOpen, leaderboard, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay leaderboard-modal">
      <div className="modal-box">
        <h2>Leaderboard</h2>
        <ol>
          {leaderboard.length === 0 ? (
            <li>No entries yet.</li>
          ) : (
            leaderboard.map((entry, idx) => (
              <li key={idx}>
    <span className="nickname">{entry.nickname}</span>
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