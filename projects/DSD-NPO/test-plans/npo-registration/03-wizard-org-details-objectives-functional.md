# Test Plan: NPO-03-F — Application Wizard Tabs 2–3: Organisation Details & Objectives (functional)

> **Status:** Imported from Azure DevOps 2026-08-17 — ✅ **runnable**, no manufactured preconditions needed
> **Owner:** QA
> **Last Updated:** 2026-08-17
> **Estimated Duration:** 1800s

## Metadata
| Field | Value |
|-------|-------|
| App URL | https://dsd-npo-publicportal-1-qa.shesha.app/login |
| Environment | QA |
| Login As | mpenduloizwelinuk@gmail.com / 123qwe |
| Lead tester | **Thabiso Kegakwile** |
| ADO Plan | [planId 101543 — DSD-NPO Functional Test Plan](https://dev.azure.com/boxfusion/Boxfusion%20Test%20Plans/_testPlans/define?planId=101543&suiteId=101886) |
| ADO Suite | 101886 — *03 - Application Wizard - Tabs 2-3 (Org Details & Objectives)* (26 cases in ADO; **24 owned here**) |

## Objective
> Verify the validation and conditional-field behaviour of the POPI gate, Organisation Details and Objectives — the field-level rules that the smoke plan never exercised.

## Why this suite matters
The smoke plan covered the **happy path** through these tabs (TC-03-001/004/005/006/008/016). This suite is the
**negative and edge** half of the same series: required-field enforcement, formats, lengths, conditional show/hide,
duplicates and persistence. **It needs no seeded data and no API writes** — a fresh draft application is enough.

🔑 **The two plans split one TC series.** Smoke holds 001, 004, 005, 006, 008, 016; this holds 002, 003, 007,
009–015, 017–032. Always search both before concluding a case does not exist.

## 🔑 Read before running — four cases already have evidence against them
We have driven these tabs repeatedly, so several outcomes are predictable. **Still execute them** — the point is a
citable verdict against a prescribed expectation — but expect these:

| Case | What we already observed |
|---|---|
| **TC-02 (TC-03-003)** | Prescribes *"each required field shows **its own** validation error"*. Live, `Next` is silently **disabled** with **no message at all**. This is the case that makes the silent-`Next` finding citable. |
| **TC-07 / TC-24 (TC-03-012 / TC-03-030)** | Both prescribe a *"validation error"* when no Area of Operations is picked. Live, the field is **mandatory but carries no `*` and no `ant-form-item-required` class**, and `Next` just stays disabled. |
| **TC-08 (TC-03-013)** | The case says Term of Office Bearers is in **months** and that **36** is accepted. The live label reads **`Year(s)`**. Settle which is correct before logging a defect either way. |
| **TC-03-031 / TC-03-032** | ⚠️ These two sit in **both** ADO suites. They are owned and **already executed** by the smoke plan (2026-08-13), so they are **not** numbered cases here — see the note below. |

## Provenance
Imported from ADO on 2026-08-17 via the browser + REST route. Expected results quoted verbatim. All 26 cases state
`Design`; **6 carry `Drift-Risk`**. Sources: 9 `Src:FDS`, 15 `Src:Code`, 1 `Src:Both`, 2 `Src:Sys-Obs`.

## Preconditions
- [ ] A signed-in submitter with a **fresh draft** application (Register NPO → Register a new NPO → POPIA)
- [ ] 🔑 View mode **Live → Latest** immediately after login
- [ ] Free text ≤100 characters
- [ ] ⚠️ **Never revisit Tab 2 after capturing office bearers** — a re-save silently deletes every office bearer
- [ ] ⚠️ **Never set AntD date fields programmatically** (TC-22) — drive the picker panel → OK

## Test Cases

### TC-01 — POPI Act: OK is disabled until the consent checkbox is ticked (ADO #101626 · TC-03-002)
*P2 · Negative · Src:FDS.*
- **Steps:** 1. Without ticking, click **OK** → 2. Tick the checkbox → 3. Click OK
- **Expected result:** *"OK is disabled (or click is no-op). User cannot proceed."* → *"OK becomes enabled"* →
  *"Application Wizard Step 1 is opened"*
- **Assertions:** [ ] disabled/no-op before consent · [ ] enables on tick · [ ] wizard opens
- **📌** The live button is labelled **`Next`**, not `OK` — record the label drift. There are **two** consent
  checkboxes live (consent + E&A library), and smoke already proved **partial consent is correctly rejected**.

### TC-02 — 🔑 Tab 2: all required fields enforced before Next (ADO #101627 · TC-03-003)
*P1 · Negative · Src:FDS.* **The headline case of this suite.**
- **Steps:** 1. Leave **Organisation Name, Telephone, Email, Physical Address, Legal Form** blank and click **Next**
- **Expected result:** *"Each required field shows **its own** validation error; navigation to Step 2 is blocked"*
- **Assertions:**
  - [ ] ASSERT navigation is blocked
  - [ ] ASSERT (BLOCKING) **each** named field displays its **own** error message
  - [ ] RECORD what feedback, if any, is actually shown
- **🔴 Expected to FAIL on the feedback half.** The app blocks correctly but shows nothing — `Next` is simply
  `disabled` with zero `.ant-form-item-explain-error` nodes. Assert the `disabled` attribute directly; a click
  timeout here means an unsatisfied field, not a hang.
- **📌** Note that **Telephone is NOT required live** (only mobile number is) — so the case's own field list may be
  wrong. Say which needs changing.

### TC-03 — Tab 2: conditional fields hide again when legal form changes (ADO #101631 · TC-03-007)
*P3 · Edge · Src:FDS.*
- **Steps:** 1. Legal Form = **NPC**, enter a CIPC number, then change Legal Form to **Trust**
- **Expected result:** *"CIPC Registration Number field is hidden and IT Registration Number field appears; CIPC
  value is **not silently persisted** on submit"*
- **Assertions:** [ ] CIPC field hides · [ ] `ITRegistration No *` appears · [ ] (BLOCKING) the CIPC value does not
  survive to the saved record
- **📌** Smoke TC-03-005 already confirmed Trust surfaces `ITRegistration No *`. The **new** assertion is the
  discarded value.
- ⚠️ Changing Legal Form forces a Tab 2 re-save, which is what triggers the office-bearer wipe — run this **before**
  capturing any office bearers.

### TC-04 — Tab 2: Email rejects an invalid format (ADO #101633 · TC-03-009)
*P2 · Negative · Src:FDS.*
- **Steps:** 1. Email = `invalid`, click Next
- **Expected result:** *"Field validation error; navigation blocked"*
- **Assertions:** [ ] visible field error · [ ] navigation blocked
- **📌** Plus-addressed emails (`name+ob2@domain`) are **rejected** on the office-bearer form — check whether Tab 2
  behaves the same, since that is arguably over-strict.

### TC-05 — Tab 2: Telephone and Cellphone accept only valid SA formats (ADO #101634 · TC-03-010)
*P2 · Negative · Src:FDS.*
- **Steps:** 1. Telephone = `abc` or `0123` (too short) → 2. Cellphone = `0820001234`
- **Expected result:** *"Field validation error"* → *"Accepted"*
- **Assertions:** [ ] both invalid forms rejected · [ ] valid cellphone accepted

### TC-06 — Tab 2: SARS Income Tax Number format validated if provided (ADO #101635 · TC-03-011)
*P3 · Edge · Src:FDS.*
- **Steps:** 1. Leave blank → 2. Enter `12345`
- **Expected result:** *"No error (FDS implies it is optional — 'if they have')"* → *"Field error — must be 10 digits"*
- **Assertions:** [ ] optional when blank · [ ] 10-digit rule enforced
- **📌** Live, the field only appears once **`Have Income tax no?`** is ticked — see TC-26. Run TC-26 first.

### TC-07 — Tab 2: Area of Operations multi-select is mandatory (ADO #101636 · TC-03-012)
*P2 · Negative · Src:FDS.*
- **Steps:** 1. Pick no area of operation and click Next
- **Expected result:** *"Validation error requiring at least one area"*
- **Assertions:** [ ] (BLOCKING) at least one area is required · [ ] RECORD whether an **error message** appears
- **🔴 Expected to FAIL on the message.** Confirmed 2026-08-14: with all 9 asterisked fields filled and 0 errors,
  `Next` stayed disabled; selecting one province in `National (SA)` enabled it instantly. The field has **no `*`**
  and **no `ant-form-item-required` class** — the 1st of four unmarked-mandatory instances on this build.

### TC-08 — Tab 2: Term of Office Bearers must be a positive integer (months) (ADO #101637 · TC-03-013)
*P3 · Edge · Src:FDS.*
- **Steps:** 1. Term = `0` or negative → 2. Term = `36`
- **Expected result:** *"Validation error"* → *"Accepted"*
- **Assertions:** [ ] 0 and negatives rejected · [ ] 36 accepted
- **🔴 Unit conflict.** The case says **months**; the live label reads **`Office Bearer Term (Year(s))`**. `36` under
  a Year(s) label is 36 years. **Resolve with Thabiso before verdicting** — this is a case-vs-build question, and one
  of the two documents is wrong.

### TC-09 — Tab 2: duplicate organisation prevention on Reg/IT number (ADO #101638 · TC-03-014)
*P1 · Edge · Src:FDS · `Drift-Risk`.*
- **Steps:** 1. Legal Form = NPC, enter a CIPC number already registered, click Next
- **Expected result:** *"System detects duplicate (per FDS Assumption: avoid duplicate applications) and blocks
  progression with a clear message"*
- **Assertions:** [ ] (BLOCKING) progression blocked · [ ] the message names the duplicate
- **🔴 Drift note:** *"Code allows duplicate detection at CIPC layer but does not strictly enforce 'no duplicate NPO'
  at wizard — verify at integration call."*
- **📌** Needs a **real CIPC number** — the same dependency that blocks smoke TC-04-008. CIPC returns `200` with
  `{"enterprise":[],"response_message":"Records found."}` for a non-existent number, and the UI says nothing.

### TC-10 — Tab 2: Save & Continue persists data across a browser refresh (ADO #101639 · TC-03-015)
*P2 · Edge · Src:FDS.*
- **Steps:** 1. Fill all required Step 1 fields, **refresh the browser**
- **Expected result:** *"Wizard reopens on Step 1 with the previously entered values preserved (application is in
  'ApplicationStarted' state)"*
- **Assertions:** [ ] values preserved · [ ] reopens on Step 1 · [ ] status is `ApplicationStarted` (`1`)
- **📌** `ApplicationStatus` 1 = *Application Started*, 2 = *Application In Progress*. Confirm which one a
  refresh-preserved draft actually holds.
- ⚠️ Resuming a draft is what forces the user back through Org Details, which is how the office-bearer wipe gets
  triggered in real use. Note any interaction.

### TC-11 — Tab 3: cannot click Next with zero objectives (ADO #101641 · TC-03-017)
*P2 · Negative · Src:FDS.*
- **Steps:** 1. Add no objective and click Next
- **Expected result:** *"Validation error; navigation blocked"*
- **Assertions:** [ ] blocked · [ ] RECORD whether a message appears
- **📌** Live the step shows an **alert** — *"Please click on the Add Objective button…"* — so this one may genuinely
  pass where TC-02 and TC-07 fail. Worth contrasting in the report: the same build does give feedback here.

### TC-12 — Tab 3: a Secondary Objective without a Primary is rejected (ADO #101642 · TC-03-018)
*P3 · Negative · Src:FDS.*
- **Steps:** 1. Try to add only a Secondary Objective
- **Expected result:** *"Dialog enforces selecting a Primary Objective first (per FDS 7.5.3 rule 1)"*
- **Assertions:** [ ] (BLOCKING) Secondary alone cannot be saved
- **📌** Live, the modal is a **3-level cascade** — `Sector → Objective → Service` — and `Save` stays disabled until
  all three are set. Map the case's *Primary/Secondary* vocabulary onto the live *Sector/Objective/Service* before
  verdicting; they may not be the same concept.

### TC-13 — Tab 3: delete an added objective (ADO #101643 · TC-03-019)
*P2 · Positive · Src:FDS.*
- **Steps:** 1. Click the Delete icon next to an objective and confirm
- **Expected result:** *"Objective is removed from the list; remaining objectives unchanged"*
- **Assertions:** [ ] the objective is removed · [ ] the others are untouched
- **📌** Add **two** objectives first, so "remaining objectives unchanged" is actually testable.

### TC-14 — Tab 3: a duplicate primary+secondary pair cannot be added twice (ADO #101644 · TC-03-020)
*P3 · Edge · Src:FDS.*
- **Steps:** 1. Add an objective with Primary=X, Secondary=Y, then try to add the identical pair again
- **Expected result:** *"Add is blocked with a 'duplicate objective' message"*
- **Assertions:** [ ] (BLOCKING) the duplicate is refused · [ ] the message says *duplicate*

### TC-15 — Org Name: required, min 2, max 150 (ADO #101645 · TC-03-021)
*P2 · Negative · Src:Code · `Drift-Risk`.*
- **Steps:** 1. empty → 2. `X` (1 char) → 3. 151-char string → 4. `Boxfusion NPO`
- **Expected result:** required error → min-length error → max-length error → *"Accepted"*
- **Assertions:** [ ] each of the four outcomes
- **🔴 Drift note:** *"Exact min/max not pinned in FDS; verify against actual form metadata in Shesha form designer."*
  So **record the real limits** rather than assuming 2/150 — the numbers in the case are unconfirmed.

### TC-16 — Org Name: rejects HTML/script injection (ADO #101646 · TC-03-022)
*P2 · Negative · Src:Code.*
- **Steps:** 1. Org Name = a `<script>alert(1)</script>NPO` payload, click Next
- **Expected result:** *"Either rejected by sanitisation OR stored as escaped text. When rendered in admin portal or
  PDFs, the tag is NOT executed."*
- **Assertions:**
  - [ ] accepted-and-escaped **or** rejected — either satisfies the case
  - [ ] (BLOCKING) **not executed** on the admin application view
  - [ ] (BLOCKING) **not executed** in a generated PDF
- **📌** The PDF leg matters here: the constitution is **auto-generated** from the organisation name for a VA, and
  registration issues four artefacts. Follow the payload into the generated document, not just the screens.
- ⚠️ Keep the payload ≤100 characters.

### TC-17 — Shortened Name: optional, max length enforced (ADO #101647 · TC-03-023)
*P3 · Edge · Src:Code.*
- **Steps:** 1. blank → 2. 51-char string
- **Expected result:** *"Accepted (optional)"* → *"Max-length error if 50 is the limit"*
- **Assertions:** [ ] optional · [ ] RECORD the actual limit

### TC-18 — Telephone: SA national and international formats (ADO #101648 · TC-03-024)
*P3 · Edge · Src:Code.*
- **Steps:** 1. `0123456789` → 2. `+27123456789` → 3. `012-345-6789` → 4. `123`
- **Expected result:** accepted → accepted → *"Accepted or auto-normalised"* → *"Rejected (too short)"*
- **Assertions:** [ ] all four · [ ] RECORD whether separators are normalised or preserved

### TC-19 — WhatsApp: same validation as cellphone, optional (ADO #101649 · TC-03-025)
*P3 · Edge · Src:Code.*
- **Steps:** 1. blank → 2. same number as cellphone
- **Expected result:** *"Accepted (optional)"* → *"Accepted; no validation error"*
- **Assertions:** [ ] optional · [ ] duplication against cellphone is allowed
- **📌** Contrast with office bearers, where a **duplicate mobile is rejected** (*"OB With same mobile number
  exists"*, raised as a transient toast). The rules differ by form — confirm that is intended.

### TC-20 — CIPC Registration Number format `YYYY/NNNNNN/NN` (ADO #101650 · TC-03-026)
*P2 · Negative · Src:Code.*
- **Steps:** 1. `2019/123456/08` → 2. `19/123456/08` → 3. `2019-123456-08` → 4. `2019/12345/08`
- **Expected result:** *"Accepted, CIPC lookup attempted"* → format error ×3
- **Assertions:** [ ] the valid form is accepted **and a lookup fires** · [ ] all three malformed inputs rejected
- **📌** Watch the network for the CIPC call on step 1. The integration is confirmed wired and returns 200; the known
  gap is that a **no-match answers silently**.

### TC-21 — Trust IT Registration Number format validated (ADO #101651 · TC-03-027)
*P3 · Negative · Src:Code · `Drift-Risk`.*
- **Steps:** 1. `IT001234/2020` → 2. `INVALID` or `12345`
- **Expected result:** *"Accepted"* → *"Format error"*
- **Assertions:** [ ] valid accepted · [ ] invalid rejected
- **🔴 Drift note:** *"Trust IT no format not pinned in FDS or code. Verify with business analyst what the canonical
  pattern is."* — **so a failure here is a spec gap, not necessarily a bug.** Record what the field accepts.

### TC-22 — VA Constitution date cannot be in the future (ADO #101652 · TC-03-028)
*P2 · Negative · Src:Code · `Drift-Risk`.*
- **Steps:** 1. Constitution date = **tomorrow** → 2. date = **5 years ago**
- **Expected result:** *"Validation error 'date cannot be in the future'"* → *"Accepted"*
- **Assertions:** [ ] future date rejected · [ ] historic date accepted
- **🔴 Drift note:** *"Future-date validation not verified in code; rely on Shesha form metadata."*
- 🔑 **Drive the date picker panel — year → month → day — and never `fill()` it.** Setting AntD date fields
  programmatically leaves React state stale and has already produced one false Medium-High defect on this hub.
  The header's `super-prev` button steps a whole decade.
- **📌** The entity field is `ApprovedConstitutionalDate`. Confirm the live label before hunting for it.

### TC-23 — Term of OB: positive integer in a reasonable range (ADO #101653 · TC-03-029)
*P3 · Edge · Src:Code.*
- **Steps:** 1. `0` → 2. `-5` → 3. `36` → 4. `9999`
- **Expected result:** *"Error: must be positive"* → error → *"Accepted"* → *"Accepted or capped per business rule"*
- **Assertions:** [ ] 0 and −5 rejected · [ ] 36 accepted · [ ] RECORD whether 9999 is capped
- **📌** Numeric fields on this build default to `0` and typing **prepends** (`12` → `120`) — **clear the field
  first**, or the test data will not be what you think it is. Same unit question as TC-08.

### TC-24 — Area of Operations: at least one selection required (ADO #101654 · TC-03-030)
*P2 · Negative · Src:Both.*
- **Steps:** 1. Select none, Next → 2. Select 1 area, Next → 3. Select all areas
- **Expected result:** *"Validation error"* → *"Accepted"* → *"Accepted"*
- **Assertions:** [ ] none → blocked · [ ] one → accepted · [ ] all → accepted
- **🔴 Same expected failure as TC-07** — blocked correctly, but with no message and no required marker. This case
  adds the *select-all* branch, which is new: check the multi-select handles every province at once.
- ⚠️ `Ctrl+A` breaks this select and `Escape` closes the modal — select the options individually.

## ⚠️ TC-03-031 and TC-03-032 are NOT cases in this plan

Both work items (#102153, #102154) are members of **both** ADO suites — smoke 101860 and functional 101886 — because
a test case can belong to more than one suite. They were **imported into and executed under the smoke plan** on
2026-08-13 (`03-wizard-org-details-objectives--public-portal-registration.md` covers TC-03-031;
`--admin-initiated-registration-process.md` covers TC-03-032). They are deliberately left out of the numbered cases
here so the two plans do not double-count the same work — `verify-coverage.js` now flags this class of clash.

▶ **One follow-up belongs on the smoke case, not here.** TC-03-032 prescribes that when *Have Income Tax No?* is
toggled off, *"the Income Tax Number field is hidden **and its value is cleared**"*. Both 08-13 runs were `PARTIAL`,
and it is not evident that the **value-clearing** half was asserted. Re-run smoke **TC-03-032** for that one
assertion: type a tax number, toggle off, toggle on, and confirm the value is gone. A hidden-but-retained value is
the same class of bug TC-03 covers for CIPC, and this build has already produced four *captured-but-not-displayed*
findings.

## Coverage against ADO

| Plan TC | ADO id | ADO TC | P | Drift | Prior evidence |
|---|---|---|---|---|---|
| TC-01 | #101626 | TC-03-002 | 2 | — | POPIA gate passes; button labelled `Next` not `OK` |
| **TC-02** | **#101627** | **TC-03-003** | **1** | — | 🔴 expected FAIL — silent disabled `Next` |
| TC-03 | #101631 | TC-03-007 | 3 | — | Trust `ITRegistration No *` confirmed |
| TC-04 | #101633 | TC-03-009 | 2 | — | — |
| TC-05 | #101634 | TC-03-010 | 2 | — | — |
| TC-06 | #101635 | TC-03-011 | 3 | — | field is behind the tax toggle |
| TC-07 | #101636 | TC-03-012 | 2 | — | 🔴 expected FAIL — unmarked mandatory |
| TC-08 | #101637 | TC-03-013 | 3 | — | 🔴 months-vs-`Year(s)` conflict |
| TC-09 | #101638 | TC-03-014 | 1 | ⚠️ | needs a real CIPC number |
| TC-10 | #101639 | TC-03-015 | 2 | — | draft reopens at Tab 1 |
| TC-11 | #101641 | TC-03-017 | 2 | — | live alert exists — may pass |
| TC-12 | #101642 | TC-03-018 | 3 | — | live is a 3-level cascade |
| TC-13 | #101643 | TC-03-019 | 2 | — | — |
| TC-14 | #101644 | TC-03-020 | 3 | — | — |
| TC-15 | #101645 | TC-03-021 | 2 | ⚠️ | limits unconfirmed |
| TC-16 | #101646 | TC-03-022 | 2 | — | follow into the generated PDF |
| TC-17 | #101647 | TC-03-023 | 3 | — | — |
| TC-18 | #101648 | TC-03-024 | 3 | — | — |
| TC-19 | #101649 | TC-03-025 | 3 | — | OB form rejects duplicate mobiles |
| TC-20 | #101650 | TC-03-026 | 2 | — | CIPC wired; silent on no-match |
| TC-21 | #101651 | TC-03-027 | 3 | ⚠️ | pattern undefined in FDS **and** code |
| TC-22 | #101652 | TC-03-028 | 2 | ⚠️ | drive the picker, never `fill()` |
| TC-23 | #101653 | TC-03-029 | 3 | — | numeric fields prepend |
| TC-24 | #101654 | TC-03-030 | 2 | — | 🔴 same as TC-07 + select-all branch |

**24 cases owned by this plan.** The suite's other two ADO members — #102153 / TC-03-031 and #102154 / TC-03-032 —
belong to the smoke plan and were executed on 2026-08-13; see the note above.

**Smoke counterparts** (plan `03-wizard-org-details-objectives.md`): TC-03-001, 004, 005, 006, 008, 016, **031, 032**.

---

## ✅ Suite COMPLETE 2026-08-18 — TC-03-022 executed, all 24 cases now attempted
Report: `test-reports/2026-08-18/05-wizard-docs-and-03-xss--suite-close-out.md`

**TC-03-022 (XSS) — ✅ PASSED.** Payload `<script>alert(1)</script>QA XSS NPO` set as the Organisation Name on
APPL26-01270, which was then **submitted** so the payload could be followed all the way through.

| Sink | Result |
|---|---|
| Storage | ⚠️ stored **raw/unescaped** in `NpoOrganisation.name` |
| Public portal landing + detail views | ✅ escaped, 0 injected `<script>` elements |
| **Admin portal** application view | ✅ escaped, 0 injected elements, renders as literal text |
| **Generated PDF** (`AppAcknowledgementLetter.pdf`) | ✅ inert literal text, parens correctly PDF-escaped |

Both BLOCKING assertions satisfied. ⚠️ **Carry to suite 14Z:** the value is stored raw, so safety depends entirely on
output encoding. Any non-React consumer — HTML email, CSV/Excel export, report renderer — would be a live sink.
