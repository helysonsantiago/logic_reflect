import React, { useEffect, useMemo, useState } from 'react';

interface InitialsModalProps {
  open: boolean;
  score: number;
  onSave: (initials: string) => void;
  onCancel: () => void;
}

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export const InitialsModal: React.FC<InitialsModalProps> = ({ open, score, onSave, onCancel }) => {
  const [letters, setLetters] = useState<number[]>([0, 0, 0]);
  const [active, setActive] = useState<number>(0);
  const [animKey, setAnimKey] = useState<number>(0);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (!open) return;
      if (['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Enter','Escape'].includes(e.key)) e.preventDefault();
      switch (e.key) {
        case 'ArrowLeft': setActive((i) => Math.max(0, i - 1)); break;
        case 'ArrowRight': setActive((i) => Math.min(2, i + 1)); break;
        case 'ArrowUp': setLetters((ls) => { const copy = [...ls]; copy[active] = (copy[active] + 1) % ALPHABET.length; setAnimKey(k=>k+1); return copy; }); break;
        case 'ArrowDown': setLetters((ls) => { const copy = [...ls]; copy[active] = (copy[active] - 1 + ALPHABET.length) % ALPHABET.length; setAnimKey(k=>k+1); return copy; }); break;
        case 'Enter': onSave(letters.map(i => ALPHABET[i]).join('')); break;
        case 'Escape': onCancel(); break;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, active, letters, onSave, onCancel]);

  const initials = useMemo(() => letters.map(i => ALPHABET[i]).join(''), [letters]);

  if (!open) return null;

  return (
    <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-[60]">
      <div className="bg-gray-900 rounded-2xl border-4 border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.6)] p-6 w-[90%] max-w-xl">
        <h2 className="text-center text-3xl font-extrabold text-purple-300 arcade-flicker">RANKING</h2>
        <p className="text-center text-gray-300 mt-1">Seu Score: <span className="text-yellow-300 font-mono">{score}</span></p>

        <div className="mt-6 grid grid-cols-3 gap-4">
          {letters.map((val, idx) => (
            <div key={`col-${idx}`} className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 ${active === idx ? 'border-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.6)]' : 'border-gray-700'}`}>
              <button onClick={() => { setActive(idx); setLetters(ls => { const c=[...ls]; c[idx] = (c[idx] + 1) % ALPHABET.length; setAnimKey(k=>k+1); return c; }); }}
                className="text-sm px-3 py-1 rounded bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-200">↑</button>
              <div className={`mt-2 mb-2 h-20 w-20 flex items-center justify-center text-5xl font-extrabold text-white selector-glow letter-cycle-${animKey}`}>
                {ALPHABET[val]}
              </div>
              <button onClick={() => { setActive(idx); setLetters(ls => { const c=[...ls]; c[idx] = (c[idx] - 1 + ALPHABET.length) % ALPHABET.length; setAnimKey(k=>k+1); return c; }); }}
                className="text-sm px-3 py-1 rounded bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-200">↓</button>
            </div>
          ))}
        </div>

        <div className="mt-6 flex items-center justify-center gap-3">
          <button onClick={() => setActive(i => Math.max(0, i - 1))} className="px-4 py-2 rounded bg-gray-800 text-gray-200 border border-gray-700 hover:bg-gray-700">←</button>
          <button onClick={() => setActive(i => Math.min(2, i + 1))} className="px-4 py-2 rounded bg-gray-800 text-gray-200 border border-gray-700 hover:bg-gray-700">→</button>
          <button onClick={() => onSave(initials)} className="px-6 py-2 rounded bg-purple-500 hover:bg-purple-400 text-white font-semibold">Confirmar</button>
          <button onClick={onCancel} className="px-6 py-2 rounded bg-gray-700 hover:bg-gray-600 text-gray-100">Cancelar</button>
        </div>

        <p className="text-center text-xs text-gray-400 mt-3">Use ← → ↑ ↓ e Enter para escolher suas iniciais</p>
      </div>
    </div>
  );
};