# Test Plan: ELEAVE-APPROVE — Approve Leave Application with Full Pay

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
| ADO Plan | [#116862](https://dev.azure.com/boxfusion/pd-Hcm/_testPlans/define?planId=116862&suiteId=116924) — eLeave Regression Tests |
| ADO Suite | #116924 — Approve a leave application › Approving with Full Pay |

## Objective
> Validate that an approver can open a recommended Annual Leave application from **Workflows › Inbox**, that the **Approve with Full Pay** / **Approve without Pay** actions are gated by the review acknowledgement checkbox, and that **Approve with Full Pay** submits the application and returns to the Inbox.

## Preconditions
- [ ] App is reachable at https://pd-hcm-adminportal-qa.shesha.app/
- [ ] Approver credentials are valid (GOV022 / 123qwe)
- [ ] An Annual Leave application (SaGov Leave Application) has been recommended and is In Progress in GOV022's Inbox with Action Required **Approve Leave**
- [ ] The application has no supporting documents attached (attachments must be downloaded before the checkbox unlocks the actions)

## Test Cases

### TC-01 — Login as Approver

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE to https://pd-hcm-adminportal-qa.shesha.app/
  2. SNAPSHOT — confirm the Welcome - SHESHA login page is displayed
  3. TYPE Username field with `GOV022`
  4. TYPE Password field with `123qwe`
  5. CLICK the Sign In button
  6. WAIT for the home page to load
- **Expected result:** User is logged in and the SHESHA dashboard is displayed
- **Assertions:**
  - [x] ASSERT (BLOCKING) URL no longer contains `/login` and the Workflows menu item is visible

---

### TC-02 — 'Approve with Full Pay' is disabled until the acknowledgement checkbox is ticked (ADO #116928)

*Negative / validation: the approval actions are gated by the acknowledgement checkbox. Runs before TC-03 because TC-03 removes the item from the Inbox.*

- **Type:** Negative
- **Steps:**
  1. SNAPSHOT — confirm the Workflows menu item
  2. CLICK Workflows in the side menu, then CLICK **Inbox**
  3. ASSERT the Incoming Items page shows the pending leave application
  4. SNAPSHOT — confirm the SaGov Leave Application row with Action Required **Approve Leave**
  5. CLICK the view (magnifier) icon on that row
  6. ASSERT the Approve Leave page opens with the acknowledgement checkbox unticked
  7. ASSERT **Approve without Pay** and **Approve with Full Pay** are disabled; **Close**, **Send Back** and **Not Approve** are enabled
  8. ASSERT clicking **Approve with Full Pay** submits nothing (button is disabled) and the status stays **In Progress**
  9. CLICK the acknowledgement checkbox to tick it
  10. ASSERT both Approve buttons become enabled
  11. CLICK the acknowledgement checkbox again to untick it
- **Expected result:** Approve buttons are enabled when the checkbox is ticked and return to disabled when unticked
- **Assertions:**
  - [x] ASSERT (BLOCKING) After unticking, **Approve without Pay** and **Approve with Full Pay** are disabled again

---

### TC-03 — Approver can approve an Annual Leave application with Full Pay from the Workflows Inbox (ADO #116927)

*End-to-end happy path. Precondition: an Annual Leave application is In Progress with action 'Approve Leave' assigned to the approver and has no supporting documents.*

- **Type:** Happy path
- **Steps:**
  1. SNAPSHOT — confirm the Workflows menu item
  2. CLICK Workflows in the side menu, then CLICK **Inbox**
  3. ASSERT the Incoming Items page shows the leave application with Type `SaGov Leave Application`, Action Required `Approve Leave` and Status `In Progress`
  4. EXTRACT the Ref No of that row
  5. CLICK the view (magnifier) icon on that row
  6. ASSERT the Approve Leave page opens with a title showing leave duration, type, applicant and dates, status **In Progress**, and a Ref No matching the Inbox row
  7. ASSERT the Leave Application Details section shows applicant details, leave category, dates, available balance and the leave calendar
  8. CLICK the acknowledgement checkbox ("I acknowledge that I have reviewed the leave application along with any accompanying supporting documents")
  9. ASSERT **Approve without Pay** and **Approve with Full Pay** are enabled
  10. CLICK **Approve with Full Pay**
  11. ASSERT a "Successfully Submitted" notification is shown
- **Expected result:** User is returned to the Workflows Inbox and the approved leave application no longer appears in Incoming Items
- **Assertions:**
  - [x] ASSERT (BLOCKING) User is on the Workflows Inbox and the extracted Ref No is no longer listed

---

## Teardown
- The approved application is final; cancel it through the Leave Cancellation process if the dates need to be reused.
