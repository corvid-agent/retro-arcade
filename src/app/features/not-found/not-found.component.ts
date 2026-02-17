import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <section class="not-found container">
      <h1 class="not-found__code text-glow">404</h1>
      <p class="not-found__msg">LEVEL NOT FOUND</p>
      <p class="not-found__hint">The page you're looking for doesn't exist.</p>
      <a routerLink="/home" class="btn btn--filled">RETURN HOME</a>
    </section>
  `,
  styles: [`
    .not-found {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 60vh;
      text-align: center;
      gap: var(--space-md);
    }
    .not-found__code {
      font-size: 2rem;
      color: var(--accent-primary);
    }
    .not-found__msg {
      font-family: var(--font-pixel);
      font-size: 0.8rem;
      color: var(--accent-amber);
    }
    .not-found__hint {
      color: var(--text-secondary);
      font-size: 0.9rem;
      margin-bottom: var(--space-md);
    }
  `],
})
export class NotFoundComponent {}
