# Bug: sign-up does not trim the email, then uses it as the username — account creation dies on a 500

**Date:** 2026-08-26
**Severity:** 🟠 **Medium** (public sign-up fails with an unhandled 500 and a generic message; a user who pastes an address with a stray space cannot register and is told nothing useful)
**Area:** Public portal — `boxfusion.dsdnpo/signUp-public-portal` → `POST /api/services/app/UserManagement/Create`
**Environment:** QA · public portal · signed out
**Found by:** functional TC-01-018 (#101612) — leading/trailing whitespace in email

## What happens

At sign-up step 3a the Email Address field accepts a value with leading and trailing whitespace. Confirmed in the
DOM before submit — **29 characters**, both ends padded:

```
"  npo.qa.echo.e@example.org  "
```

There is **no client-side validation and no trim**: no field error, and `Next` is enabled. The journey proceeds to the
password step normally. On `Sign Up`, `POST /api/services/app/UserManagement/Create` returns **HTTP 500**:

```json
{"error":{"message":"Username 'Username '  npo.qa.echo.e@example.org  ' is invalid,
 can only contain letters or digits."}}
```

The user sees only a generic toast:

> *"Registration failed! Please check details and try again or reach out to your administrator."*

**No account is created.**

## Three distinct faults in one response

1. **The email is never trimmed** — not on the client, not on the server.
2. **The untrimmed email is assigned as the username**, whitespace included, and the username validator then rejects
   the value the application itself just constructed.
3. **The error template is doubled** — `Username 'Username '…'` — so the diagnostic is malformed even for a developer.

And because a validation problem is returned as a **500** rather than a **400** with a validation payload, the client
has nothing to render and falls back to the generic failure message.

## Steps to reproduce

1. Public portal → **Register** → enter an unallocated mobile (e.g. `0999999990`) → *Verify Number* → *Send OTP*.
2. Enter the OTP → *Verify*.
3. First Name / Last Name, and Email Address **with a leading and trailing space**, e.g. `␠␠user@example.org␠␠`.
4. Observe: no validation error, `Next` enabled. Click **Next**.
5. Enter a matching valid password in both fields (6+ characters) → **Sign Up**.
6. Observe: generic *"Registration failed!"* toast; `UserManagement/Create` → **500** with the message above; no
   account created.

## Impact

- A member of the public who pastes their email address with a trailing space — routine when copying from a document
  or an email client — **cannot register**, and the message tells them nothing actionable. They are advised to
  "reach out to your administrator" for what is a stray space.
- The 500 means the condition is unhandled, so it will appear as a server error in logs and monitoring rather than as
  the input-validation problem it is.

## ✅ What this bug is NOT — two things checked so the report is not overstated

- **It does not create an unusable account.** The 08-18 plan note predicted this would be *"the most serious"* of the
  build's three whitespace instances because it would *"silently create an account nobody can sign into."* It does
  not. Verified after the attempt: **0** rows for the name, **0** for the padded email, **0** for the mobile.
  Creation is refused outright.
- **It does not bypass duplicate detection.** The duplicate check is called with the untrimmed value
  (`EmailAlreadyInUse?emailAddress=%20%20…`), which looked like a bypass — but a padded lookup of an
  already-registered address returns **`true`**, so that endpoint trims internally. Whitespace defeats **username
  assignment only**.

## Related whitespace instances in this build
This is the third; the other two **do** persist untrimmed values, which is why trimming looks systemic rather than
local to this form:
- Office-bearer name stored as `"  John   van der Merwe"` — 08-17, TC-04-018.
- Application `refNumber` persisted as `" APPL26-01270"` with a leading space — 08-18.

## Suggested fix
1. Trim the email on input and again server-side before it is used for anything.
2. Derive the username from the **trimmed** value.
3. Return **400** with a field-level message for invalid input rather than 500.
4. Fix the doubled `Username 'Username '…'` message template.
5. Surface the server's actual validation message instead of replacing it with a generic failure toast.

## Related
- Report: `../2026-08-26/01-authentication-account-creation-functional--password-step-found-five-cases-run.md`
- `2026-08-18-api-reachable-without-authentication.md` (the anonymous `EmailAlreadyInUse` oracle)
