# Report: NPO-14T/14D — Notification template close-out, QR decoded, and the UI cross-check settled

**Date:** 2026-08-25 07:45 UTC
**Plan:** test-plans/cross-cutting/14t-notification-templates-functional.md
**Execution Mode:** ai-repair
**Result:** FAILED — 9 cases verdicted across 14T and 14D; the certificate QR is **decoded**, which retracts two 14D verdicts and exposes a 🔴 **High** defect where the public verification page takes an NPO's status from the URL. The 14T UI ↔ store cross-check is **impossible on this build** — every notification screen in the admin portal is broken. **Suite 14T is now complete: 22 of 22 cases verdicted.**
**Duration:** ~6600s
**Cases:** TC-06, TC-11, TC-12, TC-16, TC-21, TC-14-002, TC-14-014, TC-14D-003, TC-14D-004
**Environment:** QA · admin + public portal · **view mode Latest (asserted in-run, not assumed)** · store re-harvested in full 2026-08-25
**Accounts used:** `mpenduloizwelinuk@gmail.com` (shared dev login, admin portal)

## Summary
| Total attempted | Passed | Failed | Partial | Blocked |
|---|---|---|---|---|
| 9 | 4 | 2 | 2 | 1 |

| Case | ADO | Verdict | One-liner |
|---|---|---|---|
| TC-06 OB confirmation thank-you page | #101833 | ✅ PASSED | Thank-you page renders, no placeholders — and the mailed link works **once the dead host is swapped for the live one** |
| TC-11 CR Acknowledgement — UI cross-check | #101838 | ⛔ BLOCKED | The form has **no Correspondence section** and every notification screen 400s — the cross-check cannot be performed at all |
| TC-12 CR Approved + conditional docs | #101839 | ✅ PASSED | Re-issued certificate **does** carry a QR; the TC-04 question is answered, both branches already observed |
| TC-16 VD Approved + org state | #101843 | ✅ PASSED | **7 of 7** approved deregistrations have `NpoOrganisation.Status = 6 Deregistered` — the skipped state assertion holds |
| TC-21 Appeal Denied + claim attachment | #101848 | 🔴 FAILED | **0 of 4 947** attachments in the store mention "claim", yet the appeal record holds one — and the UI **does** mark it required |
| TC-14-002 QR + signatures on PDFs | #101814 | ✅ PASSED | QR present on 3 certificates and **decoded**. *Retracts* the 08-18 "absence corroborated" PARTIAL |
| TC-14D-004 QR verifies against public record | #107425 | 🔴 FAILED | The verify flow **exists** — the `/verify` 404 was a guessed path. It fails for a better reason: the page trusts the URL |
| TC-14D-003 PDF/A + embedded fonts | #107424 | ⚠️ PARTIAL | Fonts fully embedded (3 × `/FontFile2`, subset-prefixed); **no `pdfaid` and no `/OutputIntent`** — not PDF/A |
| TC-14-014 Certificate reflects status | #101826 | ⚠️ PARTIAL | Registration number correct and not stale; the certificate carries **no explicit status field** to assert against |

## 🔴 The headline — the QR decodes, and the verification page trusts the URL
Bug: `../bugs/2026-08-25-certificate-verification-trusts-url-status.md`

The 08-24 run extracted the QR image but had no decoder. It decoded first try today:
```
https://dsd-npo-publicportal-1-qa.shesha.app/no-auth/boxfusion.dsdnpo/npo-certificate-authentication
    ?id=c5d06b6b2055&npoNumber=333-022-NPO&npoStatus=4
```
`id` is the **last 12 hex characters** of the organisation's GUID. `npoStatus=4` is its registration status, **written
into the QR in the clear**.

The page fetches the real record — and then displays the status from the **URL**. Demonstrated on an organisation
whose register status is 6 (Deregistered), `dateCancelled` 2012-10-03:

| URL | Page says |
|---|---|
| `…?id=ffff0e7f718a&npoStatus=6` (honest) | **NPO Certificate Not Valid** |
| `…?id=ffff0e7f718a&npoStatus=4` (one character changed) | **Status: Registered**, with the organisation's real number, name and date |

It does not even need a real organisation: with `id=ffffffffffff` the lookup returns **500 `Organisation not found`**
and the page still renders the Department-branded panel with `Status: Registered`.

🔑 **`npoNumber` in the URL is ignored** — swapping it for another NPO's number still renders the record the `id`
resolves to. That part is correct, and it proves the lookup genuinely runs. The status is the only tampered input that
changes the verdict.

Evidence: `evidence/cert-auth-I-deregistered-honest-status6.png`, `cert-auth-J-deregistered-tampered-to-4.png`,
`cert-auth-dom-F2-id-garbage-no-npoNumber.png`, plus the A–H matrix in `evidence/cert-auth-results.json`.

## ⛔ TC-11 — the cross-check the whole suite rested on cannot be done
Bug: `../bugs/2026-08-25-notification-audit-screens-all-fail-on-stale-fields.md`

The plan calls the change-request form *"the one place in the app where the UI corroborates the store"* and makes
TC-11 the case that validates suite 14T's method. Both halves of that premise fail:

1. **`change-request-details` v25** — opened in Latest mode on our own SUBMITED foundational change request
   (`POST1042/13/08/2026`, `333-018-NPO`) — contains only `Change Details · Declarations · Foundational Change ·
   Documents · Notes`. **No Correspondence section, no notification-audit section, no Re-Send button.** The one
   corroborating detail it does offer is the `AcknowledgementLetter.pdf` (106.16 kB) under Documents, which matches
   the store.
2. **Every standalone notification screen returns 400 and shows no row**, so the independent view does not exist
   anywhere:

| Screen | Failure |
|---|---|
| `Shesha/notification-message-audit-table` | `Cannot query field 'sendDate' / 'notification' / 'sendType' / 'body'` — 4 of 8 columns dead |
| `StarterTemplate/notification-message-audit-table` | identical four errors |
| `Shesha/notifications-audit` | `GenericEntityReference does not have a default constructor` — server-side crash |
| `Shesha/notifications-table-view` and `/notifications` | `Cannot query field 'description'` — 2 of 2 columns dead |
| `Shesha/notification-templates` | renders no grid at all |

`body` → `message` is the same rename the 08-24 harvest hit. The UI was never updated.

🔑 **The honest conclusion is stronger than the open gap it replaces:** suite 14T's verdicts are store-based not by
choice but because **the store is the only view of this data the application can currently produce.** Each grid shows
an empty result set rather than an error, which reads as "no notifications exist" while the store holds **23 644**.

## ⚠️ The 08-24 harvest was truncated — the absence verdicts were re-tested and survive
The 08-24 report harvested **2 521 messages / 132 subjects**. Re-harvested with proper paging today:
**23 644 messages / 135 distinct subjects / 4 947 attachments**, spanning 2025-08-30 → 2026-08-25. The earlier pass
saw about **11 % of the rows** but nearly all of the *subjects*, which is why its conclusions mostly hold.

Re-checked against the full store, all three "no template exists" verdicts **stand**, now on much stronger evidence —
of the 45 template-level subjects (`Email …` / `SMS …`) there is still:
- **no Annual Compliance reminder** template of any kind (TC-07)
- **no Change-Request-Incomplete / resubmission** template (TC-13) — the module has Acknowledgement, Approved and
  Denied only
- **no Voluntary-Deregistration-Denied** template (TC-18) — the module has AcknowledgementLetter, Application
  Incomplete and Application Successful only

## Case detail

### TC-06 — OB confirmation thank-you page (#101833 · TC-14T-006) — PASSED
**Mode:** ai-repair · confirmed on an NPO **we own**
- **Recorded, as the plan requires:** office bearer `tempId = eba499877cad` on **`Nomfanelo_QA_NPO_2026-08-13`** (`333-018-NPO`). The confirmation link came from that OB's own reminder email in the store.
- [PASS] **A thank-you page renders after confirming.** Consent `Yes` → `Submit` → redirect to `/no-auth/boxfusion.dsdnpo/ob-self-verification-thank-you?isSuccess=true`, reading *"Thank You — Should there be any issues the Department of Social Development will be in touch with you…"*
- [PASS] **No unresolved placeholders** on either the consent page or the thank-you page
- [PASS] The consent page resolves the organisation name correctly — *"Do you consent to being an Office Bearer at the Nomfanelo QA NPO 2026-08-13?"* — over a POPIA processing notice
- [N/A] The `RefListDeliveryStatus` step. The plan flags this case as mis-scaffolded — steps 1 and 3 describe dispatching a notification while the expected result describes a **web page**. The page is verdicted; the delivery-status step is not applicable
- ⚠️ **Generic, not personalised** — the page says "Thank You", not "Thank you, {OB Name}". The expected result allows exactly this (*"or generic if not personalised"*), so it passes rather than partials
- 🔑 **The state change was verified, not assumed.** Before submitting, `GetOfficeBearerIdBySubstringId?subStringId=eba499877cad` returned the OB id; afterwards the same call returns **`"Office bearer has already verified themselves"`**. The consent persisted
- 📌 **This settles the dead-host bug's fix.** The link as mailed points at `dsd-npo-publicportal-qa.azurewebsites.net`, which fails `ERR_NAME_NOT_RESOLVED` in the same session. Putting the **identical path and `tempId`** onto `dsd-npo-publicportal-1-qa.shesha.app` works end to end — so the `tempId` is valid and **only the base URL is wrong**. See `../bugs/2026-08-24-ob-reminder-link-host-does-not-resolve.md`
- 📌 Minor: a second click on a used link yields the raw error *"Office bearer has already verified themselves"* rather than a friendly "you have already confirmed" page

### TC-11 — Change Request Acknowledgement (#101838 · TC-14T-011) — BLOCKED
**Mode:** ai-repair · target `POST1042/13/08/2026`, `333-018-NPO`, status **SUBMITED**, Foundational Change
- [PASS] The acknowledgement letter **is** visible on the form — `AcknowledgementLetter.pdf` under Documents, matching the store
- [FAIL] No Correspondence section exists on `change-request-details` v25
- [BLOCKED] UI ↔ store cross-check — no working notification view anywhere in the portal
- 📌 **`Submited` is misspelt in the app itself, not only in the ADO precondition.** The grid's Status column renders the token **`SUBMITED`**. The plan asked for this to be confirmed; it is confirmed.
- ⚠️ The 08-24 verdict of PASS for this case was about *content* (the PDF names the change type and submission date) and is unaffected. What is blocked is the **method-validating cross-check**, which is why this is recorded as BLOCKED rather than downgrading the content verdict.

### TC-12 — Change Request Approved: conditional attachments (#101839 · TC-14T-012) — PASSED
**Mode:** ai-repair · 3 re-issued certificates found on approved change requests
- [PASS] Both branches were already observed on 08-24 (Foundational → cert + constitution; General → OB list)
- [PASS] The **re-issued certificate carries a QR**, so the TC-04 carry-over question is answered rather than assumed:
  - `2026-08-06` → `…?id=5b26e6aa2f3e&npoNumber=333-009-NPO&npoStatus=4`
  - `2026-08-05` → `…?id=2ad8990067ec&npoNumber=000-099-NPO&npoStatus=4`
- [PASS] Both matched their organisation's real register status at issue — the content is right; the structural weakness is the shared one above
- 📌 Extraction note: the QR is a 1300×1300 1-bit `DeviceGray` XObject whose real row stride is **164** bytes, not `ceil(1300/8) = 163`. Using the unpadded stride shears the image and it will not decode.

### TC-16 — Voluntary Deregistration Approved Notice (#101843 · TC-14T-016) — PASSED
**Mode:** ai-repair · all 33 voluntary deregistrations cross-tabbed against their organisation's register status
- [PASS] `VdSuccessful.pdf` attached on 7 of 7 (08-24)
- [PASS] **The state assertion now holds:** every VD at status 5 (approved) has its organisation at
  `NpoOrganisation.Status = 6` — **7 of 7**, and 7 is exactly the number of `VdSuccessful.pdf` emails found on 08-24
- [PASS] Control: all 9 VDs still at status 1 have their organisation at status 4 (Registered) — the transition is not firing early
- [PASS] `Shesha.Core.OrganisationStatus` confirms `4 = Registered`, `6 = Deregistered`
- ⛔ `333-019` was left alone as instructed; the verdict came from existing records
- 📌 Incidental: one organisation carries **4 separate VD applications**, and two VD rows have `npoNumber` = `"1"`

### TC-21 — Appeal Denied + mandatory claim attachment (#101848 · TC-14T-021) — FAILED
**Mode:** ai-repair · 20 denied-appeal notification rows; all 4 947 attachments harvested
- [FAIL] **Not one attachment in the entire store has a filename mentioning "claim"** — 0 of 4 947
- [FAIL] 8 of 10 `Email Denied of Appeal` messages carry only `DeniedOfAppealLetter.pdf`; **2 carry no attachment at all** (both 2025-09-27)
- [FAIL] Reference renders empty — *"with reference has been denied"* (08-24)
- [PASS] **Step 4 is answered: the UI *does* gate it.** `appeal-outcome` v20 has exactly two fields, **both marked required** — `Appeal Result` (Upheld / Denied / Approve) and **`Claim Document`** (upload)
- 🔑 **This sharpens the defect considerably.** The tribunal's claim document is captured — the Denied appeal `APPEAL101/05/08/2026` has one attached to its record — but **the notification never carries it**. So this is a notification-assembly failure, not missing data, and Thabiso's drift note ("not enforced server-side; verify whether UI gates this") is answered: the UI requires it, the server does not, and the notification ignores it.
- 📌 The required marker is unconditional, not conditional on `Denied`, so the gate applies to Upheld outcomes too.

### TC-14-002 — Generated PDFs carry QR + signatures (#101814) — PASSED
- [PASS] (blocking) A QR **is** present — confirmed on 3 separate certificates and decoded in every case
- [PASS] `Directors signature` label present in the certificate text
- ⚠️ **This retracts the 08-18 PARTIAL** ("QR absence corroborated"). That corroboration chained off a `/verify` 404 which was itself a guessed path — two weak signals reinforcing each other. The drift note predicting no QR generation is refuted.

### TC-14D-004 — QR verifies against public record (#107425) — FAILED
- [PASS] (blocking) The QR decodes to a real verification URL — `/no-auth/boxfusion.dsdnpo/npo-certificate-authentication`
- [PASS] The page shows NPO Number, Name, Status and Date Registered, and **no personal information** — the "no extra PII" assertion holds
- [FAIL] It does **not verify against the public record**: the record is fetched but the displayed status comes from the URL
- ⚠️ **The 08-18 rationale is retracted.** "Public `/verify` route = 404, no QR-verify flow" was a 404 on a **guessed** path. The expected result in ADO does say `https://…/verify/…`, so the route naming is a genuine spec mismatch worth raising — but it is not absence.
- 🔑 Both of this case's listed assertions technically pass. It is verdicted FAILED on the case's **intent** — a verification page whose answer can be set by whoever writes the URL does not verify anything. Recorded explicitly so the call can be disagreed with.

### TC-14D-003 — PDF/A + embedded fonts (#107424) — PARTIAL
- [PASS] Fonts fully embedded — 3 × `/FontFile2`, subset-prefixed: `FAAAAI+DejaVuSerif`, `FAAABC+DejaVuSans-Bold`, `FAAABG+DejaVuSans`. No bare base-14 reliance
- [FAIL] **Not PDF/A** — no `pdfaid` marker and no `/OutputIntent`. An XMP packet is present but carries no conformance claim
- ⚠️ `%PDF-1.7`. Full PDF/A-1a conformance still needs a real validator, so PARTIAL as the plan pre-declared

### TC-14-014 — Certificate reflects post-transition status (#101826) — PARTIAL
- [PASS] Registration number correct and **not stale** — the certificate reads `Registration number: 333-009-NPO`, matching both the QR payload and the live register (status 4)
- [PASS] Registration date present — *"entered into the register on 2026/08/04"*
- [FAIL] **No explicit status field** on the certificate to assert "Registered" against; registration is implied by the wording *"meets the requirements for registration"*
- 📌 The certificate cites *"the Nonprofit Organisation Act, 1997"* only. Given the module is governed by the **GLAA amendments, Act No. 22 of 2022**, whether the certificate wording should reference the amended Act is a question for the test lead, not a defect I can call.

## Not covered
Nothing outstanding in 14T. With TC-06 executed, **all 22 cases in suite 14T now carry a verdict** — 21 of them
content verdicts and TC-11 blocked by the audit-screen defect. 14D is likewise complete at 4 of 4.

## Method
- Notification store re-harvested in full with paging (12 requests × 2 000) rather than a single capped call —
  `GET /api/dynamic/Shesha/NotificationMessage/Crud/GetAll` and the matching `NotificationMessageAttachment` listing.
- Certificates pulled via `GET /api/StoredFile/Download?id=<file.id>`; QR images taken from the PDF image XObjects and
  decoded with `jsqr`. Only documents belonging to organisations we created ourselves were opened.
- All browser work driven headed through the project's own Playwright, **with the Live → Latest switch asserted rather
  than attempted** — see below.

## 🔑 A harness fault worth carrying forward
The first pass at TC-11 reported the Correspondence section absent while the header still read **`Live Mode Live`**.
The shared `switchToLatest` helper was clicking before hydration finished, silently returning `false`, and the run was
exercising the **published** form version. The verdict would have been right by luck and wrong in method.

The helper now **waits for the trigger, switches, re-reads it, and throws if it is not `Latest`**. Every verdict in
this report was taken with `view mode: Latest (asserted)` printed in the run log. Recommend the same assertion be
added to `_helpers.ts` for the committed specs — a `.catch(() => {})` around the view-mode switch is a silent
correctness hole, not a convenience.
