# Test Plan: PROFILE-104651 — Edit Reference

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
| ADO Test Case | [#104651](https://dev.azure.com/boxfusion/pd-recruitment/_workitems/edit/104651) — Edit Reference |

## Objective
> Validate editing an existing reference — after adding one (same flow as PROFILE-104649), clicking its Edit icon should open the row in edit mode, updating Full Name should be reflected in the input, and clicking Save should persist the change.

## Preconditions
- [ ] App is reachable at https://pd-recruitment-publicportal-1-qa.shesha.app/
- [ ] Applicant credentials are valid (Fred / Metaganemr%03)
- [ ] Personal Details through Skills steps are already complete for Fred

## Notes on observed behaviour vs. ADO wording
- Steps 6-11 are identical to PROFILE-104649's add flow (References tab, add-row Full Name/Relationship to you/Tel. No., Add icon, "John Smith" added to the table).
- **Editing is inline in the row**, the same pattern as PROFILE-104629/104639/104645: the real action icons are `button[title="Edit"]` and `button[title="Save"]`. No decoy "open in designer" icons interfered here (unlike Tertiary Qualifications).
- This plan deletes any pre-existing "John Smith" or "Sam Jones" rows first (precondition), so repeated runs don't accumulate duplicates. The pre-existing "John Stones" row is left untouched. Note this test does **not** click Complete — it stops after saving the edit.

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

### TC-02 — Click on References tab (ADO #104651 steps 6-7)

*References page should open successfully.*

- **Steps:**
  1. CLICK the Manage Profile menu item
  2. CLICK the References step in the left rail
- **Expected result:** References heading and its fields are displayed
- **Assertions:**
  - [x] ASSERT (BLOCKING) References heading is visible

---

### TC-03 — Populate Full Name, Relationship, and Tel No (ADO #104651 steps 8-10)

*All three fields should populate successfully.*

- **Steps:**
  1. TYPE a full name (e.g. "John Smith") in the add row
  2. TYPE a relationship (e.g. "Mentor") in the add row
  3. TYPE a phone number (e.g. "0784563546") in the add row
- **Expected result:** All three fields display the typed values
- **Assertions:**
  - [x] ASSERT (BLOCKING) Full Name field contains the typed value
  - [x] ASSERT (BLOCKING) Relationship to you field contains the typed value
  - [x] ASSERT (BLOCKING) Tel No field contains the typed value

---

### TC-04 — Click the Add icon (ADO #104651 step 11)

*Reference should be added to the index table; Save and Complete buttons should be enabled.*

- **Steps:**
  1. CLICK the Add icon
- **Expected result:** "John Smith" is added to the References table; Save and Complete buttons are enabled
- **Assertions:**
  - [x] ASSERT (BLOCKING) A "John Smith" row is visible in the References table
  - [x] ASSERT (BLOCKING) Complete button is enabled

---

### TC-05 — Click the Edit icon on the added reference (ADO #104651 step 12)

*All the fields should open in edit mode.*

- **Steps:**
  1. CLICK the Edit icon on the "John Smith" row
- **Expected result:** The row's fields open in edit mode (a Save icon appears)
- **Assertions:**
  - [x] ASSERT (BLOCKING) A "Save" icon is visible on the row (confirming edit mode is active)

---

### TC-06 — Edit Full Name and click Save (ADO #104651 steps 13-14)

*Sam Jones should populate; saving should persist the change.*

- **Steps:**
  1. UPDATE the Full Name field to "Sam Jones"
  2. CLICK the Save icon
- **Expected result:** "Sam Jones" is populated in the input; the system saves and displays the updated Full Name
- **Assertions:**
  - [x] ASSERT (BLOCKING) The row's Full Name input contains "Sam Jones" before saving
  - [x] ASSERT (BLOCKING) After clicking Save, a "Sam Jones" row is visible in the References table

---

## Teardown
- No teardown required — this case's natural end state is a "Sam Jones" reference recorded (renamed from "John Smith"). The next run's precondition cleanup (TC-03) removes any pre-existing "John Smith"/"Sam Jones" rows before starting. The pre-existing "John Stones" row is left untouched.
