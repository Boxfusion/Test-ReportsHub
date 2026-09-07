// AUTO-RECORDED from test-plans/phase2/compliance/compliance-review-functions.md
// The .md plan is canonical. AI-repair will patch failing lines in this file.
// Do not hand-edit unless you are also updating the .md plan.
//
// Selectors recorded live against Land Bank CRM **Phase 2** as the COMPLIANCE role on 2026-08-24.
// Helper bodies are kept identical to dev/compliance/compliance-review-functions.spec.ts so the
// locator fixes proven there carry over verbatim. Phase 2 specifics:
//   - Sign-in lands on Cases (/dynamic/LandBank.Crm/lbService-requests), as on Dev.
//   - The compliance menu holds only Cases / Users Test / Create Questionnaire. Dashboard
//     (Compliance) and Opportunities - Compliance are ABSENT from the menu but both routes work
//     and the user is authorised — a menu config gap, not a permission block. Reached by URL here.
//   - Grids are ARIA-role tables ([role="table"] + 12 [role="columnheader"]), not <table> tags.
//   - The dashboard h1 is a time-of-day greeting ("Good morning, Fatima") — never asserted.
//   - FILTER BY Status is a native <select>; its <option>s are hidden while closed, so their
//     existence is asserted rather than their visibility.
//   - Volumes at recording time: Cases 31, Opportunities - Compliance 95, Open Cases 31.
//     Asserted as "> 0", never as fixed counts.

import { test, expect, Page } from '@playwright/test';

// Environment & credentials come from process.env, loaded from a gitignored .env by
// playwright.config.ts (real env vars / CI secrets always win). NEVER hardcode a
// username, password, or token here — this file is committed and synced to the hub.
//   Creds : credsFor() prefers <TEST_ENV>_<ROLE>_* (PHASE2_COMPLIANCE_USERNAME) and falls back
//           to the bare <ROLE>_* keys shared with the hub's other projects.

const ROUTES = {
  cases: '/dynamic/LandBank.Crm/lbService-requests',
  complianceDashboard: '/dynamic/compliance-dashboard',
  complianceOpps: '/dynamic/LandBank.Crm/LBOpportunity-table-Compliance',
  oppDetails: '/dynamic/LandBank.Crm/LBOpportunity-details',
};

function credsFor(role: string) {
  const key = role.toUpperCase();
  const env = (process.env.TEST_ENV || '').toUpperCase();
  const pick = (suffix: string) =>
    (env ? process.env[`${env}_${key}_${suffix}`] : undefined) ?? process.env[`${key}_${suffix}`];
  const user = pick('USERNAME');
  const password = pick('PASSWORD');
  if (!user || !password) {
    throw new Error(
      `Missing credentials for role "${role}"${env ? ` in environment "${env}"` : ''}. Set ` +
      `${env ? `${env}_${key}_USERNAME / ${env}_${key}_PASSWORD` : `${key}_USERNAME / ${key}_PASSWORD`} ` +
      `in .env (copy .env.example) or as CI secrets — see CLAUDE.md → Credentials.`
    );
  }
  return { user, password };
}

async function loginAsCompliance(page: Page) {
  const { user, password } = credsFor('COMPLIANCE');
  await page.goto('/login');
  // STEP TC-01.3: TYPE the Username field with the Phase 2 compliance username (from `.env`)
  await page.getByPlaceholder('Username').fill(user);
  // STEP TC-01.4: TYPE the Password field with the Phase 2 compliance password (from `.env`)
  await page.getByPlaceholder('Password').fill(password);
  // STEP TC-01.5: CLICK **Sign In**
  await page.getByRole('button', { name: 'Sign In', exact: true }).click();
  // STEP TC-01.6: WAIT for the app to redirect away from `/login`
  await page.waitForURL((url) => !url.href.includes('/login'), { timeout: 40000 });
  await page.waitForLoadState('networkidle').catch(() => {});
}

// Phase 2's compliance menu does not list these screens, so they are reached by URL.
async function openByUrl(page: Page, route: string) {
  await page.goto(route);
  await page.waitForLoadState('networkidle').catch(() => {});
}

async function expectColumns(page: Page, columns: string[]) {
  for (const col of columns) {
    await expect(
      page.getByRole('columnheader', { name: col, exact: false }).first(),
      `column "${col}" should be present`,
    ).toBeVisible({ timeout: 20000 });
  }
}

async function pagerTotal(page: Page): Promise<number | null> {
  const text = await page.locator('li', { hasText: /of \d[\d\s,]* items/ }).first().textContent().catch(() => null);
  if (!text) return null;
  const m = text.replace(/[\s,]/g, '').match(/of(\d+)items/);
  return m ? Number(m[1]) : null;
}

async function expectNoAccessError(page: Page) {
  const body = await page.locator('body').innerText();
  expect(
    /denied|not authoriz|no permission|forbidden|403|404|not found/i.test(body),
    'the compliance user should be authorised for this route — no access error expected',
  ).toBeFalsy();
}

// NOT serial: every test signs in for itself, so they are independent — one failure must not skip
// the rest. One retry for shared-environment latency, same rationale as the Dev spec.
test.describe.configure({ retries: 1 });

test.describe('P2-COMP-1.1 — Compliance Route Functions (Phase 2)', () => {
  test('TC-01: Compliance user signs in and lands on Cases', async ({ page }) => {
    await loginAsCompliance(page);
    // ASSERT (BLOCKING) the app redirects away from `/login`
    expect(page.url()).not.toContain('/login');
    // ASSERT the landing route is the **Cases** listing
    expect(new URL(page.url()).pathname).toBe(ROUTES.cases);
    // ASSERT the **All Cases** heading is displayed
    await expect(page.getByRole('heading', { name: 'All Cases' })).toBeVisible({ timeout: 25000 });
  });

  test('TC-02: The run is pointed at Phase 2, and the compliance menu gap is recorded', async ({ page }) => {
    await loginAsCompliance(page);
    // ASSERT (BLOCKING) the page origin matches `PHASE2_APP_URL`. Without this, a default
    // TEST_ENV=dev run would pass everything below while never touching Phase 2 — and the two
    // "absent" assertions would fail on Dev, sending you hunting a regression that doesn't exist.
    const expected = process.env.PHASE2_APP_URL;
    expect(expected, 'PHASE2_APP_URL must be set in .env').toBeTruthy();
    expect(
      new URL(page.url()).origin,
      `Expected the Phase 2 origin. Run with TEST_ENV=phase2 (got ${new URL(page.url()).origin}).`,
    ).toBe(new URL(expected as string).origin);

    // ASSERT the menu items this role does have
    for (const name of ['Cases', 'Create Questionnaire']) {
      await expect(
        page.getByRole('link', { name, exact: true }),
        `menu item "${name}" should be present`,
      ).toBeVisible({ timeout: 20000 });
    }
    // ASSERT the two Dev items are absent — the recorded Phase 2 menu gap.
    // Both routes work and the user is authorised (TC-03, TC-06 prove it), so this is a menu
    // configuration gap. WHEN THE MENU IS FIXED THESE TWO ASSERTIONS FAIL ON PURPOSE — that is
    // the signal to update this case to the Dev form rather than a regression to investigate.
    await expect(page.getByRole('link', { name: 'Dashboard (Compliance)', exact: true })).toHaveCount(0);
    await expect(page.getByRole('link', { name: 'Opportunities - Compliance', exact: true })).toHaveCount(0);
  });

  test('TC-03: Compliance dashboard renders when reached directly', async ({ page }) => {
    await loginAsCompliance(page);
    // STEP TC-03.1: NAVIGATE directly to `/dynamic/compliance-dashboard`
    await openByUrl(page, ROUTES.complianceDashboard);
    // ASSERT the URL is the compliance dashboard
    expect(new URL(page.url()).pathname).toBe(ROUTES.complianceDashboard);
    // ASSERT no permission or not-found error is shown
    await expectNoAccessError(page);
    // ASSERT the four sections are displayed (the h1 is a time-of-day greeting — not asserted)
    for (const section of ['Team Cases', 'Team Workload', 'Decisions This Week', 'Team Activity']) {
      await expect(
        page.getByRole('heading', { name: section }),
        `section "${section}" should be displayed`,
      ).toBeVisible({ timeout: 25000 });
    }
    // ASSERT the stat tiles are displayed
    for (const tile of ['Open Cases', 'Assigned Today', 'Pending Decisions', 'Closed This Week']) {
      await expect(page.getByText(tile, { exact: true }).first(), `tile "${tile}"`).toBeVisible({ timeout: 20000 });
    }
    // ASSERT the **Open Cases** tile shows a numeric value (a number, not a fixed count)
    expect(await page.locator('body').innerText()).toMatch(/Open Cases\s*\n?\s*\d+/);
  });

  test('TC-04: Compliance dashboard status filters are available', async ({ page }) => {
    await loginAsCompliance(page);
    await openByUrl(page, ROUTES.complianceDashboard);
    // ASSERT the status filter offers each state. It is a native <select>, so the options are
    // hidden while it is closed — assert existence, not visibility.
    const statusSelect = page.locator('select').filter({ has: page.locator('option', { hasText: 'Signed off' }) }).first();
    await expect(statusSelect, 'the status filter select should be present').toHaveCount(1, { timeout: 25000 });
    for (const status of ['New', 'In progress', 'Signed off', 'Closed (blocked)']) {
      await expect(
        statusSelect.locator('option', { hasText: status }),
        `status filter should offer "${status}"`,
      ).toHaveCount(1, { timeout: 20000 });
    }
  });

  test('TC-05: Compliance dashboard Refresh and Export actions', async ({ page }) => {
    await loginAsCompliance(page);
    await openByUrl(page, ROUTES.complianceDashboard);
    // exact: true is REQUIRED — a second "Refresh activity" control exists and a substring match
    // hits both, failing on strict mode rather than on anything being wrong with the page.
    const refresh = page.getByRole('button', { name: 'Refresh', exact: true });
    // ASSERT the **Refresh** button is displayed
    await expect(refresh).toBeVisible({ timeout: 25000 });
    // ASSERT the **Export** button is displayed
    await expect(page.getByRole('button', { name: 'Export' }).first()).toBeVisible({ timeout: 20000 });
    // STEP TC-05.1: CLICK **Refresh**
    await refresh.click();
    await page.waitForLoadState('networkidle').catch(() => {});
    // ASSERT the dashboard sections are still displayed after refreshing
    await expect(page.getByRole('heading', { name: 'Team Cases' })).toBeVisible({ timeout: 25000 });
  });

  test('TC-06: Opportunities - Compliance grid renders when reached directly', async ({ page }) => {
    await loginAsCompliance(page);
    // STEP TC-06.1: NAVIGATE directly to the compliance opportunities route
    await openByUrl(page, ROUTES.complianceOpps);
    // ASSERT (BLOCKING) the URL is the compliance opportunities route
    expect(new URL(page.url()).pathname).toBe(ROUTES.complianceOpps);
    // ASSERT the **All Opportunities** heading is displayed
    await expect(page.getByRole('heading', { name: 'All Opportunities' })).toBeVisible({ timeout: 25000 });
    // ASSERT no permission error is shown
    await expectNoAccessError(page);
    // ASSERT the grid is displayed (ARIA role table — there is no <table> tag on this build)
    await expect(page.getByRole('table').first()).toBeVisible({ timeout: 25000 });
    // ASSERT the compliance columns are displayed
    await expectColumns(page, ['Application Status', 'Opportunity Owner', 'From Lead']);
    // ASSERT the grid holds at least one row
    expect(await pagerTotal(page), 'compliance grid should hold at least one opportunity').toBeGreaterThan(0);
  });

  test('TC-07: Quick search filters the compliance grid', async ({ page }) => {
    await loginAsCompliance(page);
    await openByUrl(page, ROUTES.complianceOpps);
    await expect(page.getByRole('table').first()).toBeVisible({ timeout: 25000 });
    // EXTRACT the total item count from the pager
    const before = await pagerTotal(page);
    // STEP TC-07.2: TYPE a search term into the grid's quick-search box
    const search = page.locator('input[type="text"], input:not([type])').first();
    // ASSERT the search box accepts input
    await expect(search).toBeVisible({ timeout: 20000 });
    await search.fill('LD-2026');
    await page.waitForTimeout(4000);
    await page.waitForLoadState('networkidle').catch(() => {});
    // ASSERT the grid responds. Deliberately not an exact filtered count: the term matches live
    // data whose volume moves, so a fixed number would rot immediately.
    const after = await pagerTotal(page);
    expect(after, 'grid should still report a pager after searching').not.toBeNull();
    expect(
      after !== null && before !== null && after <= before,
      `search should narrow or hold the result set (before=${before}, after=${after})`,
    ).toBeTruthy();
  });

  test('TC-08: Grid toolbar functions are available', async ({ page }) => {
    await loginAsCompliance(page);
    await openByUrl(page, ROUTES.complianceOpps);
    await expect(page.getByRole('table').first()).toBeVisible({ timeout: 25000 });
    // ASSERT the **Export** button is displayed
    await expect(page.getByRole('button', { name: 'Export' }).first()).toBeVisible({ timeout: 20000 });
    // ASSERT the reload / filter / column-chooser controls are present. These are icon-only
    // buttons with no accessible name, so they are located by their Ant Design icon class —
    // the only stable handle recorded for them.
    for (const icon of ['reload', 'filter', 'sliders']) {
      await expect(
        page.locator(`button:has(.anticon-${icon}), button:has([aria-label="${icon}"])`).first(),
        `toolbar control "${icon}" should be present`,
      ).toBeVisible({ timeout: 20000 });
    }
  });

  test('TC-09: Pagination moves through the compliance grid', async ({ page }) => {
    await loginAsCompliance(page);
    await openByUrl(page, ROUTES.complianceOpps);
    await expect(page.getByRole('table').first()).toBeVisible({ timeout: 25000 });
    await expect(
      page.getByRole('listitem', { name: '2' }).first(),
      'grid should have a second page',
    ).toBeVisible({ timeout: 20000 });
    // STEP TC-09.1: CLICK the **Next Page** control
    await page.getByRole('listitem', { name: 'Next Page' }).first().click();
    await page.waitForTimeout(3000);
    await page.waitForLoadState('networkidle').catch(() => {});
    // ASSERT the pager advances to page 2
    await expect(page.locator('li.ant-pagination-item-active')).toHaveText('2', { timeout: 20000 });
    // ASSERT the grid still displays rows after paging
    await expect(page.getByRole('table').first()).toBeVisible({ timeout: 20000 });
  });

  test('TC-10: Open an opportunity from the compliance grid', async ({ page }) => {
    await loginAsCompliance(page);
    await openByUrl(page, ROUTES.complianceOpps);
    await expect(page.getByRole('table').first()).toBeVisible({ timeout: 25000 });
    // STEP TC-10.1: CLICK the view action on the first grid row
    const view = page.locator('a[href*="LBOpportunity-details"]').first();
    await expect(view, 'first row should expose an opportunity detail link').toBeVisible({ timeout: 20000 });
    await view.click();
    await page.waitForURL((url) => url.pathname === ROUTES.oppDetails, { timeout: 40000 });
    await page.waitForLoadState('networkidle').catch(() => {});
    // ASSERT (BLOCKING) the URL is the opportunity detail route with an `id` parameter
    const url = new URL(page.url());
    expect(url.pathname).toBe(ROUTES.oppDetails);
    expect(url.searchParams.get('id'), 'detail URL should carry an opportunity id').toBeTruthy();
    // ASSERT the **Compliance** tab is displayed on the detail page
    await expect(page.getByRole('tab', { name: 'Compliance' }).first()).toBeVisible({ timeout: 30000 });
  });

  test('TC-11: Cases listing exposes the compliance decision', async ({ page }) => {
    await loginAsCompliance(page);
    // This role already lands on Cases, so no navigation is needed.
    expect(new URL(page.url()).pathname).toBe(ROUTES.cases);
    // ASSERT the **All Cases** heading is displayed
    await expect(page.getByRole('heading', { name: 'All Cases' })).toBeVisible({ timeout: 25000 });
    // ASSERT the compliance-relevant columns are displayed
    await expectColumns(page, ['Compliance Decision', 'Assigned To', 'Priority']);
  });
});
