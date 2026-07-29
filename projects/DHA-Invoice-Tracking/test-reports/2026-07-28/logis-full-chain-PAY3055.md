# Report: LOGIS — DHA Invoice Tracking on TEST (register blocker cleared, blocked at Certify)

**Date:** 2026-07-28 18:58 UTC
**Plan:** test-plans/invoice-process/logis.md
**App:** DHA SmartGov Invoice Tracking — https://dha-smartgov-adminportal-test.shesha.app/ (**TEST**)
**Execution Mode:** ai-driven (live MCP browser)
**Result:** ⚠️ PARTIAL — the LOGIS register 500 (`Activity_117ve9d`) is **FIXED** and registration routes correctly, but the chain is **blocked at step 2 (Certify Invoice)** by a silent 500: no supervisor in the TEST org structure
**Duration:** ~15 min
**Primary item:** PAY3055/2026 — Order **OR-125489**, Supplier **ATLANTIS CORPORATE TRAVEL** (KL772), Invoice **DHA-LOG-3055**, R 92
**Blocker retest:** ⛔ → ✅ `Activity_117ve9d` register 500 **FIXED**
**New blocker:** [bugs/2026-07-28-logis-certify-no-supervisor-silent-500.md](../bugs/2026-07-28-logis-certify-no-supervisor-silent-500.md)
**Workflow instance:** `7756a1cf-c1b4-45d5-a8d7-f0a2ff768d80`

## Summary
| Area | Result |
|------|--------|
| **Register blocker retest (`Activity_117ve9d`)** | [PASS] — `UserTaskComplete` **200** (was 500), Draft → **RECEIVED** |
| Register & Upload Invoice (order-driven) | [PASS] |
| Order picker / supplier auto-fill | [PASS] — OR-125489 → ATLANTIS CORPORATE TRAVEL, KL772 |
| Order Line Items panel + capacity + Select | [PASS] — Total Invoice Amount R92.00 |
| Routing to Certify Invoice | [PASS] — assigned to the Business Unit person |
| **Certify Invoice** | **[FAIL] — silent 500, `SetPaymentApprover`: "No supervisor found in the organization structure for Thabiso Maake."** |
| Approve → Assign Responsible Official → Verify Invoice → Capture & Link → Pre-Authorise → Verify Voucher → BAS import → Payment Stub → Capture Filing | [NOT RUN] — unreachable |
| LOGIS negatives (business query, supplier query, Reject Invoice) | [NOT RUN] — branch from Verify Invoice, downstream of the block |

## 1. The register blocker is fixed

Yesterday morning `Submit` on **Register and Upload Invoice** returned 500 for LOGIS at
`elementId Activity_117ve9d`. After the team reconfigured the LOGIS workflow definition, a fresh
registration submitted cleanly:

```
POST /api/services/SheshaWorkflow/Process/UserTaskSave      → 200
POST /api/services/SheshaWorkflow/Process/UserTaskComplete  → 200
{"result":{"todoItems":[]},"success":true,"error":null}
```

Status went Draft → **RECEIVED** and the item routed to **Certify Invoice**. That closes the LOGIS half of
[2026-07-28-bas-logis-test-env-register-upload-submit-500.md](../bugs/2026-07-28-bas-logis-test-env-register-upload-submit-500.md),
which had been verified for BAS only.

## 2. Where it stopped

`Certify Invoice` → *"Goods and Service has been delivered satisfactory"* → Submit:

```
POST /api/services/SheshaWorkflow/Process/UserTaskSave        → 200   (decision persisted)
POST /api/services/SaGovInvoiceTracking/SetPaymentApprover/…  → 500
      "No supervisor found in the organization structure for Thabiso Maake."
```

The item stays at Certify Invoice, and **the UI reports nothing** — no message, no notification, no
inline error. Submit appears to do nothing at all. Full analysis, evidence and the two separate asks
(populate the org structure; stop swallowing the error) are in the bug:
[2026-07-28-logis-certify-no-supervisor-silent-500.md](../bugs/2026-07-28-logis-certify-no-supervisor-silent-500.md).

**Root cause is TEST data, not the workflow:** every one of the six ITS test users has
`primaryOrganisation: null` on TEST, so no available user can act as the LOGIS certifier. On QA the same
person (Thabiso Maake) resolved to Melissa Ndlovu as approver.

## 3. Test-data findings worth keeping

### OR-124953 is unusable on TEST — it has no line items
The order recommended in project memory was tried first and its **Order Line Items panel stayed empty**:

```
GET /api/services/SaGovInvoiceTracking/SaGovOrderLineItem/GetOrderLineItems
    ?saGovOrderUploadingId=1b96833e-…&invoiceReceivedId=…
→ 200  {"result":[]}
```

The order *header* exists (R3 200, ACCOMMODATION) but there are **no `SaGovOrderLineItem` records**, and
LOGIS cannot be submitted without selecting a line item. Scanning the 25 most recent orders via
`GetOrderLineItems` found plenty with capacity — good candidates, all with `canBeInvoiced: true` and
nothing invoiced yet:

| Order | Amount | Line items | Note |
|---|---|---|---|
| **OR-125489** | R92 | 1 (Max: 4) | used for this run — smallest, single line item |
| OR-126120 | R3 446 | 2 | |
| OR-126151 | R14 607 | 2 | |
| OR-125969 | R29 617.83 | 2 | |
| OR-126052 | R78 522 | 1 | |
| OR-126152 | R7 058.69 | 20 | good for multi-line-item testing |

### Don't change the Order on an existing LOGIS draft
Swapping the Order on a draft that already has a committed invoice row leaves the form inconsistent —
Business Unit clears, the invoice row is dropped, and re-committing it fails with
`invoiceIndexTable.onRowSave:error` / `Create failed`, plus script errors
(`Cannot read properties of undefined (reading 'supplier' / 'tableData' / 'id')`). **Not logged as a
defect** — it is an unusual path and the clean route works. Start a fresh registration instead.
(Draft **PAY3051/2026** was abandoned this way and is left on TEST.)

### TEST register form is newer than QA's
TEST runs `…RegisterScanandUploadInvoices-Create **v13**`, which **has** the Order Line Items panel
(`Select`, `(Max: n)` capacity, `Reset Order Line Items` refresh). The QA run of 2026-07-16 recorded *no*
line-item panel for DHA. Conversely, the **"Submit Invoice with Order Line Items" confirmation dialog
that plan TC-02 step 25 expects did not appear** — Submit routed straight through.

## 4. Items left on TEST

| Ref No | State |
|---|---|
| **PAY3055/2026** | parked at **Certify Invoice** — resumable as soon as the certifier has a supervisor; no need to re-register |
| PAY3051/2026 | abandoned Draft (order swapped mid-draft, see above) |

## 5. Still outstanding for LOGIS

Everything from Certify onwards, plus:
- TC-04 re-route branch ("I am the wrong person to confirm the delivery")
- The two LOGIS query negatives will additionally need a **query-responder login**, the same gap that
  stopped the BAS query branches — see
  [bas-negative-supplier-related-query-PAY3039.md](bas-negative-supplier-related-query-PAY3039.md).
- Per the QA run, when the chain does become runnable: LOGIS BAS report needs **Source Doc Type = INV**
  (not SUNDRY), and the **payment stub matches on the PO number** (`OR-…`), not the payment number.
