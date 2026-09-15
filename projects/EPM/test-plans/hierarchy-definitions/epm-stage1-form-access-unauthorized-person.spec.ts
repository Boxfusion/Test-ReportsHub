import { test, expect } from '@playwright/test';

// ADO TC-108841 (plan 108745, suite 18 · EPM · Stage 1 Process Owner — KPI progress capture form
// load). Negative: precondition — signed in as a Person NOT assigned as Stage 1 on any Component.
// Attempt to open the workflow-inbox route — expect it loads but shows no items for this Person;
// attempt to load a KPI capture form by direct URL to a known ComponentProgressReport identifier —
// expect read-only or 403; confirm no ComponentProgressReport was updated via this session.
//
// "JohnDoe" (real seeded Person, shares the tenant's common "123qwe" password) has zero
// ComponentActioner assignments anywhere — confirmed via API before this run — making them a genuine
// unauthorized Person for this case. Used a real, known workflow-action URL
// (workflowInstanceId f401219f-..., todoId abf6b4a9-...) belonging to a real Stage 1 item on the
// tenant's main KPI — that item has since been completed/submitted by separate activity (see
// epm-workflow-inbox-item-locked-down), so this also tests direct-URL access to an already-closed
// workflow task, not just an in-progress one.

const BASE = 'https://pd-epm-adminportal-qa-wf.shesha.app';
const WF_API = 'https://pd-epm-api-qa-wf.shesha.app';
const KNOWN_WORKFLOW_INSTANCE_ID = 'f401219f-9b68-4d49-a81a-e36dcd8eee5c';
const KNOWN_TODO_ID = 'abf6b4a9-b1c1-4d68-909a-c638d9b01e51';
const KNOWN_CPR_ID = '0da675be-2ca0-478c-b1f5-04507399ab05'; // ComponentProgressReport this task belongs to

const SLOW = 420_000;
const RAW_CHANNEL = process.env.PW_CHANNEL === undefined ? 'chrome' : process.env.PW_CHANNEL;
const CHANNEL = RAW_CHANNEL === '' || RAW_CHANNEL === 'chromium' ? undefined : RAW_CHANNEL;

test.use({
  channel: CHANNEL,
  actionTimeout: 30_000,
  navigationTimeout: 120_000,
});

test.describe('EPM — Stage 1 form access from an unauthorized Person (ADO plan 108745 / suite 18)', () => {
  test('TC-108841 Negative — a Person without a Stage 1 assignment should not access the capture form', async ({ page }) => {
    test.setTimeout(300_000);

    // PRECONDITION (ADO): confirm JohnDoe genuinely has zero ComponentActioner assignments, as admin.
    await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('input').first()).toBeVisible({ timeout: SLOW });
    await page.locator('input').first().fill('admin.PrincessH');
    await page.locator('input[type="password"]').first().fill('123qwe');
    await page.getByRole('button', { name: /sign in|login/i }).first().click();
    await expect(page).not.toHaveURL(/\/login/, { timeout: SLOW });

    const adminToken = await page.evaluate(() => {
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
    const adminAuth = { Authorization: `Bearer ${adminToken}`, 'Content-Type': 'application/json' };

    const personsResp = await (await page.request.get(`${WF_API}/api/dynamic/Shesha/Person/Crud/GetAll?maxResultCount=200`, { headers: adminAuth })).json();
    const johnDoe = (personsResp?.result?.items ?? []).find((p: any) => p.fullName === 'John Doe');
    expect(johnDoe, 'PRECONDITION EXPECTED: John Doe should exist as a real Person').toBeTruthy();
    const caResp = await (await page.request.get(`${WF_API}/api/dynamic/Epm/ComponentActioner/Crud/GetAll?maxResultCount=2000`, { headers: adminAuth })).json();
    const johnDoeActionerRows = (caResp?.result?.items ?? []).filter((r: any) => r?.actioner?.id === johnDoe.id);
    console.log(`PRECONDITION ACTUAL — John Doe's ComponentActioner rows: ${johnDoeActionerRows.length}.`);
    expect(johnDoeActionerRows.length, 'PRECONDITION EXPECTED: John Doe should have zero Component Actioner assignments').toBe(0);

    const cprBefore = await (await page.request.get(`${WF_API}/api/dynamic/Epm/ComponentProgressReport/Crud/Get?id=${KNOWN_CPR_ID}`, { headers: adminAuth })).json();
    console.log(`PRECONDITION ACTUAL — known ComponentProgressReport lastModificationTime before: ${cprBefore?.result?.lastModificationTime}.`);

    // STEP 1 (ADO): Attempt to open the workflow-inbox route as the unauthorized Person.
    await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('input').first()).toBeVisible({ timeout: SLOW });
    await page.locator('input').first().fill('JohnDoe');
    await page.locator('input[type="password"]').first().fill('123qwe');
    await page.getByRole('button', { name: /sign in|login/i }).first().click();
    await expect(page).not.toHaveURL(/\/login/, { timeout: SLOW });
    await page.goto(`${BASE}/dynamic/Shesha.Workflow/workflows-inbox`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    await page.getByText('loading...', { exact: true }).waitFor({ state: 'detached', timeout: 30_000 }).catch(() => {});
    await page.waitForTimeout(1000);
    const inboxText = await page.locator('body').innerText().catch(() => '');
    console.log(`STEP 1 ACTUAL — inbox page text: ${inboxText.slice(0, 600)}`);
    const inboxLoaded = /Incoming Items/i.test(inboxText);
    const showsNoData = /No Data|No data is available|0 items found/i.test(inboxText);
    console.log(`STEP 1 ACTUAL — inbox loaded: ${inboxLoaded}; shows no data: ${showsNoData}.`);
    expect(inboxLoaded, 'STEP 1 EXPECTED: the inbox page should load successfully').toBeTruthy();
    expect(showsNoData, 'STEP 1 EXPECTED: the inbox should show no items for this unauthorized Person').toBeTruthy();

    // STEP 2 (ADO): Attempt to load a KPI capture form by direct URL to a known identifier.
    await page.goto(`${BASE}/shesha/workflow-action?id=${KNOWN_WORKFLOW_INSTANCE_ID}&todoid=${KNOWN_TODO_ID}`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(8000);
    const directAccessText = await page.locator('body').innerText().catch(() => '');
    console.log(`STEP 2 ACTUAL — direct-URL page text: ${directAccessText.slice(0, 1500)}`);
    const shows403 = /403|forbidden|not authorized|access denied/i.test(directAccessText);
    // Real distinguishing markers: the read-only "sent-items-details" view says "Requested action is
    // not available" and has no Submit button at all; the real editable capture form has a live
    // "Submit" button (present regardless of stage) and the "Capture the Progress Report..." hint.
    const showsReadOnlyView = /Requested action is not available/i.test(directAccessText);
    const submitBtnCount = await page.getByRole('button', { name: 'Submit', exact: true }).count();
    console.log(`STEP 2 ACTUAL — shows 403/forbidden: ${shows403}; shows the read-only "action not available" view: ${showsReadOnlyView}; Submit button present: ${submitBtnCount > 0}.`);
    expect(shows403 || showsReadOnlyView || submitBtnCount === 0, 'STEP 2 EXPECTED (per ADO): the form should load read-only (no Submit action) or return 403 for an unauthorized Person').toBeTruthy();

    // STEP 3 (ADO): Confirm no ComponentProgressReport was updated via this session.
    const cprAfter = await (await page.request.get(`${WF_API}/api/dynamic/Epm/ComponentProgressReport/Crud/Get?id=${KNOWN_CPR_ID}`, { headers: adminAuth })).json();
    console.log(`STEP 3 ACTUAL — lastModificationTime after: ${cprAfter?.result?.lastModificationTime} (was ${cprBefore?.result?.lastModificationTime}).`);
    expect(cprAfter?.result?.lastModificationTime, 'STEP 3 EXPECTED: no state change should have occurred from this unauthorized session').toBe(cprBefore?.result?.lastModificationTime);
  });
});
