# Test Plan: ELEAVE-SEND-BACK — Send Back Dialog

> **Status:** Ready
> **Owner:** QA
> **Last Updated:** 2026-10-08
> **Estimated Duration:** 300s

## Metadata
| Field | Value |
|-------|-------|
| App URL | https://pd-hcm-adminportal-qa.shesha.app/ |
| Environment | QA |
| Login As | GOV012 / 123qwe (Leave recommender); GOV003 / 123qwe (Leave applicant) for SEED and the TC-05 check |
| ADO Plan | [#79625](https://dev.azure.com/boxfusion/pd-Hcm/_testPlans/define?planId=79625&suiteId=86588) |
| ADO Suite | #86588 — eleave-wf-sendback-dialogbox |

## Objective
> Validate the **Send Back** dialog of eLeave on the **Recommend Leave** step — the mandatory-comments enforcement, the Cancel and Close (X) actions (dismiss the dialog and re-display the leave application details), and the OK action (sends the leave application back to the selected step).

## Preconditions
- [ ] App is reachable at https://pd-hcm-adminportal-qa.shesha.app/
- [ ] Leave recommender (GOV012 / 123qwe) and leave applicant (GOV003 / 123qwe) credentials are valid
- [ ] GOV003 has Annual Leave days available in the current cycle
- [ ] TC-05 consumes the seeded application (it is sent back to GOV003), so it runs last. TC-02–TC-04 only open and dismiss the dialog.

## Setup — SEED (runs once, before the TCs)

The plan creates its own application instead of using whatever item tops GOV012's Inbox — several other eLeave plans leave Recommend Leave items there, and their workflow history differs. Annual Leave needs no supporting document, so it goes straight from capture to GOV012's **Recommend Leave** step.

A failure anywhere in SEED blocks every TC. In the report this means **blocked by setup**, not a defect in the Send Back dialog — diagnose it with `capture-new-leave-application`.

1. NAVIGATE to https://pd-hcm-adminportal-qa.shesha.app/login and log in as `GOV003` / `123qwe`
2. CLICK Workflows in the side menu, then CLICK **My Items**
3. CLICK **Create New**, then CLICK **New Leave Application**
4. SELECT Category `Annual Leaves` and Sub-Category `Annual Leaves`
5. CLICK the **Days** radio on the Duration field
6. TYPE Start Date and End Date with the same **future** weekday, picked at random between 7 days from today and the end of the current year. If "There are overlaps with existing leave requests" is shown, pick a new date (up to 5 attempts)
7. TYPE Address with `265 West Avenue`
8. CLICK the certification checkbox, then CLICK **Submit**
9. CLICK **Don't Delegate** on the Delegate pop-up
10. ASSERT (BLOCKING) the user is back on the My Items index view
11. EXTRACT the Ref No of the new application from the **SaGov Leave Application** row on My Items, matching the leave dates entered in step 6. Save it as `SEED_REF`

## Test Cases

### TC-01 — Login as Leave Recommender (GOV012)

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE to https://pd-hcm-adminportal-qa.shesha.app/login
  2. SNAPSHOT — confirm login page is visible
  3. TYPE Username field with `GOV012`
  4. TYPE Password field with `123qwe`
  5. CLICK the Sign In button
  6. WAIT for the home page to load
- **Expected result:** User is logged in and the Workflows menu is reachable
- **Assertions:**
  - [x] ASSERT (BLOCKING) URL no longer contains `/login` and the Workflows menu item is visible

---

### TC-02 — System should not allow sending back a leave application without comments (ADO #86592)

*The system should not allow a user to send back a leave application without populating comments*

- **Type:** Negative
- **Steps:**
  1. NAVIGATE to Workflows › Inbox (`/dynamic/Shesha.Workflow/workflows-inbox`)
  2. TYPE `SEED_REF` in the Inbox search and WAIT for its SaGov Leave Application row with Action Required **Recommend Leave** (re-search until it appears, up to 90s)
  3. CLICK the magnifying glass (search) icon on that row
  4. ASSERT the Recommend Leave details are displayed (`Recommend Leave:` and `Ref No: SEED_REF`)
  5. SNAPSHOT — confirm the Send Back button
  6. CLICK the Send Back button
  7. ASSERT the 'Send Back' dialog is displayed with a required **Step** picker and a required **Comments** field
  8. CLICK the Step picker (`Select a User Task`) and CLICK the **New Leave Application** step (the step list loads after the picker opens — reopen it if the option hasn't appeared within 10s)
  9. SNAPSHOT — confirm the OK button (Comments left empty)
  10. CLICK the OK button
- **Expected result:** The system prevents the leave application from being sent back and indicates that comments are required
- **Assertions:**
  - [x] ASSERT (BLOCKING) "This field is required" is shown under Comments and the 'Send Back' dialog stays open

---

### TC-03 — Close the dialog when the 'Cancel' button is clicked (ADO #86594)

*When a user clicks on the 'Close' button, the system should close the dialog and display the leave application details*

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE to Workflows › Inbox (`/dynamic/Shesha.Workflow/workflows-inbox`)
  2. TYPE `SEED_REF` in the Inbox search and WAIT for its SaGov Leave Application row with Action Required **Recommend Leave** (re-search until it appears, up to 90s)
  3. CLICK the magnifying glass (search) icon on that row
  4. ASSERT the Recommend Leave details are displayed (`Recommend Leave:` and `Ref No: SEED_REF`)
  5. SNAPSHOT — confirm the Send Back button
  6. CLICK the Send Back button
  7. ASSERT the 'Send Back' dialog is displayed with a required **Step** picker and a required **Comments** field
  8. SNAPSHOT — confirm the Cancel button in the dialog
  9. CLICK the Cancel button
- **Expected result:** The dialog is closed
- **Assertions:**
  - [x] ASSERT (BLOCKING) The 'Send Back' dialog is no longer visible

---

### TC-04 — Display leave application details when the 'Close' (X) button is clicked (ADO #86595)

*When a user clicks on the 'Close' button, the system should close the dialog and display the leave application details*

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE to Workflows › Inbox (`/dynamic/Shesha.Workflow/workflows-inbox`)
  2. TYPE `SEED_REF` in the Inbox search and WAIT for its SaGov Leave Application row with Action Required **Recommend Leave** (re-search until it appears, up to 90s)
  3. CLICK the magnifying glass (search) icon on that row
  4. ASSERT the Recommend Leave details are displayed (`Recommend Leave:` and `Ref No: SEED_REF`)
  5. SNAPSHOT — confirm the Send Back button
  6. CLICK the Send Back button
  7. ASSERT the 'Send Back' dialog is displayed with a required **Step** picker and a required **Comments** field
  8. SNAPSHOT — confirm the Close (X) button in the dialog header
  9. CLICK the Close (X) button
- **Expected result:** The dialog closes and the leave application details are displayed
- **Assertions:**
  - [x] ASSERT (BLOCKING) The 'Send Back' dialog is no longer visible, and the Recommend Leave details (same `Ref No`) and the Send Back button are still displayed

---

### TC-05 — The 'Ok' button sends the leave application back to the selected step (ADO #86590)

*When a user clicks on the 'Ok' button, the system should send the leave application back to the selected step*

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE to Workflows › Inbox (`/dynamic/Shesha.Workflow/workflows-inbox`)
  2. TYPE `SEED_REF` in the Inbox search and WAIT for its SaGov Leave Application row with Action Required **Recommend Leave** (re-search until it appears, up to 90s)
  3. CLICK the magnifying glass (search) icon on that row
  4. ASSERT the Recommend Leave details are displayed (`Recommend Leave:` and `Ref No: SEED_REF`)
  5. SNAPSHOT — confirm the Send Back button
  6. CLICK the Send Back button
  7. ASSERT the 'Send Back' dialog is displayed with a required **Step** picker and a required **Comments** field
  8. CLICK the Step picker (`Select a User Task`) and CLICK the **New Leave Application** step (the step list loads after the picker opens — reopen it if the option hasn't appeared within 10s)
  9. TYPE Comments with `Send back - regression test`
  10. CLICK the OK button
  11. ASSERT the user is returned to the Incoming Items view and the application is no longer in GOV012's Inbox
  12. Log in as GOV003 / 123qwe and NAVIGATE to Workflows › Inbox
- **Expected result:** The system sends the leave application back to the selected step
- **Assertions:**
  - [x] ASSERT (BLOCKING) The application (same `Ref No`) is in GOV003's Inbox with Action Required **New Leave Application** and status **Referred Back To Capturer**

---

## Teardown
- TC-05 leaves the seeded application in GOV003's Inbox (status **Referred Back To Capturer**). It can be resubmitted or closed from there. No cleanup is required — each run seeds a fresh application on a random future date.
- If TC-05 is skipped (an earlier TC failed), the seeded application is left at Recommend Leave in GOV012's Inbox. It does not affect later runs of this plan.
