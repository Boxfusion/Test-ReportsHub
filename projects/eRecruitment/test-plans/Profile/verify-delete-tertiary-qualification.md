# Test Plan: PROFILE-104630 — Delete Tertiary Qualification

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
| ADO Test Case | [#104630](https://dev.azure.com/boxfusion/pd-recruitment/_workitems/edit/104630) — Delete Tertiary Qualification |

## Objective
> Validate deleting an existing Tertiary Qualification row — after adding one (same flow as PROFILE-104627), clicking its Delete icon should show a confirmation popover with Cancel/OK, and clicking OK should delete the qualification.

## Preconditions
- [ ] App is reachable at https://pd-recruitment-publicportal-1-qa.shesha.app/
- [ ] Applicant credentials are valid (Fred / Metaganemr%03)
- [ ] Personal Details through Secondary Qualifications steps are already complete for Fred

## Notes on observed behaviour vs. ADO wording
- Steps 6-15 are identical to PROFILE-104627's add flow (Add Qualification modal, Institution="Wits", Qualification Name="BSC In IT", Qualification Type="National Diploma", Qualification Status="In Progress", Submit).
- The confirmation popover's exact wording is **"Are you sure want to delete this item?"** (ADO paraphrases it as "Are you sure you want to delete this Item") with **Cancel** and **OK** buttons — matches ADO.
- Every TC deletes any pre-existing row(s) first (same pattern as PROFILE-104625/104626/104627/104629), so repeated runs don't accumulate duplicates and the row being deleted is unambiguous.
- Deleting the only remaining row returns the table to its empty state, which (per PROFILE-104625) re-reveals the "I do not have a Tertiary Qualification." checkbox — used here as confirmation the qualification was actually deleted, not just visually removed.

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

### TC-02 — Click on Tertiary Qualifications tab (ADO #104630 steps 6-7)

*Tertiary Qualifications page should open successfully.*

- **Steps:**
  1. CLICK the Manage Profile menu item
  2. CLICK the Tertiary Qualifications step in the left rail
- **Expected result:** Tertiary Qualifications heading and its fields are displayed
- **Assertions:**
  - [x] ASSERT (BLOCKING) Tertiary Qualifications heading is visible

---

### TC-03 — Click Add Qualification button (ADO #104630 step 8)

*Add Tertiary Qualification modal should open successfully.*

- **Steps:**
  1. Delete any existing qualification row(s) first (precondition, not an ADO step)
  2. CLICK the Add Qualification button
- **Expected result:** Add Tertiary Qualification modal opens
- **Assertions:**
  - [x] ASSERT (BLOCKING) The "Add Tertiary Qualification" modal is visible

---

### TC-04 — Populate Institution and Qualification Name (ADO #104630 steps 9-10)

*Both fields should be populated successfully.*

- **Steps:**
  1. TYPE an institution name (e.g. "Wits")
  2. TYPE a qualification name (e.g. "BSC In IT")
- **Expected result:** Both fields display the typed values
- **Assertions:**
  - [x] ASSERT (BLOCKING) Institution field contains the typed value
  - [x] ASSERT (BLOCKING) Qualification Name field contains the typed value

---

### TC-05 — Qualification Type dropdown (ADO #104630 steps 11-12)

*Selecting an option should display it in the field.*

- **Steps:**
  1. CLICK the Qualification Type dropdown
  2. SELECT "National Diploma"
- **Expected result:** The selected option is displayed
- **Assertions:**
  - [x] ASSERT (BLOCKING) Qualification Type field displays "National Diploma"

---

### TC-06 — Qualification Status: In Progress (ADO #104630 steps 13-14)

*In Progress option should be displayed.*

- **Steps:**
  1. CLICK the Qualification Status dropdown
  2. SELECT "In Progress"
- **Expected result:** In Progress is displayed in the field
- **Assertions:**
  - [x] ASSERT (BLOCKING) Qualification Status field displays "In Progress"

---

### TC-07 — Click Submit button (ADO #104630 step 15)

*Submitting should add the row and enable Save/Next.*

- **Steps:**
  1. CLICK the Submit button
- **Expected result:** The qualification is added to the table; Save and Next buttons are enabled
- **Assertions:**
  - [x] ASSERT (BLOCKING) The new row (Institution="Wits") is visible in the table after Submit

---

### TC-08 — Click Delete Icon from the added Qualification (ADO #104630 step 16)

*A confirmation popover with Cancel and OK buttons should appear.*

- **Steps:**
  1. CLICK the Delete icon on the added qualification row
- **Expected result:** "Are you sure want to delete this item?" popover appears with Cancel and OK buttons
- **Assertions:**
  - [x] ASSERT (BLOCKING) The confirmation popover is visible with both Cancel and OK buttons

---

### TC-09 — Click OK button (ADO #104630 step 17)

*The selected qualification should be deleted successfully.*

- **Steps:**
  1. CLICK the OK button
- **Expected result:** The qualification is deleted; the table returns to its empty state
- **Assertions:**
  - [x] ASSERT (BLOCKING) The deleted row's Institution value ("Wits") is no longer visible
  - [x] ASSERT (BLOCKING) The "I do not have a Tertiary Qualification." checkbox is visible again (confirms the table is genuinely empty)

---

## Teardown
- No teardown required for automated runs — this case intentionally ends with the Tertiary Qualifications table empty, which is the desired end state for this test.
