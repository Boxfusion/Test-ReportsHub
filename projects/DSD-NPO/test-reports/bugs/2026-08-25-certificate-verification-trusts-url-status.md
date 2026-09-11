# Bug: The public certificate-verification page takes the NPO's status from the URL, so a cancelled NPO can be made to read "Registered"

**Date:** 2026-08-25
**Severity:** 🔴 **High**
**Area:** Public portal — `/no-auth/boxfusion.dsdnpo/npo-certificate-authentication` (the QR-code target on every registration certificate)
**Environment:** QA
**Found by:** TC-14D-002 / TC-14D-004 follow-up — decoding the QR code extracted from `RegistrationCertificate.pdf` on 2026-08-24
**Related:** re-verdicts `14d-document-pdf-functional.md` TC-14D-002 **and** TC-14D-004 (see "What this corrects")

## Summary
The QR code printed on an NPO registration certificate encodes the organisation's **registration status as a plain
query parameter**. The verification page it opens fetches the real organisation record — and then displays the status
from the **URL** rather than from the record it just fetched.

Changing one character in the QR's URL turns a **deregistered** organisation into a Department-branded page that states
it is **Registered**, complete with its real registration number, real name and real registration date.

## The QR payload
Decoded from the 1300×1300 QR image inside `RegistrationCertificate.pdf` for `333-022-NPO`:
```
https://dsd-npo-publicportal-1-qa.shesha.app/no-auth/boxfusion.dsdnpo/npo-certificate-authentication
    ?id=c5d06b6b2055&npoNumber=333-022-NPO&npoStatus=4
```
- `id` is the **last 12 hex characters** of the organisation's GUID
- `npoStatus=4` is the organisation's status value — **written into the QR in the clear**

## Reproduction — the two requests that make the case
Take any organisation whose register status is **6 = Deregistered** (`Shesha.Core.OrganisationStatus`; 4 = Registered). The one used here carries `dateCancelled`
**2012-10-03**, id suffix `ffff0e7f718a`, and is `033-807 NPO — Ethekwini Life Skills Centre`.

**1. Honest URL — the page is correct:**
```
…/npo-certificate-authentication?id=ffff0e7f718a&npoStatus=6
→ "NPO Certificate Authentication — NPO Certificate Not Valid — For further information you can contact us here"
```

**2. Same organisation, `npoStatus` changed from 6 to 4:**
```
…/npo-certificate-authentication?id=ffff0e7f718a&npoStatus=4
→ "The information below is provided by the Department of Social Development."
     Npo Number      033-807 NPO
     Name            Ethekwini Life Skills Centre
     Status          Registered
     Date Registered 11/07/2004
```
Evidence: `../2026-08-25/evidence/cert-auth-I-deregistered-honest-status6.png` and
`cert-auth-J-deregistered-tampered-to-4.png`.

🔑 **The number, name and date in that panel are real and came from the server** — so the page *did* look the
organisation up. It simply preferred the URL's status over the record's.

## It does not even require a real organisation
With a **fabricated** id, the lookup fails outright and the page still renders the panel:
```
…/npo-certificate-authentication?id=ffffffffffff&npoStatus=4
GET /api/services/dsdnpo/Organisations/GetNpoIdBySubstringId?subStringId=ffffffffffff
  → 500 {"error":{"message":"An internal error occurred during your request!","details":"Organisation not found"}}
Page → "The information below is provided by the Department of Social Development."   Status: Registered
        (Npo Number, Name and Date Registered all blank)
```
Evidence: `cert-auth-dom-F2-id-garbage-no-npoNumber.png`.

So the valid/invalid decision is a **client-side test of the `npoStatus` query parameter**. The failed lookup is
swallowed silently.

## Expected
The page resolves the organisation from `id` and renders the status **held in the register**. A status supplied in the
URL is either ignored or treated as untrusted input. A lookup that fails renders "NPO Certificate Not Valid", never a
Department-branded panel.

## Actual
- Displayed status comes from the URL's `npoStatus`; the register's own value is discarded
- `npoStatus=4` → the "valid certificate" panel. Anything else (`1`, `6`, `999`, absent) → "Not Valid"
- `npoNumber` in the URL is ignored entirely (swapping it for `333-019-NPO` or `999-999-NPO` still renders `333-022-NPO`) — correct behaviour, and it shows the id-based lookup does work
- A failed lookup (500 `Organisation not found`) still renders the valid panel
- A raw, unlabelled **`npoStatus` field showing `4`** is visible on the public page

## Impact
The QR code is the anti-forgery control on a registration certificate — the thing a funder, bank or municipality
scans to check an NPO is really registered. Because the status travels in the QR's own URL, the holder of a
**deregistered or lapsed** certificate can re-encode their own QR with `npoStatus=4` and the Department's own
verification page will vouch for them. No account and no access to DSD systems is needed.

## Secondary defect in the same flow
`GetNpoIdBySubstringId` answers a not-found organisation with **HTTP 500** and
`"An internal error occurred during your request!"`. A missing organisation is a 404, and it should not be reported to
the client as an internal error.

## What this corrects in the existing record
Two verdicts in `14d-document-pdf-functional.md` were reached against a **guessed** URL and are now wrong:
- **TC-14D-004** was recorded as *"public `/verify` route = 404 — no QR-verification deep-link flow"*. The flow
  exists; the route is `/no-auth/boxfusion.dsdnpo/npo-certificate-authentication`. `/verify` was never the path.
- **TC-14D-002** recorded the QR as absent with 14D corroboration. The QR is present (proven 2026-08-24) **and now
  decoded**, so the case can be verdicted on content rather than presence.

## Suggested fix
Drop `npoStatus` from the QR payload and from the page's inputs; render `Status` from the record returned by
`GetNpoIdBySubstringId`, and show "Not Valid" whenever that call does not return an organisation.

## It also applies to re-issued certificates (TC-14T-012)
The same defect rides on certificates re-issued by an **approved change request**, not just first-issue ones. Both
re-issued `RegistrationCertificate.pdf` files attached to approved change requests in the store carry a QR of the
same shape:
```
2026-08-06  …?id=5b26e6aa2f3e&npoNumber=333-009-NPO&npoStatus=4
2026-08-05  …?id=2ad8990067ec&npoNumber=000-099-NPO&npoStatus=4
```
Both matched their organisation's real register status at the time of issue, so nothing is wrong with the *content* —
the weakness is structural and identical: the status is in the URL and the page trusts it.

**Method note for reproducing:** the QR is a 1300×1300, 1-bit `DeviceGray` image XObject inside the PDF. When
inflating it, take the row stride from `data.length / height` (**164** bytes here) rather than `ceil(width/8)`
(**163**) — the rows are padded, and using the unpadded stride shears the image so it will not decode.

## Incidental — a duplicated NPO number in the register
While confirming the above, `333-009-NPO` came back as **two different organisation records** with two different ids
(`…3198504275b7` and `…5b26e6aa2f3e`), both at status 4. The QR's `id` disambiguates them but the NPO number does
not, so "look up the NPO by its number" is not a safe operation on this data. Raised here only as a pointer; it is
not part of this defect.
