# Report: NPO-05-F / NPO-03-F — Documents, submission, read-only and XSS — suite close-out

**Date:** 2026-08-18 07:20 UTC
**Plan:** test-plans/npo-registration/05-wizard-admin-docs-declaration-functional.md
**Execution Mode:** ai-repair
**Result:** FAILED — 8 cases verdicted (5 passed, 2 failed, 1 partial); suites 03 and 05 now fully attempted. Oversized uploads are rejected **invisibly** (CORS-masked), and no submission snapshot is retained
**Duration:** ~2400s
**Cases:** TC-05-009, TC-05-011, TC-05-012, TC-05-017, TC-05-018, TC-05-020, TC-05-023, TC-03-022
**Environment:** QA · public portal **and** admin portal · view mode **Latest** · form `create-npo v62`
**Application under test:** **APPL26-01270** (`50cc1481-e38e-436d-97df-d7bf89d6f984`), NPO
`65c7e886-767a-43b0-8c79-31bfc4679d7c` — Legal Form **Trust**, FY end **June**, National (SA) Gauteng + International
**Cameroon + Bolivia**, 3 office bearers. **Submitted during this run** (deliberately, to unblock TC-05-018/020 and
TC-03-022). Organisation name was changed to an XSS payload as part of TC-03-022.

## Summary
| Total | Passed | Failed | Partial |
|---|---|---|---|
| 8 | 5 | 2 | 1 |

| Case | ADO | Verdict | One-liner |
|---|---|---|---|
| TC-05-009 | #101685 | ⚠️ **PARTIAL** | 50 MB refused, but the refusal is invisible and the UI shows the file as attached |
| TC-05-011 | #101687 | ✅ **PASSED** | Download byte-identical, SHA-256 matches |
| TC-05-012 | #101688 | ✅ **PASSED** | Removal works and re-gates `Next` |
| TC-05-017 | #101693 | ✅ **PASSED** | Back preserves step-5 selections |
| TC-05-018 | #101694 | ✅ **PASSED** | Submitted application is read-only, no Submit control, status shown |
| TC-05-020 | #101696 | 🔴 **FAILED** | No application audit log and **no submission snapshot** |
| TC-05-023 | #101700 | ⚠️ **PARTIAL** | Picker works, but the list is not ISO 3166 and omits SADC neighbours |
| TC-03-022 | #101646 | ✅ **PASSED** | Payload escaped on both portals **and** in the generated PDF |

> ⚠️ TC-05-023 and TC-05-009 are both counted **PARTIAL**: each satisfies its first assertion and fails its second.

## 🔴 Bugs filed from this run
- `bugs/2026-08-18-oversize-upload-rejection-is-invisible-cors-masked.md` — **High**
- `bugs/2026-08-18-submission-date-stamped-at-draft-creation.md` — **Medium-High**
- `bugs/2026-08-18-no-submission-snapshot-or-application-audit-log.md` — **Medium** (confirms Thabiso's own drift note)

## ✅ Bug status change — the office-bearer wipe did **not** reproduce
`bugs/2026-08-14-org-details-resave-deletes-all-office-bearers.md` is a 🔴🔴 blocker that shaped every run's
sequencing ("never revisit Tab 2"). It was retested **explicitly** today, DB-measured immediately before and
immediately after the single action, on **two different applications**:

| Application | Legal form | OBs before | Action | OBs after |
|---|---|---|---|---|
| APPL26-00793 | VA | **1** | `Next` on Organisation Details, nothing changed | **1** (same row id, `isOfficeBearerDeleted:false`) |
| APPL26-01270 | Trust | **3** | `Next` on Organisation Details ×2 | **3** (same three row ids) |

The 08-14 recipe was *exactly* the 1-OB case, so this is a direct non-reproduction, and it is the third counting the
Trust observation on 08-17.

🔑 **The payload has NOT changed** — captured from request #163 this morning, the `CreateAndUpdateApplicationAsync`
body still contains **no office-bearer collection**, only the scalar `officeBearerTerm`:
```
name, shortName, contactMobileNo, emailAddress, whatsappNumber, telephone, incomeTaxNumber,
financialPeriod, physicalAddress, postalAddress, operationProvinces, operationCountries,
isCipcRegNumberVerified, type, itRegistrationNo, npcRegistrationNo, membership,
approvedConstitutionalDate, officeBearerTerm
```
So the **server** no longer empties the absent collection — the fix, if it is one, is server-side.
▶ **Ask Thabiso to confirm a fix went in**, then retire the "never revisit Tab 2" rule. Until he confirms, the bug
file is marked *not reproducing*, not *closed*.

## ⚠️ TC-05-009 — oversized upload: refused, but invisibly (the headline)
A 50 MB PDF (`qa-oversize.pdf`, 52.43 MB on disk) into `Deeds Of Trust File`:

- `PUT /api/StoredFile` → **`net::ERR_FAILED`**, no response body, no status code
- console: **`blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present`** → `AxiosError: Network Error`
- server-side `deedsOfTrustFile` stayed **`null`** — nothing was stored
- the slot nevertheless displayed **`qa-oversize.pdf (52.43 MB)`** as though attached
- **zero** user-visible messages: 0 `.ant-message-notice`, 0 `.ant-notification-notice`, 0 `.ant-form-item-explain-error`
- the only signal was `Next` staying disabled, unexplained
- **retried identically — same result**, so it is not intermittent
- the phantom entry does **not** survive a page refresh

**Assessment.** The size *is* capped somewhere (proxy/Kestrel), so the case's first assertion effectively passes. But
the rejection response carries **no CORS headers**, so the browser blocks it and the SPA can only ever see a generic
network error — it cannot read the 413. **That is the mechanism behind "no size-limit message".** Fixing the CORS
headers on the limit-rejection path is what would let the front-end say "file too large".

✅ **Control:** the same slot accepted a **413-byte** PDF immediately afterwards (`Next` enabled), so this is
size-specific, not a broken upload path.

📌 The file input declares `accept=".pdf"`. That is a **file-picker hint only** — it is not validation, and it does not
contradict the 08-17 finding that a `.exe` was accepted; it does mean a user going through the normal OS dialog is
filtered to PDFs by default unless they switch to "All files".

## ✅ TC-05-011 — download and checksum
| | bytes | SHA-256 |
|---|---|---|
| Uploaded | 413 | `0a12fd4810e0568acca7fad6d1f1cb03da9a7d875617d302d6deb278898f2509` |
| Downloaded | 413 | `0a12fd4810e0568acca7fad6d1f1cb03da9a7d875617d302d6deb278898f2509` |

Served from `/api/StoredFile/Download?id=…` as `application/pdf`. **Checksums match — BLOCKING assertion satisfied.**

📌 Two observations, neither fatal:
1. The response sets **no `Content-Disposition`** header, so the filename comes only from the metadata call.
2. The filename renders as an `<a>` **with no `href`** (JS-only handler) — "open in new tab" and keyboard activation
   will not work. Carry this into suite **14W (accessibility)**.
3. `/api/StoredFile?id=…` returns **metadata JSON**, not the file; `/api/StoredFile/Download?id=…` returns the bytes.
   The `fileId=` parameter name is rejected. Worth knowing before writing the 14D document cases.

## ✅ TC-05-012 — removing a document
Run twice, on an optional slot and on a gating one:
- `Additional Documents File` → confirm dialog *"Delete Attachment — Are you sure you want to delete this attachment?"*
  (Cancel / Yes) → file gone, slot back to `(press to upload)`.
- `Deeds Of Trust File` (mandatory in behaviour) → removed, and **`Next` immediately became disabled again**, so the
  slot genuinely reverts to a required-empty state.

🔴 **But it reverts silently:** with the mandatory slot empty there were **0 error messages** and the slot still carries
**no `*`**. That is the 5th instance of the unmarked-mandatory / silent-block pattern (after Area of Operations,
Objectives `Sector`, the 9 Declaration checkboxes, and the Trust document slots).
📌 The confirm wording here is correct English, unlike the partner-delete dialog which reads *"Are you sure want to
delete this item?"*.

## ✅ TC-05-017 — Back preserves the step
`Charitable` was already selected; `Educational` was added, then `Next` → Documents → `Back`. Both were still ticked.
📌 Two typos in that reference list: **`Vacational Technical Schools`** (Vocational) and
**`Adult Continuiing Education`** (Continuing).
📌 Back-navigation remains harmless — and per the section above, the forward re-save now looks harmless too.

## ✅ TC-05-018 — submitted application is read-only
After submission the dashboard's **Draft Application → Edit/Submit** panel disappears entirely; only *"All Done!"*
remains. Re-opening the wizard URL directly — the bookmark case, and the case's instruction to test read-only by
*attempting* an edit — serves an **application detail view**, not the wizard:

- banner **"Requested action is not available"**
- tabbed read-only summary: Organisation Details · Objectives · Particulars Of Office Bearers · Particulars Of Control
  Structure · NPO Admin and Operations · Area of Operation · Declarations
- every application field renders as **plain text**, not an input
- the **only** editable control on the page is the Comments textarea (legitimate)
- **no Submit control**; status displayed as `APPLICATION IN PROGRESS` + an `IN PROGRESS` chip

All three assertions satisfied. 📌 The header also carries **`HIGH RISK`** and **`COMPULSORY`** classification chips
that we have not seen documented anywhere — worth asking what drives them.

⚠️ **Observation, not a verdict on this case:** an **`OB Compliance`** button renders **enabled** on that page, with
`Verification` disabled beside it. Our account is the shared broadly-privileged developer login that CLAUDE.md warns
about, so this may simply be that account's permissions rather than an applicant-visible control.
**It cannot be settled without a role-scoped applicant user** — the standing dependency.

## 🔴 TC-05-020 — audit trail: FAILED
- **Administration → Audit Logs** is a submenu of exactly three views: **Logon**
  (`/dynamic/Shesha/login-audit-table`), **OTPs** (`/dynamic/Shesha/otp-audit`) and **Notifications**
  (`/dynamic/Shesha/notifications-audit`). There is **no application or entity-change audit view at all**.
- Every entity-history API route probed returned **404**: `EntityChange`, `EntityChangeSet`, `AuditLog`,
  `app/AuditLog/GetAll`, `AuditedEntityChange`, `EntityHistory/GetEntityHistory`.
- What *does* exist is only `FullAuditedEntity`: `creatorUserId 15918`, `creationTime 2026-08-17T12:44:37`,
  `lastModifierUserId 15918`, `lastModificationTime 2026-08-18T07:13:31`, and `submittedBy: Mpendulo ntshangase`.

So assertion 1 (submitter + timestamp) is **partly** met by the record's own audit columns, and the **BLOCKING**
assertion — that a point-in-time snapshot of the submission is retained — **fails outright**.
🔑 This **confirms Thabiso's drift note verbatim** ("explicit state-transition log not verified") and it matters well
beyond this case: **suite 14U's resubmission-diff scenarios have nothing to diff against.**

## 🔴 New defect found while checking the audit fields — `submissionDate` is wrong
`submissionDate` reads **`2026-08-17T12:44:37.53`**, identical to `creationTime`. The application was actually
submitted **today at 07:13 UTC** (`lastModificationTime` proves it). So **`submissionDate` is stamped when the draft is
created, not when it is submitted** — here it is a full day early, and for a long-lived draft it could be months out.
Consequences: any SLA/turnaround reporting is wrong, and the `NineMonthsAfterFYE` / `ThirtyDaysAfterIncomplete` timers
in suite 08 may be computed from a meaningless date.
📌 `applicationSubmitterName` is **`null`** — the hidden *Name of submitter* field is never populated server-side either.

## ⚠️ TC-05-023 — country picker
The picker opens and lists countries (assertion satisfied), server-paged at 10, substring search. But:
- **108 entries total** — ISO 3166 has ~195 sovereign states, so this is a curated list, **not** ISO 3166
- **absent:** Botswana · Lesotho · Eswatini/Swaziland · Angola · Egypt. Three of those are **SADC neighbours** — an NPO
  operating in Lesotho or Botswana literally cannot record it
- **`Cryprus`** is misspelt, and correctly-spelled *Cyprus* is **not** present, so it is the only entry, not a duplicate
- searching `Botswana` returns an **empty dropdown with no "no results" message**

## ✅ TC-03-022 — XSS: PASSED, and it closes suite 03
Payload `<script>alert(1)</script>QA XSS NPO` (35 chars) entered as the Organisation Name.

| Sink | Result |
|---|---|
| Field validation | Accepted, no error, `Next` enabled |
| **Storage** | Stored **raw and unescaped**: `name = "<script>alert(1)</script>QA XSS NPO"` |
| Public portal landing view | ✅ escaped — 0 injected `<script>` elements, renders as literal text |
| Public application detail view | ✅ escaped — 0 injected elements |
| **Admin portal** application view | ✅ escaped — 0 injected elements, 0 raw tags, renders as literal text |
| **Generated PDF** (`AppAcknowledgementLetter.pdf`, 108 006 B) | ✅ inert literal text |

Both BLOCKING assertions pass. The PDF content stream shows the payload as a text-showing operator with the
parentheses correctly PDF-escaped, so the generator neither executed nor corrupted on it:
```
[(<script>alert\(1\)</script>QA XSS NP)1(O)] TJ
```

⚠️ **Worth carrying into suite 14Z (Security).** The value is stored **raw**; the app is safe only because React
escapes on output and the PDF generator escapes for PDF syntax. Any future consumer that does *not* escape — an HTML
email, a CSV/Excel export, a report renderer, a `dangerouslySetInnerHTML` — becomes a live sink. The stored-XSS risk
is latent, not absent.

## Observations for the test lead
1. **Ask Thabiso to confirm the office-bearer wipe was fixed** (server-side, payload unchanged). It governs how every
   run is sequenced.
2. **`submissionDate` is stamped at draft creation** — confirm intended, and check whether the suite-08 compliance
   timers depend on it.
3. **No submission snapshot exists.** Suite 14U (resubmission diff) cannot be executed as written until there is one.
   Is a snapshot planned, or should the 14U cases be rewritten?
4. **The country list omits Botswana, Lesotho and Eswatini.** Who owns that reference list, and is it meant to be full
   ISO 3166? Also `Cryprus` is misspelt.
5. **What drives the `HIGH RISK` / `COMPULSORY` chips** on the application header?
6. **Still blocked on role-scoped users** — an applicant account and a DSD-staff account. Until then we cannot say
   whether the `OB Compliance` button is exposed to applicants, and the whole of suite 14Z authz stays untestable.
7. Reference-list typos to fix: `Vacational`, `Continuiing`, `Cryprus`, and the partner-delete dialog's
   *"Are you sure want to"*.

## 📸 Evidence — `test-reports/2026-08-18/evidence/`
| File | Shows |
|---|---|
| `v1-office-bearer-survives-tab2-resave.png` | OB grid `1-1 of 1 items` after the Tab-2 re-save |
| `v2-doc-removed-next-silently-disabled.png` | Mandatory slot emptied → `Next` disabled, no `*`, no message |
| `v3-50mb-shows-attached-but-not-saved.png` | `qa-oversize.pdf (52.43 MB)` displayed while not stored |
| `v4-country-picker-botswana-absent.png` | `Botswana` typed → empty dropdown, no "no results" |
| `v5-submit-enabled-with-blank-submitter-name.png` | Submit enabled at 9/9 with the submitter name blank |
| `v6-xss-payload-escaped-as-text-public.png` | Payload as literal text on the public portal |
| `v7-submitted-app-readonly-detail-view.png` | Read-only detail view + "Requested action is not available" |
| `v8-ack-letter-xss-as-literal-text.pdf` | The generated acknowledgement letter itself |

## Method notes
- 🔑 **Read the browser console before calling a failure silent.** The 50 MB rejection was reported here first as
  "no error anywhere"; the actual CORS message was in the console the whole time. A DOM query for AntD message nodes
  is not sufficient evidence of silence.
- 🔑 **Screenshots must be opened, not just captured.** `v3` was saved and not read; reading it later is what corrected
  the TC-05-018 write-up from "serves an editable triage form" to "serves a read-only detail view".
- 🔑 The Playwright MCP tool signature changed: `ref` → **`target`**, and `browser_fill_form` now requires
  `target` + `element` per field.
- 🔑 A draft is resumable by URL: `/shesha/workflow-action?id=<applicationId>&todoid=<workflowDraftItem.id>`, with the
  todo id from `Shesha.Workflow/WorkflowDraftItem/Crud/GetAll?filter={workflowInstanceId == applicationId}`.
- 🔑 API filters: `applicationNo` is an **int** (filtering it with a string 500s) and `referenceNumber` is null — the
  display ref lives in **`refNumber`**, and it is stored with a **leading space** (`" APPL26-01270"`), which
  corroborates the untrimmed-whitespace defect found in office-bearer names. Use `quickSearch=` to find by ref.
- 📌 The previously recorded ref `APPL26-01216` for application `50cc1481-…` was **wrong in my notes** — the record has
  read `APPL26-01270` since 08-17. Not a defect; corrected.
- 📌 MCP screenshots resolve relative to the **repo root**, which is where the ~131 stray PNGs came from.
