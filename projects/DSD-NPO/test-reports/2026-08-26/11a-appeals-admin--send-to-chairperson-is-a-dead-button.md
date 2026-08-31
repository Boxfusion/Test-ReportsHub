# Report: NPO-11A — Appeals admin / tribunal (smoke) — Send to Chairperson is a dead button

**Date:** 2026-08-26 05:15 UTC
**Plan:** test-plans/appeals/11a-appeals-admin-tribunal.md
**Execution Mode:** ai-repair
**Result:** FAILED — with an appeal we own, the admin action that is supposed to move an appeal to the tribunal was driven for the first time. **Nothing is written and no email is sent**, yet the confirmation dialog closes with no error. ⚠️ The original "issues no request at all" claim is **retracted as unverified** (filtered-log method); the probable mechanism is a **403 on `Process/UserTaskSave`** — see the correction below.
**Duration:** ~900s
**Cases:** TC-02 (smoke #101780) · TC-01 (functional #101781, cross-referenced)
**Environment:** QA · admin portal · **view mode Latest (asserted in-run)** · appeal `APPEAL1447/26/08/2026` on NPO `Test Unsuccessful 03`
**Accounts used:** `mpenduloizwelinuk@gmail.com`

## Summary
| Total attempted | Passed | Failed | Partial | Not executed |
|---|---|---|---|---|
| 2 | 0 | 1 | 0 | 1 |

| Case | ADO | Verdict | One-liner |
|---|---|---|---|
| TC-02 Send to Chairperson emails the appeal and moves it to Case Preparation | #101780 | 🔴 FAILED | **No email field exists**, nothing is written, no email is sent, and the status does not change |
| TC-01 (functional) Send-to-Chairperson with an invalid email is blocked | #101781 | ⚪ NOT EXECUTED | The case is premised on an email input that **does not exist** — needs rewriting, not running |

## Test Cases

### TC-02 — Send to Chairperson emails the appeal and moves it to Case Preparation (#101780 · TC-11-008) — FAILED

This case has been blocked since 08-18 as *"needs our own appeal in status Initiated"*. We now own
`APPEAL1447/26/08/2026`, so it was driven directly. It fails on two of its three assertions.

The action lives on **`boxfusion.dsdnpo/appeal-details-view v47`**, reached from CRUDS → Appeals, as the button
**"Send to Arbitration Tribunal Chairperson"**.

**Assertion 1 — the dialog accepts an email address: FAILS.** The dialog has no input of any kind:

> **Send to Arbitration Chairperson**
> Are you sure you want to send the appeal to the arbitration tribunal chairperson?
> `Cancel` `OK`

Zero form items, zero inputs — a bare confirmation. Step 3 of the case (*"TYPE the chairperson's email"*) has
nothing to type into.

🔑 **This answers the open question the plan raised for Thabiso.** The plan asks *"the chairperson email is typed in
free-form at this step — is that intended?"* It is **not typed at all**. The address must come from configuration or
a role. That is arguably better than free-form entry, but it means **both** TC-11-008 step 3 and functional
TC-11-009 in their entirety describe a UI that does not exist.

**Assertion 2 — the status becomes `CasePreparation` (RefList = 1): FAILS to demonstrate anything.** The appeal was
**already** at `appealStatus = 1` on arrival, and after clicking OK it is unchanged:

```
appealStatus         1      (unchanged)
tribunalChairPerson  null   (unchanged)
lastModificationTime 2026-08-26T05:01:46.773   <-- the submit, 4 minutes earlier
```

`lastModificationTime` did not move, so the record was not written at all.

**Assertion 3 — the chairperson receives the appeal by email: FAILS.** The notification store holds **five** messages
across the whole session window (04:45 → 05:15): one account invitation and four appeal acknowledgements, all from
the 05:01:46 submit. **Nothing was created at 05:05 when the action was clicked. No chairperson message exists.**

**⚠️ The "issues no HTTP request" claim is RETRACTED as unverified (12:20 UTC).** It came from a URL-filtered network
read, and that method has since been shown to hide `POST …/SheshaWorkflow/Process/UserTaskSave` on the sibling
annual-compliance action. **What stands unchanged:** nothing was written (`appealStatus`, `tribunalChairPerson`,
`lastModificationTime` all unmoved across two attempts) and no notification was raised. The probable mechanism is the
same **403 "You are not authorized to perform this action"** seen on `UserTaskSave` — to be confirmed on a fresh
appeal. See `../bugs/2026-08-26-annual-compliance-quality-assure-never-persists.md`.

The console shows why the handler dies before it can send anything:

```
[LOG]   Current http timeout: undefined
[LOG]   Change http timeout
[ERROR] Failed to change timeout TypeError: Cannot set properties of undefined (setting 'timeout')
[LOG]   Daaaaattta [] {id: 20124dcc-…, appealStatus: 1, …}
[ERROR] Failed to load resource: 400  …/Shesha.Workflow/WorkflowTodoItem/Crud/Get?id=null
[ERROR] FAILED TO GET TODOITEM  AxiosError: Request failed with status code 400
```

Two faults in one handler: it throws setting a timeout on an undefined object, then requests a workflow todo item
with **`id=null`**.

Bug: `../bugs/2026-08-26-send-to-arbitration-chairperson-fires-no-request.md`

**What was ruled out before calling this a defect** (per `verify-before-claiming-app-bug`):
- Not the harness — a real Playwright click on the visible enabled button; the dialog opened and closed normally.
- Not the wrong form — the other admin appeal form, `appeal-details-view-crud v4` (the route the CRUDS grid links
  to), carries **no Send action at all**; it is a data-editing form (Comments, Ruling Attachment, Claim Document,
  Correspondence/Re-Send). So `appeal-details-view` is the only place this action exists.
- Not a *client-side* permissions problem — the form renders every control and the shared account holds
  `Authorised Admin`. ⚠️ Server-side authorization is **not** ruled out: the sibling workflow action returns 403.

✅ **The workflow-context possibility is now RULED OUT** — re-tested 2026-08-26 08:49 UTC.

This section originally left open whether the button might be broken *only* outside a workflow context, since the
console showed `WorkflowTodoItem/Crud/Get?id=null`. It is not. `APPEAL1447` carries **7 open todo items** on task
`Activity_1m055xb`, and the action was re-driven through
`/shesha/workflow-action?id=20124dcc-…&todoid=d8617b1e-…`:

- The todo item now resolves — `WorkflowTodoItem/Crud/Get?id=d8617b1e-…` → **200**, not `id=null`.
- The button renders and is enabled.
- On confirm: `appealStatus` 1, `tribunalChairPerson` null, `lastModificationTime` unchanged at 05:01:46.
  ⚠️ The network claim made here originally ("no POST") is retracted — see the 12:20 correction above.

**The handler itself is dead — supplying a valid workflow context changes nothing.** And the route is demonstrably
sound elsewhere: the annual-compliance *Quality Assurance* action opens a fully working modal through exactly this
pattern. See `../audits/2026-08-26-reverification-of-three-uncertain-conclusions.md`.

---

### TC-01 (functional plan) — Send-to-Chairperson with an invalid email format is blocked (#101781 · TC-11-009) — NOT EXECUTED

Recorded on 08-25 as NOT EXECUTED because it *"needs the send action on an appeal we do not own — would mutate a
third party's record"*. That obstacle is gone; a different one replaces it.

The case reads: *"TYPE chairperson email = `invalid` and submit; ASSERT a validation error is shown."*
**There is no email field to type into** (see TC-02 above). The case cannot pass or fail — it describes a control
that does not exist in this build, so it is reported as NOT EXECUTED with a definite reason rather than left open.

Its 📌 note — *"nothing validates that the address belongs to the actual chairperson, so a well-formed wrong address
still sends the appeal astray"* — is **moot on this build**: no address is entered by the user at all.

**▶ Recommend Thabiso rewrite #101781 and step 3 of #101780** against the confirmation-dialog design, or confirm that
a free-form email step is still intended and simply not built yet.

## Observations for the test lead
- The appeal lifecycle currently has **no forward exit from Case Preparation through the admin UI.** The only action
  offered on `appeal-details-view` is the one that does nothing. That blocks 11A functional TC-02/03/04/05 (tribunal
  outcomes) from ever being reached on an appeal we own, which is why those cases have only ever been verdicted by
  observing other people's records.
- `appeal-details-view` renders the submitting office bearer's **identity number and contact details** in full. As
  on 08-25, these were **not transcribed**; only that the fields render is recorded here.
- The admin **Workflows inbox is empty** for the shared account despite 30+ appeals in flight, which is worth a
  question of its own — it may be why no appeal carries a todo item.

## Questions for Thabiso
- Is **Send to Arbitration Tribunal Chairperson** meant to be driven from the appeal screen, or only from a workflow
  task in the Workflows inbox? The inbox is empty, so we cannot tell.
- Where does the chairperson's address come from, now that it is clearly not typed?
- Should ADO **#101781** and step 3 of **#101780** be rewritten? Both describe an email input that does not exist.
