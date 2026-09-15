import { test, expect, type Locator, type Page } from '@playwright/test';

// Derived artefact — the canonical source is epm-period-financial-year-quarters.md, which mirrors ADO test
// case 109441 in suite 109505. Edit the .md (and the ADO case), not this file, except for AI-repair
// patches.
//
// Self-contained by design: the hub treats each spec as a standalone derived artefact paired 1:1 with its
// plan and repairs it step-by-step, so config is duplicated rather than shared with sibling specs.

const BASE = 'https://pd-epm-adminportal-qa-wf.shesha.app';

// The ADO case names "FY 2026-27", but QA already holds "Financial Year 2026/2027" / "FY 2026/27" WITH
// Q1-Q4 children attached. Every run therefore stamps a unique token so its records are distinguishable.
// Dates are left exactly as the case specifies — they carry the meaning under test, not uniqueness.
const TOKEN = process.env.TC441_TOKEN || `TC441-${Date.now()}`;
const SHORT = TOKEN.slice(-6);

const PARENT = {
  name: `FY 2026-27 ${TOKEN}`,
  shortName: `FY${SHORT}`,
  type: 'Financial Year',
  start: '01/04/2026',
  end: '31/03/2027',
};

// Q1..Q4 spanning the same financial year, in the order the ADO case walks them.
const QUARTERS = [
  { label: 'Q1', name: `Q1 ${TOKEN}`, shortName: `Q1-${SHORT}`, start: '01/04/2026', end: '30/06/2026' },
  { label: 'Q2', name: `Q2 ${TOKEN}`, shortName: `Q2-${SHORT}`, start: '01/07/2026', end: '30/09/2026' },
  { label: 'Q3', name: `Q3 ${TOKEN}`, shortName: `Q3-${SHORT}`, start: '01/10/2026', end: '31/12/2026' },
  { label: 'Q4', name: `Q4 ${TOKEN}`, shortName: `Q4-${SHORT}`, start: '01/01/2027', end: '31/03/2027' },
];

// EPM QA cold-starts in ~56s and pins the browser main thread while rendering. The hub config's 90s test /
// 10s expect / 15s action / 30s navigation defaults are all far too short for this app.
const SLOW = 420_000;

// Browser selection. The hub config's `devices['Desktop Chrome']` sets no channel, so this line is what
// picks the browser. Default is system Chrome; `PW_CHANNEL=chromium` (or an empty value) selects
// Playwright's bundled Chromium; any other value is passed through as a channel name (e.g. msedge).
const RAW_CHANNEL = process.env.PW_CHANNEL === undefined ? 'chrome' : process.env.PW_CHANNEL;
const CHANNEL = RAW_CHANNEL === '' || RAW_CHANNEL === 'chromium' ? undefined : RAW_CHANNEL;

test.use({
  channel: CHANNEL,
  // Fixed viewport, not `viewport: null` — null conflicts with the deviceScaleFactor the hub config's
  // `devices['Desktop Chrome']` sets ("deviceScaleFactor option is not supported with null viewport").
  viewport: { width: 1920, height: 1080 },
  actionTimeout: 120_000,
  navigationTimeout: 120_000,
});

// ── helpers ────────────────────────────────────────────────────────────────────

// Opening a two-level flyout is racy in two different ways, so the WHOLE path is retried as one unit:
//   1. a hover that lands before rc-menu has hydrated is silently swallowed, and no later wait re-fires it;
//   2. the flyout can close between "is the item visible?" and "hover the item" — antd then unmounts the
//      popup, so a long-timeout hover sits waiting on a detached node until it times out (observed: a
//      120s stall with the sidebar fully collapsed).
// Short per-action timeouts make a stale element fail fast; the loop then re-opens from the top.
// The left rail is icon-only; "EPM" is a plain menuitem (click, not hover) that opens a flyout with
// "Workflow" / "EPM Administration". Hovering "EPM Administration" opens the module's page list.
// `visible=true` avoids rc-menu's off-screen copy kept for the collapsed inline sidebar.
async function openViaEpmAdminstration(page: Page, linkName: string, expectedHref: string) {
  const epm = page.locator('.ant-menu').getByText('EPM', { exact: true }).locator('visible=true').first();
  const admin = page.getByText('EPM Administration', { exact: true }).locator('visible=true').first();
  const link = page.getByRole('link', { name: linkName, exact: true }).locator('visible=true').first();

  for (let attempt = 1; attempt <= 8; attempt++) {
    try {
      await epm.click({ force: true, timeout: 15_000 });
      await page.waitForTimeout(1_500);
      if (!(await admin.isVisible().catch(() => false))) throw new Error('Epm flyout did not open');
      await admin.hover({ force: true, timeout: 15_000 });
      await page.waitForTimeout(1_500);
      if (!(await link.isVisible().catch(() => false))) throw new Error(`"${linkName}" not revealed`);
      await expect(link).toHaveAttribute('href', expectedHref, { timeout: 15_000 });
      await link.click({ timeout: 15_000 });
      return;
    } catch (e: any) {
      console.log(`  nav attempt ${attempt} failed: ${String(e.message).split('\n')[0].slice(0, 90)}`);
      await page.mouse.move(1_400, 900);
      await page.waitForTimeout(1_000);
    }
  }
  throw new Error(`could not reach "${linkName}" via EPM > EPM Administration after 8 attempts`);
}

// This app leaves spinners running long after DOMContentLoaded; wait for real interactivity instead.
async function waitReady(page: Page, label: string) {
  const add = page.locator('.ant-btn').filter({ hasText: 'Add' }).first();
  await expect(add, `${label}: Add button should render`).toBeVisible({ timeout: SLOW });
  await expect(page.locator('.ant-spin-spinning'), `${label}: spinners should settle`).toHaveCount(0, { timeout: SLOW });
}

// antd DatePicker: type dd/MM/yyyy and commit with Enter (verified live against this form).
async function fillDate(page: Page, item: Locator, value: string) {
  const input = item.locator('input').first();
  await input.click();
  await page.waitForTimeout(400);
  await input.fill(value);
  await page.waitForTimeout(400);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(600);
}

async function selectOption(page: Page, item: Locator, value: string) {
  await item.locator('.ant-select').first().click();
  const dropdown = page.locator('.ant-select-dropdown').locator('visible=true').first();
  await expect(dropdown).toBeVisible({ timeout: 60_000 });
  const option = dropdown.locator('.ant-select-item-option').filter({ hasText: new RegExp(`^${value}$`) }).first();
  await expect(option, `option "${value}" should be listed`).toBeVisible({ timeout: 60_000 });
  await option.click();
  await page.waitForTimeout(500);
}

// Fill the Add New Period modal. Returns the modal locator.
async function fillPeriodForm(
  page: Page,
  data: { name: string; shortName: string; type: string; start: string; end: string },
) {
  const modal = page.locator('.ant-modal-content').first();
  await expect(modal).toBeVisible({ timeout: SLOW });
  const item = (label: RegExp) =>
    modal.locator('.ant-form-item').filter({ has: page.locator('label').filter({ hasText: label }) }).first();

  await item(/^Name/i).locator('input').first().fill(data.name);
  await item(/^Short Name/i).locator('input').first().fill(data.shortName);
  await fillDate(page, item(/^Period Start/i), data.start);
  await fillDate(page, item(/^Period End/i), data.end);
  await selectOption(page, item(/^Period Type/i), data.type);
  return modal;
}

// ── test ───────────────────────────────────────────────────────────────────────

test.describe('EPM — Period management (ADO plan 108745 / suite 109505)', () => {
  test('TC-109441 Create top-level Financial Year Period with child Quarter Periods', async ({ page }) => {
    test.setTimeout(1_800_000);
    console.log(`RUN TOKEN — ${TOKEN} (parent "${PARENT.name}")`);

    // PRECONDITION: signed in as administrator; Period list at /dynamic/Shesha.Enterprise/period.
    await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('input').first()).toBeVisible({ timeout: SLOW });
    await page.locator('input').first().fill('admin.PrincessH');
    await page.locator('input[type="password"]').first().fill('123qwe');
    await page.getByRole('button', { name: /sign in|login/i }).first().click();
    await expect(page).not.toHaveURL(/\/login/, { timeout: SLOW });

    await openViaEpmAdminstration(page, 'Period', '/dynamic/Shesha.Enterprise/period');
    await waitReady(page, 'Period list');
    await expect(page).toHaveURL(/\/dynamic\/Shesha\.Enterprise\/period$/);

    // ── STEP 1: Click + Add. Fill the five fields. Click OK. ──────────────────
    await page.locator('.ant-btn').filter({ hasText: 'Add' }).first().click();
    const modal = page.locator('.ant-modal-content').first();
    await expect(modal).toBeVisible({ timeout: SLOW });
    await expect(modal.locator('.ant-modal-title')).toHaveText('Add New Period', { timeout: 60_000 });
    await fillPeriodForm(page, PARENT);
    await page.screenshot({
      path: 'projects/EPM/test-reports/2026-08-12/assets/tc441-01-parent-form.png',
      fullPage: true,
    });
    await modal.getByRole('button', { name: /^OK$/ }).click();
    await expect(modal).toBeHidden({ timeout: SLOW });
    await waitReady(page, 'Period list after create');

    // STEP 1 EXPECTED: Row appears in list.
    // The list paginates at 10/page and grows by 5 every run, so filter via the toolbar quick-search
    // rather than trusting the new row to be on page 1.
    const searchBox = page.locator('.ant-input-group-wrapper input').first();
    await searchBox.fill(PARENT.name);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(4_000);
    await expect(page.locator('.ant-spin-spinning')).toHaveCount(0, { timeout: SLOW });

    // Grid is div-based: .sha-table > .tr.tr-body > .td (no <table>/<th>).
    const parentRow = page.locator('.sha-table .tr-body').filter({ hasText: PARENT.name }).first();
    await expect(parentRow, 'STEP 1: new Financial Year row should appear in the Period list').toBeVisible({ timeout: SLOW });
    const parentRowText = (await parentRow.innerText()).replace(/\s+/g, ' ');
    console.log(`STEP 1 — row in list: ${parentRowText}`);
    expect(parentRowText).toContain(PARENT.shortName);
    expect(parentRowText).toContain('Financial Year');
    expect(parentRowText).toContain('01/04/2026');
    expect(parentRowText).toContain('31/03/2027');
    await page.screenshot({
      path: 'projects/EPM/test-reports/2026-08-12/assets/tc441-02-parent-in-list.png',
      fullPage: true,
    });

    // ── STEP 2: Open the row via search icon. Add Q1 as a child. ──────────────
    // The row "search icon" is the row link in the first cell — NOT the toolbar search box, which also
    // renders an .anticon-search and would merely re-filter the grid.
    const rowLink = parentRow.locator('a.sha-link').first();
    const detailHref = await rowLink.getAttribute('href');
    console.log(`STEP 2 — row link: ${detailHref}`);
    expect(detailHref, 'row link should point at the period-details form').toMatch(
      /\/dynamic\/Shesha\.Enterprise\/period-details\?id=/,
    );
    await rowLink.click();
    await waitReady(page, 'Period detail');
    await expect(page).toHaveURL(/period-details\?id=/);
    await expect(page.getByText(`Period: ${PARENT.name}`).first()).toBeVisible({ timeout: SLOW });
    // Rendered live as "Child periods" (lowercase p) — confirmed via a DOM snapshot 2026-08-27, an
    // exact-case "Child Periods" match never resolves and stalls the whole 7-minute expect timeout.
    await expect(page.getByText(/^Child periods$/i).first()).toBeVisible({ timeout: SLOW });
    await page.screenshot({
      path: 'projects/EPM/test-reports/2026-08-12/assets/tc441-03-detail-child-periods.png',
      fullPage: true,
    });

    // The Child Periods grid is the only .sha-table on the detail form.
    const childTable = page.locator('.sha-table').first();
    const childRow = (name: string) => childTable.locator('.tr-body').filter({ hasText: name }).first();

    const addChild = async (q: (typeof QUARTERS)[number], stepLabel: string) => {
      // The Add button on the detail form belongs to the Child Periods grid.
      await page.locator('.ant-btn').filter({ hasText: 'Add' }).first().click();
      const childModal = page.locator('.ant-modal-content').first();
      await expect(childModal).toBeVisible({ timeout: SLOW });

      await expect(childModal.locator('.ant-modal-title')).toHaveText(/Add child period/i, { timeout: 60_000 });
      // The Shesha form renders its fields asynchronously, so wait for the form proper before reading it.
      await expect(
        childModal.locator('.ant-form-item').filter({ has: page.locator('label').filter({ hasText: /^Name/i }) }).first().locator('input').first(),
      ).toBeVisible({ timeout: 60_000 });

      // "Parent auto-populated": the read-only Parent Period field must resolve to the parent's name
      // before anything is typed. It first renders the placeholder "unknown" while the referenced entity
      // loads, so this must be an auto-retrying assertion — reading it once samples the placeholder and
      // wrongly looks like the parent was not populated.
      const parentItem = childModal
        .locator('.ant-form-item')
        .filter({ has: page.locator('label').filter({ hasText: /Parent/i }) })
        .first();
      await expect(parentItem, `${stepLabel}: Parent Period should auto-populate with the Financial Year`)
        .toContainText(PARENT.name, { timeout: 60_000 });
      console.log(`${stepLabel} — parent auto-populated on child form: "${(await parentItem.innerText()).replace(/\s+/g, ' ').trim()}"`);

      await fillPeriodForm(page, { ...q, type: 'Quarter' });
      await childModal.getByRole('button', { name: /^OK$/ }).click();
      await expect(childModal).toBeHidden({ timeout: SLOW });
      await expect(page.locator('.ant-spin-spinning')).toHaveCount(0, { timeout: SLOW });

      const row = childRow(q.name);
      await expect(row, `${stepLabel}: ${q.label} row should appear in Child Periods`).toBeVisible({ timeout: SLOW });
      const text = (await row.innerText()).replace(/\s+/g, ' ');
      console.log(`${stepLabel} — ${q.label} row: ${text}`);
      expect(text).toContain('Quarter');
      expect(text).toContain(q.start);
      expect(text).toContain(q.end);
      // Parent auto-populated, as rendered by the grid's Parent Period column.
      expect(text, `${stepLabel}: Parent Period column should name the Financial Year`).toContain(PARENT.name);
    };

    // STEP 2 EXPECTED: Q1 row appears in Child Periods table.
    await addChild(QUARTERS[0], 'STEP 2');
    await page.screenshot({
      path: 'projects/EPM/test-reports/2026-08-12/assets/tc441-04-q1-added.png',
      fullPage: true,
    });

    // ── STEP 3: Repeat for Q2, Q3, Q4. ───────────────────────────────────────
    for (const q of QUARTERS.slice(1)) {
      await addChild(q, 'STEP 3');
    }

    // STEP 3 EXPECTED: Four Quarter Periods are children of FY 2026-27.
    for (const q of QUARTERS) {
      await expect(childRow(q.name), `${q.label} should still be listed`).toBeVisible({ timeout: SLOW });
    }
    const quarterRows = childTable.locator('.tr-body').filter({ hasText: TOKEN });
    await expect(quarterRows, 'exactly four Quarter children for this run').toHaveCount(4, { timeout: SLOW });
    const allChildText = (await childTable.innerText()).replace(/\s+/g, ' ');
    console.log(`STEP 3 — Child Periods table:\n${allChildText}`);
    for (const q of QUARTERS) expect(allChildText).toContain(q.shortName);
    await page.screenshot({
      path: 'projects/EPM/test-reports/2026-08-12/assets/tc441-05-four-quarters.png',
      fullPage: true,
    });
    console.log(`DONE — parent "${PARENT.name}" with 4 Quarter children (token ${TOKEN})`);
  });
});
