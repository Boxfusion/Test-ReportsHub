# Report: NPO-09-F — Annual Compliance backend / QA (functional) — the QA decision is refused 403 and reported as success

**Date:** 2026-08-26 10:50 UTC
**Plan:** test-plans/annual-compliance/09-annual-compliance-backend-qa-functional.md
**Execution Mode:** ai-repair
**Result:** FAILED — the suite is **no longer blocked** and TC-01 is verdicted for the first time. The QA form's validation gate works exactly as specified, in both directions. But **neither Decline nor Approve persists anything**: `POST …/Process/UserTaskSave` returns **403 "You are not authorized to perform this action"** — for the `Authorised Admin` account as well as the QA Assurer — and the client swallows it and shows a **success** message.
**Duration:** ~900s
**Cases:** TC-01, TC-02, TC-03
**Environment:** QA · admin portal · view mode Latest · submission `28f3a797-…` (`ANN2119/17/08/2026`, `Status = 2` In Progress) on **our own** `333-019-NPO`
**Accounts used:** `npo.qa.staff.c@example.org` — holds `Annual Compliance Quality Assurer`, **no** `Authorised Admin`

## Summary
| Total attempted | Passed | Failed | Partial | Not executed |
|---|---|---|---|---|
| 3 | 0 | 2 | 1 | 0 |

| Case | ADO | Verdict | One-liner |
|---|---|---|---|
| TC-01 QA "Not Aligned" requires a reason; triggers resubmission | #101759 | 🔴 FAILED | Validation gate **works**; the save is **refused 403** and the UI reports success anyway |
| TC-02 30-day non-response → cancellation | #101760 | ⚠️ PARTIAL | The wait is not executable — but both `RECORD` assertions are now satisfied, and **the job exists and is enabled** |
| TC-03 Trends analysis visible to a backend user | #101761 | 🔴 FAILED | Unchanged from 08-25 — no trends view exists |

## 🔑 Why this suite is no longer blocked
It was recorded as blocked on the `Annual Compliance Quality Assurer` role. **That was never the blocker.** The QA form
belongs to a workflow and must be opened through it:

```
/shesha/workflow-action?id=<workflowInstanceId>&todoid=<todoItemId>
        → click the "Quality Assurance" action → the "Quality Assure" modal opens, fully editable
```

Opened by its own URL (`annual-compliance-quality-assure`) it renders permanently disabled, which is what produced
two false "blocked" conclusions. ⚠️ Also pick a **live** specimen: `Status` on this entity is Shesha's
`WorkflowStatus` (1 Draft · 2 In Progress · **3 Completed**) — testing a Completed submission shows correctly inert
controls. Filter `status == 2`. Full account: `../audits/2026-08-26-reverification-of-three-uncertain-conclusions.md`.

**The role turns out to be irrelevant to reaching the form** — account C and the broadly-privileged admin behave
identically. The plan's precondition *"the account needs the `Annual Compliance Quality Assurer` role"* should be
struck; the real precondition is a live workflow task.

## Test Cases

### TC-01 — QA "Not Aligned" requires a reason; triggers resubmission (#101759 · TC-09-004) — FAILED

**📌 Live vocabulary RECORDED**, as the case asks. The ADO wording does not exist on screen:

| ADO case says | The form actually shows |
|---|---|
| "Not Aligned" | **"Does the report align with captured information?"** → `Yes` / `No` |
| "Submit" | **`Decline`** and **`Approve`** |
| reason | **`Description`** (a textarea) |

Mapped onto the live control, `No` = not aligned. Reported as drift, **not** as a defect, per the plan's instruction.

#### ✅ Assertion 1 (BLOCKING) — the outcome cannot be submitted with an empty reason: **PASSES**
Proven **without writing anything**, exactly as the plan directs:

| State | `Decline` |
|---|---|
| nothing selected | disabled |
| `No` selected, Description **empty** | **disabled** |
| `No` selected, Description filled | **enabled** |
| Description cleared again | **disabled** |
| Description refilled | **enabled** |

Toggled in both directions, so the gate is real and attributable to the Description field alone.

📌 Two further observations worth keeping:
- With `No` selected, **`Approve` is also disabled** — you cannot approve a report you have marked non-aligned. Correct.
- With `Yes` selected, **`Approve` enables with no Description at all** — so the reason requirement is specific to the
  decline path, which is the sensible design.

#### 🔴 Assertion 2 — the reason is persisted: **FAILS**
With `No` + a reason, `Decline` was pressed. The toast reads **"Compliane declined."** (sic) and the modal closes —
indistinguishable from success. The record is untouched:

```
reportMatches            false   (unchanged)
reportMatchesDescription null    <-- the reason was NOT saved
complianceStatus         3       (unchanged)
status                   2       (unchanged)
lastModificationTime     2026-08-22T22:01:32   <-- four days before this test
```

**⚠️ Corrected 12:15 UTC — a request IS issued and the server refuses it.** The original write-up said "no POST",
read through a URL regex filter that did not match the endpoint. Re-tested with `fetch` and `XMLHttpRequest`
instrumented:

```
POST …/api/services/SheshaWorkflow/Process/UserTaskSave  → 403
  "You are not authorized to perform this action"   (unAuthorizedRequest: true)
```

**The client swallows the 403 and shows a success toast.** And it is **not a role gap** — the same 403 comes back for
the broadly-privileged `Authorised Admin` as for the QA Assurer. No account we hold can complete a workflow user-task
decision.

#### 🔴 Assertion 3 — a resubmission notification is raised carrying the reason: **FAILS**
No notification was created. ⚠️ **Stated carefully, because this environment has concurrent activity:** other
notifications *were* created around the same time (`Approved Change Request`, `Post Registration`, on a ~5-minute
cadence) but they precede the click and belong to another actor. Filtering strictly to `creationTime >=` the click
returns **nothing related to annual compliance** at all.

#### 🔴 And it is not only Decline — **`Approve` is equally refused**
With `Yes` selected, `Approve` was pressed on the same submission. Same 403 on `UserTaskSave`, and
`lastModificationTime` still `2026-08-22`. **Both decision paths fail the same way.**

#### What was ruled out before calling this a defect
- **Not a stale todo item** — reproduced across **three different** todo ids (`3eeaa7a4…`, `9a853116…`, `cf252947…`).
- **Not a completed workflow** — the submission is `Status = 2` (In Progress), and its NPO is live.
- **Not the wrong id type** — the form loaded the submission's data correctly (the plan's known 400/"Fetching data…"
  trap did not occur).
- **Not a *client-side* permission problem** — the modal renders fully editable and the buttons arm and disarm
  correctly. The failure is a **server-side 403** that no UI signal reveals.
- **Not a record we do not own** — `333-019-NPO` is our own QA NPO; its contact details are the tester's own.

Bug: `../bugs/2026-08-26-annual-compliance-quality-assure-never-persists.md`

---

### TC-02 — 30-day non-response after notice leads to cancellation (#101760 · TC-09-005) — PARTIAL

**The 30-day wait is NOT EXECUTED** and was not simulated — stated plainly, as the plan requires. Both `RECORD`
assertions are now satisfied, which is what moves this from *not executed* to *partial*.

#### RECORD 1 — does a `Cancelled` status exist, and has anything reached it?
It exists, and **nothing has ever reached it.** Full distribution across the register:

| Status | Count |
|---|---|
| 1 Application In Progress | 5 071 |
| 2 Application Incomplete | **0** |
| 3 Application Failed | 17 |
| 4 Registered | 62 545 |
| **5 Outstanding Report** | **0** |
| 6 Deregistered | 36 518 |
| **7 Cancelled** | **0** |
| 8 Appealed Npo | **0** |
| 9 Not Registered | 3 |

🔑 **The interesting part is status 5, not status 7.** *Outstanding Report* — the state an NPO would pass through on
the way to cancellation — is **also zero**. So the non-compliance path is unobservable from its first step, not just
its last. That is a stronger statement than the earlier "status 7 has zero records".

#### RECORD 2 — is a scheduled job or configurable period visible anywhere?
**Yes — named, described, and enabled.** From the scheduler registry (30 jobs, 29 triggers):

| Job | Cron | Status | Description |
|---|---|---|---|
| **`NpoCancellationAfter30DaysNonComplianceJob`** | `0 22 * * *` | **1 (enabled)** | *"Cancels NPO registration after: (1) **30 days from non-compliance notice** without extension, OR (2) extension deadline has passed without submission (midnight South African time)"* |
| `AnnualComplianceNonComplianceJob` | `0 22 1 * *` | 1 | *"sent 9 months after the FYE has passed and npo hasn't logged an Annual Compliance Submission"* |
| `NpoCancellationJob` | `0 22 1 * *` | 1 | *"sent 10 months after the FYE… Npo will be cancelled for this reason"* |
| `NpoCancellationAfterExtensionJob` | `0 22 1 * *` | 1 | *"11 months after the FYE… though they requested for an extension"* |
| `AnnualComplianceReminderJob` / `…FinalReminderJob` / `…GeneratorJob` | various | 1 | the rest of the annual-compliance chain |

**So the mechanism the FDS describes is implemented and switched on.** The 30-day period is not configurable through
any UI we can see — it is baked into the job. And despite the whole chain being enabled, **no organisation has ever
reached Outstanding Report or Cancelled.**

▶ **That is the question for Thabiso, and it is sharper than "did it take 30 days":** the jobs exist and are enabled,
yet the two statuses they are supposed to produce have never been set on a single record in a register of 104 000+
organisations. Either the jobs are not executing on QA, or they execute and never match anything.

⚠️ Job **execution history could not be read** to settle which — `ScheduledJobExecution` returns
`"GetAllAsync is not implemented for entity of type Shesha.Scheduler.Domain.ScheduledJobExecution"`. A developer with
log access can answer it in minutes.

---

### TC-03 — Trends analysis visible/accessible to a backend user (#101761 · TC-09-006) — FAILED

Unchanged from the 2026-08-25 run, which established absence three independent ways (reports registry, form registry,
and the Management Reports screen). Re-stated here for suite completeness; **not re-tested today**.

## Observations for the test lead
- **The toast is misspelt** — *"Compliane declined."* should be *"Compliance declined."*
- **The success message is wrong regardless of spelling** — it reports a decline that did not happen.
- The workflow page shows a persistent banner **"Requested action is not available"** while simultaneously offering
  the Quality Assurance action, which does open. Confusing, and it appears on the appeals workflow page too.
- **A submission carries up to 20 identical todo items** (same task, same `activeOn`, same creation timestamp) — the
  same duplication pattern seen in the appeal acknowledgement notifications.
- `Note/GetList` on this screen is called with `ownerType=**Npo.AnnualCompliance**` — the **same non-existent alias**
  behind the 08-25 empty-grid defect. Worth fixing together.

## Questions for Thabiso
- **Why does `Process/UserTaskSave` return 403 — even for `Authorised Admin`?** That single endpoint blocks the whole
  QA step, and the UI reports success anyway.
- **The annual-compliance job chain is enabled but has never produced an `Outstanding Report` or `Cancelled`
  organisation.** Are these jobs running on QA at all?
- The plan's precondition *"the account needs the `Annual Compliance Quality Assurer` role"* is **wrong** and should
  be struck — the role makes no difference. Should the role gate this form at all? Currently it does not.

## Coverage against ADO
| ADO case | Local | Verdict |
|---|---|---|
| #101759 TC-09-004 | TC-01 | 🔴 FAILED |
| #101760 TC-09-005 | TC-02 | ⚠️ PARTIAL |
| #101761 TC-09-006 | TC-03 | 🔴 FAILED (unchanged from 08-25) |
