import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  let service: ThemeService;

  beforeEach(() => {
    try { localStorage.removeItem('retro-arcade-theme'); } catch {}
    document.documentElement.removeAttribute('data-theme');
    TestBed.configureTestingModule({});
    service = TestBed.inject(ThemeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should default to crt theme', () => {
    expect(service.theme()).toBe('crt');
  });

  it('should toggle between crt and clean', () => {
    service.toggle();
    expect(service.theme()).toBe('clean');
    service.toggle();
    expect(service.theme()).toBe('crt');
  });

  it('should apply theme to document', () => {
    service.init();
    expect(document.documentElement.getAttribute('data-theme')).toBe('crt');
    service.setTheme('clean');
    expect(document.documentElement.getAttribute('data-theme')).toBe('clean');
  });

  it('should set theme directly', () => {
    service.setTheme('clean');
    expect(service.theme()).toBe('clean');
  });
});
