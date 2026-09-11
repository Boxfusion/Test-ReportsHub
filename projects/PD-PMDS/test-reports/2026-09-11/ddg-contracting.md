# PMDS DDG Performance Agreement — Contracting, all 4 workflows blocked at HR Verify

**Date:** 2026-09-11
**Cycle:** Deputy Director General Performance Agreement, FY2026/27 — **Contracting** stage
**App:** HCM Admin Portal (PMDS module) — https://pd-hcm-adminportal-qa.shesha.app/ (QA)
**Refs:** PA2026/7786 (Kabelo Mabalane) · PA2026/7782 (Gail Mabalane) · PA2026/7784 (Thando Zide) ·
PA2026/7776 (Hennie Kruger)
**Result:** BLOCKED — all 4 assigned workflows correctly driven through every step up to and including
**HR Review**; none could reach Generate PERSAL Input because the HR-verify task landed **ownerless**
in every case

## Context

2 positive + 2 negative workflows, as requested:

| Employee | Login | Assigned workflow | Status reached |
|---|---|---|---|
| Kabelo Mabalane | `KabeloM` | Positive | HR Review (blocked — ownerless) |
| Gail Mabalane | `Gail` | Positive | HR Review (blocked — ownerless) |
| Thando Zide | `ThandoZide` | Negative 1 — resolved dispute | HR Review (blocked — ownerless) |
| Hennie Kruger | `GOV016` | Negative 2 — escalated dispute (resolved) | HR Review (blocked — ownerless) |

## Steps executed (live, headed)

1. **Admin — Open Contracting process.** Submission 2026-09-30 / Closing 2026-10-31, initiate
   immediately → 6 Total / 6 In progress.
2. **Kabelo — Draft & Submit** (PA2026/7786). Default mediator was blank on Confirm Details (same
   defect as 2026-08-11); assigned **Babalwa M** as Alternative Mediator + reason to unblock → 4 KRAs
   @ 25%, 4 CMCs, 8 key activities, PDP → Submit → **Lerato SCHREIBER (`55435009`) Sign**. Status → HR
   Review.
3. **Gail — Draft & Submit** (PA2026/7782) → **Thando Zide Sign**. Status → HR Review.
4. **Thando — negative 1, resolved dispute** (PA2026/7784). Draft → **Kabelo Mabalane Refer for
   Dispute** → **Lerato SCHREIBER mediator "resolved"** + comment → Submit → **Thando Update with
   Outcomes** → **Kabelo Review Updated** → Submit. Status → HR Review.
5. **Hennie — negative 2, escalated dispute** (PA2026/7776). Draft → **Babalwa M Refer for Dispute** →
   **Sampha Sampha mediator "not resolved"** (comment + attachment) → escalated to **Tania Smith
   (`Tester97`)** as Mediator Supervisor Review → selected "resolved" → **Approve** → **Hennie Update
   with Outcomes** → **Babalwa M Review Updated** → Submit. Status → HR Review.
6. **HR Verify attempted** (`SalesHR`, the documented DDG verifier) for all 4 — none found in inbox.
   Confirmed via admin Employee List that all 4 genuinely sit at **HR Review**, task exists but has no
   assignee — same shape as the CD/Director blocker on this same run (see
   `cd-director-contracting.md`), and the same class of issue as Kavitha's ownerless CD/D task on
   2026-08-11, now reproducing across both SMS-form cycles' entire populations.

## 🚧 Blocker — ownerless HR-verify task, needs manual reassignment

Same blocker as CD/Director (see that report for the detail on why I can't self-serve this via the
admin UI). **Action needed:** reassign the HR-verify step for PA2026/7786, PA2026/7782, PA2026/7784
and PA2026/7776 to `SalesHR`, then I can complete the Verify step and this cycle reaches Generate
PERSAL Input on all 4.

## Observations / notes

- The blank-default-mediator defect on Kabelo's Confirm Details step (from 2026-08-11,
  `bugs/2026-08-11-ddg-silent-validation-blocks-draft-wizard.md`) reproduced identically and was worked
  around the same way (Alternative Mediator = Babalwa M).
- DDG hierarchy (supervisor/mediator per employee) matched the 2026-08-11 record exactly.
- Given the ownerless HR-verify task now reproduces across **every** CD/D and DDG record this run (8 of
  8), while every SL 1-12 record routed correctly to `SalesHR`, this looks systemic to the two SMS-form
  cycles' HR-verify step configuration rather than a per-employee data gap — worth raising with
  whoever owns the workflow configuration, not just re-assigning case by case.

## Environment

- All DDG logins use password `123qwe`. Hennie Kruger = `GOV016`; Lerato SCHREIBER = `55435009`.
- Attachment fixture: `test-data/mediation-outcome.txt`.
