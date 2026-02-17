import { Directive, output, ElementRef, inject, OnInit, OnDestroy } from '@angular/core';

export type SwipeDirection = 'up' | 'down' | 'left' | 'right';

const THRESHOLD = 30;
const MAX_TIME = 500;

@Directive({ selector: '[appSwipe]' })
export class SwipeDirective implements OnInit, OnDestroy {
  readonly swiped = output<SwipeDirection>();

  private readonly el = inject(ElementRef<HTMLElement>);
  private startX = 0;
  private startY = 0;
  private startTime = 0;

  private readonly onTouchStart = (e: TouchEvent) => {
    const touch = e.touches[0];
    this.startX = touch.clientX;
    this.startY = touch.clientY;
    this.startTime = Date.now();
  };

  private readonly onTouchEnd = (e: TouchEvent) => {
    if (Date.now() - this.startTime > MAX_TIME) return;

    const touch = e.changedTouches[0];
    const dx = touch.clientX - this.startX;
    const dy = touch.clientY - this.startY;

    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    if (Math.max(absDx, absDy) < THRESHOLD) return;

    if (absDx > absDy) {
      this.swiped.emit(dx > 0 ? 'right' : 'left');
    } else {
      this.swiped.emit(dy > 0 ? 'down' : 'up');
    }
  };

  ngOnInit(): void {
    const el = this.el.nativeElement;
    el.addEventListener('touchstart', this.onTouchStart, { passive: true });
    el.addEventListener('touchend', this.onTouchEnd, { passive: true });
  }

  ngOnDestroy(): void {
    const el = this.el.nativeElement;
    el.removeEventListener('touchstart', this.onTouchStart);
    el.removeEventListener('touchend', this.onTouchEnd);
  }
}
