# Test Plan: ADMINPORTAL-103649 — Verify Close button

> **Status:** Ready
> **Owner:** QA
> **Last Updated:** 2026-08-04
> **Estimated Duration:** 240s (TC-05 alone waits ~3 minutes for the reported auto-refresh cycle before checking navigation)

## Metadata
| Field | Value |
|-------|-------|
| App URL | https://pd-recruitment-adminportal-qa.shesha.app/ |
| Environment | QA |
| Login As | Mphoh / 123qwe (Job Authoriser — same role used by the other authoriser test cases in this project) |
| ADO Plan | [#99437 — eRecruitment Test Plan](https://dev.azure.com/boxfusion/pd-recruitment/_testPlans/define?planId=99437) |
| ADO Suite | Not currently linked to a suite in Test Plan #99437 (work item #103649 has no `Tested By` relation) — same situation as the other AdminPortal test cases automated in this hub. |
| ADO Test Case | [#103649](https://dev.azure.com/boxfusion/pd-recruitment/_workitems/edit/103649) — Verify Close button |

## Objective
> Validate that a Job Authoriser, opening any Job Posting awaiting their "Authorise Job Posting" action, sees the Close / View in PDF / Do Not Authorise / Authorise action buttons, and that clicking Close returns them to the Incoming Items (Inbox) page.

## Preconditions
- [ ] App is reachable at https://pd-recruitment-adminportal-qa.shesha.app/
- [ ] Authoriser credentials are valid (Mphoh / 123qwe)
- [ ] At least one item with Action Required "Authorise Job Posting" exists in the Inbox

## Test Cases

### TC-01 — Login as Mphoh

- **Assertions:**
  - [x] ASSERT (BLOCKING) URL no longer contains `/login`

---

### TC-02 — Expand the Workflows menu (ADO #103649 step 3)

- **Assertions:**
  - [x] ASSERT (BLOCKING) "Inbox" submenu item is visible

---

### TC-03 — Navigate to Inbox submenu (ADO #103649 step 4)

- **Assertions:**
  - [x] ASSERT (BLOCKING) "Export" button and Incoming Items table headers are visible

---

### TC-04 — Open any Job with Authorize Job as action required (ADO #103649 step 5)

- **Expected result:** The Job should open in details view with Close, View in PDF, Do Not Authorise, and Authorise buttons displayed
- **Assertions:**
  - [x] ASSERT (BLOCKING) "Close", "View in PDF", "Do Not Authorise", and "Authorise" buttons are all visible

---

### TC-05 — Click on Close button (ADO #103649 step 6)

- **Steps:**
  1. CLICK the Close button
  2. WAIT a few minutes for the system to finish auto-refreshing (per QA guidance 2026-08-04) before checking navigation
- **Expected result:** The system should close job details and navigate back to the Incoming Items page
- **Assertions:**
  - [x] ASSERT (BLOCKING) the "Incoming Items" (Inbox) page heading is visible and the details view's "Authorise" button is gone — checked by page content, not URL, per QA guidance 2026-08-04

---

## Teardown
- No teardown required. This spec is read-only — it never clicks "Authorise" or "Do Not Authorise". Note: confirmed live on 2026-08-04 that clicking Close does NOT navigate back to the Inbox (the URL and page stay on the job details view) — a hard reload of the same record confirms no data was mutated, but this is a real discrepancy from the ADO test case's expected result, not a spec authoring mistake. See TC-05.
