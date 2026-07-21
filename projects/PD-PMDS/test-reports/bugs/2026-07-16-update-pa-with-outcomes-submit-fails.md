# BUG — PMDS "Update Performance Agreement with Outcomes" Submit does not process

**Date:** 2026-07-16
**Project:** PMDS (SL 1-12 Performance Agreement, FY2026/27)
**Form:** `SaGov.Pmds/sagov-performanceagreement-wf-updateperformanceagreement v43`
**Severity:** High — blocks the resolved-dispute tail (employee update → supervisor re-review → HR verify → Generate PERSAL Input).
**Reproduced:** Employee Jabu Hadebe (`JabuH`), PA2026/5987, after a mediator (Babalwa M) marked the dispute **resolved**.

## Summary
After a Refer-for-Dispute is **resolved** by the mediator, the PA routes back to the employee with action **"Update Performance Agreement with Outcomes"**. On this screen the **Submit does not process** — the workflow does not advance and the task remains in the employee's inbox.

## Steps to reproduce
1. Employee drafts + submits a PA (Draft → Review).
2. Supervisor **Refer for Dispute** (Review → Under appeal, to mediator).
3. Mediator selects **"The disagreement has been resolved"** → Submit (routes back to employee as "Update Performance Agreement with Outcomes", status Review).
4. Employee opens the Update task, ticks the Confirmation checkbox, and clicks **Submit**.

## Expected
PA advances Review → HR Review (to the supervisor's "Review Updated PA with Outcomes" step), and the task leaves the employee's inbox.

## Actual
- **Submit enablement is unreliable:** the button stays disabled until all sub-tabs (Details/Scoring/Workplan/PDP) are visited to hydrate their data, and even then it does not consistently enable.
- **When enabled and clicked, Submit does nothing** — no navigation, no validation/error banner shown to the user. The task **remains in the employee's inbox** (verified across 5+ clicks and multiple full page reloads).
- Console errors emitted on the Submit action:
  - `Action name is mandatory` (repeated ×8) — a configured action on the form has no name.
  - `TypeError: Cannot read private member #L from an object whose class did not declare it` at `Proxy.post (.../f1a12f00-….js)` — the HTTP POST performed by the Submit action throws.

## Evidence it is an app defect (not the test harness)
- Buttons are genuinely clickable and the clicks register (focus moves, console errors fire per click).
- The item is unchanged server-side after Submit — still present in the employee inbox after reload.
- No client-side validation message is displayed.
- Reproducible across page reloads and a clean re-attempt.

## Notes / likely cause
- This exact step **worked on 2026-07-15** → regression, likely introduced by today's PMDS data reset / form re-publish.
- A stray **"Test"** info-banner appears at the top of the PMDS PA forms — indicates a recent, possibly incomplete, form configuration edit.
- The `Action name is mandatory` error strongly suggests a configurable action on the Submit button (or a child action step) is missing its `actionName`, causing the POST to throw.

## Screenshots (hub root)
`pmds-jabu-update-submit.png`, `pmds-jabu-update-submit2.png`, `pmds-jabu-workplan-check.png`.
