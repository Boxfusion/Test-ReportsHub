# Test Plan: ADMINPORTAL-103723 — Verify Authorize Job Posting

> **Status:** Ready
> **Owner:** QA
> **Last Updated:** 2026-08-04
> **Estimated Duration:** 90s

## Metadata
| Field | Value |
|-------|-------|
| App URL | https://pd-recruitment-adminportal-qa.shesha.app/ |
| Environment | QA |
| Login As | Mphoh / 123qwe (Job Authoriser — same role used by the other authoriser test cases in this project) |
| ADO Plan | [#99437 — eRecruitment Test Plan](https://dev.azure.com/boxfusion/pd-recruitment/_testPlans/define?planId=99437) |
| ADO Suite | Not currently linked to a suite in Test Plan #99437 (work item #103723 has no `Tested By` relation) — same situation as the other AdminPortal test cases automated in this hub. |
| ADO Test Case | [#103723](https://dev.azure.com/boxfusion/pd-recruitment/_workitems/edit/103723) — Verify Authorize Job Posting |

## Objective
> Validate the end of the "Do Not Authorise" flow: opening the dialog, populating comments, and clicking **OK** to actually submit the rejection — confirming the system redirects to the My Items page afterward.
>
> **Naming note:** despite the title "Verify Authorize Job Posting," this test case's steps describe the **Do Not Authorise** (reject) flow throughout, not the Authorise (approve) flow — likely a copy/paste naming artefact from a sibling test case. Followed literally per the steps, as instructed.
>
> **⚠️ STATEFUL/DESTRUCTIVE, confirmed with requester before running:** unlike ADMINPORTAL-103712 (which only tests dismissing the dialog via Close, never submitting), TC-07 here clicks OK for real and submits an actual rejection against whichever job posting is opened, consuming it from the shared QA Inbox. Only TC-07 performs the real submission — TC-01 through TC-06 open/abandon the dialog without saving, so only one job posting is affected per run.

## Preconditions
- [ ] App is reachable at https://pd-recruitment-adminportal-qa.shesha.app/
- [ ] Authoriser credentials are valid (Mphoh / 123qwe)
- [ ] At least one item with Action Required "Authorise Job Posting" exists in the Inbox

## Test Cases

### TC-01 — Login as Mphoh

- **Assertions:**
  - [x] ASSERT (BLOCKING) URL no longer contains `/login`

---

### TC-02 — Expand the Workflows menu (ADO #103723 step 3)

- **Assertions:**
  - [x] ASSERT (BLOCKING) "Inbox" submenu item is visible

---

### TC-03 — Navigate to Inbox submenu (ADO #103723 step 4)

- **Assertions:**
  - [x] ASSERT (BLOCKING) "Export" button and Incoming Items table headers are visible

---

### TC-04 — Open any Job with Authorize Job as action required (ADO #103723 step 5)

- **Expected result:** The Job should open in details view with Close, View in PDF, Do Not Authorise, and Authorise buttons displayed
- **Assertions:**
  - [x] ASSERT (BLOCKING) "Close", "View in PDF", "Do Not Authorise", and "Authorise" buttons are all visible

---

### TC-05 — Click on Do Not Authorise button (ADO #103723 step 6)

- **Expected result:** Do Not Authorize dialog should be displayed with a Textarea and a Close button
- **Assertions:**
  - [x] ASSERT (BLOCKING) the dialog is visible with a Comments textarea and a Close button
  - [x] ASSERT (BLOCKING) no OK button exists yet (comments empty)

---

### TC-06 — Populate Comments in the text Area (ADO #103723 step 7)

- **Expected result:** Comments should be successfully displayed in the text area, and the OK button should be displayed after populating comments
- **Assertions:**
  - [x] ASSERT (BLOCKING) the Comments textarea contains the typed text
  - [x] ASSERT (BLOCKING) an "OK" button is now visible

---

### TC-07 — Click on OK button (ADO #103723 step 8) — ⚠️ REAL SUBMISSION

- **Steps:**
  1. TYPE a comment into the Comments textarea
  2. CLICK the OK button
- **Expected result:** The system should redirect users to the My Items page
- **Assertions:**
  - [x] ASSERT (BLOCKING) the dialog closes
  - [x] ASSERT (BLOCKING) the system navigates to the My Items page

---

## Teardown
- No teardown required/possible — TC-07 performs a real, intentional "Do Not Authorise" submission against one job posting from the shared QA Inbox (confirmed with the requester before running). This is not reversible via the UI; the affected job posting's status will show as declined/not-authorised going forward.
