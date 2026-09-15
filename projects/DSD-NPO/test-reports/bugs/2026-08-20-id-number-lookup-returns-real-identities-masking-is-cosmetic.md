# Bug: the public registration form resolves any ID number to a real person's identity — and the on-screen masking is cosmetic

**Date:** 2026-08-20
**Severity:** **High** — POPIA. Personal information of people unconnected to the application is disclosed to whoever
is filling in the form.
**Area:** Public portal → registration wizard → **Office Bearer** modal (`npo-office-bearer`) → *Is RSA ID Number* +
**SAIDNumber**; identity values then propagate to the admin portal
**Environment:** QA
**Found by:** capturing 3 office bearers for APPL26-01494

> ### ⛔ Deliberate omission
> This report **does not transcribe any ID number or any returned name, date of birth, or gender**, in line with our
> standing rule to describe rather than record personal identifiers. The values are reproducible by a developer in
> seconds using the steps below. **Anyone reproducing this should treat both the input ID numbers and the returned
> identities as live personal data.**
>
> 🔑 Follow-up for us: the ID number used for office bearer 1 has been sitting in my working notes as a "test ID". It
> resolves to a real identity, so it is **not** a test value and should be scrubbed from our notes.

## Summary
Ticking **Is RSA ID Number** and typing **any** valid 13-digit South African ID number causes the form to look the
number up and return that person's **first name(s), surname, date of birth and gender**. No consent step, no
authorisation check, no relationship to the application, no apparent rate limiting. The lookup fires on the public
portal, and the resolved identity is written into the application.

Two problems, one worse than the other:

1. **The disclosure itself.** The form is an identity-enumeration oracle. Anyone with an ID number — a public portal
   user, not a DSD official — learns the name, DOB and gender attached to it. Any registered portal user can do this
   repeatedly against arbitrary numbers.
2. **The masking is cosmetic.** The First Name / Last Name / Full Name inputs *display* the name partially obscured
   (letters replaced with underscores), which reads as a deliberate privacy control. It is not one: the **full,
   unmasked name is present in plaintext in the page DOM** at the same moment, in the sibling passport-mode fields
   bound to the same record. Anyone can read it with the browser's element inspector. The mask protects nothing and
   creates a false impression that the data is protected.

## Evidence
- Three independently-generated, Luhn-valid ID numbers were entered (they were generated arithmetically, **not**
  taken from any person or dataset). **All three** returned a distinct, plausible full name, DOB and gender —
  i.e. the lookup is hitting a real population register or a copy of one, not a stub.
- For each: the visible First/Last/Full Name inputs held the underscore-masked form, while a concurrent DOM read of
  the passport-mode First Name (s) / Last Name inputs on the same form returned the **unmasked** name.
- After saving, the **office bearer grid on the public portal shows the full unmasked name and the full ID number**
  in plain text — so the mask is not even applied consistently within the same wizard step.
- On the **admin portal**, the Office Bearer Compliance picker lists all three office bearers by **full unmasked
  name**. The identities propagate downstream intact.
- DOB and gender are derived from the ID number and shown as read-only display values.

## Steps to reproduce
1. Public portal → any in-progress registration → wizard step 4 **Office Bearer** → **Add Office Bearer**.
2. Tick **Is RSA ID Number**.
3. Type any valid 13-digit SA ID number into **SAIDNumber**.
4. Observe First Name / Last Name / Date Of Birth / Gender populate from the lookup, names shown masked.
5. Inspect the DOM (or just save the office bearer and read the grid row) → the **full unmasked name** is there.

## Expected
Needs a business ruling from DSD, but at minimum:
- An identity lookup on a **public** form should not return third-party personal information to the person typing.
  If the lookup exists to *validate* an ID, it should return a yes/no verification result, not the identity.
- If returning the name is genuinely intended (so an applicant can confirm they typed their office bearer's ID
  correctly), it needs a consent/authorisation basis, rate limiting, and audit logging of every lookup.
- If masking is intended as a privacy control, the unmasked value must not be present client-side at all — mask it
  **server-side** before it reaches the browser. Masking in the UI while shipping the plaintext is worse than not
  masking, because it misrepresents the protection in place.

## Actual
Unauthenticated-in-spirit, unthrottled, unlogged identity lookup on a public form; masking applied only to three
inputs while the plaintext sits beside them in the DOM and in the grid.

## Impact
- **POPIA exposure of third parties' personal information** through a public-facing government portal. This is the
  most serious category of finding on this module so far and is not mitigated by anything I could find in the UI.
- Enumeration: ID numbers are structured (DOB + sequence + checksum), so valid candidates are trivially generated —
  as this test did. That makes bulk harvesting of name/DOB/gender feasible.
- Interacts with the already-raised `2026-08-18-api-reachable-without-authentication.md` and
  `2026-08-18-wide-open-cors-reflects-any-origin-with-credentials.md`: if the lookup endpoint shares that posture,
  the oracle is reachable without going through the UI at all. **Not yet verified — worth checking as a priority.**

## Questions for the test lead (Thabiso)
1. Is the ID lookup hitting a live Home Affairs / population-register integration in **QA**? If so, QA is processing
   live personal data and that needs raising independently of this defect.
2. Is returning the name to the applicant an intended requirement, or was the masking added *because* someone already
   flagged the disclosure? The half-applied mask suggests the latter.
3. Is there an audit trail of ID lookups? `2026-08-18-no-submission-snapshot-or-application-audit-log.md` found
   entity history absent, so probably not — which would mean these lookups are untraceable.

---

## ✅ CONFIRMED LIVE DHA INTEGRATION (2026-08-20, later) — endpoint named, wire-captured
While re-running smoke **TC-04-001**, the lookup was captured on the wire:

```
POST /api/services/dsdnpo/IdentificationVerificationActions/IdentityVerification   → 200
```

The response body is a **Department of Home Affairs person profile**, not a stub. Its shape leaves no doubt:

`result.payload.personProfile.` **`dhA_Transaction`** · **`personIdentityProfile`** containing
`personNameSurname{ personGivenName[], personSurname, personMaidenName, personPreviousSurname, personAlias[],
personNickname[], personInitials, personTitleCode }` · `personAssignedIdentity[{ identityDocumentNumber }]` ·
`personBirthDate` · **`personLivingIndicator`** · `personDeathDateSpecified` · `personDeathCertificateNumber` ·
`personMaritalStatusCode` · `personResidentialAddress` · `personPostalAddress` · `personCitizenshipCode` · **`upid`**

⛔ **No values transcribed.** The field *names* alone establish the point: this is the national population register
schema, including fields for **maiden name, aliases, marital status, residential and postal address, citizenship,
and date/certificate of death**. On this QA build the populated subset is given name(s), surname, birth date and
living indicator — but the contract exposes far more.

### Why this matters more than first written
1. **QA is processing live personal data.** Confirmed, not inferred. That needs raising independently of this defect.
2. **The endpoint is reachable as a POST from the browser session**, so the oracle is not confined to the wizard UI.
   Combined with `2026-08-18-api-reachable-without-authentication.md` and
   `2026-08-18-wide-open-cors-reflects-any-origin-with-credentials.md`, **whether this endpoint is itself
   auth-gated should be checked as a priority** — an unauthenticated identity oracle would be a far more serious
   finding than the UI disclosure.
3. **There is no verification flag in the response.** Nothing indicates "verified" — which is also why smoke
   TC-04-001's prescribed `ID Verified` status has nothing to render from.
