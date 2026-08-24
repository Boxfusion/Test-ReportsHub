# Test Plan: ADMINPORTAL-106537 — Verify Edit Province

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
| ADO Suite | Not currently linked to a suite in Test Plan #99437 (work item #106537 has no `Tested By` relation) — same situation as the other AdminPortal test cases automated in this hub. |
| ADO Test Case | [#106537](https://dev.azure.com/boxfusion/pd-recruitment/_workitems/edit/106537) — Verify Edit Province |
| Target Job / Application | Job Posting Ref No **40** ("Auto Job Post") → Application for the candidate ADO calls "Everything F" — renamed by [ADMINPORTAL-106529](./verify-edit-last-name.md), so the Applications table now lists it as **"Edit Last Name F"** |

## Objective
> Validate that a Recruiter can edit a candidate application's Personal Details, specifically clearing and updating the Province field, and that the change persists after Save + refresh, including in the Applications index table's "Location (Province)" column.
>
> **⚠️ STATEFUL — requires confirmation before running:** TC-10 clicks Save for real, permanently changing the shared candidate's Province to "Edited Province" (from currently blank). This is the same shared QA fixture already modified by ADMINPORTAL-106529 through 106536. TC-01 through TC-09 only navigate and fill the field in the DOM without saving, so they are safe to repeat.
>
> **Discrepancy notes (consistent with the other "Verify Edit ___" test cases in this family):**
> - ADO step 7 references the candidate by their **original** name, "Everything F" — no longer valid after ADMINPORTAL-106529's real Save; the candidate is now listed as "Edit Last Name F". This spec targets the current name.
> - ADO step 7's expected result ("pre-screened status") does not match reality: the application opens with status badge **"AWAITING PRE-SCREENING"**.
> - ADO step 10 has a copy/paste leftover from the previous test case in this family (ADMINPORTAL-106536): "...inside natire of disability text area" — read as "inside the Province text area".
> - The Province field is currently blank (not previously populated), so "Clear the Province" (step 9) is trivially satisfied — there is nothing to clear.

## Preconditions
- [ ] App is reachable at https://pd-recruitment-adminportal-qa.shesha.app/
- [ ] Recruiter credentials are valid (Kwenas / 123qwe)
- [ ] Job Posting Ref No 40 exists with an application currently listed as "Edit Last Name F"

## Test Cases

### TC-01 — Login as Kwena (ADO #106537 step 2)

- **Assertions:**
  - [x] ASSERT (BLOCKING) URL no longer contains `/login`

---

### TC-02 — Click the sidebar toggle (ADO #106537 step 3)

- **Assertions:**
  - [x] ASSERT (BLOCKING) "Recruitment" navigation item is visible

---

### TC-03 — Click on Recruitment dropdown (ADO #106537 step 4)

- **Assertions:**
  - [x] ASSERT (BLOCKING) submenus are visible: "Job Posting Dashboard", "Location", "Salary Levels", "Candidates", "Candidates Applications"

---

### TC-04 — Click on Job Posting dashboard (ADO #106537 step 5)

- **Assertions:**
  - [x] ASSERT (BLOCKING) "Job Postings" index table is displayed with a "Reference No" column

---

### TC-05 — Open Job Posting Ref No 40 (closing date not yet passed) (ADO #106537 step 6)

- **Assertions:**
  - [x] ASSERT (BLOCKING) Job Details panel is displayed with Job Reference Number "40"

---

### TC-06 — Open the target candidate's Application (ADO #106537 step 7, corrected name)

- **Expected result (actual, corrected):** Application opens successfully with status badge "AWAITING PRE-SCREENING" (not "pre-screened" as ADO states)
- **Assertions:**
  - [x] ASSERT (BLOCKING) Personal Details panel is visible with First Name "Fred"

---

### TC-07 — Click "Edit Personal Details" (ADO #106537 step 8)

- **Assertions:**
  - [x] ASSERT (BLOCKING) Province field is now an editable input, and a "Save" button is visible

---

### TC-08 — Clear the Province field (ADO #106537 step 9)

- **Assertions:**
  - [x] ASSERT (BLOCKING) Province field is empty

---

### TC-09 — Enter "Edited Province" (ADO #106537 step 10, corrected field name)

- **Assertions:**
  - [x] ASSERT (BLOCKING) Province field contains "Edited Province"

---

### TC-10 — Click on Save (ADO #106537 step 11) — ⚠️ REAL, PERSISTENT EDIT

- **Expected result:** Record saves successfully; the updated Province is displayed, and the "Location (Province)" column also updates in the Applications index table
- **Assertions:**
  - [x] ASSERT (BLOCKING) after Save + page reload, the Personal Details panel shows Province "Edited Province"
  - [x] ASSERT (BLOCKING) "Edited Province" is also visible in the Job Posting's Applications index table

---

## Teardown
- No automated teardown. TC-10 performs a real, persistent change to the shared candidate application's Province.
