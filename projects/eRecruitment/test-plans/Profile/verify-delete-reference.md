# Test Plan: PROFILE-104652 — Delete Reference

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
| ADO Test Case | [#104652](https://dev.azure.com/boxfusion/pd-recruitment/_workitems/edit/104652) — Delete Reference |

## Objective
> Validate deleting an existing reference — after adding one (same flow as PROFILE-104649), clicking its Delete icon should show a confirmation popover with Cancel/OK, and clicking OK should delete it.

## Preconditions
- [ ] App is reachable at https://pd-recruitment-publicportal-1-qa.shesha.app/
- [ ] Applicant credentials are valid (Fred / Metaganemr%03)
- [ ] Personal Details through Skills steps are already complete for Fred

## Notes on observed behaviour vs. ADO wording
- Steps 6-11 are identical to PROFILE-104649's add flow (References tab, add-row Full Name/Relationship to you/Tel. No., Add icon, "John Smith" added to the table).
- The confirmation popover's exact wording is **"Are you sure want to delete this item?"** with **Cancel** and **OK** buttons — matches ADO, same pattern used across every delete flow in this suite.
- This plan deletes any pre-existing "John Smith" row first (precondition), so repeated runs don't accumulate duplicates. The pre-existing "John Stones" row is left untouched.

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

### TC-02 — Click on References tab (ADO #104652 steps 6-7)

*References page should open successfully.*

- **Steps:**
  1. CLICK the Manage Profile menu item
  2. CLICK the References step in the left rail
- **Expected result:** References heading and its fields are displayed
- **Assertions:**
  - [x] ASSERT (BLOCKING) References heading is visible

---

### TC-03 — Populate Full Name, Relationship, and Tel No (ADO #104652 steps 8-10)

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

### TC-04 — Click the Add icon (ADO #104652 step 11)

*Reference should be added to the index table; Save and Complete buttons should be enabled.*

- **Steps:**
  1. CLICK the Add icon
- **Expected result:** "John Smith" is added to the References table; Save and Complete buttons are enabled
- **Assertions:**
  - [x] ASSERT (BLOCKING) A "John Smith" row is visible in the References table

---

### TC-05 — Click the Delete icon on the added reference (ADO #104652 step 12)

*A confirmation popover with Cancel and OK buttons should appear.*

- **Steps:**
  1. CLICK the Delete icon on the "John Smith" row
- **Expected result:** "Are you sure want to delete this item?" popover appears with Cancel and OK buttons
- **Assertions:**
  - [x] ASSERT (BLOCKING) The confirmation popover is visible with both Cancel and OK buttons

---

### TC-06 — Click OK button (ADO #104652 step 13)

*The reference added above should be deleted successfully from the References table.*

- **Steps:**
  1. CLICK the OK button
- **Expected result:** "John Smith" is removed from the References table
- **Assertions:**
  - [x] ASSERT (BLOCKING) The "John Smith" row is no longer visible

---

## Teardown
- No teardown required for automated runs — this case intentionally ends with the "John Smith" row deleted, which is the desired end state for this test. The pre-existing "John Stones" row is left untouched.
