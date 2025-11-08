import type { Level, TileType, Direction } from './types';

const N = 10;

function makeGrid(): TileType[][] {
  return Array.from({ length: N }, () => Array(N).fill('empty' as TileType));
}

function place(grid: TileType[][], x: number, y: number, type: TileType) {
  grid[y][x] = type;
}

function coinsCount(grid: TileType[][]): number {
  return grid.flat().filter(t => t === 'coin').length;
}

function dir(dx: Direction['dx'], dy: Direction['dy']): Direction { return { dx, dy }; }

export function builtinLevels(): Level[] {
  const levels: Level[] = [];

  // 1) Primeiros Passos
  {
    const grid = makeGrid();
    place(grid, 1, 5, 'start');
    place(grid, 3, 5, 'obstacle');
    place(grid, 2, 7, 'coin');
    place(grid, 2, 8, 'end');
    levels.push({
      name: 'Fase 1 — Primeiros Passos',
      grid,
      startPosition: { x: 1, y: 5 },
      startDirection: dir(1, 0),
      inventory: { 'rotator-cw': 1, 'rotator-ccw': 0, 'mirror': 0 },
      teleporters: [],
      forceTiles: [],
      highScore: 0,
      totalCoins: coinsCount(grid),
    });
  }

  // 2) Curva Dupla
  {
    const grid = makeGrid();
    place(grid, 1, 1, 'start');
    place(grid, 4, 1, 'obstacle');
    place(grid, 3, 2, 'coin');
    place(grid, 5, 3, 'end');
    levels.push({
      name: 'Fase 2 — Curva Dupla',
      grid,
      startPosition: { x: 1, y: 1 },
      startDirection: dir(1, 0),
      inventory: { 'rotator-cw': 1, 'rotator-ccw': 1, 'mirror': 0 },
      teleporters: [],
      forceTiles: [],
      highScore: 0,
      totalCoins: coinsCount(grid),
    });
  }

  // 3) Espelho Retrocesso
  {
    const grid = makeGrid();
    place(grid, 2, 2, 'start');
    place(grid, 3, 2, 'coin');
    place(grid, 4, 2, 'obstacle');
    place(grid, 1, 2, 'end');
    levels.push({
      name: 'Fase 3 — Espelho Retrocesso',
      grid,
      startPosition: { x: 2, y: 2 },
      startDirection: dir(1, 0),
      inventory: { 'rotator-cw': 0, 'rotator-ccw': 0, 'mirror': 1 },
      teleporters: [],
      forceTiles: [],
      highScore: 0,
      totalCoins: coinsCount(grid),
    });
  }

  // 4) Colete as Moedas
  {
    const grid = makeGrid();
    place(grid, 1, 5, 'start');
    place(grid, 2, 5, 'coin');
    place(grid, 2, 6, 'coin');
    place(grid, 2, 7, 'coin');
    place(grid, 3, 7, 'coin');
    place(grid, 6, 5, 'obstacle');
    place(grid, 5, 7, 'end');
    levels.push({
      name: 'Fase 4 — Colete as Moedas',
      grid,
      startPosition: { x: 1, y: 5 },
      startDirection: dir(1, 0),
      inventory: { 'rotator-cw': 2, 'rotator-ccw': 0, 'mirror': 0 },
      teleporters: [],
      forceTiles: [],
      highScore: 0,
      totalCoins: coinsCount(grid),
    });
  }

  // 5) Chave e Portão
  {
    const grid = makeGrid();
    place(grid, 1, 4, 'start');
    place(grid, 3, 6, 'key');
    place(grid, 3, 5, 'coin');
    place(grid, 6, 4, 'gate');
    place(grid, 8, 4, 'end');
    levels.push({
      name: 'Fase 5 — Chave e Portão',
      grid,
      startPosition: { x: 1, y: 4 },
      startDirection: dir(1, 0),
      inventory: { 'rotator-cw': 1, 'rotator-ccw': 1, 'mirror': 0 },
      teleporters: [],
      forceTiles: [],
      highScore: 0,
      totalCoins: coinsCount(grid),
    });
  }

  // 6) Portal Direcionado
  {
    const grid = makeGrid();
    place(grid, 1, 1, 'start');
    place(grid, 4, 1, 'teleporter');
    place(grid, 7, 7, 'teleporter');
    place(grid, 9, 6, 'end');
    place(grid, 8, 6, 'coin');
    const tp0in = { id: 0, x: 4, y: 1, type: 'in' as const, exitDirection: dir(0, -1) };
    const tp0out = { id: 0, x: 7, y: 7, type: 'out' as const, exitDirection: dir(0, -1) };
    levels.push({
      name: 'Fase 6 — Portal Direcionado',
      grid,
      startPosition: { x: 1, y: 1 },
      startDirection: dir(1, 0),
      inventory: { 'rotator-cw': 1, 'rotator-ccw': 0, 'mirror': 0 },
      teleporters: [tp0in, tp0out],
      forceTiles: [],
      highScore: 0,
      totalCoins: coinsCount(grid),
    });
  }

  // 7) Pisos de Ação
  {
    const grid = makeGrid();
    place(grid, 1, 3, 'start');
    place(grid, 3, 4, 'key');
    place(grid, 3, 5, 'gate');
    place(grid, 3, 6, 'end');
    const force = [{ x: 3, y: 3, action: 'rotator-cw' as const }];
    levels.push({
      name: 'Fase 7 — Piso de Ação',
      grid,
      startPosition: { x: 1, y: 3 },
      startDirection: dir(1, 0),
      inventory: { 'rotator-cw': 0, 'rotator-ccw': 0, 'mirror': 1 },
      teleporters: [],
      forceTiles: force,
      highScore: 0,
      totalCoins: coinsCount(grid),
    });
  }

  // 8) Labirinto de Portais
  {
    const grid = makeGrid();
    place(grid, 2, 2, 'start');
    place(grid, 5, 2, 'teleporter'); // pair 0 in
    place(grid, 2, 8, 'teleporter'); // pair 0 out
    place(grid, 7, 8, 'teleporter'); // pair 1 in
    place(grid, 8, 3, 'teleporter'); // pair 1 out
    place(grid, 9, 8, 'obstacle');
    place(grid, 3, 3, 'end');
    const tp0in = { id: 0, x: 5, y: 2, type: 'in' as const, exitDirection: dir(1, 0) };
    const tp0out = { id: 0, x: 2, y: 8, type: 'out' as const, exitDirection: dir(1, 0) };
    const tp1in = { id: 1, x: 7, y: 8, type: 'in' as const, exitDirection: dir(-1, 0) };
    const tp1out = { id: 1, x: 8, y: 3, type: 'out' as const, exitDirection: dir(-1, 0) };
    levels.push({
      name: 'Fase 8 — Labirinto de Portais',
      grid,
      startPosition: { x: 2, y: 2 },
      startDirection: dir(1, 0),
      inventory: { 'rotator-cw': 1, 'rotator-ccw': 1, 'mirror': 0 },
      teleporters: [tp0in, tp0out, tp1in, tp1out],
      forceTiles: [],
      highScore: 0,
      totalCoins: coinsCount(grid),
    });
  }

  // 9) Espelhos Cruzados
  {
    const grid = makeGrid();
    place(grid, 2, 5, 'start');
    place(grid, 1, 5, 'coin');
    place(grid, 1, 6, 'coin');
    place(grid, 1, 4, 'coin');
    place(grid, 8, 5, 'end');
    levels.push({
      name: 'Fase 9 — Espelhos Cruzados',
      grid,
      startPosition: { x: 2, y: 5 },
      startDirection: dir(1, 0),
      inventory: { 'rotator-cw': 0, 'rotator-ccw': 0, 'mirror': 2 },
      teleporters: [],
      forceTiles: [],
      highScore: 0,
      totalCoins: coinsCount(grid),
    });
  }

  // 10) Desafio Final
  {
    const grid = makeGrid();
    place(grid, 1, 1, 'start');
    place(grid, 3, 1, 'teleporter');
    place(grid, 8, 8, 'teleporter');
    place(grid, 6, 8, 'gate');
    place(grid, 2, 6, 'key');
    place(grid, 1, 8, 'end');
    place(grid, 4, 6, 'coin');
    const tp0in = { id: 0, x: 3, y: 1, type: 'in' as const, exitDirection: dir(-1, 0) };
    const tp0out = { id: 0, x: 8, y: 8, type: 'out' as const, exitDirection: dir(-1, 0) };
    const force = [{ x: 5, y: 8, action: 'rotator-cw' as const }];
    levels.push({
      name: 'Fase 10 — Desafio Final',
      grid,
      startPosition: { x: 1, y: 1 },
      startDirection: dir(1, 0),
      inventory: { 'rotator-cw': 2, 'rotator-ccw': 1, 'mirror': 1 },
      teleporters: [tp0in, tp0out],
      forceTiles: force,
      highScore: 0,
      totalCoins: coinsCount(grid),
    });
  }

  // 11) Circuito Triplo
  {
    const grid = makeGrid();
    place(grid, 0, 2, 'start');
    place(grid, 3, 2, 'teleporter');
    place(grid, 6, 7, 'teleporter');
    place(grid, 2, 7, 'teleporter');
    place(grid, 7, 3, 'teleporter');
    place(grid, 9, 2, 'end');
    place(grid, 8, 2, 'coin');
    place(grid, 8, 3, 'coin');
    place(grid, 7, 2, 'obstacle');
    const tp0in = { id: 0, x: 3, y: 2, type: 'in' as const, exitDirection: dir(1, 0) };
    const tp0out = { id: 0, x: 6, y: 7, type: 'out' as const, exitDirection: dir(0, -1) };
    const tp1in = { id: 1, x: 2, y: 7, type: 'in' as const, exitDirection: dir(1, 0) };
    const tp1out = { id: 1, x: 7, y: 3, type: 'out' as const, exitDirection: dir(1, 0) };
    levels.push({
      name: 'Fase 11 — Circuito Triplo',
      grid,
      startPosition: { x: 0, y: 2 },
      startDirection: dir(1, 0),
      inventory: { 'rotator-cw': 2, 'rotator-ccw': 1, 'mirror': 1 },
      teleporters: [tp0in, tp0out, tp1in, tp1out],
      forceTiles: [],
      highScore: 0,
      totalCoins: coinsCount(grid),
    });
  }

  // 12) Duplo Portão
  {
    const grid = makeGrid();
    place(grid, 0, 5, 'start');
    place(grid, 2, 5, 'key');
    place(grid, 4, 5, 'gate');
    place(grid, 6, 5, 'gate');
    place(grid, 9, 5, 'end');
    place(grid, 8, 4, 'coin');
    place(grid, 8, 6, 'coin');
    levels.push({
      name: 'Fase 12 — Duplo Portão',
      grid,
      startPosition: { x: 0, y: 5 },
      startDirection: dir(1, 0),
      inventory: { 'rotator-cw': 2, 'rotator-ccw': 2, 'mirror': 1 },
      teleporters: [],
      forceTiles: [{ x: 5, y: 5, action: 'rotator-ccw' }],
      highScore: 0,
      totalCoins: coinsCount(grid),
    });
  }

  // 13) Carrossel de Força
  {
    const grid = makeGrid();
    place(grid, 1, 1, 'start');
    place(grid, 8, 8, 'end');
    place(grid, 2, 2, 'coin');
    place(grid, 2, 7, 'coin');
    place(grid, 7, 2, 'coin');
    const force = [
      { x: 4, y: 4, action: 'rotator-cw' as const },
      { x: 5, y: 4, action: 'rotator-ccw' as const },
      { x: 5, y: 5, action: 'mirror' as const },
      { x: 4, y: 5, action: 'rotator-cw' as const },
    ];
    levels.push({
      name: 'Fase 13 — Carrossel de Força',
      grid,
      startPosition: { x: 1, y: 1 },
      startDirection: dir(1, 0),
      inventory: { 'rotator-cw': 3, 'rotator-ccw': 2, 'mirror': 2 },
      teleporters: [],
      forceTiles: force,
      highScore: 0,
      totalCoins: coinsCount(grid),
    });
  }

  // 14) Espelhos X
  {
    const grid = makeGrid();
    place(grid, 2, 5, 'start');
    place(grid, 7, 5, 'end');
    place(grid, 3, 4, 'coin');
    place(grid, 3, 6, 'coin');
    place(grid, 6, 4, 'coin');
    place(grid, 6, 6, 'coin');
    levels.push({
      name: 'Fase 14 — Espelhos X',
      grid,
      startPosition: { x: 2, y: 5 },
      startDirection: dir(1, 0),
      inventory: { 'rotator-cw': 0, 'rotator-ccw': 0, 'mirror': 4 },
      teleporters: [],
      forceTiles: [],
      highScore: 0,
      totalCoins: coinsCount(grid),
    });
  }

  // 15) Troca de Portais
  {
    const grid = makeGrid();
    place(grid, 1, 2, 'start');
    place(grid, 4, 2, 'teleporter');
    place(grid, 8, 2, 'teleporter');
    place(grid, 8, 7, 'end');
    place(grid, 7, 7, 'gate');
    place(grid, 6, 7, 'key');
    const tp0in = { id: 0, x: 4, y: 2, type: 'in' as const, exitDirection: dir(0, 1) };
    const tp0out = { id: 0, x: 8, y: 2, type: 'out' as const, exitDirection: dir(1, 0) };
    levels.push({
      name: 'Fase 15 — Troca de Portais',
      grid,
      startPosition: { x: 1, y: 2 },
      startDirection: dir(1, 0),
      inventory: { 'rotator-cw': 2, 'rotator-ccw': 1, 'mirror': 1 },
      teleporters: [tp0in, tp0out],
      forceTiles: [],
      highScore: 0,
      totalCoins: coinsCount(grid),
    });
  }

  // 16) Labirinto Obstinado
  {
    const grid = makeGrid();
    place(grid, 0, 0, 'start');
    place(grid, 9, 9, 'end');
    // paredes
    for (let i = 1; i < 9; i++) place(grid, 5, i, 'obstacle');
    place(grid, 5, 0, 'obstacle');
    place(grid, 4, 8, 'coin');
    place(grid, 6, 1, 'coin');
    levels.push({
      name: 'Fase 16 — Labirinto Obstinado',
      grid,
      startPosition: { x: 0, y: 0 },
      startDirection: dir(1, 0),
      inventory: { 'rotator-cw': 3, 'rotator-ccw': 3, 'mirror': 2 },
      teleporters: [],
      forceTiles: [],
      highScore: 0,
      totalCoins: coinsCount(grid),
    });
  }

  // 17) Chave do Labirinto
  {
    const grid = makeGrid();
    place(grid, 2, 2, 'start');
    place(grid, 7, 7, 'end');
    place(grid, 5, 5, 'gate');
    place(grid, 3, 5, 'key');
    place(grid, 6, 6, 'coin');
    levels.push({
      name: 'Fase 17 — Chave do Labirinto',
      grid,
      startPosition: { x: 2, y: 2 },
      startDirection: dir(1, 0),
      inventory: { 'rotator-cw': 2, 'rotator-ccw': 2, 'mirror': 1 },
      teleporters: [],
      forceTiles: [{ x: 4, y: 4, action: 'rotator-cw' }],
      highScore: 0,
      totalCoins: coinsCount(grid),
    });
  }

  // 18) Quatro Portais
  {
    const grid = makeGrid();
    place(grid, 1, 1, 'start');
    place(grid, 3, 1, 'teleporter');
    place(grid, 3, 8, 'teleporter');
    place(grid, 7, 1, 'teleporter');
    place(grid, 7, 8, 'teleporter');
    place(grid, 9, 9, 'end');
    place(grid, 8, 9, 'coin');
    const tp0in = { id: 0, x: 3, y: 1, type: 'in' as const, exitDirection: dir(0, 1) };
    const tp0out = { id: 0, x: 3, y: 8, type: 'out' as const, exitDirection: dir(1, 0) };
    const tp1in = { id: 1, x: 7, y: 1, type: 'in' as const, exitDirection: dir(0, 1) };
    const tp1out = { id: 1, x: 7, y: 8, type: 'out' as const, exitDirection: dir(1, 0) };
    levels.push({
      name: 'Fase 18 — Quatro Portais',
      grid,
      startPosition: { x: 1, y: 1 },
      startDirection: dir(1, 0),
      inventory: { 'rotator-cw': 3, 'rotator-ccw': 2, 'mirror': 1 },
      teleporters: [tp0in, tp0out, tp1in, tp1out],
      forceTiles: [],
      highScore: 0,
      totalCoins: coinsCount(grid),
    });
  }

  // 19) Coletas em Zigue-Zague
  {
    const grid = makeGrid();
    place(grid, 0, 4, 'start');
    place(grid, 9, 4, 'end');
    for (let i = 1; i < 9; i += 2) place(grid, i, 3, 'coin');
    for (let i = 2; i < 9; i += 2) place(grid, i, 5, 'coin');
    levels.push({
      name: 'Fase 19 — Coletas em Zigue-Zague',
      grid,
      startPosition: { x: 0, y: 4 },
      startDirection: dir(1, 0),
      inventory: { 'rotator-cw': 3, 'rotator-ccw': 3, 'mirror': 2 },
      teleporters: [],
      forceTiles: [],
      highScore: 0,
      totalCoins: coinsCount(grid),
    });
  }

  // 20) Mestre da Oficina
  {
    const grid = makeGrid();
    place(grid, 1, 1, 'start');
    place(grid, 8, 8, 'end');
    place(grid, 4, 4, 'gate');
    place(grid, 2, 4, 'key');
    place(grid, 6, 6, 'coin');
    place(grid, 7, 6, 'coin');
    place(grid, 3, 1, 'teleporter');
    place(grid, 6, 2, 'teleporter');
    const tp0in = { id: 0, x: 3, y: 1, type: 'in' as const, exitDirection: dir(1, 0) };
    const tp0out = { id: 0, x: 6, y: 2, type: 'out' as const, exitDirection: dir(0, 1) };
    const force = [
      { x: 5, y: 5, action: 'rotator-ccw' as const },
      { x: 7, y: 7, action: 'mirror' as const }
    ];
    levels.push({
      name: 'Fase 20 — Mestre da Oficina',
      grid,
      startPosition: { x: 1, y: 1 },
      startDirection: dir(1, 0),
      inventory: { 'rotator-cw': 3, 'rotator-ccw': 2, 'mirror': 2 },
      teleporters: [tp0in, tp0out],
      forceTiles: force,
      highScore: 0,
      totalCoins: coinsCount(grid),
    });
  }

  return levels.map(l => ({ ...l, origin: 'builtin', createdBy: 'Equipe' }));
}