import React from 'react';
import type { Level } from '../types';

type RatingsSummary = Record<number, { average: number; count: number }>;

interface CommunityBrowserProps {
  levels: Level[];
  ratingsSummary: RatingsSummary;
  onPlay: (level: Level) => void;
  onRate: (level: Level, stars: number) => void;
}

export const CommunityBrowser: React.FC<CommunityBrowserProps> = ({ levels, ratingsSummary, onPlay, onRate }) => {

  const renderStars = (level: Level) => {
    const id = level.id || 0;
    const summary = ratingsSummary[id] || { average: 0, count: 0 };
    const stars = [1, 2, 3, 4, 5];
    return (
      <div className="flex items-center gap-2">
        <div className="flex">
          {stars.map(s => (
            <button
              key={s}
              title={`${s} estrela${s > 1 ? 's' : ''}`}
              onClick={() => level.id && onRate(level, s)}
              className="text-yellow-400 hover:text-yellow-300"
            >{s <= Math.round(summary.average) ? '★' : '☆'}</button>
          ))}
        </div>
        <span className="text-xs text-gray-400">{summary.average.toFixed(1)} ({summary.count})</span>
      </div>
    );
  };

  return (
    <div className="w-full max-w-3xl mx-auto mt-8">
      <h2 className="text-3xl text-center font-bold text-gray-300 mb-6">Fases da Comunidade</h2>
      {/* Nome não é necessário aqui; a avaliação usa identificação salva na Oficina */}
      {levels.length === 0 ? (
        <p className="text-center text-gray-500">Nenhuma fase da comunidade publicada ainda. Seja o primeiro!</p>
      ) : (
        <div className="space-y-4">
          {levels.map(level => (
            <div key={(level.id ?? level.name)} className="bg-gray-800 p-4 rounded-lg flex items-center justify-between border border-gray-700">
              <div>
                <div className="font-semibold text-lg text-gray-100">{level.name}</div>
                {(level.totalCoins || 0) > 0 && (
                  <p className="text-yellow-400 font-mono text-sm">🪙 {level.totalCoins}</p>
                )}
                <p className="text-xs text-gray-400">Criado por: {level.createdBy || 'Anônimo'}</p>
                {level.id && renderStars(level)}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => onPlay(level)}
                  className="px-3 py-2 rounded bg-indigo-600 hover:bg-indigo-700 text-white text-sm"
                >Jogar</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};