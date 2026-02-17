export interface Point { x: number; y: number; }

export interface Alien {
  x: number;
  y: number;
  alive: boolean;
  type: number; // 0-2 (different point values)
}

export interface Bullet {
  x: number;
  y: number;
  vy: number;
}

export interface Shield {
  x: number;
  y: number;
  width: number;
  height: number;
  pixels: boolean[][];
}

export interface InvadersState {
  player: { x: number; y: number; width: number };
  aliens: Alien[];
  playerBullets: Bullet[];
  alienBullets: Bullet[];
  shields: Shield[];
  alienDir: number; // 1 or -1
  alienSpeed: number;
  alienMoveTimer: number;
  score: number;
  lives: number;
  gameOver: boolean;
  won: boolean;
  width: number;
  height: number;
}

const ALIEN_COLS = 8;
const ALIEN_ROWS = 4;
const ALIEN_SIZE = 24;
const ALIEN_GAP = 8;
const PLAYER_W = 36;
const PLAYER_SPEED = 5;
const BULLET_SPEED = 6;
const ALIEN_BULLET_SPEED = 3;

export function createInvadersState(width: number, height: number): InvadersState {
  const aliens: Alien[] = [];
  const startX = (width - ALIEN_COLS * (ALIEN_SIZE + ALIEN_GAP)) / 2;

  for (let row = 0; row < ALIEN_ROWS; row++) {
    for (let col = 0; col < ALIEN_COLS; col++) {
      aliens.push({
        x: startX + col * (ALIEN_SIZE + ALIEN_GAP),
        y: 40 + row * (ALIEN_SIZE + ALIEN_GAP),
        alive: true,
        type: row === 0 ? 2 : row === 1 ? 1 : 0,
      });
    }
  }

  const shields: Shield[] = [];
  const shieldW = 40;
  const shieldH = 24;
  const shieldY = height - 100;
  for (let i = 0; i < 3; i++) {
    const sx = width * (i + 1) / 4 - shieldW / 2;
    const pixels = Array.from({ length: shieldH }, () => Array(shieldW).fill(true));
    shields.push({ x: sx, y: shieldY, width: shieldW, height: shieldH, pixels });
  }

  return {
    player: { x: width / 2 - PLAYER_W / 2, y: height - 40, width: PLAYER_W },
    aliens,
    playerBullets: [],
    alienBullets: [],
    shields,
    alienDir: 1,
    alienSpeed: 30,
    alienMoveTimer: 0,
    score: 0,
    lives: 3,
    gameOver: false,
    won: false,
    width,
    height,
  };
}

export function movePlayer(state: InvadersState, dir: 'left' | 'right'): void {
  const dx = dir === 'left' ? -PLAYER_SPEED : PLAYER_SPEED;
  state.player.x = Math.max(0, Math.min(state.width - state.player.width, state.player.x + dx));
}

export function playerShoot(state: InvadersState): boolean {
  if (state.playerBullets.length >= 2) return false;
  state.playerBullets.push({
    x: state.player.x + state.player.width / 2,
    y: state.player.y - 4,
    vy: -BULLET_SPEED,
  });
  return true;
}

export function tickInvaders(state: InvadersState): { hit: boolean; playerHit: boolean; shieldHit: boolean } {
  let hit = false;
  let playerHit = false;
  let shieldHit = false;

  // Move player bullets
  state.playerBullets = state.playerBullets.filter((b) => {
    b.y += b.vy;
    return b.y > 0;
  });

  // Move alien bullets
  state.alienBullets = state.alienBullets.filter((b) => {
    b.y += b.vy;
    return b.y < state.height;
  });

  // Alien movement
  state.alienMoveTimer++;
  if (state.alienMoveTimer >= state.alienSpeed) {
    state.alienMoveTimer = 0;
    let shouldDescend = false;

    for (const alien of state.aliens) {
      if (!alien.alive) continue;
      if (
        (state.alienDir > 0 && alien.x + ALIEN_SIZE >= state.width - 10) ||
        (state.alienDir < 0 && alien.x <= 10)
      ) {
        shouldDescend = true;
        break;
      }
    }

    if (shouldDescend) {
      state.alienDir = -state.alienDir;
      for (const alien of state.aliens) {
        alien.y += ALIEN_SIZE / 2;
      }
      state.alienSpeed = Math.max(5, state.alienSpeed - 2);
    } else {
      for (const alien of state.aliens) {
        if (alien.alive) alien.x += state.alienDir * 8;
      }
    }
  }

  // Alien shoot
  if (Math.random() < 0.02) {
    const alive = state.aliens.filter((a) => a.alive);
    if (alive.length > 0) {
      const shooter = alive[Math.floor(Math.random() * alive.length)];
      state.alienBullets.push({
        x: shooter.x + ALIEN_SIZE / 2,
        y: shooter.y + ALIEN_SIZE,
        vy: ALIEN_BULLET_SPEED,
      });
    }
  }

  // Player bullet → alien collision
  for (const bullet of state.playerBullets) {
    for (const alien of state.aliens) {
      if (!alien.alive) continue;
      if (
        bullet.x >= alien.x &&
        bullet.x <= alien.x + ALIEN_SIZE &&
        bullet.y >= alien.y &&
        bullet.y <= alien.y + ALIEN_SIZE
      ) {
        alien.alive = false;
        bullet.y = -100;
        state.score += (alien.type + 1) * 10;
        hit = true;
        break;
      }
    }
  }

  // Bullets → shield collision
  for (const bullet of [...state.playerBullets, ...state.alienBullets]) {
    for (const shield of state.shields) {
      if (
        bullet.x >= shield.x &&
        bullet.x < shield.x + shield.width &&
        bullet.y >= shield.y &&
        bullet.y < shield.y + shield.height
      ) {
        const px = Math.floor(bullet.x - shield.x);
        const py = Math.floor(bullet.y - shield.y);
        if (px >= 0 && px < shield.width && py >= 0 && py < shield.height && shield.pixels[py][px]) {
          // Erode area
          for (let dy = -2; dy <= 2; dy++) {
            for (let dx = -2; dx <= 2; dx++) {
              const ny = py + dy;
              const nx = px + dx;
              if (ny >= 0 && ny < shield.height && nx >= 0 && nx < shield.width) {
                shield.pixels[ny][nx] = false;
              }
            }
          }
          bullet.y = -100;
          shieldHit = true;
          break;
        }
      }
    }
  }

  // Alien bullet → player collision
  for (const bullet of state.alienBullets) {
    if (
      bullet.x >= state.player.x &&
      bullet.x <= state.player.x + state.player.width &&
      bullet.y >= state.player.y &&
      bullet.y <= state.player.y + 12
    ) {
      state.lives--;
      bullet.y = state.height + 100;
      playerHit = true;
      if (state.lives <= 0) {
        state.gameOver = true;
      }
      break;
    }
  }

  // Aliens reach bottom
  for (const alien of state.aliens) {
    if (alien.alive && alien.y + ALIEN_SIZE >= state.player.y) {
      state.gameOver = true;
      break;
    }
  }

  // Win check
  if (state.aliens.every((a) => !a.alive)) {
    state.won = true;
    state.gameOver = true;
  }

  // Clean up off-screen bullets
  state.playerBullets = state.playerBullets.filter((b) => b.y > 0);
  state.alienBullets = state.alienBullets.filter((b) => b.y < state.height);

  return { hit, playerHit, shieldHit };
}
