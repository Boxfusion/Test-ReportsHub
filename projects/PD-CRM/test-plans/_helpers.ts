// Shared helpers for the PD-CRM specs.
//
// Mirrors the established pattern in projects/DSD-NPO/test-plans/_helpers.ts — PD-CRM had no
// equivalent, which is why every suite run on 2026-09-02 silently exercised the PUBLISHED (Live)
// form versions instead of the ones under test.

import { expect, Page } from '@playwright/test';

export const ADMIN_URL = 'https://pd-dep-adminportal-qa.shesha.app';
export const ADMIN_CREDS = { user: 'Admin', password: 'P@ssword1' };

/**
 * 🔑 Switch the header view mode Live → Latest.
 *
 * **PROJECT RULE: call this on EVERY run, immediately after a successful login.** The header
 * defaults to `Live`, which renders only *published* configuration versions; `Latest` renders the
 * latest versions irrespective of status, which is what we are testing. The app's own menu says:
 *
 *   Live   — Display only published versions of configuration items. It's a default view for regular users.
 *   Ready  — Display ready versions where available with fallback to live
 *   Latest — Display latest versions of configuration items irrespectively of their status
 *
 * ⚠️ The control is an `.ant-dropdown-trigger` whose text is the current mode. It is **NOT** the
 * `.ant-switch.sha-configurable-modeswitcher-switcher` beside it — that one toggles the form
 * *designer* (Edit mode) and does not change which version is served. Confusing the two produced a
 * whole day of Live-mode results on 2026-09-02.
 *
 * ⚠️ The mode **resets to Live on every fresh login**, so it must be re-applied per test, not once
 * per suite.
 *
 * A form with no newer version still reads `vNN LIVE` in Latest mode — that is expected, not a
 * failed switch. Verify the switch by the trigger's own text, which this function does, and it
 * THROWS rather than returning false, so a run can never quietly fall back to Live.
 */
export async function switchToLatest(page: Page) {
  const trigger = page.locator('.ant-dropdown-trigger').filter({ hasText: /^(Live|Ready|Latest)$/ }).first();
  await trigger.waitFor({ state: 'visible', timeout: 45_000 });
  if ((await trigger.innerText()).trim() === 'Latest') return true;

  await trigger.click();
  await page.waitForTimeout(1_200);
  await page
    .locator('.ant-dropdown:not(.ant-dropdown-hidden) li, .ant-dropdown:not(.ant-dropdown-hidden) .ant-dropdown-menu-item')
    .filter({ hasText: /^Latest/i })
    .first()
    .click({ timeout: 8_000 });
  await page.waitForTimeout(3_000);

  const now = (await trigger.innerText()).trim();
  if (now !== 'Latest') throw new Error(`view mode did not switch to Latest, still: ${now}`);
  return true;
}

/** Log in to the admin portal and switch to Latest. Throws if the switch does not take. */
export async function loginAdmin(page: Page, creds = ADMIN_CREDS) {
  await page.goto(`${ADMIN_URL}/login`, { waitUntil: 'domcontentloaded' });
  await page.getByPlaceholder('Username').fill(creds.user);
  await page.locator('input[type="password"]').first().fill(creds.password);
  await page.locator('button:has-text("Sign In")').first().click();
  await page.waitForURL(/\/dynamic\//, { timeout: 60_000 });
  // The trigger only exists after hydration; switchToLatest waits for it.
  await switchToLatest(page);
  return page;
}

/** Assert the run is genuinely in Latest mode — useful as a guard inside a long test. */
export async function assertLatestMode(page: Page) {
  const trigger = page.locator('.ant-dropdown-trigger').filter({ hasText: /^(Live|Ready|Latest)$/ }).first();
  await expect(trigger, 'the run must be in Latest view mode, not Live').toHaveText('Latest', { timeout: 20_000 });
}
