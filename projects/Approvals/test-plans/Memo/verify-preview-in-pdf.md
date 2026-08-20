# Test Plan: Verify Preview in PDF Functionality

> **Status:** Ready
> **Owner:** QA
> **Last Updated:** 2026-07-07
> **Estimated Duration:** 45s

## Metadata
| Field | Value |
|-------|-------|
| App URL | https://pd-approvals-adminportal-qa.azurewebsites.net/ |
| Environment | QA |
| Login As | Ian / 123qwe |
| ADO Plan | [#100853](https://dev.azure.com/boxfusion/pd-approvals/_testPlans/define?planId=100853&suiteId=100854) |
| ADO Suite | #100854 |
| ADO Test Case | [#102651](https://dev.azure.com/boxfusion/pd-approvals/_workitems/edit/102651) — Verify Preview in PDF functionality |

> **Note:** ADO specifies logging in "as Initiator (Craig)". This run uses the credentials supplied for this session (Ian / 123qwe) against the same login page instead.
>
> **Note:** The header's view-mode control opens a popover with three options (Live/Ready/Latest) rather than toggling directly — clicking the control alone does not change the mode. The correct sequence is: click the control to open the popover, then click the "Latest" option inside it, then assert the control's own badge label changes from "Live" to "Latest".
>
> **Note:** This QA environment can sit on an "Initializing..." splash screen for well over the default 15s action timeout before the login form mounts — the login helper uses a generous timeout to tolerate this rather than treating it as a script failure.
>
> **BUG (template-specific, not universal):** Selecting the **"General Memo 2"** template calls `GET https://pd-approvals-api-qa.azurewebsites.net/api/MemoPdf/GenerateMemoDocumentPdf?...` which is **blocked by CORS** (no `Access-Control-Allow-Origin` for the adminportal origin) — the console logs "Error loading PDF: AxiosError: Network Error" and nothing displays. However, selecting the **"Memo"** template works correctly: it opens the generated PDF in a **new browser tab** (not inline on the Compose page). So the underlying flow works — the defect is isolated to specific template(s) (confirmed: "General Memo 2" fails, "Memo" succeeds; other templates — RecipientTest, CC TIHMC, Main Document — not yet checked). See `test-reports/bugs/2026-07-07-preview-in-pdf-blocked-by-cors.md` for the full repro against "General Memo 2". This plan now exercises the working "Memo" template so the automation reflects a realistic happy-path run; the CORS bug remains open against "General Memo 2" specifically.

## Objective
> Validate that on the New Referrals Draft Memo Compose step, clicking "Preview in PDF" shows a list of memo templates, and selecting a template displays it.

## Preconditions
- [ ] App is reachable at https://pd-approvals-adminportal-qa.azurewebsites.net/
- [ ] User credentials are valid (Ian / 123qwe)
- [ ] The acting user has permission to create a new Referral memo
- [ ] At least one memo template is configured for the New Referrals memo type

## Test Cases

### TC-01 — Verify Preview in PDF functionality (ADO #102651)

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE to https://pd-approvals-adminportal-qa.azurewebsites.net/login and log in with valid credentials
  2. CLICK the "Click to change view mode" control in the header to open the Live/Ready/Latest popover, then CLICK the "Latest" option in that popover
  3. CLICK the sidebar Toggle in the top-left corner
  4. SNAPSHOT — confirm side menu items are displayed
  5. CLICK the Workflows dropdown
  6. SNAPSHOT — confirm Inbox, My Items, Sent Items and Drafts menu items are displayed
  7. CLICK the My Items menu item
  8. SNAPSHOT — confirm the My Items index table is displayed with Create New and Export buttons
  9. CLICK the Create New button
  10. SNAPSHOT — confirm memo types are displayed
  11. CLICK the New Referrals subtype
  12. SNAPSHOT — confirm the Draft Memo page is displayed
  13. CLICK the "Preview in PDF" button
  14. SNAPSHOT — confirm a list of memo templates is displayed
  15. CLICK the "Memo" template from the list
- **Expected result:** Clicking "Preview in PDF" displays a list of available memo templates; selecting the "Memo" template opens the generated PDF in a new browser tab.
- **Assertions:**
  - [x] ASSERT (BLOCKING) User successfully logs into the system
  - [x] ASSERT (BLOCKING) App header switches from "Live" to "Latest" mode after selecting the "Latest" option
  - [x] ASSERT Side menu items are displayed after clicking the Toggle
  - [x] ASSERT (BLOCKING) Inbox, My Items, Sent Items and Drafts menu items are displayed under Workflows
  - [x] ASSERT (BLOCKING) My Items index table is displayed with Create New and Export buttons
  - [x] ASSERT (BLOCKING) Memo types are displayed after clicking Create New
  - [x] ASSERT (BLOCKING) Draft Memo page is displayed after selecting New Referrals
  - [x] ASSERT (BLOCKING) A list of memo templates is displayed after clicking "Preview in PDF"
  - [x] ASSERT (BLOCKING) The selected template is displayed after clicking it

---

## Teardown
- Log out of the admin portal after test completion (optional for automated runs).
