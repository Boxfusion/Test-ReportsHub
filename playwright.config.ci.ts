import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: '.',
  workers: 1,
  timeout: 90_000,
  reporter: [
    ['list'],
    ['json',  { outputFile: 'ci-results/results.json' }],
    ['junit', { outputFile: 'ci-results/junit.xml' }],
  ],
  use: {
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
  },
  outputDir: 'ci-results/artifacts',
});
