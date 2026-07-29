# Report: LOGIS — DHA Invoice Tracking on TEST (Clean Full Chain from Registration)

**Date:** 2026-07-29 06:01 UTC
**Plan:** test-plans/invoice-process/logis.md
**App:** DHA SmartGov Invoice Tracking — https://dha-smartgov-adminportal-test.shesha.app/ (**TEST**)
**Execution Mode:** ai-driven (live MCP browser)
**Result:** ✅ PASSED — full LOGIS chain **registered and completed in one run**, invoice **Paid + Filed** (11/11 steps)
**Duration:** ~11 min (07:50 → 08:01 SAST)
**Item:** PAY3072/2026 — Order **OR-126120**, Invoice **DHA-LOG-3072**, Supplier ATLANTIS CORPORATE TRAVEL (KL772), **R 3,446.00** (2 line items), Payment No **3072**
**Workflow instance:** `50e5ea85-77c5-4ebb-bd90-9717933b48c9`

## Why this run

[logis-full-chain-PAY3055.md](logis-full-chain-PAY3055.md) completed the chain, but its registration had
been done the previous day and it had been parked at Certify across two blocker fixes. This run drives
**every step including registration in a single clean pass**, to confirm the process is genuinely healthy
rather than only recoverable — and it doubles as the first LOGIS test of a **multi-line-item** order.

## Summary
| Step | Actor | Result |
|---|---|---|
| 1 Register and Upload Invoice (order-driven, 2 line items) | `Admin` | [PASS] — Submit **200 first attempt**, no confirmation dialog |
| 2 Certify Invoice | `ThabisoM` | [PASS] — `SetPaymentApprover` **200** → Melissa Ndlovu |
| 3 Approve Invoice | `00000000` | [PASS] |
| 4 Assign Responsible Official | `H18433740` | [PASS] — self-assign |
| 5 Verify Invoice | `H18433740` | [PASS] — 7 × Yes |
| 6 Capture and Link Invoice on LOGIS | `H23086050` | [PASS] — Payment No 3072 |
| 7 Pre-Authorise Payment | `H18433740` | [PASS] |
| 8 Verify Voucher | `H19234198` | [PASS] |
| 9 Final Authorise Payment (BAS report, INV) | auto | [PASS] — Payments Authorised 1 |
| 10 Attach Payment Stub (PO-matched) | auto | [PASS] — Payments Confirmed 1 → **PAID** |
| 11 Capture Filing | `Mutshutshut` | [PASS] — **Completed**, Filed |
| 4xx / 5xx anywhere in the chain | | **[NONE]** |

Final state: `status: 3` (Completed), `subStatus: 12` (Paid), `activeTodoItems: []`.

## Chain as executed

| # | Step | Actor (login) | Input captured | Completed (SAST) |
|---|---|---|---|---|
| 1 | Register and Upload Invoice | System Administrator (`Admin`) | Order **OR-126120**, Business Unit **Thabiso Maake**, invoice DHA-LOG-3072 + PDF, **both line items ticked**, supporting doc | 07:50:40 |
| 2 | Certify Invoice | Thabiso Maake (`ThabisoM`) | "delivered satisfactory" | 07:52:04 |
| 3 | Approve Invoice | Melissa Ndlovu (`00000000`) | "delivered satisfactory" | 07:53:10 |
| 4 | Assign Responsible Official | Monicca J Kabini (`H18433740`) | Official = MONICCA JOHANNA KABINI | 07:54:24 |
| 5 | Verify Invoice | Monicca J Kabini | *Verification is complete* + 7 × Yes | 07:54:46 |
| 6 | Capture and Link Invoice on LOGIS | Lesetja Jack Bambo (`H23086050`) | Payment Number **3072** (hover → inline Save), proceed = **Yes**, confirm tick | 07:56:30 |
| 7 | Pre-Authorise Payment | Monicca J Kabini (`H18433740`) | confirm tick | 07:57:27 |
| 8 | Verify Voucher | Tshianeo Moirah Maboya (`H19234198`) | confirm tick (no batch no) | 07:58:17 |
| 9 | Final Authorise Payment | *(auto — BAS import, as GLADYS MONDLANE)* | `bas-text-report-PAY3072-LOGIS.txt`, Source Doc Type **INV** | 07:59:17 |
| 10 | Attach Payment Stub | *(auto — stub import)* | `payment-stub-PAY3072-LOGIS.txt`, **PO = OR-126120** | 07:59:57 (status 7) |
| 11 | Capture Filing | Mutshutshu Tshithukhe (`Mutshutshut`) | Batch **BATCH-3072**, Box **BOX-3072**, File Range **FILE-3072-001-010** | 08:01:36 |

## Registration — multi-line-item order (new coverage)

Order **OR-126120** (R3 446, ordered 26/06/2026, end user AMANDA LEDWABA_IMMGR) has **two** line items:

| PO Item | Description | Committed Qty | Unit Price | Committed Amount | Capacity |
|---|---|---|---|---|---|
| 1 | ADMIN FEE TRANSACTION FEE | 2 | 23 | 46.00 | (Max: 2) |
| 2 | ACCOMMODATION | 2 | 1 700 | 3 400.00 | (Max: 2) |

Both were ticked → **Total Invoice Amount(Incl VAT): R3446.00**, Variance 0.00 on each. Confirmed
behaviour:

- The **Order Line Items panel only appears after the invoice row is committed** with the plus-circle
  button — it is not on the form beforehand.
- The LOGIS invoice grid has **no Invoice Amount column** (BAS does) — the amount is derived entirely from
  the selected line items.
- The panel warns: *"if the total of the selected Invoice Amounts is greater than the total of the selected
  Committed Amounts, then a Motivation must be uploaded"*, and there is a separate **Motivation** upload
  beside Additional Supporting Documents. Not triggered here (variance 0) — **the over-commitment /
  motivation-required rule remains untested**.
- **Submit routed straight through with no "Submit Invoice with Order Line Items" dialog**, re-confirming
  that plan TC-02 steps 25–27 are stale. Registration succeeded on the **first** attempt (no sign of the
  intermittent BAS-side `Activity_0e0c34w` 500 on the LOGIS register path).

## Confirmations of yesterday's findings (all reproduced on a fresh item)

- `SetPaymentApprover` → **200** on a brand-new item, resolving Thabiso Maake → **Melissa Ndlovu**. The
  org-structure fix is not specific to the one parked item.
- **`logis.md` TC-16 step 2 is wrong** — at *Capture Filing* the **Batch Number was again empty, editable
  and required** (3 required fields: Batch Number, Box Number, File Range). Reproduced on a fresh item, so
  this is the real behaviour, not leftover state from PAY3055.
- *Capture and Link*'s inline **Save icon for Payment Number renders only on row hover**.
- *Verify Invoice* → seven mandatory Yes/No questions; *Pre-Authorise* shows them read-only.
- LOGIS *Verify Voucher* has **no** Batch Number field.
- Actor map differs from QA in two places, again: *Capture and Link* needs **`H23086050`** (not
  `ThabisoM`), and *Capture Filing* routes to **`Mutshutshut`** (not Susanna Erasmus).
- **FUNC NO zero-padding is tolerated** — the report carried `00003072` while the invoice held `3072`, and
  it matched (`Payments Authorised 1`). Stored payment number unchanged afterwards.

## Imports

```bash
node scripts/make-bas-text-report.js --payment 3072 --invoice DHA-LOG-3072 \
  --supplier KL772 --amount 3446 --type INV --out test-data/bas-text-report-PAY3072-LOGIS.txt

node scripts/make-payment-stub.js --payment 3072 --invoice DHA-LOG-3072 \
  --po OR-126120 --amount 3446 --out test-data/payment-stub-PAY3072-LOGIS.txt
```

Both `Is Success = Yes`; BAS report **Payments Authorised = 1** (completing only *Final Authorise
Payment*), stub **Payments Confirmed = 1** → PAID. The `--po` flag added during the PAY3055 run worked
unchanged on a second order.

## Still outstanding on LOGIS

- **Negatives:** Reject Invoice → Review Invoice Rejection; the TC-04 *"I am the wrong person to confirm
  the delivery"* re-route; *Capture and Link* "No / should payment not proceed" (reveals Verify Invoice /
  Send to Business Unit, each needing a comment); *Pre-Authorise* "Send Back to Capture".
- **Over-commitment rule** — invoice more than the committed line amount and prove the Motivation upload
  is enforced.
- **Query branches** — still blocked on the missing HLEKANEI ROSE MATHE login.

## Artefacts

- `test-data/bas-text-report-PAY3072-LOGIS.txt`, `test-data/payment-stub-PAY3072-LOGIS.txt`
- `test-data/invoice-DHA-LOG-3072.pdf`
