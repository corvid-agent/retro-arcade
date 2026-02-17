export type Direction = 'up' | 'down' | 'left' | 'right';

export interface Cell {
  value: number;
  id: number;
  merged: boolean;
}

export interface Board {
  grid: (Cell | null)[][];
  size: number;
  score: number;
  maxTile: number;
  gameOver: boolean;
  won: boolean;
  moves: number;
}

let nextId = 1;

export function createBoard(size = 4): Board {
  nextId = 1;
  const grid: (Cell | null)[][] = Array.from({ length: size }, () => Array(size).fill(null));
  const board: Board = { grid, size, score: 0, maxTile: 0, gameOver: false, won: false, moves: 0 };
  spawnTile(board);
  spawnTile(board);
  return board;
}

export function spawnTile(board: Board): boolean {
  const empty: { r: number; c: number }[] = [];
  for (let r = 0; r < board.size; r++) {
    for (let c = 0; c < board.size; c++) {
      if (!board.grid[r][c]) empty.push({ r, c });
    }
  }
  if (empty.length === 0) return false;
  const pos = empty[Math.floor(Math.random() * empty.length)];
  board.grid[pos.r][pos.c] = { value: Math.random() < 0.9 ? 2 : 4, id: nextId++, merged: false };
  return true;
}

export function slide(board: Board, dir: Direction): boolean {
  // Reset merged flags
  for (const row of board.grid) {
    for (const cell of row) {
      if (cell) cell.merged = false;
    }
  }

  let moved = false;
  const size = board.size;

  const process = (line: (Cell | null)[]): (Cell | null)[] => {
    // Remove nulls
    const tiles = line.filter((c): c is Cell => c !== null);
    const result: (Cell | null)[] = [];

    for (let i = 0; i < tiles.length; i++) {
      if (i + 1 < tiles.length && tiles[i].value === tiles[i + 1].value) {
        const merged: Cell = { value: tiles[i].value * 2, id: nextId++, merged: true };
        board.score += merged.value;
        board.maxTile = Math.max(board.maxTile, merged.value);
        if (merged.value === 2048 && !board.won) board.won = true;
        result.push(merged);
        i++;
      } else {
        result.push(tiles[i]);
      }
    }

    while (result.length < size) result.push(null);
    return result;
  };

  if (dir === 'left') {
    for (let r = 0; r < size; r++) {
      const line = board.grid[r];
      const result = process(line);
      if (line.some((c, i) => c !== result[i])) moved = true;
      board.grid[r] = result;
    }
  } else if (dir === 'right') {
    for (let r = 0; r < size; r++) {
      const line = [...board.grid[r]].reverse();
      const result = process(line).reverse();
      if (board.grid[r].some((c, i) => c !== result[i])) moved = true;
      board.grid[r] = result;
    }
  } else if (dir === 'up') {
    for (let c = 0; c < size; c++) {
      const line = board.grid.map((row) => row[c]);
      const result = process(line);
      if (line.some((cell, i) => cell !== result[i])) moved = true;
      for (let r = 0; r < size; r++) board.grid[r][c] = result[r];
    }
  } else {
    for (let c = 0; c < size; c++) {
      const line = board.grid.map((row) => row[c]).reverse();
      const result = process(line).reverse();
      const orig = board.grid.map((row) => row[c]);
      if (orig.some((cell, i) => cell !== result[i])) moved = true;
      for (let r = 0; r < size; r++) board.grid[r][c] = result[r];
    }
  }

  if (moved) {
    board.moves++;
    spawnTile(board);
    if (isGameOver(board)) board.gameOver = true;
  }

  return moved;
}

function isGameOver(board: Board): boolean {
  const size = board.size;
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (!board.grid[r][c]) return false;
      const val = board.grid[r][c]!.value;
      if (r + 1 < size && board.grid[r + 1][c]?.value === val) return false;
      if (c + 1 < size && board.grid[r][c + 1]?.value === val) return false;
    }
  }
  return true;
}
