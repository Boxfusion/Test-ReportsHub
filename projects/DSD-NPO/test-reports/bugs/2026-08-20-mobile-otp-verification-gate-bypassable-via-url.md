# Bug: Mobile-OTP verification gate is bypassable — account created with an unverified number

**Date:** 2026-08-20
**Severity:** High → Critical (account creation with a never-verified mobile number; the OTP step is the only mobile-ownership control on the public portal)
**Area:** Public portal — `no-auth/boxfusion.dsdnpo/signUp-public-portal` (sign-up details screen)
**Environment:** QA
**Found by:** Suite 15D (TC-15D-001)

## Summary
The sign-up details screen takes the "verified" mobile number from the URL query string
(`signUp-public-portal?default=<number>`) and **trusts it without any server-side proof that an OTP was ever verified
for that number**. Navigating directly to that URL with an arbitrary number skips the Verify-Mobile → Send-OTP →
Verify-OTP flow entirely, and the account is created and immediately usable.

## Steps to reproduce
1. Sign out. Navigate directly to
   `https://dsd-npo-publicportal-1-qa.shesha.app/no-auth/boxfusion.dsdnpo/signUp-public-portal?default=0111111119`
   (any 10-digit number that was **never** sent an OTP in this session).
2. The Mobile Number field shows `0111111119`. Fill First Name / Last Name / Email → **Next**.
3. Set Password + Confirm Password → **Sign Up**. The app drops to `/login`.
4. Sign in with that email + password.

## Actual
The account is created and **signs in successfully** ("Hi QA BypassProbe"), despite no OTP ever being requested or
verified for `0111111119`. Evidence: `../2026-08-20/evidence/15d-otp-bypass-account-logged-in.png`.

## Expected
The server should bind sign-up to a **server-side record that this specific number completed OTP verification**
(e.g. a short-lived verification token issued by `Verify OTP`, checked at `Sign Up`). A client-supplied
`?default=<number>` must not be sufficient to prove mobile ownership.

## Why it matters
- The OTP step is the public portal's only mobile-ownership check. If it can be skipped, anyone can register accounts
  against arbitrary / other people's numbers, and any downstream trust in "verified mobile" (SMS notifications,
  identity linking) is unfounded.
- Compounds two related 15D findings: (a) there is **no email-verification step** either, so neither channel is
  actually proven at sign-up; (b) `NpoPerson/MobileNoAlreadyInUse` answers unauthenticated, so an attacker can first
  enumerate which numbers are free to register against.

## Notes
- Reproduced with a clean browser state (localStorage/sessionStorage cleared) so no residual verification token was
  present.
- The legitimate flow was also driven (number `0123456789`, OTP read from admin audit) and behaves identically past
  screen 3 — confirming the query-string number, not a session token, is what screen 3 consumes.
- Data synthetic throughout ([[never-record-real-personal-identifiers]]).
- Observation for the test lead, per [[dont-raise-defects-in-daily-reports]] — routed here as a security finding for
  Thabiso / dev to confirm the server-side check.
