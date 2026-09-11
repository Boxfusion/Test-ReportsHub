# Test Plan: PROFILE-104590 — Verify Demographic Details

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
| ADO Test Case | [#104590](https://dev.azure.com/boxfusion/pd-recruitment/_workitems/edit/104590) — Verify Demographic Details |

## Objective
> Validate the **Demographic Details** step of the Manage Profile flow — Gender and Race dropdowns, the "Do you have a disability?" radio toggle and its conditional Nature Of Disability field, and Next navigation into Background Information.

## Preconditions
- [ ] App is reachable at https://pd-recruitment-publicportal-1-qa.shesha.app/
- [ ] Applicant credentials are valid (Fred / Metaganemr%03)
- [ ] Personal Details and Contact Details steps are already complete for Fred

## Notes on observed behaviour vs. ADO wording
- **"Do you have a disability?" is a pair of radio buttons** (Yes/No), not a dropdown.
- **Gender** options are Male, Female, Not Disclosed (matches ADO). **Race** options are African, Not Stated, White, Coloured, Indian, Other (ADO lists "African, White, Coloured etc." — matches, with two extra options: Not Stated, Indian).
- Gender/Race fields briefly render the literal text "unknown" while the saved value resolves asynchronously after navigating to this step — assertions should wait for the real label, not treat "unknown" as an error state.
- Both Gender and Race auto-persist across sessions and have the same Ant Design quirk as Citizen Status / Method / Language on the other steps: the currently-selected value is not offered as a clickable option in its own dropdown, so this plan checks the current value before selecting.
- The next step's heading renders as **"Background information"** (lowercase "i"), not "Background Information".

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

### TC-02 — Click on Demographic Details tab (ADO #104590 step 7)

*Demographic details page should open successfully.*

- **Steps:**
  1. CLICK the Manage Profile menu item
  2. CLICK the Demographic Details step in the left rail
- **Expected result:** Demographic Details form is displayed with Gender and Race fields
- **Assertions:**
  - [x] ASSERT (BLOCKING) Demographic Details heading is visible

---

### TC-03 — Gender dropdown (ADO #104590 steps 8-9)

*Selecting a gender option should display it in the field.*

- **Steps:**
  1. CLICK the Gender dropdown
  2. SELECT an option other than the current value (e.g. "Male")
- **Expected result:** The list shows Male, Female, Not Disclosed; the selected option is displayed
- **Assertions:**
  - [x] ASSERT (BLOCKING) Gender field displays the selected value

---

### TC-04 — Race dropdown (ADO #104590 steps 10-11)

*Selecting a race option should display it in the field.*

- **Steps:**
  1. CLICK the Race dropdown
  2. SELECT an option other than the current value (e.g. "African")
- **Expected result:** The list shows African, Not Stated, White, Coloured, Indian, Other; the selected option is displayed
- **Assertions:**
  - [x] ASSERT (BLOCKING) Race field displays the selected value

---

### TC-05 — Select "Yes" on Do you have a disability (ADO #104590 steps 12-13)

*Nature Of Disability field should become enabled; populating it enables Save and Next.*

- **Steps:**
  1. CLICK the "Yes" radio button
  2. TYPE a value into the Nature Of Disability field
- **Expected result:** Nature Of Disability field is enabled and accepts input; Save and Next buttons are enabled
- **Assertions:**
  - [x] ASSERT (BLOCKING) Nature Of Disability field is visible and enabled after selecting "Yes"
  - [x] ASSERT (BLOCKING) Nature Of Disability field contains the typed value
  - [x] ASSERT (BLOCKING) Next button is enabled

---

### TC-06 — Select "No" on Do you have a disability (ADO #104590 step 14)

*Save and Next buttons should be enabled; Nature Of Disability field is hidden.*

- **Steps:**
  1. CLICK the "No" radio button
- **Expected result:** Nature Of Disability field is no longer present; Save and Next buttons are enabled
- **Assertions:**
  - [x] ASSERT (BLOCKING) Nature Of Disability field is hidden
  - [x] ASSERT (BLOCKING) Next button is enabled

---

### TC-07 — Click Next button (ADO #104590 step 15)

*The system should move to Background Information.*

- **Steps:**
  1. CLICK the Next button
- **Expected result:** Background Information step is displayed; Demographic Details is marked complete in the step list
- **Assertions:**
  - [x] ASSERT (BLOCKING) The Background information heading is visible

---

## Teardown
- No teardown required for automated runs (read/update-only against a seeded QA test user).
