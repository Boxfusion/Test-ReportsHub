# Report: Test Plan: P2-LEAD-2.1 — Lead to Opportunity Lifecycle (Individual, Close Corporation, Private Company)
**Date:** 2026-08-24 14:20 UTC
**Plan:** test-plans/phase2/leads/lead-to-opportunity-lifecycle.md
**Spec:** test-plans/phase2/leads/lead-to-opportunity-lifecycle.spec.ts
**Execution Mode:** playwright-script (failures pending AI-repair)
**Result:** FAILED
**Duration:** 171.0s

## Summary
| Total Steps | Passed | Failed | Skipped |
|-------------|--------|--------|---------|
| 20 | 2 | 18 | 0 |

## Step Results
### TC-01: RM signs in on Phase 2
**Mode:** playwright-script
**Duration:** 12.6s
- [PASS] TC-01: RM signs in on Phase 2

### TC-02: The run is pointed at Phase 2
**Mode:** playwright-script
**Duration:** 12.8s
- [PASS] TC-02: The run is pointed at Phase 2

### TC-03: Individual lead via Online Digital Channel converts to PERSONAL
**Mode:** playwright-script
**Duration:** 65.8s
- [FAIL] TC-03: Individual lead via Online Digital Channel converts to PERSONAL

**Error:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator: getByText('PERSONAL', { exact: true })
Expected: visible
Timeout: 25000ms
Error: element(s) not found

Call log:
[2m  - Expect "toBeVisible" with timeout 25000ms[22m
[2m  - waiting for getByText('PERSONAL', { exact: true })[22m


  162 |     await convertedOpportunityId(page);
  163 |     // TODO[selector]: Application Type display field on the Opportunity
> 164 |     await expect(page.getByText('PERSONAL', { exact: true })).toBeVisible({ timeout: 25000 });
      |                                                               ^
  165 |   });
  166 |
  167 |   test('TC-04: Close Corporation lead via Online Digital Channel converts to ENTITY', async ({ page }) => {
    at /Users/Sanele/Downloads/Autotesting/Test-ReportsHub/projects/land-bank/test-plans/phase2/leads/lead-to-opportunity-lifecycle.spec.ts:164:63
```
**Location:** /Users/Sanele/Downloads/Autotesting/Test-ReportsHub/projects/land-bank/test-plans/phase2/leads/lead-to-opportunity-lifecycle.spec.ts:164:63

### TC-03: Individual lead via Online Digital Channel converts to PERSONAL
**Mode:** playwright-script
**Duration:** 36.1s
- [FAIL] TC-03: Individual lead via Online Digital Channel converts to PERSONAL

**Error:**
```
TimeoutError: page.goto: Timeout 30000ms exceeded.
Call log:
[2m  - navigating to "https://landbankcrm-adminportal-lb-phase2.shesha.app/login", waiting until "load"[22m


  37 | async function loginAsRM(page: Page) {
  38 |   const { user, password } = credsFor('RM');
> 39 |   await page.goto('/login');
     |              ^
  40 |   // STEP TC-01: TYPE the Username field with the Phase 2 RM username (from `.env`)
  41 |   await page.getByPlaceholder('Username').fill(user);
  42 |   // STEP TC-01: TYPE the Password field with the Phase 2 RM password (from `.env`)
    at loginAsRM (/Users/Sanele/Downloads/Autotesting/Test-ReportsHub/projects/land-bank/test-plans/phase2/leads/lead-to-opportunity-lifecycle.spec.ts:39:14)
    at /Users/Sanele/Downloads/Autotesting/Test-ReportsHub/projects/land-bank/test-plans/phase2/leads/lead-to-opportunity-lifecycle.spec.ts:150:11
```
**Location:** /Users/Sanele/Downloads/Autotesting/Test-ReportsHub/projects/land-bank/test-plans/phase2/leads/lead-to-opportunity-lifecycle.spec.ts:39:14

### TC-04: Close Corporation lead via Online Digital Channel converts to ENTITY
**Mode:** playwright-script
**Duration:** 35.2s
- [FAIL] TC-04: Close Corporation lead via Online Digital Channel converts to ENTITY

**Error:**
```
TimeoutError: page.goto: Timeout 30000ms exceeded.
Call log:
[2m  - navigating to "https://landbankcrm-adminportal-lb-phase2.shesha.app/login", waiting until "load"[22m


  37 | async function loginAsRM(page: Page) {
  38 |   const { user, password } = credsFor('RM');
> 39 |   await page.goto('/login');
     |              ^
  40 |   // STEP TC-01: TYPE the Username field with the Phase 2 RM username (from `.env`)
  41 |   await page.getByPlaceholder('Username').fill(user);
  42 |   // STEP TC-01: TYPE the Password field with the Phase 2 RM password (from `.env`)
    at loginAsRM (/Users/Sanele/Downloads/Autotesting/Test-ReportsHub/projects/land-bank/test-plans/phase2/leads/lead-to-opportunity-lifecycle.spec.ts:39:14)
    at /Users/Sanele/Downloads/Autotesting/Test-ReportsHub/projects/land-bank/test-plans/phase2/leads/lead-to-opportunity-lifecycle.spec.ts:168:11
```
**Location:** /Users/Sanele/Downloads/Autotesting/Test-ReportsHub/projects/land-bank/test-plans/phase2/leads/lead-to-opportunity-lifecycle.spec.ts:39:14

### TC-04: Close Corporation lead via Online Digital Channel converts to ENTITY
**Mode:** playwright-script
**Duration:** 0.1s
- [FAIL] TC-04: Close Corporation lead via Online Digital Channel converts to ENTITY

**Error:**
```
Error: page.goto: net::ERR_INTERNET_DISCONNECTED at https://landbankcrm-adminportal-lb-phase2.shesha.app/login
Call log:
[2m  - navigating to "https://landbankcrm-adminportal-lb-phase2.shesha.app/login", waiting until "load"[22m


  37 | async function loginAsRM(page: Page) {
  38 |   const { user, password } = credsFor('RM');
> 39 |   await page.goto('/login');
     |              ^
  40 |   // STEP TC-01: TYPE the Username field with the Phase 2 RM username (from `.env`)
  41 |   await page.getByPlaceholder('Username').fill(user);
  42 |   // STEP TC-01: TYPE the Password field with the Phase 2 RM password (from `.env`)
    at loginAsRM (/Users/Sanele/Downloads/Autotesting/Test-ReportsHub/projects/land-bank/test-plans/phase2/leads/lead-to-opportunity-lifecycle.spec.ts:39:14)
    at /Users/Sanele/Downloads/Autotesting/Test-ReportsHub/projects/land-bank/test-plans/phase2/leads/lead-to-opportunity-lifecycle.spec.ts:168:11
```
**Location:** /Users/Sanele/Downloads/Autotesting/Test-ReportsHub/projects/land-bank/test-plans/phase2/leads/lead-to-opportunity-lifecycle.spec.ts:39:14

### TC-05: Private Company lead via Online Digital Channel converts to ENTITY
**Mode:** playwright-script
**Duration:** 0.1s
- [FAIL] TC-05: Private Company lead via Online Digital Channel converts to ENTITY

**Error:**
```
Error: page.goto: net::ERR_INTERNET_DISCONNECTED at https://landbankcrm-adminportal-lb-phase2.shesha.app/login
Call log:
[2m  - navigating to "https://landbankcrm-adminportal-lb-phase2.shesha.app/login", waiting until "load"[22m


  37 | async function loginAsRM(page: Page) {
  38 |   const { user, password } = credsFor('RM');
> 39 |   await page.goto('/login');
     |              ^
  40 |   // STEP TC-01: TYPE the Username field with the Phase 2 RM username (from `.env`)
  41 |   await page.getByPlaceholder('Username').fill(user);
  42 |   // STEP TC-01: TYPE the Password field with the Phase 2 RM password (from `.env`)
    at loginAsRM (/Users/Sanele/Downloads/Autotesting/Test-ReportsHub/projects/land-bank/test-plans/phase2/leads/lead-to-opportunity-lifecycle.spec.ts:39:14)
    at /Users/Sanele/Downloads/Autotesting/Test-ReportsHub/projects/land-bank/test-plans/phase2/leads/lead-to-opportunity-lifecycle.spec.ts:186:11
```
**Location:** /Users/Sanele/Downloads/Autotesting/Test-ReportsHub/projects/land-bank/test-plans/phase2/leads/lead-to-opportunity-lifecycle.spec.ts:39:14

### TC-05: Private Company lead via Online Digital Channel converts to ENTITY
**Mode:** playwright-script
**Duration:** 0.1s
- [FAIL] TC-05: Private Company lead via Online Digital Channel converts to ENTITY

**Error:**
```
Error: page.goto: net::ERR_INTERNET_DISCONNECTED at https://landbankcrm-adminportal-lb-phase2.shesha.app/login
Call log:
[2m  - navigating to "https://landbankcrm-adminportal-lb-phase2.shesha.app/login", waiting until "load"[22m


  37 | async function loginAsRM(page: Page) {
  38 |   const { user, password } = credsFor('RM');
> 39 |   await page.goto('/login');
     |              ^
  40 |   // STEP TC-01: TYPE the Username field with the Phase 2 RM username (from `.env`)
  41 |   await page.getByPlaceholder('Username').fill(user);
  42 |   // STEP TC-01: TYPE the Password field with the Phase 2 RM password (from `.env`)
    at loginAsRM (/Users/Sanele/Downloads/Autotesting/Test-ReportsHub/projects/land-bank/test-plans/phase2/leads/lead-to-opportunity-lifecycle.spec.ts:39:14)
    at /Users/Sanele/Downloads/Autotesting/Test-ReportsHub/projects/land-bank/test-plans/phase2/leads/lead-to-opportunity-lifecycle.spec.ts:186:11
```
**Location:** /Users/Sanele/Downloads/Autotesting/Test-ReportsHub/projects/land-bank/test-plans/phase2/leads/lead-to-opportunity-lifecycle.spec.ts:39:14

### TC-06: Individual lead via Landbank Branch, consent uploaded
**Mode:** playwright-script
**Duration:** 0.1s
- [FAIL] TC-06: Individual lead via Landbank Branch, consent uploaded

**Error:**
```
Error: page.goto: net::ERR_INTERNET_DISCONNECTED at https://landbankcrm-adminportal-lb-phase2.shesha.app/login
Call log:
[2m  - navigating to "https://landbankcrm-adminportal-lb-phase2.shesha.app/login", waiting until "load"[22m


  37 | async function loginAsRM(page: Page) {
  38 |   const { user, password } = credsFor('RM');
> 39 |   await page.goto('/login');
     |              ^
  40 |   // STEP TC-01: TYPE the Username field with the Phase 2 RM username (from `.env`)
  41 |   await page.getByPlaceholder('Username').fill(user);
  42 |   // STEP TC-01: TYPE the Password field with the Phase 2 RM password (from `.env`)
    at loginAsRM (/Users/Sanele/Downloads/Autotesting/Test-ReportsHub/projects/land-bank/test-plans/phase2/leads/lead-to-opportunity-lifecycle.spec.ts:39:14)
    at /Users/Sanele/Downloads/Autotesting/Test-ReportsHub/projects/land-bank/test-plans/phase2/leads/lead-to-opportunity-lifecycle.spec.ts:205:11
```
**Location:** /Users/Sanele/Downloads/Autotesting/Test-ReportsHub/projects/land-bank/test-plans/phase2/leads/lead-to-opportunity-lifecycle.spec.ts:39:14

### TC-06: Individual lead via Landbank Branch, consent uploaded
**Mode:** playwright-script
**Duration:** 0.1s
- [FAIL] TC-06: Individual lead via Landbank Branch, consent uploaded

**Error:**
```
Error: page.goto: net::ERR_INTERNET_DISCONNECTED at https://landbankcrm-adminportal-lb-phase2.shesha.app/login
Call log:
[2m  - navigating to "https://landbankcrm-adminportal-lb-phase2.shesha.app/login", waiting until "load"[22m


  37 | async function loginAsRM(page: Page) {
  38 |   const { user, password } = credsFor('RM');
> 39 |   await page.goto('/login');
     |              ^
  40 |   // STEP TC-01: TYPE the Username field with the Phase 2 RM username (from `.env`)
  41 |   await page.getByPlaceholder('Username').fill(user);
  42 |   // STEP TC-01: TYPE the Password field with the Phase 2 RM password (from `.env`)
    at loginAsRM (/Users/Sanele/Downloads/Autotesting/Test-ReportsHub/projects/land-bank/test-plans/phase2/leads/lead-to-opportunity-lifecycle.spec.ts:39:14)
    at /Users/Sanele/Downloads/Autotesting/Test-ReportsHub/projects/land-bank/test-plans/phase2/leads/lead-to-opportunity-lifecycle.spec.ts:205:11
```
**Location:** /Users/Sanele/Downloads/Autotesting/Test-ReportsHub/projects/land-bank/test-plans/phase2/leads/lead-to-opportunity-lifecycle.spec.ts:39:14

### TC-07: Individual lead via Landbank Branch, consent via OTP
**Mode:** playwright-script
**Duration:** 0.1s
- [FAIL] TC-07: Individual lead via Landbank Branch, consent via OTP

**Error:**
```
Error: page.goto: net::ERR_INTERNET_DISCONNECTED at https://landbankcrm-adminportal-lb-phase2.shesha.app/login
Call log:
[2m  - navigating to "https://landbankcrm-adminportal-lb-phase2.shesha.app/login", waiting until "load"[22m


  37 | async function loginAsRM(page: Page) {
  38 |   const { user, password } = credsFor('RM');
> 39 |   await page.goto('/login');
     |              ^
  40 |   // STEP TC-01: TYPE the Username field with the Phase 2 RM username (from `.env`)
  41 |   await page.getByPlaceholder('Username').fill(user);
  42 |   // STEP TC-01: TYPE the Password field with the Phase 2 RM password (from `.env`)
    at loginAsRM (/Users/Sanele/Downloads/Autotesting/Test-ReportsHub/projects/land-bank/test-plans/phase2/leads/lead-to-opportunity-lifecycle.spec.ts:39:14)
    at /Users/Sanele/Downloads/Autotesting/Test-ReportsHub/projects/land-bank/test-plans/phase2/leads/lead-to-opportunity-lifecycle.spec.ts:227:11
```
**Location:** /Users/Sanele/Downloads/Autotesting/Test-ReportsHub/projects/land-bank/test-plans/phase2/leads/lead-to-opportunity-lifecycle.spec.ts:39:14

### TC-07: Individual lead via Landbank Branch, consent via OTP
**Mode:** playwright-script
**Duration:** 0.1s
- [FAIL] TC-07: Individual lead via Landbank Branch, consent via OTP

**Error:**
```
Error: page.goto: net::ERR_INTERNET_DISCONNECTED at https://landbankcrm-adminportal-lb-phase2.shesha.app/login
Call log:
[2m  - navigating to "https://landbankcrm-adminportal-lb-phase2.shesha.app/login", waiting until "load"[22m


  37 | async function loginAsRM(page: Page) {
  38 |   const { user, password } = credsFor('RM');
> 39 |   await page.goto('/login');
     |              ^
  40 |   // STEP TC-01: TYPE the Username field with the Phase 2 RM username (from `.env`)
  41 |   await page.getByPlaceholder('Username').fill(user);
  42 |   // STEP TC-01: TYPE the Password field with the Phase 2 RM password (from `.env`)
    at loginAsRM (/Users/Sanele/Downloads/Autotesting/Test-ReportsHub/projects/land-bank/test-plans/phase2/leads/lead-to-opportunity-lifecycle.spec.ts:39:14)
    at /Users/Sanele/Downloads/Autotesting/Test-ReportsHub/projects/land-bank/test-plans/phase2/leads/lead-to-opportunity-lifecycle.spec.ts:227:11
```
**Location:** /Users/Sanele/Downloads/Autotesting/Test-ReportsHub/projects/land-bank/test-plans/phase2/leads/lead-to-opportunity-lifecycle.spec.ts:39:14

### TC-08: Close Corporation lead via Landbank Branch, resolution + consent uploaded
**Mode:** playwright-script
**Duration:** 0.1s
- [FAIL] TC-08: Close Corporation lead via Landbank Branch, resolution + consent uploaded

**Error:**
```
Error: page.goto: net::ERR_INTERNET_DISCONNECTED at https://landbankcrm-adminportal-lb-phase2.shesha.app/login
Call log:
[2m  - navigating to "https://landbankcrm-adminportal-lb-phase2.shesha.app/login", waiting until "load"[22m


  37 | async function loginAsRM(page: Page) {
  38 |   const { user, password } = credsFor('RM');
> 39 |   await page.goto('/login');
     |              ^
  40 |   // STEP TC-01: TYPE the Username field with the Phase 2 RM username (from `.env`)
  41 |   await page.getByPlaceholder('Username').fill(user);
  42 |   // STEP TC-01: TYPE the Password field with the Phase 2 RM password (from `.env`)
    at loginAsRM (/Users/Sanele/Downloads/Autotesting/Test-ReportsHub/projects/land-bank/test-plans/phase2/leads/lead-to-opportunity-lifecycle.spec.ts:39:14)
    at /Users/Sanele/Downloads/Autotesting/Test-ReportsHub/projects/land-bank/test-plans/phase2/leads/lead-to-opportunity-lifecycle.spec.ts:244:11
```
**Location:** /Users/Sanele/Downloads/Autotesting/Test-ReportsHub/projects/land-bank/test-plans/phase2/leads/lead-to-opportunity-lifecycle.spec.ts:39:14

### TC-08: Close Corporation lead via Landbank Branch, resolution + consent uploaded
**Mode:** playwright-script
**Duration:** 0.1s
- [FAIL] TC-08: Close Corporation lead via Landbank Branch, resolution + consent uploaded

**Error:**
```
Error: page.goto: net::ERR_INTERNET_DISCONNECTED at https://landbankcrm-adminportal-lb-phase2.shesha.app/login
Call log:
[2m  - navigating to "https://landbankcrm-adminportal-lb-phase2.shesha.app/login", waiting until "load"[22m


  37 | async function loginAsRM(page: Page) {
  38 |   const { user, password } = credsFor('RM');
> 39 |   await page.goto('/login');
     |              ^
  40 |   // STEP TC-01: TYPE the Username field with the Phase 2 RM username (from `.env`)
  41 |   await page.getByPlaceholder('Username').fill(user);
  42 |   // STEP TC-01: TYPE the Password field with the Phase 2 RM password (from `.env`)
    at loginAsRM (/Users/Sanele/Downloads/Autotesting/Test-ReportsHub/projects/land-bank/test-plans/phase2/leads/lead-to-opportunity-lifecycle.spec.ts:39:14)
    at /Users/Sanele/Downloads/Autotesting/Test-ReportsHub/projects/land-bank/test-plans/phase2/leads/lead-to-opportunity-lifecycle.spec.ts:244:11
```
**Location:** /Users/Sanele/Downloads/Autotesting/Test-ReportsHub/projects/land-bank/test-plans/phase2/leads/lead-to-opportunity-lifecycle.spec.ts:39:14

### TC-09: Close Corporation lead via Landbank Branch, manual capture
**Mode:** playwright-script
**Duration:** 0.1s
- [FAIL] TC-09: Close Corporation lead via Landbank Branch, manual capture

**Error:**
```
Error: page.goto: net::ERR_INTERNET_DISCONNECTED at https://landbankcrm-adminportal-lb-phase2.shesha.app/login
Call log:
[2m  - navigating to "https://landbankcrm-adminportal-lb-phase2.shesha.app/login", waiting until "load"[22m


  37 | async function loginAsRM(page: Page) {
  38 |   const { user, password } = credsFor('RM');
> 39 |   await page.goto('/login');
     |              ^
  40 |   // STEP TC-01: TYPE the Username field with the Phase 2 RM username (from `.env`)
  41 |   await page.getByPlaceholder('Username').fill(user);
  42 |   // STEP TC-01: TYPE the Password field with the Phase 2 RM password (from `.env`)
    at loginAsRM (/Users/Sanele/Downloads/Autotesting/Test-ReportsHub/projects/land-bank/test-plans/phase2/leads/lead-to-opportunity-lifecycle.spec.ts:39:14)
    at /Users/Sanele/Downloads/Autotesting/Test-ReportsHub/projects/land-bank/test-plans/phase2/leads/lead-to-opportunity-lifecycle.spec.ts:270:11
```
**Location:** /Users/Sanele/Downloads/Autotesting/Test-ReportsHub/projects/land-bank/test-plans/phase2/leads/lead-to-opportunity-lifecycle.spec.ts:39:14

### TC-09: Close Corporation lead via Landbank Branch, manual capture
**Mode:** playwright-script
**Duration:** 0.1s
- [FAIL] TC-09: Close Corporation lead via Landbank Branch, manual capture

**Error:**
```
Error: page.goto: net::ERR_INTERNET_DISCONNECTED at https://landbankcrm-adminportal-lb-phase2.shesha.app/login
Call log:
[2m  - navigating to "https://landbankcrm-adminportal-lb-phase2.shesha.app/login", waiting until "load"[22m


  37 | async function loginAsRM(page: Page) {
  38 |   const { user, password } = credsFor('RM');
> 39 |   await page.goto('/login');
     |              ^
  40 |   // STEP TC-01: TYPE the Username field with the Phase 2 RM username (from `.env`)
  41 |   await page.getByPlaceholder('Username').fill(user);
  42 |   // STEP TC-01: TYPE the Password field with the Phase 2 RM password (from `.env`)
    at loginAsRM (/Users/Sanele/Downloads/Autotesting/Test-ReportsHub/projects/land-bank/test-plans/phase2/leads/lead-to-opportunity-lifecycle.spec.ts:39:14)
    at /Users/Sanele/Downloads/Autotesting/Test-ReportsHub/projects/land-bank/test-plans/phase2/leads/lead-to-opportunity-lifecycle.spec.ts:270:11
```
**Location:** /Users/Sanele/Downloads/Autotesting/Test-ReportsHub/projects/land-bank/test-plans/phase2/leads/lead-to-opportunity-lifecycle.spec.ts:39:14

### TC-10: Private Company lead via Landbank Branch, resolution + consent uploaded
**Mode:** playwright-script
**Duration:** 0.2s
- [FAIL] TC-10: Private Company lead via Landbank Branch, resolution + consent uploaded

**Error:**
```
Error: page.goto: net::ERR_INTERNET_DISCONNECTED at https://landbankcrm-adminportal-lb-phase2.shesha.app/login
Call log:
[2m  - navigating to "https://landbankcrm-adminportal-lb-phase2.shesha.app/login", waiting until "load"[22m


  37 | async function loginAsRM(page: Page) {
  38 |   const { user, password } = credsFor('RM');
> 39 |   await page.goto('/login');
     |              ^
  40 |   // STEP TC-01: TYPE the Username field with the Phase 2 RM username (from `.env`)
  41 |   await page.getByPlaceholder('Username').fill(user);
  42 |   // STEP TC-01: TYPE the Password field with the Phase 2 RM password (from `.env`)
    at loginAsRM (/Users/Sanele/Downloads/Autotesting/Test-ReportsHub/projects/land-bank/test-plans/phase2/leads/lead-to-opportunity-lifecycle.spec.ts:39:14)
    at /Users/Sanele/Downloads/Autotesting/Test-ReportsHub/projects/land-bank/test-plans/phase2/leads/lead-to-opportunity-lifecycle.spec.ts:286:11
```
**Location:** /Users/Sanele/Downloads/Autotesting/Test-ReportsHub/projects/land-bank/test-plans/phase2/leads/lead-to-opportunity-lifecycle.spec.ts:39:14

### TC-10: Private Company lead via Landbank Branch, resolution + consent uploaded
**Mode:** playwright-script
**Duration:** 0.1s
- [FAIL] TC-10: Private Company lead via Landbank Branch, resolution + consent uploaded

**Error:**
```
Error: page.goto: net::ERR_INTERNET_DISCONNECTED at https://landbankcrm-adminportal-lb-phase2.shesha.app/login
Call log:
[2m  - navigating to "https://landbankcrm-adminportal-lb-phase2.shesha.app/login", waiting until "load"[22m


  37 | async function loginAsRM(page: Page) {
  38 |   const { user, password } = credsFor('RM');
> 39 |   await page.goto('/login');
     |              ^
  40 |   // STEP TC-01: TYPE the Username field with the Phase 2 RM username (from `.env`)
  41 |   await page.getByPlaceholder('Username').fill(user);
  42 |   // STEP TC-01: TYPE the Password field with the Phase 2 RM password (from `.env`)
    at loginAsRM (/Users/Sanele/Downloads/Autotesting/Test-ReportsHub/projects/land-bank/test-plans/phase2/leads/lead-to-opportunity-lifecycle.spec.ts:39:14)
    at /Users/Sanele/Downloads/Autotesting/Test-ReportsHub/projects/land-bank/test-plans/phase2/leads/lead-to-opportunity-lifecycle.spec.ts:286:11
```
**Location:** /Users/Sanele/Downloads/Autotesting/Test-ReportsHub/projects/land-bank/test-plans/phase2/leads/lead-to-opportunity-lifecycle.spec.ts:39:14

### TC-11: Private Company lead via Landbank Branch, manual capture
**Mode:** playwright-script
**Duration:** 0.1s
- [FAIL] TC-11: Private Company lead via Landbank Branch, manual capture

**Error:**
```
Error: page.goto: net::ERR_INTERNET_DISCONNECTED at https://landbankcrm-adminportal-lb-phase2.shesha.app/login
Call log:
[2m  - navigating to "https://landbankcrm-adminportal-lb-phase2.shesha.app/login", waiting until "load"[22m


  37 | async function loginAsRM(page: Page) {
  38 |   const { user, password } = credsFor('RM');
> 39 |   await page.goto('/login');
     |              ^
  40 |   // STEP TC-01: TYPE the Username field with the Phase 2 RM username (from `.env`)
  41 |   await page.getByPlaceholder('Username').fill(user);
  42 |   // STEP TC-01: TYPE the Password field with the Phase 2 RM password (from `.env`)
    at loginAsRM (/Users/Sanele/Downloads/Autotesting/Test-ReportsHub/projects/land-bank/test-plans/phase2/leads/lead-to-opportunity-lifecycle.spec.ts:39:14)
    at /Users/Sanele/Downloads/Autotesting/Test-ReportsHub/projects/land-bank/test-plans/phase2/leads/lead-to-opportunity-lifecycle.spec.ts:309:11
```
**Location:** /Users/Sanele/Downloads/Autotesting/Test-ReportsHub/projects/land-bank/test-plans/phase2/leads/lead-to-opportunity-lifecycle.spec.ts:39:14

### TC-11: Private Company lead via Landbank Branch, manual capture
**Mode:** playwright-script
**Duration:** 0.1s
- [FAIL] TC-11: Private Company lead via Landbank Branch, manual capture

**Error:**
```
Error: page.goto: net::ERR_INTERNET_DISCONNECTED at https://landbankcrm-adminportal-lb-phase2.shesha.app/login
Call log:
[2m  - navigating to "https://landbankcrm-adminportal-lb-phase2.shesha.app/login", waiting until "load"[22m


  37 | async function loginAsRM(page: Page) {
  38 |   const { user, password } = credsFor('RM');
> 39 |   await page.goto('/login');
     |              ^
  40 |   // STEP TC-01: TYPE the Username field with the Phase 2 RM username (from `.env`)
  41 |   await page.getByPlaceholder('Username').fill(user);
  42 |   // STEP TC-01: TYPE the Password field with the Phase 2 RM password (from `.env`)
    at loginAsRM (/Users/Sanele/Downloads/Autotesting/Test-ReportsHub/projects/land-bank/test-plans/phase2/leads/lead-to-opportunity-lifecycle.spec.ts:39:14)
    at /Users/Sanele/Downloads/Autotesting/Test-ReportsHub/projects/land-bank/test-plans/phase2/leads/lead-to-opportunity-lifecycle.spec.ts:309:11
```
**Location:** /Users/Sanele/Downloads/Autotesting/Test-ReportsHub/projects/land-bank/test-plans/phase2/leads/lead-to-opportunity-lifecycle.spec.ts:39:14
