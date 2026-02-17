import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { FooterComponent } from './footer.component';

describe('FooterComponent', () => {
  let fixture: ComponentFixture<FooterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FooterComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(FooterComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should display brand', () => {
    expect(fixture.nativeElement.textContent).toContain('RETRO ARCADE');
  });

  it('should have ecosystem links', () => {
    const links = fixture.nativeElement.querySelectorAll('.footer__nav-col a[target="_blank"]');
    expect(links.length).toBeGreaterThanOrEqual(4);
  });

  it('should include GitHub link', () => {
    const html = fixture.nativeElement.innerHTML;
    expect(html).toContain('github.com/corvid-agent/retro-arcade');
  });
});
