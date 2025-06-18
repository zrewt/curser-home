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
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
    }}>
      <div style={{ background: 'white', padding: 32, borderRadius: 8, minWidth: 300 }}>
        <h2>Leaderboard</h2>
        <ol>
          {leaderboard.length === 0 ? (
            <li>No entries yet.</li>
          ) : (
            leaderboard.map((entry, idx) => (
              <li key={idx}>
                {entry.nickname}: {entry.score}
              </li>
            ))
          )}
        </ol>
        <button onClick={onClose} style={{ width: '100%', padding: 8, marginTop: 16 }}>Close</button>
      </div>
    </div>
  );
};

export default LeaderboardModal; 