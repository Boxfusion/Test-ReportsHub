# Test Plan: ADMINPORTAL-106544 — Verify qualification status (complete)

> **Status:** Automated, confirmed failing at TC-09 — target UI control does not exist
> **Owner:** QA
> **Last Updated:** 2026-08-05
> **Estimated Duration:** ~145s (TC-01–TC-08 pass, TC-09 fails, TC-10–TC-13 skipped)

## Metadata
| Field | Value |
|-------|-------|
| App URL | https://pd-recruitment-adminportal-qa.shesha.app/ |
| Environment | QA |
| Login As | Kwenas / 123qwe (displays as "Kwena Semono" — the Recruiter role) |
| ADO Plan | [#99437 — eRecruitment Test Plan](https://dev.azure.com/boxfusion/pd-recruitment/_testPlans/define?planId=99437) |
| ADO Suite | Not currently linked to a suite in Test Plan #99437 (work item #106544 has no `Tested By` relation) — same situation as the other AdminPortal test cases automated in this hub. |
| ADO Test Case | [#106544](https://dev.azure.com/boxfusion/pd-recruitment/_workitems/edit/106544) — Verify qualification status (complete) |
| Bug | [test-reports/bugs/2026-08-05-qualification-status-field-does-not-exist.md](../../test-reports/bugs/2026-08-05-qualification-status-field-does-not-exist.md) |

## Objective
> ADO steps 9-13 ask to open a "Qualification Status" dropdown on the Education panel's Secondary/Tertiary Qualifications row edit mode, select "Complete", then interact with an associated datepicker (click it, select a previous date), and Save.

## Blocker
Same root cause already confirmed and logged for [ADMINPORTAL-106543](./verify-edit-qualification-status.md): the "Qualification Status" field does not exist anywhere in the Education panel (Secondary or Tertiary Qualifications tables, in or out of edit mode) — confirmed via page-wide text search and a full column-header scan, then re-confirmed via a manual live step-by-step walkthrough. Since this field is the entry point for the rest of this test case's steps (step 9's dropdown, and whatever datepicker would appear alongside a "Complete" status in steps 11-12), none of steps 9-13 can genuinely pass.

A `.spec.ts` **has** been written for this plan and confirmed run end-to-end 2026-08-05: TC-01–TC-08 automate and pass the working navigation (login through entering the Secondary Qualifications row's edit mode); TC-09 attempts the click exactly as ADO describes and **genuinely fails** ("element(s) not found" for the Qualification Status dropdown) via a real Playwright assertion, not a manual note; TC-10–TC-13 are then skipped by serial mode since they depend on TC-09. It's written to assert ADO's expected behavior rather than mask the gap, so the test will start passing on its own if this field is ever implemented, which is a useful signal to revisit it.

## Preconditions
- N/A — blocked before any steps could be attempted against the target field.

## Test Cases

### TC-01 through TC-08 — Login, navigation, and reaching Education panel edit mode

- **PASS.** Same navigation as [ADMINPORTAL-106540](./verify-edit-institution.md) TC-01–TC-07 (login, sidebar, Recruitment menu, Job Posting dashboard, open Job Ref 40, open target application, open Education panel row edit mode), now automated directly in this spec and confirmed passing 2026-08-05.

---

### TC-09 — Click on the Qualification Status dropdown (ADO #106544 step 9) — ⚠️ CONFIRMED FAILING

- **Expected result (per ADO):** List of options should be displayed
- **Actual result:** No such dropdown exists anywhere on the page — the spec's locator (scoped the same way other row-level dropdowns are, so it will start matching automatically if this field is ever implemented) resolves to zero elements. Confirmed via a real automated run 2026-08-05.
- **Assertions:**
  - [x] FAILED (as expected) — target control does not exist

---

### TC-10 — Select "Complete" option (ADO #106544 step 10) — SKIPPED

- Serial mode skips this after TC-09's failure.

---

### TC-11 — Click inside the datepicker field (ADO #106544 step 11) — SKIPPED

- Serial mode skips this after TC-09's failure.

---

### TC-12 — Select a previous date (ADO #106544 step 12) — SKIPPED

- Serial mode skips this after TC-09's failure.

---

### TC-13 — Click on Save (ADO #106544 step 13) — SKIPPED

- Serial mode skips this after TC-09's failure.

---

## Teardown
- None — no changes were made to the application; the run never reached a state-mutating step.
