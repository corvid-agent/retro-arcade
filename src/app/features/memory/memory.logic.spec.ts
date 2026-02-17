import { createMemoryState, flipCard, unflipMismatch, getScore, MemoryState } from './memory.logic';

describe('Memory Logic', () => {
  let state: MemoryState;

  beforeEach(() => {
    state = createMemoryState(8);
  });

  it('should create 16 cards for 8 pairs', () => {
    expect(state.cards.length).toBe(16);
  });

  it('should start with 0 moves', () => {
    expect(state.moves).toBe(0);
  });

  it('should start with 0 pairs matched', () => {
    expect(state.pairs).toBe(0);
  });

  it('should not be game over at start', () => {
    expect(state.gameOver).toBe(false);
  });

  it('should have all cards face down', () => {
    expect(state.cards.every((c) => !c.flipped)).toBe(true);
  });

  it('should have unique IDs for each card', () => {
    const ids = state.cards.map((c) => c.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(16);
  });

  it('should flip a card', () => {
    const result = flipCard(state, 0);
    expect(result).toBe('flip');
    expect(state.cards[0].flipped).toBe(true);
  });

  it('should detect match', () => {
    // Find a matching pair
    const first = state.cards[0];
    const matchIdx = state.cards.findIndex((c, i) => i > 0 && c.pairId === first.pairId);
    flipCard(state, 0);
    const result = flipCard(state, matchIdx);
    expect(result).toBe('match');
    expect(state.pairs).toBe(1);
    expect(state.cards[0].matched).toBe(true);
  });

  it('should detect mismatch', () => {
    // Find a non-matching pair
    const first = state.cards[0];
    const nonMatchIdx = state.cards.findIndex((c, i) => i > 0 && c.pairId !== first.pairId);
    flipCard(state, 0);
    const result = flipCard(state, nonMatchIdx);
    expect(result).toBe('mismatch');
  });

  it('should ignore already flipped card', () => {
    flipCard(state, 0);
    const result = flipCard(state, 0);
    expect(result).toBe('ignore');
  });

  it('should ignore when 2 cards already flipped', () => {
    const first = state.cards[0];
    const nonMatchIdx = state.cards.findIndex((c, i) => i > 0 && c.pairId !== first.pairId);
    flipCard(state, 0);
    flipCard(state, nonMatchIdx);
    const result = flipCard(state, 2);
    expect(result).toBe('ignore');
  });

  it('should unflip mismatched cards', () => {
    const first = state.cards[0];
    const nonMatchIdx = state.cards.findIndex((c, i) => i > 0 && c.pairId !== first.pairId);
    flipCard(state, 0);
    flipCard(state, nonMatchIdx);
    unflipMismatch(state);
    expect(state.cards[0].flipped).toBe(false);
    expect(state.cards[nonMatchIdx].flipped).toBe(false);
  });

  it('should count moves', () => {
    const first = state.cards[0];
    const matchIdx = state.cards.findIndex((c, i) => i > 0 && c.pairId === first.pairId);
    flipCard(state, 0);
    flipCard(state, matchIdx);
    expect(state.moves).toBe(1);
  });

  it('should detect game over when all matched', () => {
    // Match all pairs by brute force
    const paired = new Map<number, number[]>();
    state.cards.forEach((c, i) => {
      if (!paired.has(c.pairId)) paired.set(c.pairId, []);
      paired.get(c.pairId)!.push(i);
    });
    for (const [, indices] of paired) {
      flipCard(state, indices[0]);
      flipCard(state, indices[1]);
    }
    expect(state.gameOver).toBe(true);
    expect(state.pairs).toBe(8);
  });

  it('should calculate score based on efficiency', () => {
    state.pairs = 8;
    state.moves = 8;
    const score = getScore(state);
    expect(score).toBe(1000);
  });

  it('should return 0 score for 0 pairs', () => {
    expect(getScore(state)).toBe(0);
  });

  it('should track mistakes', () => {
    const first = state.cards[0];
    const nonMatchIdx = state.cards.findIndex((c, i) => i > 0 && c.pairId !== first.pairId);
    flipCard(state, 0);
    flipCard(state, nonMatchIdx);
    unflipMismatch(state);
    expect(state.mistakes).toBe(1);
  });
});
