# Bug: An Office Bearer's decline is neither required to give a reason nor recorded, and the confirmation link is replayable

**Date:** 2026-08-25
**Severity:** 🔴 **High** (an OB objecting to their listing is silently ignored; a registration proceeds as if unopposed)
**Area:** Public portal — `ob-self-verification` + `NpoOfficeBearers` confirmation flow
**Environment:** QA · **view mode Latest**
**Found by:** TC-06-003 / TC-06-004 (ADO #101705, #101706)
**Test data:** OB `b3b587d8aa13` (Grace Dube) on `QA_Smoke_NPO_2026-08-14`, an application we own

## Summary
The office-bearer self-confirmation page lets an OB decline ("No, I am not part of this organisation"), but:
1. the decline **requires no reason**,
2. it submits to a **"Thank You" success page**, and
3. the OB record is left **completely unchanged** — no flag, no reason, `isVerified` still false.

Separately, the confirmation link is **not single-use**: an already-actioned link still renders the consent form.

## Reproduction — decline (TC-06-003)
1. Open an unconfirmed OB link: `/no-auth/boxfusion.dsdnpo/ob-self-verification?mode=edit&tempId=b3b587d8aa13&npo=QA_Smoke_NPO_2026-08-14`
2. Select **"No"**.
   - **Expected:** a comment/reason field appears and is required (ADO: *"adds comment, submits → OB flagged 'Not part
     of NPO' with reason; counts toward OB Confirmation Failure"*).
   - **Actual:** no comment field appears, no required marker, **Submit stays enabled**.
3. Click **Submit** with the comment empty.
   - **Expected:** validation error — a reason is mandatory.
   - **Actual:** redirects to `ob-self-verification-thank-you?isSuccess=true` — the same success page a valid "Yes"
     produces.
4. Read the OB back (`NpoOfficeBearer/Crud/Get`, id `481eb2e5-…-b3b587d8aa13`):
   ```
   isVerified: false   isVerifiedComment: null   idVerificationFailureReason: null   isIdVerified: false
   ```
   Nothing was flagged, nothing recorded, nothing counted.

## Reproduction — replayable link (TC-06-004)
- Re-open an **already-confirmed** link (`eba499877cad`, confirmed "Yes" earlier the same day): the page **still shows
  the full consent form** ("Yes / No / Submit"), not an "already used" message.
- The API resolver *does* know — `GetOfficeBearerIdBySubstringId?subStringId=eba499877cad` returns
  *"Office bearer has already verified themselves"* — but **the page never consults that gate before rendering**, so
  the response can be re-submitted.

## Expected
- Declining requires a reason; the OB is flagged "Not part of NPO"; the decline counts toward OB Confirmation Failure
  and is visible to the assessor.
- A link that has been actioned shows "already used" and cannot be re-submitted.

## Actual
- Decline: no reason required, success page shown, nothing persisted.
- Link: renders the form regardless of prior use; the single-use check exists only in the API resolver, which the
  page does not call.

## Impact
The OB self-confirmation step exists to let a listed office bearer **object** to being named on an NPO's application.
On this build that objection is accepted, acknowledged, and discarded. A registration can therefore proceed with an
OB who explicitly declined — and there is no reason on record to explain a rejection when one does occur. The
replayable link compounds it: a confirmation response can be changed after the fact by anyone holding the (long-lived,
non-expiring — see `2026-08-24-ob-reminder-link-host-does-not-resolve.md`) link.

## Related — the status picture
No application in the register (~10 300) is at status **16 (OB Confirmed)** or **13 (OB Partially Confirm)**, though
**8 900 OBs are `isVerified = true`**. Status **7 (OB Confirmation Failed)** has 603 — but per the above, those cannot
carry the reason the flow is supposed to capture. Whether 16/13 are transient or never fire needs a controlled
all-OB-confirm registration to settle; recorded in the suite-06 report as PARTIAL, not asserted here.

## Suggested fix
1. On "No", require a reason (field visible + mandatory) before enabling Submit; persist it to the OB
   (`isVerifiedComment` / a dedicated reason field) and set the not-part-of-NPO flag.
2. Have the page call the "already verified" resolver before rendering, and show an "already used" state.
3. Confirm whether the confirmation link is meant to expire (TC-06-005) — current evidence says it does not.
