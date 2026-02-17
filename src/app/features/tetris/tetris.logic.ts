export const COLS = 10;
export const ROWS = 20;

export type PieceType = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L';

export interface Point { x: number; y: number; }

export interface Piece {
  type: PieceType;
  cells: Point[];
  rotation: number;
}

const SHAPES: Record<PieceType, Point[][]> = {
  I: [
    [{ x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 3, y: 1 }],
    [{ x: 2, y: 0 }, { x: 2, y: 1 }, { x: 2, y: 2 }, { x: 2, y: 3 }],
    [{ x: 0, y: 2 }, { x: 1, y: 2 }, { x: 2, y: 2 }, { x: 3, y: 2 }],
    [{ x: 1, y: 0 }, { x: 1, y: 1 }, { x: 1, y: 2 }, { x: 1, y: 3 }],
  ],
  O: [
    [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }],
    [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }],
    [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }],
    [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }],
  ],
  T: [
    [{ x: 1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }],
    [{ x: 1, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 1, y: 2 }],
    [{ x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 1, y: 2 }],
    [{ x: 1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 1, y: 2 }],
  ],
  S: [
    [{ x: 1, y: 0 }, { x: 2, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }],
    [{ x: 1, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 2, y: 2 }],
    [{ x: 1, y: 1 }, { x: 2, y: 1 }, { x: 0, y: 2 }, { x: 1, y: 2 }],
    [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 1, y: 2 }],
  ],
  Z: [
    [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 1 }],
    [{ x: 2, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 1, y: 2 }],
    [{ x: 0, y: 1 }, { x: 1, y: 1 }, { x: 1, y: 2 }, { x: 2, y: 2 }],
    [{ x: 1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 0, y: 2 }],
  ],
  J: [
    [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }],
    [{ x: 1, y: 0 }, { x: 2, y: 0 }, { x: 1, y: 1 }, { x: 1, y: 2 }],
    [{ x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 2, y: 2 }],
    [{ x: 1, y: 0 }, { x: 1, y: 1 }, { x: 0, y: 2 }, { x: 1, y: 2 }],
  ],
  L: [
    [{ x: 2, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }],
    [{ x: 1, y: 0 }, { x: 1, y: 1 }, { x: 1, y: 2 }, { x: 2, y: 2 }],
    [{ x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 0, y: 2 }],
    [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 1, y: 2 }],
  ],
};

export const PIECE_COLORS: Record<PieceType, string> = {
  I: '#00e5ff', O: '#ffb000', T: '#cc44ff', S: '#00ff41', Z: '#ff3333', J: '#3366ff', L: '#ff8800',
};

export interface TetrisState {
  board: (PieceType | null)[][];
  current: Piece;
  currentPos: Point;
  next: PieceType;
  score: number;
  level: number;
  linesCleared: number;
  gameOver: boolean;
}

export function createTetrisState(): TetrisState {
  const board = Array.from({ length: ROWS }, () => Array<PieceType | null>(COLS).fill(null));
  const type = randomPiece();
  return {
    board,
    current: createPiece(type),
    currentPos: { x: Math.floor(COLS / 2) - 1, y: 0 },
    next: randomPiece(),
    score: 0,
    level: 1,
    linesCleared: 0,
    gameOver: false,
  };
}

function randomPiece(): PieceType {
  const types: PieceType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
  return types[Math.floor(Math.random() * types.length)];
}

function createPiece(type: PieceType): Piece {
  return { type, cells: SHAPES[type][0].map((p) => ({ ...p })), rotation: 0 };
}

export function getAbsoluteCells(piece: Piece, pos: Point): Point[] {
  return piece.cells.map((c) => ({ x: c.x + pos.x, y: c.y + pos.y }));
}

function collides(cells: Point[], board: (PieceType | null)[][]): boolean {
  return cells.some(
    (c) => c.x < 0 || c.x >= COLS || c.y >= ROWS || (c.y >= 0 && board[c.y][c.x] !== null),
  );
}

export function moveLeft(state: TetrisState): boolean {
  const next = { x: state.currentPos.x - 1, y: state.currentPos.y };
  if (!collides(getAbsoluteCells(state.current, next), state.board)) {
    state.currentPos = next;
    return true;
  }
  return false;
}

export function moveRight(state: TetrisState): boolean {
  const next = { x: state.currentPos.x + 1, y: state.currentPos.y };
  if (!collides(getAbsoluteCells(state.current, next), state.board)) {
    state.currentPos = next;
    return true;
  }
  return false;
}

export function moveDown(state: TetrisState): boolean {
  const next = { x: state.currentPos.x, y: state.currentPos.y + 1 };
  if (!collides(getAbsoluteCells(state.current, next), state.board)) {
    state.currentPos = next;
    return true;
  }
  return false;
}

export function hardDrop(state: TetrisState): number {
  let dropped = 0;
  while (moveDown(state)) dropped++;
  return dropped;
}

export function rotate(state: TetrisState): boolean {
  const nextRot = (state.current.rotation + 1) % 4;
  const nextCells = SHAPES[state.current.type][nextRot].map((p) => ({ ...p }));
  const testPiece: Piece = { ...state.current, cells: nextCells, rotation: nextRot };

  // Try normal, then wall kicks
  const kicks = [0, -1, 1, -2, 2];
  for (const dx of kicks) {
    const testPos = { x: state.currentPos.x + dx, y: state.currentPos.y };
    if (!collides(getAbsoluteCells(testPiece, testPos), state.board)) {
      state.current = testPiece;
      state.currentPos = testPos;
      return true;
    }
  }
  return false;
}

export function lockAndSpawn(state: TetrisState): number {
  // Lock current piece
  const cells = getAbsoluteCells(state.current, state.currentPos);
  for (const c of cells) {
    if (c.y < 0) {
      state.gameOver = true;
      return 0;
    }
    state.board[c.y][c.x] = state.current.type;
  }

  // Clear lines
  const cleared = clearLines(state.board);
  state.linesCleared += cleared;

  // Score: 100, 300, 500, 800 for 1-4 lines
  const lineScores = [0, 100, 300, 500, 800];
  state.score += (lineScores[cleared] ?? 0) * state.level;

  // Level up every 10 lines
  state.level = Math.floor(state.linesCleared / 10) + 1;

  // Spawn next piece
  const type = state.next;
  state.current = createPiece(type);
  state.currentPos = { x: Math.floor(COLS / 2) - 1, y: 0 };
  state.next = randomPiece();

  // Check if new piece immediately collides
  if (collides(getAbsoluteCells(state.current, state.currentPos), state.board)) {
    state.gameOver = true;
  }

  return cleared;
}

function clearLines(board: (PieceType | null)[][]): number {
  let cleared = 0;
  for (let y = ROWS - 1; y >= 0; y--) {
    if (board[y].every((cell) => cell !== null)) {
      board.splice(y, 1);
      board.unshift(Array<PieceType | null>(COLS).fill(null));
      cleared++;
      y++; // re-check same row
    }
  }
  return cleared;
}

export function getGhostY(state: TetrisState): number {
  let ghostY = state.currentPos.y;
  while (true) {
    const next = { x: state.currentPos.x, y: ghostY + 1 };
    if (collides(getAbsoluteCells(state.current, next), state.board)) break;
    ghostY++;
  }
  return ghostY;
}

export function getTickInterval(level: number): number {
  return Math.max(100, 1000 - (level - 1) * 80);
}
