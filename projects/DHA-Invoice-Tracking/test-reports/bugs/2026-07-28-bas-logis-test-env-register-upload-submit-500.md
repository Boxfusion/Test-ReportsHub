# BLOCKER — TEST env: "Register and Upload Invoice" Submit fails with 500 on BOTH BAS and LOGIS

> ## ✅ RESOLVED — 2026-07-28 (same day, evening)
> The team reconfigured the workflow definition on TEST. Retested with a **fresh** BAS invoice
> (**PAY3035/2026**): `POST …/Process/UserTaskComplete` returned **200**, the item routed to
> *Assign Branch Finance Admin To Assign Certifier* and went Draft → **RECEIVED**. The whole BAS chain
> then ran green end-to-end (11/11 steps → **PAID**, workflow Completed) with **no 500 at any step**,
> and three further BAS registrations (PAY3039/3043/3047) submitted cleanly.
> Evidence: [../2026-07-28/bas-full-chain-PAY3035.md](../2026-07-28/bas-full-chain-PAY3035.md).
>
> **LOGIS confirmed fixed too** (later the same evening, after the LOGIS definition was reconfigured):
> PAY3055/2026 registered and submitted with `UserTaskComplete` → **200**, Draft → **RECEIVED**, routed to
> *Certify Invoice*. `Activity_117ve9d` no longer throws. Evidence:
> [../2026-07-28/logis-full-chain-PAY3055.md](../2026-07-28/logis-full-chain-PAY3055.md).
> ⚠️ The LOGIS chain is now blocked one step later by a **different** defect — a silent 500 at Certify
> Invoice: [2026-07-28-logis-certify-no-supervisor-silent-500.md](2026-07-28-logis-certify-no-supervisor-silent-500.md).
>
> The three parked drafts (PAY2952, PAY2956, PAY2964) were not resumed; clean chains were run instead.

| | |
|---|---|
| **Logged** | 2026-07-28 |
| **Resolved** | 2026-07-28 — BAS verified; LOGIS not yet retested |
| **Environment** | **TEST** — https://dha-smartgov-adminportal-test.shesha.app (API: https://dha-smartgov-api-test.shesha.app) |
| **Severity** | **Blocker** — no new invoice can be submitted; the entire ITS test suite is unrunnable on TEST |
| **Affects** | BAS Request For Payment **and** LOGIS Request For Payment |
| **Regression** | Yes — both processes worked on TEST in June 2026 (see *Evidence of regression*) |
| **Reproducibility** | 5/5 submits across 3 separate workflow instances and 2 suppliers |
| **Status on QA** | Not reproducible — the same chains ran green end-to-end on QA on 2026-07-16 |

## Summary

On the TEST deployment, clicking **Submit** on the first step of the invoice lifecycle
("Register and Upload Invoice") returns HTTP **500** from
`POST /api/services/SheshaWorkflow/Process/UserTaskComplete`.

The form itself saves correctly — Ref No is assigned, the supplier/order resolves, the invoice
grid row commits, attachments bind, and `Total Amount` sums. The failure is **server-side, in the
workflow activity that runs immediately after the Register user-task completes**, so the item never
routes onward and stays a Draft owned by the initiator.

## Server response

```json
{
  "result": null,
  "success": false,
  "error": {
    "code": 0,
    "message": "An internal error occurred during your request!",
    "details": "Task execution failed. Workflow instance id: `<instance-guid>`, elementId: `<activity-id>` (Exception has been thrown by the target of an invocation.)",
    "validationErrors": null
  },
  "unAuthorizedRequest": false,
  "__abp": true
}
```

`Exception has been thrown by the target of an invocation` is a .NET **`TargetInvocationException`** —
the real cause is the *inner* exception, which is not surfaced to the client. **A server-side log is
required to identify it.** The `elementId` values below point directly at the failing BPMN activity.

### Failing activity per process

| Process | Failing `elementId` |
|---|---|
| BAS Request For Payment | **`Activity_0e0c34w`** |
| LOGIS Request For Payment | **`Activity_117ve9d`** |

Different activity IDs, identical exception type — consistent with a **shared component invoked by
the post-register activity in both process definitions** (e.g. assignee/role resolution, a
notification step, or a subject/number-generation script).

## Steps to reproduce (BAS)

1. Log in to https://dha-smartgov-adminportal-test.shesha.app as `Admin` / `DHA@Admin_2026#xP4!`
2. Switch view mode **Live → Latest**
3. Workflows → **My Items** → **Create New** → **BAS Request For Payment**
   - Ref No is assigned immediately; `Date Received` auto-populates with today
4. Supplier Name ellipsis → search a supplier → **double-click** the row
   - Supplier Details panel populates read-only (correct)
5. In the **Invoices** panel fill Invoice Date, Service Delivery Date, Invoice No, Invoice Amount,
   attach the invoice file, then commit the row with the **plus-circle** button
   - Row commits and `Total Amount` sums (correct)
6. Attach an Other Supporting Document
7. Click **Submit**

**Expected:** redirect to My Items; item routes to *Assign Branch Finance Admin to Assign Certifier*.
**Actual:** 500 as above; the user stays on the form; the item remains a Draft.

LOGIS is identical except step 3 selects **LOGIS Request For Payment**, step 4 picks an **Order**
(supplier auto-fills) and a **Business Unit** person is chosen.

## Instances raised while reproducing

| Ref No | Process | Data | Attempts |
|---|---|---|---|
| **PAY2952/2026** | BAS | ATLANTIS CORPORATE TRAVEL (KL772), R24 500, inv `DHA-INV-2952` | 4 (incl. one with Description populated) |
| **PAY2956/2026** | BAS | VANG GROUP (MAAA0868598), R7 300, inv `DHA-INV-2956` | 1 |
| **PAY2964/2026** | LOGIS | Order OR-124953, ATLANTIS (KL772), R3 200, inv `DHA-LOG-2964` | 1 |

All three are left as Drafts on TEST and can be resumed once the fix lands.

## Ruled out before logging

Per the project rule *"rule out the test harness and the data layer before logging a failing UI test
as an app bug"*:

- **Not the harness** — reproduced by hand-driving the real UI via MCP, not a spec/retry loop. No
  synthetic events were used for the pickers (real click + type, per the Shesha AntD rule).
- **Not one bad record** — 3 independent workflow instances, 2 different suppliers, 2 different
  amounts, both process types.
- **Not a transient** — 5 consecutive submits over ~10 minutes.
- **Not the optional Description field** — same 500 with it `null` and populated
  (verified in the captured request payload).
- **Not a malformed request** — the captured payload is well-formed and complete:
  `{"id":"…","todoId":"…","data":{"subject":"Invoice(s) - DHA-INV-2952 | Supplier Name - ATLANTIS CORPORATE TRAVEL","model":{"id":"…","supplier":"…","dateReceived":"2026-07-28T00:00:00Z","description":null}},"decisionUid":"…"}`
- **Not missing roles/users** — all 22 ITS roles exist on TEST (`ShaRole/GetAll`), and all 6
  downstream role logins authenticate successfully (see the run report).
- **Not the import subsystem** — BAS Report Import and Payment Stub Import both load, and BAS
  Report Import History shows past successful imports with `Payments Authorised = 1`.

## Evidence of regression

Items previously initiated by `Admin` on TEST **did** get past this step:

| Ref No | Process | Created | Reached | Evidence |
|---|---|---|---|---|
| PAY2669/2026 | BAS | 10/06/2026 | status **RECEIVED** | comment by **Thabiso Maake**, 12 Jun 2026 1:51 PM — proves it routed to Finance Unit |
| PAY2819/2026 | LOGIS | 25/06/2026 | status **VERIFIED** | comment by **Melissa Ndlovu**, 25 Jun 2026 1:56 PM |

The last successful BAS Report Import on TEST is also dated **12/06/2026**.

➡️ **The breakage was introduced between 25/06/2026 and 28/07/2026.** Diffing the BAS/LOGIS process
definitions (or the shared activity handler) against their June state is the fastest route to the cause.

## Impact on planned coverage

Everything below was scheduled for this TEST run and is **blocked at step 1**:

- BAS full chain (Register → Assign BFA → Assign Responsible Person → Certify → Prepare Voucher →
  Verify Voucher → Authorise → BAS import → Payment Stub → Capture Filing → Paid + Filed)
- BAS negatives: business related query, supplier related query, Reject Invoice / Review Rejection
- LOGIS full chain (Register → Certify → Approve → Assign Responsible Official → Verify Invoice →
  Capture & Link → Pre-Authorise → Verify Voucher → BAS import → Payment Stub → Capture Filing)
- LOGIS negatives: business query, supplier query, Reject Invoice

## Asks

1. Server log / inner exception for `Activity_0e0c34w` (BAS) and `Activity_117ve9d` (LOGIS) on TEST.
2. Confirm what changed in these process definitions (or the shared post-register handler) after 25/06/2026.
