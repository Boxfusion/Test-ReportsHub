# Test Report — HR Verify Performance Agreement (Simmy Mthalane) (PMDS)

- **Date:** 2026-07-15
- **App:** HCM Admin Portal — PMDS module (QA) — https://pd-hcm-adminportal-qa.shesha.app/
- **Cycle:** SL 1-12 Performance Agreement — FY2026/27
- **Workflow ref:** PA2026/5947 (continues from `supervisor-review-performance-agreement-simmy.md`)
- **HR user:** Sales HR (`SalesHR`)
- **Result:** ✅ PASS — verified; status advanced **HR Review → Generate PERSAL Input**

## Steps executed
1. **Login as HR** — signed in as `SalesHR` / `123qwe` (regular user, no view-mode toggle).
2. **Open verify task** — Workflows → Inbox showed PA2026/5947, Action Required "Verify Performance Agreement" (received from Lungile Nhleko), status HR Review. Opened it (`sagov-performanceagreement-wf-verifyperformanceagreement`).
3. **Review** — confirmed the Performance Agreement Details (employee Simmy Mthalane, supervisor Lungile Nhleko, mediator Tania Smith) and saw Lungile Nhleko's supervisor review comment carried through in the Comments thread (timestamped Jul 15, 2026 11:27 AM).
4. **Confirmation** — ticked "I confirm that the Performance Agreement details have been reviewed and are accurate" (enables Verify).
5. **Verify** — clicked **Verify** (happy path; did not use "Send back").

## Outcome
- Task cleared from HR's Inbox — PA2026/5947 no longer listed; only Sales HR's own unrelated draft PA2026/5895 remained.
- The agreement advanced **HR Review → Generate PERSAL Input** (PERSAL interface stage, matches smoke plan TC-09). PERSAL step itself is still in testing — left there.
- Screenshots: `pmds-verify-screen.png`, `pmds-saleshr-after-verify.png`.

## Notes
- Verify screen actions: **Close**, **Send back** (return upstream), **View in PDF**, **Verify** (gated by the confirmation checkbox).
- The Comments thread persists across workflow stages (supervisor's note visible to HR) — useful audit trail.
- **Full PMDS Performance Agreement happy-path chain now proven end-to-end for a second employee (Simmy Mthalane):** admin Open Process → employee Draft/Submit → supervisor Review/Sign → HR Verify → Generate PERSAL Input.
