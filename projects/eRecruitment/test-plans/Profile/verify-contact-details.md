# Test Plan: PROFILE-104589 — Verify Contact Details

> **Status:** Ready
> **Owner:** QA
> **Last Updated:** 2026-07-06
> **Estimated Duration:** 90s

## Metadata
| Field | Value |
|-------|-------|
| App URL | https://pd-recruitment-publicportal-1-qa.shesha.app/ |
| Environment | QA |
| Login As | Fred / Metaganemr%03 |
| ADO Plan | [#99437](https://dev.azure.com/boxfusion/pd-recruitment/_testPlans/define?planId=99437&suiteId=104586) |
| ADO Suite | #104586 — Profile Details |
| ADO Test Case | [#104589](https://dev.azure.com/boxfusion/pd-recruitment/_workitems/edit/104589) — Verify Contact Details |

## Objective
> Validate the **Contact Details** step of the Manage Profile flow — navigation from Personal Details, the Country of Residence picker (modal-based, not a simple dropdown), the Method for correspondence and Preferred language for correspondence dropdowns, and Previous/Next navigation with data retention.

## Preconditions
- [ ] App is reachable at https://pd-recruitment-publicportal-1-qa.shesha.app/
- [ ] Applicant credentials are valid (Fred / Metaganemr%03)
- [ ] Personal Details step is already complete for Fred (see PROFILE-104587)

## Notes on observed behaviour vs. ADO wording
- **Mobile Number is NOT pre-populated** for Fred in this QA environment, contrary to ADO step 6's expected result ("mobile number being pre-populated from register user form"). This plan populates it explicitly and flags the gap rather than asserting a false pre-population.
- **Country Of Residence** is not a simple dropdown — clicking the field's `...` button opens a "Select Item" search modal; you type a search term and **double-click** the matching row to select it and close the modal.
- **Method for correspondence** and **Preferred language for correspondence** are Ant Design selects with the same quirk as the Citizen Status field on Personal Details: the currently-selected value is not offered as a clickable option in its own dropdown list, and the field auto-persists across sessions, so this plan always checks the current value before selecting.

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

### TC-02 — Click on Contact Details tab (ADO #104589 step 7)

*Contact Details form should open successfully.*

- **Steps:**
  1. CLICK the Manage Profile menu item
  2. CLICK the Contact Details step in the left rail
- **Expected result:** Contact Details form is displayed with the Mobile Number field present
- **Assertions:**
  - [x] ASSERT (BLOCKING) Contact Details heading is visible
  - [x] ASSERT (BLOCKING) Mobile Number field is visible and enabled

---

### TC-03 — Populate Residential Address Line1 (ADO #104589 step 8)

*Residential address should be populated successfully.*

- **Steps:**
  1. TYPE a valid address into the Residential Address Line1 field
- **Expected result:** The populated value is displayed in the field
- **Assertions:**
  - [x] ASSERT (BLOCKING) Residential Address Line1 field contains the typed value

---

### TC-04 — Select a country from Country Of Residence (ADO #104589 steps 9-10)

*A searchable "Select Item" modal should open; double-clicking a result selects it and closes the modal.*

- **Steps:**
  1. CLICK the `...` button on the Country Of Residence field
  2. SNAPSHOT — confirm the "Select Item" modal is displayed
  3. TYPE "South Africa" into the modal's search box
  4. SELECT (double-click) the "South Africa" result row
- **Expected result:** The modal closes and "South Africa" is displayed in the Country Of Residence field
- **Assertions:**
  - [x] ASSERT (BLOCKING) The Select Item modal is visible after clicking `...`
  - [x] ASSERT (BLOCKING) Country Of Residence field displays "South Africa" after selection

---

### TC-05 — Method for correspondence dropdown (ADO #104589 steps 11-12)

*Selecting an option (e.g. Post) should display it in the field.*

- **Steps:**
  1. CLICK the Method for correspondence dropdown
  2. SELECT an option other than the current value (e.g. "Post")
- **Expected result:** The selected option is displayed in the field
- **Assertions:**
  - [x] ASSERT (BLOCKING) Method for correspondence field displays the selected value

---

### TC-06 — Preferred language for correspondence dropdown (ADO #104589 steps 13-14)

*Selecting a language should display it in the field and enable Save/Next.*

- **Steps:**
  1. CLICK the Preferred language for correspondence dropdown
  2. SELECT a language other than the current value (e.g. "Afrikaans")
- **Expected result:** The selected language is displayed; Save and Next buttons are enabled
- **Assertions:**
  - [x] ASSERT (BLOCKING) Preferred language field displays the selected value
  - [x] ASSERT (BLOCKING) Next button is enabled

---

### TC-07 — Click Previous button (ADO #104589 step 15)

*The system should move to the previous page, Personal Details.*

- **Steps:**
  1. CLICK the Previous button
- **Expected result:** Personal Details step is displayed
- **Assertions:**
  - [x] ASSERT (BLOCKING) Personal Details heading is visible

---

### TC-08 — Click Next button to return to Contact Details (ADO #104589 step 16)

*The system should move to Contact Details with all previously-entered information retained.*

- **Steps:**
  1. CLICK the Next button
- **Expected result:** Contact Details is displayed with Mobile Number, Residential Address Line1, Country Of Residence, Method for correspondence and Preferred language all retaining their previously-entered values
- **Assertions:**
  - [x] ASSERT (BLOCKING) Contact Details heading is visible
  - [x] ASSERT (BLOCKING) Residential Address Line1 retains its populated value
  - [x] ASSERT (BLOCKING) Mobile Number retains its populated value

---

### TC-09 — Click Next button to move to Demographic Details (ADO #104589 step 17)

*The system should move to Demographic Details and Contact Details should be marked complete.*

- **Steps:**
  1. CLICK the Next button
- **Expected result:** Demographic Details step is displayed; Contact Details is marked complete in the step list
- **Assertions:**
  - [x] ASSERT (BLOCKING) The Demographic Details heading is visible

---

## Teardown
- No teardown required for automated runs (read/update-only against a seeded QA test user).
