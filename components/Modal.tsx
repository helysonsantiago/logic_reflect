
import React from 'react';
import type { GameStatus } from '../types';

interface ModalProps {
  status: GameStatus;
  onNextLevel: () => void;
  onReset: () => void;
  // Extra controls for test mode (editor play)
  isTestMode?: boolean;
  onSaveLevel?: () => void;
  onGoToEditor?: () => void;
}

export const Modal: React.FC<ModalProps> = ({ status, onNextLevel, onReset, isTestMode, onSaveLevel, onGoToEditor }) => {
  if (status !== 'WIN' && status !== 'FAIL' && status !== 'ALL_LEVELS_COMPLETE') {
    return null;
  }

  const messages = {
    WIN: { title: 'Sucesso!', text: 'Sua lógica está impecável.', buttonText: 'Próximo Nível', handler: onNextLevel },
    FAIL: { title: 'Colisão!', text: 'Reveja sua estratégia.', buttonText: 'Tentar Novamente', handler: onReset },
    ALL_LEVELS_COMPLETE: { title: 'Parabéns!', text: 'Você dominou o Logic Reflect!', buttonText: 'Jogar Novamente', handler: onReset }
  } as const;

  const currentMessage = status === 'ALL_LEVELS_COMPLETE' ? messages.ALL_LEVELS_COMPLETE : messages[status];
  const isWin = status === 'WIN' || status === 'ALL_LEVELS_COMPLETE';
  const showTestSave = status === 'WIN' && isTestMode && onSaveLevel;
  
  return (
    <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className={`bg-gray-800 rounded-lg shadow-xl p-8 border-2 ${isWin ? 'border-cyan-400' : 'border-red-500'}`}>
        <h2 className={`text-4xl font-bold mb-4 text-center ${isWin ? 'text-cyan-400' : 'text-red-500'}`}>{currentMessage.title}</h2>
        <p className="text-gray-300 text-lg mb-8 text-center">{currentMessage.text}</p>
        {showTestSave ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={onSaveLevel}
              className="w-full py-3 px-6 rounded-lg font-semibold text-lg transition-all duration-200 bg-green-500 hover:bg-green-400 text-gray-900"
            >
              Salvar Nível
            </button>
            <button
              onClick={onGoToEditor}
              className="w-full py-3 px-6 rounded-lg font-semibold text-lg transition-all duration-200 bg-purple-500 hover:bg-purple-400 text-white"
            >
              Editar
            </button>
          </div>
        ) : (
          <button
            onClick={currentMessage.handler}
            className={`w-full py-3 px-6 rounded-lg font-semibold text-lg transition-all duration-200 ${isWin ? 'bg-cyan-500 hover:bg-cyan-400 text-gray-900' : 'bg-red-600 hover:bg-red-500 text-white'}`}
          >
            {currentMessage.buttonText}
          </button>
        )}
      </div>
    </div>
  );
};
