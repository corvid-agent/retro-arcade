import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GameShellComponent } from './game-shell.component';

describe('GameShellComponent', () => {
  let fixture: ComponentFixture<GameShellComponent>;
  let component: GameShellComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GameShellComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(GameShellComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('gameName', 'Test Game');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display game name', () => {
    expect(fixture.nativeElement.textContent).toContain('Test Game');
  });

  it('should show idle overlay by default', () => {
    const overlay = fixture.nativeElement.querySelector('.game-shell__overlay');
    expect(overlay).toBeTruthy();
  });

  it('should show START button in idle state', () => {
    const btn = fixture.nativeElement.querySelector('.btn--filled');
    expect(btn?.textContent).toContain('START');
  });

  it('should show score', () => {
    fixture.componentRef.setInput('score', 42);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('42');
  });

  it('should show paused overlay', () => {
    fixture.componentRef.setInput('state', 'paused');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('PAUSED');
  });

  it('should show game over overlay', () => {
    fixture.componentRef.setInput('state', 'game-over');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('GAME OVER');
  });

  it('should show new high score message', () => {
    fixture.componentRef.setInput('state', 'game-over');
    fixture.componentRef.setInput('isNewHighScore', true);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('NEW HIGH SCORE');
  });
});
