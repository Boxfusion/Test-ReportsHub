# Test Plan: Verify New Draft Version Creation

> **Status:** Ready
> **Owner:** QA
> **Last Updated:** 2026-07-09
> **Estimated Duration:** 210s

## Metadata
| Field | Value |
|-------|-------|
| App URL | https://pd-approvals-adminportal-qa.azurewebsites.net/ |
| Environment | QA |
| Login As (Initiator) | Craig / 123qwe |
| ADO Plan | [#100853](https://dev.azure.com/boxfusion/pd-approvals/_testPlans/define?planId=100853&suiteId=100854) |
| ADO Suite | #100854 |
| ADO Suite (alt) | [#105185](https://dev.azure.com/boxfusion/pd-approvals/_workitems/edit/105185) — "Retract" suite |
| ADO Test Case | [#105188](https://dev.azure.com/boxfusion/pd-approvals/_workitems/edit/105188) — Verify New Draft Version Creation |

> **Note (setup):** ADO's steps assume a memo with "Retracted" status already exists in Craigm's My Items. No such item exists ahead of time, so this script creates one first: log in as Craigm, submit a New Referrals memo (any available signatory), then retract it via the same Retract Memo dialog flow proven in [#105186](https://dev.azure.com/boxfusion/pd-approvals/_workitems/edit/105186), before starting the ADO-documented steps below.
>
> **Note (credentials):** ADO's step names the login "Craigm" — confirmed live this does not authenticate (silent failure, no error message, stays on login page, reproduced twice). Using "Craig" / "123qwe" instead, the working username for this display-name user across this entire suite.
>
> **Note:** A fresh login resets the view-mode control back to "Live" — the Live→Latest switch must be repeated after each login (confirmed in #104791).

## Objective
> Validate that from a Retracted memo in My Items, a user can click "Create New Version" and, after confirming a popup, the system opens the item in draft mode with an incremented reference number (V2).

## Preconditions
- [ ] App is reachable at https://pd-approvals-adminportal-qa.azurewebsites.net/
- [ ] Craigm credentials are valid (Craigm / 123qwe)
- [ ] Craigm has permission to create a new Referral memo

## Test Cases

### TC-01 — Verify New Draft Version Creation (ADO #105188)

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE to https://pd-approvals-adminportal-qa.azurewebsites.net/login and LOG IN as Initiator Craigm
  2. CLICK the view-mode control, then CLICK "Latest" in the popover
  3. CLICK the sidebar toggle
  4. EXPAND the Workflows Dropdown
  5. CLICK My Items
  6. CLICK on any item with "Retracted" status
  7. CLICK the "Create New Version" button
  8. CLICK the "OK" button on the confirmation popup
- **Expected result:** Clicking on a Retracted item shows a "Create New Version" button. Clicking it shows a popup asking "Are you sure you want to create a new version". Clicking OK causes the system to auto-refresh and open the item in draft mode with an incremented reference number (V2).
- **Assertions:**
  - [x] ASSERT (BLOCKING) Craigm successfully logs into the system
  - [x] ASSERT (BLOCKING) App header switches from "Live" to "Latest" mode
  - [x] ASSERT (BLOCKING) The Workflows dropdown expands showing Inbox / Sent Items / Drafts
  - [x] ASSERT (BLOCKING) My Items index table is displayed
  - [x] ASSERT (BLOCKING) A "Create New Version" button is displayed on the Retracted item
  - [x] ASSERT (BLOCKING) Clicking it shows a confirmation popup ("Are you sure you want to create a new version")
  - [x] ASSERT (BLOCKING) Clicking OK reopens the item in draft mode with an incremented reference number (V2)

---

## Teardown
- Log out of the admin portal after test completion (optional for automated runs).
