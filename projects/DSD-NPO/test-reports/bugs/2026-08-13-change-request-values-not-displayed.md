# Bug: A change request's old and new values are stored but shown to nobody

**Date:** 2026-08-13
**Severity:** High
**Status:** Open — verified
**Portal:** Both
**Found in:** NPO-10P TC-10-006 (ADO #101767) · NPO-10A TC-10-009 (ADO #101770)
**Record:** POST1042/13/08/2026 · NPO `333-018-NPO`

## Summary
A Post Registration change request captures the requested change correctly and **saves it**, but **neither the
submitter nor the assessor is ever shown the old value beside the new one**. The DSD assessor who must approve the
change cannot see what is being changed, or that anything was changed at all.

## Two halves of the same gap

### 1. Submitter — no side-by-side (ADO #101767)
The case prescribes *"current values displayed **read-only**; new value fields **editable**"*.

**Actual:** the *Update* step renders **one editable field pre-filled with the current value**
(`Name of organisation` = `Nomfanelo QA NPO 2026-08-13`, `readOnly: false`). There is no read-only current-value
column. Once the user types over it, the original is no longer visible anywhere in the form.

### 2. Assessor — the change is not displayed at all (ADO #101770)
On `/dynamic/boxfusion.dsdnpo/public--portal-change-request-details?id=<id>` the page shows *Declarations*
(Firstname, Surname, Position), the *status*, and the *attachments* — but the **Foundational Change tab renders no
values**. Neither the old nor the new organisation name appears. Verified after expanding every tab and collapse.

## Evidence — the data IS correct
From the API the details page itself calls:
```
GET /api/dynamic/boxfusion.dsdnpo/ChangeRequest/Crud/Get?properties=…generalChangeRequestProperties{organisationName}…
{
  "generalChangeRequestProperties": {
     "organisationName": "Nomfanelo QA NPO Renamed 2026-08-13"   ← the requested NEW value
  },
  "registerOrganisationNameChange": true,
  "npo": { "name": "Nomfanelo QA NPO 2026-08-13" }               ← the OLD value
}
```
Both values are present and correct. **This is purely a presentation gap.**

## Impact
The assessor is asked to approve or decline a change they cannot see. In practice they would have to approve
blind, or go to the database. For a **name change** — which alters the public register and the NPO's certificate —
that is a meaningful control failure, not a cosmetic one.

## Related — this is the third instance of the same pattern today
| Where | Data | Display |
|---|---|---|
| Investigation assignee (`2026-08-13-investigation-assignee-not-displayed.md`) | stored | absent |
| Annual report / application **Risk Status** (ADO #101712/#101756/#101757) | exists on Interventions | absent |
| **Change request old/new values** (this bug) | stored | absent |

Worth raising with the test lead as **one systemic presentation issue** rather than three separate tickets.

## Also observed on the same records
- Change request status renders as **`Submited`** (misspelled) on both portals
- `refNumber` is stored with a **leading space**: `" POST1042/13/08/2026"`
- The notification audit shows **both SMS notifications FAILED** (`0834964104`, `0818400598`) while both emails
  were **SENT** — worth a separate look at the SMS channel
