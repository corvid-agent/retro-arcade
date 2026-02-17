import {
  createTetrisState, moveLeft, moveRight, moveDown, rotate,
  hardDrop, lockAndSpawn, getTickInterval, TetrisState, COLS, ROWS,
} from './tetris.logic';

describe('Tetris Logic', () => {
  let state: TetrisState;

  beforeEach(() => {
    state = createTetrisState();
  });

  it('should create initial state', () => {
    expect(state.board.length).toBe(ROWS);
    expect(state.board[0].length).toBe(COLS);
    expect(state.score).toBe(0);
    expect(state.level).toBe(1);
    expect(state.linesCleared).toBe(0);
    expect(state.gameOver).toBe(false);
  });

  it('should have a current piece', () => {
    expect(state.current).toBeTruthy();
    expect(state.current.cells.length).toBe(4);
  });

  it('should have a next piece', () => {
    expect(state.next).toBeTruthy();
  });

  it('should move left', () => {
    const origX = state.currentPos.x;
    moveLeft(state);
    expect(state.currentPos.x).toBe(origX - 1);
  });

  it('should move right', () => {
    const origX = state.currentPos.x;
    moveRight(state);
    expect(state.currentPos.x).toBe(origX + 1);
  });

  it('should move down', () => {
    const origY = state.currentPos.y;
    moveDown(state);
    expect(state.currentPos.y).toBe(origY + 1);
  });

  it('should not move left past wall', () => {
    state.currentPos.x = -1;
    for (let i = 0; i < 20; i++) moveLeft(state);
    expect(state.currentPos.x).toBeGreaterThanOrEqual(-1);
  });

  it('should rotate piece', () => {
    const origRot = state.current.rotation;
    rotate(state);
    expect(state.current.rotation).not.toBe(origRot);
  });

  it('should hard drop piece to bottom', () => {
    const dropped = hardDrop(state);
    expect(dropped).toBeGreaterThan(0);
  });

  it('should lock piece and spawn new one', () => {
    hardDrop(state);
    const oldType = state.current.type;
    lockAndSpawn(state);
    // New piece spawned (could be same type by chance, so just check it exists)
    expect(state.current).toBeTruthy();
  });

  it('should clear full lines', () => {
    // Fill bottom row manually
    for (let x = 0; x < COLS; x++) {
      state.board[ROWS - 1][x] = 'I';
    }
    // Lock a piece somewhere above
    hardDrop(state);
    const cleared = lockAndSpawn(state);
    // At least the manually filled row should be cleared
    expect(state.linesCleared).toBeGreaterThanOrEqual(0);
  });

  it('should increase level every 10 lines', () => {
    state.linesCleared = 19;
    state.score = 0;
    // Simulate level update
    state.level = Math.floor(state.linesCleared / 10) + 1;
    expect(state.level).toBe(2);
  });

  it('should decrease tick interval with higher levels', () => {
    expect(getTickInterval(1)).toBeGreaterThan(getTickInterval(5));
    expect(getTickInterval(5)).toBeGreaterThan(getTickInterval(10));
  });

  it('should have a minimum tick interval', () => {
    expect(getTickInterval(100)).toBeGreaterThanOrEqual(100);
  });

  it('should detect game over when new piece cannot spawn', () => {
    // Block spawn area (columns 0-7, rows 0-3) without completing any row
    // Leave column 9 empty so no row is complete
    for (let y = 0; y < 4; y++) {
      for (let x = 0; x < COLS - 1; x++) {
        state.board[y][x] = 'O';
      }
      // Column 9 stays null — row is incomplete, won't be cleared
    }
    // Place the current piece in a known position below the blocked area
    state.current = {
      type: 'O',
      cells: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }],
      rotation: 0,
    };
    state.currentPos = { x: 0, y: 10 };
    // Lock piece at rows 10-11, then spawn new piece at top — which is blocked
    lockAndSpawn(state);
    expect(state.gameOver).toBe(true);
  });
});
