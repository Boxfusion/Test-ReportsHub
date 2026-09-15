# Test Plan: PROFILE-104626 — Add Tertiary Qualification Complete

> **Status:** Ready
> **Owner:** QA
> **Last Updated:** 2026-07-16
> **Estimated Duration:** 120s

## Metadata
| Field | Value |
|-------|-------|
| App URL | https://pd-recruitment-publicportal-1-qa.shesha.app/ |
| Environment | QA |
| Login As | Fred / Metaganemr%03 |
| ADO Plan | [#99437](https://dev.azure.com/boxfusion/pd-recruitment/_testPlans/define?planId=99437&suiteId=104586) |
| ADO Suite | #104586 — Profile Details |
| ADO Test Case | [#104626](https://dev.azure.com/boxfusion/pd-recruitment/_workitems/edit/104626) — Add Tertiary Qualification Complete |

## Objective
> Validate adding a Tertiary Qualification via the "Add Qualification" modal — Institution/Qualification Name fields, the Qualification Type dropdown, the Qualification Status "Complete" option revealing Date Obtained, submitting the row, and advancing to Work Experience.

## Preconditions
- [ ] App is reachable at https://pd-recruitment-publicportal-1-qa.shesha.app/
- [ ] Applicant credentials are valid (Fred / Metaganemr%03)
- [ ] Personal Details through Secondary Qualifications steps are already complete for Fred

## Notes on observed behaviour vs. ADO wording
- ADO step 6 expects "Manage Profile tab opens Personal Details" — as with prior Profile plans, Fred's profile already has earlier steps completed, so Manage Profile opens directly on Tertiary Qualifications.
- **"Add Qualification" opens a modal** (`.ant-modal`), not an inline form — a different pattern from both Secondary Qualifications (single-record inline form) and Languages (inline add-row).
- Every TC deletes any existing qualification row(s) first (same delete + Popconfirm "OK" pattern as `verify-no-tertiary-qualification.md`), so repeated runs don't accumulate duplicate rows and so the newly-added row is unambiguous when asserting the table contents.
- **Qualification Type** inside this modal is NOT subject to the hidden-virtual-list-node quirk seen in Secondary Qualifications' Qualification Type — after typing a search term, the single filtered option is directly clickable. (Pressing Enter instead, as Secondary Qualifications does, does NOT confirm the selection here — it just closes the dropdown empty. This is a modal-specific difference, likely because the modal intercepts the Enter keystroke before the Select's own handler.)
- **Qualification Status** in this modal still exhibits the same hidden-option-node quirk as Secondary Qualifications — click-select times out, so keyboard navigation (`ArrowDown` ×2 then `Enter` for the 2nd option, "Complete") is used instead.
- Options shown for Qualification Type include National Diploma, Bachelors Degree, Advanced Diploma, etc. (ADO wording matches).

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

### TC-02 — Click on Tertiary Qualifications tab (ADO #104626 steps 6-7)

*Tertiary Qualifications page should open successfully.*

- **Steps:**
  1. CLICK the Manage Profile menu item
  2. CLICK the Tertiary Qualifications step in the left rail
- **Expected result:** Tertiary Qualifications heading and its fields are displayed
- **Assertions:**
  - [x] ASSERT (BLOCKING) Tertiary Qualifications heading is visible

---

### TC-03 — Click Add Qualification button (ADO #104626 step 8)

*Add Tertiary Qualification modal should open successfully.*

- **Steps:**
  1. Delete any existing qualification row(s) first (precondition, not an ADO step)
  2. CLICK the Add Qualification button
- **Expected result:** Add Tertiary Qualification modal opens with Institution, Qualification Name, Qualification Type, Qualification Status and Certificate fields
- **Assertions:**
  - [x] ASSERT (BLOCKING) The "Add Tertiary Qualification" modal is visible

---

### TC-04 — Populate Institution and Qualification Name (ADO #104626 steps 9-10)

*Both fields should be populated successfully.*

- **Steps:**
  1. TYPE an institution name (e.g. "Wits")
  2. TYPE a qualification name (e.g. "BSC In IT")
- **Expected result:** Both fields display the typed values
- **Assertions:**
  - [x] ASSERT (BLOCKING) Institution field contains the typed value
  - [x] ASSERT (BLOCKING) Qualification Name field contains the typed value

---

### TC-05 — Qualification Type dropdown (ADO #104626 steps 11-12)

*Selecting an option should display it in the field.*

- **Steps:**
  1. CLICK the Qualification Type dropdown
  2. SELECT "National Diploma"
- **Expected result:** The list shows National Diploma, Bachelors Degree, Advanced Diploma etc.; the selected option is displayed
- **Assertions:**
  - [x] ASSERT (BLOCKING) Qualification Type field displays "National Diploma"

---

### TC-06 — Qualification Status: Complete reveals Date Obtained (ADO #104626 steps 13-14)

*Date Obtained field with a datepicker should be enabled.*

- **Steps:**
  1. CLICK the Qualification Status dropdown
  2. SELECT "Complete"
- **Expected result:** The list shows Complete and In progress; Date Obtained field appears and is enabled
- **Assertions:**
  - [x] ASSERT (BLOCKING) Qualification Status field displays "Complete"
  - [x] ASSERT (BLOCKING) Date Obtained field is visible and enabled

---

### TC-07 — Date Obtained picker and Submit (ADO #104626 steps 15-16)

*Selected date should display; submitting should add the row and enable Save/Next.*

- **Steps:**
  1. CLICK the Date Obtained field
  2. SELECT a previous date from the calendar
  3. CLICK the Submit button
- **Expected result:** Selected date is displayed; the qualification is added to the table; Save and Next buttons are enabled
- **Assertions:**
  - [x] ASSERT (BLOCKING) The calendar picker (`.ant-picker-panel`) is visible when the field is clicked
  - [x] ASSERT (BLOCKING) The new row (Institution="Wits") is visible in the table after Submit
  - [x] ASSERT (BLOCKING) Next button is enabled

---

### TC-08 — Click Next button (ADO #104626 step 17)

*System should move to Work Experience.*

- **Steps:**
  1. CLICK the Next button
- **Expected result:** The system moves to the next step, Work Experience
- **Assertions:**
  - [x] ASSERT (BLOCKING) The Work Experience heading is visible after clicking Next

---

## Teardown
- No teardown required for automated runs — each run deletes any pre-existing row(s) before adding its own (see TC-03), so repeated runs don't accumulate duplicates.
