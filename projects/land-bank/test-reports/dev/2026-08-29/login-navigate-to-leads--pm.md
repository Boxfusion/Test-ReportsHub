# Report: Test Plan: AUTH-1.1 — Login and Navigate to Leads — pm
**Date:** 2026-08-29 16:01 UTC
**Variant:** pm
**Plan:** test-plans/dev/auth/login-navigate-to-leads.md
**Spec:** test-plans/dev/auth/login-navigate-to-leads.spec.ts
**Execution Mode:** playwright-script (failures pending AI-repair)
**Result:** FAILED
**Duration:** 1.5s

## Summary
| Total Steps | Passed | Failed | Skipped |
|-------------|--------|--------|---------|
| 2 | 0 | 2 | 0 |

## Step Results
### TC-01: Log in to Land Bank CRM as an Admin
**Mode:** playwright-script
**Duration:** 0.4s
- [FAIL] TC-01: Log in to Land Bank CRM as an Admin

**Error:**
```
Error: page.goto: net::ERR_INTERNET_DISCONNECTED at https://landbankcrm-adminportal-landbankcrmdev.shesha.app/login
Call log:
[2m  - navigating to "https://landbankcrm-adminportal-landbankcrmdev.shesha.app/login", waiting until "load"[22m


  64 |
  65 |     // STEP 1: NAVIGATE to `/login`
> 66 |     await page.goto('/login');
     |                ^
  67 |
  68 |     // SNAPSHOT: confirm the login form (Username + Password fields, Sign In button) is rendered
  69 |     await expect(page.getByPlaceholder('Username')).toBeVisible({ timeout: 30000 });
    at /Users/Sanele/Downloads/Autotesting/Test-ReportsHub/projects/land-bank/test-plans/dev/auth/login-navigate-to-leads.spec.ts:66:16
```
**Location:** /Users/Sanele/Downloads/Autotesting/Test-ReportsHub/projects/land-bank/test-plans/dev/auth/login-navigate-to-leads.spec.ts:66:16

### TC-02: Navigate to Leads from the side menu
**Mode:** playwright-script
**Duration:** 0.1s
- [FAIL] TC-02: Navigate to Leads from the side menu

**Error:**
```
Error: page.goto: net::ERR_INTERNET_DISCONNECTED at https://landbankcrm-adminportal-landbankcrmdev.shesha.app/login
Call log:
[2m  - navigating to "https://landbankcrm-adminportal-landbankcrmdev.shesha.app/login", waiting until "load"[22m


  47 | async function loginAs(page: Page, role: string = 'ADMIN') {
  48 |   const { user, password } = credsFor(role);
> 49 |   await page.goto('/login');
     |              ^
  50 |   // STEP login.1: TYPE the Username field with the admin username (from `.env`)
  51 |   await page.getByPlaceholder('Username').fill(user);
  52 |   // STEP login.2: TYPE the Password field with the admin password (from `.env`)
    at loginAs (/Users/Sanele/Downloads/Autotesting/Test-ReportsHub/projects/land-bank/test-plans/dev/auth/login-navigate-to-leads.spec.ts:49:14)
    at /Users/Sanele/Downloads/Autotesting/Test-ReportsHub/projects/land-bank/test-plans/dev/auth/login-navigate-to-leads.spec.ts:97:11
```
**Location:** /Users/Sanele/Downloads/Autotesting/Test-ReportsHub/projects/land-bank/test-plans/dev/auth/login-navigate-to-leads.spec.ts:49:14
