import { test, expect } from '@playwright/test';

// Suites 109521 ("21 · Stage 1 Submit", TC-108791/108850/108851/108852), 109522 ("20 · Stage 1 POE
// attachment upload", TC-108790/108847/108848/108849), and 109529 ("22 · Stage 2 Support review",
// TC-108792/108853/108854/108855).
//
// All 3 suites need a live Stage 1 pending item (109521/109522 to Submit/upload against directly;
// 109529 needs a Stage 2 item, which can only ever be originated by a Stage 1 Submit in the first
// place). Root cause: Open Progress Report — the only in-app action that originates new Stage 1 items
// — remains confirmed inert (see epm-open-progress-report-inert), and no live Stage 1 item has existed
// at any point this session (re-confirmed repeatedly, see epm-workflow-inbox-item-locked-down and
// epm-audit-trail-suite-109532-remainder). This is a PERMANENT blocker, not a transient data-volume
// one like the later stages — unlike Stage 3/4/5/6 (see epm-stage3/4/5/6-*-confirmed-working), where
// live items exist because they were already advanced past Stage 1 before this session began, no
// mechanism exists to create a NEW Stage 1 item at all.
//
// Suite 109529 (Stage 2) specifically: by strong analogy to the confirmed-working mechanism at every
// later stage (3, 4, 5, 6 all independently confirmed this session), the Stage 2 Support review action
// itself is very likely equally sound — but this was not independently reproduced, since no live
// Stage 2 item existed at a stable moment to test against (the 2 live items observed this session
// transited through Stage 2 to Stage 3 within the same session, too quickly to reliably automate).

const BASE = 'https://pd-epm-adminportal-qa-wf.shesha.app';
const WF_API = 'https://pd-epm-api-qa-wf.shesha.app';
const SLOW = 420_000;

test.describe('EPM — Stage 1 origination permanently blocked (ADO plan 108745 / suites 109521, 109522, 109529)', () => {
  test('TC-108791/850/851/852, TC-108790/847/848/849, TC-108792/853/854/855 — blocked: no live Stage 1 item can ever be originated', async ({ page }) => {
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
        try {
          const parsed = JSON.parse(value);
          if (parsed && typeof parsed.accessToken === 'string') return parsed.accessToken;
        } catch { /* not JSON */ }
      }
      return null;
    });
    const auth = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

    const inboxResp = await (await page.request.get(`${WF_API}/api/dynamic/Shesha.Workflow/WorkflowInboxItem/Crud/GetAll?maxResultCount=50`, { headers: auth })).json();
    const items = inboxResp?.result?.items ?? [];
    const stage1Items = items.filter((i: any) => /capture|submit/i.test(i.actionText ?? ''));
    const stage2Items = items.filter((i: any) => /support/i.test(i.actionText ?? ''));
    console.log(`PRECONDITION ACTUAL — tenant-wide inbox: ${items.length} items. Stage 1 items: ${stage1Items.length}. Stage 2 items: ${stage2Items.length}.`);
    expect.soft(stage1Items.length, 'EXPECTED: a live Stage 1 item should exist to Submit/upload POE against — PERMANENTLY BLOCKED: Open Progress Report (the only way to originate one) is confirmed inert, no live Stage 1 item has existed at any point this session').toBeGreaterThan(0);
    expect.soft(stage2Items.length, 'EXPECTED: a live Stage 2 item should exist for the Support review case — not currently available; mechanism itself is very likely sound by analogy to confirmed-working Stages 3/4/5/6').toBeGreaterThan(0);
  });
});
