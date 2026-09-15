# Test Plan: PROFILE-104621 — Verify Languages

> **Status:** Ready
> **Owner:** QA
> **Last Updated:** 2026-07-06
> **Estimated Duration:** 90s

## Metadata
| Field | Value |
|-------|-------|
| App URL | https://pd-recruitment-publicportal-1-qa.shesha.app/ |
| Environment | QA |
| Login As | Fred / Metaganemr%03 |
| ADO Plan | [#99437](https://dev.azure.com/boxfusion/pd-recruitment/_testPlans/define?planId=99437&suiteId=104586) |
| ADO Suite | #104586 — Profile Details |
| ADO Test Case | [#104621](https://dev.azure.com/boxfusion/pd-recruitment/_workitems/edit/104621) — Verify Languages |

## Objective
> Validate the **Languages** step of the Manage Profile flow — the Language/Speak/Read/Write dropdowns in the "add new row" line, and adding the row to the languages table via the `+` button.

## Preconditions
- [ ] App is reachable at https://pd-recruitment-publicportal-1-qa.shesha.app/
- [ ] Applicant credentials are valid (Fred / Metaganemr%03)
- [ ] Personal Details, Contact Details, Demographic Details and Background Information steps are already complete for Fred
- [ ] Fred already has one language row (English / Good / Good / Good) seeded in the table

## Notes on observed behaviour vs. ADO wording
- The Languages page is a **table**: an "add new row" line (identified by its `plus-circle` / `close-circle` icon buttons) with 4 empty dropdowns, plus one or more already-saved rows below it with edit/delete icons.
- This plan selects **Afrikaans** (not English, which is already seeded) to avoid ambiguity when asserting the new row, and **deletes the row it added** at the end of TC-07 so repeated runs don't accumulate duplicate rows in Fred's profile. Deleting requires confirming a "Are you sure want to delete this item?" popover.
- Speak/Read/Write options are Good, Fair, Poor (matches ADO wording, just reordered per field).

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

### TC-02 — Click on Languages tab (ADO #104621 step 7)

*Languages page should open successfully.*

- **Steps:**
  1. CLICK the Manage Profile menu item
  2. CLICK the Languages step in the left rail
- **Expected result:** Languages heading and the languages table are displayed
- **Assertions:**
  - [x] ASSERT (BLOCKING) Languages heading is visible
  - [x] ASSERT (BLOCKING) The existing English row is visible in the table

---

### TC-03 — Language dropdown (ADO #104621 steps 8-9)

*Selecting a language should display it in the add-row.*

- **Steps:**
  1. CLICK the Language dropdown in the add-row
  2. SELECT "Afrikaans"
- **Expected result:** The list shows English, Afrikaans, Sepedi etc.; "Afrikaans" is displayed in the field
- **Assertions:**
  - [x] ASSERT (BLOCKING) Language field in the add-row displays "Afrikaans"

---

### TC-04 — Speak dropdown (ADO #104621 steps 10-11)

*Selecting an option should display it in the add-row.*

- **Steps:**
  1. CLICK the Speak dropdown in the add-row
  2. SELECT "Good"
- **Expected result:** The list shows Good, Fair, Poor; "Good" is displayed
- **Assertions:**
  - [x] ASSERT (BLOCKING) Speak field in the add-row displays "Good"

---

### TC-05 — Read dropdown (ADO #104621 steps 12-13)

*Selecting an option should display it in the add-row.*

- **Steps:**
  1. CLICK the Read dropdown in the add-row
  2. SELECT "Good"
- **Expected result:** The list shows Good, Fair, Poor; "Good" is displayed
- **Assertions:**
  - [x] ASSERT (BLOCKING) Read field in the add-row displays "Good"

---

### TC-06 — Write dropdown (ADO #104621 steps 14-15)

*Selecting an option should display it in the add-row.*

- **Steps:**
  1. CLICK the Write dropdown in the add-row
  2. SELECT "Good"
- **Expected result:** The list shows Good, Fair, Poor; "Good" is displayed
- **Assertions:**
  - [x] ASSERT (BLOCKING) Write field in the add-row displays "Good"

---

### TC-07 — Add the language row (ADO #104621 step 16)

*Language should be added to the table; Save and Next should be enabled.*

- **Steps:**
  1. Populate the add-row: Language=Afrikaans, Speak=Good, Read=Good, Write=Good
  2. CLICK the `+` button
- **Expected result:** A new "Afrikaans / Good / Good / Good" row appears in the table; Save and Next buttons are enabled
- **Assertions:**
  - [x] ASSERT (BLOCKING) A row with Language "Afrikaans" is visible in the table
  - [x] ASSERT (BLOCKING) Next button is enabled
- **Cleanup:** delete the added Afrikaans row (confirming the delete popover) so the table is left as found.

---

## Teardown
- TC-07 deletes the row it added. No further teardown required for automated runs.
