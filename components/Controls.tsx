import React from 'react';
import type { GameStatus } from '../types';

interface ControlsProps {
  status: GameStatus;
  onPlay: () => void;
  onReset: () => void;
  canPlay: boolean;
  isPlayingCustom: boolean;
}

export const Controls: React.FC<ControlsProps> = ({ status, onPlay, onReset, canPlay, isPlayingCustom }) => {
  const isSetup = status === 'SETUP';
  const isRunning = status === 'RUNNING';

  return (
    <div className="flex items-center justify-center space-x-4 p-4 bg-gray-800 rounded-lg border border-gray-700">
      {isSetup && (
        <button
          onClick={onPlay}
          disabled={!canPlay}
          className="px-8 py-3 bg-green-600 text-white font-bold text-lg rounded-lg shadow-md hover:bg-green-500 transition-all duration-200 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:shadow-none"
        >
          {isPlayingCustom ? 'Jogar' : 'Testar Novamente'}
        </button>
      )}
      <button
        onClick={onReset}
        disabled={isRunning}
        className="px-8 py-3 bg-yellow-600 text-white font-bold text-lg rounded-lg shadow-md hover:bg-yellow-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-wait"
      >
        Reiniciar
      </button>
    </div>
  );
};
