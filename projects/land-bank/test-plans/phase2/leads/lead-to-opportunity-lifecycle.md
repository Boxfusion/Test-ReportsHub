# Test Plan: P2-LEAD-2.1 — Lead to Opportunity Lifecycle (Individual, Close Corporation, Private Company)

> **Status:** Draft — authored from the Dev plan, selectors not yet recorded live against Phase 2
> **Owner:** QA
> **Last Updated:** 2026-08-24
> **Estimated Duration:** 720s (estimate, unverified)

## Metadata
| Field | Value |
|-------|-------|
| App | Land Bank CRM (Admin Portal) — **Phase 2** |
| Environment | Phase2 (`PHASE2_APP_URL`, requires `TEST_ENV=phase2`) |
| Login As | RM role (`PHASE2_RM_USERNAME` / `PHASE2_RM_PASSWORD` in the gitignored `.env`) |
| Login page | `/login` |
| Landing page | Dashboard (Management) — `/dynamic/management-dashboard` — **confirmed live 2026-08-25**, same as Dev (the earlier `/dynamic/user-dashboard` guess in [../auth/login-navigate-modules.md](../auth/login-navigate-modules.md) does not hold for this RM) |
| Pages under test | Leads (`/dynamic/LandBank.Crm/LBLead-table`), Lead details (`/dynamic/LandBank.Crm/LBLead-details?id=`), Opportunities (`/dynamic/LandBank.Crm/LBOpportunity-table`), Opportunity details (`/dynamic/LandBank.Crm/LBOpportunity-details?id=`) |
| Test document | `test-data/pdf-test.pdf` (hub root) — stand-in consent / resolution attachment |
| Dev counterpart | [../../dev/leads/lead-to-opportunity-lifecycle.md](../../dev/leads/lead-to-opportunity-lifecycle.md) — LEAD-2.1, covers the full 8-client-type matrix; this plan narrows scope to **Individual, Close Corporation, Private Company** only, per instruction |

## Objective
> Validate the Land Bank CRM origination chain — **Leads → Opportunity** — driven by an RM on the
> **Phase 2** site, for three Client Types: **Individual**, **Close Corporation** and **Private
> Company**. For each: capture a lead via **Online Digital Channel** (full form, no consent step)
> and via **Landbank Branch** (consent-driven progressive form, both toggle states), pass
> pre-screening, and confirm the lead auto-converts to an Opportunity typed `PERSONAL` (Individual)
> or `ENTITY` (Close Corporation, Private Company).

> **Scope note.** Unlike the Dev plan, this plan does **not** cover Listed Company, and does not
> extend into the Inbox / workflow-initiation leg (TC-12 → TC-14 in the Dev plan) — that is
> tracked separately once this baseline is recorded live. Everything below is **carried forward
> from the Dev plan's recorded mechanics** (form field names, label associations, switch
> behaviour) and is **not yet verified live on Phase 2** — flag any divergence found while
> recording selectors.

## Combination Matrix

**Online Digital Channel** — full client capture form shown immediately, no consent step.

| TC | Client Type | Lead Channel | Expected Application Type | Entity Name field |
|----|-------------|--------------|---------------------------|-------------------|
| TC-03 | Individual (Individual) | Online Digital Channel | PERSONAL | hidden |
| TC-04 | Close Corporation (Entity) | Online Digital Channel | ENTITY | required |
| TC-05 | Private Company (Entity) | Online Digital Channel | ENTITY | required |

**Landbank Branch** — consent-driven progressive form. The consent toggle governs which fields appear.

| TC | Client Type | Consent toggle | Toggle label | Path exercised |
|----|-------------|----------------|--------------|----------------|
| TC-06 | Individual (Individual) | **True** | Upload Consent? | Upload signed consent → `Upload` → client capture |
| TC-07 | Individual (Individual) | **False** | Upload Consent? | Request OTP → `otpPin` + Submit OTP |
| TC-08 | Close Corporation (Entity) | **True** | Upload Resolution and Consent? | Signatory ID + Company Reg No + 2 uploads → `Upload` → CIPC auto-populate |
| TC-09 | Close Corporation (Entity) | **False** | Upload Resolution and Consent? | Plain manual capture (no OTP, no uploads) |
| TC-10 | Private Company (Entity) | **True** | Upload Resolution and Consent? | Signatory ID + Company Reg No + 2 uploads → `Upload` → CIPC auto-populate |
| TC-11 | Private Company (Entity) | **False** | Upload Resolution and Consent? | Plain manual capture (no OTP, no uploads) |

## Preconditions
- [ ] Phase 2 site reachable at `PHASE2_APP_URL`
- [ ] `TEST_ENV=phase2` for the run (or `APP_URL` set to the Phase 2 URL) — without this the run
      silently targets Dev, because `baseURL` comes from `<TEST_ENV>_APP_URL`
- [ ] `PHASE2_RM_USERNAME` / `PHASE2_RM_PASSWORD` present in `.env`
- [ ] The signed-in RM has **Leads** and **Opportunities** visible in the side menu
- [ ] The RM is selectable as **Lead Owner** (the field self-populates with the signed-in RM)
- [ ] `test-data/pdf-test.pdf` exists at the hub root (consent / resolution attachment)
- [x] The Client Type dropdown on Phase 2 offers `Close Corporation (Entity)` and
      `Private Company (Entity)` — **confirmed live 2026-08-25**. The full dropdown actually offers
      **8** options: `Individual (Individual)`, `Close Corporation (Entity)`, `Co-Operative (Entity)`,
      `Listed Company (Entity)`, `Trust`, `NGO`, `Partnership`, `Private Company` — four entity types
      (`Co-Operative`, `Trust`, `NGO`, `Partnership`) beyond anything the Dev plan exercises. No
      `Sole Proprietor` option, consistent with Dev's BUG-LB-007. This plan still scopes to
      Individual / Close Corporation / Private Company only; the other four entity types are
      untested by either plan and are candidates for future coverage.

## Carried-Forward Recording Notes (from Dev, unverified on Phase 2)

- The **Add New Lead** modal and every Shesha detail form use Ant Design form items whose inputs
  carry **no `id` and no `data-testid`**; the only stable anchor is `<label for="<fieldName>">`
  (e.g. `firstName`, `leadType`, `channel`, `organisation`, `idNumber`, `signatoryIdNumber`,
  `companyRegistrationNumber`, `signatoryConsent`, `resolution`, `otpPin`).
- Forms nest, so a field must be scoped by a **direct-child** label match.
- Select options expose no `role=option`; matched by `title` attribute inside the open dropdown.
- Conditional fields are hidden via `ant-form-item-hidden` rather than removed from the DOM.
- **Individual + Landbank Branch:** ID Number, an unlabelled *Upload Consent?* switch, and
  **Request OTP** are shown initially; Client Information is hidden until consent is satisfied.
  ID Number is Luhn-validated (`9001015800088`, `8503155400083` are valid test values).
- **Entity (Close Corporation / Private Company) + Landbank Branch:** the full Client Information
  block, **Entity Name** (required), and the labelled `uploadResAndConsent` *Upload Resolution and
  Consent?* switch are shown initially. Turning it ON hides Client Info and reveals **Signatory ID
  Number**, **Company Registration Number**, **Upload Consent**, **Upload Resolution**; uploading
  both and clicking **Upload** runs a CIPC lookup keyed off the Company Registration Number
  (`2012/225386/07` → `BOXFUSION (PTY)LTD` on Dev — **re-verify the Phase 2 CIPC sandbox returns
  the same value**, it may differ per environment).
- **Region** is derived server-side from Province (Gauteng → *Central Region*) — re-verify on
  Phase 2.
- Per the Phase 2 auth smoke test, **Sign In** must be matched with `exact: true` (collides with
  "Sign in with Microsoft"), and grids on this build are **plain `<table>` elements**
  (`role=table`), not `.ant-table`.
- **New live finding (2026-08-25):** on `Landbank Branch`, once a Client Type has not yet been
  chosen, the modal renders an explicit `alert` reading *"Please select a Client Type before
  additional fields are displayed"* — Dev's plan never mentions this message, only that fields
  collapse. Behaviourally identical (fields still gate on Client Type), just a Phase-2-only UX
  addition worth asserting on if it should be considered part of this build's contract.
- **New live finding (2026-08-25):** the Opportunities listing heading on Phase 2 is
  **"Active Opportunities"**, not Dev's **"All Opportunities"** — relevant if this plan is ever
  extended to cover the Opportunities grid (Dev's TC-14 equivalent), which is currently out of
  scope here.

## Test Cases

### TC-01 — Log in to the Phase 2 site as an RM
- **Type:** Happy path
- **Steps:**
  - NAVIGATE to `/login`
  - SNAPSHOT — confirm the login form (Username + Password fields, Sign In button) is rendered
  - TYPE the Username field with the Phase 2 RM username (from `.env`)
  - TYPE the Password field with the Phase 2 RM password (from `.env`)
  - SNAPSHOT — confirm the **Sign In** button is enabled
  - CLICK **Sign In** (match `exact: true`)
  - WAIT for the app to redirect away from `/login`
- **Assertions:**
  - [x] ASSERT (BLOCKING) the app redirects away from `/login`
  - [x] ASSERT the side menu shows **Leads** and **Opportunities**

---

### TC-02 — The run is actually pointed at the Phase 2 site
- **Type:** Guard rail
- **Depends on:** TC-01
- **Steps:**
  - EXTRACT the origin of the current page URL
- **Assertions:**
  - [x] ASSERT (BLOCKING) the page origin matches `PHASE2_APP_URL`

---

### TC-03 — Individual lead via Online Digital Channel converts to a PERSONAL Opportunity
- **Type:** Happy path (Online Digital Channel, row 1)
- **Depends on:** TC-01
- **Steps:**
  - NAVIGATE to `/dynamic/LandBank.Crm/LBLead-table`
  - CLICK **New Lead**
  - WAIT for the **Add New Lead** modal to open
  - SELECT Lead Channel — choose `Online Digital Channel`
  - SELECT Client Type — choose `Individual (Individual)`
  - SNAPSHOT — confirm the **Entity Name** field stays hidden for an Individual client type
  - SELECT Title — choose `Mr`
  - TYPE the First Name field with `AutoQAP2`
  - TYPE the Last Name field with `IndivOnline`
  - SELECT Province — choose `Gauteng`
  - SELECT Preferred Communication — choose `Email`
  - TYPE the Mobile Number field with `0820001101`
  - TYPE the Email Address field with `autoqap2.indivonline@example.com`
  - CLICK **Save**
  - WAIT for the lead details page to load
  - CLICK **Initiate Pre-Screening**
  - WAIT for the **Pre-Screening Assessment** modal to open
  - CLICK `Yes` for *Is the applicant a South African citizen?*
  - CLICK `Yes` for *Is the farming land located in South Africa?*
  - CLICK `Yes` for *Do the intended farming activities fall within the Land Bank mandate?*
  - CLICK `No` for *Is the client blacklisted?*
  - CLICK `No` for *Is the client currently under debt review?*
  - CLICK `Yes` for *Is the client's current Country of Residence South Africa?*
  - CLICK `Yes` for *Does the client currently have access to suitable land for farming activities?*
  - CLICK the confirmation checkbox *I confirm the selected criteria are correct…*
  - CLICK **Submit**
  - WAIT for the pre-screening modal to close and the lead header to refresh
  - EXTRACT the **Converted To Opportunity** display name
  - CLICK the **Converted To Opportunity** link
  - WAIT for the Opportunity details page to load
- **Assertions:**
  - [x] ASSERT the lead saves and the URL becomes the lead details route
  - [x] ASSERT the pre-screening assessment outcome is `PASSED`
  - [x] ASSERT (BLOCKING) the lead status becomes `CONVERTED` after a passing pre-screening
  - [x] ASSERT a **Converted To Opportunity** reference is displayed
  - [x] ASSERT the URL becomes the Opportunity details route
  - [x] ASSERT the Opportunity **Application Type** is `PERSONAL`

---

### TC-04 — Close Corporation lead via Online Digital Channel converts to an ENTITY Opportunity
- **Type:** Happy path (Online Digital Channel, row 2)
- **Depends on:** TC-01
- **Steps:** As TC-03, with these substitutions:
  - SELECT Client Type — choose `Close Corporation (Entity)`
  - SNAPSHOT — confirm the **Entity Name** field is revealed for an Entity client type
  - TYPE the Entity Name field with `AutoQAP2 Close Corp CC`
  - TYPE the Last Name field with `CloseCorpOnline`
  - TYPE the Mobile Number field with `0820001103`
  - TYPE the Email Address field with `autoqap2.closecorponline@example.com`
- **Assertions:**
  - [x] ASSERT (BLOCKING) the **Entity Name** field is revealed when an Entity client type is selected
  - [x] ASSERT the pre-screening assessment outcome is `PASSED`
  - [x] ASSERT the lead status becomes `CONVERTED` after a passing pre-screening
  - [x] ASSERT the Opportunity **Application Type** is `ENTITY`
  - [x] ASSERT the Entity Name carries through to the Opportunity's **Entity Information** section

---

### TC-05 — Private Company lead via Online Digital Channel converts to an ENTITY Opportunity
- **Type:** Happy path (Online Digital Channel, row 3)
- **Depends on:** TC-01
- **Steps:** As TC-04, with these substitutions:
  - SELECT Client Type — choose `Private Company (Entity)`
  - TYPE the Entity Name field with `AutoQAP2 Private Co Ltd`
  - TYPE the Last Name field with `PrivateCoOnline`
  - TYPE the Mobile Number field with `0820001105`
  - TYPE the Email Address field with `autoqap2.privatecoonline@example.com`
- **Assertions:**
  - [x] ASSERT the **Entity Name** field is revealed for a Private Company client type
  - [x] ASSERT the pre-screening assessment outcome is `PASSED`
  - [x] ASSERT (BLOCKING) the lead status becomes `CONVERTED` after a passing pre-screening
  - [x] ASSERT the Opportunity **Application Type** is `ENTITY`

---

### TC-06 — Individual lead via Landbank Branch with Upload Consent = True
- **Type:** Happy path (Landbank Branch, consent uploaded)
- **Depends on:** TC-01
- **Steps:**
  - NAVIGATE to `/dynamic/LandBank.Crm/LBLead-table`
  - CLICK **New Lead**
  - WAIT for the **Add New Lead** modal to open
  - SELECT Lead Channel — choose `Landbank Branch`
  - SNAPSHOT — confirm the Client Information block collapses for the Landbank Branch channel
  - SELECT Client Type — choose `Individual (Individual)`
  - TYPE the Mobile Number field with `0820001201`
  - TYPE the Email Address field with `autoqap2.indivbranch.consentyes@example.com`
  - TYPE the ID Number field with `9001015800088`
  - CLICK the *Upload Consent?* switch to turn it ON
  - SNAPSHOT — confirm **Upload Consent**, **Download Consent Template** are revealed and **Request OTP** is hidden
  - CLICK the **Upload Consent** *(press to upload)* control and attach `test-data/pdf-test.pdf`
  - CLICK **Upload**
  - WAIT for the Client Information block to be revealed and First Name and Last Name to be auto-populated 
  - SELECT Title — choose `Mr`
  - TYPE the First Name field with `AutoQAP2`
  - TYPE the Last Name field with `IndivBranchConsentYes`
  - SELECT Province — choose `Gauteng`
  - SELECT Preferred Communication — choose `Email`
  - TYPE the ID Number field with `9001015800088`
  - CLICK **Save**
  - WAIT for the lead details page to load
- **Assertions:**
  - [x] ASSERT selecting `Landbank Branch` hides the Client Information block until consent is captured
  - [x] ASSERT (BLOCKING) turning *Upload Consent?* ON reveals the **Upload Consent** control and **disables Save** until a document is uploaded
  - [x] ASSERT clicking **Upload** reveals the Client Information block and re-enables **Save**
  - [x] ASSERT the lead saves and the URL becomes the lead details route
  - [x] ASSERT the saved lead shows status `NEW`, Client Type `Individual (Individual)` and Lead Channel `Landbank Branch`

---

### TC-07 — Individual lead via Landbank Branch with Upload Consent = False (OTP route)
- **Type:** Alternate path (Landbank Branch, consent via OTP)
- **Depends on:** TC-01
- **Steps:**
  - NAVIGATE to `/dynamic/LandBank.Crm/LBLead-table`
  - CLICK **New Lead**
  - WAIT for the **Add New Lead** modal to open
  - SELECT Lead Channel — choose `Landbank Branch`
  - SELECT Client Type — choose `Individual (Individual)`
  - SNAPSHOT — confirm the *Upload Consent?* switch is OFF and **Request OTP** is displayed
  - TYPE the Mobile Number field with `0820001202`
  - TYPE the Email Address field with `autoqap2.indivbranch.consentno@example.com`
  - TYPE the ID Number field with `8503155400083`
  - CLICK **Request OTP**
  - WAIT for the OTP field to be revealed
  - CLICK **Save**
  - WAIT for the lead details page to load
- **Assertions:**
  - [x] ASSERT the *Upload Consent?* switch defaults to OFF
  - [x] ASSERT (BLOCKING) with *Upload Consent?* OFF the **Request OTP** action is offered
  - [x] ASSERT clicking **Request OTP** reveals the **OTP** field and the **Submit OTP** button
  - [x] ASSERT the lead saves and the URL becomes the lead details route
  - [x] ASSERT the saved lead records Client Type `Individual (Individual)` and Lead Channel `Landbank Branch`

---

### TC-08 — Close Corporation lead via Landbank Branch with Upload Resolution and Consent = True
- **Type:** Happy path (Landbank Branch, resolution + consent uploaded)
- **Depends on:** TC-01
- **Steps:**
  - NAVIGATE to `/dynamic/LandBank.Crm/LBLead-table`
  - CLICK **New Lead**
  - WAIT for the **Add New Lead** modal to open
  - SELECT Lead Channel — choose `Landbank Branch`
  - SELECT Client Type — choose `Close Corporation (Entity)`
  - SNAPSHOT — confirm the Client Information block, **Entity Name** and the *Upload Resolution and Consent?* switch are rendered
  - CLICK the *Upload Resolution and Consent?* switch to turn it ON
  - SNAPSHOT — confirm the signatory fields and both upload controls are revealed and **Save** is disabled
  - TYPE the Signatory ID Number field with `9207125001083`
  - TYPE the Company Registration Number field with `2012/225386/07`
  - CLICK the **Upload Consent** *(press to upload)* control and attach `test-data/pdf-test.pdf`
  - CLICK the **Upload Resolution** *(press to upload)* control and attach `test-data/pdf-test.pdf`
  - TYPE the Mobile Number field with `0820001203`
  - TYPE the Email Address field with `autoqap2.closecorpbranch.resyes@example.com`
  - CLICK **Upload**
  - WAIT for the CIPC lookup to auto-populate the entity details
  - SELECT Title — choose `Mr`
  - TYPE the First Name field with `AutoQAP2`
  - TYPE the Last Name field with `CloseCorpBranchResYes`
  - SELECT Province — choose `Gauteng`
  - SELECT Preferred Communication — choose `Email`
  - CLICK **Save**
  - WAIT for the lead details page to load
- **Assertions:**
  - [x] ASSERT (BLOCKING) turning *Upload Resolution and Consent?* ON reveals **Signatory ID Number**, **Company Registration Number**, **Upload Consent** and **Upload Resolution**, and **disables Save**
  - [x] ASSERT clicking **Upload** re-enables **Save**
  - [x] ASSERT the CIPC lookup auto-populates the **Entity Name** from the Company Registration Number — record whatever value the Phase 2 CIPC sandbox returns
  - [x] ASSERT the lead saves and the URL becomes the lead details route
  - [x] ASSERT the saved lead records Client Type `Close Corporation (Entity)` and Lead Channel `Landbank Branch`

---

### TC-09 — Close Corporation lead via Landbank Branch with Upload Resolution and Consent = False
- **Type:** Alternate path (Landbank Branch, manual capture)
- **Depends on:** TC-01
- **Steps:**
  - NAVIGATE to `/dynamic/LandBank.Crm/LBLead-table`
  - CLICK **New Lead**
  - WAIT for the **Add New Lead** modal to open
  - SELECT Lead Channel — choose `Landbank Branch`
  - SELECT Client Type — choose `Close Corporation (Entity)`
  - SNAPSHOT — confirm the *Upload Resolution and Consent?* switch is OFF and no upload controls are rendered
  - SELECT Title — choose `Mr`
  - TYPE the First Name field with `AutoQAP2`
  - TYPE the Last Name field with `CloseCorpBranchResNo`
  - TYPE the Entity Name field with `AutoQAP2 Close Corp Branch CC`
  - SELECT Province — choose `Gauteng`
  - SELECT Preferred Communication — choose `Email`
  - TYPE the Mobile Number field with `0820001204`
  - TYPE the Email Address field with `autoqap2.closecorpbranch.resno@example.com`
  - CLICK **Save**
  - WAIT for the lead details page to load
- **Assertions:**
  - [x] ASSERT the *Upload Resolution and Consent?* switch defaults to OFF
  - [x] ASSERT with the switch OFF neither **Upload Consent** nor **Upload Resolution** is displayed
  - [x] ASSERT **Save** is enabled without any document upload
  - [x] ASSERT (BLOCKING) the lead saves and the URL becomes the lead details route
  - [x] ASSERT the saved lead records Client Type `Close Corporation (Entity)` and Lead Channel `Landbank Branch`

---

### TC-10 — Private Company lead via Landbank Branch with Upload Resolution and Consent = True
- **Type:** Happy path (Landbank Branch, resolution + consent uploaded)
- **Depends on:** TC-01
- **Steps:** As TC-08, with these substitutions:
  - SELECT Client Type — choose `Private Company (Entity)`
  - TYPE the Last Name field with `PrivateCoBranchResYes`
  - TYPE the Mobile Number field with `0820001205`
  - TYPE the Email Address field with `autoqap2.privatecobranch.resyes@example.com`
- **Assertions:**
  - [x] ASSERT (BLOCKING) turning *Upload Resolution and Consent?* ON reveals the signatory fields and both upload controls, and **disables Save**
  - [x] ASSERT clicking **Upload** re-enables **Save**
  - [x] ASSERT the CIPC lookup auto-populates the **Entity Name** from the Company Registration Number
  - [x] ASSERT the lead saves and records Client Type `Private Company (Entity)` and Lead Channel `Landbank Branch`

---

### TC-11 — Private Company lead via Landbank Branch with Upload Resolution and Consent = False
- **Type:** Alternate path (Landbank Branch, manual capture)
- **Depends on:** TC-01
- **Steps:** As TC-09, with these substitutions:
  - SELECT Client Type — choose `Private Company (Entity)`
  - TYPE the Last Name field with `PrivateCoBranchResNo`
  - TYPE the Entity Name field with `AutoQAP2 Private Co Branch Ltd`
  - TYPE the Mobile Number field with `0820001206`
  - TYPE the Email Address field with `autoqap2.privatecobranch.resno@example.com`
- **Assertions:**
  - [x] ASSERT the *Upload Resolution and Consent?* switch defaults to OFF
  - [x] ASSERT with the switch OFF neither upload control nor the signatory fields are displayed
  - [x] ASSERT **Save** is enabled without any document upload
  - [x] ASSERT (BLOCKING) the lead saves and the URL becomes the lead details route
  - [x] ASSERT the saved lead records Client Type `Private Company (Entity)` and Lead Channel `Landbank Branch`

## Test Data Notes
- Leads created by this plan are prefixed `AutoQAP2` with mobile numbers in the `08200011xx`
  (Online Digital Channel) and `08200012xx` (Landbank Branch) ranges and `@example.com` e-mail
  addresses, so they are easy to filter out of the Phase 2 Leads grid and distinguish from the Dev
  plan's `AutoQA` leads.
- ID numbers reused from the Dev plan (already Luhn-valid): `9001015800088`, `8503155400083`,
  signatory `9207125001083`.
- Consent / resolution attachments use `test-data/pdf-test.pdf`, same as Dev — it is not a real
  Land Bank consent form, so only the CIPC (Company Registration Number) auto-populate fires; the
  Individual consent path still needs client fields typed manually after **Upload**.
- The OTP challenge cannot be completed automatically (delivered to a fictitious test contact);
  TC-07 verifies the challenge is offered and saves without completing it, matching Dev's TC-07
  pattern (see Dev's BUG-LB-002 — re-check whether the same nameless-save defect reproduces here
  once this is recorded live).
