# Test Plan: ADMINPORTAL-106532 — Verify Edit mobile number

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
| ADO Suite | Not currently linked to a suite in Test Plan #99437 (work item #106532 has no `Tested By` relation) — same situation as the other AdminPortal test cases automated in this hub. |
| ADO Test Case | [#106532](https://dev.azure.com/boxfusion/pd-recruitment/_workitems/edit/106532) — Verify Edit mobile number |
| Target Job / Application | Job Posting Ref No **40** ("Auto Job Post") → Application for the candidate ADO calls "Everything F" — renamed by [ADMINPORTAL-106529](./verify-edit-last-name.md), so the Applications table now lists it as **"Edit Last Name F"** |

## Objective
> Validate that a Recruiter can edit a candidate application's Personal Details, specifically clearing and updating the Mobile Number field, and that the change persists after Save + refresh, including in the Applications index table's "Cell Nr" column.
>
> **⚠️ STATEFUL — requires confirmation before running:** TC-11 clicks Save for real, permanently changing the shared candidate's Mobile Number to a different value (0837654321). This is the same shared QA fixture already modified by ADMINPORTAL-106529/106530/106531. TC-01 through TC-10 only navigate and fill the field in the DOM without saving, so they are safe to repeat.
>
> **Discrepancy notes (consistent with the other "Verify Edit ___" test cases in this family):**
> - ADO step 7 references the candidate by their **original** name, "Everything F" — no longer valid after ADMINPORTAL-106529's real Save; the candidate is now listed as "Edit Last Name F". This spec targets the current name.
> - ADO step 7's expected result ("pre-screened status") does not match reality: the application opens with status badge **"AWAITING PRE-SCREENING"**.
> - ADO step 10 has a minor typo ("Clear the Emobile Number") — read as "Clear the Mobile Number".

## Preconditions
- [ ] App is reachable at https://pd-recruitment-adminportal-qa.shesha.app/
- [ ] Recruiter credentials are valid (Kwenas / 123qwe)
- [ ] Job Posting Ref No 40 exists with an application currently listed as "Edit Last Name F"

## Test Cases

### TC-01 — Login as Kwena (ADO #106532 step 2)

- **Assertions:**
  - [x] ASSERT (BLOCKING) URL no longer contains `/login`

---

### TC-02 — Click the sidebar toggle (ADO #106532 step 3)

- **Assertions:**
  - [x] ASSERT (BLOCKING) "Recruitment" navigation item is visible

---

### TC-03 — Click on Recruitment dropdown (ADO #106532 step 4)

- **Assertions:**
  - [x] ASSERT (BLOCKING) submenus are visible: "Job Posting Dashboard", "Location", "Salary Levels", "Candidates", "Candidates Applications"

---

### TC-04 — Click on Job Posting dashboard (ADO #106532 step 5)

- **Assertions:**
  - [x] ASSERT (BLOCKING) "Job Postings" index table is displayed with a "Reference No" column

---

### TC-05 — Open Job Posting Ref No 40 (closing date not yet passed) (ADO #106532 step 6)

- **Assertions:**
  - [x] ASSERT (BLOCKING) Job Details panel is displayed with Job Reference Number "40"

---

### TC-06 — Open the target candidate's Application (ADO #106532 step 7, corrected name)

- **Expected result (actual, corrected):** Application opens successfully with status badge "AWAITING PRE-SCREENING" (not "pre-screened" as ADO states)
- **Assertions:**
  - [x] ASSERT (BLOCKING) Personal Details panel is visible with First Name "Fred"

---

### TC-07 — Click "Edit Personal Details" (ADO #106532 step 8)

- **Assertions:**
  - [x] ASSERT (BLOCKING) Mobile Number field is now an editable input, and a "Save" button is visible

---

### TC-08 — Click inside the Mobile Number field (ADO #106532 step 9)

- **Assertions:**
  - [x] ASSERT (BLOCKING) Mobile Number field is focused and editable

---

### TC-09 — Clear the Mobile Number field (ADO #106532 step 10)

- **Assertions:**
  - [x] ASSERT (BLOCKING) Mobile Number field is empty

---

### TC-10 — Enter a different mobile number (ADO #106532 step 11)

- **Assertions:**
  - [x] ASSERT (BLOCKING) Mobile Number field contains the new value "0837654321"

---

### TC-11 — Click on Save (ADO #106532 step 12) — ⚠️ REAL, PERSISTENT EDIT

- **Expected result:** Changes are saved successfully; the updated mobile number is displayed, and the "Cell Nr" column also updates in the Applications index table
- **Assertions:**
  - [x] ASSERT (BLOCKING) after Save + page reload, the Personal Details panel shows the new Mobile Number
  - [x] ASSERT (BLOCKING) the new Mobile Number is also visible in the Job Posting's Applications index table ("Cell Nr" column)

---

## Teardown
- No automated teardown. TC-11 performs a real, persistent change to the shared candidate application's Mobile Number.
