# Test Plan: NPO-03 — Application Wizard, Tabs 1–3 (Read This, Org Details, Objectives) (smoke)

> **Status:** Imported from Azure DevOps — ✅ **runnable end to end** (the blocker was retracted 2026-08-13)
> **Owner:** QA
> **Last Updated:** 2026-08-13
> **Estimated Duration:** 300s

## Metadata
| Field | Value |
|-------|-------|
| App URL | https://dsd-npo-publicportal-1-qa.shesha.app/login |
| Environment | QA |
| Login As | mpenduloizwelinuk@gmail.com / 123qwe |
| Lead tester | **Thabiso Kegakwile** |
| ADO Plan | [planId 101541 — DSD-NPO Smoke Test Plan](https://dev.azure.com/boxfusion/Boxfusion%20Test%20Plans/_testPlans/execute?planId=101541&suiteId=101860) |
| ADO Suite | 101860 — *03 - Application Wizard - Tabs 2-3* (8 cases) |

## Objective
> Verify the front half of the registration wizard: the POPI Act consent gate, the *Read This* tab, and Organisation Details — including the conditional fields each Legal Form reveals, the address lookup, and adding a Primary Objective.

## ✅ TC-06 PASSES on the public portal — the defect is ADMIN-ONLY (corrected 2026-08-13)

**The address lookup works on the public portal.** Typing `Church Street Pretoria` with real keystrokes returned
**5 suggestions**, and selecting one populated **Metropolitan Municipality = `City of Tshwane Metropolitan
Municipality`** and **Area Code = `0081`**. That satisfies **TC-06 (ADO #101632)** end to end — and the ADO case
is tagged `Portal: Public`, so **this case should be marked PASSED**.

🔴 **On the ADMIN portal it fails**: `.dropdown-container` stays empty, because
`Google Maps JavaScript API error: RefererNotAllowedMapError` — the Maps key is **not authorised for
`dsd-npo-adminportal-qa.shesha.app`**. Any registration a staff member initiates from *Workflows → My Items →
Create New* therefore saves with **no municipality and no area code**.
Bug: `test-reports/bugs/2026-08-12-address-autocomplete-renders-no-suggestions.md` (rescoped to admin-only,
Medium–High).

⚠️ **Two earlier claims are RETRACTED**: that suggestions never render (they do, on public — the original probe
never actually typed), and that this blocks registration (it does not).

🔑 **RETRACTED — the earlier claim that this BLOCKS registration.** On 2026-08-13 the wizard was driven with all
10 mandatory fields populated by **real keystrokes**, and **`Next` enabled and advanced to Objectives**. The
derived fields were still empty and it made no difference — they are **not required**.

What actually happened on 2026-08-12: **`fill()` does not bind on this form**, so the fields were genuinely empty
and `Next` was *correctly* disabled. We then attributed the disabled button to the unresolved address. Wrong
inference. **Assert `inputValue()` before drawing any conclusion from a disabled control** — a disabled `Next`
evidences only that *some* mandatory field is unsatisfied, never which and never why.

🔑 **Also retracted: "blocks with no validation message at all".** The form **does** render field-level errors —
`Income Tax Number` produced *"Please enter a valid tax number"* in `.ant-form-item-explain-error`.

**Consequence:** TC-06 fails on its own merits; **TC-07, TC-08 and plans NPO-04 / NPO-05 are reachable.**
Severity of the address bug downgraded **Blocker → High** — an NPO can register, but with no municipality or area
data captured.

| Portal | Maps key authorised | Predictions fire | Dropdown renders |
|---|---|---|---|
| Public | ✅ 200 | ✅ all 200 | 🔴 never |
| Admin | 🔴 `RefererNotAllowedMapError` | 🔴 blocked | 🔴 never |

Mechanism (public portal): `You have included the Google Maps JavaScript API multiple times on this page` — a duplicate load clobbers the first instance's bindings, so Autocomplete still queries but never attaches a `.pac-container`. Admin has a **second, separate** fault: the Maps key is not authorised for `dsd-npo-adminportal-qa.shesha.app`.

## 🔑 The stepper is DYNAMIC — 8 steps, not 7
After Organisation Details completes, a **`Control Structure`** step appears between *Admin & Operations* and
*Documents*. Our 7-step list was recorded before that point. **The ADO cases were right** — suite 05's
"Tabs 5-8 incl. Control Structure" is correct, and the note in NPO-05 questioning the tab count is **withdrawn**.

Full stepper: **Read This · Organisation Details · Objectives · Office Bearer · Admin & Operations ·
Control Structure · Documents · Declaration**.

## Provenance
Imported from the ADO smoke plan on 2026-08-13. Expected results are quoted from the ADO cases; all are state `Design`.

⚠️ **The ADO cases number the wizard tabs differently from the UI.** Cases say *"On Step 1"* for what the UI stepper labels **Tab 2 — Organisation Details** (the UI counts the informational *Read This* tab as Tab 1). Plan TC numbering below follows the **UI** labels and names the ADO step in each case.

## Preconditions
- [ ] Signed in on the public portal; view mode switched **Live → Latest**
- [ ] ⚠️ **Two abandoned drafts already exist** on the dev account, both parked at Organisation Details. **Resume one, do not create a third:**
  - `id=1c4cab6f-ba3d-496f-917c-0548e0fed241` / `todoid=7c57ea2f-556b-4460-8e3e-fd51fefdab4d`
  - `id=b65b2d71-e108-42d6-bfe5-eb81a02b9724` / `todoid=6ee27176-7267-41ad-b5f2-43ce229fa285` (Organisation Name `QA Test NPO 2026-08-12`)

## 🔑 Automation rules for this form — all three cost a run on 2026-08-12
1. **`fill()` does NOT bind.** It sets the DOM value but React state never updates, so the next re-render blanks it. **Click, clear, `pressSequentially`, then read the value back** and re-enter once if needed.
2. **Saved data loads asynchronously *after* the step renders**, wiping anything typed in the meantime. **Wait until the form has settled (its own values present and value-stable) before filling.**
3. **A disabled `Next` is not a hang.** Assert the `disabled` property directly; a Playwright click timeout here means a mandatory field is unsatisfied, not that the app froze.
4. **AntD selects:** scope options to `.ant-select-dropdown:not(.ant-select-dropdown-hidden)` — the closed dropdown stays mounted, so a global `.ant-select-item-option` lookup hits stale hidden options. Verify via `.ant-select-selection-item`, then press Escape.

## Test Cases

### TC-01 — POPI Act gate appears when Register a New NPO is clicked (ADO #101625 · TC-03-001)

*Priority 1 · Positive.*

- **Type:** Gate / validation
- **Steps:**
  1. From the landing page CLICK **Register a New NPO** *(click the first **visible** match — hidden duplicates exist)*
  2. SNAPSHOT
  3. ASSERT (BLOCKING) the POPI Act dialog is displayed *(FDS Fig.8 / 7.4)*
  4. ASSERT the consent checkbox is present and **unticked**
  5. ASSERT the **OK** button is **disabled** until the checkbox is ticked
  6. TICK the consent, ASSERT OK becomes enabled
- **Expected result:** *"POPI Act dialog (FDS Fig.8/7.4) is displayed with consent checkbox and OK button disabled until checked"*
- **Assertions:**
  - [ ] ASSERT (BLOCKING) the POPI dialog is displayed
  - [ ] ASSERT the action is disabled while consent is unticked
  - [ ] ASSERT it enables once consent is ticked
- **⚠️ The live page differs from the case in two ways** — confirm with Thabiso which is correct:
  - It is a **full page** at `/dynamic/boxfusion.dsdnpo/popi-act` headed *"Informed Consent Notice under POPIA"*, not a dialog, and the action is **Next**, not **OK**.
  - There are **two** checkboxes, not one: *"I have read and understand the content of this consent"* **and** *"I have gone through all the content uploaded under the Public Portal library under the Education and Awareness section"*.
- **❓ Question for Thabiso:** the second checkbox asserts the applicant has read the E&A library — the system cannot verify that. Is self-attestation the intended control?
- **📌** Clicking Next here **creates a workflow instance** — the URL becomes `/shesha/workflow-action?id=<paId>&todoid=<todoId>`. EXTRACT and record both ids; the draft is resumable and later cases depend on it.

---

### TC-02 — Read This is the first tab; Next proceeds; no Back button (ADO #102153 · TC-03-031)

*Priority 2 · Positive · `Src:Code`.*

- **Type:** Happy path (structural)
- **Steps:**
  1. Open the Application Wizard from Register New NPO
  2. ASSERT Tab 1 is labelled **Read This** and is the active step
  3. ASSERT the informational content is displayed and readable
  4. ASSERT **no Back button is present** — it is the first step
  5. CLICK **Next**
  6. ASSERT (BLOCKING) the wizard advances to Tab 2 (**Organisation Details**)
- **Expected result:** *"Tab 1 is labelled 'Read This' and is the active step"* … *"No Back button is present (it is the first step)"* … *"Wizard advances to Tab 2 (Organisation Details)"*
- **Assertions:**
  - [ ] ASSERT Tab 1 is *Read This* and active
  - [ ] ASSERT no Back button on Tab 1
  - [ ] ASSERT (BLOCKING) Next advances to Organisation Details
- **📌 Observed stepper (2026-08-12), 7 steps:** Read This · Organisation Details · Objectives · Office Bearer · Admin & Operations · Documents · Declaration. The ADO cases refer to **8** tabs (Tabs 2–8 plus a Control Structure tab in suite 05). **Reconcile the tab count with Thabiso** — either a tab is conditional or the case set is ahead of the build.

---

### TC-03 — Legal Form 'NPC' reveals the CIPC Registration Number field (ADO #101628 · TC-03-004)

*Priority 1 · Positive. ADO "Step 1" = UI Tab 2, Organisation Details.*

- **Type:** Conditional field
- **Steps:**
  1. Reach **Organisation Details**
  2. SNAPSHOT
  3. CLICK Legal Form = **NPC**
  4. ASSERT (BLOCKING) a **CIPC Registration Number** field appears and is **required** *(FDS 7.5.1 rule 3a)*
- **Expected result:** *"CIPC Registration Number field appears and is required (FDS 7.5.1 rule 3a)"*
- **Assertions:**
  - [ ] ASSERT (BLOCKING) the CIPC Registration Number field appears
  - [ ] ASSERT it is marked required (`.ant-form-item-required`)
- **📌** The Functional plan adds the format rule — `YYYY/NNNNNN/NN` (#101650 · TC-03-026). Not tested here.

---

### TC-04 — Legal Form 'Trust' reveals the IT Registration Number field (ADO #101629 · TC-03-005)

*Priority 1 · Positive.*

- **Type:** Conditional field
- **Steps:**
  1. On Organisation Details, CLICK Legal Form = **Trust**
  2. ASSERT (BLOCKING) an **IT Registration Number** field appears and is **required** *(FDS 7.5.1 rule 3b)*
- **Expected result:** *"IT Registration Number field appears and is required (FDS 7.5.1 rule 3b)"*
- **Assertions:**
  - [ ] ASSERT (BLOCKING) the IT Registration Number field appears and is required
- **📌 Confirmed Legal Form options (live, 2026-08-12):** **Voluntary Association · NPC · Trust** — matches the three the cases assume.

---

### TC-05 — Legal Form 'VA' shows Membership choice and Constitution date (ADO #101630 · TC-03-006)

*Priority 1 · Positive.*

- **Type:** Conditional field
- **Steps:**
  1. On Organisation Details, CLICK Legal Form = **Voluntary Association**
  2. ASSERT (BLOCKING) a **Membership / Non-Membership** radio is shown *(FDS 7.5.1 rule 3c)*
  3. Scroll to the constitution section
  4. ASSERT the **Constitution approval date** field is **required** *(FDS 7.5.1 rule 6)*
- **Expected result:** *"Membership / Non-Membership radio is shown"* and *"Constitution approval date field is required"*
- **Assertions:**
  - [ ] ASSERT (BLOCKING) the Membership radio appears
  - [ ] ASSERT the Constitution approval date is required
- **✅ Partly confirmed 2026-08-12:** picking a Legal Form does reveal a ninth required field **`Membership *`** (radio), exactly as the case says. **Re-read the required-field set after every Legal Form change** — the mandatory set is conditional.
- 🔑 **Never set the Constitution date programmatically.** `fill()` / `pressSequentially` on an AntD date field leaves React state stale and can persist a state the UI forbids. Drive the picker panel and click **OK**.

---

### TC-06 — 🔴 Address search returns matches and populates Physical Address (ADO #101632 · TC-03-008)

*Priority 1 · Positive.* **This case currently FAILS — see the blocker at the top of this plan.**

- **Type:** Integration / lookup
- **Steps:**
  1. On Organisation Details, CLICK into the **Physical Address** search field
  2. TYPE `Pretoria` with **real keystrokes**, then ASSERT via `inputValue()` that the text actually landed
  3. WAIT for the suggestion list
  4. ASSERT (BLOCKING) **suggestions are returned**
  5. CLICK one
  6. ASSERT the **Physical Address** field is populated with the selected address
  7. ASSERT the derived fields (Province, District / Metropolitan Municipality, Area Code) populate
- **Expected result:** *"Suggestions are returned"* then *"Physical Address field is populated with selected address"*
- **Assertions:**
  - [ ] ASSERT (BLOCKING) suggestions are returned for `Pretoria`
  - [ ] ASSERT selecting one populates Physical Address
  - [ ] ASSERT the derived location fields populate
- 🔑 **Check the CONTROL'S OWN dropdown, not Google's.** This is a custom Shesha lookup —
  `DIV.location-search-input-wrapper` → `DIV.dropdown-container` — **not** the Google widget, so `.pac-container`
  never exists here and its absence proves nothing. Assert on `.dropdown-container` having **0 children / 0
  height**. (Verified 2026-08-13: it stays empty for 4 s after a real-keystroke entry whose value is confirmed
  stable.)
- 🔑 **Assert the typed text landed before concluding anything from an absent dropdown.** An earlier probe clicked
  the input's *wrapper* and typed nothing at all.
- 🔑 **On a HEADED run, the tester may be typing into the same field.** A full address appearing mid-probe has
  twice been the tester's own typing, not a resolved suggestion. Re-clear and re-type before concluding.
- **📌** The form uses the **legacy `AutocompleteService`**, closed to new customers since 2025-03-01. Not the cause; technical debt worth flagging.

---

### TC-07 — Conditional toggles show and hide correctly (ADO #102154 · TC-03-032)

*Priority 2 · Positive · `Src:Code`. Spans Organisation Details **and** the Office Bearer tab.*

- **Type:** Conditional field
- **Steps:**
  1. On Organisation Details, toggle **Have Income Tax No?** → **Yes**
  2. ASSERT an **Income Tax Number** field appears and is required
  3. Toggle it back to **No**
  4. ASSERT (BLOCKING) the field is hidden **and its value is cleared**
  5. On the **Office Bearer** tab, toggle **Is RSA ID Number?** → **Yes** for a new OB
  6. ASSERT an **RSA ID Number** field appears and **Passport Number** is hidden
  7. Toggle to **No** → ASSERT **Passport Number** appears and RSA ID Number is hidden
- **Expected result:** *"Income Tax Number field is hidden and its value is cleared"* … *"RSA ID Number field appears; Passport Number field is hidden"* … and the inverse
- **Assertions:**
  - [ ] ASSERT the Income Tax Number field shows on Yes
  - [ ] ASSERT (BLOCKING) it hides **and clears** on No — the clearing is the substance of this case
  - [ ] ASSERT the RSA ID / Passport pair swap correctly
- **⚠️** Steps 5–7 need the **Office Bearer** tab, which is behind the address blocker. Expect this case to run **partially** until that clears.
- **📌** A console error `executeScriptSync error TypeError: Cannot read properties of null (reading 'incomeTaxNumber')` fires on this form. It names `incomeTaxNumber` — **the exact field this case toggles.** Watch the console while running TC-07; it may be the same defect.

---

### TC-08 — Add Objective: at least one Primary Objective is required (ADO #101640 · TC-03-016)

*Priority 1 · Positive. UI Tab 3 — Objectives.* ⛔ **Unreachable until the address blocker clears.**

- **Type:** Happy path
- **Steps:**
  1. Reach **Objectives** (requires completing Organisation Details)
  2. CLICK **Add Objective**
  3. ASSERT (BLOCKING) the **Add Objective** dialog is displayed *(FDS Fig.15)*
  4. Pick a **Primary Objective** from the picker and CLICK **Save**
  5. ASSERT the objective is added to the list and is visible
- **Expected result:** *"Add Objective dialog displayed (FDS Fig.15)"* then *"Objective is added to the list and is visible"*
- **Assertions:**
  - [ ] ASSERT (BLOCKING) the Add Objective dialog opens
  - [ ] ASSERT a saved objective appears in the list
- **📌** The Functional plan adds the negative cases — zero objectives, secondary-without-primary, delete, duplicate pair (#101641/2/3/4). Not tested here.

---

## Coverage against ADO

| Plan TC | ADO id | ADO TC | Reachable today |
|---|---|---|---|
| TC-01 | #101625 | TC-03-001 | ✅ yes |
| TC-02 | #102153 | TC-03-031 | ✅ yes |
| TC-03 | #101628 | TC-03-004 | ✅ yes |
| TC-04 | #101629 | TC-03-005 | ✅ yes |
| TC-05 | #101630 | TC-03-006 | ✅ yes |
| TC-06 | #101632 | TC-03-008 | 🔴 **fails — the blocker** |
| TC-07 | #102154 | TC-03-032 | ⚠️ partial (OB half blocked) |
| TC-08 | #101640 | TC-03-016 | ⛔ blocked |

**Not in this plan** (Functional suite 101886, 26 cases, to import later): TC-03-002/003 mandatory-field enforcement · 007 conditional hide on legal-form change · 009→015 format validation and duplicate prevention · 017→020 objective negatives · 021→030 code-derived field rules.

⚠️ **TC-03-003 (#101627, Functional) is worth importing early** — it prescribes *"each required field shows **its own validation error**"*, which the wizard does not do. That makes our "silent disabled Next" observation a citable defect rather than an open question.
