# Test Plan: ADMINPORTAL-106543 — Verify edit qualification status (In Progress)

> **Status:** Blocked — target UI control does not exist
> **Owner:** QA
> **Last Updated:** 2026-08-05
> **Estimated Duration:** N/A — not automatable in current state

## Metadata
| Field | Value |
|-------|-------|
| App URL | https://pd-recruitment-adminportal-qa.shesha.app/ |
| Environment | QA |
| Login As | Kwenas / 123qwe (displays as "Kwena Semono" — the Recruiter role) |
| ADO Plan | [#99437 — eRecruitment Test Plan](https://dev.azure.com/boxfusion/pd-recruitment/_testPlans/define?planId=99437) |
| ADO Suite | Not currently linked to a suite in Test Plan #99437 (work item #106543 has no `Tested By` relation) — same situation as the other AdminPortal test cases automated in this hub. Parent: #107190. |
| ADO Test Case | [#106543](https://dev.azure.com/boxfusion/pd-recruitment/_workitems/edit/106543) — Verify edit qualification status (In Progress) |
| Bug | [test-reports/bugs/2026-08-05-qualification-status-field-does-not-exist.md](../../test-reports/bugs/2026-08-05-qualification-status-field-does-not-exist.md) |

## Objective
> ADO steps 9-11 ask to open a "Qualification Status" dropdown on the Education panel's Secondary/Tertiary Qualifications row edit mode, select "In Progress", and Save.

## Blocker
Confirmed live 2026-08-05: **no "Qualification Status" field exists anywhere in the Education panel.** A page-wide text search for "Qualification Status" (any casing) returns zero matches, both before and after entering row edit mode. The Secondary Qualifications table's edit mode exposes exactly Institution, Qualification Name, Qualification Type, Certificate; the Tertiary Qualifications table exposes Institution, Qualification Name, Date Obtained, Certificate. A full column-header scan of the page confirms no "Status" column anywhere. See the linked bug report for full detail — this matches a discrepancy already noted while automating [ADMINPORTAL-106540](./verify-edit-institution.md) (step 8 lists "Qualification status" among 5 expected fields, but only 3 of those 5 actually exist).

No `.spec.ts` has been written for this plan, since there is no real control in the UI to automate against. This plan exists so the blocker is tracked in the dashboard rather than silently missing.

## Preconditions
- N/A — blocked before any steps could be attempted against the target field.

## Test Cases

### TC-01 through TC-08 — Login, navigation, and reaching Education panel edit mode

- These steps are identical to [ADMINPORTAL-106540](./verify-edit-institution.md) TC-01–TC-07 (login, sidebar, Recruitment menu, Job Posting dashboard, open Job Ref 40, open target application, open Education panel row edit mode) and were confirmed working in that automation. Not re-automated here since the blocker is unrelated to navigation.

---

### TC-09 — Click on the Qualification Status dropdown (ADO #106543 step 9) — ⚠️ BLOCKED

- **Expected result (per ADO):** List of options should be displayed
- **Actual result:** No such dropdown exists anywhere on the page. Cannot proceed.
- **Assertions:**
  - [ ] BLOCKED — target control does not exist

---

### TC-10 — Select "In Progress" option (ADO #106543 step 10) — NOT EXECUTABLE

- Cannot be attempted; depends on TC-09.

---

### TC-11 — Click on Save (ADO #106543 step 11) — NOT EXECUTABLE

- Cannot be attempted; depends on TC-09/TC-10.

---

## Teardown
- None — no changes were made to the application; the run never reached a state-mutating step.
