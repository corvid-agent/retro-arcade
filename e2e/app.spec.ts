import { test, expect } from '@playwright/test';

test.describe('App', () => {
  test('should load home page', async ({ page }) => {
    await page.goto('/home');
    await expect(page).toHaveTitle(/Retro Arcade/i);
  });

  test('should show header', async ({ page }) => {
    await page.goto('/home');
    await expect(page.locator('app-header')).toBeVisible();
  });

  test('should show game cards', async ({ page }) => {
    await page.goto('/home');
    await expect(page.locator('.game-card').first()).toBeVisible();
  });

  test('should show all 6 games', async ({ page }) => {
    await page.goto('/home');
    const cards = page.locator('.game-card');
    await expect(cards).toHaveCount(6);
  });
});
