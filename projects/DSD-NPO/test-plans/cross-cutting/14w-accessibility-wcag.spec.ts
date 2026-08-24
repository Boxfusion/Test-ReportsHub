// AUTO-RECORDED from test-plans/cross-cutting/14w-accessibility-wcag.md
// Source: Azure DevOps test plan #101541 (Smoke), suite #102150
// The .md plan is canonical. AI-repair will patch failing lines in this file.
//
// ⚠️ PARTIALLY REACHABLE — and worth running now even though the case cannot complete.
// Steps 1-2 cover Read This and Organisation Details, which the wizard does reach.
// 🔑 Step 3 asserts that validation errors are ANNOUNCED and take focus. We already know the
// wizard blocks with a disabled Next and NO message at all — so if there is no message,
// there is nothing to announce, and the usability defect and the accessibility failure are
// the SAME defect. Running this turns a UX observation into a WCAG 2.1 AA finding, which
// carries more weight for a government portal.
//
// 📌 Blocked steps report as SKIPPED, not FAILED — per RULES.md §5 the run is PARTIAL if the
// reachable assertions pass. Do not let the address blocker mask the accessibility result.

import { test, expect } from '@playwright/test';
import { PUBLIC_URL, PUBLIC_ROUTES, loginPublic, clickFirstVisible } from '../_helpers';

test.describe('NPO-14W — Accessibility & WCAG 2.1 AA (smoke)', () => {

  // ADO Test Case #102160: https://dev.azure.com/boxfusion/Boxfusion%20Test%20Plans/_workitems/edit/102160
  test('TC-01: Keyboard-only navigation across the wizard tabs (ADO #102160 · TC-14W-001)', async ({ page }) => {
    await loginPublic(page);
    await page.goto(PUBLIC_URL + PUBLIC_ROUTES.registerNpo);
    await page.waitForLoadState('networkidle');
    await clickFirstVisible(page, 'button', /Register a new NPO/i);
    await page.waitForTimeout(2500);

    // STEP 1-2: keyboard-only through Tab 1 (Read This) — every interactive element reachable
    // with a VISIBLE focus indicator.
    const focusTrail: string[] = [];
    for (let i = 0; i < 30; i++) {
      await page.keyboard.press('Tab');
      const info = await page.evaluate(() => {
        const el = document.activeElement as HTMLElement | null;
        if (!el || el === document.body) return null;
        const s = getComputedStyle(el);
        return {
          tag: el.tagName,
          label: (el.getAttribute('aria-label') || el.innerText || '').slice(0, 40).replace(/\s+/g, ' '),
          // a visible focus indicator: an outline, or a box-shadow ring
          focusVisible: (s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) > 0) || s.boxShadow !== 'none',
        };
      });
      if (info) focusTrail.push(`${info.tag}:${info.label}${info.focusVisible ? '' : ' ⚠️NO-FOCUS-RING'}`);
    }
    console.log('[TC-01] focus trail:\n' + focusTrail.join('\n'));

    // ASSERT every focused element showed a visible focus indicator
    const noRing = focusTrail.filter(f => f.includes('NO-FOCUS-RING'));
    expect(noRing, `WCAG 2.4.7: ${noRing.length} focusable element(s) had no visible focus indicator`).toHaveLength(0);

    // STEP 3: trigger a validation error with the keyboard only, then
    // ASSERT (BLOCKING) it is ANNOUNCED and focus MOVES to the offending field.
    // 🔴 EXPECTED TO FAIL: a disabled control is skipped by the tab order entirely, so an
    // assistive-technology user gets no signal at all about what is unsatisfied.
    await page.keyboard.press('Enter');
    await page.waitForTimeout(2000);

    const announced = await page.evaluate(() => {
      const live = [...document.querySelectorAll('[role=alert], [aria-live], .ant-form-item-explain-error')]
        .map(e => (e as HTMLElement).innerText.trim()).filter(Boolean);
      const focused = document.activeElement as HTMLElement | null;
      return { live, focusedTag: focused?.tagName, focusedInvalid: focused?.getAttribute('aria-invalid') };
    });
    console.log('[TC-01] live-region content after blocked Next:', JSON.stringify(announced));

    expect(announced.live.length,
      'ADO #102160 step 3: a validation error must be ANNOUNCED to assistive technology')
      .toBeGreaterThan(0);

    // STEP 4: submit keyboard-only
    // TODO[assertion]: ⛔ unreachable — the wizard cannot complete while the address
    // autocomplete defect stands. Reports as SKIPPED, not FAILED.
  });
});
