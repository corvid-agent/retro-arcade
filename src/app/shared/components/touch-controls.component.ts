import { Component, ChangeDetectionStrategy, input, output, signal, OnDestroy } from '@angular/core';

export type TouchLayout = 'joystick' | 'joystick-drop' | 'left-right-fire' | 'slider' | 'none';

@Component({
  selector: 'app-touch-controls',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @switch (layout()) {
      @case ('joystick') {
        <div class="touch touch--joystick">
          <div class="touch__stick-zone"
               (pointerdown)="joystickDown($event)"
               (pointermove)="joystickMove($event)"
               (pointerup)="joystickUp($event)"
               (pointercancel)="joystickUp($event)"
               (pointerleave)="joystickUp($event)"
               role="button"
               aria-label="Joystick — drag to move"
               [attr.touch-action]="'none'">
            <div class="touch__stick-knob"
                 [style.transform]="'translate(' + knobX() + 'px,' + knobY() + 'px)'">
            </div>
          </div>
        </div>
      }
      @case ('joystick-drop') {
        <div class="touch touch--joystick-drop">
          <div class="touch__stick-zone"
               (pointerdown)="joystickDown($event)"
               (pointermove)="joystickMove($event)"
               (pointerup)="joystickUp($event)"
               (pointercancel)="joystickUp($event)"
               (pointerleave)="joystickUp($event)"
               role="button"
               aria-label="Joystick — drag to move"
               [attr.touch-action]="'none'">
            <div class="touch__stick-knob"
                 [style.transform]="'translate(' + knobX() + 'px,' + knobY() + 'px)'">
            </div>
          </div>
          <div class="touch__action-group">
            <button class="touch__btn touch__btn--action"
                    (pointerdown)="startRepeat('up')"
                    (pointerup)="stopRepeat('up')"
                    (pointerleave)="stopRepeat('up')"
                    (pointercancel)="stopRepeat('up')"
                    aria-label="Rotate">&#x21BB;</button>
            <button class="touch__btn touch__btn--action touch__btn--drop"
                    (pointerdown)="startRepeat('drop')"
                    (pointerup)="stopRepeat('drop')"
                    (pointerleave)="stopRepeat('drop')"
                    (pointercancel)="stopRepeat('drop')"
                    aria-label="Drop">DROP</button>
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
                  (pointerdown)="startRepeat('fire')"
                  (pointerup)="stopRepeat('fire')"
                  (pointerleave)="stopRepeat('fire')"
                  (pointercancel)="stopRepeat('fire')"
                  aria-label="Fire">FIRE</button>
        </div>
      }
    }
  `,
  styles: [`
    :host { display: block; }
    .touch {
      display: none;
      padding: var(--space-md);
      padding-bottom: calc(var(--space-md) + var(--safe-bottom));
      gap: var(--space-md);
    }
    @media (max-width: 768px) {
      .touch { display: flex; }
    }

    /* Joystick layout */
    .touch--joystick {
      justify-content: center;
      align-items: center;
    }

    /* Joystick-drop layout */
    .touch--joystick-drop {
      justify-content: space-around;
      align-items: center;
    }

    /* Left-right-fire layout */
    .touch--lrf {
      justify-content: space-around;
      align-items: center;
    }
    .touch__move-group {
      display: flex;
      gap: var(--space-sm);
    }
    .touch__action-group {
      display: flex;
      flex-direction: column;
      gap: var(--space-sm);
      align-items: center;
    }

    /* Joystick base */
    .touch__stick-zone {
      position: relative;
      width: 120px;
      height: 120px;
      border-radius: 50%;
      background: rgba(0, 255, 65, 0.06);
      border: 1px solid rgba(0, 255, 65, 0.15);
      backdrop-filter: blur(4px);
      -webkit-backdrop-filter: blur(4px);
      touch-action: none;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    /* Joystick knob */
    .touch__stick-knob {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: rgba(0, 255, 65, 0.12);
      border: 1px solid rgba(0, 255, 65, 0.3);
      box-shadow: 0 0 8px rgba(0, 255, 65, 0.15);
      transition: box-shadow 0.1s ease;
      pointer-events: none;
    }
    .touch__stick-zone:active .touch__stick-knob {
      box-shadow: 0 0 16px rgba(0, 255, 65, 0.4);
      background: rgba(0, 255, 65, 0.2);
    }

    /* Buttons */
    .touch__btn {
      font-family: var(--font-pixel);
      font-size: 0.8rem;
      width: 64px;
      height: 64px;
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
      width: 80px;
      height: 80px;
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
      width: 64px;
      height: 64px;
      font-size: 0.45rem;
    }
  `],
})
export class TouchControlsComponent implements OnDestroy {
  layout = input<TouchLayout>('none');
  action = output<string>();
  released = output<string>();

  // Joystick knob position
  readonly knobX = signal(0);
  readonly knobY = signal(0);

  // Hold-to-repeat timers
  private repeatTimers = new Map<string, { delay: ReturnType<typeof setTimeout> | null; interval: ReturnType<typeof setInterval> | null }>();

  // Joystick state
  private stickActive = false;
  private stickCenterX = 0;
  private stickCenterY = 0;
  private stickPointerId: number | null = null;
  private stickDirection: string | null = null;
  private stickInterval: ReturnType<typeof setInterval> | null = null;

  private readonly DEAD_ZONE = 15;
  private readonly MAX_TRAVEL = 40;
  private readonly REPEAT_DELAY = 180;
  private readonly REPEAT_RATE = 80;

  // --- Hold-to-repeat ---

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

  // --- Virtual joystick ---

  joystickDown(e: PointerEvent): void {
    if (this.stickActive) return;
    this.stickActive = true;
    this.stickPointerId = e.pointerId;

    const el = e.currentTarget as HTMLElement;
    el.setPointerCapture(e.pointerId);

    const rect = el.getBoundingClientRect();
    this.stickCenterX = rect.left + rect.width / 2;
    this.stickCenterY = rect.top + rect.height / 2;

    this.updateJoystick(e.clientX, e.clientY);
  }

  joystickMove(e: PointerEvent): void {
    if (!this.stickActive || e.pointerId !== this.stickPointerId) return;
    this.updateJoystick(e.clientX, e.clientY);
  }

  joystickUp(e: PointerEvent): void {
    if (!this.stickActive || e.pointerId !== this.stickPointerId) return;
    this.stickActive = false;
    this.stickPointerId = null;
    this.knobX.set(0);
    this.knobY.set(0);

    if (this.stickDirection) {
      this.released.emit(this.stickDirection);
      this.stickDirection = null;
    }
    if (this.stickInterval) {
      clearInterval(this.stickInterval);
      this.stickInterval = null;
    }
  }

  private updateJoystick(clientX: number, clientY: number): void {
    const dx = clientX - this.stickCenterX;
    const dy = clientY - this.stickCenterY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Clamp knob visual position
    const clampedDist = Math.min(dist, this.MAX_TRAVEL);
    const angle = Math.atan2(dy, dx);
    this.knobX.set(Math.round(Math.cos(angle) * clampedDist));
    this.knobY.set(Math.round(Math.sin(angle) * clampedDist));

    // Determine direction
    let newDir: string | null = null;
    if (dist > this.DEAD_ZONE) {
      const deg = angle * (180 / Math.PI);
      if (deg >= -45 && deg < 45) newDir = 'right';
      else if (deg >= 45 && deg < 135) newDir = 'down';
      else if (deg >= -135 && deg < -45) newDir = 'up';
      else newDir = 'left';
    }

    if (newDir !== this.stickDirection) {
      // Direction changed
      if (this.stickInterval) {
        clearInterval(this.stickInterval);
        this.stickInterval = null;
      }
      if (this.stickDirection) {
        this.released.emit(this.stickDirection);
      }
      this.stickDirection = newDir;
      if (newDir) {
        this.action.emit(newDir);
        this.stickInterval = setInterval(() => {
          if (this.stickDirection) this.action.emit(this.stickDirection);
        }, this.REPEAT_RATE);
      }
    }
  }

  ngOnDestroy(): void {
    // Clear all hold-to-repeat timers
    for (const entry of this.repeatTimers.values()) {
      if (entry.delay) clearTimeout(entry.delay);
      if (entry.interval) clearInterval(entry.interval);
    }
    this.repeatTimers.clear();

    // Clear joystick interval
    if (this.stickInterval) {
      clearInterval(this.stickInterval);
      this.stickInterval = null;
    }
  }
}
