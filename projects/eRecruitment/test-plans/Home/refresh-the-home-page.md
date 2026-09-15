# Test Plan: HOME-106561 — Refresh the Home Page

> **Status:** Ready
> **Owner:** QA
> **Last Updated:** 2026-07-30
> **Estimated Duration:** 45s

## Metadata
| Field | Value |
|-------|-------|
| App URL | https://pd-recruitment-publicportal-1-qa.shesha.app/ |
| Environment | QA |
| Login As | Fred / Metaganemr%03 |
| ADO Plan | [#99437](https://dev.azure.com/boxfusion/pd-recruitment/_testPlans/define?planId=99437&suiteId=106554) |
| ADO Suite | #106554 — Home |
| ADO Test Case | [#106561](https://dev.azure.com/boxfusion/pd-recruitment/_workitems/edit/106561) — Refresh the Home page |

## Objective
> Validate that refreshing the browser while on the Home tab reloads the page correctly and keeps the applicant logged in.

## Notes on observed behaviour vs. ADO wording
- ADO step 4 says "Click on the refresh on the top left corner of the screen" — this refers to the browser's own reload control, not an in-app button. This plan simulates that with a browser reload (`page.reload()`).

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

### TC-02 — Click on Home menu item (ADO #106561 step 3)

*System should navigate to the home page successfully with a job title text area, location dropdown and a search button.*

- **Steps:**
  1. CLICK the Home menu item
- **Expected result:** Home page is displayed with the job title text area, location dropdown and Search button visible
- **Assertions:**
  - [x] ASSERT (BLOCKING) Job title text area is visible
  - [x] ASSERT (BLOCKING) Location dropdown is visible
  - [x] ASSERT (BLOCKING) Search button is visible

---

### TC-03 — Refresh the browser (ADO #106561 step 4)

*System should refresh the whole page and the user should still be logged in.*

- **Steps:**
  1. REFRESH the browser page
- **Expected result:** The page reloads and the user remains logged in, still on the Home page
- **Assertions:**
  - [x] ASSERT (BLOCKING) URL still does not contain `/login` after reload
  - [x] ASSERT (BLOCKING) Job title text area, location dropdown and Search button are visible again after reload

---

## Teardown
- No teardown required for automated runs (read-only navigation against a seeded QA test user).
