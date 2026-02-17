import { TestBed } from '@angular/core/testing';
import { AchievementService } from './achievement.service';
import { NotificationService } from './notification.service';

describe('AchievementService', () => {
  let service: AchievementService;
  let notifications: NotificationService;

  beforeEach(() => {
    try { localStorage.removeItem('retro-arcade-achievements'); } catch {}
    TestBed.configureTestingModule({});
    service = TestBed.inject(AchievementService);
    notifications = TestBed.inject(NotificationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have achievements defined', () => {
    expect(service.achievements().length).toBeGreaterThan(0);
  });

  it('should start with no unlocked achievements', () => {
    expect(service.getUnlocked().length).toBe(0);
  });

  it('should unlock snake-first on first snake game', () => {
    service.check({ gameId: 'snake', score: 10, totalGamesPlayed: 1 });
    const unlocked = service.getUnlocked();
    expect(unlocked.some((a) => a.id === 'snake-first')).toBe(true);
  });

  it('should show notification on achievement unlock', () => {
    service.check({ gameId: 'snake', score: 10, totalGamesPlayed: 1 });
    expect(notifications.toasts().length).toBeGreaterThan(0);
  });

  it('should not re-unlock already unlocked achievements', () => {
    service.check({ gameId: 'snake', score: 10, totalGamesPlayed: 1 });
    const count = service.getUnlocked().length;
    service.check({ gameId: 'snake', score: 10, totalGamesPlayed: 2 });
    expect(service.getUnlocked().length).toBe(count);
  });

  it('should unlock score-based achievements', () => {
    service.check({ gameId: 'snake', score: 100, totalGamesPlayed: 1 });
    const unlocked = service.getUnlocked();
    expect(unlocked.some((a) => a.id === 'snake-100')).toBe(true);
  });

  it('should unlock global achievements based on total games', () => {
    service.check({ gameId: 'snake', score: 10, totalGamesPlayed: 5 });
    expect(service.getUnlocked().some((a) => a.id === 'play-5')).toBe(true);
  });

  it('should get achievements by game', () => {
    const snakeAchievements = service.getByGame('snake');
    expect(snakeAchievements.length).toBeGreaterThan(0);
    expect(snakeAchievements.every((a) => a.gameId === 'snake')).toBe(true);
  });

  it('should reset all achievements', () => {
    service.check({ gameId: 'snake', score: 10, totalGamesPlayed: 1 });
    service.reset();
    expect(service.getUnlocked().length).toBe(0);
  });
});
