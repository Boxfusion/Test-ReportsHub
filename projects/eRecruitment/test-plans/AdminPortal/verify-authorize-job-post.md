# Test Plan: ADMINPORTAL-106623 — Verify Authorize Job post

> **Status:** Ready
> **Owner:** QA
> **Last Updated:** 2026-08-05
> **Estimated Duration:** 60s

## Metadata
| Field | Value |
|-------|-------|
| App URL | https://pd-recruitment-adminportal-qa.shesha.app/ |
| Environment | QA |
| Login As | Mphoh / 123qwe (Job Authoriser — same role used by the other authoriser test cases in this project) |
| ADO Plan | [#99437 — eRecruitment Test Plan](https://dev.azure.com/boxfusion/pd-recruitment/_testPlans/define?planId=99437) |
| ADO Suite | Not currently linked to a suite in Test Plan #99437 (work item #106623 has no `Tested By` relation) — same situation as the other AdminPortal test cases automated in this hub. |
| ADO Test Case | [#106623](https://dev.azure.com/boxfusion/pd-recruitment/_workitems/edit/106623) — Verify Authorize Job post |

## Objective
> Validate that clicking the **Authorise** button on a Job Posting's details view actually approves it: a "Job posting updated successfully" message should appear and the system should navigate to the My Items menu.
>
> **⚠️ STATEFUL, confirmed with requester before running:** unlike ADMINPORTAL-103712/103725 (dialog-cancel / additive-comment, non-destructive), TC-05 here clicks Authorise for real and approves whichever job posting is opened, advancing it to its next workflow stage in the shared QA data. This is analogous to ADMINPORTAL-103723's real rejection, but on the approval side.

## Preconditions
- [ ] App is reachable at https://pd-recruitment-adminportal-qa.shesha.app/
- [ ] Authoriser credentials are valid (Mphoh / 123qwe)
- [ ] At least one item with Action Required "Authorise Job Posting" exists in the Inbox

## Test Cases

### TC-01 — Login as Mphoh

- **Assertions:**
  - [x] ASSERT (BLOCKING) URL no longer contains `/login`

---

### TC-02 — Expand the Workflows menu (ADO #106623 step 3)

- **Assertions:**
  - [x] ASSERT (BLOCKING) "Inbox" submenu item is visible

---

### TC-03 — Navigate to Inbox submenu (ADO #106623 step 4)

- **Assertions:**
  - [x] ASSERT (BLOCKING) "Export" button and Incoming Items table headers are visible

---

### TC-04 — Open any Job with Authorize Job as action required (ADO #106623 step 5)

- **Expected result:** The Job should open in details view with Close, View in PDF, Do Not Authorise, and Authorise buttons displayed
- **Assertions:**
  - [x] ASSERT (BLOCKING) "Close", "View in PDF", "Do Not Authorise", and "Authorise" buttons are all visible

---

### TC-05 — Click on "Authorise" button (ADO #106623 step 6) — ⚠️ REAL SUBMISSION

- **Steps:**
  1. CLICK the "Authorise" button
- **Expected result:** "Job posting updated successfully" message should be displayed and the system should navigate to the My Items menu
- **Assertions:**
  - [x] ASSERT (best-effort, non-blocking) a "Job posting updated successfully" notification appears — confirmed live 2026-08-05 to be transient/racy to catch reliably
  - [x] ASSERT (BLOCKING) the system navigates to the My Items page

---

## Teardown
- No teardown required/possible — TC-05 performs a real, intentional "Authorise" submission against one job posting from the shared QA Inbox (confirmed with the requester before running). This is not reversible via the UI; the affected job posting advances to its next workflow stage.
