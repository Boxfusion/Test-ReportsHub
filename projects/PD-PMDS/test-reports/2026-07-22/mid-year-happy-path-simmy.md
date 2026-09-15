# PMDS SL 1-12 — Mid-Year Assessment Happy Path (Simmy Mthalane)

**Date:** 2026-07-22
**Cycle:** SL 1-12 Performance Agreement, FY2026/27 — **Mid Year Assessment** stage
**App:** HCM Admin Portal (PMDS module) — https://pd-hcm-adminportal-qa.shesha.app/ (QA)
**Ref:** PR2026/7371 (PR prefix for Mid-Year, vs PA for Contracting)
**Result:** PASSED — full 3-step Mid-Year happy path completed to **Awaiting PERSAL Sync** / Completed.

## Setup — opening Mid-Year (admin)
- **Prerequisite discovered:** the Mid-Year "Open process" button is hidden until **Contracting is Closed**. Closed the Contracting process (admin → Close process → Yes) — Contracting went to **Completed** (our 6 kept their status; 35 never-driven seed employees stopped). The Mid-Year "Open process" button then appeared.
- Opened Mid-Year (Submission 2026-07-31, Closing 2026-08-31, **initiate immediately**). Mid-Year initiated for **exactly 4 employees** (In progress 4) — matching the expected population. (The 4 are the Contracting-completed intern/manager set; Adam's Dispute-Unresolved PA did not initiate a Mid-Year.)

## The 3-step chain (live, headed)
1. **Employee Self-Assessment** (`Simmy`/`123qwe`, form `sagov-employee-complete-self-assessment v37`): the 4 Contracting KRAs pre-loaded (each weight 25). Per KRA opened the **eye → Rate Key Activities** dialog and set **Own Score = 3** for each of the 2 key activities, adding a comment via the `wechat` icon (rating 3 needs a comment only — 1/2/4 would need comment **+** attachment). GAFs/"Generic Management Competences" are read-only (inherited: Communication, Job Knowledge, Reliability, Initiative). Filled the required page-level **Employee Comments** → **Submit** → status **Draft → Review**.
   - **Score→% quirk (known):** with all-3s the **Own overall showed 100%** (Supervisor/Agreed 0% until scored). Treat the Agreed value as authoritative.
2. **Supervisor Review & Sign** (`LungileN`/`123qwe`, form `sagov-supervisor-review-performance-assessment v38`): per KRA opened the eye → Rate dialog and set **Supervisor Score = 3** for each activity (matching Own → **no disagreement**, no inline Agreed-Score dropdown / dispute). Each KRA row settled to **3 / 3 / 3** (Own/Supervisor/Agreed); overall **100% / 100% / 100%**. Added page-level **Supervisor Comments** → **Sign** → status **Review → HR Review**.
3. **HR Verify** (`GOV005` = Andrew Smith / `123qwe` — the SaGov HR reviewer, **NOT SalesHR**; Sarah `EMP001234` is the co-reviewer): "Verify Performance Assessment" screen, read-only + **Confirmation** checkbox → **Verify** → status **HR Review → Awaiting PERSAL Sync**.

## Verification
- Task cleared from HR inbox after Verify.
- Mid-Year Manage Process dashboard: **41 Total / 37 Not Started / 3 In progress / 1 Completed** — Simmy on the Completed rollup.

## Notes / gotchas
- **Contracting must be Closed before Mid-Year can be Opened** (Open-process button gated on prior stage closure). New this session; worth noting for the process sequence.
- **HR verifier differs from Contracting:** Mid-Year = `GOV005`/`EMP001234`; Contracting = `SalesHR`.
- The **supervisor "silent KRA drop on Save"** gotcha did NOT occur this run — each KRA registered its Supervisor/Agreed score first time; still verified each row before Sign.
- Per-activity comment dialogs accept a scripted value-set; page-level Employee/Supervisor Comments were entered with a **real click + type** (scripted set doesn't satisfy the Submit/Sign enable-gate).
- Noisy but non-fatal `executeScriptSync` console errors and the "Test" info banner present throughout, as on Contracting.

## Environment
- Employee/supervisor pwd `123qwe`; Mid-Year HR verify = `GOV005` (Andrew Smith) / `EMP001234` (Sarah). Inbox: `dynamic/Shesha.Workflow/workflows-inbox`; tasks via `shesha/workflow-action?id=<id>&todoid=<todoId>`.
