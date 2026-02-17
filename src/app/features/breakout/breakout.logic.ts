export interface Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
}

export interface Paddle {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Brick {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  hits: number;
  broken: boolean;
}

export interface BreakoutState {
  ball: Ball;
  paddle: Paddle;
  bricks: Brick[];
  score: number;
  lives: number;
  livesLost: number;
  gameOver: boolean;
  won: boolean;
  width: number;
  height: number;
}

const BRICK_ROWS = 5;
const BRICK_COLS = 8;
const BRICK_COLORS = ['#ff3333', '#ff8800', '#ffb000', '#00ff41', '#00e5ff'];
const BALL_SPEED = 4;

export function createBreakoutState(width: number, height: number): BreakoutState {
  const bricks: Brick[] = [];
  const bw = (width - 20) / BRICK_COLS;
  const bh = 18;

  for (let row = 0; row < BRICK_ROWS; row++) {
    for (let col = 0; col < BRICK_COLS; col++) {
      bricks.push({
        x: 10 + col * bw,
        y: 40 + row * (bh + 4),
        width: bw - 4,
        height: bh,
        color: BRICK_COLORS[row],
        hits: row === 0 ? 2 : 1,
        broken: false,
      });
    }
  }

  return {
    ball: { x: width / 2, y: height - 50, vx: BALL_SPEED * 0.7, vy: -BALL_SPEED, radius: 5 },
    paddle: { x: width / 2 - 40, y: height - 30, width: 80, height: 10 },
    bricks,
    score: 0,
    lives: 3,
    livesLost: 0,
    gameOver: false,
    won: false,
    width,
    height,
  };
}

export function movePaddle(state: BreakoutState, x: number): void {
  state.paddle.x = Math.max(0, Math.min(state.width - state.paddle.width, x - state.paddle.width / 2));
}

export function tickBreakout(state: BreakoutState): { brickHit: boolean; died: boolean; won: boolean } {
  const ball = state.ball;
  let brickHit = false;
  let died = false;

  // Move ball
  ball.x += ball.vx;
  ball.y += ball.vy;

  // Wall bounce
  if (ball.x - ball.radius <= 0 || ball.x + ball.radius >= state.width) {
    ball.vx = -ball.vx;
    ball.x = Math.max(ball.radius, Math.min(state.width - ball.radius, ball.x));
  }
  if (ball.y - ball.radius <= 0) {
    ball.vy = Math.abs(ball.vy);
    ball.y = ball.radius;
  }

  // Bottom - lose life
  if (ball.y + ball.radius >= state.height) {
    state.lives--;
    state.livesLost++;
    if (state.lives <= 0) {
      state.gameOver = true;
      return { brickHit: false, died: true, won: false };
    }
    died = true;
    resetBall(state);
    return { brickHit: false, died, won: false };
  }

  // Paddle collision
  const p = state.paddle;
  if (
    ball.vy > 0 &&
    ball.y + ball.radius >= p.y &&
    ball.y - ball.radius <= p.y + p.height &&
    ball.x >= p.x &&
    ball.x <= p.x + p.width
  ) {
    ball.vy = -Math.abs(ball.vy);
    const hitPos = (ball.x - p.x) / p.width;
    ball.vx = BALL_SPEED * (hitPos - 0.5) * 2;
    ball.y = p.y - ball.radius;
  }

  // Brick collision
  for (const brick of state.bricks) {
    if (brick.broken) continue;
    if (
      ball.x + ball.radius > brick.x &&
      ball.x - ball.radius < brick.x + brick.width &&
      ball.y + ball.radius > brick.y &&
      ball.y - ball.radius < brick.y + brick.height
    ) {
      brick.hits--;
      if (brick.hits <= 0) {
        brick.broken = true;
        state.score += 10;
      }
      ball.vy = -ball.vy;
      brickHit = true;
      break;
    }
  }

  // Win check
  if (state.bricks.every((b) => b.broken)) {
    state.won = true;
    state.gameOver = true;
    return { brickHit, died: false, won: true };
  }

  return { brickHit, died: false, won: false };
}

function resetBall(state: BreakoutState): void {
  state.ball.x = state.width / 2;
  state.ball.y = state.height - 50;
  state.ball.vx = BALL_SPEED * (Math.random() > 0.5 ? 0.7 : -0.7);
  state.ball.vy = -BALL_SPEED;
}
