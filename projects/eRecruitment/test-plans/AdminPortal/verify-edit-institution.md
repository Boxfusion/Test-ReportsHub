# Test Plan: ADMINPORTAL-106540 — Verify Edit institution

> **Status:** Ready
> **Owner:** QA
> **Last Updated:** 2026-08-05
> **Estimated Duration:** 60s

## Metadata
| Field | Value |
|-------|-------|
| App URL | https://pd-recruitment-adminportal-qa.shesha.app/ |
| Environment | QA |
| Login As | Kwenas / 123qwe (displays as "Kwena Semono" — the Recruiter role) |
| ADO Plan | [#99437 — eRecruitment Test Plan](https://dev.azure.com/boxfusion/pd-recruitment/_testPlans/define?planId=99437) |
| ADO Suite | Not currently linked to a suite in Test Plan #99437 (work item #106540 has no `Tested By` relation) — same situation as the other AdminPortal test cases automated in this hub. Parent: #107190. |
| ADO Test Case | [#106540](https://dev.azure.com/boxfusion/pd-recruitment/_workitems/edit/106540) — Verify Edit institution |
| Target Job / Application | Job Posting Ref No **40** ("Auto Job Post") → Application for the candidate ADO calls "Everything F" — renamed by [ADMINPORTAL-106529](./verify-edit-last-name.md), so the Applications table now lists it as **"Edit Last Name F"** → Education panel → Secondary Qualifications row "Tshwane High Schools" |

## Objective
> Validate the behavior of clearing the Institution field on a candidate application's Education > Secondary Qualifications entry and clicking Save.
>
> **✅ Confirmed NOT destructive — no confirmation needed:** Institution is a **required** field. Confirmed live 2026-08-05: clicking Save with Institution blank is **rejected** by client-side validation (toast: "Please fill in: Institution.", plus an "Update failed" tooltip on the row) — no API update call fires, and the row's Institution reverts to its original value ("Tshwane High Schools") on reload. So although TC-10 clicks the real Save control, nothing actually persists; the app safely blocks the invalid save. This is the same shared QA fixture already modified by ADMINPORTAL-106529 through 106538, but this particular test leaves it unchanged.
>
> **Discrepancy notes:**
> - **ADO's expected result for step 11 is wrong.** ADO says "Record saves successfully and Updated Institution is displayed" (implying a blank Institution is accepted) — this does not match reality. The app correctly refuses to save a blank required field. This spec asserts the actual (correct, safer) behavior: a validation error and no persisted change.
> - ADO step 7 references the candidate by their **original** name, "Everything F" — no longer valid after ADMINPORTAL-106529's real Save; the candidate is now listed as "Edit Last Name F". This spec targets the current name.
> - ADO step 7's expected result ("pre-screened status") does not match reality: the application opened with status badge **"AWAITING PRE-SCREENING"** as of ADMINPORTAL-106536; it has since progressed further in this shared environment (observed as "PRE-SCREENED" / Shortlist stage during investigation of this test case), independent of anything this spec does.
> - ADO step 8 lists 5 fields that should open in edit mode ("Institution, Qualification Name, Qualification type, Qualification status, Date Obtained"), but confirmed live 2026-08-05: the Education panel has two separate tables, and neither has all 5 fields — the **Secondary Qualifications** table (targeted by this spec, matching 3 of ADO's 5 field names) has Institution, Qualification Name, Qualification Type, Certificate; the Tertiary Qualifications table has Institution, Qualification Name, Date Obtained, Certificate. There is no separate "Qualification status" field on either table.

## Preconditions
- [ ] App is reachable at https://pd-recruitment-adminportal-qa.shesha.app/
- [ ] Recruiter credentials are valid (Kwenas / 123qwe)
- [ ] Job Posting Ref No 40 exists with an application currently listed as "Edit Last Name F", with a Secondary Qualifications row for "Tshwane High Schools"

## Test Cases

### TC-01 — Login as Kwena (ADO #106540 step 2)

- **Assertions:**
  - [x] ASSERT (BLOCKING) URL no longer contains `/login`

---

### TC-02 — Click the sidebar toggle (ADO #106540 step 3)

- **Assertions:**
  - [x] ASSERT (BLOCKING) "Recruitment" navigation item is visible

---

### TC-03 — Click on Recruitment dropdown (ADO #106540 step 4)

- **Assertions:**
  - [x] ASSERT (BLOCKING) submenus are visible: "Job Posting Dashboard", "Location", "Salary Levels", "Candidates", "Candidates Applications"

---

### TC-04 — Click on Job Posting dashboard (ADO #106540 step 5)

- **Assertions:**
  - [x] ASSERT (BLOCKING) "Job Postings" index table is displayed with a "Reference No" column

---

### TC-05 — Open Job Posting Ref No 40 (closing date not yet passed) (ADO #106540 step 6)

- **Assertions:**
  - [x] ASSERT (BLOCKING) Job Details panel is displayed with Job Reference Number "40"

---

### TC-06 — Open the target candidate's Application (ADO #106540 step 7, corrected name)

- **Expected result (actual, corrected):** Application opens successfully with status badge "AWAITING PRE-SCREENING" (not "pre-screened" as ADO states)
- **Assertions:**
  - [x] ASSERT (BLOCKING) Personal Details panel is visible with First Name "Fred"

---

### TC-07 — Navigate to Education panel and click the Edit icon on the Secondary Qualifications row (ADO #106540 step 8)

- **Expected result (actual, corrected):** The row's Institution, Qualification Name, and Qualification Type fields open in edit mode (no separate "status" field exists)
- **Assertions:**
  - [x] ASSERT (BLOCKING) the Institution field is now an editable input

---

### TC-08 — Click on the Institution text area (ADO #106540 step 9)

- **Assertions:**
  - [x] ASSERT (BLOCKING) the Institution field is focused and editable

---

### TC-09 — Clear the Institution text area (ADO #106540 step 10)

- **Assertions:**
  - [x] ASSERT (BLOCKING) the Institution field is empty

---

### TC-10 — Click on Save (ADO #106540 step 11)

- **Expected result (actual, corrected):** Save is rejected by client-side validation ("Please fill in: Institution."); no update is persisted and the row's original Institution value is retained
- **Assertions:**
  - [x] ASSERT (BLOCKING) a "Please fill in: Institution" validation message appears
  - [x] ASSERT (BLOCKING) after reload, the Secondary Qualifications row's Institution is still "Tshwane High Schools" (unchanged)

---

## Teardown
- None needed. TC-10 clicks the real Save control, but the app rejects the invalid (blank) submission — no persistent change occurs.
