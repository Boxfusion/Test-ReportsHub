# PMDS Chief Director/Director Performance Agreement — Contracting opened, all 4 workflows completed

**Date:** 2026-08-11
**Cycle:** **Chief Director/Director Performance Agreement**, FY2026/27 — **Contracting** stage
**App:** HCM Admin Portal (PMDS module) — https://pd-hcm-adminportal-qa.shesha.app/ (QA)
**Refs:** PA2026/6623 (Tania Smith) · PA2026/6625 (Babalwa M) · PA2026/6631 (Sampha Sampha) · PA2026/6627 (Kavitha Naidoo)
**Result:** PASSED — Contracting opened (11/11 initiated), all 4 assigned workflows completed end-to-end to Generate PERSAL Input

## Context

Third cycle exercised today, after SL 1-12 and DDG. **11 employees** (vs DDG's 6 and SL 1-12's 43).
Workflow assignments from the test lead:

| User | Login | Assigned workflow | Outcome |
|---|---|---|---|
| Tania Smith | `Tester97` | Positive | ✅ Generate PERSAL Input |
| Babalwa M | `BabalwaM` | Positive | ✅ Generate PERSAL Input |
| Sampha Sampha | `Sampha` | Negative 1 — resolved dispute | ✅ Generate PERSAL Input |
| Kavitha Naidoo | `Gov012` / `GOV012` | Negative 2 — escalated dispute | ✅ Generate PERSAL Input |

`Gov012` works as written (unlike the DDG cycle, where `Gove016` had to become `GOV016`).

## Steps executed (live, headed)

1. **Admin — Open Contracting process.** Submission **2026-08-31** / Closing **2026-09-30**, initiate
   **immediately** → **11 Total / 0 Not Started / 11 In progress** (read after a hard refresh; the tile
   lags, as on the DDG cycle).
2. **Tania Smith — Draft & Submit** (PA2026/6623). 4 KRAs @ 25% (Total 100%), 4 CMCs, 8 key activities,
   PDP → Submit → **Thando Zide Sign** → **Maletsha Nkepana (`MaletshaN`) Verify** →
   **Generate PERSAL Input**. ✅
3. **Babalwa M — Draft & Submit** (PA2026/6625) → **Sampha Sampha Sign** → **SalesHR Verify** →
   **Generate PERSAL Input**. ✅
4. **Sampha Sampha — negative 1, resolved dispute** (PA2026/6631). Draft → **Tania Smith Refer for
   Dispute** (comment-gated Yes) → **Thando Zide mediator "The disagreement has been resolved"** +
   comment → Submit → **Sampha Update with Outcomes** → **Tania Review Updated** → **SalesHR Verify** →
   **Generate PERSAL Input**. ✅
5. **Kavitha Naidoo — negative 2, escalated dispute** (PA2026/6627). Draft → **Naledi weeeee Khumalo
   (`GOV022`) Refer for Dispute** → **Babalwa M mediator "not resolved"** (mandatory Comments +
   Attachments; `mediation-outcome-escalated.txt` uploaded with the post-upload wait guard — **Submit
   first click, no 500**) → escalated to **Sampha Sampha** as *Mediator Supervisor Review* → he selected
   **"resolved"** → **Approve** → **Kavitha Update with Outcomes** → **Naledi Review Updated** →
   **HR Review** → **SalesHR Verify** → **Generate PERSAL Input**. ✅ (Her HR-verify step had **no one
   assigned to it**, so the task sat ownerless in no inbox; the test lead reassigned it to `SalesHR` and
   the Verify then completed — see the HR-verifier section below.)

## The CD/D hierarchy (discovered live)

| Employee | Supervisor | Mediator |
|---|---|---|
| Tania Smith (MEC, SL13) | Thando Zide (Premier, SL15) | Kabelo Mabalane (Deputy Minister, SL15) |
| Babalwa M (Chief Director, SL14) | Sampha Sampha (Director of Engineering, SL13) | Tania Smith (MEC, SL13) |
| Sampha Sampha (Director of Engineering, SL13) | Tania Smith (MEC, SL13) | Thando Zide (Premier, SL15) |
| Kavitha Naidoo (Infra Manager, SL13) | **Naledi weeeee Khumalo** (HOD - Infrastructure, **SL6**) | Babalwa M (Chief Director, SL14) |

Salary levels again run backwards in places — an **SL6** HOD supervising an **SL13** manager, and an
SL13 Director supervising an SL14 Chief Director. Same data question already raised on the DDG cycle.

## Confirmed: the SMS form is shared, not DDG-specific

This cycle uses the **identical SMS Core Management Criteria** layout as the DDG cycle —
`Name | Process Competencies | Development Required`, 5 rows carrying 10 criteria, **one checkbox per
row**, and the same "min 4 / max 6" hint against only 5 checkboxes. So the split is
**SMS (senior) vs non-SMS**, not per-cycle: SL 1-12 uses the 10-GAF form, DDG and CD/D use the SMS form.

The **pre-seeded PDP row** defect (`bugs/2026-08-11-ddg-silent-validation-blocks-draft-wizard.md`)
reproduced on **all four** CD/D employees — third cycle, so it is systemic to the SMS draft form, not a
DDG quirk. The documented recipe (open the row via its **search icon** → set Commencement Date → Save →
then add at least one PDP of your own) worked cleanly every time.

## Note on logins

Naledi's login was supplied as **`GOV022`** and worked first time. Worth recording that the name-based
guesses all failed (`Naledi`, `NalediK`, `NKhumalo`, `KhumaloN`, `Khumalo`, `NalediKhumalo`) and that
`GOV011` = Zanele Mnguni and `GOV014` = Jerome February — the GOV-number space is not sequential by
team, so guessing it is not viable. Ask rather than probe.

## 🔑 RESOLVED — this cycle has TWO different HR verifiers

Tania's PA initially appeared stuck at **HR Review**: it was not in `SalesHR`'s inbox (which verified
Babalwa and Sampha without issue) nor in `GOV005`'s. The test lead supplied the answer — her verifier is
**Maletsha Nkepana (`MaletshaN` / `123qwe`)**, and the Verify completed immediately on that login.

So HR verification in this cycle is **not a single role**:

| Employee | Chief Directorate | HR verifier |
|---|---|---|
| Babalwa M | OFFICE OF THE DIRECTOR-GENERAL | `SalesHR` |
| Sampha Sampha | OFFICE OF THE DIRECTOR-GENERAL | `SalesHR` |
| Tania Smith | **(blank)** | `MaletshaN` |
| Kavitha Naidoo | **(blank)** | **nobody was assigned to the step** → test lead reassigned the task to `SalesHR`, then it verified normally |

**Cause confirmed by the test lead: Kavitha's HR-verify step had no one assigned to it.** The task was
therefore ownerless rather than sitting in some third verifier's inbox — which is why it appeared in
neither `SalesHR`'s nor `MaletshaN`'s. Rather than configure an assignee on the step, the lead
reassigned the existing task to `SalesHR`, and the Verify then completed normally.

**This is test-data / configuration, not a product defect.** Two verifiers are genuinely in play for
this cycle (`SalesHR` and `MaletshaN`); there is no unexplained third destination and no routing-rule
mystery — my earlier framing of one was wrong.

The practical takeaway for QA is unchanged though: **an HR-verify task with no assignee is
indistinguishable from a stuck workflow when viewed from the outside**, since the PA shows
`HR Review` and no inbox holds it. Checking the workflow instance directly (`/shesha/workflow?id=<paId>`)
confirms the status, but not the owner — so when a PA appears parked at HR Review, ask whether the step
has an assignee before hunting through inboxes.

## Final cycle state

Contracting card: `11 Total · 0 Not Started · 7 In progress · **4 Completed**` — matching the four
genuine completions (Tania PA2026/6623, Babalwa PA2026/6625, Sampha PA2026/6631, Kavitha PA2026/6627),
all at **Generate PERSAL Input**. **No tile over-count**, consistent with that defect being specific to
the "Dispute Unresolved" terminal, which this cycle has not produced.

**Escalation tier for this cycle:** above mediator **Babalwa M** sits **Sampha Sampha**, whose task is
*"Mediator Supervisor Review Disagreement and attempts to resolve"* with an **Approve** action (the
mediator level uses **Submit**) — the same two-tier pattern seen on SL 1-12 and DDG.

## Environment

- All CD/D logins use password `123qwe`. Kavitha Naidoo = `Gov012` (or `GOV012`);
  **Naledi weeeee Khumalo = `GOV022`**.
- HR verification: **`SalesHR`** for Babalwa and Sampha; **`MaletshaN`** (Maletsha Nkepana) for Tania;
  Kavitha's step had **no assignee** and her task was reassigned to `SalesHR` by the test lead.
