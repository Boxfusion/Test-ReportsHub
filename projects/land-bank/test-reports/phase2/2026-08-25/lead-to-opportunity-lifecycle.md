# Report: Test Plan: P2-LEAD-2.1 — Lead to Opportunity Lifecycle (Individual, Close Corporation, Private Company)
**Date:** 2026-08-25 07:27 UTC
**Plan:** test-plans/phase2/leads/lead-to-opportunity-lifecycle.md
**Spec:** test-plans/phase2/leads/lead-to-opportunity-lifecycle.spec.ts
**Execution Mode:** playwright-script (failures pending AI-repair)
**Result:** PARTIAL
**Duration:** 564.6s

## Summary
| Total Steps | Passed | Failed | Skipped |
|-------------|--------|--------|---------|
| 15 | 9 | 6 | 0 |

## Step Results
### TC-01: RM signs in on Phase 2
**Mode:** playwright-script
**Duration:** 19.8s
- [PASS] TC-01: RM signs in on Phase 2

### TC-02: The run is pointed at Phase 2
**Mode:** playwright-script
**Duration:** 19.4s
- [PASS] TC-02: The run is pointed at Phase 2

### TC-03: Individual lead via Online Digital Channel converts to PERSONAL
**Mode:** playwright-script
**Duration:** 39.5s
- [FAIL] TC-03: Individual lead via Online Digital Channel converts to PERSONAL

**Error:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator: getByText('Personal', { exact: true })
Expected: visible
Error: strict mode violation: getByText('Personal', { exact: true }) resolved to 2 elements:
    1) <span class="ant-tag ant-tag-has-color sha-status-tag css-1lo1l9k css-var-r0">Personal</span> aka getByText('Personal').first()
    2) <span class="read-only-display-form-item acss-1acdr9i">Personal</span> aka getByLabel('Application Data').getByText('Personal')

Call log:
[2m  - Expect "toBeVisible" with timeout 25000ms[22m
[2m  - waiting for getByText('Personal', { exact: true })[22m


  165 |     await convertedOpportunityId(page);
  166 |     // TODO[selector]: Application Type display field on the Opportunity
> 167 |     await expect(page.getByText('Personal', { exact: true })).toBeVisible({ timeout: 25000 });
      |                                                               ^
  168 |   });
  169 |
  170 |   test('TC-04: Close Corporation lead via Online Digital Channel converts to ENTITY', async ({ page }) => {
    at /Users/Sanele/Downloads/Autotesting/Test-ReportsHub/projects/land-bank/test-plans/phase2/leads/lead-to-opportunity-lifecycle.spec.ts:167:63
```
**Location:** /Users/Sanele/Downloads/Autotesting/Test-ReportsHub/projects/land-bank/test-plans/phase2/leads/lead-to-opportunity-lifecycle.spec.ts:167:63

### TC-03: Individual lead via Online Digital Channel converts to PERSONAL
**Mode:** playwright-script
**Duration:** 30.6s
- [PASS] TC-03: Individual lead via Online Digital Channel converts to PERSONAL

### TC-04: Close Corporation lead via Online Digital Channel converts to ENTITY
**Mode:** playwright-script
**Duration:** 27.3s
- [PASS] TC-04: Close Corporation lead via Online Digital Channel converts to ENTITY

### TC-05: Private Company lead via Online Digital Channel converts to ENTITY
**Mode:** playwright-script
**Duration:** 37.9s
- [FAIL] TC-05: Private Company lead via Online Digital Channel converts to ENTITY

**Error:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator: getByText('Entity', { exact: true })
Expected: visible
Error: strict mode violation: getByText('Entity', { exact: true }) resolved to 2 elements:
    1) <span class="ant-tag ant-tag-has-color sha-status-tag css-1lo1l9k css-var-r0">Entity</span> aka getByText('Entity').first()
    2) <span class="read-only-display-form-item acss-1acdr9i">Entity</span> aka getByLabel('Application Data').getByText('Entity', { exact: true })

Call log:
[2m  - Expect "toBeVisible" with timeout 25000ms[22m
[2m  - waiting for getByText('Entity', { exact: true })[22m


  206 |     await runPreScreeningAllPass(page);
  207 |     await convertedOpportunityId(page);
> 208 |     await expect(page.getByText('Entity', { exact: true })).toBeVisible({ timeout: 25000 });
      |                                                             ^
  209 |   });
  210 |
  211 |   test('TC-06: Individual lead via Landbank Branch, consent uploaded', async ({ page }) => {
    at /Users/Sanele/Downloads/Autotesting/Test-ReportsHub/projects/land-bank/test-plans/phase2/leads/lead-to-opportunity-lifecycle.spec.ts:208:61
```
**Location:** /Users/Sanele/Downloads/Autotesting/Test-ReportsHub/projects/land-bank/test-plans/phase2/leads/lead-to-opportunity-lifecycle.spec.ts:208:61

### TC-05: Private Company lead via Online Digital Channel converts to ENTITY
**Mode:** playwright-script
**Duration:** 34.7s
- [PASS] TC-05: Private Company lead via Online Digital Channel converts to ENTITY

### TC-06: Individual lead via Landbank Branch, consent uploaded
**Mode:** playwright-script
**Duration:** 24.1s
- [FAIL] TC-06: Individual lead via Landbank Branch, consent uploaded

**Error:**
```
Error: BUG-P2-002: Client Information block should reveal after Upload — see test-reports/bugs/2026-08-24-lead-to-opportunity-lifecycle-phase2.md

[2mexpect([22m[31mreceived[39m[2m).[22mtoBeTruthy[2m()[22m

Received: [31mfalse[39m

  225 |     // not a selector issue. Flagged so a real fix turns this green automatically.
  226 |     const clientInfoRevealed = await fieldByLabel(page, 'firstName').isVisible({ timeout: 20000 }).catch(() => false);
> 227 |     expect(clientInfoRevealed, 'BUG-P2-002: Client Information block should reveal after Upload — see test-reports/bugs/2026-08-24-lead-to-opportunity-lifecycle-phase2.md').toBeTruthy();
      |                                                                                                                                                                              ^
  228 |   });
  229 |
  230 |   test('TC-07: Individual lead via Landbank Branch, consent via OTP', async ({ page }) => {
    at /Users/Sanele/Downloads/Autotesting/Test-ReportsHub/projects/land-bank/test-plans/phase2/leads/lead-to-opportunity-lifecycle.spec.ts:227:174
```
**Location:** /Users/Sanele/Downloads/Autotesting/Test-ReportsHub/projects/land-bank/test-plans/phase2/leads/lead-to-opportunity-lifecycle.spec.ts:227:174

### TC-06: Individual lead via Landbank Branch, consent uploaded
**Mode:** playwright-script
**Duration:** 24.3s
- [FAIL] TC-06: Individual lead via Landbank Branch, consent uploaded

**Error:**
```
Error: BUG-P2-002: Client Information block should reveal after Upload — see test-reports/bugs/2026-08-24-lead-to-opportunity-lifecycle-phase2.md

[2mexpect([22m[31mreceived[39m[2m).[22mtoBeTruthy[2m()[22m

Received: [31mfalse[39m

  225 |     // not a selector issue. Flagged so a real fix turns this green automatically.
  226 |     const clientInfoRevealed = await fieldByLabel(page, 'firstName').isVisible({ timeout: 20000 }).catch(() => false);
> 227 |     expect(clientInfoRevealed, 'BUG-P2-002: Client Information block should reveal after Upload — see test-reports/bugs/2026-08-24-lead-to-opportunity-lifecycle-phase2.md').toBeTruthy();
      |                                                                                                                                                                              ^
  228 |   });
  229 |
  230 |   test('TC-07: Individual lead via Landbank Branch, consent via OTP', async ({ page }) => {
    at /Users/Sanele/Downloads/Autotesting/Test-ReportsHub/projects/land-bank/test-plans/phase2/leads/lead-to-opportunity-lifecycle.spec.ts:227:174
```
**Location:** /Users/Sanele/Downloads/Autotesting/Test-ReportsHub/projects/land-bank/test-plans/phase2/leads/lead-to-opportunity-lifecycle.spec.ts:227:174

### TC-07: Individual lead via Landbank Branch, consent via OTP
**Mode:** playwright-script
**Duration:** 48.7s
- [FAIL] TC-07: Individual lead via Landbank Branch, consent via OTP

**Error:**
```
Error: BUG-P2-001: otpPin should appear after Request OTP — see test-reports/bugs/2026-08-24-lead-to-opportunity-lifecycle-phase2.md

[2mexpect([22m[31mreceived[39m[2m).[22mtoBeTruthy[2m()[22m

Received: [31mfalse[39m

  242 |     // rather than needing a plan edit.
  243 |     const otpRevealed = await fieldByLabel(page, 'otpPin').isVisible({ timeout: 15000 }).catch(() => false);
> 244 |     expect(otpRevealed, 'BUG-P2-001: otpPin should appear after Request OTP — see test-reports/bugs/2026-08-24-lead-to-opportunity-lifecycle-phase2.md').toBeTruthy();
      |                                                                                                                                                          ^
  245 |   });
  246 |
  247 |   test('TC-08: Close Corporation lead via Landbank Branch, resolution + consent uploaded', async ({ page }) => {
    at /Users/Sanele/Downloads/Autotesting/Test-ReportsHub/projects/land-bank/test-plans/phase2/leads/lead-to-opportunity-lifecycle.spec.ts:244:154
```
**Location:** /Users/Sanele/Downloads/Autotesting/Test-ReportsHub/projects/land-bank/test-plans/phase2/leads/lead-to-opportunity-lifecycle.spec.ts:244:154

### TC-07: Individual lead via Landbank Branch, consent via OTP
**Mode:** playwright-script
**Duration:** 37.4s
- [FAIL] TC-07: Individual lead via Landbank Branch, consent via OTP

**Error:**
```
Error: BUG-P2-001: otpPin should appear after Request OTP — see test-reports/bugs/2026-08-24-lead-to-opportunity-lifecycle-phase2.md

[2mexpect([22m[31mreceived[39m[2m).[22mtoBeTruthy[2m()[22m

Received: [31mfalse[39m

  242 |     // rather than needing a plan edit.
  243 |     const otpRevealed = await fieldByLabel(page, 'otpPin').isVisible({ timeout: 15000 }).catch(() => false);
> 244 |     expect(otpRevealed, 'BUG-P2-001: otpPin should appear after Request OTP — see test-reports/bugs/2026-08-24-lead-to-opportunity-lifecycle-phase2.md').toBeTruthy();
      |                                                                                                                                                          ^
  245 |   });
  246 |
  247 |   test('TC-08: Close Corporation lead via Landbank Branch, resolution + consent uploaded', async ({ page }) => {
    at /Users/Sanele/Downloads/Autotesting/Test-ReportsHub/projects/land-bank/test-plans/phase2/leads/lead-to-opportunity-lifecycle.spec.ts:244:154
```
**Location:** /Users/Sanele/Downloads/Autotesting/Test-ReportsHub/projects/land-bank/test-plans/phase2/leads/lead-to-opportunity-lifecycle.spec.ts:244:154

### TC-08: Close Corporation lead via Landbank Branch, resolution + consent uploaded
**Mode:** playwright-script
**Duration:** 47.7s
- [PASS] TC-08: Close Corporation lead via Landbank Branch, resolution + consent uploaded

### TC-09: Close Corporation lead via Landbank Branch, manual capture
**Mode:** playwright-script
**Duration:** 65.0s
- [PASS] TC-09: Close Corporation lead via Landbank Branch, manual capture

### TC-10: Private Company lead via Landbank Branch, resolution + consent uploaded
**Mode:** playwright-script
**Duration:** 31.3s
- [PASS] TC-10: Private Company lead via Landbank Branch, resolution + consent uploaded

### TC-11: Private Company lead via Landbank Branch, manual capture
**Mode:** playwright-script
**Duration:** 32.9s
- [PASS] TC-11: Private Company lead via Landbank Branch, manual capture
