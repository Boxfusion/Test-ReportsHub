# Bug: no application audit log and no submission snapshot

**Date:** 2026-08-18
**Severity:** Medium (blocks suite 14U outright)
**Area:** Admin portal → Administration → Audit Logs · application history
**Environment:** QA · admin portal
**Found by:** TC-05-020 (ADO #101696)
**Application:** APPL26-01270 (`50cc1481-e38e-436d-97df-d7bf89d6f984`)

## Summary
There is no audit view for applications and no retained snapshot of what was submitted. The ADO case requires *"An
entry … with the submitter, timestamp, and the submitted snapshot (original captured for later resubmission diffs)"*.
Only the record's own `FullAuditedEntity` columns exist, and they are overwritten by each subsequent change.

## What was checked

**1. The admin UI.** `Administration → Audit Logs` is a submenu of exactly three views, none about applications:

| Item | Route |
|---|---|
| Logon | `/dynamic/Shesha/login-audit-table` |
| OTPs | `/dynamic/Shesha/otp-audit` |
| Notifications | `/dynamic/Shesha/notifications-audit` |

**2. The API.** Every entity-history route probed returned **404**:
```
/api/dynamic/Shesha/EntityChange/Crud/GetAll              404
/api/dynamic/Shesha/EntityChangeSet/Crud/GetAll           404
/api/dynamic/Shesha/AuditLog/Crud/GetAll                  404
/api/services/app/AuditLog/GetAll                         404
/api/dynamic/Shesha/AuditedEntityChange/Crud/GetAll       404
/api/services/app/EntityHistory/GetEntityHistory          404
```

**3. What does exist** — only the audit columns on the row itself:
`creatorUserId 15918` · `creationTime 2026-08-17T12:44:37` · `lastModifierUserId 15918` ·
`lastModificationTime 2026-08-18T07:13:31` · `submittedBy "Mpendulo ntshangase"`.

## Verdict against the case
- Assertion 1 (an entry with submitter + timestamp) — **partly met**, from the record's own columns rather than an
  audit log. Note the timestamp is itself unreliable, see
  `2026-08-18-submission-date-stamped-at-draft-creation.md`.
- Assertion 2, **BLOCKING** (a snapshot of the submission is retained) — **fails**. Nothing captures the state at
  submission; `lastModificationTime` simply moves forward with each edit.

## Confirms the test lead's own drift note
Thabiso's code review for this case reads: *"Shesha `FullAuditedEntity` captures creation/modification; **explicit
state-transition log not verified**."* This run settles it — `FullAuditedEntity` records who/when, not a point-in-time
copy, and no state-transition log is exposed anywhere.

## Impact beyond this case
**Suite 14U (audit trail & resubmission diff) cannot be executed as written.** Its scenarios compare a resubmitted
application against the original; with no snapshot there is nothing to diff against. This needs a decision before 14U
is scheduled:

▶ **Question for Thabiso / the BA:** is a submission snapshot planned, or should the 14U cases be rewritten against
whatever history the build actually keeps?
