import { Component, ChangeDetectionStrategy, input, output, OnDestroy } from '@angular/core';

export type TouchLayout = 'dpad' | 'tetris' | 'left-right-fire' | 'slider' | 'none';

@Component({
  selector: 'app-touch-controls',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @switch (layout()) {
      @case ('dpad') {
        <div class="touch touch--dpad">
          <button class="touch__dir touch__dir--up"
                  (pointerdown)="emitOnce('up')" aria-label="Up">&uarr;</button>
          <div class="touch__dir-row">
            <button class="touch__dir"
                    (pointerdown)="emitOnce('left')" aria-label="Left">&larr;</button>
            <button class="touch__dir"
                    (pointerdown)="emitOnce('right')" aria-label="Right">&rarr;</button>
          </div>
          <button class="touch__dir touch__dir--down"
                  (pointerdown)="emitOnce('down')" aria-label="Down">&darr;</button>
        </div>
      }
      @case ('tetris') {
        <div class="touch touch--tetris">
          <div class="touch__move-group">
            <button class="touch__btn"
                    (pointerdown)="startRepeat('left')"
                    (pointerup)="stopRepeat('left')"
                    (pointerleave)="stopRepeat('left')"
                    (pointercancel)="stopRepeat('left')"
                    aria-label="Left">&larr;</button>
            <button class="touch__btn"
                    (pointerdown)="startRepeat('down')"
                    (pointerup)="stopRepeat('down')"
                    (pointerleave)="stopRepeat('down')"
                    (pointercancel)="stopRepeat('down')"
                    aria-label="Soft drop">&darr;</button>
            <button class="touch__btn"
                    (pointerdown)="startRepeat('right')"
                    (pointerup)="stopRepeat('right')"
                    (pointerleave)="stopRepeat('right')"
                    (pointercancel)="stopRepeat('right')"
                    aria-label="Right">&rarr;</button>
          </div>
          <div class="touch__action-group">
            <button class="touch__btn touch__btn--action"
                    (pointerdown)="emitOnce('up')"
                    aria-label="Rotate">&#x21BB;</button>
            <button class="touch__btn touch__btn--action touch__btn--drop"
                    (pointerdown)="emitOnce('drop')"
                    aria-label="Hard drop">DROP</button>
          </div>
        </div>
      }
      @case ('left-right-fire') {
        <div class="touch touch--lrf">
          <div class="touch__move-group">
            <button class="touch__btn"
                    (pointerdown)="startRepeat('left')"
                    (pointerup)="stopRepeat('left')"
                    (pointerleave)="stopRepeat('left')"
                    (pointercancel)="stopRepeat('left')"
                    aria-label="Left">&larr;</button>
            <button class="touch__btn"
                    (pointerdown)="startRepeat('right')"
                    (pointerup)="stopRepeat('right')"
                    (pointerleave)="stopRepeat('right')"
                    (pointercancel)="stopRepeat('right')"
                    aria-label="Right">&rarr;</button>
          </div>
          <button class="touch__btn touch__btn--action"
                  (pointerdown)="emitOnce('fire')"
                  aria-label="Fire">FIRE</button>
        </div>
      }
    }
  `,
  styles: [`
    :host { display: block; }
    .touch {
      display: none;
      padding: var(--space-sm) var(--space-md);
      padding-bottom: calc(var(--space-sm) + var(--safe-bottom));
      gap: var(--space-sm);
    }
    @media (max-width: 768px) {
      .touch { display: flex; }
    }

    /* === D-pad layout (Snake) === */
    .touch--dpad {
      flex-direction: column;
      align-items: center;
      gap: 4px;
    }
    .touch__dir-row {
      display: flex;
      gap: 4px;
    }
    .touch__dir {
      font-family: var(--font-pixel);
      font-size: 1rem;
      width: 48px;
      height: 48px;
      border-radius: 10px;
      border: 1px solid rgba(0, 255, 65, 0.2);
      background: rgba(0, 255, 65, 0.08);
      backdrop-filter: blur(4px);
      -webkit-backdrop-filter: blur(4px);
      color: var(--accent-primary);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      touch-action: manipulation;
      user-select: none;
      -webkit-user-select: none;
      transition: all 0.1s ease;
    }
    .touch__dir:active {
      background: rgba(0, 255, 65, 0.2);
      box-shadow: 0 0 12px rgba(0, 255, 65, 0.3);
      border-color: rgba(0, 255, 65, 0.4);
    }
    /* Gap between left and right to form the cross shape */
    .touch__dir-row {
      gap: 52px;
    }

    /* === Tetris layout === */
    .touch--tetris {
      justify-content: space-around;
      align-items: center;
    }
    .touch__action-group {
      display: flex;
      flex-direction: column;
      gap: var(--space-xs);
      align-items: center;
    }

    /* === Left-right-fire layout (Invaders) === */
    .touch--lrf {
      justify-content: space-around;
      align-items: center;
    }
    .touch__move-group {
      display: flex;
      gap: var(--space-sm);
    }

    /* === Shared buttons === */
    .touch__btn {
      font-family: var(--font-pixel);
      font-size: 0.8rem;
      width: 56px;
      height: 56px;
      border-radius: 12px;
      border: 1px solid rgba(0, 255, 65, 0.2);
      background: rgba(0, 255, 65, 0.08);
      backdrop-filter: blur(4px);
      -webkit-backdrop-filter: blur(4px);
      color: var(--accent-primary);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      touch-action: manipulation;
      user-select: none;
      -webkit-user-select: none;
      transition: all 0.1s ease;
    }
    .touch__btn:active {
      background: rgba(0, 255, 65, 0.18);
      box-shadow: 0 0 12px rgba(0, 255, 65, 0.3);
      border-color: rgba(0, 255, 65, 0.4);
    }

    /* Action buttons (fire, rotate, drop) */
    .touch__btn--action {
      border-radius: 50%;
      border-color: rgba(255, 176, 0, 0.25);
      background: rgba(255, 176, 0, 0.08);
      color: var(--accent-amber);
      font-size: 0.5rem;
    }
    .touch__btn--action:active {
      background: rgba(255, 176, 0, 0.18);
      box-shadow: 0 0 12px rgba(255, 176, 0, 0.3);
      border-color: rgba(255, 176, 0, 0.4);
    }
    .touch__btn--drop {
      font-size: 0.4rem;
    }
  `],
})
export class TouchControlsComponent implements OnDestroy {
  layout = input<TouchLayout>('none');
  action = output<string>();
  released = output<string>();

  // Hold-to-repeat timers (for movement buttons)
  private repeatTimers = new Map<string, { delay: ReturnType<typeof setTimeout> | null; interval: ReturnType<typeof setInterval> | null }>();

  private readonly REPEAT_DELAY = 180;
  private readonly REPEAT_RATE = 80;

  // --- Single-fire (no repeat) ---

  emitOnce(act: string): void {
    this.action.emit(act);
  }

  // --- Hold-to-repeat (for movement buttons) ---

  startRepeat(act: string): void {
    this.stopRepeat(act);
    this.action.emit(act);
    const delay = setTimeout(() => {
      const interval = setInterval(() => this.action.emit(act), this.REPEAT_RATE);
      const entry = this.repeatTimers.get(act);
      if (entry) entry.interval = interval;
    }, this.REPEAT_DELAY);
    this.repeatTimers.set(act, { delay, interval: null });
  }

  stopRepeat(act: string): void {
    const entry = this.repeatTimers.get(act);
    if (entry) {
      if (entry.delay) clearTimeout(entry.delay);
      if (entry.interval) clearInterval(entry.interval);
      this.repeatTimers.delete(act);
    }
    this.released.emit(act);
  }

  ngOnDestroy(): void {
    for (const entry of this.repeatTimers.values()) {
      if (entry.delay) clearTimeout(entry.delay);
      if (entry.interval) clearInterval(entry.interval);
    }
    this.repeatTimers.clear();
  }
}
