# Report: NPO-10-F — Post Registration / Change Request (functional) — admin decisions unblocked, both run E2E

**Date:** 2026-08-27 08:10 UTC
**Plan:** test-plans/post-registration/10-post-registration-change-request-functional.md
**Execution Mode:** ai-repair
**Result:** PARTIAL — the two admin cases deferred since 2026-08-18 are **no longer blocked and are now verdicted**. `TC-10-011` (Decline requires a reason) **PASSES** in both directions. `TC-10-010` (Accept Changes) records the approval and issues the outcome email, but **three decision fields and the actioner are never persisted** — `changesApproved` stays `false` on an approved request and `actionedBy` stays `null`. Reaching them required clearing a **new blocker in the submitter wizard** that silently prevents any saved draft from being submitted.
**Duration:** ~2400s
**Cases:** TC-04, TC-05
**Environment:** QA · public + admin portal · view mode Latest · our own change request `POST1424/21/08/2026` (`c89899f6-…`) on our own `333-022-NPO` (REGISTERED)
**Accounts used:** `mpenduloizwelinuk@gmail.com` (both portals)

## Summary
| Total attempted | Passed | Failed | Partial | Not executed |
|---|---|---|---|---|
| 2 | 1 | 0 | 1 | 0 |

| Case | ADO | Verdict | One-liner |
|---|---|---|---|
| TC-04 Admin Accept Changes approves + notifies | #101771 | ⚠️ PARTIAL | Status and letter are correct; `changeDecision`, `changesApproved`, `comments` and `actionedBy` are **not written** |
| TC-05 Admin Decline requires a reason | #101772 | ✅ PASSED | Required `Comment` gates `Decline` in both directions, disabled-button style |

TC-01/TC-02 were verdicted on 2026-08-18 and are untouched. **TC-03 (#101766, cancel an *assigned* request) stays
deferred** — it needs a request in "assigned" state, and ours went straight from submitted to Completed.

## 🔑 Why these two cases were never runnable — and it was not the admin side

Both were deferred on *"needs a submitted typed request"*. Getting one required resuming our saved draft POST1424,
and that draft **cannot be submitted at all** through the UI. Step 3 of the wizard shows the three office bearers the
NPO already has, and blocks `Next` with:

> Please Office Bearers should be 3 or more before you proceed

Three are listed. The record's own `requiredNumberOfOfficeBears` read **3**. `Next` stayed disabled anyway.

I first read this as an off-by-one; it is not. The form's own configuration
(`boxfusion.dsdnpo/create-change-request` v47) settles it — the gate is:

```js
const requiredOfficeBearers   = Number(data?.requiredNumberOfOfficeBears ?? 3);
const currentOfficeBearerCount = Number(globalState?.numberOfOfficeBearer ?? 0);
rules.push({ name: "Office bearers",
    isValid: officeBearerWasChanged && currentOfficeBearerCount >= requiredOfficeBearers });
```

and `globalState.numberOfOfficeBearer` is assigned in **exactly one place** — the success handler of the
add/edit-office-bearer dialog:

```js
const count = globalState?.dataTableContext3?.tableData?.filter(
    (item) => item.changeType === 1 || item.changeType === 2 || item.changeType === 6).length ?? 0;
setGlobalState({ key: "numberOfOfficeBearer", data: count + 1 });
```

So on a freshly opened draft the counter is `undefined` → `0`, and `0 >= 3` is false. `officeBearerWasChanged` is
likewise only set by an in-session add/edit/delete. **A submitter who saved a complete draft and came back to it can
never proceed** — the only way through is to add or edit an office bearer in the current session, which is what
finally unlocked it for us. Bug: `bugs/2026-08-27-change-request-draft-cannot-be-submitted-office-bearer-counter.md`.

⚠️ This also means the "3 or more" wording is measuring something the user cannot see. Three were plainly listed.

## Test Cases

### TC-04 — Admin Accept Changes approves + notifies (ADO #101771 · TC-10-010) — PARTIAL

Reached the correct way, per [[dsd-npo-workflow-todoid-blocks-admin-decisions]]:
`/shesha/workflow-action?id=c89899f6-…&todoid=306620c7-…` → **Review Change request Submission** →
`Accept Changes` → the **Confirm Decision** dialog (`change-request-decision-final-dialog` v21, LIVE).

#### ✅ Assertion 1 (BLOCKING) — approval recorded: **PASSES at status level**

| Field | Before | After |
|---|---|---|
| `status` (WorkflowStatus) | 2 In Progress | **3 Completed** |
| `changeRequestStatus` | 2 (INITIATED) | **4 (APPROVED)** |
| `actionDate` | null | **2026-08-27T08:07:28.767** |
| `approvalLetter` | null | **ApprovalLetter.pdf** |
| `lastModificationTime` | 2026-08-27T08:02:28 | 2026-08-27T08:07:29 |

#### 🔴 But four fields that should carry the decision are left empty

| Field | After an **approval** |
|---|---|
| `changeDecision` | `null` — the dialog's `Approved` radio value (2) is not stored |
| `changesApproved` | **`false`** — flatly contradicts an approved request |
| `comments` | `null` |
| `actionedBy` | **`null`** — `actionDate` is stamped but **no record of who approved it** |
| `approveGeneralChangeRequest` | `null` |
| `completionDate` | `null`, though `status` = Completed |

`actionedBy = null` is the one to escalate: the approval has a timestamp and no accountable actor.
Bug: `bugs/2026-08-27-change-request-approval-does-not-persist-decision-or-actioner.md`.

#### 📌 Assertion 2 (RECORD) — the user notification

Confirmed present, from the notification store (26 messages in the window; ours identified by NPO name):

| Fired | Channel | To | Status |
|---|---|---|---|
| 08:07:29.890 | **Email Approved Change Request** | `mpendulosobethu@gmail.com` | 1 Sent |
| 08:07:29.783 | Email Approved Change Request | `Nomfanelo.Nhleko+ob1@boxfusion.io` | 1 Sent |
| 08:07:29.757/.863 | SMS Approved Post Registration | 2 office-bearer mobiles | **8 Failed** |

So the outcome email is issued and delivered. ⚠️ **It does not go to the submitting account**
(`mpenduloizwelinuk@gmail.com`) — it goes to the NPO's contact and office-bearer addresses. Recording it as
observed rather than judging it; the ADO wording *"user gets notification with outcome"* does not say which user.
SMS failure is the long-standing credit problem, already covered by
[[dsd-npo-notification-audit-via-api]] — not re-raised.

### TC-05 — Admin Decline requires a reason (ADO #101772 · TC-10-011) — PASSED

Tested on the same dialog **without writing anything**, so the record stayed available for TC-04.

| State | `Decline` button |
|---|---|
| nothing selected | not rendered |
| `Declined` selected, `Comment` empty | **disabled** |
| `Declined` selected, `Comment` filled | **enabled** |
| switched to `Approved` | `Comment` hidden, `Approve` enabled |

#### ✅ Assertion 1 (BLOCKING) — decline without a reason is blocked: **PASSES**
Selecting `Declined` reveals a `Comment *` textarea marked required, and `Decline` is disabled until it is
non-empty. Both directions verified. **Style RECORDED, as the plan asks: disabled button, not an error message** —
the same pattern as OB compliance and doc verification.

#### 📌 Assertion 2 (RECORD) — the decline-reason notification: **not exercised**
Deliberately not fired. Only one submitted request existed and TC-04's blocking assertion needed it. The decline
email template exists in the store as `Email Post Registration` / declined variants; verifying the reason reaches
the applicant needs a second submitted request. Carried forward.

⚠️ **One thing to fix in the form:** switching from `Declined` to `Approved` **hides** the `Comment` field but
**keeps its value in state**. Our decline text was still held when `Approve` was pressed. It did not reach the
record (`comments` is `null` — see TC-04), so no harm here, but a decline reason surviving into an approval payload
is a trap waiting for the moment `comments` starts being persisted.

## Other findings from this run

### 🔴 A placeholder SMS is sent to a newly added office bearer
Adding the fourth office bearer fired an SMS to the mobile we supplied whose entire body is **`ssdsd`**, with a
blank subject (`SMS`, status 8). Alongside it the correct `Email PostReg OB Verification` went out properly. So a
junk template is wired into the office-bearer-add path.
Bug: `bugs/2026-08-27-placeholder-sms-template-sent-on-office-bearer-add.md`.

### 📌 One submit fans out 15 identical workflow todo items
Submitting POST1424 created **15** `WorkflowTodoItem` rows, all for the same task
(`Activity_1jo5xu9` "Review Change request Submission") and all stamped `08:02:26.817`. This matches the 20-item
observation from 08-26 and is the likely mechanism behind the register's 80 000 todo items. Recorded as an
observation for Thabiso, not raised as a defect — see `observations/2026-08-27-report-notes-and-questions.md`.

### 📌 `submissionDate` is stamped at creation, not at submit
POST1424 still reads `submissionDate = 2026-08-21T05:21:45` after being submitted on 2026-08-27. This confirms the
caveat already recorded against the appeals 30-day window: any deadline measured off `submissionDate` is measured
from **creation**.

### 📌 The Change Requests grid's search box does not filter
Typing a ref number into the grid's quick-search leaves all 90 rows in place and the pager unchanged, and repeated
entry **appends** rather than replaces. Recorded; not raised pending a check of whether that control is a search at
all.

### 📌 Status chip is misspelt
The change-request detail header renders the state as **`SUBMITED`** (one T).

## What this changes about earlier conclusions

🔑 **The 08-26 claim that "no account we hold can complete a workflow user-task decision" is too broad and is
narrowed here.** The change-request `Accept Changes` decision completed normally on the same account, at
08:07 today, and moved the record to Completed with a letter. The `UserTaskSave` 403 is **specific to the
annual-compliance Quality Assure task**, not to workflow decisions as a class. Retested separately today — see
`09-annual-compliance-backend-qa-functional--403-retest.md`.

## Environment note
The environment is shared and was busy: another tester (`Welcomed Galane`) submitted and approved change requests on
`333-010`/`333-011`/`333-021` during our window. All assertions above are pinned to our own record `POST1424` and our
own NPO `333-022`, identified by id, so nothing here depends on their activity.
