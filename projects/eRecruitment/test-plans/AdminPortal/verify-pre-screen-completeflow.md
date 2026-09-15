# Test Plan: ADMINPORTAL-106332 — Verify Pre-Screen

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
| ADO Suite | Not currently linked to a suite in Test Plan #99437 (work item #106332 has no `Tested By` relation, no parent). |
| ADO Test Case | [#106332](https://dev.azure.com/boxfusion/pd-recruitment/_workitems/edit/106332) — Verify Pre-Screen |
| Target Job / Application | Job Posting Ref No **40** ("Auto Job Post") → the application created on ADMINPORTAL-106172, currently listed as **"Edit Last Name A"**, status "PRE-SCREENED" |

## Objective
> Validate that a Recruiter can open the Pre-Screened tab of a Job Posting's Applications panel, open the target application, and shortlist it via the Shortlist button — moving the application forward in the recruitment pipeline.

> **⚠️ STATEFUL/REAL EDIT — requires confirmation before running:** TC-08 clicks the real Shortlist button, changing the application's status from "PRE-SCREENED" to "Shortlisted". This is a pipeline-stage transition, not a simple field edit — confirm before running.
>
> Note: ADO step 10 ("ActionStep") has empty action/expected-result text in the source work item — no corresponding test case is derived from it.

## Preconditions
- [ ] App is reachable at https://pd-recruitment-adminportal-qa.shesha.app/
- [ ] Recruiter credentials are valid (Kwenas / 123qwe)
- [ ] Job Posting Ref No 40 exists with an application currently listed as "Edit Last Name A", status "PRE-SCREENED"

## Test Cases

### TC-01 — Login as Kwena (ADO #106332 step 2)
- **Assertions:**
  - [x] ASSERT (BLOCKING) URL no longer contains `/login`

---

### TC-02 — Click the sidebar toggle (ADO #106332 step 3)
- **Assertions:**
  - [x] ASSERT (BLOCKING) "Recruitment" navigation item is visible

---

### TC-03 — Click on Recruitment dropdown (ADO #106332 step 4)
- **Assertions:**
  - [x] ASSERT (BLOCKING) submenus are visible: "Job Posting Dashboard", "Location", "Salary Levels", "Candidates", "Candidates Applications"

---

### TC-04 — Click on Job Posting dashboard (ADO #106332 step 5)
- **Assertions:**
  - [x] ASSERT (BLOCKING) "Job Postings" index table is displayed with a "Reference No" column

---

### TC-05 — Open Job Posting Ref No 40 (ADO #106332 step 6)
- **Assertions:**
  - [x] ASSERT (BLOCKING) Job Details panel is displayed with Job Reference Number "40"

---

### TC-06 — Navigate to Applications panel and click the "Pre-Screened" tab (ADO #106332 step 7)
- **Assertions:**
  - [x] ASSERT (BLOCKING) list of pre-screened applications is displayed, including "Edit Last Name A"

---

### TC-07 — Click on the Surname and Initials link to open the application (ADO #106332 step 8)
- **Assertions:**
  - [x] ASSERT (BLOCKING) application opens in details view with Personal Details panel visible

---

### TC-08 — Scroll to the bottom of the page and click Shortlist button (ADO #106332 step 9) — ⚠️ REAL, PERSISTENT STATUS CHANGE
- **Expected result:** Application should be successfully shortlisted with a success message displayed, and the system should auto-refresh and navigate to the all-applications table
- **Assertions:**
  - [x] ASSERT (BLOCKING) success message is displayed (best-effort — the toast is transient and may auto-dismiss before being checked)
  - [x] ASSERT (BLOCKING) page auto-navigates back to the applications table
  - [x] ASSERT (BLOCKING) the application now appears under the "Shortlisted" tab (authoritative confirmation of the real status change)

> **Note (2026-08-06):** on the first live run, the transient success-toast assertion produced a false FAIL (toast had already vanished by the time a 15s-timeout check ran) even though the real Shortlist action succeeded — confirmed via a separate live check that the application moved from "Pre-screened" to "Shortlisted". The spec now treats the Shortlisted-tab appearance as the authoritative pass/fail signal instead of the toast.

---

## Teardown
- No automated teardown. TC-08 performs a real, persistent status change (PRE-SCREENED → Shortlisted) on the target application. This is not reversible via the UI.
