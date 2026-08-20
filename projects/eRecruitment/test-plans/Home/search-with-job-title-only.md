# Test Plan: HOME-106558 — Search with Job Title Only

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
| ADO Test Case | [#106558](https://dev.azure.com/boxfusion/pd-recruitment/_workitems/edit/106558) — Search with job title only |

## Objective
> Validate the **Home** tab's job search widget when only a Job Title is supplied and Location is left blank — navigating to Home, entering a job title, leaving location blank, and running the search.

## Preconditions
- [ ] App is reachable at https://pd-recruitment-publicportal-1-qa.shesha.app/
- [ ] Applicant credentials are valid (Fred / Metaganemr%03)

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

### TC-02 — Click on Home menu item (ADO #106558 step 3)

*System should navigate to the home page successfully with a job title text area, location dropdown and a search button.*

- **Steps:**
  1. CLICK the Home menu item
- **Expected result:** Home page is displayed with the job title text area, location dropdown and Search button visible
- **Assertions:**
  - [x] ASSERT (BLOCKING) Job title text area is visible
  - [x] ASSERT (BLOCKING) Location dropdown is visible
  - [x] ASSERT (BLOCKING) Search button is visible

---

### TC-03 — Enter a job title, e.g. "Software Engineer" (ADO #106558 step 4)

*Text is accepted and displayed correctly.*

- **Steps:**
  1. TYPE "Software Engineer" into the Job Title field
- **Expected result:** The typed value is displayed in the Job Title field
- **Assertions:**
  - [x] ASSERT (BLOCKING) Job Title field contains "Software Engineer"

---

### TC-04 — Leave location field blank (ADO #106558 step 5)

*Field remains empty.*

- **Steps:**
  1. Leave the location field blank
- **Expected result:** The location field remains empty
- **Assertions:**
  - [x] ASSERT (BLOCKING) Location field is empty

---

### TC-05 — Click on Search button (ADO #106558 step 6)

*System processes the query and returns results matching the job title populated (location blank).*

- **Steps:**
  1. CLICK the Search button
- **Expected result:** Search results matching the populated job title are returned
- **Assertions:**
  - [x] ASSERT (BLOCKING) Search results are displayed after clicking Search

---

## Teardown
- No teardown required for automated runs (read-only search against a seeded QA test user).
