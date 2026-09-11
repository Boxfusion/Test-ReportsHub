# Test Plan: Verify Comments Field Is Mandatory For Negative Actions

> **Status:** Ready
> **Owner:** QA
> **Last Updated:** 2026-07-15
> **Estimated Duration:** 150s

## Metadata
| Field | Value |
|-------|-------|
| App URL | https://pd-approvals-adminportal-qa.azurewebsites.net/ |
| Environment | QA |
| Login As (Initiator & Signatory) | Ian / 123qwe |
| ADO Plan | [#100853](https://dev.azure.com/boxfusion/pd-approvals/_testPlans/define?planId=100853&suiteId=100854) |
| ADO Suite | #100854 |
| ADO Test Case | [#105893](https://dev.azure.com/boxfusion/pd-approvals/_workitems/edit/105893) — Verify Comments field is mandatory for negative actions |

> **Note (self-referential flow):** Unlike the other test cases in this suite, ADO explicitly routes the memo to Ian himself — both the CC field and the routing Signatory are "Ian", not Craig. Ian therefore acts as his own approver: after submitting as initiator, he logs back in (a fresh session, per ADO's separate "Login as approver" step) and reviews his own item from the Inbox.
>
> **Note:** ADO's steps do not include editing the routing row's Required Action (unlike #104791/#105864/etc., which explicitly set it to "Recommend") — this plan leaves Required Action at its default. ADO step 19 expects a "Do Not Recommend" radio to be available regardless, implying "Recommend" may be the default Required Action for a New Referrals routing row (unconfirmed until run live).
>
> **Note:** ADO's steps do not include a "record Ref No" step (unlike other test cases in this suite) — this plan still captures it internally (a script-only bookkeeping detail, not a manual test step) purely to reliably locate the item afterward; it does not change any user-facing behavior under test.
>
> **Note:** The header's view-mode Live/Ready/Latest control used in sibling test cases is not mentioned in this ADO test case's steps — omitted here to follow ADO literally.

## Objective
> Validate that when a signatory selects a negative review action ("Do Not Recommend") on a routed memo, the Comments field becomes mandatory, and submitting without comments shows a validation error rather than succeeding.

## Preconditions
- [ ] App is reachable at https://pd-approvals-adminportal-qa.azurewebsites.net/
- [ ] Initiator/signatory credentials are valid (Ian / 123qwe)
- [ ] Ian has permission to create a new Referral memo and route it to himself

## Test Cases

### TC-01 — Verify Comments Field Is Mandatory For Negative Actions (ADO #105893)

- **Type:** Negative path
- **Steps:**
  1. LOGIN to the system as initiator (Ian)
  2. CLICK the Toggle from the top-left corner of the screen
  3. CLICK the Workflows dropdown
  4. CLICK the My Items menu item
  5. CLICK the Create New button
  6. CLICK the New Referrals subtype
  7. POPULATE all mandatory fields and under the CC field ADD "Ian"
  8. ACTION the memo through Compose → Attachments → Routing
  9. CLICK the Select Signatory dropdown
  10. SELECT "Ian" as a signatory
  11. CLICK the Add button
  12. CLICK the Submit button
  13. LOG IN as approver (Ian, fresh session)
  14. CLICK the Workflows dropdown
  15. CLICK the Inbox menu item
  16. OPEN the item that was assigned to the signatory above
  17. CLICK on Memo Action(s)
  18. SELECT the "Do Not Recommend" radio button
  19. CLICK the Submit button (without populating Comments)
- **Expected result:** Ian's memo is created, routed to himself as signatory, and submitted successfully. Logging back in as Ian, the item is found in the Inbox and opens successfully. The Memo Action screen shows action buttons; selecting "Do Not Recommend" selects the radio and marks the Comments field with a mandatory asterisk. Clicking Submit without populating Comments shows a "Comments are mandatory" validation message instead of succeeding.
- **Assertions:**
  - [x] ASSERT (BLOCKING) Ian successfully logs into the system (landing page with menu items)
  - [x] ASSERT (BLOCKING) Ian is added to the routing table as the signatory
  - [x] ASSERT (BLOCKING) Submitting shows a success confirmation
  - [x] ASSERT (BLOCKING) Ian successfully logs back into the system
  - [x] ASSERT (BLOCKING) The submitted item is found in Ian's Inbox and opens successfully
  - [x] ASSERT (BLOCKING) Selecting "Do Not Recommend" checks the radio and marks Comments as mandatory
  - [x] ASSERT (BLOCKING) Submitting without Comments shows a "Comments are mandatory" validation message and does not submit

---

## Teardown
- Log out of the admin portal after test completion (optional for automated runs).
