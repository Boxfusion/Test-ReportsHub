# Test Plan: Valid Username and Invalid Password

> **Status:** Ready
> **Owner:** QA
> **Last Updated:** 2026-07-07
> **Estimated Duration:** 30s

## Metadata
| Field | Value |
|-------|-------|
| App URL | https://pd-approvals-adminportal-qa.azurewebsites.net/ |
| Environment | QA |
| Login As | Ian / wrongpass123 (negative case — valid username, invalid password) |
| ADO Plan | [#100853](https://dev.azure.com/boxfusion/pd-approvals/_testPlans/define?planId=100853&suiteId=100854) |
| ADO Suite | #100854 |
| ADO Test Case | [#104707](https://dev.azure.com/boxfusion/pd-approvals/_workitems/edit/104707) — Valid Username and Invalid Password |

> **Note:** ADO step 6's recorded expected text ("User is authenticated successfully...") appears to be a copy-paste artifact from the Valid Login case (#104704) — it contradicts the test's own title and the sibling negative cases (#104705, #104706). This plan implements the negative-case behavior implied by the title: login must be rejected.

## Objective
> Validate that a login attempt with a valid username but an invalid password is rejected — the user is shown an appropriate error message and remains on the login page.

## Preconditions
- [ ] App is reachable at https://pd-approvals-adminportal-qa.azurewebsites.net/
- [ ] `Ian` is a valid username (used here with an incorrect password)

## Test Cases

### TC-01 — Valid Username and Invalid Password (ADO #104707)

- **Type:** Negative
- **Steps:**
  1. NAVIGATE to https://pd-approvals-adminportal-qa.azurewebsites.net/login
  2. SNAPSHOT — confirm the Approvals login page opens with all login fields visible and functional
  3. TYPE Username field with `Ian`
  4. TYPE Password field with `wrongpass123`
  5. CLICK the Login button
  6. SNAPSHOT — confirm the error message and login page state
- **Expected result:** Login is unsuccessful. An appropriate error message such as "Invalid username or password" is displayed, and the user remains on the login page.
- **Assertions:**
  - [x] ASSERT (BLOCKING) Login page is displayed with Username, Password fields and Login button visible
  - [x] ASSERT Username field accepts the entered valid value
  - [x] ASSERT Password field accepts the entered invalid value
  - [x] ASSERT (BLOCKING) An error message is displayed and the URL still contains `/login`

---

## Teardown
- None required (login was not successful).
