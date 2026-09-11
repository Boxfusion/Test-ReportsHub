# Test Plan: JOBS-106366 — Verify Clear All Filters

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
| ADO Test Case | [#106366](https://dev.azure.com/boxfusion/pd-recruitment/_workitems/edit/106366) — Verify clear all filters |

## Objective
> Validate the **Jobs** tab's "Clear All Filters" button — entering Min/Max Salary values then clicking Clear All Filters resets the entire search form (Job Title, Location, Min/Max Salary) back to its default state.

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

### TC-02 — Click on Jobs menu item (ADO #106366 step 3)

*System should navigate to the Jobs menu successfully.*

- **Steps:**
  1. CLICK the Jobs menu item
- **Expected result:** Jobs page is displayed
- **Assertions:**
  - [x] ASSERT (BLOCKING) Jobs page / Min Salary field is visible

---

### TC-03 — Enter "20000" in Min Salary (ADO #106366 step 4)

*Field accepts numeric input and displays entered value.*

- **Steps:**
  1. TYPE "20000" into the Min Salary field
- **Expected result:** The typed value is displayed in the field
- **Assertions:**
  - [x] ASSERT (BLOCKING) Min Salary field contains 20000

---

### TC-04 — Enter "40000" in Max Salary (ADO #106366 step 5)

*Field accepts numeric input and displays entered value.*

- **Steps:**
  1. TYPE "40000" into the Max Salary field
- **Expected result:** The typed value is displayed in the field
- **Assertions:**
  - [x] ASSERT (BLOCKING) Max Salary field contains 40000

---

### TC-05 — Click Clear All Filters button (ADO #106366 step 6)

*All fields reset to default (blank Job Title, "Any Location," empty salary fields).*

- **Steps:**
  1. CLICK the Clear All Filters button
- **Expected result:** Job Title is blank, Location shows "Any Location", Min/Max Salary are empty
- **Assertions:**
  - [x] ASSERT (BLOCKING) Job Title / Keywords field is empty
  - [x] ASSERT (BLOCKING) Location field shows "Any Location"
  - [x] ASSERT (BLOCKING) Min Salary field is empty
  - [x] ASSERT (BLOCKING) Max Salary field is empty

---

### TC-06 — Verify reset (ADO #106366 step 7)

*Form shows cleared state, ready for new input.*

- **Steps:**
  1. VERIFY the form's reset state
- **Expected result:** The search form is fully cleared and ready for new input
- **Assertions:**
  - [x] ASSERT (BLOCKING) All search fields remain in their default/empty state and are enabled for new input

---

## Teardown
- No teardown required for automated runs (read-only interaction against a seeded QA test user).
