# Test Plan: ADMINPORTAL-103725 — Authorize Job posting comments

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
| ADO Suite | Not currently linked to a suite in Test Plan #99437 (work item #103725 has no `Tested By` relation) — same situation as the other AdminPortal test cases automated in this hub. |
| ADO Test Case | [#103725](https://dev.azure.com/boxfusion/pd-recruitment/_workitems/edit/103725) — Authorize Job posting comments |

## Objective
> Validate that a Job Authoriser can add a note via the "Comments" panel on a Job Posting's details view: typing into the Comments textarea reveals an enabled Save button, and clicking Save persists the comment, displaying it below the Save button along with the authorizer's name, date, and time.
>
> **STATEFUL (additive, non-destructive):** this adds a real, permanent comment to whichever job posting is opened — it does not change the job's authorisation status (no Authorise/Do Not Authorise is clicked), so it's a low-risk addition compared to ADMINPORTAL-103723 (which submits a real rejection).

## Preconditions
- [ ] App is reachable at https://pd-recruitment-adminportal-qa.shesha.app/
- [ ] Authoriser credentials are valid (Mphoh / 123qwe)
- [ ] At least one item with Action Required "Authorise Job Posting" exists in the Inbox

## Test Cases

### TC-01 — Login as Mphoh

- **Assertions:**
  - [x] ASSERT (BLOCKING) URL no longer contains `/login`

---

### TC-02 — Expand the Workflows menu (ADO #103725 step 3)

- **Assertions:**
  - [x] ASSERT (BLOCKING) "Inbox" submenu item is visible

---

### TC-03 — Navigate to Inbox submenu (ADO #103725 step 4)

- **Assertions:**
  - [x] ASSERT (BLOCKING) "Export" button and Incoming Items table headers are visible

---

### TC-04 — Open any Job with Authorize Job as action required (ADO #103725 step 5)

- **Expected result:** The Job should open in details view with Close, View in PDF, Do Not Authorise, and Authorise buttons displayed
- **Assertions:**
  - [x] ASSERT (BLOCKING) "Close", "View in PDF", "Do Not Authorise", and "Authorise" buttons are all visible

---

### TC-05 — Navigate to Comments panel and populate comments (ADO #103725 step 6)

- **Steps:**
  1. TYPE a comment into the Comments panel's textarea
- **Expected result:** Comments should be successfully populated in the text area and the Save button should be displayed (enabled) after comments are populated
- **Assertions:**
  - [x] ASSERT (BLOCKING) the Comments textarea contains the typed text
  - [x] ASSERT (BLOCKING) the Save button is enabled (it is disabled while the textarea is empty)

---

### TC-06 — Click on Save button (ADO #103725 step 7)

- **Steps:**
  1. CLICK the Save button
- **Expected result:** The comment should be saved and displayed below the Save button along with the authorizer's name, date, and time
- **Assertions:**
  - [x] ASSERT (BLOCKING) the typed comment text is visible below the Save button
  - [x] ASSERT (BLOCKING) the authorizer's name ("Mpho Hlalele") is visible alongside the comment
  - [x] ASSERT (BLOCKING) a date/time stamp is visible alongside the comment

---

## Teardown
- No teardown required/possible — this adds a real, permanent comment to whichever job posting is opened. This is additive only (no data is overwritten or removed) and does not change the job's authorisation status.
