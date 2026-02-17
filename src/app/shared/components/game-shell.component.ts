import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { GameState } from '../../core/models/game.model';

@Component({
  selector: 'app-game-shell',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="game-shell">
      <div class="game-shell__bar">
        <span class="game-shell__name">{{ gameName() }}</span>
        <span class="game-shell__score">SCORE: <strong class="text-glow">{{ score() }}</strong></span>
        <span class="game-shell__hi">HI: {{ hiScore() }}</span>
      </div>

      <div class="game-shell__area">
        <ng-content />

        @if (state() === 'idle') {
          <div class="game-shell__overlay">
            <h2 class="text-glow">{{ gameName() }}</h2>
            <button class="btn btn--filled" (click)="start.emit()">START</button>
          </div>
        }

        @if (state() === 'paused') {
          <div class="game-shell__overlay">
            <h2 class="text-glow-amber">PAUSED</h2>
            <button class="btn btn--amber" (click)="resume.emit()">RESUME</button>
          </div>
        }

        @if (state() === 'game-over') {
          <div class="game-shell__overlay">
            <h2 class="text-glow">GAME OVER</h2>
            <p class="game-shell__final-score">SCORE: {{ score() }}</p>
            @if (isNewHighScore()) {
              <p class="game-shell__new-hi text-glow-amber">NEW HIGH SCORE!</p>
            }
            <button class="btn btn--filled" (click)="start.emit()">PLAY AGAIN</button>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .game-shell {
      max-width: 600px;
      margin: 0 auto;
      padding: var(--space-lg) 0;
    }
    .game-shell__bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--space-sm) var(--space-md);
      border: 1px solid var(--border);
      background-color: var(--bg-surface);
      margin-bottom: var(--space-sm);
      font-family: var(--font-pixel);
      font-size: 0.55rem;
      color: var(--text-secondary);
    }
    .game-shell__score strong {
      color: var(--accent-primary);
    }
    .game-shell__hi {
      color: var(--accent-amber);
    }
    .game-shell__area {
      position: relative;
      border: 1px solid var(--border);
      background-color: var(--bg-deep);
      min-height: 400px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .game-shell__overlay {
      position: absolute;
      inset: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: var(--space-lg);
      background-color: var(--bg-overlay);
      z-index: 10;
    }
    .game-shell__overlay h2 {
      font-size: 1rem;
    }
    .game-shell__final-score {
      font-family: var(--font-pixel);
      font-size: 0.7rem;
      color: var(--accent-primary);
    }
    .game-shell__new-hi {
      font-family: var(--font-pixel);
      font-size: 0.6rem;
      color: var(--accent-amber);
    }
    @media (max-width: 768px) {
      .game-shell { padding: var(--space-md) 0; }
      .game-shell__area { min-height: 300px; }
    }
  `],
})
export class GameShellComponent {
  gameName = input.required<string>();
  score = input(0);
  hiScore = input(0);
  state = input<GameState>('idle');
  isNewHighScore = input(false);

  start = output<void>();
  resume = output<void>();
}
