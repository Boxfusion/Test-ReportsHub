# Test Plan: Valid Login

> **Status:** Ready
> **Owner:** QA
> **Last Updated:** 2026-07-07
> **Estimated Duration:** 30s

## Metadata
| Field | Value |
|-------|-------|
| App URL | https://pd-approvals-adminportal-qa.azurewebsites.net/ |
| Environment | QA |
| Login As | Ian / 123qwe |
| ADO Plan | [#100853](https://dev.azure.com/boxfusion/pd-approvals/_testPlans/define?planId=100853&suiteId=100854) |
| ADO Suite | #100854 |
| ADO Test Case | [#104704](https://dev.azure.com/boxfusion/pd-approvals/_workitems/edit/104704) — Valid Login |

## Objective
> Validate that a user with valid credentials can log in to the Approvals Admin Portal and is redirected to the dashboard/home page.

## Preconditions
- [ ] App is reachable at https://pd-approvals-adminportal-qa.azurewebsites.net/
- [ ] User credentials are valid (Ian / 123qwe)

## Test Cases

### TC-01 — Valid Login (ADO #104704)

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE to https://pd-approvals-adminportal-qa.azurewebsites.net/login
  2. SNAPSHOT — confirm the Approvals login page opens with all login elements displayed
  3. TYPE Username field with `Ian`
  4. TYPE Password field with `123qwe`
  5. CLICK the Login button
  6. WAIT for the dashboard/home page to load
- **Expected result:** The Approvals/Login page opens successfully without errors, the username and password fields accept the entered values, and after clicking Login the user is authenticated and redirected to the Approvals dashboard/home page.
- **Assertions:**
  - [x] ASSERT (BLOCKING) Login page is displayed with Username, Password fields and Login button visible
  - [x] ASSERT Username field contains `Ian` after typing
  - [x] ASSERT Password field accepts the entered password
  - [x] ASSERT (BLOCKING) URL no longer contains `/login` and the user is redirected to the dashboard/home page

---

## Teardown
- Log out of the admin portal after test completion (optional for automated runs).
