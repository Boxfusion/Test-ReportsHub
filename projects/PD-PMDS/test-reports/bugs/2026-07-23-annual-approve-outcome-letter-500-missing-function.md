# BUG — Annual Assessment: "Approve Outcome Letter" fails with HTTP 500 (undefined workflow function)

**Date:** 2026-07-23
**Module:** PMDS — SL 1-12 Performance Agreement, FY2026/27 — **Annual Assessment** stage
**App:** HCM Admin Portal — https://pd-hcm-adminportal-qa.shesha.app/ (QA)
**Severity:** High — blocks the **final step** of the Annual Assessment happy path; no Annual assessment can reach Completed.
**Status:** OPEN (found this session)

## Summary
On the **last** step of the Annual Assessment chain — **"Approve Outcome Letter"** (Head of Business Unit, `Tyla`) — clicking **Approve** fails with **HTTP 500** on `SheshaWorkflow/Process/UserTaskComplete`. The server reports a **missing/undefined function** in the workflow definition. The assessment therefore cannot be completed; it stays parked at the Approve-Outcome-Letter step. Every prior step in the chain succeeded.

## Exact server error (captured from the 500 response body)
```
{"success":false,"error":{
  "message":"An internal error occurred during your request!",
  "details":"Task execution failed. Workflow instance id: `e5d85ed8-10d5-442d-b240-1e144f8a53fa`,
             elementId: `Activity_0jwh6hy` (getOutcomeLetterApproverFullNameWithTitle is not a function)"
}}
```
- Failing endpoint: `POST https://pd-hcm-api-qa.shesha.app/api/services/SheshaWorkflow/Process/UserTaskComplete` → **500**
- Workflow form: `SaGov.Pmds/sagov-performancereview-approveoutcome-annualassessment v26`
- Activity: `Activity_0jwh6hy`
- Root cause: the workflow-script expression calls **`getOutcomeLetterApproverFullNameWithTitle(...)`**, which **is not a function** (undefined in the workflow's script scope). This is a code/definition defect in the Annual "Approve Outcome Letter" activity — not a data or input problem.

## Steps to reproduce
1. Drive an Annual Assessment through to the **Approve Outcome Letter** step (self-assessment → supervisor sign → SalesHR Confirm Assessment → KamoM Sign Assessment → Tems Approve Assessment → KabeloM **Draft Outcome Letter**).
2. Log in as **Tyla** (Head of Business Unit, `Tyla`/`123qwe`).
3. Open the **"Approve Outcome Letter"** inbox task for PR2026/3717.
4. Click **Approve**.

## Expected
The task completes, the outcome letter is approved, and the Annual Assessment reaches its terminal state (Completed / Awaiting PERSAL). Dashboard Annual **Completed** increments.

## Actual
- Clicking **Approve** silently fails in the UI (no visible toast/error message) but the network call returns **500** with `getOutcomeLetterApproverFullNameWithTitle is not a function`.
- The task stays in Tyla's inbox (`Approve Outcome Letter`, PR2026/3717). Assessment status unchanged; Annual Completed = 0.
- Reproduced on **every** click (3+ attempts) — stable, not transient.

## Related upstream symptom (likely same feature area)
At the prior step, **KabeloM "Draft Outcome Letter"**, generating the letter produced a toast **"Task saved successfully!"** immediately followed by **"PDF generation unsuccessful"**. The letter task still submitted and routed to Tyla, but the **Outcome Letter attachment is empty** on the Approve screen (the "Outcome Letter" section shows only "(press to upload)", no generated document). The two issues both sit in the outcome-letter sub-feature and may share a cause (the outcome-letter generation/approval script).

## Ruled out (per "verify before claiming app bug")
- **Harness/automation:** the failing logic is 100% server-side (workflow script). A human clicking Approve hits the identical 500 — no client input is involved in the failing expression.
- **Timing:** retried 3+ times over several minutes; the 500 is deterministic, same error each time.
- **Client validation / missing field:** the Approve button is enabled, no form-validation errors surface; the request reaches the server and fails in the workflow engine.
- **Wrong actor:** Tyla is the correct assignee (task is in her inbox; the form loaded fully with the KRA/moderation/comment data).
- **Missing Outcome Letter attachment:** ruled out. Manually uploaded a document to the empty "Outcome Letter" field (`annual-outcome-letter.txt`, attachment confirmed on the form) and clicked Approve — **identical 500** with the same `getOutcomeLetterApproverFullNameWithTitle is not a function`. The empty attachment (from the upstream "PDF generation unsuccessful") is therefore NOT the cause; the failure is purely the undefined workflow function that resolves the approver's full name/title.

## Impact
The Annual Assessment stage **cannot complete** — every Annual assessment will fail at the final Approve-Outcome-Letter step regardless of user or data, because the workflow script references an undefined function. High severity: it blocks the terminal transition of the entire Annual cycle.

## Recommendation
Fix the Annual "Approve Outcome Letter" activity (`Activity_0jwh6hy`, form `sagov-performancereview-approveoutcome-annualassessment v26`): define/register **`getOutcomeLetterApproverFullNameWithTitle`** in the workflow script scope (or correct the call to the intended helper). While there, verify the **outcome-letter PDF generation** at the Draft step (the "PDF generation unsuccessful" toast) so the approved letter actually carries a document.
