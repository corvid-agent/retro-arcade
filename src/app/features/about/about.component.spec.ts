import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AboutComponent } from './about.component';

describe('AboutComponent', () => {
  let fixture: ComponentFixture<AboutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AboutComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(AboutComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should display title', () => {
    expect(fixture.nativeElement.textContent).toContain('ABOUT');
  });

  it('should list all 6 games', () => {
    const content = fixture.nativeElement.textContent;
    expect(content).toContain('Snake');
    expect(content).toContain('Tetris');
    expect(content).toContain('Breakout');
    expect(content).toContain('Invaders');
    expect(content).toContain('2048');
    expect(content).toContain('Memory');
  });
});
