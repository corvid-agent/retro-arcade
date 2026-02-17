import { Injectable, signal } from '@angular/core';
import { GameId, PlayStats } from '../models/game.model';

const STORAGE_KEY = 'retro-arcade-stats';

@Injectable({ providedIn: 'root' })
export class StatsService {
  private readonly allStats = signal<Record<string, PlayStats>>(this.load());
  private sessionStart: number | null = null;
  private currentGame: GameId | null = null;

  getStats(gameId: GameId): PlayStats {
    return this.allStats()[gameId] ?? { gamesPlayed: 0, totalPlayTime: 0, highestScore: 0 };
  }

  getAllStats(): Record<string, PlayStats> {
    return this.allStats();
  }

  getTotalGamesPlayed(): number {
    return Object.values(this.allStats()).reduce((sum, s) => sum + s.gamesPlayed, 0);
  }

  startSession(gameId: GameId): void {
    this.currentGame = gameId;
    this.sessionStart = Date.now();
  }

  endSession(score: number): void {
    if (!this.currentGame || !this.sessionStart) return;

    const elapsed = Math.floor((Date.now() - this.sessionStart) / 1000);
    const gameId = this.currentGame;
    const prev = this.getStats(gameId);

    this.allStats.update((all) => ({
      ...all,
      [gameId]: {
        gamesPlayed: prev.gamesPlayed + 1,
        totalPlayTime: prev.totalPlayTime + elapsed,
        highestScore: Math.max(prev.highestScore, score),
        lastPlayed: new Date().toISOString(),
      },
    }));

    this.sessionStart = null;
    this.currentGame = null;
    this.save();
  }

  reset(): void {
    this.allStats.set({});
    this.save();
  }

  private load(): Record<string, PlayStats> {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  private save(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.allStats()));
    } catch { /* ignore */ }
  }
}
