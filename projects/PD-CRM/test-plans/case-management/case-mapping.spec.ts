// Case Mapping — ADO suite 113658 (#113659–#113666), mirrored one-to-one from
// test-plans/case-management/case-mapping.md. The .md plan is canonical; this spec is derived.
//
// ✅ ENTIRELY READ-ONLY. Nothing is created, edited or deleted — the suite only reads the map and
// drives its filters.
//
// Screen notes that cost time during authoring, so they are stated once here:
//   • The map is LEAFLET. Pins are DOM (`.leaflet-marker-icon`), not canvas.
//   • A pin's info is an `.ant-popover` raised by a REAL MOUSE MOVE onto the pin's centre. It is not a
//     `.leaflet-popup`, `.ant-tooltip` or modal, and `hover({force:true})` does not raise it. Checking
//     only those three is why a first pass wrongly concluded "hover shows nothing".
//   • Filter captions are PLAIN TEXT, not <label>, so the selects are positional — but each one's
//     identity is verified against its own options before it is used.
//   • There is NO Apply button; selecting a value applies it immediately (Deviation 1).
//   • Pin COUNT is not a valid signal: the map fetches at most 100 cases, so a filtered view can show
//     MORE pins than the unfiltered one (56 → 86 for Channel=Mobile App). Each filter case asserts the
//     outgoing request's filter clause instead (Deviation 2 / QUESTION-701).

import { test, expect, Page, Locator } from '@playwright/test';
import { switchToLatest } from '../_helpers';

const BASE = 'https://pd-dep-adminportal-qa.shesha.app';
const MAP_URL = `${BASE}/dynamic/Boxfusion.ServiceManagement/Spartial_Map`;
const ADMIN = { user: 'Admin', password: 'P@ssword1' };

/** The map's data call. Its `filter=` clause is the ground truth that a filter was applied. */
const MAP_QUERY = /entityType=SM\.Case.*longitude/;

const pins = (page: Page) => page.locator('.leaflet-marker-icon');
const filters = (page: Page) => page.locator('.ant-select:visible');
const popover = (page: Page) => page.locator('.ant-popover:not(.ant-popover-hidden)').first();
const openOptions = (page: Page) =>
  page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option');

/** Positional index of each filter — verified against its own options by `assertFilterIs()`. */
const FILTER = { channel: 0, status: 1, priority: 2, category: 3, caseType: 4 } as const;

async function login(page: Page) {
  const user = page.getByPlaceholder('Username');
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded', timeout: 45_000 });
      await user.waitFor({ state: 'visible', timeout: 20_000 });
      break;
    } catch (e) {
      if (attempt === 3) throw e;
      console.log(`login page did not render (attempt ${attempt}) — retrying`);
      await page.waitForTimeout(3_000);
    }
  }
  await user.fill(ADMIN.user);
  await page.locator('input[type="password"]').first().fill(ADMIN.password);
  await page.locator('button:has-text("Sign In")').first().click();
  await page.waitForURL(/\/dynamic\//, { timeout: 60_000 });
  await switchToLatest(page);
}

async function gotoMap(page: Page) {
  await page.goto(MAP_URL, { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('networkidle').catch(() => {});
  await expect(page.locator('.leaflet-container, [class*="leaflet"]').first(),
    'the Case Mapping screen should render the map').toBeVisible({ timeout: 60_000 });
  await expect(pins(page).first(), 'the map should render case pins').toBeVisible({ timeout: 60_000 });
  await page.waitForTimeout(3_000);
}

/** Capture the `filter=` clause of the next map query triggered by `action`. */
async function filterClauseFrom(page: Page, action: () => Promise<void>): Promise<string> {
  const waiter = page.waitForRequest((r) => MAP_QUERY.test(r.url()), { timeout: 30_000 }).catch(() => null);
  await action();
  const req = await waiter;
  if (!req) return '';
  const raw = decodeURIComponent(req.url());
  return raw.slice(raw.indexOf('filter=') + 'filter='.length);
}

/** Identity guard: prove the positional select really is the filter we think it is. */
async function assertFilterIs(page: Page, index: number, expectedOptions: string[], name: string) {
  const sel = filters(page).nth(index);
  await sel.click();
  await page.waitForTimeout(2_500);
  const opts = (await openOptions(page).allInnerTexts()).map((s) => s.trim());
  console.log(`${name} filter [${index}] offers ${opts.length}: ${JSON.stringify(opts.slice(0, 12))}`);
  for (const want of expectedOptions) {
    expect(opts, `the ${name} filter should offer "${want}"`).toContain(want);
  }
  return opts;
}

/** Choose an option in the currently OPEN dropdown, then close the overlay without Escape. */
async function pickOpenOption(page: Page, label: string) {
  await openOptions(page).filter({ hasText: new RegExp(`^${label}$`) }).first().click({ timeout: 15_000 });
  await page.keyboard.press('Tab');
  await expect(page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden)'))
    .toHaveCount(0, { timeout: 10_000 });
  await page.waitForTimeout(1_000);
}

const selectedValue = async (sel: Locator) => {
  const el = sel.locator('.ant-select-selection-item').first();
  if (!(await el.count())) return '';
  return ((await el.getAttribute('title')) || (await el.textContent()) || '').trim();
};

/** Hover a pin with a REAL mouse move — the only gesture that raises the info popover. */
async function hoverPin(page: Page, index = 0) {
  const marker = pins(page).nth(index);
  const box = await marker.boundingBox();
  expect(box, 'the pin should have a position on screen').not.toBeNull();
  const cx = box!.x + box!.width / 2;
  const cy = box!.y + box!.height / 2;
  await page.mouse.move(cx - 80, cy - 80);
  await page.waitForTimeout(400);
  await page.mouse.move(cx, cy, { steps: 20 });
  await page.waitForTimeout(4_000);
}

/** Apply one dropdown filter and return the resulting map-query filter clause. */
async function applyFilter(page: Page, index: number, label: string) {
  const clause = await filterClauseFrom(page, async () => {
    await filters(page).nth(index).click();
    await page.waitForTimeout(2_000);
    await pickOpenOption(page, label);
  });
  await page.waitForTimeout(4_000);
  console.log(`applied "${label}" → filter=${clause.slice(0, 200)}`);
  return clause;
}

test.describe('Case Mapping (ADO 113658)', () => {
  test.describe.configure({ timeout: 240_000 });

  test('TC-01 (#113659): Verify Logged Cases Are Displayed on the Map', async ({ page }) => {
    // STEP 1-2: log in, navigate to Case Mapping
    await login(page);
    const query = page.waitForRequest((r) => MAP_QUERY.test(r.url()), { timeout: 60_000 }).catch(() => null);
    await gotoMap(page);
    const req = await query;

    // STEP 3: Review the map — cases with valid locations are displayed as pins
    const count = await pins(page).count();
    console.log(`TC-01 pins rendered: ${count}`);
    expect(count, 'cases with valid locations should be displayed as pins').toBeGreaterThan(0);
    expect(req, 'the map should query cases for their coordinates').not.toBeNull();
    expect(decodeURIComponent(req!.url()), 'the map query should request coordinates')
      .toContain('longitude');

    // STEP 4: Select a case pin — its information is displayed
    await hoverPin(page, 0);
    await expect(popover(page), 'selecting a pin should display its case information')
      .toBeVisible({ timeout: 20_000 });
    const info = (await popover(page).innerText()).replace(/\s+/g, ' ');
    console.log(`TC-01 pin info: ${info.slice(0, 300)}`);
    expect(info, 'the case information should identify the case').toMatch(/REF\d+/);
  });

  test('TC-02 (#113660): Verify Cases Can Be Filtered by Channel', async ({ page }) => {
    await login(page);
    await gotoMap(page);

    // STEP 3: Open the Channel filter — the available options are displayed
    await assertFilterIs(page, FILTER.channel, ['Call Centre', 'Mobile App', 'Email'], 'Channel');

    // STEP 4-5: Select a Channel; it applies immediately (no Apply control — Deviation 1)
    const clause = await filterClauseFrom(page, () => pickOpenOption(page, 'Call Centre'));
    await page.waitForTimeout(4_000);
    expect(await selectedValue(filters(page).nth(FILTER.channel)),
      'the selected Channel should be displayed').toBe('Call Centre');
    expect(clause, 'the map should re-query filtered by channel').toContain('reportedByChannel');
    console.log(`TC-02 filter=${clause.slice(0, 200)} · pins now ${await pins(page).count()}`);
    await expect(page.locator('.leaflet-container, [class*="leaflet"]').first(),
      'the map should still render after the refresh').toBeVisible();
  });

  test('TC-03 (#113661): Verify Cases Can Be Filtered by Status', async ({ page }) => {
    await login(page);
    await gotoMap(page);
    await assertFilterIs(page, FILTER.status, ['New', 'Closed', 'Cancelled'], 'Status');
    const clause = await filterClauseFrom(page, () => pickOpenOption(page, 'New'));
    await page.waitForTimeout(4_000);
    expect(await selectedValue(filters(page).nth(FILTER.status)),
      'the selected Status should be displayed').toBe('New');
    expect(clause, 'the map should re-query filtered by status').toMatch(/status/i);
    console.log(`TC-03 filter=${clause.slice(0, 200)} · pins now ${await pins(page).count()}`);
  });

  test('TC-04 (#113662): Verify Cases Can Be Filtered by Priority', async ({ page }) => {
    await login(page);
    await gotoMap(page);
    await assertFilterIs(page, FILTER.priority, ['High', 'Medium', 'Low', 'Urgent'], 'Priority');
    const clause = await filterClauseFrom(page, () => pickOpenOption(page, 'High'));
    await page.waitForTimeout(4_000);
    expect(await selectedValue(filters(page).nth(FILTER.priority)),
      'the selected Priority should be displayed').toBe('High');
    expect(clause, 'the map should re-query filtered by priority').toMatch(/priority/i);
    console.log(`TC-04 filter=${clause.slice(0, 200)} · pins now ${await pins(page).count()}`);
  });

  test('TC-05 (#113663): Verify Cases Can Be Filtered by Category and Case Type', async ({ page }) => {
    await login(page);
    await gotoMap(page);

    // Case Types BEFORE any Category is chosen — the baseline for the cascade check
    const before = await assertFilterIs(page, FILTER.caseType, [], 'Case Types');
    await page.keyboard.press('Tab');
    await page.waitForTimeout(1_500);

    // STEP 3-4: choose a Category
    await assertFilterIs(page, FILTER.category, ['Electrical', 'Water', 'Roads'], 'Category');
    const clause = await filterClauseFrom(page, () => pickOpenOption(page, 'Electrical'));
    await page.waitForTimeout(5_000);
    expect(await selectedValue(filters(page).nth(FILTER.category)),
      'the selected Category should be displayed').toBe('Electrical');
    expect(clause, 'the map should re-query filtered by category').toMatch(/categor/i);

    // ADO step 4: "the Case Type options are populated based on the selected Category"
    const after = await assertFilterIs(page, FILTER.caseType, [], 'Case Types (after Category)');
    console.log(`TC-05 case types before=${before.length} after=${after.length}`);
    console.log(`TC-05 before: ${JSON.stringify(before)}`);
    console.log(`TC-05 after : ${JSON.stringify(after)}`);
    // 🔴 BUG-701 expected here: recon found the identical 10 options either side of the Category
    // choice. This is an application defect, not a script fault — the whole option list is read.
    expect(after, 'BUG-701: Case Type options should be populated based on the selected Category')
      .not.toEqual(before);

    // STEP 5-6: a Case Type can still be chosen and applied
    const clause2 = await filterClauseFrom(page, () => pickOpenOption(page, after[0]));
    await page.waitForTimeout(4_000);
    console.log(`TC-05 case-type filter=${clause2.slice(0, 250)}`);
  });

  test('TC-06 (#113664): Verify Cases Can Be Filtered by Reported Date', async ({ page }) => {
    await login(page);
    await gotoMap(page);

    // STEP 3: Open the Reported Date filter.
    // ⚠️ It is a RANGE picker (`.ant-picker-range`, two inputs) with a time panel, so BOTH ends must be
    // set and each confirmed with OK. Setting only the start leaves it pending — no query is issued and
    // the value clears on blur, which reads exactly like "the date filter does nothing" and is not.
    // ⚠️ Click the picker's INPUT, not its container: the container's centre is overlapped by the
    // header and the adjacent selects, so a container click never lands.
    const picker = page.locator('.ant-picker-range').first();
    await expect(picker, 'the Reported Date filter should be displayed').toBeVisible({ timeout: 20_000 });
    await picker.locator('input').first().click();
    await page.waitForTimeout(3_000);
    const panel = page.locator('.ant-picker-dropdown:not(.ant-picker-dropdown-hidden)').first();
    await expect(panel, 'the Reported Date options should be displayed').toBeVisible({ timeout: 15_000 });

    // STEP 4: specify the date and time — start, then end
    await panel.locator('.ant-picker-cell-in-view').nth(5).click();
    await page.waitForTimeout(1_500);
    await panel.locator('button').filter({ hasText: /^OK$/i }).first().click();
    await page.waitForTimeout(2_500);

    // STEP 5: completing the range applies the filter (no Apply control — Deviation 1)
    const clause = await filterClauseFrom(page, async () => {
      await panel.locator('.ant-picker-cell-in-view').nth(20).click();
      await page.waitForTimeout(1_500);
      const ok = panel.locator('button').filter({ hasText: /^OK$/i }).first();
      if (await ok.count()) await ok.click();
    });
    await page.waitForTimeout(5_000);

    const values = await picker.locator('input').evaluateAll((els) => els.map((e: any) => e.value));
    console.log(`TC-06 range=${JSON.stringify(values)} filter=${clause.slice(0, 250)}`);
    expect(values[0], 'the specified start date should be displayed').not.toBe('');
    expect(values[1], 'the specified end date should be displayed').not.toBe('');
    expect(clause, 'the map should re-query filtered by reported date').toMatch(/reportedDate/i);
  });

  test('TC-07 (#113665): Verify Multiple Case Mapping Filters Can Be Applied', async ({ page }) => {
    await login(page);
    await gotoMap(page);

    // STEP 3-6: apply Channel, Status, Priority, Category in turn
    await applyFilter(page, FILTER.channel, 'Call Centre');
    await applyFilter(page, FILTER.status, 'New');
    await applyFilter(page, FILTER.priority, 'High');
    const last = await applyFilter(page, FILTER.category, 'Electrical');

    // Each selection must survive the others being applied
    expect(await selectedValue(filters(page).nth(FILTER.channel)), 'Channel should still be shown').toBe('Call Centre');
    expect(await selectedValue(filters(page).nth(FILTER.status)), 'Status should still be shown').toBe('New');
    expect(await selectedValue(filters(page).nth(FILTER.priority)), 'Priority should still be shown').toBe('High');
    expect(await selectedValue(filters(page).nth(FILTER.category)), 'Category should still be shown').toBe('Electrical');

    // The final query must carry ALL of them together, not just the last one
    console.log(`TC-07 combined filter=${last.slice(0, 400)}`);
    expect(last, 'the combined query should still filter by channel').toContain('reportedByChannel');
    expect(last, 'the combined query should still filter by status').toMatch(/status/i);
    expect(last, 'the combined query should still filter by priority').toMatch(/priority/i);
    expect(last, 'the combined query should filter by category').toMatch(/categor/i);
    await expect(page.locator('.leaflet-container, [class*="leaflet"]').first(),
      'the map should still render with every filter applied').toBeVisible();
  });

  test('TC-08 (#113666): Verify Case Details Are Displayed When a Case Location Is Hovered Over', async ({ page }) => {
    await login(page);
    await gotoMap(page);

    // STEP 3: Hover over a case location icon
    await hoverPin(page, 0);
    await expect(popover(page), 'a case information dialog should be displayed')
      .toBeVisible({ timeout: 20_000 });

    // STEP 4: Review the information displayed
    const info = (await popover(page).innerText()).replace(/\s+/g, ' ');
    console.log(`TC-08 popover: ${info}`);
    expect(info, 'the dialog should display the case Reference').toMatch(/Reference\s+REF\d+/i);
    expect(info, 'the dialog should display the Status').toMatch(/Status\s+\S+/i);
    expect(info, 'the dialog should display the Address').toMatch(/Address\s+\S+/i);
    expect(info, 'the dialog should display the Description').toMatch(/Description/i);
    // ADO says "Received Date"; the UI renders "Recieved" — BUG-702, cosmetic. Accept either spelling
    // so the case is judged on the DATA being present, not the typo.
    expect(info, 'the dialog should display the received date').toMatch(/Rec(ei|ie)ved\s+\d{2}\/\d{2}\/\d{4}/i);
    if (/Recieved/.test(info)) console.log('TC-08 BUG-702: the popover label is misspelled "Recieved"');
  });
});
