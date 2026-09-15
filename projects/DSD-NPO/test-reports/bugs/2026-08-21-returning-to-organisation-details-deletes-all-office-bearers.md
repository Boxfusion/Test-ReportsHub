# Bug: navigating back through Organisation Details deletes every office bearer captured on a draft application

**Date:** 2026-08-21
**Severity:** **Critical** — silent, unrecoverable data loss
**Status:** Open — reproduced twice under controlled conditions
**Portal:** Public (submitter) — registration wizard
**Found in:** incidental to NPO-05 TC-05-013 (ADO #101689); blocks that case
**Record:** draft application `APPL26-00793`, NPO `61feb3a6-3d43-4824-9a56-47bab3e604fb`

## Summary
On the registration wizard, going **back** to *Organisation Details* and then forward again **deletes every office
bearer already captured** on Tab 4. The records are removed from the database, not merely hidden. There is **no
warning, no confirmation and no error** — the user only discovers it on reaching Tab 4 again.

Because Tab 4 requires **a minimum of 3 office bearers** before `Next` enables, a submitter who steps back to correct
anything on Organisation Details silently loses all their office-bearer work and must re-capture it from scratch.

## Reproduction — two controlled runs, same result

### Run A (with an edit)
1. Draft at Tab 4 with **1 office bearer** — grid shows 1, API `NpoOfficeBearer/Crud/GetAll?filter=organisation eq <npoId>` → **totalCount 1**
2. **Back** ×2 to *Organisation Details*
3. Change **Legal Form** to `NPC`, change it back to `Voluntary Association`
4. **Next** → *Objectives* → **Next** → *Office Bearer*
5. **Result: grid empty, API totalCount 0**

### Run B (control — no edits at all)
1. Draft at Tab 4 with **1 office bearer** — grid shows 1, API → **totalCount 1**
2. **Back** ×2 to *Organisation Details*
3. **Touch nothing**
4. **Next** → *Objectives* → **Next** → *Office Bearer*
5. **Result: grid empty, API totalCount 0**

⇒ Run B rules out the Legal Form change as the cause. **The mere Back → Next round trip is sufficient.**

## Evidence
- The grid and the API agree at every step, so this is not a rendering fault. The API call is the same one the page
  itself issues (`NpoOfficeBearer/Crud/GetAll` filtered on `organisation`).
- The parent NPO record reports `numberOfOfficeBearers: 0` afterwards.
- No `4xx`/`5xx` is surfaced to the user; the wizard behaves as though nothing happened.

## Impact
- **Silent data loss on the primary registration journey.** Capturing 3 office bearers is the most laborious part of
  the wizard (each requires an ID/passport lookup, address, contact details and position).
- The loss is **unrecoverable** — there is no undo and no draft history.
- It is **easy to trigger accidentally**: correcting a typo on Organisation Details is a completely normal action.
- It compounds the existing finding that a draft always **reopens at Tab 1** and the step rail is not clickable
  (`2026-08-21 smoke re-run part 2`, TC-05-029) — a user resuming a draft must press Next through Organisation
  Details to get anywhere, which is exactly the gesture that destroys their office bearers.

## Not yet isolated
Both runs pressed `Next` twice (Organisation Details → Objectives → Office Bearer). I did **not** determine which of
the two saves performs the delete, nor whether the same happens on a draft that has never been submitted-and-resumed.
Worth pinning down before the fix, but it does not affect the severity.

## Likely explanation for an earlier observation
This almost certainly explains the two office bearers that vanished from this same draft between the 08-20 and 08-21
sessions. That was originally noticed as an unexplained overnight loss; it was in fact caused by pressing `Next` on
Organisation Details at the start of the 08-21 run.
