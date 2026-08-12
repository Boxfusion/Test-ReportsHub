# PMDS SL 1-12 — Contracting Happy Path (Tony Dayimane)

**Date:** 2026-08-11
**Cycle:** SL 1-12 Performance Agreement, FY2026/27 — **Contracting** stage
**App:** HCM Admin Portal (PMDS module) — https://pd-hcm-adminportal-qa.shesha.app/ (QA)
**Ref:** PA2026/6585 (Tony Dayimane, Intern 6, SL7, PERSAL 56849552)
**Result:** PASSED — completed end-to-end to Generate PERSAL Input, no defects

## Context

Third positive Contracting path of the day, run after the negative suite, giving a sixth completed
agreement on the rebuilt data set. Standard intern chain: **TonyD** → supervisor **Lungile Nhleko**
(`LungileN`, HOD SALES SL10) → HR **Sales HR** (`SalesHR`).

Tony was picked up by the normal "initiate immediately" population when Contracting was opened this
morning — his "Initiate Performance Agreement" task was already waiting, so **no late-joiner
onboarding was needed** this time (unlike 2026-07-23, when he had to be started individually from the
admin Employee List).

## Steps executed (live, headed)

1. **Employee Draft & Submit** (`TonyD`/`123qwe`, PA2026/6585). Confirm Details: Supervisor
   **Lungile Nhleko**, Mediator **Babalwa M** (Chief Director SL14), both defaulted. Scoring: 4 KRAs
   @ 25% (Total **100%**) — Provide general office administration support / Process incoming
   correspondence and records / Maintain accurate filing and record keeping / Support cost effective
   use of office resources, with Batho Pele principles Service Standards, Information, Openness and
   Transparency, Value for Money. 4 GAFs from his live list: **Quality Of Work, Job Knowledge,
   Communication, Reliability**. Workplan: 2 key activities per KRA (8 total). PDP: **Re-orientation
   in the Public Service / On the job training / 2026-08-31**. 2 attestations → **Submit**.
   Status **Draft → Review**.
2. **Supervisor Sign** (`LungileN`). Review task → **Sign**, no mandatory comment.
   Status **Review → HR Review**.
3. **HR Verify** (`SalesHR`). Confirmation checkbox → **Verify**.
   Status **HR Review → Generate PERSAL Input**.
4. **Verification (admin).** Employee List: **Tony PA2026/6585 = Generate PERSAL Input**.

## Observations / notes

- Tony's GAF list was different again (it included Leadership and Interpersonal Relationships, which
  Simmy's did not) — reinforcing that the GAF set is per-employee and must be read live.
- **PDP intervention type "On the job training"** exercised here for the first time; the other runs
  used Formal Course or Workshop. No difference in behaviour.
- Every Next / Sign / Verify took on the first click; no 500s, no silently dropped rows.

## Cycle state after this run

Contracting card: `43 Total · 0 Not Started · 35 In progress · 8 Completed`.

**Genuine completions = 7**, of which **6 are ours** (Simmy PA2026/6597, Jabu PA2026/6553,
Adam PA2026/6539, Sanele PA2026/6595, Lungile PA2026/6549, Tony PA2026/6585). The seventh,
**PA2026/6573** (PERSAL 11223344), was completed by someone else working in the environment during
this session — it sat at "HR Review" earlier in the run and is not part of this test set.

The **8th** counted item is **Thato PA2026/6557, status "Dispute Unresolved"** — the over-count
defect, see `bugs/2026-08-11-contracting-completed-tile-overcounts-dispute-unresolved.md`.

## Environment

- `TonyD` / `123qwe`; supervisor `LungileN`; HR `SalesHR`. All employee passwords `123qwe`.
