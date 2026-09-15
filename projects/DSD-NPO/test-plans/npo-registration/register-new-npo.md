# Test Plan: NPO-REG — Register a new NPO (public portal)

> **Status:** Draft — TC-01 to TC-04 observed live; TC-05 to TC-10 not yet observed
> **Owner:** QA
> **Last Updated:** 2026-08-12
> **Estimated Duration:** 600s

## Metadata
| Field | Value |
|-------|-------|
| App URL | https://dsd-npo-publicportal-1-qa.shesha.app/login |
| Environment | QA |
| Login As | mpenduloizwelinuk@gmail.com / 123qwe |
| Lead tester | **Thabiso K** — all expected results must be confirmed by him |
| ADO Plan | [planId 101543](https://dev.azure.com/boxfusion/Boxfusion%20Test%20Plans/_testPlans/execute?planId=101543&suiteId=101884) |
| ADO Suite | 101884 — **no official test cases exist yet** (per Thabiso, 2026-08-12) |

## Objective
> Validate that an applicant can register a new Non-Profit Organisation through the public DSD NPO portal — from the POPIA informed-consent gate, through the seven-step *Initiate Registration* wizard (Read This, Organisation Details, Objectives, Office Bearer, Admin & Operations, Documents, Declaration), to a submitted application that reaches DSD for assessment.

## ⚠️ Provenance of this plan
This plan was written from **live observation of the app on 2026-08-12**, not from ADO — the suite has no cases yet. Consequences:

- **TC-01 → TC-04 are based on screens actually reached.** Field lists and step names are verbatim from the running app.
- **TC-05 → TC-10 are placeholders.** Those wizard steps exist (the stepper names them) but their contents have **not** been seen. Their steps and assertions are provisional and must be filled in on the first run that reaches them.
- **Expected results are inferred, not authoritative.** Anything that looks wrong is a **question for Thabiso**, not a defect, until he rules on it.
- Thabiso warns the module is **unstable**. Rule out the harness and the API layer before classifying any failure as an app bug.

## Preconditions
- [ ] Public portal reachable at https://dsd-npo-publicportal-1-qa.shesha.app/login
- [ ] Credentials valid (mpenduloizwelinuk@gmail.com / 123qwe)
- [ ] The signed-in account is **not yet linked to an NPO** — the landing page must read *"You are currently not linked to any NPOs"*. Once a registration completes, this precondition no longer holds and later runs need a fresh applicant account.
- [ ] ⚠️ A **draft registration already exists** from the 2026-08-12 exploratory pass: workflow `id=1c4cab6f-ba3d-496f-917c-0548e0fed241`, `todoid=7c57ea2f-556b-4460-8e3e-fd51fefdab4d`. Resume it rather than creating another, unless the test explicitly needs a clean start.

## Test data
| Field | Value |
|---|---|
| Organisation Name | `QA Test NPO <YYYY-MM-DD>` — date-stamped so runs are distinguishable |
| Organisation mobile number | `0818400598` (always this number, so SMS delivery can be checked on the handset) |
| Organisation Email Address | mpenduloizwelinuk@gmail.com |
| Full Address | `1 Test Street, Pretoria` · Area Code `0001` |
| Free text | **≤100 characters.** Long prose has caused silent 500s elsewhere in this hub. |

## Test Cases

### TC-01 — POPIA informed-consent gate

*The registration entry point is a consent notice, not a form. Verify it is presented and that consent is actually enforced.*

- **Type:** Validation / gate
- **Steps:**
  1. NAVIGATE to the public portal login page and sign in
  2. ASSERT the landing page after login is `/dynamic/Shesha.Workflow/workflows-inbox` *(the NPO landing page is **not** the default — see step 3)*
  3. CLICK **Register NPO** in the nav → ASSERT the page is `/dynamic/boxfusion.dsdnpo/no-existing-npo-landing-page` and reads *"You are currently not linked to any NPOs. Please link your existing NPO number or register a new one."*
  4. ASSERT three actions are offered: **Register a new NPO**, **Link to an Existing NPO**, **Enquiry**
  5. CLICK **Register a new NPO** — ⚠️ this button has **hidden mounted duplicates**; click the first *visible* match, not `.first()`
  6. ASSERT (BLOCKING) the page is `/dynamic/boxfusion.dsdnpo/popi-act` and headed *"Informed Consent Notice under POPIA"*
  7. ASSERT both consent checkboxes are present and **unticked** on arrival:
     - *"I have read and understand the content of this consent."*
     - *"I have gone through all the content uploaded under the Public Portal library under the Education and Awareness section that relates to how to register an NPO."*
  8. CLICK **Next** with **neither** box ticked
  9. ASSERT consent is enforced — the wizard does **not** advance and a validation message names the unmet consent
  10. TICK only the first checkbox, CLICK **Next** → ASSERT it still does not advance
  11. TICK both checkboxes, CLICK **Next**
- **Expected result:** Registration cannot begin without both consents. With both ticked, Next proceeds and a registration workflow instance is created.
- **Assertions:**
  - [ ] ASSERT (BLOCKING) the POPIA page is displayed with both checkboxes unticked
  - [ ] ASSERT Next is blocked with zero consents ticked
  - [ ] ASSERT Next is blocked with only one consent ticked
  - [ ] ASSERT Next proceeds with both ticked
- **❓ Question for Thabiso:** the second checkbox asserts the applicant has read the Education and Awareness library — **the system cannot verify this**. Is a self-attestation the intended control, or should the portal gate on actual library access? Also: **is Next meant to be disabled, or to error on click?** Steps 8–10 assume enforcement exists; that is unverified.

---

### TC-02 — Initiate Registration opens with the seven-step wizard

*Confirm consent creates a workflow instance and the wizard is shaped as expected.*

- **Type:** Happy path (structural)
- **Steps:**
  1. Complete TC-01 through both consents
  2. ASSERT (BLOCKING) the URL becomes `/shesha/workflow-action?id=<paId>&todoid=<todoId>` — a **workflow instance is created at this point**
  3. EXTRACT and record `paId` and `todoid` — the draft is resumable and later cases depend on it
  4. ASSERT the page is headed *"Initiate Registration:"*
  5. ASSERT the stepper shows exactly these seven steps in order: **Read This · Organisation Details · Objectives · Office Bearer · Admin & Operations · Documents · Declaration**
  6. ASSERT the first step (*Read This*) is informational — no input fields
  7. CLICK **Next**
- **Expected result:** Consenting creates a resumable registration workflow, and the wizard presents seven steps beginning with an informational *Read This*.
- **Assertions:**
  - [ ] ASSERT (BLOCKING) a `workflow-action` URL with both `id` and `todoid` is reached
  - [ ] ASSERT the seven step names match exactly
  - [ ] ASSERT *Read This* carries no form fields

---

### TC-03 — Organisation Details: mandatory-field validation

*Eight fields are marked required. Verify each is actually enforced.*

- **Type:** Negative / validation
- **Steps:**
  1. Reach *Organisation Details* (TC-02)
  2. ASSERT the following are marked mandatory: **Organisation Name**, **Organisation mobile number**, **Organisation Email Address**, **Financial year end month**, **Full Address** *(appears twice — see the note below)*, **Legal Form**, **Office Bearer Term (Year(s))**
  3. CLICK **Next** with the step empty → ASSERT it does not advance and each unmet mandatory field is flagged individually
  4. TYPE an invalid email (`not-an-email`) into Organisation Email Address → ASSERT a format error is raised
  5. TYPE a non-numeric value into Organisation mobile number → ASSERT a format error is raised
  6. TYPE a non-numeric value into Office Bearer Term (Year(s)) → ASSERT a format error is raised
  7. Populate every mandatory field with valid test data, leaving all optional fields empty → ASSERT **Next** advances
- **Expected result:** Every field marked mandatory is enforced; email, phone and term are format-validated; the step advances on mandatory fields alone.
- **Assertions:**
  - [ ] ASSERT Next is blocked on an empty step
  - [ ] ASSERT each of the 8 mandatory fields is individually flagged
  - [ ] ASSERT email / mobile / term format validation
  - [ ] ASSERT the step advances with only mandatory fields populated
- **⚠️ Observed anomaly (2026-08-12):** the label **`Full Address *`** renders **twice**, each followed by its own *District Municipality · Metropolitan Municipality · Area Code* group, and one group also carries *Province*. This looks like a physical-address and postal-address pair whose labels were never differentiated. **Confirm the intended labels with Thabiso** — if both are genuinely required, a spec cannot address them by label alone and must index them positionally.
- 🔑 **Programmatic `fill()` does NOT bind — use real keystrokes.** Confirmed 2026-08-12 by direct comparison on the same field: a scripted `fill('1 Test Street, Pretoria')` vanished, while the **same field typed by hand** (`18 South Street, Zwartkop, Centurion, South Africa`) persisted. `fill()` sets the DOM value but React state never updates, so the next re-render resets the input to empty — which is why a step can report "9 fields filled" and then read entirely empty. **Click the field and `pressSequentially`** (clearing first, so repeated runs don't accumulate), then read the value back and re-enter once if it did not stick.
  ⚠️ *Retracted:* an earlier draft of this plan inferred that Full Address was an address-lookup or was pre-populated from the signed-in person's profile. Neither is established — the value was hand-typed by the tester. Whether *District Municipality · Metropolitan Municipality · Area Code · Province* are derived from the address or simply have their own unlabelled controls is **still unknown**.
- 🔑 **The mandatory set is CONDITIONAL on Legal Form.** A **ninth** required field, **`Membership *`** (radio), appears only after a Legal Form is chosen (observed with *Voluntary Association*). TC-03's "8 mandatory fields" holds only **before** Legal Form is set. Re-read the required set after every Legal Form change, and check whether **NPC** and **Trust** reveal different fields again.
- 🔑 **The step wipes programmatic values — fill AFTER the form settles.** On a resumed draft the saved data loads **asynchronously after the step renders**, clearing anything typed in the meantime: a run that filled 9 fields and verified a select found every one of them empty moments later, leaving Next correctly disabled. **Wait until the form has settled (its own saved values present and value-stable) before filling, then verify each field retained its value and re-fill if not.** A disabled Next after filling usually means this race, not a defect.
- **✅ RESOLVED 2026-08-12 — the "Next timeout" is a DISABLED BUTTON, not a hang.** The exploratory pass recorded a 15s timeout here as a possible fault. It is not: `Next` carries `disabled` until every mandatory field is satisfied, so an automated click simply waits for an actionable element and expires. **Assert `nextDisabled` directly instead of relying on click timeouts** — a timeout here means "a mandatory field is still empty", not "the app hung".
- **⚠️ The real defect is the absence of feedback.** Next is disabled on both an empty and a partially populated step with **no field-level and no summary validation message at all**, so the user cannot tell which of the 8 mandatory fields is unsatisfied. Same shape as an observation on PD-PMDS's DDG draft wizard — possibly a Shesha-wide form pattern.
- **Legal Form options (confirmed):** **Voluntary Association · NPC · Trust**.

---

### TC-04 — Organisation Details: happy path

*Populate the full step, optional fields included, and advance.*

- **Type:** Happy path
- **Steps:**
  1. Reach *Organisation Details*
  2. TYPE **Organisation Name** = `QA Test NPO <YYYY-MM-DD>`, **Trading Name/Short Name** = `QA NPO`
  3. TYPE **Organisation mobile number** = `0818400598`; **Organisation Whatsapp Number** = same; **Organisation Telephone** = `0123456789`
  4. TYPE **Organisation Email Address** = mpenduloizwelinuk@gmail.com
  5. SELECT **Financial year end month**
  6. TYPE both **Full Address** blocks = `1 Test Street, Pretoria`; SELECT **Province**, **District Municipality** / **Metropolitan Municipality**; TYPE **Area Code** = `0001`
  7. TICK **Have Income tax no?** → ASSERT whether a tax-number field is revealed *(unverified — the checkbox implies a conditional field)*
  8. CLICK a **Legal Form** radio → record the options offered
  9. SELECT **National (SA)** *(and note what **International** offers)*
  10. TYPE **Office Bearer Term (Year(s))** = `3`
  11. CLICK **Next** → ASSERT the wizard advances to **Objectives**
- **Expected result:** A fully populated Organisation Details step saves and advances to Objectives.
- **Assertions:**
  - [ ] ASSERT (BLOCKING) the step advances to Objectives
  - [ ] ASSERT ticking *Have Income tax no?* reveals a tax-number field
  - [ ] ASSERT no console error or non-2xx response accompanies the advance
- **❓ Questions for Thabiso:** what are the valid **Legal Form** options and does each change the required fields downstream? What distinguishes **National (SA)** from **International**, and is one mandatory?

---

### TC-05 — Objectives  *(placeholder — step not yet observed)*

- **Type:** Happy path + validation
- **Steps:** 1. Reach *Objectives* from TC-04 · 2. RECORD every field, its type and whether it is mandatory · 3. Populate and advance
- **Expected result:** *To be defined once the step has been seen.* NPO objectives are a statutory part of registration, so expect a mandatory free-text or categorised-objective control.
- **Assertions:** [ ] ASSERT the step is reachable · [ ] ASSERT it advances to Office Bearer

---

### TC-06 — Office Bearer  *(placeholder — step not yet observed)*

- **Type:** Happy path + validation
- **Steps:** 1. Reach *Office Bearer* · 2. RECORD the fields and whether **multiple** office bearers can be added · 3. Add the minimum number and advance
- **Expected result:** *To be defined.* TC-04 captures an **Office Bearer Term (Year(s))** on the previous step, so expect a per-person list here.
- **Assertions:** [ ] ASSERT at least one office bearer can be captured · [ ] ASSERT the statutory minimum count is enforced *(ask Thabiso what it is)*

---

### TC-07 — Admin & Operations  *(placeholder — step not yet observed)*

- **Type:** Happy path + validation
- **Steps:** 1. Reach the step · 2. RECORD fields · 3. Populate and advance
- **Assertions:** [ ] ASSERT the step is reachable and advances to Documents

---

### TC-08 — Documents  *(placeholder — step not yet observed)*

- **Type:** Happy path + validation
- **Steps:** 1. Reach *Documents* · 2. RECORD which documents are required (expect a constitution/founding document) · 3. ATTACH each from `test-data/` · 4. CLICK Next
- **Expected result:** *To be defined.* Expect mandatory supporting documents enforced before Next.
- **Assertions:** [ ] ASSERT each mandatory document is enforced · [ ] ASSERT an attached document persists across a Back/Next round trip
- **⚠️ Automation note:** this is an **AntD Upload**. Injecting into the hidden file input does **not** bind and produces a false "required" failure. Use `setInputFiles` on the visible control, or a real click. Evidence that must ship belongs under `test-reports/`, never `test-results/` (gitignored).

---

### TC-09 — Declaration and submit  *(placeholder — step not yet observed)*

- **Type:** Happy path (end-to-end completion)
- **Steps:** 1. Reach *Declaration* · 2. RECORD the attestations · 3. TICK them and SUBMIT · 4. ASSERT a reference number or confirmation is shown · 5. EXTRACT it · 6. ASSERT the application is now visible to DSD under **admin → CRUDS → All Applications**
- **Expected result:** Submitting files the registration application, gives the applicant a traceable reference, and surfaces it on the DSD side for assessment.
- **Assertions:** [ ] ASSERT (BLOCKING) submission succeeds · [ ] ASSERT a reference number is returned · [ ] ASSERT the application appears in All Applications on the admin portal
- **⚠️ Cross-portal:** this case needs a DSD-staff login. Until a role-scoped staff account exists, the final assertion runs on the shared dev account and proves **visibility, not authorisation**.

---

### TC-10 — Link to an Existing NPO  *(placeholder — alternative entry point)*

- **Type:** Alternative path
- **Steps:** 1. From the landing page CLICK **Link to an Existing NPO** · 2. RECORD what identifier is required (expect an NPO registration number) · 3. Attempt a valid link · 4. Attempt an unknown number
- **Expected result:** *To be defined.* A valid NPO number links the account; an unknown one is rejected with a clear message.
- **Assertions:** [ ] ASSERT a valid number links the account · [ ] ASSERT an unknown number is rejected and does **not** link
- **❓ Question for Thabiso:** what stops someone linking to an NPO they have no authority over? If the number alone is sufficient, that is an authorisation concern worth raising early.

---

## Selectors observed live (2026-08-12)
Captured with Playwright via Node, not MCP — treat as verified for TC-01/TC-02 and unverified beyond.

| Target | Selector | Note |
|---|---|---|
| Login username | `input[type=text]` (first visible) | login page has text + password + a checkbox |
| Login password | `input[type=password]` | wait for this to appear — it marks hydration |
| Login submit | `button:has-text("Login")` | admin portal uses **Sign In** instead |
| Nav → NPO landing | `a:has-text("Register NPO")` | login does **not** land here by default |
| Start registration | `button:has-text("Register a new NPO")` | 🔑 **hidden duplicates exist** — click first *visible* match |
| Consent checkboxes | `.ant-checkbox-wrapper` (2 visible) | labels are on the wrapper, not a `<label for>` |
| Wizard step titles | `.ant-steps-item-title` | 7 items |
| Form fields | `.ant-form-item` → label in `.ant-form-item-label label` | required marked by `.ant-form-item-required` |
| Next / Back | `button:has-text("Next")` / `button:has-text("Back")` | |
