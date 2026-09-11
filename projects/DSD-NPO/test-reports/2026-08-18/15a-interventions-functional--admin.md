# Report: NPO-15A-F — E&A Interventions (admin)

**Date:** 2026-08-18 16:30 UTC
**Plan:** test-plans/education-awareness/15a-interventions-functional.md
**Execution Mode:** ai-driven (Playwright MCP, live QA admin portal)
**Result:** FAILED — index/form/discard work; a required **District** list is empty → can't complete a create
**Duration:** ~1000s
**Cases:** TC-15A-001, TC-15A-002, TC-15A-006
**Assessed-not-executed:** TC-15A-003, TC-15A-004, TC-15A-005, TC-15A-007, TC-15A-008
**Environment:** QA · admin portal · `/dynamic/boxfusion.dsdnpo/interventions`

## Summary
| Case | Area | Verdict |
|---|---|---|
| TC-15A-001 (TC-01) | Index + filter controls | ✅ PASS (note: no Status column) |
| TC-15A-002 (TC-02) | Add Intervention opens form | ✅ PASS |
| TC-15A-006 (TC-06) | Close discards, no record | ✅ PASS |
| TC-15A-003 (TC-03) | Type mandatory + conditional fields | ⏸ PARTIAL — Type required ✅; **no type-specific conditional fields** |
| TC-15A-004 (TC-04) | Full submit → Complete | 🔴 FAIL — required **District** list empty → can't complete |
| TC-15A-005 (TC-05) | Partial submit → Draft | ⏸ PARTIAL — Save disabled on partial data (contradicts "saves as Draft"); also District-blocked |
| TC-15A-007 (TC-07) | Reporter + Reviewer captured | ⏸ PARTIAL — fields not reached; persistence blocked by District |
| TC-15A-008 (TC-08) | Attachment upload + allowlist | ⏸ PARTIAL — an **enabled** upload control exists (Section 4); full check blocked by District |

## ✅ TC-01 — Index + filters (PASS)
`Interventions` (`boxfusion.dsdnpo/interventions`, v24) lists 4 interventions with **search + filter (funnel) +
sliders** controls and an **Add Intervention** button. Columns: **Intervention Type / Start date / End date /
Reporter By / Creation Date**. Search "Outreach" narrowed 4 → 1 ✅.
📌 **Divergence:** the ADO case expects a **Status** column in the index; there is none.

## ✅ TC-02 — Add Intervention form (PASS)
Opens a dialog (`add-intervention v6`) with **Intervention Type\*** at the top, plus a 4-tab **Section 1–4** layout.
Section 1: Intervention Type\*, Risk Status\*, Date Start\*, Date End\*, Province\*, District\*, Municipality,
Partnership. Save is disabled until required fields are satisfied (validation present).

## ⏸ TC-03 — Type mandatory + conditional fields (PARTIAL)
- ✅ **Intervention Type is mandatory** (asterisk; Save gated).
- 🔴 **No type-specific conditional fields.** Types are **Education And Awareness / Train The Trainer / Outreach
  Programmes / Npo Sector Engagement** (not the ADO's illustrative Workshop/Roadshow). Selecting a type added **no**
  new fields — the form is a **fixed 4-section layout** regardless of type, unlike the case's "type-specific fields
  show conditionally".

## 🔴 TC-04 — Full submit → Complete (FAIL — blocked by empty required list)
Filled Type = Education And Awareness, Risk Status = Low, Date Start = 18/08/2026, Date End = 25/08/2026,
Province = Gauteng. The required **District\*** dropdown then rendered **"No data"** (empty listbox) — so the mandatory
District cannot be selected and the intervention cannot be submitted as Complete. Re-checked with Province = Western
Cape (bound via a real selection): District still returned no options. **The District reference list appears unseeded**,
which blocks the create.
📌 Existing interventions (created 06–07 Aug) exist, so creation worked before — possibly a data/config gap introduced
since. (Only Gauteng was confirmed with an explicit "No data" listbox; other provinces likely the same.)

## ⏸ TC-05 — Partial → Draft (PARTIAL / divergence)
The ADO expects a partial submit to **save as Draft (not blocked)** with a missing-field highlight. Here **Save is
disabled** while mandatory fields are incomplete — i.e. the form **blocks** rather than saving a Draft. This diverges
from the case. Full confirmation is also blocked by the District gap.

## ✅ TC-06 — Close discards (PASS)
Filled several fields, clicked **Cancel** → dialog closed and the index count stayed **4** (no record created).

## ⏸ TC-07 / TC-08
- **TC-07 (Reporter + Reviewer):** the section tabs did not switch reliably under automation, so the reporter/reviewer
  fields could not be enumerated/filled; persistence is blocked by the District gap anyway.
- **TC-08 (Attachments):** an upload control exists in **Section 4** and — unlike the 15B library upload — is **NOT
  disabled**, so intervention attachments may work. Full allowlist/retention check needs a submittable form (blocked
  by District).

## Observations / questions for the test lead (Thabiso)
1. 🔴 **The required District list is empty** ("No data" for Gauteng) on the Add-Intervention form — this blocks
   creating a Complete intervention. Is District reference data seeded on QA, or is the Province→District cascade
   broken? (Existing interventions predate 06–07 Aug.)
2. The Intervention form has **fixed Sections 1–4** with no **type-specific conditional fields**, and the index has
   **no Status column** — both diverge from the FDS/cases. Are Complete/Draft statuses surfaced anywhere?
3. **Partial-save-as-Draft** is not supported (Save is gated on mandatory fields) — is the Draft behaviour expected?
4. ✅ Good: index + filters + search work; Add-form validation + Close-discards work; the Section-4 attachment upload
   is **enabled** (contrast with the disabled library upload in 15B).

## Method notes
- Province/District cascade re-verified with a real selection (Province bound correctly to Gauteng/Western Cape;
  District listbox rendered "No data").
- Discard verified by the index count returning to 4 after Cancel.
- AntD date fields driven via the panel; ⚠️ synthetic option-clicks on some selects didn't bind (known Shesha gotcha)
  — Province was confirmed bound before trusting the District result.
