# Bug: sign-in has no client-side validation, and empty credentials crash the error handler (silent failure)

**Date:** 2026-08-18
**Severity:** Medium
**Area:** Public portal → Sign-In (`/login`)
**Environment:** QA
**Found by:** TC-01-004 (ADO #101598) and TC-01-005 (ADO #101599)

## Summary
The Sign-In form performs **no client-side validation**. A malformed email is sent to the server, and an
empty-credentials submit triggers an HTTP **415** whose response shape the client's error handler does not expect —
the handler throws, so **the user sees no message at all** on that path.

## A — Malformed email is not caught (TC-01-004)
1. Enter `not-an-email` + any password → **Login**.
- **Expected:** field-level *"Enter a valid email"*; submit not processed.
- **Actual:** no field error; `POST /api/TokenAuth/Authenticate` fires; server returns `401`; UI shows the generic
  toast **"Invalid user name or password"** (`ant-message-notice-error`, auto-dismisses ≈3s).
- **Verdict: FAIL** — no client validation, and the resulting message misleads (it is a format problem, not bad creds).

## B — Empty credentials: silent, because the handler crashes (TC-01-005)
1. Reload for a pristine form. Leave email **and** password empty → **Login** (the button is **enabled**).
- **Expected:** required-field errors on both.
- **Actual:** zero field errors, zero `aria-invalid`, and the request **still fires**. Server returns
  **`415 Unsupported Media Type`**, then the client throws:
  ```
  Failed to execute action 'shesha.common:Execute Script',
  error: TypeError: Cannot read properties of null (reading 'details')
  ```
  The error-display code reads `error.details` off a response body the 415 doesn't provide, so it crashes and **no
  message is rendered**. The user clicks Login and nothing visibly happens.
- **Verdict: FAIL** — no required-field validation; the failure is genuinely silent, via a client-side crash.

## Root-cause split (evidenced)
- Wrong-password, wrong-email and malformed-email all produce a **401** → the handler renders the toast correctly.
- Empty fields produce a **415** (no JSON error body) → the handler hits `null.details` and throws.
So the silence is specific to the 415 path, not a blanket "no feedback".

## Fix direction
1. Add client-side validation: required on both fields, email format on the email field; keep `Login` disabled until
   both are non-empty (matches the rest of the platform's forms).
2. Make the error handler null-safe — fall back to a generic message when the response has no `error.details`
   (covers 415 and any other non-standard error).

## Method note
Both messages were captured with a **MutationObserver installed before the click**, not a delayed DOM snapshot — AntD
toasts live ≈3s and a single post-click query misses them. This corrected an initial "no feedback for either case"
reading. See [[read-console-before-calling-failure-silent]].

## Evidence
`test-reports/2026-08-18/evidence/v9-malformed-email-no-feedback-401-sent.png` (toast already dismissed by capture time
— the observer log holds the text), and the console 415 + TypeError recorded in the run report.
