import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('should navigate to home', async ({ page }) => {
    await page.goto('/home');
    await expect(page.locator('.game-card').first()).toBeVisible();
  });

  test('should navigate to stats', async ({ page }) => {
    await page.goto('/stats');
    await expect(page.locator('.stats__stat').first()).toBeVisible();
  });

  test('should navigate to about', async ({ page }) => {
    await page.goto('/about');
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('should redirect root to home', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/home/);
  });
});
