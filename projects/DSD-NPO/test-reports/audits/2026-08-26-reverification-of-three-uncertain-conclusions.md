# Audit: re-verification of three uncertain conclusions from 2026-08-26

**Date:** 2026-08-26 08:50 UTC
**Purpose:** Conclusions drawn earlier today that rested on evidence I had not fully checked, re-tested in two passes.
**Pass 1 (08:50):** three claims — one wrong and retracted, two confirmed on stronger evidence.
**Pass 2 (12:20):** two more — **one exposed a method error of mine** (a filtered network log), the other resolved an
apparent contradiction in the 14R evidence. **Read both passes before relying on any 2026-08-26 claim.**
**Environment:** QA · admin portal · view mode Latest
**Accounts used:** `mpenduloizwelinuk@gmail.com` · `npo.qa.staff.c@example.org` (C) · `npo.qa.policy.f@example.org` (F)

## Outcome at a glance
| # | Claim made earlier today | Verdict on re-test |
|---|---|---|
| 1 | *"Suite 09 is blocked — the QA form needs a workflow `todoid` that no account has"* | 🔴 **WRONG — retracted.** The form works. Suite 09 is **not blocked**. |
| 2 | *"Tribunal forms carry no role restriction (11A TC-06)"* | ✅ **CONFIRMED**, now by permission set rather than by menu |
| 3 | *"Lockout threshold is 5"* (TC-01-019) | ✅ **CONFIRMED**, and the unlock window is now measured |

---

## 1. 🔴 RETRACTED — suite 09 is NOT blocked

**What I claimed:** that `annual-compliance-quality-assure` stays disabled for want of a workflow task, that no account
holds such a task, and therefore that suite 09's blocker had been misdiagnosed as a role problem for three sessions.

**What was wrong with the evidence.** I opened the form by **direct URL** and drew a conclusion from it — twice.
Worse, the submission id I used (`48546c4e-…`) was at **`Status = 3`**, and `Status` on this entity is Shesha's
`WorkflowStatus` reference list:

| Value | Meaning |
|---|---|
| 1 | Draft |
| 2 | In Progress |
| **3** | **Completed** |
| 4 | Cancelled |
| 5 | Suspended |

So I tested the QA form against a submission whose workflow had **already finished**. Disabled controls there are
correct behaviour, not a defect.

**What is actually true.** The QA form is reached through the workflow route, not by its own URL:

```
/shesha/workflow-action?id=<workflowInstanceId>&todoid=<todoItemId>
        → click the "Quality Assurance" action
        → modal "Quality Assure" opens, fully editable
```

Verified end to end on submission `28f3a797-a844-43f9-8dfe-f1f68b44452f` (`Status = 2`, In Progress,
`ANN2119/17/08/2026` on `333-019-NPO`):

| Signal | Direct URL | Via workflow-action + todoid |
|---|---|---|
| Yes / No radios | **disabled** | **enabled** |
| Editable inputs | **0** | **3** |
| Approve | disabled | **enabled once "Yes" is selected** |
| Decline | disabled | disabled until "No" + description |

**And the task existed all along.** There are **49** `Quality Assurance` tasks at activity `Activity_0gtemvi`, and
that one submission alone carries **20** open todo items. The `workflowInstance` id **equals** the submission id.

**The role is irrelevant to reaching it.** Account **C** (`Annual Compliance Quality Assurer`, **no**
`Authorised Admin`) gets an **identical** fully-enabled modal to the privileged admin — same radios, same 3 editable
inputs, no 403.

### What survives from the original finding
Only this, and it is worth keeping: **the Workflows inbox renders empty** for both the shared admin and account C,
even though the tasks plainly exist. So the tasks are unreachable *through the inbox*, which is how a real user would
find them — but they are reachable, and suite 09's three cases are runnable.

⚠️ **Corrections required in already-written artefacts** — applied:
`test-reports/2026-08-26/14c-access-control--…md`, `test-data/qa-accounts.md`,
`test-reports/skipped-blocked-register.md`, and memory `dsd-npo-workflow-todoid-blocks-admin-decisions`.

---

## 2. ✅ CONFIRMED — the tribunal forms carry no role restriction

**Why it was uncertain:** account D holds `Dsd.Npo.Registry Clerk`, and I had never checked what that role actually
grants. If the clerk role legitimately included appeals access, the finding would collapse.

**Settled by reading the role definitions:**

| Role | `permissions` |
|---|---|
| **`Dsd.Npo.Registry Clerk`** | **`[]` — empty** |
| `Appeal Tribunal Member` | `Appeal-Outcome`, `tribunal.view`, `NPO-Details-View`, `Appeal-tribunal-member` |

The clerk role's own description is *"Responsible for registering all physical mail receipts… logs receipts of new
applications, financial reports, change requests"* — no appeals remit, and **no permissions at all**.

So: the permission model exists, the tribunal permissions are **defined and attached to the tribunal role**, the
clerk role holds **none of them** — and account D still renders `appeal-outcome` (the Upheld / Denied / Approve
decision control) and `forward-arbitration-tribunal`, with **no 403**.

That is far stronger than the original evidence (which was only "the menu doesn't show Appeals"). **11A TC-06's FAILED
verdict stands, and its caveat is now fully removed.**

📌 The contrast still holds: the same zero-permission account gets a clean **403** on `user-management-table`, so
route-level authorisation demonstrably works elsewhere. The tribunal forms simply do not declare it.

---

## 3. ✅ CONFIRMED — lockout threshold is 5, and the window is 5 minutes

**Why it was uncertain:** in the original run attempts 1–4 returned *"Invalid user name or password"* and attempt 5
returned *"locked out"*. That is equally consistent with a threshold of **4** (locked after 4; the 5th merely reports
it) or **5** (the 5th trips it and reports in the same response).

**Settled empirically** on account F, after its earlier lockout had expired:

| Step | Result |
|---|---|
| 1. Correct password (baseline, resets the counter) | **200, success** |
| 2. Exactly **4** consecutive wrong passwords | 4 × *"Invalid user name or password"* |
| 3. Correct password again | **200, success** |

**Four failures do not lock the account.** The threshold is therefore **5**, as reported.

**And the unlock window is now measured, not guessed.** Reading the user record directly
(`Shesha.Authorization.Users.User`, resolved from `EntityConfig` rather than guessed):

```
id                  15948
userName            npo.qa.policy.f@example.org
accessFailedCount   0            <- reset to 0 when the lockout was applied
isLockoutEnabled    true
lockoutEndDateUtc   2026-08-26T06:35:54
```

The lock tripped at ≈ **06:30:54**; `lockoutEndDateUtc` is **06:35:54**. **The lockout duration is exactly 5 minutes**
(300 seconds — the ABP default). A successful sign-in also **resets** the failure counter, confirmed by step 1→3
above.

⚠️ TC-01-019's *"user is told how to recover"* assertion still **fails** — the message says only *"Please try again
later"*, and the 5-minute window is never communicated. The case verdict remains **PARTIAL**; only the recorded
numbers improve.

---

## 4. Bonus — the Send-to-Chairperson bug is now airtight

> ⚠️ **Superseded in part by pass 2 below (item 5).** The workflow-context caveat *is* closed, as stated here. But
> the "no POST of any kind" line in this section was produced by the same filtered-log method and is **retracted as
> unverified**. Nothing written / no notification / no error still stands.

The bug filed earlier carried an explicit open caveat: the action might be broken *only* when opened outside a
workflow context, since the console showed `WorkflowTodoItem/Crud/Get?id=null`.

**That caveat is now closed.** `APPEAL1447` does carry **7 open todo items** on task `Activity_1m055xb`
("Case Preperation" — sic). Re-driven through
`/shesha/workflow-action?id=20124dcc-…&todoid=d8617b1e-…`:

- `WorkflowTodoItem/Crud/Get?id=d8617b1e-…` now returns **200** — the todo item resolves correctly.
- The **Send to Arbitration Tribunal Chairperson** button renders and is enabled.
- On confirm: `appealStatus` unchanged at 1, `tribunalChairPerson` still null, `lastModificationTime` still
  `05:01:46`. *(The network observation originally recorded here is retracted — see item 5.)*

So the action fails **with** a valid workflow context, not merely without one. The bug is genuine and its severity
stands. `bugs/2026-08-26-send-to-arbitration-chairperson-fires-no-request.md` updated accordingly.

---

## Method notes worth keeping
- 🔑 **Never conclude from a form opened by direct URL** when the form belongs to a workflow. Check for a
  `todoid` route first. This cost two wrong conclusions today.
- 🔑 **`Status` on workflow-backed entities is Shesha's `WorkflowStatus`**, not a domain status — read
  `referenceListName` from the property metadata rather than assuming.
- 🔑 I guessed reference-list and entity names **three times** in this session and got 404/500 each time, despite
  the standing rule. Resolve from `EntityConfig/GetMainDataList` and from the property's own `referenceListName`.
- 🔑 A role's real authority is in `ShaRole.permissions`, not in what the navigation menu renders.

---

# Second re-verification pass — 2026-08-26 12:20 UTC

Two further uncertainties were closed. **One found a real error in my own method.**

## 5. 🔴 METHOD ERROR — "no POST is issued" was produced by a filtered network log

**The claim:** that the Quality Assure decision (and, separately, Send-to-Chairperson) issued **no HTTP request at
all**.

**Why it was unsafe:** the network log was read through a **URL regex filter**
(`Decline|QualityAssur|Compliance|Workflow.*(Decision|Action|Complete)|UserDecision`). The endpoint actually used is
**`/api/services/SheshaWorkflow/Process/UserTaskSave`** — which matches none of those alternatives. It was filtered
out of view and I read its absence as absence of any request.

**Re-tested by instrumenting `window.fetch` and `XMLHttpRequest.prototype.open` directly**, so no URL could be missed:

```
POST https://dsd-npo-api-qa.shesha.app/api/services/SheshaWorkflow/Process/UserTaskSave
  → 403
  {"success":false,"error":{"message":"You are not authorized to perform this action"},
   "unAuthorizedRequest":true}
```

**The corrected finding is more useful than the original.** The decision is not silently dropped by the client — it is
**sent, refused by the server with 403, and the refusal is swallowed and reported as success**.

**And it is not a role gap:**

| Account | Roles | `UserTaskSave` |
|---|---|---|
| `npo.qa.staff.c@example.org` | `Annual Compliance Quality Assurer` + `Appeal Tribunal Member` | **403** |
| `mpenduloizwelinuk@gmail.com` | broadly privileged, `Authorised Admin` | **403** |

No account on this environment can complete a workflow user-task decision.

**Knock-on: the appeals bug carries the same flawed claim.** Its "issues no request" line is now **retracted as
unverified**. What stands there is unchanged and independently evidenced — nothing written, no notification, no error
shown. The probable mechanism is this same 403, and it should be confirmed on a **fresh** appeal.

⚠️ **Why it could not be re-tested directly:** `APPEAL1447` no longer offers the button. At **08:57** it was moved to
**Denied / Completed** by user **15932 (`welcomegalane@gmail.com`)** — **not one of ours** (ours are 15918 and
15944–15948) — with the comment `"hjhkb"`. Another tester actioned our appeal on this shared environment, eight
minutes after my last attempt.

🔑 **That is itself informative:** someone *did* advance the appeal, most likely via the `appeal-outcome` form's own
**Save** — a direct entity write rather than a workflow user-task decision. **Direct saves appear to work; workflow
decisions 403.** That distinction is probably the whole story and is the thing to put to the developer.

🔑 **Method rule to carry forward: never conclude "no request was made" from a filtered network view.** Either read
the unfiltered log or instrument `fetch`/`XHR`.

## 6. ✅ CONFIRMED — the 14R evidence had an apparent contradiction, and it resolves cleanly

**The tension:** 14R claimed *"DHA is up"* (7 of 17 recent office bearers verified) **and** *"the retry jobs move
nothing"*. Both cannot be loosely true — something verified those records.

**Resolved — there are two distinct paths.** Verification is stamped **synchronously at creation**:

| Measure | Count |
|---|---|
| Office bearers with `IsIdVerified = true` | **26 055** |
| …of which **never modified** after insert (`lastModificationTime = null`) | **19 297 (74 %)** |
| …created since 2026-08-01 and verified | 54 |
| …of those, never modified after insert | **34** |

Three quarters of all verified office bearers were verified **at insert and never touched again**. So the
create-time path works and the **retry** path never revisits records that missed it.

**This strengthens 14R rather than weakening it:** it rules out "DHA is unreachable" as an explanation for the null
result. The integration is demonstrably reachable at creation; what fails is the retry. The 14R report has been
updated with this reconciliation.

## Artefacts corrected in this pass
`bugs/2026-08-26-annual-compliance-quality-assure-never-persists.md` (retitled; mechanism rewritten) ·
`bugs/2026-08-26-send-to-arbitration-chairperson-fires-no-request.md` (claim retracted; filename note added) ·
`2026-08-26/09-annual-compliance-backend-qa-functional--…md` (retitled; result, table and body) ·
`2026-08-26/11a-appeals-admin--…md` (result, table, body) ·
`2026-08-26/14r-integration-retries-…md` (precondition reconciliation).
