# LOGIS re-route ("I am the wrong person to confirm the delivery") spawned a task with NO assignee — RESOLVED same day

> ## ✅ RESOLVED 2026-07-31, verified end to end
> An assignee was configured while this run was in progress. On re-check, *Re-route to Correct Business
> Unit* on **PAY3330/2026** showed `assignedTo: ["Melissa Ndlovu"]` (`00000000`), the task appeared in
> her inbox, and **the whole branch then worked correctly**:
>
> 1. Melissa opened `SAGovRequestForPayment-wf-Re-routetoCorrectBusinessUnit-Details v7`, which offers a
>    single **corrected Business Unit** picker (Submit disabled until set).
> 2. Selected a **different** person — Mutshutshu Tshithukhe — and submitted.
> 3. The item **looped back to *Certify Invoice*, re-assigned to Mutshutshu Tshithukhe** — so the
>    re-route genuinely re-targets the certifier rather than returning to the original one.
> 4. *Certify Invoice* re-opened with the outcome **reset** (not pre-filled from the previous attempt).
>    Certified "delivered satisfactory" as the new BU → routed to *Approve Invoice* (Melissa Ndlovu).
>
> **TC-04 therefore passes on QA.** The defect below was a missing assignee configuration, not a
> workflow-logic fault. PAY3330 is no longer stuck and is mid-chain at *Approve Invoice*.
>
> **Cosmetic app-text quirk noted:** the Re-route step's decision label reads **"Sumbit"** (misspelled),
> and Certify's happy-path decision logs as **"Pay Invoice"**. Compare the previously recorded
> "RjectInvoice" typo — same class of thing.
>
> The equivalent **TEST** defect (`2026-07-29-logis-reroute-wrong-person-no-assignee.md`, PAY3076)
> should be re-checked; it may need the same configuration applied there, and PAY3076 may still be stuck.
>
> Everything below is the original report, kept for the record.

---


**Environment:** DHA SmartGov Invoice Tracking (ITS) — **QA** (https://dha-smartgov-adminportal-qa.shesha.app/), view mode **Latest**
**Found:** 2026-07-31, post-deployment negative-path run
**Plan:** `test-plans/invoice-process/logis.md`
**Failing TC:** TC-04 — Re-route to Correct Business Unit (ADO #102233)
**Ref No:** **PAY3330/2026** (LOGIS, Order OR-126006, ATLANTIS CORPORATE TRAVEL / KL772,
invoice `DHA-LOG-3330`, R3 100 — line item 2 ACCOMMODATION)
**Workflow instance:** `f84e484c-29da-4ba1-96da-a82d60b25776`
**Suspected category:** `business-logic` (missing task-assignment rule in the process definition)

> **This is the same defect already logged on the TEST environment on 2026-07-29**
> (`2026-07-29-logis-reroute-wrong-person-no-assignee.md`, PAY3076). It **reproduces on QA on the
> newly deployed build**, so it is *not* environment-specific and was not fixed by this deployment.

## Expected
Per the plan and the PD behaviour, selecting **"I am the wrong person to confirm the delivery"** at
*Certify Invoice* should record the outcome and route the item to a **Re-route to Correct Business
Unit** task, owned by someone (on PD: the SCM Supervisor) who picks the corrected Business Unit —
after which the invoice loops back to *Certify Invoice* under the new end-user.

## Actual
The first half works. The second half has no owner.

1. *Certify Invoice* completed correctly — `outcome: 3`, `decisionLabel: "Wrong Person"`, completed by
   Thabiso Maake. The mandatory-comment dialog
   (`SAGovRequestForPayment-wf-CertifyInvoice-WrongPersontoConfirm-dialog v6`) behaved properly:
   **Ok stayed disabled until a comment was typed.**
2. *Re-route to Correct Business Unit* activated — `status: 1` — but with **`assignedTo: []`**.

The emptiness is diagnostic rather than incidental. In the same `Process/Progress` response every
*other* pending step carries at least a role label in `assignedTo`:

```
Assign Responsible Official        → ["Assign Responsible Official"]
Capture and Link Invoice on LOGIS  → ["Capture Payment on LOGIS"]
Pre-Authorise Payment              → ["Pre-Authorisation"]
Verify Voucher                     → ["Internal Control: Verify Voucher"]
Final Authorise Payment            → ["Final Authorisation"]
Attach Payment Stub                → ["Upload Payment Stub"]
Capture Filing                     → ["Internal Control"]
Re-route to Correct Business Unit  → []          ← nothing, not even a role
```

So the task appears to have **no assignment rule at all** in the process definition, rather than a rule
that resolved to an empty set of people.

## Nobody can action it — verified across every test account
All eight documented QA accounts were authenticated via `POST /api/TokenAuth/Authenticate` and their
inboxes queried with `InboxItemAssignedToMeSpecification`:

| Account | Login | Inbox items | Sees PAY3330 / any Re-route task |
|---|---|---|---|
| `Admin` | ok | 44 | **no** |
| `ThabisoM` | ok | 10 | **no** |
| `Mutshutshut` | ok | 8 | **no** |
| `00000000` (Melissa Ndlovu) | ok | 5 | **no** |
| `H18433740` (Monicca Kabini) | ok | 50 | **no** |
| `H19234198` (Tshianeo Maboya) | ok | 200 (capped) | **no** |
| `H23086050` (Lesetja Bambo) | ok | 0 | **no** |
| `H10226923` (Susanna Erasmus) | ok | 9 | **no** |

Because Tshianeo's inbox hit the 200-row page cap, hers was re-checked with a **server-side filter** on
`refNumber == "PAY3330/2026"` → `totalCount: 0`. The UI inbox for `ThabisoM` was also checked directly
and shows no Re-route row.

## Impact
**PAY3330/2026 is permanently stuck.** `Process/Details` → `status: 2` (InProgress),
`subStatus: 6` (Received). The invoice cannot be certified, rejected, paid or cancelled by any
available user, and there is no visible task anywhere to reassign — mirroring PAY3076 on TEST.

Any real user who picks this outcome — which is the honest answer whenever an invoice reaches the wrong
business unit — sends the payment into a dead end with no UI feedback that anything is wrong. The
certifier sees a normal successful submit.

## Repro
1. Log in as `Admin`, switch view mode Live → **Latest**.
2. Register a LOGIS Request For Payment against an order **that has line items** (e.g. OR-126006 —
   most QA orders have none; see the LOGIS run report for a usable list). Set Business Unit =
   Thabiso Maake, commit the invoice row, tick a line item, Submit.
3. Log in as `ThabisoM`, open *Certify Invoice*, select **"I am the wrong person to confirm the
   delivery"**, Submit, enter a comment, Ok.
4. `GET /api/services/SheshaWorkflow/Process/Progress?id=<instanceId>` → *Re-route to Correct Business
   Unit* is `status: 1` with `assignedTo: []`.
5. Check any/every inbox — the task is nowhere.

## Suspected cause
The *Re-route to Correct Business Unit* user task in the `SAGov-LOGIS-request-for-payment` definition
has no assignee configured (no role, no person, no expression). Every other task in the same definition
resolves a role. On PD this branch routed to the SCM Supervisor, so the rule likely exists there and was
never carried across to the SaGov/DHA definition.

## Suggested fix
Assign the task to the SCM Supervisor role (the PD owner of this step) — the same group that already
owns *Assign Responsible Official* — and confirm the loop back to *Certify Invoice* re-targets the
newly chosen Business Unit. A guard against activating a user task with an empty assignee set would
also stop this whole class of dead end.
