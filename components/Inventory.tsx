import React from 'react';
import type { Inventory as InventoryType, PlacedTool, ToolType } from '../types';
import { MirrorReverseIcon, RotatorCCWIcon, RotatorCWIcon } from './icons';

interface InventoryProps {
  inventory: InventoryType;
  placedTools: PlacedTool[];
  selectedTool: ToolType | null;
  onSelectTool: (tool: ToolType | null) => void;
  gameStatus: 'SETUP' | 'RUNNING' | 'WIN' | 'FAIL' | 'ALL_LEVELS_COMPLETE';
}

const toolIcons: { [key in ToolType]: React.ReactElement } = {
  'rotator-cw': <RotatorCWIcon />,
  'rotator-ccw': <RotatorCCWIcon />,
  'mirror': <MirrorReverseIcon />,
};

const toolNames: { [key in ToolType]: string } = {
  'rotator-cw': 'Rotacionador (Horário)',
  'rotator-ccw': 'Rotacionador (Anti-horário)',
  'mirror': 'Espelho (Reverso)',
};

export const Inventory: React.FC<InventoryProps> = ({ inventory, placedTools, selectedTool, onSelectTool, gameStatus }) => {
  const getUsedCount = (toolType: ToolType) => placedTools.filter(tool => tool.type === toolType).length;
  const isDisabled = gameStatus !== 'SETUP';

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-700">
      <h3 className="text-xl font-bold mb-4 text-cyan-300 border-b border-gray-600 pb-2">Ferramentas Disponíveis</h3>
      <div className="space-y-3">
        {(Object.keys(inventory) as ToolType[]).map((toolType) => {
          const total = inventory[toolType];
          if (total === 0) return null;
          const used = getUsedCount(toolType);
          const remaining = total - used;
          const isSelected = selectedTool === toolType;

          return (
            <button
              key={toolType}
              onClick={() => onSelectTool(isSelected ? null : toolType)}
              disabled={isDisabled || remaining <= 0}
              className={`w-full flex items-center p-3 rounded-md transition-all duration-200 border-2 ${
                isSelected
                  ? 'bg-cyan-500/30 border-cyan-400'
                  : 'bg-gray-700/50 border-transparent hover:border-cyan-500'
              } ${
                (isDisabled || remaining <= 0) && !isSelected ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <div className="w-8 h-8 mr-4 flex-shrink-0 flex items-center justify-center">{toolIcons[toolType]}</div>
              <div className="flex-grow text-left">
                <p className="font-semibold">{toolNames[toolType]}</p>
              </div>
              <div className="text-lg font-mono bg-gray-900/50 rounded px-3 py-1">
                <span className={remaining > 0 ? 'text-white' : 'text-gray-500'}>{remaining}</span>
                <span className="text-gray-500">/{total}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
