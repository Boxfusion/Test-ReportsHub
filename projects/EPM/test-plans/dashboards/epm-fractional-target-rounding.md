# EPM — Fractional target/actual rounding

**ADO plan:** 108745 — *EPM-QA — Functional Test Plan v2.0 (2026-08-11 redesign baseline)*
**ADO suite:** 109536 — *33 · Achievement percentage calculation*
**Environment:** QA — `https://pd-epm-adminportal-qa-wf.shesha.app`
**Login:** stage1 / 123qwe (Stage 1 Process Owner)
**Navigation:** EPM › My Items (workflow inbox) › Capture Progress Report

## TC-108888 — Edge — fractional targets, rounding policy

**ADO ID:** 108888 · **Coverage dimension:** Edge

### Preconditions (ADO literal)
- Quantitative KPI, Actual = 2.5, Target = 4.

### Steps (ADO literal)

| # | Action (ADO literal) | Expected (ADO literal) |
|---|--------|----------|
| 1 | Capture Actual=2.5 against Target=4 (62.5%). | A rounding policy is applied consistently (e.g. rounds to 63% or truncates to 62%). |

### Result — values preserved exactly; percentage still not computed (same gap as TC-108803)

Fixture: `CPR2026/1067` ("Number of Provinces and Metros supported to complete Phase 1 of the Informal
Settlements - Q2 2026/27"), a genuine real-Target item (Target=60, from the same reliable fixture
family as TC-108803's `CPR2026/1097`). Used Actual=37.5 to preserve the exact ADO ratio
(37.5/60 = 62.5%).

Two extra required fields surfaced on this fixture: `poeRequired=true` (Portfolio Of Evidence, attached
via the standing `EXISTING_POE_FILE_ID` technique) and the Variance-triggered Reason for
Deviation/Corrective Action fields (Variance=-22.5, non-zero).

Submit succeeded, status advanced 20 → 30 (Stage 2). Confirmed:
- `indicatorActual` persisted as exactly `37.5` — **no premature rounding/truncation** of the raw
  fractional input.
- `variance` persisted as exactly `-22.5` — computed precisely, not rounded.
- `indicatorProgressReportPercentComplete`, `perfIndex`, `percentageBase`: **all stayed `null`**, same
  as the whole-number case in TC-108803.

**CONFIRMED GAP, same root cause as TC-108803:** the achievement percentage is never computed for
fractional inputs any more than whole ones — so ADO's actual question (what rounding rule applies to
62.5%?) has no answer to observe; there's no percentage field for a rounding rule to act on.

### Unique inputs
| Field | Value |
|---|---|
| Fixture | `CPR2026/1067`, `cprId=275e5383-5e1c-4451-a0d1-6e12df7905ab` |
| Quarter Target (real, pre-seeded) | 60 |
| Actual Target (entered) | 37.5 |
| POE | `EXISTING_POE_FILE_ID` reference attached via API |

### Notes
- Not a separate defect from [[epm-achievement-percentage-not-computed]] — same single root cause,
  confirmed to also hold for fractional inputs.
