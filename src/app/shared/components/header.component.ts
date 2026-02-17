import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AudioService } from '../../core/services/audio.service';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <header class="header">
      <div class="header__inner container">
        <a routerLink="/home" class="header__brand">
          <span class="header__logo text-glow">&gt;_</span>
          <span class="header__title">RETRO ARCADE</span>
        </a>
        <nav class="header__nav" aria-label="Main navigation">
          <a routerLink="/home" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">Home</a>
          <a routerLink="/stats" routerLinkActive="active">Stats</a>
          <a routerLink="/about" routerLinkActive="active">About</a>
        </nav>
        <div class="header__actions">
          <button class="header__btn" (click)="onToggleMute()" [attr.aria-label]="audio.muted() ? 'Unmute' : 'Mute'">
            {{ audio.muted() ? 'MUTE' : 'SND' }}
          </button>
          <button class="header__btn" (click)="theme.toggle()" aria-label="Toggle CRT mode">
            {{ theme.theme() === 'crt' ? 'CRT' : 'CLN' }}
          </button>
          <button class="header__menu-btn" (click)="menuOpen.set(!menuOpen())" aria-label="Toggle menu" [attr.aria-expanded]="menuOpen()" aria-controls="mobile-nav">
            {{ menuOpen() ? '&times;' : '&equiv;' }}
          </button>
        </div>
      </div>
      @if (menuOpen()) {
        <div class="header__mobile-nav" id="mobile-nav">
          <a routerLink="/home" routerLinkActive="active" (click)="menuOpen.set(false)">Home</a>
          <a routerLink="/stats" routerLinkActive="active" (click)="menuOpen.set(false)">Stats</a>
          <a routerLink="/about" routerLinkActive="active" (click)="menuOpen.set(false)">About</a>
        </div>
      }
    </header>
  `,
  styles: [`
    .header {
      position: sticky;
      top: 0;
      z-index: 100;
      background-color: rgba(10, 10, 12, 0.95);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      border-bottom: 1px solid var(--border);
      padding-top: var(--safe-top);
    }
    .header__inner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 56px;
      gap: var(--space-md);
    }
    .header__brand {
      display: flex;
      align-items: center;
      gap: var(--space-sm);
      text-decoration: none;
      color: var(--text-primary);
      flex-shrink: 0;
    }
    .header__logo {
      font-family: var(--font-mono);
      font-size: 1.1rem;
      font-weight: 700;
      color: var(--accent-primary);
    }
    .header__title {
      font-family: var(--font-pixel);
      font-size: 0.65rem;
      letter-spacing: 0.1em;
      color: var(--text-primary);
    }
    .header__nav {
      display: flex;
      align-items: center;
      gap: var(--space-lg);
    }
    .header__nav a {
      font-family: var(--font-mono);
      font-size: 0.85rem;
      color: var(--text-secondary);
      text-decoration: none;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      transition: color var(--transition-fast);
    }
    .header__nav a:hover { color: var(--accent-primary); }
    .header__nav a.active { color: var(--accent-primary); }
    .header__actions {
      display: flex;
      align-items: center;
      gap: var(--space-xs);
    }
    .header__btn {
      font-family: var(--font-pixel);
      font-size: 0.5rem;
      padding: 6px 10px;
      background: transparent;
      border: 1px solid var(--border);
      color: var(--text-secondary);
      cursor: pointer;
      text-transform: uppercase;
      min-height: 32px;
      transition: all var(--transition-fast);
    }
    .header__btn:hover {
      border-color: var(--accent-primary);
      color: var(--accent-primary);
    }
    .header__menu-btn {
      display: none;
      font-size: 1.4rem;
      background: none;
      border: none;
      color: var(--text-primary);
      cursor: pointer;
      min-width: 44px;
      min-height: 44px;
      align-items: center;
      justify-content: center;
    }
    .header__mobile-nav {
      display: none;
      flex-direction: column;
      padding: var(--space-md) var(--space-lg);
      border-top: 1px solid var(--border);
      background-color: var(--bg-surface);
    }
    .header__mobile-nav a {
      padding: var(--space-sm) 0;
      color: var(--text-secondary);
      font-family: var(--font-mono);
      font-size: 0.9rem;
      text-transform: uppercase;
    }
    .header__mobile-nav a:hover,
    .header__mobile-nav a.active { color: var(--accent-primary); }
    @media (max-width: 768px) {
      .header__nav { display: none; }
      .header__menu-btn { display: flex; }
      .header__mobile-nav { display: flex; }
    }
  `],
})
export class HeaderComponent {
  protected readonly audio = inject(AudioService);
  protected readonly theme = inject(ThemeService);
  readonly menuOpen = signal(false);

  onToggleMute(): void {
    this.audio.toggleMute();
  }
}
