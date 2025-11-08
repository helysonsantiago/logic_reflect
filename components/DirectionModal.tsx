import React from 'react';
import type { Direction } from '../types';
import { DirectionIcon } from './icons';

interface DirectionModalProps {
    prompt: string;
    onSelectDirection: (direction: Direction) => void;
}

const DIRECTIONS: { name: 'up'|'down'|'left'|'right'; vec: Direction }[] = [
    { name: 'up', vec: { dx: 0, dy: -1 } }, { name: 'down', vec: { dx: 0, dy: 1 } },
    { name: 'left', vec: { dx: -1, dy: 0 } }, { name: 'right', vec: { dx: 1, dy: 0 } },
];

export const DirectionModal: React.FC<DirectionModalProps> = ({ prompt, onSelectDirection }) => {
    return (
        <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg shadow-xl p-8 border-2 border-cyan-400">
                <h3 className="text-2xl font-bold mb-6 text-center text-cyan-300">{prompt}</h3>
                <div className="grid grid-cols-2 gap-4">
                    {DIRECTIONS.map(({ name, vec }) => (
                        <button
                            key={name}
                            onClick={() => onSelectDirection(vec)}
                            className="flex items-center justify-center p-4 rounded-md transition-colors bg-gray-700 hover:bg-cyan-600"
                        >
                            <DirectionIcon direction={name} />
                            <span className="ml-3 capitalize text-lg font-semibold">{name}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};
