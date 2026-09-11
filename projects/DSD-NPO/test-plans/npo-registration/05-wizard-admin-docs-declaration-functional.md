# Test Plan: NPO-05-F — Application Wizard Tabs 5–8: Admin/Ops, Control Structure, Documents, Declaration (functional)

> **Status:** Imported from Azure DevOps 2026-08-17 — ✅ **mostly runnable**; 3 cases are `Closed` in ADO and 2 need admin/API access
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
| ADO Plan | [planId 101543 — DSD-NPO Functional Test Plan](https://dev.azure.com/boxfusion/Boxfusion%20Test%20Plans/_testPlans/define?planId=101543&suiteId=101888) |
| ADO Suite | 101888 — *05 - Application Wizard - Tabs 5-8* (23 cases in ADO; **19 owned here**) |

## Objective
> Verify the back half of the registration wizard: the Admin & Operations selection, the conditional Control Structure tab, document upload rules, and the Declaration that submits the application.

## 🔑 This suite answers a standing open question
The 08-13 notes recorded *"`Control Structure` is CONDITIONAL, not just dynamic — it appeared on one pass and not on the
completed one. Ask what triggers it."* **The cases state the trigger explicitly:**

> *"On Organisation Details, at least one country selected under **International** (Area of Operations) — the Control
> Structure tab is rendered conditionally on this."*

So Control Structure appears **only for organisations with international operations** (FDS 7.5.6). That is why the
successful 08-13 journey ran **7 steps** — it was domestic-only. **Question closed.**
▶ **Consequence for this suite:** TC-02/03/04/16 (Control Structure) need a draft with an **International** country
selected on Tab 2. Set that up **before** capturing office bearers, since Tab 2 cannot be revisited afterwards.

## ⚠️ Cases excluded and flagged

**Not in this plan — owned by the smoke plan** (all four are `Source-Sys-Obs`, the tag that marks cross-plan members):
TC-05-026, TC-05-027, TC-05-028, TC-05-029. Smoke also owns TC-05-002, 006, 007, 013, 016, 019.

🔴 **Three cases are `State: Closed` in ADO** — TC-05-014 (#101690), TC-05-024 (#101701), TC-05-025 (#101702). Every
case in suites 03, 04 and 11 was `Design`; these are the only Closed ones encountered so far.
**❓ Ask Thabiso whether Closed means retired/superseded.** They are listed below for completeness but should **not** be
executed or counted until that is confirmed — running retired cases produces misleading verdicts.

## Provenance
Imported from ADO on 2026-08-17 via the browser + REST route. Expected results quoted verbatim. **6 carry
`Drift-Risk`.** Sources: 11 `Src:FDS`, 6 `Src:Code`, 2 `Src:Both`.

## Preconditions
- [ ] A draft advanced past Tab 4 — needs Tab 2 complete, ≥1 objective, and **3 office bearers** (the minimum)
- [ ] For the Control Structure cases: **an International country selected on Tab 2**
- [ ] 🔑 View mode **Live → Latest**
- [ ] Test files to hand: a `.pdf`, a `.doc`, a `.docx`, a `.jpg`, an oversized PDF, and a `.exe`/`.js`
- [ ] ⚠️ Never revisit Tab 2 once office bearers exist

## Test Cases

### TC-01 — At least one Admin & Operations item must be selected (ADO #101677 · TC-05-001)
*P2 · Negative · Src:FDS.*
- **Steps:** 1. On Admin & Operations select nothing and click **Next**
- **Expected result:** *"Validation error; navigation blocked (FDS 7.5.5 rule 1)"*
- **Assertions:** [ ] (BLOCKING) navigation blocked · [ ] RECORD whether a **message** appears
- **📌** We know `Next` is disabled with nothing selected (the 08-17 run selected *Charitable* + *Social Development* to
  release it). The open question is the **message** — expect the touched-vs-pristine pattern: blocked, silent.

### TC-02 — Control Structure only shown for international operations (ADO #101679 · TC-05-003)
*P1 · Positive · Src:FDS.*
- **Steps:** 1. Reach the Control Structure step for a **domestic-only** org
- **Expected result:** *"Step 5 either hidden/skipped or shown empty per FDS 7.5.6 'Only applicable to international operating organisations'"*
- **Assertions:** [ ] (BLOCKING) the tab is absent or empty for a domestic org · [ ] RECORD which of the two
- **📌 Already evidenced:** the 08-13 domestic journey ran **7 steps with no Control Structure tab**, so it is *hidden*,
  not *shown empty*. Formalise, then run the positive counterpart with an International country selected.

### TC-03 — Add multiple control structures / partner organisations (ADO #101680 · TC-05-004)
*P2 · Positive · Src:FDS.*
- **Steps:** 1. Add Control Structure 1 (partner org name, country, admin/ops) → 2. Add Control Structure 2
- **Expected result:** *"Added to list"* → *"Both visible in list"*
- **Assertions:** [ ] both structures persist and list · [ ] RECORD the fields the sub-form captures
- ⚠️ Needs an International country on Tab 2 (see above).

### TC-04 — Delete a country with its admin/ops (ADO #101681 · TC-05-005)
*P3 · Positive · Src:FDS.*
- **Steps:** 1. Click delete on a country row and confirm
- **Expected result:** *"Country removed (FDS 7.5.6 rule 2a)"*
- **Assertions:** [ ] the row is removed · [ ] the other rows are untouched
- **📌** Delete affordances on this build have been misleading twice — the objectives list has **no reachable delete**,
  while the office-bearer grid **does** (pencil/bin per row, easy to miss). **Screenshot before concluding either way**,
  and do not trust `offsetParent`.

### TC-05 — Disallowed file type is rejected (ADO #101684 · TC-05-008)
*P2 · Negative · Src:Both · `Drift-Risk`.*
- **Steps:** 1. Try to upload a `.exe` or `.js`
- **Expected result:** *"Upload rejected with 'File type not allowed' (whitelist: PDF, DOC/DOCX, JPG, PNG)"*
- **Assertions:** [ ] (BLOCKING) the executable is refused · [ ] the message names the file type
- **🔴 Drift note:** *"Code allowlist: only `.pdf` and `.doc` (not `.docx`, `.jpg`, `.png`). Tighter than typical."*
  So the case's own whitelist is **wrong** — see TC-13, which is the same issue from the other side.

### TC-06 — Upload over max file size is rejected (ADO #101685 · TC-05-009)
*P2 · Edge · Src:FDS · `Drift-Risk`.*
- **Steps:** 1. Upload a **50 MB** PDF
- **Expected result:** *"Upload rejected with size-limit error message"*
- **Assertions:** [ ] (BLOCKING) the oversized file is refused · [ ] a size-limit message is shown
- **🔴 Drift note:** *"Code: **no app-level document size enforcement**; only DocumentStamp images limited to 5MB."*
  **Expected to FAIL** — a 50 MB upload will probably be accepted.
- **📌** Generate the file locally rather than sourcing one; keep it inside the repo so the MCP upload sandbox allows it.

### TC-07 — Cannot proceed if a required document is missing (ADO #101686 · TC-05-010)
*P1 · Negative · Src:FDS.*
- **Steps:** 1. Skip the required Constitution and click Next
- **Expected result:** *"Required-document error; navigation blocked"*
- **Assertions:** [ ] (BLOCKING) blocked · [ ] RECORD whether a message appears
- **🔴 This case may be unexecutable for a Voluntary Association.** The Constitution is **auto-generated** for the
  Membership legal form (arrives as `… - ApplicationMembershipConstitution.pdf`), so the slot is never empty and cannot
  be skipped. **Use an NPC or Trust**, where `CoR14.3`/`CoR15.1C`/`Deeds Of Trust` are genuine manual uploads.
  ⚠️ Note Trust's two document slots are **mandatory in behaviour but carry no `*`** — a 4th unmarked-mandatory instance.

### TC-08 — Constitution can be downloaded after upload (ADO #101687 · TC-05-011)
*P3 · Positive · Src:FDS.*
- **Steps:** 1. Click the download link
- **Expected result:** *"File downloads; checksum matches the uploaded file"*
- **Assertions:** [ ] the download succeeds · [ ] (BLOCKING) the **checksum matches**
- **📌** Uploaded files render as `<name> Download Zip` in the form-item text — the platform does **not** use
  `.ant-upload-list-item`. The checksum half needs the file saved and hashed, so budget for that.

### TC-09 — Removing a document empties the slot (ADO #101688 · TC-05-012)
*P3 · Positive · Src:FDS.*
- **Steps:** 1. Click Remove and confirm
- **Expected result:** *"File is removed; slot reverts to required-empty state"*
- **Assertions:** [ ] the file is gone · [ ] the slot shows as required-empty again
- **📌** Delete **was** offered on the 08-14 upload test (`temporary:false`, delete offered), so this should be runnable.

### TC-10 — All declaration checkboxes required before Submit (ADO #101691 · TC-05-015)
*P1 · Negative · Src:FDS.*
- **Steps:** 1. Leave at least one declaration checkbox unticked and click Submit
- **Expected result:** *"Submit disabled or click is no-op with error"*
- **Assertions:** [ ] (BLOCKING) Submit is disabled with any box unticked · [ ] it enables only when **all** are ticked
- **📌 Already partly evidenced:** the Declaration tab has **9 acknowledgement checkboxes, none marked required**, and
  Submit released only at 9/9. This case makes that a formal verdict — and note the expectation *"Submit disabled"* is
  exactly what the build does, so **this one should PASS** where the Tab 2 equivalents fail.

### TC-11 — Back preserves data entered on the step (ADO #101693 · TC-05-017)
*P2 · Positive · Src:FDS.*
- **Steps:** 1. Click Back from Documents to Admin & Operations
- **Expected result:** *"Step 5 selections still present; no data lost"*
- **Assertions:** [ ] selections intact after Back
- **📌** Back-navigation is known to be **harmless**; it is the forward re-save of Tab 2 that wipes office bearers.
  Still assert it, and note in the report that Back ≠ safe on Tab 2.

### TC-12 — Submitted application becomes read-only (ADO #101694 · TC-05-018)
*P2 · Edge · Src:FDS.*
- **Steps:** 1. Navigate to the submitted application's detail view
- **Expected result:** *"All fields are read-only; submit button is gone; status visible"*
- **Assertions:** [ ] no field is editable · [ ] no Submit control · [ ] status displayed
- **🔑 Running this requires submitting an application — which also unblocks two other cases:** **TC-03-022** (XSS, needs
  the payload followed into the admin view and the generated constitution PDF) and **TC-14** below. Plan them together.
- **📌** Test read-only by **attempting an edit**, not by reading an attribute.

### ⚠️ TC-13 — Upload allowlist excludes images and modern Office formats (ADO #101697 · TC-05-021)
*P2 · Negative · Src:Code · `Drift-Risk`.* 🔑 **The highest-value case in this suite.**
- **Steps:** 1. Upload a `.docx` → 2. Upload a `.jpg`/`.png` → 3. Upload a `.pdf`
- **Expected result:** *"Rejected (allowlist is only .pdf and .doc per `StoredFileCheckerAppService.cs:47`)"* →
  *"Rejected"* → *"Accepted"*
- **Assertions:** [ ] `.docx` refused · [ ] image refused · [ ] `.pdf` accepted · [ ] RECORD the exact message for each
- **🔴 Drift note, verbatim:** *"FDS does not pin allowed file types. Code allows **ONLY .pdf and .doc**. Confirm this
  matches business intent — **if users have docx documents, they will be blocked**."*
- **❓ This is a business question, not just a test.** `.docx` has been the default Word format since 2007 and phone
  cameras produce `.jpg`. If the allowlist really is `.pdf`/`.doc`, a large share of applicants cannot attach their
  documents at all. **Raise with Thabiso and the BA regardless of the verdict**, and note that TC-05-008 (above) states
  a *different* whitelist — the two cases contradict each other.

### TC-14 — Audit trail records the original application (ADO #101696 · TC-05-020)
*P2 · Edge · Src:Both · `Drift-Risk`.* ⚠️ **Needs the admin portal.**
- **Steps:** 1. View the application audit log in the Admin Portal
- **Expected result:** *"An entry exists with the submitter, timestamp, and the submitted snapshot (original captured for later resubmission diffs)"*
- **Assertions:** [ ] an entry exists with submitter + timestamp · [ ] (BLOCKING) a **snapshot** of the submission is retained
- **🔴 Drift note:** *"Shesha `FullAuditedEntity` captures creation/modification; **explicit state-transition log not
  verified**."* The snapshot half is the doubtful one — `FullAuditedEntity` records who/when, not a point-in-time copy.
- **📌** Admin has an `Administration → Audit Logs` area; check there. This case underpins the resubmission-diff suite
  (14U), so a negative result matters beyond this suite.

### TC-15 — Country picker offers valid ISO countries (ADO #101700 · TC-05-023)
*P3 · Negative · Src:Code.* ⚠️ **Step 1 runnable; step 2 is an API call, out of scope.**
- **Steps:** 1. Open the country picker → ~~2. Direct API call with `country='ZZ'`~~
- **Expected result:** *"Shows ISO 3166 country list"* → *"Server rejects"*
- **Assertions:** [ ] the picker lists countries
- **🔴 Expect a partial failure.** The country list is **108 entries and most African countries are absent** (Botswana
  is not there) — so it is **not** a full ISO 3166 list. It is server-paged at 10 with substring search.
  ⚠️ `Ctrl+A` breaks the select and `Escape` closes the modal — select individually.

### TC-16 — Control Structure: partner org name required (ADO #101698 · TC-05-022)
*P3 · Negative · Src:Code.*
- **Steps:** 1. Add Control Structure with the partner-org name blank and save
- **Expected result:** *"Required error"*
- **Assertions:** [ ] (BLOCKING) save refused · [ ] a message is shown
- ⚠️ Needs an International country on Tab 2.

## 🔴 Closed in ADO — listed, not scheduled
Do not execute or count these until Thabiso confirms what `Closed` means here:
- **TC-05-014 (#101690)** *"Submit blocked if Full Name or Capacity is missing"* — P1. Note the build **auto-populates**
  Full Name read-only, so "leave Full Name blank" may be impossible by design; that could be *why* it was closed.
- **TC-05-024 (#101701)** *"Capacity: max length and required"* — P3. Capacity is a **dropdown**, so a 256-char string
  cannot be typed; likewise probably superseded.
- **TC-05-025 (#101702)** *"Full Name: required; rejects digits/special chars"* — P3, `Drift-Risk`. Same reason.

🔑 **These three all assume free-text Declaration fields that the build implements as read-only/dropdown** — which is
consistent with them being deliberately retired in favour of the `Sys-Obs` pair TC-05-026/027 that the smoke plan owns.
That is a coherent story, but **confirm it** rather than assume.

## Coverage against ADO

| Plan TC | ADO id | ADO TC | P | Drift | Runnable UI-only |
|---|---|---|---|---|---|
| TC-01 | #101677 | TC-05-001 | 2 | — | ✅ |
| TC-02 | #101679 | TC-05-003 | 1 | — | ✅ partly evidenced |
| TC-03 | #101680 | TC-05-004 | 2 | — | ✅ needs International |
| TC-04 | #101681 | TC-05-005 | 3 | — | ✅ needs International |
| TC-05 | #101684 | TC-05-008 | 2 | ⚠️ allowlist wrong in case | ✅ |
| TC-06 | #101685 | TC-05-009 | 2 | ⚠️ no size enforcement | ✅ expect FAIL |
| TC-07 | #101686 | TC-05-010 | 1 | — | ⚠️ use NPC/Trust, not VA |
| TC-08 | #101687 | TC-05-011 | 3 | — | ✅ |
| TC-09 | #101688 | TC-05-012 | 3 | — | ✅ |
| TC-10 | #101691 | TC-05-015 | 1 | — | ✅ expect PASS |
| TC-11 | #101693 | TC-05-017 | 2 | — | ✅ |
| TC-12 | #101694 | TC-05-018 | 2 | — | ⚠️ needs a submitted application |
| **TC-13** | **#101697** | **TC-05-021** | **2** | ⚠️ **.pdf/.doc only** | ✅ **highest value** |
| TC-14 | #101696 | TC-05-020 | 2 | ⚠️ no state-transition log | ⚠️ admin portal |
| TC-15 | #101700 | TC-05-023 | 3 | — | ⚠️ step 1 only |
| TC-16 | #101698 | TC-05-022 | 3 | — | ✅ needs International |
| *TC-05-014* | *#101690* | — | 1 | — | 🔴 **Closed in ADO** |
| *TC-05-024* | *#101701* | — | 3 | — | 🔴 **Closed in ADO** |
| *TC-05-025* | *#101702* | — | 3 | ⚠️ | 🔴 **Closed in ADO** |

**19 cases owned by this plan** (16 schedulable + 3 Closed). The suite's other four ADO members — TC-05-026/027/028/029,
all `Source-Sys-Obs` — belong to the smoke plan.

**Smoke counterparts** (plan `05-wizard-admin-docs-declaration.md`): TC-05-002, 006, 007, 013, 016, 019, 026, 027, 028, 029.

---

## ✅ Suite closed out 2026-08-18 — all 16 schedulable cases attempted
Report: `test-reports/2026-08-18/05-wizard-docs-and-03-xss--suite-close-out.md`
Application: **APPL26-01270** (Trust), **submitted** during the run.

| Case | Verdict | Note |
|---|---|---|
| TC-05-009 | ⚠️ PARTIAL | 50 MB refused by an infrastructure cap, but the rejection is **CORS-masked** so the client sees only `Network Error` — no message, and the slot falsely shows the file as attached |
| TC-05-011 | ✅ PASSED | Download byte-identical, SHA-256 matches; no `Content-Disposition`, and the filename `<a>` has no `href` |
| TC-05-012 | ✅ PASSED | Removal works; on a mandatory slot it correctly re-disables `Next` — but silently and with no `*` |
| TC-05-017 | ✅ PASSED | Back preserved both step-5 selections |
| TC-05-018 | ✅ PASSED | Read-only detail view, no Submit, status shown; only the Comments box is editable |
| TC-05-020 | 🔴 FAILED | No application audit view and **no submission snapshot** — blocks suite 14U |
| TC-05-023 | ⚠️ PARTIAL | Picker works; 108 entries, **not** ISO 3166 — Botswana/Lesotho/Eswatini/Angola/Egypt absent, `Cryprus` misspelt |

**Final suite tally: 16 attempted · 8 passed · 4 failed · 4 partial.**
The 3 ADO-`Closed` cases remain unscheduled pending Thabiso's ruling — though TC-05-014 now has incidental evidence:
**Submit enables with *Name of submitter* blank** (the field is present but hidden, and `applicationSubmitterName`
persists as `null`).
