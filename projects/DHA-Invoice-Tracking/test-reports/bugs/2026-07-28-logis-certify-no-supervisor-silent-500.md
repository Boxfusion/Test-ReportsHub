# BLOCKER — TEST env: LOGIS "Certify Invoice" fails with a **silent** 500 — no supervisor in the org structure

> ## ✅ RESOLVED — verified fixed 2026-07-29
> Re-driven on the same parked item (PAY3055/2026) with the same certifier and decision:
> `SetPaymentApprover` now returns **200** and the item routes to *Approve Invoice* resolved to
> **Melissa Ndlovu** — the same approver QA resolves to. The org structure has been populated for the ITS
> test users on TEST. Defect **#1 (missing org placement) is fixed**.
>
> ⚠️ Defect **#2 below — the silent failure — was NOT verified fixed**: it can't be re-tested now that the
> data is correct, and the identical silent-swallow behaviour was seen again on 2026-07-29 for the BAS
> register Submit 500 ([2026-07-29-bas-register-upload-submit-500-intermittent.md](2026-07-29-bas-register-upload-submit-500-intermittent.md)),
> so the underlying UI issue almost certainly remains. Keep that part open.
>
> Evidence: [../2026-07-29/logis-full-chain-PAY3055.md](../2026-07-29/logis-full-chain-PAY3055.md) — with
> this fixed, PAY3055 went on to complete the **entire 11-step LOGIS chain to Paid + Filed**, the first
> time LOGIS has ever run end-to-end on TEST.

| | |
|---|---|
| **Logged** | 2026-07-28 (evening, after the LOGIS workflow reconfiguration) |
| **Environment** | **TEST** — https://dha-smartgov-adminportal-test.shesha.app (API `https://dha-smartgov-api-test.shesha.app`) |
| **Severity** | **Blocker** for the LOGIS chain — no LOGIS invoice can get past step 2 |
| **Affects** | LOGIS Request For Payment → **Certify Invoice** |
| **Status on QA** | Not reproducible — the same step routed correctly on QA on 2026-07-16 (`logis-full-chain-PAY3128.md`) |
| **Item** | **PAY3055/2026** — parked at Certify Invoice on TEST |
| **Not the register 500** | The earlier `Activity_117ve9d` register blocker **is fixed**; this is a different, later failure |

## Summary

On the LOGIS chain, submitting **Certify Invoice** with *"Goods and Service has been delivered
satisfactory"* silently fails. The form saves (`UserTaskSave` → 200), then the call that resolves the
next approver returns **500**, the workflow does **not** advance, and **the UI shows the user nothing at
all** — no error message, no notification, no field validation. The radio stays selected and the item
remains at Certify Invoice.

## Server response

```
POST /api/services/SaGovInvoiceTracking/SetPaymentApprover/SetPaymentApprover
     ?saGovRequestForPaymentWorkflowId=7756a1cf-c1b4-45d5-a8d7-f0a2ff768d80
→ HTTP 500

{
  "result": null,
  "success": false,
  "error": {
    "code": 0,
    "message": "No supervisor found in the organization structure for Thabiso Maake.",
    "details": "No supervisor found in the organization structure for Thabiso Maake.",
    "validationErrors": null
  },
  "unAuthorizedRequest": false,
  "__abp": true
}
```

Preceding call: `POST /api/services/SheshaWorkflow/Process/UserTaskSave` → **200** (so the certification
decision itself is persisted; only the routing fails).

## There are two distinct defects here

### 1. Data / configuration — no test user is placed in the organisation structure (the blocker)

`Certify Invoice` routes to `Approve Invoice` by walking the org structure upwards from the certifier
("org structure routes to the correct approver", plan TC-03). On QA this resolved Thabiso Maake →
**Melissa Ndlovu (CEO)**. On TEST it resolves to nothing.

Checked live via `Entities/GetAll` on `Shesha.Domain.Person` — **every one of the six ITS test users has
`primaryOrganisation: null`** on TEST:

| Person | Username | `primaryOrganisation` |
|---|---|---|
| Thabiso Maake | `ThabisoM` | **null** |
| Mutshutshu Tshithukhe | `Mutshutshut` | **null** |
| Melissa Ndlovu | `00000000` | **null** |
| TSHIANEO MOIRAH MABOYA | `H19234198` | **null** |
| SUSANNA MARIA ERASMUS | `H10226923` | **null** |
| *(Monicca J Kabini `H18433740` did not resolve by name search at all)* | | |

So **no available test user can act as the LOGIS certifier**, because none of them has a supervisor to
route to. This is not fixable by choosing different test data — it needs the users placed in the
organisation hierarchy on TEST, the way they are on QA.

➡️ **Ask:** populate the org structure for the ITS test users on TEST (at minimum give the LOGIS
certifier a supervisor, as on QA where Thabiso → Melissa Ndlovu). Confirm which person is intended as
the LOGIS approver on TEST.

### 2. Product — the failure is invisible to the user (defect in its own right)

Independent of the missing data, a failed approver resolution should not be a dead end:

- The response is an unhandled **HTTP 500** ("internal error" shape) rather than a graceful validation
  message, even though the cause is a known, expressible business condition.
- **Nothing is surfaced in the UI.** No `ant-message`, no `ant-notification`, no inline error — verified
  by inspecting the DOM immediately after the click. Screenshot:
  [screenshots/logis-certify-silent-500-PAY3055.png](../2026-07-28/screenshots/logis-certify-silent-500-PAY3055.png)
- To the user, **Submit simply does nothing.** There is no way to tell the certification failed, and no
  indication of what to do about it. A tester without the network tab open would report this as
  "the Submit button doesn't work".

➡️ **Ask:** surface this as a validation message on the form (e.g. *"No supervisor is configured for
&lt;certifier&gt; — the invoice cannot be routed for approval. Contact your administrator."*) instead of
a silent 500.

## Steps to reproduce

1. Log in to TEST as `Admin` / `DHA@Admin_2026#xP4!`; switch view mode Live → **Latest**
2. Workflows → My Items → **Create New** → **LOGIS Request For Payment**
3. Order No ellipsis → pick a confirmed open order **that has invoiceable line items** (e.g. `OR-125489`)
4. Business Unit = **Thabiso Maake**
5. Invoices panel: Invoice Date, Service Delivery Date, Invoice No, attach a PDF → commit with **plus-circle**
6. **Order Line Items** panel appears → tick **Select** on the line item (Total Invoice Amount updates)
7. **Submit** → 200, item routes to *Certify Invoice* (this part works — register blocker is fixed)
8. Log in as `ThabisoM` / `123qwe`, open the *Certify Invoice* task
9. Choose *"Goods and Service has been delivered satisfactory - Invoice should be Paid"* → **Submit**

**Expected:** item routes to *Approve Invoice* (per plan TC-03).
**Actual:** `SetPaymentApprover` 500s with "No supervisor found…"; **no message is shown**; the item stays
at Certify Invoice.

## Impact

The entire LOGIS coverage is blocked at step 2 of 11:

- LOGIS full chain (Certify → Approve → Assign Responsible Official → Verify Invoice → Capture & Link →
  Pre-Authorise → Verify Voucher → BAS import → Payment Stub → Capture Filing)
- All three LOGIS negatives (business query, supplier query, Reject Invoice) — they branch from
  *Verify Invoice*, which is downstream of Certify
- The LOGIS re-route branch (TC-04, "I am the wrong person to confirm the delivery") is untested

## Ruled out before logging

Per the project rule *"rule out the test harness and the data layer before logging a failing UI test as
an app bug"*:

- **Not the harness** — hand-driven through the real UI via MCP; the failing call and its response body
  were captured from the network log, not inferred.
- **Not the register blocker** — `Register and Upload Invoice` now returns **200** and routes correctly
  (`Activity_117ve9d` is fixed). This is a separate failure two steps later.
- **Not a bad order choice** — reproduced on an order with confirmed invoiceable line-item capacity
  (`OR-125489`, R92, Max: 4, R0 previously invoiced).
- **Not my choice of certifier** — the QA run used the *same* Business Unit person (Thabiso Maake)
  successfully; and no other available test user has an org placement either.
- **Not a stale form** — the decision persisted (`UserTaskSave` 200); only the routing call failed.

## Separate observation — TEST and QA register forms now differ

Noted while reproducing, not a defect: on QA (2026-07-16) the DHA LOGIS register form had **no Order
Line Items panel and no "Submit Invoice with Order Line Items" confirmation dialog**. On TEST today the
register form is `…RegisterScanandUploadInvoices-Create **v13**` and **does** show the Order Line Items
panel (with `Select`, `(Max: n)` capacity and a `Reset Order Line Items` refresh), while **no**
confirmation dialog appears on Submit. The plan (TC-02 steps 20–27) matches the newer TEST behaviour for
the line-item panel but still expects the confirmation dialog.
