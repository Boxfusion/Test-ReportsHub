# Bug: Deregistration "Validate Documents" fails — workflow definition not found (UserTaskSave 400)

**Date:** 2026-08-20
**Severity:** High (the voluntary-deregistration admin lifecycle cannot proceed past submission; no insufficient-documents notice, no denial, no approval can be recorded)
**Area:** Admin portal — `boxfusion.dsdnpo/allDeregistrationApplications-details` → **Validate Documents** (`validate-documents v25`), backed by `SheshaWorkflow/Process/UserTaskSave`
**Environment:** QA
**Found by:** Suite 13A (TC-13-011)

## Summary
On an In-Progress voluntary deregistration, opening **Validate Documents**, choosing **"Are all documents received: No"** with a comment, and clicking **Decline** fails: `POST /api/services/SheshaWorkflow/Process/UserTaskSave` returns **400**. The insufficient-documents outcome is never recorded — status stays *In Progress*, no `Case`/notice is written, and `NotificationMessage` gains no row. The FDS-required "notice sent to org, 30-day resubmission window starts" therefore never happens.

## Root cause (server-side)
The modal first resolves the user-task decisions:
```
GET /api/services/SheshaWorkflow/WorkflowDefinition/GetUserDecisions
    ?module=boxfusion.dsdnpo&name=voluntary-deregistration-definition&userTaskUid=Activity_1ga0s1z
→ 404  {"error":{"code":404,"message":"workflow-definition `boxfusion.dsdnpo\\voluntary-deregistration-definition` not found"}}
```
With the workflow definition unresolvable, the subsequent decision save 400s. The client also logs
`shesha.common:Show Dialog` action failures and a React error #419.

## Steps to reproduce
1. Admin portal → open an **In Progress** voluntary deregistration (`allDeregistrationApplications-details?id=…`).
2. Click **Validate Documents**.
3. Set **Are all documents received = No**, type a comment, click **Decline**.
4. Observe the network: `GetUserDecisions` 404 (×4) then `Process/UserTaskSave` 400. The record stays *In Progress*.

## Actual
`UserTaskSave` 400; outcome not recorded; no notification raised. Reproduced twice (synthetic radio + genuine real click) — consistent, not intermittent.

## Expected
Declining the documents as insufficient should record the outcome, transition the deregistration to *Incomplete*, send the insufficient-documents notice to the organisation, and start the 30-day resubmission window (FDS Dereg 6.2 rule 7a).

## Why it matters
- The entire deregistration **admin lifecycle** (insufficient → 30-day → denial, and by extension approval) is gated behind this workflow action. If the `voluntary-deregistration-definition` is not registered/deployed on QA, no deregistration can be processed to a decision.
- Existing *Incomplete/Denied/Approved* records in the queue predate this state, so this looks like a **regression / missing deployment** of the workflow definition rather than a never-worked feature.

## Scope / notes
- Verified on our own submission (NPO 333-019, dereg `7a7419b7`). NPO remained **REGISTERED**; the record is now stuck **In Progress** because the same action cannot complete.
- The **Approve** (documents sufficient) path was **not** exercised — approving would carry 333-019 toward actual deregistration. Whether Approve hits the same 404 is unverified by design; the `GetUserDecisions` 404 is upstream of both buttons, so it very likely does.
- Question for the test lead ([[dont-raise-defects-in-daily-reports]]): is `voluntary-deregistration-definition` expected to be deployed on QA? If so this is a deployment/config gap; if the definition was renamed, the detail form's `name=` is stale.
