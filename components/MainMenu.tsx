import React from 'react';

interface MainMenuProps {
  onOficina: () => void;
  onFases: () => void;
  onHistoria: () => void;
  onRanking: () => void;
  totalCoins: number;
}

export const MainMenu: React.FC<MainMenuProps> = ({ onOficina, onFases, onHistoria, onRanking, totalCoins }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl sm:text-4xl font-extrabold text-center">
        <span className="text-purple-400 drop-shadow-[0_0_6px_rgba(168,85,247,0.6)]">Menu</span>
        <span className="ml-2 text-indigo-400 drop-shadow-[0_0_6px_rgba(99,102,241,0.6)]">Principal</span>
      </h2>

      <div className="flex items-center justify-center">
        <div className="px-4 py-2 bg-gray-800 rounded-lg border border-gray-700 text-sm text-gray-300">
          Moedas Totais: <span className="text-yellow-300 font-mono">{totalCoins}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button onClick={onOficina} className="group px-6 py-6 bg-gray-800 hover:bg-purple-700 rounded-xl border border-gray-700 hover:border-purple-500 transition shadow-lg">
          <div className="text-left">
            <div className="text-lg font-bold text-white">Oficina</div>
            <div className="text-xs text-gray-300">Crie e edite suas fases</div>
          </div>
          <div className="mt-4 h-1 w-full bg-gray-700 overflow-hidden rounded">
            <div className="h-full bg-purple-500 group-hover:w-full w-1/3 transition-all"></div>
          </div>
        </button>

        <button onClick={onFases} className="group px-6 py-6 bg-gray-800 hover:bg-indigo-700 rounded-xl border border-gray-700 hover:border-indigo-500 transition shadow-lg">
          <div className="text-left">
            <div className="text-lg font-bold text-white">Níveis Salvos</div>
            <div className="text-xs text-gray-300">Jogue e gerencie suas fases</div>
          </div>
          <div className="mt-4 h-1 w-full bg-gray-700 overflow-hidden rounded">
            <div className="h-full bg-indigo-500 group-hover:w-full w-1/3 transition-all"></div>
          </div>
        </button>

        <button onClick={onHistoria} className="group px-6 py-6 bg-gray-800 hover:bg-amber-700 rounded-xl border border-gray-700 hover:border-amber-500 transition shadow-lg">
          <div className="text-left">
            <div className="text-lg font-bold text-white">História</div>
            <div className="text-xs text-gray-300">Reviva a narrativa do jogo</div>
          </div>
          <div className="mt-4 h-1 w-full bg-gray-700 overflow-hidden rounded">
            <div className="h-full bg-amber-500 group-hover:w-full w-1/3 transition-all"></div>
          </div>
        </button>

        <button onClick={onRanking} className="group px-6 py-6 bg-gray-800 hover:bg-pink-700 rounded-xl border border-gray-700 hover:border-pink-500 transition shadow-lg sm:col-span-3">
          <div className="text-center">
            <div className="text-lg font-bold text-white">Ranking</div>
            <div className="text-xs text-gray-300">Top 10 com iniciais </div>
          </div>
          <div className="mt-4 h-1 w-full bg-gray-700 overflow-hidden rounded">
            <div className="h-full bg-pink-500 group-hover:w-full w-1/3 transition-all"></div>
          </div>
        </button>
      </div>
    </div>
  );
};