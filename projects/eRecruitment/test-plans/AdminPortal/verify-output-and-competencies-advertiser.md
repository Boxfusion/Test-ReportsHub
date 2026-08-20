# Test Plan: ADMINPORTAL-108069 — Verify Output and Competencies

> **Status:** Ready
> **Owner:** QA
> **Last Updated:** 2026-08-05
> **Estimated Duration:** 90s

## Metadata
| Field | Value |
|-------|-------|
| App URL | https://pd-recruitment-adminportal-qa.shesha.app/ |
| Environment | QA |
| Login As | Moshadih / 123qwe (displays as "Moshadi Houvet" — the Job Advertiser role, same as ADMINPORTAL-103733/103734) |
| ADO Plan | [#99437 — eRecruitment Test Plan](https://dev.azure.com/boxfusion/pd-recruitment/_testPlans/define?planId=99437) |
| ADO Suite | Not currently linked to a suite in Test Plan #99437 (work item #108069 has no `Tested By` relation). Note: unlike the other AdminPortal test cases, this one's steps are defined inline rather than via the shared-step block (`compref`) used by #102822 and its siblings. |
| ADO Test Case | [#108069](https://dev.azure.com/boxfusion/pd-recruitment/_workitems/edit/108069) — Verify Output and Competencies |

## Objective
> Validate that a Job Advertiser, opening any Job Posting awaiting their "Advertise Job Posting" action, sees the "Output and Competency Profiles" tab populated with Requirements, Required Skills and Competencies, and Duties carried over from the job's capture.
>
> **Discrepancy note (same as ADMINPORTAL-103733/103734):** ADO step 5's expected result text ("Close, View in PDF, Do not Authorise, and Authorise buttons displayed") is copy-pasted from the Authoriser flow and does not match this page, which only has **Close** and **View in PDF**. This spec asserts the actual buttons present.
>
> **Data quality note:** the targeted seed job ("2TestingJobSummaryData") has messy placeholder text in these fields (e.g. Requirements reads "Subform salary level checkSubform salary level check", and Required Skills/Duties both just repeat the job name) — this spec only checks the fields are non-empty, matching the ADO wording ("field is populated"), not that the content is meaningful.

## Preconditions
- [ ] App is reachable at https://pd-recruitment-adminportal-qa.shesha.app/
- [ ] Advertiser credentials are valid (Moshadih / 123qwe)
- [ ] At least one item with Action Required "Advertise Job Posting" exists in the Inbox

## Test Cases

### TC-01 — Login with Advertiser credentials (ADO #108069 step 2)

- **Assertions:**
  - [x] ASSERT (BLOCKING) URL no longer contains `/login`

---

### TC-02 — Expand the Workflows menu (ADO #108069 step 3)

- **Assertions:**
  - [x] ASSERT (BLOCKING) "Inbox" submenu item is visible

---

### TC-03 — Navigate to Inbox submenu (ADO #108069 step 4)

- **Assertions:**
  - [x] ASSERT (BLOCKING) "Export" button and Incoming Items table headers are visible

---

### TC-04 — Open any Job with Advertise Job Posting as action required (ADO #108069 step 5)

- **Expected result (actual, corrected):** The Job should open in details view with **Close** and **View in PDF** buttons displayed
- **Assertions:**
  - [x] ASSERT (BLOCKING) "Close" and "View in PDF" buttons are visible

---

### TC-05 — Click on Output and Competency Profiles tab (ADO #108069 step 6)

- **Steps:**
  1. CLICK the "Output and Competency Profiles" tab
- **Expected result:** Output and Competency profiles details should be displayed
- **Assertions:**
  - [x] ASSERT (BLOCKING) "Competency Profile" panel with Requirements/Required Skills and Competencies/Duties is visible

---

### TC-06 — Check if the requirements field is populated (ADO #108069 step 7)

- **Assertions:**
  - [x] ASSERT (BLOCKING) Requirements field is non-empty

---

### TC-07 — Check that required skills and competencies is populated (ADO #108069 step 8)

- **Assertions:**
  - [x] ASSERT (BLOCKING) Required Skills and Competencies field is non-empty

---

### TC-08 — Check that Duties field is populated (ADO #108069 step 9)

- **Assertions:**
  - [x] ASSERT (BLOCKING) Duties field is non-empty

---

## Teardown
- No teardown required. This spec is read-only — it never clicks Close/View in PDF/Save, so it does not mutate the shared QA workflow state.
