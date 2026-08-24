# PMDS SL 1-12 — Contracting Manager Happy Path (Lungile Nhleko)

**Date:** 2026-08-11
**Cycle:** SL 1-12 Performance Agreement, FY2026/27 — **Contracting** stage
**App:** HCM Admin Portal (PMDS module) — https://pd-hcm-adminportal-qa.shesha.app/ (QA)
**Ref:** PA2026/6549 (Lungile Nhleko, HOD SALES, SL10)
**Result:** PASSED — manager agreement completed end-to-end to Generate PERSAL Input, no defects

## Context

Lungile is a **manager**, so her own agreement runs one level up the hierarchy from the interns she
supervises: her supervisor is **Babalwa M** (`BabalwaM`, Chief Director SL14) and her mediator is
**Sampha Sampha** (Director of Engineering, SL13). HR verification is still `SalesHR`.

## Steps executed (live, headed)

1. **Employee Draft & Submit** (`LungileN`/`123qwe`, PA2026/6549). Confirm Details showed
   **Supervisor Babalwa M** and **Mediator Sampha Sampha**, both defaulted. Scoring: 4 managerial KRAs
   @ 25% (Total 100%) — Lead and manage the sales directorate / Compile and submit management reports /
   Manage directorate budget and expenditure / Develop and maintain staff capability, with Batho Pele
   principles Service Standards, Information, Value for Money, **Consultation**. 4 managerial GAFs
   ticked: **Leadership, Management Of Human Resources, Management Of Financial Resources, Planning And
   Execution**. Workplan: 8 key activities. PDP: Advanced Project Management for the Public Service /
   Formal Course. 2 attestations → **Submit**. Status Draft → Review.
2. **Supervisor Sign** (`BabalwaM`). Babalwa acts here as Lungile's **supervisor** (elsewhere in this
   run she is the interns' *mediator* — the same person occupies both roles at different levels).
   Reviewed → **Sign**. Status **Review → HR Review**.
3. **HR Verify** (`SalesHR`). Confirmation → **Verify**. Status **HR Review → Generate PERSAL Input**.
4. **Verification (admin).** Employee List: **Lungile PA2026/6549 = Generate PERSAL Input**.

## Observations / notes

- **Mediator change:** Lungile's defaulted mediator is now **Sampha Sampha**, not Tania Smith as in all
  previous runs. Since the mediator defaults to the supervisor's supervisor, this confirms **Sampha
  Sampha now sits above Babalwa M** — the same change that redirected the intern dispute escalations
  (see `negative-escalated-dispute-resolved-sanele.md`). Data/hierarchy change, not a defect.
- The managerial GAF list is distinct — Leadership and Management Of Financial/Human Resources are
  offered, which the interns' lists mostly are not.
- All Next/Sign/Verify actions took on first click; no 500s anywhere in this chain.

## Environment

- `LungileN` / `123qwe`; supervisor `BabalwaM` / `123qwe`; HR `SalesHR` / `123qwe`.
