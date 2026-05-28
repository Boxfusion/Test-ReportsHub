import { defineConfig, devices } from '@playwright/test';
import * as path from 'path';

// Multi-project hub. Specs live under projects/<slug>/test-plans/**/*.spec.ts.
// The runner (scripts/run-plan.js) sets HUB_PROJECT to the slug it's running for
// so reporter output lands inside that project's folder.
const PROJECT = process.env.HUB_PROJECT || '';
const projectDir = PROJECT ? path.join('projects', PROJECT) : '.';

export default defineConfig({
  testDir: '.',
  testMatch: 'projects/**/test-plans/**/*.spec.ts',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 90_000,
  expect: { timeout: 10_000 },
  reporter: [
    ['list'],
    ['html', { outputFolder: path.join(projectDir, 'playwright-report'), open: 'never' }],
    ['json', { outputFile: path.join(projectDir, 'test-results', 'results.json') }],
    ['junit', { outputFile: path.join(projectDir, 'test-results', 'junit.xml') }],
    ['allure-playwright', { outputFolder: path.join(projectDir, 'allure-results'), detail: true, suiteTitle: false }],
  ],
  use: {
    baseURL: process.env.APP_URL,
    headless: process.env.HEADED === '1' ? false : true,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  outputDir: path.join(projectDir, 'test-results', 'artifacts'),
});
