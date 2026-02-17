import { Injectable, signal } from '@angular/core';
import { Achievement, AchievementContext, GameId } from '../models/game.model';
import { NotificationService } from './notification.service';

const STORAGE_KEY = 'retro-arcade-achievements';

function def(
  id: string,
  name: string,
  description: string,
  icon: string,
  gameId: GameId | 'global',
  condition: Achievement['condition'],
): Achievement {
  return { id, name, description, icon, gameId, unlocked: false, condition };
}

const ACHIEVEMENT_DEFS: Achievement[] = [
  // Snake
  def('snake-first', 'First Bite', 'Play your first game of Snake', 'S', 'snake', (c) => c.gameId === 'snake'),
  def('snake-50', 'Hungry Snake', 'Score 50+ in Snake', 'S', 'snake', (c) => c.gameId === 'snake' && c.score >= 50),
  def('snake-100', 'Python', 'Score 100+ in Snake', 'S', 'snake', (c) => c.gameId === 'snake' && c.score >= 100),
  def('snake-200', 'Anaconda', 'Score 200+ in Snake', 'S', 'snake', (c) => c.gameId === 'snake' && c.score >= 200),
  def('snake-long', 'Lengthy', 'Reach length 20+ in Snake', 'S', 'snake', (c) => c.gameId === 'snake' && (c.snakeLength ?? 0) >= 20),

  // Tetris
  def('tetris-first', 'Block Party', 'Play your first game of Tetris', 'T', 'tetris', (c) => c.gameId === 'tetris'),
  def('tetris-lines-10', 'Line Worker', 'Clear 10 lines in Tetris', 'T', 'tetris', (c) => c.gameId === 'tetris' && (c.linesCleared ?? 0) >= 10),
  def('tetris-lines-40', 'Tetris Master', 'Clear 40 lines in Tetris', 'T', 'tetris', (c) => c.gameId === 'tetris' && (c.linesCleared ?? 0) >= 40),
  def('tetris-1000', 'High Stacker', 'Score 1000+ in Tetris', 'T', 'tetris', (c) => c.gameId === 'tetris' && c.score >= 1000),
  def('tetris-5000', 'Tetromino God', 'Score 5000+ in Tetris', 'T', 'tetris', (c) => c.gameId === 'tetris' && c.score >= 5000),

  // Breakout
  def('breakout-first', 'Brick Breaker', 'Play your first game of Breakout', 'B', 'breakout', (c) => c.gameId === 'breakout'),
  def('breakout-500', 'Demolition', 'Score 500+ in Breakout', 'B', 'breakout', (c) => c.gameId === 'breakout' && c.score >= 500),
  def('breakout-clear', 'Clean Sweep', 'Clear all bricks in Breakout', 'B', 'breakout', (c) => c.gameId === 'breakout' && (c.perfectGame ?? false)),
  def('breakout-noloss', 'Unbreakable', 'Beat Breakout without losing a life', 'B', 'breakout', (c) => c.gameId === 'breakout' && (c.noLivesLost ?? false)),

  // Invaders
  def('invaders-first', 'Space Cadet', 'Play your first game of Invaders', 'I', 'invaders', (c) => c.gameId === 'invaders'),
  def('invaders-500', 'Alien Hunter', 'Score 500+ in Invaders', 'I', 'invaders', (c) => c.gameId === 'invaders' && c.score >= 500),
  def('invaders-1000', 'Space Commander', 'Score 1000+ in Invaders', 'I', 'invaders', (c) => c.gameId === 'invaders' && c.score >= 1000),
  def('invaders-clear', 'Fleet Destroyer', 'Clear all aliens in a wave', 'I', 'invaders', (c) => c.gameId === 'invaders' && (c.perfectGame ?? false)),

  // 2048
  def('2048-first', 'Slider', 'Play your first game of 2048', '2', '2048', (c) => c.gameId === '2048'),
  def('2048-512', 'Half K', 'Reach the 512 tile', '2', '2048', (c) => c.gameId === '2048' && (c.maxTile ?? 0) >= 512),
  def('2048-1024', 'Almost There', 'Reach the 1024 tile', '2', '2048', (c) => c.gameId === '2048' && (c.maxTile ?? 0) >= 1024),
  def('2048-2048', 'Winner!', 'Reach the 2048 tile', '2', '2048', (c) => c.gameId === '2048' && (c.maxTile ?? 0) >= 2048),
  def('2048-4096', 'Beyond 2048', 'Reach the 4096 tile', '2', '2048', (c) => c.gameId === '2048' && (c.maxTile ?? 0) >= 4096),

  // Memory
  def('memory-first', 'Good Memory', 'Play your first game of Memory', 'M', 'memory', (c) => c.gameId === 'memory'),
  def('memory-fast', 'Quick Recall', 'Complete Memory in under 20 moves', 'M', 'memory', (c) => c.gameId === 'memory' && (c.moves ?? 99) <= 20),
  def('memory-perfect', 'Perfect Memory', 'Complete Memory with no mistakes', 'M', 'memory', (c) => c.gameId === 'memory' && (c.perfectGame ?? false)),

  // Global
  def('play-5', 'Regular', 'Play 5 total games', 'G', 'global', (c) => c.totalGamesPlayed >= 5),
  def('play-25', 'Dedicated', 'Play 25 total games', 'G', 'global', (c) => c.totalGamesPlayed >= 25),
  def('play-100', 'Arcade Rat', 'Play 100 total games', 'G', 'global', (c) => c.totalGamesPlayed >= 100),
];

@Injectable({ providedIn: 'root' })
export class AchievementService {
  readonly achievements = signal<Achievement[]>(this.load());

  constructor(private notifications: NotificationService) {}

  check(ctx: AchievementContext): void {
    let changed = false;
    const list = this.achievements().map((a) => {
      if (a.unlocked) return a;
      if (a.condition(ctx)) {
        changed = true;
        this.notifications.show(`Achievement: ${a.name}`, 'success', 4000);
        return { ...a, unlocked: true, unlockedDate: new Date().toISOString() };
      }
      return a;
    });
    if (changed) {
      this.achievements.set(list);
      this.save();
    }
  }

  getUnlocked(): Achievement[] {
    return this.achievements().filter((a) => a.unlocked);
  }

  getLocked(): Achievement[] {
    return this.achievements().filter((a) => !a.unlocked);
  }

  getByGame(gameId: GameId | 'global'): Achievement[] {
    return this.achievements().filter((a) => a.gameId === gameId);
  }

  reset(): void {
    this.achievements.set(ACHIEVEMENT_DEFS.map((a) => ({ ...a, unlocked: false, unlockedDate: undefined })));
    this.save();
  }

  private load(): Achievement[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved: Record<string, string> = JSON.parse(raw);
        return ACHIEVEMENT_DEFS.map((a) => ({
          ...a,
          unlocked: !!saved[a.id],
          unlockedDate: saved[a.id] || undefined,
        }));
      }
    } catch { /* ignore */ }
    return ACHIEVEMENT_DEFS.map((a) => ({ ...a }));
  }

  private save(): void {
    try {
      const data: Record<string, string> = {};
      for (const a of this.achievements()) {
        if (a.unlocked && a.unlockedDate) {
          data[a.id] = a.unlockedDate;
        }
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch { /* storage unavailable */ }
  }
}
