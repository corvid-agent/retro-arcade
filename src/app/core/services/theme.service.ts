import { Injectable, signal } from '@angular/core';

export type ThemeMode = 'crt' | 'clean';

const STORAGE_KEY = 'retro-arcade-theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly theme = signal<ThemeMode>(this.loadTheme());

  toggle(): void {
    const next: ThemeMode = this.theme() === 'crt' ? 'clean' : 'crt';
    this.setTheme(next);
  }

  setTheme(mode: ThemeMode): void {
    this.theme.set(mode);
    this.applyTheme(mode);
    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch { /* ignore */ }
  }

  init(): void {
    this.applyTheme(this.theme());
  }

  private applyTheme(mode: ThemeMode): void {
    document.documentElement.setAttribute('data-theme', mode);
  }

  private loadTheme(): ThemeMode {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'crt' || stored === 'clean') return stored;
    } catch { /* ignore */ }
    return 'crt';
  }
}
