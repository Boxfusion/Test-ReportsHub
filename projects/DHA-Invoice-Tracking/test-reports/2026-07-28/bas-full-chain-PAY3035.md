# Report: BAS — DHA Invoice Tracking on TEST (Full Chain to Paid + Filed)

**Date:** 2026-07-28 17:36 UTC
**Plan:** test-plans/invoice-process/bas.md
**App:** DHA SmartGov Invoice Tracking — https://dha-smartgov-adminportal-test.shesha.app/ (**TEST**)
**Execution Mode:** ai-driven (live MCP browser)
**Result:** ✅ PASSED — FULL CHAIN COMPLETE, invoice **Paid + Filed** (11/11 steps)
**Duration:** ~17 min
**Primary item:** PAY3035/2026 — Supplier ATLANTIS CORPORATE TRAVEL (KL772), Invoice DHA-INV-3035, R 24,500, **Payment Number 00003035**
**Blocker retest:** ⛔ → ✅ the Register & Upload Submit 500 (`Activity_0e0c34w`) is **FIXED**
**Workflow instance:** `edc6b19d-e124-4def-87eb-47f078792f97`

## Summary
| Area | Result |
|------|--------|
| Login (Admin + ThabisoM + H19234198 + Mutshutshut) | [PASS] |
| **Blocker retest — Register & Upload Submit** | [PASS] — `UserTaskComplete` **200** (was 500), Draft → RECEIVED |
| Register & Upload Invoice (create) | [PASS] |
| BAS approval chain (Assign BFA → Authorise Invoice Voucher) | [PASS] — 6 steps |
| Upload Captured Invoices Report From BAS (BAS report import) | [PASS] — Is Success=Yes, Payments Authorised=1, **new .txt format** |
| Final Authorise Payment | [PASS] — auto-completed by the same import |
| Attach Payment Stub (Payment Stub .txt import) | [PASS] — invoicesConfirmedPaid=1 → PAID |
| Capture Filing | [PASS] — process ended, invoice Filed |
| Regressions / 500s anywhere in the chain | [NONE] |

## 1. Blocker verification (the reason for this run)

The 2026-07-28 blocker
([bugs/2026-07-28-bas-logis-test-env-register-upload-submit-500.md](../bugs/2026-07-28-bas-logis-test-env-register-upload-submit-500.md))
made `Submit` on **Register and Upload Invoice** return 500 from
`POST /api/services/SheshaWorkflow/Process/UserTaskComplete`
(`elementId Activity_0e0c34w`, `TargetInvocationException`) on every attempt — 5/5 across 3 instances.

After the team reconfigured the workflow definition on TEST, a **fresh** BAS invoice was registered and
submitted with the same technique that previously failed (XHR interceptor left in place to capture any
500 body):

```
POST /api/services/SheshaWorkflow/Process/UserTaskComplete  →  200
{"result":{"todoItems":[]},"success":true,"error":null}
```

The item routed onward to *Assign Branch Finance Admin To Assign Certifier* and its status changed
Draft → **RECEIVED**. **Blocker cleared.** No 500 was seen at any step of the whole chain afterwards.

> Independent corroboration: `PAY3014/2026` (BAS, SETLOPO CONSOLIDATION) appears in Admin's My Items
> initiated **28/07/2026 18:53**, ~25 min before this run — i.e. the team's own post-fix verification.
> Not actioned by us, per the "never action an item we didn't create" rule.

## 2. Chain as executed

Data: supplier **ATLANTIS CORPORATE TRAVEL (KL772)**, invoice **DHA-INV-3035**, **R24 500**,
invoice date / service delivery date 28/07/2026, invoice + supporting PDF attached.

| # | Step | Actor (login) | Input captured | Result |
|---|---|---|---|---|
| 1 | Register and Upload Invoice | System Administrator (`Admin`) | supplier, invoice row, 2 attachments | 200 → **RECEIVED** |
| 2 | Assign Branch Finance Admin To Assign Certifier | Thabiso Maake (`ThabisoM`) | Branch Finance Admin = Thabiso Maake | 200, next task opened in-place |
| 3 | Assign Responsible Person to Certify Invoice | Thabiso Maake | Official = Thabiso Maake | 200 |
| 4 | Certify Invoice | Thabiso Maake | "Goods and Service has been delivered satisfactory" | 200 → **CERTIFIED** |
| 5 | Prepare Voucher | Thabiso Maake | Outcome = *Verification is complete* + 4 × Yes checklist | 200 |
| 6 | Verify Voucher | Tshianeo Moirah Maboya (`H19234198`) | **Batch Number = BATCH-3035** + confirm tick | 200 → **VERIFIED** |
| 7 | Authorise Invoice Voucher | Tshianeo Moirah Maboya | approval confirm tick | 200 → **APPROVED** |
| 8 | Upload Captured Invoices Report From BAS | *(auto — BAS report import)* | `bas-text-report-PAY3035.txt` | auto-completed |
| 9 | Final Authorise Payment | *(auto — same import)* | — | auto-completed → **AUTHORIZED** |
| 10 | Attach Payment Stub | *(auto — payment stub import)* | `payment-stub-PAY3035.txt` | auto-completed → **PAID** |
| 11 | Capture Filing | Mutshutshu Tshithukhe (`Mutshutshut`) | **Box Number = BOX-3035**, **File Range = 3001-3050** + confirm tick | 200 → workflow **Completed** |

Final state: `Process/Details` → `status: 3` (Completed), `activeTodoItems: []`, header badge **PAID**.

## 3. Imports — the new Notepad (.txt) setting works

This is the **first successful `.txt` (RP0111BS) BAS report import on TEST**, which was unverified when
the format was reverse-engineered this morning.

**BAS Report Import** — `bas-text-report-PAY3035.txt`, built with
`scripts/make-bas-text-report.js --payment 3035 --invoice DHA-INV-3035 --supplier KL772 --amount 24500 --type SUNDRY`:

```
StartImport → 200 {"result":true}
History: Is Success = Yes | Rows Affected 0 | Rows Skipped 0 | Payments Authorised = 1
```

One import completed **two** workflow steps (Upload Captured Invoices Report *and* Final Authorise
Payment) and stamped the invoice with **Payment Number `00003035`**, Capture Date and Authorise Date
13/07/2026 (the template's dates).

Answers to the two questions left open this morning:
- **ENT TYPE does not have to match the supplier type** — the template's `SUNDRY` ENT TYPE was left
  as-is with supplier `KL772` and the import still matched and authorised. No change needed.
- **The payment stub import is not affected** by the Notepad setting — it has always been fixed-width
  `.txt` (RP007BS) and worked unchanged.

**Payment Stub Import** — `payment-stub-PAY3035.txt`, built with the new
`scripts/make-payment-stub.js` (added this run):

```
StartImport → 200 {"result":true}
Result: isSuccess true | rowsAffected 4 | rowsSkipped 0 | invoicesConfirmedPaid = 1
```

**Important:** the stub's payment-number field must carry the **zero-padded** number exactly as the BAS
import stamped it (`00003035`, not `3035`). Earlier QA stubs used the bare `3105`/`3167` because the
QA `.xlsx` route stored it unpadded — with the `.txt` route the `FUNC NO` keeps its leading zeros.

## 4. Notes / newly-discovered form requirements

Not documented before this run:

- **Verify Voucher has a required `Batch Number`** field. Submit stays disabled until it is filled —
  the confirmation checkbox alone is not enough. (Time was lost assuming the known "reviewer must
  Download Zip" gating applied here; it does not — Download Zip is optional on this step.)
- **Capture Filing has two required fields**, `Box Number` and `File Range`, plus its confirm tick.
- The "I confirm …" text next to each confirmation checkbox is a **`<button>` acting as a label** — it
  *toggles* the checkbox, so clicking both the box and the text cancels out.
- On **Prepare Voucher** and **Certify Invoice** there are multiple `Submit` buttons in the DOM; the
  extra ones are hidden (`getBoundingClientRect()` all-zero). Filter to visible before clicking.
- `Attach Payment Stub` shows as **`-` (never activated)** in `Process/Progress` even though the chain
  passed through it — the stub import completes it programmatically rather than as a user task. Cosmetic.
- Non-admin users (e.g. Tshianeo) have **no view-mode toggle** in the header (Shesha/header v25 vs v26
  for Admin) — the Live → Latest switch is an Admin-only step.
- The single-login **self-assign technique still works on TEST**: assigning "Thabiso Maake" at each
  Finance-Unit hand-off re-opens the next task in place (todoid changes, no inbox round-trip).

## 5. Artefacts

- Import files: `test-data/bas-text-report-PAY3035.txt`, `test-data/payment-stub-PAY3035.txt`
- New generator: `scripts/make-payment-stub.js`
- Attachment used: `test-data/invoice-DHA-INV-3035.pdf`
