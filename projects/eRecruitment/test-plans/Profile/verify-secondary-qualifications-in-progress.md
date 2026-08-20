# Test Plan: PROFILE-104624 — Verify Secondary Qualifications In Progress

> **Status:** Ready
> **Owner:** QA
> **Last Updated:** 2026-07-16
> **Estimated Duration:** 75s

## Metadata
| Field | Value |
|-------|-------|
| App URL | https://pd-recruitment-publicportal-1-qa.shesha.app/ |
| Environment | QA |
| Login As | Fred / Metaganemr%03 |
| ADO Plan | [#99437](https://dev.azure.com/boxfusion/pd-recruitment/_testPlans/define?planId=99437&suiteId=104586) |
| ADO Suite | #104586 — Profile Details |
| ADO Test Case | [#104624](https://dev.azure.com/boxfusion/pd-recruitment/_workitems/edit/104624) — Verify Secondary Qualifications In Progress |

## Objective
> Validate the **Secondary Qualifications** step of the Manage Profile flow when the **Qualification Status** is left as **In Progress** — the sibling case to PROFILE-104623 (which covers the **Complete** status and its Date Obtained picker). This case checks that In Progress does NOT reveal Date Obtained, that Save/Next are enabled, and (full end-to-end) that clicking Next actually advances to Tertiary Qualifications.

## Preconditions
- [ ] App is reachable at https://pd-recruitment-publicportal-1-qa.shesha.app/
- [ ] Applicant credentials are valid (Fred / Metaganemr%03)
- [ ] Personal Details through Languages steps are already complete for Fred

## Notes on observed behaviour vs. ADO wording
- ADO step 6 expects "Manage Profile tab opens Personal Details displaying First/Last Name" — for this environment, Fred's profile already has Personal Details through Languages completed, so Manage Profile opens directly on the next incomplete step (Secondary Qualifications), matching the same observed behaviour documented in PROFILE-104623.
- Secondary Qualifications is a single-record form (no `+`/add button); values are overwritten on Save/Next, so no cleanup logic is required.
- **Qualification Type** options are Grade 9 (default), Grade 10 and National (vocational) Certificates level 2, Grade 11 and National (vocational) Certificates level 3, Grade 12 (National Senior Certificate) and National (vocational) Certificates level 4, Higher Certificates and Advanced National (vocational) Certificates level 5.
- **Qualification Status** options are In Progress (default) and Complete, matching ADO exactly. This plan selects In Progress explicitly (even though it is the default) per ADO step 13, then asserts it is displayed and Next is enabled.

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

### TC-02 — Click on Secondary Qualifications tab (ADO #104624 steps 6-7)

*Secondary Qualifications page should open successfully.*

- **Steps:**
  1. CLICK the Manage Profile menu item
  2. CLICK the Secondary Qualifications step in the left rail
- **Expected result:** Secondary Qualifications heading and its fields are displayed
- **Assertions:**
  - [x] ASSERT (BLOCKING) Secondary Qualifications heading is visible

---

### TC-03 — Populate Institution and Qualification Name (ADO #104624 steps 8-9)

*Both fields should be populated successfully.*

- **Steps:**
  1. TYPE an institution name (e.g. "Tshwane High School")
  2. TYPE a qualification name (e.g. "NSC")
- **Expected result:** Both fields display the typed values
- **Assertions:**
  - [x] ASSERT (BLOCKING) Institution field contains the typed value
  - [x] ASSERT (BLOCKING) Qualification Name field contains the typed value

---

### TC-04 — Qualification Type dropdown (ADO #104624 steps 10-11)

*Selecting an option should display it in the field.*

- **Steps:**
  1. CLICK the Qualification Type dropdown
  2. SELECT "Higher Certificates and Advanced National (vocational) Certificates level 5"
- **Expected result:** The list shows Grade 9, Grade 10, Grade 11, Grade 12, Higher Certificates...; the selected option is displayed
- **Assertions:**
  - [x] ASSERT (BLOCKING) Qualification Type field displays the selected "Higher Certificates..." option

---

### TC-05 — Qualification Status: In Progress (ADO #104624 steps 12-13)

*In Progress option should be displayed and Save/Next enabled; Date Obtained should NOT appear.*

- **Steps:**
  1. CLICK the Qualification Status dropdown
  2. SELECT "In Progress"
- **Expected result:** The list shows In Progress, Complete; In Progress is displayed in the field; Next button is enabled
- **Assertions:**
  - [x] ASSERT (BLOCKING) Qualification Status field displays "In Progress"
  - [x] ASSERT (BLOCKING) Next button is enabled
  - [x] ASSERT Date Obtained field is not visible (In Progress does not reveal it; the label/input remain in the DOM from a prior record rather than being removed)

---

### TC-06 — Click Next button (end-to-end navigation)

*Clicking Next with In Progress selected should save and advance to Tertiary Qualifications, with no Date Obtained value required.*

- **Steps:**
  1. CLICK the Next button
- **Expected result:** The system saves the step and moves to Tertiary Qualifications
- **Assertions:**
  - [x] ASSERT (BLOCKING) The Tertiary Qualifications heading is visible after clicking Next

---

## Teardown
- No teardown required for automated runs (single-record form; values are overwritten on the next run, not accumulated).
