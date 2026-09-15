# Bug: "Preview in PDF" fails with CORS error for the "General Memo 2" template

**Date logged:** 2026-07-07
**Logged by:** QA (automated run)
**Plan:** test-plans/Memo/verify-preview-in-pdf.md
**Failing TC / step:** TC-01, step 15 (`CLICK a memo template from the list` → template should be displayed) — reproduced when the selected template is **"General Memo 2"**
**Severity:** Medium — isolated to (at least) one specific template, not the whole "Preview in PDF" feature
**Environment:** QA — https://pd-approvals-adminportal-qa.azurewebsites.net/
**ADO Test Case:** [#102651](https://dev.azure.com/boxfusion/pd-approvals/_workitems/edit/102651) — Verify Preview in PDF functionality

## Scope — template-specific, not universal
This was initially thought to break "Preview in PDF" entirely. Follow-up testing shows otherwise:
- **"General Memo 2"** → fails with the CORS error described below.
- **"Memo"** → works correctly; opens the generated PDF in a new browser tab.
- RecipientTest / CC TIHMC / Main Document — not yet individually verified.

So the defect is isolated to specific template(s), most likely something about how the "General Memo 2" template/document is configured or generated server-side that causes that particular request to be handled differently (e.g. an error response without CORS headers, vs. a successful response with them for other templates).

## Expected
After clicking "Preview in PDF" on the New Referrals Draft Memo Compose step and selecting the "General Memo 2" template from the dropdown, the generated PDF should open in a new tab, the same as it does for the "Memo" template.

## Actual
Selecting a template triggers a direct browser request to:

```
GET https://pd-approvals-api-qa.azurewebsites.net/api/MemoPdf/GenerateMemoDocumentPdf?memoWorkflowId=<id>&templateId=<id>
```

This request is **blocked by CORS** — the API does not return an `Access-Control-Allow-Origin` header permitting the `https://pd-approvals-adminportal-qa.azurewebsites.net` origin. The browser console shows:

```
Access to XMLHttpRequest at 'https://pd-approvals-api-qa.azurewebsites.net/api/MemoPdf/GenerateMemoDocumentPdf?memoWorkflowId=6559f56e-1167-4163-83ce-41d3751dd9c1&templateId=e69ab86a-6921-4f65-ae41-17824f7cd1d3' from origin 'https://pd-approvals-adminportal-qa.azurewebsites.net' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.
Error loading PDF: AxiosError: Network Error
Failed to execute action 'shesha.common:Execute Script', error: AxiosError: Network Error
```

No PDF viewer, iframe, or error message is shown to the end user — the Compose page simply remains unchanged, giving no visible indication that anything went wrong. This was confirmed by directly monitoring network responses and browser console output during test authoring (not inferred from the automated assertion alone).

## Repro
1. Log in as `Ian / 123qwe` at https://pd-approvals-adminportal-qa.azurewebsites.net/login.
2. Switch the header view-mode control from "Live" to "Latest".
3. Navigate to Workflows → My Items → Create New → New Referrals.
4. On the Draft Memo Compose step, click "Preview in PDF".
5. Select any template from the dropdown (e.g. "General Memo 2").
6. Observe: no PDF appears; open DevTools console to see the CORS/network error.

## Suspected cause
The frontend (`pd-approvals-adminportal-qa.azurewebsites.net`) calls the `MemoPdf/GenerateMemoDocumentPdf` endpoint on the API host (`pd-approvals-api-qa.azurewebsites.net`) directly via XHR/Axios instead of through a same-origin proxy/rewrite/new-tab navigation. Since the same endpoint works for the "Memo" template, CORS itself is likely configured correctly for the happy path — the more probable cause is that generating the "General Memo 2" document raises a server-side error (e.g. a missing merge field, template asset, or an unhandled exception), and the resulting **error response** doesn't carry `Access-Control-Allow-Origin` the way the successful response does. Worth checking the API logs for this specific `templateId` around the timestamps in this report.

## Recommendation
- Check the API logs for the `MemoPdf/GenerateMemoDocumentPdf` call with `templateId=e69ab86a-6921-4f65-ae41-17824f7cd1d3` ("General Memo 2") to find the underlying server-side error.
- Ensure error responses from this endpoint always include CORS headers (many frameworks only apply CORS middleware to successful responses by default — that's a common way to reproduce exactly this symptom).
- Surface a visible error toast to the user when PDF generation fails, rather than failing silently.
- Once fixed, re-verify "General Memo 2" and check the remaining untested templates (RecipientTest, CC TIHMC, Main Document).
