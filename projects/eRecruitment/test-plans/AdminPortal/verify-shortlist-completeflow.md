# Test Plan: ADMINPORTAL-106333 — Verify Shortlist

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
| ADO Suite | Not currently linked to a suite in Test Plan #99437 (work item #106333 has no `Tested By` relation, no parent). |
| ADO Test Case | [#106333](https://dev.azure.com/boxfusion/pd-recruitment/_workitems/edit/106333) — Verify Shortlist |
| Target Job / Application | Job Posting Ref No **40** ("Auto Job Post") → the application created on ADMINPORTAL-106172, currently listed as **"Edit Last Name A"**, status "SHORTLISTED" (per ADMINPORTAL-106332) |

## Objective
> Validate that a Recruiter can open the Shortlisted tab of a Job Posting's Applications panel, open the shortlisted application, check the "I confirm that this applicant was interviewed" checkbox, and populate the Comment field.

> **Confirmed live 2026-08-06:** the "Interviewed" button is genuinely absent from the DOM until the Comment field has text — it renders (enabled) only once both the checkbox is checked and a comment is populated, exactly matching step 10's expected result. (An earlier investigation pass wrongly concluded this button didn't exist at all, due to a stale locator count in a throwaway script that was captured before the comment fill — corrected after a more careful re-check.)
>
> **No confirmation needed to run this test case:** checking the checkbox and populating the Comment field are purely local form state — confirmed live that neither action fires any API call. Nothing is persisted. This test case does not click Interviewed/Not Interviewed, so no state transition occurs.

## Preconditions
- [ ] App is reachable at https://pd-recruitment-adminportal-qa.shesha.app/
- [ ] Recruiter credentials are valid (Kwenas / 123qwe)
- [ ] Job Posting Ref No 40 exists with an application currently listed as "Edit Last Name A", status "SHORTLISTED"

## Test Cases

### TC-01 — Login as Kwena (ADO #106333 step 2)
- **Assertions:**
  - [x] ASSERT (BLOCKING) URL no longer contains `/login`

---

### TC-02 — Click the sidebar toggle (ADO #106333 step 3)
- **Assertions:**
  - [x] ASSERT (BLOCKING) "Recruitment" navigation item is visible

---

### TC-03 — Click on Recruitment dropdown (ADO #106333 step 4)
- **Assertions:**
  - [x] ASSERT (BLOCKING) submenus are visible: "Job Posting Dashboard", "Location", "Salary Levels", "Candidates", "Candidates Applications"

---

### TC-04 — Click on Job Posting dashboard (ADO #106333 step 5)
- **Assertions:**
  - [x] ASSERT (BLOCKING) "Job Postings" index table is displayed with a "Reference No" column

---

### TC-05 — Open Job Posting Ref No 40 (ADO #106333 step 6)
- **Assertions:**
  - [x] ASSERT (BLOCKING) Job Details panel is displayed with Job Reference Number "40"

---

### TC-06 — Navigate to Applications panel and click the "Shortlisted" tab (ADO #106333 step 7)
- **Assertions:**
  - [x] ASSERT (BLOCKING) the application shortlisted by ADMINPORTAL-106332 ("Edit Last Name A") is displayed on the index table

---

### TC-07 — Click on the Surname and Initials link to open the application (ADO #106333 step 8)
- **Assertions:**
  - [x] ASSERT (BLOCKING) application opens in details view with Personal Details panel visible

---

### TC-08 — Check the "I confirm that this applicant was interviewed" checkbox (ADO #106333 step 9)
- **Assertions:**
  - [x] ASSERT (BLOCKING) checkbox is checked

---

### TC-09 — Populate comments inside the comments text field (ADO #106333 step 10)
- **Expected result:** Comments should be populated successfully and interviewed button should be enabled
- **Assertions:**
  - [x] ASSERT (BLOCKING) comment field contains the entered text
  - [x] ASSERT (BLOCKING) "Interviewed" button is now visible and enabled

---

## Teardown
- No automated teardown. This test case makes no persistent changes — the checkbox and comment field are local form state only, never submitted.
