# Test Plan: ADMINPORTAL-104476 — Verify Appointed

> **Status:** Ready
> **Owner:** QA
> **Last Updated:** 2026-08-06
> **Estimated Duration:** 150s

## Metadata
| Field | Value |
|-------|-------|
| App URL | https://pd-recruitment-adminportal-qa.shesha.app/ |
| Environment | QA |
| Login As | Kwenas / 123qwe (displays as "Kwena Semono" — the Recruiter role) |
| ADO Plan | [#99437 — eRecruitment Test Plan](https://dev.azure.com/boxfusion/pd-recruitment/_testPlans/define?planId=99437) |
| ADO Suite | Not currently linked to a suite in Test Plan #99437 (work item #104476 has no `Tested By` relation, no parent). |
| ADO Test Case | [#104476](https://dev.azure.com/boxfusion/pd-recruitment/_workitems/edit/104476) — Verify Appointed |
| Target Job / Application | Job Posting Ref No **43** ("Auto Job Post3") → existing applicant **Fred Everything** (Identity Number `2606108675655`), status **INTERVIEWED** (set by ADMINPORTAL-104475) |

## Objective
> Validate that a Recruiter can open Job Posting Ref No 43 via the standard Recruitment > Job Posting Dashboard path, open applicant Fred Everything's application from the Interviewed tab, upload both required Appointment Documents (Approved Submission, Appointment Letter), and click Appointed to move the application to the Appointed stage.

> Same pattern as ADMINPORTAL-106335: the panel is labelled "Appointment Documents"; uploads use a native OS file chooser; the "Appointed" button does not exist/enable until BOTH documents are uploaded.
>
> **⚠️ STATEFUL/REAL/PERMANENT ACTION — requires confirmation before running:** TC-06 clicks the real Appointed button, permanently changing Fred Everything's application status from Interviewed to Appointed. This is pre-existing shared QA test data, not created by this automation session.

## Preconditions
- [ ] App is reachable at https://pd-recruitment-adminportal-qa.shesha.app/
- [ ] Recruiter credentials are valid (Kwenas / 123qwe)
- [ ] Job Posting Ref No 43 exists with applicant Fred Everything Interviewed
- [ ] Fixture file exists at `projects/eRecruitment/test-plans/AdminPortal/fixtures/blank document.pdf`

## Test Cases

### TC-01 — Login as Kwena (ADO #104476 step 2)
- **Assertions:**
  - [x] ASSERT (BLOCKING) URL no longer contains `/login`

---

### TC-02 — Expand the Recruitment dropdown (ADO #104476 step 3)
- **Assertions:**
  - [x] ASSERT (BLOCKING) "Job Posting Dashboard" and other submenus are visible

---

### TC-03 — Click on Job Posting dashboard, open Ref No 43 (ADO #104476 steps 4-5)
- **Assertions:**
  - [x] ASSERT (BLOCKING) Job Details panel is displayed with Job Reference Number "43"

---

### TC-04 — Navigate to Applications panel, click Interviewed tab, open Everything F's application (ADO #104476 steps 6-7)
- **Assertions:**
  - [x] ASSERT (BLOCKING) list of interviewed applications is displayed, including "Everything F"
  - [x] ASSERT (BLOCKING) application opens successfully with "INTERVIEWED" status

---

### TC-05 — Scroll to Appointment Documents panel, upload Approved Submission and Appointment Letter (ADO #104476 step 8)
- **Assertions:**
  - [x] ASSERT (BLOCKING) both documents are rendered on the UI after upload
  - [x] ASSERT (BLOCKING) "Appointed" button is visible and enabled

---

### TC-06 — Click on the Appointed button (ADO #104476 step 9) — ⚠️ REAL, PERMANENT STATUS CHANGE
- **Expected result:** System should auto-refresh and navigate to the Screen Applications page; status should change to Appointed
- **Assertions:**
  - [x] ASSERT (BLOCKING) page auto-navigates away from the individual application view

---

### TC-07 — Click on the Appointed tab (ADO #104476 step 10)
- **Assertions:**
  - [x] ASSERT (BLOCKING) the application is displayed under the Appointed tab

---

## Teardown
- No automated teardown. TC-06 performs a real, permanent status change (Interviewed → Appointed) on a pre-existing, shared QA test candidate's application. Not reversible via the UI.
