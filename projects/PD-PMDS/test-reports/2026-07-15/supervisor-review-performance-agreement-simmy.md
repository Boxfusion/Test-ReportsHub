# Test Report — Supervisor Review Performance Agreement (Simmy Mthalane) (PMDS)

**Date:** 2026-07-15
**App:** HCM Admin Portal — PMDS module (QA) — https://pd-hcm-adminportal-qa.shesha.app/
**Cycle:** SL 1-12 Performance Agreement — FY2026/27
**Workflow ref:** PA2026/5947 (continues from 2026-07-14 `employee-draft-performance-agreement-simmy.md`)
**Employee:** Simmy Mthalane (`Simmy`) — Intern 1, Salary Level 6, PERSAL 78456320
**Supervisor:** Lungile Nhleko (`LungileN`) — Position HOD SALES, Salary Level 10
- **Mediator (default):** Tania Smith — MEC, Salary Level 13
**Result:** PASSED — reviewed and signed; status advanced **Review → HR Review**

## Steps executed
1. **Login as supervisor** — cleared the stale prefilled username (`Simmy`) and signed in as `LungileN` / `123qwe`.
2. **Open review task** — Workflows → Inbox showed PA2026/5947, Action Required "Review Performance Agreement" (received from Simmy Mthalane), status Review. Opened it (`sagov-performanceagreement-wf-reviewperformanceagreement`).
3. **Review contents** — verified the Performance Agreement Details on the Details tab: employee (Simmy Mthalane, Intern 1, SL6, PERSAL 78456320), supervisor (Lungile Nhleko, HOD SALES, SL10), default mediator (Tania Smith, MEC, SL13). Scoring / Workplan Agreement / PDP tabs populated from the draft (4 KRAs @25%, 8 key activities, 1 PDP).
4. **Comment** — captured a review note ("Reviewed KRAs, workplan and PDP. Weightings total 100% and activities are appropriate for the role. Approved and signed as supervisor.") and saved it.
5. **Sign** — clicked **Sign** (happy path, no dispute; did not use "Send back" or "Refer for Dispute").

## Outcome
- Task cleared from Lungile Nhleko's Inbox (Incoming Items = 0 items / No Data after signing).
- The agreement advanced **Review → HR Review** and landed in Sales HR's Inbox (verified in the HR verify step below).
- Screenshots: `pmds-review-screen.png`, `pmds-lungilen-after-sign.png`.

## Notes
- Review screen actions: **Close**, **Send back** (return to employee), **Refer for Dispute** (invokes the mediator), **View In PDF**, **Sign** (approve). Signing with no dispute routes the PA to HR Review.
- Second employee run of the PMDS Performance Agreement happy path (first was Lungile Nhleko's own PA2026/5901 on 2026-07-14); Simmy's routing supervisor is Lungile, whose default mediator auto-defaulted to Tania Smith with no mediator-validation blocker.
