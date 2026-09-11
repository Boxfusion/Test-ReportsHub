# Report: NPO-03-F — Wizard Tabs 2–3 validation & edge cases (functional)

**Date:** 2026-08-17 10:45 UTC
**Plan:** test-plans/npo-registration/03-wizard-org-details-objectives-functional.md
**Execution Mode:** ai-repair
**Result:** FAILED — 5 passed, 12 failed, 4 partial, 2 blocked; validation on Tab 2 is advisory rather than enforcing
**Duration:** ~1500s
**Cases:** TC-03-002, TC-03-003, TC-03-007, TC-03-009, TC-03-010, TC-03-011, TC-03-012, TC-03-013, TC-03-014, TC-03-015, TC-03-017, TC-03-018, TC-03-019, TC-03-020, TC-03-021, TC-03-023, TC-03-024, TC-03-025, TC-03-026, TC-03-027, TC-03-028, TC-03-029, TC-03-030
**Assessed-not-executed:** TC-03-022
**Environment:** QA · public portal · view mode **Latest** · forms `create-npo v61`, `create-npo-objective v33`
**Applications under test:** drafts **APPL26-01212** (`QA Validation NPO 03`) and **APPL26-01214**
(`QA Validation Demo 2026-08-17`, evidence re-run) — both deliberately **not submitted**

## Summary
| Total | Passed | Failed | Partial | Blocked | Not executed |
|---|---|---|---|---|---|
| 24 | 5 | 12 | 4 | 2 | 1 |

⚠️ **Correction:** an earlier revision of this report tallied *9 failed* in this table while listing 11 failing cases
below it. The section verdicts were right; the table was wrong. Counts above are now reconciled against the sections.

## 📸 Screenshot evidence

The validation findings were re-run and captured on a second draft (**APPL26-01214**) so the messages can be reviewed
without watching live. Files in `test-reports/2026-08-17/evidence/`:

| File | Shows |
|---|---|
| `v1-popi-next-disabled.png` | POPI page, nothing ticked, `Next` disabled |
| `v2-blank-tab2-no-messages.png` | **Blank Tab 2 — 8 starred fields, `Next` greyed, zero validation messages.** `National (SA)` visibly unstarred |
| `v3-email-invalid-message.png` | Email field in its error state (message text confirmed in DOM: *"Please enter a valid email address"*) |
| `v4-tax-error-but-next-enabled.png` | **`12345` + "Please enter a valid tax number" + `Next` ENABLED** |
| `v5-advanced-despite-error.png` | **Advanced to Objectives, Organisation Details ticked green** despite the invalid value |
| `v6-invalid-value-kept-error-gone.png` | **`12345` retained, black border, no message** — looks clean |

Re-run confirmed identically: `+27123456789` → stored `+271234567` (`maxLength=10`, 2 characters lost, no error).

## 🔴 Headline: Tab 2 validation is advisory, and the two mechanisms are inconsistent

The single most important result is not any one case — it is the pattern across them. Tab 2 has **two** validation
behaviours and **neither is complete**:

| Situation | What happens | What's missing |
|---|---|---|
| A required field is **empty** | `Next` is silently **disabled** | **No message at all** — 0 error nodes, 0 `has-error`, 0 `aria-invalid` |
| A field has an **invalid format** | A per-field error **is shown** | `Next` stays **enabled** — the user proceeds anyway |

Proven end to end with the Income Tax Number: entering `12345` displayed *"Please enter a valid tax number"*, **and
`Next` was enabled**. Clicking it **advanced to Objectives**, the invalid value **persisted**, and on reopening the
draft **the error was not shown again**. So an invalid value is displayed as invalid once, saved anyway, and then
looks clean.

That means the form **can** render per-field errors — it does so for formats — which removes the obvious explanation
for TC-03-003. Empty-required simply produces no feedback.

## Step Results

### ✅ TC-01 — POPI OK disabled until consent ticked (#101626 · TC-03-002) — PASSED
`Next` `disabled=true` with neither box ticked · still `disabled` with **one** of two ticked (partial consent
correctly refused) · `disabled=false` with both · click opened the wizard at Tab 1.
📌 The live button is labelled **`Next`**, not `OK`, and there are **two** consent checkboxes, not one — record as
case-text drift, not a defect.

### 🔴 TC-02 — All required fields enforced before Next (#101627 · TC-03-003) — FAILED
On a completely blank Tab 2: `Next` **disabled** (navigation blocked ✓) but **0** `.ant-form-item-explain-error`,
**0** `.ant-form-item-has-error`, **0** `[aria-invalid=true]`. The prescribed *"each required field shows **its own**
validation error"* does not happen for any field.
📌 The 8 fields that **are** marked `*`: Organisation Name · Organisation mobile number · Organisation Email Address ·
Financial year end month · Full Address (×2) · Legal Form · Office Bearer Term (Year(s)).
⚠️ **The case's own field list is wrong in both directions:** it names **Telephone**, which is *not* required live
(mobile number is), and omits Financial year end month, Office Bearer Term and the postal address.

### ⚠️ TC-03 — Conditional fields hide when legal form changes (#101631 · TC-03-007) — PARTIAL
✅ NPC → Trust: the CIPC field **hid** and **`ITRegistration No*`** appeared, required.
⚠️ The **hidden CIPC input retained its value** in the DOM after switching. Whether it reaches the server was **not
verified** — confirming that needs a server-side read, which was out of scope for this pass (UI only, no API).

### ✅ TC-04 — Email rejects invalid format (#101633 · TC-03-009) — PASSED
`invalid` → *"Please enter a valid email address"* on the field.

### 🔴 TC-05 — Telephone/Cellphone accept only valid SA formats (#101634 · TC-03-010) — FAILED
The rule is **length-only, not format**: `abc` → *"Organisation Telephone must be at least 10 characters"*, but
**`abcdefghij` — ten letters — is accepted with no error.** There is no numeric or SA-format check.

### 🔴 TC-06 — Income Tax Number format validated if provided (#101635 · TC-03-011) — FAILED
✅ Blank is accepted (optional, behind the *Have Income tax no?* toggle) · ✅ `12345` shows *"Please enter a valid tax
number"*.
🔴 **But the error does not gate anything** — see the headline above. Value saved, wizard advanced, error gone on
reopen. The case's assertion is that the format *is validated*; displaying a message while accepting the value does
not meet it.

### 🔴 TC-07 — Area of Operations multi-select is mandatory (#101636 · TC-03-012) — FAILED
Isolated cleanly: with **every other field valid** and a valid term, `Next` stayed **disabled** with **0 errors**;
selecting one province (`Gauteng`) flipped it to **enabled** immediately. So the field **is** mandatory and **is**
enforced — but it carries **no `*` and no `ant-form-item-required` class**, and no *"validation error requiring at
least one area"* is ever shown.

### 🔴 TC-08 — Term of Office Bearers must be a positive integer (#101637 · TC-03-013) — FAILED
With everything else valid: **`0` accepted · `-5` accepted · `9999` accepted**, all with **0 errors** and `Next`
**enabled**. No `aria-valuemin`/`aria-valuemax` on the control.
🔴 **`-5` was saved and persisted** — proven through the UI by advancing to Objectives, returning via `Back`, and
re-reading `-5`; it also survived a full page refresh.
⚠️ **Unit conflict stands:** the case says **months** and expects `36`; the live label reads
**`Office Bearer Term (Year(s))`**. One of the two documents is wrong — question for Thabiso.

### ⛔ TC-09 — Duplicate organisation prevention (#101638 · TC-03-014) — BLOCKED
Needs a **real, already-registered CIPC number**. `2019/123456/08` returned
`{"enterprise":[],"response_message":"Records found."}` — no company — so there was nothing to duplicate against.
Same dependency as smoke TC-04-008.

### ✅ TC-10 — Save & Continue persists data across a refresh (#101639 · TC-03-015) — PASSED
After a full page reload, **every** value survived: name, term (`-5`), email, telephone, tax number, Legal Form,
Financial year end month, Area of Operations **and** the NPC registration number.
⚠️ **I nearly reported data loss here.** My first read said the NPC number was empty — it was reading the *hidden*
duplicate of that input. After waiting for hydration the **visible** input held `2019/123456/08`. **Retracted before
filing.**
📌 The wizard reopens at **Tab 1 (Read This)**, not the tab the user left. This is the mechanism that forces a
resuming user back through Organisation Details — the same path that triggers the known office-bearer wipe.
📌 `ApplicationStatus` was not read (UI only), so the case's *"application is in 'ApplicationStarted' state"* clause
is unverified.

### ✅ TC-11 — Cannot click Next with zero objectives (#101641 · TC-03-017) — PASSED
`Next` **disabled** with no objectives, and the step displays *"Note: Please click on the Add Objective button to add
an main or secondary  objective"*.
📌 The mechanism is a **static instructional note**, not a triggered validation error — but the user is told what to
do, which is the case's intent. **This is the contrast worth showing Thabiso: the same build guides the user here and
says nothing on Tab 2.**
📌 Typo in the note: *"an main"*, plus a double space before "objective".

### ⚠️ TC-12 — Secondary Objective without a primary is rejected (#101642 · TC-03-018) — PARTIAL
🔑 **Found the mechanism, and corrected my own earlier reading.** The modal exposes `Sector → Objective → Service`
plus a **`Type`** field that is **permanently hidden**. I first concluded main/secondary was therefore uncapturable —
**wrong**. A screenshot showed the real design: the panel is titled **"The Organisation Main Objectives"** and below it
sits a checkbox **"Do you want to add a secondary objective?"** which reveals **"The Organisation Secondary
Objectives"** with its own `Add Objective` button.
So primary-before-secondary is enforced **structurally by layout**, not by a dialog rule.
⚠️ **The rule itself could not be tested**: proving "secondary without a primary is rejected" needs a draft with
**zero** main objectives, and objectives **cannot be deleted** (TC-13). ▶ Re-run on a fresh draft, ticking the
secondary checkbox *before* adding any main objective.
📌 The hidden `Type` field remains unexplained — ask whether it is dead configuration.

### 🔴 TC-13 — Delete an added objective (#101643 · TC-03-019) — FAILED
With two objectives captured, the DOM holds **2 `edit` and 2 `delete` icons — none of them visible**, before or after
hovering the objective rows. Objectives render as read-only Sector/Objective/Service/Description blocks.
🔴 **There is no reachable way to delete or edit an objective.** Combined with TC-14 below, a wrong choice is
**unrecoverable**: the objective cannot be removed, and its Sector is then withheld from the dropdown.

### ⚠️ TC-14 — Duplicate primary+secondary pair cannot be added twice (#101644 · TC-03-020) — PARTIAL
Duplicate prevention **works**, but by a different mechanism than prescribed: on the second `Add Objective`,
**`Social Services` was absent from the Sector list** because it was already used. No *"duplicate objective"* message
appears — the option simply is not offered.
🔴 **The exclusion is at Sector level, not at the Sector+Objective+Service triple.** An NPO wanting two objectives
within one sector — say *Social Services → Services to Children* **and** *Social Services → Family services* — cannot
capture them. **❓ Is whole-sector exclusion intended?**
📌 Two near-identical sectors coexist: **`Business and Professional Associations, Unions`** and **`Business and
Professional Associations`** — reference-data duplication.
📌 The Sector select showed exactly **10** options both times but with **different membership** (one removed, a new one
appeared), so **more than 10 sectors exist and only 10 are offered**. Typing in it does **not** filter — it is not
searchable. Worth a dedicated check.

### 🔴 TC-15 — Org Name required, min 2, max 150 (#101645 · TC-03-021) — FAILED
`maxLength` on the input is **unset (-1)**. `X` (1 char) → **no min-length error**. A **154-character** value was
accepted with **no error and no truncation**. Only "required" is enforced, and silently (see TC-02).
📌 The drift note said the limits were unconfirmed — **there are no client-side limits at all**.

### ⬜ TC-16 — Org Name rejects HTML/script injection (#101646 · TC-03-022) — NOT EXECUTED
Deferred. Doing it properly means following the payload into the **admin view and the auto-generated constitution
PDF**, which needs a submitted application; this pass deliberately left the draft unsubmitted.

### 🔴 TC-17 — Shortened Name optional, max length enforced (#101647 · TC-03-023) — FAILED
Optional ✓ (blank accepted), but `maxLength` is **unset (-1)** — there is **no maximum**, so the case's max-length
error cannot occur.

### 🔴 TC-18 — Telephone accepts SA national and international formats (#101648 · TC-03-024) — FAILED
`maxLength=10` on Telephone, Mobile **and** WhatsApp, enforced by **silent truncation**:
- `0123456789` (10) → fits
- **`+27123456789` → stored as `+271234567`** — a valid SA international number **corrupted**, no error
- **`012-345-6789` → stored as `012-345-67`** — last two digits **lost**, no error
- `123` → rejected (too short) ✓ — the only branch that passes

🔴 The truncated value **persists** (read back after `Back` and after a refresh). International format is
**impossible** in a 10-character field, and no normalisation of separators occurs.

### ✅ TC-19 — WhatsApp same validation as cellphone, optional (#101649 · TC-03-025) — PASSED
✅ Blank accepted (optional) · ✅ the **same number as the mobile** (`0818400598`) accepted with **no error** and `Next`
enabled. Both prescribed branches met. `maxLength=10`, same as the other phone fields.
📌 Confirms the contrast with the **office bearer** form, which *rejects* a duplicate mobile across office bearers
(*"OB With same mobile number exists"*). Organisation-level duplication is allowed, OB-level is not — worth confirming
that asymmetry is deliberate.

### ⚠️ TC-20 — CIPC Registration Number format `YYYY/######/##` (#101650 · TC-03-026) — PARTIAL
✅ **The valid number triggers the lookup** — `2019/123456/08` fired
`POST CipcIntegrationActions/GetEnterpriseInformation` **and** `GetEnterpriseDirectors`, both 200. The malformed values
fired **nothing**, so format *is* checked well enough to gate the integration call.
🔴 **But no malformed value produces a visible error and none blocks `Next`**: `19/123456/08` (short year) and
`2019-123456-08` (wrong separators) both sat in the field with 0 errors. The placeholder and `maxlength=14` are the
only user-facing constraints.
🔴 **Silent CIPC failure reproduced:** the 200 response was `{"enterprise":[],"response_message":"Records found."}` —
no company, a success message — and the UI said **nothing**: no toast, no field error, no wording anywhere matching
*not found / invalid / unverified*.
⚠️ **Method note on myself:** my first attempt to enter the valid number used `pressSequentially`, which **appends**;
the field already held 14 characters, so nothing was added and I briefly concluded no lookup fires. **Use `fill` for
text and always read the value back.**

### 🔴 TC-21 — Trust IT Registration Number format validated (#101651 · TC-03-027) — FAILED
Legal Form = Trust reveals **`ITRegistration No*`** (required, placeholder *IT Registration number*, **no
`maxLength`**). Both prescribed invalid values are accepted:
- `INVALID` → **no error**, `Next` **enabled**
- `12345` → **no error**, `Next` **enabled**

There is **no format validation of any kind** on this field.
📌 Per the drift note the canonical pattern is *"not pinned in FDS or code"* — so strictly this is a **spec gap**: the
case cannot pass until someone defines what a valid Trust IT number looks like. **❓ Question for the business
analyst**, as the case itself suggests. Recorded as FAILED against the case as written, not as a code defect.

### ⛔ TC-22 — VA Constitution date cannot be in the future (#101652 · TC-03-028) — BLOCKED
**The field is not on this tab.** With Legal Form = **Voluntary Association** selected, Tab 2 renders **zero**
`.ant-picker` controls and **no** label matching *date / constitution / approved* — the 24 visible labels are the ones
listed under TC-02 plus the conditional Membership, Income Tax Number and IT/NPC registration fields.
📌 The entity field **does** exist — `approvedConstitutionalDate` appears in the wizard's own
`NpoApplication/Crud/Get` property list — so it is captured somewhere else, most likely the **Documents** step (6),
where the VA constitution is auto-generated.
▶ **To execute:** drive a draft all the way to step 6, which needs an objective and 3 office bearers first. Worth
folding into the suite 05 (Tabs 5–8) import rather than repeating that setup here.
🔑 When it is found, drive the picker panel **year → month → day** — never set an AntD date programmatically.

### 🔴 TC-23 — Term of OB positive integer in range (#101653 · TC-03-029) — FAILED
Same evidence as TC-08: `0`, `-5`, `9999` all accepted, no bounds, `-5` persisted. `9999` is **not capped**.

### 🔴 TC-24 — Area of Operations at least one required (#101654 · TC-03-030) — FAILED
Same as TC-07 for the none/one branches. The **select-all** branch was not exercised.

## Remaining work in this suite

**Only TC-03-022 (XSS hardening) is unexecuted.** It needs a **submitted** application so the payload can be followed
into the admin application view **and** the auto-generated constitution PDF; both drafts in this pass were left
unsubmitted on purpose. TC-03-028 is blocked on locating the constitution date field (see above) and TC-03-014 on a
real registered CIPC number.

## ✅ Bonus — closed an open assertion on smoke TC-03-032

The functional plan flagged that TC-03-032's *"value is cleared"* half may never have been asserted (both 08-13 runs
were `PARTIAL`). **It now has been, and it fails:** with Income Tax Number = `12345`, toggling *Have Income tax no?*
**off and back on leaves `12345` in the field**. The prescribed *"field is hidden and its value is cleared"* does not
happen. ▶ This belongs against **smoke TC-03-032**, not a functional case.

## Observations and questions for the test lead

1. 🔴 **The advisory-validation pattern is the finding of this run** — format errors show but do not block; empty
   required fields block but do not show. **Is `Next` meant to be gated by validation state at all?** One fix would
   close TC-02, TC-06, TC-07, TC-20 and TC-24 together.
2. 🔴 **Phone fields silently truncate at 10 characters** and have no format check — `+27…` numbers are corrupted on
   entry and the corrupted value persists. Ten letters pass as a phone number.
3. 🔴 **Objectives are add-only and sector-exclusive** — no reachable delete/edit, and a used Sector disappears from
   the list. A user who picks the wrong sector cannot fix it and cannot reuse that sector.
4. **Unit conflict on Office Bearer Term** — cases say months, UI says `Year(s)`. Needs a ruling; it also makes the
   `36` expectation in two cases untestable as written.
5. **The `Type` field in the objective modal is permanently hidden.** Dead configuration, or a control that should be
   exposed?
6. **The Sector dropdown appears capped at 10 and is not searchable**, while the reference list holds more than 10.
7. 📌 A hidden **"Same as postal"** checkbox on Tab 2 is **ticked by default** — likely why both addresses matched
   without being typed twice. Undocumented in any case.
8. 📌 On resuming the draft, `Next` was **disabled although every field appeared populated** — the resume path shows
   the same no-feedback problem. Not chased down; worth its own case.
9. 📌 `NPCRegistration No` renders **with** `*` on first entry and **without** it after a resume — inconsistent
   required marking.
10. ⚠️ **Two of my own readings were corrected mid-run** and are recorded so they are not re-raised: an apparent NPC
    data loss on refresh (I read a hidden duplicate input) and an apparent absence of the main/secondary mechanism
    (found via screenshot). Both reinforce the standing rules — **read back what you typed**, and **screenshot before
    calling something absent**.

## Artefacts

| Item | Value |
|---|---|
| Draft application | `APPL26-01212` · `9a8a6958-20ad-465d-aae1-a8d1dafdbba7` (not submitted) |
| Objectives captured | Health / HIV/AIDS / HIV and AIDS Education · Social Services / Services to Children / Child protection |
| CIPC number probed | `2019/123456/08` → `{"enterprise":[],"response_message":"Records found."}` |
