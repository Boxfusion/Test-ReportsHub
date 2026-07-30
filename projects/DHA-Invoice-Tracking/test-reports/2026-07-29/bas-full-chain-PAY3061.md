# Report: BAS — DHA Invoice Tracking on TEST (Regression re-run, Full Chain to Paid + Filed)

**Date:** 2026-07-29 05:12 UTC
**Plan:** test-plans/invoice-process/bas.md
**App:** DHA SmartGov Invoice Tracking — https://dha-smartgov-adminportal-test.shesha.app/ (**TEST**)
**Execution Mode:** ai-driven (live MCP browser)
**Result:** ✅ PASSED — full chain complete, invoice **Paid + Filed** (11/11 steps)
**Duration:** ~12 min (07:56 → 08:08 SAST)
**Primary item:** PAY3061/2026 — Supplier ATLANTIS CORPORATE TRAVEL (KL772), Invoice DHA-INV-3061, R 24,500, **Payment Number 00003061**
**Workflow instance:** `ee3e9923-7b87-4e30-a8ed-1895dcb6b9a6`
**Secondary item:** PAY3065/2026 (`3492b7ab-cc4a-49cf-bcbd-ff5f3d663531`) — registered only, as a controlled retest of the Submit 500
**New finding:** ⚠️ the Register & Upload `Submit` 500 (`Activity_0e0c34w`) **recurred once and is intermittent** — see §3

## Summary
| Area | Result |
|------|--------|
| Login (Admin + ThabisoM + H19234198 + Mutshutshut) | [PASS] |
| Register & Upload Invoice (create) | [PASS] — but **1st Submit returned 500**, 2nd succeeded |
| BAS approval chain (Assign BFA → Authorise Invoice Voucher) | [PASS] — 6 steps, no errors |
| Upload Captured Invoices Report From BAS (`.txt` BAS report import) | [PASS] — Is Success=Yes, Payments Authorised=1 |
| Final Authorise Payment | [PASS] — auto-completed by the same import |
| Attach Payment Stub (payment stub `.txt` import) | [PASS] — Rows Affected 4, Payments Confirmed=1 → PAID |
| Capture Filing | [PASS] — process ended, invoice Filed |
| Regressions / 500s elsewhere in the chain | [NONE] |
| Register & Upload Submit stability | ⚠️ **INTERMITTENT** — 1 failure in 2 registrations today |

## 1. Verdict

**The BAS process on TEST is still working end-to-end.** Nothing that was fixed on 2026-07-28 has
regressed: every step from registration to filing completed, both imports behaved exactly as
documented, and no step other than the very first Submit produced an error.

The one thing worth the team's attention is that the Register & Upload `Submit` 500 that was declared
fixed yesterday **is not fully gone** — it reappeared once today and cleared on retry (§3).

## 2. Chain as executed

Data: supplier **ATLANTIS CORPORATE TRAVEL (KL772)**, invoice **DHA-INV-3061**, **R24 500**,
invoice date / service delivery date 29/07/2026, invoice PDF + supporting PDF attached.

| # | Step | Actor (login) | Input captured | Completed (SAST) |
|---|---|---|---|---|
| 1 | Register and Upload Invoice | System Administrator (`Admin`) | supplier, invoice row, 2 attachments | 07:59:42 (2nd Submit) |
| 2 | Assign Branch Finance Admin To Assign Certifier | Thabiso Maake (`ThabisoM`) | Branch Finance Admin = Thabiso Maake | 08:02:05 |
| 3 | Assign Responsible Person to Certify Invoice | Thabiso Maake | Official = Thabiso Maake | 08:02:33 |
| 4 | Certify Invoice | Thabiso Maake | "Goods and Service has been delivered satisfactory" | 08:02:56 |
| 5 | Prepare Voucher | Thabiso Maake | Outcome = *Verification is complete* + 4 × Yes checklist | 08:03:39 |
| 6 | Verify Voucher | Tshianeo Moirah Maboya (`H19234198`) | **Batch Number = BATCH-3061** + confirm tick | 08:04:51 |
| 7 | Authorise Invoice Voucher | Tshianeo Moirah Maboya | approval confirm tick | 08:05:06 |
| 8 | Upload Captured Invoices Report From BAS | *(auto — BAS report import)* | `bas-text-report-PAY3061.txt` | 08:06:12 — as KATLEGO CONSTANCE MALEPO NTSOANE |
| 9 | Final Authorise Payment | *(auto — same import)* | — | 08:06:13 — as HLEKANEI ROSE MATHE |
| 10 | Attach Payment Stub | *(auto — payment stub import)* | `payment-stub-PAY3061.txt` | 08:06:58 (status 7, programmatic) |
| 11 | Capture Filing | Mutshutshu Tshithukhe (`Mutshutshut`) | **Box Number = BOX-3061**, **File Range = 3051-3100** | 08:08:27 |

Final state: `Process/Details` → `status: 3` (Completed), `subStatus: 12` (Paid),
`activeTodoItems: []`.

Every previously documented per-step requirement held exactly as recorded — Verify Voucher's required
Batch Number, Capture Filing's Box Number + File Range, Prepare Voucher's four mandatory Business Unit
Response questions, and the multiple hidden `Submit` buttons (filter to a non-zero bounding box). The
single-login self-assign technique for the Finance-Unit hand-offs still works.

## 3. ⚠️ New finding — the Register & Upload Submit 500 is intermittent, not fixed

On **PAY3061**, the first click of `Submit` on *Register and Upload Invoice* returned the exact failure
signature of the bug closed yesterday:

```
POST /api/services/SheshaWorkflow/Process/UserTaskComplete  →  500
{"success":false,"error":{"code":0,
 "message":"An internal error occurred during your request!",
 "details":"Task execution failed. Workflow instance id: `ee3e9923-…`,
            elementId: `Activity_0e0c34w` (Exception has been thrown by the target of an invocation.)"}}
```

Request payload was well-formed (subject, model id, supplier guid, `dateReceived`, `decisionUid`).
**The UI showed no error** — the page simply stayed on the Draft form, which is the same silent-failure
behaviour logged yesterday for LOGIS Certify.

Clicking `Submit` a **second time, unchanged, ~16 s later succeeded (200)** and the item routed to
*Assign Branch Finance Admin* with status Draft → RECEIVED. Nothing was edited between the two clicks.

**Controlled retest — PAY3065/2026:** to establish whether the first attempt always fails, a second BAS
invoice was registered from scratch (DHA-INV-3065, R18 750, same supplier, same steps) and `Submit` was
clicked **once**. It returned **200** first time and routed correctly (subStatus 6 = RECEIVED).

So the failure is **intermittent, not deterministic and not first-attempt-specific**: 1 failure in 2
registrations today, cleared by an identical retry. Yesterday's 5/5 hard failure is genuinely gone —
what remains looks like a flaky/transient path through the same activity (`Activity_0e0c34w`).

**Impact for users:** because the UI reports nothing, a capturer whose Submit hits this will see the
form sit still and will most likely assume the click missed. Worth logging as a low-frequency defect
with the silent-failure aspect called out. Bug:
[bugs/2026-07-29-bas-register-upload-submit-500-intermittent.md](../bugs/2026-07-29-bas-register-upload-submit-500-intermittent.md).

## 4. Imports — both still correct

**BAS Report Import** (Notepad/`.txt` setting still active, form v6) —
`bas-text-report-PAY3061.txt`, built with
`node scripts/make-bas-text-report.js --payment 3061 --invoice DHA-INV-3061 --supplier KL772 --amount 24500 --type SUNDRY`:

```
History: Is Success = Yes | Rows Affected 0 | Rows Skipped 0 | Payments Authorised = 1
```

One import again completed **two** steps (*Upload Captured Invoices Report From BAS* **and**
*Final Authorise Payment*) and stamped Payment Number **00003061**.

**Payment Stub Import** — `payment-stub-PAY3061.txt`, built with
`node scripts/make-payment-stub.js --payment 00003061 --invoice DHA-INV-3061 --amount 24500`:

```
History: Is Success = Yes | Rows Affected 4 | Rows Skipped 0 | Payments Confirmed = 1
```

The zero-padded payment number (`00003061`) was required, as documented. *Attach Payment Stub* again
shows as programmatic (status 7) rather than a completed user task — cosmetic, unchanged.

## 5. Still outstanding (unchanged from 2026-07-28)

- **LOGIS is blocked at Certify Invoice** — `SetPaymentApprover` silent 500, "No supervisor found in the
  organization structure for Thabiso Maake"; all six ITS test users have `primaryOrganisation: null`.
  PAY3055/2026 is still parked there (verified present in the inbox today).
- **The 4 query branches remain unrunnable** — "Manage Supplier Related Queries" / "Resolve Queries"
  are assigned to HLEKANEI ROSE MATHE alone and no login is available for her.

## 6. Artefacts

- Import files: `test-data/bas-text-report-PAY3061.txt`, `test-data/payment-stub-PAY3061.txt`
- Attachments: `test-data/invoice-DHA-INV-3061.pdf`, `test-data/invoice-DHA-INV-3065.pdf`
- PAY3065/2026 is **parked at Assign Branch Finance Admin** and is resumable if a spare BAS item is
  needed next session.
