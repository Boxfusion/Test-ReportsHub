# Test Plan: ELEAVE-ADD-HOLIDAY — Add a New Public Holiday Dialog

> **Status:** Ready
> **Owner:** QA
> **Last Updated:** 2026-06-02
> **Estimated Duration:** 105s

## Metadata
| Field | Value |
|-------|-------|
| App URL | https://pd-hcm-adminportal-qa.azurewebsites.net/ |
| Environment | QA |
| Login As | admin / P@ssw0rd |
| ADO Plan | [#79625](https://dev.azure.com/boxfusion/pd-Hcm/_testPlans/define?planId=79625&suiteId=86667) |
| ADO Suite | #86667 — eleave-holidaycalendar-addanewpublicholiday-dialog |

## Objective
> Validate the **Add a New Public Holiday** dialog of eLeave — the OK action (adds the holiday and redirects to the Public Holidays page), the new holiday appearing on the calendar, and the OK button remaining inactive until the mandatory Name and Date fields are populated.

## Preconditions
- [ ] App is reachable at https://pd-hcm-adminportal-qa.azurewebsites.net/
- [ ] Admin credentials are valid (admin / P@ssw0rd)
- [ ] The Holiday Calendar is reachable with the Create Public Holiday action available
- [ ] The acting user has the role required to administer the Holiday Calendar

## Test Cases

### TC-01 — Login as Admin

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE to https://pd-hcm-adminportal-qa.azurewebsites.net/
  2. SNAPSHOT — confirm login page is visible
  3. TYPE Username field with `admin`
  4. TYPE Password field with `P@ssw0rd`
  5. CLICK the Sign In button
  6. WAIT for the home page / workflow inbox to load
- **Expected result:** User is logged in and the eLeave workflow inbox is reachable
- **Assertions:**
  - [x] ASSERT (BLOCKING) URL no longer contains `/login` and the authenticated home page is visible

---

### TC-02 — System should add the holiday when 'OK' button is clicked (ADO #86671)

*When a user clicks on the 'OK' button, the system should add the holiday and redirect the user to the Public Holidays page*

- **Type:** Happy path
- **Steps:**
  1. SNAPSHOT — confirm the target element for: Open the eleave-holidaycalendar-addanewpublicholiday-dialog
  2. CLICK Open the eleave-holidaycalendar-addanewpublicholiday-dialog
  3. SNAPSHOT — confirm the target element for: Click on the 'OK' button
  4. CLICK Click on the 'OK' button
- **Expected result:** The holiday is added to the system
- **Assertions:**
  - [x] ASSERT (BLOCKING) The holiday is added to the system

---

### TC-03 — System should redirect to the Public Holidays page when 'OK' button is clicked (ADO #86672)

*When a user clicks on the 'OK' button, the system should add the holiday and redirect the user to the Public Holidays page*

- **Type:** Happy path
- **Steps:**
  1. SNAPSHOT — confirm the target element for: Open the eleave-holidaycalendar-addanewpublicholiday-dialog
  2. CLICK Open the eleave-holidaycalendar-addanewpublicholiday-dialog
  3. SNAPSHOT — confirm the target element for: Click on the 'OK' button
  4. CLICK Click on the 'OK' button
- **Expected result:** The user is redirected to the Public Holidays page
- **Assertions:**
  - [x] ASSERT (BLOCKING) The user is redirected to the Public Holidays page

---

### TC-04 — The added holiday should appear on the calendar (ADO #86669)

*The added holiday should appear on the calendar as well*

- **Type:** Happy path
- **Steps:**
  1. SNAPSHOT — confirm the target element for: Open the eleave-holidaycalendar-addanewpublicholiday-dialog
  2. CLICK Open the eleave-holidaycalendar-addanewpublicholiday-dialog
  3. SNAPSHOT — confirm the target element for: Add and save a new holiday
  4. CLICK Add and save a new holiday
  5. SNAPSHOT — confirm the newly added holiday appears on the calendar view
- **Expected result:** The newly added holiday appears on the calendar
- **Assertions:**
  - [x] ASSERT (BLOCKING) The newly added holiday appears on the calendar

---

### TC-05 — The 'OK' button should remain inactive until the user populates the 'Name' field (ADO #86674)

*The 'OK' button should remain inactive until the user populates the 'Name' and 'Date' of the holiday*

- **Type:** Negative
- **Steps:**
  1. SNAPSHOT — confirm the target element for: Open the eleave-holidaycalendar-addanewpublicholiday-dialog
  2. CLICK Open the eleave-holidaycalendar-addanewpublicholiday-dialog
  3. SNAPSHOT — confirm the 'Name' field is empty and the 'OK' button is inactive
- **Expected result:** The 'OK' button is inactive when the 'Name' field is empty
- **Assertions:**
  - [x] ASSERT (BLOCKING) The 'OK' button is inactive when the 'Name' field is empty

---

### TC-06 — The 'OK' button should remain inactive until the user populates the 'Date' field (ADO #86675)

*The 'OK' button should remain inactive until the user populates the 'Name' and 'Date' of the holiday*

- **Type:** Negative
- **Steps:**
  1. SNAPSHOT — confirm the target element for: Open the eleave-holidaycalendar-addanewpublicholiday-dialog
  2. CLICK Open the eleave-holidaycalendar-addanewpublicholiday-dialog
  3. SNAPSHOT — confirm the 'Date' field is empty and the 'OK' button is inactive
- **Expected result:** The 'OK' button is inactive when the 'Date' field is empty
- **Assertions:**
  - [x] ASSERT (BLOCKING) The 'OK' button is inactive when the 'Date' field is empty

---

## Teardown
- Log out of the admin portal after test completion (optional for automated runs).
