# Bug: SMS OTP send-failure is recorded as "Sent" — operators can't see that no OTP was delivered

**Date:** 2026-08-20
**Severity:** Medium-High (masks a total OTP-delivery outage; users are stuck with no signal to staff)
**Area:** OTP pipeline — `Shesha.Domain.OtpAuditItem` (admin OTP Audit, `/dynamic/Shesha/otp-audit-table`)
**Environment:** QA
**Found by:** Suite 15D (while sending an OTP to a live number at the user's request)

## Summary
When an SMS OTP fails to send, the OTP Audit row is still stamped **`sendStatus = 1 (Sent)`** with `errorMessage: null`.
Two OTPs sent today (to a real number `0793176550` and to a synthetic `0123456789`) were **never delivered**, yet both
audit rows read **Sent**. Across all **13 257** OTP-audit rows, exactly **one** is ever marked `2 (Failed)` — and that
one is an October-2025 **SMTP/email** error, not an SMS failure. So SMS delivery failures are being persisted as
successes.

## Evidence
- OTP audit rows (2026-08-20, authenticated admin query on `OtpAuditItem`):
  | creationTime | sendTo | otp | sendStatus | sentOn | errorMessage |
  |---|---|---|---|---|---|
  | 06:26:12 | 0793176550 | (6-digit) | **1 (Sent)** | 06:26:12 | null |
  | 06:30:36 | 0123456789 | (6-digit) | **1 (Sent)** | 06:30:36 | null |
- Reference list `Shesha.Framework.OtpSendStatus` = {1 Sent, 2 Failed, 3 Ignored}. Row counts by status:
  **1 → 13256 · 2 → 1 · 3 → 0**. The single `2` is `2025-10-09`, `errorMessage` = *"Service not available … 4.3.0
  Temporary System Problem"* (an SMTP error).
- Meanwhile the **notification pipeline** (`NotificationMessage`) records the true cause for every SMS today:
  status `8 (Failed)`, `errorMessage: "Vodacom SMS not enqueued: Not enough credits to send SMS (error code 153)"`.
- The user confirmed live: **no OTP arrived** on `0793176550`.

## Actual
The OTP send fails at the SMS gateway (no Vodacom credit), but `OtpAuditItem.sendStatus` is written as **Sent** with a
null error. Operators looking at the OTP Audit have no way to see the outage.

## Expected
When the SMS gateway rejects/fails the send, the OTP audit row should be `sendStatus = 2 (Failed)` (or `3 Ignored`)
with the gateway `errorMessage` captured — mirroring what `NotificationMessage` already records.

## Why it matters
- OTP is the mobile-ownership gate; if it silently "succeeds" while nothing is delivered, users are blocked with no
  signal reaching support, and any dashboard/monitoring on OTP success is falsely green.
- Distinct from the known **out-of-credit** condition (that's an environment issue for Thabiso to top up) — the
  **defect** is that the failure isn't reflected in the OTP audit status.

## Notes
- Root SMS-credit outage is the known QA condition — see [[dsd-npo-notification-audit-via-api]]; **do not** log the
  credit failure itself as an app defect. This bug is specifically about the **status mis-recording** in `OtpAuditItem`.
- The OTP Audit also displays the OTP **code in clear text** beside each recipient number — noted as a separate POPIA
  observation for suite 15Y / 14Y; not the subject of this bug.
