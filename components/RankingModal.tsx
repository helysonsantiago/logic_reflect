import React from 'react';
import type { RankingEntry } from '../types';

interface RankingModalProps {
  open: boolean;
  entries: RankingEntry[];
  onClose: () => void;
}

export const RankingModal: React.FC<RankingModalProps> = ({ open, entries, onClose }) => {
  if (!open) return null;

  const sorted = [...entries].sort((a,b) => b.score - a.score).slice(0, 10);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black bg-opacity-60" onClick={onClose} />
      <div className="relative w-full max-w-md sm:max-w-xl mx-4 p-6 sm:p-8 rounded-2xl border border-pink-500 bg-gray-900/90 shadow-2xl">
        <h3 className="text-center text-2xl sm:text-3xl font-extrabold text-pink-400 arcade-flicker">RANKING</h3>
        <p className="mt-1 text-center text-xs sm:text-sm text-gray-300">Top 10 </p>

        <div className="mt-6 divide-y divide-gray-800">
          {sorted.length === 0 && (
            <div className="py-8 text-center text-gray-400">Nenhuma pontuação salva ainda</div>
          )}
          {sorted.map((e, i) => (
            <div key={`${e.initials}-${e.at}`} className={`flex items-center justify-between py-3 ${i === 0 ? 'bg-gray-800/40 rounded-lg' : ''}`}>
              <div className="flex items-center gap-3">
                <div className={`w-8 text-center font-mono ${i === 0 ? 'text-yellow-300' : 'text-gray-400'}`}>{String(i + 1).padStart(2, '0')}</div>
                <div className={`text-xl font-bold tracking-widest ${i === 0 ? 'text-yellow-200 selector-glow' : 'text-white'}`}>{e.initials.toUpperCase()}</div>
              </div>
              <div className="text-right">
                <div className={`text-lg font-mono ${i === 0 ? 'text-yellow-200' : 'text-indigo-200'}`}>{e.score}</div>
                {e.level && <div className="text-[10px] sm:text-xs text-gray-400">{e.level}</div>}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-center">
          <button onClick={onClose} className="px-6 py-2 rounded-lg bg-pink-600 hover:bg-pink-700 text-white font-semibold shadow">Fechar</button>
        </div>
      </div>
    </div>
  );
};