import { Component, ChangeDetectionStrategy, signal, inject, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { GameShellComponent } from '../../shared/components/game-shell.component';
import { HighScoresComponent } from '../../shared/components/high-scores.component';
import { ScoreService } from '../../core/services/score.service';
import { AudioService } from '../../core/services/audio.service';
import { StatsService } from '../../core/services/stats.service';
import { AchievementService } from '../../core/services/achievement.service';
import { AccessibilityService } from '../../core/services/accessibility.service';
import { GameState } from '../../core/models/game.model';
import { createBreakoutState, movePaddle, tickBreakout, BreakoutState } from './breakout.logic';

const W = 400;
const H = 500;

@Component({
  selector: 'app-breakout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [GameShellComponent, HighScoresComponent],
  template: `
    <div class="breakout-page container">
      <app-game-shell
        #shell
        gameName="Breakout"
        gameId="breakout"
        [score]="score()"
        [hiScore]="hiScore()"
        [state]="state()"
        [isNewHighScore]="isNewHigh()"
        (start)="onStart()"
        (resume)="onResume()"
      >
        <canvas #canvas class="breakout-canvas" [width]="W" [height]="H"
          (pointermove)="onPointerMove($event)"
          (touchmove)="onTouchMove($event)"></canvas>
      </app-game-shell>
      <div class="breakout-lives" role="status" [attr.aria-label]="'Lives remaining: ' + livesArray().length">
        @for (l of livesArray(); track l) {
          <span class="breakout-lives__dot" aria-hidden="true">&#9679;</span>
        }
      </div>
      <app-high-scores [scores]="scoreService.getScores('breakout')" />
    </div>
  `,
  styles: [`
    .breakout-page { max-width: 600px; margin: 0 auto; }
    .breakout-canvas {
      display: block;
      width: 100%;
      height: auto;
      cursor: none;
      touch-action: none;
    }
    .breakout-lives {
      display: flex;
      justify-content: center;
      gap: var(--space-xs);
      padding: var(--space-sm);
      font-size: 1rem;
      color: var(--accent-red);
    }
  `],
  host: {
    '(document:keydown)': 'onKeydown($event)',
    '(document:visibilitychange)': 'onVisibility()',
  },
})
export class BreakoutComponent implements AfterViewInit, OnDestroy {
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('shell') shellRef!: GameShellComponent;

  readonly scoreService = inject(ScoreService);
  private readonly audio = inject(AudioService);
  private readonly stats = inject(StatsService);
  private readonly achievements = inject(AchievementService);
  private readonly a11y = inject(AccessibilityService);

  readonly score = signal(0);
  readonly hiScore = signal(this.scoreService.getHighScore('breakout'));
  readonly state = signal<GameState>('idle');
  readonly isNewHigh = signal(false);
  readonly livesArray = signal<number[]>([1, 2, 3]);

  readonly W = W;
  readonly H = H;

  private ctx!: CanvasRenderingContext2D;
  private gameState!: BreakoutState;
  private animId = 0;

  ngAfterViewInit(): void {
    this.ctx = this.canvasRef.nativeElement.getContext('2d')!;
    this.renderEmpty();
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.animId);
  }

  onStart(): void {
    this.audio.init();
    this.audio.play('game-start');
    this.gameState = createBreakoutState(W, H);
    this.score.set(0);
    this.isNewHigh.set(false);
    this.livesArray.set(Array.from({ length: 3 }, (_, i) => i));
    this.state.set('playing');
    this.stats.startSession('breakout');
    this.loop();
  }

  onResume(): void {
    this.state.set('playing');
    this.loop();
  }

  onPointerMove(e: PointerEvent): void {
    if (this.state() !== 'playing') return;
    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    const scale = W / rect.width;
    movePaddle(this.gameState, (e.clientX - rect.left) * scale);
  }

  onTouchMove(e: TouchEvent): void {
    if (this.state() !== 'playing') return;
    e.preventDefault();
    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    const scale = W / rect.width;
    movePaddle(this.gameState, (e.touches[0].clientX - rect.left) * scale);
  }

  onKeydown(e: KeyboardEvent): void {
    if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
      if (this.state() === 'playing') {
        this.state.set('paused');
        this.audio.play('pause');
        cancelAnimationFrame(this.animId);
      } else if (this.state() === 'paused') {
        this.onResume();
      }
    }
  }

  onVisibility(): void {
    if (document.hidden && this.state() === 'playing') {
      this.state.set('paused');
      cancelAnimationFrame(this.animId);
    }
  }

  private loop(): void {
    if (this.state() !== 'playing') return;

    const result = tickBreakout(this.gameState);
    this.score.set(this.gameState.score);
    this.livesArray.set(Array.from({ length: this.gameState.lives }, (_, i) => i));

    if (result.brickHit) {
      this.audio.play('brick-break');
      this.shellRef.triggerFlash('score');
    }
    if (result.died) {
      this.audio.play('die');
      this.shellRef.triggerFlash('danger');
      this.a11y.announce(`Life lost. ${this.gameState.lives} remaining.`);
    }

    if (this.gameState.gameOver) {
      this.onGameOver();
      return;
    }

    this.render();
    this.animId = requestAnimationFrame(() => this.loop());
  }

  private onGameOver(): void {
    this.audio.play('game-over');
    this.state.set('game-over');
    this.shellRef.triggerFlash('danger');

    const isNew = this.scoreService.submit('breakout', this.gameState.score);
    this.isNewHigh.set(isNew);
    if (isNew) {
      this.audio.play('high-score');
      this.hiScore.set(this.gameState.score);
    }

    this.stats.endSession(this.gameState.score);
    this.achievements.check({
      gameId: 'breakout',
      score: this.gameState.score,
      perfectGame: this.gameState.won,
      noLivesLost: this.gameState.livesLost === 0,
      totalGamesPlayed: this.stats.getTotalGamesPlayed(),
    });

    this.render();
  }

  private render(): void {
    const ctx = this.ctx;
    const hc = this.a11y.highContrast();

    ctx.fillStyle = hc ? '#000000' : '#0a0a0c';
    ctx.fillRect(0, 0, W, H);

    if (!this.gameState) return;

    // Bricks
    for (const b of this.gameState.bricks) {
      if (b.broken) continue;
      ctx.fillStyle = hc ? '#ffffff' : (b.hits > 1 ? '#ffffff' : b.color);
      ctx.fillRect(b.x, b.y, b.width, b.height);
      ctx.strokeStyle = hc ? '#000000' : '#0a0a0c';
      ctx.lineWidth = hc ? 2 : 1;
      ctx.strokeRect(b.x, b.y, b.width, b.height);
    }

    // Paddle
    ctx.fillStyle = hc ? '#ffffff' : '#00ff41';
    if (!hc) {
      ctx.shadowColor = '#00ff41';
      ctx.shadowBlur = 8;
    }
    ctx.fillRect(this.gameState.paddle.x, this.gameState.paddle.y, this.gameState.paddle.width, this.gameState.paddle.height);
    ctx.shadowBlur = 0;

    // Ball
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(this.gameState.ball.x, this.gameState.ball.y, this.gameState.ball.radius, 0, Math.PI * 2);
    ctx.fill();
    if (hc) {
      ctx.strokeStyle = '#ffff00';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }

  private renderEmpty(): void {
    this.ctx.fillStyle = this.a11y.highContrast() ? '#000000' : '#0a0a0c';
    this.ctx.fillRect(0, 0, W, H);
  }
}
