# Test Plan: ADMINPORTAL-106403 — Decline Pre-Screened

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
| ADO Suite | Not currently linked to a suite in Test Plan #99437 (work item #106403 has parent #106918). |
| ADO Test Case | [#106403](https://dev.azure.com/boxfusion/pd-recruitment/_workitems/edit/106403) — Decline Pre-Screened |
| Target Job / Application | Job Posting Ref No **41** ("Auto Job Posting 1") → existing applicant **Fred Everything** (Identity Number `2606108675655`) — a SEPARATE application from the one on Ref No 43, status **PRE-SCREENED** |

## Objective
> Validate that a Recruiter can search for Job Posting Ref No 41, open applicant Everything F's Pre-Screened application, click Decline, populate a reason, click OK, and have the application's status change to Rejected.

> **🎯 Confirmed live 2026-08-06:** the SAME person "Fred Everything" (Identity Number `2606108675655`) has a SEPARATE application on Job Posting Ref No 41 ("Auto Job Posting 1"), independent of the Ref No 43 application already advanced through the full pipeline to Appointed (ADMINPORTAL-104448/104464/104475/104476). This Ref 41 application is currently Pre-Screened and has never been actioned before — this test case is genuinely executable against it.
>
> Reuses the exact "Reason for Decline" popup pattern confirmed in ADMINPORTAL-106398: title "Reason for Decline", "Cancel"/"Ok" buttons (lowercase "k").
>
> **⚠️ STATEFUL/REAL/PERMANENT ACTION — requires confirmation before running:** TC-06 clicks the real "Ok" button after populating a reason, permanently changing this application's status from Pre-Screened to Rejected. This is pre-existing shared QA test data, not created by this automation session.

## Preconditions
- [ ] App is reachable at https://pd-recruitment-adminportal-qa.shesha.app/
- [ ] Recruiter credentials are valid (Kwenas / 123qwe)
- [ ] Job Posting Ref No 41 exists with exactly one Pre-Screened application for "Everything F"

## Test Cases

### TC-01 — Login as Kwena (ADO #106403 step 2)
- **Assertions:**
  - [x] ASSERT (BLOCKING) URL no longer contains `/login`

---

### TC-02 — Click on the Recruitment dropdown (ADO #106403 step 3)
- **Assertions:**
  - [x] ASSERT (BLOCKING) submenus are visible: "Job Posting Dashboard", "Location", "Salary Levels", "Candidates", "Candidates Applications"

---

### TC-03 — Click on Job Posting dashboard (ADO #106403 step 4)
- **Assertions:**
  - [x] ASSERT (BLOCKING) "Job Postings" index table is displayed

---

### TC-04 — Search for a job with reference number 41 (ADO #106403 step 5)
- **Assertions:**
  - [x] ASSERT (BLOCKING) search results return the Ref No 41 record

---

### TC-05 — Click on Pre-Screened tab, open Everything F's application (ADO #106403 steps 6-7)
- **Assertions:**
  - [x] ASSERT (BLOCKING) list of pre-screened applications is displayed, including "Everything F"
  - [x] ASSERT (BLOCKING) application opens successfully in details view

---

### TC-06 — Scroll to the bottom, click Decline, populate reason, click OK (ADO #106403 steps 9-11) — ⚠️ REAL, PERMANENT STATUS CHANGE
- **Expected result:** Reason should be populated successfully and OK button should be enabled; system should auto-refresh and route to applications page
- **Assertions:**
  - [x] ASSERT (BLOCKING) "Reason for Decline" dialog appears
  - [x] ASSERT (BLOCKING) after populating the reason, the "Ok" button is enabled
  - [x] ASSERT (BLOCKING) page auto-navigates back to the applications table after clicking Ok

---

### TC-07 — Open the actioned application in details view (ADO #106403 step 12)
- **Expected result:** Application should open successfully and the status should change to Rejected
- **Assertions:**
  - [x] ASSERT (BLOCKING) application opens successfully and status shows "REJECTED"

---

## Teardown
- No automated teardown. TC-06 performs a real, permanent status change (Pre-Screened → Rejected) on a pre-existing, shared QA test candidate's application. Not reversible via the UI.
