# Test Plan: NPO-04-F — Application Wizard Tab 4: Office Bearers & Verification (functional)

> **Status:** Imported from Azure DevOps 2026-08-17 — ✅ **mostly runnable**; 4 cases need infrastructure we do not control
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
| ADO Plan | [planId 101543 — DSD-NPO Functional Test Plan](https://dev.azure.com/boxfusion/Boxfusion%20Test%20Plans/_testPlans/define?planId=101543&suiteId=101887) |
| ADO Suite | 101887 — *04 - Application Wizard - Tab 4 (Office Bearers & Verification)* (21 cases in ADO; **20 owned here**) |

## Objective
> Verify identity capture and verification for office bearers: SA ID format and checksum, DHA outcomes, passport validity, the minimum-OB rules, duplicate handling, and per-field validation in the add-OB dialog.

## ⚠️ TC-04-023 is NOT a case in this plan
Work item **#102155 (TC-04-023)** is a member of **both** suites and is **owned and already executed by the smoke
plan**. It is excluded here so the two plans do not double-count.
🔑 **Pattern worth knowing:** the cases tagged **`Source-Sys-Obs`** — the ones observed from the running system and
added later — are the ones that appear in both plans. TC-03-031, TC-03-032 and TC-04-023 are all `Sys-Obs`. Check that
tag before importing.

## 🔑 What we already know going in
From the smoke runs and the 08-14/08-17 sessions — treat as starting knowledge, re-confirm where a case depends on it:
- **DHA resolves exactly one seeded identity on QA: `8001015009087` → `Ryno Koen`.** Several other checksum-valid IDs
  returned no match, **silently** (bug `2026-08-13-dha-non-match-is-silent-on-office-bearer.md`).
- ⛔ **One further ID that resolved belongs to a real person.** It is deliberately unrecorded and **must not be
  reused**. Use `8001015009087` for the happy path and invented checksum-valid numbers for no-match cases.
- **`Is RSA ID Number` defaults UNTICKED**, so the passport variant renders first. Ticking it swaps in `SAIDNumber`,
  makes Date of Birth + Gender **derived**, and **locks the name fields** (DHA-populated only).
- **DHA masks the returned name into the visible fields** (`Ryn_ K__n`) while the hidden `First Name (s)`/`Last Name`
  pair holds the real values, and the grid shows `Ryno Koen`.
- **Each OB needs a unique mobile AND email.** A duplicate mobile raises a **transient toast** *"OB With same mobile
  number exists"* and leaves `Save` disabled — relevant to TC-11 and TC-19 below.
- ⚠️ **Plus-addressed emails are rejected** (`name+ob2@domain` → *"Please enter a valid email address"*).
- **Minimum 3 office bearers**, released at exactly 3.
- 🔴 **Never revisit Tab 2 once office bearers exist** — a Tab 2 re-save silently deletes every OB. Bug:
  `2026-08-14-org-details-resave-deletes-all-office-bearers.md`. This constrains the order of the cases below.

## ⛔ Four cases need infrastructure or API access we do not have
Per the current instruction to drive the **UI only** and not manufacture state through the app's APIs:
- **TC-05 (TC-04-006)** — needs DHA forced to 5xx
- **TC-07 (TC-04-009)** — needs CIPC forced down
- **TC-15 (TC-04-017)** — needs two app instances and the `PersonIdVerifier` job triggered on both
- **TC-18 (TC-04-020) step 2** — explicitly *"POST API with Position=999"*; **step 1 is runnable**, step 2 is not

**❓ Ask Thabiso** whether a DHA/CIPC failure can be simulated on QA. Without it, three Priority-1/2 resilience cases
stay untested — and their drift notes say the retry behaviour is **absent in code**, so they matter.

## Provenance
Imported from ADO on 2026-08-17 via the browser + REST route. Expected results quoted verbatim. All 21 cases state
`Design`; **9 carry `Drift-Risk`**. Sources: 12 `Src:FDS`, 6 `Src:Code`, 2 `Src:Both`, 1 `Src:Sys-Obs` (excluded).

## Preconditions
- [ ] A draft application advanced to **Tab 4**, which needs Tab 2 complete and **at least one objective** on Tab 3
- [ ] 🔑 View mode **Live → Latest**
- [ ] A distinct mobile number and email per OB — `0818400598` can only be used once
- [ ] 🔑 **Run TC-09/TC-10/TC-21 (the min-OB cases) FIRST, while the list is still empty**

## Test Cases

### TC-01 — Invalid SA ID format is rejected client-side (ADO #101656 · TC-04-002)
*P1 · Negative · Src:FDS.*
- **Steps:** 1. Enter SA ID `12345`, then `abcdefghijklm`, and Save
- **Expected result:** *"Field error; **no DHA call made**; OB not added"*
- **Assertions:** [ ] field error for each · [ ] (BLOCKING) **no DHA request fires** — watch the network · [ ] OB not
  added to the grid
- **📌** The no-DHA-call half is the interesting one: on Tab 2 the CIPC lookup fired **only** for a well-formed number,
  so the same gating may hold here. Capture the network to prove it either way.

### TC-02 — Checksum-failing SA ID is rejected (ADO #101657 · TC-04-003)
*P2 · Negative · Src:FDS.*
- **Steps:** 1. Enter SA ID with a bad checksum — the case supplies **`8001015009086`** — and Save
- **Expected result:** *"Field error 'Invalid ID number'; OB not added"*
- **Assertions:** [ ] (BLOCKING) a visible error naming the ID as invalid · [ ] OB not added
- **📌** Note `8001015009086` differs from the seeded valid `8001015009087` by the final check digit only — a clean
  Luhn test. **RECORD the exact message**; the case pins the wording *'Invalid ID number'*.

### TC-03 — Valid passport is accepted (ADO #101658 · TC-04-004)
*P2 · Positive · Src:FDS.*
- **Steps:** 1. Identification Type = **Passport**, number `M00123456`, expiry **in the future**, save
- **Expected result:** *"OB is saved; passport validity check passes (FDS 7.5.4 rule 1b ii)"*
- **Assertions:** [ ] OB saves · [ ] appears in the grid with the passport number
- **📌** Already exercised incidentally — the passport route is how OB2/OB3 were captured on 08-13, and **names are
  typeable** there (unlike the RSA-ID variant). This case just makes it a formal verdict.
- 🔑 Drive the expiry date picker **year → month → day**; never set it programmatically.

### TC-04 — Expired passport is rejected (ADO #101659 · TC-04-005)
*P2 · Negative · Src:FDS · `Drift-Risk`.*
- **Steps:** 1. Identification = Passport, expiry date **in the past**, save
- **Expected result:** *"Field error 'Passport expired'; OB not added"*
- **Assertions:** [ ] (BLOCKING) save is refused · [ ] the error names expiry
- **🔴 Drift note:** *"Code: `PassportExpiryDate` field exists but is **NOT validated to be in future**
  (`OfficeBearerManager.cs:379`)."* **Expected to FAIL** — a past expiry will likely save.

### ⛔ TC-05 — DHA down: OB saved and queued for background verification (ADO #101660 · TC-04-006)
*P1 · Edge · Src:FDS · `Drift-Risk`.* **Not executable — needs DHA forced to 5xx.**
- **Expected result:** *"OB is added with status 'Awaiting DHA verification'; background job will retry after one hour
  per FDS 6.1 rule 2c(i); user can still proceed with the wizard"*
- **🔴 Drift note:** *"Code: **No 1-hour scheduled DHA retry; job halts on failure.**"* So the case is expected to fail
  on the retry half even if the save half works.
- **📌** Partial evidence exists without simulation: the DHA endpoint name is still unknown (a filtered listener found
  nothing on 08-14) — **use an unfiltered network capture** while adding an RSA-ID OB to identify it. That alone is
  worth doing and unblocks reasoning about this case.

### TC-06 — DHA no-match: OB flagged 'ID Not Verified' (ADO #101661 · TC-04-007)
*P1 · Negative · Src:Both.* ✅ **Runnable.**
- **Steps:** 1. Add an OB with a **checksum-valid but DHA-unmatched** ID
- **Expected result:** *"OB shows as 'ID Not Verified' in the list with a **clear visual indicator**"*
- **Assertions:** [ ] the OB is added · [ ] (BLOCKING) the list shows an explicit not-verified indicator
- **🔴 Expected to FAIL on the indicator.** On 08-13 a DHA no-match was **completely silent**: DOB and gender still
  derived, names stayed blank, `Save` stayed disabled, no message. And the public wizard OB grid has **no
  `ID Verified` column at all** — that column exists only on the admin view (#101655 prescribes it publicly).
- **📌** Use an **invented** checksum-valid ID. ⛔ Do not reuse the real identity noted above.

### ⛔ TC-07 — CIPC down: directors not pre-populated, retry message shown (ADO #101663 · TC-04-009)
*P2 · Edge · Src:FDS · `Drift-Risk`.* **Not executable — needs CIPC forced down.**
- **Expected result:** *"User sees a non-blocking notice 'CIPC details could not be retrieved — background retry will
  run'; per FDS 6.1 rule 2b(ii) a background job retries after 1 hour"*
- **🔴 Drift note:** *"Code: CIPC failures bubble to UI with 'verification failed'; **no 1hr background retry
  scheduled**."*
- **📌 Related evidence we do have:** CIPC is up and returns `200` with `{"enterprise":[],"response_message":"Records
  found."}` for an unknown company, and the UI says **nothing**. So the *silent* path is already documented; only the
  *down* path needs simulation.

### TC-08 — Invalid CIPC number rejected at the Step 1 boundary (ADO #101664 · TC-04-010)
*P2 · Negative · Src:FDS.* ✅ **Runnable.**
- **Steps:** 1. With Legal Form = NPC, enter CIPC **`9999/999999/99`** (no such company)
- **Expected result:** *"Validation flags it; either user cannot proceed or proceeds with a **marker that CIPC lookup
  failed** — reflected on Step 3"*
- **Assertions:** [ ] (BLOCKING) either progression is blocked **or** a failure marker is carried to Tab 4 ·
  [ ] RECORD which of the two the build does
- **🔴 Expected to FAIL.** `9999/999999/99` is well-formed so the lookup will fire and return the empty-array
  *"Records found."* response, and nothing is surfaced. Neither branch of the case's *"either/or"* is satisfied.
- **📌** The entity carries **`isCipcRegNumberVerified`** (seen in the wizard's own `Crud/Get`) — check whether that
  flag is the intended "marker", and whether it is visible anywhere on Tab 4.

### TC-09 — Cannot proceed to Step 4 with zero Office Bearers (ADO #101665 · TC-04-011)
*P1 · Negative · Src:FDS · `Drift-Risk`.* ✅ **Runnable — do this first.**
- **Steps:** 1. Click **Next** with no OB added
- **Expected result:** *"Validation error 'At least one Office Bearer required'"*
- **Assertions:** [ ] (BLOCKING) navigation blocked · [ ] RECORD whether a **message** appears
- **🔴 Drift note:** *"Code: no app-level min-OB validation found."*
- **📌** We know the UI **does** block below 3 and releases at exactly 3, so the *blocking* almost certainly passes.
  The open question is the **message** — on Tab 2 empty-required produced none at all, while Tab 3 showed a note.
  **This case is the tie-breaker for which pattern Tab 4 follows.**

### TC-10 — Minimum-OB rule by legal form is enforced (ADO #101666 · TC-04-012)
*P2 · Edge · Src:FDS · `Drift-Risk`.* ✅ **Runnable.**
- **Steps:** 1. Add fewer than the legal form's minimum (the case cites **NPC requires 3 directors**) and click Next
- **Expected result:** *"Validation message **naming the minimum required**"*
- **Assertions:** [ ] blocked · [ ] (BLOCKING) the message states the number
- **🔴 Drift note:** *"Code: legal-form-based OB minimum **NOT enforced** (`NumberOfOfficeBearers` is just a stored
  value)."*
- **📌** The build enforces a **flat minimum of 3 regardless of legal form**. So the flat rule may mask the missing
  per-form rule: test a **Trust** or **VA**, where the minimum might legitimately differ, and see whether 3 is still
  demanded. **❓ What are the per-form minimums? Neither plan states them.**

### TC-11 — Cannot add the same SA ID twice on one NPO (ADO #101667 · TC-04-013)
*P2 · Edge · Src:FDS · `Drift-Risk`.* ✅ **Runnable.**
- **Steps:** 1. With an OB already saved on ID `Z`, add another OB using ID `Z`
- **Expected result:** *"Duplicate-OB error; not added"*
- **Assertions:** [ ] (BLOCKING) the second save is refused · [ ] the error says *duplicate*
- **🔴 Drift note:** *"Duplicate-OB-by-ID prevention not verified in code."*
- **📌** We know **duplicate mobile IS blocked** (transient toast, `Save` disabled). Since only `8001015009087`
  resolves on DHA, use it for both attempts — but give the second OB a **different mobile and email**, or the mobile
  rule will block it first and the test will prove nothing about the **ID** rule. **Isolate one variable.**

### TC-12 — Editing an OB keeps DHA verification if the ID is unchanged (ADO #101668 · TC-04-014)
*P3 · Edge · Src:FDS.* ✅ **Runnable.**
- **Steps:** 1. On an already DHA-verified OB, edit **phone/email only** (not the ID), save
- **Expected result:** *"OB still shows ID-verified; **no re-DHA call** triggered for unchanged ID"*
- **Assertions:** [ ] verification status retained · [ ] (BLOCKING) **no DHA request** on save — capture the network
- **📌** Verification status is not shown in the public grid, so "still shows ID-verified" may only be checkable on the
  admin view — which needs the application submitted. **Assert the no-extra-call half here** and defer the display half.

### TC-13 — An OB may serve on more than one NPO (ADO #101669 · TC-04-015)
*P3 · Edge · Src:Both.* ✅ **Runnable.**
- **Steps:** 1. On a **new** application for a different NPO, add an OB with the same ID `Z` used elsewhere
- **Expected result:** *"Allowed (FDS Assumption: OBs can be on more than one NPO); DHA verification **re-evaluates per
  application**"*
- **Assertions:** [ ] the OB is accepted on the second application · [ ] a DHA evaluation occurs again for it
- **📌** `Ryno Koen` (`8001015009087`) is already an OB on `333-018-NPO` and `333-019-NPO`, so this is **already
  evidenced** — confirm and formalise rather than re-derive. Note it also implies the TC-11 duplicate rule is
  **per-application**, not global.

### TC-14 — Email and phone required for every OB (ADO #101670 · TC-04-016)
*P1 · Negative · Src:FDS.* ✅ **Runnable.**
- **Steps:** 1. Add an OB without an email → 2. Add an OB without a phone
- **Expected result:** *"Email required error"* → *"Phone required error — since OB confirmation goes via email/SMS"*
- **Assertions:** [ ] (BLOCKING) each omission is refused · [ ] each shows its **own** message
- **📌 This is the Tab 4 equivalent of TC-03-003** and the most direct read on whether the advisory-validation problem
  is form-wide or specific to Tab 2. Both fields are marked `*`; the question is purely whether a message appears.
- **📌** The business reason is load-bearing: OB self-confirmation is sent by email/SMS, and only 1 of 3 OBs was
  verifiable on 08-13 because the other two used unreadable addresses.

### ⛔ TC-15 — Only one PersonIdVerifier job runs at a time (ADO #101671 · TC-04-017)
*P2 · Edge · Src:Code · `Drift-Risk`.* **Not executable — needs two instances and job triggering.**
- **Expected result:** *"Only one verifier proceeds; the other logs 'PersonIdVerifier is already processing' and skips
  — no race / no double DHA call"*
- **📌** Drift note says concurrency control is via `Interlocked.Exchange` (`PersonIdVerifier.cs:48-49`) and that this
  is **not in the FDS**. Verifying it needs server logs, not the UI. **Hand to a developer** rather than leaving it
  open in a QA plan.

### TC-16 — OB First Name: required, min 2, whitespace trimmed (ADO #101672 · TC-04-018)
*P2 · Negative · Src:Code.* ✅ **Runnable (passport variant only).**
- **Steps:** 1. Leave First Name empty, save → 2. Enter `' John '` with surrounding spaces
- **Expected result:** *"Required error"* → *"Accepted; **whitespace trimmed on save**"*
- **Assertions:** [ ] required enforced · [ ] (BLOCKING) the saved value has **no leading/trailing space** — read it
  back from the grid
- **🔑 Must use the PASSPORT variant** — on the RSA-ID variant the name fields are **locked** and DHA-populated, so
  neither branch is testable there. Say so in the report.
- **📌** Also test the case's min-length 2 claim; on Tab 2 the analogous Organisation Name min-length was **not**
  enforced, so expect the same here.

### TC-17 — OB Surname: special characters (ADO #101673 · TC-04-019)
*P3 · Edge · Src:Code.* ✅ **Runnable (passport variant).**
- **Steps:** 1. `van der Merwe` → 2. `O'Brien` → 3. empty
- **Expected result:** accepted → *"Accepted (apostrophe allowed)"* → required error
- **Assertions:** [ ] both names accepted and stored **unaltered** · [ ] empty refused
- **📌** The apostrophe case is worth following further: it is the natural partner to the XSS case (TC-03-022) and to
  the auto-generated constitution PDF, where an unescaped apostrophe often surfaces.

### TC-18 — OB Position picker: only reference-list values accepted (ADO #101674 · TC-04-020)
*P3 · Negative · Src:Code.* ⚠️ **Step 1 runnable; step 2 is an API call and out of scope.**
- **Steps:** 1. Open the Position picker → ~~2. POST the API with `Position=999`~~
- **Expected result:** *"Shows defined positions (Chairperson, Secretary, Treasurer, Director, Trustee, Member)"* →
  *"Server rejects invalid enum value"*
- **Assertions:** [ ] the picker lists exactly the allowed values
- **🔴 The live list does not match the case.** Observed on 08-13: **Director · Secretary · Chairperson · Trustee ·
  Trust · President · Deputy Chairperson · Treasurer · Additional Member** — that is **9** values where the case names
  **6**, it omits *Member*, and it includes a probable duplicate **`Trust`** alongside *Trustee*. **Reconcile with
  Thabiso: which list is authoritative?**
- **📌** Step 2 needs a direct API POST; skip it under the current UI-only instruction and flag it as a developer check.

### TC-19 — OB phone: SA format required (ADO #101675 · TC-04-021)
*P2 · Negative · Src:Code.* ✅ **Runnable.**
- **Steps:** 1. `0820001234` → 2. `abc` or `0123`
- **Expected result:** *"Accepted"* → *"Format error"*
- **Assertions:** [ ] valid accepted · [ ] both invalids refused
- **🔴 Expect the Tab 2 pattern to repeat:** organisation phone fields enforce **length only** (`maxLength=10`, no
  numeric check — `abcdefghij` passed) and truncate silently. **Check the OB field's `maxLength` and try ten letters**;
  if it behaves the same, this is one shared defect rather than two.

### TC-20 — OB email: format check; duplicate across OBs (ADO #101676 · TC-04-022)
*P2 · Negative · Src:Code · `Drift-Risk`.* ✅ **Runnable.**
- **Steps:** 1. Second OB with email `invalid` → 2. Second OB with the **same** email as an existing OB
- **Expected result:** *"Format error"* → *"**Allowed** by code (no duplicate-email check found); flag for QA review"*
- **Assertions:** [ ] format error on `invalid` · [ ] RECORD whether the duplicate is accepted or refused
- **🔴 Drift note:** *"No duplicate-OB-email check found in code; FDS does not forbid. **Confirm with BA** whether
  duplicates should be allowed."*
- **📌 We have contrary observational evidence:** on 08-13 a duplicate **mobile** was refused with *"OB With same mobile
  number exists"*. If email is allowed while mobile is not, that asymmetry is itself the finding — and it matters,
  because OB self-confirmation is sent to the email.
- ⚠️ Remember **plus-addressing is rejected**, so do not use `name+ob2@` to generate distinct addresses.

## Coverage against ADO

| Plan TC | ADO id | ADO TC | P | Drift | Runnable UI-only |
|---|---|---|---|---|---|
| TC-01 | #101656 | TC-04-002 | 1 | — | ✅ |
| TC-02 | #101657 | TC-04-003 | 2 | — | ✅ |
| TC-03 | #101658 | TC-04-004 | 2 | — | ✅ |
| TC-04 | #101659 | TC-04-005 | 2 | ⚠️ expiry not validated | ✅ expect FAIL |
| TC-05 | #101660 | TC-04-006 | 1 | ⚠️ no 1hr retry | ⛔ needs DHA down |
| TC-06 | #101661 | TC-04-007 | 1 | — | ✅ expect FAIL |
| TC-07 | #101663 | TC-04-009 | 2 | ⚠️ no 1hr retry | ⛔ needs CIPC down |
| TC-08 | #101664 | TC-04-010 | 2 | — | ✅ expect FAIL |
| TC-09 | #101665 | TC-04-011 | 1 | ⚠️ no min-OB check | ✅ **run first** |
| TC-10 | #101666 | TC-04-012 | 2 | ⚠️ per-form min not enforced | ✅ |
| TC-11 | #101667 | TC-04-013 | 2 | ⚠️ unverified in code | ✅ |
| TC-12 | #101668 | TC-04-014 | 3 | — | ⚠️ partly — display half needs admin |
| TC-13 | #101669 | TC-04-015 | 3 | — | ✅ already evidenced |
| TC-14 | #101670 | TC-04-016 | 1 | — | ✅ **key case** |
| TC-15 | #101671 | TC-04-017 | 2 | ⚠️ not in FDS | ⛔ needs 2 instances |
| TC-16 | #101672 | TC-04-018 | 2 | — | ✅ passport variant only |
| TC-17 | #101673 | TC-04-019 | 3 | — | ✅ passport variant |
| TC-18 | #101674 | TC-04-020 | 3 | — | ⚠️ step 1 only |
| TC-19 | #101675 | TC-04-021 | 2 | — | ✅ |
| TC-20 | #101676 | TC-04-022 | 2 | ⚠️ no dup-email check | ✅ |

**20 cases owned by this plan.** The suite's 21st ADO member — **#102155 / TC-04-023** — belongs to the smoke plan and
was executed on 2026-08-13.

**Smoke counterparts** (plan `04-wizard-office-bearers.md`): TC-04-001, TC-04-008, TC-04-023.
