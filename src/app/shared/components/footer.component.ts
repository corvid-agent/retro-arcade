import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <footer class="footer" role="contentinfo">
      <div class="footer__inner container">
        <div class="footer__top">
          <span class="footer__brand text-glow">&gt;_ RETRO ARCADE</span>
          <span class="footer__tagline">Classic games, no quarters needed</span>
        </div>
        <nav class="footer__nav" aria-label="Footer navigation">
          <div class="footer__nav-col">
            <h4 class="footer__nav-heading">Play</h4>
            <a routerLink="/snake">Snake</a>
            <a routerLink="/tetris">Tetris</a>
            <a routerLink="/breakout">Breakout</a>
          </div>
          <div class="footer__nav-col">
            <h4 class="footer__nav-heading">More</h4>
            <a routerLink="/invaders">Invaders</a>
            <a routerLink="/2048">2048</a>
            <a routerLink="/memory">Memory</a>
          </div>
          <div class="footer__nav-col">
            <h4 class="footer__nav-heading">Info</h4>
            <a routerLink="/stats">Stats</a>
            <a routerLink="/about">About</a>
            <a href="https://github.com/corvid-agent/retro-arcade" target="_blank" rel="noopener">GitHub</a>
          </div>
          <div class="footer__nav-col">
            <h4 class="footer__nav-heading">Ecosystem</h4>
            <a href="https://corvid-agent.github.io/" target="_blank" rel="noopener">Home</a>
            <a href="https://corvid-agent.github.io/bw-cinema/" target="_blank" rel="noopener">BW Cinema</a>
            <a href="https://corvid-agent.github.io/pd-gallery/" target="_blank" rel="noopener">Art Gallery</a>
            <a href="https://corvid-agent.github.io/pd-audiobooks/" target="_blank" rel="noopener">Audiobooks</a>
            <a href="https://corvid-agent.github.io/weather-dashboard/" target="_blank" rel="noopener">Weather</a>
            <a href="https://corvid-agent.github.io/space-dashboard/" target="_blank" rel="noopener">Space</a>
          </div>
        </nav>
        <p class="footer__credits">
          Built with Angular. All games run locally — no server, no tracking, no ads.
        </p>
      </div>
    </footer>
  `,
  styles: [`
    .footer {
      border-top: 1px solid var(--border);
      padding: var(--space-xl) 0;
      margin-top: var(--space-3xl);
    }
    .footer__inner { text-align: center; }
    .footer__top {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--space-xs);
      margin-bottom: var(--space-lg);
    }
    .footer__brand {
      font-family: var(--font-pixel);
      font-size: 0.65rem;
      color: var(--accent-primary);
    }
    .footer__tagline {
      color: var(--text-tertiary);
      font-size: 0.85rem;
    }
    .footer__nav {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: var(--space-lg);
      max-width: 600px;
      margin: 0 auto var(--space-xl);
      text-align: left;
    }
    .footer__nav-heading {
      font-family: var(--font-pixel);
      font-size: 0.55rem;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: var(--text-tertiary);
      margin: 0 0 var(--space-sm);
    }
    .footer__nav-col {
      display: flex;
      flex-direction: column;
      gap: var(--space-xs);
    }
    .footer__nav-col a {
      font-size: 0.8rem;
      color: var(--text-secondary);
      transition: color var(--transition-fast);
    }
    .footer__nav-col a:hover { color: var(--accent-primary); }
    .footer__credits {
      color: var(--text-tertiary);
      font-size: 0.8rem;
    }
    @media (max-width: 768px) {
      .footer { padding-bottom: 100px; }
      .footer__nav { grid-template-columns: repeat(2, 1fr); }
    }
  `],
})
export class FooterComponent {}
