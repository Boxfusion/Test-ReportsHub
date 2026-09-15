# Test Plan: PROFILE-104639 — Edit Work Experience

> **Status:** Ready
> **Owner:** QA
> **Last Updated:** 2026-07-16
> **Estimated Duration:** 170s

## Metadata
| Field | Value |
|-------|-------|
| App URL | https://pd-recruitment-publicportal-1-qa.shesha.app/ |
| Environment | QA |
| Login As | Fred / Metaganemr%03 |
| ADO Plan | [#99437](https://dev.azure.com/boxfusion/pd-recruitment/_testPlans/define?planId=99437&suiteId=104586) |
| ADO Suite | #104586 — Profile Details |
| ADO Test Case | [#104639](https://dev.azure.com/boxfusion/pd-recruitment/_workitems/edit/104639) — Edit Work Experience |

## Objective
> Validate editing an existing Work Experience row — after adding one (same flow as PROFILE-104638, not a current employer), clicking its Edit icon should switch the row into inline edit mode, changing Sector to "Private Sector" and clicking the row's Save icon should persist the change.

## Preconditions
- [ ] App is reachable at https://pd-recruitment-publicportal-1-qa.shesha.app/
- [ ] Applicant credentials are valid (Fred / Metaganemr%03)
- [ ] Personal Details through Tertiary Qualifications steps are already complete for Fred

## Notes on observed behaviour vs. ADO wording
- Steps 6-18 are identical to PROFILE-104638's add flow (Add Experience modal, Company Name="Boxfusion", Sector="Public Sector", Job Title="Software Engineer", Employment Period range 5th-15th of the displayed month, Reason for Leaving="New Challenges", Duties="Test Case Generation", Submit via OK).
- **Editing is inline in the row**, the same pattern as PROFILE-104629 (Edit Tertiary Qualification): the real action icons are `button[title="Edit"]` and `button[title="Save"]`. Unlike Tertiary Qualifications, no decoy "open in designer" icons interfered here (only one `button[title="Edit"]` matched).
- In edit mode, the Sector combo's currently-selected option ("Public Sector") is hidden from its own dropdown list (already selected), and the other option ("Private Sector") is directly clickable without needing to filter/search first.

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

### TC-02 — Click on Work Experience tab (ADO #104639 steps 6-7)

*Work Experience page should open successfully.*

- **Steps:**
  1. CLICK the Manage Profile menu item
  2. CLICK the Work Experience step in the left rail
- **Expected result:** Work Experience heading and its fields are displayed
- **Assertions:**
  - [x] ASSERT (BLOCKING) Work Experience heading is visible

---

### TC-03 — Click Add Experience button (ADO #104639 step 8)

*Add Work Experience modal should open successfully.*

- **Steps:**
  1. Delete any existing work experience row(s) first (precondition, not an ADO step)
  2. CLICK the Add Experience button
- **Expected result:** Add Work Experience modal opens
- **Assertions:**
  - [x] ASSERT (BLOCKING) The "Add Work Experience" modal is visible

---

### TC-04 — Populate Company Name and Sector (ADO #104639 steps 9-11)

*Company name should populate; Sector should offer Public/Private Sector.*

- **Steps:**
  1. TYPE a company name (e.g. "Boxfusion")
  2. CLICK the Sector dropdown
  3. SELECT "Public Sector"
- **Expected result:** Both fields display the entered/selected values
- **Assertions:**
  - [x] ASSERT (BLOCKING) Company Name field contains the typed value
  - [x] ASSERT (BLOCKING) Sector field displays "Public Sector"

---

### TC-05 — Populate Job Title (ADO #104639 step 12)

*Job title should populate successfully.*

- **Steps:**
  1. TYPE a job title (e.g. "Software Engineer")
- **Expected result:** The field displays the typed value
- **Assertions:**
  - [x] ASSERT (BLOCKING) Job Title field contains the typed value

---

### TC-06 — Employment Period datepicker (ADO #104639 steps 13-15)

*Two calendars should open; start and end dates should both display.*

- **Steps:**
  1. CLICK the Employment Period date field
  2. SELECT a previous day for the start date
  3. SELECT a later (but still past) day for the end date
- **Expected result:** Two calendar panels open; both dates are displayed
- **Assertions:**
  - [x] ASSERT (BLOCKING) Two `.ant-picker-panel` calendar panels are visible
  - [x] ASSERT (BLOCKING) Employment Period field shows both the selected start and end dates

---

### TC-07 — Populate Reason for Leaving and Duties, click OK (ADO #104639 steps 16-18)

*Submitting should add the row and enable Save/Next.*

- **Steps:**
  1. TYPE reason for leaving (e.g. "New Challenges")
  2. TYPE duties and responsibilities (e.g. "Test Case Generation")
  3. CLICK the OK button
- **Expected result:** The experience is added to the table; Save and Next buttons are enabled
- **Assertions:**
  - [x] ASSERT (BLOCKING) The new row (Company Name="Boxfusion") is visible in the table after OK
  - [x] ASSERT (BLOCKING) Next button is enabled

---

### TC-08 — Click Edit icon on the added Work Experience (ADO #104639 step 19)

*All the fields should open in edit view.*

- **Steps:**
  1. CLICK the Edit icon on the added row
- **Expected result:** The row's fields open in edit mode (a Save icon appears)
- **Assertions:**
  - [x] ASSERT (BLOCKING) A "Save" icon is visible on the row (confirming edit mode is active)

---

### TC-09 — Select Private Sector and click Save icon (ADO #104639 steps 20-21)

*Private Sector should display; saving should persist the change.*

- **Steps:**
  1. CLICK the Sector dropdown (now in edit mode)
  2. SELECT "Private Sector"
  3. CLICK the Save icon
- **Expected result:** Private Sector is displayed in the text area; the system saves and reflects the new change (Private Sector) in the table
- **Assertions:**
  - [x] ASSERT (BLOCKING) Sector field displays "Private Sector" (in edit mode, before saving)
  - [x] ASSERT (BLOCKING) After clicking Save, the table row displays "Private Sector" as the persisted Sector value

---

## Teardown
- No teardown required for automated runs — each run deletes any pre-existing row(s) before adding and editing its own (see TC-03), so repeated runs don't accumulate duplicates.
