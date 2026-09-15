# Bug: `submissionDate` is stamped when the draft is created, not when it is submitted

**Date:** 2026-08-18
**Severity:** Medium-High
**Area:** NPO registration → application record (`Npo.Application.submissionDate`)
**Environment:** QA · public portal · form `create-npo v62`
**Found by:** TC-05-020 (ADO #101696), while checking the audit fields
**Application:** APPL26-01270 (`50cc1481-e38e-436d-97df-d7bf89d6f984`)

## Summary
The application's `submissionDate` records the moment the **draft was created**, not the moment it was **submitted**.
On this record it is a full day early; for a draft left open for weeks it would be that far out.

## Evidence
The draft was created on **2026-08-17 12:44** and submitted on **2026-08-18 07:13**:

| Field | Value |
|---|---|
| `creationTime` | `2026-08-17T12:44:37.533` |
| `submissionDate` | `2026-08-17T12:44:37.53` ← **identical to creationTime** |
| `lastModificationTime` | `2026-08-18T07:13:31.697` ← the actual submission |
| `applicationStatus` | `2` (was `1` before submitting) |
| `submittedBy` | `Mpendulo ntshangase` |

`submissionDate` matches `creationTime` to the millisecond, while `lastModificationTime` — updated by the submit
itself — is 18 hours later.

## Steps to reproduce
1. Create a draft application and note `creationTime`.
2. Leave it, and submit it on a **later day**.
3. Read the record: `NpoApplication/Crud/Get?id=<appId>&properties=creationTime,submissionDate,lastModificationTime`.
4. `submissionDate` still equals `creationTime`.

## Expected
`submissionDate` is set at the point of submission, when `applicationStatus` moves off *In Progress*.

## Why it matters
- Any turnaround/SLA reporting on registration applications is computed from a date that is not the submission date.
- The suite-08 compliance timers (`NineMonthsAfterFYE`, `ThirtyDaysAfterIncomplete`) and the 30-day appeal window are
  all date-driven; if any of them derive from this field they start from the wrong instant.
- The acknowledgement letter generated at submission is dated from this record.

## Related observation — the submitter's name is never captured
`applicationSubmitterName` is **`null`** on the submitted record. On the Declaration step the *Name of submitter*
input is present in the DOM but **hidden** (`offsetParent: null`) and empty, and `Submit` enables without it — so
neither the user nor the server populates it. `submittedBy` (the linked person) *is* set, so the name is recoverable,
but the dedicated field is dead.

## Also seen on this record
`refNumber` is stored as **`" APPL26-01270"`** with a **leading space**, matching the untrimmed-whitespace defect
recorded for office-bearer names in `2026-08-17`'s suite-04 run. Same root cause family: input is not trimmed
before persisting.
