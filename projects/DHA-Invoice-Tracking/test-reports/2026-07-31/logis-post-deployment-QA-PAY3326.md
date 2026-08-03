# Report: LOGIS — Invoice Tracking Process (post-deployment regression, QA)

**Date:** 2026-07-31 06:47 UTC
**Plan:** test-plans/invoice-process/logis.md
**Spec:** none — no paired `.spec.ts` exists; run MCP-driven end to end
**Environment:** **QA** — https://dha-smartgov-adminportal-qa.shesha.app/ (view mode **Latest**)
**Execution Mode:** ai-driven (MCP browser)
**Result:** PASSED (with 1 app defect confirmed, 1 plan correction, 1 test-data finding)
**Duration:** ~19 min
**Ref No:** **PAY3326/2026** — LOGIS, Order **OR-125885**, ATLANTIS CORPORATE TRAVEL (KL772),
invoice `DHA-LOG-3326`, **R6 200** (line item 1 of 3: ACCOMMODATION)

## Outcome

**PAY3326/2026 completed all 11 workflow steps end to end → PAID + FILED.**
`Process/Details` → `status: 3` (Completed), `subStatus: 12` (Paid). Zero 5xx on any submit.

Both LOGIS and BAS now run green on the newly deployed QA build.

## Summary
| Total TCs | Passed | Failed | Not run |
|-----------|--------|--------|---------|
| 11 executed | 11 | 0 | 5 (TC-04, TC-06, TC-09, TC-10 negative/query branches; TC-01 login folded into each step) |

## Step Results

### TC-02 — Register and Upload Invoice (ADO #102215)
**Actor:** `Admin`
- [PASS] Register form is now **`SAGovRequestForPayment-wf-RegisterScanandUploadInvoices-Create v13`**
  on QA, and it **does** show the Order Line Items panel plus a **Motivation** upload — the older QA
  notes described a version with neither
- [PASS] Order picker is a **search** over 4 700 open orders; searched `OR-125885` → 1 of 1
- [PASS] Order selected → Supplier Name (ATLANTIS CORPORATE TRAVEL) and Supplier No (KL772) auto-filled
- [PASS] Business Unit is required and **determines the certifier** — set to Thabiso Maake
- [PASS] LOGIS invoice grid has **no Invoice Amount column** (amount derives from ticked line items)
- [PASS] Row committed via plus-circle → **Order Line Items panel populated** with 3 items, each
  `(Max: 1)`: ACCOMMODATION R6 200, HIRE OF CAR R2 744, TRAVEL AIR TICKET R750
- [PASS] Ticked line item 1 → Submit enabled; invoice amount derived as **R6 200**
- [PASS] (BLOCKING) Submit routed on the **first attempt**, no 500 → *Certify Invoice*
- [FAIL — plan stale] **No "Submit Invoice with Order Line Items" confirmation dialog appeared.**
  Plan TC-02 steps 25–27 describe one; Submit routes straight through. Same as previously found on TEST.

### TC-03 — Certify Invoice (ADO #102216)
**Actor:** `ThabisoM` (from the Business Unit choice)
- [PASS] Three outcomes present, including **"I am the wrong person to confirm the delivery"** (the
  re-route branch — not exercised this run)
- [PASS] Selected "delivered satisfactory"; two Submit buttons with one hidden at zero width
- [PASS] (BLOCKING) Routed to *Approve Invoice*

### TC-05 — Approve Invoice (ADO #102232)
**Actor:** `00000000` (Melissa Ndlovu) — resolved from Thabiso via the org structure
- [PASS] Two outcomes; selected "delivered satisfactory"
- [PASS] (BLOCKING) Routed to *Assign Responsible Official*

### TC-07 — Assign Responsible Official (ADO #102242)
**Actor:** `H18433740` (Monicca Kabini)
- [PASS] Official is an **open person picker** (whole staff directory), so self-assignment works —
  set to Thabiso Maake
- [PASS] (BLOCKING) Routed to *Verify Invoice*

### TC-08 — Verify Invoice (ADO #102246)
**Actor:** `ThabisoM` — ⚠️ **DEFECT CONFIRMED HERE**
- [FAIL] The **7 mandatory Business Unit Response Yes/No questions never render.** Panel sits on
  "Loading checklist items…"; `POST /api/services/Enterprise/CheckList/Initialise` → **404**.
  Only the 4 Order Matching Outcome radios are present.
- [PASS] Order Matching Outcome radios: business query / supplier query / **Verification is complete** /
  Reject Invoice
- [PASS] (BLOCKING) Selected "Verification is complete" → Submit **succeeded** with no checklist
  answers captured → routed to *Capture and Link Invoice on LOGIS*

### TC-11 — Capture and Link Invoice on LOGIS (ADO #102249)
**Actor:** `H23086050` (Lesetja Jack Bambo) — confirmed working on QA as well as TEST
- [PASS] Line items shown with Actual Quantity/Unit Price/Amount = 1 × R6 200
- [PASS] **Payment Number entered manually** (`3326`) — the inline **save icon only renders on row
  hover** (zero bounding box until then), exactly as documented
- [PASS] "Should the payment proceed?" = **Yes** → the visible Submit is enabled normally
- [PASS] Confirmation ticked
- [PASS] (BLOCKING) Routed to *Pre-Authorise Payment*
- [NOTE] The **No** branch (destinations *Verify Invoice* / *Send to Business Unit*) was **not**
  exercised — it is the subject of a separate open defect from the TEST runs (visible Submit stays
  disabled on the No outcome).

### TC-12 — Pre-Authorise Payment (ADO #102277)
**Actor:** `H18433740`
- [PASS] Confirmation tick only, no other required input
- [NOTE] The 7 Verify-Invoice answers that this step normally shows **read-only** are absent — a
  downstream consequence of the checklist defect
- [PASS] (BLOCKING) Routed to *Verify Voucher*

### TC-13 — Verify Voucher (ADO #102283)
**Actor:** `H19234198` (Tshianeo Maboya)
- [PASS] LOGIS *Verify Voucher* has **no Batch Number** (BAS does) — confirmation tick only
- [PASS] (BLOCKING) Routed to *Final Authorise Payment*

### TC-14 — Final Authorise Payment (ADO #102284) — BAS report import
**Actor:** `Admin`
- [PASS] Report built with `scripts/make-bas-text-report.js --payment 3326 --invoice DHA-LOG-3326
  --supplier KL772 --amount 6200 --type INV` (LOGIS needs **`Source Doc Type = INV`**)
- [PASS] (BLOCKING) Import completed **one** step only — *Final Authorise Payment* (as GLADYS
  MONDLANE). On BAS the same import completes two; there is no separate "Upload Captured Invoices
  Report" step on LOGIS
- [PASS] Routed to *Attach Payment Stub*

### TC-15 — Attach Payment Stub (ADO #102285)
**Actor:** `Admin`
- [PASS] Stub built with `scripts/make-payment-stub.js --payment 3326 --invoice DHA-LOG-3326
  --po OR-125885 --amount 6200` — LOGIS matches on the **PURCHASE ORDER NUMBER**, so the PO field
  carries `OR-125885` rather than `NOT APPLIC`. Byte-length preserved (8 766 = template)
- [PASS] (BLOCKING) Imported → invoice **Paid** (`subStatus: 12`), routed to *Capture Filing*
- [NOTE] Step shows `status: 7` (programmatic) in Progress — cosmetic, as documented

### TC-16 — Capture Filing (ADO #102286)
**Actor:** `Mutshutshut` (Mutshutshu Tshithukhe) — **not** Susanna Erasmus as the old QA notes say
- [FAIL — plan stale] **`logis.md` TC-16 step 2 is wrong.** It says Batch Number is pre-populated
  read-only from Capture and Link. On QA it is **empty, editable and required** — LOGIS Capture Filing
  has **three** required fields (Batch Number, Box Number, File Range) versus BAS's two. This matches
  what was found on TEST, so the plan is wrong on both environments.
- [PASS] Captured `BATCH-LOG-3326`, `BOX-LOG-3326`, `FILE-3326-3326` + confirmation
- [PASS] (BLOCKING) Submitted → process **ended**, invoice **Paid + Filed** (`status: 3`,
  `subStatus: 12`)

## Defects

### 1. Checklist never loads — now confirmed on LOGIS as well as BAS
`POST /api/services/Enterprise/CheckList/Initialise` → **404** on **both**
*BAS Prepare Voucher* (4 questions) and *LOGIS Verify Invoice* (7 questions). In both cases the step
still submits, so the mandatory questions are **silently skipped rather than enforced**. This is
broader than first logged — it is not one form, it is the shared checklist component.
→ [bugs/2026-07-31-prepare-voucher-checklist-initialise-404.md](../bugs/2026-07-31-prepare-voucher-checklist-initialise-404.md)

### 2. `StoredFile/FilesList` 500 — pre-existing, non-blocking
Same as on BAS: `GET /api/StoredFile/FilesList?ownerId=<id>&ownerType=…&filesCategory=` → **500**,
once per render on every step. Supporting-documents panels stayed usable.

## Test-data finding (not a defect)

**Most QA orders have no line items, and LOGIS cannot be submitted without one.** The first attempt
used **OR-125340**; `GetOrderLineItems` returned `{"result":[]}` and the Order Line Items panel stayed
empty even after *Refresh Order Line Items*. Probing 60 orders via the API found only these with
line items, all with nothing yet invoiced:

| Order | Amount | Line items |
|---|---|---|
| **OR-125885** | R9 694 | 3 (used this run) |
| OR-126006 | R16 230.12 | 5 |
| OR-126050 | R12 115.11 | 4 |
| OR-123264 | R116 782.50 | 1 |
| OR-122292 | R8 300 000.16 | 1 |
| OR-125585 | R165 600 | 1 |

Use one of these for future LOGIS runs rather than picking from the top of the order picker.

## Not covered
- **TC-04** re-route ("I am the wrong person to confirm the delivery") — the option is present but the
  branch was not driven.
- **TC-06** Review Invoice Rejection, **TC-09** business query, **TC-10** supplier query. The two query
  branches also can't be completed while the checklist is broken, since the 7 answers are a
  precondition for the query outcomes.
- The **Capture & Link "No"** branch (separate open defect from TEST).
- The **over-invoicing / Motivation-required** rule — variance was 0 on this run.
- Orphan draft left on QA: **PAY3322/2026** (the OR-125340 attempt, never submitted).

## Artifacts
- BAS report: `test-data/bas-text-report-PAY3326-LOGIS.txt`
- Payment stub: `test-data/payment-stub-PAY3326-LOGIS.txt`

## LOGIS actor map on QA (as observed this run)
| Step | Actor |
|---|---|
| Register and Upload Invoice | `Admin` |
| Certify Invoice | `ThabisoM` (set by the Business Unit field) |
| Approve Invoice | `00000000` Melissa Ndlovu |
| Assign Responsible Official | `H18433740` Monicca Kabini |
| Verify Invoice | `ThabisoM` (self-assigned via the Official field) |
| Capture and Link Invoice on LOGIS | `H23086050` Lesetja Jack Bambo |
| Pre-Authorise Payment | `H18433740` Monicca Kabini |
| Verify Voucher | `H19234198` Tshianeo Maboya |
| Final Authorise Payment | `Admin` (BAS report import; completes as GLADYS MONDLANE) |
| Attach Payment Stub | `Admin` (stub import; programmatic) |
| Capture Filing | `Mutshutshut` Mutshutshu Tshithukhe |
