import React from 'react';

export const CollectorIcon: React.FC<{ direction: { dx: number; dy: number } }> = ({ direction }) => {
  const getRotation = () => {
    if (direction.dx === 1 && direction.dy === 0) return 0; // Right
    if (direction.dx === -1 && direction.dy === 0) return 180; // Left
    if (direction.dx === 0 && direction.dy === 1) return 90; // Down
    if (direction.dx === 0 && direction.dy === -1) return -90; // Up
    return 0;
  };

  // FIX: Added 180deg to correct the backward-facing SVG
  const rotation = getRotation() + 180;

  return (
    <svg
      viewBox="0 0 24 24"
      className="w-full h-full text-cyan-400 fill-current transition-transform duration-200"
      style={{ transform: `rotate(${rotation}deg)` }}
    >
      <path d="M3 12l18-9v18l-18-9z" />
    </svg>
  );
};

export const MirrorReverseIcon = () => (
    <svg viewBox="0 0 24 24" className="w-4/5 h-4/5 text-indigo-400 fill-current">
        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 14H7V7h10v10z" />
    </svg>
);

export const RotatorCWIcon = () => (
    <svg viewBox="0 0 24 24" className="w-4/5 h-4/5 text-purple-400 fill-current">
        <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" />
    </svg>
);

export const RotatorCCWIcon = () => (
     <svg viewBox="0 0 24 24" className="w-4/5 h-4/5 text-purple-400 fill-current" style={{transform: 'scaleX(-1)'}}>
        <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" />
    </svg>
);

export const TeleporterIcon: React.FC<{color: string}> = ({color}) => (
    <div className="w-full h-full flex items-center justify-center">
        <div className="w-3/4 h-3/4 rounded-full" style={{
            backgroundColor: color,
            border: '3px solid white',
            boxShadow: `0 0 10px ${color}, 0 0 5px ${color} inset`
        }}></div>
    </div>
);

export const DirectionIcon: React.FC<{ direction: 'up' | 'down' | 'left' | 'right' }> = ({ direction }) => {
    const rotations = {
        up: '-90deg',
        down: '90deg',
        left: '180deg',
        right: '0deg'
    };
    return (
        <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current" style={{ transform: `rotate(${rotations[direction]})`}}>
            <path d="M10 17l5-5-5-5v10z"></path>
        </svg>
    )
};

// NEW ICONS
export const CoinIcon = () => (
    <svg viewBox="0 0 24 24" className="w-full h-full text-yellow-400 fill-current animate-spin-y">
        <circle cx="12" cy="12" r="8" stroke="white" strokeWidth="1.5" />
        <text x="12" y="16" fontSize="12" fill="white" textAnchor="middle" fontWeight="bold">C</text>
    </svg>
);

export const KeyIcon = () => (
    <svg viewBox="0 0 24 24" className="w-full h-full text-orange-400 fill-current -rotate-45">
        <path d="M12.7,8.2c-0.4-0.4-1-0.4-1.4,0L7.5,12c-2.2,2.2-2.2,5.8,0,8c2.2,2.2,5.8,2.2,8,0c2.2-2.2,2.2-5.8,0-8L12.7,8.2z M14.1,18.6 c-1.4,1.4-3.7,1.4-5.1,0c-1.4-1.4-1.4-3.7,0-5.1l3.5-3.5l5.1,5.1L14.1,18.6z"/>
        <path d="M17.4,3.2c-0.4-0.4-1-0.4-1.4,0l-1.8,1.8l2.8,2.8l1.8-1.8c0.4-0.4,0.4-1,0-1.4L17.4,3.2z"/>
    </svg>
);

export const GateIcon: React.FC<{ hasKey: boolean }> = ({ hasKey }) => (
    <svg viewBox="0 0 24 24" className={`w-full h-full fill-current transition-colors duration-300 ${hasKey ? 'text-gray-500' : 'text-red-700'}`}>
        <path d="M18,6h-2V4c0-1.1-0.9-2-2-2h-4C8.9,2,8,2.9,8,4v2H6C4.9,6,4,6.9,4,8v12c0,1.1,0.9,2,2,2h12c1.1,0,2-0.9,2-2V8 C20,6.9,19.1,6,18,6z M10,4h4v2h-4V4z M12,15c-0.8,0-1.5-0.7-1.5-1.5S11.2,12,12,12s1.5,0.7,1.5,1.5S12.8,15,12,15z"/>
    </svg>
);