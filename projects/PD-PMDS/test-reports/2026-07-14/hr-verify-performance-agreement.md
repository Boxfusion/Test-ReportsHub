# Test Report — HR Verify Performance Agreement (PMDS)

- **Date:** 2026-07-14
- **App:** HCM Admin Portal — PMDS module (QA) — https://pd-hcm-adminportal-qa.shesha.app/
- **Cycle:** SL 1-12 Performance Agreement — FY2026/27
- **Workflow ref:** PA2026/5901 (continues from `supervisor-review-performance-agreement.md`)
- **HR user:** Sales HR (`SalesHR`)
- **Result:** ✅ PASS — verified; status advanced **HR Review → Generate PERSAL Input**

## Steps executed
1. **Login as HR** — `SalesHR` / `123qwe` (regular user, no view-mode toggle).
2. **Open verify task** — Workflows → Inbox showed PA2026/5901, Action Required "Verify Performance Agreement" (received from Tania Smith), status HR Review. Opened it (`sagov-performanceagreement-wf-verifyperformanceagreement`).
3. **Review** — confirmed the Performance Agreement Details (employee, supervisor, mediator) and saw Tania Smith's earlier review comment carried through in the Comments thread.
4. **Confirmation** — ticked "I confirm that the Performance Agreement details have been reviewed and are accurate" (enables Verify).
5. **Verify** — clicked **Verify** (happy path; did not use "Send back").

## Outcome
- Task cleared from HR's Inbox; Sent Items shows PA2026/5901 status **Generate PERSAL Input** (14/07/2026 15:06).
- The agreement has progressed to the PERSAL interface stage.
- Screenshots: `pmds-pa-hr-verify.png`, `pmds-pa-hr-verified-persal.png`.

## Notes
- Verify screen actions: **Close**, **Send back** (return upstream), **View in PDF**, **Verify** (gated by the confirmation checkbox).
- The Comments thread persists across workflow stages (supervisor's note visible to HR) — useful audit trail.
