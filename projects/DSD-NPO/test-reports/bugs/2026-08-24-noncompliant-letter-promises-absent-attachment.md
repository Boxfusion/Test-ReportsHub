# Bug: The Annual Compliance NonCompliant letter promises an attachment it never carries

**Date:** 2026-08-24
**Severity:** Medium-High
**Area:** Notifications — `Email Annual Compliance NonCompliant` template
**Environment:** QA
**Found by:** TC-14T-010 (ADO #101837)

## Summary
`Email Annual Compliance NonCompliant` opens with *"Kindly find the attached document/s for your attention"* and has
**no attachment**. All 3 rows in the store fail this way (2026-08-06 and 2026-08-07) — a 100% template failure, not an
intermittent one.

The letter's entire substance is deferred to that document: it tells the recipient the attachment *"will specify that
the Organisation has not complied with its obligations in terms of sections 17 and 18 of the Act (ACT No 71 of 1997)
and further details"*. Without it the organisation is told it is non-compliant and given no reasons.

## Steps to reproduce
1. Harvest `NotificationMessage` and `NotificationMessageAttachment` (queries in the 14T plan) and join on message id.
2. Filter `subject = "Email Annual Compliance NonCompliant"` — 3 rows, all `status: 1` (dispatched).
3. No attachment row references any of the 3 message ids.

## Expected
The non-compliance letter PDF is attached, as the body states.

## Actual
No attachment row exists for any of the 3 messages.

## How narrow this finding actually is — recorded honestly
Across all 2 521 messages, only **6** promise an attachment and have none:

| Template | Rows affected | Dates |
|---|---|---|
| `Email Annual Compliance NonCompliant` | **3 of 3** | 2026-08-06, 2026-08-07 |
| `Email Annual Compliance Submission Incomplete` | 2 of 16 | 2026-05-06 |
| `Email Annual Compliance Submission Successful` | 1 of 8 | 2026-05-06 |

⚠️ **I initially misread this as a widespread intermittent failure**, because the raw attachment-coverage ratios look
alarming (Annual Acknowledgement 36/42, Successful 7/8, Incomplete 14/16). Those gaps are **not** defects: the bodies
of the un-attached messages do not promise an attachment. Only messages whose text refers to an attachment can fail
this way, and the real signal is the one template that fails every time. The two May one-offs are worth noting but
look like a transient, not a template fault.

## Fix direction
The NonCompliant path is not generating or not linking its PDF. Compare against
`Email Annual Compliance Submission Incomplete`, which attaches `AnnualComplianceIncomplete.pdf` reliably (14/16) —
the two are adjacent outcomes of the same QA step, so the working one is the reference implementation.

## Verdict
TC-14T-010 **FAILED** (this, plus the missing 30-day deadline).
