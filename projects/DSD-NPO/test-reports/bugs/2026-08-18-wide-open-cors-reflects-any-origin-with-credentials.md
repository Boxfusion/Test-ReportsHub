# Bug: wide-open CORS — API reflects any origin AND allows credentials

**Date:** 2026-08-18
**Severity:** High (Critical in combination with the anonymous-API finding)
**Area:** API (`dsd-npo-api-qa.shesha.app`) — CORS / startup config
**Environment:** QA
**Found by:** TC-14Z-003 (ADO #107321, source bug #102940)

## Summary
The API reflects the caller's `Origin` into `Access-Control-Allow-Origin` for **any** origin, and simultaneously sets
`Access-Control-Allow-Credentials: true`. This lets any website on the internet make credentialed cross-origin
requests to the API through a victim's browser and read the responses.

## Proof
Navigated the test browser to **`https://example.com`** (unrelated origin), then issued a cross-origin `GET` to the API
and successfully read the JSON body (320 590 records) — which the browser only permits when CORS allows the origin.
Raw response headers:
```
access-control-allow-origin: https://example.com
access-control-allow-credentials: true
vary: Origin
```
`Access-Control-Allow-Origin` **echoes the arbitrary request origin** (`https://example.com`), and
`Access-Control-Allow-Credentials` is **true**.

## Expected
CORS should allow only the known first-party origins (the public and admin portals). Reflecting an arbitrary origin
with credentials enabled is disallowed by the CORS spec for `*` precisely because it is unsafe; reflecting the origin
is the equivalent bypass.

## Actual
Any origin is reflected and credentials are allowed.

## Impact
- Any malicious site a signed-in DSD user visits can call the API **with the user's cookies/session** and read the
  responses (cross-site data theft / action-on-behalf).
- Compounds `2026-08-18-api-reachable-without-authentication.md`: the API needs no credentials at all, and now also
  actively invites cross-origin browser access. Together they make the register readable from anywhere, by anyone.

## Fix direction
- Replace origin reflection with an **allow-list** of the exact first-party origins.
- Do not combine credentialed CORS with a reflected/`*` origin.
- Re-check on the built config (the source bug #102940 is "Startup config — Wide-open CORS", so the fix is in the API
  startup/CORS policy).

## Verdict
TC-14Z-003 **CONFIRMED** in its worst form (reflect-origin + allow-credentials).

## Method note
The rigorous test is from an **unrelated origin** (`https://example.com`). A read from the app's own page would prove
nothing; a successful read from `example.com` is definitive.
