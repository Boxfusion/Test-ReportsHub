# Report: LOGIS — DHA Invoice Tracking on TEST (Full Chain to Paid + Filed)

**Date:** 2026-07-29 05:41 UTC
**Plan:** test-plans/invoice-process/logis.md
**App:** DHA SmartGov Invoice Tracking — https://dha-smartgov-adminportal-test.shesha.app/ (**TEST**)
**Execution Mode:** ai-driven (live MCP browser)
**Result:** ✅ PASSED — **FULL LOGIS CHAIN COMPLETE on TEST, invoice Paid + Filed (11/11 steps)**
**Duration:** ~24 min live (registration was done 2026-07-28)
**Item:** PAY3055/2026 — Order **OR-125489**, Invoice **DHA-LOG-3055**, Supplier ATLANTIS CORPORATE TRAVEL (KL772), **R 92**, Payment No **3055**
**Workflow instance:** `7756a1cf-c1b4-45d5-a8d7-f0a2ff768d80`
**Blocker retests:** ⛔→✅ **Certify Invoice `SetPaymentApprover` 500 is FIXED**; ⛔→✅ **the `Capture Payment on LOGIS` role gap is resolved** (login supplied mid-run)
**First time the LOGIS chain has ever completed on TEST.**

## Summary
| Area | Result |
|------|--------|
| **Certify Invoice — blocker retest** | ✅ [PASS] — `SetPaymentApprover` **200** (was a silent 500) |
| Approve Invoice → Assign Responsible Official → Verify Invoice | [PASS] |
| **Capture and Link Invoice on LOGIS** | [PASS] — manual Payment Number, unblocked by `H23086050` |
| Pre-Authorise Payment → Verify Voucher | [PASS] |
| Final Authorise Payment (BAS report import, Source Doc Type **INV**) | [PASS] — Is Success=Yes, **Payments Authorised 1** |
| Attach Payment Stub (stub matched on **PO number**) | [PASS] — Rows Affected 4, **Payments Confirmed 1** → PAID |
| Capture Filing | [PASS] — process ended, invoice **Filed** |
| 4xx / 5xx anywhere in the chain | **[NONE]** |

Final state: `Process/Details` → `status: 3` (Completed), `subStatus: 12` (Paid), `activeTodoItems: []`.

## 1. Both blockers cleared

**a) Certify Invoice (`SetPaymentApprover` silent 500) — FIXED.** Re-driven on the same parked item with
the same certifier and decision:

```
POST .../Process/UserTaskSave                                    → 200
POST .../SaGovInvoiceTracking/SetPaymentApprover/SetPaymentApprover
     ?saGovRequestForPaymentWorkflowId=7756a1cf-…                → 200   ← was 500
POST .../Process/UserTaskComplete                                → 200
```

Routed to *Approve Invoice* resolved to **Melissa Ndlovu** — the same approver QA resolves Thabiso Maake
to. The ITS test users now have an org placement on TEST.
[Bug marked RESOLVED](../bugs/2026-07-28-logis-certify-no-supervisor-silent-500.md) (defect #1; the
silent-failure half stays open).

**b) The `Capture Payment on LOGIS` role gap — resolved.** The step activated against a role holding five
real staff accounts and none of the six ITS test users. The user supplied **`H23086050`
(LESETJA JACK BAMBO)**, which works with the standard `123qwe` — PAY3055 was in his inbox and the step
completed normally. (`H22262270`, tried earlier, is **not** a `123qwe` account — 403.)
[Bug updated](../bugs/2026-07-29-logis-capture-and-link-no-test-account-in-role.md).

## 2. Chain as executed (audit trail — all decisions on the happy path)

| # | Step | Actor (login) | Input captured | Completed (SAST) |
|---|---|---|---|---|
| 1 | Register and Upload Invoice | System Administrator (`Admin`) | Order OR-125489, invoice DHA-LOG-3055 R92 + PDF, line item ticked | 28/07 20:54 |
| 2 | Certify Invoice | Thabiso Maake (`ThabisoM`) | "Goods and Service has been delivered satisfactory" | 07:17:11 |
| 3 | Approve Invoice | Melissa Ndlovu (`00000000`) | "delivered satisfactory" (Supervisor Response) | 07:18:34 |
| 4 | Assign Responsible Official | Monicca J Kabini (`H18433740`) | Official = **MONICCA JOHANNA KABINI** (self-assign) | 07:19:57 |
| 5 | Verify Invoice | Monicca J Kabini | Outcome = *Verification is complete* + **7 × Yes** | 07:20:22 |
| 6 | **Capture and Link Invoice on LOGIS** | **Lesetja Jack Bambo (`H23086050`)** | **Payment Number 3055** (typed + inline Save), "Should payment proceed" = **Yes**, confirm tick | 07:32:36 |
| 7 | Pre-Authorise Payment | Monicca J Kabini (`H18433740`) | confirm tick only (checklist read-only) | 07:33:55 |
| 8 | Verify Voucher | Tshianeo Moirah Maboya (`H19234198`) | confirm tick only — **no Batch Number on LOGIS** | 07:34:58 |
| 9 | Final Authorise Payment | *(auto — BAS report import, as GLADYS MONDLANE)* | `bas-text-report-PAY3055-LOGIS.txt`, **Source Doc Type INV** | 07:36:36 |
| 10 | Attach Payment Stub | *(auto — payment stub import)* | `payment-stub-PAY3055-LOGIS.txt`, **PO = OR-125489** | 07:39:05 (status 7) |
| 11 | Capture Filing | Mutshutshu Tshithukhe (`Mutshutshut`) | **Batch BATCH-3055**, **Box BOX-3055**, **File Range FILE-3055-001-010** + confirm tick | 07:41:09 |

## 3. Imports — LOGIS specifics confirmed on TEST

**BAS report import (step 9)** — built with the `.txt` (Notepad) generator, editing an existing **INV**
record in the template:

```bash
node scripts/make-bas-text-report.js --payment 3055 --invoice DHA-LOG-3055 \
  --supplier KL772 --amount 92 --type INV --out test-data/bas-text-report-PAY3055-LOGIS.txt
```

```
History: Is Success = Yes | Rows Affected 0 | Rows Skipped 0 | Payments Authorised = 1
```

Two useful findings:
- **`Source Doc Type = INV` is required for LOGIS** (BAS uses `SUNDRY`) — confirmed on the `.txt` route,
  not just the QA `.xlsx`.
- **The FUNC NO match is lenient about zero-padding.** The generator writes FUNC NO zero-padded to 8
  (`00003055`) but the invoice's payment number was the hand-captured **`3055`** — and it still matched
  and authorised. **The stored payment number was NOT overwritten**; it remained `3055` afterwards. So on
  LOGIS the FUNC NO is used only to *find* the invoice, whereas on BAS it *becomes* the payment number.
- Unlike BAS, this import completed **only one** step (Final Authorise Payment) — on BAS the same import
  completes both *Upload Captured Invoices Report* and *Final Authorise Payment*, because LOGIS has no
  "Upload Captured Invoices Report" step.

**Payment stub import (step 10)** — LOGIS matches on the **PURCHASE ORDER NUMBER**, not the payment
number. `scripts/make-payment-stub.js` hard-coded `NOT APPLIC` in that field, so **a `--po` flag was
added** this run:

```bash
node scripts/make-payment-stub.js --payment 3055 --invoice DHA-LOG-3055 \
  --po OR-125489 --amount 92 --out test-data/payment-stub-PAY3055-LOGIS.txt
```

```
History: Is Success = Yes | Rows Affected 4 | Rows Skipped 0 | Payments Confirmed = 1   → PAID
```

Detail-line geometry now documented in the script header: cols 3–36 invoice no, **cols 37–70 purchase
order number** (`NOT APPLIC` for BAS, `OR-xxxxxx` for LOGIS), cols 71–81 payment number, cols 120–128
amount. The BAS output was regression-checked after the change and is **byte-identical** to the
previously imported `payment-stub-PAY3061.txt`.

## 4. Plan corrections needed (logis.md)

| Plan step | Says | Actually on TEST |
|---|---|---|
| TC-16 step 2 | "the Batch Number is pre-populated read-only (from Capture and Link Invoice on LOGIS)" | **Wrong** — Batch Number is **empty, editable and required** at Capture Filing. LOGIS Capture Filing has **three** required fields (Batch Number, Box Number, File Range); BAS has two |
| TC-02 steps 25–27 | expects a "Submit Invoice with Order Line Items" confirmation dialog | Does not appear (already recorded 2026-07-28) |
| TC-11 | Payment Number → "CLICK the Save icon" | Correct, but the inline **Save icon is only rendered on row hover** (zero bounding box until then) — hover the field first |

Role differences from QA worth noting in the plan: on TEST *Capture and Link* is **not** available to
`ThabisoM` (it needs `H23086050`), and *Capture Filing* routes to **Mutshutshu Tshithukhe**, not Susanna
Erasmus as on QA.

## 5. Other form facts (new)

- ***Verify Invoice* has SEVEN mandatory Yes/No questions** (BAS's *Prepare Voucher* has four). Radio
  index map: 0 = *Send for business related query*, 1 = *Send for supplier related query*,
  2 = **Verification is complete**, 3 = *Reject Invoice*, then 4–17 = the seven Yes/No pairs.
- ***Assign Responsible Official* is an open person picker** over the whole staff directory (not
  role-filtered), so the self-assign technique works there.
- ***Pre-Authorise Payment*** renders the seven answers **read-only/disabled** (carried forward from
  Verify Invoice); only the confirmation tick is needed.
- ***Capture and Link*** offers "Should payment proceed" **Yes/No**, plus *Verify Invoice* /
  *Send to Business Unit* options that belong to the **No** branch (untested).
- *Certify Invoice* on LOGIS has the third option **"I am the wrong person to confirm the delivery"**
  (TC-04 re-route) — still untested.
- Multiple hidden `Submit` buttons on Certify / Approve / Verify Invoice / Capture and Link — filter to a
  non-zero bounding box, same as BAS.

## 6. Still outstanding on LOGIS

- **Negative branches unexecuted:** Reject Invoice (→ Review Invoice Rejection), the "wrong person"
  re-route (TC-04), the *Capture and Link* "No" branch, and the *Pre-Authorise* "Send Back to Capture"
  branch.
- **The two query branches remain unrunnable** — they route to roles owned by HLEKANEI ROSE MATHE, for
  whom no login exists (same gap as BAS).

## 7. Artefacts

- `test-data/bas-text-report-PAY3055-LOGIS.txt` (Source Doc Type INV)
- `test-data/payment-stub-PAY3055-LOGIS.txt` (PO OR-125489)
- `scripts/make-payment-stub.js` — **new `--po` flag** + documented PO column geometry
