# Test Plan: JOBS-106363 — Verify Search by Location

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
| ADO Plan | [#99437](https://dev.azure.com/boxfusion/pd-recruitment/_testPlans/define?planId=99437&suiteId=104521) |
| ADO Suite | #104521 — Jobs |
| ADO Test Case | [#106363](https://dev.azure.com/boxfusion/pd-recruitment/_workitems/edit/106363) — Verify Search by location |

## Objective
> Validate the **Jobs** tab's location filter — navigating to Jobs, opening the location dropdown, selecting "Head Office", running the search, and verifying only Head Office jobs are returned.

## Preconditions
- [ ] App is reachable at https://pd-recruitment-publicportal-1-qa.shesha.app/
- [ ] Applicant credentials are valid (Fred / Metaganemr%03)
- [ ] At least one seeded job posting is located at "Head Office" (confirmed: e.g. "CheckingSumm", "TestingTimer", "RF 1235/DEVELOPER")

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

### TC-02 — Click on Jobs menu item (ADO #106363 step 3)

*System should navigate to the Jobs menu successfully.*

- **Steps:**
  1. CLICK the Jobs menu item
- **Expected result:** Jobs page is displayed
- **Assertions:**
  - [x] ASSERT (BLOCKING) Jobs page / location dropdown is visible

---

### TC-03 — Click Location dropdown (ADO #106363 step 4)

*Dropdown expands showing a list of available locations.*

- **Steps:**
  1. CLICK the Location dropdown
- **Expected result:** A list of location options is displayed
- **Assertions:**
  - [x] ASSERT (BLOCKING) Location options list is visible

---

### TC-04 — Select "Head Office" from the list (ADO #106363 step 5)

*Selected location should be displayed in the text area.*

- **Steps:**
  1. SELECT "Head Office" from the location dropdown
- **Expected result:** "Head Office" is displayed in the location field
- **Assertions:**
  - [x] ASSERT (BLOCKING) Location field displays "Head Office"

---

### TC-05 — Click Search button (ADO #106363 step 6)

*System filters jobs by location "Head Office".*

- **Steps:**
  1. CLICK the Search button
- **Expected result:** Job listings are filtered by "Head Office"
- **Assertions:**
  - [x] ASSERT (BLOCKING) Search results are displayed after clicking Search (result count > 0)

---

### TC-06 — Verify results (ADO #106363 step 7)

*Results page displays only jobs located in Head Office.*

- **Steps:**
  1. VERIFY the results
- **Expected result:** Every job entry in the results shows "Head Office" as its location
- **Assertions:**
  - [x] ASSERT (BLOCKING) At least one result card is returned
  - [x] ASSERT (BLOCKING) Every individual result card's text contains "Head Office" (checked per-card, not just present somewhere on the page) — a card without it fails the test

## Notes on observed behaviour
- Job cards on the Jobs page share a generic, reused class name (`sha-components-container-inner`) at multiple nesting levels (search-criteria panel, results wrapper, and each individual card). Individual cards are isolated via `:not(:has(...))` plus a check for the "View & Apply" link, which appears exactly once per real job card. Confirmed live 2026-07-30: filtering by "Head Office" returned 3 cards (CheckingSumm, TestingTimer, RF 1235/DEVELOPER), all showing "Head Office".

---

## Teardown
- No teardown required for automated runs (read-only search against a seeded QA test user).
