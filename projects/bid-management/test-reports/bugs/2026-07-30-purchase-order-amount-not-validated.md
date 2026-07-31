# BUG: Purchase Order Amount is completely unvalidated — a negative amount and a 10× over-commitment both award the tender

| Field | Value |
|---|---|
| **Logged** | 2026-07-30 |
| **Project** | PD Bid Management (`projects/bid-management`) |
| **App / Env** | Supply Chain Management Admin Portal — **QA** (`https://pd-supplychainmanagement-adminportal-qa.shesha.app`) |
| **Severity** | **High** — the final financial commitment of the tender is not checked against anything |
| **Reproducibility** | **2/2 — two different invalid values, two different tenders, both accepted** |
| **Stage / Form** | Capture Order Details — `Shesha.SupplyChainManagement/tender-wf-captureorder-details v20` |
| **Role** | **TumisangM / 123qwe** |
| **Tenders** | **REF2026-0944** (90/10) and **REF2026-2573** (80/20) — both now **AWARDED** with invalid orders |
| **Plan / TC** | `test-plans/tender-process/bid-supply-chain-management.md` — **TC-25** |

## Summary

**Purchase Order Amount** on the final stage accepts values that cannot be valid, with **no client-side
validation, no server-side rejection, and no warning of any kind**. In both tests the tender completed
straight through to **AWARDED**.

| Test | Awarded bid price | Amount entered | Inline error? | Submit | Outcome |
|---|---|---|---|---|---|
| **REF2026-0944** | A & A Stationers — **R 30 000** | **−5 000** (negative) | none | enabled, accepted | **AWARDED** |
| **REF2026-2573** | A & A Stationers — **R 30 000** | **300 000** (10× the bid) | none | enabled, accepted | **AWARDED** |

## Steps to reproduce

1. Sign in as **TumisangM / 123qwe** and open a tender at **Capture Order Details**.
2. Note the awarded supplier's **Bid Price Incl Tax** in the Stage 3 table (here R 30 000 in both cases).
3. Fill **Purchase Order No** and **Purchase Order Date**; the **Order Attachment** is already present.
4. In **Purchase Order Amount** enter either a **negative** number or a value far above the awarded bid price.
5. Observe that no validation appears and **Submit** is enabled. Click it.

## Expected

- A **negative** (and presumably a zero) purchase-order amount should be rejected outright — it is not a
  meaningful commitment.
- An amount **materially above the awarded bid price** should at minimum require a justification, and more
  likely be blocked: the award was adjudicated on that price, and points were scored on it.

## Actual

Both submit cleanly and the tender reaches **AWARDED**. No inline error, no toast, no server rejection. The
`*` on the field is satisfied by *any* value.

## Impact

This is the point where the tender turns into a financial commitment, and it is the **least** validated field
in the whole lifecycle. The award was decided on a price (A & A Stationers won on 80/90 price points at
R 30 000) and the order can then be raised for an unrelated figure without the workflow noticing — which
defeats the purpose of the price scoring upstream. A negative amount additionally puts junk into whatever
downstream reporting consumes the order value.

There is no rework route at this stage either (no footer Send Back at TC-16 — see TC-18), so a wrong amount
captured here cannot be corrected through the workflow.

## Suggested fix (for dev)

1. Constrain the field to **> 0** (the AntD number input already supports `min`).
2. Decide with the BA what the rule is against the awarded bid price — hard block, or allow with a mandatory
   variance justification (and a threshold, e.g. any excess at all vs. some tolerance).
3. Enforce both **server-side**, not only in the form.

## Notes

- Both tenders were deliberately consumed for this test — they were parked, idle test tenders at the final
  stage, so no new tenders were created. **Neither should be used as a reference example of a completed
  tender**, since both carry a knowingly invalid order value.
- **Not tested:** zero, non-numeric input, extremely large values (overflow), and a **Purchase Order Date in
  the past / before the award date** — the date field took `30/07/2026` without complaint but earlier dates
  were not probed.
