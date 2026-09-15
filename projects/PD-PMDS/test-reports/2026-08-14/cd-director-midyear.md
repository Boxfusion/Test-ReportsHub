# PMDS Chief Director/Director — Mid-Year Assessment: 1 positive + 3 negative scenarios

**Date:** 2026-08-14
**Cycle:** Chief Director/Director Performance Agreement, FY2026/27 — **Mid Year Assessment**
(cycle id `5f250b11-b86c-4b5e-b239-a9246fc525d3`, 11 employees)
**App:** HCM Admin Portal (PMDS module) — https://pd-hcm-adminportal-qa.shesha.app/ (QA)
**Refs:** PR2026/7640 (Tania Smith) · PR2026/7648 (Sampha Sampha) · PR2026/7644 (Kavitha Naidoo) ·
PR2026/7642 (Babalwa M)
**Result:** PASSED — all 4 scenarios completed to their expected end states

## Context

Scenario mix requested: 1 positive + negative 1/2/3, reusing the four employees from the 2026-08-13
Contracting rerun. Since that Contracting run only exercised 2 positive + negative 1/2 (no neg-3 for
this cohort), Babalwa — previously the second positive — was repurposed as the neg-3/terminal case
for this Mid-Year run, per the test lead's confirmed instruction.

| Scenario | Employee | Ref | Outcome |
|---|---|---|---|
| Positive | Tania Smith | PR2026/7640 | ✅ Awaiting PERSAL sync (HR verified by `MaletshaN`) |
| Negative 1 — resolved dispute | Sampha Sampha | PR2026/7648 | ✅ Awaiting PERSAL sync (HR verified by `SalesHR`) |
| Negative 2 — escalated, resolved at tier 2 | Kavitha Naidoo | PR2026/7644 | ✅ Awaiting PERSAL sync (HR verified by `SalesHR`) |
| Negative 3 — escalated, unresolved at both tiers | Babalwa M | PR2026/7642 | ✅ Terminal — no downstream task |

## Steps executed (live, headed)

1. **Tania — positive.** Self-assessment (SMS/Core Management Competencies form; same KRA
   rating mechanics as SL1-12's GAF form) → **ThandoZide** supervisor sign → **MaletshaN** HR Verify
   (matching the split-verifier mapping already established for this cycle on Contracting — Tania's
   blank Chief Directorate routes to `MaletshaN`, not `SalesHR`).
2. **Sampha — negative 1, resolved dispute.** **Tania** (Sampha's supervisor) refers for dispute →
   **ThandoZide** mediator resolves "has been resolved" → **Sampha** Update with Outcomes → **Tania**
   Review Updated → **SalesHR** Verify.
3. **Kavitha — negative 2, escalated dispute resolved at tier 2.** **Naledi (`GOV022`)** refers for
   dispute → **BabalwaM** mediator selects "has not been resolved" → escalated to **Sampha** (tier 2)
   who resolves "has been resolved" via Submit → **Kavitha** Update with Outcomes → **Naledi** Review
   Updated → **HR Verify — landed directly in `SalesHR`'s inbox, no manual reassignment needed.**
4. **Babalwa — negative 3, terminal.** **Sampha** (Babalwa's supervisor) refers for dispute → **Tania**
   mediator selects "has not been resolved" → escalated to **ThandoZide** (tier 2, Tania's supervisor)
   who also selects "has not been resolved" → confirmed terminal: no task for Babalwa in her own,
   Sampha's, `SalesHR`'s, or `MaletshaN`'s inbox.

## 🔑 Key finding — Kavitha's previously-ownerless HR-verify step is confirmed fixed on Mid-Year too

The 2026-08-11 report recorded Kavitha's HR-verify step as **ownerless** on both Contracting and
Mid-Year — the task sat in nobody's inbox and required the test lead to manually reassign it to
`SalesHR` each time. On 2026-08-13, the Contracting rerun confirmed that issue fixed. **This run
confirms it is now also fixed on Mid-Year**: Kavitha's Verify Performance Assessment task appeared
directly in `SalesHR`'s inbox with no manual intervention. Whatever configuration change resolved this
is holding across both stages now.

## Structural notes carried over from Contracting

- **The SMS form's KRA rating mechanics are identical to SL1-12's.** Same "Rate Key Activities"
  modal, same eye-icon-per-KRA pattern, same Own/Supervisor/Agreed columns. Only the reference-only
  competencies table below it differs (Core Management Competencies vs Generic Assessment Factors).
- **All-3s scoring is internally consistent on the SMS form**: Own/Supervisor/Agreed all settle at
  100% when every activity is rated 3, matching the 2026-08-11 finding that the SMS form's three
  score columns agree with each other (unlike SL1-12's GAF form, where Supervisor/Agreed read 75%
  against Own's 100% under the same all-3s input).
- **Escalation tier for this cycle**: above mediator level, tier-2 uses **Submit**, matching the
  Mid-Year pattern already confirmed on SL1-12 and DDG.

## Environment

- All CD/D logins use password `123qwe`. Kavitha Naidoo = `Gov012`; Naledi weeeee Khumalo = `GOV022`.
- HR verification: `SalesHR` for Sampha, Kavitha, and (would-be) Babalwa; `MaletshaN` for Tania.
- Cycle view: `dynamic/SaGov.Pmds/sagov-cycle-details-view?id=5f250b11-b86c-4b5e-b239-a9246fc525d3`.
