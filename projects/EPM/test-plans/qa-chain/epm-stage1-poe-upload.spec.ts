import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

// ADO suite 109522 (plan 108745, "20 · EPM · Stage 1 POE attachment upload"): TC-108790.
//
// Previously blocked (epm-stage1-origination-permanently-blocked) on the reasoning that attachment
// carry-through needs a successful Submit, and Submit is confirmed broken
// (epm-stage1-submit-permanently-blocked). Re-scoped 2026-09-01: TC-108790's literal ADO claim is just
// that an upload succeeds and persists on the record — that only needs Save, not Submit.
//
// Reuses the real item CPR2026/1071 (already Status: Draft in the Stage 1 inbox from prior TC-108846
// work), rather than building a fresh disposable fixture — see epm-disposable-fixture-hierarchy-convention.

const BASE = 'https://pd-epm-adminportal-qa-wf.shesha.app';
const WF_API = 'https://pd-epm-api-qa-wf.shesha.app';
const WORKFLOW_INSTANCE_ID = '101765e8-4e95-40b2-a575-5a9a245e1cdd';

const SLOW = 420_000;
const RAW_CHANNEL = process.env.PW_CHANNEL === undefined ? 'chrome' : process.env.PW_CHANNEL;
const CHANNEL = RAW_CHANNEL === '' || RAW_CHANNEL === 'chromium' ? undefined : RAW_CHANNEL;

test.use({ channel: CHANNEL, actionTimeout: 30_000, navigationTimeout: 120_000 });

async function loginAndGetAuth(page: any, userName: string, password: string) {
  await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('input').first()).toBeVisible({ timeout: SLOW });
  await page.locator('input').first().fill(userName);
  await page.locator('input[type="password"]').first().fill(password);
  await page.getByRole('button', { name: /sign in|login/i }).first().click();
  await expect(page).not.toHaveURL(/\/login/, { timeout: SLOW });
  const token = await page.evaluate(() => {
    for (const key of Object.keys(localStorage)) {
      const value = localStorage.getItem(key);
      if (value && /^ey[A-Za-z0-9]/.test(value)) return value;
    }
    return null;
  });
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}

async function freshTodoFor(page: any, auth: any, workflowInstanceId: string) {
  const inboxResp = await (await page.request.get(`${WF_API}/api/dynamic/Shesha.Workflow/WorkflowInboxItem/Crud/GetAll?maxResultCount=100`, { headers: auth })).json();
  return (inboxResp?.result?.items ?? []).find((i: any) => i.workflowInstanceId === workflowInstanceId);
}

test.describe('EPM — Stage 1 POE upload (ADO plan 108745 / suite 109522)', () => {
  test('TC-108790 Positive — upload a Portfolio of Evidence attachment', async ({ page }) => {
    test.setTimeout(300_000);
    const stage1Auth = await loginAndGetAuth(page, 'stage1', '123qwe');
    const item = await freshTodoFor(page, stage1Auth, WORKFLOW_INSTANCE_ID);
    expect(item, 'the CPR2026/1071 Stage 1 inbox item should exist').toBeTruthy();
    await page.goto(`${BASE}/shesha/workflow-action?id=${item.workflowInstanceId}&todoid=${item.todoId}`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(9000);

    const testFileName = `tc108790-poe-${Date.now()}.txt`;
    const testFilePath = path.join(__dirname, testFileName);
    fs.writeFileSync(testFilePath, `TC-108790 POE upload test file, created ${new Date().toISOString()}\n`);

    const saveResponses: string[] = [];
    page.on('response', async (res) => {
      if (res.url().includes('ComponentProgressReport/Crud/Update')) {
        saveResponses.push(`${res.status()}`);
      }
    });

    // Portfolio Of Evidence is the first of 3 file inputs on this form (Other Supporting Documents is
    // the second) — no client-side accept restriction is present.
    const fileInputs = page.locator('input[type="file"]');
    await fileInputs.first().setInputFiles(testFilePath);
    await page.waitForTimeout(3000);
    const attachedClientSide = (await page.locator('body').innerText().catch(() => '')).includes(testFileName);
    console.log(`STEP ACTUAL — filename shown on the form immediately after attaching: ${attachedClientSide}.`);

    const saveBtn = page.getByRole('button', { name: 'Save', exact: true }).first();
    await saveBtn.click();
    await page.waitForTimeout(4000);
    console.log(`STEP ACTUAL — Save response(s): ${JSON.stringify(saveResponses)}.`);
    expect(saveResponses.some((r) => r.startsWith('2')), 'STEP EXPECTED: Save should succeed with the attachment present').toBeTruthy();

    // Reload with a fresh todoId to rule out same-session-only client state.
    const item2 = await freshTodoFor(page, stage1Auth, WORKFLOW_INSTANCE_ID);
    await page.goto(`${BASE}/shesha/workflow-action?id=${item2.workflowInstanceId}&todoid=${item2.todoId}`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(9000);
    const bodyAfterReload = await page.locator('body').innerText().catch(() => '');
    const persistedAfterReload = bodyAfterReload.includes(testFileName);
    console.log(`STEP ACTUAL — filename still shown after a fresh reload: ${persistedAfterReload}.`);
    expect(persistedAfterReload, 'STEP EXPECTED (per ADO): the uploaded attachment should persist on the record').toBeTruthy();

    // Hard server-side confirmation: resolve the ComponentProgressReport id via the WorkflowInstance,
    // then confirm portfolioOfEvidence is a real StoredFile reference, not just client-side form state.
    const wfResp = await (await page.request.get(`${WF_API}/api/dynamic/Shesha.Workflow/WorkflowInstance/Crud/Get?id=${WORKFLOW_INSTANCE_ID}`, { headers: stage1Auth })).json();
    const cprId = wfResp?.result?.componentProgressReport?.id;
    const cprResp = await (await page.request.get(`${WF_API}/api/dynamic/Epm/ComponentProgressReport/Crud/Get?id=${cprId}`, { headers: stage1Auth })).json();
    const poe = cprResp?.result?.portfolioOfEvidence;
    console.log(`STEP ACTUAL — ComponentProgressReport.portfolioOfEvidence via API: ${JSON.stringify(poe)}.`);
    expect(poe?.id, 'STEP EXPECTED: portfolioOfEvidence should be a real StoredFile reference server-side').toBeTruthy();
    expect(poe?._displayName, 'STEP EXPECTED: the stored file name should match what was uploaded').toBe(testFileName);

    fs.unlinkSync(testFilePath);
  });

  test('TC-108847 Negative — reject an unsupported file type (.exe)', async ({ page }) => {
    test.setTimeout(300_000);
    const stage1Auth = await loginAndGetAuth(page, 'stage1', '123qwe');
    const item = await freshTodoFor(page, stage1Auth, WORKFLOW_INSTANCE_ID);
    expect(item, 'the CPR2026/1071 Stage 1 inbox item should exist').toBeTruthy();
    await page.goto(`${BASE}/shesha/workflow-action?id=${item.workflowInstanceId}&todoid=${item.todoId}`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(9000);

    const badFileName = `tc108847-bad-${Date.now()}.exe`;
    const badFilePath = path.join(__dirname, badFileName);
    // Arbitrary binary-looking content — not a real executable, just an .exe extension for the type check.
    fs.writeFileSync(badFilePath, Buffer.from([0x4d, 0x5a, 0x90, 0x00, 0x03, 0x00, 0x00, 0x00]));

    // The real upload endpoint the antd Upload widget calls the instant a file is selected — this is
    // the ground truth for whether file-type validation exists at all (Save's own response doesn't
    // reflect it either way, since Save just persists whatever the widget already uploaded).
    const uploadResponses: string[] = [];
    page.on('response', async (res) => {
      if (res.url().includes('/api/StoredFile/Upload')) {
        uploadResponses.push(`${res.status()} ${(await res.text().catch(() => '')).slice(0, 300)}`);
      }
    });

    // Other Supporting Documents is the second of 3 file inputs — still empty on this item, so this
    // doesn't disturb the real Portfolio Of Evidence attachment persisted by TC-108790.
    const fileInputs = page.locator('input[type="file"]');
    await fileInputs.nth(1).setInputFiles(badFilePath);
    await page.waitForTimeout(4000);
    const bodyAfterAttach = await page.locator('body').innerText().catch(() => '');
    const clientRejectionText = /not\s+(supported|allowed)|invalid\s+file|unsupported/i.test(bodyAfterAttach);
    console.log(`STEP ACTUAL — StoredFile/Upload response for the .exe: ${JSON.stringify(uploadResponses)}. Client-side rejection message visible: ${clientRejectionText}.`);

    const uploadAccepted = uploadResponses.some((r) => r.startsWith('2'));
    const rejected = clientRejectionText || !uploadAccepted;
    expect.soft(rejected, 'STEP EXPECTED (per ADO): an unsupported file type (.exe) should be rejected — CONFIRMED GAP: StoredFile/Upload accepts it with 200 and zero type validation, no rejection message shown').toBeTruthy();

    const saveBtn = page.getByRole('button', { name: 'Save', exact: true }).first();
    await saveBtn.click();
    await page.waitForTimeout(4000);

    if (fs.existsSync(badFilePath)) fs.unlinkSync(badFilePath);
  });
});
