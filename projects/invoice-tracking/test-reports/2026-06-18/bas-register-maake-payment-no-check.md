# Note: BAS Register & Upload (supplier Maake) — Payment Number field check

**Date:** 2026-06-18 10:20 UTC
**Item:** PAY10051/2026 (supplier **Maake** / Maaa123, INV-MAAKE-001, R2500)
**Actioned by:** ThulileM
**Result:** Registered & submitted → routed to "Assign Branch Finance Admin To Assign Certifier" (RECEIVED)

## Why
Re-ran Register & Upload to check whether a **Payment Number** field was missed (the BAS report import for PAY9991/2026 failed because that payment had no Payment Number).

## Finding
**The Register & Upload Invoice form has NO Payment Number field.** Full field inventory:
- Header: Date Received (auto = today), Supplier Name (+ ellipsis picker), Description
- Supplier Details (read-only, populated on supplier select)
- Invoices line: **Invoice Date, Service Delivery Date, Invoice No, Invoice Amount, Invoice Attachment** — no Payment Number column
- Other Supporting Documents, Comments
- Close / Submit

So the Payment Number is **not** captured at registration. It must be assigned at a later workflow step or by the BAS report import. (Confirmed `SOURCE DOC TYPE` = literal "Sundry" for BAS.)

## Next
Drive PAY10051/2026 through the chain (Assign BFA → Responsible Person → Certify → Prepare Voucher → Verify → Authorise → Final Authorise Payment) and inspect each step for a Payment Number field before re-attempting the BAS report import.
