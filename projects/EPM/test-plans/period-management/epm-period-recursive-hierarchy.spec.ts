import { test, expect, type Locator, type Page, type APIRequestContext } from '@playwright/test';

// Derived artefact — the canonical source is epm-period-recursive-hierarchy.md, which mirrors ADO test case
// 109443 in suite 109505. Edit the .md (and the ADO case), not this file, except for AI-repair patches.
//
// Hybrid execution, agreed before the run and documented in the plan: the 6 records of one complete branch
// (MTSF -> FY -> Quarter -> 3 Months) are created through the UI, proving the create path at every depth of
// the recursion; the remaining 80 siblings are bulk-created through Period/Crud/Create. Every level of the
// hierarchy has at least one member created via the UI.

const BASE = 'https://pd-epm-adminportal-qa-wf.shesha.app';
// Must match BASE's host family — UI creates land on -wf, not plain -qa. Confirmed live 2026-08-27:
// the plain -qa host's GetAll doesn't see records created via the -wf UI (same host-mismatch pattern
// documented for UnitOfMeasure elsewhere in this suite — see epm-unit-of-measure-getall-host-mismatch
// memory). This was a stale constant in this spec, not an app defect.
const API = 'https://pd-epm-api-qa-wf.shesha.app';
const CRUD = `${API}/api/dynamic/Shesha.Enterprise/Period/Crud`;
const DETAIL = (id: string) => `${BASE}/dynamic/Shesha.Enterprise/period-details?id=${id}`;

const TOKEN = process.env.TC443_TOKEN || `TC443-${Date.now()}`;
const SHORT = TOKEN.slice(-6);

const SLOW = 420_000;
const RAW_CHANNEL = process.env.PW_CHANNEL === undefined ? 'chrome' : process.env.PW_CHANNEL;
const CHANNEL = RAW_CHANNEL === '' || RAW_CHANNEL === 'chromium' ? undefined : RAW_CHANNEL;

test.use({
  channel: CHANNEL,
  viewport: { width: 1920, height: 1080 },
  actionTimeout: 120_000,
  navigationTimeout: 120_000,
});

// ── date helpers ───────────────────────────────────────────────────────────────
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const pad = (n: number) => String(n).padStart(2, '0');
/** m is 1-based. Real last day, so February follows the leap-year rule rather than an assumption. */
const lastDay = (y: number, m: number) => new Date(Date.UTC(y, m, 0)).getUTCDate();
const iso = (y: number, m: number, d: number) => `${y}-${pad(m)}-${pad(d)}T00:00:00`;
const ddmmyyyy = (y: number, m: number, d: number) => `${pad(d)}/${pad(m)}/${y}`;

/** The 4 quarters of the financial year beginning April of `startYear`. */
function quartersOf(startYear: number) {
  return [
    { label: 'Q1', months: [{ y: startYear, m: 4 }, { y: startYear, m: 5 }, { y: startYear, m: 6 }] },
    { label: 'Q2', months: [{ y: startYear, m: 7 }, { y: startYear, m: 8 }, { y: startYear, m: 9 }] },
    { label: 'Q3', months: [{ y: startYear, m: 10 }, { y: startYear, m: 11 }, { y: startYear, m: 12 }] },
    { label: 'Q4', months: [{ y: startYear + 1, m: 1 }, { y: startYear + 1, m: 2 }, { y: startYear + 1, m: 3 }] },
  ].map((q) => ({
    ...q,
    start: { y: q.months[0].y, m: q.months[0].m, d: 1 },
    end: { y: q.months[2].y, m: q.months[2].m, d: lastDay(q.months[2].y, q.months[2].m) },
  }));
}

const FY_START_YEARS = [2026, 2027, 2028, 2029, 2030];
const MTSF = {
  name: `MTSF 2026-31 ${TOKEN}`,
  shortName: `M${SHORT}`,
  start: { y: 2026, m: 4, d: 1 },
  end: { y: 2031, m: 3, d: 31 },
};
const fyOf = (i: number) => {
  const y = FY_START_YEARS[i];
  return {
    name: `FY${y}-${String(y + 1).slice(2)} ${TOKEN}`,
    shortName: `F${i + 1}${SHORT}`,
    start: { y, m: 4, d: 1 },
    end: { y: y + 1, m: 3, d: 31 },
  };
};

// ── UI helpers ─────────────────────────────────────────────────────────────────

// Retry the whole two-level flyout path: a hover landing before rc-menu hydrates is swallowed, and the
// flyout can close between the visibility check and the hover (antd then unmounts the popup, so a
// long-timeout hover stalls on a detached node). Short per-action timeouts fail fast and re-open.
// The left rail is icon-only; "EPM" is a plain menuitem (click, not hover) that opens a flyout with
// "Workflow" / "EPM Administration". Hovering "EPM Administration" opens the module's page list.
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
      console.log(`  nav attempt ${attempt} failed: ${String(e.message).split('\n')[0].slice(0, 80)}`);
      await page.mouse.move(1_400, 900);
      await page.waitForTimeout(1_000);
    }
  }
  throw new Error(`could not reach "${linkName}" via EPM > EPM Administration after 8 attempts`);
}

async function waitReady(page: Page, label: string) {
  await expect(page.locator('.ant-btn').filter({ hasText: 'Add' }).first(), `${label}: Add should render`)
    .toBeVisible({ timeout: SLOW });
  await expect(page.locator('.ant-spin-spinning'), `${label}: spinners settle`).toHaveCount(0, { timeout: SLOW });
}

// antd DatePicker: type dd/MM/yyyy, commit with Enter.
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
  await expect(option, `Period Type option "${value}" should exist`).toBeVisible({ timeout: 60_000 });
  await option.click();
  await page.waitForTimeout(500);
}

type PeriodInput = {
  name: string;
  shortName: string;
  start: { y: number; m: number; d: number };
  end: { y: number; m: number; d: number };
};

/** Fill the currently open Add/Add-child modal and click OK. */
async function fillAndSubmit(page: Page, data: PeriodInput, type: string) {
  const modal = page.locator('.ant-modal-content').first();
  await expect(modal).toBeVisible({ timeout: SLOW });
  const nameItem = modal.locator('.ant-form-item').filter({ has: page.locator('label').filter({ hasText: /^Name/i }) }).first();
  // The Shesha form renders fields asynchronously — wait for the form proper before typing.
  await expect(nameItem.locator('input').first()).toBeVisible({ timeout: 60_000 });

  const item = (label: RegExp) =>
    modal.locator('.ant-form-item').filter({ has: page.locator('label').filter({ hasText: label }) }).first();
  await nameItem.locator('input').first().fill(data.name);
  await item(/^Short Name/i).locator('input').first().fill(data.shortName);
  await fillDate(page, item(/^Period Start/i), ddmmyyyy(data.start.y, data.start.m, data.start.d));
  await fillDate(page, item(/^Period End/i), ddmmyyyy(data.end.y, data.end.m, data.end.d));
  await selectOption(page, item(/^Period Type/i), type);
  await modal.getByRole('button', { name: /^OK$/ }).click();
  await expect(modal).toBeHidden({ timeout: SLOW });
  await expect(page.locator('.ant-spin-spinning')).toHaveCount(0, { timeout: SLOW });
}

/** Add a child from a parent's detail page, asserting Parent Period auto-populates first. */
async function addChildViaUi(page: Page, parentName: string, data: PeriodInput, type: string, label: string) {
  await page.locator('.ant-btn').filter({ hasText: 'Add' }).first().click();
  const modal = page.locator('.ant-modal-content').first();
  await expect(modal).toBeVisible({ timeout: SLOW });
  await expect(modal.locator('.ant-modal-title')).toHaveText(/Add child period/i, { timeout: 60_000 });
  // Parent Period first renders the placeholder "unknown" while the reference resolves — must be an
  // auto-retrying assertion, or a single read samples the placeholder and looks like a failure.
  const parentItem = modal.locator('.ant-form-item').filter({ has: page.locator('label').filter({ hasText: /Parent/i }) }).first();
  await expect(parentItem, `${label}: Parent Period should auto-populate with "${parentName}"`)
    .toContainText(parentName, { timeout: 60_000 });
  await fillAndSubmit(page, data, type);

  const row = page.locator('.sha-table').first().locator('.tr-body').filter({ hasText: data.name }).first();
  await expect(row, `${label}: "${data.name}" should appear in Child Periods`).toBeVisible({ timeout: SLOW });
  const text = (await row.innerText()).replace(/\s+/g, ' ');
  expect(text, `${label}: row should be typed ${type}`).toContain(type);
  expect(text, `${label}: row should name its parent`).toContain(parentName);
  console.log(`  UI created ${type}: ${data.name}`);
}

// ── API helpers ────────────────────────────────────────────────────────────────
async function apiGetAll(req: APIRequestContext, token: string) {
  const r = await req.get(`${CRUD}/GetAll?maxResultCount=1000`, {
    headers: { Authorization: `Bearer ${token}` },
    timeout: SLOW,
  });
  expect(r.status(), 'Period Crud/GetAll').toBe(200);
  const j = await r.json();
  return (j.result?.items ?? j.result ?? []) as any[];
}

async function apiCreate(
  req: APIRequestContext,
  token: string,
  data: PeriodInput & { periodType: number; parentId: string },
) {
  const r = await req.post(`${CRUD}/Create`, {
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    data: {
      name: data.name,
      shortName: data.shortName,
      periodStart: iso(data.start.y, data.start.m, data.start.d),
      periodEnd: iso(data.end.y, data.end.m, data.end.d),
      periodType: data.periodType,
      parentPeriod: { id: data.parentId },
    },
    timeout: SLOW,
  });
  const body = await r.text();
  expect(r.status(), `Crud/Create "${data.name}" -> ${body.slice(0, 200)}`).toBeLessThan(400);
  return JSON.parse(body).result.id as string;
}

/** Run tasks with bounded concurrency so the bulk phase does not hammer a single-threaded QA backend. */
async function inBatches<T, R>(items: T[], size: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const out: R[] = [];
  for (let i = 0; i < items.length; i += size) {
    out.push(...(await Promise.all(items.slice(i, i + size).map(fn))));
  }
  return out;
}

// ── test ───────────────────────────────────────────────────────────────────────

test.describe('EPM — Period management (ADO plan 108745 / suite 109505)', () => {
  test('TC-109443 Recursive Period hierarchy MTSF > Financial Year > Quarter > Month is fully supported', async ({ page }) => {
    test.setTimeout(1_800_000);
    console.log(`RUN TOKEN — ${TOKEN}`);

    // PRECONDITION: Signed in as administrator.
    await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('input').first()).toBeVisible({ timeout: SLOW });
    await page.locator('input').first().fill('admin.PrincessH');
    await page.locator('input[type="password"]').first().fill('123qwe');
    await page.getByRole('button', { name: /sign in|login/i }).first().click();
    await expect(page).not.toHaveURL(/\/login/, { timeout: SLOW });
    const token = await page.evaluate(() => {
      for (const k of Object.keys(localStorage)) {
        const v = localStorage.getItem(k);
        if (v && /^ey[A-Za-z0-9]/.test(v)) return v;
        try { const j = JSON.parse(v); if (j && typeof j.accessToken === 'string') return j.accessToken; } catch { /* not JSON */ }
      }
      return null;
    });
    expect(token, 'bearer token recoverable').toBeTruthy();

    // ══ PHASE A — one complete branch through the UI, proving each depth ══
    await openViaEpmAdminstration(page, 'Period', '/dynamic/Shesha.Enterprise/period');
    await waitReady(page, 'Period list');

    // A1: the MTSF root, from the Period list.
    await page.locator('.ant-btn').filter({ hasText: 'Add' }).first().click();
    await expect(page.locator('.ant-modal-content').first().locator('.ant-modal-title'))
      .toHaveText('Add New Period', { timeout: 60_000 });
    await fillAndSubmit(page, MTSF, 'MTSF');
    console.log(`  UI created MTSF: ${MTSF.name}`);

    // Find it in the list (filter first — the grid paginates at 10/page and grows every run).
    await page.locator('.ant-input-group-wrapper input').first().fill(MTSF.name);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(4_000);
    await expect(page.locator('.ant-spin-spinning')).toHaveCount(0, { timeout: SLOW });
    const mtsfRow = page.locator('.sha-table .tr-body').filter({ hasText: MTSF.name }).first();
    await expect(mtsfRow, 'MTSF row should appear in the Period list').toBeVisible({ timeout: SLOW });
    expect((await mtsfRow.innerText()).replace(/\s+/g, ' ')).toContain('MTSF');

    // Descend via the row link (the main list's "search icon").
    await mtsfRow.locator('a.sha-link').first().click();
    await waitReady(page, 'MTSF detail');
    await expect(page.getByText(`Period: ${MTSF.name}`).first()).toBeVisible({ timeout: SLOW });
    await page.screenshot({ path: 'projects/EPM/test-reports/2026-08-12/assets/tc443-01-mtsf-detail.png', fullPage: true });

    // A2: FY1 under the MTSF.
    const fy1 = fyOf(0);
    await addChildViaUi(page, MTSF.name, fy1, 'Financial Year', 'PHASE A');

    // Resolve ids from the API — the Child Periods grid has no row-link column, so descending a level
    // navigates to period-details?id=<guid> directly.
    let all = await apiGetAll(page.request, token!);
    const find = (name: string) => {
      const hit = all.find((p) => p.name === name);
      expect(hit, `"${name}" should exist via Crud/GetAll`).toBeTruthy();
      return hit;
    };
    const mtsfRec = find(MTSF.name);
    const fy1Rec = find(fy1.name);

    // A3: FY1-Q1 under FY1.
    await page.goto(DETAIL(fy1Rec.id), { waitUntil: 'domcontentloaded' });
    await waitReady(page, 'FY1 detail');
    await expect(page.getByText(`Period: ${fy1.name}`).first()).toBeVisible({ timeout: SLOW });
    const q1Def = quartersOf(FY_START_YEARS[0])[0];
    const q1 = {
      name: `FY1 Q1 ${TOKEN}`,
      shortName: `Q1${SHORT}`,
      start: q1Def.start,
      end: q1Def.end,
    };
    await addChildViaUi(page, fy1.name, q1, 'Quarter', 'PHASE A');

    all = await apiGetAll(page.request, token!);
    const q1Rec = all.find((p) => p.name === q1.name);
    expect(q1Rec, 'FY1 Q1 should exist').toBeTruthy();

    // A4: the 3 Months of FY1-Q1.
    await page.goto(DETAIL(q1Rec.id), { waitUntil: 'domcontentloaded' });
    await waitReady(page, 'FY1-Q1 detail');
    const uiMonths = q1Def.months.map((mm) => ({
      name: `${MONTH_NAMES[mm.m - 1]} ${mm.y} ${TOKEN}`,
      shortName: `${MONTH_NAMES[mm.m - 1]}${String(mm.y).slice(2)}${SHORT.slice(-3)}`,
      start: { y: mm.y, m: mm.m, d: 1 },
      end: { y: mm.y, m: mm.m, d: lastDay(mm.y, mm.m) },
    }));
    for (const mo of uiMonths) await addChildViaUi(page, q1.name, mo, 'Month', 'PHASE A');
    await page.screenshot({ path: 'projects/EPM/test-reports/2026-08-12/assets/tc443-02-ui-branch-months.png', fullPage: true });
    console.log('PHASE A — 6 records created through the UI (MTSF, FY, Quarter, 3 Months)');

    // ══ PHASE B — learn the periodType enum from the UI-created records ══
    all = await apiGetAll(page.request, token!);
    const TYPE = {
      mtsf: find(MTSF.name).periodType as number,
      fy: find(fy1.name).periodType as number,
      quarter: find(q1.name).periodType as number,
      month: find(uiMonths[0].name).periodType as number,
    };
    console.log(`PHASE B — periodType enum learned: ${JSON.stringify(TYPE)}`);
    expect(new Set(Object.values(TYPE)).size, 'the four period types must be distinct').toBe(4);
    // The parent chain of the UI branch, end to end.
    expect(find(fy1.name).parentPeriod?.id, 'FY1.parent = MTSF').toBe(mtsfRec.id);
    expect(find(q1.name).parentPeriod?.id, 'Q1.parent = FY1').toBe(find(fy1.name).id);
    for (const mo of uiMonths) {
      expect(find(mo.name).parentPeriod?.id, `${mo.name}.parent = Q1`).toBe(find(q1.name).id);
    }
    expect(find(MTSF.name).parentPeriod ?? null, 'MTSF is top-level').toBeNull();

    // ══ PHASE C — bulk-create the remaining 80 siblings via the API ══
    const fyIds: string[] = [find(fy1.name).id];
    for (let i = 1; i < 5; i++) {
      const fy = fyOf(i);
      fyIds.push(await apiCreate(page.request, token!, { ...fy, periodType: TYPE.fy, parentId: mtsfRec.id }));
    }
    console.log(`PHASE C — ${fyIds.length} Financial Years total`);

    // Quarters: FY1 already owns Q1 from the UI, so it needs Q2..Q4; FY2..FY5 need all four.
    const quarterIds: { id: string; fyIndex: number; label: string; months: { y: number; m: number }[] }[] = [
      { id: q1Rec.id, fyIndex: 0, label: 'Q1', months: q1Def.months },
    ];
    for (let i = 0; i < 5; i++) {
      const defs = quartersOf(FY_START_YEARS[i]);
      const needed = i === 0 ? defs.slice(1) : defs;
      const made = await inBatches(needed, 4, async (q) => ({
        id: await apiCreate(page.request, token!, {
          name: `FY${i + 1} ${q.label} ${TOKEN}`,
          shortName: `Q${q.label[1]}F${i + 1}${SHORT.slice(-3)}`,
          start: q.start,
          end: q.end,
          periodType: TYPE.quarter,
          parentId: fyIds[i],
        }),
        fyIndex: i,
        label: q.label,
        months: q.months,
      }));
      quarterIds.push(...made);
    }
    console.log(`PHASE C — ${quarterIds.length} Quarters total`);

    // Months: 3 per quarter; FY1-Q1's three already exist from the UI.
    let monthCount = uiMonths.length;
    for (const q of quarterIds) {
      if (q.id === q1Rec.id) continue;
      const made = await inBatches(q.months, 3, (mm) =>
        apiCreate(page.request, token!, {
          name: `${MONTH_NAMES[mm.m - 1]} ${mm.y} FY${q.fyIndex + 1} ${TOKEN}`,
          shortName: `${MONTH_NAMES[mm.m - 1]}${String(mm.y).slice(2)}${q.fyIndex + 1}`,
          start: { y: mm.y, m: mm.m, d: 1 },
          end: { y: mm.y, m: mm.m, d: lastDay(mm.y, mm.m) },
          periodType: TYPE.month,
          parentId: q.id,
        }),
      );
      monthCount += made.length;
    }
    console.log(`PHASE C — ${monthCount} Months total`);

    // ══ PHASE D — STEP 1 EXPECTED: all nested rows persist ══
    all = await apiGetAll(page.request, token!);
    const mine = all.filter((p) => String(p.name).includes(TOKEN));
    const byType = (t: number) => mine.filter((p) => p.periodType === t);
    const childrenOf = (id: string) => mine.filter((p) => p.parentPeriod?.id === id);

    console.log(
      `PHASE D — persisted for ${TOKEN}: total ${mine.length} | MTSF ${byType(TYPE.mtsf).length} | ` +
        `FY ${byType(TYPE.fy).length} | Quarter ${byType(TYPE.quarter).length} | Month ${byType(TYPE.month).length}`,
    );

    expect(byType(TYPE.mtsf).length, 'exactly 1 MTSF').toBe(1);
    expect(byType(TYPE.fy).length, '5 Financial Years').toBe(5);
    expect(byType(TYPE.quarter).length, '20 Quarters').toBe(20);
    expect(byType(TYPE.month).length, '60 Months').toBe(60);
    expect(mine.length, '86 records in total').toBe(86);

    // Every link in the hierarchy, not just the counts.
    expect(childrenOf(mtsfRec.id).length, 'MTSF has 5 FY children').toBe(5);
    for (const fyId of fyIds) {
      const qs = childrenOf(fyId);
      expect(qs.length, `FY ${fyId} has 4 Quarter children`).toBe(4);
      for (const q of qs) {
        expect(q.periodType, 'child of FY is a Quarter').toBe(TYPE.quarter);
        const ms = childrenOf(q.id);
        expect(ms.length, `Quarter "${q.name}" has 3 Month children`).toBe(3);
        for (const m of ms) expect(m.periodType, 'child of Quarter is a Month').toBe(TYPE.month);
      }
    }
    // Depth 4 really is 4: month -> quarter -> fy -> mtsf -> null.
    const sampleMonth = byType(TYPE.month)[0];
    const chain: string[] = [];
    let cursor: any = sampleMonth;
    while (cursor) {
      chain.push(`${cursor.name} (type ${cursor.periodType})`);
      cursor = cursor.parentPeriod ? mine.find((p) => p.id === cursor.parentPeriod.id) : null;
    }
    console.log(`PHASE D — ancestry of a Month:\n    ${chain.join('\n      ↑ ')}`);
    expect(chain.length, 'a Month sits 4 levels deep').toBe(4);

    // ══ PHASE E — STEP 2: navigate the tree, each level renders ══
    const levels = [
      { label: 'MTSF', id: mtsfRec.id, name: MTSF.name, expectChildren: 5, childType: 'Financial Year' },
      { label: 'Financial Year', id: fyIds[1], name: fyOf(1).name, expectChildren: 4, childType: 'Quarter' },
    ];
    const fy2Quarters = childrenOf(fyIds[1]);
    levels.push({
      label: 'Quarter', id: fy2Quarters[0].id, name: fy2Quarters[0].name, expectChildren: 3, childType: 'Month',
    });
    const leafMonth = childrenOf(fy2Quarters[0].id)[0];
    levels.push({ label: 'Month', id: leafMonth.id, name: leafMonth.name, expectChildren: 0, childType: '' });

    for (const [i, level] of levels.entries()) {
      await page.goto(DETAIL(level.id), { waitUntil: 'domcontentloaded' });
      await waitReady(page, `${level.label} detail`);
      await expect(page.getByText(`Period: ${level.name}`).first(), `${level.label}: heading renders`)
        .toBeVisible({ timeout: SLOW });
      await expect(page.getByText('Period Details', { exact: true }).first()).toBeVisible({ timeout: SLOW });
      // Rendered live as "Child periods" (lowercase p) — confirmed 2026-08-27 on the sibling
      // epm-period-financial-year-quarters.spec.ts; an exact-case "Child Periods" match never
      // resolves and stalls the full SLOW timeout on every iteration of this loop.
      await expect(page.getByText(/^Child periods$/i).first()).toBeVisible({ timeout: SLOW });

      const rows = page.locator('.sha-table').first().locator('.tr-body');
      if (level.expectChildren > 0) {
        await expect(rows, `${level.label}: ${level.expectChildren} child rows render`)
          .toHaveCount(level.expectChildren, { timeout: SLOW });
        const gridText = (await page.locator('.sha-table').first().innerText()).replace(/\s+/g, ' ');
        expect(gridText, `${level.label}: children are typed ${level.childType}`).toContain(level.childType);
        expect(gridText, `${level.label}: children name their parent`).toContain(level.name);
      } else {
        await expect(rows, 'a Month is a leaf — no children').toHaveCount(0, { timeout: SLOW });
      }
      console.log(`STEP 2 — ${level.label} "${level.name}" renders with ${level.expectChildren} child rows`);
      await page.screenshot({
        path: `projects/EPM/test-reports/2026-08-12/assets/tc443-1${i}-level-${level.label.replace(/\s+/g, '-').toLowerCase()}.png`,
        fullPage: true,
      });
    }

    console.log(`DONE — MTSF root id ${mtsfRec.id} (delete this subtree to clean up token ${TOKEN})`);
  });
});
