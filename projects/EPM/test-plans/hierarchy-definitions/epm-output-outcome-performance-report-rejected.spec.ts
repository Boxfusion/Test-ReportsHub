import { test, expect } from '@playwright/test';

// ADO TC-108823 (plan 108745, suite 06 · EPM · Output and Outcome linkage — planning-only Components
// without Performance Report identifier). Negative: Output/Outcome Components are meant to be
// "planning-only" (always performanceReport=null, per TC-108782/epm-output-outcome-linkage memory — all
// 26+ real catalog entries confirmed null). This case tests whether the app rejects an attempt to create
// one WITH a performanceReportId set.

const BASE = 'https://pd-epm-adminportal-qa-wf.shesha.app';
const WF_API = 'https://pd-epm-api-qa-wf.shesha.app';
const COMPONENT_CRUD = `${WF_API}/api/dynamic/Epm/Component/Crud`;
const OUTPUT_TYPE_ID = '27646442-6003-4356-a47d-2d5ea163b69a'; // real, shared "Output" Component Type
const PRINCESS_REPORT_ID = 'bc34f55d-bb32-4629-bd74-3e03250e4784'; // real, live report

const SLOW = 420_000;
const RAW_CHANNEL = process.env.PW_CHANNEL === undefined ? 'chrome' : process.env.PW_CHANNEL;
const CHANNEL = RAW_CHANNEL === '' || RAW_CHANNEL === 'chromium' ? undefined : RAW_CHANNEL;

test.use({
  channel: CHANNEL,
  viewport: { width: 1920, height: 1080 },
  actionTimeout: 30_000,
  navigationTimeout: 120_000,
});

test.describe('EPM — Output/Outcome planning-only invariant (ADO plan 108745 / suite 06)', () => {
  test('TC-108823 Negative — reject Output/Outcome Component creation with performanceReportId set', async ({ page }) => {
    test.setTimeout(600_000);

    await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('input').first()).toBeVisible({ timeout: SLOW });
    await page.locator('input').first().fill('admin.PrincessH');
    await page.locator('input[type="password"]').first().fill('123qwe');
    await page.getByRole('button', { name: /sign in|login/i }).first().click();
    await expect(page).not.toHaveURL(/\/login/, { timeout: SLOW });

    const token = await page.evaluate(() => {
      for (const key of Object.keys(localStorage)) {
        const value = localStorage.getItem(key);
        if (value && /^ey[A-Za-z0-9]/.test(value)) return value;
        try {
          const parsed = JSON.parse(value);
          if (parsed && typeof parsed.accessToken === 'string') return parsed.accessToken;
        } catch { /* not JSON */ }
      }
      return null;
    });
    expect(token, 'bearer token recoverable from localStorage').toBeTruthy();
    const auth = { Authorization: `Bearer ${token}` };

    // STEP 1: confirm the real "Outputs & Outcomes" create form has no Performance Report field at all
    // (per TC-108782/epm-output-outcome-linkage memory: Ref No, Description, Name, Select component
    // type, Weighting only) — i.e. the UI itself never offers a way to set this field, by design.
    const epmItem = page.locator('.ant-menu').getByText('EPM', { exact: true }).locator('visible=true').first();
    await expect(epmItem).toBeVisible({ timeout: SLOW });
    await epmItem.click({ force: true });
    await page.waitForTimeout(2_500);
    const epmAdmin = page.getByText('EPM Administration', { exact: true }).locator('visible=true').first();
    await expect(epmAdmin).toBeVisible({ timeout: 60_000 });
    await epmAdmin.hover({ force: true });
    await page.waitForTimeout(2_500);
    const outputsLink = page.getByText('Outputs & Outcomes', { exact: true }).locator('visible=true').first();
    await expect(outputsLink, 'an "Outputs & Outcomes" link should exist in the flyout').toBeVisible({ timeout: 30_000 });
    await outputsLink.click({ force: true });
    await expect(page.locator('.ant-spin-spinning')).toHaveCount(0, { timeout: SLOW });
    await page.waitForTimeout(1_500);

    const addBtn = page.locator('.ant-btn, button').filter({ hasText: /Add|New|Create/i }).first();
    await expect(addBtn, 'an Add action should exist on the Outputs & Outcomes grid').toBeVisible({ timeout: SLOW });
    await addBtn.click({ force: true });
    await page.waitForTimeout(1_500);

    const formLabels = await page.locator('.ant-form-item-label, .ant-form-item').allInnerTexts().catch(() => []);
    console.log(`STEP 1 — visible form fields on the "Add New Outcome or Output" modal: ${JSON.stringify(formLabels)}`);
    const hasPerformanceReportField = formLabels.some((l) => /performance report/i.test(l));
    console.log(`STEP 1 ACTUAL — a Performance Report field is present on the create form: ${hasPerformanceReportField}.`);
    expect(hasPerformanceReportField, 'STEP 1 EXPECTED: the create form should have no way to set Performance Report at all (planning-only by design)').toBe(false);

    // Close the modal without saving — this UI check alone doesn't prove the server-side invariant.
    const cancelBtn = page.locator('.ant-btn, button').filter({ hasText: /^Cancel$/ }).first();
    if (await cancelBtn.isVisible().catch(() => false)) await cancelBtn.click({ force: true });
    await page.waitForTimeout(500);

    // STEP 2: bypass via raw API — attempt to create an Output Component with performanceReportId
    // explicitly set. EXPECTED (per ADO): rejected. Since the UI never exposes this field, this is the
    // only way to test whether the server itself actually enforces the "planning-only" invariant.
    let probeId: string | null = null;
    try {
      const probeName = `TC108823 Bypass Probe ${Date.now().toString().slice(-6)}`;
      const bypassResp = await page.request.post(`${COMPONENT_CRUD}/Create`, {
        headers: auth,
        data: {
          name: probeName,
          refNo: `TC108823_${Date.now().toString().slice(-6)}`,
          description: 'TC-108823 server-side invariant probe',
          componentType: { id: OUTPUT_TYPE_ID },
          performanceReport: { id: PRINCESS_REPORT_ID },
        },
      });
      const bypassBody = await bypassResp.json().catch(() => null);
      console.log(`STEP 2 — POST ${bypassResp.status()} ${COMPONENT_CRUD}/Create :: ${JSON.stringify(bypassBody).slice(0, 500)}`);
      const bypassRejected = bypassResp.status() >= 400;
      if (!bypassRejected) probeId = bypassBody?.result?.id ?? null;
      console.log(`STEP 2 ACTUAL — creating an Output Component with performanceReportId set was ${bypassRejected ? 'REJECTED' : 'ACCEPTED (Component created, id ' + probeId + ')'}; ADO EXPECTED: "Rejected".`);
      expect(bypassRejected, 'STEP 2 EXPECTED (per ADO): the server should reject an Output/Outcome Component created with performanceReportId set — CONFIRMED DEFECT if accepted: no server-side check enforces the planning-only invariant').toBe(true);
    } finally {
      if (probeId) {
        const cleanup = await page.request.delete(`${COMPONENT_CRUD}/Delete?id=${probeId}`, { headers: auth }).catch(() => null);
        console.log(`CLEANUP — removed bypass-created Component ${probeId}: ${cleanup ? cleanup.status() : 'request failed'}`);
      }
    }
  });
});
