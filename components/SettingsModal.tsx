import React, { useEffect, useState } from 'react';

type SettingsModalProps = {
  open: boolean;
  onClose: () => void;
};

export const SettingsModal: React.FC<SettingsModalProps> = ({ open, onClose }) => {
  const [isMuted, setIsMuted] = useState<boolean>(() => {
    try { return localStorage.getItem('logicReflectMusicMuted') === 'true'; } catch { return false; }
  });
  const [volume, setVolume] = useState<number>(() => {
    try { const v = parseFloat(localStorage.getItem('logicReflectMusicVolume') || '0.5'); return isNaN(v) ? 0.5 : Math.min(1, Math.max(0, v)); } catch { return 0.5; }
  });

  useEffect(() => {
    const detail = { isMuted, volume };
    document.dispatchEvent(new CustomEvent('logicReflect:music:config', { detail }));
  }, [isMuted, volume]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="bg-gray-800 w-full max-w-md rounded-lg shadow-lg border border-gray-700 p-4">
        <h3 className="text-xl font-bold text-cyan-300 mb-3">Configurações</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-gray-200">Som</span>
            <button onClick={() => setIsMuted(m => !m)} className={`px-3 py-1 rounded ${isMuted ? 'bg-red-600 hover:bg-red-500' : 'bg-gray-700 hover:bg-gray-600'} text-white text-sm`}>{isMuted ? 'Mutado' : 'Ativo'}</button>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-200">Volume</span>
            <input type="range" min={0} max={1} step={0.01} value={volume} onChange={e => setVolume(parseFloat(e.target.value))} className="w-40" />
          </div>
        </div>
        <div className="mt-4 text-right">
          <button onClick={onClose} className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded">Fechar</button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;