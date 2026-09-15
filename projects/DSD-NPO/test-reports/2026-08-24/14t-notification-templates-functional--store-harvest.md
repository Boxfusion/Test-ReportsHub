# Report: NPO-14T-F — Notification Template Content Verification (functional)

**Date:** 2026-08-24 13:00 UTC
**Plan:** test-plans/cross-cutting/14t-notification-templates-functional.md
**Execution Mode:** ai-repair
**Result:** FAILED — 5 passed, 11 failed, 5 partial, 1 not executed of 22; a 🔴 **Critical anonymous-document-download** finding and a **dead-host OB reminder firing every working day** are the headlines. ⚠️ **Revised 17:10 after opening the PDFs — four verdicts corrected in the app's favour and one headline claim retracted; see "Second pass".**
**Duration:** ~2700s
**Cases:** TC-01, TC-02, TC-03, TC-04, TC-05, TC-06, TC-07, TC-08, TC-09, TC-10, TC-11, TC-12, TC-13, TC-14, TC-15, TC-16, TC-17, TC-18, TC-19, TC-20, TC-21, TC-22
**Environment:** QA · admin portal · view mode Latest · store harvested 2026-01-13 → 2026-08-24
**Accounts used:** `mpenduloizwelinuk@gmail.com` (shared dev login, admin portal)

## Summary
| Total attempted | Passed | Failed | Partial | Not executed |
|---|---|---|---|---|
| 22 | 5 | 11 | 5 | 1 |

⚠️ **First pass (store only) read 2 / 14 / 5 / 1.** A second pass opened the attached PDFs and corrected **TC-02 and
TC-11 to PASS, TC-04 to PASS, TC-01 to PARTIAL**, and retracted the "no deadline anywhere" headline. The reason is
worth carrying forward: **these emails are deliberately thin covering notes, and the substance lives in the attached
letter** — exactly as each body says (*"The attached document(s) will specify…"*). Verdicting template content from
the email body alone is not sound. See **Second pass** below.

| Case | ADO | Verdict | One-liner |
|---|---|---|---|
| TC-01 App Acknowledgement | #101828 | ⚠️ PARTIAL | PDF carries Ref, **NPO name and submission date**; only the **OB list** is absent *(was FAIL on the email body alone)* |
| TC-02 App Incomplete | #101829 | ✅ PASS | The PDF carries all five: Ref, NPO name, itemised reasons, what to amend, **and an explicit 30-day deadline** *(was FAIL)* |
| TC-03 App Unsuccessful | #101830 | 🔴 FAIL | PDF has four itemised denial reasons + contact details, but **no appeal rights and no 30-day appeal window** |
| TC-04 App Successful + 4 docs | #101831 | ✅ PASS | Attachment set + Reg No correct **and the certificate DOES carry a QR code** — drift note refuted. *(4 of 46 lacked a constitution — logged separately)* |
| TC-05 OB self-confirm request | #101832 | 🔴 FAIL | Addressed **"Dear Not Verified"**; **no expiry note**. Links are unique per OB |
| TC-06 OB thank-you page | #101833 | ⚪ NOT EXECUTED | Deliberately not run — needs confirming a live OB association |
| TC-07 Annual reminder (FYE−1mo) | #101834 | 🔴 FAIL | **No annual-compliance reminder template exists in the store at all** |
| TC-08 Annual Ack | #101835 | 🔴 FAIL | **0 of 3 named fields** — no report number, no year, no OB list |
| TC-09 Annual Successful | #101836 | ✅ PASS | NPO, financial year and outcome present; PDF attached (1 of 8 lacked it) |
| TC-10 Annual Non-Compliant | #101837 | 🔴 FAIL | **The only incomplete letter with no deadline** (its siblings state 30 days); NonCompliant **promises an attachment it never carries (3/3)** |
| TC-11 CR Acknowledgement | #101838 | ✅ PASS | PDF names the **change type** ("Foundational Change") **and the submission date** *(was FAIL)*; UI cross-check still not performed |
| TC-12 CR Approved + docs | #101839 | ✅ PASS | **Both branches observed** — Foundational ships cert+constitution, General ships the OB list |
| TC-13 CR Incomplete | #101840 | 🔴 FAIL | **No CR-incomplete/resubmission template found** in 2 521 messages |
| TC-14 CR Declined | #101841 | ⚠️ PARTIAL | Blocking assertion **passes** — no cert/constitution; body has a typo and a **dropped NPO name** |
| TC-15 VD Acknowledgement | #101842 | 🔴 FAIL | DER ref + PDF present; **type of severance never referenced** |
| TC-16 VD Approved | #101843 | ⚠️ PARTIAL | Notification and PDF correct; the **`NpoOrganisation.Status` assertion was not verified** |
| TC-17 VD Incomplete + 30-day | #101844 | 🔴 FAIL | **No 30-day clock mentioned** |
| TC-18 VD Denied + investigation | #101845 | 🔴 FAIL | **No VD-Denied template exists**; cross-module investigation trigger unproven |
| TC-19 Appeal Initiation Ack | #101846 | 🔴 FAIL | Template **does** exist (not blocked) — but **carries no appeal reference** |
| TC-20 Appeal Upheld | #101847 | ⚠️ PARTIAL | Full re-issued certificate set attached; **no distinct reinstatement letter** |
| TC-21 Appeal Denied + claim | #101848 | 🔴 FAIL | **No tribunal claim attachment**; reference renders empty |
| TC-22 SMS 160-char | #101849 | ⚠️ PARTIAL | Segmentation is clean, but **22 of 24 SMS templates exceed 160 units** (worst 583 = 4 segments) |

## Method actually used
Harvested the whole Shesha notification store and verified template content against the ADO field lists:

```
GET https://dsd-npo-api-qa.shesha.app/api/dynamic/Shesha/NotificationMessage/Crud/GetAll
GET https://dsd-npo-api-qa.shesha.app/api/dynamic/Shesha/NotificationMessageAttachment/Crud/GetAll
```

- **2 521 messages** (2026-01-13 → 2026-08-24) across **132 distinct subjects**, and **4 941 attachment rows**, joined on message id.
- 🔑 **Two corrections to the recorded technique, for next time:**
  1. The API is on a **separate host** — `https://dsd-npo-api-qa.shesha.app`, not the portal origin. A relative `/api/...` call from the admin portal returns the SPA's HTML, not JSON.
  2. The body field is **`message`**, not `body`. The plan said `body`; it does not exist on the entity.
- `status` mapping confirmed as recorded (`1` = Sent, `8` = Failed) — and a **third value, `16`**, appears on 2 rows. Unknown; worth asking about.
- ⚠️ **The delivery picture is not "all SMS fails".** 195 SMS rows carry `status: 1`. The Vodacom credit failure is real but **partial**, so "no SMS can pass on QA" is too strong a claim to keep repeating — quote the per-template split instead.

## Second pass — the PDFs, 2026-08-24 17:10
The first pass verdicted from the notification store only and flagged "no PDF was opened" as its main gap. That gap is
now closed for 9 documents, and it changed the picture.

**How they were fetched:** `GET https://dsd-npo-api-qa.shesha.app/api/StoredFile/Download?id=<file.id>`, joining
`NotificationMessageAttachment` rows to their messages. Text extracted by inflating the PDF content streams; images
extracted from the image XObjects.

### 🔴🔴🔴 CRITICAL — the documents came down with no authentication at all
Bug: `bugs/2026-08-24-generated-documents-downloadable-anonymously.md`

While fetching attachments I found that **`StoredFile/Download` and the attachment listing both answer anonymous
callers.** Two requests, no token, no cookies:

1. `GET …/api/dynamic/Shesha/NotificationMessageAttachment/Crud/GetAll?maxResultCount=1` → `200`,
   **`totalCount: 4947`**, and every row exposes its `file.id`.
2. `GET …/api/StoredFile/Download?id=<file.id>` → `200`, `application/pdf`, full document.

Control in the same breath: `Session/GetCurrentLoginInfo` with credentials omitted returns **`user: null`**. And 8 of
these letters were pulled with **plain `curl`** — no browser, no session.

That means **registration certificates, lists of office bearers with full names and positions, signed constitutions,
denial letters and compliance letters are retrievable by anyone.** This escalates
`bugs/2026-08-18-api-reachable-without-authentication.md` from "anonymous row counts" to "anonymous finished
documents about identifiable people". **It outranks the dead-host reminder as the most serious finding of the day.**
I stopped at a count plus documents belonging to **NPOs we created ourselves**; no third party's data was retrieved.

### ✅ The certificate DOES carry a QR code — the drift note is refuted
Evidence: `evidence/certificate-qr-code.png`

`RegistrationCertificate.pdf` for `333-022-NPO` contains **5 image XObjects, one of them 1300×1300, 1 bit per pixel,
DeviceGray, compressing to 2 145 bytes**. Extracted and rendered, it is unmistakably a QR code — three finder
patterns, alignment pattern, timing patterns.

This **refutes three things we had on record:**
- The ADO drift note: *"QR code generation NOT found — PDF likely WITHOUT QR. Expect to FAIL on QR-presence check."*
- My own first-pass TC-04 entry, which marked the QR `[SKIP]` and said 14D's `/verify` 404 and the drift note "both
  point to absent".
- **14D's TC-14D-002 PARTIAL**, which recorded the QR's absence as *"corroborated"*. That corroboration was invalid
  and **suite 14D needs re-verdicting** — the live-cert visual it deferred is now available.

⚠️ **What is still unresolved:** the QR's *payload*. I have no decoder offline, and the PDF carries **zero `/URI`
annotations**, so the QR is the only machine-readable pointer and nothing in the file reveals its target. Since the
public `/verify` route is **404** (14D TC-14D-004), the live question is now much sharper than "is there a QR":
**does the QR point at a route that does not exist?** Scanning the PNG with a phone answers it in seconds.

### ⚠️ RETRACTED — "no deadline is ever communicated to anyone"
The first pass made this a systemic headline across TC-03, TC-10 and TC-17. **It is wrong**, and the correction is
the opposite of a nitpick — two of the three letters state the deadline plainly:

| Letter | Deadline in the PDF? |
|---|---|
| `AppIncompleteLetter.pdf` (TC-02) | ✅ *"the organisation has been given **30 days from date of issue** to submit corrected documents to comply with this notice. Failure to comply with this notice will assume that you are no longer intending to lodge your application"* |
| `DenialLetter.pdf` (TC-14) | ✅ *"the organisation has been given **30 days from the date of issue** to submit corrected documents"* |
| `AnnualComplianceIncomplete.pdf` (TC-10) | 🔴 **No deadline at all** — *"Please log on to the online platform … Resubmit."* |

So the finding is not systemic; it is **one letter**. `AnnualComplianceIncomplete` is the outlier, and its two
siblings are the proof that the wording exists and was simply not applied there.

📌 **TC-03 is a different miss and survives.** `ApplicationUnsuccessfulLetter.pdf` gives **four itemised, substantive
denial reasons (a–d)** plus a referral with the Registrar of Friendly Societies' postal address and phone number — so
"no denial reasons" was also too harsh. But it contains **no appeal rights and no 30-day appeal window**, which is
what the ADO case asks for. ⚠️ My keyword scan flagged "appeal" as present in this PDF; that match was the **NPO's own
name** (`Nomfanelo QA Appeal NPO 2026-08-20`), not appeal-rights text. Verdict stands as FAIL, on narrower grounds.

### The letters carry what the emails omit
The pattern behind all four corrections: **the emails are deliberately thin covering notes and the letter carries the
substance**, exactly as every body promises (*"The attached document(s) will specify…"*). Concretely:

| Case | Absent from the email | Present in the PDF |
|---|---|---|
| TC-01 | NPO name, submission date | ✅ *"Reference number: APPL26-01555 … Test ID Verification … received on: 2026/08/24"*. **OB list still absent** → PARTIAL |
| TC-02 | reason detail, what to amend, deadline | ✅ named non-confirming office bearers, per-item reasons, and the 30-day clause → **PASS** |
| TC-11 | change type, submission date | ✅ *"ACKNOWLEDGEMENT OF **FOUNDATIONAL CHANGE** REQUEST … received on: 13/08/2026"* → **PASS** |
| TC-04 | — | ✅ QR present; `ListOfOfficeBearersLetter.pdf` carries real names and positions (Treasurer / Secretary / Chairperson) |

🔑 **Lesson for the next content suite: never verdict a template from the email body alone when the body defers to an
attachment.** Four of 22 verdicts were wrong for exactly that reason.

### Small defects found in the PDFs themselves
- **`DenialLetter.pdf`: "APPLICATION FOR FOUNDATIONAL CHANGE **CHANGE** REQUEST"** — the change type is
  interpolated in front of a hard-coded "CHANGE REQUEST", duplicating the word.
- **`AppIncompleteLetter.pdf` uses `NPOInquiry@dsd.gov.za`** where every other letter uses **`npoenquiry@dsd.gov.za`**
  — *Inquiry* vs *enquiry*, so one of the two addresses is likely wrong.
- **`AppIncompleteLetter.pdf` has a broken relative link** — `/URI (../www.npo.gov.za)` instead of an absolute URL.
- **Telephone inconsistency recurs inside the PDFs**: `(012) 312 7900` on the acknowledgement/incomplete/annual
  letters, `(012) 312 7500` on the unsuccessful/denial letters.
- *"The office bearers which **have not confirm** their association"* — grammar, in `AppIncompleteLetter.pdf`.

---

## 🔴🔴 Headline — every OB Acknowledgement Reminder link is dead, and the job is still running
Bug: `bugs/2026-08-24-ob-reminder-link-host-does-not-resolve.md`

`Office Bearer Acknowledgement Reminder` (**202 email + 202 SMS**, 2026-02-02 → **2026-08-24**) points every confirmation link at:

```
https://dsd-npo-publicportal-qa.azurewebsites.net/no-auth/boxfusion.dsdnpo/ob-self-verification?...
```

**That host does not resolve** — `net::ERR_NAME_NOT_RESOLVED`. Control check in the same session: `dsd-npo-adminportal-qa.shesha.app` loads normally, so this is the hostname, not the network.

The sister template proves it is a missed migration, not a design choice. `Registration Application OfficeBearerRegistry` was moved to the live host on **2026-08-04**:

| Template | Host | Window |
|---|---|---|
| OfficeBearerRegistry | `dsd-npo-adminportal-qa.shesha.app` | 2026-08-04 → 08-24 (224 msgs) |
| OfficeBearerRegistry | `linux-dsd-npo-adminportal-qa.azurewebsites.net` | 2026-02-17 → 08-04 (109) |
| OfficeBearerRegistry | `linux-dsd-npo-adminportal-**prod**.azurewebsites.net` | 2026-01-13 → 02-17 (56) |
| **Acknowledgement Reminder** | **`dsd-npo-publicportal-qa.azurewebsites.net`** | **2026-02-02 → 08-24 — never migrated** |

Impact: an office bearer who acts on the **reminder** rather than the original notification cannot confirm their association at all. OB self-confirmation gates the application, so this stalls registrations silently — the sender sees `status: 1` (dispatched) throughout. The reminder fired **at 00:01 today**.

### 🔑 Corroborated from the recipient side, and the trigger decoded
The tester receives these reminders directly, at **02:01 SAST** — exactly the store's 00:01 UTC send time. That settles something the store alone could not: on this template `status: 1` means **actually delivered**, not merely dispatched.

Aggregated to the tester's mailbox the cadence is **every working day** — Thu 08-20 (1 email), Fri 08-21 (1), Mon 08-24 (2) — and the onset is a clean **7 days after the office bearer was added**, three for three (`…08-13`→08-20, `QA_Smoke…08-14`→08-21, `…Annual…08-17`→08-24).

So the mechanism is **OB added → wait 7 days → remind every working day → forever**, since the dead link means the confirmation can never complete and the condition never clears. **It compounds**: Monday's count doubled as the Annual NPO hit its 7-day mark, so every NPO registered here permanently adds another 02:01 email per working day.

⚠️ **My first pass reported this per NPO** ("2 fire-days for one, 1 for the other") and read it as contradicting the tester's "every day". The per-NPO split hid the pattern — aggregated to the mailbox, the tester was right. Some recipients have been on this loop for **6½ months** (one colleague's address: 10 distinct days, 2026-02-05 → 08-18).

Store completeness was verified before drawing this conclusion: 1 533 rows since 2026-08-01 matches the API's own `totalCount`, 2 521 distinct ids, no duplicates.

📌 Also worth flagging on its own: until 2026-02-17 the QA environment was sending links to a **prod** hostname.

## 🔴 Systemic — merge fields drop out of four different modules
One pattern, four surfaces. Each is a missing reference or name the recipient needs:

| Where | Renders as | Rows | Latest |
|---|---|---|---|
| Case assignment (investigations/CRM) | *"the case with reference number `<br><br>` has been assigned"* — and the **subject** becomes `": Non-Compliance to NPO Act"` | 5 | 2026-08-06 |
| `Email Denied of Appeal` | *"The Appeal for … **with reference** has been denied"* | 8 | 2026-08-07 |
| `Email Notice of Appeal` | *"the appeal for … **with reference** has been assigned to a tribunal"* | 8 | 2026-08-07 |
| `Email Denied Post Registration` | *"the Post Rgistration change submission **for** has been unsuccessful"* — NPO name dropped | 11 | 2026-08-07 |

Bugs: `bugs/2026-08-24-appeal-and-case-letters-omit-their-reference-number.md`,
`bugs/2026-08-24-denied-post-registration-letter-drops-npo-name.md`

This is what fails TC-19 and TC-21 — not the absence of the appeals templates the plan predicted, but the **presence** of templates that omit the one identifier the case asks for.

## 🔴 Case-assignment emails link to `localhost:3000`, through a malformed anchor
Bug: `bugs/2026-08-24-case-assignment-email-links-to-localhost.md`

**54 emails** — spanning 2026-02-18 → **2026-08-20** — contain `https://localhost:3000/...` links. Templates affected include `Auth Person Link`, `Appeal outcome`, `Appeal Status`, `Application Outcome`, `Application Status`, `Post Registration Outcome`, `Compliance Status` and `Voluntary Deregistration Status`.

The anchor is also malformed. Raw body, 2026-08-06:

```
Hi <name>,
 Kindly note that the case with reference number <br><br> has been assigned to you.Please log on to
 the system to view details and resolve the item. a href=\"https://localhost:3000/dynamic/
 Boxfusion.ServiceManagement/case-request-details?id=…\">: Non-Compliance to NPO Act</a>
```

The opening `<` is missing and the attribute quotes are backslash-escaped, so the recipient sees the raw `a href=\"…\">` as visible text with a stray `</a>` — the link is not clickable *and* would not work if it were.

## 🔴 An NPO name is interpolated into notification links without URL-encoding
Bug: `bugs/2026-08-24-npo-name-not-url-encoded-in-notification-links.md`

An organisation registered as `<script>alert(1)</script>QA_XSS_NPO` propagates into notifications. In today's reminder the link ends:

```
…&tempId=efa4adbd2b74&npo=&lt;script&gt;alert(1
```

Two separate problems: the value is placed in a query string **unencoded**, and it **truncates the URL** at the `)`. In the email *body* the payload is HTML-escaped, so nothing executes there — I am not claiming stored XSS in the email. The open question is what the landing page does with an unencoded `npo` parameter, which belongs to **14Z**, not here. 19 rows across 4 templates carry script-ish markup, latest **2026-08-24**.

📌 That the registration form accepted that NPO name at all is an input-validation question for suite 03/14Z.

## 🔴 TC-22 — SMS templates are 2–4 segments, none of them one
**22 of 24** distinct SMS templates exceed a single 160-character GSM-7 segment:

| Units | Segments | Template |
|---|---|---|
| 583 | 4 | SMS Office Bearer Acknowledgement Reminder |
| 581 | 4 | SMS Annual Compliance NonCompliant |
| 409 | 3 | SMS Registration Application OfficeBearerRegistry |
| 397 | 3 | SMS Upheld Appeal |
| 383 | 3 | SMS Voluntary Deregistration AcknowledgementLetter |
| 345 | 3 | SMS Approved Post Registration |
| 334 | 3 | SMS Post Registration |
| 274 → 167 | 2 | 15 further templates |

**The segmentation half passes cleanly:** all 591 URL-bearing SMS retain an intact `tempId`, so nothing is truncated mid-link, and no SMS body contains a placeholder. All bodies are pure GSM-7 — no smart quote or em dash forcing the 70-character UCS-2 limit.

So this is a **cost and readability** finding, not a breakage: every operational SMS bills as 2–4 messages. Verdict is PARTIAL because **the ADO expected result is truncated mid-sentence after *"either"*** — I applied the 160/153 GSM-7 standard and am flagging the case for completion rather than inventing the missing half.
Bug: `bugs/2026-08-24-all-sms-templates-exceed-one-segment.md`

## 🔴 The Non-Compliant letter promises an attachment it never has
Only **6 emails** in the entire store promise an attachment and have none — and **3 of those are all 3** `Email Annual Compliance NonCompliant` rows (2026-08-06/07). The body opens *"Kindly find the attached document/s for your attention"* and the attachment table has no row for it. The remaining 3 are one-off May incidents on Annual Successful/Incomplete.

⚠️ I first read the coverage ratios (Annual Ack 36/42, Successful 7/8, Incomplete 14/16) as an intermittent attachment failure. That was wrong — those bodies do not promise an attachment, so their absence is not a defect. The real finding is one template failing 100% of the time.
Bug: `bugs/2026-08-24-noncompliant-letter-promises-absent-attachment.md`

## 🔴 Three templates that should exist, do not
Absent from 2 521 messages across 132 subjects:
- **Annual Compliance reminder** (TC-07) — no reminder template of any kind. This **corroborates the drift note** (*"'1 month before FYE' timer NOT implemented"*) from the data side: not merely the wrong timing, but nothing firing.
- **Change Request Incomplete / resubmission** (TC-13) — 71 CR acknowledgements exist, no incomplete variant.
- **Voluntary Deregistration Denied** (TC-18) — Acknowledgement, Successful and Incomplete all exist; Denied does not. So the cross-module investigation reference the drift note doubted has no template to appear in.

⚠️ Absence in the store is not proof the status was never exercised. For each, the honest verdict is *no template observed*, and the follow-up is whether that status has ever been driven on QA.

## 🔑 What TC-04 and TC-12 got right
Not everything failed, and the attachment engine is the strong part:

- **TC-04** ships the prescribed set — `ApplicationSuccessLetter` + `RegistrationCertificate` + `ListOfOfficeBearersLetter` + a constitution — and the **Reg No matches** (`333-022-NPO` in the 2026-08-20 letter). The count runs to 5–6 for Trusts and Companies (`Stamped Deed Of Trust`, `Stamped Letter Of Authority`, `Stamped Certificate Of Incorporation`, `Stamped Memorandum Of Incorporation`), which is **richer than the case's "4 attachments"** and looks correct by entity type — the case wording is what needs widening. But **4 of 46 carried only 3 files with no constitution at all**, which is a real gap.
- **TC-12 passes both branches**, which the plan expected to be PARTIAL: 12 emails carry `ApprovalLetter + ListOfOfficeBearerLetter` (GeneralChange) and 3 carry `ApplicationMembershipConstitution + ApprovalLetter + RegistrationCertificate` (FoundationalChange). Both conditionals are satisfied.
- **TC-14's blocking assertion passes** — `Email Denied Post Registration` attaches `DenialLetter.pdf` and **nothing else**. A declined change request does not ship a certificate.
- **TC-20** attaches a complete re-issued certificate set on an upheld appeal.

## Content-quality cluster (low severity, high visibility)
Observation note: `observations/2026-08-24-notification-template-copy-defects.md`

1. **"National Departmet of Social Development"** — *Departmet* misspelt, in at least 8 templates including both registration acknowledgement letters.
2. **Wrong website domain in two templates.** Most letters say `www.npo.gov.za`; `Registration Application Unsuccessful` and `Registration Application Successful` say **`www.npo.org.za`**. One is wrong, and it is on the two letters that matter most.
3. **Literal bracket markup leaking through** — `[( www.npo.gov.za )]` and `[(www.npo.org.za)]` render as-is to the recipient.
4. **"Post Rgistration"** misspelt in `Email Denied Post Registration`.
5. **Inconsistent switchboard number** — `(012) 312 7900` in some templates, `(012) 312 7500` in others.
6. **Nothing is personalised.** Every letter opens *"Dear Chairperson"* or *"Dear Sir/Madam"*, and the one template that does personalise renders **"Dear Not Verified"**.

## The 30-day promise — inverted from what the plan expected
The plan flagged that TC-03, TC-10 and TC-17 all promise a 30-day window that 11P's drift note says is unenforced, and predicted the risk was a promise without enforcement. **The data says the opposite:** none of the three letters mentions a deadline at all. Registration-Incomplete, Annual-Incomplete and VD-Incomplete each tell the recipient to resubmit and give them **no date**.

That lines up with suite 07's TC-07-019 (*no SLA or due-date shown anywhere* in the admin UI). So the gap is consistent on both sides of the fence: **no deadline is communicated to anyone, ever.** One finding, five cases touched.

## Step Results

### TC-01 — Application Acknowledgement Letter content correct
**Mode:** ai-repair (store harvest) · 104 emails, newest 2026-08-24 09:35
- [PASS] APP Reference Number present — `APPL26-01555`
- [PASS] `AppAcknowledgementLetter.pdf` attached on 102 of 104
- [PASS] No unresolved placeholders in subject or body
- [PASS] Delivery tracked — `status: 1`
- [PASS (2nd pass)] NPO Name present **in the PDF** — *"The Chairperson / Test ID Verification"*
- [PASS (2nd pass)] Submission date present **in the PDF** — *"received on: 2026/08/24"*
- [FAIL] **OB list absent** from both the email body and the PDF — the one field that genuinely is missing
- ⚠️ The first pass failed all three on the email body alone. The case says *"Open the generated email **and any PDF attachment(s)**"*; the PDF carries two of them. Verdict corrected FAILED → **PARTIAL**.
- [SKIP] "chairperson **and** submitter" — recipient split not verified for this template
- 📌 The attachment is named `AppAcknowledgementLetter.pdf`, not the case's literal `Application Acknowledgement.pdf`. Treating that as descriptive, not a defect.

### TC-02 — Application Incomplete Letter content correct
**Mode:** ai-repair · 65 emails, newest 2026-08-18
- [PASS] APP Ref present — `APPL26-00143`
- [PASS] `AppIncompleteLetter.pdf` attached on 65 of 65
- [PASS] Resubmission instruction present
- [PASS] No unresolved placeholders
- [PASS (2nd pass)] **Deadline present in the PDF** — *"the organisation has been given 30 days from date of issue to submit corrected documents to comply with this notice. Failure to comply with this notice will assume that you are no longer intending to lodge your application"*
- [PASS (2nd pass)] NPO Name present in the PDF — *"…(ACT NO.71 OF 1997): Test Unsuccessful 04"*
- [PASS (2nd pass)] **Reason and what-to-amend present and itemised** — names the office bearers who have not confirmed their association, with a per-item reason for each failed check
- ⚠️ Verdict corrected FAILED → **PASS**. All five prescribed elements are present once the attachment is opened.
- [PARTIAL] Reason is generic (*"incomplete information and/or missing documents"*); specifics are deferred to the PDF, which this run did not open

### TC-03 — Application Unsuccessful (Denied) Letter content correct
**Mode:** ai-repair · 24 emails, newest 2026-08-20
- [PASS] APP NO present — `APPL26-01494`
- [PASS] Contact info present
- [PASS] `ApplicationUnsuccessfulLetter.pdf` attached on 24 of 24
- [PASS (2nd pass)] **Denial reasons present and substantive** — the PDF gives four itemised paragraphs (a–d) citing Chapter 1 of the NPO Act, the public-benefit test, the specific constitutional provision at fault, and a referral to the Friendly Societies Act
- [PASS (2nd pass)] Contact info present — Registrar of Friendly Societies, postal address and telephone
- [FAIL] **No appeal-rights information** — confirmed in the PDF too
- [FAIL] **No 30-day refusal-appeal window** — confirmed in the PDF too
- ⚠️ A keyword scan appeared to find "appeal" in this PDF; that match was the **NPO's own name** (`Nomfanelo QA Appeal NPO 2026-08-20`), not appeal-rights text. Verdict stays **FAILED**, on narrower and better-evidenced grounds than the first pass claimed.
- 🔑 Corroborates the tester's note that this email carries **no appeal link** — and it carries no appeal *rights* either.

### TC-04 — Application Successful + Certificate + Constitution + OB list
**Mode:** ai-repair · 46 emails, newest 2026-08-20
- [PASS] Reg No present and matches — `333-022-NPO`
- [PASS] Prescribed attachment set present on 42 of 46
- [PASS] No unresolved placeholders
- [PASS (2nd pass)] **The certificate DOES carry a QR code.** `RegistrationCertificate.pdf` holds a 1300×1300, 1-bit DeviceGray image (2 145 bytes compressed); extracted and rendered it shows three finder patterns, an alignment pattern and timing patterns. Evidence: `evidence/certificate-qr-code.png`
- [PASS (2nd pass)] Certificate text confirms NPO name, *"entered into the register on 2026/08/20"* and *"Registration number: 333-022-NPO"*
- [PASS (2nd pass)] `ListOfOfficeBearersLetter.pdf` carries real names against positions (Treasurer / Secretary / Chairperson)
- [FAIL] **4 of 46 carried only 3 attachments — no constitution**
- ⚠️ **The drift note is refuted**: *"QR code generation NOT found — PDF likely WITHOUT QR"* is wrong. So is my first-pass SKIP, and so is **14D TC-14D-002**, which recorded the QR's absence as "corroborated" — 14D needs re-verdicting.
- ⏸ **The QR payload is still undecoded** (no decoder offline; the PDF has zero `/URI` annotations). Since the public `/verify` route 404s, the open question is whether the QR points at a route that does not exist. Scanning the PNG answers it.
- Verdict corrected PARTIAL → **PASS**.
- 📌 5–6 attachments for Trusts/Companies is correct by entity type; the case's "4" is too narrow.

### TC-05 — OB Self-Confirmation request email/SMS content
**Mode:** ai-repair · 389 email + 389 SMS
- [PASS] One message per office bearer, on both channels
- [PASS] NPO Name present
- [PASS] Confirmation link present and **unique per OB** — 162 distinct `tempId` values, each mapping to exactly one person
- [PASS] Link host migrated to `dsd-npo-adminportal-qa.shesha.app` on 2026-08-04 and resolves
- [FAIL] **OB Name renders as "Dear Not Verified"** on the current template
- [FAIL] **No expiry note** anywhere in the body
- ⚠️ **Correction to an intermediate finding.** 166 `tempId`s appeared against "two recipients" — that is one email address plus one MSISDN, i.e. the *same* office bearer on two channels. Not a token collision. Checked before reporting.
- 📌 87 `tempId`s appear with two different `npo=` values (e.g. `Test` / `Test_Unsuccessful_Letter_01`). No truncation was found, so this is consistent with the organisation being **renamed** between the original notification and its reminder. Not raised.

### TC-06 — OB Confirmation Thank-you page renders after confirm
**Mode:** not executed
- [SKIP] Requires completing a live OB confirmation, which mutates a real application. Deferred deliberately rather than spending the state.
- 📌 The case is mis-scaffolded — its steps describe dispatching a notification and checking `RefListDeliveryStatus`, but the expected result is about a rendered page. Flagged for Thabiso.

### TC-07 — Annual Compliance Reminder content (FYE − 1 month)
**Mode:** ai-repair · store-wide search
- [FAIL] **No annual-compliance reminder template exists** among 132 distinct subjects. The only reminder in the store is the OB Acknowledgement Reminder.
- [SKIP] Field list untestable with no template
- [SKIP] FYE−1-month timing — needs clock control regardless
- 🔑 Corroborates the drift note from the data side.

### TC-08 — Annual Compliance Acknowledgement (Submission Received)
**Mode:** ai-repair · 42 emails, newest 2026-08-17
- [PASS] `AnnualComplianceAcknowledgement.pdf` attached on 36 of 42
- [PASS] Receipt confirmed in the body; NPO name present
- [PASS] No unresolved placeholders
- [FAIL] **Report number absent**
- [FAIL] **Year covered absent**
- [FAIL] **OB list absent**
- 📌 Inconsistent with its sibling: `Annual Compliance Submission Incomplete` *does* carry a submission reference (`ANN1285/06/08/2026`). The acknowledgement dropping it looks like an omission, not a design choice.

### TC-09 — Annual Compliance Successful Letter (Compliant)
**Mode:** ai-repair · 8 emails, newest 2026-08-07
- [PASS] `AnnualComplianceSuccessful.pdf` attached on 7 of 8
- [PASS] NPO identity, **financial year 2025** and the compliant outcome all present
- [PASS] No unresolved placeholders
- ⚠️ 1 of 8 had no attachment while the body promised one (2026-05-06, one-off)
- ⚠️ Verdicted against NPO identity / year / outcome because **the case names no field list**. It needs one before this PASS means much.

### TC-10 — Annual Compliance Incomplete / Non-Compliant Letter
**Mode:** ai-repair · 16 Incomplete + 3 NonCompliant
- [PASS] Submission reference present — `ANN1285/06/08/2026`
- [PASS] Resubmission instruction present
- [PASS] `AnnualComplianceIncomplete.pdf` attached on 14 of 16
- [FAIL] **No 30-day deadline** in either variant
- [FAIL] **NonCompliant promises an attachment and has none — 3 of 3**

### TC-11 — Change Request Acknowledgement (Submitted)
**Mode:** ai-repair · 71 emails (`Email Post Registration`), newest 2026-08-13
- [PASS] Receipt confirmed; NPO name present
- [PASS] `AcknowledgementLetter.pdf` attached on 71 of 71
- [PASS] No unresolved placeholders
- [PASS (2nd pass)] **Change type named in the PDF** — *"ACKNOWLEDGEMENT OF FOUNDATIONAL CHANGE REQUEST IN TERMS OF NONPROFIT ORGANISATIONS ACT, 1997"*
- [PASS (2nd pass)] **Submission date present in the PDF** — *"Your request for Foundational Change has been received on: 13/08/2026"*, with reference `POST1042/13/08/2026` and the chairperson named
- ⚠️ Verdict corrected FAILED → **PASS**. Both "absent" fields were in the attachment.
- [SKIP] **The UI Correspondence cross-check was not performed.** This was the one case that could have validated the store-based method against an independent view, and it is the main gap in this run. Everything else rests on the store alone.

### TC-12 — Change Request Approved: Approval Letter + conditional attachments
**Mode:** ai-repair · 20 emails, newest 2026-08-11
- [PASS] `ApprovalLetter.pdf` attached on 20 of 20
- [PASS] **GeneralChange branch** — 12 emails carry `ApprovalLetter + ListOfOfficeBearerLetter`
- [PASS] **FoundationalChange branch** — 3 emails carry `ApplicationMembershipConstitution + ApprovalLetter + RegistrationCertificate`
- [PASS] No unresolved placeholders
- 📌 Both branches exercised, so this is a full PASS rather than the PARTIAL the plan predicted. The QR question from TC-04 recurs on the re-issued certificate.

### TC-13 — Change Request Incomplete (Resubmission Required)
**Mode:** ai-repair · store-wide search
- [FAIL] **No CR-incomplete / resubmission template found.** 71 acknowledgements, 20 approvals and 11 denials are present; no incomplete variant.
- ⚠️ Cannot distinguish "not implemented" from "status never exercised on QA" from the store alone.

### TC-14 — Change Request Declined: Denial Letter
**Mode:** ai-repair · 11 emails, newest 2026-08-07
- [PASS] **(BLOCKING) No certificate and no constitution attached** — only `DenialLetter.pdf`, on 11 of 11
- [PASS] No unresolved placeholders
- [PASS (2nd pass)] Denial reasons **and a 30-day remedy window** are in `DenialLetter.pdf` — *"the organisation has been given 30 days from the date of issue to submit corrected documents"*
- [FAIL] **`DenialLetter.pdf` header reads "APPLICATION FOR FOUNDATIONAL CHANGE CHANGE REQUEST"** — the change type is interpolated in front of a hard-coded "CHANGE REQUEST", duplicating the word
- [FAIL] **NPO name dropped** — *"the Post Rgistration change submission for  has been unsuccessful"*
- [FAIL] *"Post Rgistration"* misspelt

### TC-15 — Voluntary Deregistration Acknowledgement
**Mode:** ai-repair · 15 email + 15 SMS, newest 2026-08-20
- [PASS] DER reference present — `DER2368/18/08/2026`
- [PASS] `VdAcknowledgementLetter.pdf` attached on 15 of 15
- [PASS] Receipt confirmed; no unresolved placeholders
- [FAIL] **Type of severance never referenced**
- [BLOCKED] SMS delivery — all 15 SMS rows `status: 8`, Vodacom credit

### TC-16 — Voluntary Deregistration Approved Notice
**Mode:** ai-repair · 7 emails, newest 2026-08-13
- [PASS] `VdSuccessful.pdf` attached on 7 of 7
- [PASS] Body confirms the organisation has been deregistered and records updated
- [PASS] No unresolved placeholders
- [SKIP] **`NpoOrganisation.Status = Deregistered` not verified** — the state half of this case was not queried
- 📌 `333-019` was deliberately left alone; it is the registered NPO the annual-compliance cases depend on.

### TC-17 — Voluntary Deregistration Incomplete + 30-day clock
**Mode:** ai-repair · 6 emails, newest 2026-08-07
- [PASS] `VdIncomplete.pdf` attached on 6 of 6
- [PASS] Insufficiency described, if generically
- [FAIL] **No 30-day clock mentioned**

### TC-18 — Voluntary Deregistration Denied + Investigation reference
**Mode:** ai-repair · store-wide search
- [FAIL] **No VD-Denied template exists.** Acknowledgement, Successful and Incomplete are all present.
- [SKIP] Investigation reference — no template for it to appear in
- 🔑 The case is unfalsifiable as written (*"if investigation triggered"* passes trivially when nothing fires). The finding is that **the denial notification itself is missing**, which is the more useful answer.

### TC-19 — Appeal Initiation Acknowledgement (CasePreparation)
**Mode:** ai-repair · 27 emails, newest 2026-08-10
- [PASS] Template **exists** — appeal receipt is acknowledged
- [PASS] `AcknowledgementDeregistrationAppealLetter.pdf` attached on 27 of 27
- [FAIL] **No appeal reference in the body** — it names the NPO instead
- 🔑 **The plan predicted BLOCKED and was wrong.** Appeal notifications are in the store from other testers' appeals, so the content half was verdictable without owning an appeal. Worth remembering: a store query beats a "we can't reach it" assumption.

### TC-20 — Appeal Upheld: Restoration / Re-issued Certificate
**Mode:** ai-repair · 10 emails, newest 2026-08-07
- [PASS] Re-issued certificate set attached — `ApplicationSuccessLetter + RegistrationCertificate + ListOfOfficeBearersLetter + constitution`, on 10 of 10
- [PASS] No unresolved placeholders
- [FAIL] **No distinct "reinstatement letter"** as the cancellation branch requires
- [SKIP] Which appeal type each message belongs to cannot be told from the notification alone, so the two branches cannot be scored separately

### TC-21 — Appeal Denied notification with mandatory claim attachment
**Mode:** ai-repair · 8 emails, newest 2026-08-07
- [PASS] `DeniedOfAppealLetter.pdf` attached on 8 of 8
- [FAIL] **No tribunal-supplied claim attachment** — the denial letter is the only file
- [FAIL] Reference renders empty — *"with reference has been denied"*
- [SKIP] Whether the **UI** gates the mandatory attachment was not tested — the drift note says the server does not, and that question still stands

### TC-22 — SMS content fits 160-char or supports multi-segment
**Mode:** ai-repair · 1 164 SMS rows, 24 distinct templates
- [PASS] **No truncation** — all 591 URL-bearing SMS retain an intact `tempId`
- [PASS] No unresolved placeholders in any SMS body
- [PASS] All bodies are pure GSM-7 — nothing forces the 70-character UCS-2 limit
- [FAIL] **22 of 24 templates exceed 160 units**; worst is 583 units / 4 segments
- ⚠️ **The ADO expected result is truncated after *"either"***. I applied the 160/153 GSM-7 standard and flagged the case for completion.

## Questions for Thabiso — first pass (SUPERSEDED — see the updated list at the end of this report)
1. 🔴 **`dsd-npo-publicportal-qa.azurewebsites.net` does not resolve, and the OB reminder still uses it** — 404 messages since February, last fired 00:01 today. Who owns that template's base URL? The OfficeBearerRegistry sibling was migrated on 2026-08-04.
2. **`localhost:3000` appears in 54 emails** across the appeal/application/compliance outcome templates, latest 2026-08-20, and the anchor markup is malformed. Is that a template config or a deployed-settings problem?
3. **TC-07 / TC-13 / TC-18 have no template at all.** Are the Annual reminder, CR-Incomplete and VD-Denied notifications implemented, or have those statuses simply never been exercised on QA?
4. **TC-09's *"letter content correct"* names no fields.** What must the annual compliance letter contain?
5. **TC-22's expected result is cut off after *"either"***. What are the two acceptable outcomes? Every operational SMS is currently 2–4 segments.
6. **The 30-day deadline is in none of the three letters that should carry it** (TC-03, TC-10, TC-17), and suite 07 found no due date in the admin UI either. Is a deadline meant to be communicated at all?
7. **TC-04's "4 attachments"** is too narrow — Trusts and Companies correctly get 5–6. Should the case be widened by entity type? And **4 of 46 shipped with no constitution** — is that a known gap?
8. **An NPO named `<script>alert(1)</script>QA_XSS_NPO` exists and propagates into notification URLs unencoded.** Whose test data is that, and should the registration form have accepted it?
9. **`status: 16`** appears on 2 notification rows. What does it mean? We have `1` = Sent and `8` = Failed.
10. **SMS is not uniformly failing** — 195 rows are `status: 1`. Has credit been topped up intermittently?

## Not covered by this run
- **TC-06** was not executed, and **TC-11's UI Correspondence cross-check** was not performed. The store now has an
  independent corroborating source for content — the attached PDFs, which agree with it — but no independent check on
  *dispatch* itself. That cross-check should still open the next session.
- ✅ **PDFs are now opened** — 9 documents across TC-01/02/03/04/10/11/14. Superseded the first pass's biggest gap.
- ⏸ **The QR payload is undecoded.** The QR exists; where it points is unknown, and the public `/verify` route 404s.
- **TC-16's `NpoOrganisation.Status`** assertion was not queried.
- **TC-21's UI attachment gate** was not tested.
- **TC-12's re-issued certificate was not opened** — the QR finding on TC-04 probably carries over, but "probably" is
  not a verdict, so TC-12's PASS rests on the attachment set alone.
- Coverage claimed is the conservative reading: **5 passed of 22**, with 5 partials counted as non-passes.

## Corrections log
Kept explicit because four verdicts moved and one headline was withdrawn.

| # | First pass said | Corrected to | Why |
|---|---|---|---|
| 1 | TC-02 FAILED — "no deadline" | **PASS** | The PDF states *"30 days from date of issue"* |
| 2 | TC-11 FAILED — "change type and submission date absent" | **PASS** | Both are in the PDF |
| 3 | TC-04 PARTIAL — QR unverified, "points to absent" | **PASS** | The QR is present; extracted and rendered |
| 4 | TC-01 FAILED — three fields absent | **PARTIAL** | Two of the three are in the PDF; only the OB list is missing |
| 5 | **"No deadline is ever communicated to anyone"** — a systemic headline across TC-03/10/17 | **RETRACTED** | Two of the three letters state 30 days. Only `AnnualComplianceIncomplete` omits it |
| 6 | TC-03 "no denial reasons in the body" implied none anywhere | Narrowed | The PDF gives four itemised reasons; what is missing is **appeal rights**, and the verdict stays FAILED on that |
| 7 | "All SMS fails on QA" (carried in from an earlier session) | Corrected | 969 failed **vs 195 sent** |
| 8 | Reminder cadence read per NPO as 1–2 days | Corrected | Per **mailbox** it is every working day; onset is OB-add + 7 days |

**Root cause of 1–4:** verdicting template content from the email body when the body explicitly defers to an
attachment. The emails are covering notes by design. **Open the attachment before failing a content case.**

## Questions for Thabiso — updated after the second pass
1. 🔴🔴 **CRITICAL: generated documents download with no authentication.** Certificates, office-bearer lists,
   constitutions and decline letters are retrievable anonymously, and the attachment listing hands out the file ids.
   **Does this also hold on production?** That needs answering today, and by someone who can ask rather than probe.
2. 🔴 **The OB reminder host does not resolve** and the job fires every working day, 7 days after an OB is added,
   forever. Who owns that template's base URL?
3. ✅ **The QR drift note is wrong — the certificate has a QR.** Two follow-ups: **what should it encode**, and given
   the public `/verify` route is 404, is the verification endpoint meant to exist yet? (Also: **14D TC-14D-002 needs
   re-verdicting** — it recorded the QR as absent.)
4. **`AnnualComplianceIncomplete` is the only incomplete letter with no deadline**; its registration and
   change-request siblings both state 30 days. Should it state one?
5. **`ApplicationUnsuccessfulLetter` carries no appeal rights and no 30-day appeal window.** The reasons are good and
   there is a Friendly Societies referral — but should a declined applicant be told how to appeal?
6. **TC-09's *"letter content correct"* names no fields.** What must the annual compliance letter contain?
7. **TC-22's expected result is truncated after *"either"***. Every operational SMS is 2–4 segments.
8. **TC-18 is unfalsifiable as written**, and there is no VD-Denied template for the reference to appear in.
9. **TC-07 / TC-13 / TC-18 have no template at all.** Implemented, or never exercised on QA?
10. **`DenialLetter.pdf` says "FOUNDATIONAL CHANGE CHANGE REQUEST"**, and `AppIncompleteLetter.pdf` uses
    `NPOInquiry@dsd.gov.za` where the others use `npoenquiry@dsd.gov.za`. Which address is correct?
11. **`status: 16`** on 2 notification rows — what is it?
12. **SMS credit** — 195 SMS did send. Has it been topped up intermittently?
