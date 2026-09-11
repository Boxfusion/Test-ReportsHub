# Test Plan: ADMINPORTAL-103645 — Verify Outputs and Competencies details

> **Status:** Ready
> **Owner:** QA
> **Last Updated:** 2026-08-04
> **Estimated Duration:** 90s

## Metadata
| Field | Value |
|-------|-------|
| App URL | https://pd-recruitment-adminportal-qa.shesha.app/ |
| Environment | QA |
| Login As | Mphoh / 123qwe (Job Authoriser — same role used by ADMINPORTAL-102865) |
| ADO Plan | [#99437 — eRecruitment Test Plan](https://dev.azure.com/boxfusion/pd-recruitment/_testPlans/define?planId=99437) |
| ADO Suite | Not currently linked to a suite in Test Plan #99437 (work item #103645 has no `Tested By` relation) — same situation as the other AdminPortal test cases automated in this hub. |
| ADO Test Case | [#103645](https://dev.azure.com/boxfusion/pd-recruitment/_workitems/edit/103645) — Verify Outputs and Competencies details |

## Objective
> Validate that a Job Authoriser, opening any Job Posting awaiting their "Authorise Job Posting" action from their Inbox, sees the "Output and Competency Profiles" tab populated with the correct Requirements, Required Skills and Competencies, and Duties. (ADO steps 10-11 are empty placeholder `ActionStep`s with no content in the source test case — no-op, not automated.)

## Preconditions
- [ ] App is reachable at https://pd-recruitment-adminportal-qa.shesha.app/
- [ ] Authoriser credentials are valid (Mphoh / 123qwe)
- [ ] At least one item with Action Required "Authorise Job Posting" exists in the Inbox (shared QA data under concurrent modification — the spec opens whichever item is first in the unfiltered Inbox at run time, same rationale as `verify-job-information-summary-details.md`)

## Test Cases

### TC-01 — Login as Mphoh

- **Assertions:**
  - [x] ASSERT (BLOCKING) URL no longer contains `/login`

---

### TC-02 — Expand the Workflows menu (ADO #103645 step 3)

- **Assertions:**
  - [x] ASSERT (BLOCKING) "Inbox" submenu item is visible

---

### TC-03 — Navigate to Inbox submenu (ADO #103645 step 4)

- **Assertions:**
  - [x] ASSERT (BLOCKING) "Export" button and Incoming Items table headers are visible

---

### TC-04 — Open any Job with Authorize Job as action required (ADO #103645 step 5)

- **Assertions:**
  - [x] ASSERT (BLOCKING) the details view is displayed

---

### TC-05 — Click on Output and Competencies tab (ADO #103645 step 6)

- **Steps:**
  1. CLICK the "Output and Competency Profiles" tab
- **Expected result:** Output and Competencies details should be displayed
- **Assertions:**
  - [x] ASSERT (BLOCKING) "Competency Profile" panel with Requirements/Required Skills and Competencies/Duties is visible

---

### TC-06 — Check if the requirements field is populated (ADO #103645 step 7)

- **Expected result:** Field shows correct requirements from the job post with Authorize status
- **Assertions:**
  - [x] ASSERT (BLOCKING) Requirements field is non-empty

---

### TC-07 — Check that required skills and competencies is populated (ADO #103645 step 8)

- **Assertions:**
  - [x] ASSERT (BLOCKING) Required Skills and Competencies field is non-empty

---

### TC-08 — Check that Duties field is populated (ADO #103645 step 9)

- **Assertions:**
  - [x] ASSERT (BLOCKING) Duties field is non-empty

---

## Teardown
- No teardown required. This spec is read-only — it only opens and inspects an existing Inbox item, and never clicks "Authorise" or "Do Not Authorise", so it does not mutate the shared QA workflow state.
