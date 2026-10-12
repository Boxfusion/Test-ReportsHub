# Test Plan: ELEAVE-CANCELLATION-WF — Leave Cancellation Workflow (end-to-end)

> **Status:** Ready
> **Owner:** QA
> **Last Updated:** 2026-10-05
> **Estimated Duration:** 420s

## Metadata
| Field | Value |
|-------|-------|
| App URL | https://pd-hcm-adminportal-qa.shesha.app/ |
| Environment | QA |
| Login As | GOV003 / 123qwe (applicant), GOV012 / 123qwe (recommender), GOV022 / 123qwe (approver) |

## Objective
> Validate the full **Leave Cancellation** workflow: an applicant cancels an **approved** leave application, the recommender recommends the cancellation, the approver approves it, and the cancellation completes with the original application marked **Cancelled**.

## Preconditions
- [ ] App is reachable at https://pd-hcm-adminportal-qa.shesha.app/
- [ ] Applicant, recommender and approver credentials are valid (GOV003 / GOV012 / GOV022, password `123qwe`)
- [ ] GOV003 has an Annual Leaves balance, with GOV012 as recommender and GOV022 as approver in the organisational structure
- [ ] GOV003 has free weekdays left in the current leave cycle (the spec picks a random future date and retries on overlap)

> **Note:** Cancelling a leave application that is still **In Progress** (not yet approved) completes the cancellation immediately — no recommend / approve steps. This plan therefore takes the application through recommendation and approval first. Test cases run **serially** and share the application / cancellation reference numbers; a failed TC skips the rest.

## Test Cases

### TC-01 — Applicant submits a future dated leave application

*Applicant GOV003 captures an Annual Leave application for a future weekday (same flow as `capture-new-leave-application.md` TC-03).*

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE to https://pd-hcm-adminportal-qa.shesha.app/login and log in as `GOV003` / `123qwe`
  2. CLICK Workflows in the side menu, then CLICK **My Items**
  3. CLICK the **Create New** button, then CLICK **New Leave Application**
  4. SELECT **Category** — choose `Annual Leaves`
  5. SELECT **Sub-Category** — choose `Annual Leaves`
  6. CLICK the **Days** radio on the Duration field
  7. TYPE Start Date and End Date with the same future weekday in the current year (pick a new date if the overlap error is shown)
  8. TYPE Address with `265 West Avenue`
  9. CLICK the certification checkbox
  10. CLICK the **Submit** button
  11. CLICK **Don't Delegate** on the Delegate pop-up
  12. EXTRACT the Ref No (`LA…`) of the top SaGov Leave Application row in My Items
- **Expected result:** The leave application is submitted and listed In Progress in My Items
- **Assertions:**
  - [x] ASSERT (BLOCKING) The user is on My Items and the top row is an In Progress SaGov Leave Application

---

### TC-02 — Recommender recommends the leave application

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE to https://pd-hcm-adminportal-qa.shesha.app/login and log in as `GOV012` / `123qwe`
  2. NAVIGATE to Workflows › **Inbox**
  3. SNAPSHOT — confirm the row with the TC-01 Ref No and Action Required **Recommend Leave**
  4. CLICK the magnifying glass (search) icon on that row
  5. ASSERT the "Recommend Leave: …" detail view opens
  6. CLICK the acknowledgement checkbox
  7. CLICK the **Recommend** button
- **Expected result:** The application is recommended and routed to the approver
- **Assertions:**
  - [x] ASSERT (BLOCKING) "Successfully Submitted" is shown and the user is back on the Incoming Items view

---

### TC-03 — Approver approves the leave application with full pay

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE to https://pd-hcm-adminportal-qa.shesha.app/login and log in as `GOV022` / `123qwe`
  2. NAVIGATE to Workflows › **Inbox**
  3. SNAPSHOT — confirm the row with the TC-01 Ref No and Action Required **Approve Leave**
  4. CLICK the magnifying glass (search) icon on that row
  5. ASSERT the "Approve Leave: …" detail view opens
  6. CLICK the acknowledgement checkbox
  7. CLICK the **Approve with Full Pay** button
- **Expected result:** The leave application is approved
- **Assertions:**
  - [x] ASSERT (BLOCKING) "Successfully Submitted" is shown and the user is back on the Incoming Items view

---

### TC-04 — Applicant cancels the approved leave application

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE to https://pd-hcm-adminportal-qa.shesha.app/login and log in as `GOV003` / `123qwe`
  2. NAVIGATE to Workflows › **My Items**
  3. CLICK the magnifying glass (search) icon on the row with the TC-01 Ref No
  4. ASSERT the "SaGov Leave Application: …" details view opens
  5. CLICK the **Cancel Leave** button
  6. ASSERT the **Cancel Leave** dialog is shown with "You are about to cancel this leave application. Please provide comments."
  7. TYPE the comments box with `Cancel leave - regression test`
  8. CLICK **OK**
  9. ASSERT "Successfully cancelled the leave" is shown
  10. NAVIGATE to Workflows › **My Items**
  11. EXTRACT the Ref No (`LC:…`) of the top In Progress SaGov Leave Cancellation row for the same leave
- **Expected result:** A leave cancellation workflow is started and routed to the recommender
- **Assertions:**
  - [x] ASSERT (BLOCKING) A SaGov Leave Cancellation for the leave is listed In Progress in My Items

---

### TC-05 — Recommender recommends the cancellation

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE to https://pd-hcm-adminportal-qa.shesha.app/login and log in as `GOV012` / `123qwe`
  2. NAVIGATE to Workflows › **Inbox**
  3. SNAPSHOT — confirm the row with the TC-04 cancellation Ref No and Action Required **Recommends Cancellation**
  4. CLICK the magnifying glass (search) icon on that row
  5. ASSERT the "Recommends Cancellation: …" detail view opens with **Close**, **Decline Cancellation** and **Recommend Cancellation** buttons
  6. CLICK the **Recommend Cancellation** button
- **Expected result:** The cancellation is recommended and routed to the approver
- **Assertions:**
  - [x] ASSERT (BLOCKING) "Successfully Submitted" is shown and the user is back on the Incoming Items view

---

### TC-06 — Approver approves the cancellation

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE to https://pd-hcm-adminportal-qa.shesha.app/login and log in as `GOV022` / `123qwe`
  2. NAVIGATE to Workflows › **Inbox**
  3. SNAPSHOT — confirm the row with the TC-04 cancellation Ref No and Action Required **Approve Leave Cancellation**
  4. CLICK the magnifying glass (search) icon on that row
  5. ASSERT the "Approve Leave Cancellation: …" detail view opens with **Close**, **Decline Cancellation** and **Approve Cancellation** buttons
  6. CLICK the **Approve Cancellation** button
- **Expected result:** The cancellation is approved
- **Assertions:**
  - [x] ASSERT (BLOCKING) "Successfully Submitted" is shown and the user is back on the Incoming Items view

---

### TC-07 — Cancellation is completed and the application is cancelled

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE to https://pd-hcm-adminportal-qa.shesha.app/login and log in as `GOV003` / `123qwe`
  2. NAVIGATE to Workflows › **My Items**
  3. SNAPSHOT — confirm the cancellation and application rows
- **Expected result:** The cancellation workflow is completed and the original leave application is cancelled
- **Assertions:**
  - [x] ASSERT (BLOCKING) The TC-04 cancellation row shows status **Cancellation Completed**
  - [ ] ASSERT The TC-01 application row shows status **Cancelled**

---

## Teardown
- None — the leave is cancelled by the flow itself, which frees the date and restores the balance.
