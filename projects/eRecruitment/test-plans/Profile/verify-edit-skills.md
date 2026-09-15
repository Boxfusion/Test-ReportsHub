# Test Plan: PROFILE-104645 — Edit Skills

> **Status:** Ready
> **Owner:** QA
> **Last Updated:** 2026-07-16
> **Estimated Duration:** 80s

## Metadata
| Field | Value |
|-------|-------|
| App URL | https://pd-recruitment-publicportal-1-qa.shesha.app/ |
| Environment | QA |
| Login As | Fred / Metaganemr%03 |
| ADO Plan | [#99437](https://dev.azure.com/boxfusion/pd-recruitment/_testPlans/define?planId=99437&suiteId=104586) |
| ADO Suite | #104586 — Profile Details |
| ADO Test Case | [#104645](https://dev.azure.com/boxfusion/pd-recruitment/_workitems/edit/104645) — "Add Skills" (ADO's title is a copy-paste duplicate of #104644; the actual steps test editing a skill, so this plan is named accordingly) |

## Objective
> Validate editing an existing skill — after adding one (same flow as PROFILE-104644), clicking its Edit icon should open it in edit mode, updating the name should be reflected in the input, and clicking Save should persist the change.

## Preconditions
- [ ] App is reachable at https://pd-recruitment-publicportal-1-qa.shesha.app/
- [ ] Applicant credentials are valid (Fred / Metaganemr%03)
- [ ] Personal Details through Work Experience steps are already complete for Fred

## Notes on observed behaviour vs. ADO wording
- ADO's title for this test case is literally "Add Skills" again (identical to #104644) — almost certainly a copy-paste naming mistake, since the steps (10-12) clearly test editing an existing skill, not adding one. This plan is named for what it actually verifies.
- Steps 6-9 are identical to PROFILE-104644 (Skills tab, add-row Name input, Add icon, "Playwright" added to the table).
- **The row being edited must be located by its text BEFORE clicking Edit** (e.g. `row containing "Playwright"`) — once in edit mode, the cell's text becomes an `<input>` value, which no longer counts toward the row's accessible name, so re-querying by the old text after entering edit mode fails. The currently-editing row is instead found by which row contains the visible Save icon.
- The real Edit/Save icons are `button[title="Edit"]` / `button[title="Save"]`, same family as elsewhere in this suite.
- This plan deletes any pre-existing "Playwright" or "Selenium" rows first (precondition) and removes the "Selenium" row it produces at the end, so repeated runs don't accumulate duplicates. The pre-existing "Java" row is left untouched.

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

### TC-02 — Click on Skills tab (ADO #104645 steps 6-7)

*Skills page should open successfully.*

- **Steps:**
  1. CLICK the Manage Profile menu item
  2. CLICK the Skills step in the left rail
- **Expected result:** Skills heading and its fields are displayed
- **Assertions:**
  - [x] ASSERT (BLOCKING) Skills heading is visible

---

### TC-03 — Populate skill and click Add icon (ADO #104645 steps 8-9)

*Skill should be added to the skills table.*

- **Steps:**
  1. CLICK the Name text area in the add row and populate a skill (e.g. "Playwright")
  2. CLICK the Add icon
- **Expected result:** "Playwright" is added to the skills table
- **Assertions:**
  - [x] ASSERT (BLOCKING) A "Playwright" row is visible in the skills table after clicking Add

---

### TC-04 — Click the edit icon on the added skill (ADO #104645 step 10)

*Skill added above should open in edit mode.*

- **Steps:**
  1. CLICK the Edit icon on the "Playwright" row
- **Expected result:** The row opens in edit mode (a Save icon appears; the name becomes an editable text input)
- **Assertions:**
  - [x] ASSERT (BLOCKING) A "Save" icon is visible on the row (confirming edit mode is active)

---

### TC-05 — Update the skill and click Save (ADO #104645 steps 11-12)

*Selenium should populate; saving should persist the change.*

- **Steps:**
  1. UPDATE the skill name to "Selenium"
  2. CLICK the Save button
- **Expected result:** "Selenium" is populated in the input; the system saves and displays the updated skill
- **Assertions:**
  - [x] ASSERT (BLOCKING) The row's input contains "Selenium" before saving
  - [x] ASSERT (BLOCKING) After clicking Save, a "Selenium" row is visible in the skills table

---

## Teardown
- TC-05 leaves a "Selenium" row (renamed from "Playwright") — the next run's precondition cleanup (TC-03) removes any pre-existing "Playwright"/"Selenium" rows before starting, so repeated runs don't accumulate duplicates. The pre-existing "Java" row is left untouched.
