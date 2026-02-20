import { Component, ChangeDetectionStrategy, signal, inject, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { GameShellComponent } from '../../shared/components/game-shell.component';
import { TouchControlsComponent } from '../../shared/components/touch-controls.component';
import { HighScoresComponent } from '../../shared/components/high-scores.component';
import { ScoreService } from '../../core/services/score.service';
import { AudioService } from '../../core/services/audio.service';
import { StatsService } from '../../core/services/stats.service';
import { AchievementService } from '../../core/services/achievement.service';
import { GameState } from '../../core/models/game.model';
import {
  COLS, ROWS, PIECE_COLORS,
  createTetrisState, moveLeft, moveRight, moveDown, rotate, hardDrop,
  lockAndSpawn, getAbsoluteCells, getGhostY, getTickInterval, TetrisState,
} from './tetris.logic';

const CELL = 24;

@Component({
  selector: 'app-tetris',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [GameShellComponent, TouchControlsComponent, HighScoresComponent],
  template: `
    <div class="tetris-page container">
      <app-game-shell
        gameName="Tetris"
        gameId="tetris"
        [score]="score()"
        [hiScore]="hiScore()"
        [state]="state()"
        [isNewHighScore]="isNewHigh()"
        (start)="onStart()"
        (resume)="onResume()"
      >
        <canvas #canvas class="tetris-canvas" [width]="canvasW" [height]="canvasH"></canvas>
      </app-game-shell>
      <div class="tetris-info">
        <span class="tetris-info__label">LEVEL: {{ level() }}</span>
        <span class="tetris-info__label">LINES: {{ lines() }}</span>
      </div>
      <app-touch-controls layout="tetris" (action)="onTouch($event)" />
      <app-high-scores [scores]="scoreService.getScores('tetris')" />
    </div>
  `,
  styles: [`
    .tetris-page { max-width: 600px; margin: 0 auto; }
    .tetris-canvas {
      display: block;
      width: 100%;
      height: auto;
      image-rendering: pixelated;
    }
    .tetris-info {
      display: flex;
      justify-content: center;
      gap: var(--space-lg);
      padding: var(--space-sm);
      font-family: var(--font-pixel);
      font-size: 0.5rem;
      color: var(--text-secondary);
    }
  `],
  host: {
    '(document:keydown)': 'onKeydown($event)',
    '(document:visibilitychange)': 'onVisibility()',
  },
})
export class TetrisComponent implements AfterViewInit, OnDestroy {
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  readonly scoreService = inject(ScoreService);
  private readonly audio = inject(AudioService);
  private readonly stats = inject(StatsService);
  private readonly achievements = inject(AchievementService);

  readonly score = signal(0);
  readonly hiScore = signal(this.scoreService.getHighScore('tetris'));
  readonly state = signal<GameState>('idle');
  readonly isNewHigh = signal(false);
  readonly level = signal(1);
  readonly lines = signal(0);

  readonly canvasW = COLS * CELL;
  readonly canvasH = ROWS * CELL;

  private ctx!: CanvasRenderingContext2D;
  private gameState!: TetrisState;
  private animId = 0;
  private lastTick = 0;

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
    this.gameState = createTetrisState();
    this.score.set(0);
    this.level.set(1);
    this.lines.set(0);
    this.isNewHigh.set(false);
    this.state.set('playing');
    this.stats.startSession('tetris');
    this.lastTick = performance.now();
    this.loop(this.lastTick);
  }

  onResume(): void {
    this.state.set('playing');
    this.lastTick = performance.now();
    this.loop(this.lastTick);
  }

  onKeydown(e: KeyboardEvent): void {
    if (this.state() !== 'playing' && this.state() !== 'paused') return;

    if (e.key === 'Escape' || e.key === 'p') {
      e.preventDefault();
      if (this.state() === 'playing') { this.pause(); } else { this.onResume(); }
      return;
    }

    if (this.state() !== 'playing') return;

    switch (e.key) {
      case 'ArrowLeft':
      case 'a':
        e.preventDefault();
        if (moveLeft(this.gameState)) this.audio.play('move');
        break;
      case 'ArrowRight':
      case 'd':
        e.preventDefault();
        if (moveRight(this.gameState)) this.audio.play('move');
        break;
      case 'ArrowDown':
      case 's':
        e.preventDefault();
        if (moveDown(this.gameState)) {
          this.gameState.score += 1;
          this.score.set(this.gameState.score);
        }
        break;
      case 'ArrowUp':
      case 'w':
        e.preventDefault();
        if (rotate(this.gameState)) this.audio.play('rotate');
        break;
      case ' ':
        e.preventDefault();
        const dropped = hardDrop(this.gameState);
        this.gameState.score += dropped * 2;
        this.score.set(this.gameState.score);
        this.audio.play('drop');
        this.lockPiece();
        break;
    }
  }

  onTouch(action: string): void {
    if (this.state() !== 'playing') return;
    switch (action) {
      case 'left': if (moveLeft(this.gameState)) this.audio.play('move'); break;
      case 'right': if (moveRight(this.gameState)) this.audio.play('move'); break;
      case 'down': moveDown(this.gameState); break;
      case 'up': if (rotate(this.gameState)) this.audio.play('rotate'); break;
      case 'drop':
        hardDrop(this.gameState);
        this.audio.play('drop');
        this.lockPiece();
        break;
    }
  }

  onVisibility(): void {
    if (document.hidden && this.state() === 'playing') this.pause();
  }

  private pause(): void {
    this.state.set('paused');
    this.audio.play('pause');
    cancelAnimationFrame(this.animId);
  }

  private loop(ts: number): void {
    if (this.state() !== 'playing') return;

    const tickMs = getTickInterval(this.gameState.level);
    if (ts - this.lastTick >= tickMs) {
      this.lastTick = ts;
      if (!moveDown(this.gameState)) {
        this.lockPiece();
      }
    }

    this.render();
    this.animId = requestAnimationFrame((t) => this.loop(t));
  }

  private lockPiece(): void {
    const cleared = lockAndSpawn(this.gameState);
    this.score.set(this.gameState.score);
    this.level.set(this.gameState.level);
    this.lines.set(this.gameState.linesCleared);

    if (cleared === 4) {
      this.audio.play('tetris');
    } else if (cleared > 0) {
      this.audio.play('line-clear');
    }

    if (this.gameState.gameOver) {
      this.onGameOver();
    }
  }

  private onGameOver(): void {
    this.audio.play('game-over');
    this.state.set('game-over');
    cancelAnimationFrame(this.animId);

    const isNew = this.scoreService.submit('tetris', this.gameState.score, this.gameState.level);
    this.isNewHigh.set(isNew);
    if (isNew) {
      this.audio.play('high-score');
      this.hiScore.set(this.gameState.score);
    }

    this.stats.endSession(this.gameState.score);
    this.achievements.check({
      gameId: 'tetris',
      score: this.gameState.score,
      level: this.gameState.level,
      linesCleared: this.gameState.linesCleared,
      totalGamesPlayed: this.stats.getTotalGamesPlayed(),
    });
  }

  private render(): void {
    const ctx = this.ctx;
    ctx.fillStyle = '#0a0a0c';
    ctx.fillRect(0, 0, this.canvasW, this.canvasH);

    // Grid
    ctx.strokeStyle = '#111114';
    ctx.lineWidth = 0.5;
    for (let x = 0; x <= COLS; x++) {
      ctx.beginPath(); ctx.moveTo(x * CELL, 0); ctx.lineTo(x * CELL, this.canvasH); ctx.stroke();
    }
    for (let y = 0; y <= ROWS; y++) {
      ctx.beginPath(); ctx.moveTo(0, y * CELL); ctx.lineTo(this.canvasW, y * CELL); ctx.stroke();
    }

    if (!this.gameState) return;

    // Placed blocks
    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        const cell = this.gameState.board[y][x];
        if (cell) {
          ctx.fillStyle = PIECE_COLORS[cell];
          ctx.fillRect(x * CELL + 1, y * CELL + 1, CELL - 2, CELL - 2);
        }
      }
    }

    // Ghost piece (landing preview)
    const ghostY = getGhostY(this.gameState);
    if (ghostY !== this.gameState.currentPos.y) {
      const ghostCells = getAbsoluteCells(this.gameState.current, { x: this.gameState.currentPos.x, y: ghostY });
      ctx.strokeStyle = PIECE_COLORS[this.gameState.current.type];
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.35;
      for (const c of ghostCells) {
        if (c.y >= 0) {
          ctx.strokeRect(c.x * CELL + 2, c.y * CELL + 2, CELL - 4, CELL - 4);
        }
      }
      ctx.globalAlpha = 1;
    }

    // Current piece
    const cells = getAbsoluteCells(this.gameState.current, this.gameState.currentPos);
    ctx.fillStyle = PIECE_COLORS[this.gameState.current.type];
    for (const c of cells) {
      if (c.y >= 0) {
        ctx.fillRect(c.x * CELL + 1, c.y * CELL + 1, CELL - 2, CELL - 2);
      }
    }
  }

  private renderEmpty(): void {
    this.ctx.fillStyle = '#0a0a0c';
    this.ctx.fillRect(0, 0, this.canvasW, this.canvasH);
  }
}
