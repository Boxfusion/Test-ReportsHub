# Test Plan: Invalid Username and Valid Password

> **Status:** Ready
> **Owner:** QA
> **Last Updated:** 2026-07-07
> **Estimated Duration:** 30s

## Metadata
| Field | Value |
|-------|-------|
| App URL | https://pd-approvals-adminportal-qa.azurewebsites.net/ |
| Environment | QA |
| Login As | invaliduser / 123qwe (negative case — invalid username, valid password) |
| ADO Plan | [#100853](https://dev.azure.com/boxfusion/pd-approvals/_testPlans/define?planId=100853&suiteId=100854) |
| ADO Suite | #100854 |
| ADO Test Case | [#104706](https://dev.azure.com/boxfusion/pd-approvals/_workitems/edit/104706) — Invalid Username and valid Password |

## Objective
> Validate that a login attempt with an invalid username but a valid password is rejected — the user is shown an appropriate error message and remains on the login page.

## Preconditions
- [ ] App is reachable at https://pd-approvals-adminportal-qa.azurewebsites.net/
- [ ] `123qwe` is a valid password for an existing account (used here against a non-existent username)

## Test Cases

### TC-01 — Invalid Username and Valid Password (ADO #104706)

- **Type:** Negative
- **Steps:**
  1. NAVIGATE to https://pd-approvals-adminportal-qa.azurewebsites.net/login
  2. SNAPSHOT — confirm the Approvals login page opens with all login fields visible and functional
  3. TYPE Username field with `invaliduser`
  4. TYPE Password field with `123qwe`
  5. CLICK the Login button
  6. SNAPSHOT — confirm the error message and login page state
- **Expected result:** Login is unsuccessful. An appropriate error message such as "Invalid username or password" is displayed, and the user remains on the login page.
- **Assertions:**
  - [x] ASSERT (BLOCKING) Login page is displayed with Username, Password fields and Login button visible
  - [x] ASSERT Username field accepts the entered invalid value
  - [x] ASSERT Password field accepts the entered valid value
  - [x] ASSERT (BLOCKING) An error message is displayed and the URL still contains `/login`

---

## Teardown
- None required (login was not successful).
