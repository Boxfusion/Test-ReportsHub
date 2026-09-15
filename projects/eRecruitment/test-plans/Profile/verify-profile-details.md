# Test Plan: PROFILE-104587 — Verify Profile Details

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
| ADO Test Case | [#104587](https://dev.azure.com/boxfusion/pd-recruitment/_workitems/edit/104587) — Verify Profile Details |

## Objective
> Validate the **Personal Details** step of the Manage Profile flow — login, navigation to Manage Profile, the Date Of Birth picker, and the South African Citizen Status conditional fields (Identity Number / Work Permit Number / Passport Number) for every option.

## Preconditions
- [ ] App is reachable at https://pd-recruitment-publicportal-1-qa.shesha.app/
- [ ] Applicant credentials are valid (Fred / Metaganemr%03)
- [ ] The Fred test user has a Personal Details record already populated (SA by Birth, ID number seeded)

## Note on labels
The live app's South African Citizen Status options differ slightly in wording from the original ADO step text:
| ADO wording | Actual UI label |
|---|---|
| SA By Neutralisation | SA by naturalisation |
| SA Permanent Residency | SA permanent residency |
| Non SA With Work Permit | Non SA - with work permit |
| Non SA No Work Permit | Non SA - no work permit |

This plan uses the actual UI labels.

## Test Cases

### TC-01 — Login as Fred

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE to https://pd-recruitment-publicportal-1-qa.shesha.app/login
  2. SNAPSHOT — confirm login page is visible
  3. TYPE Username field with `Fred`
  4. TYPE Password field with `Metaganemr%03`
  5. CLICK the Sign In button
  6. WAIT for the dashboard to load
- **Expected result:** User is logged in and the Dashboard is displayed
- **Assertions:**
  - [x] ASSERT (BLOCKING) URL no longer contains `/login` and the Dashboard is visible

---

### TC-02 — Click on Manage Profile tab (ADO #104587 step 6)

*The Manage Profile tab should open successfully and Personal Details should display First Name / Last Name pulled from the register user page.*

- **Type:** Happy path
- **Steps:**
  1. CLICK the Manage Profile menu item
  2. SNAPSHOT — confirm the Personal Details form is displayed
- **Expected result:** Manage Profile tab opens and Personal Details displays First Name and Last Name
- **Assertions:**
  - [x] ASSERT (BLOCKING) Personal Details heading is visible with First Name and Last Name populated

---

### TC-03 — Open the Date Of Birth date picker (ADO #104587 steps 7-8)

*A calendar should be displayed allowing the user to select a date; selecting a date populates the field.*

- **Type:** Happy path
- **Steps:**
  1. CLICK the Date Of Birth field
  2. SNAPSHOT — confirm a calendar picker is displayed
  3. SELECT a valid date from the calendar
  4. SNAPSHOT — verify the date is displayed in the field
- **Expected result:** Calendar is displayed; selected date is reflected in the Date Of Birth field
- **Assertions:**
  - [x] ASSERT (BLOCKING) The calendar picker (`.ant-picker-panel`) is visible when the field is clicked
  - [x] ASSERT (BLOCKING) The Date Of Birth field shows a non-empty date after selection

---

### TC-04 — South African Citizen Status: SA by Birth (ADO #104587 step 10)

*Identity Number text area should be displayed, all other text areas should be hidden.*

- **Steps:**
  1. CLICK the South African Citizen Status dropdown
  2. SELECT "SA by Birth"
- **Expected result:** Identity Number field is visible; Work Permit Number and Passport Number fields are not present
- **Assertions:**
  - [x] ASSERT (BLOCKING) Identity Number field is visible
  - [x] ASSERT (BLOCKING) South African Work Permit Number field is not present
  - [x] ASSERT (BLOCKING) Passport Number field is not present

---

### TC-05 — South African Citizen Status: SA by naturalisation (ADO #104587 step 11, "SA By Neutralisation")

*Identity Number text area should be displayed, all other text areas should be hidden.*

- **Steps:**
  1. CLICK the South African Citizen Status dropdown
  2. SELECT "SA by naturalisation"
- **Expected result:** Identity Number field remains visible
- **Assertions:**
  - [x] ASSERT (BLOCKING) Identity Number field is visible

---

### TC-06 — South African Citizen Status: SA permanent residency (ADO #104587 step 12)

*Identity Number text area should be displayed, all other text areas should be hidden.*

- **Steps:**
  1. CLICK the South African Citizen Status dropdown
  2. SELECT "SA permanent residency"
- **Expected result:** Identity Number field remains visible
- **Assertions:**
  - [x] ASSERT (BLOCKING) Identity Number field is visible

---

### TC-07 — South African Citizen Status: Non SA - with work permit (ADO #104587 step 13, "Non SA With Work Permit")

*South African Work Permit Number and Passport Number labels/fields should be displayed.*

- **Steps:**
  1. CLICK the South African Citizen Status dropdown
  2. SELECT "Non SA - with work permit"
- **Expected result:** South African Work Permit Number and Passport Number fields are displayed; Identity Number field is not present
- **Assertions:**
  - [x] ASSERT (BLOCKING) South African Work Permit Number field is visible
  - [x] ASSERT (BLOCKING) Passport Number field is visible

---

### TC-08 — South African Citizen Status: Non SA - no work permit (ADO #104587 step 14, "Non SA No Work Permit")

*Passport Number label/field should be enabled.*

- **Steps:**
  1. CLICK the South African Citizen Status dropdown
  2. SELECT "Non SA - no work permit"
- **Expected result:** Passport Number field is displayed and enabled; Work Permit Number field is not present
- **Assertions:**
  - [x] ASSERT (BLOCKING) Passport Number field is visible and enabled
  - [x] ASSERT (BLOCKING) South African Work Permit Number field is not present

---

### TC-09 — Return to SA by Birth and populate Identity Number (ADO #104587 steps 15-16)

*Identity Number should be displayed again; populating it enables Save and Next.*

- **Steps:**
  1. CLICK the South African Citizen Status dropdown
  2. SELECT "SA by Birth"
  3. TYPE a valid identity number into the Identity Number field
- **Expected result:** Identity Number is populated; Save and Next buttons are enabled
- **Assertions:**
  - [x] ASSERT (BLOCKING) Identity Number field contains the populated value
  - [x] ASSERT (BLOCKING) Next button is enabled

---

### TC-10 — Click Next button (ADO #104587 step 17)

*The system should move to Contact Details and Personal Details should be marked complete.*

- **Steps:**
  1. CLICK the Next button
  2. WAIT for the Contact Details step to load
- **Expected result:** Contact Details step is displayed; Personal Details is marked complete in the step list
- **Assertions:**
  - [x] ASSERT (BLOCKING) The Contact Details heading is visible

---

## Teardown
- No teardown required for automated runs (read/update-only against a seeded QA test user).
