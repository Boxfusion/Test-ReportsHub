# PMDS SL 1-12 Performance Agreement — Contracting Negative Workflow #2 (re-run): Escalated Dispute, Resolved (Tony Dayimane)

**Date:** 2026-07-23
**Cycle:** SL 1-12 Performance Agreement, FY2026/27
**App:** HCM Admin Portal (PMDS module) — https://pd-hcm-adminportal-qa.shesha.app/ (QA)
**Ref:** PA2026/6382 (Tony Dayimane, Intern 6, Persal 56849552)
**Result:** PASSED — escalated dispute resolved at mediator-supervisor level, completed to Generate PERSAL Input. **Mediator not-resolved 500 did NOT recur** with the post-upload wait guard.

## Purpose
Re-run of negative workflow #2 on a fresh employee (a **late-joiner** created after the process opened) specifically to check whether the mediator "not resolved" Submit hits the intermittent 500 again. Also validates the newly-discovered **admin "Start Contracting"** onboarding path.

## Late-joiner onboarding via "Start Contracting" (new, verified)
The user created Tony Dayimane after the cycle was opened, so he had **no** Contracting PA (Not Started). Verified working onboarding path:
- Admin → cycle → **Employee List** → search **Persal 56849552** → click the row → **"Start Contracting"** button appears → click → dialog (form `reopen-process-individual`) with Submission Date to HR* + Closing Date* + Comments → set 2026-07-31 / 2026-08-31 → **Submit**.
- Result: an **"Initiate Performance Agreement"** task (PA2026/6382) appeared in TonyD's inbox. **This answers the earlier open question — admin CAN onboard a single late-joiner per-employee, without re-opening the whole process (so no reset-bug risk).**

## Steps executed (live, headed)
1. **Admin Start Contracting** for Persal 56849552 (above). ✅
2. **Employee Draft & Submit** (`TonyD`/`123qwe`, PA2026/6382). Confirm Details: **Supervisor Lungile Nhleko, Mediator Babalwa M** (standard intern chain). 4 KRAs @ 25% + 4 GAFs + 8 key activities + 1 PDP + 2 attestations → Submit. Draft → Review. ✅
3. **Supervisor Refer for Dispute** (`LungileN`, comment) → Under appeal → mediator. ✅
4. **Mediator NOT resolved** (`BabalwaM`): "not resolved" + Comments\* + Attachment\* (`mediation-outcome-escalated.txt`, `StoredFile/Upload` 200), **waited ~3s after upload**, then **Submit → processed first-click, NO 500**. Escalated to Tania. ✅
5. **Mediator-supervisor resolved** (`Tester97` = Tania): "Mediator Supervisor Review Disagreement…" → "has been resolved" + comment → **Approve** → routed back to employee. ✅
6. **Employee Update with Outcomes** (`TonyD`): visited tabs, ticked Confirmation (last of 11 checkboxes) → **Submit** first-click. → Review. ✅
7. **Supervisor Review Updated** (`LungileN`): approved via **Submit** (Confirmation-gated). → HR Review. ✅
8. **HR Verify** (`SalesHR`): Confirmation → **Verify** → **Generate PERSAL Input**. ✅
9. **Verification (admin):** Contracting **Completed 6 → 7** (Total 42 / 0 Not Started / 35 In progress).

## Key result — the 500 did not recur
With a **~3s wait after `StoredFile/Upload` returns 200** before clicking Submit, the mediator not-resolved Submit **succeeded on the first attempt** — no `UserTaskComplete` 500. This corroborates the Thato run (neg #3) and confirms the earlier Sanele 500 was a **timing/automation artifact**, not a workflow defect. The bug file remains downgraded (Low / cannot-reproduce-manually); recommended automation guard is now proven twice.

## Contracting cohort after this run (Completed = 7)
Genuine completions to Generate PERSAL Input: **Simmy, Jabu, Adam, Sanele, Lungile, Tony** (6). Plus **Thato** (Dispute-Unresolved terminal, the known Completed-tile over-count) = tile shows 7.

## Environment
- Employee default password `123qwe`. Supervisor `LungileN`; mediator `BabalwaM`; escalation recipient `Tester97` (Tania); HR `SalesHR`.
- Late-joiner onboarding: admin Employee List → search Persal → **Start Contracting** (form `reopen-process-individual`).
- Attachment: `.playwright-mcp/mediation-outcome-escalated.txt`.
