# Test Plan: Verify Successful Retract Functionality

> **Status:** Ready
> **Owner:** QA
> **Last Updated:** 2026-07-09
> **Estimated Duration:** 180s

## Metadata
| Field | Value |
|-------|-------|
| App URL | https://pd-approvals-adminportal-qa.azurewebsites.net/ |
| Environment | QA |
| Login As (Initiator) | Ian / 123qwe |
| Login As (Non-initiator) | Craigm / 123qwe |
| ADO Plan | [#100853](https://dev.azure.com/boxfusion/pd-approvals/_testPlans/define?planId=100853&suiteId=100854) |
| ADO Suite | #100854 |
| ADO Test Case | [#105186](https://dev.azure.com/boxfusion/pd-approvals/_workitems/edit/105186) — Verify successful retract functionality |
| ADO Suite (alt) | [#105185](https://dev.azure.com/boxfusion/pd-approvals/_workitems/edit/105185) — "Retract" suite |

> **Note (credentials):** ADO's step 1 names the non-initiator login "Craigm" — confirmed live (2026-07-09) this silently fails to authenticate (stays on login page, no error), matching the same finding already documented in the sibling plan [verify-new-draft-version-creation.md](verify-new-draft-version-creation.md). Using "Craig" / "123qwe" instead, the working username for this display-name user across this entire suite. `.spec.ts` updated accordingly.

> **Note (setup):** ADO's steps assume a submitted, "In Progress" memo already exists — this plan creates one first (Ian submits a New Referrals memo with Craig as routing signatory) using the proven submission flow from [#102699](https://dev.azure.com/boxfusion/pd-approvals/_workitems/edit/102699), then uses it for both halves of this test.
>
> **Note (two-part test):** ADO's step ordering places the negative check first: login as Craig (a non-initiator/approver) and open the submitted item — the Retract button must NOT be visible to him. Only the initiator (Ian) should see it. This plan performs the setup submission first (as Ian), then checks the negative case (as Craig), then logs back in as Ian to perform the actual retract.
>
> **Note:** "Retract" (this test, for an already-submitted "In Progress" item, accessed from My Items) is a distinct feature from "Withdraw" (confirmed in [#102660](https://dev.azure.com/boxfusion/pd-approvals/_workitems/edit/102660), for a still-in-wizard Draft item, accessed from the Compose step). Do not conflate the two dialogs/buttons.
>
> **Note:** A fresh login resets the view-mode control back to "Live" — the Live→Latest switch must be repeated after each login (confirmed in #104791).
>
> **Note:** Confirmed live — the Workflows sidebar flyout (Inbox/My Items/Sent Items/Drafts) can remain open/mounted over the My Items table after a fresh page navigation, if the mouse is still hovering near the sidebar icon that triggers it. This intercepted the search input. Fixed by moving the mouse away and waiting briefly (with an Escape-key fallback) before interacting with the search field.
>
> **Note:** Confirmed live — logging out via an unscoped page-wide `getByText(/craig m/i)` can silently click the wrong occurrence, since a memo's own content (routing table, CC line) can also contain the logged-in user's display name (e.g. "Craig M: Sales Director"). Fixed by scoping the click to the header bar specifically (the same row as the view-mode control), which is always unique.
>
> **Note (spec structure):** The `.spec.ts` STEP comments are numbered 1-9 to match ADO test case #105186's own step list exactly, in ADO's displayed order (step ids 2, 9, 10, 3, 4, 5, 6, 7, 8 — not numeric id order). A SETUP block precedes STEP 1 since ADO's steps assume a submitted "In Progress" memo already exists, which this script must create first.

## Objective
> Validate that only the initiator of a submitted, in-progress memo can see and use the Retract button (from My Items) to terminate the workflow, and that doing so — after confirming via a comment-required dialog — changes the item's status to "Retracted".

## Preconditions
- [ ] App is reachable at https://pd-approvals-adminportal-qa.azurewebsites.net/
- [ ] Initiator credentials are valid (Ian / 123qwe)
- [ ] Non-initiator (approver) credentials are valid (Craig / 123qwe)
- [ ] The initiator has permission to create a new Referral memo

## Test Cases

### TC-01 — Verify Successful Retract Functionality (ADO #105186)

- **Type:** Happy path + negative-permission check
- **Steps:**
  1. NAVIGATE to https://pd-approvals-adminportal-qa.azurewebsites.net/login and log in as Ian (initiator)
  2. SUBMIT a New Referrals memo with Craig M as the routing signatory; RECORD the Ref No
  3. LOG OUT of Ian's session and LOG IN as Craig (non-initiator)
  4. OPEN the submitted item from Craig's Inbox
  5. ASSERT no Retract button is visible to Craig
  6. LOG OUT of Craig's session and LOG IN as Ian (initiator) again
  7. CLICK the view-mode control, then CLICK "Latest"
  8. CLICK the sidebar toggle
  9. EXPAND the Workflows dropdown
  10. CLICK My Items
  11. LOCATE the item (matching the recorded Ref No) with "In Progress" status
  12. CLICK the Retract button
  13. POPULATE Comments on the Retract Memo dialog
  14. CLICK the Retract button on the dialog
- **Expected result:** The Retract button is visible only to the initiator (Ian), not to Craig. From My Items, clicking Retract on an In Progress item opens a Retract Memo dialog requiring comments; confirming it terminates the workflow and changes the item's status to "Retracted".
- **Assertions:**
  - [x] ASSERT (BLOCKING) Ian successfully logs into the system and submits the memo
  - [x] ASSERT (BLOCKING) Craig successfully logs into the system and opens the submitted item
  - [x] ASSERT (BLOCKING) No Retract button is visible to Craig (non-initiator)
  - [x] ASSERT (BLOCKING) Ian successfully logs back into the system
  - [x] ASSERT (BLOCKING) App header switches from "Live" to "Latest" mode
  - [x] ASSERT (BLOCKING) My Items shows the submitted item with "In Progress" status and a visible Retract button
  - [x] ASSERT (BLOCKING) Clicking Retract shows a Retract Memo dialog requiring Comments
  - [x] ASSERT (BLOCKING) Confirming Retract changes the item's status to "Retracted"

---

## Teardown
- Log out of the admin portal after test completion (optional for automated runs).
