# Report: NPO-01-F — Authentication & Account Creation (functional) — the SA ID cases do not match the build

**Date:** 2026-08-27 09:55 UTC
**Plan:** test-plans/auth/01-authentication-account-creation-functional.md
**Execution Mode:** ai-mcp
**Result:** NOT EXECUTED — TC-01-011 and TC-01-012 both test **field-level SA ID validation on the Create User Account screen**. That screen does not exist in this build, and neither does an ID Number field anywhere in the sign-up journey. Confirmed three ways: the rendered DOM of all three journey steps, and the **form definitions themselves**, which contain zero ID-number properties. Recorded as *not executable — case does not match the build*, exactly as TC-01-010 was recorded on 2026-08-18. **Neither case adds coverage.**
**Duration:** ~420s
**Cases:** TC-08, TC-09
**Environment:** QA · public portal · anonymous (`/no-auth/…`) · view mode Latest
**Accounts used:** none — the whole journey is anonymous. OTP-verified mobile `0999999988` (unallocated prefix, reused from the 2026-08-26 pool)

## Summary
| Total attempted | Passed | Failed | Partial | Not executed |
|---|---|---|---|---|
| 2 | 0 | 0 | 0 | 2 |

| Case | ADO | Verdict | One-liner |
|---|---|---|---|
| TC-08 Invalid SA ID **format** rejected at field level | #101605 | ⛔ NOT EXECUTED | No ID Number field exists in the sign-up journey — not in any of the 3 steps, not in either form definition |
| TC-09 SA ID failing the Luhn checksum is rejected | #101606 | ⛔ NOT EXECUTED | Same dependency. The product's **only** SA ID capture point is the office-bearer dialog, where this exact defect is already filed |

## What was actually walked

The full three-step journey was driven end to end and every input enumerated at each step.

| Step | Route | Inputs present | ID field? |
|---|---|---|---|
| 1 | `/no-auth/boxfusion.dsdnpo/dsd-public-portal-send-otp` | Mobile Number (`maxLength 10`) | none |
| 2 | same | Verification Code (`maxLength 6`) | none |
| 3a | `/no-auth/boxfusion.dsdnpo/signUp-public-portal?default=<mobile>` | First Name (50) · Last Name (50) · Email Address | none |
| 3b | same | Password · Confirm Password | none |

**Six data fields in the entire journey.** A regex sweep of the rendered text for
`ID Number|Identity|SA ID|Passport|ID No` returned **zero** matches at every step.

## 🔑 The decisive evidence is the form definition, not the rendered screen

A field absent from one rendered path could still be conditional. It is not — the two form definitions were read
directly and carry no ID-number component at all:

```
GET /api/services/Shesha/FormConfiguration/GetByName?module=boxfusion.dsdnpo&name=signUp-public-portal
GET /api/services/Shesha/FormConfiguration/GetByName?module=boxfusion.dsdnpo&name=dsd-public-portal-send-otp
→ 200 both
```

| Form | Markup size | Declared data properties | Hits for `idNumber\|identityNumber\|saId\|passport\|nationalId` |
|---|---|---|---|
| `signUp-public-portal` | 31 818 chars | `mobileNumber` · `firstName` · `lastName` · `emailAddress` · `password` · `passwordConfirmation` | **0** |
| `dsd-public-portal-send-otp` | 24 378 chars | `mobile` · `pin` | **0** |

Everything else in both forms is layout (`container*`, `text*`, `imgLog`, `alert*`, `sectionSeparator1`,
`validationErrors1`). There is no hidden, conditional or role-gated ID capture. **This closes the "📌 if an SA ID
*is* captured somewhere else now, note where" question in the plan: it is not captured anywhere in sign-up.**

## Per-case detail

### TC-08 — Invalid SA ID format is rejected at field level (#101605 · TC-01-011) — NOT EXECUTED

The case's step 1 is *"Open Create User Account, enter ID `12345`"*. There is no Create User Account screen and no
ID field, so neither the length error nor the digits-only error can be provoked. Nothing was entered.

### TC-09 — SA ID failing the Luhn checksum is rejected (#101606 · TC-01-012) — NOT EXECUTED

Same dependency — no field to type a 13-digit ID into, so "submit blocked" and "no DHA call fires" are both
unassertable.

🔴 **The plan's cross-reference still stands and should be carried to the test lead.** The product does capture an
SA ID — in the **office-bearer dialog** on wizard tab 4 — and there the check digit is not validated:
`bugs/2026-08-17-office-bearer-saved-with-invalid-sa-id-checksum.md`. So the *intent* of TC-01-012 (reject a
checksum-invalid SA ID) is already known to fail at the one place the product actually accepts an SA ID. If sign-up
ever gains an ID field, expect the same defect.

## 🔑 How the OTP was obtained — and why that is itself the finding

SMS delivery on QA does not work (credit). The pin was read from the API instead:

```
GET /api/services/dsdnpo/npoOtpStressTesting/GetOtpByEmailAddressOrPhoneNumber?emailAddressOrPhoneNumber=<mobile>
→ 200 { pin, sendTo, sentOn, expiresOn, sendStatus }
```

⚠️ **That endpoint answers anonymous callers — no bearer token, no session.** It is the CRITICAL finding already
filed as `bugs/2026-08-18-api-reachable-without-authentication.md` (via TC-01-021). It is used here only to read a
pin for a number we control, and no pin value is recorded. **The only reason the sign-up journey is testable at all
is a live security defect** — worth restating to the test lead, because if it is fixed, suites 01 and 15D lose their
only way in until SMS credit is restored.

The number used, `0999999988`, is deliberately **not an allocated South African mobile prefix** (SA mobiles are
06x/07x/08x), so no real subscriber can receive its SMS. `example.org` is RFC-2606 reserved.

## Notes for the test lead

- **Four cases, one root cause.** TC-01-010 (2026-08-18), TC-01-011, TC-01-012 and TC-01-013/014 (DHA verification)
  all assume an ID captured at account creation. The build captures identity at **office-bearer** level instead.
  These read as **cases written against a different design**, not as defects. They need rewriting or retargeting at
  the office-bearer dialog — that is a decision for Thabiso, not something to log as a bug.
- No account was created by this run. The journey was walked to step 3b and abandoned before `Sign Up`, so
  `0999999988` remains OTP-verified-but-unregistered and reusable.
