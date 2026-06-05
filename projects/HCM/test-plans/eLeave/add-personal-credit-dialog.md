# Test Plan: ELEAVE-ADD-PERSONAL-CREDIT — Add Personal Credit Dialog

> **Status:** Ready
> **Owner:** QA
> **Last Updated:** 2026-06-02
> **Estimated Duration:** 90s

## Metadata
| Field | Value |
|-------|-------|
| App URL | https://pd-hcm-adminportal-qa.shesha.app/ |
| Environment | QA |
| Login As | admin / P@ssw0rd |
| ADO Plan | [#79625](https://dev.azure.com/boxfusion/pd-Hcm/_testPlans/define?planId=79625&suiteId=86624) |
| ADO Suite | #86624 — eleave-wf-leavebalancesadmimistration-addpersonalcredit-dialog |

## Objective
> Validate the **Add a New Personal Leave Balance** (Add Personal Credit) dialog of eLeave — the OK action (adds the credits and redirects to the Leave Balances dashboard), the mandatory-field enforcement, and the Close action (dismisses the dialog).

## Preconditions
- [ ] App is reachable at https://pd-hcm-adminportal-qa.shesha.app/
- [ ] Admin credentials are valid (admin / P@ssw0rd)
- [ ] The Leave Balances Administration table is reachable with the Add Personal Credit action available
- [ ] The acting user has the role required to administer leave balances

## Test Cases

### TC-01 — Login as Admin

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE to https://pd-hcm-adminportal-qa.shesha.app/
  2. SNAPSHOT — confirm login page is visible
  3. TYPE Username field with `admin`
  4. TYPE Password field with `P@ssw0rd`
  5. CLICK the Sign In button
  6. WAIT for the home page / workflow inbox to load
- **Expected result:** User is logged in and the eLeave workflow inbox is reachable
- **Assertions:**
  - [x] ASSERT (BLOCKING) URL no longer contains `/login` and the authenticated home page is visible

---

### TC-02 — When a user clicks on the 'Close' button, the system should close the dialog (ADO #86626)

*When a user clicks on the 'Close' button, the system should close the dialog*

- **Type:** Happy path
- **Steps:**
  1. SNAPSHOT — confirm the target element for: Open the eleave-wf-leavebalancesadmimistration-addpersonalcredit-dialog
  2. CLICK Open the eleave-wf-leavebalancesadmimistration-addpersonalcredit-dialog
  3. SNAPSHOT — confirm the target element for: Click on the 'Close' button
  4. CLICK Click on the 'Close' button
- **Expected result:** The dialog closes upon clicking the 'Close' button
- **Assertions:**
  - [x] ASSERT (BLOCKING) The dialog closes upon clicking the 'Close' button

---

### TC-03 — System should add credits when 'OK' button is clicked (ADO #86628)

*When a user clicks on the 'OK' button, the system should add the credits and redirect the user to the Leave Balances dashboard*

- **Type:** Happy path
- **Steps:**
  1. SNAPSHOT — confirm the target element for: Open the eleave-wf-leavebalancesadmimistration-addpersonalcredit-dialog
  2. CLICK Open the eleave-wf-leavebalancesadmimistration-addpersonalcredit-dialog
  3. SNAPSHOT — confirm the target element for: Click the 'OK' button
  4. CLICK Click the 'OK' button
- **Expected result:** The system adds the credits
- **Assertions:**
  - [x] ASSERT (BLOCKING) The system adds the credits

---

### TC-04 — System should redirect to Leave Balances dashboard when 'OK' button is clicked (ADO #86629)

*When a user clicks on the 'OK' button, the system should add the credits and redirect the user to the Leave Balances dashboard*

- **Type:** Happy path
- **Steps:**
  1. SNAPSHOT — confirm the target element for: Open the eleave-wf-leavebalancesadmimistration-addpersonalcredit-dialog
  2. CLICK Open the eleave-wf-leavebalancesadmimistration-addpersonalcredit-dialog
  3. SNAPSHOT — confirm the target element for: Click the 'OK' button
  4. CLICK Click the 'OK' button
- **Expected result:** The user is redirected to the Leave Balances dashboard
- **Assertions:**
  - [x] ASSERT (BLOCKING) The user is redirected to the Leave Balances dashboard

---

### TC-05 — The system should not allow a user to add credits without adding all the mandatory fields (ADO #86631)

*The system should not allow a user to add credits without adding all the mandatory fields*

- **Type:** Negative
- **Steps:**
  1. SNAPSHOT — confirm the target element for: Open the eleave-wf-leavebalancesadmimistration-addpersonalcredit-dialog
  2. CLICK Open the eleave-wf-leavebalancesadmimistration-addpersonalcredit-dialog
  3. SNAPSHOT — confirm the target element for: Attempt to add credits without filling in any mandatory fields
  4. CLICK Attempt to add credits without filling in any mandatory fields
- **Expected result:** The system prevents the user from adding credits and indicates that all mandatory fields must be filled
- **Assertions:**
  - [x] ASSERT (BLOCKING) The system prevents the user from adding credits and indicates that all mandatory fields must be filled

---

## Teardown
- Log out of the admin portal after test completion (optional for automated runs).
