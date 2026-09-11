# Test Plan: PROFILE-104649 — Add Reference

> **Status:** Ready
> **Owner:** QA
> **Last Updated:** 2026-07-16
> **Estimated Duration:** 90s

## Metadata
| Field | Value |
|-------|-------|
| App URL | https://pd-recruitment-publicportal-1-qa.shesha.app/ |
| Environment | QA |
| Login As | Fred / Metaganemr%03 |
| ADO Plan | [#99437](https://dev.azure.com/boxfusion/pd-recruitment/_testPlans/define?planId=99437&suiteId=104586) |
| ADO Suite | #104586 — Profile Details |
| ADO Test Case | [#104649](https://dev.azure.com/boxfusion/pd-recruitment/_workitems/edit/104649) — Add Reference |

## Objective
> Validate adding a professional reference via the References step, then completing the entire Manage Profile wizard — populating Full Name, Relationship to you, and Tel. No., clicking the Add icon to add it to the table, then clicking **Complete** to finalize the profile.

## Preconditions
- [ ] App is reachable at https://pd-recruitment-publicportal-1-qa.shesha.app/
- [ ] Applicant credentials are valid (Fred / Metaganemr%03)
- [ ] Personal Details through Skills steps are already complete for Fred

## Notes on observed behaviour vs. ADO wording
- **References uses the same add-row table pattern as Skills/Languages** (a row with plus-circle/close-circle icons holding Full Name, Relationship to you, Tel. No. (office hours) inputs and a "May we contact this reference?" checkbox, above the existing rows). Fred's profile already has a leftover "John Stones" reference (unrelated seed/test data), left untouched.
- Unlike the Tertiary Qualifications/Work Experience modals, the fields here have **no per-field label element** — the labels shown are the table's column headers, shared with the already-added rows below. A label-proximity locator (`getByText(label).last().locator('xpath=following::input[1]')`) is unreliable here for that reason (it can resolve to a different, unrelated input entirely) — fields are instead selected by their ordinal position within the add-row (`addRow().locator('input').nth(0/1/2)`), the same pattern already used for Skills' single input.
- **This is the last step of the Manage Profile wizard** — the footer button here is **"Complete"**, not "Next". Clicking it redirects to the Dashboard, which then shows "My Profile & CV: 100% Complete" and a "Successfully updated." toast. Manage Profile remains fully navigable afterward (landing back on Personal Details).
- This plan deletes any pre-existing "John Smith" row first (precondition), so repeated runs don't accumulate duplicates before the final Complete run.

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

### TC-02 — Click on References tab (ADO #104649 steps 6-7)

*References page should open successfully.*

- **Steps:**
  1. CLICK the Manage Profile menu item
  2. CLICK the References step in the left rail
- **Expected result:** References heading and its fields are displayed
- **Assertions:**
  - [x] ASSERT (BLOCKING) References heading is visible

---

### TC-03 — Populate Full Name (ADO #104649 step 8)

*Full Name should be populated successfully.*

- **Steps:**
  1. TYPE a full name (e.g. "John Smith") in the add row
- **Expected result:** The field displays the typed value
- **Assertions:**
  - [x] ASSERT (BLOCKING) The Full Name field contains the typed value

---

### TC-04 — Populate Relationship to you (ADO #104649 step 9)

*Relationship to you should be populated successfully.*

- **Steps:**
  1. TYPE a relationship (e.g. "Mentor") in the add row
- **Expected result:** The field displays the typed value
- **Assertions:**
  - [x] ASSERT (BLOCKING) The Relationship to you field contains the typed value

---

### TC-05 — Populate Tel No (ADO #104649 step 10)

*The number should be populated successfully.*

- **Steps:**
  1. TYPE a phone number (e.g. "0784563546") in the add row
- **Expected result:** The field displays the typed value
- **Assertions:**
  - [x] ASSERT (BLOCKING) The Tel No field contains the typed value

---

### TC-06 — Click the Add icon (ADO #104649 step 11)

*Reference should be added to the index table; Save and Complete buttons should be enabled.*

- **Steps:**
  1. CLICK the Add icon
- **Expected result:** "John Smith" is added to the References table; Save and Complete buttons are enabled
- **Assertions:**
  - [x] ASSERT (BLOCKING) A "John Smith" row is visible in the References table
  - [x] ASSERT (BLOCKING) Complete button is enabled

---

### TC-07 — Click Complete button (ADO #104649 step 12)

*Profile should be created with 100% completed status.*

- **Steps:**
  1. CLICK the Complete button
- **Expected result:** The system saves and redirects to the Dashboard, which shows "My Profile & CV: 100% Complete"
- **Assertions:**
  - [x] ASSERT (BLOCKING) URL navigates to the dashboard
  - [x] ASSERT (BLOCKING) "100% Complete" is visible under My Profile & CV on the Dashboard

---

## Teardown
- No teardown required — this case's natural end state is a completed profile with the "John Smith" reference recorded, which is the desired outcome of this test. The pre-existing "John Stones" row is left untouched.
