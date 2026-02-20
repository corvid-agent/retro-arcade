import {
  Component, ChangeDetectionStrategy, input, output, inject, signal,
  effect, OnDestroy, ElementRef, viewChildren, AfterViewInit,
} from '@angular/core';
import { GameId, GameState } from '../../core/models/game.model';
import { GameModeService } from '../../core/services/game-mode.service';
import { ScoreService } from '../../core/services/score.service';
import { AccessibilityService } from '../../core/services/accessibility.service';

@Component({
  selector: 'app-game-shell',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.game-shell--immersive]': 'gameMode.immersive()',
    '[class.game-shell--high-contrast]': 'a11y.highContrast()',
  },
  template: `
    <div class="game-shell">
      <div class="game-shell__bar">
        <span class="game-shell__name">{{ gameName() }}</span>
        <span class="game-shell__score">SCORE: <strong class="text-glow">{{ score() }}</strong></span>
        <span class="game-shell__hi">HI: {{ hiScore() }}</span>
      </div>

      <!-- Screen reader announcements -->
      <div class="sr-only" aria-live="polite" aria-atomic="true">{{ a11y.srAnnouncement() }}</div>

      <!-- Accessibility toolbar -->
      <div class="game-shell__a11y-bar" role="toolbar" aria-label="Accessibility options">
        <button class="game-shell__a11y-btn"
                (click)="a11y.toggleHighContrast()"
                [attr.aria-pressed]="a11y.highContrast()"
                aria-label="Toggle high contrast mode">
          HC
        </button>
        <button class="game-shell__a11y-btn"
                (click)="a11y.cycleGameSpeed()"
                [attr.aria-label]="'Game speed: ' + a11y.gameSpeed() + '. Click to cycle.'">
          SPD:{{ a11y.gameSpeed().toUpperCase() }}
        </button>
        <button class="game-shell__a11y-btn"
                (click)="a11y.toggleVisualIndicators()"
                [attr.aria-pressed]="a11y.visualIndicators()"
                aria-label="Toggle visual indicators for sound effects">
          VFX
        </button>
      </div>

      <div class="game-shell__area" role="application" [attr.aria-label]="gameName() + ' game area'">
        <ng-content />

        <!-- Visual flash indicator overlay -->
        @if (flashVisible()) {
          <div class="game-shell__flash" [class]="'game-shell__flash--' + flashType()" aria-hidden="true"></div>
        }

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
                  <label class="game-shell__initials-label" for="initials-input">ENTER YOUR INITIALS</label>
                  <input
                    #initialsInput
                    id="initials-input"
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

    /* High contrast host overrides */
    :host(.game-shell--high-contrast) .game-shell__area {
      border-color: #ffffff;
      border-width: 2px;
    }
    :host(.game-shell--high-contrast) .game-shell__bar {
      border-color: #ffffff;
      background-color: #000000;
      color: #ffffff;
    }
    :host(.game-shell--high-contrast) .game-shell__score strong {
      color: #ffff00;
    }
    :host(.game-shell--high-contrast) .game-shell__hi {
      color: #ffff00;
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

    /* Accessibility toolbar */
    .game-shell__a11y-bar {
      display: flex;
      justify-content: center;
      gap: var(--space-xs);
      padding: var(--space-xs) var(--space-md);
      margin-bottom: var(--space-xs);
    }
    .game-shell__a11y-btn {
      font-family: var(--font-pixel);
      font-size: 0.4rem;
      padding: 6px 10px;
      background: transparent;
      border: 1px solid var(--border);
      color: var(--text-secondary);
      cursor: pointer;
      text-transform: uppercase;
      min-height: 44px;
      min-width: 44px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      transition: all var(--transition-fast);
    }
    .game-shell__a11y-btn:hover {
      border-color: var(--accent-primary);
      color: var(--accent-primary);
    }
    .game-shell__a11y-btn[aria-pressed='true'] {
      background-color: var(--accent-primary-dim);
      border-color: var(--accent-primary);
      color: var(--accent-primary);
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

    /* Visual flash indicator */
    .game-shell__flash {
      position: absolute;
      inset: 0;
      pointer-events: none;
      z-index: 5;
      animation: flash-pulse 0.3s ease-out forwards;
    }
    .game-shell__flash--score {
      background-color: rgba(0, 255, 65, 0.2);
    }
    .game-shell__flash--danger {
      background-color: rgba(255, 51, 51, 0.25);
    }
    .game-shell__flash--success {
      background-color: rgba(255, 176, 0, 0.2);
    }
    .game-shell__flash--action {
      background-color: rgba(0, 229, 255, 0.15);
    }
    @keyframes flash-pulse {
      0% { opacity: 1; }
      100% { opacity: 0; }
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
    /* Screen reader only utility */
    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      margin: -1px;
      padding: 0;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }
    @media (max-width: 768px) {
      .game-shell { padding: var(--space-md) 0; }
      .game-shell__area { min-height: 300px; }
    }
    @media (prefers-reduced-motion: reduce) {
      .game-shell__flash {
        animation: none;
        display: none;
      }
    }
  `],
})
export class GameShellComponent implements OnDestroy {
  protected readonly gameMode = inject(GameModeService);
  private readonly scoreService = inject(ScoreService);
  readonly a11y = inject(AccessibilityService);

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

  /** Visual flash indicator state */
  flashVisible = signal(false);
  flashType = signal<'score' | 'danger' | 'success' | 'action'>('score');

  private readonly overlayBtns = viewChildren<ElementRef<HTMLButtonElement>>('overlayBtn');
  private flashTimeout: ReturnType<typeof setTimeout> | null = null;

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

    // Announce game state changes to screen readers
    effect(() => {
      const s = this.state();
      const name = this.gameName();
      switch (s) {
        case 'playing':
          this.a11y.announce(`${name} game started. Use Escape or P to pause.`);
          break;
        case 'paused':
          this.a11y.announce(`${name} paused. Press Resume to continue.`);
          break;
        case 'game-over':
          this.a11y.announce(`Game over. Final score: ${this.score()}.`);
          break;
      }
    });

    // Announce score changes
    effect(() => {
      const s = this.score();
      const state = this.state();
      if (s > 0 && state === 'playing') {
        this.a11y.announce(`Score: ${s}`);
      }
    });
  }

  ngOnDestroy(): void {
    this.gameMode.exitGame();
    if (this.flashTimeout) clearTimeout(this.flashTimeout);
  }

  /** Trigger a visual flash effect (called by game components alongside audio). */
  triggerFlash(type: 'score' | 'danger' | 'success' | 'action' = 'score'): void {
    if (!this.a11y.visualIndicators()) return;
    if (this.flashTimeout) clearTimeout(this.flashTimeout);
    this.flashType.set(type);
    this.flashVisible.set(true);
    this.flashTimeout = setTimeout(() => this.flashVisible.set(false), 350);
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
      const focusable = overlay.querySelectorAll<HTMLElement>('button, input, [href], [tabindex]:not([tabindex="-1"])');
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
