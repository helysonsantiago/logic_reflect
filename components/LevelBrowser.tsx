import React from 'react';
import type { Level } from '../types';

interface LevelBrowserProps {
    levels: Level[];
    onPlay: (level: Level) => void;
}

export const LevelBrowser: React.FC<LevelBrowserProps> = ({ levels, onPlay }) => {
    return (
        <div className="w-full max-w-2xl mx-auto mt-8">
            <h2 className="text-3xl text-center font-bold text-gray-300 mb-6">Fases da Oficina</h2>
            {levels.length === 0 ? (
                <p className="text-center text-gray-500">Você ainda não salvou nenhum nível. Vá para a Oficina para criar um!</p>
            ) : (
                <div className="space-y-4">
                    {levels.map((level, idx) => {
                        const locked = idx > 0 && !levels[idx - 1]?.completedAt; // destrava quando anterior foi completada
                        return (
                          <div key={level.name} className="bg-gray-800 p-4 rounded-lg flex items-center justify-between border border-gray-700">
                              <div>
                                  <span className="font-semibold text-lg text-gray-100">{level.name}</span>
                                  {(level.totalCoins || 0) > 0 && (
                                      <p className="text-yellow-400 font-mono text-sm">
                                          🪙 {level.highScore || 0} / {level.totalCoins}
                                      </p>
                                  )}
                                  <p className="text-xs text-gray-400">Criado por: {level.createdBy || (level.origin === 'builtin' ? 'Equipe' : 'Desconhecido')}</p>
                                  {locked && <p className="text-xs text-gray-400">⚠️ Complete o nível anterior para destravar</p>}
                              </div>
                              <div className="flex gap-3">
                                  <button
                                      onClick={() => !locked && onPlay(level)}
                                      disabled={locked}
                                      className={`px-3 py-2 rounded bg-indigo-600 hover:bg-indigo-700 text-white text-sm ${locked ? 'opacity-50 cursor-not-allowed' : ''}`}
                                  >Jogar</button>
                              </div>
                          </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}