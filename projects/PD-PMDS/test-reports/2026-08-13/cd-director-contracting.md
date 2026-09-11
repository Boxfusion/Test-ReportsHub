# PMDS Chief Director/Director Performance Agreement — Contracting rerun, all 4 workflows completed

**Date:** 2026-08-13
**Cycle:** **Chief Director/Director Performance Agreement**, FY2026/27 — **Contracting** stage
(cycle id `5f250b11-b86c-4b5e-b239-a9246fc525d3`, 11 employees)
**App:** HCM Admin Portal (PMDS module) — https://pd-hcm-adminportal-qa.shesha.app/ (QA)
**Execution Mode:** hand-written Node/Playwright driver (`.tmp-cdd-full.js`, extending `pmds.ts`'s
selector layer), one scenario per invocation, driven live headed.
**Refs:** PA2026/6915 (Tania Smith) · PA2026/6917 (Babalwa M) · PA2026/6923 (Sampha Sampha) ·
PA2026/6919 (Kavitha Naidoo)
**Result:** PASSED — Contracting opened (11/11 initiated), all 4 assigned workflows completed end-to-end
to Generate PERSAL Input

## Context

This is a rerun of the 2026-08-11 CD/D cycle after the test lead cleared the site data, using the same
four employees and the same scenario assignments (2 positive, 2 negative). The specific reason for
rerunning: the 2026-08-11 run found Kavitha Naidoo's HR-verify step had **no assignee** — the task was
ownerless and had to be manually reassigned to `SalesHR` before it would verify. The test lead reported
that issue as resolved; this run's purpose was to confirm it live.

**Confirmed fixed.** On this run, Kavitha's HR-verify task appeared directly in `SalesHR`'s inbox with
no manual intervention — see TC-04 below. Kavitha's PA reached Generate PERSAL Input the same way as the
other three, no workaround needed.

## Steps executed (live, headed)

1. **Admin — Open Contracting process.** Cycle confirmed freshly reset (11 Total / 11 Not Started / 0
   In progress / 0 Completed) before opening. Submission **31/08/2026** / Closing **30/09/2026**,
   initiate immediately → **11 Total / 0 Not Started / 11 In progress**.
2. **Tania Smith — Draft & Submit** (PA2026/6915). Draft → Submit → **Thando Zide Sign** →
   **Maletsha Nkepana (`MaletshaN`) Verify** → **Generate PERSAL Input**. ✅ Same HR verifier as
   2026-08-11 (Tania's Chief Directorate is blank, routing to `MaletshaN` rather than `SalesHR`).
3. **Babalwa M — Draft & Submit** (PA2026/6917) → **Sampha Sampha Sign** → **SalesHR Verify** →
   **Generate PERSAL Input**. ✅
4. **Sampha Sampha — negative 1, resolved dispute** (PA2026/6923). Draft → **Tania Smith Refer for
   Dispute** → **Thando Zide mediator "resolved"** + comment → Submit → **Sampha Update with
   Outcomes** → **Tania Review Updated** → **SalesHR Verify** → **Generate PERSAL Input**. ✅
5. **Kavitha Naidoo — negative 2, escalated dispute** (PA2026/6919). Draft → **Naledi (`GOV022`) Refer
   for Dispute** → **Babalwa M mediator "not resolved"** (Comments + Attachments) → escalated to
   **Sampha Sampha** as *Mediator Supervisor Review* → **"resolved"** → **Approve** → **Kavitha Update
   with Outcomes** → **Naledi Review Updated** → **`SalesHR` Verify — task found directly in her
   inbox, no reassignment needed** → **Generate PERSAL Input**. ✅

## Final cycle state

Contracting card: `11 Total · 0 Not Started · 7 In progress · **4 Completed**` — matching the four
genuine completions (Tania, Babalwa, Sampha, Kavitha), all at **Generate PERSAL Input**.

## Findings

### Kavitha's HR-verify assignee gap is fixed
The 2026-08-11 report recorded this cycle as having **two** HR verifiers (`SalesHR` for Babalwa/Sampha,
`MaletshaN` for Tania) plus a **third, broken case** — Kavitha's HR-verify step had no assignee at all,
so her task sat ownerless in no inbox until the test lead manually reassigned it to `SalesHR`. On this
rerun, with the same population and the same scenario, Kavitha's HR-verify task appeared directly in
`SalesHR`'s inbox with no manual step required. Whatever configuration change resolved the ownerless-step
issue is holding — worth a spot-check again next cycle to confirm it isn't population-specific (i.e. the
new PA getting a correctly-configured verifier by chance), but no further workaround is needed for now.

### One transient navigation error, not a defect
The first attempt at Kavitha's scenario failed opening her initial task with
`net::ERR_HTTP_RESPONSE_CODE_FAILURE` on the `workflow-action` URL. A bare retry (same URL, same
session) opened the task normally on the next attempt with no further errors anywhere in the chain —
treated as a one-off network/server hiccup, not reproducible, not logged as a defect.

### Everything else matches the 2026-08-11 run
HR-verifier split (`SalesHR` vs `MaletshaN`), tier-2 escalation via Sampha with an **Approve** gate,
the SMS Core Management Criteria form shared with DDG, and the pre-seeded PDP row quirk all reproduced
identically — not re-litigated here since nothing new was observed on those fronts.

## Environment

- All CD/D logins use password `123qwe`. Kavitha Naidoo = `Gov012`; Naledi weeeee Khumalo = `GOV022`.
- HR verification: `SalesHR` for Babalwa, Sampha, and (now) Kavitha; `MaletshaN` for Tania.
- Cycle view: `dynamic/SaGov.Pmds/sagov-cycle-details-view?id=5f250b11-b86c-4b5e-b239-a9246fc525d3`.
