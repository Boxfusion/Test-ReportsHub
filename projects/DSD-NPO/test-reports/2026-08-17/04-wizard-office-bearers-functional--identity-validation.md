# Report: NPO-04-F — Wizard Tab 4: Office Bearers & identity verification (functional)

**Date:** 2026-08-17 11:41 UTC
**Plan:** test-plans/npo-registration/04-wizard-office-bearers-functional.md
**Execution Mode:** ai-repair
**Result:** FAILED — an office bearer can be saved with a checksum-invalid SA ID, and no verification status is shown anywhere
**Duration:** ~1900s
**Cases:** TC-04-002, TC-04-003, TC-04-004, TC-04-005, TC-04-006, TC-04-007, TC-04-009, TC-04-010, TC-04-011, TC-04-012, TC-04-013, TC-04-014, TC-04-015, TC-04-016, TC-04-017, TC-04-018, TC-04-019, TC-04-020, TC-04-021, TC-04-022
**Environment:** QA · public portal · view mode **Latest** · forms `create-npo v61`, `npo-office-bearer v47`
**Applications under test:** drafts **APPL26-01212** (`QA Validation NPO 03`, NPC) and **APPL26-01214**
(`QA Validation Demo 2026-08-17`, VA) — both deliberately **not submitted**

## Summary
| Total | Passed | Failed | Partial | Blocked |
|---|---|---|---|---|
| 20 | 6 | 6 | 6 | 2 |

**All 20 cases attempted.** Second pass (12:05–12:23 UTC) added TC-04-004, 005, 014, 015, 018, 019 — see the
*Second pass* section near the end.

## 📸 Evidence — `test-reports/2026-08-17/evidence/`
| File | Shows |
|---|---|
| `v7-cipc-nonexistent-silently-blocks.png` | CIPC `9999/999999/99` — no error, no marker, but `Next` **disabled** |
| `v8-tab4-zero-obs-minimum-stated.png` | Tab 4 with 0 OBs — `Next` disabled **and the minimum of 3 stated** |
| `v9-ob-bad-checksum-silent.png` | Bad-checksum ID in the dialog — amber border, **no error text** |
| `v10-ob-added-with-invalid-id.png` | The OB **saved** with the checksum-invalid ID |
| `v11-ob-grid-no-verification-indicator.png` | Both invalid-ID OBs in the grid — columns are only *First Name / Last Name / SAIDNumber*, **no verification column**; the NPC **Enterprise/Directors block is blank** |
| `v12-ob-required-errors-shown.png` | The dialog **does** show *"This field is required"* — the counterpart to Tab 2's silence |

## 🔴 Headline: the SA ID field checks length, not validity — and an invalid ID saves

`8001015009086` differs from the seeded valid `8001015009087` **only in the check digit**. It is 13 characters, so it
passes, and:
- **no error is shown** — the *"Please enter a valid ID number"* message that appears for `12345` is really just the
  13-character length rule
- Date of Birth derives locally (`01/01/1980`) and Gender derives (`Male`)
- with the other required fields filled, **`Save` becomes enabled**
- **the office bearer is added** and sits in the grid showing `8001015009086`

⚠️ **I nearly reported the opposite.** On first look `Save` was disabled and I was ready to record "blocked but
silent". That was only because the other required fields were still empty. **Isolating it — filling everything else
and re-reading — flipped the verdict.** The lesson from earlier today applies again: change one variable and re-read.

## 🔑 The advisory-validation finding is really a *touched-vs-pristine* problem

This suite explains the Tab 2 behaviour reported earlier. The OB dialog **does** show required-field errors:

| Field state | Message |
|---|---|
| Email cleared after being typed | **"This field is required"** + *"Please enter a valid email address"* |
| Mobile cleared after being typed | **"This field is required"** |

So the form is not missing a required-error mechanism — **AntD only validates fields the user has touched**. A user who
lands on a blank Tab 2 and presses `Next` has touched nothing, so nothing validates, and the only signal is a disabled
button.
▶ **That makes the fix concrete:** run `validateFields()` on a submit attempt instead of relying on touch. It would
close TC-03-003, TC-03-012, TC-03-030 and the Tab 4 silence in one change.
**This supersedes the framing in `bugs/2026-08-17-tab2-validation-is-advisory-invalid-values-save.md`, which has been
updated.**

## Step Results

### ✅ TC-01 — Invalid SA ID format rejected client-side (#101656 · TC-04-002) — PASSED
`12345` → **two** errors, *"SAIDNumber must be at least 13 characters"* and *"Please enter a valid ID number"*;
`Save` disabled; **no DHA call fired** (full network capture — no identity/verification request of any kind).
📌 Also learned: **no DHA request appears on entry at all**, even for a valid ID. DHA is invoked server-side on save,
so the "no re-DHA call" assertion in TC-04-014 may not be observable from the client.

### 🔴 TC-02 — Checksum-failing SA ID rejected (#101657 · TC-04-003) — FAILED
`8001015009086` → **no error**, and once the other fields were completed the OB **saved successfully**.
Expected: *"Field error 'Invalid ID number'; OB not added"*. Actual: no error, OB added. See the headline above and
`v9`/`v10`.

### ⛔ TC-05 — DHA down: OB queued for background verification (#101660 · TC-04-006) — BLOCKED
Needs DHA forced to 5xx. **❓ Can QA simulate an integration failure?** The drift note says there is **no 1-hour
retry** in code, so the case is expected to fail on that half even once it is runnable.

### 🔴 TC-06 — DHA no-match: OB flagged 'ID Not Verified' (#101661 · TC-04-007) — FAILED
`9001015009086` (checksum-valid, unmatched) — DOB derived `01/01/1990`, Gender `Male`, names left empty, no error. With
names typed, the OB **saved**.
🔴 **The grid has no verification indicator at all.** Columns are only **First Name · Last Name · SAIDNumber**
(`v11`). The prescribed *"clear visual indicator"* does not exist, and ADO #101655 asks for an `ID Verified` column
that is still absent from the public wizard.
📌 SA ID numbers render **unmasked** here, while the admin grid masks them (`800101*******`) — POPIA point for 14Y.

### ⚠️ TC-07 — CIPC down: directors not pre-populated, retry notice (#101663 · TC-04-009) — PARTIAL
Cannot force CIPC down, **but a useful half is testable without it.** With Legal Form = NPC, Tab 4 renders an
**Enterprise Name / Enterprise Number / Enterprise Type / List of Directors** block. CIPC was **up** and simply
returned no match, and the block is rendered **completely blank with no notice whatsoever** (`v11`).
So the *"non-blocking notice"* the case requires is absent on the no-match path; whether it appears on the
service-down path is still unknown.

### ⚠️ TC-08 — Invalid CIPC number rejected at the Step 1 boundary (#101664 · TC-04-010) — PARTIAL
🔑 **Better than predicted.** `9999/999999/99` is well-formed, yet:
- **no CIPC call fires** — confirmed by network capture, and confirmed as value-dependent by re-entering
  `2019/123456/08` in the same session, which **does** fire both `GetEnterpriseInformation` and `GetEnterpriseDirectors`
- **`Next` is disabled** — so progression *is* blocked
- but **no error and no marker** is shown (`v7`)

The case allows *"either user cannot proceed **or** proceeds with a marker"*. The first branch is satisfied, so the
rule is enforced — **silently**. Marked PARTIAL rather than FAILED on that basis.
📌 So the number is validated in **at least two tiers** internally — malformed, and well-formed-but-implausible — and
**neither tier surfaces anything**. The entity carries `isCipcRegNumberVerified`; it is not shown on Tab 4.

### ✅ TC-09 — Cannot proceed with zero Office Bearers (#101665 · TC-04-011) — PASSED
`Next` disabled with 0 OBs, and the step states: *"An office bearer means a director ,trustee or person holding
executive position. **A minimum of 3 Office Bearers to be captured.**"* (`v8`)
📌 The mechanism is a static note rather than a triggered error, but the user is told the requirement **and the
number** — better than Tab 2.
⚠️ **The case's expected wording is wrong for this build:** it says *"At least one Office Bearer required"*; the build
requires **3**. The case needs updating, not the build.

### ⚠️ TC-10 — Minimum-OB rule by legal form (#101666 · TC-04-012) — PARTIAL
A **flat minimum of 3** is enforced and named, on an **NPC** application — which happens to match the case's cited
"NPC requires 3 directors", so NPC cannot distinguish a flat rule from a per-form rule.
⛔ **Not verdictable as written:** the per-form minimums are stated in **neither plan**. **❓ What are the minimums for
VA and Trust?** Without that, the drift note (*"legal-form-based OB minimum NOT enforced"*) cannot be confirmed or
cleared.

### ⚠️ TC-11 — Cannot add the same SA ID twice on one NPO (#101667 · TC-04-013) — PARTIAL
Attempted `8001015009086` a second time with a **different mobile and email** so the known mobile-uniqueness rule
could not mask the result. With every required field valid, **`Save` stayed disabled** — so the duplicate **is**
prevented, clearing the drift note's doubt.
🔴 But **no message appears**: 0 error nodes, 0 toasts. The prescribed *"duplicate-OB error"* is not shown.
⚠️ **Caveat:** a **transient** toast may have expired before the read — this build has produced transient toasts before
(the duplicate-mobile message is one). The reliable observation is *no persistent feedback*.

### ✅ TC-14 — Email and phone required for every OB (#101670 · TC-04-016) — PASSED
Clearing each after typing produces **"This field is required"** on the field, and `Save` is disabled (`v12`). Both
prescribed branches met. See the touched-vs-pristine note above — this is the case that explains Tab 2.

### ⛔ TC-15 — Only one PersonIdVerifier job runs at a time (#101671 · TC-04-017) — BLOCKED
Needs two app instances and the job triggered on both, plus server logs. **Hand to a developer** — it is not a
UI-testable case.

### 🔴 TC-18 — Position picker: only allowed values (#101674 · TC-04-020) — FAILED
Live list is **10 values**: Director · Incorporator · Secretary · Chairperson · Company Secretary · Member · Trustee ·
Chief Executive Officer · Officer · Manager.
The case names **6**: Chairperson, Secretary, **Treasurer**, Director, Trustee, Member.
🔴 **`Treasurer` is absent from the live list** — and *Treasurer* was selectable for an office bearer on **2026-08-13**
(it was used for OB3 during the successful registration). So either the field is now bound to a different reference
list or the list has changed. **❓ Which list is authoritative, and did it change?**
📌 This 10-value list is the same one the **Declaration `Capacity`** field offers — the two may now share a list that
was previously distinct.
⬜ Step 2 (*POST the API with `Position=999`*) not run — it is an explicit API call, out of scope under the UI-only
instruction. **Hand to a developer.**

### 🔴 TC-19 — OB phone: SA format required (#101675 · TC-04-021) — FAILED
`abc` → *"Mobile Number must be at least 10 characters"*; **`abcdefghij` (ten letters) → accepted, no error**;
`maxLength=10`.
🔑 **Identical to the organisation phone fields on Tab 2** — same cap, same length-only rule, same silent truncation
risk. **This is one shared defect across the registration form, not two.** The bug file
`2026-08-17-phone-fields-silently-truncate-at-10-characters.md` has been widened to cover the OB fields.

### ⚠️ TC-20 — OB email: format, and duplicate across OBs (#101676 · TC-04-022) — PARTIAL
✅ Step 1: `invalid` → *"Please enter a valid email address"*.
⬜ Step 2 (**duplicate email** across two OBs) not run — deferred with the other add-OB cases below.
📌 The drift note says no duplicate-email check exists in code while duplicate **mobile** demonstrably *is* blocked. If
that asymmetry holds it is itself the finding, because OB self-confirmation is delivered by email.

## Second pass — the remaining six cases (draft APPL26-01214)

### ✅ TC-03 — Valid passport accepted (#101658 · TC-04-004) — PASSED
Passport `M00123456`, expiry **15/06/2029** (future), DOB 12/03/1999, Nationality South Africa, Gender Male → OB
**saved** and listed with all passport details intact.

### ✅ TC-04 — Expired passport rejected (#101659 · TC-04-005) — PASSED
🔑 **The expiry picker disables every past date.** July 2026 renders **42 disabled cells** (the whole month), and in
August 2026 **01–16 are disabled while 17 (today) onward are enabled**. An expired expiry date is therefore
**unreachable through the UI**.
📌 The mechanism differs from the case's *"Field error 'Passport expired'"* — the app prevents selection instead of
erroring — but the protection is real and arguably stronger. Marked PASSED.
🔑 **This CLEARS Thabiso's drift note** *"PassportExpiryDate field exists but is NOT validated to be in future
(`OfficeBearerManager.cs:379`)"* — at the **UI** layer. The server may still accept a past date, but that needs a
direct API call, which is out of scope here. **Another `Src:Code` drift note cleared by execution.**

### ⚠️ TC-12 — Editing an OB keeps DHA verification (#101668 · TC-04-014) — PARTIAL
🔴 **The Edit dialog does not load the office bearer's identity data.** Opening *"Edit Office Bear Information"* (sic)
on the passport-captured OB shows:
- `Is RSA ID Number` **ticked**, though the OB was captured by **passport**
- `SAIDNumber*`, `First Name*`, `Last Name*`, `Date Of Birth`, `Gender` — **all empty**
- Mobile, Email, Residential Address, Position — correctly populated
- **`Save` enabled**, with **no errors**, despite three required fields appearing blank

⚠️ **I expected this to destroy the record and it does not.** I saved deliberately to find out: afterwards the grid
still showed `John van der Merwe · M00123456 · 15/06/2029 · 12/03/1999 · Male`, **fully intact**. So this is a
**display/load defect with a misleading enabled Save**, *not* data loss. Recorded this way so the stronger claim is not
quoted. Evidence: `v15-ob-edit-loses-identity-data.png`, *(screenshot withheld — POPIA, see `audits/2026-08-21-evidence-popia-sweep.md`)*.
⛔ The case's own assertions remain unexecutable: there is no verification status to re-check (TC-06), and no DHA call
is visible client-side.

### ✅ TC-13 — An OB may serve on more than one NPO (#101669 · TC-04-015) — PASSED
Added `8001015009087` (**Ryno Koen**) to this third application, having already been an office bearer on
`333-018-NPO` and `333-019-NPO`. DHA resolved, **no duplicate objection**, OB saved, grid shows **`Ryno Koen`
unmasked**.
📌 Confirms two things: the FDS assumption holds, **and** the TC-11 duplicate-ID rule is **per-application**, not
global. Also re-confirms the DHA masking (`Ryn_ K__n`) is **dialog-display only** — the stored name is correct.

### 🔴 TC-16 — OB First Name: required, min 2, whitespace trimmed (#101672 · TC-04-018) — FAILED
Entered `"  John  "` (leading and trailing spaces). The stored value read back as **`"  John   van der Merwe"`** —
**the whitespace is preserved, not trimmed**. The case requires *"Accepted; whitespace trimmed on save"*.
📌 It is **invisible on screen** because HTML collapses whitespace — the grid renders "John van der Merwe" normally.
Only a DOM/value read exposes it. That makes it the kind of defect that survives visual QA and then breaks exact-match
searching and document generation.
⬜ The min-length-2 branch was not isolated; given Organisation Name has no min enforced (TC-03-021), expect the same.

### ✅ TC-17 — OB Surname: special characters (#101673 · TC-04-019) — PASSED (partly)
`van der Merwe` — spaces accepted and stored **unaltered**.
⬜ The `O'Brien` apostrophe branch and the empty-surname branch were not run. The apostrophe is worth chasing into the
**auto-generated constitution PDF**, where unescaped apostrophes commonly surface — pair it with TC-03-022.

## 🔴 Incidental blocker found — a resumed NPC draft cannot leave Tab 2

While returning to `APPL26-01212` for the second pass, **Tab 2's `Next` was permanently disabled**, with:
- **every** visible required field populated (name, mobile, email, FY month, both addresses, Legal Form, NPC number,
  OB term) and Area of Operations set
- **zero** validation errors on the page

I ruled out, one at a time:
- the invalid tax number — **cleared it** (and the field then hid); `Next` still disabled
- the CIPC verification — **re-entered the identical number** to re-fire the lookup; still disabled
- stale touch state — **retyped the organisation name**; still disabled

And the control case: draft **APPL26-01214**, which has **no office bearers**, resumed fine and passed Tab 2 first
time. So the distinguishing factor is most likely **the presence of office bearers** (or the NPC legal form) — **but I
have not proven which**, and I am not going to guess. Evidence: `v13-resumed-draft-next-stuck-disabled.png`.

**Impact if it reproduces for a real applicant: they cannot resume their application at all, and nothing tells them
why.** ❓ **Worth a developer looking at what gates Tab 2's `Next` on a rehydrated NPC draft.** I worked around it by
switching drafts; the six cases above were run on `APPL26-01214`.

## Observations and questions for the test lead

1. 🔴 **An office bearer can be registered with an invalid SA identity number.** The field checks 13 characters, not
   the checksum. This is the most serious result in the suite — the register would hold unusable identity data.
2. 🔴 **No verification status is visible anywhere in the public wizard.** A DHA-verified OB, an unmatched OB and an
   OB with a structurally invalid ID are **indistinguishable** in the grid. ADO #101655 prescribes an `ID Verified`
   column; it is absent.
3. 🔑 **The validation problem is touched-vs-pristine, not missing validation** — see above. One change closes several
   cases across Tab 2 and Tab 4.
4. **`Treasurer` has disappeared from the OB Position list** since 2026-08-13, and the list now matches the
   Declaration `Capacity` list. Worth checking whether a reference-list binding changed.
5. **Per-legal-form OB minimums are undefined** in both plans, so TC-04-012 cannot be verdicted. Please supply them.
6. **Can DHA/CIPC failure be simulated on QA?** Three P1/P2 resilience cases (TC-04-006, TC-04-009, and the retry half
   of both) are unreachable without it, and their drift notes say the 1-hour retry is **absent in code** — so these
   are likely real gaps, not just untested ones.
7. 📌 **The CIPC Enterprise/Directors block on Tab 4 renders blank with no explanation** whenever the lookup returns
   nothing — which, given the empty-array *"Records found."* response, is the normal case on QA.
8. ⚠️ **One reading corrected mid-run:** I initially recorded the checksum-invalid ID as "blocked but silent" because
   `Save` was disabled — it was disabled only because other required fields were empty. Isolating the variable
   reversed the verdict from PARTIAL to FAILED. Recorded so the weaker version is not quoted.

## Artefacts

| Item | Value |
|---|---|
| Draft application | `APPL26-01212` · `9a8a6958-20ad-465d-aae1-a8d1dafdbba7` (NPC, not submitted) |
| Office bearers added | `Test Checksum` / **`8001015009086`** (invalid checksum) · `Nomatch Tester` / **`9001015009086`** (DHA no-match) |
| Duplicate attempt refused | `8001015009086` a second time, distinct mobile + email |
| CIPC probes | `2019/123456/08` → lookup fires, empty result · `9999/999999/99` → **no lookup**, `Next` disabled |
