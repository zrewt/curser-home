import React, { useState } from 'react';

interface NicknameModalProps {
  onSubmit: (nickname: string) => void;
  isOpen: boolean;
}

const NicknameModal: React.FC<NicknameModalProps> = ({ onSubmit, isOpen }) => {
  const [nickname, setNickname] = useState('');

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
    }}>
      <div style={{ background: 'white', padding: 32, borderRadius: 8, minWidth: 300 }}>
        <h2>Choose a Nickname</h2>
        <input
          type="text"
          value={nickname}
          onChange={e => setNickname(e.target.value)}
          placeholder="Enter nickname"
          style={{ width: '100%', padding: 8, marginBottom: 16 }}
        />
        <button
          onClick={() => { if (nickname.trim()) onSubmit(nickname.trim()); }}
          style={{ width: '100%', padding: 8 }}
        >
          Save
        </button>
      </div>
    </div>
  );
};

export default NicknameModal; 