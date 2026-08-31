# 🟠 Medium-High — An approved Change Request records no decision, no comment and no actioner

**Raised:** 2026-08-27
**Found in:** NPO-10-F TC-04 (ADO #101771 · TC-10-010)
**Environment:** QA · admin portal · `boxfusion.dsdnpo/change-request-decision-final-dialog` v21 (LIVE)
**Specimen:** our own `POST1424/21/08/2026` (`c89899f6-0d76-4dcf-bf12-6ffdc9fa1f33`) on our own `333-022-NPO`
**Severity:** 🟠 Medium-High — the approval takes effect but leaves no accountable audit trail

## What happens

Approving a change request via **Review Change request Submission → Accept Changes → Confirm Decision →
`Approved` → Approve** works: the request completes and the applicant is notified. But the fields that record
*what was decided and by whom* are left empty.

| Field | After a successful approval |
|---|---|
| `status` | **3** (Completed) ✅ |
| `changeRequestStatus` | **4** (APPROVED) ✅ |
| `actionDate` | **2026-08-27T08:07:28.767** ✅ |
| `approvalLetter` | **ApprovalLetter.pdf** ✅ |
| `changeDecision` | **`null`** — the dialog's `Approved` radio (value 2) is not stored |
| `changesApproved` | **`false`** — contradicts an approved request |
| `comments` | **`null`** |
| `actionedBy` | **`null`** — no record of who approved it |
| `approveGeneralChangeRequest` | **`null`** |
| `completionDate` | **`null`**, although `status` = Completed |

## Why it matters

- **`actionedBy = null` with `actionDate` set** is the core problem: the system knows *when* a statutory decision was
  taken and not *who* took it. On a register governed by the NPO Act that is an accountability gap, and it cannot be
  reconstructed later.
- **`changesApproved = false` on an approved request** is an outright contradiction. Any report or downstream rule
  reading that boolean rather than `changeRequestStatus` will treat this approval as a non-approval.
- **`changeDecision = null`** means the approve/decline choice itself is not retained — only its side effects.
- `completionDate` being null while `status` is Completed will break any duration or SLA measurement.

## Reproduction

1. Admin portal → a change request with `changeRequestStatus = 2` (INITIATED).
2. Open it through its workflow: `/shesha/workflow-action?id=<crId>&todoid=<todoId>`.
3. **Accept Changes** → select `Approved` → **Approve**.
4. Read the record back: `status` 3 and `changeRequestStatus` 4 as expected, but `changeDecision`, `changesApproved`,
   `comments`, `actionedBy`, `approveGeneralChangeRequest` and `completionDate` are all unset.

## Related, same dialog

Switching the radio from `Declined` to `Approved` **hides** the required `Comment` field but **retains its value in
component state**. A decline reason typed before switching is still held when `Approve` is pressed. It does not
currently reach the record because `comments` is never persisted at all — but the moment that is fixed, a decline
reason will be saved against an approval.

## Suggested fix

Persist the dialog's decision onto the entity — `changeDecision`, `changesApproved`, `comments` — and stamp
`actionedBy` from the acting user alongside the existing `actionDate`, plus `completionDate` when the workflow
completes. Clear `comments` when the decision radio changes.
