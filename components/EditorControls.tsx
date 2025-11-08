import React from 'react';

interface EditorControlsProps {
  onTestLevel: () => void;
  onClearGrid: () => void;
  onSaveLevel: () => void;
}

export const EditorControls: React.FC<EditorControlsProps> = ({ onTestLevel, onClearGrid, onSaveLevel }) => {
  return (
    <div className="flex flex-col items-center justify-center space-y-4 p-4 bg-gray-800 rounded-lg border border-gray-700">
       <button
        onClick={onSaveLevel}
        className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-500"
      >
        Salvar Nível
      </button>
      <button
        onClick={onTestLevel}
        className="px-6 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-500"
      >
        Testar Nível
      </button>
      <button
        onClick={onClearGrid}
        className="px-6 py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-500"
      >
        Limpar Grade
      </button>
    </div>
  );
};
