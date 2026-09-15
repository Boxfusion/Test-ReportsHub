# BUG — Contracting mediator "disagreement NOT resolved" (escalation) Submit fails with server 500

**Date:** 2026-07-23
**Project:** PD-PMDS (SL 1-12 Performance Agreement, FY2026/27)
**App:** HCM Admin Portal (PMDS module) — https://pd-hcm-adminportal-qa.shesha.app/ (QA)
**Severity:** Low (downgraded) — a manual Submit of the same step succeeded, so the escalation path is NOT blocked; the 500 appears automation-specific or transient
**Status:** Cannot reproduce manually — see 2026-07-23 update below
**Ref:** PA2026/6367 (Sanele Sithole), workflow instance `b6f60f02-1d15-47de-a973-a63974403e6a`, todo `9705543d-a47f-4190-81b0-d4f5f558a8e5`

## Summary
On the Contracting **"Mediator Review Disagreement and attempt to resolve"** screen, selecting **"The disagreement has not been resolved"**, entering the mandatory Comments, attaching the mandatory file, and clicking **Submit** fails: the workflow-completion API returns **HTTP 500** and the task does not advance. The dispute cannot escalate to the mediator's supervisor, so the escalated-dispute workflow is blocked.

## Steps to reproduce
1. Employee (`SaneleS`) drafts + submits a Performance Agreement (PA2026/6367) → Review.
2. Supervisor (`LungileN`) **Refer for Dispute** (comment) → status Under appeal → mediator.
3. Mediator (`BabalwaM`) opens **"Mediator Review Disagreement and attempt to resolve"**.
4. Select radio **"The disagreement has not been resolved"** (reveals Comments\* + Attachments\* sub-form).
5. Enter Comments; upload an attachment (file chooser → `StoredFile/Upload` returns **200**, file binds — `fileList 1`).
6. Click **Submit**.

## Expected
Task completes; dispute escalates to the mediator's supervisor as a **"Mediator Supervisor Review Disagreement and attempt to resolve"** task (status remains Under appeal). This is the behaviour proven on 2026-07-22 (Sanele PA2026/6281).

## Actual
`POST /api/services/SheshaWorkflow/Process/UserTaskComplete` returns **HTTP 500**; console: `Something went wrong AxiosError: Request failed with status code 500`. The screen stays on the mediator task; nothing routes onward. **Reproduced on two consecutive Submit attempts.**

## Evidence the client payload was correct (rules out a harness/automation artifact)
Console instrumentation on the form immediately before Submit showed all required data bound:
- `pageContext.disagreementDecision: 2` (= "not resolved")
- `data.model.mediatorComments: "Mediation was held but the employee and supervisor could not reach agreement…"` (full text)
- `fileList 1` and `ghostValue: Proxy(ss)` (attachment bound)
- `POST /api/StoredFile/Upload => 200` (attachment stored successfully server-side)

Only the subsequent `UserTaskComplete` call fails, and it fails with a **500 (server exception)**, not a 400 validation rejection. Screenshot: `.playwright-mcp/pmds-mediator-notresolved-500.png`.

## Contrast — the resolved path works
Earlier the same day, the mediator **"disagreement has been resolved"** path (Adam PA2026/6313) completed cleanly through the full chain to Generate PERSAL Input. The failure is specific to the **not-resolved / escalation** transition.

## Notes / possible cause
The 500 is an unhandled server exception on the workflow transition that routes the appeal to the mediator's supervisor. Possible that the escalation recipient (mediator Babalwa M's supervisor) is not resolvable in the current org data, causing the transition to throw — but that is speculative; the API returns a generic 500 with no client-visible detail. Needs server-log inspection.

## Impact
Does **not** block the escalated-dispute path (see update). Happy path and single-level resolved-dispute path are unaffected.

## Update 2026-07-23 — manual Submit SUCCEEDED (bug downgraded)
The user performed the exact same mediator "not resolved" Submit **manually** and it went through: the appeal escalated correctly to the mediator's supervisor (**Tania**), where the task now sits. So the escalation transition itself is healthy server-side. The 500 seen under automation was therefore **automation-specific or transient**, not a workflow regression — most likely a timing issue where the just-uploaded attachment / just-set comment had not fully committed before the automated Submit fired (the two automated attempts were ~seconds apart, possibly before the file's server binding was fully consistent for that request). **Downgraded to Low / cannot-reproduce-manually.** If it recurs under automation, add a wait after `StoredFile/Upload` returns 200 and re-verify `fileList` before Submitting.
