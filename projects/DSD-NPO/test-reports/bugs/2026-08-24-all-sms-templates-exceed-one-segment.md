# Bug: 22 of 24 SMS templates exceed a single 160-character segment

**Date:** 2026-08-24
**Severity:** Low-Medium (cost and readability, not breakage)
**Area:** Notifications — all SMS templates
**Environment:** QA
**Found by:** TC-14T-022 (ADO #101849, `Src:Code`)

## Summary
Of 24 distinct SMS templates in the store (1 164 SMS rows), **22 exceed 160 GSM-7 units**. The worst is 583 units —
**4 billed segments**. Not one operational template fits a single segment.

Nothing is broken: segmentation is clean and no link is truncated. The cost is that every SMS the system sends bills
as 2–4 messages.

## Measured lengths (longest variant per template)

| Units | Segments | Template | Msgs |
|---|---|---|---|
| 583 | 4 | SMS Office Bearer Acknowledgement Reminder | 202 |
| 581 | 4 | SMS Annual Compliance NonCompliant | 3 |
| 409 | 3 | SMS Registration Application OfficeBearerRegistry | 389 |
| 397 | 3 | SMS Upheld Appeal | 10 |
| 383 | 3 | SMS Voluntary Deregistration AcknowledgementLetter | 15 |
| 345 | 3 | SMS Approved Post Registration | 20 |
| 334 | 3 | SMS Post Registration | 71 |
| 274 → 167 | 2 | 15 further templates | — |
| 28 / 5 | 1 | 2 templates with no real content | 31 |

The 583-unit reminder body carries a full letter — salutation, two sentences of explanation, a long URL, then
*"Yours faithfully, DIRECTOR: NONPROFIT ORGANISATIONS"* with telephone, fax and email. That is email copy sent over
SMS.

## What passes
- **No truncation.** All 591 URL-bearing SMS retain an intact `tempId`, so confirmation links survive segmentation.
- **No placeholders** in any SMS body.
- **All bodies are pure GSM-7** — no smart quote or em dash forcing the 70-character UCS-2 limit, which is the usual
  way this fails silently.

## The case cannot be scored exactly as written
⚠️ **The ADO expected result is truncated mid-sentence:** *"SMS body fits SMS segments cleanly: either"* — and then it
ends. The two acceptable outcomes are not stated.

I applied the standard GSM-7 rule (160 units single, 153 per segment when concatenated) and split the verdict: the
**segmentation** half passes, the **160-character** half fails for 22 of 24 templates. The case needs its expected
result completed before this can be called a clean pass or fail.

## Fix direction
Trim the SMS variants to the actionable core — who, what, and the link — and drop the letterhead block that only
makes sense in email. A separate question for the template owner is whether SMS should carry the URL at all, given
its length dominates the message.

## Verdict
TC-14T-022 **PARTIAL**. Flagged to Thabiso for the missing half of the expected result.
