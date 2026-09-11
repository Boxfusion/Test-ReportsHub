# Bug: a draft change request cannot be deleted or re-typed, permanently blocking post-registration changes

**Date:** 2026-08-21
**Severity:** Medium–High
**Status:** Open — verified
**Portal:** Public (submitter)
**Found in:** NPO-10P TC-10-006 (ADO #101767)
**Records:** `POST1424/21/08/2026` on NPO `333-022-NPO`

## Summary
Once a Post Registration change request exists in Draft, the product blocks any new one and tells the user to
**delete it** — but no delete action exists anywhere in the UI. The change **type** is also locked after the first
step. So a user who selects the wrong change type is permanently unable to raise the change they actually need.

## Steps to reproduce
1. Public portal → a registered NPO → **Post Registration** → **Initiate Post Registration**.
2. On *Post Registration Details*, choose any **Type Of Change** and press **Next**.
3. Leave the wizard without submitting.
4. Return to **Post Registration**.

## Actual
- **Initiate Post Registration** is `disabled`, with:
  > *"Oops you it seems already have a change request that either left on Draft or one that is still Inprogress. If
  > it's in progress please follow up with the NPO administrators to action it. If you have one on Draft please go
  > back to the dashboard to complete and submit that change request **or delete it so you can create a new one!**"*
- The change-request row's **only** action is a **view** link
  (`public--portal-change-request-details?id=…`). There is **no delete control on the row**.
- The details page offers no delete either — its only controls are *Re-Send* (correspondence) and tab navigation.
- Reopening the draft and returning to *Post Registration Details* shows **all four Type Of Change radios
  `disabled: true`**, so the type cannot be corrected in place.

## Expected
Either a delete/withdraw action for a Draft change request, or the ability to change the type while still in Draft.
The blocking message should not instruct the user to perform an action the product does not offer.

## Impact
A wrong selection at step 1 is unrecoverable by the user. Post-registration changes are how an NPO keeps its
statutory details current under s.19(1) of the NPO Act, so being locked out of them is not cosmetic. Both QA
registered NPOs (`333-019-NPO`, `333-022-NPO`) are currently in this state and need a developer to clear the drafts.

## Notes
- The **resume** half of the message does work — the dashboard shows a **Draft Post Registration** marker that
  reopens the wizard, so only the delete instruction is unsupported.
- The guideline text says you cannot request *"a change of the same type as one already being reviewed"*, but the
  guard blocks **any** new request regardless of type — broader than the stated rule.
- Message typo: *"Oops you it seems already have"*.
