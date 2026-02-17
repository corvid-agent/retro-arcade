import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { NotFoundComponent } from './not-found.component';

describe('NotFoundComponent', () => {
  let fixture: ComponentFixture<NotFoundComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotFoundComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(NotFoundComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should display 404', () => {
    expect(fixture.nativeElement.textContent).toContain('404');
  });

  it('should have return home link', () => {
    const link = fixture.nativeElement.querySelector('.btn--filled');
    expect(link).toBeTruthy();
    expect(link.textContent).toContain('RETURN HOME');
  });
});
