# Report: LOGIS TC-04 — Re-route to Correct Business Unit (negative path, QA)

**Date:** 2026-07-31 07:53 UTC
**Plan:** test-plans/invoice-process/logis.md — TC-04 (ADO #102233)
**Environment:** **QA** — https://dha-smartgov-adminportal-qa.shesha.app/ (view mode **Latest**)
**Execution Mode:** ai-driven (MCP browser)
**Result:** PASSED
**Ref No:** **PAY3330/2026** — LOGIS, Order **OR-126006**, ATLANTIS CORPORATE TRAVEL (KL772),
invoice `DHA-LOG-3330`, **R3 100** (line item 2 of 5: ACCOMMODATION)
**Workflow instance:** `f84e484c-29da-4ba1-96da-a82d60b25776`

## Outcome

The re-route branch works, and the invoice then completed the **full remaining chain → PAID + FILED**.
`Process/Details` → `status: 3` (Completed), `subStatus: 12` (Paid). 12 step entries, no 5xx.

This run also cleared a defect found earlier the same day (see *Defect history* below).

## The re-route branch

1. **Certify Invoice** (`ThabisoM`, the Business Unit chosen at registration) — selected the third
   outcome, **"I am the wrong person to confirm the delivery"**.
   - [PASS] Recorded `outcome: 3`, `decisionLabel: "Wrong Person"`.
   - [PASS] Mandatory-comment dialog
     `SAGovRequestForPayment-wf-CertifyInvoice-WrongPersontoConfirm-dialog v6` appeared **after**
     Submit, with **Ok disabled until a comment was typed** — correct.
2. **Re-route to Correct Business Unit** activated, assigned to **Melissa Ndlovu** (`00000000`).
   - [PASS] Form `SAGovRequestForPayment-wf-Re-routetoCorrectBusinessUnit-Details v7` offers a single
     **corrected Business Unit** person picker; Submit stays disabled until it is set.
   - [PASS] Deliberately chose a **different** person — **Mutshutshu Tshithukhe** — rather than the
     original, in order to prove the branch re-targets rather than merely bouncing back.
3. **Loop back to Certify Invoice** — [PASS] re-assigned to **Mutshutshu Tshithukhe**, i.e. the newly
   chosen Business Unit. The outcome field came back **reset**, not pre-filled from the "wrong person"
   attempt, so the new certifier makes a fresh decision.
4. Certified "delivered satisfactory" as the new BU → routed to *Approve Invoice*.

## Completing the chain

| # | Step | Actor | Result |
|---|---|---|---|
| 1 | Register and Upload Invoice | `Admin` | pass — Submit first attempt, no 500 |
| 2 | Certify Invoice → **Wrong Person** | `ThabisoM` | pass — re-route branch taken |
| 3 | Re-route to Correct Business Unit | `00000000` Melissa Ndlovu | pass — BU changed to Mutshutshu |
| — | Certify Invoice (2nd pass) | `Mutshutshut` | pass — outcome reset, certified |
| 4 | Approve Invoice | `00000000` Melissa Ndlovu | pass |
| 5 | Assign Responsible Official | `H18433740` Monicca Kabini | pass — Official = Thabiso Maake |
| 6 | Verify Invoice | `ThabisoM` | pass — ⚠️ 7-question checklist still absent (known defect) |
| 7 | Capture and Link Invoice on LOGIS | `H23086050` Lesetja Bambo | pass — Payment No `3330` via hover-save |
| 8 | Pre-Authorise Payment | `H18433740` | pass |
| 9 | Verify Voucher | `H19234198` Tshianeo Maboya | pass — no Batch Number on LOGIS |
| 10 | Final Authorise Payment (BAS import) | `Admin` → GLADYS MONDLANE | pass — `Source Doc Type = INV` |
| 11 | Attach Payment Stub (stub import) | `Admin` (programmatic, `status 7`) | pass — invoice **Paid** |
| 12 | Capture Filing | `Mutshutshut` | pass — 3 required fields → **Paid + Filed** |

## Defect history — resolved during this run

The first attempt at this scenario found *Re-route to Correct Business Unit* activating with
**`assignedTo: []`**, invisible to all eight documented QA test accounts (verified by authenticating
each via `TokenAuth/Authenticate` and querying `InboxItemAssignedToMeSpecification`, plus a
server-side ref-number filter for the account whose inbox exceeded the 200-row page cap). That
reproduced the TEST defect `2026-07-29-logis-reroute-wrong-person-no-assignee.md` (PAY3076).

An assignee was configured while the run was in progress; on re-check the task showed
`assignedTo: ["Melissa Ndlovu"]` and the branch completed normally. Bug file updated to **RESOLVED**
with the verification trail:
[bugs/2026-07-31-logis-reroute-wrong-person-no-assignee-QA.md](../bugs/2026-07-31-logis-reroute-wrong-person-no-assignee-QA.md)

**Follow-up for the team:** the **TEST** environment probably still needs the same configuration —
PAY3076 is likely still stuck there.

## Still-open defect confirmed again
*Verify Invoice* on this item again showed **"Loading checklist items…"** with the 7 mandatory Yes/No
questions absent (`POST /api/services/Enterprise/CheckList/Initialise` → 404), and submitted anyway.
Unchanged from the main LOGIS run.
→ [bugs/2026-07-31-prepare-voucher-checklist-initialise-404.md](../bugs/2026-07-31-prepare-voucher-checklist-initialise-404.md)

## App-text quirks (cosmetic)
- The Re-route step's decision label logs as **"Sumbit"** (misspelled).
- Certify's happy-path decision logs as **"Pay Invoice"**.
- Compare the previously recorded **"RjectInvoice"** typo — same class of thing.

## Artifacts
- BAS report: `test-data/bas-text-report-PAY3330-LOGIS.txt`
- Payment stub: `test-data/payment-stub-PAY3330-LOGIS.txt`
