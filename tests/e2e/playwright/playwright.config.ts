import { defineConfig, devices } from '@playwright/test';

const ALL_FLAVORS = ['js', 'js-umd', 'react', 'vue'];
const ALL_BROWSERS = ['chromium', 'firefox'] as const;

// Get flavors to test based on E2E_FLAVOR env var
const flavors = process.env.E2E_FLAVOR
  ? [process.env.E2E_FLAVOR]
  : ALL_FLAVORS;

// Get browsers to test based on E2E_BROWSER env var (e.g., E2E_BROWSER=chromium for faster local dev)
const browsers = process.env.E2E_BROWSER
  ? [process.env.E2E_BROWSER as (typeof ALL_BROWSERS)[number]]
  : ALL_BROWSERS;

const browserDevices = {
  chromium: devices['Desktop Chrome'],
  firefox: devices['Desktop Firefox'],
} as const;

// Create projects for each flavor × browser combination
const projects = flavors.flatMap((flavor) =>
  browsers.map((browser) => ({
    name: `${flavor}-${browser}`,
    use: {
      ...browserDevices[browser],
      baseURL: `http://localhost:3456/examples/${flavor}/e-commerce/`,
    },
    metadata: { flavor },
  }))
);

export default defineConfig({
  testDir: './specs',
  testMatch: '**/*.spec.ts',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  // Static serve server can handle multiple workers
  workers: 2,
  reporter: process.env.CI
    ? [['junit', { outputFile: '../junit/playwright/results.xml' }], ['html']]
    : [['list'], ['html', { open: 'never' }]],
  use: {
    trace: 'on-first-retry',
  },
  projects,
  webServer: {
    command: 'npx serve ../../website -l 3456',
    url: 'http://localhost:3456',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
