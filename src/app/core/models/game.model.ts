export type GameId = 'snake' | 'tetris' | 'breakout' | 'invaders' | '2048' | 'memory';

export type GameState = 'idle' | 'playing' | 'paused' | 'game-over';

export interface GameInfo {
  id: GameId;
  name: string;
  description: string;
  icon: string;
  route: string;
  controls: string;
}

export interface HighScore {
  score: number;
  date: string;
  level?: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  gameId: GameId | 'global';
  unlocked: boolean;
  unlockedDate?: string;
  condition: (ctx: AchievementContext) => boolean;
}

export interface AchievementContext {
  gameId: GameId;
  score: number;
  level?: number;
  linesCleared?: number;
  snakeLength?: number;
  pairs?: number;
  moves?: number;
  maxTile?: number;
  totalGamesPlayed: number;
  perfectGame?: boolean;
  noLivesLost?: boolean;
}

export interface PlayStats {
  gamesPlayed: number;
  totalPlayTime: number;
  highestScore: number;
  lastPlayed?: string;
}

export const GAMES: GameInfo[] = [
  {
    id: 'snake',
    name: 'Snake',
    description: 'Eat food, grow longer, avoid walls',
    icon: 'S',
    route: '/snake',
    controls: 'Arrow keys / D-pad',
  },
  {
    id: 'tetris',
    name: 'Tetris',
    description: 'Clear lines with falling blocks',
    icon: 'T',
    route: '/tetris',
    controls: 'Arrows + Up to rotate',
  },
  {
    id: 'breakout',
    name: 'Breakout',
    description: 'Destroy bricks with paddle and ball',
    icon: 'B',
    route: '/breakout',
    controls: 'Mouse / touch slider',
  },
  {
    id: 'invaders',
    name: 'Invaders',
    description: 'Shoot the descending alien fleet',
    icon: 'I',
    route: '/invaders',
    controls: 'Left/Right + Fire',
  },
  {
    id: '2048',
    name: '2048',
    description: 'Slide and merge tiles to 2048',
    icon: '2',
    route: '/2048',
    controls: 'Arrow keys / swipe',
  },
  {
    id: 'memory',
    name: 'Memory',
    description: 'Find all matching pairs of cards',
    icon: 'M',
    route: '/memory',
    controls: 'Click / tap cards',
  },
];
