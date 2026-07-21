# PMDS SL 1-12 — Mid-Year Assessment happy path (Lungile Nhleko)

**Date:** 2026-07-17
**Cycle:** SL 1-12 Performance Agreement, FY2026/27 — **Mid Year Assessment** stage
**Employee:** Lungile Nhleko (`LungileN`), **Ref PR2026/7341**
**Result:** ✅ PASS — full Mid-Year happy-path chain completed to **Completed / Awaiting PERSAL Sync**.
**App:** HCM Admin Portal (PMDS module), https://pd-hcm-adminportal-qa.shesha.app/ (QA)

## Purpose
Complete the Mid-Year happy path for Lungile — the one Contracting-completed user still outstanding (her self-assessment had been sitting in Draft). Note Lungile is a **manager**, so her supervisor is **BabalwaM** (not LungileN), and her KRAs are managerial.

## Flow (3 participant steps)
1. **Employee Self-Assessment** (`LungileN`, `sagov-employee-complete-self-assessment v37`): 4 **managerial** KRAs @25% — *Ensure stakeholder engagement and reporting / Manage departmental budget and resources / Lead and manage the team to meet targets / Develop and mentor team members* — 2 key activities each (8 total). Every activity rated **3** (comment only). Page-level Employee Comments → **Submit** → Draft → Review.
2. **Supervisor Review** (`BabalwaM`, `sagov-supervisor-review-performance-assessment v38`): Supervisor Score **3** on all 8 activities (matching → auto-agree). All 4 KRAs verified as **Own 3 / Supervisor 3 / Agreed 3** (no silent-drop). Page-level Supervisor Comments → **Sign** → Review → HR Review.
3. **HR Verify** (`GOV005` = Andrew Smith): Confirmation checkbox → **Verify** → **Completed / Awaiting PERSAL Sync**.

## Dashboard reconciliation (final state, 2026-07-17)
- Mid Year Assessment: Total 41 · Not Started 37 · **In progress 0** · **Completed 4** (Simmy, Sanele, Jabu, Lungile). Adam is **not** counted — his unsuccessful-dispute assessment is **NOT REQUIRED**.

## Notes
- Confirms the happy path works identically for a **manager** (BabalwaM as supervisor) as for the interns (LungileN as supervisor).
- Ref prefix **PR**; Mid-Year HR verifier = `GOV005` / `EMP001234`.

## Environment
- Employee/supervisor pwd `123qwe`. Lungile's supervisor = `BabalwaM`. Mid-Year HR = `GOV005` (Andrew) / `EMP001234` (Sarah).
