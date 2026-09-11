# Test Plan: ADMINPORTAL-106308 — Verify Category Details

> **Status:** Ready
> **Owner:** QA
> **Last Updated:** 2026-08-06
> **Estimated Duration:** 60s

## Metadata
| Field | Value |
|-------|-------|
| App URL | https://pd-recruitment-adminportal-qa.shesha.app/ |
| Environment | QA |
| Login As | Kwenas / 123qwe (displays as "Kwena Semono" — the Recruiter role) |
| ADO Plan | [#99437 — eRecruitment Test Plan](https://dev.azure.com/boxfusion/pd-recruitment/_testPlans/define?planId=99437) |
| ADO Suite | Not currently linked to a suite in Test Plan #99437 (work item #106308 has no `Tested By` relation). |
| ADO Test Case | [#106308](https://dev.azure.com/boxfusion/pd-recruitment/_workitems/edit/106308) — Verify Category Details |
| Target Job / Application | Job Posting Ref No **40** ("Auto Job Post") → the application created on ADMINPORTAL-106172, currently listed as **"Edit Last Name A"** in the Applications table, Category Details: Final Category "A", Comments "Automated test application for ADMINPORTAL-106172." |

## Objective
> Validate that the Category Details panel correctly displays the Final Category and Comments values set during application creation.

> **✅ Read-only verification — no confirmation needed.** This test case only navigates and asserts on already-set values (Final Category, Comments); it does not edit or save anything.

## Preconditions
- [ ] App is reachable at https://pd-recruitment-adminportal-qa.shesha.app/
- [ ] Recruiter credentials are valid (Kwenas / 123qwe)
- [ ] Job Posting Ref No 40 exists with an application currently listed as "Edit Last Name A"

## Test Cases

### TC-01 — Login as Kwena (ADO #106308 step 2)
- **Assertions:**
  - [x] ASSERT (BLOCKING) URL no longer contains `/login`

---

### TC-02 — Click the sidebar toggle (ADO #106308 step 3)
- **Assertions:**
  - [x] ASSERT (BLOCKING) "Recruitment" navigation item is visible

---

### TC-03 — Click on Recruitment dropdown (ADO #106308 step 4)
- **Assertions:**
  - [x] ASSERT (BLOCKING) submenus are visible: "Job Posting Dashboard", "Location", "Salary Levels", "Candidates", "Candidates Applications"

---

### TC-04 — Click on Job Posting dashboard (ADO #106308 step 5)
- **Assertions:**
  - [x] ASSERT (BLOCKING) "Job Postings" index table is displayed with a "Reference No" column

---

### TC-05 — Open Job Posting Ref No 40 (ADO #106308 step 6)
- **Assertions:**
  - [x] ASSERT (BLOCKING) Job Details panel is displayed with Job Reference Number "40"

---

### TC-06 — Open the application created on Test Case 106172 (ADO #106308 step 7)
- **Assertions:**
  - [x] ASSERT (BLOCKING) Personal Details panel is visible with First Name "AutoTest"
  - [x] ASSERT (BLOCKING) status badge "PRE-SCREENED" is visible

---

### TC-07 — Navigate to Category Details panel (ADO #106308 step 8)
- **Assertions:**
  - [x] ASSERT (BLOCKING) "Category Details" panel is visible

---

### TC-08 — Verify Final Category (ADO #106308 step 9)
- **Assertions:**
  - [x] ASSERT (BLOCKING) Final Category displays "A" next to the label

---

### TC-09 — Verify comments (ADO #106308 step 10)
- **Assertions:**
  - [x] ASSERT (BLOCKING) Comments displays "Automated test application for ADMINPORTAL-106172." next to the label

---

## Teardown
- No teardown required. This is a read-only verification test — no data was modified.
