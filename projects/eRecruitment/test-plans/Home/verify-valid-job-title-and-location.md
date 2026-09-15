# Test Plan: HOME-106557 — Verify Valid Job Title and Location

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
| ADO Test Case | [#106557](https://dev.azure.com/boxfusion/pd-recruitment/_workitems/edit/106557) — Verify valid Job title and location |

## Objective
> Validate the **Home** tab's job search widget — navigating to Home from the dashboard, confirming the job title text area, location dropdown and Search button are present, leaving job title blank, selecting a location option, and running the search.

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

### TC-02 — Click on Home menu item (ADO #106557 step 3)

*System should navigate to the home page successfully with a job title text area, location dropdown and a search button.*

- **Steps:**
  1. CLICK the Home menu item
- **Expected result:** Home page is displayed with the job title text area, location dropdown and Search button visible
- **Assertions:**
  - [x] ASSERT (BLOCKING) Job title text area is visible
  - [x] ASSERT (BLOCKING) Location dropdown is visible
  - [x] ASSERT (BLOCKING) Search button is visible

---

### TC-03 — Leave job title text area blank (ADO #106557 step 4)

*Field remains empty.*

- **Steps:**
  1. Leave the job title text area blank
- **Expected result:** The job title field remains empty
- **Assertions:**
  - [x] ASSERT (BLOCKING) Job title text area is empty

---

### TC-04 — Click on location dropdown (ADO #106557 step 5)

*List of options should be displayed.*

- **Steps:**
  1. CLICK the location dropdown
- **Expected result:** A list of location options is displayed
- **Assertions:**
  - [x] ASSERT (BLOCKING) Location options list is visible

---

### TC-05 — Select a location option, e.g. Head Office (ADO #106557 step 6)

*Selected option should be selected and displayed in the text area.*

- **Steps:**
  1. SELECT a location option (e.g. "Head Office")
- **Expected result:** The selected option is displayed in the location field
- **Assertions:**
  - [x] ASSERT (BLOCKING) Location field displays the selected option

---

### TC-06 — Click on Search button (ADO #106557 step 7)

*System processes the query and returns results matching the location and title populated.*

- **Steps:**
  1. CLICK the Search button
- **Expected result:** Search results matching the populated location (and blank job title) are returned
- **Assertions:**
  - [x] ASSERT (BLOCKING) Search results are displayed after clicking Search

---

## Teardown
- No teardown required for automated runs (read-only search against a seeded QA test user).
