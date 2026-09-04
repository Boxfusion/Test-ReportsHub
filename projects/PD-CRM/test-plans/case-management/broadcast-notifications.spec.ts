// Broadcast Notifications — ADO suite 113517 (#113519–#113528), mirrored one-to-one from
// test-plans/case-management/broadcast-notifications.md. The .md plan is canonical; this spec is derived.
//
// 🛑 THIS SUITE SENDS REAL NOTIFICATIONS.
//   Target offers Global | Organisation Unit | Site. `Global` reaches EVERY user of the system.
//   Every publish in this file goes through `publishGuarded()`, which reads both select values back
//   immediately before clicking Publish and THROWS unless they are exactly
//   `Organisation Unit` / `Auto Testing Group`. There is no other path to the Publish button.
//
// 🛑 THIS SUITE MUTATES DATA.
//   TC-03 deletes, TC-04 edits, TC-05 withdraws. Each creates its OWN fixture first and
//   `assertSafeTarget()` refuses to act on any row whose title lacks the `QA-BC-` prefix. The list
//   holds 499 pre-existing broadcasts — that guard is what stands between this suite and them.
//
// Message volume: delivery options are enabled ONLY in TC-01 and TC-08 (the two cases whose ADO text
// requires them). Every other fixture publishes silently, so a full run does not fire a dozen SMS at a
// real handset.
//
// Known deviations (see the plan's "Deviations from the ADO text") — raised as BUG-601:
//   • #113521 steps 5-6 say "customer" / "Customers list" — copy-paste from suite 113324.
//   • #113521 step 4 promises Cancel/OK, step 5 says "Click Yes". Asserted SOFT.
//   • #113524's title is truncated ("erify …").
//   • #113526 step 2 and #113525 step 2 expect a screen that only appears after a further click.

import { test, expect, Page, Locator } from '@playwright/test';
import { switchToLatest } from '../_helpers';

const BASE = 'https://pd-dep-adminportal-qa.shesha.app';
const LIST_URL = `${BASE}/dynamic/Boxfusion.Dep/broad-cast-notificationstableView`;
const ADMIN = { user: 'Admin', password: 'P@ssword1' };

/** 🛑 The ONLY permitted audience for anything this suite publishes. */
const SAFE_TARGET = 'Organisation Unit';
const SAFE_GROUP = 'Auto Testing Group';
/**
 * The list grid renders the RAW ENUM `OrganisationUnit` (no space) while the create form shows the
 * friendly `Organisation Unit`. Same value, two spellings — assert list rows against this, and keep
 * the exact `SAFE_TARGET` comparison for the form, where the guard must stay strict.
 */
const TARGET_IN_LIST = /Organisation\s?Unit/;
/** Every broadcast this suite creates carries this prefix. Mutations are confined to it. */
const QA_PREFIX = 'QA-BC-';
const NO_MATCH_TERM = 'ZZQQNOSUCHBROADCAST9182734';

const stamp = () => `${Date.now()}`.slice(-6);

// ── locators ────────────────────────────────────────────────────────────────
// This grid is `.sha-table` / `.tr.tr-body` / `.td` — NOT ant-table. `.ant-table-row` matches nothing.
const ROW = '.sha-table .tr.tr-body';
const rows = (page: Page) => page.locator(ROW);
const searchBox = (page: Page) => page.locator('.sha-global-table-filter input').first();
const modal = (page: Page) => page.locator('.ant-modal-content:visible').first();

/**
 * A form item addressed by its label — the create form has no ids on its inputs.
 * ⚠️ The match must be EXACT (bar the required-marker asterisk). A `^Target` prefix also matches the
 * hidden **"Targeting Flag"** item, which sits earlier in the DOM, so `.first()` silently returns a
 * field that never becomes visible and the click times out looking like an app defect.
 */
const formItem = (scope: Locator, label: string) =>
  scope.locator('.ant-form-item')
    .filter({ has: scope.page().locator('label', { hasText: new RegExp(`^${label}\\s*\\*?$`) }) })
    .first();

const openOptions = (page: Page) =>
  page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option');

// ── actions ─────────────────────────────────────────────────────────────────
async function login(page: Page) {
  // The login page intermittently fails to paint; one reload clears it. Retrying the navigation stops a
  // network blip presenting as an application defect (it cost three false failures on 2026-09-03).
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
  // 🔑 PROJECT RULE: Live → Latest on every login. Throws rather than falling back to Live.
  await switchToLatest(page);
}

async function gotoBroadcasts(page: Page) {
  await page.goto(LIST_URL, { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('networkidle').catch(() => {});
  // Assert the GRID rendered — NOT that it holds rows. The Shesha grid persists its `quickSearch` in
  // localStorage, so a fresh navigation can legitimately restore a filter matching nothing. Demanding a
  // row failed TC-03 immediately after it deleted the very record it had searched for, which looked
  // like "the list stopped rendering" and was really "the search survived the navigation".
  await expect(page.locator('.sha-table').first(), 'the Broadcast Notifications grid should render')
    .toBeVisible({ timeout: 45_000 });
  await page.waitForTimeout(2_000);
  // Reset any persisted search so every case starts from the full list.
  const box = searchBox(page);
  if ((await box.count()) && (await box.inputValue().catch(() => '')).trim() !== '') await clearSearch(page);
  await page.waitForTimeout(1_500);
}

/** `1-10 of 499 items` → 499; `0 items found` → 0. */
async function totalItems(page: Page): Promise<number | null> {
  const text = (await page.locator('.ant-pagination').first().innerText().catch(() => '')).replace(/\s+/g, ' ');
  const of = text.match(/of\s+([\d\s]+?)\s+items/i);
  if (of) return Number(of[1].replace(/\s/g, ''));
  if (/0\s+items\s+found/i.test(text)) return 0;
  return null;
}

async function searchBroadcasts(page: Page, term: string) {
  const box = searchBox(page);
  await box.click();
  await box.fill('');
  await box.fill(term);
  await box.press('Enter');
  await page.waitForTimeout(4_500);
}

async function clearSearch(page: Page) {
  const box = searchBox(page);
  await box.click();
  await box.fill('');
  await box.press('Enter');
  await page.waitForTimeout(4_500);
}

const rowFor = (page: Page, title: string) => rows(page).filter({ hasText: title }).first();

/**
 * Choose an option in a Shesha `.ant-select`.
 *
 * ⚠️ The dropdown overlay LINGERS after the option click and intercepts the NEXT click
 * ("…option-content intercepts pointer events"), so it must be waited out.
 * ⚠️⚠️ Do NOT dismiss it with `Escape`. When no dropdown is open the key propagates to the ant Modal,
 * which closes the whole create form — the run then fails reading a field on a form that no longer
 * exists, and the a11y snapshot shows the plain list with no modal. Wait for the overlay to hide instead.
 */
async function chooseOption(page: Page, select: Locator, label: string) {
  await select.locator('.ant-select').first().click();
  await page.waitForTimeout(1_500);
  const search = select.locator('input[type="search"]').first();
  if (await search.count()) {
    await search.fill(label);
    await page.waitForTimeout(3_000);
  }
  await openOptions(page).filter({ hasText: new RegExp(`^${label}$`) }).first().click({ timeout: 15_000 });
  // Blur with Tab — NOT Escape (which closes the modal). Then wait for EVERY visible dropdown to go:
  // ant keeps overlays mounted, so checking a single `.first()` node can pass while another still
  // covers the next control.
  await page.keyboard.press('Tab');
  await expect(page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden)'),
    'the option overlay should close before the next control is clicked')
    .toHaveCount(0, { timeout: 10_000 });
  await page.waitForTimeout(1_000);
}

/**
 * The chosen value of a `.ant-select`.
 * ⚠️ Read `title`/`textContent`, NOT `innerText`. While the select holds focus ant-design hides the
 * `.ant-select-selection-item`, and `innerText` returns "" for a hidden element — which reads as "the
 * target was never set" when it demonstrably was. This value feeds the publish guard, so a false empty
 * here would block a legitimate publish (safe) — but the same trap inverted elsewhere would not be.
 */
const selectedValue = async (item: Locator) => {
  const el = item.locator('.ant-select-selection-item').first();
  if (!(await el.count())) return '';
  return ((await el.getAttribute('title')) || (await el.textContent()) || '').trim();
};

/** Open the create modal. ADO #113526 step 2 omits this click — see Deviation 4. */
async function openCreateForm(page: Page): Promise<Locator> {
  await page.locator('button:has-text("Create New Broadcast")').first().click();
  const dlg = modal(page);
  await expect(dlg, 'the Add New Broadcast Notification form should be displayed').toBeVisible({ timeout: 30_000 });
  await expect(dlg).toContainText(/Add New Broadcast Notification/i);
  await page.waitForTimeout(3_000);
  return dlg;
}

/**
 * 🛑 Point the broadcast at Auto Testing Group and nothing else.
 * The Organisation Unit select does not exist until Target is `Organisation Unit`, so this ordering is
 * load-bearing, not stylistic.
 */
async function setGuardedTarget(page: Page, dlg: Locator) {
  const target = formItem(dlg, 'Target');
  const group = formItem(dlg, 'Organisation Unit');

  await expect(group, 'the Organisation Unit field should be hidden until Target is chosen').toBeHidden();
  await chooseOption(page, target, SAFE_TARGET);
  // If the form vanished here, an Escape closed the modal — fail loudly rather than reading empty fields.
  await expect(dlg, 'the create form must still be open after choosing the Target').toBeVisible();
  await expect(group, 'choosing Organisation Unit should reveal the group field').toBeVisible({ timeout: 20_000 });
  await chooseOption(page, group, SAFE_GROUP);
  await expect(dlg, 'the create form must still be open after choosing the group').toBeVisible();
}

/**
 * 🛑 THE GUARD. Reads both values back from the DOM and refuses to publish anything that is not aimed
 * at Auto Testing Group. Throwing here fails one test; not throwing would notify the municipality.
 */
async function publishGuarded(page: Page, dlg: Locator) {
  const target = await selectedValue(formItem(dlg, 'Target'));
  const group = await selectedValue(formItem(dlg, 'Organisation Unit'));
  if (target !== SAFE_TARGET || group !== SAFE_GROUP) {
    throw new Error(
      `🛑 REFUSING TO PUBLISH — target="${target}" group="${group}". ` +
      `Only "${SAFE_TARGET}" / "${SAFE_GROUP}" may be published by this suite.`);
  }
  expect(target, 'the broadcast must be targeted at an Organisation Unit').toBe(SAFE_TARGET);
  expect(group, 'the broadcast must be targeted at Auto Testing Group ONLY').toBe(SAFE_GROUP);
  await dlg.locator('button:has-text("Publish")').first().click();
  await expect(dlg, 'the form should close on a successful publish').toBeHidden({ timeout: 60_000 });
  await page.waitForTimeout(5_000);
}

/** Message is a Jodit rich-text editor — a contenteditable, not a textarea. */
async function fillMessage(dlg: Locator, text: string) {
  const editor = dlg.locator('.jodit-wysiwyg').first();
  await expect(editor, 'the Message editor should be displayed').toBeVisible({ timeout: 20_000 });
  await editor.click();
  await editor.fill(text);
}

async function setDeliveryOption(dlg: Locator, label: 'Send Push' | 'Send Sms', on: boolean) {
  const box = formItem(dlg, label).locator('input[type="checkbox"]').first();
  if ((await box.isChecked()) !== on) await formItem(dlg, label).locator('.ant-checkbox-wrapper').first().click();
  expect(await box.isChecked(), `${label} should read ${on ? 'checked' : 'unchecked'}`).toBe(on);
}

/**
 * Create one broadcast aimed at Auto Testing Group.
 *
 * `sms` false ⇒ **push-only**, which keeps the tester's handset quiet. It is deliberately NOT
 * "no delivery options at all": BUG-602 — with both Send Push and Send Sms unchecked, **Publish does
 * nothing**. The modal stays open, no record is written, and no validation message is shown. Proven
 * 2026-09-04 by a controlled pair (both-off ⇒ no record; push-only ⇒ record created).
 */
async function createBroadcast(page: Page, title: string, message: string, sms: boolean) {
  const dlg = await openCreateForm(page);
  await formItem(dlg, 'Title').locator('input[type="text"]').first().fill(title);
  await setGuardedTarget(page, dlg);
  await fillMessage(dlg, message);
  await setDeliveryOption(dlg, 'Send Push', true); // always — a fixture with neither option cannot publish
  await setDeliveryOption(dlg, 'Send Sms', sms);
  await publishGuarded(page, dlg);
  console.log(`published "${title}" → ${SAFE_GROUP} (push ON, sms ${sms ? 'ON' : 'off'})`);
  return title;
}

/** 🛑 Never mutate a broadcast this suite did not create. */
function assertSafeTarget(title: string) {
  if (!title.startsWith(QA_PREFIX)) {
    throw new Error(`🛑 REFUSING to mutate "${title}" — only ${QA_PREFIX}* fixtures may be touched.`);
  }
  expect(title, 'destructive steps must act on this suite\'s own fixture').toContain(QA_PREFIX);
}

async function openDetails(page: Page, title: string) {
  await searchBroadcasts(page, title);
  const row = rowFor(page, title);
  await expect(row, `broadcast "${title}" should be present in the list`).toBeVisible({ timeout: 20_000 });
  await row.locator('.anticon-search').first().click();
  await page.waitForURL(/broad-cast-detailsView/, { timeout: 45_000 });
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.waitForTimeout(4_000);
}

// ── tests ───────────────────────────────────────────────────────────────────
test.describe('Broadcast Notifications (ADO 113517)', () => {
  // Most cases create their own fixture (login → create → publish → verify) before the case proper, so
  // the hub's 90s default is not enough.
  //
  // NOT `mode: 'serial'`. Every case builds its own fixture, so none depends on another — and under
  // serial a single failure SKIPS every later case (the first two runs reported "1 failed, 8 did not
  // run", which hides eight verdicts behind one unrelated defect). The config already pins
  // `workers: 1`, so execution is sequential regardless.
  test.describe.configure({ timeout: 300_000 });

  test('TC-01 (#113519): Verify Broadcast Notification Can Be Created', async ({ page }) => {
    // STEP 1: Log in to the Admin Portal using valid credentials.
    await login(page);
    // STEP 2: Navigate to Broadcast Notifications
    await gotoBroadcasts(page);
    const before = await totalItems(page);

    // STEP 3: Click the Create New Broadcase button.
    const dlg = await openCreateForm(page);

    // STEP 4: Type a valid notification title in the Title field.
    const title = `${QA_PREFIX}${stamp()} Create`;
    await formItem(dlg, 'Title').locator('input[type="text"]').first().fill(title);
    await expect(formItem(dlg, 'Title').locator('input[type="text"]').first(), 'the title should be accepted')
      .toHaveValue(title);

    // STEP 5: Select a valid option from the Target field  🛑 guarded
    await setGuardedTarget(page, dlg);
    expect(await selectedValue(formItem(dlg, 'Target')), 'the selected Target should be displayed').toBe(SAFE_TARGET);
    expect(await selectedValue(formItem(dlg, 'Organisation Unit'))).toBe(SAFE_GROUP);

    // STEP 6: Type a valid message in the Message field.
    await fillMessage(dlg, `QA broadcast ${title} — automated test, please ignore.`);

    // STEP 7: Check the required notification delivery option(s).
    await setDeliveryOption(dlg, 'Send Push', true);
    await setDeliveryOption(dlg, 'Send Sms', true);

    // STEP 8: Click Publish.
    await publishGuarded(page, dlg);

    // ASSERT (BLOCKING) the notification is added to the list
    await gotoBroadcasts(page);
    await searchBroadcasts(page, title);
    const row = rowFor(page, title);
    await expect(row, 'the published broadcast should appear in the Broadcast Notifications list')
      .toBeVisible({ timeout: 30_000 });
    const text = (await row.innerText()).replace(/\s+/g, ' ');
    expect(text, 'the row should show the Organisation Unit target').toMatch(TARGET_IN_LIST);
    console.log(`TC-01 row: ${text}`);
    console.log(`TC-01 total before=${before} after=${await totalItems(page)}`);
    console.log('TC-01 DELIVERY NOT VERIFIED — confirm two messages on the handset (group has 2 members).');
  });

  test('TC-02 (#113520): Verify Broadcast Notification Details Can Be Viewed', async ({ page }) => {
    await login(page);
    await gotoBroadcasts(page);

    // STEP 3: Locate a published Broadcast Notification (this suite's own, so the values are known).
    const title = `${QA_PREFIX}${stamp()} View`;
    const message = `QA view check ${title}`;
    await createBroadcast(page, title, message, false);
    await gotoBroadcasts(page);

    // STEP 4: Click the View icon for the Broadcast Notification.
    await openDetails(page, title);

    // STEP 5: Review the notification details.
    const body = (await page.locator('body').innerText()).replace(/\s+/g, ' ');
    expect(body, 'the configured title should be displayed').toContain(title);
    expect(body, 'the configured message should be displayed').toContain(message);
    expect(body, 'the target TYPE should be displayed').toContain(SAFE_TARGET);
    console.log(`TC-02 details url: ${page.url()}`);
    console.log(`TC-02 details text: ${body.slice(body.indexOf('Broadcast Details'), body.indexOf('Broadcast Details') + 400)}`);

    // ❓ QUESTION-601 (for the BA) — the details screen names the target TYPE ("Organisation Unit")
    // but never the AUDIENCE: "Auto Testing Group" appears nowhere in the whole page body. Whether
    // that fails ADO #113520 depends on the user story, which we do not have: step 5 requires the
    // "target" to display correctly, and the screen DOES show a Target field — `Organisation Unit` is
    // a separate field on the create form that ADO never names. So this is raised as a question, NOT
    // asserted as a defect. Do not convert it to an assertion without a BA decision.
    const audienceShown = body.includes(SAFE_GROUP);
    console.log(`TC-02 QUESTION-601 audience ("${SAFE_GROUP}") shown on details screen: ${audienceShown}`);

    // Settle the sub-question too: are the delivery options readable on this screen, or only as
    // checkbox state? `innerText` shows bare labels, which is not evidence either way.
    for (const label of ['Send Sms', 'Send Push']) {
      const boxes = page.locator('.ant-form-item').filter({ hasText: label }).locator('input[type="checkbox"]');
      const n = await boxes.count();
      const states: boolean[] = [];
      for (let i = 0; i < n; i++) states.push(await boxes.nth(i).isChecked().catch(() => false));
      console.log(`TC-02 details "${label}": ${n} checkbox(es), checked=${JSON.stringify(states)}`);
    }
  });

  test('TC-03 (#113521): Verify Broadcast Notification Can Be Deleted', async ({ page }) => {
    await login(page);
    await gotoBroadcasts(page);

    const title = `${QA_PREFIX}${stamp()} Delete`;
    await createBroadcast(page, title, `QA delete fixture ${title}`, false);
    await gotoBroadcasts(page);
    const before = await totalItems(page);

    // STEP 3: Locate the Broadcast Notification to be deleted.  🛑 fixture only
    assertSafeTarget(title);
    await searchBroadcasts(page, title);
    const row = rowFor(page, title);
    await expect(row).toBeVisible({ timeout: 20_000 });

    // STEP 4: Click the Delete icon.
    await row.locator('.anticon-delete').first().click();
    const dialog = page.locator('.ant-modal-confirm, .ant-modal-content:visible').last();
    await expect(dialog, 'a confirmation dialog should be displayed').toBeVisible({ timeout: 20_000 });
    const dialogText = (await dialog.innerText()).replace(/\s+/g, ' ');
    console.log(`TC-03 delete dialog: "${dialogText}"`);
    // SOFT — ADO promises "Are you sure you want to delete this item?" with Cancel/OK, then says
    // "Click Yes". See Deviation 2 (BUG-601). Recorded, not enforced.
    expect.soft(dialogText, 'ADO wording: "Are you sure you want to delete this item?"')
      .toMatch(/are you sure you want to delete this item\?/i);

    // STEP 5: Confirm. Accept whichever affirmative label the build actually renders.
    await dialog.locator('button').filter({ hasText: /^(OK|Yes)$/i }).first().click();
    await page.waitForTimeout(6_000);

    // STEP 6: Search for the deleted broadcast (ADO says "customer" — Deviation 1).
    await gotoBroadcasts(page);
    await searchBroadcasts(page, title);
    await expect(rowFor(page, title), 'the deleted broadcast should no longer be listed')
      .toHaveCount(0, { timeout: 20_000 });
    await clearSearch(page);
    const after = await totalItems(page);
    console.log(`TC-03 total before=${before} after=${after}`);
    if (before !== null && after !== null) expect(after, 'exactly one record should have been removed').toBe(before - 1);
  });

  test('TC-04 (#113522): Verify Broadcast Notification Can Be Edited', async ({ page }) => {
    await login(page);
    await gotoBroadcasts(page);

    const title = `${QA_PREFIX}${stamp()} Edit`;
    await createBroadcast(page, title, `QA edit fixture ${title}`, false);
    assertSafeTarget(title);
    await gotoBroadcasts(page);

    // STEP 4: Click the Edit icon.
    await searchBroadcasts(page, title);
    const row = rowFor(page, title);
    await expect(row).toBeVisible({ timeout: 20_000 });
    const edit = row.locator('.anticon-edit').first();
    // TODO[selector]: the list row exposed only search/delete during recon — if no edit icon exists on
    // the row, the edit affordance is on the details screen. AI-repair resolves on first run.
    if (await edit.count()) {
      await edit.click();
    } else {
      await openDetails(page, title);
      await page.locator('button:has-text("Edit")').first().click();
    }
    await page.waitForTimeout(6_000);

    const dlg = modal(page);
    const scope = (await dlg.count()) ? dlg : page.locator('body');
    // ADO step 4: "the edit form is displayed with the existing information populated"
    const titleInput = formItem(scope as Locator, 'Title').locator('input[type="text"]').first();
    await expect(titleInput, 'the edit form should be populated with the existing title')
      .toHaveValue(new RegExp(title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), { timeout: 20_000 });

    // STEP 5-6: Update the information and save.
    const updated = `${title} UPDATED`;
    await titleInput.fill(updated);
    await (scope as Locator).locator('button').filter({ hasText: /^(Save|Publish|OK|Update)$/i }).first().click();
    await page.waitForTimeout(7_000);

    // STEP 7: View the updated Broadcast Notification.
    await gotoBroadcasts(page);
    await searchBroadcasts(page, updated);
    await expect(rowFor(page, updated), 'the updated title should persist').toBeVisible({ timeout: 30_000 });
    const rowText = (await rowFor(page, updated).innerText()).replace(/\s+/g, ' ');
    expect(rowText, 'the target must still be the guarded Organisation Unit after an edit').toMatch(TARGET_IN_LIST);
    console.log(`TC-04 updated row: ${rowText}`);
  });

  test('TC-05 (#113523): Verify Broadcast Notification Can Be Withdrawn', async ({ page }) => {
    await login(page);
    await gotoBroadcasts(page);

    const title = `${QA_PREFIX}${stamp()} Withdraw`;
    await createBroadcast(page, title, `QA withdraw fixture ${title}`, false);
    assertSafeTarget(title);
    await gotoBroadcasts(page);

    // STEP 3: Locate and open a published Broadcast Notification.
    await openDetails(page, title);

    // STEP 4: Click Withdraw.
    const withdraw = page.locator('button:has-text("Withdraw")').first();
    await expect(withdraw, 'the details screen should offer Withdraw').toBeVisible({ timeout: 30_000 });
    await withdraw.click();
    const dialog = page.locator('.ant-modal-confirm, .ant-modal-content:visible').last();
    await expect(dialog, 'a Withdraw Notification dialog should be displayed').toBeVisible({ timeout: 20_000 });
    const dialogText = (await dialog.innerText()).replace(/\s+/g, ' ');
    console.log(`TC-05 withdraw dialog: "${dialogText}"`);
    expect.soft(dialogText, 'ADO wording: "Are you sure you want to withdraw the notification?"')
      .toMatch(/are you sure you want to withdraw the notification\?/i);

    // STEP 5: Click Yes.
    await dialog.locator('button').filter({ hasText: /^(Yes|OK)$/i }).first().click();
    await page.waitForTimeout(7_000);

    // STEP 6: Review — the Withdrawal Date should be populated.
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(6_000);
    const body = (await page.locator('body').innerText()).replace(/\s+/g, ' ');
    console.log(`TC-05 details after withdraw: ${body.slice(0, 600)}`);
    expect(body, 'the notification should reflect that it has been withdrawn')
      .toMatch(/withdraw(n|al)/i);
    expect(body, 'the Withdrawal Date should be populated (a date must appear)')
      .toMatch(/\d{2}\/\d{2}\/\d{4}/);
  });

  test('TC-06 (#113524): Verify Broadcast Notification Deletion Can Be Cancelled', async ({ page }) => {
    await login(page);
    await gotoBroadcasts(page);

    const title = `${QA_PREFIX}${stamp()} CancelDel`;
    await createBroadcast(page, title, `QA cancel-delete fixture ${title}`, false);
    assertSafeTarget(title);
    await gotoBroadcasts(page);
    const before = await totalItems(page);

    // STEP 4: Click the Delete icon.
    await searchBroadcasts(page, title);
    const row = rowFor(page, title);
    await expect(row).toBeVisible({ timeout: 20_000 });
    await row.locator('.anticon-delete').first().click();
    const dialog = page.locator('.ant-modal-confirm, .ant-modal-content:visible').last();
    await expect(dialog, 'a confirmation dialog should be displayed').toBeVisible({ timeout: 20_000 });

    // STEP 5: Click Cancel.
    await dialog.locator('button').filter({ hasText: /^(Cancel|No)$/i }).first().click();
    await page.waitForTimeout(5_000);
    await expect(dialog, 'the confirmation dialog should close').toBeHidden({ timeout: 20_000 });

    // ASSERT (BLOCKING) it was NOT deleted
    await gotoBroadcasts(page);
    await searchBroadcasts(page, title);
    await expect(rowFor(page, title), 'the broadcast must NOT have been deleted').toBeVisible({ timeout: 20_000 });
    await clearSearch(page);
    const after = await totalItems(page);
    console.log(`TC-06 total before=${before} after=${after}`);
    if (before !== null && after !== null) expect(after, 'the list total should be unchanged').toBe(before);
  });

  test('TC-07 (#113525): Verify Broadcast Notification Withdrawal Can Be Cancelled', async ({ page }) => {
    await login(page);
    await gotoBroadcasts(page);

    const title = `${QA_PREFIX}${stamp()} CancelWd`;
    await createBroadcast(page, title, `QA cancel-withdraw fixture ${title}`, false);
    assertSafeTarget(title);
    await gotoBroadcasts(page);

    // STEP 3: Open a published Broadcast Notification.
    await openDetails(page, title);
    const bodyBefore = (await page.locator('body').innerText()).replace(/\s+/g, ' ');

    // STEP 4: Click Withdraw.
    const withdraw = page.locator('button:has-text("Withdraw")').first();
    await expect(withdraw).toBeVisible({ timeout: 30_000 });
    await withdraw.click();
    const dialog = page.locator('.ant-modal-confirm, .ant-modal-content:visible').last();
    await expect(dialog, 'a Withdraw Notification dialog should be displayed').toBeVisible({ timeout: 20_000 });
    expect.soft((await dialog.innerText()).replace(/\s+/g, ' '), 'the dialog should offer No and Yes')
      .toMatch(/\bNo\b[\s\S]*\bYes\b|\bYes\b[\s\S]*\bNo\b/);

    // STEP 5: Click No.
    await dialog.locator('button').filter({ hasText: /^No$/i }).first().click();
    await page.waitForTimeout(5_000);
    await expect(dialog, 'the dialog should close').toBeHidden({ timeout: 20_000 });

    // ASSERT (BLOCKING) it was NOT withdrawn
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(6_000);
    const bodyAfter = (await page.locator('body').innerText()).replace(/\s+/g, ' ');
    expect(bodyAfter, 'the broadcast must NOT have been withdrawn').not.toMatch(/withdrawal date\s*:?\s*\d{2}\//i);
    console.log(`TC-07 status unchanged: ${bodyBefore.slice(0, 200) === bodyAfter.slice(0, 200)}`);
  });

  test('TC-08 (#113526): Verify Broadcast Notification Delivery Options Can Be Selected', async ({ page }) => {
    await login(page);
    // STEP 2: ADO expects the create form here; it only opens after the button — see Deviation 4.
    await gotoBroadcasts(page);
    const dlg = await openCreateForm(page);

    // STEP 3: Type a valid Title and select a valid Target.  🛑 guarded
    const title = `${QA_PREFIX}${stamp()} Delivery`;
    await formItem(dlg, 'Title').locator('input[type="text"]').first().fill(title);
    await setGuardedTarget(page, dlg);

    // STEP 4-5: Check Send SMS, then Send Push.
    await setDeliveryOption(dlg, 'Send Sms', true);
    await setDeliveryOption(dlg, 'Send Push', true);

    // STEP 6: Type a valid message.
    await fillMessage(dlg, `QA delivery-options check ${title} — automated test, please ignore.`);

    // STEP 7: Click Publish.
    await publishGuarded(page, dlg);

    await gotoBroadcasts(page);
    await searchBroadcasts(page, title);
    const row = rowFor(page, title);
    await expect(row, 'the broadcast should be published').toBeVisible({ timeout: 30_000 });
    const text = (await row.innerText()).replace(/\s+/g, ' ');
    console.log(`TC-08 row: ${text}`);
    expect(text, 'the row should record the Organisation Unit target').toMatch(TARGET_IN_LIST);
    // Cells: 0 search · 1 delete · 2 Message · 3 Send Sms · 4 Send Push · 5 Title · 6 Target · …
    const smsCell = (await row.locator('.td').nth(3).innerText()).trim();
    const pushCell = (await row.locator('.td').nth(4).innerText()).trim();
    console.log(`TC-08 Send Sms="${smsCell}" Send Push="${pushCell}"`);
    expect(`${smsCell}/${pushCell}`, 'both delivery options should read Yes').toBe('Yes/Yes');
    console.log('TC-08 DELIVERY NOT VERIFIED — confirm on the handset.');
  });

  test('TC-09 (#113527): Verify Broadcast Notifications Can Be Searched', async ({ page }) => {
    await login(page);
    await gotoBroadcasts(page);
    const total = await totalItems(page);
    expect(total, 'the list should hold records to search').toBeGreaterThan(0);

    // STEP 3-4: Search for a known title.
    // Cells are: 0 search · 1 delete · 2 Message · 3 Send Sms · 4 Send Push · 5 TITLE · 6 Target ·
    // 7 Valid From · 8 Valid To · 9 Withdrawal Date · 10 Status. Title is NOT the first column.
    const known = (await rows(page).first().locator('.td').nth(5).innerText()).trim();
    console.log(`TC-09 searching for "${known}" (of ${total} records)`);
    await searchBroadcasts(page, known);
    const narrowed = await totalItems(page);
    expect(narrowed, 'the list should narrow').not.toBeNull();
    expect(narrowed!, 'searching a known title should return fewer records than the full list')
      .toBeLessThan(total!);

    // STEP 5: every returned row should match
    const texts = (await rows(page).allInnerTexts()).map(t => t.replace(/\s+/g, ' '));
    for (const t of texts) {
      expect(t.toLowerCase(), `every result should match "${known}"`).toContain(known.toLowerCase().slice(0, 12));
    }

    // A deliberate no-match term returns nothing
    await searchBroadcasts(page, NO_MATCH_TERM);
    expect(await totalItems(page), 'a nonsense term should return no records').toBe(0);

    // Clearing restores the original total
    await clearSearch(page);
    expect(await totalItems(page), 'clearing the search should restore the full list').toBe(total);
  });

  test('TC-10 (#113528): Verify Broadcast Notifications Can Be Filtered', async ({ page }) => {
    await login(page);
    await gotoBroadcasts(page);
    const total = await totalItems(page);

    // A known Title to filter on. Cells: 0 search · 1 delete · 2 Message · 3 Send Sms · 4 Send Push ·
    // 5 TITLE · 6 Target · …
    const known = (await rows(page).first().locator('.td').nth(5).innerText()).trim();

    // STEP 3: Click the Filter icon.
    // ⚠️ It opens an INLINE right-hand sidebar panel (`.sha-index-table-column-filters`) — NOT a
    // dropdown, popover or modal. Waiting on those three is why this case first reported "the filter
    // options never appeared"; the panel was on screen the whole time.
    await page.locator('button[aria-label="filter"], button:has(.anticon-filter)').first().click();
    const panel = page.locator('.sha-index-table-column-filters').first();
    await expect(panel, 'the available filter options should be displayed').toBeVisible({ timeout: 20_000 });

    // STEP 4: Select the required filter criteria — filter the Title column by a known value.
    await panel.locator('.ant-select.columns-filter-selector').first().click();
    await page.waitForTimeout(2_500);
    await openOptions(page).filter({ hasText: /^Title$/ }).first().click();
    await page.keyboard.press('Tab');
    await page.waitForTimeout(3_000);
    const valueBox = panel.locator('input[placeholder="Filter Title"]').first();
    await expect(valueBox, 'choosing a column should reveal that column\'s filter input')
      .toBeVisible({ timeout: 15_000 });
    await valueBox.fill(known);

    // STEP 5: Apply the filter.
    await panel.locator('button:has-text("Apply")').first().click();
    await page.waitForTimeout(6_000);

    // STEP 6: Review — the list must actually narrow AND every row must satisfy the criterion.
    // Never pass on "a control exists" (the #113356 lesson).
    const after = await totalItems(page);
    console.log(`TC-10 filter Title contains "${known}": total ${total} → ${after}`);
    expect(after, 'applying a filter should produce a result set').not.toBeNull();
    expect(after!, 'the filtered list should be smaller than the full list').toBeLessThan(total!);
    const texts = (await rows(page).allInnerTexts()).map(t => t.replace(/\s+/g, ' '));
    expect(texts.length, 'the filter should still return the matching record').toBeGreaterThan(0);
    for (const t of texts) {
      expect(t, `every filtered row should contain "${known}"`).toContain(known);
    }
    await panel.locator('button:has-text("Clear")').first().click();
    await page.waitForTimeout(4_000);
  });
});
