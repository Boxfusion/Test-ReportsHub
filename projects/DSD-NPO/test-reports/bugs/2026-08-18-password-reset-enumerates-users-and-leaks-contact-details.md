# Bug: password-reset flow enumerates users and discloses masked email + mobile to anyone

**Date:** 2026-08-18
**Severity:** High (security + POPIA)
**Area:** Public portal → Forgot Password (`/no-auth/boxfusion.dsdnpo/dsd-public-forgot-password`)
**Environment:** QA
**Found by:** TC-01-007 (ADO #101601) and TC-01-008 (ADO #101602)

## Summary
The sign-in flow is correctly non-committal about whether an account exists. The **password-reset flow is not** — it
both confirms account existence and, for accounts that exist, reveals the masked registered email and the **last four
digits of the registered mobile number**, to a completely unauthenticated visitor.

## Steps to reproduce
1. Sign out. Open **Forgot Password**.
2. Enter an **unregistered** username/email → **Next**.
   → persistent red banner **"Your username is not recognised"**. *(Evidence: v11)*
3. Enter a **registered** username/email → **Next**.
   → advances to **"Select password reset method"** listing:
   - **"Email a link to `qa.te********@****ple.org`"**
   - **"SMS an OTP to `(***)-***-0598`"** *(Evidence: v12)*

## Expected (from ADO #101602)
> *"Same generic confirmation message as for registered email; no email is sent; UI must not reveal whether the email
> exists."*

## Actual
- Registered vs unregistered give **visibly different outcomes** (method-select screen vs error banner) → a reliable
  **user-enumeration oracle**.
- For a registered account, the masked email and **last-4 of the mobile** are shown to an unauthenticated caller →
  **PII disclosure** (POPIA — carry to suite 14Y).

## Why it matters
- An attacker can confirm which emails have accounts, then learn enough of the contact details to drive targeted
  phishing or a SIM-swap.
- It compounds `2026-08-18-api-reachable-without-authentication.md`: reset reveals the masked mobile, and the
  anonymously-reachable OTP endpoint can then return the OTP sent to that mobile — a full account-takeover chain.

## Fix direction
- Show an **identical, generic** confirmation for both registered and unregistered input
  (*"If an account exists for this address, you will receive reset instructions"*), with no branch a caller can
  observe, and equal response timing.
- Do **not** display masked contact details before the user has proven control of the account.

## Verdicts
- **TC-01-008 FAILS** — reveals existence.
- **TC-01-007 PARTIAL** — the method-select step is otherwise reasonable, but the pre-auth masked-contact disclosure is
  a defect. The email-delivery half was not verified (would consume the shared account / a real mailbox); verify via
  `NotificationMessage` next time ([[dsd-npo-notification-audit-via-api]]).

## Related wording defect
The reset entry screen asks for *"your Username"*, while the case and the whole portal authenticate with **email**.
Align the label to email.

## Evidence
`test-reports/2026-08-18/evidence/v11-forgot-password-enumerates-username-not-recognised.png`,
`test-reports/2026-08-18/evidence/v12-forgot-password-discloses-masked-email-and-phone.png`
