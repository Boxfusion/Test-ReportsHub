# EPM — Achievement percentage calculation

**ADO plan:** 108745 — *EPM-QA — Functional Test Plan v2.0 (2026-08-11 redesign baseline)*
**ADO suite:** 109536 — *33 · Achievement percentage calculation*
**Environment:** QA — `https://pd-epm-adminportal-qa-wf.shesha.app`
**Login:** stage1 / 123qwe (Stage 1 Process Owner)
**Navigation:** EPM › My Items (workflow inbox) › Capture Progress Report

## TC-108803 — Positive — Simple Count aggregation, Target=80/Actual=60, expect 75%

**ADO ID:** 108803 · **Coverage dimension:** Positive

### Preconditions (ADO literal)
- Quantitative KPI, Method of Calculation = Simple Count, Target = 4 (interpreted here at real fixture
  scale: Target = 80, Actual = 60, ratio identical).

### Steps (ADO literal)

| # | Action (ADO literal) | Expected (ADO literal) |
|---|--------|----------|
| 1 | Capture Actual = 3 against Target = 4. | Achievement percentage = 75% is computed. |

### Fixture trail — two dead ends before a workable item

1. `CPR2026/1006` ("S1Draft KPI" family): set `indicatorTarget=4`/`indicatorActual=3`/`achievementStatus=3`
   via direct API `PUT`, confirmed persisted via `GetAll`. But the Capture Progress Report UI form
   rendered Quarter Target / Percentage Base / Actual Target completely blank — this fixture family's
   form doesn't read from the fields being written. Submit never enabled.
2. `CPR2026/0892` (real `indicatorTarget=100`): matched via a Stage-1 "capture" `WorkflowInboxItem`, but
   opening it showed "Requested action is not available" — its true current position was Stage 6
   (`progressReportStatus=70`), a **stale duplicate Stage-1 inbox row** left pointing at an item that had
   already moved on. Queried `progressReportStatus` directly for several Q1 capture-inbox candidates to
   tell genuinely-fresh items (status `2`) from stale pointers (status `70`) before trusting the next
   match.
3. `CPR2026/1097` ("Number of Provinces and Metros supported to upgrade Phase 3 of the informal
   settlements - Q4"): genuine Stage 1 item, real pre-seeded Quarter Target = 80, `progressReportStatus=2`.
   Used this one.

### Result — Submit succeeded; Variance + Achievement Status compute; percentage does NOT

Set Actual Target = 60 (via the real form input, not API) against the real Target of 80. This item had
been sent back from Stage 2 with a real prior comment, so the resulting non-zero Variance (-20) triggered
two required fields not otherwise visible on a zero-variance item: **"Reason for Deviation"** and
**"Corrective Action"**. Filled both (their input textareas sit to the *right* of their labels, not
below — a `:below()` locator cross-matches the wrong box). Checked the Declaration Statement checkbox.

Submit was genuinely enabled and succeeded (`200`). `progressReportStatus` advanced `2 → 30` (Stage 2,
"Support Progress Report"). Comparing the record before/after:

| Field | Before Submit | After Submit | Correct? |
|---|---|---|---|
| `variance` | `0` (stale, from an earlier raw API PUT) | `-20` (= 60 − 80) | Yes — recomputed correctly |
| `achievementStatus` | `3` (In Progress, stale) | `2` (Not Achieved) | Yes — correctly auto-derived since actual < target |
| `indicatorProgressReportPercentComplete` | `null` | `null` | **No** |
| `perfIndex` | `null` | `null` | **No** |
| `percentageBase` | `null` | `null` | **No** |

Dumped every non-null scalar field on the record post-Submit — no field under any name holds a
percentage or ratio value anywhere.

**CONFIRMED GAP:** the achievement *percentage* (60/80 = 75%) that this test case is built around is
never computed or stored. This sits right next to two calculations that plainly **do** work correctly on
the same Submit action (Variance, Achievement Status) — so the calculation engine genuinely runs, it
just was never wired to also produce a percentage value. Not the same root cause as
[[epm-aggregation-type-periods-dead-code]] (that's Sum-across-Periods, a different aggregation path) —
this is the plain single-value percentage every Quantitative KPI would need.

### Unique inputs
| Field | Value |
|---|---|
| Fixture | `CPR2026/1097`, `cprId=5c9530f8-60bd-4994-9eec-09f99d9570b2` |
| Quarter Target (real, pre-seeded) | 80 |
| Actual Target (entered) | 60 |
| Reason for Deviation / Corrective Action | filled with disposable TC-108803-labelled text |

### Notes
- This item is now genuinely at Stage 2 and cannot be re-driven through this exact same Stage 1 flow
  again — a re-run needs a fresh Stage 1 item with a real, non-null Quarter Target.
- Supersedes the "blocked" finding in `epm-capture-form-calculations-blocked.spec.ts` (2026-08-19,
  suites 109535+109536) — that blocker (no live Stage 1 item existed tenant-wide) no longer holds.
- See [[epm-stage1-submit-permanently-blocked]] for the Submit-gate flakiness fix this depended on, and
  [[epm-achievement-percentage-not-computed]] (memory) for the full write-up.
