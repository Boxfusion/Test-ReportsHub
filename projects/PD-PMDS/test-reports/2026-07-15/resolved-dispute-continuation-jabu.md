# Test Report — Resolved-Dispute Continuation to Completion (Jabu Hadebe PA) (PMDS)

**Date:** 2026-07-15
**App:** HCM Admin Portal — PMDS module (QA) — https://pd-hcm-adminportal-qa.shesha.app/
**Cycle:** SL 1-12 Performance Agreement — FY2026/27
**Workflow ref:** PA2026/5905 (continues from `refer-for-dispute-performance-agreement-jabu.md`)
**Result:** PASSED — the post-resolution tail of the dispute path was completed; PA advanced to **Generate PERSAL Input**

## Context
Jabu Hadebe's PA had gone: employee Submit → supervisor **Refer for Dispute** → mediator **Resolved** → back to the **employee** as "Update Performance Agreement" (status Review). That hand-back had never been actioned. This run finishes it.

## Steps executed
1. **Employee update & re-submit** (`JabuH` / `123qwe`) — inbox item PA2026/5905, Action **"Update Performance Agreement"**, status Review. Screen title *"Update Performance Agreement with Outcomes"*, hint *"Update the Performance Agreement based on the Dispute Resolution Outcome"*. Tabs (Details/Scoring/Workplan/PDP) are **editable** here; the prior data was intact (4 KRAs @25% = 100%, 4 GAFs, 8 key activities, 1 PDP). Ticked the **Confirmation** checkbox *"I confirm that the Performance Agreement has been updated to reflect the outcomes of the dispute resolution process"* → **Submit**.
   - Gotcha: **Submit stays disabled until the Workplan Agreement tab has fully loaded** (it briefly shows "No Data / Loading…"); once loaded it enabled. Routes back to the supervisor.
2. **Supervisor re-review & approve** (`LungileN`) — inbox action screen *"Review Updated Performance Agreement with Outcomes"*, hint *"Review the updated Performance Agreement Details and Approve"*. Buttons: Close / Send back / View In PDF / **Submit** (this step uses **Submit**, not "Sign"), gated by the same **Confirmation** checkbox. Ticked it → **Submit**. Status **Review → HR Review**.
3. **HR verify** (`SalesHR`) — inbox action "Verify Performance Agreement". Ticked the confirmation checkbox → **Verify**. Status **HR Review → Generate PERSAL Input**.

## Outcome
- PA2026/5905 now at status **Generate PERSAL Input** (confirmed in HR's Sent Items, 15/07/2026 15:35), alongside Simmy (5947) and Lungile (5901).
- The **resolved-dispute branch is now proven end-to-end**: employee Submit → supervisor Refer for Dispute → mediator Resolved → employee **Update Performance Agreement** → supervisor **Review Updated PA & Approve** → HR **Verify** → **Generate PERSAL Input**.
- Screenshots (hub root): `pmds-jabu-update-inbox.png`, `pmds-jabu-update-screen.png`, `pmds-jabu-update-scoring2.png`, `pmds-jabu-update-workplan.png`, `pmds-jabu-rereview.png`, `pmds-jabu-hr-sent.png`.

## Notes
- New workflow steps documented this run (post-resolution tail, not seen before): employee **"Update Performance Agreement with Outcomes"** (editable tabs + confirmation checkbox) and supervisor **"Review Updated Performance Agreement with Outcomes"** (approve via **Submit** + confirmation checkbox). Both differ from the pre-dispute Draft/Review-Sign screens.
- Closes the "resolved-dispute continuation" gap noted in the Contracting coverage review. Remaining Contracting gaps still open: supervisor/HR **Send back**, **alternate supervisor/mediator** assignment, **negative/validation** cases, and the **Generate PERSAL Input** step itself.
