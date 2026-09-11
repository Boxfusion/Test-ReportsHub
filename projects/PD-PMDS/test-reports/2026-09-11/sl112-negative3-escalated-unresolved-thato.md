# PMDS SL 1-12 — Contracting Negative #3: Escalated Dispute, BOTH LEVELS UNRESOLVED (Thato Mali)

**Date:** 2026-09-11
**Cycle:** SL 1-12 Performance Agreement, FY2026/27 — **Contracting** stage
**App:** HCM Admin Portal (PMDS module) — https://pd-hcm-adminportal-qa.shesha.app/ (QA)
**Ref:** PA2026/7724 (Thato Mali)
**Result:** PASSED — workflow terminated correctly at "Dispute Unresolved"

## Context

Negative workflow #3 = dispute → mediator **not** resolved → escalated → mediator-supervisor **also
not** resolved → the workflow must terminate without routing onward.

Chain: **ThatoMali** → supervisor **Lungile Nhleko** (`LungileN`) → mediator **Babalwa M** (`BabalwaM`)
→ mediator-supervisor **Sampha Sampha** (`Sampha`) → terminal.

## Steps executed (live, headed)

1. **Employee Draft & Submit** (`ThatoMali`/`123qwe`, PA2026/7724). 4 KRAs @ 25%, 4 GAFs, 8 key
   activities, 1 PDP → **Submit**. Status Draft → Review.
2. **Supervisor Refer for Dispute** (`LungileN`) — comment "Disagreement on scope of the stock control
   KRA." Status Review → Under appeal.
3. **Mediator NOT resolved** (`BabalwaM`) — comment + attachment → **Submit**. Escalated.
4. **Mediator-supervisor ALSO NOT resolved** (`Sampha`) — comment + attachment → **Approve**.
5. **Terminal confirmed.** No further task generated for the employee or supervisor.
6. **Verification (admin).** Employee List: **Thato PA2026/7724 — Contracting Status = "Dispute
   Unresolved"**.

## Observations / notes

- Both levels of the not-resolved path required Comments + Attachments before the action button
  (Submit at mediator level, Approve at mediator-supervisor level) enabled — consistent with 2026-08-11.
- Confirmed via the admin Employee List rather than the Contracting summary tile, per the known
  tile-over-count defect on this terminal status
  (`bugs/2026-08-11-contracting-completed-tile-overcounts-dispute-unresolved.md`).

## Environment

- Employee default password `123qwe`; attachment fixture `test-data/mediation-outcome.txt`.
