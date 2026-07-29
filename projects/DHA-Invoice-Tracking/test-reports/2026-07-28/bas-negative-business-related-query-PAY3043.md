# Report: BAS Negative — Business Related Query (TEST)

**Date:** 2026-07-28 17:52 UTC
**Plan:** test-plans/invoice-process/bas.md
**App:** DHA SmartGov Invoice Tracking — https://dha-smartgov-adminportal-test.shesha.app/ (**TEST**)
**Execution Mode:** ai-driven (live MCP browser)
**Result:** ⚠️ PARTIAL — query raised at Prepare Voucher and routed correctly to "Resolve Queries"; the **response step could not be executed — no login for the assignee**
**Duration:** ~10 min
**Primary item:** PAY3043/2026 — Supplier ATLANTIS CORPORATE TRAVEL (KL772), Invoice DHA-INV-3043, R 2,500
**Covers:** TC-07 (Prepare Voucher — business query outcome); **TC-08 (Respond to Queries) NOT covered**
**Workflow instance:** `5fa1d158-df31-4f81-9a68-5411d48b6acd`

## Summary
| Area | Result |
|------|--------|
| Register + drive to Prepare Voucher | [PASS] |
| Prepare Voucher → Outcome **Send for business related query** | [PASS] |
| Business-query dialog + mandatory query text | [PASS] |
| Prepare Voucher completes, item routes onward | [PASS] — → **Resolve Queries** |
| **Respond to the query as the assignee** | [BLOCKED] — no login available |
| **Item returns to Prepare Voucher and completes to Paid + Filed** | [NOT RUN] |

## Steps as executed

Registered by `Admin`, driven by `ThabisoM`.

| # | Step | Action | API |
|---|---|---|---|
| 1 | Register and Upload Invoice | supplier KL772, invoice row R2 500, attachment | 200 → RECEIVED |
| 2 | Assign Branch Finance Admin To Assign Certifier | = Thabiso Maake | 200 |
| 3 | Assign Responsible Person to Certify Invoice | Official = Thabiso Maake | 200 |
| 4 | Certify Invoice | "delivered satisfactory" | 200 → CERTIFIED |
| 5 | Prepare Voucher | Outcome **Send for business related query** + 4 × Yes checklist | 200 |
| 5a | Query dialog `…-MatchtoOrderandVerifyInvoice-BusinessRelatedQuery-dialog v6` | *"Hint: You selected 'Send for business related query'. Please write a query."* — text **mandatory** | 200 |
| 6 | Routing assertion | Prepare Voucher **DONE**; new step **Resolve Queries** active | — |

Query text submitted: *the service delivery date on the invoice could not be confirmed against a
delivery note; please confirm delivery with the business unit before the voucher is prepared.*

## Finding — the two query types produce differently-named follow-up tasks

| Outcome | Follow-up task |
|---|---|
| Send for **supplier** related query | **Manage Supplier Related Queries** |
| Send for **business** related query | **Resolve Queries** |

Both are assigned to the same person on TEST (HLEKANEI ROSE MATHE). Worth knowing when writing
assertions — a single expected task name will not match both branches.

## ⛔ Why the branch could not be completed

Identical cause to the supplier-query run — see
[bas-negative-supplier-related-query-PAY3039.md](bas-negative-supplier-related-query-PAY3039.md) for the
full detail. In short: **Resolve Queries** is assigned to **HLEKANEI ROSE MATHE alone**, no login is
available on TEST (password unknown, cannot be reset — real work email linked), the task is not
role-visible to `ThabisoM` or `Mutshutshut`, and reassignment was declined.

Environment/role-data gap on TEST, **not an application defect** — the equivalent chain passed on QA on
2026-07-16 (`bas-negative-business-related-query-PAY3159.md`).

## Item left on TEST

**PAY3043/2026** — parked at *Resolve Queries*, awaiting a responder. Resumable as-is.
