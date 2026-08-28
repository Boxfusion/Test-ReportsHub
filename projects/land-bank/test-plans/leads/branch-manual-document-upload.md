# Test Plan: LEAD-2.2 — Land Bank Branch Manual Document Upload (all Client Types)

> **Status:** Ready — **12 passed / 1 failed / 1 skipped.** The single failure is TC-02's expected-fail assertion for **BUG-LB-007** (Sole Proprietor filtered out of the Client Type dropdown), which also blocks TC-03b (the one legitimate skip). TC-12 now executes for the first time — it previously skipped itself silently on every run; see the Recording Notes and **BUG-LB-014**.
> **Owner:** QA
> **Last Updated:** 2026-08-21
> **Estimated Duration:** 720s

## Metadata
| Field | Value |
|-------|-------|
| App | Land Bank CRM (Admin Portal) |
| Environment | Dev (`DEV_APP_URL`, active `TEST_ENV=dev`) |
| Login As | RM role (`RM_USERNAME` / `RM_PASSWORD` in the gitignored `.env`) |
| Page under test | Leads → **New Lead** modal (`LandBank.Crm/LBLead-create`), Lead Channel = **Landbank Branch** |
| Test document | `test-data/pdf-test.pdf` (hub root) |
| Related plans | [lead-to-opportunity-lifecycle.md](lead-to-opportunity-lifecycle.md), [../workflow/loan-application-workflow-stages.md](../workflow/loan-application-workflow-stages.md) |

## Objective
> Validate the **Landbank Branch** lead-capture route, where consent — and, for entities, the resolution — is captured **upfront at lead capture** by manually uploading signed documents, rather than later in the workflow. Cover every selectable Client Type and prove that each takes the correct one of the two distinct capture processes, with the right required fields, uploads, templates and Save gating.

> **Why this matters downstream:** a lead captured through this route arrives at the loan application workflow with its consent (and resolution) already satisfied, so the workflow's consent stage is not outstanding. The in-workflow alternative is covered by [../workflow/loan-application-workflow-stages.md](../workflow/loan-application-workflow-stages.md).

## There are exactly two processes, not eight

Recorded live 2026-08-20 by walking every selectable Client Type on the Landbank Branch channel. Despite eight client types, the form collapses to **two** capture processes:

| Process | Client Types | Toggle | Documents captured |
|---|---|---|---|
| **A — Individual consent only** | `Individual (Individual)` | **unlabelled** *Upload Consent?* switch | **1** — Upload Consent |
| **B — Entity resolution + consent** | `Close Corporation (Entity)`, `Co-Operative (Entity)`, `Listed Company (Entity)`, `Trust`, `NGO`, `Partnership`, `Private Company` | labelled `uploadResAndConsent` — *Upload Resolution and Consent?* | **2** — Upload Consent **and** Upload Resolution |

> All seven Process-B types produced a **byte-identical** field inventory in both toggle states — there is no per-type variation within Process B beyond the Entity Name requirement noted below.

### Process A — Individual (`Individual (Individual)`)

| Toggle | Visible fields | Actions | Save |
|---|---|---|---|
| **OFF** (default) | `mobileNumber`\*, `emailAddress`\*, `idNumber`\* | **Request OTP** | **enabled** |
| **ON** | the above **+** `manualApproval` — *Upload Consent* | **Download Consent Template**, *(press to upload)*; **Request OTP is hidden** | **disabled** |

- The switch has **no `label[for]`** — its caption *"Upload Consent?"* sits in a preceding label-only form item, so it must be addressed as the only visible `.ant-switch` in the modal.
- The client-detail block (Title, First Name, Last Name, Province, Preferred Communication, Description) is **not shown at all** until the document is committed.
- After attaching a file an **Upload** commit button appears. Clicking it reveals the client-detail block, re-enables **Save**, and **clears the previously typed Mobile Number / Email Address / ID Number** — so those must be re-entered *after* Upload.
- **ID Number is Luhn-validated** — an invalid value raises *"Please enter a valid South African ID number"*.

### Process B — the seven entity-style types

| Toggle | Visible fields | Actions | Save |
|---|---|---|---|
| **OFF** (default) | `title`\*, `firstName`\*, `lastName`\*, `territory`\* (Province), `preferredCommunication`\*, `organisation` (Entity Name — see below), `mobileNumber`\*, `emailAddress`\* | *(none — **no Request OTP** for any entity type)* | **enabled** |
| **ON** | `signatoryIdNumber`\*, `companyRegistrationNumber`\*, `signatoryConsent`\* — *Upload Consent*, `resolution`\* — *Upload Resolution*. The client-detail block is **hidden**. | **Download Consent Template**, **Download Resolution Template**, two *(press to upload)* controls | **disabled** |

- After attaching **both** documents an **Upload** commit button appears. Clicking it fires
  `POST /api/services/app/LBLead/PopulateFromCompanyRegistration`, a **CIPC lookup keyed off the Company Registration Number**. The commit **creates the lead server-side** and returns its id in either branch below, then re-reveals the client-detail block and enables **Save**.

> ### ⚠️ Not every entity type is CIPC-registered — the lookup has two outcomes
>
> **Verified live 2026-08-21.** The `PopulateFromCompanyRegistration` call answers `200` for all seven
> Process-B types, but the payload differs, and the plan asserts the correct branch per client type.
>
> | Outcome | Client Types | Response | Effect on the form |
> |---|---|---|---|
> | **Populated** | `Close Corporation (Entity)`, `Listed Company (Entity)`, `Co-Operative (Entity)`, `Private Company`, `NGO` | `{"success":true,"leadId":"…","isNewLead":true,"companyName":"BOXFUSION (PTY)LTD"}` | **Entity Name** is overwritten with the CIPC company name; the registration number is normalised (`2012/225386/07` → **`K2012/225386/07`**) |
> | **Declined** | `Trust`, `Partnership` | `{"success":false,"message":"CIPC lookup is not available for Trust. This entity type is not registered with CIPC.","leadId":"…","isNewLead":true,"companyName":null,"registrationNumber":null}` | **Entity Name and Company Registration Number are both wiped.** See **BUG-LB-012** |
>
> The refusal is **correct and deliberate** — a trust has a Master's Office IT number and a partnership
> generally has no registration number at all, so there is nothing for CIPC to return. The backend even
> words the refusal in ready-to-display English.
>
> **What is defective is the client's handling of it.** On the declined branch the form applies the null
> response anyway: Entity Name is cleared *and re-rendered as read-only text with no `<input>`*, so the
> operator's typed value is destroyed and cannot be re-entered; the registration number is cleared too
> (though it stays editable); and `result.message` is never surfaced. **Save is still enabled** across both
> empty required fields. Logged as **BUG-LB-012**.
>
> An earlier revision of this plan asserted a successful CIPC populate for **all seven** types, having only
> been recorded against Close Corporation — that produced two spurious TC-08/TC-09 failures.

> ### ⚠️ Step order is load-bearing — populate everything *before* clicking Upload
>
> **Verified 2026-08-21.** The Upload commit is **conditional on the form already being complete**. If any
> required field is still empty when Upload is clicked, **no request is issued at all** and nothing happens —
> no error, no toast. It looks exactly like a broken button. The correct order is:
>
> 1. Choose Lead Channel and Client Type.
> 2. **While the toggle is still OFF**, populate every visible required field — Title, First Name, Last Name,
>    Province, Preferred Communication, **Entity Name**, Mobile Number, Email Address.
> 3. Turn the consent/resolution toggle **ON**.
> 4. Fill Signatory ID Number and Company Registration Number, and attach the document(s).
> 5. Click **Upload** → the API call fires and the client-detail block is revealed.
> 6. **Re-populate Title, First Name and Last Name** — the commit **clears** those three. Mobile Number and
>    Email Address survive; Entity Name is **overwritten** with the CIPC-returned company name.
> 7. **Save** is now enabled.
>
> An earlier revision of this plan filled nothing before the toggle, which made the commit silently decline and
> produced a spurious blocker report (withdrawn — see `../../test-reports/bugs/closed/2026-08-20-branch-manual-document-upload.md`).

**Entity Name requirement splits within Process B** (verified live, toggle OFF):

| Entity Name (`organisation`) | Client Types |
|---|---|
| **Required** | `Close Corporation (Entity)`, `Co-Operative (Entity)`, `Listed Company (Entity)` — i.e. the three with the **`(Entity)`** suffix |
| **Optional** | `Trust`, `NGO`, `Partnership`, `Private Company` — i.e. the four **without** a suffix |

> Flagged for the business: all seven take the identical entity upload path, so it is not obvious why Entity Name is mandatory for three of them and optional for the other four. See BUG-LB-009.

## Known Blockers / Defects

> **~~BUG-LB-010~~ — WITHDRAWN 2026-08-21, not a defect.** Previously reported as "the Upload commit is a silent
> no-op; manual-upload leads can never be saved". **That was tester error.** The commit is conditional on the form
> already being complete; every reproduction had clicked Upload with required fields still empty, and the app was
> correctly declining to submit an incomplete payload. Re-tested end to end on 2026-08-21 with everything populated
> first — the API call fires, CIPC populates, and the lead saves
> (`LBLead-details?id=5fab2b14-12c5-4f20-af10-f81ec44a3935`). The fault was this plan's step order, corrected above.
> Closed report retained at `../../test-reports/bugs/closed/2026-08-20-branch-manual-document-upload.md`.

> **BUG-LB-007 (blocker for the Sole Proprietor scenario, recorded live 2026-08-20).**
> **`Sole Proprietor (Individual)` cannot be selected on the New Lead form.** The Client Type dropdown offers only **8** options
> — `Individual (Individual)`, `Close Corporation (Entity)`, `Co-Operative (Entity)`, `Listed Company (Entity)`, `Trust`, `NGO`,
> `Partnership`, `Private Company`. The `LandBank.Crm/ClientType` reference list still **contains** `Sole Proprietor (Individual)`
> (item value **3**), so the option is being **filtered out by the form**, not removed from the data.
> **This is a regression:** on **2026-07-31** the same dropdown *did* offer `Sole Proprietor (Individual)` — it was recorded in
> [lead-to-opportunity-lifecycle.md](lead-to-opportunity-lifecycle.md). A Sole Proprietor lead therefore cannot be captured at all
> today, so **TC-03 cannot be executed**.

> **BUG-LB-008 (data-model question, recorded live 2026-08-20, **narrowed 2026-08-21**).** `Trust`, `NGO` and `Partnership` are all
> required to supply a **Company Registration Number** (`companyRegistrationNumber`\*) on the upload path, and that value is what
> drives the **CIPC** lookup. A trust has a Master's Office **IT number** and a partnership generally has no registration number at
> all, so the field is being demanded for identifiers that do not exist.
>
> **Narrowed on re-test.** The original report claimed these types "will produce meaningless CIPC results in production" — that is
> **wrong**, and the retraction matters. The backend *knows* which types are CIPC-registered and refuses the lookup for `Trust` and
> `Partnership` with an explicit message (see the two-outcome table above). `NGO` **is** CIPC-registered — non-profit companies are
> registered as NPCs — and populates successfully, so it should be dropped from this bug entirely. What genuinely remains is
> narrower: the form still **forces a registration number to be typed** for Trust and Partnership before the Upload commit is even
> offered, for a lookup the server will decline. Either the label/validation should vary by client type, or these two types should
> skip the registration-number requirement.
>
> The far more serious follow-on — the client wiping Entity Name irrecoverably when the lookup is declined — is **BUG-LB-012**.

> **BUG-LB-014 (recorded live 2026-08-21).** On the converted Opportunity's **Client Info** tab,
> *Does the client have a resolution?* (`loanApplication_hasResolution`) is rendered **twice** — both
> instances inside the *same* active tab panel, under the same **Entity Information** heading, both
> read-only and both bound to the same property. A genuine duplicate placement in the
> `LBOpportunity-details` form definition, not the usual Ant tabs retained-panel artefact. TC-12
> asserts across **every** instance so it keeps passing once the duplicate is removed. Affects this
> plan and [online-digital-channel-lead-capture.md](online-digital-channel-lead-capture.md) alike.

> **BUG-LB-009 (inconsistency, recorded live 2026-08-20).** **Entity Name** is **required** for the three `(Entity)`-suffixed
> client types but **optional** for `Trust`, `NGO`, `Partnership` and `Private Company`, even though all seven follow the identical
> resolution-plus-consent upload process. A Private Company lead can therefore be saved with no entity name.

> **Carried over — BUG-LB-002.** On **Process A with the toggle OFF**, Save is enabled immediately and the lead can be saved
> **without completing the OTP**, producing a lead with blank First Name / Last Name / Province / Preferred Communication because
> that variant never displays them. See [lead-to-opportunity-lifecycle.md](lead-to-opportunity-lifecycle.md).

## Recording Notes (2026-08-20, extended 2026-08-21)

- **Opening a record from a grid:** each row's first cell holds an `a.sha-link` pointing at `…-details?id=<guid>`. Read its `href` and `goto` it rather than clicking. **Wait for `[role="row"].tr-body` to be visible first** — the grid fetches asynchronously, so a `count()` issued straight after `goto` returns 0.
- **Never put a conditional `test.skip` in a test body.** TC-12 did exactly that — it queried the grid before it had loaded, found 0 rows, and skipped itself with *"run TC-04 first"* on **every** run, despite TC-04 running immediately before it. It never executed once, reporting a plausible reason each time. Removing the skip immediately exposed two real faults: the `PASSED`/`CONVERTED` casing trap and **BUG-LB-014**. Where an earlier TC in the same plan guarantees the precondition, **assert** it. *(The skip at TC-03b is a legitimate exception — it is conditioned on genuinely observed app state, BUG-LB-007.)*
- **Asserting on the lead details page:** values render **word-cased** (`Converted`, `Passed`, `New`), not upper-cased as the reference-list item names suggest, and read-only fields **concatenate with no separators** (`…LeadStatusConvertedAssessmentPassed…`), so `\b` word boundaries never match. Anchor on the label: `/Lead\s*Status\s*Converted/i`.

- **`Co-Applicant`** (ClientType item value **9**) is also absent from the dropdown. That exclusion looks deliberate — it is a participant role, not a lead client type — and is **not** treated as a defect here.
- Ant Design conventions carried from the sibling plans: fields anchored on `<label for>` via a **direct-child** chain; conditional fields hidden with `ant-form-item-hidden` rather than removed; select options matched on their `title` inside the open (non-hidden) dropdown; once a select holds a value its hidden `<input>` is click-intercepted, so the trigger must be the `.ant-select-selector`.
- **The consent/resolution toggle state persists across a Client Type change.** Switching from one Process-B type to another leaves the switch ON and the upload fields rendered — so a test that changes Client Type mid-form must re-assert the toggle state rather than assume it reset.
- Both **Download Consent Template** and **Download Resolution Template** render as toolbar buttons, not anchors — assert on the button, not an `href`.
- The **Upload** commit button appears only *after* a file is attached, and is separate from the *(press to upload)* control.

## Preconditions
- [ ] App is reachable at the Dev URL; valid RM credentials in `.env`
- [ ] The signed-in RM can see **Leads** in the side menu and the **New Lead** toolbar button
- [ ] `test-data/pdf-test.pdf` exists at the hub root
- [ ] Luhn-valid SA ID numbers are available: `9001015800088`, `8503155400083`, `9207125001083`

## Test Cases

### TC-01 — Log in as an RM and open the New Lead form on the Landbank Branch channel
- **Type:** Happy path
- **Steps:**
  - NAVIGATE to `/login`
  - TYPE the Username field with the RM username (from `.env`)
  - TYPE the Password field with the RM password (from `.env`)
  - CLICK **Sign In**
  - WAIT for the app to redirect away from `/login`
  - NAVIGATE to `/dynamic/LandBank.Crm/LBLead-table`
  - SNAPSHOT — confirm the **New Lead** button is rendered
  - CLICK **New Lead**
  - WAIT for the **Add New Lead** modal to open
  - SNAPSHOT — confirm **Lead Owner** self-populates with the signed-in RM
  - SELECT Lead Channel — choose `Landbank Branch`
  - SNAPSHOT — confirm the client-detail block collapses for the Landbank Branch channel
- **Assertions:**
  - [x] ASSERT (BLOCKING) the **Add New Lead** modal is displayed
  - [x] ASSERT **Lead Owner** self-populates with the signed-in RM
  - [x] ASSERT selecting `Landbank Branch` collapses the client-detail block, leaving only Lead Owner, Lead Channel and Client Type
  - [x] ASSERT the Lead Channel option is spelled **`Landbank Branch`** (one word)

---

### TC-02 — The Client Type dropdown offers exactly the eight selectable types
- **Type:** Happy path — inventory check
- **Depends on:** TC-01
- **Steps:**
  - CLICK the Client Type select trigger
  - SNAPSHOT — confirm the full option list
  - EXTRACT every Client Type option
- **Assertions:**
  - [x] ASSERT (BLOCKING) the dropdown offers exactly these eight options — `Individual (Individual)`, `Close Corporation (Entity)`, `Co-Operative (Entity)`, `Listed Company (Entity)`, `Trust`, `NGO`, `Partnership`, `Private Company`
  - [x] ASSERT `Co-Applicant` is **not** offered (participant role, excluded by design)
  - [x] ASSERT `Sole Proprietor (Individual)` **is** offered — *expected FAIL: BUG-LB-007, it is filtered out of the form although still present in the `ClientType` reference list*

---

### TC-03 — Individual / Sole Proprietor: consent-only upload
- **Type:** Happy path (Process A) — **Sole Proprietor half blocked by BUG-LB-007**
- **Depends on:** TC-01
- **Steps:**
  - SELECT Client Type — choose `Individual (Individual)`
  - SNAPSHOT — confirm the Individual field set, the *Upload Consent?* switch and the **Request OTP** action
  - CLICK the *Upload Consent?* switch to turn it ON
  - SNAPSHOT — confirm the consent upload and template are revealed and **Request OTP** is hidden
  - CLICK the **Upload Consent** *(press to upload)* control and attach `test-data/pdf-test.pdf`
  - SNAPSHOT — confirm the attached document name and the **Upload** commit button
  - CLICK **Upload**
  - WAIT for the client-detail block to be revealed
  - SNAPSHOT — confirm the client-detail block is rendered and **Save** is enabled
  - SELECT Title — choose `Mr`
  - TYPE the First Name field with `AutoQA`
  - TYPE the Last Name field with `BranchIndivUpload`
  - SELECT Province — choose `Gauteng`
  - SELECT Preferred Communication — choose `Email`
  - TYPE the Mobile Number field with `0820000501`
  - TYPE the Email Address field with `autoqa.branch.indiv@example.com`
  - TYPE the ID Number field with `9001015800088`
  - CLICK **Save**
  - WAIT for the lead details page to load
  - SNAPSHOT — confirm the saved lead
  - *(Sole Proprietor: repeat the above selecting `Sole Proprietor (Individual)` — **cannot be executed**, see BUG-LB-007)*
- **Assertions:**
  - [x] ASSERT the Individual field set is `Mobile Number`, `Email Address` and `ID Number`, all required
  - [x] ASSERT the **Request OTP** action is offered while the toggle is OFF
  - [x] ASSERT **Save** is enabled while the toggle is OFF
  - [x] ASSERT (BLOCKING) turning the toggle ON reveals **Upload Consent** and **disables Save**
  - [x] ASSERT turning the toggle ON **hides** the **Request OTP** action
  - [x] ASSERT a **Download Consent Template** action is offered
  - [x] ASSERT only **one** document is requested — there is no **Upload Resolution** control for an Individual
  - [x] ASSERT the attached document name (`pdf-test.pdf`) is displayed against **Upload Consent**
  - [x] ASSERT an **Upload** commit button appears only after a document is attached
  - [x] ASSERT clicking **Upload** reveals the client-detail block and re-enables **Save**
  - [x] ASSERT clicking **Upload** clears the previously entered Mobile Number, Email Address and ID Number
  - [x] ASSERT an invalid ID number is rejected with *"Please enter a valid South African ID number"*
  - [x] ASSERT the lead saves and the URL becomes the lead details route
  - [x] ASSERT the saved lead records Client Type `Individual (Individual)` and Lead Channel `Landbank Branch`
  - [x] ASSERT `Sole Proprietor (Individual)` can be selected and follows the identical consent-only process — *expected FAIL: BUG-LB-007*

---

### TC-04 — Close Corporation: resolution + consent upload
- **Type:** Happy path (Process B, `(Entity)`-suffixed)
- **Depends on:** TC-01
- **Steps:**
  - SELECT Client Type — choose `Close Corporation (Entity)`
  - SNAPSHOT — confirm the full client-detail block, **Entity Name**, and the *Upload Resolution and Consent?* switch
  - CLICK the *Upload Resolution and Consent?* switch to turn it ON
  - SNAPSHOT — confirm the signatory fields and both upload controls are revealed and **Save** is disabled
  - TYPE the Signatory ID Number field with `9207125001083`
  - TYPE the Company Registration Number field with `2012/225386/07`
  - CLICK the **Upload Consent** *(press to upload)* control and attach `test-data/pdf-test.pdf`
  - CLICK the **Upload Resolution** *(press to upload)* control and attach `test-data/pdf-test.pdf`
  - TYPE the Mobile Number field with `0820000502`
  - TYPE the Email Address field with `autoqa.branch.closecorp@example.com`
  - SNAPSHOT — confirm both attached document names and the **Upload** commit button
  - CLICK **Upload**
  - WAIT for the CIPC lookup to auto-populate the entity details
  - SNAPSHOT — confirm the auto-populated Entity Name and normalised Company Registration Number
  - SELECT Title — choose `Mr`
  - TYPE the First Name field with `AutoQA`
  - TYPE the Last Name field with `BranchCloseCorpUpload`
  - SELECT Province — choose `Gauteng`
  - SELECT Preferred Communication — choose `Email`
  - CLICK **Save**
  - WAIT for the lead details page to load
  - SNAPSHOT — confirm the saved lead
- **Assertions:**
  - [x] ASSERT with the toggle OFF the full client-detail block is displayed and **Entity Name is required**
  - [x] ASSERT no **Request OTP** action is offered for an entity client type
  - [x] ASSERT (BLOCKING) turning the toggle ON reveals **Signatory ID Number**, **Company Registration Number**, **Upload Consent** and **Upload Resolution**, all required, and **disables Save**
  - [x] ASSERT turning the toggle ON hides the client-detail block
  - [x] ASSERT **two** documents are requested — both **Upload Consent** and **Upload Resolution**
  - [x] ASSERT both **Download Consent Template** and **Download Resolution Template** actions are offered
  - [x] ASSERT both attached document names (`pdf-test.pdf`) are displayed against their controls
  - [x] ASSERT an **Upload** commit button appears only after both documents are attached
  - [x] ASSERT clicking **Upload** runs the CIPC lookup and auto-populates **Entity Name** from the Company Registration Number
  - [x] ASSERT the Company Registration Number is normalised to its `K`-prefixed form
  - [x] ASSERT clicking **Upload** re-reveals the client-detail block and re-enables **Save**
  - [x] ASSERT the lead saves and records Client Type `Close Corporation (Entity)` and Lead Channel `Landbank Branch`

---

### TC-05 — Listed Company: resolution + consent upload
- **Type:** Happy path (Process B, `(Entity)`-suffixed)
- **Depends on:** TC-01
- **Steps:** As TC-04, with these substitutions:
  - SELECT Client Type — choose `Listed Company (Entity)`
  - TYPE the Last Name field with `BranchListedUpload`
  - TYPE the Mobile Number field with `0820000503`
  - TYPE the Email Address field with `autoqa.branch.listed@example.com`
- **Assertions:**
  - [x] ASSERT with the toggle OFF **Entity Name is required**
  - [x] ASSERT (BLOCKING) the toggle ON field set is identical to Close Corporation's — signatory fields plus both uploads
  - [x] ASSERT both document templates are offered
  - [x] ASSERT the CIPC lookup auto-populates **Entity Name** on **Upload**
  - [x] ASSERT the lead saves and records Client Type `Listed Company (Entity)`

---

### TC-06 — Co-Operative: resolution + consent upload
- **Type:** Happy path (Process B, `(Entity)`-suffixed)
- **Depends on:** TC-01
- **Steps:** As TC-04, with these substitutions:
  - SELECT Client Type — choose `Co-Operative (Entity)`
  - TYPE the Last Name field with `BranchCoOpUpload`
  - TYPE the Mobile Number field with `0820000504`
  - TYPE the Email Address field with `autoqa.branch.coop@example.com`
- **Assertions:**
  - [x] ASSERT with the toggle OFF **Entity Name is required**
  - [x] ASSERT (BLOCKING) the toggle ON field set is identical to Close Corporation's
  - [x] ASSERT the lead saves and records Client Type `Co-Operative (Entity)`

---

### TC-07 — Private Company: resolution + consent upload
- **Type:** Happy path (Process B, non-suffixed)
- **Depends on:** TC-01
- **Steps:** As TC-04, with these substitutions:
  - SELECT Client Type — choose `Private Company`
  - TYPE the Last Name field with `BranchPrivCoUpload`
  - TYPE the Mobile Number field with `0820000505`
  - TYPE the Email Address field with `autoqa.branch.privco@example.com`
- **Assertions:**
  - [x] ASSERT (BLOCKING) the toggle ON field set is identical to the `(Entity)`-suffixed types
  - [x] ASSERT with the toggle OFF **Entity Name is optional** for a non-suffixed client type — see BUG-LB-009
  - [x] ASSERT the lead saves and records Client Type `Private Company`

---

### TC-08 — Trust: resolution + consent upload
- **Type:** Happy path (Process B, non-suffixed)
- **Depends on:** TC-01
- **Steps:** As TC-07, with these substitutions:
  - SELECT Client Type — choose `Trust`
  - TYPE the Last Name field with `BranchTrustUpload`
  - TYPE the Mobile Number field with `0820000506`
  - TYPE the Email Address field with `autoqa.branch.trust@example.com`
- **Assertions:**
  - [x] ASSERT (BLOCKING) the toggle ON field set is identical to the other Process-B types
  - [x] ASSERT with the toggle OFF **Entity Name is optional**
  - [x] ASSERT a **Company Registration Number** is required — *flagged as BUG-LB-008: a trust has an IT number, not a CIPC company registration number*
  - [x] ASSERT the Upload commit **does** fire the CIPC lookup, and it answers `200` with `"success":false` and the message *"CIPC lookup is not available for Trust. This entity type is not registered with CIPC."* — the refusal is **correct**
  - [x] ASSERT `companyName` comes back `null` and **Entity Name is therefore not populated** with the CIPC name
  - [x] ASSERT the declined lookup leaves **Entity Name displayed but empty and read-only** (its form item resolves, but it contains **no `<input>`**), so the typed value is lost and cannot be re-entered — *expected FAIL against intent: BUG-LB-012*
  - [x] ASSERT the lead saves and records Client Type `Trust`

---

### TC-09 — Partnership: resolution + consent upload
- **Type:** Happy path (Process B, non-suffixed)
- **Depends on:** TC-01
- **Steps:** As TC-07, with these substitutions:
  - SELECT Client Type — choose `Partnership`
  - TYPE the Last Name field with `BranchPartnershipUpload`
  - TYPE the Mobile Number field with `0820000507`
  - TYPE the Email Address field with `autoqa.branch.partnership@example.com`
- **Assertions:**
  - [x] ASSERT (BLOCKING) the toggle ON field set is identical to the other Process-B types
  - [x] ASSERT with the toggle OFF **Entity Name is optional**
  - [x] ASSERT a **Company Registration Number** is required — *flagged as BUG-LB-008: a partnership generally has no registration number*
  - [x] ASSERT the Upload commit **does** fire the CIPC lookup, and it answers `200` with `"success":false` and a *"not registered with CIPC"* message — the refusal is **correct**
  - [x] ASSERT `companyName` comes back `null` and **Entity Name is therefore not populated** with the CIPC name
  - [x] ASSERT the declined lookup leaves **Entity Name displayed but empty and read-only** (no `<input>` inside its form item) — *expected FAIL against intent: BUG-LB-012*
  - [x] ASSERT the lead saves and records Client Type `Partnership`

---

### TC-10 — NGO: resolution + consent upload
- **Type:** Happy path (Process B, non-suffixed)
- **Depends on:** TC-01
- **Steps:** As TC-07, with these substitutions:
  - SELECT Client Type — choose `NGO`
  - TYPE the Last Name field with `BranchNgoUpload`
  - TYPE the Mobile Number field with `0820000508`
  - TYPE the Email Address field with `autoqa.branch.ngo@example.com`
- **Assertions:**
  - [x] ASSERT (BLOCKING) the toggle ON field set is identical to the other Process-B types
  - [x] ASSERT with the toggle OFF **Entity Name is optional**
  - [x] ASSERT a **Company Registration Number** is required — *no longer flagged: verified 2026-08-21 that the CIPC lookup **succeeds** for `NGO`, so the field is legitimate here. A non-profit is registered with CIPC as an NPC. `NGO` was withdrawn from BUG-LB-008 on that basis.*
  - [x] ASSERT the Upload commit fires the CIPC lookup, it answers `"success":true`, and **Entity Name is auto-populated** with the CIPC company name
  - [x] ASSERT the lead saves and records Client Type `NGO`

---

### TC-11 — Save is gated on the uploads for every client type
- **Type:** Negative — cross-cutting
- **Depends on:** TC-01
- **Steps:**
  - For each selectable Client Type:
    - SELECT the Client Type
    - SNAPSHOT — confirm **Save** is enabled while the upload toggle is OFF
    - CLICK the upload toggle to turn it ON
    - SNAPSHOT — confirm **Save** is disabled with no documents attached
    - CLICK **Save**
    - SNAPSHOT — confirm no lead is created
- **Assertions:**
  - [x] ASSERT (BLOCKING) for every client type, turning the upload toggle ON **disables Save** until the documents are committed
  - [x] ASSERT for Process A, Save stays disabled while the single consent document is uncommitted
  - [x] ASSERT for Process B, Save stays disabled while **either** the consent **or** the resolution is uncommitted
  - [x] ASSERT no lead is created while Save is disabled
  - [x] ASSERT the upload toggle state **persists across a Client Type change** — switching between Process-B types leaves it ON with the upload fields still rendered

---

### TC-12 — A branch-captured lead arrives with its consent already satisfied
- **Type:** Happy path — downstream verification
- **Depends on:** TC-04
- **Steps:**
  - NAVIGATE to the lead saved in TC-04
  - CLICK **Initiate Pre-Screening**
  - Answer all seven pre-screening questions to a passing outcome
  - CLICK the confirmation checkbox, then **Submit**
  - WAIT for the lead to convert
  - CLICK the **Converted To Opportunity** link
  - SNAPSHOT — confirm the Opportunity's consent-related fields
- **Assertions:**
  - [x] ASSERT (BLOCKING) the lead converts with Lead Status `Converted` and Assessment `Passed` — *note the word-casing: the page does **not** render `CONVERTED` / `PASSED`*
  - [x] ASSERT the uploaded consent carries through to the Opportunity
  - [x] ASSERT the uploaded resolution carries through to the Opportunity as its **Resolution Document**
  - [x] ASSERT *Does the client have a resolution?* **is** set on the converted Opportunity — the branch route captured the resolution upfront, so it carries through (contrast the Online channel, where it is unchecked). Asserted across **every** rendered instance of the field, because it is duplicated (**BUG-LB-014**)
  - [x] ASSERT the branch-captured lead does **not** present an outstanding consent stage in the RM Inbox once its loan application is initiated — contrast with the Online Digital Channel route, which does

## Test Data Notes
- Leads created by this plan are prefixed `AutoQA` and suffixed `…Upload`, with mobile numbers in the `08200005xx` range and `@example.com` addresses, so they are easy to filter out of the Dev Leads grid.
- **ID numbers must pass the Luhn check.** This plan uses `9001015800088` (Individual) and `9207125001083` (signatory).
- `test-data/pdf-test.pdf` stands in for both the consent and the resolution. It is not a real Land Bank template, so the *document-driven* auto-populate does nothing — but the **entity** auto-populate is keyed off the **Company Registration Number**, not the PDF, so it does fire.
- Because the toggle state persists across a Client Type change, each TC should re-open a fresh **New Lead** modal rather than reusing one, unless the TC is explicitly asserting that persistence (TC-11).
- TC-03's Sole Proprietor half and TC-02's Sole Proprietor assertion both depend on **BUG-LB-007** being fixed. Everything else is executable today.
