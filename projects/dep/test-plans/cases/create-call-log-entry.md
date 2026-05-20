# Test Plan: Create Call Log Entry

> **Status:** Ready
> **Owner:** QA
> **Last Updated:** 2026-05-13
> **Estimated Duration:** 120s

## Metadata
| Field | Value |
|-------|-------|
| App URL | https://linux-dep-adminportal-test.azurewebsites.net/ |
| Environment | QA |
| Login As | admin / 123qwe |

## Objective
> Validate that an admin user can log in, open an existing case, add a new call log entry with channel and notes, and confirm the new entry appears in the case's call log list.

## Preconditions
- [ ] App is reachable at https://linux-dep-adminportal-test.azurewebsites.net/
- [ ] Admin credentials are valid (admin / 123qwe)
- [ ] At least one existing case is available in the case list

## Test Cases

### TC-01: Login as Admin
- **Type:** Happy path
- **Steps:**
  1. NAVIGATE to https://linux-dep-adminportal-test.azurewebsites.net/
  2. SNAPSHOT — confirm login form is visible
  3. TYPE username field with `admin`
  4. TYPE password field with `123qwe`
  5. CLICK the login / sign-in button
  6. WAIT for dashboard/home page to load
- **Expected result:** User is logged in and sees the admin dashboard
- **Assertions:**
  - [x] ASSERT (BLOCKING) dashboard or home page is visible after login

### TC-02: Open an Existing Case
- **Type:** Happy path
- **Steps:**
  1. SNAPSHOT — confirm dashboard is loaded
  2. CLICK the Cases section / navigate to the case list
  3. WAIT for the case list to populate
  4. SNAPSHOT — confirm at least one case is visible in the list
  5. CLICK the first case in the list to open it
  6. WAIT for the case detail page to load
  7. SNAPSHOT — confirm case detail page is visible
- **Expected result:** Case detail page is displayed
- **Assertions:**
  - [x] ASSERT (BLOCKING) case detail page is visible

### TC-03: Add Call Log Entry
- **Type:** Happy path
- **Steps:**
  1. SNAPSHOT — confirm case detail page shows the Call Log section
  2. CLICK the "Add Call Log" button
  3. WAIT for the call log form/dialog to appear
  4. SNAPSHOT — confirm call log form is open
  5. SELECT the Channel dropdown — choose `Call Centre`
  6. SNAPSHOT — confirm Channel is set to Call Centre
  7. TYPE the Notes field with `Test call log entry created by automated test`
  8. SNAPSHOT — confirm Notes is filled
  9. CLICK the Submit / OK button
  10. WAIT for the call log form to close and the list to refresh
- **Expected result:** Call log is created and the form closes
- **Assertions:**
  - [x] ASSERT Channel is set to `Call Centre`
  - [x] ASSERT Notes shows `Test call log entry created by automated test`
  - [x] ASSERT (BLOCKING) call log form closed and returned to case detail page

### TC-04: Verify New Call Log Appears
- **Type:** Happy path
- **Steps:**
  1. SNAPSHOT — confirm the call log list section is visible on the case detail page
  2. WAIT for the call log list to display the new entry
  3. SNAPSHOT — confirm the new call log entry is visible in the list
- **Expected result:** New call log entry appears in the case's call log list
- **Assertions:**
  - [x] ASSERT the new call log entry is visible in the list
  - [x] ASSERT (BLOCKING) the new entry shows channel `Call Centre` and notes `Test call log entry created by automated test`

## Teardown
- Log out of the admin portal after test completion.
