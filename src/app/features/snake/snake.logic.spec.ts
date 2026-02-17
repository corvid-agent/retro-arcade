import { createSnakeState, setDirection, tick, SnakeState } from './snake.logic';

describe('Snake Logic', () => {
  let state: SnakeState;

  beforeEach(() => {
    state = createSnakeState(20, 20);
  });

  it('should create initial state', () => {
    expect(state.snake.length).toBe(3);
    expect(state.direction).toBe('right');
    expect(state.score).toBe(0);
    expect(state.gameOver).toBe(false);
  });

  it('should have food on the board', () => {
    expect(state.food.x).toBeGreaterThanOrEqual(0);
    expect(state.food.x).toBeLessThan(20);
    expect(state.food.y).toBeGreaterThanOrEqual(0);
    expect(state.food.y).toBeLessThan(20);
  });

  it('should move right by default', () => {
    const headX = state.snake[0].x;
    tick(state);
    expect(state.snake[0].x).toBe(headX + 1);
  });

  it('should change direction', () => {
    setDirection(state, 'down');
    tick(state);
    expect(state.direction).toBe('down');
  });

  it('should not reverse direction', () => {
    setDirection(state, 'left');
    expect(state.nextDirection).toBe('right');
  });

  it('should eat food and grow', () => {
    state.food = { x: state.snake[0].x + 1, y: state.snake[0].y };
    const result = tick(state);
    expect(result.ate).toBe(true);
    expect(state.snake.length).toBe(4);
    expect(state.score).toBe(10);
  });

  it('should die on wall collision', () => {
    state.snake[0].x = 19;
    state.direction = 'right';
    state.nextDirection = 'right';
    const result = tick(state);
    expect(result.died).toBe(true);
    expect(state.gameOver).toBe(true);
  });

  it('should die on self collision', () => {
    state.snake = [
      { x: 5, y: 5 },
      { x: 6, y: 5 },
      { x: 6, y: 4 },
      { x: 5, y: 4 },
      { x: 4, y: 4 },
    ];
    state.direction = 'up';
    state.nextDirection = 'up';
    // Moving up from (5,5) → (5,4) which is occupied
    const result = tick(state);
    expect(result.died).toBe(true);
  });

  it('should not grow when not eating', () => {
    // Make sure food is not adjacent
    state.food = { x: 0, y: 0 };
    state.snake = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];
    tick(state);
    expect(state.snake.length).toBe(3);
  });

  it('should maintain snake body after move', () => {
    const tail = { ...state.snake[state.snake.length - 1] };
    state.food = { x: 0, y: 0 };
    state.snake = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];
    tick(state);
    expect(state.snake[1].x).toBe(10);
    expect(state.snake[1].y).toBe(10);
  });
});
