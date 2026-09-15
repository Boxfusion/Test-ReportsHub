# Bug: The Denied Post Registration letter drops the NPO name and misspells "Registration"

**Date:** 2026-08-24
**Severity:** Medium
**Area:** Notifications — `Email Denied Post Registration` template
**Environment:** QA
**Found by:** TC-14T-014 (ADO #101841)

## Summary
The change-request denial letter renders with an empty NPO name, leaving a broken sentence, and misspells
"Registration" as "Rgistration". 11 of 11 rows in the store are affected, latest 2026-08-07.

## Evidence
Body as stored (newest row, 2026-08-07 15:28):

> Dear Chairperson, We regret to inform you that the Post **Rgistration** change submission **for  has been**
> unsuccessful. The submission did not meet the required criteria. The attached document(s) will specify the criteria
> failed and way forward for your NPO.

Two defects: the organisation name between *"for"* and *"has been"* is empty, and *"Rgistration"* is missing its `e`.

## Steps to reproduce
1. Harvest the notification store (query in `2026-08-24-ob-reminder-link-host-does-not-resolve.md`).
2. Filter `subject = "Email Denied Post Registration"` — 11 rows.
3. Read `message`. Every row shows the same empty name slot and the same typo.

## Expected
The organisation name (or the change-request reference) appears in the sentence, and "Registration" is spelt
correctly. TC-14T-014 asks for denial reasons; the recipient should at least be able to tell which submission was
declined.

## Actual
Neither the NPO name nor any reference identifies the submission. The recipient receives a denial for an unnamed
change request.

## Scope note recorded honestly
- **The important half of TC-14T-014 passes.** The blocking assertion is that a declined change request must not ship
  a certificate or constitution — and it does not: all 11 emails attach `DenialLetter.pdf` and nothing else. That is
  the serious failure mode, and it is clean.
- The denial *reasons* are deferred to the attached PDF, which this run did not open. So "no reasons" is not claimed —
  only that the body carries none.

## Fix direction
Populate the NPO name (or the CR reference) in the template, and correct the spelling. The empty-merge-field shape
matches `2026-08-24-appeal-and-case-letters-omit-their-reference-number.md` — check for a shared cause.

## Verdict
TC-14T-014 **PARTIAL** — blocking attachment assertion passes; body content defective.
