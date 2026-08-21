# Bug: the API answers unauthenticated requests — NPO register and a raw-OTP endpoint are anonymously readable

**Date:** 2026-08-18
**Severity:** 🔴🔴 Critical
**Area:** API (`dsd-npo-api-qa.shesha.app`) — dynamic entity CRUD **and** `dsdnpo/npoOtpStressTesting`
**Environment:** QA
**Found by:** TC-01-021 (ADO #101615), which then generalised
**Reported to test lead:** pending — flagged for **immediate** attention

## Summary
Requests to the API succeed **without any authentication**. This was proven for the NPO register (320 590 records)
and for an OTP-retrieval endpoint that returns a **live OTP pin**. The server itself confirms the caller is anonymous.
This is far broader than the single endpoint the originating test case named.

## Proof of anonymity (not assumed — demonstrated three ways)
Signed out; `localStorage` empty; `document.cookie` empty; all `fetch` calls made with `credentials:'omit'` and no
`Authorization` header. Raw `fetch` does **not** attach Shesha's Bearer token (that is an axios interceptor), so these
requests carry no credentials by construction.

1. **The server agrees the caller is anonymous.**
   `GET /api/services/app/Session/GetCurrentLoginInfo` → `200`, body `result.user = null`.

2. **The whole NPO register is readable.**
   `GET /api/dynamic/boxfusion.dsdnpo/NpoOrganisation/Crud/GetAll?maxResultCount=1` → `200`,
   `result.totalCount = 320590`, with real organisation records in `items`.

3. **A raw OTP pin is returned.**
   `GET /api/services/dsdnpo/npoOtpStressTesting/GetOtpByEmailAddressOrPhoneNumber?emailAddressOrPhoneNumber=<mobile>`
   → `200`, `result` containing `pin`, `sendTo`, `expiresOn`, `sentOn`, `sendStatus`.
   (The pin value is deliberately **not recorded here**; the one observed was already expired.)

## Expected
- `GetCurrentLoginInfo` may legitimately be anonymous, but **entity CRUD endpoints and the OTP-stress endpoint must
  require authentication** (and the OTP endpoint must additionally be admin-gated and disabled in production, per the
  code-review note on #101615).
- An unauthenticated caller should receive `401` with `unAuthorizedRequest: true`.

## Actual
- Anonymous `GET` on the dynamic register returns data.
- Anonymous `GET` on the OTP endpoint returns a pin.
- No `401`/`403` on either.

## Method note (so the retest is reproducible)
- The endpoint is a Shesha `Get*` service → it answers **GET with a query string**. A **`POST`** (as ADO #101615
  writes the step) returns **`405 Method Not Allowed`**, which can be misread as "blocked/gated". Test with GET.
- Verify anonymity via `GetCurrentLoginInfo` returning `user: null`, not merely by clearing `localStorage`.

## Scope — deliberately not fully mapped
Coverage was stopped after establishing the class with a row **count**, a session check, and one **expired** OTP.
The 320 590 records include office-bearer SA IDs; enumerating them would breach the project's
never-record-personal-identifiers rule. Mapping the complete anonymous surface (which entities, which app services,
read vs write) belongs to **suite 14Z (Security)** and should be done **with the dev team's knowledge**, not by
unilateral scraping.

⚠️ **Open, unverified question for the devs:** is anonymous **write** also possible (POST/PUT/DELETE on dynamic
entities)? Not tested — a write test would mutate real data and must be agreed first. If it is possible, the severity
is beyond critical.

## Likely cause (hypothesis, for the devs)
Shesha exposes dynamic entity CRUD and app services behind `[AbpAuthorize]` / permission checks by default. A blanket
anonymous allowance, a missing `[AbpAuthorize]` on the app services, or an auth-middleware misconfiguration on this QA
host would produce exactly this. The OTP-stress service was already flagged in code review
(`NpoOtpStressTestingAppService.cs:26-65`) as needing an admin gate; the wider CRUD exposure suggests the problem is
not confined to that class.

## Impact
- **Confidentiality:** the entire NPO register — organisation details and office-bearer personal data — is readable by
  anyone on the internet who can reach the API host.
- **Account takeover vector:** an anonymously-retrievable OTP defeats the mobile-OTP factor the sign-up/reset flows
  rely on.
- Compounds `2026-08-18-password-reset-enumerates-users-and-leaks-contact-details.md`: reset discloses a masked
  mobile, and this endpoint can hand over the OTP sent to it.

## Evidence
Captured as structured `browser_evaluate` output in the run report
`test-reports/2026-08-18/01-authentication-account-creation-functional--sign-in-and-enumeration.md`
(status codes, `totalCount`, and `user:null` recorded there; no PII transcribed).
