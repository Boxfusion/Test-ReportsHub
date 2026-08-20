# Test Plan: ADMINPORTAL-103648 — Recruiter Details

> **Status:** Ready
> **Owner:** QA
> **Last Updated:** 2026-08-04
> **Estimated Duration:** 90s

## Metadata
| Field | Value |
|-------|-------|
| App URL | https://pd-recruitment-adminportal-qa.shesha.app/ |
| Environment | QA |
| Login As | Mphoh / 123qwe (Job Authoriser — same role used by ADMINPORTAL-102865 and ADMINPORTAL-103645) |
| ADO Plan | [#99437 — eRecruitment Test Plan](https://dev.azure.com/boxfusion/pd-recruitment/_testPlans/define?planId=99437) |
| ADO Suite | Not currently linked to a suite in Test Plan #99437 (work item #103648 has no `Tested By` relation) — same situation as the other AdminPortal test cases automated in this hub. |
| ADO Test Case | [#103648](https://dev.azure.com/boxfusion/pd-recruitment/_workitems/edit/103648) — Recruiter Details |

## Objective
> Validate that a Job Authoriser, opening any Job Posting awaiting their "Authorise Job Posting" action from their Inbox, sees the "Recruiter Details" tab populated with the recruiter's Name and Surname, Email Address, and Contact No. (ADO steps 10-11 are empty placeholder `ActionStep`s with no content in the source test case — no-op, not automated.)
>
> Note: the ADO step text says "Name and Surname" (steps 7), but the Authoriser's Recruiter Details tab actually labels this field **"Recruiter"** (a dropdown, e.g. "DHA Recruiter") — this spec targets the real UI label.

## Preconditions
- [ ] App is reachable at https://pd-recruitment-adminportal-qa.shesha.app/
- [ ] Authoriser credentials are valid (Mphoh / 123qwe)
- [ ] At least one item with Action Required "Authorise Job Posting" exists in the Inbox (shared QA data under concurrent modification — the spec opens whichever item is first in the unfiltered Inbox at run time, same rationale as the other authoriser specs in this project)

## Test Cases

### TC-01 — Login as Mphoh

- **Assertions:**
  - [x] ASSERT (BLOCKING) URL no longer contains `/login`

---

### TC-02 — Expand the Workflows menu (ADO #103648 step 3)

- **Assertions:**
  - [x] ASSERT (BLOCKING) "Inbox" submenu item is visible

---

### TC-03 — Navigate to Inbox submenu (ADO #103648 step 4)

- **Assertions:**
  - [x] ASSERT (BLOCKING) "Export" button and Incoming Items table headers are visible

---

### TC-04 — Open any Job with Authorize Job as action required (ADO #103648 step 5)

- **Assertions:**
  - [x] ASSERT (BLOCKING) the details view is displayed

---

### TC-05 — Click on Recruiter Details tab (ADO #103648 step 6)

- **Steps:**
  1. CLICK the "Recruiter Details" tab
- **Expected result:** System should display recruiter details successfully
- **Assertions:**
  - [x] ASSERT (BLOCKING) the Recruiter field is visible on the tab

---

### TC-06 — Check if Name and Surname of the recruiter are populated (ADO #103648 step 7)

- **Expected result:** Field should be populated with Name and Surname
- **Assertions:**
  - [x] ASSERT (BLOCKING) the Recruiter field is non-empty

---

### TC-07 — Check that Email Address is displayed (ADO #103648 step 8)

- **Expected result:** Field should be populated with an email address
- **Assertions:**
  - [x] ASSERT (BLOCKING) Email Address is populated and looks like an email address

---

### TC-08 — Check that contact number is displayed (ADO #103648 step 9)

- **Expected result:** Contact number is populated
- **Assertions:**
  - [x] ASSERT (BLOCKING) Contact No is non-empty

---

## Teardown
- No teardown required. This spec is read-only — it only opens and inspects an existing Inbox item, and never clicks "Authorise" or "Do Not Authorise", so it does not mutate the shared QA workflow state.
