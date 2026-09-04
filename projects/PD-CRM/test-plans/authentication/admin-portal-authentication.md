# Test Plan: Admin Portal Authentication

> **Status:** Ready
> **Owner:** QA
> **Last Updated:** 2026-09-01
> **Estimated Duration:** 120s

## Metadata
| Field | Value |
|-------|-------|
| App URL | https://pd-dep-adminportal-qa.shesha.app/login |
| Environment | QA |
| Login As | Admin / P@ssword1 |
| Azure DevOps | Plan **112718** › PD-CRM (112719) › Authentication (112721) › **Admin Portal (112731)** |
| ADO cases | #112734 – #112741 (8 cases, all state `Design`, priority 2) |

> **Source of truth.** This plan mirrors ADO suite 112731 one-to-one — 8 cases, in ADO order, with each
> case's expected result quoted from the ADO step. It replaces an earlier 13-case exploratory version written
> before ADO access was available. That earlier run's report was overwritten by this one (same date and plan
> basename produce the same report filename); its findings are preserved in
> `observations/2026-09-01-environment-recon.md` and in the bug log.

## Objective
> Execute the Admin Portal authentication suite (ADO 112731) against the QA environment and report each case
> against the expected result prescribed in Azure DevOps.

## Preconditions
- [ ] App is reachable at https://pd-dep-adminportal-qa.shesha.app/login
- [ ] Admin credentials are valid (`Admin` / `P@ssword1`)
- [ ] The account `NoSuchUser999` does **not** exist in the environment

## Known selectors (captured live 2026-09-01)
| Element | Selector |
|---|---|
| Lesedi logo | `img[src="/images/app-logo.png"]` (390×120) |
| Username | `input[placeholder="Username"]` |
| Password | `input[type="password"]` |
| Sign In | `button:has-text("Sign In")` |
| Error toast | `.ant-message` |
| Profile menu trigger | `.sha-profile-dropdown a.ant-dropdown-trigger` (opens on **click**, not hover) |
| Logout item | `.ant-dropdown:not(.ant-dropdown-hidden) .ant-dropdown-menu-item` containing `Logout` (renders as `" Logout"` with a leading space) |

## Execution notes — three deliberate deviations

These are called out so the results stay auditable against the ADO text.

1. **Error-message wording.** ADO cases #112735/#112736/#112737 prescribe the message
   `"Invalid username or password"`. The application actually renders
   `"Invalid user name or password"` — *user name* as two words. Asserting verbatim would fail three cases
   for one cosmetic delta, so the functional assertion is whitespace-normalised and the wording mismatch is
   raised once as **BUG-003**.
2. **ADO #112738 prescribes a defect as the expected result.** It expects the raw .NET string
   `Value cannot be null. (Parameter 'userNameOrEmailAddress'`. The app does emit exactly that, so the case
   is executed as written and will PASS — but the expectation itself is wrong, and that is raised as
   **BUG-001**.
3. **ADO #112739 appears to contain a copy-paste error.** It is the *password* mandatory-validation case, yet
   its expected result names the *username* parameter (`userNameOrEmai lAddress`, with a stray space). The
   app returns `Value cannot be null. (Parameter 'plainPassword')`. Executed as written this case FAILS; see
   **BUG-004**.

## Test Cases

### TC-01 (#112734): Verify successful login with valid credentials
- **Type:** Happy path
- **Steps:**
  1. NAVIGATE to https://pd-dep-adminportal-qa.shesha.app/login
  2. SNAPSHOT — confirm the Login page is displayed
  3. TYPE username field with `Admin`
  4. TYPE password field with `P@ssword1`
  5. CLICK the Sign In button
  6. WAIT for authentication to complete
- **Expected result (ADO):** "Login request is submitted and authentication is successful."
- **Assertions:**
  - [x] ASSERT (BLOCKING) the Login page is displayed before submitting
  - [x] ASSERT the typed username is displayed in the field
  - [x] ASSERT (BLOCKING) authentication succeeds and the user leaves `/login`

### TC-02 (#112735): Verify login using an invalid username
- **Type:** Negative
- **Steps:**
  1. NAVIGATE to the login page
  2. SNAPSHOT — confirm the Login page is displayed with the Lesedi logo
  3. TYPE username field with `NoSuchUser999`
  4. TYPE password field with `P@ssword1`
  5. CLICK the Sign In button
  6. WAIT for the error message
- **Expected result (ADO):** "The system displays an error message that reads *Invalid username or password*, and the user remains on the Login page."
- **Assertions:**
  - [x] ASSERT the Lesedi logo is displayed on the Login page
  - [x] ASSERT the typed username is displayed in the field
  - [x] ASSERT an "invalid user name or password" error message is displayed
  - [x] ASSERT (BLOCKING) the user remains on the Login page

### TC-03 (#112736): Verify login using an invalid username and password
- **Type:** Negative
- **Steps:**
  1. NAVIGATE to the login page
  2. SNAPSHOT — confirm the Login page is displayed with the Lesedi logo
  3. TYPE username field with `NoSuchUser999` and password field with `WrongPass123!`
  4. CLICK the Sign In button
  5. WAIT for the error message
- **Expected result (ADO):** "The system displays an error message that reads *Invalid username or password*, and the user remains on the Login page."
- **Assertions:**
  - [x] ASSERT the Lesedi logo is displayed on the Login page
  - [x] ASSERT an "invalid user name or password" error message is displayed
  - [x] ASSERT (BLOCKING) the user remains on the Login page

### TC-04 (#112737): Verify login using an invalid password
- **Type:** Negative
- **Steps:**
  1. NAVIGATE to the login page
  2. SNAPSHOT — confirm the Login page is displayed with the Lesedi logo
  3. TYPE username field with `Admin`
  4. TYPE password field with `WrongPass123!`
  5. CLICK the Sign In button
  6. WAIT for the error message
- **Expected result (ADO):** "The system displays an error message that reads *Invalid username or password*, and the user remains on the Login page."
- **Assertions:**
  - [x] ASSERT the Lesedi logo is displayed on the Login page
  - [x] ASSERT an "invalid user name or password" error message is displayed
  - [x] ASSERT (BLOCKING) the user remains on the Login page

### TC-05 (#112738): Verify mandatory username validation
- **Type:** Negative / Validation
- **Steps:**
  1. NAVIGATE to the login page
  2. SNAPSHOT — confirm the Login page is displayed with the Lesedi logo
  3. Leave the Username field empty
  4. TYPE password field with `P@ssword1`
  5. CLICK the Sign In button
  6. WAIT for the message
- **Expected result (ADO):** "The system displays an error message that reads *Value cannot be null. (Parameter 'userNameOrEmailAddress*, and the user remains on the Login page."
- **Assertions:**
  - [x] ASSERT the Username field remained empty
  - [x] ASSERT the message contains `Value cannot be null. (Parameter 'userNameOrEmailAddress`
  - [x] ASSERT (BLOCKING) the user remains on the Login page

> ⚠️ Executed as written, this case PASSES — but the prescribed expected result documents a defect
> (a raw .NET exception shown to the user). See **BUG-001**.

### TC-06 (#112739): Verify mandatory password validation
- **Type:** Negative / Validation
- **Steps:**
  1. NAVIGATE to the login page
  2. SNAPSHOT — confirm the Login page is displayed with the Lesedi logo
  3. TYPE username field with `Admin`
  4. Leave the Password field empty
  5. CLICK the Sign In button
  6. WAIT for the message
- **Expected result (ADO):** "The system displays an error message that reads *Value cannot be null. (Parameter 'userNameOrEmai lAddress*, and the user remains on the Login page."
- **Assertions:**
  - [x] ASSERT the Password field remained empty
  - [x] ASSERT the message names the parameter prescribed by ADO (`userNameOrEmailAddress`)
  - [x] ASSERT (BLOCKING) the user remains on the Login page

> ⚠️ Expected to FAIL: the app returns `Value cannot be null. (Parameter 'plainPassword')`. The ADO
> expectation names the username parameter on a password test and looks like a copy-paste of #112738.
> See **BUG-004**.

### TC-07 (#112740): Verify mandatory username and password validation
- **Type:** Negative / Validation
- **Steps:**
  1. NAVIGATE to the login page
  2. SNAPSHOT — confirm the Login page is displayed with the Lesedi logo
  3. Leave both the Username and Password fields blank
  4. CLICK the Sign In button
  5. WAIT for validation messages
- **Expected result (ADO):** "The system displays validation messages indicating that the Username and Password fields are required. The user remains on the Login page and is not granted access to the system."
- **Assertions:**
  - [x] ASSERT both fields remained empty
  - [x] ASSERT validation messages indicating the fields are required are displayed
  - [x] ASSERT (BLOCKING) the user remains on the Login page and is not granted access

> ⚠️ Expected to FAIL: the app displays **no message at all**. See **BUG-002**.

### TC-08 (#112741): Verify user logout
- **Type:** Happy path
- **Steps:**
  1. NAVIGATE to the login page
  2. TYPE username field with `Admin`
  3. TYPE password field with `P@ssword1`
  4. CLICK the Sign In button
  5. CLICK the user profile menu
  6. CLICK the Logout option
  7. WAIT for the redirect
- **Expected result (ADO):** "The system logs the user out successfully. The user is redirected to the login page."
- **Assertions:**
  - [x] ASSERT the profile menu exposes a visible Logout option
  - [x] ASSERT (BLOCKING) the user is redirected to the login page after logout

## Teardown
- Each test case runs in its own isolated browser context, so no explicit teardown is required.

## Coverage not in this suite
Behaviours verified during the 2026-09-01 exploratory pass that ADO 112731 does **not** cover, retained in
`observations/2026-09-01-environment-recon.md` rather than presented as planned coverage: password masking,
no-user-enumeration parity between the invalid-username and invalid-password messages, `returnUrl` redirect
for anonymous access to a protected route, session persistence across reload, post-logout session
invalidation, and username case-insensitivity. Account lockout remains untested — it needs a throwaway
account so the shared `Admin` login is not locked.
