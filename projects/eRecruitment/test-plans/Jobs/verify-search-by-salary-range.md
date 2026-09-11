# Test Plan: JOBS-106364 — Verify Search by Salary Range

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
| ADO Test Case | [#106364](https://dev.azure.com/boxfusion/pd-recruitment/_workitems/edit/106364) — Verify search by Salary Range |

## Objective
> Validate the **Jobs** tab's salary range filter — navigating to Jobs, entering Min Salary 20000 and Max Salary 40000, running the search, and verifying only jobs within that range are returned.

## Notes on observed behaviour vs. ADO wording
- ADO step 7's expected result text appears to be a copy-paste artifact from the location test case ("displays only jobs located in Head Office ... within specified salary range"). This plan asserts the salary-range part only, which is the actual intent of this test case.
- **No seeded QA job posting falls within the 20,000-40,000 salary range** — searching returns "0 items found" (confirmed 2026-07-30). Job posting cards also don't display a salary figure at all (only title, reference number, location, closing date, requirements), so a per-card salary check isn't possible from the UI even when there are results. TC-06 is deliberately lenient (passes on either an empty-state or at least one result card) because the real assertion — "results fall within the salary range" — can't be verified visually; it only confirms the filter was applied and the page responded without erroring. The actual result today was the empty state, which is the same test-data-gap pattern seen in #106362 ("QA Tester" search) — recommend seeding a job posting with a salary in this range, or exposing salary on the card, if stronger verification is wanted.

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

### TC-02 — Click on Jobs menu item (ADO #106364 step 3)

*System should navigate to the Jobs menu successfully.*

- **Steps:**
  1. CLICK the Jobs menu item
- **Expected result:** Jobs page is displayed
- **Assertions:**
  - [x] ASSERT (BLOCKING) Jobs page / Min Salary field is visible

---

### TC-03 — Enter "20000" in Min Salary (ADO #106364 step 4)

*Field accepts numeric input and displays entered value.*

- **Steps:**
  1. TYPE "20000" into the Min Salary field
- **Expected result:** The typed value is displayed in the field
- **Assertions:**
  - [x] ASSERT (BLOCKING) Min Salary field contains 20000

---

### TC-04 — Enter "40000" in Max Salary (ADO #106364 step 5)

*Field accepts numeric input and displays entered value.*

- **Steps:**
  1. TYPE "40000" into the Max Salary field
- **Expected result:** The typed value is displayed in the field
- **Assertions:**
  - [x] ASSERT (BLOCKING) Max Salary field contains 40000

---

### TC-05 — Click Search button (ADO #106364 step 6)

*System filters jobs with salaries between 20,000 and 40,000.*

- **Steps:**
  1. CLICK the Search button
- **Expected result:** Job listings filtered by the salary range are returned
- **Assertions:**
  - [x] ASSERT (BLOCKING) Search results are displayed after clicking Search

---

### TC-06 — Verify results (ADO #106364 step 7)

*Results page displays only jobs within the specified salary range.*

- **Steps:**
  1. VERIFY the results
- **Expected result:** Every job entry in the results falls within the 20,000-40,000 salary range (or a documented empty-state if no seeded data matches)
- **Assertions:**
  - [x] ASSERT (BLOCKING) Results reflect the applied salary filter

---

## Teardown
- No teardown required for automated runs (read-only search against a seeded QA test user).
