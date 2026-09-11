# Test Plan: PROFILE-104629 — Edit Tertiary Qualification

> **Status:** Ready
> **Owner:** QA
> **Last Updated:** 2026-07-16
> **Estimated Duration:** 130s

## Metadata
| Field | Value |
|-------|-------|
| App URL | https://pd-recruitment-publicportal-1-qa.shesha.app/ |
| Environment | QA |
| Login As | Fred / Metaganemr%03 |
| ADO Plan | [#99437](https://dev.azure.com/boxfusion/pd-recruitment/_testPlans/define?planId=99437&suiteId=104586) |
| ADO Suite | #104586 — Profile Details |
| ADO Test Case | [#104629](https://dev.azure.com/boxfusion/pd-recruitment/_workitems/edit/104629) — Edit Tertiary Qualification |

## Objective
> Validate editing an existing Tertiary Qualification row — after adding one (same flow as PROFILE-104627), clicking its Edit icon should switch the row into inline edit mode, changing Qualification Type to "B-Tech" and clicking the row's Save icon should persist the change.

## Preconditions
- [ ] App is reachable at https://pd-recruitment-publicportal-1-qa.shesha.app/
- [ ] Applicant credentials are valid (Fred / Metaganemr%03)
- [ ] Personal Details through Secondary Qualifications steps are already complete for Fred

## Notes on observed behaviour vs. ADO wording
- Steps 6-15 are identical to PROFILE-104627's add flow (Add Qualification modal, Institution="Wits", Qualification Name="BSC In IT", Qualification Type="National Diploma", Qualification Status="In Progress", Submit).
- **The row's real "Edit" icon is `button[title="Edit"]`**, distinguishable from unrelated decoy "pencil" icons on the page whose title is "Click to open this form in the designer" (a Shesha form-designer affordance, present per sub-form section, not per data row) — both happen to share an accessible role/name of "edit" via their inner icon, so title-based matching is required to avoid clicking the wrong one.
- **Editing happens inline in the row**, not a modal — clicking Edit turns Institution/Qualification Name into text inputs and Qualification Type/Status into active Ant Selects, and reveals two small icon buttons: `button[title="Save"]` and `button[title="Cancel edit"]`.
- Unlike the Add modal's Qualification Type combo, **the edit-mode Qualification Type option is directly clickable** (no hidden-node quirk) — typing "B-Tech" filters to two options (a long combined-label option containing "...and B-tech", and the standalone "B-Tech" option); the exact "B-Tech" option is selected.
- Every TC deletes any existing row(s) then re-adds one fresh qualification before editing it, so repeated runs don't accumulate duplicates or edit an ambiguous row.

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

### TC-02 — Click on Tertiary Qualifications tab (ADO #104629 steps 6-7)

*Tertiary Qualifications page should open successfully.*

- **Steps:**
  1. CLICK the Manage Profile menu item
  2. CLICK the Tertiary Qualifications step in the left rail
- **Expected result:** Tertiary Qualifications heading and its fields are displayed
- **Assertions:**
  - [x] ASSERT (BLOCKING) Tertiary Qualifications heading is visible

---

### TC-03 — Click Add Qualification button (ADO #104629 step 8)

*Add Tertiary Qualification modal should open successfully.*

- **Steps:**
  1. Delete any existing qualification row(s) first (precondition, not an ADO step)
  2. CLICK the Add Qualification button
- **Expected result:** Add Tertiary Qualification modal opens
- **Assertions:**
  - [x] ASSERT (BLOCKING) The "Add Tertiary Qualification" modal is visible

---

### TC-04 — Populate Institution and Qualification Name (ADO #104629 steps 9-10)

*Both fields should be populated successfully.*

- **Steps:**
  1. TYPE an institution name (e.g. "Wits")
  2. TYPE a qualification name (e.g. "BSC In IT")
- **Expected result:** Both fields display the typed values
- **Assertions:**
  - [x] ASSERT (BLOCKING) Institution field contains the typed value
  - [x] ASSERT (BLOCKING) Qualification Name field contains the typed value

---

### TC-05 — Qualification Type dropdown (ADO #104629 steps 11-12)

*Selecting an option should display it in the field.*

- **Steps:**
  1. CLICK the Qualification Type dropdown
  2. SELECT "National Diploma"
- **Expected result:** The selected option is displayed
- **Assertions:**
  - [x] ASSERT (BLOCKING) Qualification Type field displays "National Diploma"

---

### TC-06 — Qualification Status: In Progress (ADO #104629 steps 13-14)

*In Progress option should be displayed.*

- **Steps:**
  1. CLICK the Qualification Status dropdown
  2. SELECT "In Progress"
- **Expected result:** In Progress is displayed in the field
- **Assertions:**
  - [x] ASSERT (BLOCKING) Qualification Status field displays "In Progress"

---

### TC-07 — Click Submit button (ADO #104629 step 15)

*Submitting should add the row and enable Save/Next.*

- **Steps:**
  1. CLICK the Submit button
- **Expected result:** The qualification is added to the table; Save and Next buttons are enabled
- **Assertions:**
  - [x] ASSERT (BLOCKING) The new row (Institution="Wits") is visible in the table after Submit
  - [x] ASSERT (BLOCKING) Next button is enabled

---

### TC-08 — Click Edit Icon from the added Qualification (ADO #104629 step 16)

*All the fields should open in edit mode.*

- **Steps:**
  1. CLICK the Edit icon on the added qualification row
- **Expected result:** The row's fields open in edit mode (Institution/Qualification Name become editable text inputs, Qualification Type/Status become active dropdowns, a Save and a Cancel icon appear)
- **Assertions:**
  - [x] ASSERT (BLOCKING) A "Save" icon button is visible on the row (confirming edit mode is active)

---

### TC-09 — Select B-Tech and click Save icon (ADO #104629 steps 17-18)

*B-Tech should display; saving should persist the change.*

- **Steps:**
  1. CLICK the Qualification Type dropdown (now in edit mode)
  2. SELECT "B-Tech"
  3. CLICK the Save icon
- **Expected result:** B-Tech is displayed in the text area; the system saves and the qualification type reflects the new change (B-Tech) in the table
- **Assertions:**
  - [x] ASSERT (BLOCKING) Qualification Type field displays "B-Tech" (in edit mode, before saving)
  - [x] ASSERT (BLOCKING) After clicking Save, the table row displays "B-Tech" as the persisted Qualification Type

---

## Teardown
- No teardown required for automated runs — each run deletes any pre-existing row(s) before adding and editing its own (see TC-03), so repeated runs don't accumulate duplicates.
