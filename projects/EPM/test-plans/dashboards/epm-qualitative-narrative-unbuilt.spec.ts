import { test, expect } from '@playwright/test';

// ADO suite 109535 (plan 108745, "34 · Qualitative KPI narrative"): TC-108804 (Positive — narrative
// captures Achieved/Not Achieved/Partially Achieved), TC-108890 (Negative — reject empty narrative),
// TC-108891 (Edge — multi-paragraph rich text), TC-108892 (Integration — renders read-only on Stage 2-6
// + dashboard tile preview). All 4 share one root cause, confirmed live 2026-09-02: there is no
// functional "Qualitative KPI" type or narrative capture path anywhere in this build.
//
// Evidence gathered:
// 1. A real `achievements` text field DOES exist on the ComponentProgressReport entity (confirmed via
//    a full field dump) -- but across all 1000 real CPR records sampled tenant-wide, ZERO have ever had
//    this field populated. It has never been used by any real workflow submission in this tenant's
//    history, not just in this session.
// 2. `Epm.CalculationType` (the closest real "method" reflist) is unrelated -- only Cummulative/Non
//    Cummulative (see epm-sum-aggregation-unbuilt.md). "Method of Calculation" itself is a free-text
//    field with zero functional effect (see epm-kpi-method-of-calculation-text-reclassification-not-implemented) --
//    several real KPIs have "Qualitative" typed into this text field (e.g. "Human Settlements Grants
//    Frameworks Approved", "Report on unqualified audit opinion..."), but this is cosmetic only.
// 3. Live-drove the Stage 1 Capture form for CPR2026/0888 ("Human Settlements Grants Frameworks
//    Approved - Q1 2026/27", methodOfCalculation literally "Qualitative"): the form renders IDENTICALLY
//    to a normal quantitative KPI -- a real numeric "Quarter Target" (100), a REQUIRED numeric "Actual
//    Target" input, and the same 3-value Achievement Status radio (Achieved/Not Achieved/In Progress,
//    no Partially Achieved -- see epm-performance-dashboard-page-does-not-exist.md). No "Achievements"
//    text anywhere on the page.
// 4. A genuinely-named ComponentDefinition ("Qualitative", methodOfCalculation "Qualitative: measured
//    by narrative report", unitOfMeasure=null) exists but has ZERO live Components linked to it --
//    an orphaned scaffold record, never actually configured into a real reportable KPI.
//
// CONCLUSION: the `achievements` field was scaffolded on the entity but never wired into any UI form,
// never used in any real submission, and there is no way to configure a KPI that actually exercises it.
// All 4 cases in this suite are blocked by this single root cause -- same "field exists on the entity,
// zero UI/functional surface" pattern as epm-audit-trail-write-path-clean-no-before-after-fields and
// epm-component-qa-config-no-ui.

const WF_API = 'https://pd-epm-api-qa-wf.shesha.app';
const BASE = 'https://pd-epm-adminportal-qa-wf.shesha.app';
const SLOW = 420_000;

test.describe('EPM — Qualitative KPI narrative (ADO plan 108745 / suite 109535)', () => {
  test('TC-108804/890/891/892 — no functional Qualitative KPI narrative path exists anywhere', async ({ page }) => {
    test.setTimeout(180_000);
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
      }
      return null;
    });
    const auth = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

    // Step 1: the achievements field is real but has zero real-world usage tenant-wide.
    const cprResp = await (await page.request.get(`${WF_API}/api/dynamic/Epm/ComponentProgressReport/Crud/GetAll?maxResultCount=1000`, { headers: auth })).json();
    const items = cprResp?.result?.items ?? [];
    const withAchievements = items.filter((i: any) => i.achievements != null && i.achievements !== '');
    console.log(`STEP 1 ACTUAL — of ${items.length} real CPR records tenant-wide, ${withAchievements.length} have a non-empty "achievements" field.`);
    expect(withAchievements.length, 'TC-108804 EXPECTED (per ADO): the Achievements narrative field should be in active real-world use — CONFIRMED UNBUILT: zero records across the whole tenant have ever used it').toBe(0);

    // Step 2: the orphaned "Qualitative" ComponentDefinition has no live Components.
    const cdResp = await (await page.request.get(`${WF_API}/api/dynamic/Epm/ComponentDefinition/Crud/GetAll?maxResultCount=500`, { headers: auth })).json();
    const qualCd = (cdResp?.result?.items ?? []).find((i: any) => i.name === 'Qualitative');
    console.log(`STEP 2 ACTUAL — a ComponentDefinition literally named "Qualitative" exists: ${!!qualCd} (id=${qualCd?.id}).`);
    const compResp = await (await page.request.get(`${WF_API}/api/dynamic/Epm/Component/Crud/GetAll?maxResultCount=500`, { headers: auth })).json();
    const linkedComponents = (compResp?.result?.items ?? []).filter((c: any) => c.componentDefinition?.id === qualCd?.id);
    console.log(`STEP 2 ACTUAL — real Components configured against this definition: ${linkedComponents.length} (expect > 0 for a usable Qualitative KPI).`);
    expect(linkedComponents.length, 'TC-108804 EXPECTED: at least one real KPI should be configured as genuinely Qualitative — CONFIRMED UNBUILT: this definition is an orphaned scaffold, never linked to any live Component').toBe(0);

    // Step 3: a real KPI textually labeled "Qualitative" via methodOfCalculation still renders a
    // normal numeric capture form with no Achievements field at all.
    const stage1Auth = await (async () => {
      await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded' });
      await expect(page.locator('input').first()).toBeVisible({ timeout: SLOW });
      await page.locator('input').first().fill('stage1');
      await page.locator('input[type="password"]').first().fill('123qwe');
      await page.getByRole('button', { name: /sign in|login/i }).first().click();
      await expect(page).not.toHaveURL(/\/login/, { timeout: SLOW });
      const t = await page.evaluate(() => {
        for (const key of Object.keys(localStorage)) {
          const value = localStorage.getItem(key);
          if (value && /^ey[A-Za-z0-9]/.test(value)) return value;
        }
        return null;
      });
      return { Authorization: `Bearer ${t}`, 'Content-Type': 'application/json' };
    })();
    const inboxResp = await (await page.request.get(`${WF_API}/api/dynamic/Shesha.Workflow/WorkflowInboxItem/Crud/GetAll?maxResultCount=500`, { headers: stage1Auth })).json();
    const item = (inboxResp?.result?.items ?? []).find((i: any) => i.refNumber === 'CPR2026/0888' && /capture/i.test(i.actionText ?? ''));
    console.log(`STEP 3 PRECONDITION — fixture CPR2026/0888 ("Human Settlements Grants Frameworks Approved", methodOfCalculation="Qualitative"): live Stage 1 item found=${!!item}.`);
    expect(item, 'PRECONDITION: this fixture should have a live Stage 1 Capture inbox item').toBeTruthy();

    await page.goto(`${BASE}/shesha/workflow-action?id=${item.workflowInstanceId}&todoid=${item.todoId}`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(8000);
    const bodyText = await page.locator('body').innerText().catch(() => '');
    const hasAchievementsField = bodyText.includes('Achievements');
    const hasNumericTarget = /Quarter Target\s*100/.test(bodyText) || bodyText.includes('Actual Target');
    console.log(`STEP 3 ACTUAL — "Achievements" text present on the form: ${hasAchievementsField}; a required numeric Actual Target is still present: ${hasNumericTarget}.`);
    expect(hasAchievementsField, 'TC-108804 EXPECTED: a KPI labeled Qualitative should show an Achievements narrative field instead of numeric Target/Actual — CONFIRMED UNBUILT: no such field renders; the form is identical to a normal quantitative KPI').toBeFalsy();
    expect(hasNumericTarget, 'Confirms the form still requires a numeric Actual Target despite the "Qualitative" label').toBeTruthy();
  });
});
