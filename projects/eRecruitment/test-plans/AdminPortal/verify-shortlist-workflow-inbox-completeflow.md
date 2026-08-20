# Test Plan: ADMINPORTAL-104464 — Verify Shortlist

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
| ADO Suite | Not currently linked to a suite in Test Plan #99437 (work item #104464 has no `Tested By` relation, no parent). |
| ADO Test Case | [#104464](https://dev.azure.com/boxfusion/pd-recruitment/_workitems/edit/104464) — Verify Shortlist |
| Target Job / Application | Job Posting Ref No **43** ("Auto Job Post3") → existing applicant **Fred Everything** (Identity Number `2606108675655`), status **PRE-SCREENED** (set by ADMINPORTAL-104448) |

## Objective
> Validate that a Recruiter can open Job Posting Ref No 43 via **Recruitment > Job Posting Dashboard** (per requester direction — deviates from ADO's literal Workflows > Inbox navigation, same path used by every other test case in this project), open applicant Fred Everything's application from the Pre-Screened tab, and click Shortlist to move the application to Shortlisted.

> **Note:** ADO's literal steps (69-73, 82, 81) describe reaching this application via Workflows > Inbox (same non-standard path as ADMINPORTAL-104448). Per requester direction, this plan instead uses the standard Recruitment > Job Posting Dashboard path used by every other test case in this project. The underlying Applications panel / Pre-Screened tab / Shortlist button structure is identical either way — confirmed via ADMINPORTAL-104448/106332.
>
> **⚠️ STATEFUL/REAL/PERMANENT ACTION — requires confirmation before running:** TC-06 clicks the real Shortlist button, changing Fred Everything's application status from Pre-Screened to Shortlisted. This is pre-existing shared QA test data, not created by this automation session.

## Preconditions
- [ ] App is reachable at https://pd-recruitment-adminportal-qa.shesha.app/
- [ ] Recruiter credentials are valid (Kwenas / 123qwe)
- [ ] Job Posting Ref No 43 exists with applicant Fred Everything Pre-Screened

## Test Cases

### TC-01 — Login as Kwena (ADO #104464 step 69)
- **Assertions:**
  - [x] ASSERT (BLOCKING) URL no longer contains `/login`

---

### TC-02 — Click the sidebar toggle
- **Assertions:**
  - [x] ASSERT (BLOCKING) "Recruitment" navigation item is visible

---

### TC-03 — Click on Recruitment dropdown
- **Assertions:**
  - [x] ASSERT (BLOCKING) submenus are visible: "Job Posting Dashboard", "Location", "Salary Levels", "Candidates", "Candidates Applications"

---

### TC-04 — Click on Job Posting dashboard, open Ref No 43 (ADO #104464 step 72, via standard navigation)
- **Assertions:**
  - [x] ASSERT (BLOCKING) Job Details panel is displayed with Job Reference Number "43"

---

### TC-05 — Navigate to Applications panel, click Pre-Screened tab, click the Surname/Initials link for Everything F (ADO #104464 steps 73, 82)
- **Assertions:**
  - [x] ASSERT (BLOCKING) list of pre-screened applications is displayed, including "Everything F"
  - [x] ASSERT (BLOCKING) application opens successfully with "PRE-SCREENED" status

---

### TC-06 — Scroll to the bottom and click Shortlist (ADO #104464 step 81) — ⚠️ REAL, PERMANENT STATUS CHANGE
- **Expected result:** Application should be successfully shortlisted
- **Assertions:**
  - [x] ASSERT (BLOCKING) page auto-navigates away from the individual application view
  - [x] ASSERT (BLOCKING) application now shows Shortlisted status (verified via the Shortlisted tab)

---

## Teardown
- No automated teardown. TC-06 performs a real, permanent status change (Pre-Screened → Shortlisted) on a pre-existing, shared QA test candidate's application. Not reversible via the UI.
