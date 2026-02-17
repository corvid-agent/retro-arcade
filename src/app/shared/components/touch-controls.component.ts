import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';

export type TouchLayout = 'dpad' | 'dpad-drop' | 'left-right-fire' | 'slider' | 'none';

@Component({
  selector: 'app-touch-controls',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @switch (layout()) {
      @case ('dpad') {
        <div class="touch touch--dpad">
          <button class="touch__btn touch__up" (pointerdown)="action.emit('up')" aria-label="Up">&uarr;</button>
          <div class="touch__row">
            <button class="touch__btn" (pointerdown)="action.emit('left')" aria-label="Left">&larr;</button>
            <button class="touch__btn" (pointerdown)="action.emit('right')" aria-label="Right">&rarr;</button>
          </div>
          <button class="touch__btn touch__down" (pointerdown)="action.emit('down')" aria-label="Down">&darr;</button>
        </div>
      }
      @case ('dpad-drop') {
        <div class="touch touch--dpad-drop">
          <div class="touch__left">
            <button class="touch__btn touch__up" (pointerdown)="action.emit('up')" aria-label="Rotate">&uarr;</button>
            <div class="touch__row">
              <button class="touch__btn" (pointerdown)="action.emit('left')" aria-label="Left">&larr;</button>
              <button class="touch__btn" (pointerdown)="action.emit('right')" aria-label="Right">&rarr;</button>
            </div>
            <button class="touch__btn touch__down" (pointerdown)="action.emit('down')" aria-label="Down">&darr;</button>
          </div>
          <button class="touch__btn touch__action" (pointerdown)="action.emit('drop')" aria-label="Drop">DROP</button>
        </div>
      }
      @case ('left-right-fire') {
        <div class="touch touch--lrf">
          <div class="touch__row">
            <button class="touch__btn" (pointerdown)="action.emit('left')" aria-label="Left">&larr;</button>
            <button class="touch__btn" (pointerdown)="action.emit('right')" aria-label="Right">&rarr;</button>
          </div>
          <button class="touch__btn touch__action" (pointerdown)="action.emit('fire')" aria-label="Fire">FIRE</button>
        </div>
      }
    }
  `,
  styles: [`
    :host { display: block; }
    .touch {
      display: none;
      padding: var(--space-md);
      gap: var(--space-sm);
    }
    @media (max-width: 768px) {
      .touch { display: flex; }
    }
    .touch--dpad, .touch--dpad-drop {
      flex-direction: column;
      align-items: center;
    }
    .touch--dpad-drop {
      flex-direction: row;
      justify-content: space-around;
      align-items: flex-end;
    }
    .touch--dpad-drop .touch__left {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--space-xs);
    }
    .touch--lrf {
      justify-content: space-around;
      align-items: center;
    }
    .touch__row {
      display: flex;
      gap: var(--space-sm);
    }
    .touch__btn {
      font-family: var(--font-pixel);
      font-size: 0.8rem;
      width: 56px;
      height: 56px;
      border: 1px solid var(--accent-primary);
      background: var(--bg-raised);
      color: var(--accent-primary);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      touch-action: manipulation;
      user-select: none;
      -webkit-user-select: none;
    }
    .touch__btn:active {
      background-color: var(--accent-primary-dim);
      box-shadow: 0 0 8px var(--accent-primary-glow);
    }
    .touch__action {
      font-size: 0.5rem;
      width: 72px;
      height: 72px;
      border-radius: 50%;
      border-color: var(--accent-amber);
      color: var(--accent-amber);
    }
    .touch__action:active {
      background-color: var(--accent-amber-dim);
      box-shadow: 0 0 8px rgba(255, 176, 0, 0.3);
    }
  `],
})
export class TouchControlsComponent {
  layout = input<TouchLayout>('none');
  action = output<string>();
}
