# PMDS DDG — Mid-Year Assessment opened and all 4 assigned workflows driven to completion

**Date:** 2026-08-11
**Cycle:** Deputy Director General Performance Agreement, FY2026/27 — **Mid Year Assessment**
(cycle id `bd84d9b2-a30a-4605-aac3-19bb41f8c374`, 6 employees)
**App:** HCM Admin Portal (PMDS module) — https://pd-hcm-adminportal-qa.shesha.app/ (QA)
**Result:** PASSED — Contracting closed 6/6, Mid-Year opened 6/6, all four assigned workflows reached **Awaiting PERSAL Sync**. No defects found.

## Context

Second Mid-Year cycle run the same day, after the SL 1-12 full suite. The DDG population is the SMS
group, so this also exercises the **SMS variant** of the Mid-Year form for the first time — Contracting
had already shown that DDG and CD/D share an SMS-specific draft form.

At the start of the session DDG Contracting stood at **6/6 Completed** (this morning it was 5/6 with
S Maluleke still in Draft — the team finished hers in between), so closing Contracting stranded nobody.

## Steps executed (live, headed)

1. **Closed Contracting** (admin → Close process → *"Are you sure…"* → Yes). Contracting →
   **COMPLETED**, all 6 completions preserved. The Mid-Year card's **Open process** button appeared only
   after the close, confirming the gating again. The correct button was identified by walking each
   control up to its owning card — "Re-open process" contains the substring "open process" and a naive
   text match hits the wrong card.
2. **Opened Mid-Year** — Submission Date to HR **2026-08-31**, Closing Date **2026-09-30**, initiate
   **immediately**. Settled at `6 Total · 0 Not Started · 6 In progress · 0 Completed`. Because all six
   had completed Contracting, all six were initiated.
3. **Four self-assessments** (Own 3 on every activity + per-activity comment + page-level Employee
   Comments → Submit): Kabelo **PR2026/7514**, Gail **PR2026/7510**, Thando **PR2026/7512**,
   Hennie **PR2026/7504**.
4. **Positive paths** — Lerato SCHREIBER (`55435009`) signed Kabelo; Thando Zide signed Gail. Supervisor
   3 across all activities, page-level Supervisor Comments, **Sign**.
5. **Negative 1 — resolved at mediator (Thando).** Kabelo M set Supervisor **4** vs Own 3 on activity 1
   (Agreed 4, comment + attachment), rest at 3 → **Refer for dispute** → **Lerato** mediator selected
   *"The disagreement has been resolved"* → Submit → back to Thando.
6. **Negative 2 — escalated (Hennie).** Babalwa M same disagreement pattern → **Refer for dispute** →
   **Sampha** mediator *"has not been resolved"* (comment + attachment mandatory) → escalated →
   **Tania Smith (`Tester97`)** *"has been resolved"* → Submit.
7. **Update with Outcomes** (Thando, Hennie) → **Review with Outcomes** (Kabelo M, Babalwa M) — all four
   gated only by the Confirmation checkbox, all **first click**.
8. **HR Verify — `SalesHR`** on all four → **Awaiting PERSAL Sync**.

## Final state

| Employee | Ref | Scenario | Final status |
|---|---|---|---|
| Kabelo Mabalane | PR2026/7514 | positive | ✅ Awaiting PERSAL sync |
| Gail Mabalane | PR2026/7510 | positive | ✅ Awaiting PERSAL sync |
| Thando Zide | PR2026/7512 | negative 1 — dispute resolved at mediator | ✅ Awaiting PERSAL sync |
| Hennie Kruger | PR2026/7504 | negative 2 — escalated, resolved at tier 2 | ✅ Awaiting PERSAL sync |
| *(not ours)* S Maluleke | PR2026/7506 | — | Draft |
| *(not ours)* W van Zyl | PR2026/7508 | — | Draft |

Cycle tile: **`6 Total · 0 Not Started · 2 In progress · 4 Completed`** — 4 counted against exactly 4
genuine completions, **no over-count**.

## Findings

- **The SMS Mid-Year form uses Core Management Competencies, not GAFs.** The self-assessment renders
  *"Generic Management Competences: Personal Development Plan"* with the 3-column **Core Management
  Competencies / Process Competencies / Development Required** table, matching the SMS Contracting draft
  form. SL 1-12 shows the older GAF list. So the SMS-vs-non-SMS split carries through to Mid-Year.
- **The all-3s overall score differs between the two forms.** On the SMS form all-3s produced
  **Own 100% / Supervisor 100% / Agreed 100%**; on SL 1-12 the same input gives **100% / 75% / 75%**.
  The SMS form's three columns agree with each other, which is the more coherent result. Worth
  confirming with the test lead which calculation is intended, since the two stages of the same product
  disagree.
- **The inline Agreed Score behaves conditionally, and the earlier note needs refining.** When Supervisor
  equals Own, Agreed **auto-populates** with the same value. When they differ, the Agreed control appears
  **empty** and must be set explicitly. Verified by reading the select values directly rather than the
  rendered row text, which is easy to misread. The practical rule is unchanged — on a disagreement you
  must set Agreed yourself — but it does not "never default".
- **Escalation tier 2 uses Submit on Mid-Year, Approve on Contracting.** Tania's task ran on
  `sagov-performancereview-supervisor-mediatorreviewdisagreement v34` with a **Submit** button; the DDG
  Contracting equivalent used **Approve**. Same actor, same tier, different verb per stage.
- **HR verification for DDG Mid-Year is `SalesHR`** — consistent with DDG Contracting, and consistent
  with what SL 1-12 Mid-Year now does (see `sl1-12-midyear-assessments.md`, where the historic
  Andrew/Sarah routing no longer applies).
- **The supervisor per-activity Comments dialog again rendered with no buttons** (verified
  programmatically: zero visible buttons) and had to be closed via the modal **X**. Reproduced on a
  second cycle.
- **Supervisor scores save without a per-activity comment** — the on-screen "a rating of 3 requires a
  comment" rule is enforced on the employee side but not on the supervisor side.
- Every Submit / Sign / Verify processed on **first click**. No 500s, no stuck tasks, no silent KRA drops
  across 16 rating passes.

## Environment

- All logins pwd `123qwe`: `KabeloM`, `Gail`, `ThandoZide`, `GOV016` (Hennie), `55435009` (Lerato),
  `BabalwaM`, `Sampha`, `Tester97` (Tania), `SalesHR`. Admin `admin` / `P@ssw0rd`.
- Chain: Kabelo ← Lerato · Gail ← Thando · Thando ← Kabelo (mediator Lerato) · Hennie ← Babalwa
  (mediator Sampha, tier 2 Tania).
- Fixtures: `.playwright-mcp/supporting-doc.txt`, `.playwright-mcp/mediation-outcome-escalated.txt`.
- Cycle view `dynamic/SaGov.Pmds/sagov-cycle-details-view?id=bd84d9b2-a30a-4605-aac3-19bb41f8c374`.
