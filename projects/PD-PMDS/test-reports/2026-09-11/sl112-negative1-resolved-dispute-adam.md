# PMDS SL 1-12 — Contracting Negative #1: Resolved Dispute (Adam Apple)

**Date:** 2026-09-11
**Cycle:** SL 1-12 Performance Agreement, FY2026/27 — **Contracting** stage
**App:** HCM Admin Portal (PMDS module) — https://pd-hcm-adminportal-qa.shesha.app/ (QA)
**Ref:** PA2026/7704 (Adam Apple)
**Result:** PASSED — full resolved-dispute chain completed to Generate PERSAL Input

## Context

Negative workflow #1 = dispute referred to mediation → **mediator resolves at the first level** →
employee updates the PA with outcomes → supervisor approves → HR verifies.

Chain: **adam** → supervisor **Lungile Nhleko** (`LungileN`) → mediator **Babalwa M** (`BabalwaM`) →
HR **Sales HR** (`SalesHR`).

## Steps executed (live, headed)

1. **Employee Draft & Submit** (`adam`/`123qwe`, PA2026/7704). 4 KRAs @ 25% (Total 100%), 4 GAFs,
   8 key activities, 1 PDP. 2 attestations → **Submit**. Status Draft → Review.
2. **Supervisor Refer for Dispute** (`LungileN`) — comment "KRA weightings need review before sign
   off." Status Review → Under appeal, routed to mediator.
3. **Mediator resolves** (`BabalwaM`) — selected "The disagreement has been resolved" + comment →
   **Submit**. Routed back to the employee.
4. **Employee Update with Outcomes** (`adam`) — all tabs visited, confirmation ticked → **Submit**.
   Status → Review.
5. **Supervisor Review Updated PA** (`LungileN`) — approved via **Submit**. Status → HR Review.
6. **HR Verify** (`SalesHR`) — confirmation → **Verify**. Status HR Review → Generate PERSAL Input.
7. **Verification (admin).** Employee List: **Adam PA2026/7704 = Generate PERSAL Input**.

## Observations / notes

- Same shape as the 2026-08-11 run of this scenario; no regression of the previously-fixed
  Update-with-Outcomes Submit bug.

## Environment

- Employee default password `123qwe`; `SalesHR` is the Contracting HR-verify role for SL 1-12.
