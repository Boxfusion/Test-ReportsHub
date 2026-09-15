# The annual report's funding table silently drops the funder's name when the row is committed

**Date raised:** 2026-08-17
**Severity:** Medium-High
**Area:** Public portal → Annual report wizard → Financial Report (step 6) → funding table
**Form:** `boxfusion.dsdnpo/annual-compliance-create v22`
**Environment:** QA · view mode **Latest**
**Found on:** `ANN2363/17/08/2026` for NPO `333-019-NPO`
**Relates to:** ADO #101747 (TC-08-015), #101754 (TC-08-022)

## What happens

The funding table has three columns — **Source Of Funding · Name Of Funder · Funded Amount**. All three were captured,
then the row was committed with the `plus-circle` control. The committed row shows:

```
Private  |  (blank)  |  750000
```

**"QA Trust Foundation" is gone.** No error, no toast, no field-level message. The source and the amount both survive,
so the row looks legitimately saved.

## Reproduction

1. On **Financial Report**, set `NPO Received Funding = Yes` and pick a threshold band.
2. In the funding row enter **Source Of Funding = Private**, **Name Of Funder = QA Trust Foundation**,
   **Funded Amount = 750000**.
3. Commit the row with the **`plus-circle`** button.
4. Read the committed row: source and amount are present, **Name Of Funder is empty**.

Evidence: `test-reports/2026-08-17/evidence/a7-above-threshold-accounting-officer-not-required.png` (the committed row
is visible at the foot of the funding table).

## Why it matters

*Who* funded the organisation is the substantive content of this table — the source (Government/Private) and the amount
are near-useless without it. An annual report can therefore be submitted declaring R750 000 of private funding from
nobody in particular, and the assessor has no way to know a name was ever entered.

## Expected

The captured funder name persists into the committed row and into the submitted report.

## Notes

- ⚠️ **Not yet isolated:** whether the value is lost in the grid's commit handler or never sent to the server. It was
  entered with `fill()`, so **a React-binding artefact of the harness is not fully ruled out** — but the two sibling
  fields in the same row were filled the same way and both persisted, which argues against it.
  ▶ **Retest by typing the funder name with real keystrokes** before this is handed to a developer as confirmed.
- Same row, same step: this table also **loses the entire row** if the threshold band is toggled afterwards (recorded in
  the run report as a known gotcha, not filed separately).
