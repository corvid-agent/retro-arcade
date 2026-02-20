import {
  Component, ChangeDetectionStrategy, input, output, inject, signal,
  effect, OnDestroy, ElementRef, viewChildren, AfterViewInit,
} from '@angular/core';
import { GameId, GameState } from '../../core/models/game.model';
import { GameModeService } from '../../core/services/game-mode.service';
import { ScoreService } from '../../core/services/score.service';

@Component({
  selector: 'app-game-shell',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.game-shell--immersive]': 'gameMode.immersive()',
  },
  template: `
    <div class="game-shell">
      <div class="game-shell__bar" aria-live="polite">
        <span class="game-shell__name">{{ gameName() }}</span>
        <span class="game-shell__score">SCORE: <strong class="text-glow">{{ score() }}</strong></span>
        <span class="game-shell__hi">HI: {{ hiScore() }}</span>
      </div>

      <div class="game-shell__area" role="application" [attr.aria-label]="gameName() + ' game area'">
        <ng-content />

        @if (state() === 'idle') {
          <div class="game-shell__overlay" (keydown)="trapFocus($event)">
            <h2 class="text-glow">{{ gameName() }}</h2>
            <button #overlayBtn class="btn btn--filled" (click)="start.emit()">START</button>
          </div>
        }

        @if (state() === 'paused') {
          <div class="game-shell__overlay" (keydown)="trapFocus($event)">
            <h2 class="text-glow-amber">PAUSED</h2>
            <button #overlayBtn class="btn btn--amber" (click)="resume.emit()">RESUME</button>
          </div>
        }

        @if (state() === 'game-over') {
          <div class="game-shell__overlay" (keydown)="trapFocus($event)">
            <h2 class="text-glow">GAME OVER</h2>
            <p class="game-shell__final-score">SCORE: {{ score() }}</p>
            @if (isNewHighScore()) {
              <p class="game-shell__new-hi text-glow-amber">NEW HIGH SCORE!</p>
              @if (!initialsSubmitted()) {
                <div class="game-shell__initials">
                  <label class="game-shell__initials-label">ENTER YOUR INITIALS</label>
                  <input
                    #initialsInput
                    class="game-shell__initials-input"
                    type="text"
                    maxlength="3"
                    [value]="defaultInitials"
                    (keydown.enter)="submitInitials(initialsInput.value)"
                    (input)="initialsInput.value = initialsInput.value.toUpperCase().replace(/[^A-Z0-9]/g, '')"
                    autocomplete="off"
                    spellcheck="false"
                  />
                  <button class="btn btn--amber btn--sm" (click)="submitInitials(initialsInput.value)">OK</button>
                </div>
              } @else {
                <p class="game-shell__initials-done">{{ savedInitials() }}</p>
              }
            }
            <button #overlayBtn class="btn btn--filled" (click)="start.emit()">PLAY AGAIN</button>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
    :host(.game-shell--immersive) {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-height: 0;
    }
    :host(.game-shell--immersive) .game-shell {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-height: 0;
      max-width: 100%;
      padding: 0;
    }
    :host(.game-shell--immersive) .game-shell__bar {
      padding-top: calc(var(--safe-top) + var(--space-sm));
      border-left: none;
      border-right: none;
      border-top: none;
      margin-bottom: 0;
      flex-shrink: 0;
    }
    :host(.game-shell--immersive) .game-shell__area {
      flex: 1;
      border-left: none;
      border-right: none;
      min-height: 0;
      overflow: hidden;
    }
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
    .game-shell__initials {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--space-sm);
    }
    .game-shell__initials-label {
      font-family: var(--font-pixel);
      font-size: 0.45rem;
      color: var(--text-tertiary);
      letter-spacing: 1px;
    }
    .game-shell__initials-input {
      width: 100px;
      text-align: center;
      font-family: var(--font-pixel);
      font-size: 1rem;
      letter-spacing: 6px;
      padding: var(--space-sm) var(--space-md);
      background: var(--bg-deep);
      border: 2px solid var(--accent-amber);
      color: var(--accent-amber);
      outline: none;
    }
    .game-shell__initials-input:focus {
      border-color: var(--accent-primary);
      box-shadow: 0 0 8px var(--accent-primary);
    }
    .game-shell__initials-done {
      font-family: var(--font-pixel);
      font-size: 0.8rem;
      color: var(--accent-amber);
      letter-spacing: 6px;
    }
    .btn--sm {
      font-size: 0.5rem;
      padding: var(--space-xs) var(--space-md);
    }
    @media (max-width: 768px) {
      .game-shell { padding: var(--space-md) 0; }
      .game-shell__area { min-height: 300px; }
    }
  `],
})
export class GameShellComponent implements OnDestroy {
  protected readonly gameMode = inject(GameModeService);
  private readonly scoreService = inject(ScoreService);

  gameName = input.required<string>();
  gameId = input<GameId>();
  score = input(0);
  hiScore = input(0);
  state = input<GameState>('idle');
  isNewHighScore = input(false);

  start = output<void>();
  resume = output<void>();

  initialsSubmitted = signal(false);
  savedInitials = signal('');
  defaultInitials = this.scoreService.getLastInitials();

  private readonly overlayBtns = viewChildren<ElementRef<HTMLButtonElement>>('overlayBtn');

  constructor() {
    // Enter/exit immersive mode based on game state
    effect(() => {
      const s = this.state();
      if (s === 'playing') {
        this.gameMode.enterGame();
        this.initialsSubmitted.set(false);
        this.savedInitials.set('');
      } else {
        this.gameMode.exitGame();
      }
    });

    // Auto-focus overlay buttons when state changes to non-playing
    effect(() => {
      const s = this.state();
      if (s === 'idle' || s === 'paused' || s === 'game-over') {
        // Delay to allow the template to render
        setTimeout(() => {
          const btns = this.overlayBtns();
          if (btns.length > 0) {
            btns[0].nativeElement.focus();
          }
        });
      }
    });
  }

  ngOnDestroy(): void {
    this.gameMode.exitGame();
  }

  submitInitials(raw: string): void {
    const clean = raw.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 3);
    if (!clean) return;
    const gid = this.gameId();
    if (gid) {
      this.scoreService.updateLatestInitials(gid, clean);
    }
    this.savedInitials.set(clean);
    this.initialsSubmitted.set(true);
  }

  trapFocus(e: KeyboardEvent): void {
    if (e.key === 'Tab') {
      const overlay = (e.target as HTMLElement).closest('.game-shell__overlay');
      if (!overlay) return;
      const focusable = overlay.querySelectorAll<HTMLElement>('button, [href], [tabindex]:not([tabindex="-1"])');
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }
}
