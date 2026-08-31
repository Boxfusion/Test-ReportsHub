# Report: NPO-09-F — Annual Compliance QA decision — 403 retest after the outage, and the decision is missing from the payload

**Date:** 2026-08-27 07:50 UTC
**Plan:** test-plans/annual-compliance/09-annual-compliance-backend-qa-functional.md
**Execution Mode:** ai-repair
**Result:** FAILED — the 08-26 blocker is **still live after the outage**: `POST …/Process/UserTaskSave` returns **403** on both Approve and Decline, the record is untouched, and the UI closes the modal as if it succeeded. **New this run:** the request body carries **no decision at all** — Approve and Decline post the same shape, and the `Approved`/`Declined` decision uid the client had just fetched is never sent. So the 403 is not the only thing standing between this form and a recorded outcome.
**Duration:** ~600s
**Cases:** TC-01
**Environment:** QA · admin portal · view mode Latest · submission `28f3a797-…` (`ANN2119/17/08/2026`, `status = 2` In Progress) on our own `333-019-NPO`
**Accounts used:** `mpenduloizwelinuk@gmail.com` — broadly privileged, holds `Authorised Admin`

## Summary
| Total attempted | Passed | Failed | Partial | Not executed |
|---|---|---|---|---|
| 1 | 0 | 1 | 0 | 0 |

| Case | ADO | Verdict | One-liner |
|---|---|---|---|
| TC-01 QA "Not Aligned" requires a reason; triggers resubmission | #101759 | 🔴 FAILED | 403 reproduced on the privileged account; **and the payload carries no decision** |

This is a **retest**, not new coverage — TC-09-004 was already verdicted FAILED on 08-26. Run because the site had
been down and a deploy could have landed. It had not.

## What was retested and what it showed

Reached via `/shesha/workflow-action?id=28f3a797-…&todoid=3eeaa7a4-…` → **Quality Assurance** → the
**Quality Assure** modal (`annual-compliance-quality-assure` v19, LIVE). Network instrumented at `fetch` and
`XMLHttpRequest` before acting, per [[never-conclude-no-request-from-a-filtered-network-log]].

### Validation still correct, both directions

| State | `Approve` | `Decline` |
|---|---|---|
| nothing selected | disabled | disabled |
| `Yes` selected | **enabled** | disabled |
| `No` selected, Description empty | disabled | disabled |
| `No` selected, Description filled | disabled | **enabled** |

`Description` is only rendered for the `No` branch — it is hidden, not merely unlabelled, on the `Yes` branch.

### 🔴 The 403 is unchanged

```
POST https://dsd-npo-api-qa.shesha.app/api/services/SheshaWorkflow/Process/UserTaskSave
→ 403  {"success":false,
        "error":{"message":"You are not authorized to perform this action"},
        "unAuthorizedRequest":true}
```

Fired on **both** Approve and Decline. Record verified untouched afterwards: `complianceStatus` 3, `reportMatches`
`false`, `reportMatchesDescription` `null`, `lastModificationTime` still **2026-08-22T22:01:32.683**,
`lastModifierUserId` 15918 — no change from before the attempt.

### 🔴 New finding — the request carries no decision

Captured bodies, verbatim:

```
Approve : {"id":"28f3a797-…","data":{"reportMatchesDescription":null},"todoid":"3eeaa7a4-…"}
Decline : {"id":"28f3a797-…","todoid":"3eeaa7a4-…","data":{"reportMatchesDescription":"QA retest 27 Aug: payload comparison"}}
```

No query string on either. Neither body carries:

- the **`reportMatches` Yes/No answer** — the actual question the form asks; and
- any **decision identifier**, although the client had fetched them moments earlier:
  `GET …/WorkflowDefinition/GetUserDecisions?…&userTaskUid=Activity_0gtemvi` →
  `[{uid:"8yH2CDKcd-ST63sqq52Br", label:"Approved"}, {uid:"zL1gWG7hdfbjsjXAdN6AO", label:"Declined"}]`

The only thing distinguishing an approval from a decline on the wire is whether `reportMatchesDescription` happens
to be null. **Even with the 403 fixed, the outcome would not be recorded** — and it is a plausible explanation for
the "Compliane declined." toast appearing after an *approve*, noted on 08-26.

### 🔑 Why the failure is invisible to the user

The console shows the mechanism:

```
Failed to load resource: the server responded with a status of 403 ()  …/Process/UserTaskSave
Failed to execute action 'shesha.common:Show Dialog', error: undefined
```

The error path tries to raise a dialog and **itself throws**, so nothing is surfaced; the modal simply closes, which
reads as success. Per [[read-console-before-calling-failure-silent]] — the failure is not silent in the console, only
in the UI.

## 🔑 Narrowing the 08-26 conclusion

The 08-26 note said *"No account we hold can complete a workflow user-task decision."* **That is too broad.** Today,
on the same account, the change-request `Accept Changes` decision completed normally and moved its record to
Completed with a generated letter (see `10-post-registration-change-request-functional--admin-decisions.md`).

**Corrected scope:** the `UserTaskSave` 403 is specific to the **annual-compliance Quality Assure** task
(`Activity_0gtemvi`), not to workflow decisions generally. That is a much sharper question for the developer: the
authorisation is failing per-task, not per-user.

## For the developer
1. Why does `UserTaskSave` return 403 for `Activity_0gtemvi` when the same account completes `Activity_1jo5xu9`?
2. The Quality Assure payload never carries the decision uid or `reportMatches`. Where is the outcome meant to come
   from?
3. The 403 handler's `Show Dialog` action throws, so every failure of this form is reported to the user as success.

Bug already open: `bugs/2026-08-26-annual-compliance-quality-assure-never-persists.md` — updated today with the
retest and the payload finding.
