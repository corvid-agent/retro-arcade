import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GAMES, GameInfo } from '../../core/models/game.model';
import { ScoreService } from '../../core/services/score.service';

@Component({
  selector: 'app-home',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <section class="home container">
      <div class="home__hero">
        <h1 class="text-glow">RETRO ARCADE</h1>
        <p class="home__sub">Select a game to play</p>
      </div>

      <div class="home__grid">
        @for (game of games; track game.id) {
          <a [routerLink]="game.route" class="game-card pixel-border">
            <div class="game-card__icon">{{ game.icon }}</div>
            <div class="game-card__info">
              <h2 class="game-card__name">{{ game.name }}</h2>
              <p class="game-card__desc">{{ game.description }}</p>
              <p class="game-card__controls">{{ game.controls }}</p>
            </div>
            @if (getHiScore(game); as hi) {
              <div class="game-card__hi">HI: {{ hi }}</div>
            }
          </a>
        }
      </div>
    </section>
  `,
  styles: [`
    .home { padding: var(--space-2xl) var(--space-lg); }
    .home__hero {
      text-align: center;
      margin-bottom: var(--space-2xl);
    }
    .home__hero h1 { font-size: 1.3rem; margin-bottom: var(--space-sm); }
    .home__sub {
      color: var(--text-secondary);
      font-size: 0.85rem;
    }
    .home__grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: var(--space-lg);
      max-width: 900px;
      margin: 0 auto;
    }
    .game-card {
      display: flex;
      align-items: center;
      gap: var(--space-md);
      padding: var(--space-lg);
      background-color: var(--bg-surface);
      text-decoration: none;
      transition: all var(--transition);
      position: relative;
    }
    .game-card:hover {
      background-color: var(--bg-raised);
      box-shadow: 0 0 16px var(--accent-primary-glow);
      transform: translateY(-2px);
    }
    .game-card__icon {
      font-family: var(--font-pixel);
      font-size: 1.5rem;
      color: var(--accent-primary);
      width: 52px;
      height: 52px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px solid var(--border);
      background-color: var(--bg-deep);
      flex-shrink: 0;
    }
    .game-card__info { flex: 1; min-width: 0; }
    .game-card__name {
      font-size: 0.7rem;
      margin-bottom: var(--space-2xs);
      color: var(--text-primary);
    }
    .game-card__desc {
      font-size: 0.8rem;
      color: var(--text-secondary);
      margin-bottom: var(--space-2xs);
    }
    .game-card__controls {
      font-size: 0.7rem;
      color: var(--text-tertiary);
    }
    .game-card__hi {
      position: absolute;
      top: var(--space-sm);
      right: var(--space-sm);
      font-family: var(--font-pixel);
      font-size: 0.45rem;
      color: var(--accent-amber);
    }
    @media (max-width: 480px) {
      .home__grid { grid-template-columns: 1fr; }
    }
  `],
})
export class HomeComponent {
  protected readonly games = GAMES;
  private readonly scoreService = inject(ScoreService);

  getHiScore(game: GameInfo): number {
    return this.scoreService.getHighScore(game.id);
  }
}
