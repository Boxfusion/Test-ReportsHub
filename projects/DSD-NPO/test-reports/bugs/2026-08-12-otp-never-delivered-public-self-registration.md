# Public self-registration cannot be completed — the OTP SMS is never delivered

**Date found:** 2026-08-12
**Severity:** 🔴 **Blocker** — no new user can register themselves on the public portal
**Module:** DSD-NPO · public portal
**Where:** `/login` → **Register** → `/no-auth/boxfusion.dsdnpo/dsd-public-portal-send-otp`
**Environment:** QA — `https://dsd-npo-publicportal-1-qa.shesha.app`

## Symptom
The sign-up flow reaches its OTP verification step and presents a 6-character **OTP** input with a **Verify** button
and a **Resend OTP?** link — i.e. the application behaves as though an OTP has been sent. **No SMS ever arrives.**

Confirmed by the tester holding the handset for the number used: nothing was received, so the code could not be
entered and registration could not proceed.

## Steps to reproduce
1. Open the public portal `/login` and click **Register**.
2. Enter a mobile number and click **Verify Number**.
   > ⚠️ Note the flow is **two-stage**: *Verify Number* only validates the number. A separate **Send OTP** button then
   > appears and is what actually dispatches the SMS. Clicking only the first button looks successful and sends
   > nothing — worth checking that real users are not falling into this.
3. Click **Send OTP**.
4. Page advances to *"Verify OTP"* with a 6-character input, **Verify** and **Resend OTP?**.
5. **Observe:** no SMS is received. Registration cannot be completed.

## Expected
An OTP SMS is delivered to the number entered, so the applicant can verify and continue to registration.

## Actual
No SMS is delivered. The UI nonetheless presents the verification step as though one had been sent, giving no
indication of failure.

## Impact
**No member of the public can register an account on the portal**, which also means we cannot create our own
applicant-side test user and are obliged to keep testing on a shared developer account.

Note this does **not** block internal users: creating a user from **Administration → User Management** on the admin
portal works and was verified the same day
(`test-reports/2026-08-12/create-user--tc01-create.md`). Only public self-registration is affected.

## Lead worth checking first — the number may already be in use
The number used was `0818400598`. Separately that day, `POST /api/services/app/UserManagement/Create` rejected the
same number with:

> *"Specified mobile number already used by another person"*

So **that number is already attached to an existing person record**, and mobile numbers are enforced unique. It is
plausible the OTP send fails, or is suppressed, when the number already exists — which would make this a
poor-error-handling problem rather than a broken SMS gateway.

**Retest with a mobile number not present in the system** to separate the two. If a fresh number receives an OTP,
this is really *"self-registration with an already-registered number fails silently"* — closely related to
`bugs/2026-08-12-validation-errors-not-surfaced.md`. If a fresh number also receives nothing, the SMS delivery path
itself is down.

## Notes
- No error, toast or message of any kind was shown at any point — consistent with the module-wide pattern that
  **failures are invisible**.
- ⚠️ **Awaiting Thabiso K's confirmation** of intended behaviour, per the project convention that expected results
  come from the lead tester.
