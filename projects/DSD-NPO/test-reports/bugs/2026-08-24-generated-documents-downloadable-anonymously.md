# Bug: Every generated document (certificates, OB lists, constitutions) is downloadable with no authentication

**Date:** 2026-08-24
**Severity:** 🔴 **Critical**
**Area:** API — `/api/StoredFile/Download` + `/api/dynamic/Shesha/NotificationMessageAttachment/Crud/GetAll`
**Environment:** QA
**Found by:** TC-14T-004 (ADO #101831) while opening attachments to verify certificate content
**Related:** escalates `2026-08-18-api-reachable-without-authentication.md`

## Summary
An **unauthenticated** caller can enumerate every notification attachment in the system and download the underlying
PDF. That includes **registration certificates, lists of office bearers with their names and positions, signed
constitutions, denial letters and compliance letters** — documents about real organisations and real people.

The 2026-08-18 Critical bug established that anonymous callers can read *row counts and records* from the dynamic
CRUD API. This is the same root cause carried to its conclusion: **the actual generated documents come out too.**

## The full chain — two anonymous requests
**Step 1 — discover file ids.** Anonymous, `credentials:'omit'`, no `Authorization` header:
```
GET https://dsd-npo-api-qa.shesha.app/api/dynamic/Shesha/NotificationMessageAttachment/Crud/GetAll?maxResultCount=1
→ 200 · totalCount: 4947 · each row exposes file.id and fileName
```
**Step 2 — download the document.** Same anonymity:
```
GET https://dsd-npo-api-qa.shesha.app/api/StoredFile/Download?id=<file.id>
→ 200 · Content-Type: application/pdf · 102 921 bytes · body begins %PDF-1.7
```
Confirmation the caller really is unauthenticated, in the same breath:
```
GET .../api/services/app/Session/GetCurrentLoginInfo  (credentials omitted) → result.user = null
```

🔑 **Reproducible from a bare shell with no browser, no cookies and no token at all** — 8 letters were retrieved this
way with plain `curl`:
```
curl -s -o out.pdf "https://dsd-npo-api-qa.shesha.app/api/StoredFile/Download?id=<file.id>"
```

## Expected
`StoredFile/Download` requires an authenticated, authorised caller, and a caller may only retrieve documents
belonging to organisations they are entitled to see. The attachment listing should not be anonymous either.

## Actual
Both endpoints answer anonymously. `totalCount: 4947` attachment rows are listable, and each row hands over the id
needed to fetch the file.

## Why this is worse than the 08-18 finding
The 08-18 bug was demonstrated with a **row count** (`totalCount: 320590`) and one already-expired OTP, and the report
deliberately stopped there rather than pulling personal data. This finding shows the same hole yields **finished
documents**:

| Document | What it contains |
|---|---|
| `RegistrationCertificate.pdf` | Organisation name, registration number, date entered in the register |
| `ListOfOfficeBearersLetter.pdf` | **Full names and positions of every office bearer** |
| `Application*Constitution*.pdf` | The organisation's signed, stamped constitution |
| `ApplicationUnsuccessfulLetter.pdf` | Why an application was declined, in detail |
| `AppIncompleteLetter.pdf` | Which office bearers failed to confirm, and why each item failed |
| `AnnualComplianceIncomplete.pdf` | The organisation's compliance failings |

Office-bearer names and positions are personal information under POPIA, and the decline/compliance letters are
adverse findings about identifiable organisations.

## Scope — stated precisely, not inflated
- File ids are **GUIDs and not guessable**, so this is not "browse the filesystem".
- But they **do not need guessing**, because step 1 lists them anonymously. That is what makes the chain complete and
  removes the "you'd have to know the id" mitigation.
- 🔑 **I did not enumerate.** I requested `maxResultCount=1` to establish the count and prove the id is exposed, and I
  downloaded documents belonging to **NPOs we created ourselves** (`333-022-NPO` and other QA test records), so no
  third party's personal data was retrieved. Scope-mapping the full surface belongs to **14Z** with the dev team's
  knowledge, not to unilateral enumeration.
- Not tested: whether this also holds on the **production** environment. That question should be answered urgently
  and by someone with the authority to ask it, not by probing prod.

## Fix direction
Require authentication and an authorisation check on `StoredFile/Download` — the check must be per-document, not just
"is logged in", or any authenticated user could still read every organisation's certificate. Then close the anonymous
dynamic-CRUD surface generally, which is the shared root cause with the 08-18 bug; the uneven posture there
(`/graphql` gated, dynamic CRUD open) already suggested a misconfiguration rather than intent.

## Verdict
**CONFIRMED.** Two anonymous requests, reproduced with both `fetch(credentials:'omit')` and plain `curl`, with
`Session/GetCurrentLoginInfo` returning `user: null` as the control.
