# Test Plan: Facilities

> **Status:** Ready
> **Owner:** QA
> **Last Updated:** 2026-09-03
> **Estimated Duration:** 420s

## Metadata
| Field | Value |
|-------|-------|
| App URL | https://pd-dep-adminportal-qa.shesha.app/login |
| Environment | QA |
| Login As | Admin / P@ssword1 |
| Azure DevOps | Plan **112718** › PD-CRM (112719) › Case Management (112720) › **Facilities (113290)** |
| ADO cases | #113291 – #113298 (8 cases, all state `Design`, priority 2) |

> **Source of truth.** This plan mirrors ADO suite 113290 one-to-one — 8 cases, in ADO order, with each
> case's expected result quoted from the ADO step. Suite pulled 2026-09-03; the raw dump is at
> `test-data/ado-suite-113290.json`.

> ⚠️ **This suite writes data.** Four cases create real Sites (#113291, #113294, #113295, #113296).
> Every run therefore adds up to 4 records to the Facilities list. All test data carries `QA-AUTO` in the
> **Site Name** so the records are identifiable — this form has no Description field to tag instead.

## Objective
> Execute the Facilities suite (ADO 113290) against the QA environment: Site creation through the Add Site
> form, cancellation, mandatory-field validation, the Site Type and Region dropdowns, contact-number and
> email format rules, and the Site details view.

## Preconditions
- [ ] App is reachable and `Admin` / `P@ssword1` authenticates
- [ ] Reference data is configured for Site Type and Region (see inventory below — **Region is not**)
- [ ] At least one existing Site is present for the details-view case (#113298) — the list holds ~4,699

## Application map (captured live 2026-09-03)

**Route:** Facilities → `/dynamic/Boxfusion.Dep/facilities-table` (form `Boxfusion.Dep/facilities-table v38`).
The **Add Site** button opens a **modal** (`.ant-modal-content`); the URL does not change. Submit is **OK**;
the other button is **Cancel**. The list toolbar also offers **Export**.

**The list is a div grid, not an HTML table.** There is no `<table>`, `<tr>` or `<th>` in the DOM — rows are
`[role=row]` (11 = 1 header + 10 data rows at the default page size) and action cells are `.sha-crud-cell`.
The pager reads `1-10 of 4699 items`. Locators built on `tr`, `.ant-table-row` or
`label.sha-datalist-component-item-checkbox` (which the Cases list uses) match **nothing** here.

**Fields.** As on the Create Case form, label `for` attributes point at IDs that do not exist on the inputs,
so each field is addressed through the form-item that owns its label:
`.ant-form-item:has(> .ant-row > .ant-col > label[for="<id>"])`.

| Field | label `for` | Control | Required |
|---|---|---|---|
| Site Name | `name` | text | **yes** |
| Site Type | `siteType` | select | **yes** |
| Address | `address_addressLine1` | text, placeholder `Search places` | no |
| Latitude | `latitude` | text | no — **see BUG-403** |
| Latitude | `address_latitude` | text | **yes** |
| Longitude | `address_longitude` | text | **yes** |
| Region | `partOf` | select | **yes** |
| Contact Number | `contactNumber` | text | **yes** |
| Email Address | `primaryContact_emailAddress1` | text | **yes** |
| Operating Hours | `operatingHoursDescription` | text | no |

**Reference data.**
- Site Type: `Hospital`, `Clinics`, `District`, `Region`
- Region: `(Obsolete) Dassenhoek`, `(Obsolete) Merebank`, `(Obsolete) Welbedaght (SW)`, `1` — **no valid
  region exists; see BUG-402**

## Deviations from the ADO text

These are called out so the results stay auditable against the ADO steps.

1. **The Geo/GIS address lookup does not work on this form — BUG-401 (High).** #113291 steps 5–6 and
   #113297 step 4 require retrieving matching locations and having Latitude/Longitude **autopopulate**.
   Typing into Address produces no suggestions at all — **including a full street address**
   (`1 Louw Street, Heidelberg, 1441, Gauteng, South Africa`, the Lesedi Local Municipality civic
   address), so the empty result cannot be blamed on a vague search term. Root cause identified: the
   Add Site form loads
   Google Maps with key `AIzaSyAQv3…j2l8`, which is **not authorised for this domain** — the console
   raises `RefererNotAllowedMapError` naming
   `https://pd-dep-adminportal-qa.shesha.app/dynamic/Boxfusion.Dep/facilities-table`, and **zero**
   `AutocompletionService.GetPredictionsJson` calls are made. The Create Case form uses a *different* key
   (`AIzaSyDEss2…Zqlnk`) and its lookup works, which isolates this to the Facilities form's key rather
   than the environment. Because Latitude and Longitude are separate required text inputs, the plan
   **types them manually** so the remaining coverage can still be exercised; the autopopulate assertion is
   made **non-blocking** and recorded as a defect.
2. **No valid Region can be selected — BUG-402 (High).** #113295 requires selecting "a valid Region", but
   the dropdown offers only three `(Obsolete)` entries and one entitled `1`. The plan selects `1` so the
   form is submittable, and asserts separately that a non-obsolete, meaningfully-named region exists —
   that assertion is expected to fail until the reference data is fixed.
3. **The form renders three Latitude fields — BUG-403 (Low).** Two are labelled `Latitude` bound to
   `latitude` (optional) and one `Latitude *` bound to `address_latitude` (required). There is no optional
   `Longitude` counterpart. Only `address_latitude` / `address_longitude` are populated by the plan; the
   orphan `latitude` field is asserted to remain empty so the duplication is documented rather than
   silently worked around.
4. **#113294 step 1 duplicates login.** It restates "Log in to the PD-DEP Admin Portal", which every other
   case treats as setup. Actioned as ordinary setup, not as a separate assertion.

## Test Cases

### TC-01 (#113291): Verify Site Can Be Created
- **Type:** Happy path
- **Steps:**
  1. NAVIGATE to the Facilities menu
  2. CLICK the Add Site button
  3. TYPE a valid Site Name
  4. SELECT the Site Type
  5. TYPE a location in the Address search field
  6. SELECT the required location from the returned Geo/GIS results
  7. SELECT a valid Region
  8. TYPE a valid Contact Number
  9. TYPE a valid email address
  10. TYPE in Operating Hours
  11. CLICK the OK button
- **Expected result (ADO):** "The Site is successfully created 2. The site should be displayed on the
  Regional Offices index table"
- **Assertions:**
  - [x] ASSERT (BLOCKING) the Site index table list is displayed
  - [x] ASSERT (BLOCKING) the Add New Site form is displayed
  - [x] ASSERT the Site Name, Site Type, Region, Contact Number and Email are populated before submit
  - [x] ASSERT the Geo/GIS lookup returns matching locations — **non-blocking, BUG-401**
  - [x] ASSERT Latitude and Longitude autopopulate from the selection — **non-blocking, BUG-401**
  - [x] ASSERT (BLOCKING) the modal closes after OK — the Site is accepted
  - [x] ASSERT (BLOCKING) the new Site is displayed in the Facilities list

### TC-02 (#113292): Verify Site Creation Can Be Cancelled
- **Type:** Negative / Alternate route
- **Steps:**
  1. NAVIGATE to the Facilities menu
  2. CLICK the Add Site button
  3. TYPE valid information into one or more fields
  4. CLICK the Cancel button
- **Expected result (ADO):** "The Add New Site form closes without creating the site"
- **Assertions:**
  - [x] ASSERT the typed information is displayed before cancelling
  - [x] ASSERT (BLOCKING) the form closes on Cancel
  - [x] ASSERT (BLOCKING) no Site with that name exists in the list afterwards

### TC-03 (#113293): Verify Mandatory Site Fields Are Validated
- **Type:** Negative / Validation
- **Steps:**
  1. NAVIGATE to the Facilities menu
  2. CLICK the Add Site button
  3. Leave Site Name, Site Type, Latitude, Longitude, Contact Number and Email Address blank
  4. TYPE valid information in any optional fields (Operating Hours)
  5. CLICK the OK button
- **Expected result (ADO):** "1. The system prevents the Site from being created and displays validation
  messages that reads: *This field is required* for the mandatory fields. 2. For email address: *Please
  enter a valid email address* 3. For contact number an additional message that reads: *Please enter a
  valid cellphone number*"
- **Assertions:**
  - [x] ASSERT all six mandatory fields are empty before submit
  - [x] ASSERT `This field is required` is displayed for the mandatory fields
  - [x] ASSERT (BLOCKING) the modal stays open — the Site is not created

### TC-04 (#113294): Verify Site Type Can Be Selected
- **Type:** Functional
- **Steps:**
  1. Log in (ordinary setup — see deviation 4)
  2. NAVIGATE to the Facilities section
  3. CLICK the Add Site button
  4. CLICK the Site Type dropdown
  5. SELECT a valid Site Type
  6. Complete the remaining mandatory fields with valid information
  7. CLICK the OK button
  8. VIEW the newly created Site
- **Expected result (ADO):** "The Site is successfully created with the selected Site Type… The selected
  Site Type is displayed correctly against the Site."
- **Assertions:**
  - [x] ASSERT the available Site Types are exactly `Hospital`, `Clinics`, `District`, `Region`
  - [x] ASSERT the selected Site Type is displayed in the field
  - [x] ASSERT (BLOCKING) the Site is created
  - [x] ASSERT the selected Site Type is displayed against the Site in the list

### TC-05 (#113295): Verify Region Can Be Selected
- **Type:** Functional
- **Steps:**
  1. NAVIGATE to the Facilities menu
  2. CLICK the Add Site button
  3. CLICK the Region dropdown
  4. SELECT a valid region
  5. Complete the remaining mandatory fields with valid information
  6. CLICK the OK button
  7. VIEW the newly created Site
- **Expected result (ADO):** "The Site is successfully created… The selected Region is displayed correctly
  against the Site."
- **Assertions:**
  - [x] ASSERT the available Regions are displayed
  - [x] ASSERT a valid (non-obsolete, meaningfully named) Region is offered — **expected to FAIL, BUG-402**
  - [x] ASSERT the selected Region is displayed in the field
  - [x] ASSERT (BLOCKING) the Site is created with the selected Region

### TC-06 (#113296): Verify Site Contact Number and Email Address Accept Valid Formats
- **Type:** Boundary / Happy path
- **Steps:**
  1. NAVIGATE to the Facilities menu
  2. CLICK the Add Site button
  3. TYPE a valid 10-digit Contact Number
  4. TYPE a valid Email Address
  5. Complete the remaining mandatory fields
  6. CLICK the OK button
  7. VIEW the newly created Site
- **Expected result (ADO):** "The Contact Number is accepted without a validation error… The Email Address
  is accepted without a validation error… The saved Contact Number and Email Address are displayed
  correctly."
- **Assertions:**
  - [x] ASSERT no validation error is shown against Contact Number after entry
  - [x] ASSERT no validation error is shown against Email Address after entry
  - [x] ASSERT (BLOCKING) the Site is created

### TC-07 (#113297): Verify Site Contact Number and Email Address Reject Invalid Formats
- **Type:** Negative / Validation
- **Steps:**
  1. NAVIGATE to the Facilities menu
  2. CLICK the Add Site button
  3. TYPE a valid Site Name and Site Type
  4. TYPE a valid address and SELECT a location from the Geo/GIS results
  5. TYPE a Contact Number with fewer than 10 digits
  6. REPLACE the Contact Number with a value containing more than 10 digits
  7. TYPE an invalid Email Address format
  8. CLICK the OK button
- **Expected result (ADO):** "The system displays the applicable Contact Number validation and does not
  accept the invalid value… the applicable Email Address validation… The system prevents the Site from
  being created while the invalid values remain."
- **Assertions:**
  - [x] ASSERT the Geo/GIS results populate the address — **non-blocking, BUG-401**
  - [x] ASSERT a Contact Number validation is displayed for a too-short value
  - [x] ASSERT a Contact Number validation is displayed for a too-long value
  - [x] ASSERT an Email Address validation is displayed for an invalid format
  - [x] ASSERT (BLOCKING) the modal stays open — the Site is not created

### TC-08 (#113298): Verify Site Details Can Be Viewed
- **Type:** Read-only / Functional
- **Steps:**
  1. NAVIGATE to the Facilities menu
  2. LOCATE an existing Site
  3. CLICK the View icon for the selected Site
  4. REVIEW the Site details
- **Expected result (ADO):** "The Site Name, Site Type, Address, Latitude, Longitude, Region, Contact
  Number, Email Address and Operating Hours are displayed correctly"
- **Assertions:**
  - [x] ASSERT (BLOCKING) the Site list displays at least one Site
  - [x] ASSERT (BLOCKING) the Site details are displayed after clicking View
  - [x] ASSERT each of the nine prescribed detail fields is present

## Teardown
- Sites created by this plan remain in QA. All carry `QA-AUTO` in the Site Name for identification.
- Each test case runs in its own isolated browser context, so no session teardown is required.

## Coverage not in this suite
ADO 113290 does not cover editing or deleting a Site, pagination or filtering of the Facilities list, the
**Export** action visible in the toolbar, or duplicate-name handling. None of these are claimed as coverage.
