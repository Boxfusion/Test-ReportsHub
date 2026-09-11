# PMDS SL 1-12 — Contracting Negative #2: Escalated Dispute, RESOLVED (Sanele Sithole)

**Date:** 2026-09-11
**Cycle:** SL 1-12 Performance Agreement, FY2026/27 — **Contracting** stage
**App:** HCM Admin Portal (PMDS module) — https://pd-hcm-adminportal-qa.shesha.app/ (QA)
**Ref:** PA2026/7762 (Sanele Sithole)
**Result:** PASSED — two-level escalation resolved at the second level and completed to Generate PERSAL Input

## Context

Negative workflow #2 = dispute → mediator **cannot** resolve → **escalates to the mediator's
supervisor** → that supervisor **resolves** → employee updates with outcomes → supervisor approves →
HR verifies.

Chain: **SaneleS** → supervisor **Lungile Nhleko** (`LungileN`) → mediator **Babalwa M** (`BabalwaM`)
→ mediator-supervisor **Sampha Sampha** (`Sampha`) → HR **Sales HR** (`SalesHR`).

## Steps executed (live, headed)

1. **Employee Draft & Submit** (`SaneleS`/`123qwe`, PA2026/7762). 4 KRAs @ 25%, 4 GAFs, 8 key
   activities, 1 PDP → **Submit**. Status Draft → Review.
2. **Supervisor Refer for Dispute** (`LungileN`) — comment "Targets on two KRAs are not achievable as
   drafted." Status Review → Under appeal.
3. **Mediator NOT resolved** (`BabalwaM`) — selected "The disagreement has not been resolved",
   supplied comment + attachment (`test-data/mediation-outcome.txt`) → **Submit**. Escalated.
4. **Mediator-supervisor RESOLVES** (`Sampha`) — selected "resolved" + comment → **Approve**. Routed
   back to the employee.
5. **Employee Update with Outcomes** (`SaneleS`) — all tabs visited, confirmation ticked → **Submit**.
6. **Supervisor Review Updated PA** (`LungileN`) → **Submit**. Status → HR Review.
7. **HR Verify** (`SalesHR`) → **Verify**. Status HR Review → Generate PERSAL Input.
8. **Verification (admin).** Employee List: **Sanele PA2026/7762 = Generate PERSAL Input**.

## Observations / notes

- Escalation action button is **Approve** at the mediator-supervisor level; the mediator level uses
  **Submit** — consistent with the 2026-08-11 run.
- `Sampha` (`123qwe`) remains the mediator-supervisor above Babalwa M for this population.

## Environment

- Employee default password `123qwe`; attachment fixture `test-data/mediation-outcome.txt`.
