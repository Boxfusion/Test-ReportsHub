# PMDS SL 1-12 — Refer-for-Dispute UNSUCCESSFUL (Adam Apple) under new hierarchy

**Date:** 2026-07-16
**Cycle:** SL 1-12 Performance Agreement, FY2026/27
**Employee:** Adam Apple (`adam`, Intern 4 SL7), PA2026/5973
**Result:** PASSED — unsuccessful-mediation path driven end-to-end; PA parks at "Under appeal" with no downstream task.

## New-hierarchy verification
Mediator = **Babalwa M** (Chief Director SL13) throughout — the dispute now routes to Babalwa M, not Tania. Login `BabalwaM`/`123qwe`.

## Steps executed (live, headed)
1. **Employee Draft & Submit** (`adam`): 5-step wizard — 4 KRAs @25% (Service Standards/Access/Courtesy/Value for Money), 4 GAFs, 2 Key Activities per KRA (8 total), 1 PDP (Ethics in the Public Service / Workshop). Submit → **Draft → Review** to LungileN.
2. **Supervisor Refer for Dispute** (`LungileN`): Review → **Refer for Dispute** (comment-gated confirm dialog) → **Review → Under appeal**, routed to Babalwa M.
3. **Mediator — NOT resolved** (`BabalwaM`): "Mediator Review Disagreement" → selected **"The disagreement has not been resolved"**, which revealed the **Mediator Dispute Resolution Outcome** sub-form with **Comments\*** AND **Attachments\*** (both mandatory). Filled the comment, uploaded `mediation-outcome.txt` (bound via the real file-chooser). → **Submit**.
4. **Result:** PA stays **"Under appeal"**; **Babalwa M's inbox is empty afterwards (0 items)** — the unsuccessful dispute produces **no active downstream task** for mediator/employee/supervisor/HR. Reproduces the 2026-07-15 behaviour (Adam), now under Babalwa M as mediator.

## Notes
- The unsuccessful path does NOT touch the broken "Update Performance Agreement with Outcomes" Submit (that's only on the resolved path — see `refer-for-dispute-jabu.md` + bug file).
- Same non-fatal `executeScriptSync` console noise as elsewhere.
