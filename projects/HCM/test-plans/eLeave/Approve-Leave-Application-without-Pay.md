# Test Plan: ELEAVE-APPROVE-WITHOUT-PAY — Approve Leave Application without Pay

> **Status:** Ready
> **Owner:** QA
> **Last Updated:** 2026-09-30
> **Estimated Duration:** 90s

## Metadata
| Field | Value |
|-------|-------|
| App URL | https://pd-hcm-adminportal-qa.shesha.app/ |
| Environment | QA |
| Login As | GOV022 / 123qwe (approver) |
| ADO Plan | [#116862](https://dev.azure.com/boxfusion/pd-Hcm/_testPlans/define?planId=116862&suiteId=116925) — eLeave Regression Tests |
| ADO Suite | #116925 — Approve a leave application › Approving without Pay |

## Objective
> Validate that an approver can approve a leave application **without pay** from the Workflows Inbox — acknowledgement gating of **Approve without Pay**, the **Approve Without Pay** comments dialog, submission, and the return to the Inbox.

## Preconditions
- [ ] App is reachable at https://pd-hcm-adminportal-qa.shesha.app/
- [ ] Approver credentials are valid (GOV022 / 123qwe)
- [ ] A recommended leave application is In Progress in GOV022's Inbox with Action Required **Approve Leave**
- [ ] The application has no supporting documents attached

## Test Cases

### TC-01 — Login as Approver

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE to https://pd-hcm-adminportal-qa.shesha.app/login
  2. SNAPSHOT — confirm the login page is displayed with Username and Password fields and a Sign In button
  3. TYPE Username field with `GOV022`
  4. TYPE Password field with `123qwe`
  5. CLICK the Sign In button
  6. WAIT for the home page to load
- **Expected result:** User is signed in and the dashboard is displayed
- **Assertions:**
  - [x] ASSERT (BLOCKING) URL no longer contains `/login` and the Workflows menu item is visible

---

### TC-02 — 'Approve without Pay' is disabled until the acknowledgement checkbox is ticked (ADO #116934)

*Runs before TC-03 because TC-03 removes the item from the Inbox.*

- **Type:** Negative
- **Steps:**
  1. SNAPSHOT — confirm the Workflows menu item
  2. CLICK Workflows in the side menu, then CLICK **Inbox**
  3. ASSERT the Workflows Inbox is displayed with at least one pending leave application
  4. SNAPSHOT — confirm the SaGov Leave Application row with Action Required **Approve Leave**
  5. CLICK the view (magnifier) icon on that row
  6. ASSERT the application details page opens and the acknowledgement checkbox is unticked
  7. ASSERT **Approve without Pay** is disabled and no approval dialog is open
  8. CLICK the acknowledgement checkbox to tick it
  9. ASSERT **Approve without Pay** becomes enabled
  10. CLICK the acknowledgement checkbox again to untick it
- **Expected result:** Approve without Pay returns to the disabled state
- **Assertions:**
  - [x] ASSERT (BLOCKING) After unticking, **Approve without Pay** is disabled

---

### TC-03 — Approver can approve a leave application Without Pay from the Workflows Inbox (ADO #116933)

- **Type:** Happy path
- **Steps:**
  1. SNAPSHOT — confirm the Workflows menu item
  2. CLICK Workflows in the side menu, then CLICK **Inbox**
  3. ASSERT the Workflows Inbox (Incoming Items) is displayed and the pending leave application is listed
  4. EXTRACT the Ref No of the SaGov Leave Application row with Action Required **Approve Leave**
  5. CLICK the view (magnifier) icon on that row
  6. ASSERT the leave application details page opens showing applicant, leave type, dates and the approval actions
  7. CLICK the acknowledgement checkbox
  8. CLICK **Approve without Pay**
  9. ASSERT the **Approve Without Pay** dialog opens with a Comment field and **OK** / **Cancel** buttons
  10. TYPE the comment field with `Testing not approved`
  11. CLICK **OK**
  12. ASSERT the dialog closes and a "Successfully Submitted" notification is displayed
- **Expected result:** User is redirected to the refreshed Incoming Items list and the actioned application no longer appears in the Inbox
- **Assertions:**
  - [x] ASSERT (BLOCKING) User is on the Workflows Inbox and the extracted Ref No is no longer listed

---

## Teardown
- The application is approved without pay (the applicant must then acknowledge it; see `acknowledge-leave-approved-without-pay.md`).
