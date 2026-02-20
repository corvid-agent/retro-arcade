import { Component, ChangeDetectionStrategy, signal, inject, ViewChild } from '@angular/core';
import { GameShellComponent } from '../../shared/components/game-shell.component';
import { HighScoresComponent } from '../../shared/components/high-scores.component';
import { SwipeDirective } from '../../shared/directives/swipe.directive';
import { ScoreService } from '../../core/services/score.service';
import { AudioService } from '../../core/services/audio.service';
import { StatsService } from '../../core/services/stats.service';
import { AchievementService } from '../../core/services/achievement.service';
import { AccessibilityService } from '../../core/services/accessibility.service';
import { GameState } from '../../core/models/game.model';
import { createBoard, slide, Board, Direction } from './puzzle-2048.logic';

const TILE_COLORS: Record<number, { bg: string; fg: string }> = {
  2:    { bg: '#1a3a1a', fg: '#00ff41' },
  4:    { bg: '#1a4a1a', fg: '#00ff41' },
  8:    { bg: '#2a4a0a', fg: '#ffb000' },
  16:   { bg: '#3a3a0a', fg: '#ffb000' },
  32:   { bg: '#4a2a0a', fg: '#ff8800' },
  64:   { bg: '#4a1a0a', fg: '#ff3333' },
  128:  { bg: '#0a3a4a', fg: '#00e5ff' },
  256:  { bg: '#0a2a4a', fg: '#00e5ff' },
  512:  { bg: '#2a1a4a', fg: '#cc44ff' },
  1024: { bg: '#3a1a3a', fg: '#cc44ff' },
  2048: { bg: '#4a4a0a', fg: '#ffb000' },
  4096: { bg: '#4a0a0a', fg: '#ff3333' },
};

/** High-contrast tile colors: strong black bg with bright text. */
const HC_TILE_COLORS: Record<number, { bg: string; fg: string }> = {
  2:    { bg: '#222222', fg: '#ffffff' },
  4:    { bg: '#333333', fg: '#ffffff' },
  8:    { bg: '#444400', fg: '#ffff00' },
  16:   { bg: '#554400', fg: '#ffff00' },
  32:   { bg: '#663300', fg: '#ffaa00' },
  64:   { bg: '#660000', fg: '#ff4444' },
  128:  { bg: '#004466', fg: '#00ffff' },
  256:  { bg: '#003366', fg: '#00ffff' },
  512:  { bg: '#440066', fg: '#ff66ff' },
  1024: { bg: '#550055', fg: '#ff66ff' },
  2048: { bg: '#666600', fg: '#ffff00' },
  4096: { bg: '#660000', fg: '#ff4444' },
};

@Component({
  selector: 'app-puzzle-2048',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [GameShellComponent, HighScoresComponent, SwipeDirective],
  template: `
    <div class="p2048-page container">
      <app-game-shell
        #shell
        gameName="2048"
        gameId="2048"
        [score]="score()"
        [hiScore]="hiScore()"
        [state]="state()"
        [isNewHighScore]="isNewHigh()"
        (start)="onStart()"
        (resume)="onResume()"
      >
        <div class="p2048-board" appSwipe (swiped)="onSwipe($event)" role="grid" aria-label="2048 game board">
          @for (row of board()?.grid ?? []; track $index; let r = $index) {
            <div class="p2048-row" role="row">
              @for (cell of row; track cell?.id ?? $index; let c = $index) {
                <div class="p2048-cell" role="gridcell"
                     [class.p2048-cell--filled]="cell"
                     [class.p2048-cell--merged]="cell?.merged"
                     [style.background-color]="getCellBg(cell?.value)"
                     [style.color]="getCellFg(cell?.value)"
                     [attr.aria-label]="cell ? cell.value : 'empty'">
                  @if (cell) {
                    <span class="p2048-cell__value">{{ cell.value }}</span>
                  }
                </div>
              }
            </div>
          }
        </div>
      </app-game-shell>
      <app-high-scores [scores]="scoreService.getScores('2048')" />
    </div>
  `,
  styles: [`
    .p2048-page { max-width: 600px; margin: 0 auto; }
    .p2048-board {
      display: flex;
      flex-direction: column;
      gap: 6px;
      padding: 12px;
      background-color: var(--bg-surface);
      width: 100%;
      aspect-ratio: 1;
      max-height: 100%;
      touch-action: none;
    }
    .p2048-row {
      display: flex;
      gap: 6px;
      flex: 1;
    }
    .p2048-cell {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: var(--bg-raised);
      border: 1px solid var(--border);
      transition: all 0.12s ease;
    }
    .p2048-cell--filled {
      border-color: transparent;
    }
    .p2048-cell--merged {
      animation: pop 0.2s ease;
    }
    .p2048-cell__value {
      font-family: var(--font-pixel);
      font-size: 0.9rem;
    }
    @media (max-width: 480px) {
      .p2048-cell__value { font-size: 0.6rem; }
      .p2048-board { gap: 4px; padding: 8px; }
    }
    @keyframes pop {
      0% { transform: scale(1); }
      50% { transform: scale(1.15); }
      100% { transform: scale(1); }
    }
    @media (prefers-reduced-motion: reduce) {
      .p2048-cell--merged {
        animation: none;
      }
    }
  `],
  host: {
    '(document:keydown)': 'onKeydown($event)',
  },
})
export class Puzzle2048Component {
  @ViewChild('shell') shellRef!: GameShellComponent;

  readonly scoreService = inject(ScoreService);
  private readonly audio = inject(AudioService);
  private readonly stats = inject(StatsService);
  private readonly achievements = inject(AchievementService);
  private readonly a11y = inject(AccessibilityService);

  readonly score = signal(0);
  readonly hiScore = signal(this.scoreService.getHighScore('2048'));
  readonly state = signal<GameState>('idle');
  readonly isNewHigh = signal(false);
  readonly board = signal<Board | null>(null);

  onStart(): void {
    this.audio.init();
    this.audio.play('game-start');
    const b = createBoard();
    this.board.set(b);
    this.score.set(0);
    this.isNewHigh.set(false);
    this.state.set('playing');
    this.stats.startSession('2048');
  }

  onResume(): void {
    this.state.set('playing');
  }

  onKeydown(e: KeyboardEvent): void {
    if (this.state() !== 'playing' && this.state() !== 'paused') return;

    if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
      e.preventDefault();
      if (this.state() === 'playing') {
        this.state.set('paused');
        this.audio.play('pause');
      } else if (this.state() === 'paused') {
        this.onResume();
      }
      return;
    }

    if (this.state() !== 'playing') return;

    const dirMap: Record<string, Direction> = {
      ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
      w: 'up', s: 'down', a: 'left', d: 'right',
    };
    const dir = dirMap[e.key];
    if (dir) {
      e.preventDefault();
      this.doMove(dir);
    }
  }

  onSwipe(dir: string): void {
    if (this.state() !== 'playing') return;
    this.doMove(dir as Direction);
  }

  private doMove(dir: Direction): void {
    const b = this.board();
    if (!b) return;

    const moved = slide(b, dir);
    if (moved) {
      this.audio.play('slide');
      this.score.set(b.score);
      this.board.set({ ...b }); // trigger change detection
      this.shellRef.triggerFlash('score');

      // Announce the highest merged tile
      const maxTile = b.maxTile;
      if (maxTile >= 128) {
        this.a11y.announce(`Merged to ${maxTile}. Score: ${b.score}.`);
      }

      if (b.gameOver) {
        this.onGameOver();
      }
    }
  }

  private onGameOver(): void {
    this.audio.play('game-over');
    this.state.set('game-over');
    this.shellRef.triggerFlash('danger');
    const b = this.board()!;

    const isNew = this.scoreService.submit('2048', b.score);
    this.isNewHigh.set(isNew);
    if (isNew) {
      this.audio.play('high-score');
      this.hiScore.set(b.score);
    }

    this.stats.endSession(b.score);
    this.achievements.check({
      gameId: '2048',
      score: b.score,
      maxTile: b.maxTile,
      moves: b.moves,
      totalGamesPlayed: this.stats.getTotalGamesPlayed(),
    });
  }

  getCellBg(value: number | undefined): string {
    if (!value) return '';
    const palette = this.a11y.highContrast() ? HC_TILE_COLORS : TILE_COLORS;
    return palette[value]?.bg ?? (this.a11y.highContrast() ? '#666600' : '#4a4a0a');
  }

  getCellFg(value: number | undefined): string {
    if (!value) return '';
    const palette = this.a11y.highContrast() ? HC_TILE_COLORS : TILE_COLORS;
    return palette[value]?.fg ?? (this.a11y.highContrast() ? '#ffff00' : '#ffb000');
  }
}
