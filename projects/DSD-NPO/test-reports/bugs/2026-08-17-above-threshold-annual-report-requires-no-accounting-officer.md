# An above-threshold annual report can be filed with no accounting officer details at all

**Date raised:** 2026-08-17
**Severity:** High
**Area:** Public portal → Annual report wizard → Financial Report (step 6)
**Form:** `boxfusion.dsdnpo/annual-compliance-create v22`
**Environment:** QA · view mode **Latest**
**Found on:** `ANN2363/17/08/2026` for NPO `333-019-NPO`
**Fails:** ADO #101740 (TC-08-008) and #101753 (TC-08-021) — see the caveat below
**Related:** ADO #101748 (TC-08-016) — the R500 000 QA path

## What happens

Selecting **`Is Above Threshhold = R500 000+`** reveals three fields:

- **Accounting officer name**
- **Practice number**
- **Account Officer Report** (upload)

**None of them is marked required, and none of them is enforced.** With all three left completely empty and a committed
funding row of **R750 000**, `Next` is enabled and the wizard proceeds to Financial Statement and on to Declaration.

## Reproduction

1. Initiate an annual report and reach **Financial Report**.
2. `NPO Received Funding = Yes`; upload anything into the required *Additional Documents File*.
3. Set **`Is Above Threshhold = R500 000+`** (⚠️ the first click does not bind — click, read back, click again).
4. Add a funding row: Source `Private`, Funded Amount `750000`, commit with the `plus-circle` control.
5. Leave **Accounting officer name**, **Practice number** and **Account Officer Report** empty.
6. Observe: **`Next` is enabled.** No `*` on any of the three, no validation error, no warning.

Evidence: `test-reports/2026-08-17/evidence/a7-above-threshold-accounting-officer-not-required.png`

## Why it matters

The R500 000 threshold is the point at which the NPO Act's stricter financial-reporting obligations bite — that is the
whole reason the band exists and the reason these three fields appear at all. As built, an organisation reporting
three-quarters of a million rand in funding files its annual report with **no accounting officer named, no practice
number, and no accounting-officer report attached**, and nothing downstream asks for them: there is also **no assessor
task created for a submitted annual report**, so no human catches the omission either.

The fields being present but optional is the worst of the three possible states — it looks like the control exists.

## Expected

Per #101753: a required-field error on each of the accounting-officer fields when the above-threshold branch is active,
and `Next` blocked until they are supplied.

## ⚠️ Important caveat — the ADO cases describe a different design

#101740 and #101753 are written against an **`Audited = Yes/No` radio plus auditing-firm fields**. **That control does
not exist anywhere in this wizard** (all 8 steps were inventoried). The threshold branch above is its closest analogue,
and that is what was tested.

▶ **A ruling is needed from the test lead before this is treated as a build defect**, because either:
1. the build is missing the enforcement the FDS intends, **or**
2. the cases need rewriting against the threshold design.

**The finding holds under both readings** — above the threshold, nothing is collected and nothing is required — but
which artefact gets changed is not ours to decide.

## Notes

- ⚠️ **Not tested:** whether the server rejects an above-threshold submission missing these values. The client does not.
- Label typo: **"Account Officer Report"** should read *Accounting Officer Report*; **"Threshhold"** is misspelled in
  the band label and in the page's warning banner.
- Related, same step, filed separately: the funding table **silently drops the funder's name** on commit.
