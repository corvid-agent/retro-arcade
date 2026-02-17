import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { HomeComponent } from './home.component';

describe('HomeComponent', () => {
  let fixture: ComponentFixture<HomeComponent>;
  let component: HomeComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display 6 game cards', () => {
    const cards = fixture.nativeElement.querySelectorAll('.game-card');
    expect(cards.length).toBe(6);
  });

  it('should show game names', () => {
    const names = fixture.nativeElement.querySelectorAll('.game-card__name');
    expect(names.length).toBe(6);
    expect(names[0].textContent).toContain('Snake');
  });
});
