# Test Plan: ADMINPORTAL-106551 — Verify Delete Work Experience

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
| ADO Suite | Not currently linked to a suite in Test Plan #99437 (work item #106551 has no `Tested By` relation) — same situation as the other AdminPortal test cases automated in this hub. Parent: #107189. |
| ADO Test Case | [#106551](https://dev.azure.com/boxfusion/pd-recruitment/_workitems/edit/106551) — Verify Delete Work Experience |
| Target Job / Application | Job Posting Ref No **40** ("Auto Job Post") → Application currently listed as "Edit Last Name F" → Work Experience panel |

## Objective
> Validate that a Recruiter can delete a candidate application's Work Experience entry, and that a confirmation dialog correctly protects against accidental deletion (Cancel keeps the row, OK deletes it for real).

> **🐞 BUG FOUND DURING LIVE INVESTIGATION (2026-08-05) — the feature under test does not exist.** Confirmed live: neither Work Experience row ("Automation" / "Edited Employer..." nor "Senior Test Engineer" / "Edited Employer...") has a Delete (trash) icon, in view mode or in inline-edit mode. Clicking each row's only icon (`.anticon-edit`) switches it into inline edit mode, which then only exposes Save/Cancel/date-clear icons (`.anticon-save`, `.anticon-close-circle`, `.anticon-calendar`) — never `.anticon-delete`. This is the same class of defect as ADMINPORTAL-106543/106544 (a field/control ADO's steps assume exists, but the current build has never implemented it for this table). Compare with Education > Secondary Qualifications (ADMINPORTAL-106545), which *does* have a working Delete icon and confirm dialog — Work Experience has no equivalent.
>
> Because the control does not exist, ADO steps 8-11 (open delete confirm, Cancel, re-open, click OK) cannot be executed at all. TC-07 below asserts the absence of the Delete icon, which **fails on purpose** to give this a genuine, reproducible automated regression signal rather than a manual note. TC-08–TC-11 are skipped as blocked, mirroring ADMINPORTAL-106544's TC-10–13 convention.
>
> **No destructive action was taken or is required** — nothing was edited or deleted on either Work Experience row during this investigation (the one row switched into edit mode during exploration was left un-saved and reverted automatically on page reload).

## Preconditions
- [ ] App is reachable at https://pd-recruitment-adminportal-qa.shesha.app/
- [ ] Recruiter credentials are valid (Kwenas / 123qwe)
- [ ] Job Posting Ref No 40 exists with an application currently listed as "Edit Last Name F", with at least one Work Experience row

## Test Cases

### TC-01 — Login as Kwena (ADO #106551 step 2)

- **Assertions:**
  - [x] ASSERT (BLOCKING) URL no longer contains `/login`

---

### TC-02 — Click the sidebar toggle (ADO #106551 step 3)

- **Assertions:**
  - [x] ASSERT (BLOCKING) "Recruitment" navigation item is visible

---

### TC-03 — Click on Recruitment dropdown (ADO #106551 step 4)

- **Assertions:**
  - [x] ASSERT (BLOCKING) submenus are visible: "Job Posting Dashboard", "Location", "Salary Levels", "Candidates", "Candidates Applications"

---

### TC-04 — Click on Job Posting dashboard (ADO #106551 step 5)

- **Assertions:**
  - [x] ASSERT (BLOCKING) "Job Postings" index table is displayed with a "Reference No" column

---

### TC-05 — Open Job Posting Ref No 40 (closing date not yet passed) (ADO #106551 step 6)

- **Assertions:**
  - [x] ASSERT (BLOCKING) Job Details panel is displayed with Job Reference Number "40"

---

### TC-06 — Open the target application (ADO #106551 step 7)

- **Note:** ADO's expected result says the application opens with "pre-screened" status. Confirmed live 2026-08-05: the actual status badge reads **"PRE-SCREENED"**, matching ADO's expected wording — the application has progressed past the "AWAITING PRE-SCREENING" state that ADMINPORTAL-106529/106538 had documented earlier (application state moves forward over time; that earlier note is now stale, not a live discrepancy).
- **Assertions:**
  - [x] ASSERT (BLOCKING) Personal Details panel is visible with First Name "Fred"
  - [x] ASSERT (BLOCKING) status badge "PRE-SCREENED" is visible

---

### TC-07 — Navigate to Work Experience panel and attempt to click the Delete icon (ADO #106551 step 8) — ⚠️ EXPECTED TO FAIL (app bug)

- **Expected result per ADO:** "Are you sure want to delete this item?" popup should appear.
- **Actual behavior:** No Delete icon exists on any Work Experience row (view mode or edit mode) — only Edit, and once in edit mode: Save/Cancel/date-clear icons.
- **Assertions:**
  - [x] ASSERT (BLOCKING) a `.anticon-delete` icon exists within the target Work Experience row — **this assertion is expected to fail, proving the bug**

---

### TC-08 — Click on Cancel button (ADO #106551 step 9) — SKIPPED (blocked by TC-07)

### TC-09 — Click on Delete button (ADO #106551 step 10) — SKIPPED (blocked by TC-07)

### TC-10 — Click on OK button (ADO #106551 step 11) — SKIPPED (blocked by TC-07)

- No Delete control exists to interact with; these steps cannot be executed against the current build.

---

## Teardown
- No teardown required — no data was modified. This run is read-only/investigative; TC-07 fails by design to record the missing-Delete-icon defect as an automated, reproducible check.
