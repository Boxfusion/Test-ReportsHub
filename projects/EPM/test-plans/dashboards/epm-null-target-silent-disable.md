# EPM — Null Target rejection behaviour

**ADO plan:** 108745 — *EPM-QA — Functional Test Plan v2.0 (2026-08-11 redesign baseline)*
**ADO suite:** 109536 — *33 · Achievement percentage calculation*
**Environment:** QA — `https://pd-epm-adminportal-qa-wf.shesha.app`
**Login:** stage1 / 123qwe (Stage 1 Process Owner)
**Navigation:** EPM › My Items (workflow inbox) › Capture Progress Report

## TC-108887 — Negative — reject calculation with a null Target

**ADO ID:** 108887 · **Coverage dimension:** Negative

### Preconditions (ADO literal)
- A KPI with no Target configured (null).

### Steps (ADO literal)

| # | Action (ADO literal) | Expected (ADO literal) |
|---|--------|----------|
| 1 | Attempt to submit a Progress Report with Target = null. | A clear validation-error message is shown. |
| 2 | Populate Target and retry. | Submission succeeds. |

### Result, Part 1 — CONFIRMED GAP: no specific validation message

Fixture: `CPR2026/1038` ("S1Submit KPI 82870445 - Q1 2026/27"), a genuine live Stage 1 item with a real
`indicatorTarget=null`. Submit is correctly disabled — but clicking it produces no distinguishing error
at all. The only visible text anywhere on the page is the same generic, stale tooltip ("Please ensure
the Executive Summary is captured before Submitting") the button always shows when disabled, regardless
of the real cause. A user with a null-Target KPI gets no indication that Target is the actual problem.

### Result, Part 2 — separately BLOCKED, not disproven

Set `indicatorTarget=50` on the same record via a direct API `PUT`, confirmed persisted via a follow-up
`GET`. Reloading the Capture form: **"Quarter Target" stayed completely blank**, never reflecting the
write — the same form-binding defect already found for the "S1Draft KPI" fixture family while
investigating TC-108803 ([[epm-achievement-percentage-not-computed]]). Confirmed this is a **recurring
pattern**, not a one-off: at least two named synthetic fixture families ("S1Draft KPI", "S1Submit KPI")
share it.

To isolate whether the blank Quarter Target really was the residual blocker, filled every other required
field for real through the live UI: Actual Target = 45, a genuine Executive Summary sentence, Declaration
checkbox checked. Submit stayed disabled throughout — strongly implicating the still-blank Quarter Target
as the cause, though Part 1's own gap (no specific error message anywhere) means this can't be proven
with full certainty from the UI alone.

**Indirect evidence the underlying mechanism does work correctly:** TC-108803 used a genuine,
non-synthetic fixture (`CPR2026/1097`) with a real pre-seeded Target — that one displayed correctly and
Submit succeeded once other fields were filled. The defect is specific to the "S1Draft"/"S1Submit"
synthetic fixture family, not a general "populating Target never helps" claim.

### Unique inputs
| Field | Value |
|---|---|
| Fixture | `CPR2026/1038`, `cprId=25277303-7fa1-4ab4-b101-211cea834326` |
| Target set via API | 50 |
| Actual Target (entered) | 45 |

### Notes
- Not the same defect as [[epm-achievement-percentage-not-computed]]'s core finding (percentage never
  computed) — this is a form-binding/data-source issue specific to these two synthetic fixture families.
- A genuinely conclusive "retry succeeds" demonstration needs a freshly-created item via the real
  4-level hierarchy with Target deliberately left unset, not either of these two pre-existing fixtures.
