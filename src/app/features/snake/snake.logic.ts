export type Direction = 'up' | 'down' | 'left' | 'right';

export interface Point {
  x: number;
  y: number;
}

export interface SnakeState {
  snake: Point[];
  food: Point;
  direction: Direction;
  nextDirection: Direction;
  cols: number;
  rows: number;
  score: number;
  gameOver: boolean;
}

export function createSnakeState(cols: number, rows: number): SnakeState {
  const cx = Math.floor(cols / 2);
  const cy = Math.floor(rows / 2);
  const snake: Point[] = [
    { x: cx, y: cy },
    { x: cx - 1, y: cy },
    { x: cx - 2, y: cy },
  ];
  const state: SnakeState = {
    snake,
    food: { x: 0, y: 0 },
    direction: 'right',
    nextDirection: 'right',
    cols,
    rows,
    score: 0,
    gameOver: false,
  };
  state.food = spawnFood(state);
  return state;
}

export function setDirection(state: SnakeState, dir: Direction): void {
  const opposites: Record<Direction, Direction> = { up: 'down', down: 'up', left: 'right', right: 'left' };
  if (dir !== opposites[state.direction]) {
    state.nextDirection = dir;
  }
}

export function tick(state: SnakeState): { ate: boolean; died: boolean } {
  state.direction = state.nextDirection;
  const head = state.snake[0];
  const next = move(head, state.direction);

  if (isOutOfBounds(next, state.cols, state.rows) || isOnSnake(next, state.snake)) {
    state.gameOver = true;
    return { ate: false, died: true };
  }

  state.snake.unshift(next);

  if (next.x === state.food.x && next.y === state.food.y) {
    state.score += 10;
    state.food = spawnFood(state);
    return { ate: true, died: false };
  }

  state.snake.pop();
  return { ate: false, died: false };
}

function move(p: Point, dir: Direction): Point {
  switch (dir) {
    case 'up':    return { x: p.x, y: p.y - 1 };
    case 'down':  return { x: p.x, y: p.y + 1 };
    case 'left':  return { x: p.x - 1, y: p.y };
    case 'right': return { x: p.x + 1, y: p.y };
  }
}

function isOutOfBounds(p: Point, cols: number, rows: number): boolean {
  return p.x < 0 || p.x >= cols || p.y < 0 || p.y >= rows;
}

function isOnSnake(p: Point, snake: Point[]): boolean {
  return snake.some((s) => s.x === p.x && s.y === p.y);
}

export function spawnFood(state: SnakeState): Point {
  let p: Point;
  do {
    p = { x: Math.floor(Math.random() * state.cols), y: Math.floor(Math.random() * state.rows) };
  } while (isOnSnake(p, state.snake));
  return p;
}
