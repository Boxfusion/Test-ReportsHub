import { defineConfig, devices } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

// Load the gitignored .env at the hub root (zero-dep). Real env vars / CI secrets always win.
for (const line of fs.existsSync(path.join(__dirname, '.env'))
  ? fs.readFileSync(path.join(__dirname, '.env'), 'utf8').split('\n')
  : []) {
  const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
  if (m && process.env[m[1]] === undefined) {
    process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}

// baseURL: an explicit APP_URL wins, else <TEST_ENV>_APP_URL (e.g. TEST_ENV=dev → DEV_APP_URL).
const TEST_ENV = (process.env.TEST_ENV || '').toUpperCase();
const BASE_URL = process.env.APP_URL || (TEST_ENV ? process.env[`${TEST_ENV}_APP_URL`] : undefined);

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
  // STRICT_CHAIN: for an end-to-end single-tender chain run, retry a failing TC once and then
  // halt the whole run on the first definitive failure (so a broken chain stops honestly instead
  // of letting later TCs "pass" off unrelated leftover items). Default runs are unchanged.
  // RETRIES / MAX_FAILURES env overrides let a "report" run retry flaky TCs without the STRICT_CHAIN
  // early-stop (e.g. RETRIES=2 MAX_FAILURES=0 runs the whole chain, retrying each TC, so every TC's
  // steps land in the report). Defaults are unchanged.
  retries: process.env.RETRIES !== undefined ? Number(process.env.RETRIES) : (process.env.STRICT_CHAIN === '1' ? 1 : 0),
  maxFailures: process.env.MAX_FAILURES !== undefined ? Number(process.env.MAX_FAILURES) : (process.env.STRICT_CHAIN === '1' ? 1 : 0),
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
    baseURL: BASE_URL,
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
