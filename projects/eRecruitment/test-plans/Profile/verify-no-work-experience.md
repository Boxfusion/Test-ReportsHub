# Test Plan: PROFILE-104636 — I do not have Work Experience

> **Status:** Ready
> **Owner:** QA
> **Last Updated:** 2026-07-16
> **Estimated Duration:** 60s

## Metadata
| Field | Value |
|-------|-------|
| App URL | https://pd-recruitment-publicportal-1-qa.shesha.app/ |
| Environment | QA |
| Login As | Fred / Metaganemr%03 |
| ADO Plan | [#99437](https://dev.azure.com/boxfusion/pd-recruitment/_testPlans/define?planId=99437&suiteId=104586) |
| ADO Suite | #104586 — Profile Details |
| ADO Test Case | [#104636](https://dev.azure.com/boxfusion/pd-recruitment/_workitems/edit/104636) — I do not have Work Experience |

## Objective
> Validate the **Work Experience** step of the Manage Profile flow when the applicant has no work experience to record — checking the "I do not have any work experience." checkbox should enable Save/Next, and clicking Next should advance to Skills.

## Preconditions
- [ ] App is reachable at https://pd-recruitment-publicportal-1-qa.shesha.app/
- [ ] Applicant credentials are valid (Fred / Metaganemr%03)
- [ ] Personal Details through Tertiary Qualifications steps are already complete for Fred

## Notes on observed behaviour vs. ADO wording
- Unlike Tertiary Qualifications, the Work Experience table has no leftover rows for Fred, so the "I do not have any work experience." checkbox is visible by default (it only renders when the table is empty, same rule as Tertiary Qualifications).
- **The checkbox persists as already checked** from prior session state (this step was previously left in a completed state), so this plan explicitly **unchecks it first** to establish a known starting point — confirming Next becomes disabled while unchecked — before checking it again, so the test genuinely exercises the check action rather than finding it already done.
- Work Experience is an add-to-table form (has an "Add Experience" button and a data table), structurally the same pattern as Tertiary Qualifications.

## Test Cases

### TC-01 — Login as Fred

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

### TC-02 — Click on Work Experience tab (ADO #104636 steps 6-7)

*Work Experience page should open successfully.*

- **Steps:**
  1. CLICK the Manage Profile menu item
  2. CLICK the Work Experience step in the left rail
- **Expected result:** Work Experience heading and its fields are displayed
- **Assertions:**
  - [x] ASSERT (BLOCKING) Work Experience heading is visible

---

### TC-03 — Check "I do not have any work experience" checkbox (ADO #104636 step 8)

*Checking the box should enable Save/Next.*

- **Steps:**
  1. UNCHECK the checkbox first if already checked (establishes a known starting state; not an ADO step)
  2. ASSERT Next is disabled while unchecked (not an ADO step, confirms the checkbox actually drives Next)
  3. CHECK the "I do not have any work experience" checkbox
- **Expected result:** Checkbox is checked; Save and Next buttons are enabled
- **Assertions:**
  - [x] ASSERT (BLOCKING) Checkbox is checked
  - [x] ASSERT (BLOCKING) Next button is enabled

---

### TC-04 — Click Next button (ADO #104636 step 9)

*System should move to Skills.*

- **Steps:**
  1. CLICK the Next button
- **Expected result:** The system moves to the next step, Skills
- **Assertions:**
  - [x] ASSERT (BLOCKING) The Skills heading is visible after clicking Next

---

## Teardown
- No teardown required for automated runs — this case intentionally leaves the Work Experience checkbox checked, which is the desired end state for this test.
