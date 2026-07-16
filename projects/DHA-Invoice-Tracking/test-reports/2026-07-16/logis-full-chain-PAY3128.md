# Report: LOGIS — DHA Invoice Tracking (Full Chain, Paid + Filed)

**Date:** 2026-07-16 17:33 UTC
**Plan:** test-plans/invoice-process/logis.md
**App:** DHA SmartGov Invoice Tracking — https://dha-smartgov-adminportal-qa.shesha.app/ (QA)
**Execution Mode:** ai-driven (live MCP browser)
**Result:** ✅ PASSED — FULL LOGIS CHAIN COMPLETE, invoice **Paid + Filed**
**Item:** PAY3128/2026 — Order **OR-124953**, Supplier **ATLANTIS CORPORATE TRAVEL** (KL772), Invoice **DHA-LOG-3128**, R 1,500, Payment No **3128**

## Summary
| Area | Result |
|------|--------|
| Register & Upload (order-driven) | [PASS] |
| Certify → Approve → Assign Responsible Official → Verify Invoice | [PASS] |
| Capture & Link on LOGIS (manual Payment No) | [PASS] |
| Pre-Authorise → Verify Voucher | [PASS] |
| Final Authorise (BAS report import, Source Doc Type **INV**) | [PASS] — Payments Authorised 1 |
| Attach Payment Stub (matched on **PO number**) | [PASS] — Payments Confirmed 1 → Paid |
| Capture Filing | [PASS] — process ended, Filed |

## Step-by-step (audit trail, all decisions on the happy path)
| # | Step | Login (user) | Notes |
|---|------|--------------|-------|
| 1 | Register & Upload Invoice | Admin (System Administrator) | Order OR-124953 → auto-filled Supplier ATLANTIS CORPORATE TRAVEL / KL772; Business Unit (End-user) = **Thabiso Maake**; invoice DHA-LOG-3128 R1500 + PDF; **no line-item panel / confirmation dialog on DHA** — Submit routed straight to Certify |
| 2 | Certify Invoice (delivered satisfactory) | **ThabisoM** — Thabiso Maake | routed to Approve Invoice by org structure |
| 3 | Approve Invoice (delivered satisfactory) | **00000000** — Melissa Ndlovu (CEO) | Supervisor Response |
| 4 | Assign Responsible Official (Official = Thabiso) | **H18433740** — Monicca J Kabini (SCM) | group "Assign Responsible Official" |
| 5 | Verify Invoice (Order Matching = Verification complete + 7-item checklist) | **ThabisoM** | routed to Capture & Link |
| 6 | Capture & Link Invoice on LOGIS | **ThabisoM** (SCM group) | **Payment Number 3128** entered manually; "Should payment proceed" = Yes; confirm checkbox |
| 7 | Pre-Authorise Payment | **H18433740** — Monicca (group "Pre-Authorisation") | Authoriser checklist read-only; confirm checkbox |
| 8 | Verify Voucher | **H19234198** — Tshianeo Moirah Maboya (group "Internal Control: Verify Voucher") | confirm checkbox only (no batch no for LOGIS) |
| 9 | Final Authorise Payment — **BAS report import** | Admin | edited row: Invoice DHA-LOG-3128, Supplier **KL772**, Amount 1500, **Source Doc Type = INV**, FUNC NO 3128. Is Success=Yes, **Payments Authorised 1** |
| 10 | Attach Payment Stub — **Payment Stub import** | Admin | edited line 21: **PO = OR-124953** (LOGIS matches on PO, not payment no), Invoice DHA-LOG-3128, Amount 1,500.00, payment no 3128. Is Success=Yes, **Payments Confirmed 1** → **Paid** |
| 11 | Capture Filing | **H10226923** — Susanna Maria Erasmus (group "Capture Filing") | Batch BATCH-3128, Box BOX-3128, File Range FILE-3128-001-010, confirm → process ended, **Filed** |

## LOGIS vs BAS — key differences confirmed on DHA
- **Order-driven registration:** select a confirmed open Order; supplier + business unit auto-populate. Business Unit field determines the certifier.
- **Payment Number captured manually** at Capture & Link (BAS assigns it from the BAS-report FUNC NO).
- **BAS report Source Doc Type = INV** for LOGIS (BAS = SUNDRY).
- **Payment stub matches on the Purchase Order Number** (OR-124953) — the PO field must hold the order no, not `NOT APPLIC` (which BAS uses; BAS matches on payment number).
- More approval roles / segregation of duties: needed 6 logins vs BAS's 3.

## Roles / logins used (all password `123qwe` except Admin)
- **Admin** / DHA@Admin_2026#xP4! — System Administrator: register + BAS/stub imports (import identity MIRRIAM NELLY OTTO)
- **ThabisoM** — Thabiso Maake (DDG Product 2): Business Unit / Certify / Verify Invoice / Capture & Link (SCM)
- **00000000** — Melissa Ndlovu (CEO): Approve Invoice
- **H18433740** — Monicca Johanna Kabini (Senior SCM Practitioner): Assign Responsible Official + Pre-Authorise Payment
- **H19234198** — Tshianeo Moirah Maboya: Verify Voucher (Internal Control: Verify Voucher)
- **H10226923** — Susanna Maria Erasmus: Capture Filing

## Artifacts
- `test-data/bas-report-PAY3128-LOGIS.xlsx` (edited BAS report, INV)
- `test-data/payment-stub-PAY3128-LOGIS.txt` (edited stub, PO OR-124953)
