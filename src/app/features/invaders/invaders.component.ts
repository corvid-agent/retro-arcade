import { Component, ChangeDetectionStrategy, signal, inject, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { GameShellComponent } from '../../shared/components/game-shell.component';
import { TouchControlsComponent } from '../../shared/components/touch-controls.component';
import { HighScoresComponent } from '../../shared/components/high-scores.component';
import { ScoreService } from '../../core/services/score.service';
import { AudioService } from '../../core/services/audio.service';
import { StatsService } from '../../core/services/stats.service';
import { AchievementService } from '../../core/services/achievement.service';
import { GameState } from '../../core/models/game.model';
import { createInvadersState, movePlayer, playerShoot, tickInvaders, InvadersState } from './invaders.logic';

const W = 400;
const H = 500;

@Component({
  selector: 'app-invaders',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [GameShellComponent, TouchControlsComponent, HighScoresComponent],
  template: `
    <div class="invaders-page container">
      <app-game-shell
        gameName="Invaders"
        gameId="invaders"
        [score]="score()"
        [hiScore]="hiScore()"
        [state]="state()"
        [isNewHighScore]="isNewHigh()"
        (start)="onStart()"
        (resume)="onResume()"
      >
        <canvas #canvas class="invaders-canvas" [width]="W" [height]="H"></canvas>
      </app-game-shell>
      <div class="invaders-lives">
        @for (l of livesArray(); track l) {
          <span class="invaders-lives__icon">&#9650;</span>
        }
      </div>
      <app-touch-controls layout="left-right-fire" (action)="onTouch($event)" />
      <app-high-scores [scores]="scoreService.getScores('invaders')" />
    </div>
  `,
  styles: [`
    .invaders-page { max-width: 600px; margin: 0 auto; }
    .invaders-canvas {
      display: block;
      width: 100%;
      height: auto;
      image-rendering: pixelated;
    }
    .invaders-lives {
      display: flex;
      justify-content: center;
      gap: var(--space-xs);
      padding: var(--space-sm);
      font-size: 0.8rem;
      color: var(--accent-primary);
    }
  `],
  host: {
    '(document:keydown)': 'onKeydown($event)',
    '(document:keyup)': 'onKeyup($event)',
    '(document:visibilitychange)': 'onVisibility()',
  },
})
export class InvadersComponent implements AfterViewInit, OnDestroy {
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  readonly scoreService = inject(ScoreService);
  private readonly audio = inject(AudioService);
  private readonly stats = inject(StatsService);
  private readonly achievements = inject(AchievementService);

  readonly score = signal(0);
  readonly hiScore = signal(this.scoreService.getHighScore('invaders'));
  readonly state = signal<GameState>('idle');
  readonly isNewHigh = signal(false);
  readonly livesArray = signal<number[]>([0, 1, 2]);

  readonly W = W;
  readonly H = H;

  private ctx!: CanvasRenderingContext2D;
  private gameState!: InvadersState;
  private animId = 0;
  private keys = new Set<string>();

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
    this.gameState = createInvadersState(W, H);
    this.score.set(0);
    this.isNewHigh.set(false);
    this.livesArray.set([0, 1, 2]);
    this.state.set('playing');
    this.stats.startSession('invaders');
    this.loop();
  }

  onResume(): void {
    this.state.set('playing');
    this.loop();
  }

  onKeydown(e: KeyboardEvent): void {
    if (e.key === 'Escape' || e.key === 'p') {
      if (this.state() === 'playing') {
        this.state.set('paused');
        this.audio.play('pause');
        cancelAnimationFrame(this.animId);
      } else if (this.state() === 'paused') {
        this.onResume();
      }
      return;
    }
    this.keys.add(e.key);
  }

  onKeyup(e: KeyboardEvent): void {
    this.keys.delete(e.key);
  }

  onTouch(action: string): void {
    if (this.state() !== 'playing') return;
    if (action === 'left') movePlayer(this.gameState, 'left');
    if (action === 'right') movePlayer(this.gameState, 'right');
    if (action === 'fire') {
      if (playerShoot(this.gameState)) this.audio.play('shoot');
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

    // Process held keys
    if (this.keys.has('ArrowLeft') || this.keys.has('a')) movePlayer(this.gameState, 'left');
    if (this.keys.has('ArrowRight') || this.keys.has('d')) movePlayer(this.gameState, 'right');
    if (this.keys.has(' ') || this.keys.has('ArrowUp')) {
      if (playerShoot(this.gameState)) this.audio.play('shoot');
    }

    const result = tickInvaders(this.gameState);
    this.score.set(this.gameState.score);
    this.livesArray.set(Array.from({ length: this.gameState.lives }, (_, i) => i));

    if (result.hit) this.audio.play('hit');
    if (result.playerHit) this.audio.play('explosion');

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

    const isNew = this.scoreService.submit('invaders', this.gameState.score);
    this.isNewHigh.set(isNew);
    if (isNew) {
      this.audio.play('high-score');
      this.hiScore.set(this.gameState.score);
    }

    this.stats.endSession(this.gameState.score);
    this.achievements.check({
      gameId: 'invaders',
      score: this.gameState.score,
      perfectGame: this.gameState.won,
      totalGamesPlayed: this.stats.getTotalGamesPlayed(),
    });

    this.render();
  }

  private render(): void {
    const ctx = this.ctx;
    ctx.fillStyle = '#0a0a0c';
    ctx.fillRect(0, 0, W, H);

    if (!this.gameState) return;

    // Shields
    for (const shield of this.gameState.shields) {
      ctx.fillStyle = '#00ff41';
      for (let y = 0; y < shield.height; y++) {
        for (let x = 0; x < shield.width; x++) {
          if (shield.pixels[y][x]) {
            ctx.fillRect(shield.x + x, shield.y + y, 1, 1);
          }
        }
      }
    }

    // Aliens
    const alienColors = ['#00ff41', '#00e5ff', '#ffb000'];
    for (const alien of this.gameState.aliens) {
      if (!alien.alive) continue;
      ctx.fillStyle = alienColors[alien.type];
      ctx.fillRect(alien.x + 2, alien.y + 2, 20, 8);
      ctx.fillRect(alien.x + 6, alien.y + 10, 12, 6);
      ctx.fillRect(alien.x, alien.y + 16, 6, 4);
      ctx.fillRect(alien.x + 18, alien.y + 16, 6, 4);
    }

    // Player
    ctx.fillStyle = '#00ff41';
    ctx.shadowColor = '#00ff41';
    ctx.shadowBlur = 6;
    const px = this.gameState.player.x;
    const py = this.gameState.player.y;
    ctx.fillRect(px, py + 4, this.gameState.player.width, 8);
    ctx.fillRect(px + 14, py, 8, 4);
    ctx.shadowBlur = 0;

    // Player bullets
    ctx.fillStyle = '#ffffff';
    for (const b of this.gameState.playerBullets) {
      ctx.fillRect(b.x - 1, b.y, 2, 8);
    }

    // Alien bullets
    ctx.fillStyle = '#ff3333';
    for (const b of this.gameState.alienBullets) {
      ctx.fillRect(b.x - 1, b.y, 2, 8);
    }
  }

  private renderEmpty(): void {
    this.ctx.fillStyle = '#0a0a0c';
    this.ctx.fillRect(0, 0, W, H);
  }
}
