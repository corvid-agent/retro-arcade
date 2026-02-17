import { TestBed } from '@angular/core/testing';
import { StatsService } from './stats.service';

describe('StatsService', () => {
  let service: StatsService;

  beforeEach(() => {
    try { localStorage.removeItem('retro-arcade-stats'); } catch {}
    TestBed.configureTestingModule({});
    service = TestBed.inject(StatsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return default stats for a new game', () => {
    const stats = service.getStats('snake');
    expect(stats.gamesPlayed).toBe(0);
    expect(stats.totalPlayTime).toBe(0);
    expect(stats.highestScore).toBe(0);
  });

  it('should track games played', () => {
    service.startSession('snake');
    service.endSession(100);
    expect(service.getStats('snake').gamesPlayed).toBe(1);
  });

  it('should track highest score', () => {
    service.startSession('snake');
    service.endSession(50);
    service.startSession('snake');
    service.endSession(100);
    expect(service.getStats('snake').highestScore).toBe(100);
  });

  it('should count total games played across all games', () => {
    service.startSession('snake');
    service.endSession(50);
    service.startSession('tetris');
    service.endSession(100);
    expect(service.getTotalGamesPlayed()).toBe(2);
  });

  it('should reset all stats', () => {
    service.startSession('snake');
    service.endSession(100);
    service.reset();
    expect(service.getStats('snake').gamesPlayed).toBe(0);
    expect(service.getTotalGamesPlayed()).toBe(0);
  });
});
