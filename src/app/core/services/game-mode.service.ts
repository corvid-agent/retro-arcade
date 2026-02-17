import { Injectable, signal, computed, DestroyRef, inject } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class GameModeService {
  private readonly destroyRef = inject(DestroyRef);
  private readonly gamePlaying = signal(false);
  private readonly windowWidth = signal(window.innerWidth);
  private resizeCleanup: (() => void) | null = null;

  readonly isMobile = computed(() => this.windowWidth() < 768);
  readonly immersive = computed(() => this.gamePlaying() && this.isMobile());

  constructor() {
    const onResize = () => this.windowWidth.set(window.innerWidth);
    window.addEventListener('resize', onResize);
    this.resizeCleanup = () => window.removeEventListener('resize', onResize);
    this.destroyRef.onDestroy(() => this.resizeCleanup?.());
  }

  enterGame(): void {
    this.gamePlaying.set(true);
  }

  exitGame(): void {
    this.gamePlaying.set(false);
  }
}
