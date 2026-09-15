# Bug: A failed login shows the user nothing at all

**Date:** 2026-08-13
**Severity:** High (usability)
**Status:** Open — verified
**Portal:** Public (`/login`)
**Found in:** NPO-01 TC-01-001 (ADO #101595)

## Summary
Submitting invalid credentials returns **HTTP 401** from the API, but the UI gives **no indication whatsoever** —
no error message, no field highlight, no toast. The page simply stays on the login form.

## Steps to reproduce
1. Go to `https://dsd-npo-publicportal-1-qa.shesha.app/login`
2. Enter `qa.tester0812@example.org` / `Boxfusion@2026`
3. Click **Login**

## Actual
- `POST /api/TokenAuth/Authenticate` → **401** (reproduced twice)
- The page stays on `/login`
- **Zero feedback**: no `.ant-form-item-explain-error`, no `.ant-alert`, no `.ant-message`, nothing in the DOM
- Both fields retain their values, so the form looks untouched

## Expected
A clear message such as *"Invalid email or password"*. ADO #101595 covers the success path; the wrong-credentials
case is TC-01-002 in the Functional plan — but **silent failure is a defect against any reading**, because the
user cannot distinguish a wrong password from a slow network or a broken button.

## Impact
Users will retry indefinitely, then contact support. It also masks genuine outages: an API failure and a typo
look identical.

## Notes
- The same **silent-failure pattern** is already logged for form saves in
  `2026-08-12-validation-errors-not-surfaced.md` (a 400 with `validationErrors` discarded, so a rejected save
  looked like a success). **This is that same class of fault on the authentication path** — the two are likely
  one shared error-handling gap and probably one fix.
- ⚠️ Separately, **confirm whether `qa.tester0812@example.org` is meant to work on the public portal.** The
  NPO-01 plan lists it as a valid precondition account, but it 401s there;
  `mpenduloizwelinuk@gmail.com` signs in successfully on the same form.
