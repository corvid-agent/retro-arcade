import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-about',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <section class="about container">
      <h1 class="about__title text-glow">ABOUT</h1>

      <div class="about__content">
        <p>
          Retro Arcade is a collection of 6 classic games, reimagined with a CRT terminal aesthetic.
          All games run entirely in your browser — no server, no tracking, no ads, no quarters.
        </p>

        <h2>Games</h2>
        <ul class="about__games">
          <li><a routerLink="/snake">Snake</a> — Guide the snake, eat food, avoid walls</li>
          <li><a routerLink="/tetris">Tetris</a> — Stack falling blocks, clear lines</li>
          <li><a routerLink="/breakout">Breakout</a> — Destroy bricks with paddle and ball</li>
          <li><a routerLink="/invaders">Invaders</a> — Defend Earth from alien invasion</li>
          <li><a routerLink="/2048">2048</a> — Slide and merge number tiles</li>
          <li><a routerLink="/memory">Memory</a> — Find all matching card pairs</li>
        </ul>

        <h2>Features</h2>
        <ul>
          <li>CRT scanline effect with toggle</li>
          <li>8-bit oscillator audio (Web Audio API)</li>
          <li>High scores saved locally</li>
          <li>30 unlockable achievements</li>
          <li>Fully offline after first load (PWA)</li>
          <li>Touch controls for mobile</li>
          <li>Keyboard shortcuts</li>
        </ul>

        <h2>Tech Stack</h2>
        <p>
          Built with Angular, Canvas API, Web Audio API, and CSS.
          No external dependencies beyond Angular itself.
        </p>

        <h2>Keyboard Shortcuts</h2>
        <div class="about__shortcuts">
          <div><kbd>?</kbd> Show keyboard shortcuts</div>
          <div><kbd>M</kbd> Toggle mute</div>
          <div><kbd>Esc</kbd> Pause / Close</div>
          <div><kbd>P</kbd> Pause game</div>
        </div>

        <p class="about__source">
          Source code:
          <a href="https://github.com/corvid-agent/retro-arcade" target="_blank" rel="noopener">
            github.com/corvid-agent/retro-arcade
          </a>
        </p>
      </div>
    </section>
  `,
  styles: [`
    .about { padding: var(--space-2xl) var(--space-lg); max-width: 700px; }
    .about__title {
      text-align: center;
      margin-bottom: var(--space-2xl);
    }
    .about__content h2 {
      margin: var(--space-xl) 0 var(--space-sm);
      color: var(--accent-amber);
    }
    .about__content p, .about__content li {
      font-size: 0.9rem;
      line-height: 1.8;
      color: var(--text-secondary);
    }
    .about__content ul {
      list-style: none;
      padding: 0;
    }
    .about__content li::before {
      content: '> ';
      color: var(--accent-primary);
      font-family: var(--font-mono);
    }
    .about__content li {
      padding: var(--space-2xs) 0;
    }
    .about__shortcuts {
      display: flex;
      flex-direction: column;
      gap: var(--space-xs);
      font-size: 0.85rem;
      color: var(--text-secondary);
    }
    .about__shortcuts kbd {
      font-family: var(--font-pixel);
      font-size: 0.5rem;
      padding: 3px 8px;
      border: 1px solid var(--border);
      background: var(--bg-raised);
      color: var(--accent-primary);
      margin-right: var(--space-sm);
    }
    .about__source {
      margin-top: var(--space-xl);
      padding-top: var(--space-lg);
      border-top: 1px solid var(--border);
    }
  `],
})
export class AboutComponent {}
