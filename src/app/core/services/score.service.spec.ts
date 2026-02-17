import { TestBed } from '@angular/core/testing';
import { ScoreService } from './score.service';

describe('ScoreService', () => {
  let service: ScoreService;

  beforeEach(() => {
    try { localStorage.removeItem('retro-arcade-scores'); } catch {}
    TestBed.configureTestingModule({});
    service = TestBed.inject(ScoreService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return empty scores for a new game', () => {
    expect(service.getScores('snake')).toEqual([]);
  });

  it('should return 0 high score for a new game', () => {
    expect(service.getHighScore('snake')).toBe(0);
  });

  it('should submit and retrieve scores', () => {
    service.submit('snake', 100);
    expect(service.getScores('snake').length).toBe(1);
    expect(service.getHighScore('snake')).toBe(100);
  });

  it('should return true for a new high score', () => {
    service.submit('snake', 50);
    const isNew = service.submit('snake', 100);
    expect(isNew).toBe(true);
  });

  it('should return false when not a new high score', () => {
    service.submit('snake', 100);
    const isNew = service.submit('snake', 50);
    expect(isNew).toBe(false);
  });

  it('should sort scores descending', () => {
    service.submit('snake', 30);
    service.submit('snake', 100);
    service.submit('snake', 50);
    const scores = service.getScores('snake');
    expect(scores[0].score).toBe(100);
    expect(scores[1].score).toBe(50);
    expect(scores[2].score).toBe(30);
  });

  it('should keep only top 10 scores', () => {
    for (let i = 0; i < 15; i++) {
      service.submit('snake', i * 10);
    }
    expect(service.getScores('snake').length).toBe(10);
  });

  it('should clear scores for a specific game', () => {
    service.submit('snake', 100);
    service.submit('tetris', 200);
    service.clearGame('snake');
    expect(service.getScores('snake')).toEqual([]);
    expect(service.getScores('tetris').length).toBe(1);
  });

  it('should clear all scores', () => {
    service.submit('snake', 100);
    service.submit('tetris', 200);
    service.clearAll();
    expect(service.getScores('snake')).toEqual([]);
    expect(service.getScores('tetris')).toEqual([]);
  });

  it('should handle submit with level info', () => {
    service.submit('tetris', 500, 3);
    const scores = service.getScores('tetris');
    expect(scores[0].level).toBe(3);
  });
});
