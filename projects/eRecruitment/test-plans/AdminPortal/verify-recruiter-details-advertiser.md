# Test Plan: ADMINPORTAL-108070 — Verify Recruiter Details

> **Status:** Ready
> **Owner:** QA
> **Last Updated:** 2026-08-05
> **Estimated Duration:** 90s

## Metadata
| Field | Value |
|-------|-------|
| App URL | https://pd-recruitment-adminportal-qa.shesha.app/ |
| Environment | QA |
| Login As | Moshadih / 123qwe (displays as "Moshadi Houvet" — the Job Advertiser role, same as ADMINPORTAL-103733/103734/108069) |
| ADO Plan | [#99437 — eRecruitment Test Plan](https://dev.azure.com/boxfusion/pd-recruitment/_testPlans/define?planId=99437) |
| ADO Suite | Not currently linked to a suite in Test Plan #99437 (work item #108070 has no `Tested By` relation). Note: like #108069, this test case's steps are defined inline rather than via the shared-step block used by #102822 and its siblings. |
| ADO Test Case | [#108070](https://dev.azure.com/boxfusion/pd-recruitment/_workitems/edit/108070) — Verify Recruiter Details |

## Objective
> Validate that a Job Advertiser, opening any Job Posting awaiting their "Advertise Job Posting" action, sees the "Recruiter Details" tab populated with the recruiter's Name and Surname, Email Address, and Contact No.
>
> **Discrepancy notes:**
> - ADO step 5's expected result text ("Close, View in PDF, Do not Authorise, and Authorise buttons displayed") is copy-pasted from the Authoriser flow and does not match this page, which only has **Close** and **View in PDF**.
> - ADO step 7 says "Name and Surname of the recruiter" — on the **Authoriser's** equivalent view (ADMINPORTAL-103648) this field is actually labelled "Recruiter", but on this **Advertiser** view it is labelled **"Name and Surname"** (matching the Job Capturer's original wizard label). This spec targets the real label for this page.

## Preconditions
- [ ] App is reachable at https://pd-recruitment-adminportal-qa.shesha.app/
- [ ] Advertiser credentials are valid (Moshadih / 123qwe)
- [ ] At least one item with Action Required "Advertise Job Posting" exists in the Inbox

## Test Cases

### TC-01 — Login with Advertiser credentials (ADO #108070 step 2)

- **Assertions:**
  - [x] ASSERT (BLOCKING) URL no longer contains `/login`

---

### TC-02 — Expand the Workflows menu (ADO #108070 step 3)

- **Assertions:**
  - [x] ASSERT (BLOCKING) "Inbox" submenu item is visible

---

### TC-03 — Navigate to Inbox submenu (ADO #108070 step 4)

- **Assertions:**
  - [x] ASSERT (BLOCKING) "Export" button and Incoming Items table headers are visible

---

### TC-04 — Open any Job with Advertise Job Posting as action required (ADO #108070 step 5)

- **Expected result (actual, corrected):** The Job should open in details view with **Close** and **View in PDF** buttons displayed
- **Assertions:**
  - [x] ASSERT (BLOCKING) "Close" and "View in PDF" buttons are visible

---

### TC-05 — Click on Recruiter Details tab (ADO #108070 step 6)

- **Steps:**
  1. CLICK the "Recruiter Details" tab
- **Expected result:** System should display recruiter details successfully
- **Assertions:**
  - [x] ASSERT (BLOCKING) the Name and Surname value is visible on the tab

---

### TC-06 — Check if Name and Surname of the recruiter are populated (ADO #108070 step 7)

- **Assertions:**
  - [x] ASSERT (BLOCKING) Name and Surname field is non-empty

---

### TC-07 — Check that Email Address is displayed (ADO #108070 step 8)

- **Assertions:**
  - [x] ASSERT (BLOCKING) Email Address is populated and looks like an email address

---

### TC-08 — Check that contact number is displayed (ADO #108070 step 9)

- **Assertions:**
  - [x] ASSERT (BLOCKING) Contact No is non-empty

---

## Teardown
- No teardown required. This spec is read-only — it never clicks Close/View in PDF/Save, so it does not mutate the shared QA workflow state.
