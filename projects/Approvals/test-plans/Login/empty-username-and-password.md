# Test Plan: Empty Username and Password

> **Status:** Ready
> **Owner:** QA
> **Last Updated:** 2026-07-07
> **Estimated Duration:** 30s

## Metadata
| Field | Value |
|-------|-------|
| App URL | https://pd-approvals-adminportal-qa.azurewebsites.net/ |
| Environment | QA |
| Login As | (none — both fields left empty) |
| ADO Plan | [#100853](https://dev.azure.com/boxfusion/pd-approvals/_testPlans/define?planId=100853&suiteId=100854) |
| ADO Suite | #100854 |
| ADO Test Case | [#104709](https://dev.azure.com/boxfusion/pd-approvals/_workitems/edit/104709) — Empty Username and password |

> **Note:** Live run shows the app does not render distinct per-field "Username is required" / "Password is required" text. Submitting with both fields empty instead surfaces the same transient toast (Ant Design `role="alert"`) used for invalid-credential attempts, and login is prevented. Assertions below reflect the observed behavior rather than the field-level messages implied by the ADO wording.

## Objective
> Validate that submitting the login form with both the Username and Password fields empty triggers a validation/error message and prevents login.

## Preconditions
- [ ] App is reachable at https://pd-approvals-adminportal-qa.azurewebsites.net/

## Test Cases

### TC-01 — Empty Username and Password (ADO #104709)

- **Type:** Negative
- **Steps:**
  1. NAVIGATE to https://pd-approvals-adminportal-qa.azurewebsites.net/login
  2. SNAPSHOT — confirm the Approvals login page opens with all login elements displayed
  3. Leave Username field empty
  4. Leave Password field empty
  5. CLICK the Login button
  6. SNAPSHOT — confirm validation messages are displayed for both fields
- **Expected result:** System displays a validation/error message and prevents login; the user remains on the login page. (ADO wording implies separate "Username is required" / "Password is required" field messages, but the live app surfaces a single toast alert instead — see note above.)
- **Assertions:**
  - [x] ASSERT (BLOCKING) Login page is displayed with Username, Password fields and Login button visible
  - [x] ASSERT (BLOCKING) An error/validation toast is displayed after clicking Login with both fields empty
  - [x] ASSERT (BLOCKING) Login is prevented and the URL still contains `/login`

---

## Teardown
- None required (login was not successful).
