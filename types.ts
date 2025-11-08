export type Direction = { dx: -1 | 0 | 1; dy: -1 | 0 | 1 };

export type TileType = 'empty' | 'obstacle' | 'start' | 'end' | 'teleporter' | 'coin' | 'key' | 'gate';

export type ToolType = 'rotator-cw' | 'rotator-ccw' | 'mirror';

export type PlacedTool = {
  x: number;
  y: number;
  type: ToolType;
};

export type Grid = TileType[][];

export type Inventory = { [key in ToolType]: number };

export type Teleporter = {
    id: number;
    x: number;
    y: number;
    type: 'in' | 'out';
    exitDirection: Direction;
}

export type Level = {
  id?: number; // optional id from server for community levels
  name: string;
  grid: Grid;
  startPosition: { x: number; y: number };
  startDirection: Direction;
  inventory: Inventory;
  teleporters: Teleporter[];
  forceTiles: { x: number; y: number; action: ToolType }[];
  highScore?: number;
  totalCoins?: number;
  completedAt?: number; // timestamp when level was first completed
  origin?: 'builtin' | 'user' | 'community';
  createdBy?: string; // e.g., 'Equipe' or player name
};

export type CollectorState = {
  x: number;
  y: number;
  direction: Direction;
  visible: boolean;
  isTeleporting?: boolean;
};

// State for a single simulation run
export type SimulationState = {
    collectedCoins: number;
    hasKey: boolean;
    // Keep track of collected item coordinates to make them disappear
    collectedItems: Set<string>; // "x,y"
}

export type GameStatus = 'SETUP' | 'RUNNING' | 'WIN' | 'FAIL' | 'ALL_LEVELS_COMPLETE';

export type AppView = 'MENU' | 'EDITOR' | 'LEVEL_BROWSER' | 'COMMUNITY_BROWSER' | 'PLAY';

export type PaletteSelection = TileType | 'teleporter-editor' | 'force-tile-editor' | 'coin' | 'key' | 'gate';

// New: Ranking entry for arcade-style initials
export type RankingEntry = {
  initials: string; // 3 letters
  score: number;    // e.g., collected coins
  level?: string;   // optional level name
  at: number;       // timestamp
};

// Community ratings for levels stored on the server
export type CommunityRating = {
  id?: number;
  levelId: number;   // id of the community level
  user: string;      // display name
  stars: number;     // 1..5
  at: number;        // timestamp
};