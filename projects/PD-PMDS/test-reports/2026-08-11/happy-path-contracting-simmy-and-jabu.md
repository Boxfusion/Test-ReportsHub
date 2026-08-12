# PMDS SL 1-12 Performance Agreement — Contracting Happy Path ×2 (Simmy Mthalane, Jabu Hadebe)

**Date:** 2026-08-11
**Cycle:** SL 1-12 Performance Agreement, FY2026/27 — **Contracting** stage
**App:** HCM Admin Portal (PMDS module) — https://pd-hcm-adminportal-qa.shesha.app/ (QA)
**Refs:** PA2026/6597 (Simmy Mthalane, Intern 1, SL6) · PA2026/6553 (Jabu Hadebe, Intern 2, SL5)
**Result:** PASSED — both agreements completed end-to-end to Generate PERSAL Input, no defects

## Context

The PMDS data set was **cleared again** before this run: all three stages of SL 1-12 were back to
NOT STARTED and the population had grown **42 → 43** employees. So this is a from-scratch rebuild of
the Contracting stage, not a continuation.

Chain for both employees: employee Draft → supervisor **Lungile Nhleko** (`LungileN`, HOD SALES SL10)
Sign → HR **Sales HR** (`SalesHR`) Verify → Generate PERSAL Input.

## Steps executed (live, headed)

1. **Admin — Open Contracting process.** `admin`/`P@ssw0rd` → SaGov.Pmds cycle views → FY2026/27 →
   SL 1-12 Performance Agreement → Manage Process → **Open process**. Submission Date to HR
   **2026-08-31**, Closing Date **2026-09-30**, initiate = **immediately**. Workflows staged live and
   settled at **43/43 In progress**; the card flipped to IN PROGRESS with a "Close process" action.
   Only the Contracting card exposed a visible "Open process" button — Mid-Year and Annual stay
   hidden until the prior stage closes (gating behaves as documented).
2. **Simmy — Draft & Submit** (`Simmy`/`123qwe`, PA2026/6597). Confirm Details showed Supervisor
   **Lungile Nhleko** and Mediator **Babalwa M** (Chief Director, **SL14**), both defaulted, no
   alternate needed. Scoring: 4 KRAs @ 25% (Total **100%**) each with a Batho Pele principle
   (Service Standards / Information / Openness and Transparency / Value for Money); 4 GAFs ticked
   (Initiative, Communication, Reliability, Job Knowledge). Workplan: 2 key activities per KRA
   (8 total). PDP: Supply Chain Management for the Public Service / Formal Course / 2026-08-31.
   2 attestations → **Submit**. Status **Draft → Review**; inbox emptied.
3. **Jabu — Draft & Submit** (`JabuH`/`123qwe`, PA2026/6553). Same structure, 4 KRAs @ 25%
   (Total 100%), 8 key activities, PDP Basic Project Management / Formal Course. **GAF list differed
   from Simmy's** — picked from his live list (Planning And Execution, Quality Of Work,
   Communication, Job Knowledge). → **Submit**, status Review.
4. **Supervisor Sign ×2** (`LungileN`). Both review tasks carried Close / Send back / Refer for
   Dispute / View In PDF / **Sign**. Signed Simmy then Jabu; no mandatory comment. Status
   **Review → HR Review** for both.
5. **HR Verify ×2** (`SalesHR`). Action "Verify Performance Agreement" — read-only PA plus a single
   **Confirmation** checkbox gating **Verify**. Verified both. Status **HR Review → Generate PERSAL Input**.
6. **Verification (admin).** Cycle Employee List confirms **Simmy PA2026/6597 = Generate PERSAL Input**
   and **Jabu PA2026/6553 = Generate PERSAL Input**.

## Observations / notes

- **The GAF list is per-employee** — Simmy's included Initiative / Flexibility / Reliability, Jabu's
  instead had Planning And Execution / Team Work / Management Of Financial Resources. Always read the
  live list rather than assuming fixed labels.
- **KRA weight is a dropdown** (10% / 15% / 20% / 25% / 30%), not free text; Batho Pele is a second
  dropdown on the same inline row. New KRA rows are entered at the **top** of the table and commit
  when the row's circular **Add** button is pressed, which also spawns the next blank row.
- **Babalwa M is now Salary Level 14** (previously recorded as SL13). Mediator for both interns.
- Wizard transitions were responsive throughout; every Next and Submit took on first click.
- Non-fatal console noise (`...reading 'cycle'`) and the stray "Test" banner persist — cosmetic, unchanged.

## Environment

- Employee default password `123qwe`; `SalesHR` is the **Contracting** HR-verify role.
- Inbox `dynamic/Shesha.Workflow/workflows-inbox`; tasks open via
  `shesha/workflow-action?id=<paId>&todoid=<todoId>`.
