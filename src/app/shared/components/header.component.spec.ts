import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { HeaderComponent } from './header.component';

describe('HeaderComponent', () => {
  let fixture: ComponentFixture<HeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should display brand name', () => {
    expect(fixture.nativeElement.textContent).toContain('RETRO ARCADE');
  });

  it('should have nav links', () => {
    const links = fixture.nativeElement.querySelectorAll('.header__nav a');
    expect(links.length).toBe(3);
  });

  it('should have mute button', () => {
    const btns = fixture.nativeElement.querySelectorAll('.header__btn');
    expect(btns.length).toBeGreaterThanOrEqual(2);
  });
});
