import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HighScoresComponent } from './high-scores.component';

describe('HighScoresComponent', () => {
  let fixture: ComponentFixture<HighScoresComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HighScoresComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HighScoresComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should show empty message when no scores', () => {
    expect(fixture.nativeElement.textContent).toContain('No scores yet');
  });

  it('should display scores when provided', () => {
    fixture.componentRef.setInput('scores', [
      { score: 100, date: '2024-01-01' },
      { score: 50, date: '2024-01-02' },
    ]);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('100');
    expect(fixture.nativeElement.textContent).toContain('50');
  });

  it('should highlight first score', () => {
    fixture.componentRef.setInput('scores', [
      { score: 100, date: '2024-01-01' },
    ]);
    fixture.detectChanges();
    const highlighted = fixture.nativeElement.querySelector('.scores__highlight');
    expect(highlighted).toBeTruthy();
  });
});
