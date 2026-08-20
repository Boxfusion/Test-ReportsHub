# Test Plan: ADMINPORTAL-106533 — Verify Edit Gender

> **Status:** Ready
> **Owner:** QA
> **Last Updated:** 2026-08-05
> **Estimated Duration:** 90s

## Metadata
| Field | Value |
|-------|-------|
| App URL | https://pd-recruitment-adminportal-qa.shesha.app/ |
| Environment | QA |
| Login As | Kwenas / 123qwe (displays as "Kwena Semono" — the Recruiter role) |
| ADO Plan | [#99437 — eRecruitment Test Plan](https://dev.azure.com/boxfusion/pd-recruitment/_testPlans/define?planId=99437) |
| ADO Suite | Not currently linked to a suite in Test Plan #99437 (work item #106533 has no `Tested By` relation) — same situation as the other AdminPortal test cases automated in this hub. |
| ADO Test Case | [#106533](https://dev.azure.com/boxfusion/pd-recruitment/_workitems/edit/106533) — Verify Edit Gender |
| Target Job / Application | Job Posting Ref No **40** ("Auto Job Post") → Application for the candidate ADO calls "Everything F" — renamed by [ADMINPORTAL-106529](./verify-edit-last-name.md), so the Applications table now lists it as **"Edit Last Name F"** |

## Objective
> Validate that a Recruiter can edit a candidate application's Personal Details, specifically changing the Gender dropdown to "Not Disclosed", and that the change persists after Save + refresh, including in the Applications index table's "Gender" column.
>
> **⚠️ STATEFUL — requires confirmation before running:** TC-11 clicks Save for real, permanently changing the shared candidate's Gender from "Male" to "Not Disclosed". This is the same shared QA fixture already modified by ADMINPORTAL-106529/106530/106531/106532. TC-01 through TC-10 only navigate and select the option in the DOM without saving, so they are safe to repeat.
>
> **Discrepancy notes (consistent with the other "Verify Edit ___" test cases in this family):**
> - ADO step 7 references the candidate by their **original** name, "Everything F" — no longer valid after ADMINPORTAL-106529's real Save; the candidate is now listed as "Edit Last Name F". This spec targets the current name.
> - ADO step 7's expected result ("pre-screened status") does not match reality: the application opens with status badge **"AWAITING PRE-SCREENING"**.
> - Confirmed live 2026-08-05: the Gender dropdown's option list only shows the two values other than the currently-selected one (i.e. with "Male" selected, the dropdown lists "Female" and "Not Disclosed"). The exact label is "Not Disclosed" (title case), matching ADO's example.

## Preconditions
- [ ] App is reachable at https://pd-recruitment-adminportal-qa.shesha.app/
- [ ] Recruiter credentials are valid (Kwenas / 123qwe)
- [ ] Job Posting Ref No 40 exists with an application currently listed as "Edit Last Name F"

## Test Cases

### TC-01 — Login as Kwena (ADO #106533 step 2)

- **Assertions:**
  - [x] ASSERT (BLOCKING) URL no longer contains `/login`

---

### TC-02 — Click the sidebar toggle (ADO #106533 step 3)

- **Assertions:**
  - [x] ASSERT (BLOCKING) "Recruitment" navigation item is visible

---

### TC-03 — Click on Recruitment dropdown (ADO #106533 step 4)

- **Assertions:**
  - [x] ASSERT (BLOCKING) submenus are visible: "Job Posting Dashboard", "Location", "Salary Levels", "Candidates", "Candidates Applications"

---

### TC-04 — Click on Job Posting dashboard (ADO #106533 step 5)

- **Assertions:**
  - [x] ASSERT (BLOCKING) "Job Postings" index table is displayed with a "Reference No" column

---

### TC-05 — Open Job Posting Ref No 40 (closing date not yet passed) (ADO #106533 step 6)

- **Assertions:**
  - [x] ASSERT (BLOCKING) Job Details panel is displayed with Job Reference Number "40"

---

### TC-06 — Open the target candidate's Application (ADO #106533 step 7, corrected name)

- **Expected result (actual, corrected):** Application opens successfully with status badge "AWAITING PRE-SCREENING" (not "pre-screened" as ADO states)
- **Assertions:**
  - [x] ASSERT (BLOCKING) Personal Details panel is visible with First Name "Fred"

---

### TC-07 — Click "Edit Personal Details" (ADO #106533 step 8)

- **Assertions:**
  - [x] ASSERT (BLOCKING) Gender dropdown is now editable, and a "Save" button is visible

---

### TC-08 — Click on the gender dropdown (ADO #106533 step 9)

- **Assertions:**
  - [x] ASSERT (BLOCKING) Available gender options are displayed ("Female", "Not Disclosed")

---

### TC-09 — Select "Not Disclosed" (ADO #106533 step 10)

- **Assertions:**
  - [x] ASSERT (BLOCKING) Gender dropdown now shows "Not Disclosed"

---

### TC-10 — Click on Save (ADO #106533 step 11) — ⚠️ REAL, PERSISTENT EDIT

- **Expected result:** Changes are saved successfully; Gender changes to "Not Disclosed", and the "Gender" column also updates in the Applications index table
- **Assertions:**
  - [x] ASSERT (BLOCKING) after Save + page reload, the Personal Details panel shows Gender "Not Disclosed"
  - [x] ASSERT (BLOCKING) "Not Disclosed" is also visible in the Job Posting's Applications index table ("Gender" column)

---

## Teardown
- No automated teardown. TC-10 performs a real, persistent change to the shared candidate application's Gender.
