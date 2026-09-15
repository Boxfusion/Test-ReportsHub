# DSD-NPO — QA Completion Report

**QA:** Nomfanelo Nhleko · **Environment:** QA · **Period:** 2026-08-12 → 2026-08-31 (13 active testing days)
**Status:** ✅ **Delivered** — PR #37 merged to `Boxfusion/Test-ReportsHub:main` on 2026-08-31 (merge `422c48f`)

## Progress
| Module | New scripts (engagement total) | Overall progress |
|---|---|---|
| DSD-NPO | **56 test plans authored** (33 functional · 23 smoke) with **20 paired Playwright specs**; both ADO plans fully imported — smoke 20/20 suites, functional 36/36 suites | **Smoke plan 101541 — 70 / 70 cases · 100%** · **Functional plan 101543 — 222 / 314 cases verdicted · 70.7%** |

### Functional outcomes — the 222 verdicted cases
| Outcome | Cases |
|---|---|
| ✅ Passed | **65** |
| 🔴 Failed | **100** |
| ⚠️ Partial | **57** |
| **Verdicted** | **222** |

**Every one of the 314 functional cases carries a recorded status:**

| Disposition | Cases |
|---|---|
| Verdicted (pass / fail / partial) | 222 |
| Recorded blocked or not-executed, each with a reason | 50 |
| Dispositioned in the attribution audit (ADO-closed, smoke-owned, out of black-box remit, calendar-dependent) | 42 |
| **Total** | **314** |

The 70.7% is the **conservative** figure: blocked, ADO-closed, smoke-owned and out-of-remit cases are all excluded
from the numerator. Coverage is re-derived by script (`scripts/coverage-baseline.js`) rather than carried forward, so
it is reproducible on demand and not an estimate.

### Why the failure count is high — this is expected
Plan 101543 is the **negative-path and validation** plan: most of its cases assert that the product *blocks*
something, or that a prescribed control exists. A high fail count is the plan doing its job, not a collapsing build.
The smoke plan — the happy-path suite — closed at **70/70**. Read the two together: the core journeys work; the
guardrails around them are where the findings are.

## Scope of these claims
These figures cover ADO plans **101541** (smoke) and **101543** (functional) on the **QA** environment only, exercised
black-box through both portals. Performance, load, penetration testing, cross-browser and mobile were not in scope
and were not run; 42 cases were dispositioned as outside black-box remit (code review, transport-layer and
direct-API assertions) and belong to development and security rather than QA.

**Security observations were raised directly with the test lead** and are recorded in the repository.
They are deliberately not summarised here.

## Output
| Artefact | Count |
|---|---|
| Test plans authored | 56 |
| Paired Playwright specs | 20 |
| Run reports filed | 184 |
| Defect write-ups | 76 (three later retracted after re-verification) |
| Audits and reconciliations | 7 |
