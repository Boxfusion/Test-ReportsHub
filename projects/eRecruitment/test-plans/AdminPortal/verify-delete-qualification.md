# Test Plan: ADMINPORTAL-106545 — Delete Qualification

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
| ADO Suite | Not currently linked to a suite in Test Plan #99437 (work item #106545 has no `Tested By` relation) — same situation as the other AdminPortal test cases automated in this hub. Parent: #107464. |
| ADO Test Case | [#106545](https://dev.azure.com/boxfusion/pd-recruitment/_workitems/edit/106545) — Delete Qualification |
| Target Job / Application | Job Posting Ref No **40** ("Auto Job Post") → Application currently listed as "Edit Last Name F" → Education panel → Secondary Qualifications row (Institution "Tshwane High Schools", Qualification Name "Edited Qualification Name") |

## Objective
> Validate that a Recruiter can delete a candidate application's Education > Secondary Qualifications entry, and that a confirmation dialog correctly protects against accidental deletion (Cancel keeps the row, OK deletes it for real).
>
> **⚠️ STATEFUL/DESTRUCTIVE — requires confirmation before running:** TC-08 clicks the confirmation dialog's OK button for real, **permanently deleting** the Secondary Qualifications row that ADMINPORTAL-106540/106541/106542/106543 have all been targeting throughout this session (Institution "Tshwane High Schools", Qualification Name "Edited Qualification Name", Qualification Type "Grade 12..."). This is the only qualification row with a Delete icon at all — confirmed live that the Tertiary Qualifications rows (WITS, UNISA) have no delete capability, only Edit/History. TC-01 through TC-07 only open and cancel the confirmation dialog without deleting, so they are safe to repeat.
>
> **Discrepancy notes:**
> - ADO step 7 says "open any application from the table" — this spec continues using the same candidate application ("Edit Last Name F") already in use throughout this session, for continuity.
> - ADO steps 8 and 10 read as if they describe two different controls ("Delete icon" in step 8, "Delete button" in step 10), but confirmed live 2026-08-05: there is only one Delete (trash) icon per Secondary Qualifications row, and both steps refer to clicking it — step 8 is the first click (then cancelled in step 9), step 10 is clicking it again to re-open the same confirmation dialog for real confirmation in step 11.
> - The confirmation dialog shows **both** Cancel and OK simultaneously on every open (not "Cancel only" on the first open as ADO's step 8 wording might imply) — this spec asserts on that actual behavior.
> - Delete is only available on the **Secondary** Qualifications table; the Tertiary Qualifications table's rows only have Edit and History icons, no Delete.

## Preconditions
- [ ] App is reachable at https://pd-recruitment-adminportal-qa.shesha.app/
- [ ] Recruiter credentials are valid (Kwenas / 123qwe)
- [ ] Job Posting Ref No 40 exists with an application currently listed as "Edit Last Name F", with a Secondary Qualifications row (Qualification Name "Edited Qualification Name")

## Test Cases

### TC-01 — Login as Kwena (ADO #106545 step 2)

- **Assertions:**
  - [x] ASSERT (BLOCKING) URL no longer contains `/login`

---

### TC-02 — Click the sidebar toggle (ADO #106545 step 3)

- **Assertions:**
  - [x] ASSERT (BLOCKING) "Recruitment" navigation item is visible

---

### TC-03 — Click on Recruitment dropdown (ADO #106545 step 4)

- **Assertions:**
  - [x] ASSERT (BLOCKING) submenus are visible: "Job Posting Dashboard", "Location", "Salary Levels", "Candidates", "Candidates Applications"

---

### TC-04 — Click on Job Posting dashboard (ADO #106545 step 5)

- **Assertions:**
  - [x] ASSERT (BLOCKING) "Job Postings" index table is displayed with a "Reference No" column

---

### TC-05 — Open Job Posting Ref No 40 (closing date not yet passed) (ADO #106545 step 6)

- **Assertions:**
  - [x] ASSERT (BLOCKING) Job Details panel is displayed with Job Reference Number "40"

---

### TC-06 — Open the target application (ADO #106545 step 7)

- **Assertions:**
  - [x] ASSERT (BLOCKING) Personal Details panel is visible with First Name "Fred"

---

### TC-07 — Navigate to Education panel, click the Delete icon, then click Cancel (ADO #106545 steps 8-9)

- **Assertions:**
  - [x] ASSERT (BLOCKING) a confirmation dialog appears containing "sure"
  - [x] ASSERT (BLOCKING) after clicking Cancel, the dialog closes and the row still exists

---

### TC-08 — Click the Delete icon again and click OK (ADO #106545 steps 10-11) — ⚠️ REAL, PERMANENT DELETE

- **Expected result:** Confirmation dialog with Cancel and OK appears; clicking OK deletes the qualification successfully
- **Assertions:**
  - [x] ASSERT (BLOCKING) confirmation dialog shows both Cancel and OK
  - [x] ASSERT (BLOCKING) after clicking OK, the row (Qualification Name "Edited Qualification Name") no longer exists

---

## Teardown
- No automated teardown. TC-08 performs a real, permanent deletion of the shared candidate application's Secondary Qualifications row. This is not reversible via the UI.
