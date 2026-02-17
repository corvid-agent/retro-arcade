import { createBreakoutState, movePaddle, tickBreakout, BreakoutState } from './breakout.logic';

describe('Breakout Logic', () => {
  let state: BreakoutState;

  beforeEach(() => {
    state = createBreakoutState(400, 500);
  });

  it('should create initial state', () => {
    expect(state.score).toBe(0);
    expect(state.lives).toBe(3);
    expect(state.gameOver).toBe(false);
    expect(state.bricks.length).toBeGreaterThan(0);
  });

  it('should have correct number of bricks', () => {
    expect(state.bricks.length).toBe(40); // 5 rows * 8 cols
  });

  it('should have a ball', () => {
    expect(state.ball.x).toBeGreaterThan(0);
    expect(state.ball.y).toBeGreaterThan(0);
    expect(state.ball.radius).toBe(5);
  });

  it('should have a paddle', () => {
    expect(state.paddle.width).toBe(80);
    expect(state.paddle.height).toBe(10);
  });

  it('should move paddle', () => {
    movePaddle(state, 100);
    expect(state.paddle.x).toBe(60); // 100 - width/2
  });

  it('should clamp paddle to left edge', () => {
    movePaddle(state, 0);
    expect(state.paddle.x).toBe(0);
  });

  it('should clamp paddle to right edge', () => {
    movePaddle(state, 500);
    expect(state.paddle.x).toBe(320); // 400 - 80
  });

  it('should move ball on tick', () => {
    const origX = state.ball.x;
    const origY = state.ball.y;
    tickBreakout(state);
    expect(state.ball.x).not.toBe(origX);
    expect(state.ball.y).not.toBe(origY);
  });

  it('should bounce ball off top wall', () => {
    state.ball.y = 6;
    state.ball.vy = -5;
    tickBreakout(state);
    expect(state.ball.vy).toBeGreaterThan(0);
  });

  it('should bounce ball off side walls', () => {
    state.ball.x = 396;
    state.ball.vx = 5;
    tickBreakout(state);
    expect(state.ball.vx).toBeLessThan(0);
  });

  it('should lose life when ball goes below', () => {
    state.ball.y = 496;
    state.ball.vy = 5;
    tickBreakout(state);
    expect(state.lives).toBe(2);
  });

  it('should game over when all lives lost', () => {
    state.lives = 1;
    state.ball.y = 496;
    state.ball.vy = 5;
    tickBreakout(state);
    expect(state.gameOver).toBe(true);
  });

  it('should detect win when all bricks broken', () => {
    state.bricks.forEach((b) => { b.broken = true; b.hits = 0; });
    state.bricks[0].broken = false;
    state.bricks[0].hits = 1;
    // Position ball right on that brick
    state.ball.x = state.bricks[0].x + 10;
    state.ball.y = state.bricks[0].y + 10;
    state.ball.vy = -1;
    tickBreakout(state);
    expect(state.won).toBe(true);
  });

  it('should track lives lost', () => {
    state.ball.y = 496;
    state.ball.vy = 5;
    tickBreakout(state);
    expect(state.livesLost).toBe(1);
  });
});
