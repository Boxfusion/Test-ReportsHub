# Test Plan: Contacts Directory

> **Status:** Ready
> **Owner:** QA
> **Last Updated:** 2026-09-02
> **Estimated Duration:** 900s

## Metadata
| Field | Value |
|-------|-------|
| App URL | https://pd-dep-adminportal-qa.shesha.app/login |
| Environment | QA |
| Login As | Admin / P@ssword1 |
| Azure DevOps | Plan **112718** › PD-CRM (112719) › Case Management (112720) › **Contacts Directory (112756)** |
| ADO cases | #113275 – #113288 (14 cases, all state `Design`, priority 2) |

> **Source of truth.** This plan mirrors ADO suite 112756 one-to-one — 14 cases, in ADO order, with each
> case's expected result quoted from the ADO step.

> ⚠️ **This suite creates and DELETES data.** The directory holds **66 real contacts**, several of them
> actual colleagues. Every mutation — edit, delete — targets **only a contact this suite created itself**,
> identifiable by the first name `QAContact<stamp>` and surname `Directory`. **No pre-existing contact is
> ever edited or deleted.** The delete cases create their own victim first.

## 🔴 Blocking defect found during recon — 4 cases cannot be executed

**The Create New Contact form exposes no contact-information fields at all.** It renders a section heading
`Contact Information` with **nothing under it**. Verified by expanding both collapsible panels, scrolling
the modal body, and enumerating every label and input including hidden ones — the complete field list is:

`First Name*`, `Last Name*`, `Job Title`, `Description`, `Photo`, `Order Index*`, `Facility` (plus a hidden
`Flags`). There is **no Email Address, no Mobile Number, no Office Number, and no social media handle**.

Nor are they editable afterwards: the details-screen `Edit` exposes Order Index, Job Title, Description,
Facilities and the four social handles — **still no Email, Mobile or Office**.

Yet the directory list **displays an Email Address column and all four social-handle columns**, populated
for existing contacts. So the data exists in the model with no UI to enter or maintain it.

Raised as **BUG-301**. It blocks:

| ADO | Case | Why |
|---|---|---|
| #113285 | Phone and Office accept exactly 10 digits | no Phone/Office field exists |
| #113286 | Phone and Office reject invalid digit length | no Phone/Office field exists |
| #113287 | Email Address format validation | no Email field on the create form |
| #113288 | Invalid email address format is rejected | no Email field on the create form |

and partially blocks **#113275** (steps 9–10 cannot be actioned).

## Application map (captured live 2026-09-02)

**Contacts Directory** → `/dynamic/Boxfusion.ServiceManagement/contacts-table`
(form `Boxfusion.ServiceManagement/contacts-table v28`) — **66 contacts, 10 per page.**

⚠️ This is **not** an ant-table: there is no `<table>`/`<tbody>`. It is a Shesha react-table of `div`s.

| Element | Selector |
|---|---|
| Contact row | `div.tr.tr-body` (10 per page) |
| Columns | Name, Order Index, Job Title, Site, Email Address, Description, Facebook / Insta / Twitter / Linked In Handle |
| Row **view** icon | `[aria-label="search"]` → the contact details page |
| Row **edit** icon | `[aria-label="edit"]` → **inline row edit** (7 inputs appear inside the row) |
| Row **delete** icon | `[aria-label="delete"]` → an `.ant-popconfirm` |
| Row edit **save** / **cancel** | `[aria-label="save"]` / `[aria-label="close-circle"]` (they replace the view/edit/delete icons while editing) |
| Toolbar | `Create Contact`, `Export`, plus icon buttons `filter`, `sliders`, `reload` |
| Global search | `.sha-global-table-filter input.ant-input` + its adjacent `button` |
| Filter panel | `.sha-index-table-column-filters` — `Filter by`, `Clear`, `Apply` |

⚠️ **Focus the search box (`click()`) before `fill()`**, and wait for the pager total to change rather than
sleeping — the same two traps as the Cases list. Search verified: 66 items → 1 for `Moshadi`.

**Create New Contact** — an `.ant-modal` titled `Create New Contact`, form `Boxfusion.Dep/create-contact v19`.
Fields are label-anchored: `person_firstName`, `person_lastName`, `jobTitle`, `description`, `file2` (Photo),
`orderIndex`, `site` (Facility select). Buttons `Cancel` / `Save`.

**Contact details** → `/dynamic/Boxfusion.ServiceManagement/contact-details2?id=<guid>`
(form `contact-details2 v28`). Heading `Contact Details for <name>`. `Edit` switches the page into inline
edit mode offering `Cancel Form Edit` / `Save` — the same pattern as Case Details.

**Delete confirmation** — an `.ant-popconfirm`, buttons `Cancel` / `OK`.

## Deviations from the ADO text

1. **BUG-301** (above) — four cases blocked, one partially.
2. **The delete prompt is ungrammatical.** ADO #113281/#113282 quote *"Are you sure you want to delete this
   item?"*. The app renders **"Are you sure want to delete this item?"** — missing "you". Assertions match
   the substance, not the exact string. Raised as **BUG-302**.
3. **ADO says "Surname", the form says "Last Name"** (#113275 step 4). Matched on the real label.
4. **ADO #113280 step 3 expects a "contact details form ... in edit mode"** from the row Edit icon; the app
   actually does **inline row editing**, with save/cancel as row icons rather than a form. Functionally
   equivalent, so the case is executed against the real behaviour and the wording delta noted.
5. **#113279 says "magnifying glass icon"** — the row icon's accessible label is `search`, which is that
   icon. No deviation in behaviour.
6. **#113283 (Export) cannot verify file contents.** The browser download is captured and its filename and
   size asserted, but "open the exported file and verify the records" needs a spreadsheet reader. The
   contents check is reported as NOT VERIFIED.
7. **#113282 step 6 mis-spells "Search" as "Serach"** — cosmetic ADO typo, noted only.
8. **`Order Index` is pre-populated with `0`.** ADO #113284 step 3 says to "leave First Name, Last Name,
   and Order Index blank", but Order Index is never blank on a fresh form — so TC-10 explicitly clears the
   default to honour the step. Worth flagging to the BA: because it defaults to a valid value, an untouched
   form already satisfies the Order Index requirement, so that field's "mandatory" validation would never
   fire in normal use.

## Preconditions
- [ ] App is reachable and `Admin` / `P@ssword1` authenticates
- [ ] The directory contains contacts (66 at time of writing)

## Test Cases

### TC-01 (#113275): Verify Contact Can Be Created
- **Type:** Happy path — **partially blocked**
- **Steps:**
  1. NAVIGATE to the Contacts Directory
  2. CLICK Create Contact — the Create New Contact form is displayed
  3. TYPE a valid First Name
  4. TYPE a valid Surname (rendered as `Last Name`)
  5. TYPE a valid Job Title
  6. TYPE a valid Description
  7. TYPE a valid Order Index
  8. SELECT a valid Facility, where applicable
  9. ~~TYPE Email, Mobile Number and Office Number~~ — **not actionable, BUG-301**
  10. ~~TYPE the applicable social media handles~~ — **not actionable, BUG-301**
  11. CLICK Save
  12. VERIFY the Contacts list
- **Expected result (ADO):** "The contact is successfully created… The newly created contact is displayed with the entered information."
- **Assertions:**
  - [x] ASSERT (BLOCKING) the Create New Contact form is displayed
  - [x] ASSERT each field accepts its value
  - [x] ASSERT (BLOCKING) after Save the modal closes and the contact appears in the directory
  - [x] ASSERT the row shows the entered name, job title and order index
  - [ ] NOT VERIFIED — Email / Mobile / Office / social handles cannot be entered (BUG-301)

### TC-02 (#113276): Verify Contacts Are Displayed in the Contacts Directory
- **Type:** Read-only
- **Steps:** open the directory, review the list, verify a contact's information, page through
- **Expected result (ADO):** "Existing contacts are displayed… name, job title, email address, mobile number and facility, is displayed correctly… Additional contacts are displayed correctly on subsequent pages."
- **Assertions:**
  - [x] ASSERT (BLOCKING) contact rows are displayed and the pager reports a total
  - [x] ASSERT the column set includes Name, Order Index, Job Title, Site, Email Address, Description and the four social handles
  - [x] ASSERT (BLOCKING) paging to page 2 shows a different set of contacts
  - [ ] NOT VERIFIED — ADO expects a **Mobile Number** column; the directory has none (BUG-301)

### TC-03 (#113277): Verify Contact Can Be Searched
- **Type:** Functional
- **Steps:** identify an existing contact, type its name in Search, click the search icon, verify results, clear
- **Expected result (ADO):** "The system returns the matching contact… the results do not include unrelated contacts… The search field is cleared."
- **Assertions:**
  - [x] ASSERT the search field accepts the value
  - [x] ASSERT (BLOCKING) the result set narrows and every returned row matches the term
  - [x] ASSERT clearing the search restores the full list

### TC-04 (#113278): Verify Contacts Can Be Filtered
- **Type:** Functional
- **Steps:** click the Filter icon, select a criterion, Apply, verify, then Clear
- **Expected result (ADO):** "The Contacts Directory displays contacts matching the selected criteria… Only contacts that meet the selected filter criteria are displayed… The filter criteria are removed."
- **Assertions:**
  - [x] ASSERT (BLOCKING) the filter panel opens and offers criteria
  - [x] ASSERT applying a filter changes the result set
  - [x] ASSERT every remaining row satisfies the criterion
  - [x] ASSERT Clear restores the unfiltered total

### TC-05 (#113279): Verify Contact Details Can Be Viewed
- **Type:** Read-only
- **Steps:** locate a contact, click its magnifying-glass icon, review the details, compare against the list row
- **Expected result (ADO):** "The contact details are displayed… including the applicable personal, contact, facility, and social media information… The displayed information matches the contact's saved details."
- **Assertions:**
  - [x] ASSERT (BLOCKING) the icon opens `contact-details2` for that contact
  - [x] ASSERT the heading names the contact
  - [x] ASSERT Name, Order Index, Job Title and Description match the list row
  - [x] ASSERT the social media fields are present
  - [ ] NOT VERIFIED — the details screen shows **no Email / Mobile / Office** even though the list shows an email (BUG-301)

### TC-06 (#113280): Verify Contact Details Can Be Edited
- **Type:** Happy path — two routes in one ADO case
- **Steps:**
  1. **Route A — from the directory:** click the row Edit icon (inline row edit), change a field, click the row Save icon, verify in the list, then open the details and verify it was retained
  2. **Route B — from the details screen:** open another contact via the view icon, click Edit, change a field, Save, verify on both the details screen and in the directory
- **Expected result (ADO):** "The contact details are successfully updated… The updated information is retained and displayed correctly… on the Contact Details screen and in the Contacts Directory."
- **Assertions:**
  - [x] ASSERT (BLOCKING) the row Edit icon puts the row into edit mode (inputs appear inside the row)
  - [x] ASSERT (BLOCKING) the row Save persists the change and it survives a reload
  - [x] ASSERT (BLOCKING) the details-screen Edit offers `Save` / `Cancel Form Edit`
  - [x] ASSERT (BLOCKING) that change persists on the details screen and in the directory
- **Note:** operates only on a contact this suite created.

### TC-07 (#113281): Verify Contact Can Be Deleted
- **Type:** Happy path — **destructive**
- **Steps:**
  1. Create a `QAContact` to delete
  2. Locate it, click its Delete icon
  3. VERIFY the confirmation prompt
  4. CLICK OK
  5. SEARCH for the deleted contact
- **Expected result (ADO):** "A confirmation prompt is displayed with the message *Are you sure you want to delete this item?* and Cancel and OK options… The contact is deleted successfully… no longer displayed in the Contacts Directory."
- **Assertions:**
  - [x] ASSERT (BLOCKING) the prompt appears with `Cancel` and `OK`
  - [x] ASSERT the prompt asks about deleting the item (wording differs — BUG-302)
  - [x] ASSERT (BLOCKING) after OK the contact is gone from the directory
  - [x] ASSERT (BLOCKING) searching for it returns no match
- **Note:** deletes **only** the contact this case created.

### TC-08 (#113282): Verify Contact Deletion Can Be Cancelled
- **Type:** Negative
- **Steps:** as TC-07 but click `Cancel`, then verify the contact remains and is still searchable
- **Expected result (ADO):** "The confirmation prompt closes and the contact is not deleted… The contact remains displayed… The contact is returned in the search results."
- **Assertions:**
  - [x] ASSERT the prompt closes on Cancel
  - [x] ASSERT (BLOCKING) the contact is still in the directory
  - [x] ASSERT (BLOCKING) searching for it still returns it

### TC-09 (#113283): Verify Contacts Can Be Exported
- **Type:** Functional — **partially verifiable**
- **Steps:** confirm contacts are displayed, click Export, open the exported file, verify its contents
- **Expected result (ADO):** "The system initiates the export… The exported file opens successfully… contains the contact records and corresponding information displayed in the Contacts Directory."
- **Assertions:**
  - [x] ASSERT (BLOCKING) clicking Export starts a download
  - [x] ASSERT the downloaded file has a name and is non-empty
  - [ ] NOT VERIFIED — record-by-record contents require a spreadsheet reader (deviation 6)

### TC-10 (#113284): Verify Mandatory Contact Fields Are Validated
- **Type:** Negative / Validation
- **Steps:**
  1. CLICK Create Contact
  2. LEAVE First Name, Last Name and Order Index blank
  3. TYPE valid information in the other applicable fields
  4. CLICK Save
- **Expected result (ADO):** "The system prevents the contact from being created and displays validation messages that reads: *This field is required* for the mandatory fields."
- **Assertions:**
  - [x] ASSERT the three mandatory fields are empty before submit
  - [x] ASSERT (BLOCKING) `This field is required` is shown against First Name, Last Name and Order Index
  - [x] ASSERT (BLOCKING) the modal stays open — no contact is created

### TC-11 (#113285): Verify Phone Number and Office Number Accept Exactly 10 Digits
- **Type:** Boundary — 🔴 **BLOCKED (BUG-301)**
- **Expected result (ADO):** "The 10-digit phone number is accepted without a validation error… The saved Phone Number and Office Number are displayed correctly."
- **Assertions:** none executable — the Create New Contact form has no Phone Number or Office Number field.

### TC-12 (#113286): Verify Phone Number and Office Number Reject Invalid Digit Length
- **Type:** Negative — 🔴 **BLOCKED (BUG-301)**
- **Expected result (ADO):** "The system displays a validation message that reads *Please enter a valid cellphone number*…"
- **Assertions:** none executable — no Phone Number or Office Number field exists.

### TC-13 (#113287): Verify Email Address Format Validation
- **Type:** Negative / Validation — 🔴 **BLOCKED (BUG-301)**
- **Expected result (ADO):** "The system displays an email format validation message… the validation message is cleared, and the email address is accepted… The contact is successfully created."
- **Assertions:** none executable — the Create New Contact form has no Email Address field.

### TC-14 (#113288): Verify Invalid Email Address Format Is Rejected
- **Type:** Negative / Validation — 🔴 **BLOCKED (BUG-301)**
- **Expected result (ADO):** "…displays the message that reads *Please enter a valid email address*… The system prevents the contact from being created while invalid email address remains."
- **Assertions:** none executable — no Email Address field exists.

## Teardown
- Contacts created by this plan are named `QAContact<stamp> Directory`. TC-07 deletes its own; the rest
  remain and can be removed with the row Delete icon.
- Each test case runs in its own isolated browser context, so no session teardown is required.
