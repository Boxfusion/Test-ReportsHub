# Test Plan: Create Case

> **Status:** Ready
> **Owner:** QA
> **Last Updated:** 2026-04-30
> **Estimated Duration:** 120s

## Metadata
| Field | Value |
|-------|-------|
| App URL | https://linux-dep-adminportal-test.azurewebsites.net/ |
| Environment | QA |
| Login As | admin / 123qwe |

## Objective
> Validate that an admin user can log in and successfully create a case by filling all mandatory fields and submitting via the OK button.

## Preconditions
- [ ] App is reachable at https://linux-dep-adminportal-test.azurewebsites.net/
- [ ] Admin credentials are valid (admin / 123qwe)

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

### TC-02: Open Create Case Form
- **Type:** Happy path
- **Steps:**
  1. SNAPSHOT — confirm dashboard is loaded
  2. CLICK the "Create Case" button or navigate to the Cases section
  3. WAIT for the create case form/dialog to appear
  4. SNAPSHOT — confirm form is open
- **Expected result:** Create case form/dialog is displayed
- **Assertions:**
  - [x] ASSERT (BLOCKING) create case form is visible

### TC-03: Fill Mandatory Fields and Submit
- **Type:** Happy path
- **Steps:**
  1. SNAPSHOT — confirm all mandatory fields are visible
  2. SELECT Channel dropdown — choose `Call Centre`
  3. SNAPSHOT — confirm Channel is set to Call Centre
  4. TYPE Mobile Number field with `0766791145`
  5. SNAPSHOT — confirm Mobile Number is filled
  6. WAIT for Possible Matches section to populate
  7. SNAPSHOT — confirm Possible Matches section is visible
  8. DOUBLE-CLICK the first entry in the Possible Matches list to select them
  9. SNAPSHOT — confirm person is selected
  10. SELECT the Category dropdown — choose the first available option
  11. SNAPSHOT — confirm Category is selected
  12. SELECT the Case Type dropdown — choose the first available option
  13. SNAPSHOT — confirm Case Type is selected
  14. TYPE the Address field with a valid address
  15. SNAPSHOT — confirm Address is filled
  16. CLICK the OK button to submit
  17. WAIT for confirmation or case number to appear
- **Expected result:** Case is created successfully and a confirmation or case reference is shown
- **Assertions:**
  - [x] ASSERT Channel is set to `Call Centre`
  - [x] ASSERT Mobile Number shows `0766791145`
  - [x] ASSERT a person was selected from Possible Matches
  - [x] ASSERT Category is selected (non-empty)
  - [x] ASSERT Case Type is selected (non-empty)
  - [x] ASSERT Address is filled
  - [x] ASSERT (BLOCKING) case is submitted successfully (confirmation visible or case number shown)

## Teardown
- Log out of the admin portal after test completion.
