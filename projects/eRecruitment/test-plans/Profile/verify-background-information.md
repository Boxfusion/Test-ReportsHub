# Test Plan: PROFILE-104599 — Verify Background Information

> **Status:** Ready
> **Owner:** QA
> **Last Updated:** 2026-07-06
> **Estimated Duration:** 180s

## Metadata
| Field | Value |
|-------|-------|
| App URL | https://pd-recruitment-publicportal-1-qa.shesha.app/ |
| Environment | QA |
| Login As | Fred / Metaganemr%03 |
| ADO Plan | [#99437](https://dev.azure.com/boxfusion/pd-recruitment/_testPlans/define?planId=99437&suiteId=104586) |
| ADO Suite | #104586 — Profile Details |
| ADO Test Case | [#104599](https://dev.azure.com/boxfusion/pd-recruitment/_workitems/edit/104599) — Verify Background Information |

## Objective
> Validate the **Background Information** step of the Manage Profile flow, which has four sub-tabs: Employment Preferences & History, Criminal & Disciplinary Record, Professional & Legal Disclosures, and Employment Restrictions. Covers all conditional Yes/No radios with their detail text areas, the Internal/External dropdown's effect on the Employee Number field, the registration date picker, and Next navigation into Languages.

## Preconditions
- [ ] App is reachable at https://pd-recruitment-publicportal-1-qa.shesha.app/
- [ ] Applicant credentials are valid (Fred / Metaganemr%03)
- [ ] Personal Details, Contact Details and Demographic Details steps are already complete for Fred

## Notes on observed behaviour vs. ADO wording
- **Background Information is one step split into 4 sub-tabs** (Employment Preferences & History, Criminal & Disciplinary Record, Professional & Legal Disclosures, Employment Restrictions), each with its own set of fields. The 4th tab, Employment Restrictions, is visually overflowed behind a `...` menu at typical viewport widths — it's a real tab (`role="tab"`), just rendered inside an expanded-dropdown popup instead of the visible tab strip.
- **Internal/External** options are External Applicant, Current Employee (default for Fred), Past Employee, Recruitment Agency (ADO lists "External Applicant, Current Employee, Past Employee etc.").
- Every Yes/No radio pair on this step auto-persists across sessions, so this plan explicitly sets the state it needs (e.g. clicking No then Yes) rather than assuming a fresh unset default.
- The page heading is **"Background information"** (lowercase "i").

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

### TC-02 — Click on Background Information tab (ADO #104599 step 7)

*Background Information page should open successfully.*

- **Steps:**
  1. CLICK the Manage Profile menu item
  2. CLICK the Background Information step in the left rail
- **Expected result:** Background information heading and the 4 sub-tabs are displayed
- **Assertions:**
  - [x] ASSERT (BLOCKING) Background information heading is visible
  - [x] ASSERT (BLOCKING) Employment Preferences & History tab is selected by default

---

### TC-03 — Relocate / extra hours radios (ADO #104599 steps 8-9)

*Selected radio buttons should be highlighted.*

- **Steps:**
  1. CLICK "No" then "Yes" on "Are you willing to relocate?"
  2. CLICK "No" then "Yes" on "Are you willing to work extra hours?"
- **Expected result:** Each radio reflects the last-clicked selection
- **Assertions:**
  - [x] ASSERT (BLOCKING) "Are you willing to relocate?" Yes radio is checked
  - [x] ASSERT (BLOCKING) "Are you willing to work extra hours?" Yes radio is checked

---

### TC-04 — Internal/External: External Applicant hides Employee Number (ADO #104599 steps 10-11)

*Employee Number field should be hidden.*

- **Steps:**
  1. CLICK the Internal/External dropdown
  2. SELECT "External Applicant"
- **Expected result:** List shows External Applicant, Current Employee, Past Employee, Recruitment Agency; Employee Number field is hidden
- **Assertions:**
  - [x] ASSERT (BLOCKING) Employee Number field is hidden after selecting "External Applicant"

---

### TC-05 — Internal/External: Current Employee enables Employee Number (ADO #104599 steps 12-14)

*Employee Number field should be enabled and accept input.*

- **Steps:**
  1. CLICK the Internal/External dropdown
  2. SELECT "Current Employee"
  3. TYPE an employee number
- **Expected result:** Employee Number field is enabled and displays the typed value
- **Assertions:**
  - [x] ASSERT (BLOCKING) Employee Number field is visible and enabled
  - [x] ASSERT (BLOCKING) Employee Number field contains the typed value

---

### TC-06 — Previously employed in Public Service + notice period (ADO #104599 steps 15-17)

*Department field should be enabled when Yes is selected; notice period should populate.*

- **Steps:**
  1. CLICK "Yes" on "Were you previously employed in the Public Service?"
  2. TYPE a department name into the enabled field
  3. TYPE a number of days into "How much notice must you serve with your current employer?"
- **Expected result:** Department field is enabled and populated; notice period field is populated
- **Assertions:**
  - [x] ASSERT (BLOCKING) Previous employing department field is enabled after selecting "Yes"
  - [x] ASSERT (BLOCKING) Department field contains the typed value
  - [x] ASSERT (BLOCKING) Notice period field contains the typed value

---

### TC-07 — Criminal & Disciplinary Record tab (ADO #104599 steps 18-26)

*Each "If yes" detail field should be enabled only when its Yes radio is selected.*

- **Steps:**
  1. CLICK the Criminal & Disciplinary Record tab
  2. For each of the 4 Yes/No questions (criminal offence, pending criminal case, dismissed for misconduct, pending disciplinary case): CLICK "Yes", then TYPE details into the field that appears
- **Expected result:** Each detail field is enabled and populated only when its question is set to "Yes"
- **Assertions:**
  - [x] ASSERT (BLOCKING) All 4 detail fields are visible and contain their typed values

---

### TC-08 — Professional & Legal Disclosures tab (ADO #104599 steps 27-35)

*The resignation-disclosure detail field should be enabled when Yes is selected; the registration date picker should open and accept a date.*

- **Steps:**
  1. CLICK the Professional & Legal Disclosures tab
  2. CLICK "Yes" on "Have you resigned from a recent job pending any disciplinary proceeding against you?" and TYPE details
  3. CLICK "Yes" on the remaining 3 highlight-only Yes/No questions (discharged/retired, conducting business with State, relinquish business interests)
  4. CLICK the Official Registration date picker and SELECT a date
  5. TYPE a registration number
- **Expected result:** Detail field populated; all 3 remaining radios show Yes selected; calendar opens and accepts a date; Reg. No is populated
- **Assertions:**
  - [x] ASSERT (BLOCKING) Resignation-disclosure detail field contains the typed value
  - [x] ASSERT (BLOCKING) The 3 remaining questions each have "Yes" checked
  - [x] ASSERT (BLOCKING) The date picker calendar (`.ant-picker-panel`) is visible when clicked
  - [x] ASSERT (BLOCKING) Reg. No field contains the typed value

---

### TC-09 — Employment Restrictions tab (ADO #104599 steps 36-38)

*The reappointment-condition detail field should be enabled when Yes is selected; Save and Next should be enabled.*

- **Steps:**
  1. CLICK the Employment Restrictions tab (behind the `...` overflow menu at typical widths)
  2. CLICK "Yes" on the reappointment-conditions question
  3. TYPE details into the field that appears
- **Expected result:** Detail field is enabled and populated; Next button is enabled
- **Assertions:**
  - [x] ASSERT (BLOCKING) Detail field is visible and contains the typed value
  - [x] ASSERT (BLOCKING) Next button is enabled

---

### TC-10 — Click Next button (ADO #104599 step 39)

*The system should move to the Languages step.*

- **Steps:**
  1. CLICK the Next button
- **Expected result:** Languages step is displayed
- **Assertions:**
  - [x] ASSERT (BLOCKING) The Languages heading is visible

---

## Teardown
- No teardown required for automated runs (read/update-only against a seeded QA test user).
