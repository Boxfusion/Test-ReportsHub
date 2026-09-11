# Bug: the Asset Transfer step is unreachable on the Voluntary Deregistration path, and the receiving NPO's details never display

**Date:** 2026-08-21
**Severity:** Medium–High
**Status:** Open — verified
**Portal:** Public (submitter)
**Found in:** NPO-13P TC-13-005 (ADO #101804 · FDS Dereg 7.1.2)
**Record:** `DER2395/21/08/2026` on NPO `333-022-NPO`

> ⚠️ **This supersedes the 2026-08-13 finding "Asset transfer has no UI at all".** That conclusion was wrong — the
> step exists. See *Correction* below.

## Two defects in one step

### 1. Asset Transfer is gated behind the wrong severance type
The *Deregistration Details* step offers **Type of severance** (`Voluntary Deregistration` / `Dissolution Winding Up`)
and a **"Do you want to donate assets?"** checkbox.

| Type of severance | donate-assets checkbox | Asset Transfer step |
|---|---|---|
| **Voluntary Deregistration** | **not rendered** | **never appears** — wizard goes Details → Declaration |
| **Dissolution Winding Up** | rendered | **appears as step 3 of 4** |

The suite this case belongs to (101875) is *Voluntary Deregistration Submitter*, so on its own path the case cannot
be executed at all. On the Voluntary path asset transfer exists only as a mandatory upload,
`Assets Transfer Form File *`, on the Declaration step.

📌 The checkbox also **retains `checked: true` while hidden** — selecting Dissolution, ticking it, then switching to
Voluntary leaves the flag set with no way for the user to see or clear it.

### 2. The receiving NPO's details never display
On the Dissolution branch where the step does render, the **Asset Register** row has columns
*Receiving Npo · Npo Number · Receiving Office Bearer · OB Cellphone · Serial Ref No · Asset Description · Rand
Value · Receiving NPO Address*.

**What works:** the *Receiving Npo* picker is a real server-filtered search (typing a known NPO name returned one
exact match), and the *Receiving Office Bearer* picker correctly cascades to that NPO's office bearers.

**What fails (the case's BLOCKING assertion — *"Receiving NPO details are displayed"*):** after selecting both the
receiving NPO and one of its office bearers, and waiting:

- `Npo Number` — **blank**
- `Receiving NPO Address` — **blank**
- `OB Cellphone` — **blank**

## Evidence — the data IS present
Read directly from the selected receiving NPO's entity:
```
npoNumber       : "333-019-NPO"
physicalAddress : "18 South Street, Zwartkop, Centurion, South Africa"
```
Both values exist on the record the picker just selected. **This is a presentation gap, not missing data.**

## Impact
Asset transfer on dissolution is a statutory control — assets must pass to another non-profit with a similar
objective. The assessor and the submitter both approve a transfer without seeing the receiving organisation's
registration number or address, i.e. without being shown which organisation is actually receiving the assets.

## Related — same "stored but not displayed" pattern
This is the fifth instance in this module, after the investigation assignee, Risk Status, change-request old/new
values (`2026-08-13-change-request-values-not-displayed.md`) and the deregistration notice document. Worth raising
with the test lead as one systemic presentation issue.
