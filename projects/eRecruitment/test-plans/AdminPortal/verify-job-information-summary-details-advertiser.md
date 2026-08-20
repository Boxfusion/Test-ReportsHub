# Test Plan: ADMINPORTAL-103734 — Verify Job information summary details

> **Status:** Ready
> **Owner:** QA
> **Last Updated:** 2026-08-05
> **Estimated Duration:** 90s

## Metadata
| Field | Value |
|-------|-------|
| App URL | https://pd-recruitment-adminportal-qa.shesha.app/ |
| Environment | QA |
| Login As | Moshadih / 123qwe (displays as "Moshadi Houvet" — the Job Advertiser role, same as ADMINPORTAL-103733) |
| ADO Plan | [#99437 — eRecruitment Test Plan](https://dev.azure.com/boxfusion/pd-recruitment/_testPlans/define?planId=99437) |
| ADO Suite | Not currently linked to a suite in Test Plan #99437 (work item #103734 has no `Tested By` relation) — same situation as the other AdminPortal test cases automated in this hub. |
| ADO Test Case | [#103734](https://dev.azure.com/boxfusion/pd-recruitment/_workitems/edit/103734) — Verify Job information summary details |

## Objective
> Validate that a Job Advertiser, opening any Job Posting awaiting their "Advertise Job Posting" action from their Inbox, sees the Job Information Summary tab populated with the correct Job Reference Number, Province/Branch, Salary Range, Centre/Office Name, and Closing Date.
>
> **Discrepancy note (same as ADMINPORTAL-103733):** ADO step 5's expected result text ("Close, View in PDF, Do not Authorise, and Authorise buttons displayed") is copy-pasted from the Authoriser flow's shared steps and does not match the Advertiser's actual details view, which only has **Close** and **View in PDF** buttons. This spec asserts the actual buttons present.

## Preconditions
- [ ] App is reachable at https://pd-recruitment-adminportal-qa.shesha.app/
- [ ] Advertiser credentials are valid (Moshadih / 123qwe)
- [ ] At least one item with Action Required "Advertise Job Posting" exists in the Inbox

## Test Cases

### TC-01 — Login as Moshadih

- **Assertions:**
  - [x] ASSERT (BLOCKING) URL no longer contains `/login`

---

### TC-02 — Expand the Workflows menu (ADO #103734 step 3)

- **Assertions:**
  - [x] ASSERT (BLOCKING) "Inbox" submenu item is visible

---

### TC-03 — Navigate to Inbox submenu (ADO #103734 step 4)

- **Assertions:**
  - [x] ASSERT (BLOCKING) "Export" button and Incoming Items table headers are visible

---

### TC-04 — Open any Job with Advertise Job Posting as action required (ADO #103734 step 5)

- **Expected result (actual, corrected):** The Job should open in details view with **Close** and **View in PDF** buttons displayed
- **Assertions:**
  - [x] ASSERT (BLOCKING) "Close" and "View in PDF" buttons are visible

---

### TC-05 — Click on Job Information Summary tab (ADO #103734 step 6)

- **Steps:**
  1. CLICK the "Job Information Summary" tab
- **Expected result:** Job information summary details should be displayed
- **Assertions:**
  - [x] ASSERT (BLOCKING) the Job Reference Number field is visible on the tab

---

### TC-06 — Check that Job Reference Number field is populated (ADO #103734 step 7)

- **Assertions:**
  - [x] ASSERT (BLOCKING) Job Reference Number field is non-empty

---

### TC-07 — Check that Province/Branch field is populated (ADO #103734 step 8)

- **Assertions:**
  - [x] ASSERT (BLOCKING) Province / Branch field is non-empty

---

### TC-08 — Check that Salary Range field is populated (ADO #103734 step 9)

- **Assertions:**
  - [x] ASSERT (BLOCKING) Salary Range is populated in the "R<amount> - R<amount>" shape

---

### TC-09 — Check that Centre/Office Name field is populated (ADO #103734 step 10)

- **Assertions:**
  - [x] ASSERT (BLOCKING) Centre / Office Name field is non-empty

---

### TC-10 — Check that Closing Date field is populated (ADO #103734 step 11)

- **Assertions:**
  - [x] ASSERT (BLOCKING) Closing Date field is non-empty and formatted as a date (DD/MM/YYYY)

---

## Teardown
- No teardown required. This spec is read-only — it only opens and inspects an existing Inbox item, and never clicks Close/View in PDF/Save, so it does not mutate the shared QA workflow state.
