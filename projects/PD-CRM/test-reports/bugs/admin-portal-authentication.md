# Bugs — Admin Portal Authentication (ADO suite 112731)

**Plan:** test-plans/authentication/admin-portal-authentication.md
**ADO:** Plan 112718 › PD-CRM (112719) › Authentication (112721) › Admin Portal (112731), cases #112734–#112741
**Environment:** QA — https://pd-dep-adminportal-qa.shesha.app/login
**Found:** 2026-09-01
**Build:** `Shesha/header v10`, `Boxfusion.ServiceManagement/service-requests v55`

## Result against ADO

| ADO | Case | Verdict | Reason |
|---|---|---|---|
| #112734 | Verify successful login with valid credentials | ✅ PASSED | Authenticated and landed on `/dynamic/Boxfusion.ServiceManagement/service-requests`. |
| #112735 | Verify login using invalid username | ✅ PASSED | Error shown, user held on `/login`. Wording delta only — see BUG-003. |
| #112736 | Verify login using invalid username and password | ✅ PASSED | Error shown, user held on `/login`. Wording delta only — see BUG-003. |
| #112737 | Verify login using invalid password | ✅ PASSED | Error shown, user held on `/login`. Wording delta only — see BUG-003. |
| #112738 | Verify mandatory username validation | ⚠️ PASSED | App emitted the exact string ADO prescribes — but that string is a raw .NET exception, so the **expectation itself is the defect**. See BUG-001. |
| #112739 | Verify mandatory password validation | 🔴 FAILED | **Expected** (ADO): `Value cannot be null. (Parameter 'userNameOrEmai lAddress`. **Actual**: `Value cannot be null. (Parameter 'plainPassword')`. The ADO case names the *username* parameter on a *password* test — a copy-paste from #112738. **The app is correct; the test case is wrong.** See BUG-004. |
| #112740 | Verify mandatory username and password validation | 🔴 FAILED | **Expected** (ADO): "validation messages indicating that the Username and Password fields are required". **Actual**: no message of any kind — polled 9s across `.ant-message`, `.ant-notification`, `.ant-alert`, `.ant-form-item-explain`, `[role=alert]`, all empty. User did correctly stay on `/login`. **Genuine application defect.** See BUG-002. |
| #112741 | Verify user logout | ✅ PASSED | Profile menu exposed Logout; user redirected to `/login`. |

Two of the four issues below are **application** defects; two are **test-case** defects in ADO itself.

---

## BUG-001 — [Test case] ADO #112738 prescribes a raw .NET exception as the expected result

**Type:** Test-case defect
**Severity:** Medium
**Status:** Open — needs a BA/QA decision

ADO #112738 step 5 expects:

```
The system displays an error message that reads "Value cannot be null. (Parameter 'userNameOrEmailAddress", and the user remains on the Login page.
```

The application does emit exactly that, so the case passes as written. **But the expected result documents a
defect rather than correct behaviour.**

### Why this needs changing
1. `Value cannot be null. (Parameter 'userNameOrEmailAddress')` is an unhandled .NET `ArgumentNullException`
   message reaching the browser. It exposes an internal API parameter name to an unauthenticated caller.
2. It is unintelligible to an end user.
3. It signals the empty-field case is unvalidated — the request reaches the authentication service before
   anything checks it.
4. Baking it into the test suite means the day a developer fixes it, this case starts *failing*. The suite
   currently protects the bug.

### Recommendation
Change the expected result to a field-level validation message (e.g. *"Username is required"*) and raise an
application defect for the current behaviour. Note ADO #112740 (both fields blank) already expects the
*correct* behaviour — "validation messages indicating that the Username and Password fields are required" —
so the suite contradicts itself between #112738 and #112740.

---

## BUG-002 — [Application] Submitting a completely empty login form gives no feedback at all

**Type:** Application defect
**Severity:** Medium (UX / accessibility)
**Status:** Open
**Fails:** ADO #112740

### Steps to reproduce
1. Go to https://pd-dep-adminportal-qa.shesha.app/login
2. Leave **both** Username and Password empty
3. Click **Sign In**

### Expected (per ADO #112740)
> "The system displays validation messages indicating that the Username and Password fields are required.
> The user remains on the Login page and is not granted access to the system."

### Actual
Nothing happens. No toast, no field-level error, no navigation. Polled the DOM for 9 seconds across
`.ant-message`, `.ant-notification`, `.ant-alert`, `.ant-form-item-explain` and `[role=alert]` — all empty.
The **Sign In** button is not disabled either, so there is no affordance explaining the inaction.

The user does correctly remain on the Login page and is not granted access — it is only the required-field
messaging that is missing.

### Why it matters
The page reads as broken: a click with zero response and no indication the app registered it. It is also an
accessibility failure — there is nothing for a screen reader to announce.

### Note
Leaving *one* field empty **does** produce a message (see BUG-001/BUG-004), while leaving *both* empty
produces none — the two cases travel different code paths.

---

## BUG-003 — [Application, cosmetic] Error text is "Invalid user name or password", ADO says "Invalid username or password"

**Type:** Application defect (cosmetic) / possible test-case wording
**Severity:** Low
**Status:** Open
**Affects:** ADO #112735, #112736, #112737

All three invalid-credential cases prescribe the message verbatim as:

```
Invalid username or password
```

The application renders:

```
Invalid user name or password
```

— *user name* as two words. The three cases were executed with a whitespace-tolerant match so one cosmetic
delta would not fail three otherwise-correct cases; had they been asserted verbatim, all three would have
failed.

### Recommendation
Decide which spelling is canonical and align one side. Either is defensible; leaving them divergent means any
future verbatim-assertion run fails three cases for no functional reason.

### Note (working correctly)
All three cases return the **same generic message** regardless of whether the username exists — so the login
endpoint does not leak account existence. That is correct behaviour and worth preserving.

---

## BUG-004 — [Test case] ADO #112739 expects the username parameter on a password-validation case

**Type:** Test-case defect
**Severity:** Medium
**Status:** Open — needs a BA/QA decision

ADO #112739 is *"Verify Mandatory Password Validation"*: type a username, leave the **password** empty. Its
expected result reads:

```
The system displays an error message that reads "Value cannot be null. (Parameter 'userNameOrEmai lAddress", and the user remains on the Login page.
```

Two problems:

1. It names **`userNameOrEmailAddress`** — the *username* parameter — on a *password* test. The application
   actually returns `Value cannot be null. (Parameter 'plainPassword')`. This looks like a copy-paste from
   #112738 that was never updated.
2. The parameter name contains a stray space: `userNameOrEmai lAddress`.

Executed as written the case **FAILS**, because the observed message names `plainPassword`, not
`userNameOrEmailAddress`.

### Recommendation
The application behaviour here is self-consistent — it correctly identifies which field is missing. Fix the
test case. And per BUG-001, the target expectation should become a user-facing validation message
(*"Password is required"*) rather than either .NET string.

---

## Not covered by this suite

- **Account lockout.** No case in 112731 covers repeated failed logins, and it was not driven — locking the
  shared QA `Admin` account would block other testers. If a lockout policy is expected, it needs a dedicated
  throwaway account before it can be tested.
- Password masking, `returnUrl` handling for anonymous deep-links, session persistence across reload,
  post-logout session invalidation, and username case-insensitivity were all verified during the exploratory
  pass on 2026-09-01 and are recorded in `observations/2026-09-01-environment-recon.md`. None are in ADO
  112731 — worth considering whether the suite should cover them.

## Observation (not a defect)

The login page links to password recovery with the label **"Forget Password"** — likely intended as
*"Forgot Password"*. Route is `/no-auth/shesha/forgot-password?mode=edit`. Not covered by any case in 112731.
