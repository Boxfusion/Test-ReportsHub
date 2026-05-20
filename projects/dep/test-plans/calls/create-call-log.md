# Test Plan: Create a Call Log

> **Status:** Ready
> **Owner:** QA
> **Last Updated:** 2026-05-14
> **Estimated Duration:** 90s

## Metadata
| Field | Value |
|-------|-------|
| App URL | https://linux-dep-adminportal-test.azurewebsites.net/ |
| Environment | QA |
| Login As | admin / 123qwe |

## Objective
> Validate that an admin user can log in, sign in to the call system, and dial the number `0766791145` to initiate a call log entry.

## Preconditions
- [ ] App is reachable at https://linux-dep-adminportal-test.azurewebsites.net/
- [ ] Admin credentials are valid (admin / 123qwe)
- [ ] Call system module is enabled for the admin user

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

### TC-02: Sign In to Call System
- **Type:** Happy path
- **Steps:**
  1. SNAPSHOT — confirm dashboard is loaded
  2. CLICK the Call System / Call Centre navigation entry
  3. WAIT for the call system page to load
  4. SNAPSHOT — confirm call system sign-in control is visible
  5. CLICK the Sign In button on the call system
  6. WAIT for the agent status to switch to signed-in / ready
  7. SNAPSHOT — confirm signed-in state
- **Expected result:** Agent is signed in to the call system and the dialer is available
- **Assertions:**
  - [x] ASSERT call system page is visible
  - [x] ASSERT (BLOCKING) agent is signed in and the dialer is available

### TC-03: Dial 0766791145
- **Type:** Happy path
- **Steps:**
  1. SNAPSHOT — confirm dialer is visible
  2. TYPE the dialer number field with `0766791145`
  3. SNAPSHOT — confirm number is entered in the dialer
  4. CLICK the Dial / Call button
  5. WAIT for the call to initiate and the call log entry to be created
  6. SNAPSHOT — confirm in-call state or call log entry visible
- **Expected result:** Call is initiated to `0766791145` and a call log entry is created
- **Assertions:**
  - [x] ASSERT dialer shows the number `0766791145`
  - [x] ASSERT call is in progress or ringing state is visible
  - [x] ASSERT (BLOCKING) a call log entry for `0766791145` is created

## Teardown
- End the call if still active.
- Sign out of the call system.
- Log out of the admin portal after test completion.
