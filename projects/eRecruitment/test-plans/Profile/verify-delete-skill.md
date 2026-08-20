# Test Plan: PROFILE-104646 — Delete Skill

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
| ADO Test Case | [#104646](https://dev.azure.com/boxfusion/pd-recruitment/_workitems/edit/104646) — Delete Skill |

## Objective
> Validate deleting an existing skill — after adding one (same flow as PROFILE-104644), clicking its Delete icon should show a confirmation popover with Cancel/OK, and clicking OK should delete it.

## Preconditions
- [ ] App is reachable at https://pd-recruitment-publicportal-1-qa.shesha.app/
- [ ] Applicant credentials are valid (Fred / Metaganemr%03)
- [ ] Personal Details through Work Experience steps are already complete for Fred

## Notes on observed behaviour vs. ADO wording
- Steps 6-9 are identical to PROFILE-104644 (Skills tab, add-row Name input, Add icon, "Playwright" added to the table).
- The confirmation popover's exact wording is **"Are you sure want to delete this item?"** with **Cancel** and **OK** buttons — matches ADO, same pattern used across every delete flow in this suite (Tertiary Qualifications, Work Experience).
- This plan deletes any pre-existing "Playwright" row first (precondition), so repeated runs don't accumulate duplicates. The pre-existing "Java" row is left untouched.

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

### TC-02 — Click on Skills tab (ADO #104646 steps 6-7)

*Skills page should open successfully.*

- **Steps:**
  1. CLICK the Manage Profile menu item
  2. CLICK the Skills step in the left rail
- **Expected result:** Skills heading and its fields are displayed
- **Assertions:**
  - [x] ASSERT (BLOCKING) Skills heading is visible

---

### TC-03 — Populate skill and click Add icon (ADO #104646 steps 8-9)

*Skill should be added to the skills table.*

- **Steps:**
  1. CLICK the Name text area in the add row and populate a skill (e.g. "Playwright")
  2. CLICK the Add icon
- **Expected result:** "Playwright" is added to the skills table
- **Assertions:**
  - [x] ASSERT (BLOCKING) A "Playwright" row is visible in the skills table after clicking Add

---

### TC-04 — Click the Delete icon on the added skill (ADO #104646 step 10)

*A confirmation popover with Cancel and OK buttons should appear.*

- **Steps:**
  1. CLICK the Delete icon on the "Playwright" row
- **Expected result:** "Are you sure want to delete this item?" popover appears with Cancel and OK buttons
- **Assertions:**
  - [x] ASSERT (BLOCKING) The confirmation popover is visible with both Cancel and OK buttons

---

### TC-05 — Click OK button (ADO #104646 step 11)

*The skill should be deleted successfully from the skills table.*

- **Steps:**
  1. CLICK the OK button
- **Expected result:** "Playwright" is removed from the skills table
- **Assertions:**
  - [x] ASSERT (BLOCKING) The "Playwright" row is no longer visible

---

## Teardown
- No teardown required for automated runs — this case intentionally ends with the "Playwright" row deleted, which is the desired end state for this test. The pre-existing "Java" row is left untouched.
