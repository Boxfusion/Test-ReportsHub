# Test Plan: PROFILE-104627 — Add Tertiary Qualification In Progress

> **Status:** Ready
> **Owner:** QA
> **Last Updated:** 2026-07-16
> **Estimated Duration:** 110s

## Metadata
| Field | Value |
|-------|-------|
| App URL | https://pd-recruitment-publicportal-1-qa.shesha.app/ |
| Environment | QA |
| Login As | Fred / Metaganemr%03 |
| ADO Plan | [#99437](https://dev.azure.com/boxfusion/pd-recruitment/_testPlans/define?planId=99437&suiteId=104586) |
| ADO Suite | #104586 — Profile Details |
| ADO Test Case | [#104627](https://dev.azure.com/boxfusion/pd-recruitment/_workitems/edit/104627) — Add Tertiary Qualification In Progress |

## Objective
> Validate adding a Tertiary Qualification via the "Add Qualification" modal when the **Qualification Status** is **In Progress** — the sibling case to PROFILE-104626 (which covers **Complete** and its Date Obtained picker). This case checks that In Progress does not require a Date Obtained value, that Submit adds the row and enables Save/Next, and that Next advances to Work Experience.

## Preconditions
- [ ] App is reachable at https://pd-recruitment-publicportal-1-qa.shesha.app/
- [ ] Applicant credentials are valid (Fred / Metaganemr%03)
- [ ] Personal Details through Secondary Qualifications steps are already complete for Fred

## Notes on observed behaviour vs. ADO wording
- Same observed behaviour as PROFILE-104626 regarding "Manage Profile" jumping directly to the next incomplete step, the "Add Qualification" modal, and the Qualification Type / Qualification Status interaction quirks (Qualification Type: filtered option is directly clickable; Qualification Status: hidden-option-node quirk requires keyboard nav — here `ArrowDown` ×1 then `Enter` selects "In Progress", the 1st of 2 options).
- Every TC deletes any existing qualification row(s) first (same delete + Popconfirm "OK" pattern as PROFILE-104625/104626), so repeated runs don't accumulate duplicate rows.
- ADO step 14 does not mention a Date Obtained assertion (unlike PROFILE-104626's step 14), consistent with In Progress not requiring a completion date.

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

### TC-02 — Click on Tertiary Qualifications tab (ADO #104627 steps 6-7)

*Tertiary Qualifications page should open successfully.*

- **Steps:**
  1. CLICK the Manage Profile menu item
  2. CLICK the Tertiary Qualifications step in the left rail
- **Expected result:** Tertiary Qualifications heading and its fields are displayed
- **Assertions:**
  - [x] ASSERT (BLOCKING) Tertiary Qualifications heading is visible

---

### TC-03 — Click Add Qualification button (ADO #104627 step 8)

*Add Tertiary Qualification modal should open successfully.*

- **Steps:**
  1. Delete any existing qualification row(s) first (precondition, not an ADO step)
  2. CLICK the Add Qualification button
- **Expected result:** Add Tertiary Qualification modal opens with Institution, Qualification Name, Qualification Type, Qualification Status and Certificate fields
- **Assertions:**
  - [x] ASSERT (BLOCKING) The "Add Tertiary Qualification" modal is visible

---

### TC-04 — Populate Institution and Qualification Name (ADO #104627 steps 9-10)

*Both fields should be populated successfully.*

- **Steps:**
  1. TYPE an institution name (e.g. "Wits")
  2. TYPE a qualification name (e.g. "BSC In IT")
- **Expected result:** Both fields display the typed values
- **Assertions:**
  - [x] ASSERT (BLOCKING) Institution field contains the typed value
  - [x] ASSERT (BLOCKING) Qualification Name field contains the typed value

---

### TC-05 — Qualification Type dropdown (ADO #104627 steps 11-12)

*Selecting an option should display it in the field.*

- **Steps:**
  1. CLICK the Qualification Type dropdown
  2. SELECT "National Diploma"
- **Expected result:** The list shows National Diploma, Bachelors Degree, Advanced Diploma etc.; the selected option is displayed
- **Assertions:**
  - [x] ASSERT (BLOCKING) Qualification Type field displays "National Diploma"

---

### TC-06 — Qualification Status: In Progress (ADO #104627 steps 13-14)

*In Progress option should be displayed; no Date Obtained is required.*

- **Steps:**
  1. CLICK the Qualification Status dropdown
  2. SELECT "In Progress"
- **Expected result:** The list shows Complete and In Progress; In Progress is displayed in the field
- **Assertions:**
  - [x] ASSERT (BLOCKING) Qualification Status field displays "In Progress"

---

### TC-07 — Click Submit button (ADO #104627 step 15)

*Submitting should add the row and enable Save/Next.*

- **Steps:**
  1. CLICK the Submit button
- **Expected result:** The qualification is added to the table; Save and Next buttons are enabled
- **Assertions:**
  - [x] ASSERT (BLOCKING) The new row (Institution="Wits") is visible in the table after Submit
  - [x] ASSERT (BLOCKING) Next button is enabled

---

### TC-08 — Click Next button (ADO #104627 step 16)

*System should move to Work Experience.*

- **Steps:**
  1. CLICK the Next button
- **Expected result:** The system moves to the next step, Work Experience
- **Assertions:**
  - [x] ASSERT (BLOCKING) The Work Experience heading is visible after clicking Next

---

## Teardown
- No teardown required for automated runs — each run deletes any pre-existing row(s) before adding its own (see TC-03), so repeated runs don't accumulate duplicates.
