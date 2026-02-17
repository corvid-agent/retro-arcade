import { TestBed } from '@angular/core/testing';
import { AudioService } from './audio.service';

describe('AudioService', () => {
  let service: AudioService;

  beforeEach(() => {
    try { localStorage.removeItem('retro-arcade-muted'); } catch {}
    TestBed.configureTestingModule({});
    service = TestBed.inject(AudioService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start unmuted by default', () => {
    expect(service.muted()).toBe(false);
  });

  it('should toggle mute', () => {
    service.toggleMute();
    expect(service.muted()).toBe(true);
    service.toggleMute();
    expect(service.muted()).toBe(false);
  });

  it('should not throw when play is called without init', () => {
    expect(() => service.play('eat')).not.toThrow();
  });

  it('should not throw when play is called while muted', () => {
    service.toggleMute();
    expect(() => service.play('eat')).not.toThrow();
  });
});
