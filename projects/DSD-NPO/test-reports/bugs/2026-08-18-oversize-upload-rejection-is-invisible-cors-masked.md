# Bug: an oversized upload is rejected invisibly, and the UI shows the file as attached

**Date:** 2026-08-18
**Severity:** High
**Area:** NPO registration wizard → Documents (step 6) · `PUT /api/StoredFile`
**Environment:** QA · public portal · form `create-npo v62`
**Found by:** TC-05-009 (ADO #101685)
**Application:** APPL26-01270 (`50cc1481-e38e-436d-97df-d7bf89d6f984`), Legal Form Trust

## Summary
Uploading a 50 MB PDF to a document slot fails at the network layer with **no user-visible feedback of any kind**, while
the slot **displays the file as though it attached successfully**. The user is left with a document that looks uploaded,
a `Next` button that is disabled, and no explanation for either.

## Steps to reproduce
1. Open a draft application and advance to **step 6 Documents**.
2. Upload a **50 MB** PDF into `Deeds Of Trust File` (generated locally; 52.43 MB on disk).
3. Observe the slot, any messages, and the `Next` button.
4. Query the application server-side: `NpoApplication/Crud/Get?id=<appId>&properties=deedsOfTrustFile`.

## Expected
Per the ADO case: *"Upload rejected with size-limit error message."* The user should be told the file is too large.

## Actual
- `PUT /api/StoredFile` → **`net::ERR_FAILED`**. No status code, no response body.
- Browser console:
  ```
  Access to XMLHttpRequest at 'https://dsd-npo-api-qa.shesha.app/api/StoredFile'
  from origin 'https://dsd-npo-publicportal-1-qa.shesha.app' has been blocked by CORS policy:
  No 'Access-Control-Allow-Origin' header is present on the requested resource.
  AxiosError: Network Error
  ```
- Server-side `deedsOfTrustFile` remains **`null`** — nothing stored.
- The slot displays **`qa-oversize.pdf (52.43 MB)`** as if attached.
- **Zero** user-visible messages: 0 `.ant-message-notice`, 0 `.ant-notification-notice`, 0 `.ant-form-item-explain-error`.
- `Next` is disabled, with nothing explaining why.
- The phantom entry disappears on page refresh.

## Root cause (evidenced)
The request body exceeds a size limit at the server/proxy, which closes the connection or returns a rejection
**without CORS headers**. Because the origin differs (`…publicportal…` → `…api…`), the browser blocks the response
outright, so the front-end **never sees the status code** — Axios can only report a generic `Network Error`.

**That is why no size-limit message is shown: the client is structurally incapable of reading the rejection.**

## Not intermittent
Retried identically via the slot's `sync`/replace control — same `ERR_FAILED`, same CORS console error,
`deedsOfTrustFile` still `null`.

## Control — this is size-specific, not a broken upload path
Immediately afterwards, a **413-byte** PDF uploaded into the same slot succeeded: file id
`611b85e0-2cab-484a-ba87-030913b8fab2`, slot showed `qa-test.pdf (413 B)`, `Next` became enabled, and a subsequent
download was byte-identical (SHA-256 `0a12fd48…2509`).

## Two defects, and they should be fixed together
1. **The rejection is unreadable by the client.** Emit CORS headers on the body-size-limit rejection path so the SPA
   receives the 413 and can surface *"File too large — maximum is N MB"*.
2. **The UI reports success on a failed upload.** The slot must not render a file that was never stored; the upload
   component should clear the entry and show the error when the request fails.

## Related
- There is **no documented size limit** anywhere in the UI — the Documents step only says *"Note: Please
  download/Upload all required documents."*
- Thabiso's drift note for this case reads: *"Code: **no app-level document size enforcement**; only DocumentStamp
  images limited to 5MB."* That is consistent with what was seen — the cap is **infrastructure**, not application
  logic, which is exactly why it produces no application-level message.
- Same silent-feedback family as `2026-08-17-tab2-validation-is-advisory-invalid-values-save.md`.

## Evidence
`test-reports/2026-08-18/evidence/v3-50mb-shows-attached-but-not-saved.png`
