# Test Plan: DASHBOARD-106381 — Withdraw Application

> **Status:** Ready
> **Owner:** QA
> **Last Updated:** 2026-07-30
> **Estimated Duration:** 90s

## Metadata
| Field | Value |
|-------|-------|
| App URL | https://pd-recruitment-publicportal-1-qa.shesha.app/ |
| Environment | QA |
| Login As | Fred / Metaganemr%03 |
| ADO Plan | [#99437](https://dev.azure.com/boxfusion/pd-recruitment/_testPlans/define?planId=99437&suiteId=106380) |
| ADO Suite | #106380 — Dashboard |
| ADO Test Case | [#106381](https://dev.azure.com/boxfusion/pd-recruitment/_workitems/edit/106381) — Withdraw Application |

## Objective
> Validate the "My Applications" withdraw flow — opening an existing application, opening/closing the withdraw dialog, confirming the Withdraw button starts disabled until comments are populated, and withdrawing the application (which should then show a "Resubmit" button).

## ⚠️ Stateful test
- **This test actually withdraws one of Fred's real submitted applications** in QA (whichever the magnifying-glass icon opens first in "My Applications" — likely the "TestingTimer" application submitted during test case #106368). Its status changes from submitted to withdrawn, and a "Resubmit" button appears in its place. This is reversible in principle (a "Resubmit" flow exists) but is still a real, deliberate state change, run only with explicit authorization.

## Preconditions
- [ ] App is reachable at https://pd-recruitment-publicportal-1-qa.shesha.app/
- [ ] Applicant credentials are valid (Fred / Metaganemr%03)
- [ ] Fred has at least one existing job application in "My Applications"

## Test Cases

### TC-01 — Login as Fred

- **Steps:**
  1. NAVIGATE to https://pd-recruitment-publicportal-1-qa.shesha.app/login
  2. TYPE Username field with `Fred`
  3. TYPE Password field with `Metaganemr%03`
  4. CLICK the Sign In button
  5. WAIT for the Dashboard to load
- **Assertions:**
  - [x] ASSERT (BLOCKING) URL no longer contains `/login` and the Dashboard is visible

---

### TC-02 — Click on Dashboard menu item (ADO #106381 step 3)

- **Steps:**
  1. CLICK the Dashboard menu item
- **Assertions:**
  - [x] ASSERT (BLOCKING) Dashboard page is displayed

---

### TC-03 — Click on My Applications (ADO #106381 step 4)

- **Steps:**
  1. CLICK "My Applications"
- **Expected result:** Applications index table opens successfully
- **Assertions:**
  - [x] ASSERT (BLOCKING) Applications table is visible

---

### TC-04 — Open an application from the list (ADO #106381 step 5)

- **Steps:**
  1. CLICK the magnifying-glass icon on the first application row
- **Expected result:** Selected application opens in details view with a Withdraw Application button at the bottom right
- **Assertions:**
  - [x] ASSERT (BLOCKING) Application details view is displayed
  - [x] ASSERT (BLOCKING) Withdraw Application button is visible

---

### TC-05 — Click Withdraw Application button (ADO #106381 step 6)

- **Steps:**
  1. CLICK the Withdraw Application button
- **Expected result:** Withdraw application dialog is displayed
- **Assertions:**
  - [x] ASSERT (BLOCKING) Withdraw application dialog is visible

---

### TC-06 — Click Close button (ADO #106381 step 7)

- **Steps:**
  1. CLICK the Close button
- **Expected result:** Withdraw application dialog closes successfully
- **Assertions:**
  - [x] ASSERT (BLOCKING) Withdraw application dialog is no longer visible

---

### TC-07 — Click Withdraw Application button again (ADO #106381 step 8)

- **Steps:**
  1. CLICK the Withdraw Application button
- **Expected result:** Withdraw application dialog is displayed with the Withdraw Application (submit) button disabled
- **Assertions:**
  - [x] ASSERT (BLOCKING) Withdraw application dialog is visible
  - [x] ASSERT (BLOCKING) The dialog's Withdraw Application button is disabled

---

### TC-08 — Populate comments (ADO #106381 step 9)

- **Steps:**
  1. TYPE a comment into the comments field
- **Expected result:** Comments populated successfully; Withdraw Application button becomes enabled
- **Assertions:**
  - [x] ASSERT (BLOCKING) Comments field contains the typed text
  - [x] ASSERT (BLOCKING) The dialog's Withdraw Application button is enabled

---

### TC-09 — Click Withdraw Application button (ADO #106381 step 10)

- **Steps:**
  1. CLICK the dialog's Withdraw Application button
- **Expected result:** System auto-refreshes and a "Resubmit" button is displayed
- **Assertions:**
  - [x] ASSERT (BLOCKING) "Resubmit" button is displayed on the application details view

---

## Teardown
- No teardown — this test intentionally withdraws one existing application per run (see warning above). A "Resubmit" flow exists to reverse it if needed.
