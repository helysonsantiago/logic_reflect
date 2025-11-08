import React from 'react';

interface StoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StoryModal: React.FC<StoryModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg shadow-xl p-8 border-2 border-purple-400 max-w-2xl w-full">
        <h2 className="text-3xl font-bold mb-4 text-center text-purple-300">História do Jogo</h2>
        <div className="space-y-4 text-gray-200">
          <p>
            Em Logic Reflect, você guia um <strong>Coletor</strong> por uma oficina futurista repleta de obstáculos,
            moedas e portais. Utilizando ferramentas lógicas como <em>espelhos</em> e <em>rotacionadores</em>,
            você planeja o caminho e testa sua estratégia para chegar ao objetivo.
          </p>
          <p>
            Problema do mundo real: muitas pessoas têm dificuldades em desenvolver <strong>raciocínio lógico</strong>
            e <strong>pensamento algorítmico</strong>, essenciais para matemática e programação. Nosso jogo
            funciona como uma ferramenta educativa que estimula a análise, a antecipação de resultados e
            a resolução de problemas de forma visual e interativa.
          </p>
          <p>
            Como o jogo ajuda: cada ferramenta representa uma transformação de direção ou estado
            (como condicionais com <em>chave/portão</em> e mapeamentos com <em>teleportes</em>). Ao planejar e
            observar a simulação, o jogador pratica conceitos de lógica, planejamento e depuração.
          </p>
          <ul className="list-disc pl-5 text-sm text-gray-300">
            <li>Espelho: inverte a direção do movimento (simetria/reflexão).</li>
            <li>Rotacionadores: mudam a direção em 90° (transformações geométricas).</li>
            <li>Teleporte: mapeia entrada/saída com direção definida (função de mapeamento).</li>
            <li>Chave/Portão: libera passagem condicional (conceito de condição/estado).</li>
          </ul>
        </div>
        <button
          onClick={onClose}
          className="mt-6 w-full py-3 px-6 rounded-lg font-semibold text-lg bg-purple-500 hover:bg-purple-400 text-gray-900"
        >
          Fechar
        </button>
      </div>
    </div>
  );
};