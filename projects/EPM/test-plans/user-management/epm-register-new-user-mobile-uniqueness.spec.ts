import { test, expect, type Page } from '@playwright/test';

// Derived artefact — the canonical source is epm-register-new-user-mobile-uniqueness.md, which mirrors
// ADO test case 109447 in suite 109504. Edit the .md (and the ADO case), not this file, except for
// AI-repair patches.

const BASE = 'https://pd-epm-adminportal-qa-wf.shesha.app';
// Must match BASE's host family — same GetAll host-mismatch pattern confirmed live 2026-08-27 across
// multiple specs in this suite. See epm-unit-of-measure-getall-host-mismatch memory.
const API = 'https://pd-epm-api-qa-wf.shesha.app';
const USER_CRUD = `${API}/api/dynamic/Shesha/User/Crud`;
const PERSON_CRUD = `${API}/api/dynamic/Shesha/Person/Crud`;

const TOKEN = process.env.TC447_TOKEN || `TC447-${Date.now()}`;
const DIGITS = TOKEN.replace(/\D/g, '');
const SHORT = DIGITS.slice(-6);
// ADO's literal precondition mobile (0821234567) does not exist in QA and hardcoding it would make the
// case non-repeatable across runs — see the .md's Preconditions note. A token-derived mobile is used for
// the baseline instead, then reused for the duplicate attempt in step 2.
const DUP_MOBILE = `06${DIGITS.slice(-8)}`;
const RETRY_MOBILE = `07${DIGITS.slice(-8)}`;

const BASELINE = {
  firstName: 'TC447Base',
  lastName: `User${SHORT}`,
  mobile: DUP_MOBILE,
  email: `tc447base.${DIGITS}@example.com`,
  username: `tc447base_${DIGITS}`,
  password: `Test@${SHORT}`,
};

const DUP_ATTEMPT = {
  firstName: 'TC447',
  lastName: `User${SHORT}`,
  mobile: DUP_MOBILE,
  email: `tc447.${DIGITS}@example.com`,
  username: `tc447_${DIGITS}`,
  password: `Test@${SHORT}`,
};

const SLOW = 420_000;
const RAW_CHANNEL = process.env.PW_CHANNEL === undefined ? 'chrome' : process.env.PW_CHANNEL;
const CHANNEL = RAW_CHANNEL === '' || RAW_CHANNEL === 'chromium' ? undefined : RAW_CHANNEL;

test.use({
  channel: CHANNEL,
  viewport: { width: 1920, height: 1080 },
  actionTimeout: 120_000,
  navigationTimeout: 120_000,
});

// Retry the whole flyout path: a hover landing before rc-menu hydrates is swallowed, and the flyout can
// close between the visibility check and the hover (antd then unmounts the popup, so a long-timeout hover
// stalls on a detached node). Short per-action timeouts fail fast and re-open.
// NOTE: `/^Administration$/` exact — this is the PLATFORM menu. The Epm child submenu is misspelt
// "Adminstration" and a loose match would hit the wrong one.
async function openViaAdministration(page: Page, linkName: string, expectedHref: string) {
  const admin = page.locator('.ant-menu-submenu-title').filter({ hasText: /^Administration$/ }).locator('visible=true').first();
  const link = page.getByRole('link', { name: linkName, exact: true }).locator('visible=true').first();
  for (let attempt = 1; attempt <= 8; attempt++) {
    try {
      await admin.hover({ force: true, timeout: 15_000 });
      await page.waitForTimeout(1_500);
      if (!(await link.isVisible().catch(() => false))) throw new Error(`"${linkName}" not revealed`);
      await expect(link).toHaveAttribute('href', expectedHref, { timeout: 15_000 });
      await link.click({ timeout: 15_000 });
      // See epm-register-new-user.spec.ts for why this is needed: the flyout only closes once the
      // cursor leaves its hover-trigger box, which a Playwright click alone never does.
      await page.mouse.move(960, 700);
      await page.waitForTimeout(500);
      return;
    } catch (e: any) {
      console.log(`  nav attempt ${attempt} failed: ${String(e.message).split('\n')[0].slice(0, 80)}`);
      await page.mouse.move(1_400, 900);
      await page.waitForTimeout(1_000);
    }
  }
  throw new Error(`could not reach "${linkName}" via Administration after 8 attempts`);
}

test.describe('EPM — User Management (ADO plan 108745 / suite 109504)', () => {
  test('TC-109447 Mobile number uniqueness enforced at server — duplicate rejected', async ({ page }) => {
    test.setTimeout(1_200_000);
    console.log(`RUN TOKEN — ${TOKEN}`);
    console.log(`  baseline/dup mobile=${DUP_MOBILE}  retry mobile=${RETRY_MOBILE}`);

    // PRECONDITION: signed in as administrator.
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
    const authed = { Authorization: `Bearer ${token}` };

    await openViaAdministration(page, 'User Management', '/dynamic/shesha/users');
    await expect(page).toHaveURL(/\/dynamic\/shesha\/users$/, { timeout: SLOW });
    const registerBtn = page.locator('.ant-btn').filter({ hasText: /Register New User/i }).first();
    await expect(registerBtn, 'the Add button should be labelled "Register New User"').toBeVisible({ timeout: SLOW });
    await expect(page.locator('.ant-spin-spinning')).toHaveCount(0, { timeout: SLOW });

    const modal = page.locator('.ant-modal-content').first();
    const field = (label: RegExp) =>
      modal.locator('.ant-form-item').filter({ has: page.locator('label').filter({ hasText: label }) })
        .locator('input, textarea').first();
    const passwordField = () => modal
      .locator('.ant-form-item')
      .filter({ has: page.locator('label').filter({ hasText: /^Password/i }) })
      .filter({ hasNotText: /Confirmation/i })
      .locator('input')
      .first();
    const confirmField = () => field(/^Password Confirmation/i);

    async function openModal() {
      // force: true — a Shesha dev-mode hover overlay ("View Definition" link) can intercept pointer
      // events on this button (confirmed live 2026-08-27 on the sibling password-mismatch spec).
      await registerBtn.click({ force: true });
      await expect(modal).toBeVisible({ timeout: SLOW });
      await expect(modal.locator('.ant-modal-title')).toHaveText('Register New User', { timeout: 60_000 });
      await expect(field(/^First Name/i)).toBeVisible({ timeout: 60_000 });
    }

    async function fillForm(u: typeof BASELINE) {
      await field(/^First Name/i).fill(u.firstName);
      await field(/^Last Name/i).fill(u.lastName);
      await field(/^Mobile Number/i).fill(u.mobile);
      await field(/^Email Address/i).fill(u.email);
      await field(/^Username/i).fill(u.username);
      await passwordField().fill(u.password);
      await confirmField().fill(u.password);
    }

    async function submitAndWaitPost() {
      const okButton = modal.getByRole('button', { name: /^OK$/ });
      const postPromise = page
        .waitForResponse((r) => r.request().method() === 'POST' && /User|Person|Register/i.test(r.url()), { timeout: 30_000 })
        .catch(() => null);
      await okButton.click();
      return postPromise;
    }

    // ── PRECONDITION / SETUP: create a baseline user holding a known mobile. ───
    await openModal();
    await fillForm(BASELINE);
    await page.screenshot({ path: 'projects/EPM/test-reports/2026-08-12/assets/tc447-01-baseline-filled.png', fullPage: true });
    const baselinePost = await submitAndWaitPost();
    if (baselinePost) {
      console.log(`SETUP — baseline POST ${baselinePost.status()} ${baselinePost.url()}`);
      expect(baselinePost.status(), 'baseline user registration should succeed').toBeLessThan(400);
    }
    await expect(modal, 'modal should close after baseline registration succeeds').toBeHidden({ timeout: 90_000 });
    console.log(`SETUP — baseline user created: ${BASELINE.username} mobile ${BASELINE.mobile}`);

    // ── STEP 2: Attempt to Register New User with the same mobile. ─────────────
    await expect(registerBtn).toBeVisible({ timeout: SLOW });
    await openModal();
    await fillForm(DUP_ATTEMPT);
    expect(await field(/^Mobile Number/i).inputValue(), 'the duplicate attempt must actually reuse the baseline mobile')
      .toBe(BASELINE.mobile);
    await page.screenshot({ path: 'projects/EPM/test-reports/2026-08-12/assets/tc447-02-dup-mobile-filled.png', fullPage: true });
    const dupPost = await submitAndWaitPost();

    let rejected = false;
    if (dupPost) {
      const status = dupPost.status();
      const body = await dupPost.text().catch(() => '');
      console.log(`STEP 2 — POST ${status} ${dupPost.url()}`);
      console.log(`STEP 2 — response: ${body.slice(0, 500)}`);
      let parsed: any = null;
      try { parsed = JSON.parse(body); } catch { /* not JSON */ }
      rejected = status >= 400 || parsed?.success === false;
    } else {
      console.log('STEP 2 — no matching POST observed within 30s');
    }
    // The server error may surface as a toast/notification rather than (or in addition to) a non-2xx /
    // success:false response body.
    const errorNotice = page.locator('.ant-message-notice, .ant-notification-notice')
      .filter({ hasText: /mobile|already|exist|unique|duplicate/i }).first();
    const noticeVisible = await errorNotice.isVisible({ timeout: 5_000 }).catch(() => false);
    if (noticeVisible) {
      console.log(`STEP 2 — error notice: "${(await errorNotice.innerText()).replace(/\s+/g, ' ').trim()}"`);
      rejected = true;
    }
    await page.screenshot({ path: 'projects/EPM/test-reports/2026-08-12/assets/tc447-03-dup-mobile-result.png', fullPage: true });

    // STEP 2 EXPECTED: Server rejects with unique-constraint error.
    expect(rejected, 'registering with a mobile already in use should be rejected').toBe(true);

    // Corroborate via API: exactly one Person should hold this mobile (the baseline).
    const afterDupAttempt = ((await (await page.request.get(`${PERSON_CRUD}/GetAll?maxResultCount=1000`, { headers: authed, timeout: SLOW })).json()).result?.items ?? []) as any[];
    const holders = afterDupAttempt.filter((p) => p.mobileNumber1 === DUP_MOBILE);
    console.log(`STEP 2 — persons holding mobile ${DUP_MOBILE}: ${holders.length}`);
    expect(holders.length, 'exactly one person should hold the duplicate-attempted mobile').toBe(1);

    // ── STEP 3: Change the mobile and retry. ────────────────────────────────────
    if (!(await modal.isVisible().catch(() => false))) {
      console.log('STEP 3 — modal closed after the rejected attempt; reopening and refilling');
      await expect(registerBtn).toBeVisible({ timeout: SLOW });
      await openModal();
      await fillForm(DUP_ATTEMPT);
    }
    await field(/^Mobile Number/i).fill(RETRY_MOBILE);
    expect(await field(/^Mobile Number/i).inputValue(), 'mobile field should now hold the changed value')
      .toBe(RETRY_MOBILE);
    await page.screenshot({ path: 'projects/EPM/test-reports/2026-08-12/assets/tc447-04-retry-mobile-changed.png', fullPage: true });
    const retryPost = await submitAndWaitPost();
    if (retryPost) {
      console.log(`STEP 3 — POST ${retryPost.status()} ${retryPost.url()}`);
      console.log(`STEP 3 — response: ${(await retryPost.text().catch(() => '')).slice(0, 500)}`);
      expect(retryPost.status(), 'retry with a changed mobile should succeed').toBeLessThan(400);
    } else {
      console.log('STEP 3 — no matching POST observed (checking outcome via search bar instead)');
    }

    // STEP 3 EXPECTED: Save succeeds.
    await expect(modal, 'modal should close on successful retry').toBeHidden({ timeout: 90_000 });
    const notice = page.locator('.ant-message-notice, .ant-notification-notice').first();
    if (await notice.isVisible({ timeout: 5_000 }).catch(() => false)) {
      console.log(`STEP 3 — toast: "${(await notice.innerText()).replace(/\s+/g, ' ').trim()}"`);
    } else {
      console.log('STEP 3 — no toast observed within 5s; verifying via search bar instead');
    }

    const search = page.locator('.ant-input-group-wrapper input').first();
    await expect(search, 'search bar should be present to verify the new user').toBeVisible({ timeout: SLOW });
    await search.fill(DUP_ATTEMPT.username);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(4_000);
    await expect(page.locator('.ant-spin-spinning')).toHaveCount(0, { timeout: SLOW });
    await expect(page.getByText(DUP_ATTEMPT.username, { exact: false }).first(), 'user row should be visible in the list after the successful retry')
      .toBeVisible({ timeout: SLOW });
    await page.screenshot({ path: 'projects/EPM/test-reports/2026-08-12/assets/tc447-05-row-in-list.png', fullPage: true });

    const after = ((await (await page.request.get(`${USER_CRUD}/GetAll?maxResultCount=1000`, { headers: authed, timeout: SLOW })).json()).result?.items ?? []) as any[];
    const created = after.find((u) => u.userName === DUP_ATTEMPT.username);
    expect(created, `User Crud GetAll should contain "${DUP_ATTEMPT.username}"`).toBeTruthy();
    console.log(`DONE — baseline ${BASELINE.username} (mobile ${DUP_MOBILE}); retry succeeded as ${DUP_ATTEMPT.username} (mobile ${RETRY_MOBILE}, user id ${created.id})`);
  });
});
