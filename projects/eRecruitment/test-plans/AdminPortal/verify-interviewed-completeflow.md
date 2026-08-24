# Test Plan: ADMINPORTAL-106335 — Verify Interviewed

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
| ADO Suite | Not currently linked to a suite in Test Plan #99437 (work item #106335 has no `Tested By` relation, no parent). |
| ADO Test Case | [#106335](https://dev.azure.com/boxfusion/pd-recruitment/_workitems/edit/106335) — Verify Interviewed |
| Target Job / Application | Job Posting Ref No **40** ("Auto Job Post") → the application created on ADMINPORTAL-106172, currently listed as **"Edit Last Name A"**, status "INTERVIEWED" |

## Objective
> Validate that a Recruiter can open the Interviewed tab of a Job Posting's Applications panel, open the interviewed application, upload the two required Appointment Documents (Approved Submission, Appointment Letter), and click the Appointed button to move the application to the Appointed stage.

> **⚠️ Precondition performed manually before this plan was authored (2026-08-06):** ADMINPORTAL-106333, as literally written in ADO, never clicks the "Interviewed" button — it only verifies the button becomes enabled. Since this test case (106335) requires the application to already be under the "Interviewed" tab, the "Interviewed" button was clicked as a real, confirmed prerequisite action outside of 106333's literal scope, moving "Edit Last Name A" from "Shortlisted" to "Interviewed".
>
> **Note:** the panel is labelled "Appointment Documents" in the live app (ADO step 9 says "Appointments Documents" — a minor wording difference, not a functional bug).
>
> **🎯 Confirmed live 2026-08-06:** both "Approved Submission" and "Appointment Letter" uploads use a native OS file chooser (`page.waitForEvent('filechooser')` in Playwright), triggered by clicking the "(press to upload)" link nearest each field's label. The "Appointed" button does not exist/is not clickable until BOTH documents are uploaded — confirmed it becomes visible and enabled only after both uploads complete, mirroring the same conditional-render pattern found in ADMINPORTAL-106333's "Interviewed" button.
>
> **⚠️ STATEFUL/REAL/PERSISTENT ACTIONS — confirmed with requester before running:**
> - TC-08/TC-09 upload real files (using `fixtures/blank document.pdf`) to the Approved Submission and Appointment Letter fields. These were already performed live during investigation and persisted (confirmed via reload) — the spec is idempotent and will skip re-uploading if a file is already attached.
> - TC-10 clicks the real "Appointed" button, permanently changing the application's status from "INTERVIEWED" to "Appointed" — the final recruitment pipeline stage. Confirm before running.

## Preconditions
- [ ] App is reachable at https://pd-recruitment-adminportal-qa.shesha.app/
- [ ] Recruiter credentials are valid (Kwenas / 123qwe)
- [ ] Job Posting Ref No 40 exists with an application currently listed as "Edit Last Name A", status "INTERVIEWED"
- [ ] Fixture file exists at `projects/eRecruitment/test-plans/AdminPortal/fixtures/blank document.pdf`

## Test Cases

### TC-01 — Login as Kwena (ADO #106335 step 2)
- **Assertions:**
  - [x] ASSERT (BLOCKING) URL no longer contains `/login`

---

### TC-02 — Click the sidebar toggle (ADO #106335 step 3)
- **Assertions:**
  - [x] ASSERT (BLOCKING) "Recruitment" navigation item is visible

---

### TC-03 — Click on Recruitment dropdown (ADO #106335 step 4)
- **Assertions:**
  - [x] ASSERT (BLOCKING) submenus are visible: "Job Posting Dashboard", "Location", "Salary Levels", "Candidates", "Candidates Applications"

---

### TC-04 — Click on Job Posting dashboard (ADO #106335 step 5)
- **Assertions:**
  - [x] ASSERT (BLOCKING) "Job Postings" index table is displayed with a "Reference No" column

---

### TC-05 — Open Job Posting Ref No 40 (ADO #106335 step 6)
- **Assertions:**
  - [x] ASSERT (BLOCKING) Job Details panel is displayed with Job Reference Number "40"

---

### TC-06 — Navigate to Applications panel and click the "Interviewed" tab (ADO #106335 step 7)
- **Assertions:**
  - [x] ASSERT (BLOCKING) the application interviewed via ADMINPORTAL-106333 ("Edit Last Name A") is displayed on the index table

---

### TC-07 — Click on the Surname and Initials link to open the application (ADO #106335 step 8)
- **Assertions:**
  - [x] ASSERT (BLOCKING) application opens in details view with Personal Details panel visible

---

### TC-08 — Navigate to Appointment Documents panel and upload Approved Submission (ADO #106335 steps 9-10)
- **Assertions:**
  - [x] ASSERT (BLOCKING) file chooser opens on clicking the "press to upload" link
  - [x] ASSERT (BLOCKING) after selecting the fixture file, "blank document.pdf" is rendered on the UI for Approved Submission

---

### TC-09 — Click "Press to upload" under Appointment Letter and upload the file (ADO #106335 steps 11-12)
- **Assertions:**
  - [x] ASSERT (BLOCKING) file chooser opens
  - [x] ASSERT (BLOCKING) after selecting the fixture file, "blank document.pdf" is rendered on the UI for Appointment Letter
  - [x] ASSERT (BLOCKING) "Appointed" button is now visible and enabled

---

### TC-10 — Click on the Appointed button (ADO #106335 step 13) — ⚠️ REAL, PERSISTENT STATUS CHANGE
- **Expected result:** Application should be successfully moved to Appointed, with success message displayed, and the system should auto-refresh and navigate to all applications tables
- **Assertions:**
  - [x] ASSERT (BLOCKING) page auto-navigates back to the applications table

---

### TC-11 — Click on Appointed tab (ADO #106335 step 14)
- **Assertions:**
  - [x] ASSERT (BLOCKING) tab opens successfully

---

### TC-12 — Open the same application (ADO #106335 step 15)
- **Assertions:**
  - [x] ASSERT (BLOCKING) application "Edit Last Name A" is visible under Appointed applications
  - [x] ASSERT (BLOCKING) application details view shows "APPOINTED" status

---

## Teardown
- No automated teardown. TC-08/TC-09 upload real files (persistent). TC-10 performs a real, permanent status change (INTERVIEWED → Appointed). Not reversible via the UI.
