# Report: Test Plan: Admin Portal Authentication
**Date:** 2026-09-01 12:25 UTC
**Plan:** test-plans/authentication/admin-portal-authentication.md
**Spec:** test-plans/authentication/admin-portal-authentication.spec.ts
**Execution Mode:** playwright-script (failures pending AI-repair)
**Result:** PARTIAL
**Duration:** 86.0s

## Summary
| Total Steps | Passed | Failed | Skipped |
|-------------|--------|--------|---------|
| 8 | 6 | 2 | 0 |

## Step Results
### TC-01 (#112734): Verify successful login with valid credentials
**Mode:** playwright-script
**Duration:** 4.4s
- [PASS] TC-01 (#112734): Verify successful login with valid credentials

### TC-02 (#112735): Verify login using an invalid username
**Mode:** playwright-script
**Duration:** 4.1s
- [PASS] TC-02 (#112735): Verify login using an invalid username

### TC-03 (#112736): Verify login using an invalid username and password
**Mode:** playwright-script
**Duration:** 4.2s
- [PASS] TC-03 (#112736): Verify login using an invalid username and password

### TC-04 (#112737): Verify login using an invalid password
**Mode:** playwright-script
**Duration:** 4.9s
- [PASS] TC-04 (#112737): Verify login using an invalid password

### TC-05 (#112738): Verify mandatory username validation
**Mode:** playwright-script
**Duration:** 16.5s
- [PASS] TC-05 (#112738): Verify mandatory username validation

### TC-06 (#112739): Verify mandatory password validation
**Mode:** playwright-script
**Duration:** 13.2s
- [FAIL] TC-06 (#112739): Verify mandatory password validation

**Error:**
```
Error: ADO #112739 expects the userNameOrEmailAddress null message; got ["Value cannot be null. (Parameter 'plainPassword')"]

[2mexpect([22m[31mreceived[39m[2m).[22mtoContain[2m([22m[32mexpected[39m[2m) // indexOf[22m

Expected substring: [32m"Value cannot be null. (Parameter 'userNameOrEmailAddress"[39m
Received string:    [31m"Value cannot be null. (Parameter 'plainPassword')"[39m

  185 |     const messages = await collectMessages(page);
  186 |     expect(messages.join(' | '), `ADO #112739 expects the userNameOrEmailAddress null message; got ${JSON.stringify(messages)}`)
> 187 |       .toContain("Value cannot be null. (Parameter 'userNameOrEmailAddress");
      |        ^
  188 |
  189 |     // ASSERT (BLOCKING) the user remains on the Login page
  190 |     await expect(page).toHaveURL(/\/login/);
    at C:\Users\NomfaneloNhleko\OneDrive\Test-ReportsHub\projects\PD-CRM\test-plans\authentication\admin-portal-authentication.spec.ts:187:8
```
**Location:** C:\Users\NomfaneloNhleko\OneDrive\Test-ReportsHub\projects\PD-CRM\test-plans\authentication\admin-portal-authentication.spec.ts:187:8

### TC-07 (#112740): Verify mandatory username and password validation
**Mode:** playwright-script
**Duration:** 15.1s
- [FAIL] TC-07 (#112740): Verify mandatory username and password validation

**Error:**
```
Error: ADO #112740 expects required-field validation messages; got []

[2mexpect([22m[31mreceived[39m[2m).[22mtoBeGreaterThan[2m([22m[32mexpected[39m[2m)[22m

Expected: > [32m0[39m
Received:   [31m0[39m

  207 |     const messages = await collectMessages(page);
  208 |     expect(messages.length, `ADO #112740 expects required-field validation messages; got ${JSON.stringify(messages)}`)
> 209 |       .toBeGreaterThan(0);
      |        ^
  210 |
  211 |     // ASSERT (BLOCKING) the user remains on the Login page and is not granted access
  212 |     await expect(page).toHaveURL(/\/login/);
    at C:\Users\NomfaneloNhleko\OneDrive\Test-ReportsHub\projects\PD-CRM\test-plans\authentication\admin-portal-authentication.spec.ts:209:8
```
**Location:** C:\Users\NomfaneloNhleko\OneDrive\Test-ReportsHub\projects\PD-CRM\test-plans\authentication\admin-portal-authentication.spec.ts:209:8

### TC-08 (#112741): Verify user logout
**Mode:** playwright-script
**Duration:** 9.6s
- [PASS] TC-08 (#112741): Verify user logout
