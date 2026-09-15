# Bug: "Send to Arbitration Tribunal Chairperson" silently does nothing — the appeal workflow has no forward exit

> ⚠️ **Filename note:** this file is named `…fires-no-request.md`, but the "no request" element of the diagnosis has
> since been **retracted as unverified** (see the 12:20 correction). The filename is kept so existing links do not
> break. The *behaviour* — nothing written, success implied — is unchanged and confirmed.

**Date:** 2026-08-26
**Severity:** 🔴 **High** (the only admin action that advances an appeal past *Case Preparation* fails silently; the appeals lifecycle cannot progress through the UI)
**Area:** Admin portal — `boxfusion.dsdnpo/appeal-details-view v47` → button **Send to Arbitration Tribunal Chairperson**
**Environment:** QA · admin portal · view mode Latest · signed in as `mpenduloizwelinuk@gmail.com` (`Authorised Admin`)
**Found by:** running smoke TC-11-008 / functional TC-11-009 against `APPEAL1447/26/08/2026`, the first appeal QA has owned

## What happens

On an appeal at *Case Preparation*, the admin clicks **Send to Arbitration Tribunal Chairperson**. A confirmation
dialog appears:

> **Send to Arbitration Chairperson**
> Are you sure you want to send the appeal to the arbitration tribunal chairperson?
> `Cancel` `OK`

Clicking **OK** closes the dialog and **nothing else happens**. There is no success message, no error message, and
no visible change. To the user it is indistinguishable from having worked.

Nothing was written:

```
appealStatus         1      (Case Preparation — unchanged)
tribunalChairPerson  null   (unchanged)
lastModificationTime 2026-08-26T05:01:46.773   <-- the applicant's submit, 4 minutes earlier
```

Nothing was sent — the notification store gained **no** message at the time of the click (five messages exist across
the whole session window, all accounted for by an account invitation and the submit acknowledgements).

**And no mutation appeared in the network log** — only re-reads of the same record (`Note/GetList`,
`StoredFile/EntityProperty`, `DeregistrationAppeal/Crud/Get`). ⚠️ **See the 12:20 correction below: that log was
read through a URL filter and this observation is now unsafe.** What is *not* in doubt is that nothing was written.

## Why — two faults in the same handler

```
[LOG]   Current http timeout: undefined
[LOG]   Change http timeout
[ERROR] Failed to change timeout TypeError: Cannot set properties of undefined (setting 'timeout')
[LOG]   Daaaaattta [] {id: 20124dcc-70fb-44a9-82d7-4c286ebeab6a, appealStatus: 1, …}
[ERROR] Failed to load resource: the server responded with a status of 400 ()
          …/api/dynamic/Shesha.Workflow/WorkflowTodoItem/Crud/Get?id=null
[ERROR] FAILED TO GET TODOITEM  AxiosError: Request failed with status code 400
```

1. The handler throws immediately, trying to set `.timeout` on an undefined object.
2. It then fetches a workflow todo item with a **null id**, which 400s.

Neither failure is surfaced to the user. The dialog's OK path treats the throw as completion.

## Steps to reproduce

1. Sign in to the admin portal as an `Authorised Admin`.
2. CRUDS → **Appeals** → open any appeal at *Case Preparation* (e.g. `APPEAL1447/26/08/2026`).
   ⚠️ Open it on **`appeal-details-view`** — the grid's own link goes to `appeal-details-view-crud`, which does not
   carry this button at all.
3. Click **Send to Arbitration Tribunal Chairperson** → **OK**.
4. Observe: dialog closes, no message, `appealStatus` unchanged, `lastModificationTime` unchanged, no notification
   created, no request in the network log.

## Impact

- **The appeal lifecycle has no forward exit through the admin UI.** *Case Preparation* is where every appeal we can
  create comes to rest, and this is the only action offered on the screen.
- It blocks 11A functional TC-02/03/04/05 (Forward to Appeal Board, Notice of Tribunal, Upheld, Denied) from ever
  being exercised on an appeal QA owns. Those cases have only ever been verdicted by observing records belonging to
  other users.
- A silent failure is worse than an error here: an administrator has every reason to believe the appeal has gone to
  the tribunal, and the appellant is waiting on a step that never started.

## What was ruled out

- **Not the harness** — a real click on a visible, enabled button; the dialog opened and closed normally.
- **Not the wrong screen** — the alternative admin form `appeal-details-view-crud v4` carries no Send action of any
  kind, so this is the only place it exists.
- **Not permissions** — every control on the form renders for this account.

## ✅ The workflow-context caveat is now CLOSED — re-tested 2026-08-26 08:49 UTC

This report originally carried an open caveat: the `WorkflowTodoItem…?id=null` call suggested the action might be
broken *only* when opened outside a workflow context. **That has been tested and ruled out.**

`APPEAL1447` does carry **7 open todo items**, on task `Activity_1m055xb` (*"Case Preperation"* — sic). The action was
re-driven through the proper workflow route:

```
/shesha/workflow-action?id=20124dcc-70fb-44a9-82d7-4c286ebeab6a
                       &todoid=d8617b1e-2545-4a7a-8d9b-3bedf1211c0b
```

| Signal | Result |
|---|---|
| `WorkflowTodoItem/Crud/Get?id=d8617b1e-…` | **200** — the todo item resolves correctly (no longer `id=null`) |
| **Send to Arbitration Tribunal Chairperson** | renders, **enabled** |
| On confirm — mutation request | **none. No POST of any kind.** |
| `appealStatus` | **1**, unchanged |
| `tribunalChairPerson` | **null**, unchanged |
| `lastModificationTime` | **05:01:46**, unchanged |

**So the action fails with a valid workflow context, not merely without one.** The defect is in the action itself.
Severity stands.

📌 Worth knowing for other screens: this same route **does** work elsewhere — the annual-compliance
*Quality Assurance* action opens a fully functional modal through exactly this pattern. So the route is sound and the
todo items are real; it is this specific handler that is broken.
See `../audits/2026-08-26-reverification-of-three-uncertain-conclusions.md`.

## ⚠️ CORRECTION 2026-08-26 12:20 UTC — the "no request is issued" claim is RETRACTED as unverified

> The claim that this action issues **no HTTP request** was produced by reading the network log through a **URL regex
> filter**. That method has since been shown to miss the relevant endpoint: on the sibling annual-compliance action,
> the same filter hid a `POST …/SheshaWorkflow/Process/UserTaskSave`. **So "no POST" here is unsafe and should not be
> relied on.**

**What remains fully verified and is unaffected:**
- The confirmation dialog closes and reports nothing wrong.
- `appealStatus`, `tribunalChairPerson` and `lastModificationTime` were **unchanged** after the action, across two
  attempts — one without a workflow context and one with a valid `todoid` that resolved 200.
- No chairperson notification was created.

**Probable mechanism, by analogy — to be confirmed:** the annual-compliance decision on the same workflow endpoint
returns **403 "You are not authorized to perform this action"**, for the `Authorised Admin` account as well as a
role-scoped one, and the client swallows it and shows success. This action is the same kind of workflow user-task
decision, so the same 403 is the likely cause. See
`2026-08-26-annual-compliance-quality-assure-never-persists.md`.

⚠️ **Not re-tested directly, and why:** `APPEAL1447` is no longer in a state that offers the button. At **08:57** it
was moved to **Denied / Completed** by user **15932 (`welcomegalane@gmail.com`)** — **not one of our accounts** (ours
are 15918 and 15944–15948) — with the comment `"hjhkb"`. Another tester actioned our appeal on this shared
environment. **To confirm the mechanism, initiate a fresh appeal on a status-9 NPO we own and repeat the action with
`fetch`/`XHR` instrumented rather than a filtered log.**

🔑 That someone else *did* advance the appeal to Denied shows the appeals workflow can be moved by some route — most
likely the `appeal-outcome` form's own **Save**, which is a direct entity write rather than a workflow user-task
decision. The distinction between those two paths is probably the whole story and is worth putting to the developer.

## Suggested fix

1. Surface the failure — the OK path must not report success when the handler threw.
2. Guard the null `todoid` and return a usable message rather than a 400.
3. Fix the `Cannot set properties of undefined (setting 'timeout')` throw.
4. ~~Confirm whether an appeal is supposed to generate an admin workflow todo item on submission~~ — **answered: it does.** 7 exist for this appeal, and supplying one changes nothing.

## Related
- `2026-08-20-initiate-appeal-is-ungated-and-creates-invisible-orphan-appeals.md`
- Report: `../2026-08-26/11a-appeals-admin--send-to-chairperson-is-a-dead-button.md`
