# Test Plan: PROFILE-104644 — Add Skills

> **Status:** Ready
> **Owner:** QA
> **Last Updated:** 2026-07-16
> **Estimated Duration:** 60s

## Metadata
| Field | Value |
|-------|-------|
| App URL | https://pd-recruitment-publicportal-1-qa.shesha.app/ |
| Environment | QA |
| Login As | Fred / Metaganemr%03 |
| ADO Plan | [#99437](https://dev.azure.com/boxfusion/pd-recruitment/_testPlans/define?planId=99437&suiteId=104586) |
| ADO Suite | #104586 — Profile Details |
| ADO Test Case | [#104644](https://dev.azure.com/boxfusion/pd-recruitment/_workitems/edit/104644) — Add Skills |

## Objective
> Validate adding a skill via the Skills step of the Manage Profile flow — typing a skill name and clicking the Add icon should add it to the skills table.

## Preconditions
- [ ] App is reachable at https://pd-recruitment-publicportal-1-qa.shesha.app/
- [ ] Applicant credentials are valid (Fred / Metaganemr%03)
- [ ] Personal Details through Work Experience steps are already complete for Fred

## Notes on observed behaviour vs. ADO wording
- Skills is a repeatable add-to-table form, the same "add row" pattern as Languages (a row with plus-circle/close-circle icons holding an editable Name input, above the existing rows). Fred's profile already has a leftover "Java" skill row (unrelated seed/test data) — this plan doesn't touch it, only adds and later removes its own "Playwright" row.
- The Add icon is `button[title="Add"]` (same `sha-action-button` class family as the Edit/Delete icons used elsewhere in this suite).
- This plan deletes any pre-existing "Playwright" row first (precondition) and removes the row it adds at the end (matching the cleanup convention in `verify-languages.md`), so repeated runs don't accumulate duplicates.

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

### TC-02 — Click on Skills tab (ADO #104644 steps 6-7)

*Skills page should open successfully.*

- **Steps:**
  1. CLICK the Manage Profile menu item
  2. CLICK the Skills step in the left rail
- **Expected result:** Skills heading and its fields are displayed
- **Assertions:**
  - [x] ASSERT (BLOCKING) Skills heading is visible

---

### TC-03 — Populate skill and click Add icon (ADO #104644 steps 8-9)

*Skill should be added to the skills table.*

- **Steps:**
  1. CLICK the Name text area in the add row and populate a skill (e.g. "Playwright")
  2. CLICK the Add icon
- **Expected result:** "Playwright" is populated in the add row, then added to the skills table
- **Assertions:**
  - [x] ASSERT (BLOCKING) The add-row Name field contains the typed value before clicking Add
  - [x] ASSERT (BLOCKING) A "Playwright" row is visible in the skills table after clicking Add

---

## Teardown
- TC-03 deletes the "Playwright" row it adds (via the row's delete icon) so repeated runs don't accumulate duplicate rows in Fred's profile. The pre-existing "Java" row is left untouched.
