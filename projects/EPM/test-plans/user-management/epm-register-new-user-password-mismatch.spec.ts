import { test, expect, type Page } from '@playwright/test';

// Derived artefact — the canonical source is epm-register-new-user-password-mismatch.md, which mirrors
// ADO test case 109446 in suite 109504. Edit the .md (and the ADO case), not this file, except for
// AI-repair patches.

const BASE = 'https://pd-epm-adminportal-qa-wf.shesha.app';
// Must match BASE's host family — same GetAll host-mismatch pattern confirmed live 2026-08-27 across
// multiple specs in this suite. See epm-unit-of-measure-getall-host-mismatch memory.
const API = 'https://pd-epm-api-qa-wf.shesha.app';
const USER_CRUD = `${API}/api/dynamic/Shesha/User/Crud`;

const TOKEN = process.env.TC446_TOKEN || `TC446-${Date.now()}`;
const DIGITS = TOKEN.replace(/\D/g, '');
const SHORT = DIGITS.slice(-6);

const USER = {
  firstName: 'TC446',
  lastName: `User${SHORT}`,
  mobile: `06${DIGITS.slice(-8)}`,
  email: `tc446.${DIGITS}@example.com`,
  username: `tc446_${DIGITS}`,
  password: `Test@${SHORT}`,
  wrongConfirm: `Test@${SHORT}X`,
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
  test('TC-109446 Reject Register New User when the two Password fields do not match', async ({ page }) => {
    test.setTimeout(1_200_000);
    console.log(`RUN TOKEN — ${TOKEN}`);
    console.log(`  username=${USER.username} email=${USER.email} mobile=${USER.mobile}`);

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

    // PRECONDITION: Register New User modal open, other 5 fields filled with unique values.
    await openViaAdministration(page, 'User Management', '/dynamic/shesha/users');
    await expect(page).toHaveURL(/\/dynamic\/shesha\/users$/, { timeout: SLOW });
    const registerBtn = page.locator('.ant-btn').filter({ hasText: /Register New User/i }).first();
    await expect(registerBtn, 'the Add button should be labelled "Register New User"').toBeVisible({ timeout: SLOW });
    await expect(page.locator('.ant-spin-spinning')).toHaveCount(0, { timeout: SLOW });
    // force: true — a Shesha dev-mode hover overlay ("View Definition" link) can intercept pointer
    // events on this button (confirmed live 2026-08-27), same pattern already handled elsewhere in
    // this suite's nav helpers.
    await registerBtn.click({ force: true });
    const modal = page.locator('.ant-modal-content').first();
    await expect(modal).toBeVisible({ timeout: SLOW });
    await expect(modal.locator('.ant-modal-title')).toHaveText('Register New User', { timeout: 60_000 });

    const field = (label: RegExp) =>
      modal.locator('.ant-form-item').filter({ has: page.locator('label').filter({ hasText: label }) })
        .locator('input, textarea').first();
    // Labels render as "Password\n*", so an anchored /^Password$/ never matches. Distinguish the two
    // password fields by excluding the Confirmation one instead of anchoring the text.
    const passwordField = modal
      .locator('.ant-form-item')
      .filter({ has: page.locator('label').filter({ hasText: /^Password/i }) })
      .filter({ hasNotText: /Confirmation/i })
      .locator('input')
      .first();
    const confirmField = field(/^Password Confirmation/i);
    await expect(field(/^First Name/i)).toBeVisible({ timeout: 60_000 });

    await field(/^First Name/i).fill(USER.firstName);
    await field(/^Last Name/i).fill(USER.lastName);
    await field(/^Mobile Number/i).fill(USER.mobile);
    await field(/^Email Address/i).fill(USER.email);
    await field(/^Username/i).fill(USER.username);
    await page.screenshot({ path: 'projects/EPM/test-reports/2026-08-12/assets/tc446-01-modal-open.png', fullPage: true });

    const okButton = modal.getByRole('button', { name: /^OK$/ });

    // ── STEP 2: Enter different values in Password and Password Confirmation. ──
    await passwordField.fill(USER.password);
    await confirmField.fill(USER.wrongConfirm);
    expect(await passwordField.inputValue(), 'the two password fields must actually differ')
      .not.toBe(await confirmField.inputValue());
    await confirmField.blur();

    const blockedPost = await page
      .waitForResponse((r) => r.request().method() === 'POST' && /User|Person|Register/i.test(r.url()), { timeout: 5_000 })
      .catch(() => null);
    await okButton.click();
    // Give the app a moment to either fire a request or render a validation message, then check both.
    await page.waitForTimeout(2_000);

    // STEP 2 EXPECTED: client-side validation rejects with "passwords must match".
    const mismatchError = modal.getByText(/password.*match|match.*password|passwords? (do not|don't) match/i).first();
    await expect(mismatchError, 'validation should report a password mismatch').toBeVisible({ timeout: 15_000 });
    console.log(`STEP 2 — validation message: "${(await mismatchError.innerText()).replace(/\s+/g, ' ').trim()}"`);
    await expect(modal, 'modal should remain open — submission blocked while mismatched').toBeVisible();
    expect(await blockedPost, 'no registration request should fire while passwords mismatch').toBeNull();
    await page.screenshot({ path: 'projects/EPM/test-reports/2026-08-12/assets/tc446-02-mismatch-error.png', fullPage: true });

    // ── STEP 3: Correct the confirmation. ───────────────────────────────────────
    await confirmField.fill(USER.password);
    expect(await passwordField.inputValue(), 'both password fields must match after correction')
      .toBe(await confirmField.inputValue());
    await page.screenshot({ path: 'projects/EPM/test-reports/2026-08-12/assets/tc446-03-corrected.png', fullPage: true });

    const postPromise = page
      .waitForResponse((r) => r.request().method() === 'POST' && /User|Person|Register/i.test(r.url()), { timeout: 180_000 })
      .catch(() => null);
    await okButton.click();
    const post = await postPromise;
    if (post) {
      console.log(`STEP 3 — POST ${post.status()} ${post.url()}`);
      console.log(`STEP 3 — response: ${(await post.text().catch(() => '')).slice(0, 500)}`);
      expect(post.status(), 'registration request should succeed once passwords match').toBeLessThan(400);
    } else {
      console.log('STEP 3 — no matching POST observed (checking outcome via search bar instead)');
    }

    // STEP 3 EXPECTED: Submit succeeds.
    await expect(modal, 'modal should close on successful submit').toBeHidden({ timeout: 90_000 });
    // Toast is best-effort — see epm-register-new-user.md's note; it does not reliably render on this env.
    const notice = page.locator('.ant-message-notice, .ant-notification-notice').first();
    if (await notice.isVisible({ timeout: 5_000 }).catch(() => false)) {
      console.log(`STEP 3 — toast: "${(await notice.innerText()).replace(/\s+/g, ' ').trim()}"`);
    } else {
      console.log('STEP 3 — no toast observed within 5s; verifying via search bar instead');
    }
    await page.screenshot({ path: 'projects/EPM/test-reports/2026-08-12/assets/tc446-04-after-ok.png', fullPage: true });

    const search = page.locator('.ant-input-group-wrapper input').first();
    await expect(search, 'search bar should be present to verify the new user').toBeVisible({ timeout: SLOW });
    await search.fill(USER.username);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(4_000);
    await expect(page.locator('.ant-spin-spinning')).toHaveCount(0, { timeout: SLOW });
    await expect(page.getByText(USER.username, { exact: false }).first(), 'new user row should be visible in the list')
      .toBeVisible({ timeout: SLOW });
    await page.screenshot({ path: 'projects/EPM/test-reports/2026-08-12/assets/tc446-05-row-in-list.png', fullPage: true });

    const after = ((await (await page.request.get(`${USER_CRUD}/GetAll?maxResultCount=1000`, { headers: authed, timeout: SLOW })).json()).result?.items ?? []) as any[];
    const created = after.find((u) => u.userName === USER.username);
    expect(created, `User Crud GetAll should contain "${USER.username}"`).toBeTruthy();
    console.log(`DONE — registered ${USER.username} after correcting the password mismatch (user id ${created.id})`);
  });
});
