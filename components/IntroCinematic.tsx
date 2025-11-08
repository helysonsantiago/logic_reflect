import React, { useEffect, useState } from 'react';
import { CollectorIcon, MirrorReverseIcon, RotatorCWIcon, RotatorCCWIcon, TeleporterIcon, CoinIcon, KeyIcon, GateIcon } from './icons';

interface IntroCinematicProps {
  isOpen: boolean;
  onClose: () => void;
}

const SCENES = [
  {
    title: 'Oficina Lógica',
    text: 'Um Coletor desperta no tabuleiro…',
    render: () => (
      <div className="grid grid-cols-5 gap-2">
        <div className="w-12 h-12 bg-gray-800 rounded border border-gray-700 flex items-center justify-center"><CollectorIcon direction={{ dx: 1, dy: 0 }} /></div>
        <div className="w-12 h-12 bg-gray-800 rounded border border-gray-700 flex items-center justify-center"><CoinIcon /></div>
        <div className="w-12 h-12 bg-gray-800 rounded border border-gray-700 flex items-center justify-center"><MirrorReverseIcon /></div>
        <div className="w-12 h-12 bg-gray-800 rounded border border-gray-700 flex items-center justify-center"><RotatorCWIcon /></div>
        <div className="w-12 h-12 bg-gray-800 rounded border border-gray-700 flex items-center justify-center"><TeleporterIcon color="#7dd3fc" /></div>
      </div>
    )
  },
  {
    title: 'Objetivo',
    text: 'Colete moedas e alcance a saída.',
    render: () => (
      <div className="grid grid-cols-5 gap-2">
        <div className="w-12 h-12 bg-gray-800 rounded border border-gray-700 flex items-center justify-center"><CoinIcon /></div>
        <div className="w-12 h-12 bg-gray-800 rounded border border-gray-700 flex items-center justify-center"><CoinIcon /></div>
        <div className="w-12 h-12 bg-gray-800 rounded border border-gray-700 flex items-center justify-center"><KeyIcon /></div>
        <div className="w-12 h-12 bg-gray-800 rounded border border-gray-700 flex items-center justify-center"><GateIcon hasKey={false} /></div>
        <div className="w-12 h-12 bg-gray-800 rounded border border-gray-700 flex items-center justify-center"><GateIcon hasKey={true} /></div>
      </div>
    )
  },
  {
    title: 'Ferramentas',
    text: 'Espelhos e rotacionadores mudam a direção do Coletor.',
    render: () => (
      <div className="grid grid-cols-5 gap-2">
        <div className="w-12 h-12 bg-gray-800 rounded border border-gray-700 flex items-center justify-center"><MirrorReverseIcon /></div>
        <div className="w-12 h-12 bg-gray-800 rounded border border-gray-700 flex items-center justify-center"><RotatorCWIcon /></div>
        <div className="w-12 h-12 bg-gray-800 rounded border border-gray-700 flex items-center justify-center"><RotatorCCWIcon /></div>
        <div className="w-12 h-12 bg-gray-800 rounded border border-gray-700 flex items-center justify-center animate-teleport"><TeleporterIcon color="#c084fc" /></div>
        <div className="w-12 h-12 bg-gray-800 rounded border border-gray-700 flex items-center justify-center"><CollectorIcon direction={{ dx: 0, dy: 1 }} /></div>
      </div>
    )
  },
  {
    title: 'Planejamento',
    text: 'Portões exigem chave. Pense antes de executar.',
    render: () => (
      <div className="grid grid-cols-5 gap-2">
        <div className="w-12 h-12 bg-gray-800 rounded border border-gray-700 flex items-center justify-center"><KeyIcon /></div>
        <div className="w-12 h-12 bg-gray-800 rounded border border-gray-700 flex items-center justify-center"><GateIcon hasKey={false} /></div>
        <div className="w-12 h-12 bg-gray-800 rounded border border-gray-700 flex items-center justify-center"><GateIcon hasKey={true} /></div>
        <div className="w-12 h-12 bg-gray-800 rounded border border-gray-700 flex items-center justify-center"><MirrorReverseIcon /></div>
        <div className="w-12 h-12 bg-gray-800 rounded border border-gray-700 flex items-center justify-center"><RotatorCWIcon /></div>
      </div>
    )
  },
  {
    title: 'Pronto?',
    text: 'Comece sua jornada lógica! Boa sorte.',
    render: () => (
      <div className="flex items-center justify-center">
        <div className="px-6 py-3 bg-purple-600/30 text-purple-200 rounded border border-purple-500">PRESSIONE ENTER</div>
      </div>
    )
  }
];

export const IntroCinematic: React.FC<IntroCinematicProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(0);
  const advance = () => setStep(prev => {
    const lastIndex = SCENES.length - 1;
    const penultimate = SCENES.length - 2;
    if (prev < penultimate) return prev + 1;
    // No segundo‑último passo, finalizar sem exigir novo clique
    onClose();
    return prev;
  });

  // Reseta apenas quando abre
  useEffect(() => {
    if (!isOpen) return;
    setStep(0);
  }, [isOpen]);

  // Teclas para avançar/pular, sem resetar step
  useEffect(() => {
    if (!isOpen) return;
    const keyHandler = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        advance();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', keyHandler);
    return () => window.removeEventListener('keydown', keyHandler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const scene = SCENES[step];
  const progress = ((step + 1) / SCENES.length) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-900 to-black" />
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: 'radial-gradient(circle at 20% 20%, rgba(99,102,241,0.2) 0, transparent 40%), radial-gradient(circle at 80% 80%, rgba(168,85,247,0.2) 0, transparent 40%)'
      }} />

      <div className="relative w-full max-w-3xl mx-auto bg-gray-900/90 border border-purple-600 rounded-xl shadow-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl sm:text-2xl font-bold tracking-wide text-purple-300">{scene.title}</h3>
          <div className="w-40 h-2 bg-gray-700 rounded overflow-hidden">
            <div className="h-full bg-purple-500" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          <div className="flex items-center justify-center">
            <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
              {scene.render()}
            </div>
          </div>
          <div className="flex items-center">
            <p className="text-gray-200 text-lg">{scene.text}</p>
          </div>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <button onClick={advance} className="flex-1 py-3 px-6 rounded-lg font-bold bg-purple-600 hover:bg-purple-500 text-white transition-colors">
            Avançar
          </button>
          <button onClick={onClose} className="flex-1 py-3 px-6 rounded-lg font-bold bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 transition-colors">
            Pular
          </button>
        </div>

        <div className="mt-4 text-xs text-gray-400 text-center">Pressione Espaço/Enter para avançar • Esc para pular</div>
      </div>
    </div>
  );
};