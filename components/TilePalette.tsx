import React from 'react';
import type { PaletteSelection, Level, ToolType } from '../types';
import { MirrorReverseIcon, RotatorCCWIcon, RotatorCWIcon } from './icons';
import { TELEPORTER_COLORS } from './Grid';

type EditorSubState = {
  teleporterPlacement: { pairId: number; stage: 'in' | 'out' } | null;
  selectedForceTileAction: ToolType;
}

interface TilePaletteProps {
    level: Level;
    setLevel: React.Dispatch<React.SetStateAction<Level>>;
    selection: PaletteSelection | null;
    onSelectionChange: (selection: PaletteSelection | null) => void;
    subState: EditorSubState;
    onSubStateChange: React.Dispatch<React.SetStateAction<EditorSubState>>;
}

const GRID_TILES: PaletteSelection[] = ['start', 'end', 'obstacle', 'empty'];
const ITEM_TILES: PaletteSelection[] = ['coin', 'key', 'gate'];
const PLAYER_TOOLS: ToolType[] = ['rotator-cw', 'rotator-ccw', 'mirror'];

const TILE_NAMES: { [key in PaletteSelection]: string } = {
    start: 'Ponto Inicial', end: 'Saída', obstacle: 'Obstáculo', empty: 'Borracha', 
    teleporter: 'Portal', coin: 'Moeda', key: 'Chave', gate: 'Portão', 
    'teleporter-editor': 'Colocar Portal', 'force-tile-editor': 'Colocar Piso de Ação'
};
const TOOL_NAMES: { [key in ToolType]: string } = {
    'rotator-cw': 'Rotacionador (Horário)', 'rotator-ccw': 'Rotacionador (Anti-horário)', 'mirror': 'Espelho (Reverso)'
};
const TOOL_ICONS: { [key in ToolType]: React.ReactElement } = {
    'rotator-cw': <RotatorCWIcon />, 'rotator-ccw': <RotatorCCWIcon />, 'mirror': <MirrorReverseIcon />
};

export const TilePalette: React.FC<TilePaletteProps> = ({ 
  level, setLevel, selection, onSelectionChange, subState, onSubStateChange 
}) => {

  const handleInventoryChange = (tool: ToolType, amount: number) => {
    const newAmount = Math.max(0, amount);
    setLevel(prev => ({...prev, inventory: {...prev.inventory, [tool]: newAmount }}));
  };

  const handleTeleporterClick = () => {
    if (subState.teleporterPlacement) {
        onSubStateChange(s => ({...s, teleporterPlacement: null}));
    } else {
        const nextPairId = Math.floor(level.teleporters.length / 2);
        onSelectionChange(null);
        onSubStateChange(s => ({...s, teleporterPlacement: { pairId: nextPairId, stage: 'in'}}));
    }
  }

  const renderSection = (title: string, children: React.ReactNode) => (
      <div className="pt-3 mt-3 border-t border-gray-600">
          <h4 className="font-bold mb-2 text-gray-300">{title}</h4>
          {children}
      </div>
  );

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-700">
      <h3 className="text-xl font-bold mb-4 text-cyan-300 border-b border-gray-600 pb-2">Oficina</h3>
      <input type="text" value={level.name} onChange={e => setLevel(p => ({...p, name: e.target.value}))}
        className="w-full p-2 bg-gray-700 rounded-md mb-4" placeholder="Nome do Nível" />
      
      {subState.teleporterPlacement && (
          <div className="p-3 mb-4 bg-cyan-900/50 border border-cyan-500 rounded-lg text-center">
              <p className="font-bold">Colocando Par de Portais {subState.teleporterPlacement.pairId + 1}</p>
              <p style={{color: TELEPORTER_COLORS[subState.teleporterPlacement.pairId % TELEPORTER_COLORS.length]}}>
                Clique na grade para posicionar o portal <span className="font-bold">{subState.teleporterPlacement.stage.toUpperCase()}</span>.
              </p>
          </div>
      )}

      {renderSection("Blocos da Grade", 
        <div className="grid grid-cols-2 gap-2">
            {GRID_TILES.map(type => (
                <button key={type} onClick={() => onSelectionChange(selection === type ? null : type)}
                    className={`p-2 rounded-md transition-colors ${selection === type ? 'bg-cyan-500' : 'bg-gray-700 hover:bg-gray-600'}`}>
                    {TILE_NAMES[type]}
                </button>
            ))}
        </div>
      )}
      
      {renderSection("Itens", 
        <div className="grid grid-cols-2 gap-2">
            {ITEM_TILES.map(type => (
                <button key={type} onClick={() => onSelectionChange(selection === type ? null : type)}
                    className={`p-2 rounded-md transition-colors ${selection === type ? 'bg-cyan-500' : 'bg-gray-700 hover:bg-gray-600'}`}>
                    {TILE_NAMES[type]}
                </button>
            ))}
        </div>
      )}

      {renderSection("Blocos Especiais", 
        <div className="space-y-2">
             <button onClick={handleTeleporterClick}
                className={`w-full p-2 rounded-md transition-colors ${subState.teleporterPlacement ? 'bg-red-500' : 'bg-gray-700 hover:bg-gray-600'}`}>
                {subState.teleporterPlacement ? 'Cancelar Colocação' : 'Colocar Par de Portais'}
            </button>
             <button onClick={() => onSelectionChange(selection === 'force-tile-editor' ? null : 'force-tile-editor')}
                className={`w-full p-2 rounded-md transition-colors ${selection === 'force-tile-editor' ? 'bg-cyan-500' : 'bg-gray-700 hover:bg-gray-600'}`}>
                Colocar Piso de Ação
            </button>
             {selection === 'force-tile-editor' && <div className="p-2 bg-gray-700 rounded-md">
                <label>Ação: </label>
                <select value={subState.selectedForceTileAction} 
                  onChange={e => onSubStateChange(s => ({...s, selectedForceTileAction: e.target.value as ToolType}))} 
                  className="bg-gray-600 rounded">
                    {PLAYER_TOOLS.map(tool => <option key={tool} value={tool}>{TOOL_NAMES[tool]}</option>)}
                </select>
            </div>}
        </div>
      )}

      {renderSection("Inventário do Jogador", 
        <div className="space-y-2">
            {PLAYER_TOOLS.map(tool => (
                <div key={tool} className="flex items-center justify-between">
                    <div className="flex items-center"><div className="w-6 h-6 mr-2">{TOOL_ICONS[tool]}</div><span>{TOOL_NAMES[tool]}</span></div>
                    <input type="number" min="0" value={level.inventory[tool] ?? 0} onChange={e => handleInventoryChange(tool, parseInt(e.target.value))}
                        className="w-20 p-1 bg-gray-700 rounded-md text-center" />
                </div>
            ))}
        </div>
      )}
    </div>
  );
};
