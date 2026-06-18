# Report: BAS — Final Authorise Payment (BAS Report Import) — FAILED (needs input)

**Date:** 2026-06-18 10:00 UTC
**Plan:** test-plans/invoice-process/bas.md (TC-12, ADO #102360)
**Execution Mode:** live MCP-driven, headed
**Result:** FAILED — import errored, payment NOT authorised
**Item:** PAY9991/2026 (OMNI TECHNOLOGIES), status Approved, at Final Authorise Payment
**Actioned by:** Admin (System Administrator)

## What was done
1. Logged in as **Admin / 123qwe**.
2. BAS Report → **BAS Report Import** → **History**: downloaded the previously-imported report **"BAS Payment Register for 15 Jan 2026 …(13).xlsx"** (the only prior import; it had Payments Authorised = 1).
3. Parsed it (xlsx = zip; read sheet XML). Header row columns: `Ln, FUNC NO, MICR NO, DISB NO, CAPTURE ID, AUTHORISE ID, INV RECDTE, SOURCE DOC NUMBER, PAYSTA, PAYMTD, PAYEE NAME, ENT TYPE, ENT NUMBER, CAPTURE DATE, AUTH DATE, INV DATE, SOURCE DOC TYPE, REGION, AMOUNT`. One data row.
4. Edited that data row to PAY9991/2026 per the field mapping:
   - FUNC NO (Payment No) = **9991** *(made up — see issue)*
   - CAPTURE ID / AUTHORISE ID = **15987634** (Thulile's PERSAL; was already this value)
   - INV RECDTE = 18/06/2026, INV DATE = 17/06/2026, AUTH DATE = 18/06/2026, CAPTURE DATE = 18/06/2026 (Excel serials)
   - SOURCE DOC NUMBER = **INV-ITS-001**, PAYEE NAME = **OMNI TECHNOLOGIES**, ENT NUMBER = **EM583**
   - SOURCE DOC TYPE = **Sundry** (BAS), PAYSTA = AUTH, PAYMTD = EBT, ENT TYPE = CSDSUP, AMOUNT = **1500**
   - Saved as `test-data/bas-report-PAY9991.xlsx` and uploaded via Import.

## Result
History row: **Is Success = No**, **Rows Affected = 0**, **Rows Skipped = 0**, **Payments Authorised = (blank)**,
Error Message = **"Object reference not set to an instance of an object."** (server-side NullReferenceException). No log file produced.

## Diagnosis (harness ruled out, per verify-before-claiming-app-bug)
- The xlsx rebuild is valid (re-parsed cleanly; descriptive fields verified).
- Dashboard confirms PAY9991/2026 = Approved, Invoice No INV-ITS-001, Supplier EM583/OMNI TECHNOLOGIES, Amount 1500.00, Date Received 18/06/2026 — all match the uploaded row.
- **PAY9991/2026 has NO "Payment Number" assigned** (dashboard column empty). The known-good sample row used `FUNC NO = 8634`, which likely matched an EXISTING payment number. Our made-up `9991` matches nothing.

## Open questions for the user (blocking)
1. Our payment has no Payment Number — **what should FUNC NO be**, and how does the import match a BAS payment that has no Payment Number yet? (Is the Payment Number assigned at an earlier point we should capture?)
2. Is **SOURCE DOC TYPE** exactly `Sundry` for BAS, or a specific code? (The working sample used `INV`.)
