# Report: LOGIS — Re-route to Correct Business Unit/End-User (PAY10280, our own invoice)

**Date:** 2026-06-22 13:40 UTC
**Plan:** test-plans/invoice-process/logis.md (LOGIS-TC-04 — Re-route to Correct Business Unit/End-User)
**Spec:** n/a — driven live via Playwright MCP (multi-role)
**Execution Mode:** ai-driven (live MCP)
**Result:** PASSED — invoice re-routed to the correct business unit and returned to Certify Invoice under the new BU
**Duration:** ~10 min

## Summary
A brand-new **LOGIS** Request For Payment was **registered by us** (per the always-create-our-own rule) and driven to exercise the **"I am the wrong person to confirm the delivery"** outcome at Certify Invoice, which triggers the dedicated **Re-route to Correct Business Unit** step. The SCM Supervisor then re-assigned the correct business unit and the invoice looped back to Certify Invoice under that new BU.

- **Ref:** PAY10280/2026 — Order **KZ-016642** (End User on order: CYRIL MNCWABE), Supplier **ATLANTIS CORPORATE TRAVEL** (KL772), **INV-ATL-0622R**, order line item ADMIN FEE = R23.
- **Initial Business Unit:** Tania Smith → **Re-routed to:** Kamogelo Shabangu.

## Role map (all pwd 123qwe)
MoshadiM = LOGIS Capturer (Register & Upload) · TaniaSmith = Business Unit (Certify Invoice) · **SarahM = Sarah Mohlala, SCM Supervisor (Re-route to Correct Business Unit)** · Kamogelo Shabangu = corrected Business Unit (next Certify Invoice).

## Step results
- [PASS] Register & Upload (MoshadiM): Order ellipsis picker → KZ-016642 (auto-fills Supplier ATLANTIS CORPORATE TRAVEL, Business Unit Tania Smith, End User CYRIL MNCWABE); invoice line 02/06/2026 + 06/06/2026 + INV-ATL-0622R + attachment (no amount field); selected Order Line Item 1 (ADMIN FEE, R23) → Submit → status **Received**
- [PASS] Workflow advanced directly to **Certify Invoice** (Active, assigned to Tania Smith) — confirmed via Audit Trail
- [PASS] **Certify Invoice (TaniaSmith):** Business Unit Response = **"I am the wrong person to confirm the delivery"** (3rd radio) → Submit → mandatory comment dialog ("I am the wrong person to confirm delivery") → comment entered → Ok. Audit decision recorded as **WrongPerson**
- [PASS] Workflow created a dedicated **Re-route to Correct Business Unit** step, **Active**, received by **SCM Supervisor** (Sarah Mohlala)
- [PASS] **Re-route to Correct Business Unit (SarahM):** form shows the re-route message banner ("Message from Tania Smith to Sarah Mohlala: …"); **Business Unit** picker → typed/selected **Kamogelo Shabangu** → Submit
- [PASS] (BLOCKING) Audit Trail confirms: Re-route step **Completed by Sarah Mohlala**, and a fresh **Certify Invoice** step is now **Active, received by Kamogelo Shabangu**. Payment Details **End-user** changed Tania Smith → **Kamogelo Shabangu**

## Notes / discoveries
- The "Re-route to Correct Business Unit/End-User" branch is **not** a separate menu action — it is the **3rd Business Unit Response option at Certify Invoice**: *"I am the wrong person to confirm the delivery"*. Selecting it requires a mandatory comment, then spawns a **Re-route to Correct Business Unit** task (form `SAGovRequestForPayment-wf-Re-routetoCorrectBusinessUnit-Details`) routed to the **SCM Supervisor**.
- **SCM Supervisor login discovered: `SarahM` / 123qwe (Sarah Mohlala).** Previously only her name was recorded.
- This LOGIS workflow version goes **Register → Certify Invoice** directly (no separate Capture & Link / Pre-Authorise step appeared before Certify on this item).
- The re-route does **not** terminate the workflow — it re-assigns the Business Unit and loops back to Certify Invoice under the corrected BU, so the chain can continue normally from there.
- Branch left parked at Certify Invoice (Kamogelo Shabangu) — scope was the re-route itself, not a full run to Paid.
