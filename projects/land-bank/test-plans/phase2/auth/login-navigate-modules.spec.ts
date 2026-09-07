// AUTO-RECORDED from test-plans/phase2/auth/login-navigate-modules.md
// The .md plan is canonical. AI-repair will patch failing lines in this file.
// Do not hand-edit unless you are also updating the .md plan.
//
// Selectors recorded live against Land Bank CRM **Phase 2** on 2026-08-24:
//   - Login inputs are placeholder-labelled ("Username" / "Password"); no <label for> associations.
//   - Two primary buttons exist ("Sign In", "Sign in with Microsoft") — Sign In needs exact: true.
//   - Post-login landing route is /dynamic/user-dashboard.
//   - Side-menu <li> has role="menuitem" but no accessible name, so every module resolves as
//     role=link (verified: 8/8 targeted items match exactly 1 link by exact name).
//   - "Opportunities" matches 2 links as a SUBSTRING (prefix of "Opportunities - Compliance"),
//     so it is matched with exact: true and the resulting URL is asserted to rule out the wrong hit.
//   - Grids are plain <table> elements, NOT .ant-table — a .ant-table locator finds nothing even
//     after 15s of polling. All grid assertions use role=table.
//   - Inbox / Opportunities / Cases / Create Questionnaire were EMPTY at recording time, so their
//     assertions check landmarks and column headers only — never row counts, which would encode
//     today's empty database as the expected result.

import { test, expect, Page } from '@playwright/test';

// Environment & credentials come from process.env, loaded from a gitignored .env by
// playwright.config.ts (real env vars / CI secrets always win). NEVER hardcode a
// username, password, or token here — this file is committed and synced to the hub.
//   Site  : baseURL is resolved in playwright.config.ts from TEST_ENV + <ENV>_APP_URL.
//           This plan REQUIRES TEST_ENV=phase2 (or APP_URL) — TC-02 fails the run otherwise.
//   Creds : credsFor() prefers <TEST_ENV>_<ROLE>_* (PHASE2_ADMIN_USERNAME) and falls back
//           to the bare <ROLE>_* keys shared with the hub's other projects.

const ROUTES = {
  userDashboard: '/dynamic/user-dashboard',
  mgmtDashboard: '/dynamic/management-dashboard',
  inbox: '/dynamic/Shesha.Workflow/workflows-inbox',
  leads: '/dynamic/LandBank.Crm/LBLead-table',
  opportunities: '/dynamic/LandBank.Crm/LBOpportunity-table',
  compliance: '/dynamic/LandBank.Crm/LBOpportunity-table-Compliance',
  cases: '/dynamic/LandBank.Crm/lbService-requests',
  questionnaire: '/dynamic/LandBank.Crm/landbank-questionnaire-table',
};

function credsFor(role: string) {
  const key = role.toUpperCase();
  const env = (process.env.TEST_ENV || '').toUpperCase();
  // Environment-namespaced credentials win: TEST_ENV=phase2 → PHASE2_ADMIN_USERNAME.
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

async function loginAs(page: Page, role: string = 'ADMIN') {
  const { user, password } = credsFor(role);
  await page.goto('/login');
  // STEP TC-01.3: TYPE the Username field with the Phase 2 admin username (from `.env`)
  await page.getByPlaceholder('Username').fill(user);
  // STEP TC-01.4: TYPE the Password field with the Phase 2 admin password (from `.env`)
  await page.getByPlaceholder('Password').fill(password);
  // STEP TC-01.6: CLICK **Sign In**
  await page.getByRole('button', { name: 'Sign In', exact: true }).click();
  // STEP TC-01.7: WAIT for the app to redirect away from `/login`
  await page.waitForURL((url) => !url.href.includes('/login'), { timeout: 40000 });
  await page.waitForLoadState('networkidle').catch(() => {});
}

// Clicks a side-menu module by its exact accessible name. exact: true is REQUIRED —
// "Opportunities" is a prefix of "Opportunities - Compliance" and would otherwise be ambiguous.
async function openModule(page: Page, name: string, expectedRoute: string) {
  const item = page.getByRole('link', { name, exact: true });
  await expect(item, `side-menu item "${name}" should be present`).toBeVisible({ timeout: 20000 });
  await item.click();
  await page.waitForURL((url) => url.pathname === expectedRoute, { timeout: 40000 });
  await page.waitForLoadState('networkidle').catch(() => {});
}

// Column headers live in a plain <table>; this asserts a header is present without
// depending on column order or on the grid holding any rows.
async function expectColumns(page: Page, columns: string[]) {
  for (const col of columns) {
    await expect(
      page.getByRole('columnheader', { name: col, exact: false }).first(),
      `column "${col}" should be present`,
    ).toBeVisible({ timeout: 20000 });
  }
}

test.describe.configure({ mode: 'serial' });

test.describe('P2-AUTH-1.1 — Phase 2 Login and Module Navigation', () => {
  test('TC-01: Log in to the Phase 2 site as an Admin', async ({ page }) => {
    await loginAs(page, 'ADMIN');
    // ASSERT (BLOCKING) the app redirects away from `/login`
    expect(page.url()).not.toContain('/login');
    // ASSERT the landing route is `/dynamic/user-dashboard`
    expect(new URL(page.url()).pathname).toBe(ROUTES.userDashboard);
    // ASSERT the authenticated shell is displayed — the side menu shows the **Leads** item
    await expect(page.getByRole('link', { name: 'Leads', exact: true })).toBeVisible({ timeout: 20000 });
  });

  test('TC-02: The run is actually pointed at the Phase 2 site', async ({ page }) => {
    await loginAs(page, 'ADMIN');
    // EXTRACT the origin of the current page URL
    const actualOrigin = new URL(page.url()).origin;
    const expected = process.env.PHASE2_APP_URL;
    // ASSERT (BLOCKING) the page origin matches `PHASE2_APP_URL`.
    // Without this guard, a default TEST_ENV=dev run would authenticate against Dev and pass
    // every remaining assertion — reporting Phase 2 as green while never touching it.
    expect(
      expected,
      'PHASE2_APP_URL must be set in .env for this plan to verify its target',
    ).toBeTruthy();
    expect(
      actualOrigin,
      `Expected the Phase 2 origin. Run this plan with TEST_ENV=phase2 (got ${actualOrigin}).`,
    ).toBe(new URL(expected as string).origin);
  });

  test('TC-03: Navigate to Dashboard (Management)', async ({ page }) => {
    await loginAs(page, 'ADMIN');
    // STEP TC-03.2: CLICK the **Dashboard (Management)** item in the side menu
    await openModule(page, 'Dashboard (Management)', ROUTES.mgmtDashboard);
    // ASSERT the URL is `/dynamic/management-dashboard`
    expect(new URL(page.url()).pathname).toBe(ROUTES.mgmtDashboard);
    // ASSERT the **Management Dashboard** heading is displayed
    await expect(page.getByRole('heading', { name: 'Management Dashboard' })).toBeVisible({ timeout: 20000 });
  });

  test('TC-04: Navigate to Inbox', async ({ page }) => {
    await loginAs(page, 'ADMIN');
    // STEP TC-04.1: CLICK the **Inbox** item in the side menu
    await openModule(page, 'Inbox', ROUTES.inbox);
    // ASSERT the URL is `/dynamic/Shesha.Workflow/workflows-inbox`
    expect(new URL(page.url()).pathname).toBe(ROUTES.inbox);
    // ASSERT the **Incoming Items** heading is displayed
    await expect(page.getByRole('heading', { name: 'Incoming Items' })).toBeVisible({ timeout: 20000 });
  });

  test('TC-05: Navigate to Leads and confirm the grid renders', async ({ page }) => {
    await loginAs(page, 'ADMIN');
    // STEP TC-05.1: CLICK the **Leads** item in the side menu
    await openModule(page, 'Leads', ROUTES.leads);
    // ASSERT (BLOCKING) the **All Leads** heading is displayed
    await expect(page.getByRole('heading', { name: 'All Leads' })).toBeVisible({ timeout: 20000 });
    // ASSERT the URL is `/dynamic/LandBank.Crm/LBLead-table`
    expect(new URL(page.url()).pathname).toBe(ROUTES.leads);
    // ASSERT the Leads data grid is displayed (plain <table>, not .ant-table on this build)
    await expect(page.getByRole('table').first()).toBeVisible({ timeout: 20000 });
    // ASSERT the grid exposes the expected columns
    await expectColumns(page, ['Date Created', 'Client Type', 'First Name', 'Last Name', 'Lead Status']);
    // ASSERT the **New Lead** toolbar button is displayed
    await expect(page.getByRole('button', { name: /New Lead/ })).toBeVisible({ timeout: 20000 });
  });

  test('TC-06: Navigate to Opportunities', async ({ page }) => {
    await loginAs(page, 'ADMIN');
    // STEP TC-06.1: CLICK the **Opportunities** item in the side menu (exact — prefix collision)
    await openModule(page, 'Opportunities', ROUTES.opportunities);
    // ASSERT (BLOCKING) the URL is exactly the non-Compliance route. This is what proves the
    // exact-match locator picked the right one of the two links containing "Opportunities" —
    // the heading cannot do it, since the Compliance listing is also titled "All Opportunities".
    expect(new URL(page.url()).pathname).toBe(ROUTES.opportunities);
    // ASSERT the view-selector heading shows a known Opportunities view.
    // This h4 is the label of a stateful `table-view-selector` dropdown, NOT a static page title:
    // it was first recorded as "Active Opportunities" (that session's selected view, which was
    // empty), while a fresh context defaults to "All Opportunities" with 3 items. Pinning either
    // literal fails; accept both and rely on the URL and columns for the real signal.
    await expect(
      page.getByRole('heading', { name: /(All|Active) Opportunities/ }),
    ).toBeVisible({ timeout: 20000 });
    // ASSERT the opportunities grid is displayed
    await expect(page.getByRole('table').first()).toBeVisible({ timeout: 20000 });
    // ASSERT the grid exposes the expected columns — these are stable across view selections
    await expectColumns(page, ['Date Created', 'Account', 'Loan Amount']);
  });

  test('TC-07: Navigate to Opportunities - Compliance', async ({ page }) => {
    await loginAs(page, 'ADMIN');
    // STEP TC-07.1: CLICK the **Opportunities - Compliance** item in the side menu
    await openModule(page, 'Opportunities - Compliance', ROUTES.compliance);
    // ASSERT the URL is `/dynamic/LandBank.Crm/LBOpportunity-table-Compliance`
    expect(new URL(page.url()).pathname).toBe(ROUTES.compliance);
    // ASSERT the **All Opportunities** heading is displayed
    await expect(page.getByRole('heading', { name: 'All Opportunities' })).toBeVisible({ timeout: 20000 });
    // ASSERT the compliance grid is displayed
    await expect(page.getByRole('table').first()).toBeVisible({ timeout: 20000 });
    // ASSERT the grid exposes the compliance-specific columns
    await expectColumns(page, ['Application Status', 'Opportunity Owner', 'From Lead']);
  });

  test('TC-08: Navigate to Cases', async ({ page }) => {
    await loginAs(page, 'ADMIN');
    // STEP TC-08.1: CLICK the **Cases** item in the side menu
    await openModule(page, 'Cases', ROUTES.cases);
    // ASSERT the URL is `/dynamic/LandBank.Crm/lbService-requests`
    expect(new URL(page.url()).pathname).toBe(ROUTES.cases);
    // ASSERT the **All Cases** heading is displayed
    await expect(page.getByRole('heading', { name: 'All Cases' })).toBeVisible({ timeout: 20000 });
    // ASSERT the grid exposes the case columns. No row-count assertion: the grid was empty at
    // recording time and asserting 0 rows would fail as soon as a real case is logged.
    await expectColumns(page, ['Compliance Decision', 'Assigned To', 'Priority']);
  });

  test('TC-09: Navigate to Create Questionnaire', async ({ page }) => {
    await loginAs(page, 'ADMIN');
    // STEP TC-09.1: CLICK the **Create Questionnaire** item in the side menu
    await openModule(page, 'Create Questionnaire', ROUTES.questionnaire);
    // ASSERT the URL is `/dynamic/LandBank.Crm/landbank-questionnaire-table`
    expect(new URL(page.url()).pathname).toBe(ROUTES.questionnaire);
    // ASSERT the **Add** toolbar button is displayed.
    // Matched as a SUBSTRING deliberately: the button's text content is exactly "Add", but its
    // computed accessible name is not — an anchored /^Add$/ and { exact: true } both matched 0
    // elements, while the default substring match resolves to exactly 1.
    await expect(page.getByRole('button', { name: 'Add' })).toBeVisible({ timeout: 20000 });
    // ASSERT the questionnaire grid exposes a *Name* column
    await expectColumns(page, ['Name']);
  });
});
