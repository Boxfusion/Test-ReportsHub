# PMDS SL 1-12 — Contracting Negative #3: Escalated Dispute, BOTH LEVELS UNRESOLVED (Thato Mali)

**Date:** 2026-08-11
**Cycle:** SL 1-12 Performance Agreement, FY2026/27 — **Contracting** stage
**App:** HCM Admin Portal (PMDS module) — https://pd-hcm-adminportal-qa.shesha.app/ (QA)
**Ref:** PA2026/6557 (Thato Mali, Intern 3, SL3)
**Result:** PASSED — workflow terminated correctly at "Dispute Unresolved"; one dashboard defect observed (see below)

## Context

Negative workflow #3 = dispute → mediator **not** resolved → escalated → mediator-supervisor **also not**
resolved → the workflow must terminate without routing onward.

Chain: **ThatoMali** → supervisor **Lungile Nhleko** (`LungileN`) → mediator **Babalwa M** (`BabalwaM`)
→ mediator-supervisor **Sampha Sampha** (`Sampha`) → terminal.

## Steps executed (live, headed)

1. **Employee Draft & Submit** (`ThatoMali`/`123qwe`, PA2026/6557). 4 KRAs @ 25% (Total 100%), 4 GAFs from
   his live list (Job Knowledge, Reliability, Acceptance Of Responsibility, Communication), 8 key
   activities, 1 PDP (Compulsory Induction Programme / Formal Course) → **Submit**. Status Draft → Review.
2. **Supervisor Refer for Dispute** (`LungileN`) — comment-gated Yes ("Disagreement on scope of the stock
   control KRA."). Status **Review → Under appeal**.
3. **Mediator NOT resolved** (`BabalwaM`) — mandatory Comments + Attachments, `mediation-outcome-escalated.txt`
   uploaded, post-upload wait guard applied → **Submit, first click, no 500**. Escalated.
4. **Mediator-supervisor ALSO NOT resolved** (`Sampha`). Selected "The disagreement has not been resolved";
   this level **also** requires Comments + Attachments (Approve stays disabled until both are supplied).
   Uploaded the same fixture, waited and re-verified → **Approve**.
5. **Terminal confirmed.** Sampha's inbox went to **0 items** immediately afterwards — nothing routes onward.
6. **Verification (admin).** Employee List: **Thato PA2026/6557 — Contracting Status = "Dispute Unresolved"**.
   This is the Contracting terminal label (Mid-Year's equivalent is "Not Required").

## 🐞 Defect re-confirmed — Completed tile over-counts the unresolved-dispute terminal

Immediately after this scenario the Contracting **Manage Process** card read
`43 Total · 0 Not Started · 37 In progress · **6 Completed**` while only **5** employees had genuinely
completed (Simmy, Jabu, Adam, Sanele, Lungile — all "Generate PERSAL Input").

The final state at the end of the session — after Tony's happy path and after another tester completed
PA2026/6573 in parallel — read `35 In progress · **8 Completed**` against **7** genuine
"Generate PERSAL Input" rows. Either way the surplus is exactly **1**, and it is **Thato, whose PA
terminated as "Dispute Unresolved"**. Per-employee statuses from the Employee List are the authority;
the tile is wrong.

This is the **second confirmed sighting** (first: 2026-07-23, where the tile moved 4 → 5 for exactly the
same reason). It is Contracting-specific — Mid-Year correctly **excludes** its "Not Required" terminal.
Logged as `test-reports/bugs/2026-08-11-contracting-completed-tile-overcounts-dispute-unresolved.md`.

## Observations / notes

- **Both** levels of the not-resolved path enforce Comments + Attachments; only the *resolved* selections
  are attachment-free.
- The mediator-supervisor action button is **Approve** at this level (Submit at the mediator level).
- Read real outcomes from the Employee List status column, never from the Completed tile.

## Environment

- `Sampha` / `123qwe` — current mediator-supervisor (replaces Tania Smith `Tester97`; see the Sanele report).
