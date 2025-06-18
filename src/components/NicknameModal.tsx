import React, { useState } from 'react';

interface NicknameModalProps {
  onSubmit: (nickname: string) => void;
  isOpen: boolean;
}

const NicknameModal: React.FC<NicknameModalProps> = ({ onSubmit, isOpen }) => {
  const [nickname, setNickname] = useState('');

  if (!isOpen) return null;

  return (
    <div className="modal-overlay nickname-modal">
      <div className="modal-box">
        <h2>Choose a Nickname</h2>
        <input
          type="text"
          value={nickname}
          onChange={e => setNickname(e.target.value)}
          placeholder="Enter nickname"
        />
        <button
          onClick={() => { if (nickname.trim()) onSubmit(nickname.trim()); }}
        >
          Save
        </button>
      </div>
    </div>
  );
};

export default NicknameModal; 