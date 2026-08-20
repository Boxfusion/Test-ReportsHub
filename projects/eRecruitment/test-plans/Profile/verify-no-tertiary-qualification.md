# Test Plan: PROFILE-104625 — Verify I do not have a Tertiary Qualification

> **Status:** Ready
> **Owner:** QA
> **Last Updated:** 2026-07-16
> **Estimated Duration:** 75s

## Metadata
| Field | Value |
|-------|-------|
| App URL | https://pd-recruitment-publicportal-1-qa.shesha.app/ |
| Environment | QA |
| Login As | Fred / Metaganemr%03 |
| ADO Plan | [#99437](https://dev.azure.com/boxfusion/pd-recruitment/_testPlans/define?planId=99437&suiteId=104586) |
| ADO Suite | #104586 — Profile Details |
| ADO Test Case | [#104625](https://dev.azure.com/boxfusion/pd-recruitment/_workitems/edit/104625) — Verify I do not have a Tertiary Qualification |

## Objective
> Validate the **Tertiary Qualifications** step of the Manage Profile flow when the applicant has no tertiary qualification to record — checking the "I do not have a Tertiary Qualification." checkbox should enable Save/Next without requiring any qualification row, and clicking Next should advance to Work Experience.

## Preconditions
- [ ] App is reachable at https://pd-recruitment-publicportal-1-qa.shesha.app/
- [ ] Applicant credentials are valid (Fred / Metaganemr%03)
- [ ] Personal Details through Secondary Qualifications steps are already complete for Fred

## Notes on observed behaviour vs. ADO wording
- ADO step 6 expects "Manage Profile tab opens Personal Details displaying First/Last Name" — for this environment, Fred's profile already has Personal Details through Secondary Qualifications completed, so Manage Profile opens directly on the next incomplete step, matching the same observed behaviour documented in PROFILE-104623/104624.
- **Tertiary Qualifications is a repeatable add-to-table form** (has an "Add Qualification" button and a data table), unlike Secondary Qualifications' single-record form. The "I do not have a Tertiary Qualification." checkbox is **only rendered when the table is empty** — if a qualification row already exists (e.g. leftover seed/test data), the checkbox is not in the DOM at all. TC-03 deletes any existing row(s) first so the checkbox can be exercised, mirroring the cleanup pattern used in `verify-languages.md`.
- The checkbox has no accessible label association in the DOM (its `<label class="ant-checkbox-wrapper">` wraps only the input, with the "I do not have a Tertiary Qualification." text rendered as a separate sibling element) — but since it is the only checkbox on the page once the table is empty, it's targeted directly rather than by label text.
- Deleting a row requires confirming an antd Popconfirm via its "OK" button, same as the Languages delete flow.

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

### TC-02 — Click on Tertiary Qualifications tab (ADO #104625 steps 6-7)

*Tertiary Qualifications page should open successfully.*

- **Steps:**
  1. CLICK the Manage Profile menu item
  2. CLICK the Tertiary Qualifications step in the left rail
- **Expected result:** Tertiary Qualifications heading and its fields are displayed
- **Assertions:**
  - [x] ASSERT (BLOCKING) Tertiary Qualifications heading is visible

---

### TC-03 — Remove any existing Tertiary Qualification entries (precondition for the checkbox)

*The checkbox only renders when the qualifications table is empty; this ensures that state.*

- **Steps:**
  1. CLICK the delete icon on each existing qualification row, if any
  2. CLICK "OK" on the delete confirmation popover for each
- **Expected result:** Table shows "No data" and the "I do not have a Tertiary Qualification." checkbox becomes visible
- **Assertions:**
  - [x] ASSERT (BLOCKING) The "I do not have a Tertiary Qualification." text is visible
  - [x] ASSERT Next button is disabled while the table is empty and the checkbox is unchecked

---

### TC-04 — Check "I do not have a Tertiary Qualification" checkbox (ADO #104625 step 8)

*Checking the box should enable Save/Next without requiring a qualification row.*

- **Steps:**
  1. CLICK/CHECK the "I do not have a Tertiary Qualification" checkbox
- **Expected result:** Checkbox is checked; Save and Next buttons are enabled
- **Assertions:**
  - [x] ASSERT (BLOCKING) Checkbox is checked
  - [x] ASSERT (BLOCKING) Next button is enabled

---

### TC-05 — Click Next button (ADO #104625 step 9)

*Clicking Next should save and advance to Work Experience.*

- **Steps:**
  1. CLICK the Next button
- **Expected result:** System moves to the next step, Work Experience
- **Assertions:**
  - [x] ASSERT (BLOCKING) The Work Experience heading is visible after clicking Next

---

## Teardown
- No teardown required for automated runs — this case intentionally leaves the Tertiary Qualifications table empty with the "I do not have..." checkbox checked, which is the desired end state for this test.
