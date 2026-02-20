import { Injectable, signal, computed } from '@angular/core';

export type GameSpeed = 'slow' | 'normal' | 'fast';

const STORAGE_PREFIX = 'retro-arcade-a11y-';

@Injectable({ providedIn: 'root' })
export class AccessibilityService {
  /** High-contrast mode for game canvases and UI. */
  readonly highContrast = signal(this.loadBool('high-contrast'));

  /** Game speed multiplier for motor accessibility. */
  readonly gameSpeed = signal<GameSpeed>(this.loadSpeed());

  /** Whether to show visual indicators alongside sound effects. */
  readonly visualIndicators = signal(this.loadBool('visual-indicators'));

  /** Numeric multiplier derived from gameSpeed — used by game loops. */
  readonly speedMultiplier = computed<number>(() => {
    switch (this.gameSpeed()) {
      case 'slow': return 1.8;
      case 'fast': return 0.6;
      default: return 1.0;
    }
  });

  /** Message for the screen-reader live region. */
  readonly srAnnouncement = signal('');

  toggleHighContrast(): void {
    this.highContrast.update((v) => !v);
    this.saveBool('high-contrast', this.highContrast());
  }

  toggleVisualIndicators(): void {
    this.visualIndicators.update((v) => !v);
    this.saveBool('visual-indicators', this.visualIndicators());
  }

  setGameSpeed(speed: GameSpeed): void {
    this.gameSpeed.set(speed);
    try {
      localStorage.setItem(STORAGE_PREFIX + 'speed', speed);
    } catch { /* ignore */ }
  }

  cycleGameSpeed(): void {
    const order: GameSpeed[] = ['slow', 'normal', 'fast'];
    const idx = order.indexOf(this.gameSpeed());
    this.setGameSpeed(order[(idx + 1) % order.length]);
  }

  /** Push an announcement to the aria-live region. Clears after a short delay to allow repeat announcements. */
  announce(message: string): void {
    // Clear first so identical consecutive messages still trigger
    this.srAnnouncement.set('');
    setTimeout(() => this.srAnnouncement.set(message), 50);
  }

  private loadBool(key: string): boolean {
    try {
      return localStorage.getItem(STORAGE_PREFIX + key) === 'true';
    } catch {
      return false;
    }
  }

  private saveBool(key: string, value: boolean): void {
    try {
      localStorage.setItem(STORAGE_PREFIX + key, String(value));
    } catch { /* ignore */ }
  }

  private loadSpeed(): GameSpeed {
    try {
      const stored = localStorage.getItem(STORAGE_PREFIX + 'speed');
      if (stored === 'slow' || stored === 'normal' || stored === 'fast') return stored;
    } catch { /* ignore */ }
    return 'normal';
  }
}
