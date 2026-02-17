import { createBoard, slide, Board } from './puzzle-2048.logic';

describe('2048 Logic', () => {
  let board: Board;

  beforeEach(() => {
    board = createBoard();
  });

  it('should create a 4x4 board', () => {
    expect(board.grid.length).toBe(4);
    expect(board.grid[0].length).toBe(4);
  });

  it('should start with 2 tiles', () => {
    let count = 0;
    for (const row of board.grid) {
      for (const cell of row) {
        if (cell) count++;
      }
    }
    expect(count).toBe(2);
  });

  it('should start with score 0', () => {
    expect(board.score).toBe(0);
  });

  it('should slide tiles left', () => {
    // Set up a known board state
    board.grid = [
      [null, null, null, null],
      [null, null, null, null],
      [null, null, null, null],
      [null, null, null, null],
    ];
    board.grid[0][2] = { value: 2, id: 1, merged: false };
    const moved = slide(board, 'left');
    expect(moved).toBe(true);
    expect(board.grid[0][0]?.value).toBe(2);
  });

  it('should merge equal tiles', () => {
    board.grid = [
      [null, null, null, null],
      [null, null, null, null],
      [null, null, null, null],
      [null, null, null, null],
    ];
    board.grid[0][0] = { value: 2, id: 1, merged: false };
    board.grid[0][1] = { value: 2, id: 2, merged: false };
    slide(board, 'left');
    expect(board.grid[0][0]?.value).toBe(4);
    expect(board.score).toBe(4);
  });

  it('should not move if nothing changes', () => {
    board.grid = [
      [null, null, null, null],
      [null, null, null, null],
      [null, null, null, null],
      [null, null, null, null],
    ];
    board.grid[0][0] = { value: 2, id: 1, merged: false };
    board.grid[1][0] = { value: 4, id: 2, merged: false };
    const moved = slide(board, 'left');
    expect(moved).toBe(false);
  });

  it('should slide right', () => {
    board.grid = [
      [null, null, null, null],
      [null, null, null, null],
      [null, null, null, null],
      [null, null, null, null],
    ];
    board.grid[0][0] = { value: 2, id: 1, merged: false };
    const moved = slide(board, 'right');
    expect(moved).toBe(true);
    expect(board.grid[0][3]?.value).toBe(2);
  });

  it('should slide up', () => {
    board.grid = [
      [null, null, null, null],
      [null, null, null, null],
      [null, null, null, null],
      [null, null, null, null],
    ];
    board.grid[3][0] = { value: 2, id: 1, merged: false };
    const moved = slide(board, 'up');
    expect(moved).toBe(true);
    expect(board.grid[0][0]?.value).toBe(2);
  });

  it('should slide down', () => {
    board.grid = [
      [null, null, null, null],
      [null, null, null, null],
      [null, null, null, null],
      [null, null, null, null],
    ];
    board.grid[0][0] = { value: 2, id: 1, merged: false };
    const moved = slide(board, 'down');
    expect(moved).toBe(true);
    expect(board.grid[3][0]?.value).toBe(2);
  });

  it('should spawn a new tile after move', () => {
    board.grid = [
      [null, null, null, null],
      [null, null, null, null],
      [null, null, null, null],
      [null, null, null, null],
    ];
    board.grid[0][2] = { value: 2, id: 1, merged: false };
    slide(board, 'left');
    let count = 0;
    for (const row of board.grid) {
      for (const cell of row) {
        if (cell) count++;
      }
    }
    expect(count).toBe(2); // original moved + new spawn
  });

  it('should increment moves on slide', () => {
    board.grid = [
      [null, null, null, null],
      [null, null, null, null],
      [null, null, null, null],
      [null, null, null, null],
    ];
    board.grid[0][2] = { value: 2, id: 1, merged: false };
    slide(board, 'left');
    expect(board.moves).toBe(1);
  });

  it('should track max tile', () => {
    board.grid = [
      [null, null, null, null],
      [null, null, null, null],
      [null, null, null, null],
      [null, null, null, null],
    ];
    board.grid[0][0] = { value: 1024, id: 1, merged: false };
    board.grid[0][1] = { value: 1024, id: 2, merged: false };
    slide(board, 'left');
    expect(board.maxTile).toBe(2048);
  });

  it('should detect game over', () => {
    // Fill board with non-mergeable tiles in a checkerboard pattern
    let id = 1;
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        // Each cell has a unique value so nothing can merge
        const value = Math.pow(2, r * 4 + c + 1);
        board.grid[r][c] = { value, id: id++, merged: false };
      }
    }
    // No slide should succeed since all cells are filled and non-mergeable
    const movedL = slide(board, 'left');
    expect(movedL).toBe(false);
    // Game over is checked when a move succeeds and spawns a tile,
    // so let's verify the board is stuck
    const movedR = slide(board, 'right');
    expect(movedR).toBe(false);
    const movedU = slide(board, 'up');
    expect(movedU).toBe(false);
    const movedD = slide(board, 'down');
    expect(movedD).toBe(false);
  });
});
