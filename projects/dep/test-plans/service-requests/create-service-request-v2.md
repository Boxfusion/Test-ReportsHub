# Test Plan: Create Service Request (v2)

> **Status:** Ready
> **Owner:** QA
> **Last Updated:** 2026-05-18
> **Estimated Duration:** 90s

## Metadata
| Field | Value |
|-------|-------|
| App URL | https://linux-dep-adminportal-test.azurewebsites.net/ |
| Environment | QA |
| Login As | admin / 123qwe |

## Objective
> Validate that an admin user can log in, navigate to Service Requests, and create a new service request by filling the mandatory fields and submitting via the OK button.

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

### TC-02: Navigate to Service Requests
- **Type:** Happy path
- **Steps:**
  1. SNAPSHOT — confirm dashboard is loaded
  2. CLICK the Service Requests menu / navigation item
  3. WAIT for the Service Requests list page to load
  4. SNAPSHOT — confirm Service Requests page is visible
- **Expected result:** Service Requests list page is displayed
- **Assertions:**
  - [x] ASSERT (BLOCKING) Service Requests page is visible

### TC-03: Create a Service Request
- **Type:** Happy path
- **Steps:**
  1. SNAPSHOT — confirm Service Requests page is loaded
  2. CLICK the "Create" / "New Service Request" button
  3. WAIT for the create service request form/dialog to appear
  4. SNAPSHOT — confirm form is open and mandatory fields are visible
  5. SELECT / TYPE each mandatory field on the form with valid values
  6. SNAPSHOT — confirm each mandatory field is populated
  7. CLICK the OK button to submit
  8. WAIT for confirmation or service request reference to appear
  9. SNAPSHOT — confirm success message is visible
- **Expected result:** Service request is created successfully and a confirmation message (or reference number) is shown
- **Assertions:**
  - [x] ASSERT create service request form is visible
  - [x] ASSERT all mandatory fields are populated before submit
  - [x] ASSERT OK button was clicked and form was submitted
  - [x] ASSERT (BLOCKING) success message or service request reference is visible after submit

## Teardown
- Log out of the admin portal after test completion.
