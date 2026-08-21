# Report: Smoke plan 101541 — re-run of the FAILED cases, part 2 (the 6 setup-bound cases)

**Date:** 2026-08-21 05:50 UTC
**Plan:** test-plans/npo-registration/register-new-npo.md
**Execution Mode:** ai-driven (Playwright MCP, live QA public portal)
**Result:** PARTIAL — all 6 remaining failed cases re-run: **1 now PASSES (TC-10-006)**, **4 confirmed FAIL with corrected root causes**, **1 partially re-verdicted (TC-08-007)**. Two earlier headlines are corrected: asset transfer *does* exist, and validation errors *are* announced
**Duration:** ~1750s
**Cases:** TC-05-029, TC-08-007, TC-08-011, TC-10-006, TC-13-005, TC-14W-001
**Environment:** QA · public portal, signed in · view mode **Latest**

## Why this run
This completes the re-verification started on 2026-08-20. Those 13 smoke FAILs were recorded 08-13 → 08-18; 7 were
re-run yesterday and 6 were left as *setup-bound*. All 6 are now run. The new registered NPO **333-022-NPO**
unblocked the TC-10 and TC-13 families as expected, and an existing draft annual report on **333-019-NPO** turned
out to unblock the TC-08 pair, which had been assumed blocked.

## Summary
| Case | Recorded | Re-run verdict | Change |
|---|---|---|---|
| **TC-10-006** Step 2 old vs new values | 🔴 FAIL | ✅ **PASS** | **CHANGED — withdraw the failure for the General/Office-Bearer branch** |
| TC-13-005 Receiving NPO search | 🔴 FAIL | 🔴 FAIL | confirmed, **root cause corrected** |
| TC-05-029 Draft survives logout | 🔴 FAIL | 🔴 FAIL | confirmed, **narrowed — data persists, the tab position does not** |
| TC-08-011 OBs still apply | ⛔ assumed blocked | 🔴 **FAIL** | **now actually executed** |
| TC-08-007 Step 1 org details read-only | ⛔ assumed blocked | ⚠️ **PARTIAL** | **now actually executed** — blocking assertion passes, the case's own steps are unperformable |
| TC-14W-001 Keyboard-only navigation | 🔴 FAIL | 🔴 FAIL | confirmed, **but the predicted reason was wrong** |

---

## ✅ TC-10-006 — now PASSES. Withdraw the failure for this branch.
Run on **333-022-NPO** → *Post Registration* → change request **POST1424/21/08/2026** (General Change → Office
Bearer). ADO #101767 prescribes verbatim: *"Selected change type shown; current values displayed **read-only**; new
value fields **editable**"* then *"Changes saved; navigation to Step 3"*. All four clauses hold:

| # | Assertion | Result |
|---|---|---|
| 1 | Change type carries through from Step 1 | ✅ Step 2 renders under the heading **Office Bearer Change** |
| 2 | **(BLOCKING)** current values read-only, new-value fields editable | ✅ see below |
| 3 | New values persist after Next | ✅ verified against the persisted entity |
| 4 | Navigates to Step 3 | ✅ lands on **Declaration and Documents** |

**On assertion 2, tested by attempting an edit as the plan requires.** The Step-2 grid of current office bearers has
**no input controls at all** — it is read-only by construction. Inside *Edit Office Bearer*, `Full Name`,
`Nationality`, `Gender` and the ID number render as **plain text with no control**, while `Residential Address`,
`Work Address`, `Mobile Number`, `Home Number`, `Whatsapp Number`, `Email Address` and `Position` are editable
inputs. That is precisely the read-only/editable split the case asks for.

**Assertion 3 verified against the persisted entity, not the UI.** Changing one office bearer's mobile number and
saving produced:
- `ChangeRequestOfficeBearer` (new record) → **`newCellNumber` = the new value**, and it still held that value after
  pressing Next;
- the live `Person` record → **`mobileNumber1` unchanged, `lastModificationTime: null`**.

⇒ **The change is correctly staged and the live record is not mutated before approval.** There is no data-integrity
problem here.

### Why this differs from the 08-13 FAIL — it is branch-specific
The 08-13 run exercised the **Foundational Change → organisation name** branch, where the Update step renders *one
editable field pre-filled with the current value* (`readOnly: false`) — no read-only current value, and the original
is lost once typed over. That finding is **not withdrawn**; it was not re-testable today (see the dead-end below).
**TC-10-006 passes on the General/Office-Bearer branch and its 08-13 failure stands for the Foundational branch.**
Two branches of one case behave differently, which is worth saying explicitly rather than giving the case a single
verdict.

### 🔴 New finding — a wrong change type is unrecoverable
The Post Registration table blocks a second request with:
> *"Oops you it seems already have a change request that either left on Draft or one that is still Inprogress … please
> go back to the dashboard to complete and submit that change request **or delete it so you can create a new one!**"*

- The dashboard resume route **works** — a **Draft Post Registration** marker appears and reopens the wizard.
- **There is no delete.** The row's only action is a **view** link; the details page offers no delete either.
- The **Type Of Change radios are all `disabled`** once you pass Step 1, so the type cannot be corrected in place.

⇒ A user who picks the wrong change type can neither change it, nor delete the draft, nor raise a different request.
Both of our registered NPOs (333-019 and 333-022) are now in exactly that state. The instruction the product gives
is not one the product supports.

### Other observations from this wizard
- **General Change offers exactly one sub-option** — *Office Bearer & Number Of Office Bearer*.
- That sub-option's **checkbox carries no `*` and gates `Next`** — another instance of
  `bugs/2026-08-20-unstarred-mandatory-fields-silently-gate-next-and-save.md`.
- The submitter's change-request details page shows a **Change Details → Office Bearer Change** heading with **no
  values under it** — neither old nor new. That is the submitter-side half of
  `bugs/2026-08-13-change-request-values-not-displayed.md`, now confirmed on a second change type.
- The grid always shows the **current** values; after saving a change the only visible signal is the Change Type
  column flipping **ADDED → UPDATED**. The new value is never rendered anywhere in the UI.
- `Passport Number` is **starred mandatory in the Edit OB modal but renders no input control** (as do
  `Passport Expiry Date` and `Date of Birth`) for an SA-ID office bearer.
- Completed steps in the wizard rail are **not clickable** — navigation is Back/Next only.
- Console error on Save (the save itself succeeded): `Failed to execute action 'shesha.common:Show Dialog', error: undefined`.

---

## 🔴 TC-13-005 — FAIL confirmed, but **the 08-13 root cause was wrong**
Run on **333-022-NPO** → *Voluntary Deregistration* → **DER2395/21/08/2026**. Not submitted.

### ⚠️ Correction to the 2026-08-13 report
That report concluded *"Asset transfer has no UI at all"* and *"the deregistration wizard has exactly three steps"*.
**Both statements are wrong.** A fourth step, **Asset Transfer**, does exist:

| Type of severance | "Do you want to donate assets?" | Asset Transfer step |
|---|---|---|
| **Voluntary Deregistration** | **checkbox is not rendered** | **never appears** |
| **Dissolution Winding Up** | checkbox rendered | **appears as step 3 of 4** |

The 08-13 run ticked the checkbox *before* choosing a severance type, then selected Voluntary Deregistration — which
hides the checkbox again while **leaving its value `true`** — and concluded the step did not exist.

⇒ The real defect is narrower and sharper: **the Asset Transfer step is unreachable on the Voluntary Deregistration
path**, which is the path this suite (101875, *13p Voluntary Deregistration Submitter*) is named for. On that path
asset transfer is instead only an upload — `Assets Transfer Form File *` on the Declaration step.
📌 The donate-assets flag also **stays `true` while hidden**, so a user who switches severance type carries a stale
value they can no longer see.

### The case's own assertions, run on the Dissolution branch where the step does exist
| # | Assertion | Result |
|---|---|---|
| 1 | The NPO Database search returns results | ✅ **PASS** — typed a known name, one exact match returned (server-filtered, as the plan warned) |
| 2 | **(BLOCKING)** Selecting one displays the receiving NPO's details *(FDS Dereg 7.1.2)* | 🔴 **FAIL** |

The Asset Register row has columns *Receiving Npo · Npo Number · Receiving Office Bearer · OB Cellphone · Serial Ref
No · Asset Description · Rand Value · Receiving NPO Address*. After selecting the receiving NPO **and** one of its
office bearers, and waiting:

- **`Npo Number` — blank**
- **`Receiving NPO Address` — blank**
- **`OB Cellphone` — blank**

**The data exists.** Read straight off the receiving NPO's entity: `npoNumber: "333-019-NPO"` and
`physicalAddress: "18 South Street, Zwartkop, Centurion, South Africa"`. So this is a **display gap, not missing
data** — the fifth instance of that pattern in this module.

✅ Worth recording as working: the **Receiving Office Bearer picker correctly cascades**, listing exactly the
receiving NPO's three office bearers. The lookup chain works; only the derived display columns are empty.

---

## 🔴 TC-05-029 — FAIL confirmed, and narrowed to one half of the assertion
Run on draft **APPL26-00793**. Precondition built to match the case: wizard driven to **Tab 4 Office Bearer** with
**2 office bearers**, the second added during this run.

| # | Assertion | Result |
|---|---|---|
| 1 | The draft auto-saves | ✅ **PASS** (data), ⚠️ **no save indicator** — only a static `DRAFT` badge; nothing reads "saved"/"saving" |
| 2 | Logout succeeds | ✅ **PASS** |
| 3 | The draft is listed after re-login | ✅ **PASS** — **Draft Application** appears on the dashboard with an *Edit/Submit* action |
| 4 | **(BLOCKING)** It resumes at **Tab 4** with data intact | 🔴 **FAIL on the tab, PASS on the data** |

**The data survives completely.** After logout → re-login, Tab 2 still held all 16 organisation fields and Tab 4 held
**both** office bearers, including the one added minutes before logging out.

**The tab position does not survive.** The draft reopens at **Tab 1 "Read This"** every time, and **no step is marked
complete** in the wizard rail. Since the rail is not clickable, the user must press Next through every tab to get
back to where they were. The expected result — *"the draft opens at Tab 4 with all previously entered data intact"* —
fails on its first clause only.

📌 The dashboard shows **"All Done! You're all caught up, there's no new actions"** directly above a draft that is
waiting to be completed.

### 🔑 A clean, single-variable confirmation of the silent-gate bug
Adding the second office bearer reproduced `bugs/2026-08-20-unstarred-mandatory-fields-silently-gate-next-and-save.md`
under controlled conditions. With **every starred field satisfied**, `Save` stayed **disabled**. The existing office
bearer already used mobile `0818400598`; **changing only the mobile number to `0818400597` flipped Save to enabled** —
nothing else was touched. There is **no star, no inline error, no `aria-invalid`, and no message** anywhere on the
form to say a duplicate mobile number is the problem.

---

## 🔴 TC-08-011 — FAIL, and it was executable after all
The TC-08 pair had been recorded as blocked because *nothing in the product creates a reporting period*. That is
still true for a newly registered NPO — on **333-022-NPO** the Annual Reports page shows **0 items** and
*"No annual report can be initiated at this time"* with **no Initiate control**. But **333-019-NPO** carries a draft
annual report from 08-17, **ANN2363/17/08/2026**, resumable from the dashboard via *Draft Annual Compliance →
Edit/Submit*. Both cases were run against it.

Case step 3 (wizard step **Particulars of Office Bearers**):

| # | Assertion | Result |
|---|---|---|
| 1 | The OB list renders and matches the NPO's record | ✅ **PASS** — 3 office bearers, matching the NPO's office-bearer set exactly |
| 2 | **(BLOCKING)** Ticking *'OBs still apply'* permits progress | 🔴 **FAIL** — **there is no such control** |

The step has **zero inputs, checkboxes or selects**. Its only interactive elements are `Back`, `Next` and a link
*"Submit a Change Request instead?"*. Pressing `Next` advanced straight to step 4, so **progress is not gated by any
confirmation** — the affirmation the case requires is never captured at all, rather than being present but broken.

📌 I first misread this grid from `innerText` and thought the passport columns were shifted. Reading the actual cells
showed the mapping is **correct** — two passport-holders and one SA-ID holder. No column-mapping defect; noting it
because the text-level read was misleading.

---

## ⚠️ TC-08-007 — the blocking assertion PASSES; the case's own steps cannot be performed
Same report, wizard step **Organisation Details**.

| # | Assertion / step | Result |
|---|---|---|
| 1 | **(BLOCKING)** Org info is present and **read-only** | ✅ **PASS** |
| — | Step 3: *TYPE the Income Tax Number* | 🔴 **not performable** |
| — | Steps 4–5: *SELECT Audited = Yes*, *TYPE the Auditing Firm* | 🔴 **not performable** |
| — | Step 7: navigates to the next step | ✅ **PASS** |
| 2 | The captured values persist after Next | ⛔ **vacuous** — nothing can be captured |

**Read-only tested by attempting an edit, as the plan requires:** the step has **zero visible input elements**. Name,
Trading Name, WhatsApp number, address, cellphone, email, financial year end and legal form all render as text with
no control.

**But `Income Tax Number` renders as a label with no control and no value**, so the case's own step 3 cannot be
carried out. And the string *"audit"* **appears nowhere** on this step — nor on *Particulars of Office Bearers*,
*Admin and Operations*, *Achievements & Employees* or *Financial Report*.

🔒 **Honest limit:** this report is flagged **Is Above Threshold: No**. Steps 7–8 were not reached because the
Financial Report step requires a mandatory `Additional Documents File` upload. The auditing fields may well belong to
the **above-threshold** branch — ANN2119 on the same NPO is the above-threshold report and was not opened today.
**Question for Thabiso:** are *Audited* and *Auditing Firm* meant to appear only above the reporting threshold? If so
the ADO case needs a precondition; if not, they are missing.

---

## 🔴 TC-14W-001 — FAIL confirmed, but the plan's predicted reason was wrong
Run keyboard-only on the registration wizard, steps 1–2 and 5–6 as the plan directs.

### Steps 1–2 — reachability ✅, focus visibility 🔴
Tabbing reaches every interactive element on **Read This** in a sensible order, including `Next`, which activates
with `Enter`. Focus visibility splits:

| Element group | Focus indicator |
|---|---|
| Buttons, incl. `Next` | `outline: solid 4px #EDD293` — present |
| **Dashboard · Register NPO · Education and Awareness · Contact Us · FAQs** | **`outline: none 0px`, no box-shadow, no border change — no visible indicator at all** |

⇒ **WCAG 2.1 SC 2.4.7 Focus Visible (Level A) fails on the entire primary navigation.**

**Measured against a real contrast requirement, as the plan asks.** The focus ring `#EDD293` gives:
- **1.47 : 1** against the white page background
- **2.14 : 1** against the button's own fill (`#C6831B`)

SC **1.4.11 Non-text Contrast (AA)** requires **≥ 3 : 1** for focus indicators. **Both fail**, so even where a ring is
drawn it is not reliably perceivable.

📌 Also: a `<ul>` in the header takes a spurious tab stop, and the **wizard step rail is not focusable** (nor
clickable), so steps cannot be reached by keyboard at all.

### Steps 5–6 — ⚠️ the plan's expectation is corrected
The plan says *"🔴 Expect step 6 to fail … a disabled button with no message cannot announce anything."* Clearing the
mandatory `Organisation Name` by keyboard and blurring produced:

| Behaviour | Result |
|---|---|
| An inline error appears — *"This field is required"* | ✅ present |
| It carries **`role="alert"`** | ✅ **so it IS announced to assistive technology** |
| `aria-invalid` on the input | 🔴 **null** |
| `aria-describedby` linking input → message | 🔴 **null** |
| **Focus moves to the offending field** | 🔴 **no — `Next` simply becomes `disabled`** |

⇒ **(BLOCKING) assertion FAILS**, but on its second clause only. The message *is* announced; what is missing is that
the error is **not programmatically associated with the field** (a screen-reader user returning to the input hears
nothing wrong with it) and **focus is never moved to it**. That is a materially different — and more fixable —
finding than "no feedback at all", and it means the old *"blocked with no feedback"* narrative should not be repeated
for this form without re-checking.

**❓ Still open for Thabiso:** is WCAG 2.1 **AA** the contractual target? It decides whether the two contrast/focus
findings above are defects or advisories.

---

## Records created during this run
| Record | NPO | State left |
|---|---|---|
| Change request **POST1424/21/08/2026** | 333-022-NPO | Draft — **not submitted**, and now undeletable |
| Deregistration **DER2395/21/08/2026** | 333-022-NPO | Draft — **not submitted** (deliberately; submitting would deregister the NPO) |
| Office bearer *Lerato Dlamini* (passport) | APPL26-00793 draft | Added, retained |

⚠️ Both registered NPOs now hold a blocking draft change request, so **no further post-registration change can be
raised on either** until a developer clears them. The deregistration draft may block re-initiating deregistration
on 333-022 in the same way.

🔒 **POPIA.** The office-bearer grids on these forms display real identities returned by the DHA lookup. No names, ID
numbers or dates of birth from those records are transcribed here, and no screenshots of them were saved, per
`never-record-real-personal-identifiers`. The office bearer added during this run was created via the **passport**
route specifically to avoid triggering another live identity lookup.

## Net effect on the 13 recorded smoke failures
- **2 withdrawn:** TC-12-004 (08-20) and **TC-10-006** (today, for the General/Office-Bearer branch).
- **2 corrected at root cause:** TC-13-005 (the step exists, it is gated behind the wrong severance type) and
  TC-14W-001 (errors are announced; focus management and programmatic association are what fail).
- **1 narrowed:** TC-05-029 — persistence works, tab resumption does not.
- **2 promoted from "blocked" to executed:** TC-08-007 (partial) and TC-08-011 (fail).
