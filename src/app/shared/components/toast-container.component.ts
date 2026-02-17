import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-toast-container',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="toasts" aria-live="polite">
      @for (toast of notifications.toasts(); track toast.id) {
        <div class="toast" [class]="'toast--' + toast.type" role="alert">
          <span>{{ toast.message }}</span>
          <button class="toast__close" (click)="notifications.dismiss(toast.id)" aria-label="Dismiss">&times;</button>
        </div>
      }
    </div>
  `,
  styles: [`
    .toasts {
      position: fixed;
      bottom: max(var(--space-lg), env(safe-area-inset-bottom));
      right: max(var(--space-lg), env(safe-area-inset-right));
      z-index: 1000;
      display: flex;
      flex-direction: column;
      gap: var(--space-sm);
      max-width: 360px;
    }
    @media (max-width: 768px) {
      .toasts {
        bottom: 80px;
        left: var(--space-md);
        right: var(--space-md);
        max-width: none;
      }
    }
    .toast {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--space-md);
      padding: var(--space-sm) var(--space-md);
      font-family: var(--font-pixel);
      font-size: 0.55rem;
      line-height: 1.6;
      animation: slideIn 0.3s ease;
    }
    .toast--info { background-color: var(--bg-raised); border: 1px solid var(--accent-cyan); color: var(--accent-cyan); }
    .toast--success { background-color: var(--bg-raised); border: 1px solid var(--accent-primary); color: var(--accent-primary); }
    .toast--error { background-color: var(--bg-raised); border: 1px solid var(--accent-red); color: var(--accent-red); }
    .toast__close {
      background: none;
      border: none;
      color: var(--text-secondary);
      font-size: 1.2rem;
      cursor: pointer;
      padding: 0;
      min-height: 44px;
      min-width: 44px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `],
})
export class ToastContainerComponent {
  protected readonly notifications = inject(NotificationService);
}
