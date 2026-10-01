# Bug — NC Dispatch QA rejects the documented Admin credentials (all Administrative Functions tests blocked)

**Date logged:** 2026-09-29
**Plan:** `projects/dispatch/test-plans/administrative-functions/admin-functions-crud.md`
**Spec:** `projects/dispatch/test-plans/administrative-functions/admin-functions-crud.spec.ts`
**Failing TC:** `TC-00 — Log in to NC Dispatch` (and, by dependency, all 23 remaining tests — every `Add …` / `Edit …` case calls `login()` first)
**Environment:** QA — https://ncdoh-dispatcher-adminportal-qa.shesha.app/login
**Suspected category:** `data`

## Step

```
// STEP: login() — POST credentials via the Sign In button, then wait to leave /login
await page.getByRole('button', { name: 'Sign In' }).click();
await page.waitForURL((url) => !url.href.includes('/login'), { timeout: 30000 });
```

## Expected

Signing in as `Admin` / `123qwe` (the credentials recorded in `projects/dispatch/CLAUDE.md` → Credentials) authenticates and redirects away from `/login`.

## Actual

The auth endpoint returns **HTTP 401 — "Invalid user name or password"**. The browser stays on `/login`, so `waitForURL` times out after 30s. The login form itself is healthy: both fields are located and filled, and the Sign In button is found and clicked — the failure is server-side rejection, not a selector drift.

```
POST https://ncdoh-dispatcher-api-qa.shesha.app/api/TokenAuth/Authenticate  → 401
{
  "result": null,
  "success": false,
  "error": {
    "code": 0,
    "message": "Invalid user name or password",
    "details": "Invalid user name or password",
    "validationErrors": null
  },
  "unAuthorizedRequest": true,
  "__abp": true
}
```

Browser console at the same moment:

```
[console:error] Failed to load resource: the server responded with a status of 401 ()
[console:error] Failed to execute action 'shesha.common:Sign In', error: J
```

## Playwright error

```
TimeoutError: page.waitForURL: Timeout 30000ms exceeded.
=========================== logs ===========================
waiting for navigation until "load"
============================================================

  28 |   await page.getByPlaceholder('Password').fill(ADMIN.password);
  29 |   await page.getByRole('button', { name: 'Sign In' }).click();
> 30 |   await page.waitForURL((url) => !url.href.includes('/login'), { timeout: 30000 });
     |              ^
    at login (projects/dispatch/test-plans/administrative-functions/admin-functions-crud.spec.ts:30:14)
    at projects/dispatch/test-plans/administrative-functions/admin-functions-crud.spec.ts:130:5
```

## Snapshot / screenshot

- `projects/dispatch/test-results/artifacts/projects-dispatch-test-pla-ba53b-TC-00-Log-in-to-NC-Dispatch-chromium/test-failed-1.png`
- `projects/dispatch/test-results/artifacts/projects-dispatch-test-pla-ba53b-TC-00-Log-in-to-NC-Dispatch-chromium/error-context.md`
- `projects/dispatch/test-results/artifacts/projects-dispatch-test-pla-ba53b-TC-00-Log-in-to-NC-Dispatch-chromium/trace.zip`

The failure screenshot shows the login form correctly populated (`Admin` visible in the Username field, password masked) with no error banner rendered on the page — the 401 is only visible in the network log.

## Suspected cause

The QA `Admin` account's password no longer matches the `123qwe` recorded in `CLAUDE.md` — most likely rotated, or the account was disabled/locked after the repeated failed nightly CI logins. The app is otherwise healthy: the portal serves HTTP 200, and the unauthenticated settings/form-configuration API calls all return 200.

## Impact

Blocks the entire `admin-functions-crud` suite (24 tests) and every other `dispatch` plan, since all of them authenticate through the same hardcoded constant. The nightly CI run has been failing on this since at least 2026-09-24.

## Suggested fix (needs a human — credentials are not derivable from the repo)

1. Confirm the current QA password for `Admin`, or have a dedicated automation account provisioned.
2. Update `projects/dispatch/CLAUDE.md` → Credentials.
3. Preferably stop hardcoding it: read `ADMIN_USERNAME` / `ADMIN_PASSWORD` from the hub `.env` (the keys already exist in `.env.example`) and set the matching GitHub secret so CI and local runs share one source. The spec currently pins the value at `admin-functions-crud.spec.ts:19`.
