import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { GAMES } from '../../core/models/game.model';

@Component({
  selector: 'app-bottom-nav',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav class="bottom-nav" aria-label="Mobile navigation">
      <a routerLink="/home" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }" class="bottom-nav__item">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
        <span>Home</span>
      </a>
      <button class="bottom-nav__item" (click)="quickPlay()" aria-label="Quick Play — random game">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
        <span>Play</span>
      </button>
      <a routerLink="/stats" routerLinkActive="active" class="bottom-nav__item">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/></svg>
        <span>Stats</span>
      </a>
    </nav>
  `,
  styles: [`
    .bottom-nav {
      display: none;
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background-color: rgba(10, 10, 12, 0.95);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border-top: 1px solid var(--border);
      z-index: 100;
      padding: var(--space-xs) 0;
      padding-bottom: env(safe-area-inset-bottom, 0);
    }
    @media (max-width: 768px) {
      .bottom-nav {
        display: flex;
        justify-content: space-around;
      }
    }
    .bottom-nav__item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
      padding: 6px 12px;
      color: var(--text-tertiary);
      text-decoration: none;
      font-family: var(--font-pixel);
      font-size: 0.45rem;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      transition: color var(--transition-fast);
      min-width: 56px;
      min-height: 44px;
      justify-content: center;
      border: none;
      background: none;
      cursor: pointer;
    }
    .bottom-nav__item:hover { color: var(--text-primary); }
    .bottom-nav__item.active { color: var(--accent-primary); }
    .bottom-nav__item.active svg {
      filter: drop-shadow(0 0 4px var(--accent-primary-glow));
    }
  `],
})
export class BottomNavComponent {
  private readonly router = inject(Router);

  quickPlay(): void {
    const games = GAMES;
    const random = games[Math.floor(Math.random() * games.length)];
    this.router.navigate([random.route]);
  }
}
