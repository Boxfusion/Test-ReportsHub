// AUTO-RECORDED from test-plans/phase2/leads/lead-to-opportunity-lifecycle.md
// The .md plan is canonical. AI-repair will patch failing lines in this file.
// Do not hand-edit unless you are also updating the .md plan.
//
// NOT YET RECORDED LIVE against Phase 2 — this scaffold was authored from the mechanics
// documented in dev/leads/lead-to-opportunity-lifecycle.spec.ts, scoped down to Individual,
// Close Corporation and Private Company only. Every field/control locator below is marked
// // TODO[selector] and must be resolved by AI-repair (or a live /CreateTest recording pass)
// on first run against PHASE2_APP_URL.

import { test, expect, Page } from '@playwright/test';

const ROUTES = {
  leads: '/dynamic/LandBank.Crm/LBLead-table',
  leadDetails: '/dynamic/LandBank.Crm/LBLead-details',
  opportunities: '/dynamic/LandBank.Crm/LBOpportunity-table',
  oppDetails: '/dynamic/LandBank.Crm/LBOpportunity-details',
};

function credsFor(role: string) {
  const key = role.toUpperCase();
  const env = (process.env.TEST_ENV || '').toUpperCase();
  const pick = (suffix: string) =>
    (env ? process.env[`${env}_${key}_${suffix}`] : undefined) ?? process.env[`${key}_${suffix}`];
  const user = pick('USERNAME');
  const password = pick('PASSWORD');
  if (!user || !password) {
    throw new Error(
      `Missing credentials for role "${role}"${env ? ` in environment "${env}"` : ''}. Set ` +
      `${env ? `${env}_${key}_USERNAME / ${env}_${key}_PASSWORD` : `${key}_USERNAME / ${key}_PASSWORD`} ` +
      `in .env (copy .env.example) or as CI secrets — see CLAUDE.md → Credentials.`
    );
  }
  return { user, password };
}

async function loginAsRM(page: Page) {
  const { user, password } = credsFor('RM');
  await page.goto('/login');
  // STEP TC-01: TYPE the Username field with the Phase 2 RM username (from `.env`)
  await page.getByPlaceholder('Username').fill(user);
  // STEP TC-01: TYPE the Password field with the Phase 2 RM password (from `.env`)
  await page.getByPlaceholder('Password').fill(password);
  // STEP TC-01: CLICK Sign In (exact — collides with "Sign in with Microsoft")
  await page.getByRole('button', { name: 'Sign In', exact: true }).click();
  // STEP TC-01: WAIT for the app to redirect away from `/login`
  await page.waitForURL((url) => !url.href.includes('/login'), { timeout: 40000 });
  await page.waitForLoadState('networkidle').catch(() => {});
}

// TODO[selector]: form-field helpers assume the Dev label-for pattern holds on Phase 2 —
// unverified. Re-record against the live Add New Lead modal.
function fieldByLabel(page: Page, forId: string) {
  return page.locator(`.ant-form-item:has(> .ant-row > .ant-col.ant-form-item-label > label[for="${forId}"])`);
}

async function selectOption(page: Page, forId: string, optionTitle: string) {
  const item = fieldByLabel(page, forId);
  // TODO[selector]: Ant Design select trigger — confirm `.ant-select-selector` matches on Phase 2
  await item.locator('.ant-select-selector').click();
  await page.locator('.ant-select-item-option', { hasText: optionTitle }).first().click();
}

async function typeField(page: Page, forId: string, value: string) {
  await fieldByLabel(page, forId).locator('input, textarea').first().fill(value);
}

// Title and Preferred Communication are required selects on every variant that shows the Client
// Information block. Missing either leaves Save permanently disabled — confirmed live 2026-08-24
// (the root cause of the Save-timeout failures on the first live run).
async function fillClientInfoRequiredSelects(page: Page) {
  await selectOption(page, 'title', 'Mr');
  await selectOption(page, 'preferredCommunication', 'Email');
}

// The Individual + Landbank Branch "Upload Consent?" switch has NO `for` attribute of its own —
// its label is a standalone .ant-form-item whose full text is exactly "Upload Consent?", and the
// switch itself lives in the very next .ant-form-item sibling. Recorded live against Phase 2 on
// 2026-08-24 (same layout as Dev).
function individualConsentSwitch(page: Page) {
  return page.locator('.ant-modal .ant-form-item', { hasText: /^Upload Consent\?$/ })
    .locator('xpath=following-sibling::div[contains(@class,"ant-form-item")][1]')
    .locator('button[role="switch"]');
}

async function openNewLeadModal(page: Page) {
  await page.goto(ROUTES.leads);
  await page.waitForLoadState('networkidle').catch(() => {});
  // TODO[selector]: New Lead toolbar button
  await page.getByRole('button', { name: 'New Lead' }).click();
  // TODO[selector]: Add New Lead modal title
  await expect(page.getByRole('dialog')).toBeVisible({ timeout: 20000 });
}

async function saveLeadAndGetId(page: Page): Promise<string> {
  // TODO[selector]: Save button in the Add New Lead modal
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await page.waitForURL((url) => url.pathname === ROUTES.leadDetails, { timeout: 40000 });
  await page.waitForLoadState('networkidle').catch(() => {});
  return new URL(page.url()).searchParams.get('id') || '';
}

async function runPreScreeningAllPass(page: Page) {
  // TODO[selector]: Initiate Pre-Screening action on the lead details page
  await page.getByRole('button', { name: 'Initiate Pre-Screening' }).click();
  // TODO[selector]: Pre-Screening Assessment modal + 7 radio groups by ordinal position
  const yesNo = [true, true, true, false, false, true, true];
  const groups = page.locator('.ant-radio-group');
  for (let i = 0; i < yesNo.length; i++) {
    const label = yesNo[i] ? 'Yes' : 'No';
    await groups.nth(i).getByText(label, { exact: true }).click();
  }
  await page.getByRole('checkbox').click();
  // Submit's accessible name carries its icon prefix ("check Submit"), same pattern Dev recorded
  // for Opportunity action buttons — exact match on the bare label never resolves.
  await page.getByRole('button', { name: 'Submit' }).click();
  await page.waitForLoadState('networkidle').catch(() => {});
}

async function convertedOpportunityId(page: Page): Promise<string> {
  // The "Converted To Opportunity" text is the FIELD LABEL, not the link's accessible name — the
  // link itself is named after the lead (e.g. "AutoQAP2 IndivOnline"). Its href is the only
  // stable anchor, and only one such link exists on this page. Confirmed live 2026-08-24.
  const link = page.locator('a[href*="LBOpportunity-details"]').first();
  await link.click();
  await page.waitForURL((url) => url.pathname === ROUTES.oppDetails, { timeout: 40000 });
  await page.waitForLoadState('networkidle').catch(() => {});
  // The Opportunity details page renders its data async after networkidle resolves — wait for a
  // stable landmark (Application Type label) before returning, so callers don't race the content.
  await page.getByText('Application Type', { exact: true }).first().waitFor({ timeout: 30000 }).catch(() => {});
  return new URL(page.url()).searchParams.get('id') || '';
}

test.describe.configure({ retries: 1 });

test.describe('P2-LEAD-2.1 — Lead to Opportunity Lifecycle (Phase 2)', () => {
  test('TC-01: RM signs in on Phase 2', async ({ page }) => {
    await loginAsRM(page);
    expect(page.url()).not.toContain('/login');
    // TODO[selector]: side menu Leads / Opportunities items
    await expect(page.getByRole('link', { name: 'Leads', exact: true })).toBeVisible({ timeout: 25000 });
    await expect(page.getByRole('link', { name: 'Opportunities', exact: true })).toBeVisible({ timeout: 20000 });
  });

  test('TC-02: The run is pointed at Phase 2', async ({ page }) => {
    await loginAsRM(page);
    const expected = process.env.PHASE2_APP_URL;
    expect(expected, 'PHASE2_APP_URL must be set in .env').toBeTruthy();
    expect(new URL(page.url()).origin).toBe(new URL(expected as string).origin);
  });

  test('TC-03: Individual lead via Online Digital Channel converts to PERSONAL', async ({ page }) => {
    await loginAsRM(page);
    await openNewLeadModal(page);
    await selectOption(page, 'channel', 'Online Digital Channel');
    await selectOption(page, 'leadType', 'Individual (Individual)');
    await fillClientInfoRequiredSelects(page);
    await typeField(page, 'firstName', 'AutoQAP2');
    await typeField(page, 'lastName', 'IndivOnline');
    await selectOption(page, 'territory', 'Gauteng');
    await typeField(page, 'mobileNumber', '0820001101');
    await typeField(page, 'emailAddress', 'autoqap2.indivonline@example.com');
    await saveLeadAndGetId(page);
    await runPreScreeningAllPass(page);
    await convertedOpportunityId(page);
    // TODO[selector]: Application Type display field on the Opportunity
    await expect(page.getByText('Personal', { exact: true })).toBeVisible({ timeout: 25000 });
  });

  test('TC-04: Close Corporation lead via Online Digital Channel converts to ENTITY', async ({ page }) => {
    await loginAsRM(page);
    await openNewLeadModal(page);
    await selectOption(page, 'channel', 'Online Digital Channel');
    await selectOption(page, 'leadType', 'Close Corporation (Entity)');
    await expect(fieldByLabel(page, 'organisation')).toBeVisible({ timeout: 15000 });
    await fillClientInfoRequiredSelects(page);
    // First Name is required even for an Entity client type on this build — confirmed live
    // 2026-08-25 (its absence was the root cause of the Save timeout on first live run).
    await typeField(page, 'firstName', 'AutoQAP2');
    await typeField(page, 'organisation', 'AutoQAP2 Close Corp CC');
    await typeField(page, 'lastName', 'CloseCorpOnline');
    await selectOption(page, 'territory', 'Gauteng');
    await typeField(page, 'mobileNumber', '0820001103');
    await typeField(page, 'emailAddress', 'autoqap2.closecorponline@example.com');
    await saveLeadAndGetId(page);
    await runPreScreeningAllPass(page);
    await convertedOpportunityId(page);
    await expect(page.getByText('Entity', { exact: true })).toBeVisible({ timeout: 25000 });
  });

  test('TC-05: Private Company lead via Online Digital Channel converts to ENTITY', async ({ page }) => {
    await loginAsRM(page);
    await openNewLeadModal(page);
    await selectOption(page, 'channel', 'Online Digital Channel');
    // TODO[selector]: confirm the exact option title — Dev's plan does not exercise Private
    // Company, so this title is assumed from the branch-manual-document-upload matrix
    await selectOption(page, 'leadType', 'Private Company');
    await fillClientInfoRequiredSelects(page);
    await typeField(page, 'firstName', 'AutoQAP2');
    await typeField(page, 'organisation', 'AutoQAP2 Private Co Ltd');
    await typeField(page, 'lastName', 'PrivateCoOnline');
    await selectOption(page, 'territory', 'Gauteng');
    await typeField(page, 'mobileNumber', '0820001105');
    await typeField(page, 'emailAddress', 'autoqap2.privatecoonline@example.com');
    await saveLeadAndGetId(page);
    await runPreScreeningAllPass(page);
    await convertedOpportunityId(page);
    await expect(page.getByText('Entity', { exact: true })).toBeVisible({ timeout: 25000 });
  });

  test('TC-06: Individual lead via Landbank Branch, consent uploaded', async ({ page }) => {
    await loginAsRM(page);
    await openNewLeadModal(page);
    await selectOption(page, 'channel', 'Landbank Branch');
    await selectOption(page, 'leadType', 'Individual (Individual)');
    await individualConsentSwitch(page).click();
    // File input for the Individual "Upload Consent" control — the only file input rendered
    // on this variant, confirmed live 2026-08-24.
    await page.locator('input[type="file"]').first().setInputFiles('test-data/pdf-test.pdf');
    await page.getByRole('button', { name: 'Upload', exact: true }).click();
    // Non-blocking: see test-reports/bugs/2026-08-24-lead-to-opportunity-lifecycle-phase2.md —
    // on Phase 2 the Client Information block never reveals after Upload for this path (Dev's
    // build does reveal it), so Save can never enable here. Confirmed live via Playwright MCP,
    // re-entering valid Mobile/Email/ID did not change the outcome — this is a form-state defect,
    // not a selector issue. Flagged so a real fix turns this green automatically.
    const clientInfoRevealed = await fieldByLabel(page, 'firstName').isVisible({ timeout: 20000 }).catch(() => false);
    expect(clientInfoRevealed, 'BUG-P2-002: Client Information block should reveal after Upload — see test-reports/bugs/2026-08-24-lead-to-opportunity-lifecycle-phase2.md').toBeTruthy();
  });

  test('TC-07: Individual lead via Landbank Branch, consent via OTP', async ({ page }) => {
    await loginAsRM(page);
    await openNewLeadModal(page);
    await selectOption(page, 'channel', 'Landbank Branch');
    await selectOption(page, 'leadType', 'Individual (Individual)');
    await typeField(page, 'mobileNumber', '0820001202');
    await typeField(page, 'emailAddress', 'autoqap2.indivbranch.consentno@example.com');
    await typeField(page, 'idNumber', '8503155400083');
    await page.getByRole('button', { name: 'Request OTP' }).click();
    // Non-blocking: see test-reports/bugs/2026-08-24-lead-to-opportunity-lifecycle-phase2.md —
    // Phase 2's GenerateLeadOtp endpoint returns HTTP 500, so otpPin never appears. Confirmed live
    // via Playwright MCP (not a selector/plan issue). Flagged here so a real fix turns this green
    // rather than needing a plan edit.
    const otpRevealed = await fieldByLabel(page, 'otpPin').isVisible({ timeout: 15000 }).catch(() => false);
    expect(otpRevealed, 'BUG-P2-001: otpPin should appear after Request OTP — see test-reports/bugs/2026-08-24-lead-to-opportunity-lifecycle-phase2.md').toBeTruthy();
  });

  test('TC-08: Close Corporation lead via Landbank Branch, resolution + consent uploaded', async ({ page }) => {
    await loginAsRM(page);
    await openNewLeadModal(page);
    await selectOption(page, 'channel', 'Landbank Branch');
    await selectOption(page, 'leadType', 'Close Corporation (Entity)');
    // "Upload Resolution and Consent?" switch is directly labelled, unlike the Individual one.
    const resSwitch = fieldByLabel(page, 'uploadResAndConsent').locator('button[role="switch"]');
    await resSwitch.click();
    await typeField(page, 'signatoryIdNumber', '9207125001083');
    await typeField(page, 'companyRegistrationNumber', '2012/225386/07');
    // Each upload control's file input is scoped inside its own labelled field — confirmed live
    // 2026-08-24, more robust than ordinal indexing across the whole modal.
    await fieldByLabel(page, 'signatoryConsent').locator('input[type="file"]').setInputFiles('test-data/pdf-test.pdf');
    await fieldByLabel(page, 'resolution').locator('input[type="file"]').setInputFiles('test-data/pdf-test.pdf');
    await typeField(page, 'mobileNumber', '0820001203');
    await typeField(page, 'emailAddress', 'autoqap2.closecorpbranch.resyes@example.com');
    await page.getByRole('button', { name: 'Upload', exact: true }).click();
    await expect(fieldByLabel(page, 'firstName')).toBeVisible({ timeout: 20000 });
    await fillClientInfoRequiredSelects(page);
    await typeField(page, 'firstName', 'AutoQAP2');
    await typeField(page, 'lastName', 'CloseCorpBranchResYes');
    await selectOption(page, 'territory', 'Gauteng');
    const id = await saveLeadAndGetId(page);
    expect(id, 'lead should save and carry an id').toBeTruthy();
  });

  test('TC-09: Close Corporation lead via Landbank Branch, manual capture', async ({ page }) => {
    await loginAsRM(page);
    await openNewLeadModal(page);
    await selectOption(page, 'channel', 'Landbank Branch');
    await selectOption(page, 'leadType', 'Close Corporation (Entity)');
    await fillClientInfoRequiredSelects(page);
    await typeField(page, 'firstName', 'AutoQAP2');
    await typeField(page, 'lastName', 'CloseCorpBranchResNo');
    await typeField(page, 'organisation', 'AutoQAP2 Close Corp Branch CC');
    await selectOption(page, 'territory', 'Gauteng');
    await typeField(page, 'mobileNumber', '0820001204');
    await typeField(page, 'emailAddress', 'autoqap2.closecorpbranch.resno@example.com');
    const id = await saveLeadAndGetId(page);
    expect(id, 'lead should save and carry an id').toBeTruthy();
  });

  test('TC-10: Private Company lead via Landbank Branch, resolution + consent uploaded', async ({ page }) => {
    await loginAsRM(page);
    await openNewLeadModal(page);
    await selectOption(page, 'channel', 'Landbank Branch');
    await selectOption(page, 'leadType', 'Private Company');
    const resSwitch = fieldByLabel(page, 'uploadResAndConsent').locator('button[role="switch"]');
    await resSwitch.click();
    await typeField(page, 'signatoryIdNumber', '9207125001083');
    await typeField(page, 'companyRegistrationNumber', '2012/225386/07');
    await fieldByLabel(page, 'signatoryConsent').locator('input[type="file"]').setInputFiles('test-data/pdf-test.pdf');
    await fieldByLabel(page, 'resolution').locator('input[type="file"]').setInputFiles('test-data/pdf-test.pdf');
    await typeField(page, 'mobileNumber', '0820001205');
    await typeField(page, 'emailAddress', 'autoqap2.privatecobranch.resyes@example.com');
    await page.getByRole('button', { name: 'Upload', exact: true }).click();
    await expect(fieldByLabel(page, 'firstName')).toBeVisible({ timeout: 20000 });
    await fillClientInfoRequiredSelects(page);
    await typeField(page, 'firstName', 'AutoQAP2');
    await typeField(page, 'lastName', 'PrivateCoBranchResYes');
    await selectOption(page, 'territory', 'Gauteng');
    const id = await saveLeadAndGetId(page);
    expect(id, 'lead should save and carry an id').toBeTruthy();
  });

  test('TC-11: Private Company lead via Landbank Branch, manual capture', async ({ page }) => {
    await loginAsRM(page);
    await openNewLeadModal(page);
    await selectOption(page, 'channel', 'Landbank Branch');
    await selectOption(page, 'leadType', 'Private Company');
    await fillClientInfoRequiredSelects(page);
    await typeField(page, 'firstName', 'AutoQAP2');
    await typeField(page, 'lastName', 'PrivateCoBranchResNo');
    await typeField(page, 'organisation', 'AutoQAP2 Private Co Branch Ltd');
    await selectOption(page, 'territory', 'Gauteng');
    await typeField(page, 'mobileNumber', '0820001206');
    await typeField(page, 'emailAddress', 'autoqap2.privatecobranch.resno@example.com');
    const id = await saveLeadAndGetId(page);
    expect(id, 'lead should save and carry an id').toBeTruthy();
  });
});
