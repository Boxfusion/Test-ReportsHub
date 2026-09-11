# Test Plan: JOBS-106362 — Verify Search by Job Title

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
| ADO Test Case | [#106362](https://dev.azure.com/boxfusion/pd-recruitment/_workitems/edit/106362) — Verify Search by Job Title |

## Objective
> Validate the **Jobs** tab's search — navigating to Jobs from the main menu, entering a job title/keyword, running the search, and verifying relevant job listings are returned.

## Preconditions
- [ ] App is reachable at https://pd-recruitment-publicportal-1-qa.shesha.app/
- [ ] Applicant credentials are valid (Fred / Metaganemr%03)

## Notes on observed behaviour vs. ADO wording
- **Jobs page renders results as a card list ("Job Postings" heading, pagination summary), not an HTML table** — differs from the Home tab's search results, which are a proper table. The pagination summary text differs by result count: "0 items found" when empty, vs. "1-1 of 1 items" (range) when there are matches.
- **No seeded QA job posting matches "QA Tester"** in title or description — searching for it reliably returns "0 items found" / "No Data" across repeated runs (confirmed 2026-07-30). ADO step 4's literal search term ("QA Tester") is a genuine test-data gap, not a search bug: searching for **"CheckingSumm"**, a real seeded job posting, correctly returns 1 matching result. Per direct instruction, this plan/spec now searches for **"CheckingSumm"** instead of "QA Tester" so the test exercises real seeded data. The original "QA Tester" run is preserved in `test-reports/2026-07-30/verify-search-by-job-title.md` (earlier revision) as evidence of the data gap — flag to whoever owns ADO test case #106362 whether the test case's search term should be updated, or a "QA Tester" posting should be seeded.

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

### TC-02 — Click on Jobs menu item (ADO #106362 step 3)

*System should navigate to the Jobs menu successfully.*

- **Steps:**
  1. CLICK the Jobs menu item
- **Expected result:** Jobs page is displayed
- **Assertions:**
  - [x] ASSERT (BLOCKING) Jobs page / Job Title field is visible

---

### TC-03 — Enter "CheckingSumm" in Job Title / Keywords field (ADO #106362 step 4)

*Field accepts text input and displays populated value.*

- **Steps:**
  1. TYPE "CheckingSumm" into the Job Title / Keywords field
- **Expected result:** The typed value is displayed in the field
- **Assertions:**
  - [x] ASSERT (BLOCKING) Job Title / Keywords field contains "CheckingSumm"

---

### TC-04 — Click Search button (ADO #106362 step 5)

*System queries the database and returns job listings containing "CheckingSumm" in title or description.*

- **Steps:**
  1. CLICK the Search button
- **Expected result:** Job listings matching "CheckingSumm" are returned
- **Assertions:**
  - [x] ASSERT (BLOCKING) Search results are displayed after clicking Search (result count > 0)

---

### TC-05 — Verify results (ADO #106362 step 6)

*Results page displays relevant jobs with correct titles, employers, and details.*

- **Steps:**
  1. VERIFY the results
- **Expected result:** The results list shows the "CheckingSumm" job entry
- **Assertions:**
  - [x] ASSERT (BLOCKING) Results list is visible with at least one entry
  - [x] ASSERT (BLOCKING) The "CheckingSumm" job entry is visible in the results

---

## Teardown
- No teardown required for automated runs (read-only search against a seeded QA test user).
