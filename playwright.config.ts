import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  retries: 1,
  use: {
    baseURL: 'http://localhost:4280',
    headless: true,
    viewport: { width: 1280, height: 720 },
  },
  webServer: {
    command: 'bun run start -- --port 4280',
    port: 4280,
    reuseExistingServer: true,
    timeout: 60_000,
  },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
  ],
});
