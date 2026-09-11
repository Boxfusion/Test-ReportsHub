# NPO-08F — Annual Compliance: Submission (Portal) — FUNCTIONAL

**Plan:** DSD-NPO — Functional Test Plan (ADO `planId=101543`)
**Suite:** `101891` — *08 - Annual Compliance - Submission (Portal)*
**Portal:** Public (`https://dsd-npo-publicportal-1-qa.shesha.app`)
**Form:** `boxfusion.dsdnpo/annual-compliance-create v22`
**Cases owned by this plan:** 18 (the whole ADO suite; none are shared with the smoke plan)
**Imported:** 2026-08-17 from the cached ADO pull — see [read-ado-via-browser-rest-api].

> 🔑 **The smoke plan's suite 08 is a DIFFERENT set of cases.** Smoke owns TC-08-007/009/011/014/017; this
> functional suite owns the other 18. Neither is a subset of the other — always check both plans for a TC number.

## Precondition — and why it is the hard part

Every case here needs an **annual report that can be initiated**, which needs an `AnnualCompliance` period row for
the NPO. As of 2026-08-17 **nothing in the product creates one**:

| Route | Result |
|---|---|
| `AnnualComplianceGeneratorJob` | runs clean, creates **0 records for the whole 361k register** |
| Admin → CRUDS → Annual Compliance → **Add** | opens an **empty "Add New Record" modal** — no fields at all |
| Registering + approving a new NPO | no period row is generated |
| Back-dating `dateRegistered` alone | portal still says *"No annual report can be initiated at this time"* |

So the row must be inserted directly. That is a **test-harness workaround for a product gap**, not a test step —
recorded in [dsd-npo-annual-report-precondition]. Everything the cases actually assert is then driven through the UI.

**Record used:** NPO `333-019-NPO` (`4be65ab5-c421-4b22-a275-0a26ccd802f6`), FY end **February**.
Report under test: **`ANN2363/17/08/2026`** (FY 2025) · already-submitted sibling: `ANN2119/17/08/2026` (FY 2026).

## Step mapping — ADO step numbers do NOT match the build

The live wizard is **8 steps**: 1 Annual Report Guideline · 2 Organisation Details · 3 Particulars of Office Bearers ·
4 Admin and Operations · 5 Achievements & Employees · 6 Financial Report · 7 Financial Statement · 8 Declaration.

| ADO says | Live step | Note |
|---|---|---|
| "Step 1" (audit / auditing firm) | **6 Financial Report** | there is no *Audited* control; the analogue is `Is Above Threshhold` |
| "Step 2" (employees) | **5 Achievements & Employees** | |
| "Step 3" (OB changes) | **3 Particulars of Office Bearers** | read-only grid, no selector |
| "Step 4" (control structure) | — | **no Control Structure step exists in this wizard** |
| "Step 5" (funding) | **6 Financial Report** | |
| "Step 6" (submit) | **8 Declaration** | |

## Cases

| Case | Title | Runnable? |
|---|---|---|
| ADO #101733 · TC-08-001 | Reminder sent one month before FY-end | ⛔ needs system-clock control |
| ADO #101734 · TC-08-002 | Second reminder 3 months after year-end | ⛔ needs system-clock control |
| ADO #101735 · TC-08-003 | Notice letter after 2 unanswered reminders | ⛔ depends on 001/002 |
| ADO #101736 · TC-08-004 | Ignored notice → cancellation after 30 days | ⛔ depends on 003 |
| ADO #101737 · TC-08-005 | User can request a 30-day extension | ⚠️ control exists, precondition (notice letter) not reachable |
| ADO #101738 · TC-08-006 | Cannot start a new report until outstanding is submitted | ✅ |
| ADO #101740 · TC-08-008 | `Audited = Yes` requires auditing firm details | ✅ via the threshold analogue |
| ADO #101742 · TC-08-010 | Employee counts must be non-negative integers | ✅ |
| ADO #101744 · TC-08-012 | 'Changes apply' opens Change Request pop-up | ✅ |
| ADO #101745 · TC-08-013 | Control Structure step required only for international orgs | ⚠️ partial — no such step in this wizard |
| ADO #101747 · TC-08-015 | Funding totals numeric and non-negative | ✅ |
| ADO #101748 · TC-08-016 | Funding over R500 000 triggers QA path | ✅ (Drift-Risk: *expect to FAIL*) |
| ADO #101750 · TC-08-018 | Submit disabled if any step is incomplete | ✅ |
| ADO #101751 · TC-08-019 | `BackfillDocuments` regenerates missing letters | ⛔ **API-only — excluded by the no-API constraint** |
| ADO #101752 · TC-08-020 | `ResendAnnualComplianceLetters` re-sends stored letters | ⛔ **API-only — excluded by the no-API constraint** |
| ADO #101753 · TC-08-021 | Auditing Firm fields required when `Audited = Yes` | ✅ via the threshold analogue |
| ADO #101754 · TC-08-022 | Funding amounts: decimal supported, currency boundaries | ✅ |
| ADO #101755 · TC-08-023 | Employee counts: non-negative integers per demographic | ✅ |

⚠️ **Four cases (001–004) are unrunnable by design of the environment**, not by defect — they all require rolling the
system date. Ask Thabiso whether the timers can be triggered manually, otherwise these stay permanently unverified.
⚠️ **TC-08-019/020 are direct API POSTs.** They are excluded while the standing UI-only constraint is in force; they
are not blocked by the build.

## Known gotchas for anyone re-running this

1. **The threshold radio's FIRST selection does not bind** — and it can select the *other* band. Click, read back,
   click again.
2. **Switching threshold band silently wipes a captured funding row.** Capture funding *after* fixing the band.
3. **A funding row must be committed with the `plus-circle` button**, or it is not counted.
4. **`Next` is gated per step and the stepper is not clickable** — there is no way to skip ahead.
5. **Step 5 needs at least one Achievement** (via `+ Add Achievement`); the page says so in a hint banner, which is
   easy to miss if you inventory the DOM instead of looking at the screen.
6. **Leaving a step via "Submit a Change Request instead?" discards that step's unsaved data** and creates a
   change-request draft immediately, with no confirmation.
