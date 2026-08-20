# Test Plan: ADMINPORTAL-106404 — Verify Not Interviewed

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
| ADO Suite | Not currently linked to a suite in Test Plan #99437 (work item #106404 has no `Tested By` relation, no parent). |
| ADO Test Case | [#106404](https://dev.azure.com/boxfusion/pd-recruitment/_workitems/edit/106404) — Verify Not Interviewed |
| Target Job / Application | Job Posting Ref No **"FRD 123"** ("Designer") → existing applicant **Everything F** (Fred Everything) — a SEPARATE application from the ones on Ref No 41/43, status **SHORTLISTED** |

## Objective
> Validate that a Recruiter can search for Job Posting "FRD 123", open applicant Everything F's Shortlisted application, click Not Interviewed, populate a reason, click OK, and have the application's status change to Rejected.

> **🎯 Confirmed live 2026-08-06:** "FRD 123" ("Designer") is a non-numeric Job Posting reference. The same person "Fred Everything" has yet another SEPARATE application here, independent of the Ref 41 (Rejected via ADMINPORTAL-106403) and Ref 43 (Appointed via ADMINPORTAL-104448/104464/104475/104476) applications. This FRD 123 application is Shortlisted and untouched.
>
> Reuses the exact "Reason for Not Interviewing" popup pattern confirmed in ADMINPORTAL-106399: "Reason" textarea, "Close" button present from the start, "Ok" button appears once the Reason field has text.

> **⚠️ STATEFUL/REAL/PERMANENT ACTION — requires confirmation before running:** TC-06 clicks the real "OK" button after populating a reason, permanently changing this application's status from Shortlisted to Rejected. This is pre-existing shared QA test data, not created by this automation session.

## Preconditions
- [ ] App is reachable at https://pd-recruitment-adminportal-qa.shesha.app/
- [ ] Recruiter credentials are valid (Kwenas / 123qwe)
- [ ] Job Posting "FRD 123" exists with exactly one Shortlisted application for "Everything F"

## Test Cases

### TC-01 — Login as Kwena (ADO #106404 step 2)
- **Assertions:**
  - [x] ASSERT (BLOCKING) URL no longer contains `/login`

---

### TC-02 — Click on the Recruitment dropdown (ADO #106404 step 3)
- **Assertions:**
  - [x] ASSERT (BLOCKING) submenus are visible: "Job Posting Dashboard", "Location", "Salary Levels", "Candidates", "Candidates Applications"

---

### TC-03 — Click on Job Posting dashboard (ADO #106404 step 4)
- **Assertions:**
  - [x] ASSERT (BLOCKING) "Job Postings" index table is displayed

---

### TC-04 — Search for a job with Reference number FRD 123, open in details view (ADO #106404 steps 5-6)
- **Assertions:**
  - [x] ASSERT (BLOCKING) search results return the FRD 123 record
  - [x] ASSERT (BLOCKING) Job Details panel opens successfully

---

### TC-05 — Click on Shortlisted tab, open Everything F's application (ADO #106404 steps 7-8)
- **Assertions:**
  - [x] ASSERT (BLOCKING) list of shortlisted applications is displayed, including "Everything F"
  - [x] ASSERT (BLOCKING) application opens successfully in details view

---

### TC-06 — Scroll to the bottom, click Not Interviewed, populate reason, click OK (ADO #106404 steps 9-11) — ⚠️ REAL, PERMANENT STATUS CHANGE
- **Expected result:** Reason should be populated successfully and OK button should be enabled; system should auto-refresh and route to applications page
- **Assertions:**
  - [x] ASSERT (BLOCKING) "Reason for Not Interviewing" dialog appears
  - [x] ASSERT (BLOCKING) after populating the reason, the OK button is enabled
  - [x] ASSERT (BLOCKING) page auto-navigates back to the applications table after clicking OK

---

### TC-07 — Open the actioned application in details view (ADO #106404 step 12)
- **Expected result:** Application should open successfully and the status should change to Rejected
- **Assertions:**
  - [x] ASSERT (BLOCKING) application opens successfully and status shows "REJECTED"

---

## Teardown
- No automated teardown. TC-06 performs a real, permanent status change (Shortlisted → Rejected) on a pre-existing, shared QA test candidate's application. Not reversible via the UI.
