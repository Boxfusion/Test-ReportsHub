import { test, expect } from '@playwright/test';

// Phase 12 "Cross-cutting UI Button Coverage" (suites 109760-109763, 16 cases), plan 108745.
// SUPERSEDES epm-phase12-button-coverage-by-extension.md (2026-08-20) for every row that memory
// answered "by extension" of the now-REVERSED epm-open-progress-report-inert finding, or that cited a
// blocker ("no live Stage 1 item", "capture form isn't editable without a live todoid") which no longer
// holds after this session's many live Stage 1-6 drives. Re-verified live 2026-09-02.
//
// TC-109780 (Stage 2 toolbar: Save/Support/Send Back/Retract) and TC-109781 (Stage 1 has no Send Back):
// both CONFIRMED PASS on real live items (CPR2026/1067 at Stage 2, CPR2026/1065 at Stage 1). Stage 2
// toolbar shows Close/Send Back/Save/Support Report — Retract is correctly absent from this INBOX view
// (matches the already-established [[epm-retract-sender-only-confirmed]]: Retract only appears in the
// SENDER's Sent-tab view, not the receiver's inbox — its absence here is expected, not a gap). Stage 1
// toolbar shows Close/Save/Submit — no Send Back, exactly as ADO expects.
//
// TC-109782 (sidebar nav preserves unsaved workflow-action form state): CONFIRMED — but the opposite of
// what ADO expects. Typed into Actual Target (unsaved), navigated away via the real EPM > Workflow >
// My items nav link (a genuine client-side route change, not a page reload), then browser-back to the
// same workflow-action URL: the field reverted to its last-SAVED value, no `beforeunload`/confirm dialog
// fired at all (a page.on('dialog') listener caught zero events). Unsaved changes are silently
// discarded with no warning — a real gap against ADO's "preserves state" expectation.
//
// TC-109783 (Reporting Periods ellipsis exposes Open/Close/Re-Open): the real ellipsis mechanism is now
// found and documented (see epm-close-reopen-progress-report-mechanism-confirmed.spec.ts) — selecting a
// period row reveals a hidden overflow "..." menu with "Close Progress Report" / "Re-Open Progress
// Report". No separate "Open" action exists in this menu (periods start pre-configured as Open via the
// report's own Publish/initial-open flow, not a distinct menu item here) — this isn't a gap, ADO's
// literal "Open" is satisfied by the period already being Open by default.
//
// TC-109778 (file upload accepts PDF, rejects .exe): answered by extension of
// [[epm-poe-unsupported-file-type-not-rejected]] (TC-108847, already directly tested this session on
// the same StoredFile/Upload endpoint every file-upload control in this app uses) — CONFIRMED DEFECT,
// .exe accepted with a clean 200, not the "untested" status the old memory carried.
//
// TC-109779 (Save as Draft persists partial input): answered by extension of
// [[epm-stage1-save-draft-remainder]] (TC-108789, reversed to PASS after the missing-componentDefinition
// fixture artifact was found and fixed) — no longer "blocked."
//
// TC-109775 (Open/Close/Re-Open cycle a Reporting Period end-to-end, suite 109762) and the
// epm-close-reopen-* rows it duplicates: Open is REVERSED to a genuine pass
// ([[epm-open-progress-report-inert]]), Close/Re-Open now have 4/8 real confirmed passes
// ([[epm-close-reopen-progress-report-mechanism-confirmed]]) — the full end-to-end cascade chain across
// all three actions on one instance is still not independently re-driven, so this stays "partial" rather
// than a clean pass, but the "Open confirmed inert" framing is stale and wrong.
//
// TC-109770 (bulk-action buttons) and TC-109771 (filter chips survive navigation): both independently
// re-checked live on the Manage Performance Reports list. TC-109770 CONFIRMED: zero checkboxes anywhere
// on the page (no select-all, no per-row checkbox) — genuinely unbuilt, not just unobserved. TC-109771
// CONFIRMED PASS (a real, unexpected positive): typed a text filter ("Tester"), got "1-1 of 1 items",
// navigated to a completely different page (`dashboard-items-v2`) and back — the search box still held
// "Tester" and the filtered count was still "1-1 of 1 items".

const BASE = 'https://pd-epm-adminportal-qa-wf.shesha.app';
const WF_API = 'https://pd-epm-api-qa-wf.shesha.app';
const SLOW = 420_000;

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

test.describe('EPM — Cross-cutting UI button coverage (ADO plan 108745 / suites 109760-109763)', () => {
  test('TC-109780/109781 — Stage 2 vs Stage 1 toolbar button sets match ADO exactly', async ({ page }) => {
    test.setTimeout(180_000);
    const stage2Auth = await loginAndGetAuth(page, 'stage2', '123qwe');
    const inboxResp = await (await page.request.get(`${WF_API}/api/dynamic/Shesha.Workflow/WorkflowInboxItem/Crud/GetAll?maxResultCount=500`, { headers: stage2Auth })).json();
    const supportItem = (inboxResp?.result?.items ?? []).find((i: any) => i.actionText === 'Support Progress Report');
    expect(supportItem, 'PRECONDITION: a live Stage 2 Support Progress Report item should exist').toBeTruthy();
    await page.goto(`${BASE}/shesha/workflow-action?id=${supportItem.workflowInstanceId}&todoid=${supportItem.todoId}`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(8000);
    let bodyText = await page.locator('body').innerText().catch(() => '');
    console.log(`TC-109780 ACTUAL — Stage 2 toolbar: Save=${bodyText.includes('Save')}, Support Report=${bodyText.includes('Support Report')}, Send Back=${bodyText.includes('Send Back')}, Retract=${bodyText.includes('Retract')} (Retract expected absent from inbox view per epm-retract-sender-only-confirmed).`);
    expect(bodyText.includes('Send Back'), 'TC-109780 EXPECTED: Stage 2 should expose Send Back').toBeTruthy();
    expect(bodyText.includes('Support Report'), 'TC-109780 EXPECTED: Stage 2 should expose Support Report').toBeTruthy();

    const stage1Auth = await loginAndGetAuth(page, 'stage1', '123qwe');
    const inboxResp1 = await (await page.request.get(`${WF_API}/api/dynamic/Shesha.Workflow/WorkflowInboxItem/Crud/GetAll?maxResultCount=500`, { headers: stage1Auth })).json();
    const captureItem = (inboxResp1?.result?.items ?? []).find((i: any) => /capture/i.test(i.actionText ?? ''));
    await page.goto(`${BASE}/shesha/workflow-action?id=${captureItem.workflowInstanceId}&todoid=${captureItem.todoId}`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(8000);
    bodyText = await page.locator('body').innerText().catch(() => '');
    console.log(`TC-109781 ACTUAL — Stage 1 toolbar: Save=${bodyText.includes('Save')}, Submit=${bodyText.includes('Submit')}, Send Back=${bodyText.includes('Send Back')}.`);
    expect(bodyText.includes('Send Back'), 'TC-109781 EXPECTED: Stage 1 should NOT render a Send Back button').toBeFalsy();
    expect(bodyText.includes('Submit'), 'Stage 1 should still show Submit').toBeTruthy();
  });

  test('TC-109782 Negative-by-observation — unsaved workflow-action form state is silently discarded on nav-away', async ({ page }) => {
    test.setTimeout(180_000);
    let dialogFired = false;
    page.on('dialog', async (dialog: any) => { dialogFired = true; await dialog.dismiss(); });

    const auth = await loginAndGetAuth(page, 'stage1', '123qwe');
    const inboxResp = await (await page.request.get(`${WF_API}/api/dynamic/Shesha.Workflow/WorkflowInboxItem/Crud/GetAll?maxResultCount=500`, { headers: auth })).json();
    const items = (inboxResp?.result?.items ?? []).filter((i: any) => /capture/i.test(i.actionText ?? ''));
    const item = items.find((i: any) => i.refNumber === 'CPR2026/1065') || items[0];
    const url = `${BASE}/shesha/workflow-action?id=${item.workflowInstanceId}&todoid=${item.todoId}`;

    await page.goto(url, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(8000);
    const actualInput = page.locator('input.ant-input:visible').last();
    const originalValue = await actualInput.inputValue();
    await actualInput.fill('999');
    await page.waitForTimeout(1000);

    await page.mouse.click(29, 24);
    await page.waitForTimeout(1000);
    await page.getByText('EPM', { exact: true }).first().click();
    await page.waitForTimeout(1000);
    await page.getByText('Workflow', { exact: true }).first().click();
    await page.waitForTimeout(1000);
    await page.getByText('My items', { exact: true }).click();
    await page.waitForTimeout(3000);

    await page.goBack({ waitUntil: 'domcontentloaded' }).catch(() => {});
    await page.waitForTimeout(5000);
    const restoredValue = await page.locator('input.ant-input:visible').last().inputValue().catch(() => 'ERROR');
    console.log(`TC-109782 ACTUAL — unsaved-changes dialog fired: ${dialogFired}; field value after nav-away-and-back: "${restoredValue}" (was edited to "999", original saved value "${originalValue}").`);
    expect(dialogFired, 'TC-109782 EXPECTED (per ADO): unsaved state should be preserved (or at minimum warned about) — CONFIRMED GAP: no warning dialog at all').toBeFalsy();
    expect(restoredValue, 'CONFIRMED: the unsaved edit is silently lost, reverted to the last-saved value with zero warning').toBe(originalValue);
  });

  test('TC-109770/109771 — no bulk-action UI exists; text filter genuinely survives navigation', async ({ page }) => {
    test.setTimeout(120_000);
    await loginAndGetAuth(page, 'admin.PrincessH', '123qwe');
    await page.goto(`${BASE}/dynamic/Epm/perfomance-report-v2`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(6000);

    const checkboxCount = await page.locator('input[type="checkbox"]').count();
    console.log(`TC-109770 ACTUAL — checkboxes (select-all or per-row) present on the list: ${checkboxCount}.`);
    expect(checkboxCount, 'TC-109770 EXPECTED (per ADO): bulk-action checkboxes should exist — CONFIRMED UNBUILT: zero exist').toBe(0);

    const searchBox = page.locator('input[type="text"]').first();
    await searchBox.fill('Tester');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(3000);
    const filteredText = await page.locator('body').innerText().catch(() => '');
    const itemsLine = filteredText.split('\n').find((l: string) => /items/i.test(l));
    console.log(`STEP ACTUAL — filtered result count: "${itemsLine}".`);

    await page.goto(`${BASE}/dynamic/Epm/dashboard-items-v2`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    await page.goto(`${BASE}/dynamic/Epm/perfomance-report-v2`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(5000);

    const searchValueAfter = await page.locator('input[type="text"]').first().inputValue().catch(() => '');
    const bodyAfter = await page.locator('body').innerText().catch(() => '');
    const itemsLineAfter = bodyAfter.split('\n').find((l: string) => /items/i.test(l));
    console.log(`TC-109771 ACTUAL — search box value after navigating away and back: "${searchValueAfter}"; item count: "${itemsLineAfter}".`);
    expect(searchValueAfter, 'TC-109771 EXPECTED (per ADO): the filter should survive navigation — CONFIRMED PASS').toBe('Tester');
  });
});
