# Bug: the Annual Compliance "Quality Assure" decision is rejected with HTTP 403 and the UI reports success

**Date:** 2026-08-26
**Severity:** 🔴 **High** (the quality-assurance step of the annual-compliance process cannot be completed; the assessor is told it succeeded)
**Area:** Admin portal — `boxfusion.dsdnpo/annual-compliance-quality-assure v19`, reached via `/shesha/workflow-action` → **Quality Assurance**
**Environment:** QA · admin portal · view mode Latest
**Accounts used:** `npo.qa.staff.c@example.org` (`Annual Compliance Quality Assurer`, no `Authorised Admin`)
**Found by:** functional TC-09-004 (#101759) on submission `28f3a797-…` (`ANN2119/17/08/2026`, `333-019-NPO` — our own NPO)

## What happens

The Quality Assure modal behaves correctly right up to the point of saving.

**Validation works.** `Decline` stays disabled while *Description* is empty and enables when it is filled — toggled in
both directions. `Approve` is disabled when the answer is `No`, and enabled (without a Description) when it is `Yes`.
All of that is right.

**Then nothing is saved.** Pressing **Decline** shows:

> *"Compliane declined."*  ← sic

the modal closes, and the record is untouched:

```
reportMatches            false   (unchanged)
reportMatchesDescription null    <-- the reason the assessor typed is NOT saved
complianceStatus         3       (unchanged)
status                   2       (unchanged)
lastModificationTime     2026-08-22T22:01:32   <-- four days before the test
```

## 🔑 The mechanism — corrected 2026-08-26 12:15 UTC

> ⚠️ **An earlier version of this report said "no HTTP mutation is issued". That was WRONG**, and it was wrong for a
> methodological reason worth recording: the network log was read through a **URL regex filter** that did not match
> the endpoint actually used. Re-tested with `fetch` and `XMLHttpRequest` instrumented directly, so no URL could be
> missed.

**A request IS issued, and the server refuses it:**

```
POST https://dsd-npo-api-qa.shesha.app/api/services/SheshaWorkflow/Process/UserTaskSave
  → 403
  {"success":false,"error":{"message":"You are not authorized to perform this action"},
   "unAuthorizedRequest":true}
```

**The client swallows the 403 and shows a success toast.** That is the defect: a rejected decision reported as a
completed one.

**🔴 And it is not a role gap.** The same 403 is returned for:

| Account | Roles | `UserTaskSave` |
|---|---|---|
| `npo.qa.staff.c@example.org` | `Annual Compliance Quality Assurer` + `Appeal Tribunal Member` | **403** |
| `mpenduloizwelinuk@gmail.com` | broadly privileged, holds `Authorised Admin` | **403** |

So **no account we have can complete a workflow user-task decision**, including the most privileged one on the
environment. Either the permission behind `UserTaskSave` is held by nobody, or the check is wrong.

**No notification is raised.** Filtering the notification store strictly to after the click returns nothing related to
annual compliance. (Other messages exist around that time — `Approved Change Request`, `Post Registration` — but they
precede the click and belong to concurrent activity by another actor on this shared environment.)

**`Approve` behaves identically.** With `Yes` selected, Approve was pressed on the same submission: same 403 on
`UserTaskSave`, and `lastModificationTime` still `2026-08-22`. **Both decision paths are refused.**

## Steps to reproduce

1. Find an `AnnualComplianceSubmission` with **`status == 2`** (In Progress — `Status` is Shesha's `WorkflowStatus`,
   where 3 = Completed).
2. Find an open todo item for it:
   `WorkflowTodoItem/Crud/GetAll` filtered on `workflowInstance == <submissionId>`.
3. Open `/shesha/workflow-action?id=<submissionId>&todoid=<todoItemId>`.
   ⚠️ **Not** `annual-compliance-quality-assure` directly — that renders permanently disabled and is not this bug.
4. Click **Quality Assurance** → the modal opens, fully editable.
5. Select **No**, type a Description, click **Decline**.
6. Observe: *"Compliane declined."*, modal closes — but `POST …/Process/UserTaskSave` returned **403**,
   `reportMatchesDescription` is still `null` and `lastModificationTime` is unchanged.
   ⚠️ Watch the **full** network log or instrument `fetch`/`XHR`; a URL filter can easily miss `UserTaskSave`.
7. Repeat with **Yes** → **Approve**: same.

## Impact

- **The annual-compliance QA step cannot be completed at all.** A submission can never be approved or sent back.
- **The assessor is actively misled** — a success toast for a decision that was discarded. The NPO is left waiting for
  a resubmission request that will never arrive, and the assessor has no reason to check.
- The typed reason is lost, so there is no audit trail of the assessment either.
- It blocks functional TC-09-004 and the smoke case TC-09-003 (*"Quality Assure allows confirming correctness or
  capturing non-alignment"*).

## What was ruled out

- **Not a stale todo item** — reproduced across **three different** todo ids (`3eeaa7a4…`, `9a853116…`, `cf252947…`).
  A single submission carries up to **20** identical todo items.
- **Not a completed workflow** — the submission is `Status = 2`, In Progress.
- **Not the wrong id type** — the known trap (passing an `AnnualCompliance` id instead of an
  `AnnualComplianceSubmission` id, which gives a 400 and a stuck *"Fetching data…"*) did **not** occur; the form
  loaded its data cleanly.
- **Not a *client-side* permission problem** — the modal renders fully editable and its buttons arm and disarm
  correctly. But the **server** rejects the save with 403 for every account tried, `Authorised Admin` included, so
  authorization *is* where it fails — just not in a way any UI state reveals.
- **Not a record we do not own** — `333-019-NPO` is our own QA NPO and its contact details are the tester's own, so
  nothing was sent to a third party.

## 🔑 This is the second instance of the same pattern today
`Send to Arbitration Tribunal Chairperson` on the appeals workflow fails the same way from the user’s point of view —
confirmation shown, nothing written, no error. ⚠️ **That report’s "no request is issued" claim was produced by the
same flawed filtered-log method and is now marked unverified**; the likely mechanism is this same 403 on
`Process/UserTaskSave`. See `2026-08-26-send-to-arbitration-chairperson-fires-no-request.md`.
**Both are workflow user-task decisions going through the same endpoint — almost certainly one fault, not two.**

## Suggested fix
1. **Work out why `Process/UserTaskSave` returns 403** — it refuses even `Authorised Admin`.
2. **Never show a success message on a non-2xx response.** This is the half that misleads the assessor.
3. Fix the toast spelling: *"Compliane"* → *"Compliance"*.
4. Check the sibling appeals action for the same root cause.

## Related
- Report: `../2026-08-26/09-annual-compliance-backend-qa-functional--qa-form-validates-but-never-persists.md`
- `2026-08-26-send-to-arbitration-chairperson-fires-no-request.md`
- `../audits/2026-08-26-reverification-of-three-uncertain-conclusions.md` (how the form is correctly reached)
