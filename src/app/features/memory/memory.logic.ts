export interface Card {
  id: number;
  symbol: string;
  pairId: number;
  flipped: boolean;
  matched: boolean;
}

export interface MemoryState {
  cards: Card[];
  flippedIndices: number[];
  moves: number;
  pairs: number;
  totalPairs: number;
  mistakes: number;
  gameOver: boolean;
}

const SYMBOLS = [
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H',
  'J', 'K', 'L', 'N', 'P', 'R', 'S', 'T',
  'W', 'X',
];

export function createMemoryState(pairCount = 8): MemoryState {
  const symbols = SYMBOLS.slice(0, pairCount);
  const cards: Card[] = [];
  let id = 0;

  for (let i = 0; i < symbols.length; i++) {
    cards.push({ id: id++, symbol: symbols[i], pairId: i, flipped: false, matched: false });
    cards.push({ id: id++, symbol: symbols[i], pairId: i, flipped: false, matched: false });
  }

  shuffle(cards);

  return {
    cards,
    flippedIndices: [],
    moves: 0,
    pairs: 0,
    totalPairs: pairCount,
    mistakes: 0,
    gameOver: false,
  };
}

export function flipCard(state: MemoryState, index: number): 'flip' | 'match' | 'mismatch' | 'ignore' {
  const card = state.cards[index];

  if (card.flipped || card.matched || state.flippedIndices.length >= 2) {
    return 'ignore';
  }

  card.flipped = true;
  state.flippedIndices.push(index);

  if (state.flippedIndices.length === 2) {
    state.moves++;
    const a = state.cards[state.flippedIndices[0]];
    const b = state.cards[state.flippedIndices[1]];

    if (a.pairId === b.pairId) {
      a.matched = true;
      b.matched = true;
      state.pairs++;
      state.flippedIndices = [];

      if (state.pairs === state.totalPairs) {
        state.gameOver = true;
      }

      return 'match';
    }

    return 'mismatch';
  }

  return 'flip';
}

export function unflipMismatch(state: MemoryState): void {
  for (const idx of state.flippedIndices) {
    state.cards[idx].flipped = false;
  }
  state.mistakes++;
  state.flippedIndices = [];
}

function shuffle<T>(arr: T[]): void {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

export function getScore(state: MemoryState): number {
  if (state.pairs === 0) return 0;
  const efficiency = state.pairs / Math.max(state.moves, 1);
  return Math.round(efficiency * 1000);
}
