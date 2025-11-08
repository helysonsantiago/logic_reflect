import React, { useEffect } from 'react';

interface ConfirmEffectProps {
  visible: boolean;
  onDone?: () => void;
  size?: number; // radius multiplier
}

export const ConfirmEffect: React.FC<ConfirmEffectProps> = ({ visible, onDone, size = 1 }) => {
  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(() => onDone && onDone(), 480);
    return () => clearTimeout(t);
  }, [visible, onDone]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[70] pointer-events-none">
      <div className="arcade-burst" style={{ position: 'absolute', inset: 0 }}>
        {Array.from({ length: 24 }).map((_, i) => {
          const angle = (i / 24) * Math.PI * 2;
          const radius = (80 + Math.random() * 40) * size;
          const dx = Math.cos(angle) * radius;
          const dy = Math.sin(angle) * radius;
          return <span key={i} className="particle" style={{ ['--dx' as any]: dx, ['--dy' as any]: dy }} />
        })}
      </div>
    </div>
  );
};