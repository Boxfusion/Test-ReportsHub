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

---

## Re-confirmed 2026-08-27 — two details to add

Hit again incidentally while running TC-01-022. Both narrow the finding usefully rather than widening it.

### 1. It affects read-by-**id**, not only `Crud/GetAll`
A single known GUID is enough — no enumeration required:

```
GET /api/dynamic/boxfusion.dsdnpo/NpoOrganisation/Crud/Get?properties=applicationRef,id,name,status&id=<npoGuid>
    (no Authorization header at all)
→ 200 { "id": "be7125b8-…", "applicationRef": " APPL26-01570",
        "name": "NpoQa Bravo Wizard Test 2026-08-27", "status": 1 }
```

`unAuthorizedRequest: false`. Same body when called with an authenticated but **completely unrelated** user's token
(a brand-new account with no NPO links), so there is no ownership check either. The 08-25 14Z Class B run had already
recorded `boxfusion.dsdnpo/NpoOrganisation` as anonymously readable at `GetAll` level (320 595 records); this adds the
by-id route.

### 2. 🔑 The exposure is per-endpoint, not blanket — and there is a working reference in the same codebase
Not everything is open. On the same host, with no token:

| Endpoint | Anonymous result |
|---|---|
| `/api/dynamic/boxfusion.dsdnpo/NpoOrganisation/Crud/Get?id=…` | ❌ **200 + data** |
| `/api/services/app/Entities/GetAll?entityType=Npo.Application` | ✅ **401** *"Current user did not login to the application"* |

So `Npo.Application` is correctly guarded. Whoever fixes this can use it as the in-repo reference for how the
guard should be applied, rather than designing one. That also means a blanket claim like *"the API is anonymously
readable"* is too strong and should be stated per-endpoint.

---

## Update 2026-08-28 — uploaded documents download anonymously by id (`StoredFile/Download`)

Found closing out **TC-14Z-018 / 019** (StoredFile access guard). This is the most concrete instance yet: not
metadata, but the **actual file content** of an applicant's uploaded documents, served to anyone with the file id
and **no credentials at all**.

**Specimens** — the three files owned by application **APPL26-01570** (`6c02e52c-…`, Account B). All ids were
obtained legitimately from that application's own `FilesList`, then re-requested from other contexts:

| Context | `StoredFile/Download?id=<B's file>` | `StoredFile/FilesList?ownerId=<B's app>` |
|---|---|---|
| Account **B** (owner) | 200 + PDF (control) | 200, lists all 3 (control) |
| Account **A** (unrelated user, no link to B) | ✅ **200 + full PDF** (79 549 / 107 890 / 193 B) | ✅ **200, lists all 3 by name** |
| **Anonymous** (no token) | ✅ **200 + full 79 549 B PDF** | — |

So there is **no owner check and no authentication check** on file retrieval: any authenticated user can read any
other user's uploaded documents by id, and an anonymous caller can too.

**Discrimination control.** A zero GUID (`00000000-…`) does **not** return content — it errors (CORS-masked, the
known pattern on this host's error path), while every real id returns 200 + bytes. So the 200s are genuine file
retrievals, not blanket-200 behaviour.

**Scope / POPIA.** Uploaded documents in this register include founding constitutions, and elsewhere ID and
banking documents — so this is a direct route to personal and organisational documents by guessable/leaked id. The
files touched here were **our own synthetic Account-B documents**; only blob sizes were read, no content
transcribed.

**Verdict impact.** TC-14Z-018 and TC-14Z-019 both **FAILED** on this evidence — the StoredFile guard the cases
exist to prove is absent in the strongest form (cross-account **and** anonymous).
⚠️ The verbatim ADO steps for 018 vs 019 could not be quoted: suite 14Z is not among the 9 committed raw ADO pulls
and the `ado` MCP was unreachable this session. The two cases are verdicted against the plan's stated intent
("StoredFile guard", Class B), with `FilesList` (enumeration) and `Download` (retrieval) each demonstrated
unguarded. **Thabiso to confirm which of 018/019 targets enumeration vs retrieval** — the finding covers both
regardless.

Same root cause and fix as the rest of this bug: apply the guard already present on `Npo.Application` to the
`StoredFile` endpoints.
