import { Injectable, signal, computed } from '@angular/core';
import { GameId, HighScore } from '../models/game.model';

const STORAGE_KEY = 'retro-arcade-scores';
const MAX_SCORES = 10;

@Injectable({ providedIn: 'root' })
export class ScoreService {
  private readonly scores = signal<Record<string, HighScore[]>>(this.load());

  getScores(gameId: GameId): HighScore[] {
    return this.scores()[gameId] ?? [];
  }

  getHighScore(gameId: GameId): number {
    const list = this.getScores(gameId);
    return list.length > 0 ? list[0].score : 0;
  }

  submit(gameId: GameId, score: number, level?: number): boolean {
    const list = [...this.getScores(gameId)];
    const entry: HighScore = {
      score,
      date: new Date().toISOString(),
      level,
    };

    list.push(entry);
    list.sort((a, b) => b.score - a.score);
    const trimmed = list.slice(0, MAX_SCORES);

    const isNewHigh = trimmed[0].score === score && trimmed[0].date === entry.date;

    this.scores.update((all) => ({ ...all, [gameId]: trimmed }));
    this.save();

    return isNewHigh;
  }

  clearGame(gameId: GameId): void {
    this.scores.update((all) => {
      const copy = { ...all };
      delete copy[gameId];
      return copy;
    });
    this.save();
  }

  clearAll(): void {
    this.scores.set({});
    this.save();
  }

  private load(): Record<string, HighScore[]> {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  private save(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.scores()));
    } catch { /* storage full or unavailable */ }
  }
}
