# Test Plan: NPO-14T-F — Notification Template Content Verification (functional)

> **Status:** Imported from Azure DevOps 2026-08-24 — not yet executed
> **Owner:** QA
> **Last Updated:** 2026-08-24
> **Estimated Duration:** 2400s

## Metadata
| Field | Value |
|-------|-------|
| App URL | https://dsd-npo-adminportal-qa.shesha.app/login |
| Environment | QA |
| Login As | mpenduloizwelinuk@gmail.com / 123qwe |
| Lead tester | **Thabiso Kegakwile** |
| ADO Plan | [planId 101543 — DSD-NPO Functional Test Plan](https://dev.azure.com/boxfusion/Boxfusion%20Test%20Plans/_testPlans/define?planId=101543&suiteId=101906) |
| ADO Suite | 101906 — *14T - Cross-Cutting - Notification Template Content Verification* (22 cases) |

## Objective
> Verify that every notification template the system dispatches carries the **content the case prescribes** — the
> named merge fields, the right attachments, the right deadlines — and that **no unresolved placeholder**
> (`{{NpoName}}` and friends) reaches a recipient. Delivery *tracking* is checked alongside; delivery *arrival* is
> explicitly out of scope (see the SMS constraint below).

## Provenance
Imported from the ADO functional plan on 2026-08-24. Every **Expected result** below is quoted verbatim from the
ADO test case — see [RULES.md](../RULES.md) and the project rule that business rules come from the test lead.
All 22 cases state `Design`; **4 carry `Drift-Risk`** (TC-04, TC-07, TC-18, TC-21) and each drift note is reproduced
on the case.

⚠️ **All 22 ADO cases share one generic 3-step scaffold** — *"Trigger the relevant workflow transition"* → *"Open the
generated email and any PDF attachment(s)"* → *"Confirm RefListDeliveryStatus shows 'Sent' or 'DeliveryConfirmed'"*.
The author templated the steps and put the real requirement in **step 2's expected result**, which names the exact
fields per template. **Those field lists are the actual test.** The steps below expand the scaffold into something
executable; the field lists are untouched.

## 🔑 How these cases are actually verified — read before executing
Most DSD-NPO detail pages have **no Correspondence and no Notification-audit section**, so the UI cannot answer
*"what did the template say?"*. The authoritative source is the Shesha notification store:

```
GET /api/dynamic/Shesha/NotificationMessage/Crud/GetAll?maxResultCount=100&filter=<jsonlogic>
    filter e.g. {">":[{"var":"creationTime"},"2026-08-12T00:00:00"]}
```
Fields that matter: `subject · body · recipientText · status · channel._displayName · errorMessage · creationTime`.
Attachments: `GET /api/dynamic/Shesha/NotificationMessageAttachment/Crud/GetAll`.

- **`status` IS the case's `RefListDeliveryStatus`.** `1` = Sent · `8` = Failed (with `errorMessage`).
- 🔑 **`sorting=creationTime desc` is silently ignored** on these endpoints — **filter** on `creationTime`, never sort.
- 🔑 A bare `fetch` from the browser is **unauthenticated** and returns 0 rows. Read the token from
  `localStorage['xDFcxiooPQxazdndDsdRSerWQPlincytLDCarcxVxv']` → `JSON.parse(atob(raw)).accessToken` → send as
  `Authorization: Bearer`.
- This is an **API read for verification**, which the project rules permit; it is not API testing. Every *trigger*
  is still driven through the UI.

🔑 **The body is stored even when sending fails.** A row with `status: 8` still carries the rendered `subject` and
`body` — so **template content is testable on a template whose delivery failed**. That is what makes the SMS cases
assessable at all, and TC-22 in particular.

## ⚠️ Known constraints that pre-shape the verdicts
1. 🔴 **All SMS fails on QA — out of credit, not a code fault.** Every SMS row returns `status: 8` with
   *"Vodacom SMS not enqueued: Not enough credits to send"*. So for every case that says *"email + SMS"*, the
   **SMS delivery half cannot pass** on this environment. Verdict the **content** from the stored body and record
   delivery as **BLOCKED (environment)** — do **not** log it as an app defect.
2. ⚠️ **`status: 1` means dispatched, not delivered.** On 2026-08-14 an `Unsuccessful` email read `1` and the tester
   never received it, while an `Acknowledgment` to the same address also read `1` and did arrive. Status `1` +
   "not received" is a **mail-relay/spam question**, not a missing-notification defect. Say so precisely.
3. ⛔ **Appeals (TC-19, TC-20, TC-21) have no owned appeal to trigger.** There is no known submitter entry point to
   the appeal form, and we hold neither a chairperson nor a tribunal login — see
   `test-plans/appeals/11p-appeals-submitter-functional.md`. Expect these three to be **BLOCKED** unless a
   pre-existing appeal's notifications are already in the store.
4. ⚠️ **"Open the PDF attachment"** presumes the attachment is reachable. Where a `NotificationMessageAttachment`
   row exists but the blob will not fetch, that is itself a finding — record it rather than skipping the case.
5. 📌 **No QR on certificates** — established by suite 14D (TC-14D-004: the public `/verify` route is **404**, and the
   tester's code note says no QR library). TC-04 asks for a *"Certificate of Registration (with QR)"* and its own
   drift note predicts the failure. Cross-reference 14D rather than re-deriving it.

## Preconditions
- [ ] Admin portal reachable at https://dsd-npo-adminportal-qa.shesha.app/login
- [ ] 🔑 Switch the header view mode **Live → Latest** immediately after login (project rule — every run)
- [ ] A bearer token in hand for the notification-store reads (see method above)
- [ ] The historical trigger set below is present in the store

## Trigger inventory — what already exists to verify against
Rather than re-triggering 22 workflows, harvest the store first: much of this was raised by earlier runs. Known
triggers and the templates they raised:

| Trigger | Record | Templates raised | Covers |
|---|---|---|---|
| Registration submitted | `APPL26-01106`, `APPL26-01270` | `Registration Application Acknowledgment` (email+SMS), `Registration Application OfficeBearerRegistry` (email+SMS **per OB**) | TC-01, TC-05 |
| Registration rejected | `APPL26-01106` | `Registration Application Unsuccessful` (email+SMS) to **two** recipients — the OB/org email and the submitting account | TC-03 |
| Failed document verification | suite 07 run on `APPL26-01270` | *(expected)* Application Incomplete | TC-02 |
| Registration approved | `333-019` | *(expected)* success letter + certificate + constitution + OB list | TC-04 |
| Annual report submitted | `ANN2363` on `333-019` | *(expected)* Annual Compliance Acknowledgement | TC-08 |
| Change request | suite 10 run — **this form has both a Correspondence section and Re-Send**, the one place the UI can corroborate | TC-11 → TC-14 |
| Voluntary deregistration | suite 13 run | *(expected)* VD acknowledgement / outcome | TC-15 → TC-18 |

▶ **Execute in that order.** Anything the store already answers costs nothing; only then drive fresh triggers for
the gaps. A template that is *absent* from the store after its trigger demonstrably fired is a **FAIL**, not a skip —
but prove the trigger fired first.

## Test data
| Field | Value |
|---|---|
| Registered NPO | `333-019` |
| Applications | `APPL26-01106` (rejected), `APPL26-01270` (triaged) |
| Annual report | `ANN2363` |
| Mobile | `0818400598` where a number is asked for |
| Placeholder signature | search every body for `{{`, `}}`, `#NULL#`, `[object Object]`, and bare field names |

⛔ **Never transcribe a real SA ID or personal identifier into a report.** Office-bearer records carry live PII —
describe a field's presence and shape, never its value.

## Test Cases

### TC-01 — Application Acknowledgement Letter content correct (ADO #101828 · TC-14T-001)

*Priority 2 · Positive · Both portals.*

- **Precondition (ADO):** *"Application moved to ApplicationInProgress (just submitted)."*
- **Type:** Content verification
- **Steps:**
  1. API — query `NotificationMessage` filtered on `creationTime` for subject ~ `Registration Application Acknowledgment`
  2. EXTRACT `subject`, `body`, `recipientText`, `status`, `channel._displayName`
  3. ASSERT the body contains **NPO Name**, **APP Reference Number**, the **OB list**, and the **submission date**
  4. ASSERT recipients include **both the chairperson and the submitter**
  5. API — query `NotificationMessageAttachment` for the message; ASSERT `Application Acknowledgement.pdf` is present
  6. Fetch the attachment blob; ASSERT it opens cleanly as a PDF
  7. ASSERT **no** template placeholder (`{{NpoName}}` etc.) appears anywhere in subject or body
  8. ASSERT `status` is `1` (Sent) — the case's `RefListDeliveryStatus` *Sent / DeliveryConfirmed*
- **Expected result:** *"Email to chairperson and submitter contains: NPO Name, APP Reference Number, OB list, submission date. PDF attachment 'Application Acknowledgement.pdf' opens cleanly. No template placeholders like '{{NpoName}}' visible."* · *"Delivery is tracked successfully"*
- **Assertions:**
  - [ ] ASSERT the four named fields are present
  - [ ] ASSERT both recipient classes are addressed
  - [ ] ASSERT the named PDF is attached and opens
  - [ ] ASSERT no unresolved placeholders
  - [ ] ASSERT delivery status is tracked as Sent
- **📌** This template is **known to exist** (raised by `APPL26-01106`). The open question is the *field list* and the
  *PDF*, not whether the mail fires.

---

### TC-02 — Application Incomplete Letter content correct (ADO #101829 · TC-14T-002)

*Priority 2 · Positive · Both portals.*

- **Precondition (ADO):** *"Application moved to FailedDocumentVerification by admin."*
- **Type:** Content verification
- **Steps:**
  1. Establish the trigger — an application at **FailedDocumentVerification**. Suite 07 drove document rejection on `APPL26-01270`; confirm the status landed
  2. API — query `NotificationMessage` for the incomplete/amend template
  3. ASSERT the body contains **NPO Name**, **APP Ref**, the **reason for incompleteness**, **what to amend**, and a **deadline**
  4. ASSERT a PDF is attached
  5. ASSERT no unresolved placeholders
  6. ASSERT `status` is `1`
- **Expected result:** *"Email to chairperson contains: NPO Name, APP Ref, reason for incompleteness, what to amend, deadline. PDF attached. No unresolved placeholders."* · *"Delivery is tracked successfully"*
- **Assertions:**
  - [ ] ASSERT the five named content elements are present
  - [ ] ASSERT a PDF is attached
  - [ ] ASSERT no unresolved placeholders
  - [ ] ASSERT delivery status is tracked
- **🔑 The interesting assertion is "what to amend" and "deadline".** Suite 07 found **no SLA or due-date shown
  anywhere** in the admin UI (TC-07-019 FAIL). If the letter also omits the deadline, that is the same gap surfacing
  on the recipient side — cross-reference, don't double-raise.

---

### TC-03 — Application Unsuccessful (Denied) Letter content correct (ADO #101830 · TC-14T-003)

*Priority 2 · Positive · Both portals.*

- **Precondition (ADO):** *"Application denied after 3rd resubmission failure."*
- **Type:** Content verification
- **Steps:**
  1. API — query `NotificationMessage` for `Registration Application Unsuccessful` (raised by `APPL26-01106`)
  2. ASSERT the body contains **denial reasons**, **appeal-rights information including the 30-day refusal-appeal window**, and **contact info**
  3. ASSERT no unresolved placeholders
  4. ASSERT `status` is tracked; note that both recipients (OB/org email and submitting account) are addressed
- **Expected result:** *"Email contains denial reasons, appeal-rights information (30-day window for refusal appeal), contact info."* · *"Delivery is tracked successfully"*
- **Assertions:**
  - [ ] ASSERT denial reasons are present
  - [ ] ASSERT the 30-day appeal window is stated
  - [ ] ASSERT contact info is present
  - [ ] ASSERT no unresolved placeholders
- **🔑 High-value cross-check.** Suite 11P's drift note says *"no explicit 30-day window check found for refusal
  appeals"* in code. If this letter **promises** a 30-day window the code does not enforce, that is a documented
  mismatch worth raising on its own — and the tester has already confirmed this email carries **no appeal link**.
- **⚠️** The precondition says *"after 3rd resubmission failure"*; `APPL26-01106` was denied directly. If the template
  is shared, verdict it and say the resubmission-count path was not the trigger used.

---

### TC-04 — Application Successful Letter + Certificate + Constitution + OB list attached (ADO #101831 · TC-14T-004)

*Priority 2 · Positive · Both portals · `Drift-Risk`.*

- **Precondition (ADO):** *"Application approved (ApplicationSuccessful)."*
- **Type:** Content verification (attachment set)
- **Steps:**
  1. API — query `NotificationMessage` for the success template against `333-019`
  2. API — query `NotificationMessageAttachment`; ASSERT **exactly four** attachments: **success letter**, **Certificate of Registration**, **Constitution** (signed/stamped), **List of OBs**
  3. Fetch each blob; ASSERT each opens cleanly
  4. ASSERT the **Registration Number is present and matches the assigned value** (`333-019`)
  5. ASSERT the certificate carries a **QR code**
  6. ASSERT no unresolved placeholders
  7. ASSERT `status` is tracked
- **Expected result:** *"Email to chairperson with 4 attachments: success letter, Certificate of Registration (with QR), Constitution (signed/stamped), List of OBs. Reg No present and matches assigned value."* · *"Delivery is tracked successfully"*
- **Assertions:**
  - [ ] ASSERT all four attachments are present
  - [ ] ASSERT the Reg No matches the assigned value
  - [ ] ASSERT the certificate carries a QR code
  - [ ] ASSERT no unresolved placeholders
- **🔴 Drift note (Thabiso, from code):** *"QR code generation NOT found — PDF likely WITHOUT QR. Expect to FAIL on
  QR-presence check."*
- **📌 Already corroborated by suite 14D** — the public `/verify` route is **404** and there is no QR library. The
  QR sub-assertion is expected to **FAIL**; verdict the other three independently so the case does not collapse into
  one known finding. 14D's own live-cert visual was **DEFERRED** for want of a reachable generated certificate — if
  this message's certificate blob fetches, **it also closes 14D TC-14-002/003**. Note that explicitly.

---

### TC-05 — OB Self-Confirmation request email/SMS content (ADO #101832 · TC-14T-005)

*Priority 2 · Positive · Both portals.*

- **Precondition (ADO):** *"Application submitted; OBs added with email and mobile."*
- **Type:** Content verification (email + SMS)
- **Steps:**
  1. API — query `NotificationMessage` for `Registration Application OfficeBearerRegistry` — expect **one per office bearer**
  2. ASSERT each body contains the **OB Name**, the **NPO Name**, a **unique confirmation link**, and an **expiry note**
  3. ASSERT the links differ between OBs — a shared link would defeat per-OB confirmation
  4. ASSERT the link **routes to a no-auth tokenised page** (open one; do not confirm on someone else's behalf)
  5. For the SMS channel rows: verdict **content** from the stored body; record delivery as BLOCKED (out of credit)
  6. ASSERT no unresolved placeholders
- **Expected result:** *"Each OB receives email + SMS containing: OB Name, NPO Name, unique confirmation link, expiry note. Link routes to no-auth tokenised page."* · *"Delivery is tracked successfully"*
- **Assertions:**
  - [ ] ASSERT one message per OB
  - [ ] ASSERT the four named fields are present in each
  - [ ] ASSERT each confirmation link is unique
  - [ ] ASSERT the link resolves to a no-auth tokenised page
  - [ ] ASSERT no unresolved placeholders
- **⚠️ Suite 06 (OB Self-Confirmation) was assessed and skipped**, so the *confirmation* journey is unproven — but the
  **request notification** is exactly what this case tests, and it is in the store. Do not let the suite-06 skip
  suppress this case.
- **🔑 The uniqueness check is not in the ADO wording as a separate step** — it is implied by *"unique confirmation
  link"*. Assert it anyway and flag if a single link serves all OBs.

---

### TC-06 — OB Confirmation Thank-you page renders after confirm (ADO #101833 · TC-14T-006)

*Priority 2 · Positive · Email-link (no-auth).*

- **Precondition (ADO):** *"OB confirmed via link."*
- **Type:** Content verification (rendered page, not an email)
- **Steps:**
  1. Take a **confirmation link from an OB of an application we own** (never a third party's)
  2. NAVIGATE to it; complete the confirmation
  3. ASSERT the page shows **"Thank you, {OB Name}"** — or a generic thank-you if not personalised
  4. ASSERT **no template placeholders** are visible on the page
  5. SNAPSHOT as evidence
- **Expected result:** *"Page shows 'Thank you, {OB Name}' or generic if not personalised. No template placeholders visible."* · *"Delivery is tracked successfully"*
- **Assertions:**
  - [ ] ASSERT a thank-you page renders after confirming
  - [ ] ASSERT no visible placeholders
- **📌 This case is mis-scaffolded.** Its step 1 and step 3 talk about dispatching a notification and
  `RefListDeliveryStatus`, but the actual expected result is about a **web page**. Verdict the page; mark the
  delivery-status step **N/A** and say why.
- **⚠️ Confirming is a state change on a real application.** Use an application we own and note which OB was confirmed
  so the action is traceable.

---

### TC-07 — Annual Compliance Reminder content, FYE − 1 month (ADO #101834 · TC-14T-007)

*Priority 2 · Positive · Public portal · `Drift-Risk`.*

- **Precondition (ADO):** *"Registered NPO with FYE in 1 month."*
- **Type:** Content verification (time-triggered)
- **Steps:**
  1. API — query `NotificationMessage` for any annual-compliance **reminder** template
  2. If present: ASSERT the body contains **NPO Name**, **year**, **FYE date**, and a **link to start the report**
  3. ASSERT the **timing** — that it fired at **FYE − 1 month**
  4. ASSERT no unresolved placeholders
- **Expected result:** *"Email to authorised user: NPO Name, year, FYE date, link to start report."* · *"Delivery is tracked successfully"*
- **Assertions:**
  - [ ] ASSERT the reminder template exists
  - [ ] ASSERT the four named fields are present
  - [ ] ASSERT (expected FAIL) the trigger is FYE − 1 month
  - [ ] ASSERT no unresolved placeholders
- **🔴 Drift note (Thabiso, from code):** *"'1 month before FYE' timer NOT implemented; code uses 9-month-after FYE.
  Expect this test to FAIL on timing."*
- **🔑 Split the verdict.** *Timing* is expected to fail and is a **spec-vs-code** disagreement for Thabiso to
  arbitrate — the case may be what needs changing, not the app. *Content* is independently testable **if** any
  reminder exists at all. Report the two halves separately; do not let the known timing failure hide an untested
  field list.
- **⚠️ Needs clock control to test properly** — flagged in the suite-08 notes as one of the cases that cannot be
  driven without it. If no reminder is in the store, the honest verdict is **BLOCKED (needs clock control)**, not FAIL.

---

### TC-08 — Annual Compliance Acknowledgement, Submission Received (ADO #101835 · TC-14T-008)

*Priority 2 · Positive · Public portal.*

- **Precondition (ADO):** *"Annual report submitted (AnnualReportingInProgress)."*
- **Type:** Content verification
- **Steps:**
  1. Confirm the trigger — `ANN2363` on `333-019` was submitted
  2. API — query `NotificationMessage` for the annual-compliance acknowledgement
  3. ASSERT the body confirms receipt and contains the **report number**, the **year covered**, and the **OB list**
  4. ASSERT no unresolved placeholders
  5. ASSERT `status` is tracked
- **Expected result:** *"Email confirms receipt with report number, year covered, OB list."* · *"Delivery is tracked successfully"*
- **Assertions:**
  - [ ] ASSERT the acknowledgement exists for the submitted report
  - [ ] ASSERT report number, year covered and OB list are present
  - [ ] ASSERT no unresolved placeholders
  - [ ] ASSERT delivery status is tracked
- **📌** If the trigger needs re-driving, the annual-report precondition recipe is on record. Note that above
  R500 000 the accounting-officer fields are optional and unenforced, and the **funding row drops the funder name** —
  if the acknowledgement echoes funding data, check whether that loss shows up here too.

---

### TC-09 — Annual Compliance Successful Letter, Compliant (ADO #101836 · TC-14T-009)

*Priority 2 · Positive · Public portal.*

- **Precondition (ADO):** *"Annual report passed QA (OrganisationCompliant)."*
- **Type:** Content verification
- **Steps:**
  1. Establish the trigger — an annual report driven to **OrganisationCompliant** (suite 09 territory)
  2. API — query `NotificationMessage` for the compliance-success template
  3. ASSERT a **compliance letter PDF** is attached and opens cleanly
  4. ASSERT the letter content is correct — NPO identity, the year, the compliant outcome
  5. ASSERT no unresolved placeholders
  6. ASSERT `status` is tracked
- **Expected result:** *"Email with compliance letter PDF attached; letter content correct."* · *"Delivery is tracked successfully"*
- **Assertions:**
  - [ ] ASSERT the compliance letter PDF is attached and opens
  - [ ] ASSERT the letter content is correct
  - [ ] ASSERT no unresolved placeholders
- **⚠️ *"letter content correct"* is unspecified** — unlike the other cases this one names no fields. Verdict against
  NPO identity, year and outcome, and **say in the report that the case needs a field list** rather than inventing one.
- **📌 Depends on the backend QA step** (ADO suite 101892, 3 cases, not imported). If that path is not drivable,
  verdict **BLOCKED** and name the dependency.

---

### TC-10 — Annual Compliance Incomplete / Non-Compliant Letter (ADO #101837 · TC-14T-010)

*Priority 2 · Positive · Public portal.*

- **Precondition (ADO):** *"Annual report failed QA (AnnualReportIncomplete)."*
- **Type:** Content verification
- **Steps:**
  1. Establish the trigger — an annual report driven to **AnnualReportIncomplete**
  2. API — query `NotificationMessage` for the non-compliant template
  3. ASSERT the body carries the **reasons**, the **correct resubmission instructions**, and a visible **30-day deadline**
  4. ASSERT no unresolved placeholders
  5. ASSERT `status` is tracked
- **Expected result:** *"Email with reasons; correct resubmission instructions and 30-day deadline visible."* · *"Delivery is tracked successfully"*
- **Assertions:**
  - [ ] ASSERT reasons are present
  - [ ] ASSERT resubmission instructions are correct
  - [ ] ASSERT the 30-day deadline is visible
  - [ ] ASSERT no unresolved placeholders
- **🔑 The 30-day deadline is the assertion to watch.** Three cases in this suite (TC-03, TC-10, TC-17) promise a
  30-day window in a letter. If the letters state it but nothing enforces it, that is one systemic finding across
  the suite — raise it once, reference it three times.

---

### TC-11 — Change Request Acknowledgement, Submitted (ADO #101838 · TC-14T-011)

*Priority 2 · Positive · Public portal.*

- **Precondition (ADO):** *"Change Request status moved to Submited [sic]."*
- **Type:** Content verification
- **Steps:**
  1. Open the change-request record from the suite 10 run. 🔑 **This form has a Correspondence section *and* a
     Notification-audit section *and* Re-Send** — the one place in the app where the UI corroborates the store
  2. ASSERT the Correspondence section lists the acknowledgement
  3. API — query `NotificationMessage` for the same message and cross-check subject and recipient
  4. ASSERT the body confirms receipt and references the **change type** and the **submission date**
  5. ASSERT no unresolved placeholders
  6. ASSERT `status` is tracked
- **Expected result:** *"Email confirms receipt; reference to the change type and submission date."* · *"Delivery is tracked successfully"*
- **Assertions:**
  - [ ] ASSERT the acknowledgement appears in the UI Correspondence section
  - [ ] ASSERT the UI and the store agree
  - [ ] ASSERT change type and submission date are present
  - [ ] ASSERT no unresolved placeholders
- **🔑 Do the UI/store cross-check here deliberately.** It is the only case in the suite that can validate the
  verification *method* itself against an independent view. If they agree, the store-based verdicts on the other 21
  cases are on firm ground — state that in the report.
- **📌 `Submited` is misspelt in the ADO precondition.** Quote it as-is; the status token in the app may carry the
  same typo, which is worth noting if so.

---

### TC-12 — Change Request Approved: Approval Letter + conditional attachments (ADO #101839 · TC-14T-012)

*Priority 2 · Positive · Public portal.*

- **Precondition (ADO):** *"CR status = Approved."*
- **Type:** Content verification (conditional attachment set)
- **Steps:**
  1. Establish an **Approved** change request
  2. API — query the message and its attachments
  3. ASSERT the **approval letter PDF** is attached
  4. ASSERT the conditional set by change type:
     - If **FoundationalChange** → a **new Certificate** and a **new Constitution** are attached
     - If **GeneralChange** → a **new OB list** is attached
  5. RECORD which change type was exercised — a case that only ever runs one branch has only half its coverage
  6. ASSERT no unresolved placeholders
  7. ASSERT `status` is tracked
- **Expected result:** *"Approval letter PDF attached. If FoundationalChange: new Certificate + Constitution attached. If GeneralChange: new OB list attached."* · *"Delivery is tracked successfully"*
- **Assertions:**
  - [ ] ASSERT the approval letter is attached
  - [ ] ASSERT the correct conditional attachments for the change type exercised
  - [ ] ASSERT no unresolved placeholders
- **⚠️ Two branches, one case.** Verdict **PARTIAL** if only one change type is available, and name the untested
  branch explicitly — do not report a single-branch run as a full pass.
- **📌** If a FoundationalChange re-issues a certificate, the **QR question from TC-04 recurs here**. Same finding,
  second surface.

---

### TC-13 — Change Request Incomplete, Resubmission Required (ADO #101840 · TC-14T-013)

*Priority 2 · Positive · Public portal.*

- **Precondition (ADO):** *"CR status = Incomplete."*
- **Type:** Content verification
- **Steps:**
  1. Establish an **Incomplete** change request
  2. API — query `NotificationMessage`
  3. ASSERT the body carries the **reasons** and the **resubmission window**, and **refers correctly to the CR type**
  4. ASSERT no unresolved placeholders
  5. ASSERT `status` is tracked
- **Expected result:** *"Email with reasons + resubmission window; refers correctly to CR type."* · *"Delivery is tracked successfully"*
- **Assertions:**
  - [ ] ASSERT reasons are present
  - [ ] ASSERT the resubmission window is stated
  - [ ] ASSERT the CR type is referred to correctly
  - [ ] ASSERT no unresolved placeholders

---

### TC-14 — Change Request Declined: Denial Letter (ADO #101841 · TC-14T-014)

*Priority 2 · Positive · Public portal.*

- **Precondition (ADO):** *"CR status = Declined."*
- **Type:** Content verification (negative attachment assertion)
- **Steps:**
  1. Establish a **Declined** change request
  2. API — query the message and its attachments
  3. ASSERT the body carries **denial reasons**
  4. ASSERT (BLOCKING) **no certificate and no constitution is attached** — a declined change must not ship documents
  5. ASSERT no unresolved placeholders
  6. ASSERT `status` is tracked
- **Expected result:** *"Email with denial reasons; no certificate/constitution attached."* · *"Delivery is tracked successfully"*
- **Assertions:**
  - [ ] ASSERT denial reasons are present
  - [ ] ASSERT (BLOCKING) no certificate or constitution is attached
  - [ ] ASSERT no unresolved placeholders
- **🔑 This is the only *negative* attachment assertion in the suite** — the failure mode it guards is a declined
  change request that still issues a certificate, which would be serious. Give it a real check against the
  attachment list, not an eyeball of the email body.

---

### TC-15 — Voluntary Deregistration Acknowledgement (ADO #101842 · TC-14T-015)

*Priority 2 · Positive · Public portal.*

- **Precondition (ADO):** *"VD status = DeregistrationInProgress (just submitted)."*
- **Type:** Content verification (email + SMS)
- **Steps:**
  1. Identify the voluntary-deregistration record from the suite 13 run
  2. API — query `NotificationMessage` for the VD acknowledgement
  3. ASSERT the body confirms receipt and **references the type of severance**
  4. For the SMS row: verdict content from the stored body; record delivery BLOCKED (out of credit)
  5. ASSERT no unresolved placeholders
  6. ASSERT `status` is tracked
- **Expected result:** *"Email/SMS confirms receipt; references type of severance."* · *"Delivery is tracked successfully"*
- **Assertions:**
  - [ ] ASSERT the acknowledgement exists
  - [ ] ASSERT the type of severance is referenced
  - [ ] ASSERT no unresolved placeholders
- **⚠️ Voluntary deregistration has no Correspondence section** in the UI — this one is store-only.

---

### TC-16 — Voluntary Deregistration Approved Notice (ADO #101843 · TC-14T-016)

*Priority 2 · Positive · Public portal.*

- **Precondition (ADO):** *"VD status = DeregistrationApproved."*
- **Type:** Content verification + state assertion
- **Steps:**
  1. Establish an **approved** voluntary deregistration
  2. API — query the message; ASSERT a **PDF notice** is attached and opens
  3. ASSERT — separately, on the organisation record — that **`NpoOrganisation.Status` = Deregistered**
  4. ASSERT no unresolved placeholders
  5. ASSERT `status` is tracked
- **Expected result:** *"Email + PDF notice. Org status NpoOrganisation.Status = Deregistered."* · *"Delivery is tracked successfully"*
- **Assertions:**
  - [ ] ASSERT the email and PDF notice are present
  - [ ] ASSERT the organisation status is `Deregistered`
  - [ ] ASSERT no unresolved placeholders
- **🔑 This case smuggles in a state assertion** that is not about the template at all. Verify it — a notice that
  says "deregistered" while the register still says otherwise is the defect worth finding here.
- **⛔ Do not deregister `333-019`.** It is the registered NPO the annual-compliance cases depend on. Use a
  throwaway organisation or verdict from an existing record.

---

### TC-17 — Voluntary Deregistration Incomplete + 30-day clock (ADO #101844 · TC-14T-017)

*Priority 2 · Positive · Public portal.*

- **Precondition (ADO):** *"VD status = DeregistrationIncomplete."*
- **Type:** Content verification
- **Steps:**
  1. Establish an **incomplete** voluntary deregistration
  2. API — query `NotificationMessage`
  3. ASSERT the body **describes the insufficiency** and **mentions the 30-day clock**
  4. ASSERT no unresolved placeholders
  5. ASSERT `status` is tracked
- **Expected result:** *"Email with description of insufficiency; 30-day clock mentioned."* · *"Delivery is tracked successfully"*
- **Assertions:**
  - [ ] ASSERT the insufficiency is described
  - [ ] ASSERT the 30-day clock is mentioned
  - [ ] ASSERT no unresolved placeholders
- **📌 Third of the three 30-day promises** (with TC-03 and TC-10). Roll into the one systemic observation.

---

### TC-18 — Voluntary Deregistration Denied + Investigation reference (ADO #101845 · TC-14T-018)

*Priority 2 · Positive · Public portal · `Drift-Risk`.*

- **Precondition (ADO):** *"VD status = DeregistrationDenied (e.g., 2nd insufficiency)."*
- **Type:** Content verification (conditional)
- **Steps:**
  1. Establish a **denied** voluntary deregistration
  2. API — query `NotificationMessage`
  3. ASSERT the body carries the **denial**
  4. If an investigation was triggered: ASSERT the body **mentions the investigation reference**
  5. Determine whether the cross-module investigation trigger fires **at all** — that is the drift question
  6. ASSERT no unresolved placeholders
- **Expected result:** *"Email with denial; if investigation triggered, mentions investigation reference."* · *"Delivery is tracked successfully"*
- **Assertions:**
  - [ ] ASSERT the denial is present
  - [ ] ASSERT the investigation reference appears when an investigation was triggered
  - [ ] RECORD whether the cross-module trigger fires
- **🔴 Drift note (Thabiso, from code):** *"Cross-module investigation trigger not verified — may not be wired in code."*
- **🔑 The conditional makes this case unfalsifiable as written.** *"If investigation triggered"* means an absent
  reference passes trivially when nothing fires. So the **real** deliverable is step 5: does the trigger exist?
  Report that as the finding and say the case needs rewording to be testable.

---

### TC-19 — Appeal Initiation Acknowledgement, CasePreparation (ADO #101846 · TC-14T-019)

*Priority 2 · Positive · Public portal.*

- **Precondition (ADO):** *"Appeal Initiated then admin transitions to CasePreparation."*
- **Type:** Content verification
- **Steps:**
  1. API — query `NotificationMessage` for any appeal-acknowledgement template **already in the store**
  2. If present: ASSERT the body **confirms appeal receipt with an appeal reference**
  3. If absent: verdict **BLOCKED** and name the dependency
  4. ASSERT no unresolved placeholders
- **Expected result:** *"Email confirms appeal receipt with appeal reference."* · *"Delivery is tracked successfully"*
- **Assertions:**
  - [ ] ASSERT the acknowledgement contains an appeal reference
  - [ ] ASSERT no unresolved placeholders
- **⛔ Expected BLOCKED.** No submitter entry point to the appeal form is known, so we cannot raise an appeal we own.
  The chain is `Initiated (6)` → *Send to Chairperson* → `CasePreparation (1)`, and *Send to Chairperson* needs an
  appeal to act on. **A store query is still worth running** — a seeded appeal's notification would let the content
  half be verdicted without owning the record.

---

### TC-20 — Appeal Upheld: Restoration / Re-issued Certificate (ADO #101847 · TC-14T-020)

*Priority 2 · Positive · Public portal.*

- **Precondition (ADO):** *"Appeal status = Upheld."*
- **Type:** Content verification (two branches)
- **Steps:**
  1. API — query `NotificationMessage` for an upheld-appeal template
  2. ASSERT by appeal type:
     - **Cancellation appeal** → **Certificate + reinstatement letter** attached
     - **Refusal appeal** → **success notice**, and a **new Certificate after completing the application process**
  3. If absent: verdict **BLOCKED**
  4. ASSERT no unresolved placeholders
- **Expected result:** *"For Cancellation appeal: Certificate + reinstatement letter. For Refusal appeal: success notice + new Certificate after completing app process."* · *"Delivery is tracked successfully"*
- **Assertions:**
  - [ ] ASSERT the correct attachment set for the appeal type
  - [ ] ASSERT no unresolved placeholders
- **⛔ Expected BLOCKED** — needs an owned appeal driven to `Upheld (4)`, which needs a **tribunal member** login we
  do not have.

---

### TC-21 — Appeal Denied notification with mandatory claim attachment (ADO #101848 · TC-14T-021)

*Priority 2 · Positive · Public portal · `Drift-Risk`.*

- **Precondition (ADO):** *"Appeal status = Denied."*
- **Type:** Content verification (mandatory attachment)
- **Steps:**
  1. API — query `NotificationMessage` for a denied-appeal template
  2. ASSERT the body carries **denial reasons**
  3. ASSERT the **tribunal-supplied claim attachment** is present
  4. Determine whether the **UI gates** the mandatory attachment on Denied — the drift note says the server does not
  5. If absent: verdict **BLOCKED**
- **Expected result:** *"Email contains tribunal-supplied claim attachment + denial reasons."* · *"Delivery is tracked successfully"*
- **Assertions:**
  - [ ] ASSERT denial reasons are present
  - [ ] ASSERT the claim attachment is present
  - [ ] RECORD whether the UI enforces the mandatory attachment
- **🔴 Drift note (Thabiso, from code):** *"mandatory-attachment-on-Denied is NOT enforced server-side. Verify whether
  UI gates this."*
- **⛔ Expected BLOCKED** on the notification half. **Step 4 may still be answerable** — if the tribunal outcome form
  can be *opened* with the shared account, whether the attachment field is required is observable without completing
  the transition. Try that before verdicting BLOCKED; a UI-gate-only control is a real finding given the server does
  not enforce it.

---

### TC-22 — SMS content fits 160-char or supports multi-segment (ADO #101849 · TC-14T-022)

*Priority 2 · Positive · Both portals · `Src:Code`.*

- **Precondition (ADO):** *"Any SMS notification (e.g., OB self-confirm)."*
- **Type:** Content verification (length / segmentation)
- **Steps:**
  1. API — query `NotificationMessage` filtered to the **SMS channel**, across all history
  2. EXTRACT every distinct SMS `body` and its **character length**
  3. ASSERT each body **either** fits a single 160-character GSM-7 segment **or** is a clean multi-segment message
  4. RECORD any body that exceeds 160 characters, with its length and template name
  5. Check for **non-GSM-7 characters** — a single smart quote or em dash forces UCS-2 and drops the limit to **70**,
     which is the realistic way this fails
  6. ASSERT no unresolved placeholders in any SMS body
- **Expected result:** *"SMS body fits SMS segments cleanly"* — the ADO expected result is **truncated mid-sentence** after *"either"*.
- **Assertions:**
  - [ ] ASSERT every SMS body fits 160 GSM-7 chars or segments cleanly
  - [ ] RECORD the length of each distinct SMS template
  - [ ] ASSERT no non-GSM-7 characters force a 70-char limit unexpectedly
  - [ ] ASSERT no unresolved placeholders
- **🔑 This is the case the SMS-credit outage does NOT block.** Bodies are rendered and stored before the Vodacom
  hand-off fails, so every failed SMS row still carries a testable body. **Best value-per-minute case in the suite** —
  it verdicts from a single query with no trigger needed.
- **⚠️ The ADO expected result is incomplete** — *"either"* with no alternatives. Flag it for Thabiso to finish; assert
  against the 160/70 GSM-7 rule in the meantime and say that is the standard applied.
- **📌 `Src:Code`** — derived from code review, not the FDS, so there may be no functional spec to appeal to.

---

## Coverage against ADO

| Plan TC | ADO id | ADO TC | Template | Trigger available | Expected verdict |
|---|---|---|---|---|---|
| TC-01 | #101828 | TC-14T-001 | Application Acknowledgement | ✅ in store (`APPL26-01106`) | runnable |
| TC-02 | #101829 | TC-14T-002 | Application Incomplete | ⚠️ suite 07 on `APPL26-01270` | runnable |
| TC-03 | #101830 | TC-14T-003 | Application Unsuccessful | ✅ in store (`APPL26-01106`) | runnable |
| TC-04 | #101831 | TC-14T-004 | Application Successful + 4 attachments | ⚠️ `333-019` | 🔴 QR expected FAIL |
| TC-05 | #101832 | TC-14T-005 | OB Self-Confirmation request | ✅ in store (per OB) | runnable |
| TC-06 | #101833 | TC-14T-006 | OB Thank-you page | ⚠️ needs a link we own | runnable |
| TC-07 | #101834 | TC-14T-007 | Annual Compliance Reminder | ⛔ needs clock control | 🔴 timing FAIL / BLOCKED |
| TC-08 | #101835 | TC-14T-008 | Annual Compliance Acknowledgement | ✅ `ANN2363` | runnable |
| TC-09 | #101836 | TC-14T-009 | Annual Compliance Successful | ⚠️ needs backend QA pass | may be BLOCKED |
| TC-10 | #101837 | TC-14T-010 | Annual Compliance Non-Compliant | ⚠️ needs a failed QA | may be BLOCKED |
| TC-11 | #101838 | TC-14T-011 | CR Acknowledgement | ✅ suite 10 · **UI corroborates** | runnable |
| TC-12 | #101839 | TC-14T-012 | CR Approved + conditional docs | ⚠️ one branch likely | PARTIAL likely |
| TC-13 | #101840 | TC-14T-013 | CR Incomplete | ⚠️ suite 10 | runnable |
| TC-14 | #101841 | TC-14T-014 | CR Declined | ⚠️ suite 10 | runnable |
| TC-15 | #101842 | TC-14T-015 | VD Acknowledgement | ⚠️ suite 13 | runnable |
| TC-16 | #101843 | TC-14T-016 | VD Approved + org status | ⚠️ suite 13 | runnable |
| TC-17 | #101844 | TC-14T-017 | VD Incomplete + 30-day | ⚠️ suite 13 | runnable |
| TC-18 | #101845 | TC-14T-018 | VD Denied + investigation ref | ⚠️ drift | unfalsifiable as written |
| TC-19 | #101846 | TC-14T-019 | Appeal Initiation Ack | ⛔ no owned appeal | BLOCKED expected |
| TC-20 | #101847 | TC-14T-020 | Appeal Upheld | ⛔ no tribunal login | BLOCKED expected |
| TC-21 | #101848 | TC-14T-021 | Appeal Denied + claim | ⛔ no tribunal login | BLOCKED; step 4 may run |
| TC-22 | #101849 | TC-14T-022 | SMS 160-char / segmentation | ✅ every SMS row in store | **runnable, best value** |

## Questions for Thabiso
1. **TC-09** *"letter content correct"* names no fields — what must the annual compliance letter contain?
2. **TC-22**'s expected result is **truncated mid-sentence** after *"either"*. What are the two acceptable outcomes?
3. **TC-18** is unfalsifiable as written — *"if investigation triggered"* passes trivially when nothing fires. Should
   it assert that the cross-module trigger **does** fire?
4. **TC-07** — code uses *9 months after FYE*, the case says *1 month before*. Which is correct: the app or the case?
5. **TC-03** promises a **30-day appeal window** in the refusal letter, but 11P's drift note says no 30-day check
   exists in code, and the letter carries **no appeal link**. Is the window real?
6. **Appeals (TC-19/20/21)** — a **chairperson** and a **tribunal-member** account, or confirm role-scoped testing is
   out of scope.
7. **SMS credit** — the QA Vodacom account is out of credit, so no SMS delivery half can pass. Top-up, or accept
   content-only verdicts on this environment?

---

## ⛔ PLAN CORRECTION 2026-08-27 — the TC-11 "Correspondence section" note is WRONG

The note on TC-11 (and the row in the coverage table) reads:

> 🔑 **This form has both a Correspondence section and Re-Send**, the one place the UI can corroborate

**The change-request detail form has no such section, and never has.** Verified two ways on 2026-08-27:
1. On screen, `change-request-details` v25 renders only `Change Details · Declarations · Office Bearer Change ·
   Documents · Notes`.
2. In the form configuration, v25's markup (48 532 chars, LIVE; **all 24 versions** enumerated) contains **zero**
   occurrences of `Correspondence`, `NotificationMessage`, `Re-Send`, `ReSend` or `resend`.

So it is not a view-mode, rendering or permissions problem — which retires the 08-25 caveat that blamed
`Live Mode` — and **step 2 of TC-11 is unexecutable as written**. It should be struck: ADO #101838 requires only
*"Email confirms receipt; reference to the change type and submission date"* and *"Delivery is tracked
successfully"*, all of which the store plus the attached PDF answer.

⚠️ **Consequence for the suite's premise.** The plan's "How these cases are actually verified" section says most
detail pages have no Correspondence section and names this form as the exception. **There is no exception** — the
notification store is the *only* source for all 22 cases. Any future case relying on UI corroboration must be
rewritten, not deferred.

## ✅ TC-11 re-executed 2026-08-27 — PASS on a second change type
Report: `test-reports/2026-08-27/14t-notification-templates-functional--change-request-acknowledgement.md`

TC-11 already passed on 08-24 against a **Foundational Change** on another tester's record. Re-verified today against
a **General Change** on our own `POST1424` / `333-022`, submitted by us:
- receipt confirmed, **change type** and **submission date** both present in `AcknowledgementLetter.pdf`;
- no unresolved placeholders anywhere in the email body or the PDF;
- delivery tracked — `status` 1 Sent, `dateSent` +2.4s, `retryCount` 0, no error.

🔑 **The letter's date is the true submit date (27/08), while the entity's `submissionDate` field is stale (21/08).**
Judge the letter, not the field.

🔑 **PDF extraction method** (reusable for the remaining 14T PDF cases): fetch the `StoredFile` via
`/api/StoredFile/Download?id=<fileId>`, inflate the `FlateDecode` streams (6 of 8 were compressed), then read the
`Tj`/`TJ` text operands in order.
