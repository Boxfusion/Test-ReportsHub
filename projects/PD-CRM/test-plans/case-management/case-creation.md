# Test Plan: Case Creation

> **Status:** Ready
> **Owner:** QA
> **Last Updated:** 2026-09-01
> **Estimated Duration:** 420s

## Metadata
| Field | Value |
|-------|-------|
| App URL | https://pd-dep-adminportal-qa.shesha.app/login |
| Environment | QA |
| Login As | Admin / P@ssword1 |
| Azure DevOps | Plan **112718** › PD-CRM (112719) › Case Management (112720) › **Case Creation (112754)** |
| ADO cases | #112757 – #112772 (16 cases, all state `Design`, priority 2) |

> **Source of truth.** This plan mirrors ADO suite 112754 one-to-one — 16 cases, in ADO order, with each
> case's expected result quoted from the ADO step.

> ⚠️ **This suite writes data.** Six cases create real cases in QA (#112757, #112760, #112766, #112768,
> #112770, #112771). Every run therefore adds ~6 records to the Cases list. All test data is tagged
> `QA-AUTO` in the Description so the records are identifiable and can be cleaned up.

## Objective
> Execute the Case Creation suite (ADO 112754) against the QA environment: successful creation through both
> the geolocation and manual-address routes, mandatory-field validation on every required field, the
> Category → Case type cascade, mobile-number format rules, municipal-bounds enforcement, and submitter
> match lookup.

## Preconditions
- [ ] App is reachable and `Admin` / `P@ssword1` authenticates
- [ ] Reference data is configured: Channels, Categories, and Case types (see inventory below)
- [ ] An existing submitter record exists for the match test (#112772)

## Application map (captured live 2026-09-01)

**Route:** Cases → `/dynamic/Boxfusion.ServiceManagement/service-requests`. The **Create Case** button opens
a **modal** (`.ant-modal-content`); the URL does not change. Submit is **OK**; the other button is **Cancel**.

**Fields.** Label `for` attributes are decorative — they point at IDs that do not exist on the inputs — so
each field is addressed through the form-item that owns its label:
`.ant-form-item:has(> .ant-row > .ant-col > label[for="<id>"])`.

| Field | label `for` | Control | Required |
|---|---|---|---|
| Channel | `dropdown4` | select | no* |
| First Name | `reportedUser_firstName` | text | no |
| Last Name | `reportedUser_lastName` | text | no |
| Mobile Number | `reportedUser_mobileNumber1` | text | **yes** |
| Email Address | `reportedUser_emailAddress1` | text | **yes** |
| Preferred Contact Method | `reportedUser_preferredContactMethod` | select | no |
| Category | `category` | select | **yes** |
| Case type | `caseType` | select (appears only after Category) | **yes** |
| Address | `address` | text, placeholder `Search places` | **yes** |
| Can't Find Address | `noAddress` | checkbox | no |
| Latitude / Longitude | `latitude` / `longitude` | number | only when Can't Find Address is checked |
| Description | `description` | textarea | no |

\* Channel is not marked with a required asterisk, but submitting an empty form **does** produce
"This field is required" against it — see TC-02.

**Reference data.**
- Channel: `Call Centre`, `Web`, `Walkin`, `Telephone`, `SMS`, `Post`, `In Facility Tablets`
- Preferred Contact Method: `Email`, `SMS`, `Push`
- Category: `Electrical`, `Water`, `Roads`, `Libraries`, `StormWater`, `EnvironmentalHealth`, `Fire`, `PublicSafety`, `WasteManagement`, `Clinics`
- Case type cascades from Category — `Electrical` → `Area Power Failure`, `Street Light Not Working`; `Water` → `Burst Pipe`, `Complete Water Outage`, `Low Water Pressure`

**Case type is not merely filtered — it does not exist until a Category is chosen.** Before selection its
control renders as an empty `span.read-only-display-form-item`; afterwards it becomes an `.ant-select`.

**Address autocomplete** renders suggestions into `div.suggestion` (not Google's `.pac-container`). Typing
`Heidelberg` returns Lesedi-area results. Checking **Can't Find Address** hides the search field and reveals
required `Address`, `Latitude` and `Longitude` inputs.

**Validation messages** observed: `This field is required` (per field, in `.ant-form-item-explain`) and
`Please enter a valid phone number` (Mobile Number).

## Deviations from the ADO text

1. **Account Number does not exist.** ADO #112757 step 10 and #112759 step 10 say *"Type an Account Number
   (if applicable)"*. There is no Account Number field on the Create Case form. Both steps are marked
   *(if applicable)*, so they are treated as not applicable and skipped — raised as **BUG-101** for the BA
   to confirm whether the field was dropped or is yet to be built.
2. **#112769 repeats a step.** Steps 8 and 9 are identical ("Check the Can't find Address box"). Checking it
   twice would untick it, so it is actioned once. Raised as **BUG-102**.

## Test Cases

### TC-01 (#112757): Verify successful case creation using valid details
- **Type:** Happy path
- **Steps:**
  1. NAVIGATE to the portal and log in as `Admin`
  2. CLICK the Cases side menu — the All Cases list is displayed
  3. CLICK the Create Case button
  4. SELECT a valid Channel (`Call Centre`)
  5. TYPE a valid First Name and Last Name
  6. TYPE a valid Mobile Number starting with `0`
  7. TYPE a valid Email Address
  8. SELECT a Preferred Contact Method (`Email`)
  9. SELECT the Category (`Electrical`)
  10. SELECT the Case type (`Area Power Failure`)
  11. SEARCH for and SELECT a valid address from the geolocation results
  12. TYPE a valid Description
  13. CLICK the OK button
- **Expected result (ADO):** "The system validates the information and creates the case successfully. The newly created case is displayed with the correct details and reference number."
- **Assertions:**
  - [x] ASSERT (BLOCKING) the Create Case modal is displayed
  - [x] ASSERT each mandatory field is populated before submit
  - [x] ASSERT (BLOCKING) the modal closes after OK — the case is accepted
  - [x] ASSERT (BLOCKING) a case reference number is generated and the new case appears in the list

### TC-02 (#112758): Verify mandatory Channel validation
- **Type:** Negative / Validation
- **Steps:**
  1. Log in and open the Create Case modal
  2. Leave the Channel field blank
  3. Populate all other mandatory fields with valid details
  4. SELECT a valid address from the geolocation results
  5. CLICK the OK button
- **Expected result (ADO):** "A validation message is displayed for the Channel field with the message that reads *This field is required* and the case is not created."
- **Assertions:**
  - [x] ASSERT the Channel field is empty before submit
  - [x] ASSERT the Channel field shows `This field is required`
  - [x] ASSERT (BLOCKING) the modal stays open — the case is not created

### TC-03 (#112759): Verify mandatory Mobile Number validation
- **Type:** Negative / Validation
- **Steps:**
  1. Log in and open the Create Case modal
  2. SELECT a valid Channel; TYPE First and Last Name
  3. Leave the Mobile Number field blank
  4. TYPE a valid Email Address; SELECT Preferred Contact Method
  5. SELECT Category and Case type
  6. SELECT a valid address from the geolocation results
  7. TYPE a valid Description
  8. CLICK the OK button
- **Expected result (ADO):** "A validation message that reads *This field is required. Please enter a valid phone number* is displayed and no case is created."
- **Assertions:**
  - [x] ASSERT the Mobile Number field is empty before submit
  - [x] ASSERT the Mobile Number field shows a required / valid-phone-number validation message
  - [x] ASSERT (BLOCKING) the modal stays open — the case is not created

### TC-04 (#112760): Verify Mobile Number accepts a valid number starting with 0
- **Type:** Boundary / Happy path
- **Steps:**
  1. Log in and open the Create Case modal
  2. SELECT a valid Channel; TYPE First and Last Name
  3. TYPE a valid 10-digit mobile number starting with `0`
  4. TYPE Email, SELECT Preferred Contact Method, Category and Case type
  5. SELECT a valid address; TYPE a Description
  6. CLICK the OK button
- **Expected result (ADO):** "The Mobile Number is accepted without displaying a validation error… the case is created successfully and displayed with the correct details and reference number."
- **Assertions:**
  - [x] ASSERT no validation error is shown against Mobile Number after entry
  - [x] ASSERT (BLOCKING) the case is created and a reference number is generated

### TC-05 (#112761): Verify Mobile Number rejects a number with a country code
- **Type:** Negative / Validation
- **Steps:**
  1. Log in and open the Create Case modal
  2. SELECT a valid Channel; TYPE First and Last Name
  3. TYPE a mobile number using a country code (`+27821234567`)
- **Expected result (ADO):** "The system should display an error message that reads *Please enter a valid phone number*."
- **Assertions:**
  - [x] ASSERT the Mobile Number field shows `Please enter a valid phone number`

### TC-06 (#112762): Verify mandatory Email Address validation
- **Type:** Negative / Validation
- **Steps:**
  1. Log in and open the Create Case modal
  2. SELECT a valid Channel; TYPE First and Last Name; TYPE a valid Mobile Number
  3. Leave the Email Address field empty
  4. SELECT a valid Category and Case type
  5. SELECT a valid address; TYPE a Description
  6. CLICK the OK button
- **Expected result (ADO):** "A validation message is displayed for the Email Address field and the case is not created."
- **Assertions:**
  - [x] ASSERT the Email Address field is empty before submit
  - [x] ASSERT the Email Address field shows a validation message
  - [x] ASSERT (BLOCKING) the modal stays open — the case is not created

### TC-07 (#112763): Verify mandatory Category validation
- **Type:** Negative / Validation
- **Steps:**
  1. Log in and open the Create Case modal
  2. SELECT a valid Channel; TYPE First and Last Name, Mobile Number and Email Address
  3. SELECT a Preferred Contact Method
  4. Leave the Category field empty
  5. SELECT a valid address; TYPE a Description
  6. CLICK the OK button
- **Expected result (ADO):** "The Category field displays a validation message that reads *This field is required* and the Case type also displays the same message since they are cascaded."
- **Assertions:**
  - [x] ASSERT the Category field is empty and no Case type is selected
  - [x] ASSERT the Category field shows `This field is required`
  - [x] ASSERT the Case type field also shows `This field is required` (cascaded)
  - [x] ASSERT (BLOCKING) the modal stays open — the case is not created

### TC-08 (#112764): Verify Case type cascades based on selected Category
- **Type:** Functional
- **Steps:**
  1. Log in and open the Create Case modal
  2. SELECT a valid Channel; TYPE valid submitter details
  3. SELECT the Category `Electrical`
  4. SELECT a Case type associated with that Category
  5. CHANGE the Category to `Water`
  6. SELECT a new Case type
- **Expected result (ADO):** "The Case type options are refreshed based on the newly selected Category. Only Case Types associated with the newly selected Category are available for selection."
- **Assertions:**
  - [x] ASSERT the Case type control does not exist before a Category is chosen
  - [x] ASSERT Case types for `Electrical` are exactly `Area Power Failure`, `Street Light Not Working`
  - [x] ASSERT (BLOCKING) after switching to `Water`, the options are exactly `Burst Pipe`, `Complete Water Outage`, `Low Water Pressure`
  - [x] ASSERT no `Electrical` case type remains selectable after the switch

### TC-09 (#112765): Verify mandatory Case type validation
- **Type:** Negative / Validation
- **Steps:**
  1. Log in and open the Create Case modal
  2. SELECT a valid Channel; TYPE valid submitter details
  3. SELECT a valid Category
  4. Leave the Case type field empty
  5. SELECT a valid address; TYPE a Description
  6. CLICK the OK button
- **Expected result (ADO):** "A validation message that reads *This field is required* is displayed indicating that the Case type is required, and the case is not created."
- **Assertions:**
  - [x] ASSERT the Case type field is empty before submit
  - [x] ASSERT the Case type field shows `This field is required`
  - [x] ASSERT (BLOCKING) the modal stays open — the case is not created

### TC-10 (#112766): Verify successful address selection using geolocation
- **Type:** Happy path
- **Steps:**
  1. Log in and open the Create Case modal
  2. SELECT a valid Channel; TYPE the mandatory submitter details
  3. SELECT a Category and Case type
  4. TYPE a valid address in the address search field
  5. SELECT a valid address from the search results
  6. VERIFY the address details
  7. CLICK the OK button
- **Expected result (ADO):** "The system searches for matching addresses using geolocation… the selected address is populated on the case… the case is created successfully and the selected geolocation address is associated with the case."
- **Assertions:**
  - [x] ASSERT typing an address renders geolocation suggestions
  - [x] ASSERT the selected suggestion populates the Address field
  - [x] ASSERT (BLOCKING) the case is created with that address associated

### TC-11 (#112767): Verify address outside Lesedi municipal bounds is rejected
- **Type:** Negative / Validation
- **Steps:**
  1. Log in and open the Create Case modal
  2. SELECT a valid Channel; TYPE valid submitter details
  3. SELECT a valid Category and Case type — needed only so the form is submittable for step 5
  4. SEARCH for an address located outside the Lesedi Local Municipality (`Cape Town`)
  5. SELECT that address from the suggestions
  6. CLICK the OK button — beyond the ADO steps, but required to settle "no case should be created"
- **Expected result (ADO):** "The system displays an error message that reads *Address is outside Lesedi municipal bounds. Please select an address within the Lesedi region* and no case should be created."
- **Assertions:**
  - [x] ASSERT the out-of-bounds suggestion is the one actually selected (`Cape Town`)
  - [x] ASSERT the out-of-bounds error message is displayed — **non-blocking**, so that its absence
        still lets the run settle whether a case is nonetheless created
  - [x] ASSERT (BLOCKING) no case is created — the modal stays open
- **Note:** the ADO steps stop at selecting the address, but the expected result also covers
  creation, so this case submits the form. If the bound is *not* enforced, that submit writes one
  extra record, tagged `QA-AUTO-OOB` in the Description for identification.
- ⚠️ **Known failing — application defect.** The bound is not enforced at all: no message is shown
  and the case is created. Confirmed 2026-09-02, raised as **BUG-103**.

### TC-12 (#112768): Verify successful case creation when the address cannot be found
- **Type:** Happy path / Alternate route
- **Steps:**
  1. Log in and open the Create Case modal
  2. SELECT a valid Channel; TYPE valid submitter details
  3. SELECT a valid Category and Case type
  4. CHECK the Can't Find Address box
  5. TYPE a valid address in the Address field
  6. TYPE valid Latitude and Longitude coordinates
  7. TYPE a valid Description
  8. CLICK the OK button
- **Expected result (ADO):** "The Address, Latitude, and Longitude fields are displayed… the case is created successfully. A unique Case Reference Number is generated, and the manually captured address and coordinates are associated with the case."
- **Assertions:**
  - [x] ASSERT checking Can't Find Address reveals Address, Latitude and Longitude as required fields
  - [x] ASSERT the geolocation search field is hidden while the box is checked
  - [x] ASSERT (BLOCKING) the case is created and a reference number is generated

### TC-13 (#112769): Verify mandatory fields when Can't Find Address is checked
- **Type:** Negative / Validation
- **Steps:**
  1. Log in and open the Create Case modal
  2. SELECT a valid Channel; TYPE valid submitter details
  3. SELECT a valid Category and Case type
  4. CHECK the Can't Find Address box (ADO lists this step twice — actioned once, see BUG-102)
  5. Leave the Address, Latitude and Longitude fields blank
  6. CLICK the OK button
- **Expected result (ADO):** "Validation messages that read *This field is required* are displayed for the required Address, Latitude, and Longitude fields, and the case is not created."
- **Assertions:**
  - [x] ASSERT Address, Latitude and Longitude are all empty before submit
  - [x] ASSERT each of the three fields shows `This field is required`
  - [x] ASSERT (BLOCKING) the modal stays open — the case is not created

### TC-14 (#112770): Verify case creation without a Description
- **Type:** Happy path / Optional field
- **Steps:**
  1. Log in and open the Create Case modal
  2. SELECT a valid Channel; TYPE valid submitter details
  3. SELECT a valid Category and Case type
  4. SELECT a valid address from the geolocation
  5. Leave the Description field blank
  6. CLICK the OK button
- **Expected result (ADO):** "The case is created successfully without a description and a unique Case Reference Number is generated."
- **Assertions:**
  - [x] ASSERT the Description field is empty before submit
  - [x] ASSERT (BLOCKING) the case is created and a reference number is generated

### TC-15 (#112771): Verify case creation without selecting a Preferred Contact Method
- **Type:** Happy path / Optional field
- **Steps:**
  1. Log in and open the Create Case modal
  2. SELECT a valid Channel; TYPE valid submitter details
  3. Leave Preferred Contact Method unselected
  4. SELECT a valid Category and Case type
  5. SELECT a valid address; TYPE a Description
  6. CLICK the OK button
- **Expected result (ADO):** "The case is created successfully without a Preferred Contact Method, and a unique Case Reference Number is generated."
- **Assertions:**
  - [x] ASSERT the Preferred Contact Method field is empty before submit
  - [x] ASSERT (BLOCKING) the case is created and a reference number is generated

### TC-16 (#112772): Verify possible submitter matches are displayed
- **Type:** Functional
- **Steps:**
  1. Log in and open the Create Case modal
  2. SELECT a valid Channel
  3. TYPE the Mobile Number and/or Email Address of an existing submitter
  4. OBSERVE the possible matches section
- **Expected result (ADO):** "The system searches for matching submitter records. Matching submitter details are displayed when an existing matching record is found."
- **Assertions:**
  - [x] ASSERT the Submitter Details match panel is present on the form
  - [x] ASSERT entering an existing submitter's contact details surfaces a matching record

## Teardown
- Cases created by this plan remain in QA. All carry `QA-AUTO` in the Description for identification.
- Each test case runs in its own isolated browser context, so no session teardown is required.
