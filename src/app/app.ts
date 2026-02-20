import { Component, ChangeDetectionStrategy, inject, DestroyRef, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './shared/components/header.component';
import { FooterComponent } from './shared/components/footer.component';
import { BottomNavComponent } from './shared/components/bottom-nav.component';
import { ToastContainerComponent } from './shared/components/toast-container.component';
import { ThemeService } from './core/services/theme.service';
import { KeyboardShortcutsService } from './core/services/keyboard-shortcuts.service';
import { GameModeService } from './core/services/game-mode.service';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, HeaderComponent, FooterComponent, BottomNavComponent, ToastContainerComponent],
  template: `
    <a class="skip-to-content" href="#main-content">Skip to content</a>
    @if (!gameMode.immersive()) {
      <app-header />
    }
    <main id="main-content" [class.main--immersive]="gameMode.immersive()">
      <router-outlet />
    </main>
    @if (!gameMode.immersive()) {
      <app-footer />
    }
    <app-toast-container />
    @if (!gameMode.immersive()) {
      <app-bottom-nav />
    }

    @if (shortcuts.showHelp()) {
      <div class="shortcuts-overlay" (click)="shortcuts.showHelp.set(false)" role="dialog" aria-label="Keyboard shortcuts">
        <div class="shortcuts-panel pixel-border" (click)="$event.stopPropagation()">
          <h3>Keyboard Shortcuts</h3>
          <div class="shortcuts-list">
            <div class="shortcut"><kbd>?</kbd> <span>Toggle this help</span></div>
            <div class="shortcut"><kbd>M</kbd> <span>Toggle mute</span></div>
            <div class="shortcut"><kbd>Esc</kbd> <span>Close / Pause</span></div>
            <div class="shortcut"><kbd>P</kbd> <span>Pause / Resume game</span></div>
          </div>
          <button class="btn" (click)="shortcuts.showHelp.set(false)" aria-label="Close keyboard shortcuts">Close</button>
        </div>
      </div>
    }
  `,
  styles: [`
    main {
      min-height: calc(100vh - 56px);
    }
    main.main--immersive {
      height: 100dvh;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    .shortcuts-overlay {
      position: fixed;
      inset: 0;
      background-color: var(--bg-overlay);
      z-index: 200;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .shortcuts-panel {
      background-color: var(--bg-surface);
      padding: var(--space-xl);
      max-width: 360px;
      width: 90%;
      text-align: center;
    }
    .shortcuts-panel h3 {
      font-size: 0.7rem;
      margin-bottom: var(--space-lg);
      color: var(--accent-primary);
    }
    .shortcuts-list {
      display: flex;
      flex-direction: column;
      gap: var(--space-sm);
      margin-bottom: var(--space-lg);
    }
    .shortcut {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 0.8rem;
    }
    .shortcut kbd {
      font-family: var(--font-pixel);
      font-size: 0.55rem;
      padding: 4px 8px;
      border: 1px solid var(--border);
      background: var(--bg-raised);
      color: var(--accent-primary);
    }
    .shortcut span {
      color: var(--text-secondary);
      font-size: 0.8rem;
    }
  `],
})
export class App implements OnInit {
  private readonly theme = inject(ThemeService);
  protected readonly shortcuts = inject(KeyboardShortcutsService);
  protected readonly gameMode = inject(GameModeService);
  private readonly destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.theme.init();
    this.shortcuts.init(this.destroyRef);
  }
}
