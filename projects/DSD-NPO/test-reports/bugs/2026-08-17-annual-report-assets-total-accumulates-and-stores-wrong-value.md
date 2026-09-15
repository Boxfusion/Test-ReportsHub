# Annual report balance sheet: `Assets` total accumulates on screen and stores a different wrong value

**Date raised:** 2026-08-17
**Severity:** High
**Area:** Public portal → Annual report wizard → Step 7 *Financial Statement* → *SUMMARY OF BALANCE SHEET*
**Form:** `boxfusion.dsdnpo/annual-compliance-create v22`
**Environment:** QA · view mode **Latest**
**Found on:** NPO `333-019-NPO`, annual report `ANN2119/17/08/2026`

## What happens

The read-only **`Assets`** total on the balance-sheet summary is computed by **adding to** its previous value instead
of assigning. The value first entered is never removed, so every later edit leaves a permanent offset equal to the
original entry.

Separately, the value that reaches the database is a **third** number: the stored
`FinancialStatement.assetsTotalAmount` holds the *Loan For Staff Amount*, not the assets total.

## Reproduction — measured one input at a time

| Step | Non Current Assets | Current Assets | Correct total | `Assets` displayed | Offset |
|---|---|---|---|---|---|
| initial entry | 400 000 | 320 000 | 720 000 | **1 440 000** | +720 000 |
| change Current only | 400 000 | 100 000 | 500 000 | **1 220 000** | +720 000 |
| change Non Current only | 200 000 | 100 000 | 300 000 | **1 020 000** | +720 000 |

The offset is constant at **720 000** — exactly the sum of the two values first typed (400 000 + 320 000). The field
*is* reactive: each delta is applied correctly, it is the base that is wrong.

Then submit and read the stored record:

```
GET /api/services/app/Entities/GetAll
    ?entityType=boxfusion.dsdnpo.Domain.FinancialStatements.FinancialStatement
    &filter={"and":[{"==":[{"var":"id"},"857b57f7-9ede-419e-a40b-1016ef41fe01"]}]}
```

```
nonCurrentFixedAssets            : 200000     <- as entered
currentAssetsAccountReceipts     : 100000     <- as entered
assetsTotalAmount                :  20000     <- WRONG (equals loanForStaffAmount)
loanForStaffAmount               :  20000
```

So one figure has three values: **300 000** correct · **1 020 000** shown to the submitter · **20 000** stored.

## Why it matters

An NPO that types its balance sheet and then corrects a single figure — an entirely ordinary thing to do — sees an
assets total inflated by whatever it first typed, and the register stores something unrelated to either. The annual
report is the statutory return under the NPO Act, and DSD assessors quality-assure it off these figures.

## Expected

`Assets` should equal `Non Current Assets + Current Assets` on every recalculation, and
`assetsTotalAmount` should persist that same figure.

## Notes

- Verified with two independent single-input perturbations, so this is not a stale-render artefact.
- ⚠️ **Not** part of this bug, and deliberately excluded: an apparent 200 000 error in *Total expenditure* seen
  earlier in the same session. That was a mid-flight computation during rapid programmatic filling; re-tested one
  input at a time, `Total expenditure` (1 195 000) and `Amount Left` (125 000) are both correct and reactive.
- Related but separate, worth raising together: `totalIncomeAmount` stores `0` while `incomeSubtotal` stores the
  correct `1320000`, `expensesSubtotal` (740000) disagrees with `totalExpenditureAmount` (1195000), and
  `percentageSpentOnAdministration` reads `151.35` where administration is 45 000 of 1 195 000 (3.8%).
