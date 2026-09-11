# Test Plan: ADMINPORTAL-106405 — Verify not appointed

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
| ADO Suite | Not currently linked to a suite in Test Plan #99437 (work item #106405 has no `Tested By` relation, no parent). |
| ADO Test Case | [#106405](https://dev.azure.com/boxfusion/pd-recruitment/_workitems/edit/106405) — Verify not appointed |
| Target Job / Application | Job Posting Ref No **"HRM 354"** ("Tester") → existing applicant **Everything F** (Fred Everything) — a SEPARATE application from the ones on Ref 41/43/FRD 123, status **INTERVIEWED** |

## Objective
> Validate that a Recruiter can search for Job Posting "HRM 354", open applicant Everything F's Interviewed application, click Not Appointed, populate a reason, click Submit, and have the application's status change to Rejected.

> **🐛 Documentation discrepancy confirmed live 2026-08-06:** ADO step 11 says to click an "OK" button, but the dialog (titled "Reason For not Appointing") actually has "Cancel"/**"Submit"** buttons — same as confirmed in ADMINPORTAL-104400/104476. This spec uses "Submit", matching the actual app behavior.
>
> Confirmed live: "HRM 354" ("Tester") is a non-numeric Job Posting reference with its own SEPARATE "Everything F" application, independent of the Ref 41 (Rejected), Ref 43 (Appointed), and FRD 123 (Rejected) applications already actioned.

> **⚠️ STATEFUL/REAL/PERMANENT ACTION — requires confirmation before running:** TC-06 clicks the real Submit button after populating a reason, permanently changing this application's status from Interviewed to Rejected. This is pre-existing shared QA test data, not created by this automation session.

## Preconditions
- [ ] App is reachable at https://pd-recruitment-adminportal-qa.shesha.app/
- [ ] Recruiter credentials are valid (Kwenas / 123qwe)
- [ ] Job Posting "HRM 354" exists with exactly one Interviewed application for "Everything F"

## Test Cases

### TC-01 — Login as Kwena (ADO #106405 step 2)
- **Assertions:**
  - [x] ASSERT (BLOCKING) URL no longer contains `/login`

---

### TC-02 — Click on the Recruitment dropdown (ADO #106405 step 3)
- **Assertions:**
  - [x] ASSERT (BLOCKING) submenus are visible: "Job Posting Dashboard", "Location", "Salary Levels", "Candidates", "Candidates Applications"

---

### TC-03 — Click on Job Posting dashboard (ADO #106405 step 4)
- **Assertions:**
  - [x] ASSERT (BLOCKING) "Job Postings" index table is displayed

---

### TC-04 — Search for a job with Ref HRM 354, open in details view (ADO #106405 steps 5-6)
- **Assertions:**
  - [x] ASSERT (BLOCKING) search results return the HRM 354 record
  - [x] ASSERT (BLOCKING) Job Details panel opens successfully

---

### TC-05 — Click on Interviewed tab, open Everything F's application (ADO #106405 steps 7-8)
- **Assertions:**
  - [x] ASSERT (BLOCKING) list of interviewed applications is displayed, including "Everything F"
  - [x] ASSERT (BLOCKING) application opens successfully with "INTERVIEWED" status

---

### TC-06 — Scroll to the bottom, click Not Appointed, populate reason, click Submit (ADO #106405 steps 9-11) — ⚠️ REAL, PERMANENT STATUS CHANGE
- **Expected result:** Reason should be populated successfully and Submit button should be enabled; system should auto-refresh and route to applications page
- **Assertions:**
  - [x] ASSERT (BLOCKING) "Reason For not Appointing" dialog appears
  - [x] ASSERT (BLOCKING) after populating the reason, the Submit button is enabled
  - [x] ASSERT (BLOCKING) page auto-navigates back to the applications table after clicking Submit

---

### TC-07 — Open the actioned application in details view (ADO #106405 step 12)
- **Expected result:** Application should open successfully and the status should change to Rejected
- **Assertions:**
  - [x] ASSERT (BLOCKING) application opens successfully and status shows "REJECTED"

---

## Teardown
- No automated teardown. TC-06 performs a real, permanent status change (Interviewed → Rejected) on a pre-existing, shared QA test candidate's application. Not reversible via the UI.
