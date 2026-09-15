# Contracting "Completed" tile counts Dispute-Unresolved agreements as completions

**Logged:** 2026-08-11
**Severity:** Medium — reporting/rollup defect. No workflow data is corrupted, but the cycle dashboard
overstates completions, so anyone reading the tile draws the wrong conclusion about the stage.
**Module:** SaGov PMDS — cycle **Manage Process** dashboard (`SaGov.Pmds/sagov-cycle-details-item`)
**Cycle:** SL 1-12 Performance Agreement, FY2026/27 — **Contracting** stage
**Environment:** HCM Admin Portal QA — https://pd-hcm-adminportal-qa.shesha.app/
**Status:** Open — **second confirmed sighting** (first observed 2026-07-23, re-confirmed on a clean data set 2026-08-11)

## Summary

When a Contracting Performance Agreement terminates as **"Dispute Unresolved"** (both mediation levels
decline to resolve), the Manage Process card still increments its **Completed** counter for that
employee. The agreement never reaches Generate PERSAL Input and is not a completion.

## Steps to reproduce

1. As `admin`, open the Contracting process on SL 1-12 (initiate immediately).
2. Drive an employee's PA to the terminal unresolved-dispute state: employee Draft & Submit →
   supervisor **Refer for Dispute** → mediator selects **"The disagreement has not been resolved"**
   (with the mandatory comment + attachment) → escalation recipient **also** selects "not been
   resolved" → Approve.
3. Confirm the employee's **Employee List → Contracting Status** reads **"Dispute Unresolved"**.
4. Return to **Manage Process** and read the Contracting card's **Completed** count.

## Expected

Completed counts only agreements that genuinely completed the chain (status
**Generate PERSAL Input**). A "Dispute Unresolved" terminal is excluded, exactly as Mid-Year excludes
its equivalent "Not Required" terminal.

## Actual

Completed includes the Dispute-Unresolved agreement.

**2026-08-11 evidence.** Final cycle state after this session's seven agreements concluded:
`43 Total · 0 Not Started · 35 In progress · **8 Completed**`. The Employee List shows only **seven**
rows at **Generate PERSAL Input**:

| Employee | Ref | Contracting Status |
|---|---|---|
| Simmy Mthalane | PA2026/6597 | Generate PERSAL Input |
| Jabu Hadebe | PA2026/6553 | Generate PERSAL Input |
| Adam Apple | PA2026/6539 | Generate PERSAL Input |
| Sanele Sithole | PA2026/6595 | Generate PERSAL Input |
| Lungile Nhleko | PA2026/6549 | Generate PERSAL Input |
| Tony Dayimane | PA2026/6585 | Generate PERSAL Input |
| *(not ours)* PERSAL 11223344 | PA2026/6573 | Generate PERSAL Input |
| **Thato Mali** | **PA2026/6557** | **Dispute Unresolved** ← counted, should not be |

**8 counted − 7 genuine = 1**, and the surplus is exactly the Dispute-Unresolved agreement. (An
intermediate reading earlier in the same session showed the same 1-item surplus: `6 Completed`
against 5 genuine, before Tony's run and before another tester completed PA2026/6573.)

**2026-07-23 evidence.** Same behaviour on the previous data set: the tile moved **4 → 5** when Thato's
PA hit the Dispute-Unresolved terminal, while true completions stayed at 4.

## ⚠️ Note for whoever retests — the 2026-08-11 evidence is no longer reproducible from current state

Later the same day (after PERSAL input was generated and before Mid-Year was opened), **Thato Mali's
Contracting status was changed to `Completed`** by the team — the whole SL 1-12 population finished at
**43/43 Completed**. When Mid-Year was then opened it initiated for **all 43**, Thato included.

So a reader checking the Employee List now will see `Completed`, not `Dispute Unresolved`, and will not
be able to reproduce the discrepancy from this data set. **The observation above was verified live at the
time it was recorded** (tile 8 vs 7 genuine "Generate PERSAL Input" rows, with Thato showing
`Dispute Unresolved`), and it matches the independent 2026-07-23 sighting. To retest, drive a fresh
agreement to the both-levels-unresolved terminal and compare the tile against the Employee List before
anyone amends it.

## Scope

**Contracting-specific.** Mid-Year handles the equivalent case correctly — on 2026-07-23 an escalated,
both-levels-unresolved Mid-Year assessment landed on "Not Required" and the Mid-Year Completed tile
did **not** increment (stayed at 3). So the rollup rule differs between the two stages and Contracting
is the one that is wrong.

**✅ Scope re-confirmed 2026-08-11 on a second, independent data set.** A fresh both-tiers-unresolved
Mid-Year assessment (Adam Apple, PR2026/7434) was driven to the **Not Required** terminal in the same
session. Final Mid-Year state: `43 Total · 1 Not Started · 37 In progress · **5 Completed**`, against
exactly **five** genuine *Awaiting PERSAL sync* rows (Simmy PR2026/7492, Tony PR2026/7480, Lungile
PR2026/7444, Jabu PR2026/7448, Sanele PR2026/7490). Adam is **not** counted. Mid-Year is correct;
Contracting is the outlier. See `2026-08-11/sl1-12-midyear-assessments.md`.

## Impact / workaround

Read real outcomes from the **Employee List status column**, not the Manage Process tile. The
discrepancy grows with each unresolved dispute in a cycle, and it propagates into any reporting built
on the tile. Downstream stage initiation appears unaffected — on 2026-07-23 the over-counted employee
correctly received **no** Mid-Year assessment when Mid-Year was opened, so the defect looks confined to
the display/rollup rather than the workflow engine.

## Related

- `2026-08-11/negative-escalated-dispute-unresolved-thato.md` (this run)
- `2026-07-23/negative-escalated-dispute-unresolved-thato.md` (first sighting)
