# Office bearer can be saved with a checksum-invalid SA ID, and no verification status is ever shown

**Date raised:** 2026-08-17
**Severity:** High
**Area:** Public portal → Registration wizard → Tab 4 *Office Bearers* → Add Office Bearer
**Form:** `boxfusion.dsdnpo/npo-office-bearer v47`
**Environment:** QA · view mode **Latest**
**Found on:** draft `APPL26-01212` (Legal Form NPC)
**Fails:** ADO #101657 (TC-04-003), #101661 (TC-04-007) — and relates to #101655, which prescribes an `ID Verified` column

## What happens

The SA ID field validates **length only (13 characters)**, not the ID's check digit. A structurally invalid identity
number is accepted, saved, and then indistinguishable from a DHA-verified one.

## Reproduction

1. Tab 4 → **Add Office Bearer** → tick **Is RSA ID Number**.
2. Enter **`8001015009086`** — this is the seeded valid ID `8001015009087` with **only the check digit changed**.
3. Observe:
   - **no error** (the *"Please enter a valid ID number"* message that `12345` produces is only the 13-char rule)
   - Date of Birth derives locally to `01/01/1980`, Gender derives to `Male`
4. Complete the remaining required fields (names, residential address, mobile, email, position).
5. **`Save` becomes enabled.** Click it.
6. **The office bearer is added**, and the grid shows `8001015009086`.

Evidence: `test-reports/2026-08-17/evidence/v9-ob-bad-checksum-silent.png` (no error in the dialog) and
`v10-ob-added-with-invalid-id.png` (saved).

⚠️ **Do not be misled by `Save` being disabled at first.** It is disabled only while other required fields are empty.
Fill them and it enables. An earlier draft of this finding recorded "blocked but silent" for exactly that reason;
isolating the variable reversed the verdict.

## And there is no way to tell afterwards

A second OB was added with **`9001015009086`** — checksum-valid but **not matched by DHA**. It also saved. The grid's
only columns are **First Name · Last Name · SAIDNumber**:

| First Name | Last Name | SAIDNumber |
|---|---|---|
| Test | Checksum | 8001015009086 |
| Nomatch | Tester | 9001015009086 |

So three materially different states — **DHA-verified**, **DHA-unmatched**, and **structurally invalid** — look
identical to the submitter and to anyone reading this step. ADO #101655 prescribes an `ID Verified` column in the
public wizard; it is absent. Evidence: `v11-ob-grid-no-verification-indicator.png`.

## Why it matters

Office bearers are the people DSD holds accountable for an NPO, and the OB list is issued as a registration artefact.
An invalid identity number entering the register cannot be reconciled against Home Affairs later, and nothing in the
capture journey warns anyone. Registration completed successfully on 2026-08-13 with `Is OB Self-Verified? = No` on
all three OBs, so OB verification already does not gate approval — this widens that gap from "not confirmed" to
"not even structurally valid".

## Expected

Per #101657: *"Field error 'Invalid ID number'; OB not added"* — i.e. validate the SA ID check digit client-side.
Per #101661: an unmatched ID should show *"ID Not Verified"* **with a clear visual indicator** in the list.

## Notes

- `maxLength` on the field is **13**, and `12345` correctly produces *"SAIDNumber must be at least 13 characters"* —
  so the only rule present is length.
- **No DHA request is visible from the client at any point**, including for a valid ID, so DHA is invoked server-side
  on save. Client-side checksum validation is therefore the only thing that could catch this before the record exists.
- Related and already filed: `2026-08-13-dha-non-match-is-silent-on-office-bearer.md`. This bug is the stronger case —
  the ID is not merely unmatched, it is arithmetically impossible.
- SA ID numbers render **unmasked** in this grid, while the admin grid masks them (`800101*******`) — separate POPIA
  point for suite 14Y.
