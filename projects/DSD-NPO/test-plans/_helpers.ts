// Shared helpers for the DSD-NPO specs.
// NOT a spec — playwright.config testMatch is `**/test-plans/**/*.spec.ts`, so this file
// is imported, never collected as a test.
//
// Every selector here was RECORDED LIVE on 2026-08-13 against the QA environment.
// If one drifts, fix it here once rather than in twenty specs.

import { Page, expect } from '@playwright/test';

export const PUBLIC_URL = 'https://dsd-npo-publicportal-1-qa.shesha.app';
export const ADMIN_URL = 'https://dsd-npo-adminportal-qa.shesha.app';

export const CREDS = { user: 'mpenduloizwelinuk@gmail.com', password: '123qwe' };

/** Public-portal routes, recorded from the signed-in nav bar. */
export const PUBLIC_ROUTES = {
  login: '/login',
  signUp: '/no-auth/boxfusion.dsdnpo/signUp-public-portal',
  sendOtp: '/no-auth/boxfusion.dsdnpo/dsd-public-portal-send-otp',
  forgotPassword: '/no-auth/boxfusion.dsdnpo/dsd-public-forgot-password',
  landingPage: '/no-auth/boxfusion.dsdnpo/landing-page',
  dashboard: '/dynamic/boxfusion.dsdnpo/npo-landing-view',
  registerNpo: '/dynamic/boxfusion.dsdnpo/no-existing-npo-landing-page',
  popiAct: '/dynamic/boxfusion.dsdnpo/popi-act',
  educationAwareness: '/dynamic/boxfusion.dsdnpo/portal-education-awareness',
  contactUs: '/dynamic/boxfusion.dsdnpo/portal-contact-us',
  faqs: '/dynamic/boxfusion.dsdnpo/FAQs',
  workflowsInbox: '/dynamic/Shesha.Workflow/workflows-inbox',
};

/**
 * Admin CRUDS routes — the NPO lifecycle.
 * Recorded 2026-08-13 by REAL-clicking the CRUDS submenu. A synthetic `el.click()`
 * does NOT open the flyout; `page.locator(...).click()` does.
 */
export const ADMIN_ROUTES = {
  workflowsInbox: '/dynamic/Shesha.Workflow/workflows-inbox',
  allNpos: '/dynamic/boxfusion.dsdnpo/npos',
  allApplications: '/dynamic/boxfusion.dsdnpo/npoapplication',
  annualCompliance: '/dynamic/boxfusion.dsdnpo/annual-compliance',
  appeals: '/dynamic/boxfusion.dsdnpo/appeal-table',
  changeRequests: '/dynamic/boxfusion.dsdnpo/change-requests',
  investigations: '/dynamic/boxfusion.dsdnpo/investigation-table-view',
  deregistrations: '/dynamic/boxfusion.dsdnpo/allDeregistrationApplications-table',
  spatialMap: '/dynamic/boxfusion.dsdnpo/npocase-spartial-map',
  userManagement: '/dynamic/boxfusion.dsdnpo/user-management-table',
  workflowDashboard: '/dynamic/boxfusion.dsdnpo/dashboard',
};

/**
 * Both portals are Next.js SPAs. While loading, the body holds `Initializing...` or raw
 * `self.__next_f` flight data — a fixed delay is NOT enough. On a login page the password
 * input is the reliable hydration marker.
 */
export async function waitForHydration(page: Page) {
  await page.waitForFunction(
    () => !/Initializing\.\.\./.test(document.body.innerText) && document.body.innerText.length > 50,
    undefined,
    { timeout: 30_000 },
  );
}

/**
 * 🔑 Switch the header view mode Live → Latest. PROJECT RULE: do this on EVERY run,
 * right after login, on BOTH portals. Otherwise the run silently exercises the
 * *published* form version instead of the one under test.
 *
 * A form with no newer version still reads `vNN LIVE` in Latest mode — that is expected,
 * not a failed switch.
 */
export async function switchToLatest(page: Page) {
  // 🔑 The trigger only exists AFTER hydration. The previous version bailed out with
  // `isVisible() === false` when called too early and the caller swallowed the `false` —
  // so the run silently exercised the PUBLISHED form version. On 2026-08-25 that produced a
  // "the form has no Correspondence section" reading taken entirely in Live mode.
  // Wait for the trigger, switch, then RE-READ it and throw. Never fail silently.
  const trigger = page.locator('.ant-dropdown-trigger').filter({ hasText: /^(Live|Ready|Latest)$/ }).first();
  await trigger.waitFor({ state: 'visible', timeout: 45_000 });
  if ((await trigger.innerText()).trim() === 'Latest') return true;
  await trigger.click();
  const option = page
    .locator('.ant-dropdown:not(.ant-dropdown-hidden) li, .ant-dropdown:not(.ant-dropdown-hidden) .ant-dropdown-menu-item')
    .filter({ hasText: /^Latest/i })
    .first();
  await option.click({ timeout: 8000 });
  await page.waitForTimeout(2500);
  const now = (await trigger.innerText()).trim();
  if (now !== 'Latest') throw new Error(`view mode did not switch to Latest, still: ${now}`);
  return true;
}

/** Public portal. Submit button reads **Login** (the admin portal's reads **Sign In**). */
export async function loginPublic(page: Page, creds = CREDS) {
  await page.goto(PUBLIC_URL + PUBLIC_ROUTES.login);
  await page.locator('input[type=password]').waitFor({ state: 'visible', timeout: 30_000 });
  await typeReal(page.locator('input[type=text]').first(), creds.user);
  await typeReal(page.locator('input[type=password]').first(), creds.password);
  await page.getByRole('button', { name: 'Login' }).click();
  await page.waitForURL(/dynamic|landing/i, { timeout: 45_000 });
  await waitForHydration(page);
  await switchToLatest(page);          // throws if it did not take — never silently Live
}

/** Admin portal. Submit button reads **Sign In**. */
export async function loginAdmin(page: Page, creds = CREDS) {
  await page.goto(ADMIN_URL + '/login');
  await page.locator('input[type=password]').waitFor({ state: 'visible', timeout: 30_000 });
  await typeReal(page.locator('input[type=text]').first(), creds.user);
  await typeReal(page.locator('input[type=password]').first(), creds.password);
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.waitForURL(/dynamic/i, { timeout: 45_000 });
  await waitForHydration(page);
  await switchToLatest(page);          // throws if it did not take — never silently Live
}

/**
 * 🔑 `fill()` does NOT bind on these Shesha forms. It sets the DOM value but React state
 * never updates, so the next re-render blanks it — which is how a step reports "9 fields
 * filled" and then reads entirely empty.
 *
 * Click, clear, type for real, then READ THE VALUE BACK. Clearing first matters: unbounded
 * `pressSequentially` has grown a field past a server length limit and caused a silent 500
 * elsewhere in this hub.
 */
export async function typeReal(locator: any, value: string) {
  await locator.click();
  await locator.press('ControlOrMeta+a').catch(() => {});
  await locator.press('Delete').catch(() => {});
  await locator.pressSequentially(value, { delay: 25 });
  const got = await locator.inputValue();
  if (got !== value) {
    // one retry — the form may have been re-rendering while we typed
    await locator.click();
    await locator.press('ControlOrMeta+a').catch(() => {});
    await locator.pressSequentially(value, { delay: 40 });
  }
  return locator.inputValue();
}

/**
 * 🔑 AntD selects: the CLOSED dropdown stays MOUNTED, so a global `.ant-select-item-option`
 * lookup hits stale hidden options. Scope to the open dropdown only.
 */
export async function selectAntdOption(page: Page, selectLocator: any, optionText: string | RegExp) {
  await selectLocator.click();
  const option = page
    .locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option')
    .filter({ hasText: optionText })
    .first();
  await option.click();
  await page.keyboard.press('Escape');
  return selectLocator.locator('.ant-select-selection-item').innerText().catch(() => null);
}

/**
 * 🔑 DSD-NPO admin grids are `sha-react-table`, NOT AntD tables.
 * `.ant-table*` selectors return 0 rows on perfectly healthy pages — that produced a
 * "21 of 24 admin areas did not render" inventory in 2026-08 which was retracted in full.
 * Use `[role=table]` / `[role=row]`, and read totals from the pagination caption.
 */
export async function waitForGrid(page: Page, timeout = 30_000) {
  await page.locator('[role=table]').first().waitFor({ state: 'visible', timeout });
  await page.waitForTimeout(1500);
}

export async function gridColumns(page: Page): Promise<string[]> {
  return page.locator('[role=columnheader]').allInnerTexts()
    .then(v => v.map(s => s.trim().replace(/\s+/g, ' ')).filter(Boolean));
}

export async function gridRowCount(page: Page): Promise<number> {
  return page.locator('[role=row]').count();
}

/** Reads the "1-10 of 10309 items" caption and returns the total. */
export async function gridTotal(page: Page): Promise<number | null> {
  const text = await page.locator('.ant-pagination').first().innerText().catch(() => '');
  const m = text.match(/of\s+([\d\s]+)\s*items/i);
  return m ? Number(m[1].replace(/\s/g, '')) : null;
}

/**
 * 🔑 Hidden controls stay MOUNTED on Shesha pages, so `filter({hasText})` and `.first()`
 * happily match an INVISIBLE copy and the click silently never lands.
 * Loop and click the first genuinely visible match.
 */
export async function clickFirstVisible(page: Page, selector: string, name?: string | RegExp) {
  let candidates = page.locator(selector);
  if (name) candidates = candidates.filter({ hasText: name });
  const n = await candidates.count();
  for (let i = 0; i < n; i++) {
    const el = candidates.nth(i);
    if (await el.isVisible().catch(() => false)) {
      await el.click();
      return true;
    }
  }
  throw new Error(`No visible match for ${selector}${name ? ` with text ${name}` : ''} (${n} hidden candidates)`);
}

/**
 * 🔑 CAPTURE THE RESPONSE BODY OF EVERY >=400 POST.
 * The headline defect on this build: `POST .../UserManagement/Create` returned 400 with
 * "Specified mobile number already used by another person" in the standard ABP
 * `validationErrors` envelope, and the UI DISCARDED it — modal closed, nothing shown,
 * indistinguishable from success. A closing form is NEVER proof of a save.
 *
 * Attach this before any submit, then assert retrievability separately.
 */
export function captureFailedRequests(page: Page) {
  const failures: Array<{ url: string; status: number; body: string }> = [];
  page.on('response', async res => {
    if (res.status() >= 400 && /\/api\//.test(res.url())) {
      const body = await res.text().catch(() => '<unreadable>');
      failures.push({ url: res.url(), status: res.status(), body: body.slice(0, 2000) });
    }
  });
  return failures;
}

/** Asserts a control is disabled — never infer a hang from a click timeout. */
export async function expectDisabled(locator: any, message: string) {
  await expect(locator, message).toBeDisabled();
}
