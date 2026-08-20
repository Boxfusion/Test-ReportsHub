# Test Plan: ALERTS-106360 — Verify Delete Alert

> **Status:** Ready
> **Owner:** QA
> **Last Updated:** 2026-07-30
> **Estimated Duration:** 90s

## Metadata
| Field | Value |
|-------|-------|
| App URL | https://pd-recruitment-publicportal-1-qa.shesha.app/ |
| Environment | QA |
| Login As | Fred / Metaganemr%03 |
| ADO Plan | [#99437](https://dev.azure.com/boxfusion/pd-recruitment/_testPlans/define?planId=99437&suiteId=104540) |
| ADO Suite | #104540 — Alerts |
| ADO Test Case | [#106360](https://dev.azure.com/boxfusion/pd-recruitment/_workitems/edit/106360) — Verify Delete Alert |

## Objective
> Validate deleting a job alert — create an alert (same flow as #106357), then exercise the Delete icon: cancel the confirmation popup once (verify it closes without deleting), then confirm deletion via OK (verify the alert is removed from the list).

## Preconditions
- [ ] App is reachable at https://pd-recruitment-publicportal-1-qa.shesha.app/
- [ ] Applicant credentials are valid (Fred / Metaganemr%03)

## Test Cases

### TC-01 — Login as Fred

- **Steps:**
  1. NAVIGATE to https://pd-recruitment-publicportal-1-qa.shesha.app/login
  2. TYPE Username field with `Fred`
  3. TYPE Password field with `Metaganemr%03`
  4. CLICK the Sign In button
  5. WAIT for the Dashboard to load
- **Assertions:**
  - [x] ASSERT (BLOCKING) URL no longer contains `/login` and the Dashboard is visible

---

### TC-02 — Click on Alerts menu item (ADO #106360 step 3)

- **Steps:**
  1. CLICK the Alerts menu item
- **Expected result:** System navigates to the Alerts page
- **Assertions:**
  - [x] ASSERT (BLOCKING) Alerts page is displayed

---

### TC-03 — Click Add Alert button (ADO #106360 step 4)

- **Steps:**
  1. CLICK the Add Alert button
- **Expected result:** Add Alert form opens successfully with text fields
- **Assertions:**
  - [x] ASSERT (BLOCKING) Add Alert form/dialog is visible

---

### TC-04 — Populate Job Title/Keywords (ADO #106360 step 5)

- **Steps:**
  1. TYPE a job title/keyword into the Job Title/Keywords field
- **Expected result:** Job title is populated successfully
- **Assertions:**
  - [x] ASSERT (BLOCKING) Job Title/Keywords field contains the typed value

---

### TC-05 — Click Location dropdown (ADO #106360 step 6)

- **Steps:**
  1. CLICK the Location dropdown
- **Expected result:** A list of location options is displayed
- **Assertions:**
  - [x] ASSERT (BLOCKING) Location options list is visible

---

### TC-06 — Select a location, e.g. Head Office (ADO #106360 step 7)

- **Steps:**
  1. SELECT a location option (e.g. "Head Office")
- **Expected result:** The selected option is displayed in the field
- **Assertions:**
  - [x] ASSERT (BLOCKING) Location field displays the selected option

---

### TC-07 — Populate Min Salary "20 000" (ADO #106360 step 8)

- **Steps:**
  1. TYPE "20000" into the Min Salary field
- **Expected result:** Minimum salary is populated successfully
- **Assertions:**
  - [x] ASSERT (BLOCKING) Min Salary field contains 20000

---

### TC-08 — Populate Max Salary "60 000" (ADO #106360 step 9)

- **Steps:**
  1. TYPE "60000" into the Max Salary field
- **Expected result:** Maximum salary is populated successfully
- **Assertions:**
  - [x] ASSERT (BLOCKING) Max Salary field contains 60000

---

### TC-09 — Click Daily radio button (ADO #106360 step 10)

- **Steps:**
  1. CLICK the Daily radio button next to the Frequency label
- **Expected result:** Radio button is selected successfully
- **Assertions:**
  - [x] ASSERT (BLOCKING) Daily radio button is selected

---

### TC-10 — Click OK button (ADO #106360 step 11)

- **Steps:**
  1. CLICK the OK button
- **Expected result:** Alert is added successfully and displayed in the Alerts list
- **Assertions:**
  - [x] ASSERT (BLOCKING) The new alert is visible in the Alerts list

---

### TC-11 — Click the Delete icon next to the Job Title column (ADO #106360 step 12)

- **Steps:**
  1. CLICK the Delete icon on the row for the newly-added alert
- **Expected result:** "Are you sure you want to delete this item" popup is displayed with Cancel and OK buttons
- **Assertions:**
  - [x] ASSERT (BLOCKING) confirmation popover is visible with both Cancel and OK buttons

---

### TC-12 — Click Cancel button (ADO #106360 step 13)

- **Steps:**
  1. CLICK the Cancel button
- **Expected result:** Popup closes successfully, alert is NOT deleted
- **Assertions:**
  - [x] ASSERT (BLOCKING) popover is closed and the alert row is still visible

---

### TC-13 — Click the Delete icon again (ADO #106360 step 14)

- **Steps:**
  1. CLICK the Delete icon on the row for the alert again
- **Expected result:** "Are you sure you want to delete this item" popup is displayed with Cancel and OK buttons
- **Assertions:**
  - [x] ASSERT (BLOCKING) confirmation popover is visible again

---

### TC-14 — Click OK button (ADO #106360 step 15)

- **Steps:**
  1. CLICK the OK button
- **Expected result:** Alert is deleted successfully
- **Assertions:**
  - [x] ASSERT (BLOCKING) the alert row is no longer present in the Alerts list

---

## Teardown
- None required — the test itself deletes the alert it creates, leaving no residual data.
