# Report: DHA Invoice Tracking — TEST environment run, first attempt (blocked)

**Date:** 2026-07-28 14:16 UTC
**Plan:** test-plans/invoice-process/bas.md
**App:** DHA SmartGov Invoice Tracking — https://dha-smartgov-adminportal-test.shesha.app/ (**TEST**)
**Execution Mode:** ai-driven (live MCP browser)
**Result:** 🔴 BLOCKED — `Submit` on Register and Upload Invoice returns 500 on both BAS and LOGIS; 0 of 8 planned chains executable
**Duration:** ~2 h (investigation)
**Environment:** **TEST** — https://dha-smartgov-adminportal-test.shesha.app
**API:** https://dha-smartgov-api-test.shesha.app
**Driver:** live MCP browser, hand-driven (same approach as the QA run of 2026-07-16)
**Goal:** repeat the QA coverage on TEST — BAS full chain, 3 BAS negatives, LOGIS full chain, 3 LOGIS negatives

> ✅ **Superseded the same day.** The team reconfigured the workflow definition and the blocker was
> cleared that evening — see [bas-full-chain-PAY3035.md](bas-full-chain-PAY3035.md). This report is kept
> as the record of the blocked first attempt and the root-cause investigation.

## Outcome

🔴 **Run blocked at the first step of both processes.**

`Submit` on **Register and Upload Invoice** returns HTTP 500 for **both** BAS and LOGIS, so no
invoice can be routed into the chain. 0 of the 8 planned chains could be executed.

Full analysis: [`test-reports/bugs/2026-07-28-bas-logis-test-env-register-upload-submit-500.md`](../bugs/2026-07-28-bas-logis-test-env-register-upload-submit-500.md)

## What was verified as working on TEST

| Area | Result |
|---|---|
| `Admin` / `DHA@Admin_2026#xP4!` login | ✅ same password as QA; lands on `workflows-inbox` |
| View mode Live → **Latest** switch | ✅ (resets to Live on each fresh login — re-switch after logging in) |
| Both processes offered under **Create New** | ✅ BAS Request For Payment, LOGIS Request For Payment |
| BAS Register & Upload form schema | ✅ identical to QA — Date Received auto-populated, Supplier "Select Item" modal (340 407 suppliers, **double-click** to select), read-only Supplier Details |
| Invoice grid | ✅ mandatory-field validation fires ("This field is required" ×8), Cancel icon clears it, **plus-circle** commits the row, `Total Amount` sums correctly |
| Attachments | ✅ invoice attachment and Other Supporting Documents both bind (real file-chooser upload) |
| LOGIS Register form | ✅ Order "Select Item" modal (4 269 orders), supplier + Supplier No auto-fill from the order, Business Unit person picker works, order amount/description shown; **no line-item panel** (same as QA/DHA) |
| All 22 ITS roles present | ✅ via `ShaRole/GetAll` — incl. Finance Unit, Internal Control, Capture Filing, Business Unit, Review Invoice Rejection, Payments Administrator, Payment Stub Import Administrator |
| BAS Report Import screen | ✅ loads, Import + History tabs; History shows prior **successful** TEST imports (latest 12/06/2026, `Is Success = Yes`, `Payments Authorised = 1`) |
| Payment Stub Import screen | ✅ loads, Import + History tabs |

### Downstream role logins — all confirmed on TEST

The user's information that "the users are the same" is **confirmed**. All six authenticate against
TEST with password `123qwe` (verified via `POST /api/TokenAuth/Authenticate`, all returned an access token):

| Person | Username | Role in the chain |
|---|---|---|
| Thabiso Maake | `ThabisoM` | Finance Unit — self-assign hand-off chain / certifier |
| Mutshutshu Tshithukhe | `Mutshutshut` | Internal Control (Capture Filing) + BAS query responder |
| Melissa Ndlovu | `00000000` | Approve Invoice (LOGIS) |
| Monicca J Kabini | `H18433740` | SCM — Assign Responsible Official + Pre-Authorise |
| Tshianeo Moirah Maboya | `H19234198` | Internal Control: Verify Voucher |
| Susanna Maria Erasmus | `H10226923` | Capture Filing (LOGIS) |

`Thabiso Maake` also resolves in the LOGIS Business Unit person picker, so the QA
**single-login self-assign technique** should carry over once the blocker is fixed.

## The blocker

`POST /api/services/SheshaWorkflow/Process/UserTaskComplete` → **500**

```
Task execution failed. Workflow instance id: `<guid>`,
elementId: `<activity>` (Exception has been thrown by the target of an invocation.)
```

| Process | Failing activity |
|---|---|
| BAS | `Activity_0e0c34w` |
| LOGIS | `Activity_117ve9d` |

Reproduced **5 times across 3 instances and 2 suppliers**:

| Ref No | Process | Data |
|---|---|---|
| PAY2952/2026 | BAS | ATLANTIS CORPORATE TRAVEL (KL772), R24 500 — 4 attempts |
| PAY2956/2026 | BAS | VANG GROUP (MAAA0868598), R7 300 |
| PAY2964/2026 | LOGIS | Order OR-124953, ATLANTIS (KL772), R3 200 |

All three remain as Drafts on TEST and can be resumed after a fix.

**This is a regression, not a never-worked feature.** Admin's own earlier TEST items got past this
step: BAS PAY2669/2026 reached *RECEIVED* with a Thabiso Maake comment on 12/06/2026, and LOGIS
PAY2819/2026 reached *VERIFIED* with a Melissa Ndlovu comment on 25/06/2026. So it broke between
**25/06/2026 and 28/07/2026**.

## Coverage not executed (all blocked)

| Planned | Status |
|---|---|
| BAS full chain → Paid + Filed | ⛔ blocked at Register & Upload |
| BAS negative — business related query | ⛔ unreachable (branches from Prepare Voucher) |
| BAS negative — supplier related query | ⛔ unreachable |
| BAS negative — Reject Invoice / Review Rejection | ⛔ unreachable |
| LOGIS full chain → Paid + Filed | ⛔ blocked at Register & Upload |
| LOGIS negative — business query | ⛔ unreachable (branches from Verify Invoice) |
| LOGIS negative — supplier query | ⛔ unreachable |
| LOGIS negative — Reject Invoice | ⛔ unreachable |

## Test data created for this run

- `test-data/invoice-DHA-INV-2952.pdf` — generated invoice attachment (BAS)
- `test-data/invoice-DHA-LOG-2964.pdf` — generated invoice attachment (LOGIS)

The QA BAS-report / payment-stub files in `test-data/` are **QA-generated**; when the chain becomes
runnable on TEST, download a fresh known-good report and stub from the **TEST** History tabs as
templates rather than reusing the QA ones (per the package/region-validity rule).

## Next steps

1. Escalate the blocker to a developer with the two `elementId` values — the client only sees the
   outer `TargetInvocationException`, so the inner exception needs a server log.
2. Ask what changed in the BAS/LOGIS process definitions (or the shared post-register activity)
   after 25/06/2026.
3. On retest, resume PAY2952 / PAY2956 / PAY2964 (still Drafts) or start fresh, then run the full
   8-chain suite as per the QA run.
