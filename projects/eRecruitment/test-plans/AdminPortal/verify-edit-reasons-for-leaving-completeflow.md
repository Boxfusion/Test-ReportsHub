# Test Plan: ADMINPORTAL-106300 — Verify Edit reasons for leaving

> **Status:** Ready
> **Owner:** QA
> **Last Updated:** 2026-08-06
> **Estimated Duration:** 100s

## Metadata
| Field | Value |
|-------|-------|
| App URL | https://pd-recruitment-adminportal-qa.shesha.app/ |
| Environment | QA |
| Login As | Kwenas / 123qwe (displays as "Kwena Semono" — the Recruiter role) |
| ADO Plan | [#99437 — eRecruitment Test Plan](https://dev.azure.com/boxfusion/pd-recruitment/_testPlans/define?planId=99437) |
| ADO Suite | Not currently linked to a suite in Test Plan #99437 (work item #106300 has no `Tested By` relation). |
| ADO Test Case | [#106300](https://dev.azure.com/boxfusion/pd-recruitment/_workitems/edit/106300) — Verify Edit reasons for leaving |
| Target Job / Application | Job Posting Ref No **40** ("Auto Job Post") → the application created on ADMINPORTAL-106172, currently listed as **"Edit Last Name A"** in the Applications table, Work Experience row "Edited Job title" / "Edited Employer" (per ADMINPORTAL-106285/106295), Reason For Leaving "Career growth" |

## Objective
> Validate that a Recruiter can edit a candidate application's Work Experience row Reason For Leaving via the inline row Edit icon, and that the change persists after clicking the row's Save control ("OK" per ADO's wording).

> **⚠️ STATEFUL/REAL EDIT — requires confirmation before running:** TC-11 clicks the row's Save icon for real, changing Reason For Leaving from "Career growth" to "Edited Reasons for leaving" (per ADO step 11's literal instruction).
>
> **🐞 Known selector trap (confirmed in ADMINPORTAL-106550):** the row's two date-picker inputs (`input[placeholder="Select date"]`) count as plain `<input>` elements in a generic `input` query, shifting field indices. Column order is `0=Job Title, 1=Employer, 2=Employment Start Date, 3=Employment End Date, 4=Reason For Leaving`. This spec uses `.nth(4)` for Reason For Leaving from the start to avoid repeating the mistake that occurred in ADMINPORTAL-106550's first two attempts (which mis-typed into the Start Date field instead).
>
> Row anchor: this row's Job Title is "Edited Job title" (set by ADMINPORTAL-106285).

## Preconditions
- [ ] App is reachable at https://pd-recruitment-adminportal-qa.shesha.app/
- [ ] Recruiter credentials are valid (Kwenas / 123qwe)
- [ ] Job Posting Ref No 40 exists with an application currently listed as "Edit Last Name A", with a Work Experience row "Edited Job title" / Reason For Leaving "Career growth"

## Test Cases

### TC-01 — Login as Kwena (ADO #106300 step 2)
- **Assertions:**
  - [x] ASSERT (BLOCKING) URL no longer contains `/login`

---

### TC-02 — Click the sidebar toggle (ADO #106300 step 3)
- **Assertions:**
  - [x] ASSERT (BLOCKING) "Recruitment" navigation item is visible

---

### TC-03 — Click on Recruitment dropdown (ADO #106300 step 4)
- **Assertions:**
  - [x] ASSERT (BLOCKING) submenus are visible: "Job Posting Dashboard", "Location", "Salary Levels", "Candidates", "Candidates Applications"

---

### TC-04 — Click on Job Posting dashboard (ADO #106300 step 5)
- **Assertions:**
  - [x] ASSERT (BLOCKING) "Job Postings" index table is displayed with a "Reference No" column

---

### TC-05 — Open Job Posting Ref No 40 (ADO #106300 step 6)
- **Assertions:**
  - [x] ASSERT (BLOCKING) Job Details panel is displayed with Job Reference Number "40"

---

### TC-06 — Open the application created on Test Case 106172 (ADO #106300 step 7)
- **Assertions:**
  - [x] ASSERT (BLOCKING) Personal Details panel is visible with First Name "AutoTest"
  - [x] ASSERT (BLOCKING) status badge "PRE-SCREENED" is visible

---

### TC-07 — Navigate to Work Experience panel and click the Edit icon (ADO #106300 step 8)
- **Assertions:**
  - [x] ASSERT (BLOCKING) the row's fields (Job Title, Employer, Employment Start Date, Employment End Date, Reason For Leaving) become editable

---

### TC-08 — Click on the Reasons For Leaving text area (ADO #106300 step 9)
- **Assertions:**
  - [x] ASSERT (BLOCKING) Reason For Leaving field is focused

---

### TC-09 — Clear the Reasons For Leaving text area (ADO #106300 step 10)
- **Assertions:**
  - [x] ASSERT (BLOCKING) Reason For Leaving field is empty

---

### TC-10 — Populate the field with "Edited Reasons for leaving" (ADO #106300 step 11)
- **Assertions:**
  - [x] ASSERT (BLOCKING) Reason For Leaving field contains "Edited Reasons for leaving"

---

### TC-11 — Click on Save/OK (ADO #106300 step 12) — ⚠️ REAL, PERSISTENT EDIT
- **Expected result:** Record saves successfully; updated Reasons for leaving is displayed
- **Assertions:**
  - [x] ASSERT (BLOCKING) after Save + reload, the row shows Reason For Leaving "Edited Reasons for leaving"

---

## Teardown
- No automated teardown. TC-11 performs a real, persistent edit to the target application's Work Experience row Reason For Leaving. This is not reversible via the UI.
