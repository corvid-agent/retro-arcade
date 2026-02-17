import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-loading-spinner',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="spinner" role="status">
      <span class="spinner__text text-glow">LOADING...</span>
    </div>
  `,
  styles: [`
    .spinner {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--space-2xl);
    }
    .spinner__text {
      font-family: var(--font-pixel);
      font-size: 0.7rem;
      color: var(--accent-primary);
      animation: blink 1s step-end infinite;
    }
    @keyframes blink {
      50% { opacity: 0; }
    }
  `],
})
export class LoadingSpinnerComponent {}
