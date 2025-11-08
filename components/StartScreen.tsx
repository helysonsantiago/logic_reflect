import React, { useEffect } from 'react';

interface StartScreenProps {
  isOpen: boolean;
  onStart: () => void;
  onSkipMenu: () => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({ isOpen, onStart, onSkipMenu }) => {
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        onStart();
      } else if (e.key === 'Escape') {
        onSkipMenu();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onStart, onSkipMenu]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900" />
      {/* Scanlines overlay */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.08) 1px, rgba(0,0,0,0) 1px)',
          backgroundSize: '100% 4px',
        }}
      />
      {/* Vignette */}
      <div className="absolute inset-0 bg-black/30" />

      <div className="relative h-full w-full flex flex-col items-center justify-center text-center p-6">
        <div className="animate-pulse mb-4 text-sm text-gray-400 tracking-widest">Logic Reflect v1.0</div>
        <h1 className="text-5xl sm:text-6xl font-extrabold tracking-wider">
          <span className="text-purple-400 drop-shadow-[0_0_6px_rgba(168,85,247,0.6)]">LOGIC</span>
          <span className="text-indigo-400 ml-3 drop-shadow-[0_0_6px_rgba(99,102,241,0.6)]">REFLECT</span>
        </h1>

        <div className="mt-8 text-gray-300 max-w-xl">
          <p className="text-lg">Quebra-cabeça tático. Planeje. Execute. Vença.</p>
          <p className="text-sm mt-2 text-gray-400">Use espelhos, rotacionadores e portais para guiar o Coletor.</p>
        </div>

        <div className="mt-10 flex flex-col items-center gap-3">
          <button
            onClick={onStart}
            className="px-10 py-4 bg-purple-600 hover:bg-purple-500 rounded-lg text-white font-bold text-lg shadow-[0_0_12px_rgba(168,85,247,0.35)] transition"
          >
            Pressione Enter para Iniciar
          </button>
          <button
            onClick={onSkipMenu}
            className="px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-200 font-semibold border border-gray-700"
          >
            Pular Intro e Ir ao Menu
          </button>
        </div>

        <div className="mt-12 grid grid-cols-3 gap-6 text-xs text-gray-400">
          <div className="px-4 py-2 bg-gray-800/60 rounded border border-gray-700">Tecla Enter: Iniciar</div>
          <div className="px-4 py-2 bg-gray-800/60 rounded border border-gray-700">Tecla Esc: Menu</div>
          <div className="px-4 py-2 bg-gray-800/60 rounded border border-gray-700">PT-BR • Retro HUD</div>
        </div>
      </div>
    </div>
  );
};