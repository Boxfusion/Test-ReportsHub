/**
 * Shared PMDS Contracting helpers.
 *
 * Not a spec (testMatch only picks up *.spec.ts) — this is the selector layer for
 * contracting-lifecycle.spec.ts. Selectors were captured live against
 * SaGov.Pmds/sagov-performanceagreement-wf-draftperformanceagreement v52 on 2026-08-02.
 */
import { Page, expect } from '@playwright/test';

export const APP = 'https://pd-hcm-adminportal-qa.shesha.app';
export const INBOX = `${APP}/dynamic/Shesha.Workflow/workflows-inbox`;
export const CYCLE_ID = '7cf9054b-8c69-4313-ae5c-8039bf495c04';
export const CYCLE_URL =
  `${APP}/dynamic/SaGov.Pmds/sagov-cycle-details-view?id=${CYCLE_ID}` +
  `&name=SL%201-12%20Performance%20Agreement&fy=FY2026/27`;

export const DDG_CYCLE_ID = 'bd84d9b2-a30a-4605-aac3-19bb41f8c374';
export const DDG_CYCLE_URL =
  `${APP}/dynamic/SaGov.Pmds/sagov-cycle-details-view?id=${DDG_CYCLE_ID}` +
  `&name=Deputy%20Director%20General%20Performance%20Agreement&fy=FY2026/27`;

export const CDD_CYCLE_ID = '5f250b11-b86c-4b5e-b239-a9246fc525d3';
export const CDD_CYCLE_URL =
  `${APP}/dynamic/SaGov.Pmds/sagov-cycle-details-view?id=${CDD_CYCLE_ID}` +
  `&name=Chief%20Director/Director%20Performance%20Agreement&fy=FY2026/27`;

export const EMPLOYEE_PWD = '123qwe';

/** The draft wizard is slow and gives no spinner on step transitions — waits are generous on purpose. */
const STEP_WAIT = 5000;

// ---------------------------------------------------------------- auth / navigation

export async function login(page: Page, user: string, pwd = EMPLOYEE_PWD) {
  await page.goto(`${APP}/login`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2500);
  await page.getByRole('textbox').first().fill(user);
  await page.locator('input[type="password"]').first().fill(pwd);
  await page.getByRole('button', { name: /login|sign in/i }).first().click();
  await page.waitForURL((u) => !u.pathname.includes('/login'), { timeout: 60_000 });
  await page.waitForTimeout(4000);
}

export async function logout(page: Page) {
  await page.context().clearCookies();
  await page.goto(`${APP}/login`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);
}

export type InboxRow = { cells: string[]; href: string | null; text: string };

export async function openInbox(page: Page) {
  await page.goto(INBOX, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(8000);
}

export async function inboxRows(page: Page): Promise<InboxRow[]> {
  return page.evaluate(() => {
    const out: { cells: string[]; href: string | null; text: string }[] = [];
    document.querySelectorAll('.ant-table-row, [role="row"]').forEach((r) => {
      const cells = Array.from(r.querySelectorAll('td, [role="cell"], [role="gridcell"]')).map((c) =>
        (c as HTMLElement).innerText.trim(),
      );
      if (!cells.length) return;
      const a = r.querySelector('a[href]');
      out.push({
        cells,
        href: a ? a.getAttribute('href') : null,
        text: (r as HTMLElement).innerText.trim().replace(/\s+/g, ' '),
      });
    });
    return out;
  });
}

/** Poll the inbox until a row matching `match` appears (workflow routing is async). */
export async function waitForInboxRow(page: Page, match: RegExp, timeoutMs = 120_000): Promise<InboxRow> {
  const deadline = Date.now() + timeoutMs;
  let seen: string[] = [];
  while (Date.now() < deadline) {
    await openInbox(page);
    const rows = await inboxRows(page);
    seen = rows.map((r) => r.text);
    const hit = rows.find((r) => match.test(r.text));
    if (hit) return hit;
    await page.waitForTimeout(6000);
  }
  throw new Error(`No inbox row matching ${match} within ${timeoutMs}ms. Saw:\n${seen.join('\n')}`);
}

export async function openTask(page: Page, row: InboxRow) {
  if (!row.href) throw new Error(`Inbox row has no action link: ${row.text}`);
  await page.goto(`${APP}${row.href}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(10_000);
}

// ---------------------------------------------------------------- wizard plumbing

export async function activeStep(page: Page): Promise<string> {
  const t = await page.evaluate(
    () => (document.querySelector('.ant-steps-item-active') as HTMLElement | null)?.innerText || '?',
  );
  return t.replace(/\s+/g, ' ').trim();
}

export const nextBtn = (page: Page) => page.getByRole('button', { name: 'Next', exact: true });

/** Click Next until the active step matches, or throw. Tolerates the wizard's laggy transitions. */
export async function gotoStep(page: Page, match: RegExp, maxClicks = 8) {
  for (let i = 0; i < maxClicks; i++) {
    if (match.test(await activeStep(page))) return;
    await nextBtn(page).click({ timeout: 20_000 }).catch(() => {});
    await page.waitForTimeout(STEP_WAIT);
  }
  if (!match.test(await activeStep(page))) {
    throw new Error(`Could not reach step ${match}; stuck on "${await activeStep(page)}"`);
  }
}

/** Read the labelled value from the Confirm Details / Summary detail panes. */
export async function detailValue(page: Page, label: string): Promise<string> {
  return page.evaluate((lbl) => {
    const nodes = Array.from(document.querySelectorAll('*')).filter(
      (e) => e.children.length === 0 && (e.textContent || '').trim() === lbl,
    );
    for (const n of nodes) {
      let box: Element | null = n;
      for (let i = 0; i < 5 && box; i++) {
        const t = (box as HTMLElement).innerText.trim();
        if (t.startsWith(lbl) && t.length > lbl.length) {
          return t.slice(lbl.length).trim().split('\n')[0].trim();
        }
        box = box.parentElement;
      }
    }
    return '';
  }, label);
}

// ---------------------------------------------------------------- scoring step

export type Kra = { name: string; weight: string; principle: string };

const kraTable = (page: Page) => page.locator('.sha-react-table').nth(0);
const gafTable = (page: Page) => page.locator('.sha-react-table').nth(1);

async function pickDropdownOption(page: Page, text: string) {
  const opt = page
    .locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option')
    .filter({ hasText: text })
    .first();
  await opt.waitFor({ state: 'visible', timeout: 15_000 });
  await opt.click();
  await page.waitForTimeout(500);
}

export async function kraRows(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const t = document.querySelectorAll('.sha-react-table')[0];
    if (!t) return [];
    return Array.from(t.querySelectorAll('.tr-body'))
      .map((r) => (r as HTMLElement).innerText.trim().replace(/\s+/g, ' '))
      .filter(Boolean);
  });
}

/** Sum of the "NN%" weights currently in the KRA table. */
export async function kraWeightTotal(page: Page): Promise<number> {
  const rows = await kraRows(page);
  return rows.reduce((sum, r) => {
    const m = r.match(/(\d+)%/);
    return sum + (m ? Number(m[1]) : 0);
  }, 0);
}

export async function addKra(page: Page, kra: Kra) {
  const newRow = page.locator('.sha-new-row');
  await newRow.locator('input[type="text"]').first().fill(kra.name);
  await page.waitForTimeout(400);
  const selects = newRow.locator('.ant-select');
  await selects.nth(0).click();
  await pickDropdownOption(page, kra.weight);
  await selects.nth(1).click();
  await pickDropdownOption(page, kra.principle);
  await newRow.locator('button[title="Add"]').click();
  await page.waitForTimeout(2500);
}

/** Add only the KRAs that aren't already on the draft (keeps the spec re-runnable). */
export async function ensureKras(page: Page, kras: Kra[]) {
  for (const k of kras) {
    const rows = await kraRows(page);
    if (rows.some((r) => r.includes(k.name))) continue;
    await addKra(page, k);
  }
}

export async function gafState(page: Page): Promise<{ text: string; checked: boolean }[]> {
  return page.evaluate(() => {
    const t = document.querySelectorAll('.sha-react-table')[1];
    if (!t) return [];
    return Array.from(t.querySelectorAll('.tr-body')).map((r) => ({
      text: (r as HTMLElement).innerText.trim().replace(/\s+/g, ' ').slice(0, 60),
      checked: !!(r.querySelector('input[type="checkbox"]') as HTMLInputElement | null)?.checked,
    }));
  });
}

export async function gafCheckedCount(page: Page): Promise<number> {
  return (await gafState(page)).filter((g) => g.checked).length;
}

/**
 * Tick GAFs until `target` are checked. Ticked by row position, not by name: the GAF grid is
 * paged (10 rows at a time out of a larger set) and the visible names differ between loads.
 */
export async function tickGafs(page: Page, target = 4): Promise<string[]> {
  const ticked: string[] = [];
  for (let guard = 0; guard < target + 6; guard++) {
    const st = await gafState(page);
    if (st.filter((g) => g.checked).length >= target) break;
    const idx = st.findIndex((g) => !g.checked);
    if (idx < 0) throw new Error('No unchecked GAF left on this page');
    await gafTable(page).locator('.tr-body').nth(idx).locator('input[type="checkbox"]').check({ force: true });
    ticked.push(st[idx].text);
    await page.waitForTimeout(1500);
  }
  return ticked;
}

// ---------------------------------------------------------------- workplan step

export type KeyActivity = {
  activity: string;
  target: string;
  timeframe: string;
  targetDate: string;
  resource: string;
  enabling: string;
  evidence: string;
};

export async function keyActivityCount(page: Page, kraIndex: number): Promise<number> {
  return page.evaluate((i) => {
    const tables = Array.from(document.querySelectorAll('.sha-react-table'));
    const t = tables[i];
    if (!t) return 0;
    return Array.from(t.querySelectorAll('.tr-body')).filter((r) => (r as HTMLElement).innerText.trim()).length;
  }, kraIndex);
}

export async function addKeyActivity(page: Page, kraIndex: number, a: KeyActivity) {
  await page.getByRole('button', { name: 'Add Key Activity' }).nth(kraIndex).click();
  await page.waitForTimeout(4500);
  const modal = page.locator('.ant-modal-content').last();
  const tas = modal.locator('textarea');
  await tas.nth(0).fill(a.activity);
  await tas.nth(1).fill(a.target);
  await modal.locator('.ant-select').first().click();
  await pickDropdownOption(page, a.timeframe);
  const date = modal.locator('input[placeholder="Select date"]').first();
  await date.click();
  await date.fill(a.targetDate);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(800);
  await tas.nth(2).fill(a.resource);
  await tas.nth(3).fill(a.enabling);
  await tas.nth(4).fill(a.evidence);
  await modal.getByRole('button', { name: 'Add', exact: true }).click();
  await modal.waitFor({ state: 'detached', timeout: 30_000 }).catch(() => {});
  await page.waitForTimeout(3000);
}

/** How many "Add Key Activity" buttons — i.e. how many KRA sections the workplan step rendered. */
export async function workplanKraCount(page: Page): Promise<number> {
  return page.getByRole('button', { name: 'Add Key Activity' }).count();
}

/** Rows currently listed under the nth KRA section of the workplan step. */
export async function workplanRows(page: Page, kraIndex: number): Promise<string[]> {
  return page.evaluate((i) => {
    const tables = Array.from(document.querySelectorAll('.sha-react-table'));
    const t = tables[i];
    if (!t) return [];
    return Array.from(t.querySelectorAll('.tr-body'))
      .map((r) => (r as HTMLElement).innerText.trim().replace(/\s+/g, ' '))
      .filter(Boolean);
  }, kraIndex);
}

// ---------------------------------------------------------------- PDP step

export async function addPdp(page: Page, commencementDate: string) {
  await page.getByRole('button', { name: 'Add PDP' }).first().click();
  await page.waitForTimeout(4500);
  const modal = page.locator('.ant-modal-content').last();
  // Development Area + Types of intervention are both lookup selects; take the first option of each.
  for (const i of [0, 1]) {
    await modal.locator('.ant-select').nth(i).click();
    await page.waitForTimeout(1200);
    await page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option').first().click();
    await page.waitForTimeout(600);
  }
  const date = modal.locator('input[placeholder="Select date"]').first();
  await date.click();
  await date.fill(commencementDate);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(800);
  await modal.getByRole('button', { name: 'Add', exact: true }).click();
  await modal.waitFor({ state: 'detached', timeout: 30_000 }).catch(() => {});
  await page.waitForTimeout(3000);
}

export async function pdpRows(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const t = document.querySelectorAll('.sha-react-table')[0];
    if (!t) return [];
    return Array.from(t.querySelectorAll('.tr-body'))
      .map((r) => (r as HTMLElement).innerText.trim().replace(/\s+/g, ' '))
      .filter(Boolean);
  });
}

/**
 * DDG and CD/D employees arrive with a pre-seeded PDP row (e.g. "Service Delivery Improvement /
 * Coal-face Deployment to Service Site") whose Commencement Date is empty. Next silently stays
 * disabled until it's set — there is no error text (see observations/2026-08-11-ddg-draft-wizard-feedback.md,
 * downgraded from a defect to by-design). The row is read-only in the grid; the only affordance is
 * a small search icon that opens a details modal (SaGov.Pmds/details-performance-development-area)
 * with Development Area, Types of intervention and Commencement Date, plus Close/Delete/Save.
 * By design the user must ALSO add their own PDP via `addPdp` on top of this — completing the
 * pre-seeded row's date is necessary but not sufficient.
 */
export async function resolvePreSeededPdp(page: Page, commencementDate: string) {
  const preRow = page.locator('.sha-react-table').nth(0).locator('.tr-body').first();
  await preRow.locator('[aria-label="search"]').first().click();
  await page.waitForTimeout(3000);
  const modal = page.locator('.ant-modal-content').last();
  const date = modal.locator('input[placeholder="Select date"]').first();
  await date.click();
  await date.fill(commencementDate);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(800);
  await modal.getByRole('button', { name: 'Save', exact: true }).click();
  await modal.waitFor({ state: 'detached', timeout: 30_000 }).catch(() => {});
  await page.waitForTimeout(3000);
}

// ---------------------------------------------------------------- SMS (DDG / CD-D) scoring step
//
// DDG and CD/D share an SMS-specific draft form: the GAF table is replaced by a 5-row **Core
// Management Criteria** grid — Name | Process Competencies | Development Required — with exactly
// one checkbox per row (only the Name column can be flagged). The hint still says "min 4 or max 6"
// but only 5 rows exist, so the reachable max is 5. Confirmed live 2026-08-13: Next enables once 4
// of the 5 rows are ticked — same tick-by-position mechanic as `tickGafs`, just a smaller table.

export async function tickCmcs(page: Page, target = 4): Promise<number> {
  const table = page.locator('.sha-react-table').nth(1);
  const n = await table.locator('.tr-body').count();
  let ticked = 0;
  for (let i = 0; i < n && ticked < target; i++) {
    const box = table.locator('.tr-body').nth(i).locator('input[type="checkbox"]');
    if (!(await box.isChecked().catch(() => false))) {
      await box.check({ force: true });
      ticked++;
      await page.waitForTimeout(1200);
    }
  }
  return ticked;
}

/**
 * Confirm Details: DDG/CD-D employees whose supervisor is top-of-line get a blank Default
 * Mediator, which silently blocks Next (observations/2026-08-11-ddg-draft-wizard-feedback.md,
 * Blocker 1). Assigning an Alternative Mediator + reason unblocks it. Call only when
 * `detailValue(page, 'Default Mediator')` is empty.
 */
/**
 * Confirm Details has two "alternate" sections — Alternate Supervisor then Alternative Mediator —
 * each a select + its own Reason textarea, with no distinguishing text on the empty select itself
 * (so it can't be found by hasText). They're positional: the mediator's is the SECOND of each.
 */
export async function assignAlternativeMediator(page: Page, mediatorName: string, reason: string) {
  const select = page.locator('.ant-select').nth(1);
  await select.click();
  await page.waitForTimeout(1200);
  const opt = page
    .locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option')
    .filter({ hasText: mediatorName })
    .first();
  await opt.waitFor({ state: 'visible', timeout: 15_000 });
  await opt.click();
  await page.waitForTimeout(800);
  const reasonBox = page.locator('textarea').nth(1);
  await reasonBox.click();
  await reasonBox.fill(reason);
  await page.waitForTimeout(800);
}

// ---------------------------------------------------------------- summary / actions

export const submitBtn = (page: Page) => page.getByRole('button', { name: 'Submit', exact: true });

export async function attestationBoxes(page: Page) {
  return page.locator('input[type="checkbox"]');
}

/**
 * Tick the attestation/confirmation checkboxes that gate Submit.
 *
 * Only *visible* checkboxes are touched: the review and update screens also carry the GAF grid
 * inside collapsed tab panes, and those checkboxes are real inputs that must be left alone.
 */
export async function tickAttestations(page: Page): Promise<number> {
  const boxes = page.locator('input[type="checkbox"]');
  const n = await boxes.count();
  let ticked = 0;
  for (let i = 0; i < n; i++) {
    const box = boxes.nth(i);
    if (!(await box.isVisible().catch(() => false))) continue;
    await box.check({ force: true });
    ticked++;
    await page.waitForTimeout(1000);
  }
  await page.waitForTimeout(1500);
  return ticked;
}

/** Text of the workflow status pill on a task screen (DRAFT / REVIEW / HR REVIEW / …). */
export async function workflowStatus(page: Page): Promise<string> {
  return page.evaluate(() => {
    const body = document.body.innerText;
    const m = body.match(/\n(DRAFT|REVIEW|HR REVIEW|UNDER APPEAL|GENERATE PERSAL INPUT|COMPLETED)\n/i);
    return m ? m[1].toUpperCase() : '';
  });
}

/** Collect ant-design toasts/notifications raised since the spy was installed. */
export async function installToastSpy(page: Page) {
  await page.evaluate(() => {
    (window as any).__toasts = [];
    const push = (s: string) => {
      const v = s.trim().replace(/\s+/g, ' ');
      if (v) (window as any).__toasts.push(v);
    };
    new MutationObserver((muts) => {
      for (const m of muts)
        for (const n of Array.from(m.addedNodes)) {
          if (n.nodeType !== 1) continue;
          const el = n as HTMLElement;
          if (/ant-message-notice|ant-notification-notice/.test(el.className || '')) push(el.innerText);
          el.querySelectorAll?.('.ant-message-notice, .ant-notification-notice').forEach((e) =>
            push((e as HTMLElement).innerText),
          );
        }
    }).observe(document.body, { childList: true, subtree: true });
  });
}

export async function drainToasts(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const t = (window as any).__toasts || [];
    (window as any).__toasts = [];
    return t;
  });
}

/** Inline form errors currently rendered. */
export async function formErrors(page: Page): Promise<string[]> {
  return page.evaluate(() =>
    Array.from(document.querySelectorAll('.ant-form-item-explain-error, .ant-alert-error, .ant-alert-warning'))
      .map((e) => (e as HTMLElement).innerText.trim().replace(/\s+/g, ' '))
      .filter(Boolean),
  );
}

// ---------------------------------------------------------------- reviewer actions
// Supervisor Review screen (SaGov.Pmds review form): Close | Send back | Refer for Dispute |
// View In PDF | Sign, plus a single page-level comment textarea.

export const signBtn = (page: Page) => page.getByRole('button', { name: 'Sign', exact: true });
export const sendBackBtn = (page: Page) => page.getByRole('button', { name: /^Send back$/i });
export const referBtn = (page: Page) => page.getByRole('button', { name: /^Refer for Dispute$/i });
export const verifyBtn = (page: Page) => page.getByRole('button', { name: 'Verify', exact: true });
/** Tier-2 escalation screen ("Mediator Supervisor Review…") uses Approve, not Submit/Sign. */
export const approveBtn = (page: Page) => page.getByRole('button', { name: 'Approve', exact: true });

/** The page-level reviewer comment box needs a real click before typing (scripted fills don't register). */
export async function writeReviewComment(page: Page, comment: string) {
  const ta = page.locator('textarea').first();
  await ta.click();
  await ta.fill(comment);
  await page.waitForTimeout(800);
}

/** Open the Refer for Dispute confirm dialog without confirming. Returns the dialog locator. */
export async function openReferDialog(page: Page) {
  await referBtn(page).click();
  await page.waitForTimeout(4000);
  return page.locator('.ant-modal-content').last();
}

export async function dismissModal(page: Page) {
  const modal = page.locator('.ant-modal-content').last();
  const cancel = modal.getByRole('button', { name: /^(No|Cancel|Close)$/i }).first();
  if (await cancel.count()) await cancel.click();
  else await page.keyboard.press('Escape');
  await page.waitForTimeout(2500);
}

/** Refer for Dispute end-to-end: dialog -> comment -> Yes. */
export async function referForDispute(page: Page, comment: string) {
  const modal = await openReferDialog(page);
  await modal.locator('textarea').first().click();
  await modal.locator('textarea').first().fill(comment);
  await page.waitForTimeout(1200);
  await modal.getByRole('button', { name: 'Yes', exact: true }).click();
  await page.waitForTimeout(15_000);
}

/**
 * Send Back dialog (Shesha.Workflow/user-task-send-back v2). "Step" is not an ant-select but a
 * dropdown-trigger button whose menu renders in a body-level portal, listing the completed user
 * tasks the agreement can be returned to. Returns the step that was chosen.
 */
export async function sendBackTo(page: Page, comment: string): Promise<string> {
  await sendBackBtn(page).click();
  await page.waitForTimeout(4000);
  const modal = page.locator('.ant-modal-content').last();

  await modal.locator('button.user-task-select-button').first().click();
  await page.waitForTimeout(2500);
  const menuItem = page.locator('.ant-dropdown:not(.ant-dropdown-hidden) .ant-dropdown-menu-item').first();
  await menuItem.waitFor({ state: 'visible', timeout: 15_000 });
  const chosen = (await menuItem.getAttribute('title')) || (await menuItem.innerText()).split('\n')[0];
  await menuItem.click();
  await page.waitForTimeout(1500);

  await modal.locator('textarea').first().click();
  await modal.locator('textarea').first().fill(comment);
  await page.waitForTimeout(1000);
  await modal.getByRole('button', { name: 'OK', exact: true }).click();
  await page.waitForTimeout(15_000);
  return chosen.trim();
}

/** The steps the Send Back dialog offers, without sending anything back. */
export async function sendBackOptions(page: Page): Promise<string[]> {
  await sendBackBtn(page).click();
  await page.waitForTimeout(4000);
  await page.locator('.ant-modal-content').last().locator('button.user-task-select-button').first().click();
  await page.waitForTimeout(2500);
  return page.evaluate(() =>
    Array.from(document.querySelectorAll('.ant-dropdown:not(.ant-dropdown-hidden) .ant-dropdown-menu-item')).map(
      (e) => e.getAttribute('title') || (e as HTMLElement).innerText.split('\n')[0],
    ),
  );
}

// ---------------------------------------------------------------- mediator

// Mediator screen: SaGov.Pmds/sagov-performanceagreement-wf-mediatorreviewdisagreement...v46
// A "Dispute Resolution Outcome" radio pair, a page-level Comments note with its own Save, and
// (on the unresolved branch only) a "Mediator Dispute Resolution Outcome" sub-form carrying
// mandatory Comments + Attachments. Buttons: Close | Send back | View in PDF | Submit.

export const MEDIATION_RESOLVED = 'The disagreement has been resolved';
export const MEDIATION_NOT_RESOLVED = 'The disagreement has not been resolved';

export async function mediatorSelectOutcome(page: Page, outcome: string) {
  const radio = page.locator('.ant-radio-wrapper').filter({ hasText: outcome }).first();
  await radio.waitFor({ state: 'visible', timeout: 20_000 });
  await radio.click();
  await page.waitForTimeout(4000);
}

/** Capture the page-level mediation note and Save it (Save stays disabled until text is typed). */
export async function mediatorNote(page: Page, note: string) {
  const ta = page.locator('textarea').first();
  await ta.click();
  await ta.fill(note);
  await page.waitForTimeout(1200);
  const save = page.getByRole('button', { name: 'Save', exact: true }).first();
  if ((await save.count()) && (await save.isEnabled())) {
    await save.click();
    await page.waitForTimeout(6000);
  }
}

/** Resolved branch: outcome radio, mediation note, Submit. */
export async function mediatorResolve(page: Page, note: string) {
  await mediatorSelectOutcome(page, MEDIATION_RESOLVED);
  await mediatorNote(page, note);
  await submitBtn(page).first().click();
  await page.waitForTimeout(20_000);
}

/**
 * Unresolved branch: fills the mandatory outcome Comments and binds the mandatory attachment.
 *
 * The sub-form's Comments box is the last textarea on the page, but its Attachments control is
 * NOT the last file input — the page carries the agreement's own Supporting Documents input too,
 * and both are hidden behind ant-upload buttons. Rather than hard-code an index, bind each
 * candidate in turn and stop at the one that satisfies the form. Returns the index that worked.
 *
 * `gateBtn` defaults to Submit (the mediator's own screen); pass `approveBtn(page)` for the
 * tier-2 "Mediator Supervisor Review" screen, which gates on Approve instead.
 */
export async function mediatorOutcomeEvidence(
  page: Page,
  comment: string,
  filePath: string,
  gateBtn = submitBtn(page).first(),
): Promise<number> {
  const boxes = page.locator('textarea');
  const n = await boxes.count();
  await boxes.nth(n - 1).click();
  await boxes.nth(n - 1).fill(comment);
  await page.waitForTimeout(1500);

  const files = page.locator('input[type="file"]');
  const fileCount = await files.count();
  for (let i = 0; i < fileCount; i++) {
    await files.nth(i).setInputFiles(filePath).catch(() => {});
    await page.waitForTimeout(9000);
    if (await gateBtn.isEnabled().catch(() => false)) return i;
  }
  return -1;
}

/**
 * Tier-2 escalation ("Mediator Supervisor Review Disagreement and attempts to resolve") — the
 * mediator's own supervisor, reached only when the mediator selects "not resolved". Same outcome
 * radios as the mediator screen, but the terminal action is **Approve**, not Submit.
 */
export async function tier2Resolve(page: Page, note: string) {
  await mediatorSelectOutcome(page, MEDIATION_RESOLVED);
  await mediatorNote(page, note);
  await approveBtn(page).click();
  await page.waitForTimeout(15_000);
}

export async function tier2NotResolved(page: Page, comment: string, filePath: string): Promise<number> {
  await mediatorSelectOutcome(page, MEDIATION_NOT_RESOLVED);
  const idx = await mediatorOutcomeEvidence(page, comment, filePath, approveBtn(page));
  await approveBtn(page).click();
  await page.waitForTimeout(15_000);
  return idx;
}

/** Employee's "Update Performance Agreement with Outcomes" step after a resolved dispute. */
export async function updateWithOutcomes(page: Page) {
  await visitAllTabs(page);
  await tickAttestations(page);
  await submitBtn(page).first().click();
  await page.waitForTimeout(15_000);
}

/** Supervisor's "Review Updated Performance Agreement with Outcomes" — gates on Approve. */
export async function reviewUpdatedWithOutcomes(page: Page) {
  await visitAllTabs(page);
  await tickAttestations(page);
  const approve = approveBtn(page);
  if (await approve.count()) await approve.click();
  else await submitBtn(page).first().click();
  await page.waitForTimeout(15_000);
}

/** HR Verify — tick every visible confirmation checkbox, then Verify. */
export async function hrVerify(page: Page) {
  await tickAttestations(page);
  await verifyBtn(page).click();
  await page.waitForTimeout(15_000);
}

/** Visit every tab on a task screen so lazily-loaded panes hydrate (gates Submit on some forms). */
export async function visitAllTabs(page: Page) {
  const tabs = page.locator('.ant-tabs-tab');
  const n = await tabs.count();
  for (let i = 0; i < n; i++) {
    await tabs.nth(i).click();
    await page.waitForTimeout(3500);
  }
  if (n) await tabs.nth(0).click();
  await page.waitForTimeout(2500);
}

// ---------------------------------------------------------------- admin dashboard

export type StageCounters = { status: string; total: number; notStarted: number; inProgress: number; completed: number };

export async function contractingCounters(page: Page, cycleUrl = CYCLE_URL): Promise<StageCounters> {
  await page.goto(cycleUrl, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(9000);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(9000);
  return page.evaluate(() => {
    const text = document.body.innerText;
    const i = text.indexOf('Contracting');
    const seg = text.slice(i, text.indexOf('Mid Year Assessment', i));
    const nums = (seg.match(/^\s*(\d+)\s*$/gm) || []).map((s) => Number(s.trim()));
    const status = (seg.match(/NOT STARTED|IN PROGRESS|COMPLETED/) || [''])[0];
    return {
      status,
      total: nums[0] ?? -1,
      notStarted: nums[1] ?? -1,
      inProgress: nums[2] ?? -1,
      completed: nums[3] ?? -1,
    };
  });
}

// ---------------------------------------------------------------- fixtures

export const KRAS: Kra[] = [
  { name: 'Improve client service turnaround times', weight: '25%', principle: 'Service Standards' },
  { name: 'Increase accessibility of departmental services', weight: '25%', principle: 'Access' },
  { name: 'Maintain professional and courteous client engagement', weight: '25%', principle: 'Courtesy' },
  { name: 'Ensure cost effective use of departmental resources', weight: '25%', principle: 'Value for Money' },
];

export function keyActivity(kraIndex: number, n: number): KeyActivity {
  return {
    activity: `Key activity ${n} for KRA ${kraIndex + 1}`,
    target: `Target ${n}: 95% achievement measured quarterly`,
    timeframe: 'Quarterly',
    targetDate: '30/09/2026',
    resource: 'Departmental budget and case management system',
    enabling: 'Availability of system access and supervisor support',
    evidence: 'Quarterly performance report signed by supervisor',
  };
}

export async function expectStep(page: Page, match: RegExp) {
  expect(await activeStep(page)).toMatch(match);
}

/**
 * Drive an open Draft PA wizard from wherever it is through to Submit, filling anything not
 * already captured. Idempotent so a re-run resumes a part-built draft instead of duplicating rows.
 */
export async function completeDraftAndSubmit(page: Page) {
  await gotoStep(page, /Scoring/i);
  await ensureKras(page, KRAS);
  await tickGafs(page, 4);
  expect(await kraWeightTotal(page), 'KRA weight total').toBe(100);

  await gotoStep(page, /Workplan/i);
  for (let k = 0; k < 4; k++) {
    while ((await workplanRows(page, k)).length < 2) {
      const n = (await workplanRows(page, k)).length + 1;
      await addKeyActivity(page, k, keyActivity(k, n));
    }
  }

  await gotoStep(page, /Personal Development/i);
  if ((await pdpRows(page)).length < 1) await addPdp(page, '30/09/2026');

  await gotoStep(page, /Completed Summary/i);
  await tickAttestations(page);
  expect(await submitBtn(page).isEnabled(), 'Submit enabled after attestations').toBe(true);
  await submitBtn(page).click();
  await page.waitForTimeout(15_000);
}

/**
 * SMS variant of `completeDraftAndSubmit` for DDG and CD/D: Core Management Criteria (5 rows, tick
 * 4) instead of the 10-GAF grid, and a pre-seeded PDP row (resolve its Commencement Date) on top of
 * the employee's own PDP. On Confirm Details, if the Default Mediator is blank (top-of-line
 * supervisor), pass `altMediator` + a reason to unblock it — otherwise leave both undefined.
 */
export async function completeSmsDraftAndSubmit(
  page: Page,
  opts: { altMediator?: string; altMediatorReason?: string } = {},
) {
  if (opts.altMediator && /Confirm Details/i.test(await activeStep(page))) {
    // `detailValue` can't reliably distinguish "blank" from the next field's label when the
    // Default Mediator name/position/salary-level are all empty — so probe by attempting to
    // advance instead of trusting the read value.
    await nextBtn(page).click({ timeout: 20_000 }).catch(() => {});
    await page.waitForTimeout(STEP_WAIT);
    if (/Confirm Details/i.test(await activeStep(page))) {
      await assignAlternativeMediator(page, opts.altMediator, opts.altMediatorReason || 'Default mediator is blank.');
      await nextBtn(page).click({ timeout: 20_000 }).catch(() => {});
      await page.waitForTimeout(STEP_WAIT);
    }
  }
  await gotoStep(page, /Scoring/i);
  await ensureKras(page, KRAS);
  await tickCmcs(page, 4);
  expect(await kraWeightTotal(page), 'KRA weight total').toBe(100);

  await gotoStep(page, /Workplan/i);
  const kraCount = await workplanKraCount(page);
  for (let k = 0; k < kraCount; k++) {
    while ((await workplanRows(page, k)).length < 2) {
      const n = (await workplanRows(page, k)).length + 1;
      await addKeyActivity(page, k, keyActivity(k, n));
    }
  }

  await gotoStep(page, /Personal Development/i);
  const pre = await pdpRows(page);
  if (pre.length && !/\d{2}\/\d{2}\/\d{4}/.test(pre[0])) {
    await resolvePreSeededPdp(page, '31/08/2026');
  }
  if ((await pdpRows(page)).length < 2) await addPdp(page, '30/09/2026');

  await gotoStep(page, /Completed Summary/i);
  await tickAttestations(page);
  expect(await submitBtn(page).isEnabled(), 'Submit enabled after attestations').toBe(true);
  await submitBtn(page).click();
  await page.waitForTimeout(15_000);
}
