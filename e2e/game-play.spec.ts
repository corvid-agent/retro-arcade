import { test, expect } from '@playwright/test';

test.describe('Game Play', () => {
  test('snake game loads with canvas', async ({ page }) => {
    await page.goto('/snake');
    await expect(page.locator('app-game-shell')).toBeVisible();
    await expect(page.locator('canvas')).toBeVisible();
  });

  test('tetris game loads', async ({ page }) => {
    await page.goto('/tetris');
    await expect(page.locator('app-game-shell')).toBeVisible();
  });

  test('breakout game loads', async ({ page }) => {
    await page.goto('/breakout');
    await expect(page.locator('app-game-shell')).toBeVisible();
  });

  test('invaders game loads', async ({ page }) => {
    await page.goto('/invaders');
    await expect(page.locator('app-game-shell')).toBeVisible();
  });

  test('memory game loads with board', async ({ page }) => {
    await page.goto('/memory');
    await expect(page.locator('.memory-board')).toBeVisible();
  });

  test('2048 game loads with board', async ({ page }) => {
    await page.goto('/2048');
    await expect(page.locator('.p2048-board')).toBeVisible();
  });

  test('game shell shows start overlay', async ({ page }) => {
    await page.goto('/snake');
    const overlay = page.locator('.game-shell__overlay');
    await expect(overlay).toBeVisible();
  });

  test('game shell shows score bar', async ({ page }) => {
    await page.goto('/snake');
    await expect(page.locator('.game-shell__bar')).toBeVisible();
  });
});
