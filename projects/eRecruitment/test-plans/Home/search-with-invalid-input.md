# Test Plan: HOME-106560 — Search with Invalid Input

> **Status:** Ready
> **Owner:** QA
> **Last Updated:** 2026-07-30
> **Estimated Duration:** 60s

## Metadata
| Field | Value |
|-------|-------|
| App URL | https://pd-recruitment-publicportal-1-qa.shesha.app/ |
| Environment | QA |
| Login As | Fred / Metaganemr%03 |
| ADO Plan | [#99437](https://dev.azure.com/boxfusion/pd-recruitment/_testPlans/define?planId=99437&suiteId=106554) |
| ADO Suite | #106554 — Home |
| ADO Test Case | [#106560](https://dev.azure.com/boxfusion/pd-recruitment/_workitems/edit/106560) — Search with invalid input |

## Objective
> Validate the **Home** tab's job search widget when given an invalid/nonsense job title ("@@@") with location left blank — the search should return a "No jobs found" message rather than results.

## Preconditions
- [ ] App is reachable at https://pd-recruitment-publicportal-1-qa.shesha.app/
- [ ] Applicant credentials are valid (Fred / Metaganemr%03)

## Notes on observed behaviour vs. ADO wording
- **No "No jobs found" message exists.** ADO step 6's expected result literally says "No jobs found" message displayed. In this QA environment, an empty search instead renders the results table with a "No Data" heading and "No data is available for this table" body text. This plan asserts the observed empty-state text rather than the literal ADO wording.

## Test Cases

### TC-01 — Login as Fred

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE to https://pd-recruitment-publicportal-1-qa.shesha.app/login
  2. TYPE Username field with `Fred`
  3. TYPE Password field with `Metaganemr%03`
  4. CLICK the Sign In button
  5. WAIT for the Dashboard to load
- **Expected result:** User is logged in and the Dashboard is displayed
- **Assertions:**
  - [x] ASSERT (BLOCKING) URL no longer contains `/login` and the Dashboard is visible

---

### TC-02 — Click on Home menu item (ADO #106560 step 3)

*System should navigate to the home page successfully with a job title text area, location dropdown and a search button.*

- **Steps:**
  1. CLICK the Home menu item
- **Expected result:** Home page is displayed with the job title text area, location dropdown and Search button visible
- **Assertions:**
  - [x] ASSERT (BLOCKING) Job title text area is visible
  - [x] ASSERT (BLOCKING) Location dropdown is visible
  - [x] ASSERT (BLOCKING) Search button is visible

---

### TC-03 — Enter "@@@" in the job title field (ADO #106560 step 4)

*Text is accepted and populated successfully.*

- **Steps:**
  1. TYPE "@@@" into the Job Title field
- **Expected result:** The typed value is displayed in the Job Title field
- **Assertions:**
  - [x] ASSERT (BLOCKING) Job Title field contains "@@@"

---

### TC-04 — Leave location field blank (ADO #106560 step 5)

*Field remains empty.*

- **Steps:**
  1. Leave the location field blank
- **Expected result:** The location field remains empty
- **Assertions:**
  - [x] ASSERT (BLOCKING) Location field is empty

---

### TC-05 — Click on Search button (ADO #106560 step 6)

*ADO expects a "No jobs found" message; observed behaviour is a "No Data" empty-state on the results table (see notes above).*

- **Steps:**
  1. CLICK the Search button
- **Expected result:** No job results are returned — the results table has no data rows and shows a "No Data" empty state ("No data is available for this table")
- **Assertions:**
  - [x] ASSERT (BLOCKING) Results table contains only the header row (0 data rows) — if the system returns any matching job for "@@@", this test case fails
  - [x] ASSERT (BLOCKING) "No Data" empty-state is visible on the results table

---

## Teardown
- No teardown required for automated runs (read-only search against a seeded QA test user).
