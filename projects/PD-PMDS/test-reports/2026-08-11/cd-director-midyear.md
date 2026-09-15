# PMDS Chief Director/Director — Mid-Year Assessment opened, 3 of 4 workflows completed

**Date:** 2026-08-11
**Cycle:** Chief Director/Director Performance Agreement, FY2026/27 — **Mid Year Assessment**
(cycle id `5f250b11-b86c-4b5e-b239-a9246fc525d3`, 11 employees)
**App:** HCM Admin Portal (PMDS module) — https://pd-hcm-adminportal-qa.shesha.app/ (QA)
**Result:** PASSED — Contracting closed 11/11, Mid-Year opened 11/11, all four assigned workflows reached **Awaiting PERSAL Sync**. Kavitha's HR-verify step again had no assignee; once the test lead reassigned it to Babalwa M it completed normally.

## Context

Third and last Mid-Year cycle of the day, after SL 1-12 and DDG. CD/D Contracting had stood at 4 of 11
completed this morning; by this session the team had finished all eleven, so closing Contracting stranded
nobody.

## Steps executed (live, headed)

1. **Closed Contracting** → COMPLETED, all 11 completions preserved; Mid-Year's **Open process** appeared
   only after the close.
2. **Opened Mid-Year** — Submission 2026-08-31, Closing 2026-09-30, initiate immediately → `11 Total ·
   11 In progress`.
3. **Four self-assessments** (Own 3 throughout + per-activity comments + Employee Comments → Submit):
   Tania **PR2026/7518**, Babalwa **PR2026/7520**, Sampha **PR2026/7526**, Kavitha **PR2026/7522**.
4. **Positive paths** — Thando Zide signed Tania; Sampha signed Babalwa.
5. **Negative 1 — resolved at mediator (Sampha).** Tania set Supervisor 4 vs Own 3 on activity 1
   (Agreed 4, comment + attachment) → **Refer for dispute** → **Thando Zide** mediator *"has been
   resolved"* → Update w/Outcomes → Tania Review w/Outcomes.
6. **Negative 2 — escalated (Kavitha).** Naledi Khumalo (`GOV022`) same pattern → **Refer for dispute** →
   **Babalwa M** mediator *"has not been resolved"* (comment + attachment) → escalated → **Sampha**
   tier 2 *"has been resolved"* → Update w/Outcomes → Naledi Review w/Outcomes.
7. **HR Verify** — `SalesHR` verified Sampha and Babalwa; `MaletshaN` verified Tania. **Kavitha's verify
   task is in nobody's inbox** (see below).

## Final state

| Employee | Ref | Scenario | Final status |
|---|---|---|---|
| Tania Smith | PR2026/7518 | positive | ✅ Awaiting PERSAL sync (verified by `MaletshaN`) |
| Babalwa M | PR2026/7520 | positive | ✅ Awaiting PERSAL sync (verified by `SalesHR`) |
| Sampha Sampha | PR2026/7526 | negative 1 — resolved at mediator | ✅ Awaiting PERSAL sync (verified by `SalesHR`) |
| Kavitha Naidoo | PR2026/7522 | negative 2 — escalated, resolved at tier 2 | ✅ Awaiting PERSAL sync (verified by `BabalwaM` after reassignment) |

Cycle tile: **`11 Total · 0 Not Started · 7 In progress · 4 Completed`** — 4 counted against exactly 4
genuine completions, no over-count.

## ⚠️ The unassigned HR-verify step reproduces on Mid-Year

On Contracting, Kavitha's HR-verify step had **no assignee**, so the task sat in nobody's inbox and the
test lead resolved it by reassigning the task. Confirmed by the lead at the time as **test-data/config,
not a product defect**.

**The same thing happened again on her Mid-Year assessment.** PR2026/7522 sat at **HR Review** with the
task in neither `SalesHR`'s inbox (which held only Sampha's and Babalwa's) nor `MaletshaN`'s (which held
only Tania's). The other three routed normally.

I did not reassign it myself — the test lead did, this time to **Babalwa M**. The task then appeared in
her inbox and completed on the first attempt: Confirmation → **Verify** → *Awaiting PERSAL Sync*. So the
workflow itself is sound; only the step's assignee is missing in the configuration.

**This is now the second occurrence on the same employee, one per stage.** Worth asking whether Kavitha's
position is missing an HR-verify assignee at the configuration level rather than per-cycle — otherwise
the Annual Assessment will need the same manual intervention.

The QA-relevant point stands: **an HR-verify step with no assignee is indistinguishable from a stuck
workflow from the outside.** The PA reads HR Review and no inbox holds it. Ask whether the step has an
assignee before hunting inboxes.

## Findings

- **The two-verifier split reproduces exactly on Mid-Year.** `SalesHR` for Babalwa and Sampha (Chief
  Directorate = *Office of the Director-General*), `MaletshaN` for Tania (blank Chief Directorate) —
  identical to the Contracting mapping. So the routing is stable per employee across stages, and
  `SalesHR` is not the universal verifier for this cycle.
- **Supervisor rating saves are timing-sensitive under automation.** Three KRAs on Sampha's review came
  back empty after a full page reload — genuinely unsaved, not a display lag. Re-running the same steps
  with longer waits (1.8 s after opening the dropdown, 1.5 s after selecting, 6 s after Save) saved all
  of them first time, and the rest of the run had no further losses. **This looks like a harness race
  between the AntD select committing its value and the Save click, not an application defect** — I am
  not raising it as a bug. Anyone scripting this step should pace it and re-read the grid after Save.
- **A separate, milder variant is a genuine grid-refresh lag**: on Kavitha's self-assessment the last KRA
  showed empty in the parent grid, but re-opening the dialog showed the scores still present, and a
  second Save made the grid catch up. Distinguish the two by reloading the page — that tells you whether
  the data actually persisted.
- **The Agreed Score behaves as on DDG**: auto-fills when Supervisor equals Own, renders **empty** when
  they differ. On one attempt it also landed the wrong value (3 instead of 4) when driven too fast —
  another reason to verify select values rather than trusting the rendered row text.
- Escalation tier 2 for this cycle is **Sampha**, using **Submit** (Contracting used *Approve*).
- Every Update/Review-with-Outcomes and every Verify processed on **first click**.

## Environment

- Logins (pwd `123qwe`): `Tester97` (Tania), `BabalwaM`, `Sampha`, `Gov012` (Kavitha), `GOV022` (Naledi),
  `ThandoZide`, `SalesHR`, `MaletshaN`. Admin `admin` / `P@ssw0rd`.
- Chain: Tania ← Thando (mediator Kabelo) · Babalwa ← Sampha (mediator Tania) · Sampha ← Tania
  (mediator Thando) · Kavitha ← Naledi (mediator Babalwa, tier 2 Sampha).
- Fixtures: `.playwright-mcp/supporting-doc.txt`, `.playwright-mcp/mediation-outcome-escalated.txt`.
