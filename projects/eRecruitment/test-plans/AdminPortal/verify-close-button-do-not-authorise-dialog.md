# Test Plan: ADMINPORTAL-103712 — Verify Close button on Do not authorise dialog

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
| ADO Suite | Not currently linked to a suite in Test Plan #99437 (work item #103712 has no `Tested By` relation) — same situation as the other AdminPortal test cases automated in this hub. |
| ADO Test Case | [#103712](https://dev.azure.com/boxfusion/pd-recruitment/_workitems/edit/103712) — Verify Close button on Do not authorise dialog |

## Objective
> Validate that a Job Authoriser can open the "Do Not Authorize" dialog from a Job Posting's details view, that it shows a warning message + Comments textarea + Close button, that typing a comment causes an "OK" button to appear/become enabled, and that clicking the dialog's **Close** button (not OK) dismisses it without submitting the rejection — the job posting remains untouched (still "In Progress", Authorise still available).
>
> Note: this test case's ADO steps are numbered 3,4,5,6,8,7 in that document order (step 8 "Populate Comments" appears before step 7 "Click Close" despite the lower number) — this spec follows document order, which also matches the only sensible real sequence (comments must be entered before the dialog is closed for the OK-button-enables check to mean anything).

## Preconditions
- [ ] App is reachable at https://pd-recruitment-adminportal-qa.shesha.app/
- [ ] Authoriser credentials are valid (Mphoh / 123qwe)
- [ ] At least one item with Action Required "Authorise Job Posting" exists in the Inbox

## Test Cases

### TC-01 — Login as Mphoh

- **Assertions:**
  - [x] ASSERT (BLOCKING) URL no longer contains `/login`

---

### TC-02 — Expand the Workflows menu (ADO #103712 step 3)

- **Assertions:**
  - [x] ASSERT (BLOCKING) "Inbox" submenu item is visible

---

### TC-03 — Navigate to Inbox submenu (ADO #103712 step 4)

- **Assertions:**
  - [x] ASSERT (BLOCKING) "Export" button and Incoming Items table headers are visible

---

### TC-04 — Open any Job with Authorize Job as action required (ADO #103712 step 5)

- **Expected result:** The Job should open in details view with Close, View in PDF, Do Not Authorise, and Authorise buttons displayed
- **Assertions:**
  - [x] ASSERT (BLOCKING) "Close", "View in PDF", "Do Not Authorise", and "Authorise" buttons are all visible

---

### TC-05 — Click on Do Not Authorise button (ADO #103712 step 6)

- **Steps:**
  1. CLICK the "Do Not Authorise" button
- **Expected result:** The "Do Not Authorize" dialog should be displayed with a Comments textarea and a Close button
- **Assertions:**
  - [x] ASSERT (BLOCKING) the dialog (titled "Do Not Authorize") is visible with a Comments textarea and a Close button

---

### TC-06 — Populate Comments (ADO #103712 step 8)

- **Steps:**
  1. TYPE a comment into the Comments textarea
- **Expected result:** Comments should be populated successfully and the OK button should be enabled
- **Assertions:**
  - [x] ASSERT (BLOCKING) the Comments textarea contains the typed text
  - [x] ASSERT (BLOCKING) an "OK" button is now visible and enabled

---

### TC-07 — Click on Close button (ADO #103712 step 7)

- **Steps:**
  1. CLICK the dialog's Close button (not OK)
- **Expected result:** The system should close the Do Not Authorize dialog successfully
- **Assertions:**
  - [x] ASSERT (BLOCKING) the dialog is no longer visible
  - [x] ASSERT (BLOCKING) the job posting is unaffected — the "Authorise" button is still visible on the underlying details view (i.e. the rejection was NOT submitted)

---

## Teardown
- No teardown required. This spec never clicks OK/submits the rejection or clicks Authorise — it only opens and cancels the Do Not Authorize dialog, so it does not mutate the shared QA workflow state.
