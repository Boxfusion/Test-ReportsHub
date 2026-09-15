# Test Report — Supervisor Review Performance Agreement (PMDS)

**Date:** 2026-07-14
**App:** HCM Admin Portal — PMDS module (QA) — https://pd-hcm-adminportal-qa.shesha.app/
**Cycle:** SL 1-12 Performance Agreement — FY2026/27
**Workflow ref:** PA2026/5901 (continues from `employee-draft-performance-agreement.md`)
**Supervisor:** Tania Smith (`Tester97`) — Position MEC, Salary Level 13
**Result:** PASSED — reviewed and signed; status advanced **Review → HR Review**

## Steps executed
1. **Login as supervisor** — `Tester97` / `123qwe`; switched view mode Live → Latest.
2. **Open review task** — Workflows → Inbox showed PA2026/5901, Action Required "Review Performance Agreement" (received from Lungile Nhleko). Opened it (`sagov-performanceagreement-wf-reviewperformanceagreement`).
3. **Review contents** — verified across tabs:
   - Details: employee (Lungile Nhleko, HOD SALES), supervisor (Tania Smith, MEC), alternate mediator (Adam Apple + reason).
   - Scoring: 4 KRAs at 25% each (**total 100%**), each with a Batho Pele Principle; GAF list present.
   - (Workplan Agreement & PDP tabs also populated from the draft.)
4. **Comment** — captured a review note ("KRAs, weightings (100%), key activities and PDP aligned… Approved with no dispute") and saved it.
5. **Sign** — clicked **Sign** (happy path, no dispute; did not use "Send back" or "Refer for Dispute").

## Outcome
- Task cleared from Tania's Inbox; Sent Items shows PA2026/5901 status **HR Review** (14/07/2026 14:48).
- The agreement has progressed to the HR verification stage.
- Screenshot: `pmds-pa-supervisor-signed-hrreview.png`.

## Notes
- Review screen actions: **Close**, **Send back** (return to employee), **Refer for Dispute** (invokes the mediator), **View In PDF**, **Sign** (approve). Signing with no dispute routes the PA to HR Review.
