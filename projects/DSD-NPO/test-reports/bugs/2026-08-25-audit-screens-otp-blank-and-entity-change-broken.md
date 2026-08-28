# Bug: The OTP audit grid shows 13 258 rows of entirely blank cells, and the entity-change audit log cannot load at all

**Date:** 2026-08-25
**Severity:** ⚠️ **Medium** (audit and traceability screens; no data loss, but no traceability either)
**Area:** Admin portal — `StarterTemplate/otp-audit-table`, `Shesha/entity-change-audit-log`, `Shesha/scheduled-jobs-logs-view`
**Environment:** QA · admin portal · **view mode Latest (asserted in-run)**
**Found by:** re-testing the claim that suite 14U (audit trail & resubmission diff) is unexecutable
**Related:** corrects the rationale recorded for TC-05-020 on 2026-08-18

## 1. OTP audit — 13 258 rows, every cell empty
`/dynamic/StarterTemplate/otp-audit-table` renders its grid, paginates correctly and reports
**`1-10 of 13258 items`** — and every cell in every column is blank:

| Date | OTP | Expires On | Sent On | Send Status | Sent To |
|---|---|---|---|---|---|
| *(empty)* | *(empty)* | *(empty)* | *(empty)* | *(empty)* | *(empty)* |
| *(empty)* | *(empty)* | *(empty)* | *(empty)* | *(empty)* | *(empty)* |
| *(empty)* | *(empty)* | *(empty)* | *(empty)* | *(empty)* | *(empty)* |

The row count is real, so the query reaches the table; the column bindings do not resolve. Unlike the notification
audit screens this one returns **no error at all** — it simply renders nothing, which is the harder failure to notice.

**Why it matters beyond tidiness:** OTP delivery is the evidence trail for `TC-01-021` and the 14Z Class-C OTP cases,
which are currently parked as "needs OTP". The data appears to be there; the screen just will not show it.

## 2. Entity-change audit log — 400 on load
`/dynamic/Shesha/entity-change-audit-log` renders **no columns and no rows**:
```
→ 400  {"error":{"message":"Your request is not valid!",
         "details":"The following errors were detected during validation.\n - The value '' is invalid.\n"}}
```
An empty value is being sent where the endpoint requires one. This is the screen that would answer *"what changed on
this record, and when"* — the substance of suite 14U and of the resubmission-diff question.

## 3. Scheduled job logs — 404 on a missing type
`/dynamic/Shesha/scheduled-jobs-logs-view`:
```
→ 404  {"error":{"code":404,
         "message":"Type `Shesha.Scheduler.Services.ScheduledJobs.Dto.ScheduledJobExecutionDto` not found"}}
```
Relevant because the **Office Bearer Acknowledgement Reminder still fires daily at a dead host**
(`2026-08-24-ob-reminder-link-host-does-not-resolve.md`). The screen that would show which scheduled jobs are running
and when cannot load, so that behaviour is not observable from the UI.

## What does work
`/dynamic/Shesha/logon-audit` and `/dynamic/Shesha/login-audit-table` both load properly — **60 451 records** with
`Date · Username · Client IP Address · Result · Browser Info · Login Attempt Number`, and real result values
including `Success` and `Invalid User Name Or Email Address`. So the auditing *infrastructure* is sound; three
specific screens are misconfigured.

⚠️ **A POPIA note for suite 14Y, not a defect claim here:** that screen exposes 60 451 rows of usernames — mostly
personal email addresses — together with IP addresses and browser fingerprints, to any authenticated admin, with no
apparent date-range limit. Whether that retention and exposure is intended is a question for the test lead. No
records were transcribed.

## Expected
Audit screens show the records they count. A grid that cannot bind its columns reports an error rather than rendering
blank rows.

## Actual
- OTP audit: 13 258 rows, all cells blank, no error
- Entity-change audit log: 400, no columns, no rows
- Scheduled job logs: 404 on a missing DTO type

## Correction to the record
On 2026-08-18, TC-05-020 was verdicted FAILED with the rationale *"no application audit view, all 6 entity-history
routes 404 → suite 14U is unexecutable"*. Those six routes were **guesses**. The audit screens do exist —
`entity-change-audit-log`, `Audit-Trail`, `logon-audit`, `login-audit-table`, `otp-audit-table` — and were found by
listing the form registry instead of guessing URLs.

**TC-05-020's verdict of FAILED stands** — there is still no working entity-level audit view — but *"the routes do not
exist"* is wrong and should not be repeated. Suite 14U is **blocked by a defect, not unexecutable by design**, and
becomes runnable as soon as `entity-change-audit-log` loads.

🔑 **The lesson is the recurring one on this project: a 404 on a guessed path proves nothing.** The form registry
(`FormConfiguration`, 8 294 forms) is the authoritative route list and has now settled this question, the notification
audit question, and the appeals entry-point question in a single day.

## Suggested fix
- Bind the OTP audit grid's columns to real properties on the OTP entity, and surface a binding failure instead of
  rendering empty rows.
- Supply the required parameter on `entity-change-audit-log`'s query.
- Restore or re-map `ScheduledJobExecutionDto` for the scheduled-jobs log view.
