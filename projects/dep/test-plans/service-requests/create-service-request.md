# Test Plan: Create Service Request

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
> Validate that an admin user can log in, navigate to Service Requests, create a new request, fill the mandatory fields, submit it, and see a success message.

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

### TC-03: Open Create Service Request Form
- **Type:** Happy path
- **Steps:**
  1. SNAPSHOT — confirm Service Requests page is loaded
  2. CLICK the "Create" / "New Service Request" button
  3. WAIT for the create service request form/dialog to appear
  4. SNAPSHOT — confirm form is open
- **Expected result:** Create service request form is displayed with mandatory fields
- **Assertions:**
  - [x] ASSERT (BLOCKING) create service request form is visible

### TC-04: Fill Mandatory Fields and Submit
- **Type:** Happy path
- **Steps:**
  1. SNAPSHOT — confirm all mandatory fields are visible
  2. SELECT / TYPE each mandatory field on the form with valid values
  3. SNAPSHOT — confirm each mandatory field is populated
  4. CLICK the OK button
  5. WAIT for any confirmation step / submit action to complete
  6. SNAPSHOT — confirm success message is visible
- **Expected result:** Service request is submitted and a success message (e.g. "Service request created successfully" or a reference number) is shown
- **Assertions:**
  - [x] ASSERT all mandatory fields are populated before submit
  - [x] ASSERT OK button was clicked and form was submitted
  - [x] ASSERT (BLOCKING) success message or service request reference is visible after submit

## Teardown
- Log out of the admin portal after test completion.
