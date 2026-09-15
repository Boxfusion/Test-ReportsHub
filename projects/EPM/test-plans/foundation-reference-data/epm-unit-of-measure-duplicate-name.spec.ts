import { test, expect, type Locator } from '@playwright/test';

// Derived artefact — the canonical source is epm-unit-of-measure-duplicate-name.md, which mirrors ADO
// test case 109439 in suite 109506. Edit the .md (and the ADO case), not this file, except for
// AI-repair patches.
//
// Self-contained by design: the hub treats each spec as a standalone derived artefact paired 1:1 with
// its plan and repairs it step-by-step, so config is duplicated here rather than shared with
// epm-unit-of-measure.spec.ts.

const BASE = 'https://pd-epm-adminportal-qa-wf.shesha.app';
const API = 'https://pd-epm-api-qa-wf.shesha.app';

// The ADO precondition is literally 'Unit "Hours" already exists', so this must name an existing
// record. Do NOT randomise it per run — a unique name would make the test vacuous.
const DUP_NAME = process.env.TC_UOM_DUP_NAME || 'Hours';

// Values for the duplicate attempt. Non-name fields differ from TC-109437's on purpose, so a row that
// did get written would be unambiguously identifiable as this case's.
const ATTEMPT = {
  description: 'Duplicate attempt — TC-109439',
  prefix: 'DUP',
  suffix: 'dup',
};

// EPM QA cold-starts in ~56s and pins the browser main thread while rendering: the login form took
// >120s to paint on a cold backend and the Unit of Measure grid ~146s. The hub config's 90s test /
// 10s expect / 15s action / 30s navigation defaults are all far too short for this app. Warming the
// API with a single curl before the run cuts this case to ~30s.
const SLOW = 420_000;

// Browser selection. The hub config's `devices['Desktop Chrome']` sets no channel, so this line is
// what picks the browser. Default is system Chrome; `PW_CHANNEL=chromium` (or an empty value) selects
// Playwright's bundled Chromium, and any other value is passed through as a channel name (e.g. msedge).
const RAW_CHANNEL = process.env.PW_CHANNEL === undefined ? 'chrome' : process.env.PW_CHANNEL;
const CHANNEL = RAW_CHANNEL === '' || RAW_CHANNEL === 'chromium' ? undefined : RAW_CHANNEL;

test.use({
  channel: CHANNEL,
  // Fixed viewport, not `viewport: null` — null conflicts with the deviceScaleFactor that the hub
  // config's `devices['Desktop Chrome']` sets ("deviceScaleFactor option is not supported with null
  // viewport"). 1920x1080 is wide enough for the sidebar flyouts to render inside it.
  viewport: { width: 1920, height: 1080 },
  actionTimeout: 120_000,
  navigationTimeout: 120_000,
});

test.describe('EPM — Unit of Measure duplicate name (ADO plan 108745 / suite 109506)', () => {
  test('TC-109439 Duplicate Unit of Measure Name is rejected by unique constraint', async ({ page }) => {
    test.setTimeout(1_200_000);

    // PRECONDITION: Signed in as administrator.
    await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('input').first()).toBeVisible({ timeout: SLOW });
    await page.locator('input').first().fill('admin.PrincessH');
    await page.locator('input[type="password"]').first().fill('123qwe');
    await page.getByRole('button', { name: /sign in|login/i }).first().click();
    await expect(page).not.toHaveURL(/\/login/, { timeout: SLOW });

    // PRECONDITION: Unit "Hours" already exists. Asserted against the API before touching the UI, so a
    // missing fixture reports as a precondition failure rather than a bogus "duplicate was allowed".
    const token = await page.evaluate(() => {
      for (const key of Object.keys(localStorage)) {
        const value = localStorage.getItem(key);
        if (value && /^ey[A-Za-z0-9]/.test(value)) return value;
        try {
          const parsed = JSON.parse(value);
          if (parsed && typeof parsed.accessToken === 'string') return parsed.accessToken;
        } catch {
          /* not JSON */
        }
      }
      return null;
    });
    expect(token, 'bearer token recoverable from localStorage').toBeTruthy();

    const countNamed = async (name: string) => {
      const r = await page.request.get(`${API}/api/dynamic/Epm/UnitOfMeasure/Crud/GetAll?maxResultCount=1000`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: SLOW,
      });
      expect(r.status()).toBe(200);
      const p = await r.json();
      const list = p.result?.items ?? p.result ?? [];
      return list.filter((x: any) => x?.name === name);
    };

    const before = await countNamed(DUP_NAME);
    expect(
      before.length,
      `PRECONDITION: exactly one "${DUP_NAME}" must already exist (found ${before.length}). ` +
        `TC-109437 (epm-unit-of-measure.md) seeds it; run that first if this fails.`,
    ).toBe(1);
    console.log(`PRECONDITION ok — "${DUP_NAME}" exists, id=${before[0].id}`);

    // Navigate EPM > EPM Administration > Unit of Measures.
    // A single hover is a race: the flyout only opens once rc-menu has hydrated, and a hover that
    // lands too early is silently swallowed (observed — the run then sees only the top-level menu, and
    // no later wait re-triggers it). So hover, check, and retry, moving the pointer away in between so
    // antd re-fires mouseenter.
    const hoverUntilVisible = async (trigger: Locator, revealed: Locator, label: string) => {
      for (let attempt = 1; attempt <= 6; attempt++) {
        await trigger.hover({ force: true });
        await page.waitForTimeout(2_000);
        if (await revealed.isVisible().catch(() => false)) return;
        console.log(`  ${label}: not open after hover attempt ${attempt}, retrying`);
        await page.mouse.move(1_400, 900);
        await page.waitForTimeout(500);
      }
      throw new Error(`${label} never opened after 6 hover attempts`);
    };

    // The left rail is icon-only; "EPM" is a plain menuitem (click, not hover) that opens a flyout
    // with "Workflow" / "EPM Administration". Hovering "EPM Administration" opens the module's page
    // list, including "Unit of Measures". `visible=true` matters throughout: rc-menu keeps a second,
    // off-screen copy of each item for the collapsed inline sidebar, and a bare .first() picks that
    // one, which then fails to hover/click.
    const epmItem = page.locator('.ant-menu').getByText('EPM', { exact: true }).locator('visible=true').first();
    const epmAdmin = page.getByText('EPM Administration', { exact: true }).locator('visible=true').first();
    const uomLink = page.getByRole('link', { name: 'Unit of Measure' }).locator('visible=true').first();

    await expect(epmItem).toBeVisible({ timeout: SLOW });
    await epmItem.click({ force: true });
    await page.waitForTimeout(2_500);
    await hoverUntilVisible(epmAdmin, uomLink, 'EPM Administration flyout');
    await expect(uomLink).toHaveAttribute('href', '/dynamic/Epm/unit-of-measure');
    await uomLink.click();

    // FRAGILE: the accessible name is icon + text, so getByRole('button', { name: /^Add$/ }) does
    // NOT match this button. Filter on text instead.
    const addButton = page.locator('.ant-btn').filter({ hasText: 'Add' }).first();
    await expect(addButton).toBeVisible({ timeout: SLOW });
    await expect(page.locator('.ant-spin-spinning')).toHaveCount(0, { timeout: SLOW });
    await expect(page).toHaveURL(/\/dynamic\/Epm\/unit-of-measure$/);

    // STEP 1: Attempt Create another "Hours".
    await addButton.click();
    const modal = page.locator('.ant-modal-content').first();
    await expect(modal).toBeVisible({ timeout: SLOW });
    const field = (label: RegExp) =>
      modal
        .locator('.ant-form-item')
        .filter({ has: page.locator('label').filter({ hasText: label }) })
        .locator('input, textarea')
        .first();
    await field(/^Name/i).fill(DUP_NAME);
    await field(/^Description/i).fill(ATTEMPT.description);
    await field(/Prefix/i).fill(ATTEMPT.prefix);
    await field(/Suffix/i).fill(ATTEMPT.suffix);

    // The uniqueness check is server-side, so Create is expected to be enabled.
    const createButton = modal.getByRole('button', { name: /^Create$/ });
    await expect(createButton).toBeEnabled();

    // The create may be rejected server-side (non-2xx or success:false) or blocked client-side with no
    // request at all. Capture whichever happens rather than assuming a POST is issued.
    const postPromise = page
      .waitForResponse(
        (r) => /UnitOfMeasure\/Crud\/Create/i.test(r.url()) && r.request().method() === 'POST',
        { timeout: 90_000 },
      )
      .catch(() => null);
    await createButton.click();
    const post = await postPromise;

    let postStatus: number | null = null;
    let postBody = '';
    if (post) {
      postStatus = post.status();
      postBody = (await post.text().catch(() => '')).slice(0, 1200);
      console.log(`STEP 1 — POST Crud/Create -> HTTP ${postStatus}`);
      console.log(`STEP 1 — response body: ${postBody}`);
    } else {
      console.log('STEP 1 — no POST to Crud/Create was issued (blocked client-side)');
    }

    // Only outer-most containers: `.ant-message-error` is nested INSIDE `.ant-message-notice`, so
    // including both makes one toast look like two.
    const noticeCount = await page.locator('.ant-message-notice, .ant-notification-notice').count();
    console.log(`STEP 1 — toast/notification elements on screen: ${noticeCount}`);
    const errorText = await page
      .locator('.ant-message-notice, .ant-notification-notice, .ant-form-item-explain-error')
      .allInnerTexts()
      .catch(() => [] as string[]);
    const surfaced = errorText.map((t) => t.replace(/\s+/g, ' ').trim()).filter(Boolean);
    console.log(`STEP 1 — messages surfaced: ${JSON.stringify(surfaced)}`);
    await page.screenshot({
      path: 'projects/EPM/test-reports/2026-08-12/assets/tc439-01-after-duplicate-create.png',
      fullPage: true,
    });

    // STEP 1 EXPECTED: Response returns unique-constraint error.
    const createSucceeded =
      !!post &&
      postStatus !== null &&
      postStatus < 400 &&
      (() => {
        try {
          return JSON.parse(postBody).success === true;
        } catch {
          return false;
        }
      })();
    expect(
      createSucceeded,
      `duplicate "${DUP_NAME}" must be rejected, but Crud/Create returned HTTP ${postStatus} with ${postBody}`,
    ).toBe(false);
    expect(
      surfaced.some((t) => /exist|duplicate|unique|already|error|invalid/i.test(t)),
      `an error should be surfaced to the user; messages seen: ${JSON.stringify(surfaced)}`,
    ).toBe(true);

    // STEP 2: Confirm no duplicate row. Full reload so the list comes from the server, not the client.
    await page.keyboard.press('Escape');
    await page.waitForTimeout(3_000);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.locator('.ant-btn').filter({ hasText: 'Add' }).first()).toBeVisible({ timeout: SLOW });
    await expect(page.locator('.ant-spin-spinning')).toHaveCount(0, { timeout: SLOW });
    await page.screenshot({
      path: 'projects/EPM/test-reports/2026-08-12/assets/tc439-02-list-after.png',
      fullPage: true,
    });

    // STEP 2 EXPECTED: List still has one "Hours" row.
    const after = await countNamed(DUP_NAME);
    console.log(`STEP 2 — records named "${DUP_NAME}": ${after.length} (ids ${after.map((x: any) => x.id).join(', ')})`);
    expect(
      after.length,
      `list must still hold exactly one "${DUP_NAME}" row; found ${after.length}: ` +
        JSON.stringify(after.map((x: any) => ({ id: x.id, created: x.creationTime }))),
    ).toBe(1);
    // Neither duplicated nor silently replaced.
    expect(after[0].id).toBe(before[0].id);
  });
});
