import { createInvadersState, movePlayer, playerShoot, tickInvaders, InvadersState } from './invaders.logic';

describe('Invaders Logic', () => {
  let state: InvadersState;

  beforeEach(() => {
    state = createInvadersState(400, 500);
  });

  it('should create initial state', () => {
    expect(state.score).toBe(0);
    expect(state.lives).toBe(3);
    expect(state.gameOver).toBe(false);
  });

  it('should have 32 aliens', () => {
    expect(state.aliens.length).toBe(32); // 4 rows * 8 cols
  });

  it('should have a player', () => {
    expect(state.player.width).toBe(36);
  });

  it('should have shields', () => {
    expect(state.shields.length).toBe(3);
  });

  it('should move player left', () => {
    const origX = state.player.x;
    movePlayer(state, 'left');
    expect(state.player.x).toBeLessThan(origX);
  });

  it('should move player right', () => {
    const origX = state.player.x;
    movePlayer(state, 'right');
    expect(state.player.x).toBeGreaterThan(origX);
  });

  it('should clamp player to left edge', () => {
    for (let i = 0; i < 200; i++) movePlayer(state, 'left');
    expect(state.player.x).toBeGreaterThanOrEqual(0);
  });

  it('should clamp player to right edge', () => {
    for (let i = 0; i < 200; i++) movePlayer(state, 'right');
    expect(state.player.x).toBeLessThanOrEqual(400 - state.player.width);
  });

  it('should shoot', () => {
    const shot = playerShoot(state);
    expect(shot).toBe(true);
    expect(state.playerBullets.length).toBe(1);
  });

  it('should limit bullets', () => {
    playerShoot(state);
    playerShoot(state);
    const third = playerShoot(state);
    expect(third).toBe(false);
  });

  it('should move bullets on tick', () => {
    playerShoot(state);
    const origY = state.playerBullets[0].y;
    tickInvaders(state);
    expect(state.playerBullets[0].y).toBeLessThan(origY);
  });

  it('should detect bullet hitting alien', () => {
    const alien = state.aliens[0];
    state.playerBullets = [{ x: alien.x + 12, y: alien.y + 12, vy: -6 }];
    const result = tickInvaders(state);
    expect(result.hit).toBe(true);
    expect(alien.alive).toBe(false);
  });

  it('should detect win when all aliens destroyed', () => {
    state.aliens.forEach((a) => { a.alive = false; });
    state.aliens[0].alive = true;
    state.playerBullets = [{
      x: state.aliens[0].x + 12,
      y: state.aliens[0].y + 12,
      vy: -6,
    }];
    const result = tickInvaders(state);
    expect(result.hit).toBe(true);
    expect(state.won).toBe(true);
  });

  it('should detect game over when alien reaches bottom', () => {
    state.aliens[0].alive = true;
    state.aliens[0].y = state.player.y;
    tickInvaders(state);
    expect(state.gameOver).toBe(true);
  });
});
