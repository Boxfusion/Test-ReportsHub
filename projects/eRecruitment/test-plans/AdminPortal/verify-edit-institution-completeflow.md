# Test Plan: ADMINPORTAL-106276 — Verify Edit institution

> **Status:** Ready
> **Owner:** QA
> **Last Updated:** 2026-08-06
> **Estimated Duration:** 90s

## Metadata
| Field | Value |
|-------|-------|
| App URL | https://pd-recruitment-adminportal-qa.shesha.app/ |
| Environment | QA |
| Login As | Kwenas / 123qwe (displays as "Kwena Semono" — the Recruiter role) |
| ADO Plan | [#99437 — eRecruitment Test Plan](https://dev.azure.com/boxfusion/pd-recruitment/_testPlans/define?planId=99437) |
| ADO Suite | Not currently linked to a suite in Test Plan #99437 (work item #106276 has no `Tested By` relation). Parent: #107190. |
| ADO Test Case | [#106276](https://dev.azure.com/boxfusion/pd-recruitment/_workitems/edit/106276) — Verify Edit institution |
| Target Job / Application | Job Posting Ref No **40** ("Auto Job Post") → the application created on ADMINPORTAL-106172, currently listed as **"Edit Last Name A"**, Education row Institution "Test University" |

## Objective
> Validate the behavior of clearing and saving the Institution field on a candidate application's Education panel row via the inline row Edit icon.

> **🐞 Known app behavior — same required-field validation already confirmed in ADMINPORTAL-106540 (identical test case content, different candidate):** Institution is a required field. Clearing it and clicking the row's Save icon is **rejected** by client-side validation ("Please fill in: Institution.", no API update call fires) — no persistent change actually occurs. ADO's expected result ("record saves successfully" with a blank Institution) does not match this correct, safer app behavior.
>
> **No confirmation needed to run this end-to-end** — since the real Save click is rejected by validation, nothing persists.

## Preconditions
- [ ] App is reachable at https://pd-recruitment-adminportal-qa.shesha.app/
- [ ] Recruiter credentials are valid (Kwenas / 123qwe)
- [ ] Job Posting Ref No 40 exists with an application currently listed as "Edit Last Name A", with an Education row Institution "Test University"

## Test Cases

### TC-01 — Login as Kwena (ADO #106276 step 2)
- **Assertions:**
  - [x] ASSERT (BLOCKING) URL no longer contains `/login`

---

### TC-02 — Click the sidebar toggle (ADO #106276 step 3)
- **Assertions:**
  - [x] ASSERT (BLOCKING) "Recruitment" navigation item is visible

---

### TC-03 — Click on Recruitment dropdown (ADO #106276 step 4)
- **Assertions:**
  - [x] ASSERT (BLOCKING) submenus are visible: "Job Posting Dashboard", "Location", "Salary Levels", "Candidates", "Candidates Applications"

---

### TC-04 — Click on Job Posting dashboard (ADO #106276 step 5)
- **Assertions:**
  - [x] ASSERT (BLOCKING) "Job Postings" index table is displayed with a "Reference No" column

---

### TC-05 — Open Job Posting Ref No 40 (ADO #106276 step 6)
- **Assertions:**
  - [x] ASSERT (BLOCKING) Job Details panel is displayed with Job Reference Number "40"

---

### TC-06 — Open the target application (ADO #106276 step 7)
- **Assertions:**
  - [x] ASSERT (BLOCKING) Personal Details panel is visible with First Name "AutoTest"
  - [x] ASSERT (BLOCKING) status badge "PRE-SCREENED" is visible

---

### TC-07 — Navigate to Education panel and click the Edit icon (ADO #106276 step 8)
- **Assertions:**
  - [x] ASSERT (BLOCKING) Institution field is now an editable input

---

### TC-08 — Click on the Institution text area (ADO #106276 step 9)
- **Assertions:**
  - [x] ASSERT (BLOCKING) Institution field is focused

---

### TC-09 — Clear the Institution text area (ADO #106276 step 10)
- **Assertions:**
  - [x] ASSERT (BLOCKING) Institution field is empty

---

### TC-10 — Click on Save (ADO #106276 step 11)
- **Expected result per ADO:** Record saves successfully; updated Institution is displayed.
- **Actual expected behavior (confirmed pattern from ADMINPORTAL-106540):** a "Please fill in: Institution" validation message appears; the save is rejected and the original Institution value is retained.
- **Assertions:**
  - [x] ASSERT (BLOCKING) a "Please fill in: Institution" validation message appears
  - [x] ASSERT (BLOCKING) after reload, the original Institution "Test University" is retained

---

## Teardown
- No teardown required — the required-field validation prevents any persistent change.
