import { test, expect } from '@playwright/test';

test.describe('Game Selection', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/home');
  });

  test('should show game names', async ({ page }) => {
    const names = page.locator('.game-card__name');
    await expect(names.first()).toBeVisible();
  });

  test('should navigate to snake', async ({ page }) => {
    await page.locator('.game-card', { hasText: /snake/i }).click();
    await expect(page).toHaveURL(/\/snake/);
  });

  test('should navigate to tetris', async ({ page }) => {
    await page.locator('.game-card', { hasText: /tetris/i }).click();
    await expect(page).toHaveURL(/\/tetris/);
  });

  test('should navigate to memory', async ({ page }) => {
    await page.locator('.game-card', { hasText: /memory/i }).click();
    await expect(page).toHaveURL(/\/memory/);
  });

  test('should navigate to 2048', async ({ page }) => {
    await page.locator('.game-card', { hasText: /2048/i }).click();
    await expect(page).toHaveURL(/\/2048/);
  });
});
