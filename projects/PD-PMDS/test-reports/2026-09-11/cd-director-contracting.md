# PMDS Chief Director/Director Performance Agreement — Contracting, all 4 workflows blocked at HR Verify

**Date:** 2026-09-11
**Cycle:** Chief Director/Director Performance Agreement, FY2026/27 — **Contracting** stage
**App:** HCM Admin Portal (PMDS module) — https://pd-hcm-adminportal-qa.shesha.app/ (QA)
**Refs:** PA2026/7790 (Tania Smith) · PA2026/7792 (Babalwa M) · PA2026/7800 (Sampha Sampha) ·
PA2026/7794 (Kavitha Naidoo)
**Result:** BLOCKED — all 4 assigned workflows correctly driven through every step up to and including
**HR Review**; none could reach Generate PERSAL Input because the HR-verify task landed **ownerless**
in every case (not in `SalesHR`'s inbox, not in `MaletshaN`'s)

## Context

2 positive + 2 negative workflows, as requested:

| Employee | Login | Assigned workflow | Status reached |
|---|---|---|---|
| Tania Smith | `Tester97` | Positive | HR Review (blocked — ownerless) |
| Babalwa M | `BabalwaM` | Positive | HR Review (blocked — ownerless) |
| Sampha Sampha | `Sampha` | Negative 1 — resolved dispute | HR Review (blocked — ownerless) |
| Kavitha Naidoo | `Gov012` | Negative 2 — escalated dispute (resolved) | HR Review (blocked — ownerless) |

## Steps executed (live, headed)

1. **Admin — Open Contracting process.** Submission 2026-09-30 / Closing 2026-10-31, initiate
   immediately → 13 Total / 13 In progress.
2. **Tania — Draft & Submit** (PA2026/7790, SMS form: 4 KRAs @ 25%, 4 CMCs, 8 key activities, PDP) →
   **Thando Zide Sign**. Status → HR Review.
3. **Babalwa — Draft & Submit** (PA2026/7792) → **Sampha Sampha Sign**. Status → HR Review.
4. **Sampha — negative 1, resolved dispute** (PA2026/7800). Draft → **Tania Smith Refer for Dispute**
   (comment-gated) → **Thando Zide mediator "resolved"** + comment → Submit → **Sampha Update with
   Outcomes** → **Tania Review Updated** → Submit. Status → HR Review.
5. **Kavitha — negative 2, escalated dispute** (PA2026/7794). Draft → **Naledi Khumalo (`GOV022`) Refer
   for Dispute** → **Babalwa M mediator "not resolved"** (comment + attachment) → escalated to
   **Sampha Sampha** as Mediator Supervisor Review → selected "resolved" → **Approve** → **Kavitha
   Update with Outcomes** → **Naledi Review Updated** → Submit. Status → HR Review.
6. **HR Verify attempted** (`SalesHR`) for all 4 — only found in inbox: none. Cross-checked
   `MaletshaN`'s inbox (the second known CD/D HR verifier from the 2026-08-11 run) — also empty of
   these 4 refs. Confirmed via admin Employee List that all 4 genuinely sit at **HR Review** (not
   stuck earlier in the chain) — the task exists, it simply has no assignee, exactly as previously
   diagnosed for Kavitha's PA on 2026-08-11 (`Kavitha's HR-verify step had no one assigned to it`),
   except this time it reproduced on **all four** CD/D records, not just one.

## 🚧 Blocker — ownerless HR-verify task, needs manual reassignment

On 2026-08-11 this was resolved by the test lead reassigning the task to `SalesHR` outside the normal
UI flow. I do not have an equivalent admin capability: the admin "Workflows" sidebar menu only exposes
the admin's own Inbox/My Items/Sent Items/Drafts, not a task-reassignment tool for other users' tasks.

**Action needed:** reassign the HR-verify step for PA2026/7790, PA2026/7792, PA2026/7800 and
PA2026/7794 to a verifier (e.g. `SalesHR`), then I can complete the Verify step and this cycle reaches
Generate PERSAL Input on all 4.

## Observations / notes

- All draft/scoring/workplan/PDP/dispute/mediation/escalation/update-with-outcomes/review-updated
  steps behaved exactly as documented on 2026-08-11 — no functional regressions found anywhere except
  the HR-verify assignment gap.
- The CD/D hierarchy (supervisor/mediator per employee) matched the 2026-08-11 record exactly, so this
  is treated as stable org-structure data, not re-verified from scratch.

## Environment

- All CD/D logins use password `123qwe`. Naledi Khumalo = `GOV022`; Kavitha Naidoo = `Gov012`.
- Attachment fixture: `test-data/mediation-outcome.txt`.
