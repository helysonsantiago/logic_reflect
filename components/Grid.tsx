import React from 'react';
import type { CollectorState, PlacedTool, TileType, ToolType, Level, SimulationState } from '../types';
import { CollectorIcon, MirrorReverseIcon, RotatorCCWIcon, RotatorCWIcon, TeleporterIcon, CoinIcon, KeyIcon, GateIcon } from './icons';

interface GridProps {
  level: Level;
  placedTools: PlacedTool[];
  collector: CollectorState;
  simulationState: SimulationState;
  onTileClick: (x: number, y: number) => void;
  gameStatus: 'SETUP' | 'RUNNING' | 'WIN' | 'FAIL' | 'ALL_LEVELS_COMPLETE';
}

const tileStyles: { [key in TileType]: string } = {
  empty: 'bg-gray-700/50 hover:bg-gray-600/50',
  obstacle: 'bg-gray-900',
  start: 'bg-green-500/20 border-2 border-green-500',
  end: 'bg-red-500/20 border-2 border-red-500',
  teleporter: 'bg-purple-900/50',
  coin: 'bg-gray-700/50 hover:bg-gray-600/50',
  key: 'bg-gray-700/50 hover:bg-gray-600/50',
  gate: 'bg-gray-700/50 hover:bg-gray-600/50',
};

const toolComponents: { [key in ToolType]: React.ReactElement } = {
  'rotator-cw': <RotatorCWIcon />,
  'rotator-ccw': <RotatorCCWIcon />,
  'mirror': <MirrorReverseIcon />,
};

export const TELEPORTER_COLORS = ['#ff4f79', '#ffcb4f', '#4f8bff', '#4fffb1', '#af4fff', '#ff9f4f'];

export const Grid: React.FC<GridProps> = ({ level, placedTools, collector, simulationState, onTileClick, gameStatus }) => {
  const { grid, forceTiles, teleporters } = level;
  const gridSize = grid.length;

  return (
    <div
      className="relative bg-gray-800 border-2 border-gray-600 p-2 rounded-lg grid gap-1 shadow-2xl"
      style={{
        gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
        aspectRatio: '1 / 1',
      }}
    >
      {grid.map((row, y) =>
        row.map((tile, x) => {
          const placedTool = placedTools.find(tool => tool.x === x && tool.y === y);
          const isClickable = gameStatus === 'SETUP';
          const teleporter = teleporters.find(t => t.x === x && t.y === y);
          const isCollected = simulationState.collectedItems.has(`${x},${y}`);

          // Render special tiles unless they have been collected
          let specialTileIcon: React.ReactElement | null = null;
          if (!isCollected) {
              if (tile === 'coin') specialTileIcon = <CoinIcon />;
              if (tile === 'key') specialTileIcon = <KeyIcon />;
          }
          if (tile === 'gate') specialTileIcon = <GateIcon hasKey={simulationState.hasKey} />;


          return (
            <div
              key={`${x}-${y}`}
              onClick={() => isClickable && onTileClick(x, y)}
              className={`aspect-square flex items-center justify-center rounded-md transition-colors duration-200 ${tileStyles[tile]} ${isClickable ? 'cursor-pointer' : ''}`}
            >
              {placedTool && (
                <div className="w-full h-full p-2 flex items-center justify-center">
                  {toolComponents[placedTool.type]}
                </div>
              )}
              {teleporter && <TeleporterIcon color={TELEPORTER_COLORS[teleporter.id % TELEPORTER_COLORS.length]} />}
              {specialTileIcon && <div className="w-full h-full p-1.5">{specialTileIcon}</div>}
            </div>
          );
        })
      )}
      
      {forceTiles.map((tile, index) => (
        <div
          key={`force-${index}`}
          className="absolute top-2 left-2 flex items-center justify-center pointer-events-none p-1"
           style={{
            width: `calc((100% - 1rem - ${gridSize - 1} * 0.25rem) / ${gridSize})`,
            height: `calc((100% - 1rem - ${gridSize - 1} * 0.25rem) / ${gridSize})`,
            transform: `translateX(calc(${tile.x} * (100% + 0.25rem))) translateY(calc(${tile.y} * (100% + 0.25rem)))`,
          }}
        >
          <div className="w-full h-full opacity-30">
            {toolComponents[tile.action]}
          </div>
        </div>
      ))}

      {collector.visible && (
        <div
          className={`absolute top-2 left-2 transition-transform duration-200 ease-linear p-1`}
          style={{
            width: `calc((100% - 1rem - ${gridSize - 1} * 0.25rem) / ${gridSize})`,
            height: `calc((100% - 1rem - ${gridSize - 1} * 0.25rem) / ${gridSize})`,
            transform: `translateX(calc(${collector.x} * (100% + 0.25rem))) translateY(calc(${collector.y} * (100% + 0.25rem)))`,
          }}
        >
          <div className={`${collector.isTeleporting ? 'animate-teleport' : ''} w-full h-full`}>
            <CollectorIcon direction={collector.direction} />
          </div>
        </div>
      )}
    </div>
  );
};