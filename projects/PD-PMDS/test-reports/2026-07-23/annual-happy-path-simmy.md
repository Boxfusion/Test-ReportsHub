# PMDS SL 1-12 — Annual Assessment Happy Path (Simmy Mthalane) — BLOCKED at final step

**Date:** 2026-07-23
**Cycle:** SL 1-12 Performance Agreement, FY2026/27
**App:** HCM Admin Portal (PMDS module) — https://pd-hcm-adminportal-qa.shesha.app/ (QA)
**Ref:** PR2026/3717 (Simmy Mthalane, Intern 1) · workflow instance `e5d85ed8-10d5-442d-b240-1e144f8a53fa`
**Result:** PARTIAL — happy path proven through the entire chain **EXCEPT the final "Approve Outcome Letter" step**, which is blocked by a backend bug (HTTP 500, undefined workflow function). See bug `2026-07-23-annual-approve-outcome-letter-500-missing-function.md`.

## Context
Closed Mid-Year (→ Completed) and opened Annual (Open process, Submission 2026-07-31 / Closing 2026-08-31, initiate immediately). Annual → In Progress, **6 initiated**. Drove the full positive workflow for Simmy.

## The 2026-07-22 start-blocker is FIXED
On 2026-07-22, opening Annual created Draft entities but generated **no "Complete Self-Assessment" inbox task**, blocking the whole stage. **This run the task generated correctly** — Simmy had the self-assessment task in her inbox. Start-blocker resolved (bug `2026-07-22-annual-self-assessment-task-not-generated.md` → RESOLVED).

## Full Annual actor chain (longer than Mid-Year — adds Moderating Committee + Outcome Letter)
| # | Step | Actor (login) | Result |
|---|------|---------------|--------|
| 1 | Complete Self-Assessment | Simmy (`Simmy`) | ✅ 4 KRAs, both activities **Own = 3** + comments; Employee Comments → Submit → Review |
| 2 | Supervisor Review + Sign | LungileN (`LungileN`) | ✅ all 4 KRAs **Supervisor = 3** + comments; Supervisor Comments → Sign → moderation |
| 3 | Confirm Assessment (Moderating Committee) | SalesHR (`SalesHR`) | ✅ ticked Confirmation → Confirm Assessment |
| 4 | Sign Assessment (M-committee chairperson) | KamoM (`KamoM`) | ✅ Sign |
| 5 | Approve Assessment (Delegated Authority) | Tems (`Tems`) | ✅ Approve |
| 6 | Draft Outcome Letter (PMDS Practitioner) | KabeloM (`KabeloM`) | ⚠️ Letter subject + contact person (Kabelo Mabalane) → "Draft Outcome Letter"; toast **"Task saved successfully!"** BUT **"PDF generation unsuccessful"** — letter task submitted & routed, but Outcome Letter attachment ended up empty. Confirmation checkbox → **Submit** → routed to Tyla |
| 7 | **Approve Outcome Letter (Head of Business Unit)** | Tyla (`Tyla`) | ❌ **BLOCKED — HTTP 500** on `UserTaskComplete`: `getOutcomeLetterApproverFullNameWithTitle is not a function` (workflow-script defect). Task cannot complete. |

All users pwd `123qwe`. Steps 1–5 clean; step 6 saved but flagged the PDF-generation issue; step 7 is a hard blocker.

## Key structural findings (Annual vs Mid-Year)
- Annual adds a **"Moderating Score"** column to the KRA table (Own / Supervisor / Agreed / **Moderating**) and a **"Findings of Moderating Committee"** section (auto-derived: **Fully Effective Score → Pay Progression**). All scores 3; Overall 100% across all four columns.
- Annual has an **Outcome Letter** sub-flow (Draft by PMDS Practitioner → Approve by Head of Business Unit) that Mid-Year lacks.
- The post-supervisor HR step is **SalesHR "Confirm Assessment"** (the *Contracting* HR verifier — NOT the Mid-Year verifiers GOV005/EMP001234).

## The blocker (final step) — genuine backend bug
Clicking **Approve** on "Approve Outcome Letter" (Tyla) returns **HTTP 500**:
```
Task execution failed. Workflow instance id: e5d85ed8-10d5-442d-b240-1e144f8a53fa,
elementId: Activity_0jwh6hy (getOutcomeLetterApproverFullNameWithTitle is not a function)
```
- Form: `SaGov.Pmds/sagov-performancereview-approveoutcome-annualassessment v26`.
- Deterministic (reproduced 3+ times); UI shows no error toast — the failure is only visible in the network response.
- **Ruled out** harness (server-side script; a manual click fails identically), timing (stable across retries), and client validation (button enabled, request reaches server). Logged as a bug.

## Status
- Annual: In Progress 6 / **Completed 0**. Simmy PR2026/3717 parked at the "Approve Outcome Letter" step.
- Happy path proven end-to-end through step 6; the terminal step 7 is blocked by the undefined-function 500.

## Environment
- Chain logins (pwd `123qwe`): Simmy / LungileN / SalesHR / KamoM / Tems / KabeloM / Tyla.
- Instance viewer: `/shesha/workflow?id=e5d85ed8-10d5-442d-b240-1e144f8a53fa`.
