# Test Plan: Create Customer

> **Status:** Ready
> **Owner:** QA
> **Last Updated:** 2026-05-21
> **Estimated Duration:** 90s

## Metadata
| Field | Value |
|-------|-------|
| App URL | https://pd-dep-adminportal-test.shesha.app/ |
| Environment | QA |
| Login As | admin / 123qwe |

## Objective
> Validate that an admin user can log in, navigate to the Customers tab, and create a new customer by filling the mandatory fields and submitting via the OK button — confirming a success message is shown.

## Preconditions
- [ ] App is reachable at https://pd-dep-adminportal-test.shesha.app/
- [ ] Admin credentials are valid (admin / 123qwe)

## Test Cases

### TC-01: Login as Admin
- **Type:** Happy path
- **Steps:**
  1. NAVIGATE to https://pd-dep-adminportal-test.shesha.app/
  2. SNAPSHOT — confirm login form is visible
  3. TYPE username field with `admin`
  4. TYPE password field with `123qwe`
  5. CLICK the login / sign-in button
  6. WAIT for dashboard/home page to load
- **Expected result:** User is logged in and sees the admin dashboard
- **Assertions:**
  - [x] ASSERT (BLOCKING) dashboard or home page is visible after login

### TC-02: Navigate to Customers
- **Type:** Happy path
- **Steps:**
  1. SNAPSHOT — confirm dashboard is loaded
  2. CLICK the Customers tab in the navigation bar
  3. WAIT for the Customers list page to load
  4. SNAPSHOT — confirm Customers page is visible
- **Expected result:** Customers list page is displayed
- **Assertions:**
  - [x] ASSERT (BLOCKING) Customers page is visible

### TC-03: Create a Customer
- **Type:** Happy path
- **Steps:**
  1. SNAPSHOT — confirm Customers page is loaded
  2. CLICK the Create button
  3. WAIT for the create customer form/dialog to appear
  4. SNAPSHOT — confirm form is open and mandatory fields are visible
  5. TYPE / SELECT each mandatory field on the form with valid values
  6. SNAPSHOT — confirm each mandatory field is populated
  7. CLICK the OK button to submit
  8. WAIT for the success message or customer reference to appear
  9. SNAPSHOT — confirm success message is visible
- **Expected result:** Customer is created successfully and a success message (or customer reference) is shown
- **Assertions:**
  - [x] ASSERT create customer form is visible
  - [x] ASSERT all mandatory fields are populated before submit
  - [x] ASSERT OK button was clicked and form was submitted
  - [x] ASSERT (BLOCKING) success message is visible after submit

## Teardown
- Log out of the admin portal after test completion.
