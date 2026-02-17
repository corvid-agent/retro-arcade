import { Injectable, inject, DestroyRef, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AudioService } from './audio.service';

@Injectable({ providedIn: 'root' })
export class KeyboardShortcutsService {
  private readonly router = inject(Router);
  private readonly audio = inject(AudioService);
  readonly showHelp = signal(false);

  init(destroyRef: DestroyRef): void {
    const handler = (e: KeyboardEvent) => this.onKeydown(e);
    document.addEventListener('keydown', handler);
    destroyRef.onDestroy(() => document.removeEventListener('keydown', handler));
  }

  private onKeydown(e: KeyboardEvent): void {
    if (this.isInputFocused()) return;

    switch (e.key) {
      case '?':
        this.showHelp.update((v) => !v);
        break;
      case 'Escape':
        this.showHelp.set(false);
        break;
      case 'm':
      case 'M':
        this.audio.toggleMute();
        break;
    }
  }

  private isInputFocused(): boolean {
    const el = document.activeElement;
    if (!el) return false;
    const tag = el.tagName.toLowerCase();
    return tag === 'input' || tag === 'textarea' || tag === 'select' || (el as HTMLElement).isContentEditable;
  }
}
