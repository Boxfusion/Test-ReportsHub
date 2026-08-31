# Report: NPO-01-F — Authentication & Account Creation (functional) — the password step exists, and five gated cases now run

**Date:** 2026-08-26 06:32 UTC
**Plan:** test-plans/auth/01-authentication-account-creation-functional.md
**Execution Mode:** ai-repair
**Result:** FAILED — five cases previously recorded NOT EXECUTABLE or blocked are now verdicted, because the 08-18 field inventory **missed an entire step**. Password / Confirm Password do exist, behind `Next`. Of the five: 1 passed, 2 failed, 2 partial. The password policy is **6 characters, no complexity, no dictionary check** — `password` is accepted and works.
**Duration:** ~1800s
**Cases:** TC-01-015, TC-01-016, TC-01-017, TC-01-018, TC-01-019
**Environment:** QA · public portal · signed out · Live mode (no view-mode control is exposed to an anonymous visitor)
**Accounts used:** three throwaway sign-ups on unallocated `09x` mobile numbers — see the account note at the foot

## Summary
| Total attempted | Passed | Failed | Partial |
|---|---|---|---|
| 5 | 1 | 2 | 2 |

| Case | ADO | Verdict | One-liner |
|---|---|---|---|
| TC-01-015 Mismatched Password / Confirm | #101609 | ⚠️ PARTIAL | Error **is** shown and no account is created — but `Sign Up` stays enabled and the request fires; the block is server-side only |
| TC-01-016 Password policy is enforced | #101610 | 🔴 FAILED | Min length is 6 and **never stated to the user**; **`password` is accepted** and authenticates |
| TC-01-017 Duplicate email is blocked | #101611 | ✅ PASSED | Blocked at the details step — *"Email Address Already Exist"* — and **0** duplicate rows created |
| TC-01-018 Leading/trailing whitespace in email is trimmed | #101612 | 🔴 FAILED | Not trimmed; the untrimmed email becomes the **username** and creation dies on a **500** |
| TC-01-019 Account locks after N failed sign-ins | #101613 | ⚠️ PARTIAL | Lockout **works — threshold exactly 5** — but the user is never told how to recover |

## 🔑 Why these five were unlocked — the 08-18 inventory was one step short

The 08-18 run recorded the sign-up journey as **two** steps and concluded:

> *"Absent from the entire journey: SA ID Number, Password, Confirm Password."*

and marked TC-01-011/012/013/015/016 **NOT EXECUTABLE**. **The journey is three steps.** Driven in full today:

| Step | Route | Fields |
|---|---|---|
| 1 | `…/dsd-public-portal-send-otp` | **Mobile Number** (`maxLength 10`) → *Verify Number* → *Send OTP* |
| 2 | same route | **Verification Code** (`maxLength 6`, placeholder `OTP`) → *Verify* |
| 3a | `…/signUp-public-portal?default=<mobile>` | **First Name** (50) · **Last Name** (50) · **Email Address** (no maxLength) → **`Next`** |
| **3b** | same route | **Password** · **Confirm Password** → *Sign Up* |

**Step 3b is behind `Next`,** which is why it was missed. So the password pair exists and TC-015/016 are genuine.

⚠️ **SA ID is still genuinely absent** — re-verified against **all three** steps today, including a text scan for
*"SA ID / ID Number / Identity"* on each. **TC-01-011/012/013 remain NOT EXECUTABLE**, but that now rests on a
complete inventory rather than a partial one. The question for Thabiso is unchanged and still open.

## Test Cases

### TC-01-015 — Mismatched Password / Confirm Password is blocked (#101609 · TC-01-015) — PARTIAL

Password `Abcdef1!`, Confirm `Abcdef2!`, exactly as the case specifies.

| Assertion | Result |
|---|---|
| (BLOCKING) a mismatch error is shown | ✅ **PASS** — *"The passwords do not match!"*, rendered on **both** fields |
| submit is blocked | 🔴 **FAIL** — `Sign Up` stays **enabled**; clicking it fires `POST /api/services/app/UserManagement/Create` |

The server rejects it cleanly — **400**, `"Password Confirmation must be the same as Password"` — and **no account is
created**. So the outcome is correct and there is defence in depth on both layers; what fails is the specific
assertion that the submit is *blocked*. A user can click a button the form has already told them is invalid and
round-trip to the server for no reason.

**PARTIAL rather than PASS** because the case lists "submit is blocked" as a distinct assertion and it does not hold.

---

### TC-01-016 — Password policy is enforced (#101610 · TC-01-016) — FAILED

Both halves of the case were run. ⚠️ The first attempt at the second half was **invalid and is discarded** — it was
run on the journey carrying a whitespace-padded email, so the request died on the username before password validation
was ever reached. The case was re-run from a clean journey with a valid email to isolate the variable.

| Input | Client-side | Server | User sees |
|---|---|---|---|
| `abc` (3 chars) | **no error at all**, `Sign Up` enabled | **500** — *"Passwords must be at least 6 characters."* | generic *"Registration failed! Please check details and try again or reach out to your administrator."* |
| `password` (8 chars, top-20 leaked word) | no error | **accepted — account created** | redirected to `/login` |

**🔴 Both assertions fail.**
- *"Field error stating minimum length / required character classes"* — there is **no field error**, no strength
  meter, and the rule is never stated. The minimum is enforced only server-side, and only as a **500** rather than a
  validation 400. The user is told nothing but "Registration failed!".
- *"A common word is rejected"* — `password` was **accepted**. Account `npo.qa.policy.f@example.org` (user `15948`)
  was created and `POST TokenAuth/Authenticate` with it returns **200 with a valid access token**. It is a working
  credential.

**📌 The policy actually enforced, as the case asks us to RECORD:**

| Rule | Enforced? |
|---|---|
| Minimum length | **6 characters** (server-side, message not surfaced) |
| Upper / lower / digit / symbol classes | **No** |
| Dictionary / common-password check | **No** |
| Strength indicator in the UI | **No** |
| Rules stated to the user anywhere | **No** |

**🔴 Drift note CONFIRMED** — *"delegated to Shesha `PasswordHasher`; no custom complexity rules in dsd-npo."* Exactly
that: the Shesha default 6-character minimum and nothing else. The plan's prediction from the `123qwe` QA password was
right.

🔑 **Worth noting the 500.** A weak password is a user-input problem and belongs in a 400 with a field message. Returning
500 means the failure is unhandled, which is also why the client falls back to a generic toast — it has no validation
payload to render.

---

### TC-01-017 — Duplicate email is blocked (#101611 · TC-01-017) — PASSED

A second sign-up was driven with a fresh mobile (`0999999988`) and the **already-registered** email
`npo.qa.policy.f@example.org`.

| Assertion | Result |
|---|---|
| (BLOCKING) creation is refused | ✅ **PASS** — blocked at step 3a; `Next` does not advance to the password step |
| a message appears | ✅ **PASS** — **"Email Address Already Exist"**, rendered inline beside the field |
| **no duplicate row** exists | ✅ **PASS** — exactly **1** row holds that email; **0** rows for `GolfTest` |

**📌 Which of the two wordings, as the case asks:** the **enumerating** one. *"Email Address Already Exist"* states
plainly that the account exists, rather than the generic *"if an account exists you will receive an email"*.

**🔑 Held against TC-01-002 and TC-01-007, as the case instructs:** the portal is non-committal at **sign-in** and
committal at **sign-up**, so it remains enumerable. And it is worse than the UI suggests — the underlying checks
answer **anonymous** callers directly:

| Anonymous GET (`credentials:'omit'`) | Result |
|---|---|
| `NpoPerson/EmailAlreadyInUse?emailAddress=<registered>` | `200` → **`true`** |
| `NpoPerson/EmailAlreadyInUse?emailAddress=<unused>` | `200` → **`false`** |
| `NpoPerson/MobileNoAlreadyInUse?mobileNumber=<registered>` | `200` → **`true`** |

A clean yes/no oracle for both email **and** mobile, no account required. That is the same class as the existing
CRITICAL finding and is **cross-referenced, not re-raised** —
`bugs/2026-08-18-api-reachable-without-authentication.md`.

📌 Grammar: *"Already Exist"* → *"Already Exists"*.

---

### TC-01-018 — Leading/trailing whitespace in email is trimmed (#101612 · TC-01-018) — FAILED

Email entered as `"  npo.qa.echo.e@example.org  "` — verified in the DOM as **29 characters** with both leading and
trailing whitespace intact. No client-side error; `Next` enabled; the journey proceeded to the password step.

On submit, `POST UserManagement/Create` returned **500**:

```
Username 'Username '  npo.qa.echo.e@example.org  ' is invalid, can only contain letters or digits.
```

Three separate faults in one response:
1. **The email is not trimmed** at any layer — client, transport or server.
2. **The untrimmed email is assigned as the username**, whitespace included, and the username validator then rejects
   its own input.
3. **The message template is doubled** — `Username 'Username '…'` — so even the diagnostic is malformed.

| Assertion | Result |
|---|---|
| (BLOCKING) the stored email is trimmed | 🔴 **FAIL** — nothing is stored at all |
| sign-in works without the spaces | 🔴 **FAIL** — no account exists to sign in to |

**✅ The plan's feared worst case did NOT happen, and that is worth saying plainly.** The plan warned this would be
*"the most serious of the three [whitespace instances], because it silently creates an account nobody can sign into."*
It does not: **0** rows for `EchoTest`, **0** for the padded email, **0** for mobile `0999999990`. Creation is
refused. The defect is real but its blast radius is smaller than predicted — a confusing dead end, not an
unreachable account.

**🔑 And one suspicion is retracted.** The duplicate-check call carries the untrimmed value
(`EmailAlreadyInUse?emailAddress=%20%20npo.qa.echo.e@example.org`), which looked like it would let whitespace bypass
duplicate detection. **It does not** — a padded lookup of a registered address returns **`true`**, so the check trims
internally. Whitespace defeats **username assignment only**, not duplicate detection.

Bug: `../bugs/2026-08-26-signup-email-not-trimmed-becomes-invalid-username-500.md`

---

### TC-01-019 — Account locks after N consecutive failed sign-ins (#101613 · TC-01-019) — PARTIAL

Run on a **throwaway account created for the purpose**, as the plan requires — never the shared login.
12 consecutive wrong-password attempts against `npo.qa.policy.f@example.org`:

| Attempt | Status | Message |
|---|---|---|
| 1–4 | 401 | *"Invalid user name or password"* |
| **5** | 401 | **"The user account has been locked out. Please try again later."** |
| 6–12 | 401 | same lockout message |

| Assertion | Result |
|---|---|
| (BLOCKING) attempts are stopped after a threshold | ✅ **PASS** |
| RECORD the threshold | ✅ **5 consecutive failures** |
| the user is told how to recover | 🔴 **FAIL** — *"try again later"* only |

**Confirmed in the UI, not just the API:** on the login form, the **correct** password (`password`) is now refused
with the same toast — so the lockout is genuine account state, not a wrong-password response. Captured with a
MutationObserver, per the 08-18 method note.

**🔴 The drift note is CONTRADICTED, in the build's favour** — it read *"Account lockout/throttling not visible in app
code; relies on Shesha framework defaults if any."* The Shesha default **is** active and works at 5. That is a
code-review risk clearing rather than confirming, which the project rules ask us to look for.

**Why PARTIAL:** the recovery half genuinely fails. The user is given no duration, no unlock instruction, and no
pointer to Forgot Password.

### ✅ Re-verified later the same day — threshold confirmed, window now measured
The threshold above was initially ambiguous: attempts 1–4 said *"invalid"* and attempt 5 said *"locked"*, which is
equally consistent with a threshold of **4** (locked after 4, the 5th merely reporting it) or **5**. Settled
empirically once account F's lockout had expired:

| Step | Result |
|---|---|
| 1. Correct password (baseline; resets the counter) | **200, success** |
| 2. Exactly **4** consecutive wrong passwords | 4 × *"Invalid user name or password"* |
| 3. Correct password again | **200, success** |

**Four failures do not lock the account — the threshold is 5, as reported.**

**And the unlock window is now measured rather than left unknown.** Read from the user record
(`Shesha.Authorization.Users.User`):

```
id                  15948
accessFailedCount   0            <- reset to 0 when the lockout is applied
isLockoutEnabled    true
lockoutEndDateUtc   2026-08-26T06:35:54
```

The lock tripped at ≈ 06:30:54, so **the lockout lasts exactly 5 minutes** (300s — the ABP default). A successful
sign-in also **resets** the failure counter, shown by step 1→3 above.

⚠️ None of this changes the verdict: the user is still never told the threshold, the duration, or how to recover.
See `../audits/2026-08-26-reverification-of-three-uncertain-conclusions.md`.

📌 One security nuance: the lockout message is returned for a **correct** password on a locked account, which
confirms the account exists — a further enumeration signal alongside TC-01-017.

## Observations for the test lead
- **Wording, step 1:** *"Mobile Number Valid, Click Sent OTP"* — should be *"Send OTP"*.
- **Wording, step 3a:** *"Email Address Already Exist"* → *"Exists"*.
- **The `Back` button on the password step does not navigate** — it stays on step 3b, so a user who mistyped their
  email cannot go back and fix it. They must restart the whole journey including a fresh OTP.
- **No password rules are shown anywhere** — no hint text, no strength meter, and the server's real message
  (*"at least 6 characters"*) is swallowed and replaced with a generic failure toast.
- The sign-up **password fields carry no `maxLength`**, unlike First/Last Name (50).

## Questions for Thabiso
- **Is a 6-character minimum with no complexity and no dictionary check the intended policy for a public portal?**
  `password` is currently a valid credential.
- Should a weak password return a **400 with a field message** instead of a 500?
- **Should the email be trimmed before being used as a username?** Currently whitespace produces an unhandled 500.
- The account **unlock window is 5 minutes** (ABP default) and the threshold is **5** — neither is communicated to
  the user. Should they be? *"Please try again later"* gives no way to judge whether to wait or reset.
- TC-01-011/012/013 (SA ID) are now confirmed unexecutable against the **complete** journey. **Rewrite them against
  the email + mobile-OTP + password design, or is the FDS SA-ID form still to be built?**

## Accounts created (all throwaway, unallocated `09x` mobiles, `example.org` addresses)
| Account | Mobile | State | Note |
|---|---|---|---|
| `npo.qa.policy.f@example.org` | `0999999989` | **created, then LOCKED by TC-019** | password is literally `password` — TC-016 evidence. **Do not reuse for anything needing sign-in** |
| *(whitespace attempt)* | `0999999990` | **not created** | TC-018 — creation refused, mobile verified but unused |
| *(duplicate attempt)* | `0999999988` | **not created** | TC-017 — blocked at the email step, mobile verified but unused |

⚠️ `0999999988` and `0999999990` are now **OTP-verified but unregistered**, so they are reusable for a future sign-up
test without burning a new number.

## Coverage against ADO
| ADO case | Local | Verdict |
|---|---|---|
| #101609 TC-01-015 | TC-12 | ⚠️ PARTIAL |
| #101610 TC-01-016 | TC-13 | 🔴 FAILED |
| #101611 TC-01-017 | TC-14 | ✅ PASSED |
| #101612 TC-01-018 | TC-15 | 🔴 FAILED |
| #101613 TC-01-019 | TC-16 | ⚠️ PARTIAL |
| #101605/606/607 TC-01-011/012/013 | TC-08/09/10 | ⚪ NOT EXECUTABLE — re-confirmed against the full 3-step journey |
