import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: './tests/browser', fullyParallel: true,
  use: { baseURL: 'http://127.0.0.1:4173', ...devices['Desktop Chrome'], channel: 'chrome', screenshot: 'only-on-failure' },
  webServer: { env: { VITE_GOOGLE_MAPS_API_KEY: 'browser-test-key' }, command: 'npm run dev -- --host 127.0.0.1 --port 4173', url: 'http://127.0.0.1:4173', reuseExistingServer: !process.env.CI },
});
