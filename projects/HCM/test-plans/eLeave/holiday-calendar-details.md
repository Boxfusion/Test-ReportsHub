# Test Plan: ELEAVE-HOLIDAY-CALENDAR — Holiday Calendar Details

> **Status:** Ready
> **Owner:** QA
> **Last Updated:** 2026-06-02
> **Estimated Duration:** 120s

## Metadata
| Field | Value |
|-------|-------|
| App URL | https://pd-hcm-adminportal-qa.azurewebsites.net/ |
| Environment | QA |
| Login As | admin / P@ssw0rd |
| ADO Plan | [#79625](https://dev.azure.com/boxfusion/pd-Hcm/_testPlans/define?planId=79625&suiteId=86650) |
| ADO Suite | #86650 — eleave-holidaycalendar-details |

## Objective
> Validate the **Holiday Calendar Details** view of eLeave — the magnifying-glass drill-down to the public holiday / holiday details view, the Export to Excel action, and the Create Public Holiday dialog.

## Preconditions
- [ ] App is reachable at https://pd-hcm-adminportal-qa.azurewebsites.net/
- [ ] Admin credentials are valid (admin / P@ssw0rd)
- [ ] At least one public holiday exists on the Holiday Calendar
- [ ] The acting user has the role required to view and administer the Holiday Calendar

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

### TC-02 — Redirect to public holiday details view when 'Magnifying Glass' is clicked (ADO #86652)

*When a user clicks on the 'Magnifying Glass', the system should redirect the user to the public holiday details view*

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE Navigate to the eleave-holidaycalendar-details view
  2. SNAPSHOT — confirm the target element for: Click on the 'Magnifying Glass' icon
  3. CLICK Click on the 'Magnifying Glass' icon
- **Expected result:** The system redirects the user to the public holiday details view
- **Assertions:**
  - [x] ASSERT (BLOCKING) The system redirects the user to the public holiday details view

---

### TC-03 — System downloads all holidays into an Excel sheet when 'Export' button is clicked (ADO #86654)

*When a user clicks on the 'Export' button, the system should download all the holidays into an Excel sheet*

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE Navigate to the eleave-holidaycalendar-details view
  2. SNAPSHOT — confirm the target element for: Click on the 'Export' button
  3. CLICK Click on the 'Export' button
- **Expected result:** All holidays are downloaded into an Excel sheet
- **Assertions:**
  - [x] ASSERT (BLOCKING) All holidays are downloaded into an Excel sheet

---

### TC-04 — Redirect to holiday details view when 'Magnifying glass' icon is clicked (ADO #86656)

*When a user clicks on the 'Magnifying glass' icon, the system should redirect the user to the holiday details view*

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE Navigate to the eleave-holidaycalendar-details view
  2. SNAPSHOT — confirm the target element for: Click on the 'Magnifying glass' icon
  3. CLICK Click on the 'Magnifying glass' icon
- **Expected result:** The system redirects the user to the holiday details view
- **Assertions:**
  - [x] ASSERT (BLOCKING) The system redirects the user to the holiday details view

---

### TC-05 — Clicking 'Create Public Holiday' button displays 'Add a new public holiday' dialog (ADO #86658)

*When a user clicks on the 'Create Public Holiday' button, the system should display the 'Add a new public holiday' dialog*

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE Navigate to the eleave-holidaycalendar-details view
  2. SNAPSHOT — confirm the target element for: Click on the 'Create Public Holiday' button
  3. CLICK Click on the 'Create Public Holiday' button
- **Expected result:** The 'Add a new public holiday' dialog is displayed
- **Assertions:**
  - [x] ASSERT (BLOCKING) The 'Add a new public holiday' dialog is displayed

---

## Teardown
- Log out of the admin portal after test completion (optional for automated runs).
