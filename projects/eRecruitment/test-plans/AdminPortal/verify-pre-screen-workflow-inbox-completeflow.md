# Test Plan: ADMINPORTAL-104448 — Verify Pre-Sreen

> **Status:** Ready
> **Owner:** QA
> **Last Updated:** 2026-08-06
> **Estimated Duration:** 120s

## Metadata
| Field | Value |
|-------|-------|
| App URL | https://pd-recruitment-adminportal-qa.shesha.app/ |
| Environment | QA |
| Login As | Kwenas / 123qwe (displays as "Kwena Semono" — the Recruiter role) |
| ADO Plan | [#99437 — eRecruitment Test Plan](https://dev.azure.com/boxfusion/pd-recruitment/_testPlans/define?planId=99437) |
| ADO Suite | Not currently linked to a suite in Test Plan #99437 (work item #104448 has no `Tested By` relation, no parent). |
| ADO Test Case | [#104448](https://dev.azure.com/boxfusion/pd-recruitment/_workitems/edit/104448) — Verify Pre-Sreen |
| Target Job / Application | Job Posting Ref No **43** ("Auto Job Post3") → existing applicant **Fred Everything** (Identity Number `2606108675655`), status **AWAITING PRE-SCREENING** |

## Objective
> Validate that a Recruiter can reach a pending Pre-Screening review via **Workflows > Inbox** (not the Job Posting Dashboard used by every other test case in this project), open the "Screen Applications" workflow task for Job Posting Ref No 43, open applicant Fred Everything's application, assign a Final Category and Comments, check the Declaration checkbox, and click Submit to move the application's status to Pre-Screened.

> **🎯 Different navigation path from every other test case automated so far:** this one goes via the sidebar's **Workflows > Inbox** menu (Recruiter's assigned workflow tasks), not **Recruitment > Job Posting Dashboard**. Confirmed live 2026-08-06: Inbox shows "Screen Applications" tasks; the row for Ref No 43 opens a "Screen Applications: Auto Job Post3" workflow page with the same Job Details/Applications structure as the dashboard view.
>
> **⚠️ Selector trap confirmed live:** the Inbox table appears to continuously re-render (note the "LIVE" badges on `Shesha/header` and `Shesha.Workflow/workflows-inbox`), causing a plain `.click()` on the applicant's row link to fail with "element was detached from the DOM, retrying" in an unstable loop. Fixed by capturing the row link's `href` attribute and navigating directly via `page.goto()` instead of clicking.
>
> Confirmed live: opening the applicant navigates to a page titled **"Pre-Screen : Job Application for Fred Everything"** with status badge **"AWAITING PRE-SCREENING"** (not "awaiting Pre-Screening" as ADO's step 73 describes — casing difference only). "Final Category" (A/B/C) and "Comments" are both required (red asterisk) fields under "Category Details"; the Declaration checkbox text is "I confirm that I have reviewed the candidate's application and I have assigned the application to the relevant category."
>
> **Minor discrepancy from ADO step 77:** confirmed live that the "Submit" button becomes enabled once Final Category + Comments are populated — independent of the Declaration checkbox's state (Submit was already enabled before checking the checkbox). This does not block the flow described by the test case, since the checkbox is checked before Submit regardless.
>
> **⚠️ STATEFUL/REAL/PERMANENT ACTION — requires confirmation before running:** TC-06 clicks the real Submit button, changing an existing, pre-existing test candidate's ("Fred Everything") application status from "Awaiting Pre-Screening" to "Pre-Screened". Unlike other test cases in this project, this application is NOT one created by this automation session — it's pre-existing shared QA test data.

## Preconditions
- [ ] App is reachable at https://pd-recruitment-adminportal-qa.shesha.app/
- [ ] Recruiter credentials are valid (Kwenas / 123qwe)
- [ ] Job Posting Ref No 43 ("Auto Job Post3") has a pending "Screen Applications" workflow task in the Recruiter's Inbox, with applicant "Fred Everything" awaiting Pre-Screening

## Test Cases

### TC-01 — Login as Kwena (ADO #104448 step 69)
- **Assertions:**
  - [x] ASSERT (BLOCKING) URL no longer contains `/login`

---

### TC-02 — Expand the Workflows dropdown and click Inbox (ADO #104448 steps 70-71)
- **Assertions:**
  - [x] ASSERT (BLOCKING) "Inbox", "Sent Items", "My Items", "Draft" submenus are visible
  - [x] ASSERT (BLOCKING) Incoming Items index table is displayed

---

### TC-03 — Open the job post with reference number 43 (ADO #104448 step 72)
- **Assertions:**
  - [x] ASSERT (BLOCKING) "Screen Applications: Auto Job Post3" page opens successfully

---

### TC-04 — Navigate to Applications panel and click the Surname/Initials link for Fred Everything (ADO #104448 step 73)
- **Assertions:**
  - [x] ASSERT (BLOCKING) application opens in details view with "AWAITING PRE-SCREENING" status

---

### TC-05 — Select Final Category B, populate Comments, check the Declaration checkbox (ADO #104448 steps 74-77)
- **Assertions:**
  - [x] ASSERT (BLOCKING) "B" is displayed in the Final Category field after selection
  - [x] ASSERT (BLOCKING) Comments field contains the entered text
  - [x] ASSERT (BLOCKING) Declaration checkbox is checked
  - [x] ASSERT (BLOCKING) Submit button is enabled

---

### TC-06 — Click on Submit (ADO #104448 step 78) — ⚠️ REAL, PERMANENT STATUS CHANGE
- **Expected result:** System should auto refresh and change the status of the application to Pre-Screened
- **Assertions:**
  - [x] ASSERT (BLOCKING) after Submit + reload, the application shows "PRE-SCREENED" status

---

## Teardown
- No automated teardown. TC-06 performs a real, permanent status change (Awaiting Pre-Screening → Pre-Screened) on a pre-existing, shared QA test candidate's application. Not reversible via the UI.
