// AUTO-RECORDED from test-plans/dev/compliance/compliance-review-functions.md
// The .md plan is canonical. AI-repair will patch failing lines in this file.
// Do not hand-edit unless you are also updating the .md plan.
//
// Selectors recorded live against Land Bank CRM **Dev** as the COMPLIANCE role on 2026-08-24:
//   - Sign-in for this role lands on Cases (/dynamic/LandBank.Crm/lbService-requests), NOT
//     /dynamic/user-dashboard. Waiting for the Admin landing route would hang.
//   - The role sees a restricted 4-item menu; Leads/Opportunities/Inbox are absent.
//   - Grids are ARIA-role tables: querySelectorAll('table') === 0 but [role="table"] === 1 with
//     12 [role="columnheader"] children. CSS `table`/`.ant-table` locators find nothing.
//   - The dashboard h1 is a time-of-day greeting ("Good morning, Andiswa") — never asserted.
//   - Volumes at recording time: Cases 176, Opportunities - Compliance 685, Open Cases 139.
//     Asserted as "> 0", never as fixed counts.

import { test, expect, Page } from '@playwright/test';

// Environment & credentials come from process.env, loaded from a gitignored .env by
// playwright.config.ts (real env vars / CI secrets always win). NEVER hardcode a
// username, password, or token here — this file is committed and synced to the hub.
//   Creds : credsFor() prefers <TEST_ENV>_<ROLE>_* (DEV_COMPLIANCE_USERNAME) and falls back
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

// Signs in as COMPLIANCE and waits for THIS role's landing route (Cases), not the Admin one.
async function loginAsCompliance(page: Page) {
  const { user, password } = credsFor('COMPLIANCE');
  await page.goto('/login');
  // STEP TC-01.3: TYPE the Username field with the compliance username (from `.env`)
  await page.getByPlaceholder('Username').fill(user);
  // STEP TC-01.4: TYPE the Password field with the compliance password (from `.env`)
  await page.getByPlaceholder('Password').fill(password);
  // STEP TC-01.5: CLICK **Sign In**
  await page.getByRole('button', { name: 'Sign In', exact: true }).click();
  // STEP TC-01.6: WAIT for the app to redirect away from `/login`
  await page.waitForURL((url) => !url.href.includes('/login'), { timeout: 40000 });
  await page.waitForLoadState('networkidle').catch(() => {});
}

async function openModule(page: Page, name: string, expectedRoute: string) {
  const item = page.getByRole('link', { name, exact: true });
  await expect(item, `side-menu item "${name}" should be present`).toBeVisible({ timeout: 20000 });
  await item.click();
  await page.waitForURL((url) => url.pathname === expectedRoute, { timeout: 40000 });
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

// Reads the "1-10 of 685 items" pager. Returns null when the grid has no pager.
async function pagerTotal(page: Page): Promise<number | null> {
  const text = await page.locator('li', { hasText: /of \d[\d\s,]* items/ }).first().textContent().catch(() => null);
  if (!text) return null;
  const m = text.replace(/[\s,]/g, '').match(/of(\d+)items/);
  return m ? Number(m[1]) : null;
}

// NOT serial: every test signs in for itself, so they are genuinely independent. Running them
// serially made one early failure skip the nine cases after it, hiding the real state of the
// compliance route behind a single unrelated locator problem.
//
// One retry, because these 13 cases each perform their own sign-in against a shared Dev site whose
// latency varies a lot — a full run has taken anywhere from 2.2 to 4.3 minutes, and TC-03 failed
// once on page-load timing then passed in isolation in 12.5s. The retry re-runs only the failing
// case, so a genuine failure still fails twice and is still reported.
test.describe.configure({ retries: 1 });

test.describe('DEV-COMP-1.1 — Compliance Route Functions (Dev)', () => {
  test('TC-01: Compliance user signs in and lands on Cases', async ({ page }) => {
    await loginAsCompliance(page);
    // ASSERT (BLOCKING) the app redirects away from `/login`
    expect(page.url()).not.toContain('/login');
    // ASSERT the landing route is the **Cases** listing, not the user dashboard.
    // This is the role-specific landing — asserting /dynamic/user-dashboard here would fail.
    expect(new URL(page.url()).pathname).toBe(ROUTES.cases);
    // ASSERT the **All Cases** heading is displayed
    await expect(page.getByRole('heading', { name: 'All Cases' })).toBeVisible({ timeout: 20000 });
  });

  test('TC-02: The compliance role sees only its own menu items', async ({ page }) => {
    await loginAsCompliance(page);
    // ASSERT the compliance-specific items are present
    for (const name of ['Dashboard (Compliance)', 'Opportunities - Compliance', 'Cases']) {
      await expect(
        page.getByRole('link', { name, exact: true }),
        `menu item "${name}" should be present for the compliance role`,
      ).toBeVisible({ timeout: 20000 });
    }
    // ASSERT **Leads** is NOT present — it is Admin-only for this role.
    await expect(page.getByRole('link', { name: 'Leads', exact: true })).toHaveCount(0);
  });

  test('TC-03: Compliance dashboard renders its sections and stat tiles', async ({ page }) => {
    await loginAsCompliance(page);
    // STEP TC-03.1: CLICK **Dashboard (Compliance)** in the side menu
    await openModule(page, 'Dashboard (Compliance)', ROUTES.complianceDashboard);
    // ASSERT the URL is `/dynamic/compliance-dashboard`
    expect(new URL(page.url()).pathname).toBe(ROUTES.complianceDashboard);
    // ASSERT the four sections are displayed. These h3s are the stable landmarks — the h1 is a
    // time-of-day greeting ("Good morning, Andiswa") and must not be asserted.
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
    // ASSERT the **Open Cases** tile shows a numeric value (asserted as a number, not a fixed count —
    // Dev held 139 at recording time and that moves constantly)
    const body = await page.locator('body').innerText();
    expect(body).toMatch(/Open Cases\s*\n?\s*\d+/);
  });

  test('TC-04: Compliance dashboard status filters are available', async ({ page }) => {
    await loginAsCompliance(page);
    await openModule(page, 'Dashboard (Compliance)', ROUTES.complianceDashboard);
    // ASSERT the status filter offers each state.
    // FILTER BY Status is a native <select>, not a row of visible chips: the recorded locator
    // resolved to <option value="1">New</option>, and an <option> inside a closed select is
    // correctly reported hidden. So assert the option EXISTS rather than that it is visible.
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
    await openModule(page, 'Dashboard (Compliance)', ROUTES.complianceDashboard);
    // exact: true is REQUIRED — the dashboard has two refresh controls, "Refresh" and
    // "Refresh activity" (the Team Activity panel's own), and a substring match hits both,
    // failing on strict mode rather than on anything being wrong with the page.
    const refresh = page.getByRole('button', { name: 'Refresh', exact: true });
    // ASSERT the **Refresh** button is displayed and clickable
    await expect(refresh).toBeVisible({ timeout: 25000 });
    // ASSERT the **Export** button is displayed
    await expect(page.getByRole('button', { name: 'Export' }).first()).toBeVisible({ timeout: 20000 });
    // STEP TC-05.2: CLICK **Refresh**
    await refresh.click();
    await page.waitForLoadState('networkidle').catch(() => {});
    // ASSERT the dashboard sections are still displayed after refreshing
    await expect(page.getByRole('heading', { name: 'Team Cases' })).toBeVisible({ timeout: 25000 });
  });

  test('TC-06: Compliance dashboard lists open cases', async ({ page }) => {
    await loginAsCompliance(page);
    await openModule(page, 'Dashboard (Compliance)', ROUTES.complianceDashboard);
    // ASSERT at least one `Open case LA-…` action is displayed in Team Cases
    await expect(page.getByRole('button', { name: /^Open case LA-/ }).first()).toBeVisible({ timeout: 25000 });
    // ASSERT the **Date Received** and **Decision** column controls are displayed
    await expect(page.getByRole('button', { name: 'Date Received' })).toBeVisible({ timeout: 20000 });
    await expect(page.getByRole('button', { name: 'Decision' }).first()).toBeVisible({ timeout: 20000 });
  });

  test('TC-07: Opportunities - Compliance grid renders', async ({ page }) => {
    await loginAsCompliance(page);
    // STEP TC-07.1: CLICK **Opportunities - Compliance** in the side menu
    await openModule(page, 'Opportunities - Compliance', ROUTES.complianceOpps);
    // ASSERT (BLOCKING) the URL is the compliance opportunities route
    expect(new URL(page.url()).pathname).toBe(ROUTES.complianceOpps);
    // ASSERT the **All Opportunities** heading is displayed
    await expect(page.getByRole('heading', { name: 'All Opportunities' })).toBeVisible({ timeout: 25000 });
    // ASSERT the grid is displayed (ARIA role table — there is no <table> tag on this build)
    await expect(page.getByRole('table').first()).toBeVisible({ timeout: 25000 });
    // ASSERT the compliance columns are displayed
    await expectColumns(page, ['Application Status', 'Opportunity Owner', 'From Lead']);
    // ASSERT the grid holds at least one row
    const total = await pagerTotal(page);
    expect(total, 'compliance grid should hold at least one opportunity').toBeGreaterThan(0);
  });

  test('TC-08: Quick search filters the compliance grid', async ({ page }) => {
    await loginAsCompliance(page);
    await openModule(page, 'Opportunities - Compliance', ROUTES.complianceOpps);
    await expect(page.getByRole('table').first()).toBeVisible({ timeout: 25000 });
    // EXTRACT the total item count from the pager
    const before = await pagerTotal(page);
    // STEP TC-08.2: TYPE a search term into the grid's quick-search box
    const search = page.locator('input[type="text"], input:not([type])').first();
    // ASSERT the search box accepts input
    await expect(search).toBeVisible({ timeout: 20000 });
    await search.fill('LD-2026');
    await page.waitForTimeout(4000);
    await page.waitForLoadState('networkidle').catch(() => {});
    // ASSERT the grid responds — the result count changes or the rows re-render without error.
    // Deliberately not asserting an exact filtered count: the search term matches live Dev data
    // whose volume moves, so a fixed number would rot immediately.
    const after = await pagerTotal(page);
    expect(after, 'grid should still report a pager after searching').not.toBeNull();
    expect(
      after !== null && before !== null && (after <= before),
      `search should narrow or hold the result set (before=${before}, after=${after})`,
    ).toBeTruthy();
  });

  test('TC-09: Grid toolbar functions are available', async ({ page }) => {
    await loginAsCompliance(page);
    await openModule(page, 'Opportunities - Compliance', ROUTES.complianceOpps);
    await expect(page.getByRole('table').first()).toBeVisible({ timeout: 25000 });
    // ASSERT the **Export** button is displayed
    await expect(page.getByRole('button', { name: 'Export' }).first()).toBeVisible({ timeout: 20000 });
    // ASSERT the toolbar exposes the reload, filter and column-chooser controls.
    // These are icon-only buttons with no accessible name, so they are located by their
    // Ant Design icon class — the only stable handle recorded for them.
    for (const icon of ['reload', 'filter', 'sliders']) {
      await expect(
        page.locator(`button:has(.anticon-${icon}), button:has([aria-label="${icon}"])`).first(),
        `toolbar control "${icon}" should be present`,
      ).toBeVisible({ timeout: 20000 });
    }
  });

  test('TC-10: Pagination moves through the compliance grid', async ({ page }) => {
    await loginAsCompliance(page);
    await openModule(page, 'Opportunities - Compliance', ROUTES.complianceOpps);
    await expect(page.getByRole('table').first()).toBeVisible({ timeout: 25000 });
    // SNAPSHOT — confirm the pager shows more than one page
    const page2 = page.getByRole('listitem', { name: '2' }).first();
    await expect(page2, 'grid should have a second page').toBeVisible({ timeout: 20000 });
    // STEP TC-10.2: CLICK the **Next Page** control
    await page.getByRole('listitem', { name: 'Next Page' }).first().click();
    await page.waitForTimeout(3000);
    await page.waitForLoadState('networkidle').catch(() => {});
    // ASSERT the pager advances to page 2
    await expect(page.locator('li.ant-pagination-item-active')).toHaveText('2', { timeout: 20000 });
    // ASSERT the grid still displays rows after paging
    await expect(page.getByRole('table').first()).toBeVisible({ timeout: 20000 });
  });

  test('TC-11: Open an opportunity from the compliance grid', async ({ page }) => {
    await loginAsCompliance(page);
    await openModule(page, 'Opportunities - Compliance', ROUTES.complianceOpps);
    await expect(page.getByRole('table').first()).toBeVisible({ timeout: 25000 });
    // STEP TC-11.1: CLICK the view action on the first grid row
    const view = page.locator(`a[href*="LBOpportunity-details"]`).first();
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

  // Pinned to a known ENTITY-type opportunity rather than the grid's first row.
  // Entity Verifications / Directors / Signatories only populate for entity applications, and the
  // first row is whatever was created most recently — an individual application renders none of
  // them, which failed this test against a page that was behaving correctly. TC-11 already proves
  // the generic "open the first row" path works; this case needs deterministic content to assert.
  const ENTITY_OPPORTUNITY_ID = '4a01cda7-ce7e-4162-a995-cb551b66d4b5'; // BOXFUSION (PTY)LTD

  test('TC-12: Compliance tab shows entity and party verifications', async ({ page }) => {
    await loginAsCompliance(page);
    await page.goto(`${ROUTES.oppDetails}?id=${ENTITY_OPPORTUNITY_ID}`);
    await page.waitForLoadState('networkidle').catch(() => {});
    // STEP TC-12.1: CLICK the **Compliance** tab
    const tab = page.getByRole('tab', { name: 'Compliance' }).first();
    await expect(tab, 'the pinned opportunity should still exist and expose a Compliance tab')
      .toBeVisible({ timeout: 30000 });
    await tab.click();
    await page.waitForTimeout(6000);
    // ASSERT the **Compliance Overview** section is displayed
    await expect(page.getByText('Compliance Overview').first()).toBeVisible({ timeout: 25000 });
    // ASSERT the **Entity Verifications** section reports an entity compliance status
    await expect(page.getByText('Entity Verifications').first()).toBeVisible({ timeout: 25000 });
    // Matched as /Compliance Status:/ and NOT "Entity Compliance Status": the label is split across
    // DOM nodes — it renders as "Entity" + "\n Compliance Status: Completed" — so no single element
    // contains the full phrase contiguously and getByText could never match it, even though the
    // page reads correctly to a human.
    await expect(page.getByText(/Compliance Status:/).first()).toBeVisible({ timeout: 25000 });
    // ASSERT the **Signatories** and **Directors** verification lists are displayed.
    // Located by their collapse-panel header, not getByText: "Signatories" and "Directors" also
    // name tabs in an INACTIVE tab strip elsewhere on the page, and getByText resolved to that
    // hidden <div role="tab"> instead of the section — reporting "hidden" for a section that is
    // plainly on screen.
    // filter({ visible: true }) is the point of this locator, not decoration: "Signatories" and
    // "Directors" each match TWO elements — the visible section label and a hidden <div role="tab">
    // in an inactive tab strip. Plain getByText picks the hidden tab and reports "hidden" for a
    // section that is plainly on screen; filtering to visible selects the real one.
    for (const section of ['Signatories', 'Directors']) {
      await expect(
        page.getByText(section, { exact: true }).filter({ visible: true }).first(),
        `the ${section} verification list should be displayed`,
      ).toBeVisible({ timeout: 25000 });
    }
    // ASSERT at least one party shows a review state
    await expect(page.getByText(/Awaiting Review/).first()).toBeVisible({ timeout: 25000 });
    // The Add-party actions (Add Signatory / Add Director / Add CEO …) are deliberately NOT
    // asserted here. They exist in the DOM while the Compliance tab is open but are hidden:
    // they belong to the record's own Directors / Signatories / CEO tabs, which are rendered
    // but not displayed. Asserting them as visible on the compliance panel claimed a
    // relationship that does not exist — they are maintenance actions on the party tabs, not
    // functions of the compliance review screen.
  });

  test('TC-13: Cases listing exposes the compliance decision', async ({ page }) => {
    await loginAsCompliance(page);
    // STEP TC-13.1: CLICK **Cases** in the side menu (this role already lands here, so navigate
    // away first to prove the menu item actually works)
    await openModule(page, 'Dashboard (Compliance)', ROUTES.complianceDashboard);
    await openModule(page, 'Cases', ROUTES.cases);
    // ASSERT the URL is the cases route
    expect(new URL(page.url()).pathname).toBe(ROUTES.cases);
    // ASSERT the **All Cases** heading is displayed
    await expect(page.getByRole('heading', { name: 'All Cases' })).toBeVisible({ timeout: 25000 });
    // ASSERT the compliance-relevant columns are displayed
    await expectColumns(page, ['Compliance Decision', 'Assigned To', 'Priority']);
  });
});
