# PMDS SL 1-12 — Refer-for-Dispute (Jabu Hadebe) under new hierarchy

**Date:** 2026-07-16
**Cycle:** SL 1-12 Performance Agreement, FY2026/27
**Employee:** Jabu Hadebe (`JabuH`, Intern 2 SL5), PA2026/5987
**Result:** ⚠️ PARTIAL — dispute path driven up to the mediator RESOLVED step; the employee **"Update Performance Agreement with Outcomes" Submit is BLOCKED by an app defect** (see bug below).

## New-hierarchy verification
Mediator now resolves to **Babalwa M** (Chief Director, SL 13) instead of Tania Smith — consistent with the new chain intern → LungileN → BabalwaM → Tania. Confirmed on the Draft Confirm-Details, the supervisor Review screen, and the Mediator screen. **Login discovered:** `BabalwaM` / `123qwe`.

## Steps executed (live, headed)
1. **Employee Draft & Submit** (`JabuH`): full 5-step wizard — 4 KRAs @25% (Service Standards/Access/Courtesy/Value for Money), 4 GAFs, 2 Key Activities per KRA (8 total), 1 PDP (Basic Project Management / Formal Course). Submit → status **Draft → Review** (routed to LungileN).
   - *Note:* the Workplan step correctly **blocked Next with a validation banner** ("KRA '…' must have at least 2 Key Activities") when one KRA had only 1 activity — fixed by adding the 2nd, then it advanced. (Good validation behaviour.)
2. **Supervisor Refer for Dispute** (`LungileN`): Review task → **Refer for Dispute** → confirm dialog "Are you sure you wish to refer this Performance Agreement for Mediation?" (Yes gated by a Comments entry) → status **Review → Under appeal**, routed to mediator **Babalwa M**.
3. **Mediator resolution** (`BabalwaM`): inbox action **"Mediator Review Disagreement and attempt to resolve"** (status Under appeal; supervisor's dispute comment carried in the thread). Selected **"The disagreement has been resolved"**, added a mediation comment + Save → **Submit**. Routed back to the **employee** as **"Update Performance Agreement with Outcomes"** (status Review). ✓ (matches 2026-07-15 behaviour, now with Babalwa M as mediator)
4. **Employee Update with Outcomes** (`JabuH`): ⛔ **BLOCKED** — see bug.

## 🐞 BUG — "Update Performance Agreement with Outcomes" Submit does not process
- Form: `SaGov.Pmds/sagov-performanceagreement-wf-updateperformanceagreement v43`.
- On opening the task, the **Submit button stays disabled** until every sub-tab (Details/Scoring/Workplan/PDP) has been visited so its data hydrates — and even then enablement is **inconsistent** (sometimes enables, sometimes stays disabled after cycling all tabs + waiting).
- When Submit **is** enabled and clicked, **nothing happens** — no navigation, no validation banner. The task **remains in the employee's inbox** (verified across 5+ clicks and full page reloads), i.e. it never reaches the supervisor's "Review Updated PA" step.
- Console errors on the Submit action:
  - `Action name is mandatory` (×8) — a configured action on the form is missing its name.
  - `TypeError: Cannot read private member #L from an object whose class did not declare it` at `Proxy.post (...)` inside a configurable-action script — the HTTP POST the Submit performs throws.
- **Verified not a harness issue:** buttons are real-clicked and land; the item persists server-side (still in inbox after reload); no client validation is shown; reproducible across reloads.
- **Impact:** the resolved-dispute tail cannot complete — Update → supervisor re-review → HR verify → Generate PERSAL Input is unreachable via the UI. (On 2026-07-15 this same step completed successfully, so this is a regression, likely tied to today's data reset / form re-publish. A stray "Test" info-banner is present on the PMDS PA forms, another sign of a recent config edit.)

## Also observed (non-fatal)
- Draft/Review/Verify forms log repeated `executeScriptSync ... reading 'cycle'/'tableData'` from visibility-expression scripts — noisy but non-blocking.
- Draft-wizard Next transitions are slow/feedback-less (documented in the Simmy happy-path report).

## Environment
- Employee pwd `123qwe`; mediator **BabalwaM/123qwe**; supervisor LungileN; HR SalesHR.
- Inbox: `dynamic/Shesha.Workflow/workflows-inbox`; tasks via `shesha/workflow-action?id=<paId>&todoid=<todoId>`.
