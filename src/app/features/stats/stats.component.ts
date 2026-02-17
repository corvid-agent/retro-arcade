import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { GAMES, GameId } from '../../core/models/game.model';
import { StatsService } from '../../core/services/stats.service';
import { ScoreService } from '../../core/services/score.service';
import { AchievementService } from '../../core/services/achievement.service';
import { HighScoresComponent } from '../../shared/components/high-scores.component';

@Component({
  selector: 'app-stats',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [HighScoresComponent],
  template: `
    <section class="stats container">
      <h1 class="stats__title text-glow">STATS</h1>

      <div class="stats__overview">
        <div class="stats__stat pixel-border">
          <span class="stats__stat-value text-glow">{{ totalGames() }}</span>
          <span class="stats__stat-label">Games Played</span>
        </div>
        <div class="stats__stat pixel-border">
          <span class="stats__stat-value text-glow">{{ totalTime() }}</span>
          <span class="stats__stat-label">Play Time</span>
        </div>
        <div class="stats__stat pixel-border">
          <span class="stats__stat-value text-glow">{{ unlockedCount() }}/{{ totalAchievements() }}</span>
          <span class="stats__stat-label">Achievements</span>
        </div>
      </div>

      <h2 class="stats__section-title">Per-Game Stats</h2>
      <div class="stats__games">
        @for (game of games; track game.id) {
          <div class="stats__game pixel-border">
            <div class="stats__game-header">
              <span class="stats__game-icon">{{ game.icon }}</span>
              <span class="stats__game-name">{{ game.name }}</span>
            </div>
            <div class="stats__game-details">
              <span>Played: {{ getGamesPlayed(game.id) }}</span>
              <span>Best: {{ getBestScore(game.id) }}</span>
              <span>Time: {{ getPlayTime(game.id) }}</span>
            </div>
            <app-high-scores [scores]="scoreService.getScores(game.id)" [title]="'TOP SCORES'" />
          </div>
        }
      </div>

      <h2 class="stats__section-title">Achievements</h2>
      <div class="stats__achievements">
        @for (ach of allAchievements(); track ach.id) {
          <div class="stats__achievement" [class.stats__achievement--locked]="!ach.unlocked">
            <span class="stats__achievement-icon">{{ ach.icon }}</span>
            <div class="stats__achievement-info">
              <span class="stats__achievement-name">{{ ach.unlocked ? ach.name : '???' }}</span>
              <span class="stats__achievement-desc">{{ ach.unlocked ? ach.description : 'Keep playing to unlock' }}</span>
            </div>
          </div>
        }
      </div>
    </section>
  `,
  styles: [`
    .stats { padding: var(--space-2xl) var(--space-lg); }
    .stats__title { text-align: center; margin-bottom: var(--space-2xl); }
    .stats__overview {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: var(--space-md);
      margin-bottom: var(--space-2xl);
    }
    .stats__stat {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--space-xs);
      padding: var(--space-lg);
      background-color: var(--bg-surface);
      text-align: center;
    }
    .stats__stat-value {
      font-family: var(--font-pixel);
      font-size: 0.9rem;
      color: var(--accent-primary);
    }
    .stats__stat-label {
      font-size: 0.75rem;
      color: var(--text-tertiary);
    }
    .stats__section-title {
      text-align: center;
      margin: var(--space-2xl) 0 var(--space-lg);
      color: var(--accent-amber);
    }
    .stats__games {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: var(--space-lg);
    }
    .stats__game {
      background-color: var(--bg-surface);
      padding: var(--space-lg);
    }
    .stats__game-header {
      display: flex;
      align-items: center;
      gap: var(--space-sm);
      margin-bottom: var(--space-sm);
    }
    .stats__game-icon {
      font-family: var(--font-pixel);
      font-size: 0.9rem;
      color: var(--accent-primary);
    }
    .stats__game-name {
      font-family: var(--font-pixel);
      font-size: 0.6rem;
      color: var(--text-primary);
    }
    .stats__game-details {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-md);
      font-size: 0.8rem;
      color: var(--text-secondary);
      margin-bottom: var(--space-md);
    }
    .stats__achievements {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: var(--space-sm);
    }
    .stats__achievement {
      display: flex;
      align-items: center;
      gap: var(--space-sm);
      padding: var(--space-sm) var(--space-md);
      background-color: var(--bg-surface);
      border: 1px solid var(--accent-primary);
    }
    .stats__achievement--locked {
      opacity: 0.4;
      border-color: var(--border);
    }
    .stats__achievement-icon {
      font-family: var(--font-pixel);
      font-size: 0.7rem;
      color: var(--accent-primary);
      width: 28px;
      text-align: center;
    }
    .stats__achievement-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .stats__achievement-name {
      font-family: var(--font-pixel);
      font-size: 0.5rem;
      color: var(--text-primary);
    }
    .stats__achievement-desc {
      font-size: 0.7rem;
      color: var(--text-secondary);
    }
    @media (max-width: 768px) {
      .stats__overview { grid-template-columns: 1fr; }
    }
  `],
})
export class StatsComponent {
  protected readonly games = GAMES;
  protected readonly statsService = inject(StatsService);
  protected readonly scoreService = inject(ScoreService);
  private readonly achievementService = inject(AchievementService);

  readonly totalGames = computed(() => this.statsService.getTotalGamesPlayed());
  readonly allAchievements = computed(() => this.achievementService.achievements());
  readonly unlockedCount = computed(() => this.achievementService.getUnlocked().length);
  readonly totalAchievements = computed(() => this.allAchievements().length);

  readonly totalTime = computed(() => {
    const all = this.statsService.getAllStats();
    const secs = Object.values(all).reduce((sum, s) => sum + s.totalPlayTime, 0);
    if (secs < 60) return `${secs}s`;
    if (secs < 3600) return `${Math.floor(secs / 60)}m`;
    return `${Math.floor(secs / 3600)}h ${Math.floor((secs % 3600) / 60)}m`;
  });

  getGamesPlayed(gameId: GameId): number {
    return this.statsService.getStats(gameId).gamesPlayed;
  }

  getBestScore(gameId: GameId): number {
    return this.scoreService.getHighScore(gameId);
  }

  getPlayTime(gameId: GameId): string {
    const secs = this.statsService.getStats(gameId).totalPlayTime;
    if (secs < 60) return `${secs}s`;
    return `${Math.floor(secs / 60)}m`;
  }
}
