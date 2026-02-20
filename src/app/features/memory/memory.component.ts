import { Component, ChangeDetectionStrategy, signal, inject, ViewChild } from '@angular/core';
import { GameShellComponent } from '../../shared/components/game-shell.component';
import { HighScoresComponent } from '../../shared/components/high-scores.component';
import { ScoreService } from '../../core/services/score.service';
import { AudioService } from '../../core/services/audio.service';
import { StatsService } from '../../core/services/stats.service';
import { AchievementService } from '../../core/services/achievement.service';
import { AccessibilityService } from '../../core/services/accessibility.service';
import { GameState } from '../../core/models/game.model';
import { createMemoryState, flipCard, unflipMismatch, getScore, MemoryState } from './memory.logic';

@Component({
  selector: 'app-memory',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [GameShellComponent, HighScoresComponent],
  template: `
    <div class="memory-page container">
      <app-game-shell
        #shell
        gameName="Memory"
        gameId="memory"
        [score]="score()"
        [hiScore]="hiScore()"
        [state]="state()"
        [isNewHighScore]="isNewHigh()"
        (start)="onStart()"
        (resume)="onResume()"
      >
        <div class="memory-board" role="grid" aria-label="Memory card grid">
          @for (card of gameState()?.cards ?? []; track card.id; let i = $index) {
            <button class="memory-card"
                    [class.memory-card--flipped]="card.flipped || card.matched"
                    [class.memory-card--matched]="card.matched"
                    (click)="onFlip(i)"
                    [disabled]="card.matched"
                    [attr.aria-label]="card.flipped || card.matched ? 'Card: ' + card.symbol + (card.matched ? ' (matched)' : '') : 'Hidden card'"
                    role="gridcell">
              <div class="memory-card__inner">
                <div class="memory-card__front" aria-hidden="true">?</div>
                <div class="memory-card__back" aria-hidden="true">{{ card.symbol }}</div>
              </div>
            </button>
          }
        </div>
      </app-game-shell>
      <div class="memory-info" role="status" aria-live="polite">
        <span>MOVES: {{ gameState()?.moves ?? 0 }}</span>
        <span>PAIRS: {{ gameState()?.pairs ?? 0 }}/{{ gameState()?.totalPairs ?? 0 }}</span>
      </div>
      <app-high-scores [scores]="scoreService.getScores('memory')" />
    </div>
  `,
  styles: [`
    .memory-page { max-width: 600px; margin: 0 auto; }
    .memory-board {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      grid-template-rows: repeat(4, 1fr);
      gap: 8px;
      padding: 12px;
      width: 100%;
      height: 100%;
    }
    .memory-card {
      aspect-ratio: 1;
      perspective: 600px;
      background: none;
      border: none;
      cursor: pointer;
      padding: 0;
      min-height: 44px;
      min-width: 44px;
    }
    .memory-card__inner {
      position: relative;
      width: 100%;
      height: 100%;
      transition: transform 0.4s ease;
      transform-style: preserve-3d;
    }
    .memory-card--flipped .memory-card__inner {
      transform: rotateY(180deg);
    }
    .memory-card__front, .memory-card__back {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: var(--font-pixel);
      font-size: 1rem;
      backface-visibility: hidden;
      border: 1px solid var(--border);
    }
    .memory-card__front {
      background-color: var(--bg-raised);
      color: var(--text-tertiary);
    }
    .memory-card__back {
      background-color: var(--bg-surface);
      color: var(--accent-primary);
      transform: rotateY(180deg);
      border-color: var(--accent-primary);
    }
    .memory-card--matched .memory-card__back {
      background-color: var(--accent-primary-dim);
      color: var(--accent-primary);
      box-shadow: 0 0 8px var(--accent-primary-glow);
    }
    .memory-card:disabled {
      cursor: default;
    }
    .memory-info {
      display: flex;
      justify-content: center;
      gap: var(--space-lg);
      padding: var(--space-sm);
      font-family: var(--font-pixel);
      font-size: 0.5rem;
      color: var(--text-secondary);
    }
    @media (max-width: 480px) {
      .memory-board { gap: 4px; padding: 8px; }
      .memory-card__front, .memory-card__back { font-size: 0.7rem; }
    }
    @media (prefers-reduced-motion: reduce) {
      .memory-card__inner {
        transition: none;
      }
    }
  `],
  host: {
    '(document:keydown)': 'onKeydown($event)',
  },
})
export class MemoryComponent {
  @ViewChild('shell') shellRef!: GameShellComponent;

  readonly scoreService = inject(ScoreService);
  private readonly audio = inject(AudioService);
  private readonly stats = inject(StatsService);
  private readonly achievements = inject(AchievementService);
  private readonly a11y = inject(AccessibilityService);

  readonly score = signal(0);
  readonly hiScore = signal(this.scoreService.getHighScore('memory'));
  readonly state = signal<GameState>('idle');
  readonly isNewHigh = signal(false);
  readonly gameState = signal<MemoryState | null>(null);

  private unflipTimeout: ReturnType<typeof setTimeout> | null = null;

  onKeydown(e: KeyboardEvent): void {
    if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
      e.preventDefault();
      if (this.state() === 'playing') {
        this.state.set('paused');
        this.audio.play('pause');
      } else if (this.state() === 'paused') {
        this.onResume();
      }
    }
  }

  onStart(): void {
    this.audio.init();
    this.audio.play('game-start');
    const gs = createMemoryState(8);
    this.gameState.set(gs);
    this.score.set(0);
    this.isNewHigh.set(false);
    this.state.set('playing');
    this.stats.startSession('memory');
  }

  onResume(): void {
    this.state.set('playing');
  }

  onFlip(index: number): void {
    const gs = this.gameState();
    if (!gs || this.state() !== 'playing') return;

    const result = flipCard(gs, index);

    if (result === 'ignore') return;

    if (result === 'flip') {
      this.audio.play('flip');
      this.shellRef.triggerFlash('action');
      this.a11y.announce(`Card flipped: ${gs.cards[index].symbol}`);
    } else if (result === 'match') {
      this.audio.play('match');
      this.shellRef.triggerFlash('success');
      this.score.set(getScore(gs));
      this.a11y.announce(`Match found! ${gs.pairs} of ${gs.totalPairs} pairs.`);
      if (gs.gameOver) {
        this.onGameOver();
      }
    } else if (result === 'mismatch') {
      this.audio.play('flip');
      this.shellRef.triggerFlash('danger');
      this.a11y.announce('No match.');
      this.unflipTimeout = setTimeout(() => {
        unflipMismatch(gs);
        this.gameState.set({ ...gs });
      }, 800);
    }

    this.gameState.set({ ...gs });
  }

  private onGameOver(): void {
    const gs = this.gameState()!;
    const finalScore = getScore(gs);
    this.score.set(finalScore);
    this.state.set('game-over');

    const isNew = this.scoreService.submit('memory', finalScore);
    this.isNewHigh.set(isNew);
    if (isNew) {
      this.audio.play('high-score');
      this.hiScore.set(finalScore);
    }

    this.stats.endSession(finalScore);
    this.achievements.check({
      gameId: 'memory',
      score: finalScore,
      moves: gs.moves,
      pairs: gs.pairs,
      perfectGame: gs.mistakes === 0,
      totalGamesPlayed: this.stats.getTotalGamesPlayed(),
    });
  }
}
