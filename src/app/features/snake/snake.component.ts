import { Component, ChangeDetectionStrategy, signal, inject, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { GameShellComponent } from '../../shared/components/game-shell.component';
import { TouchControlsComponent } from '../../shared/components/touch-controls.component';
import { HighScoresComponent } from '../../shared/components/high-scores.component';
import { ScoreService } from '../../core/services/score.service';
import { AudioService } from '../../core/services/audio.service';
import { StatsService } from '../../core/services/stats.service';
import { AchievementService } from '../../core/services/achievement.service';
import { GameState } from '../../core/models/game.model';
import { createSnakeState, setDirection, tick, SnakeState, Direction } from './snake.logic';

const COLS = 20;
const ROWS = 20;
const TICK_MS = 150;

@Component({
  selector: 'app-snake',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [GameShellComponent, TouchControlsComponent, HighScoresComponent],
  template: `
    <div class="snake-page container">
      <app-game-shell
        gameName="Snake"
        [score]="score()"
        [hiScore]="hiScore()"
        [state]="state()"
        [isNewHighScore]="isNewHigh()"
        (start)="onStart()"
        (resume)="onResume()"
      >
        <canvas #canvas class="snake-canvas" [width]="canvasW" [height]="canvasH"></canvas>
      </app-game-shell>
      <app-touch-controls layout="dpad" (action)="onTouch($event)" />
      <app-high-scores [scores]="scoreService.getScores('snake')" />
    </div>
  `,
  styles: [`
    .snake-page { max-width: 600px; margin: 0 auto; }
    .snake-canvas {
      display: block;
      width: 100%;
      height: auto;
      image-rendering: pixelated;
    }
  `],
  host: {
    '(document:keydown)': 'onKeydown($event)',
    '(document:visibilitychange)': 'onVisibility()',
  },
})
export class SnakeComponent implements AfterViewInit, OnDestroy {
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  readonly scoreService = inject(ScoreService);
  private readonly audio = inject(AudioService);
  private readonly stats = inject(StatsService);
  private readonly achievements = inject(AchievementService);

  readonly score = signal(0);
  readonly hiScore = signal(this.scoreService.getHighScore('snake'));
  readonly state = signal<GameState>('idle');
  readonly isNewHigh = signal(false);

  readonly canvasW = COLS * 20;
  readonly canvasH = ROWS * 20;

  private ctx!: CanvasRenderingContext2D;
  private gameState!: SnakeState;
  private animId = 0;
  private lastTick = 0;

  ngAfterViewInit(): void {
    this.ctx = this.canvasRef.nativeElement.getContext('2d')!;
    this.renderIdle();
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.animId);
  }

  onStart(): void {
    this.audio.init();
    this.audio.play('game-start');
    this.gameState = createSnakeState(COLS, ROWS);
    this.score.set(0);
    this.isNewHigh.set(false);
    this.state.set('playing');
    this.stats.startSession('snake');
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

    const dirMap: Record<string, Direction> = {
      ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
      w: 'up', s: 'down', a: 'left', d: 'right',
    };

    if (e.key === 'Escape' || e.key === 'p') {
      e.preventDefault();
      if (this.state() === 'playing') {
        this.state.set('paused');
        this.audio.play('pause');
        cancelAnimationFrame(this.animId);
      } else if (this.state() === 'paused') {
        this.onResume();
      }
      return;
    }

    const dir = dirMap[e.key];
    if (dir && this.state() === 'playing') {
      e.preventDefault();
      setDirection(this.gameState, dir);
    }
  }

  onTouch(action: string): void {
    if (this.state() === 'playing') {
      setDirection(this.gameState, action as Direction);
    }
  }

  onVisibility(): void {
    if (document.hidden && this.state() === 'playing') {
      this.state.set('paused');
      this.audio.play('pause');
      cancelAnimationFrame(this.animId);
    }
  }

  private loop(ts: number): void {
    if (this.state() !== 'playing') return;

    if (ts - this.lastTick >= TICK_MS) {
      this.lastTick = ts;
      const result = tick(this.gameState);

      if (result.died) {
        this.onGameOver();
        return;
      }
      if (result.ate) {
        this.audio.play('eat');
        this.score.set(this.gameState.score);
      }
    }

    this.render();
    this.animId = requestAnimationFrame((t) => this.loop(t));
  }

  private onGameOver(): void {
    this.audio.play('die');
    this.state.set('game-over');
    const finalScore = this.gameState.score;
    this.score.set(finalScore);

    const isNew = this.scoreService.submit('snake', finalScore);
    this.isNewHigh.set(isNew);
    if (isNew) {
      this.audio.play('high-score');
      this.hiScore.set(finalScore);
    }

    this.stats.endSession(finalScore);
    this.achievements.check({
      gameId: 'snake',
      score: finalScore,
      snakeLength: this.gameState.snake.length,
      totalGamesPlayed: this.stats.getTotalGamesPlayed(),
    });

    this.render();
  }

  private render(): void {
    const ctx = this.ctx;
    const cellW = this.canvasW / COLS;
    const cellH = this.canvasH / ROWS;

    // Background
    ctx.fillStyle = '#0a0a0c';
    ctx.fillRect(0, 0, this.canvasW, this.canvasH);

    // Grid lines
    ctx.strokeStyle = '#111114';
    ctx.lineWidth = 0.5;
    for (let x = 0; x <= COLS; x++) {
      ctx.beginPath();
      ctx.moveTo(x * cellW, 0);
      ctx.lineTo(x * cellW, this.canvasH);
      ctx.stroke();
    }
    for (let y = 0; y <= ROWS; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * cellH);
      ctx.lineTo(this.canvasW, y * cellH);
      ctx.stroke();
    }

    if (!this.gameState) return;

    // Food
    ctx.fillStyle = '#ff3333';
    ctx.fillRect(this.gameState.food.x * cellW + 2, this.gameState.food.y * cellH + 2, cellW - 4, cellH - 4);

    // Snake
    for (let i = 0; i < this.gameState.snake.length; i++) {
      const seg = this.gameState.snake[i];
      ctx.fillStyle = i === 0 ? '#00ff41' : '#00cc33';
      ctx.fillRect(seg.x * cellW + 1, seg.y * cellH + 1, cellW - 2, cellH - 2);
    }
  }

  private renderIdle(): void {
    const ctx = this.ctx;
    ctx.fillStyle = '#0a0a0c';
    ctx.fillRect(0, 0, this.canvasW, this.canvasH);
  }
}
