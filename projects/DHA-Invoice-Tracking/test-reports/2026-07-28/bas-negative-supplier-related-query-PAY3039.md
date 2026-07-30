# Report: BAS Negative — Supplier Related Query (TEST)

**Date:** 2026-07-28 17:50 UTC
**Plan:** test-plans/invoice-process/bas.md
**App:** DHA SmartGov Invoice Tracking — https://dha-smartgov-adminportal-test.shesha.app/ (**TEST**)
**Execution Mode:** ai-driven (live MCP browser)
**Result:** ⚠️ PARTIAL — query raised at Prepare Voucher and routed correctly to "Manage Supplier Related Queries"; the **response step could not be executed — no login for the assignee**
**Duration:** ~10 min
**Primary item:** PAY3039/2026 — Supplier ATLANTIS CORPORATE TRAVEL (KL772), Invoice DHA-INV-3039, R 1,500
**Covers:** TC-07 (Prepare Voucher — supplier query outcome); **TC-09 (Manage Supplier related Queries) NOT covered**
**Workflow instance:** `3a7c48bb-97b7-40f0-8f82-c8230c786a4d`

## Summary
| Area | Result |
|------|--------|
| Register + drive to Prepare Voucher | [PASS] |
| Prepare Voucher → Outcome **Send for supplier related query** | [PASS] |
| Supplier-query dialog + mandatory query text | [PASS] |
| Prepare Voucher completes, item routes onward | [PASS] — → **Manage Supplier Related Queries**, subStatus 14 |
| **Respond to the query as the assignee** | [BLOCKED] — no login available |
| **Item returns to Prepare Voucher and completes to Paid + Filed** | [NOT RUN] |

## Steps as executed

Registered by `Admin`, driven by `ThabisoM`.

| # | Step | Action | API |
|---|---|---|---|
| 1 | Register and Upload Invoice | supplier KL772, invoice row R1 500, attachment | 200 → RECEIVED |
| 2 | Assign Branch Finance Admin To Assign Certifier | = Thabiso Maake | 200 |
| 3 | Assign Responsible Person to Certify Invoice | Official = Thabiso Maake | 200 |
| 4 | Certify Invoice | "delivered satisfactory" | 200 → CERTIFIED |
| 5 | Prepare Voucher | Outcome **Send for supplier related query** + 4 × Yes checklist | 200 |
| 5a | Query dialog `…-MatchtoOrderandVerifyInvoice-SupplierRelatedQuery-dialog v3` | *"Hint: You selected 'Send for supplier related query'. Please write a query."* — text **mandatory**, `Ok` disabled until entered | 200 |
| 6 | Routing assertion | Prepare Voucher **DONE**; new step **Manage Supplier Related Queries** active | — |

Query text submitted: *banking details on the invoice do not match the supplier master record for
ATLANTIS CORPORATE TRAVEL (KL772); please confirm the correct account number.*

## ⛔ Why the branch could not be completed

The follow-up task **"Manage Supplier Related Queries"** is assigned to **HLEKANEI ROSE MATHE — and to
nobody else**:

```
Process/Progress → "Manage Supplier Related Queries" :: ACTIVE → HLEKANEI ROSE MATHE
```

- She is **not in the project credential set** (`projects/DHA-Invoice-Tracking/CLAUDE.md`).
- The task is **not role-visible** to anyone we can log in as — verified live: `ThabisoM` does not see
  it, and neither does `Mutshutshut`, who is the documented **BAS query responder on QA**.
- The test lead confirmed the password is **not available and cannot be reset**, because her real work
  email is linked to the account.
- Reassigning the task (`canReassign: true`) was offered and **declined**.

**This is an environment/role-data gap on TEST, not an application defect.** The same chain completed
on QA on 2026-07-16 (`bas-negative-supplier-related-query-PAY3167.md`), where the query was resolved by
the Business Unit and the item returned to Prepare Voucher.

➡️ **Action for the team:** provide a TEST account that holds the query-responder role, or add an
existing test user (e.g. Thabiso Maake / Mutshutshu Tshithukhe, as on QA) to it. Until then TC-08/TC-09
cannot be covered on TEST — this affects **four** branches: BAS supplier query, BAS business query, and
both LOGIS query equivalents.

## Item left on TEST

**PAY3039/2026** — parked at *Manage Supplier Related Queries*, awaiting a responder. It can be resumed
as-is once a login exists; no need to re-register.
