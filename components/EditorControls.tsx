import React from 'react';

interface EditorControlsProps {
  authorName: string;
  onAuthorNameChange: (name: string) => void;
  onTestLevel: () => void;
  onClearGrid: () => void;
  onPublishLevel: () => void;
}

export const EditorControls: React.FC<EditorControlsProps> = ({ authorName, onAuthorNameChange, onTestLevel, onClearGrid, onPublishLevel }) => {
  return (
    <div className="flex flex-col items-center justify-center space-y-4 p-4 bg-gray-800 rounded-lg border border-gray-700">
      <label className="w-full max-w-sm flex items-center gap-2 bg-gray-900 p-2 rounded border border-gray-700">
        <span className="text-xs text-gray-300">Seu nome</span>
        <input
          type="text"
          value={authorName}
          onChange={(e) => { onAuthorNameChange(e.target.value); try { localStorage.setItem('logicReflectAuthor', e.target.value); } catch {} }}
          placeholder="para publicar fases"
          className="flex-1 px-2 py-1 rounded bg-gray-700 text-white text-sm outline-none"
        />
      </label>
      <button
        onClick={onPublishLevel}
        className="px-6 py-3 bg-cyan-600 text-white font-bold rounded-lg hover:bg-cyan-500"
      >
        Publicar na Comunidade
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
