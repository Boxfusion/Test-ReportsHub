# Test Plan: Customers

> **Status:** Ready
> **Owner:** QA
> **Last Updated:** 2026-09-03
> **Estimated Duration:** 600s

## Metadata
| Field | Value |
|-------|-------|
| App URL | https://pd-dep-adminportal-qa.shesha.app/login |
| Environment | QA |
| Login As | Admin / P@ssword1 |
| Azure DevOps | Plan **112718** › PD-CRM (112719) › Case Management (112720) › **Customers (113324)** |
| ADO cases | #113348 – #113358 (11 cases, all state `Design`, priority 2) |

> **Source of truth.** This plan mirrors ADO suite 113324 one-to-one — 11 cases, in ADO order, with each
> case's expected result quoted from the ADO step. Suite pulled 2026-09-03; the raw dump is at
> `test-data/ado-suite-113324.json`.

> ⚠️ **This suite MUTATES data.** #113352 edits a customer and **#113353 permanently deletes one**.
> Both act only on `QAAuto*` customers created by this project's own Case Creation runs — **never on a
> real customer record.** The list holds 789 customers, most of them genuine.

## Objective
> Execute the Customers suite (ADO 113324) against the QA environment: the Customers list and details
> panel, the Logged Cases and Interactions tabs, navigation from a logged case to the case itself,
> editing and deleting a customer, and the search, filter and export controls.

## Preconditions
- [ ] App is reachable and `Admin` / `P@ssword1` authenticates
- [ ] At least one customer has a logged case **and** an interaction — `QAAuto604351 Tester` does (verified 2026-09-03)
- [ ] At least three spare `QAAuto*` customers exist — 41 do (verified 2026-09-03)

## Application map (captured live 2026-09-03)

**Route:** Customers → `/dynamic/Boxfusion.Dep/table-customers` (form `Boxfusion.Dep/table-customers v21`).
**Details:** the row magnifying glass navigates to `/dynamic/Boxfusion.Dep/customer-details-v1?id=<guid>`
(form `customer-details-v1 v2`) — a **route change, not a modal**.

**The list is a div grid, not an HTML table.** No `<table>`, `<tr>` or `<th>` in the DOM — rows are
`[role=row]` (11 = 1 header + 10 data rows at the default page size). Columns are **First Name, Last Name,
Mobile Number, Email Address**. The pager reads `1-10 of 789 items`.

⚠️ **Unlike the Facilities list, there is no `.sha-crud-cell`.** Row actions are bare icons.

| Affordance | Selector | Notes |
|---|---|---|
| Search | `.sha-global-table-filter input` | free-text, Enter to execute |
| Row view ("magnifying glass") | `.anticon-search` in the row | **there is no eye icon** |
| Row edit | `.anticon-edit` in the row | navigates to `…&mode=edit` |
| Row delete | `.anticon-delete` in the row | opens a confirm dialog |
| Filter | `.anticon-filter` (toolbar) | renders an **inline** panel with `Clear` / `Apply` — not a dropdown |
| Column chooser | `.anticon-sliders` (toolbar) | not exercised by any ADO case |
| Export | `button:has-text("Export")` | |

**Details panel content:** sections `Customer Details` › `Customer Identification Details`
(Customer Name, Account Status) › `Contact Information` (Preferred Contact Name, Phone Number,
Preferred Contact Method, Address, Email Address) › `Notes`, then the tabs **Logged Cases** and
**Interactions**.

**Interactions columns:** Reference No, Title, Action Date, From Person, To Person, Agent Assigned,
Group Assigned, Notification Message.

## Deviations from the ADO text

These are called out so the results stay auditable against the ADO steps.

1. **The delete confirmation does not match the ADO text — BUG-501 (Low).** #113353 and #113354 both quote
   the dialog as *"Are you sure you want to delete this item?"* with **Cancel** and **OK** buttons. The
   application actually renders a dialog titled **`Delete User`** reading
   **`are you sure you want to delete this user?`** with lowercase **`no`** and **`yes`** buttons. Three
   deltas: the record is a *Customer* but the dialog calls it a *User*, the sentence is lowercase, and the
   buttons are `no`/`yes` rather than `Cancel`/`OK`. Assertions are written against the **substance**
   (a confirmation appears, it names a delete, it has an affirm and a dismiss control) so both cases can
   still be executed; the wording delta is recorded as a defect rather than failing the case.
2. **The customer form has no `label` ↔ `input` association at all.** On `customer-details-v1` the field
   captions (`Customer Name`, `Phone Number`, `Email Address` …) are plain text, **not** `<label>` elements
   inside the `ant-form-item`. The Facilities/Create-Case pattern
   `.ant-form-item:has(> .ant-row > .ant-col > label[for="<id>"])` matches **nothing** here. Fields are
   therefore addressed **by their current value** (the spec resolves the input index whose value matches the
   customer's known data), which is also what proves ADO #113352 step 4 — "the form is displayed with the
   existing information populated".
3. **"The View icon" is the magnifying glass.** #113349–#113351 say "Click the View icon"; the row exposes
   `search`, `edit` and `delete` icons and **no eye icon**. The magnifying glass is used and logged.
4. **#113357 cannot be fully verified.** ADO asks that the exported file "opens successfully" and "contains
   the customer records displayed in the Customers list". The download and its size/type are verified;
   **reading the workbook's records is NOT VERIFIED** (it needs a spreadsheet reader). Reported as such
   rather than claimed — the same treatment as Contacts #113283.
5. **Every case's step 1 is "Log in to the Admin Portal".** Actioned as ordinary setup, not as a separate
   assertion, in all 11 cases.
6. **The suite has no "create customer" case, and the screen has no Add affordance.** Customers originate
   from case creation. Noted under *Coverage not in this suite*.
7. **A case cannot be opened from the Logged Cases tab — BUG-502 (High).** #113350 step 6 requires
   selecting a case from the Logged Cases list. The case card is **inert**: no `<a>`, no click handler,
   `cursor: auto` on every element carrying the reference, and clicking it neither navigates nor selects
   the card. The datalist's `Open` toolbar button does exist in the form configuration but its
   form-item carries `ant-form-item-hidden`, so it is **never visible** — before or after clicking.
   The navigation assertion is therefore made **non-blocking** and the case is reported as failing on
   BUG-502, with the `Open` button's hidden state captured in the run log as evidence.
8. **The Filter control is a sidebar, not a dropdown.** `.anticon-filter` opens a `Table Columns`
   sidebar whose `Filter by` multiselect (`.columns-filter-selector`) chooses the column; an operator
   (`Contains`) and a value box (`placeholder="Filter <column>"`) then appear, committed with `Apply`.
   Columns offered: `First Name`, `Last Name`, `Mobile Number`, `Email Address`, `Gender`.

## Test data

| Role | Customer | Used by | Mutated? |
|---|---|---|---|
| **Anchor** (has 1 logged case + 1 interaction) | `QAAuto604351 Tester` | TC-01 – TC-04 | **No — read-only** |
| **Edit target** | a `QAAuto*` customer that is *not* the anchor | TC-05 | Phone Number changed |
| **Delete target** | a different `QAAuto*` customer, resolved at runtime | TC-06 | **Deleted permanently** |
| **Cancel target** | any `QAAuto*` customer | TC-07 | No — deletion cancelled |

The `QAAuto<stamp> Tester` customers (41 of them, all `0821234567` / `qa.auto@test.com`) were created by
this project's own Case Creation runs. **The anchor is never mutated**, so TC-01–TC-04 stay reproducible.

## Test Cases

### TC-01 (#113348): Verify Customers Are Displayed in the Customers List
- **Type:** Read-only / Happy path
- **Steps:**
  1. NAVIGATE to the Customers side menu
  2. LOCATE an existing customer in the Customer index table
  3. CLICK the Magnifying glass of that customer
  4. REVIEW the customer information displayed in the panel
  5. SELECT the Logged Cases tab
  6. SELECT the Interactions tab
- **Expected result (ADO):** "The Customers screen is displayed… The customer is displayed in the list…
  The customer details panel is displayed… The customer's available details are displayed… The Logged
  Cases tab is displayed… The Interactions tab is displayed."
- **Assertions:**
  - [x] ASSERT (BLOCKING) the Customers list is displayed with at least one data row
  - [x] ASSERT the list columns are `First Name`, `Last Name`, `Mobile Number`, `Email Address`
  - [x] ASSERT (BLOCKING) the details panel opens on `customer-details-v1?id=…`
  - [x] ASSERT the customer's name, phone and email are displayed in the panel
  - [x] ASSERT (BLOCKING) a `Logged Cases` tab is displayed
  - [x] ASSERT (BLOCKING) an `Interactions` tab is displayed

### TC-02 (#113349): Verify Customer Logged Cases Are Displayed
- **Type:** Read-only / Functional
- **Steps:**
  1. NAVIGATE to the Customers side menu
  2. LOCATE the customer with logged cases
  3. CLICK the View icon for the customer
  4. SCROLL down and CLICK the Logged Cases tab
  5. REVIEW the cases displayed under the Logged Cases tab
- **Expected result (ADO):** "All cases linked to the selected customer are displayed… The relevant case
  information, including the case status, is displayed for each linked case."
- **Assertions:**
  - [x] ASSERT (BLOCKING) the Logged Cases tab shows at least one case for the anchor customer
  - [x] ASSERT the case reference number is displayed
  - [x] ASSERT (BLOCKING) a case **status** is displayed against the case
  - [x] ASSERT the case names the customer it was logged from

### TC-03 (#113350): Verify Customer Case Can Be Accessed from Logged Cases
- **Type:** Navigation / Functional
- **Steps:**
  1. NAVIGATE to the Customers side menu
  2. LOCATE the customer with a logged case
  3. CLICK the View icon for the customer
  4. SELECT the Logged Cases tab
  5. SELECT a case from the Logged Cases list
  6. VERIFY the selected case on the All Service Request landing page
- **Expected result (ADO):** "The selected case opens the All Service Request landing page… The selected
  case is displayed and can be accessed from the All Service Request landing page."
- **Assertions:**
  - [x] ASSERT selecting the case opens it — **expected to FAIL, BUG-502** (deviation 7); non-blocking
        so the evidence still reaches the report
  - [x] ASSERT the datalist `Open` button's visibility is captured before and after the click — the
        proof that the click changed nothing
  - [x] ASSERT the opened page identifies the same case — **only reachable if the app navigates**
  - [x] ASSERT the destination is the All Service Request landing page — non-blocking, actual route logged

### TC-04 (#113351): Verify Customer Interactions Are Displayed
- **Type:** Read-only / Functional
- **Steps:**
  1. NAVIGATE to the Customers side menu
  2. LOCATE the customer with logged cases and interactions
  3. CLICK the View icon for the customer
  4. SELECT the Interactions tab
  5. REVIEW the interactions displayed for the customer
  6. VERIFY the displayed interactions correspond to the customer's cases
- **Expected result (ADO):** "The interactions associated with the customer's logged cases are
  displayed… The interactions correspond to the cases associated with the selected customer."
- **Assertions:**
  - [x] ASSERT (BLOCKING) the Interactions tab shows at least one interaction
  - [x] ASSERT the interaction columns include `Reference No`, `From Person`, `To Person`
  - [x] ASSERT (BLOCKING) the interaction's Reference No **matches a case** in the Logged Cases tab —
        this is what "correspond to the cases" means, and it is asserted rather than assumed
  - [x] ASSERT the interaction names the customer

### TC-05 (#113352): Verify Customer Details Can Be Edited
- **Type:** Functional — **mutates data**
- **Steps:**
  1. NAVIGATE to the Customers side menu
  2. LOCATE an existing customer (a `QAAuto*` customer, never the anchor)
  3. CLICK the Edit icon for the customer
  4. UPDATE the required customer information (Phone Number)
  5. SAVE the changes
  6. CLICK the View icon for the updated customer
  7. VERIFY the updated information
- **Expected result (ADO):** "The customer details form is displayed with the existing information
  populated… The updated information is accepted… The customer details are successfully updated… The
  updated customer details are correctly displayed."
- **Assertions:**
  - [x] ASSERT (BLOCKING) the edit form opens with the **existing information populated** (name, phone and
        email match the row) — see deviation 2
  - [x] ASSERT the new Phone Number is accepted into the field
  - [x] ASSERT (BLOCKING) Save completes and the form leaves edit mode
  - [x] ASSERT (BLOCKING) re-opening the customer shows the **updated** Phone Number
  - [x] ASSERT the updated Phone Number is displayed in the Customers list row

### TC-06 (#113353): Verify Customer Can Be Deleted
- **Type:** Destructive — **permanently deletes a record**
- **Steps:**
  1. NAVIGATE to the Customers side menu
  2. LOCATE the customer to be deleted (a spare `QAAuto*` customer)
  3. CLICK the Delete icon for the customer
  4. CLICK OK on the confirmation dialog
  5. SEARCH for the deleted customer
- **Expected result (ADO):** "A confirmation dialog is displayed with the message 'Are you sure you want to
  delete this item?' and Cancel and OK buttons… The customer is successfully deleted from the Customers
  list… The deleted customer is no longer displayed in the Customers list."
- **Assertions:**
  - [x] ASSERT (BLOCKING) the delete target is a `QAAuto*` customer and is **not** the anchor — a guard, so
        the case can never delete a real record
  - [x] ASSERT a confirmation dialog is displayed offering an affirm and a dismiss control
  - [x] ASSERT the dialog text matches the ADO wording — **expected to FAIL, BUG-501** (deviation 1)
  - [x] ASSERT (BLOCKING) after confirming, the customer is no longer returned by a search for its name

### TC-07 (#113354): Verify Customer Deletion Can Be Cancelled
- **Type:** Negative / Alternate route
- **Steps:**
  1. NAVIGATE to the Customers side menu
  2. LOCATE the customer to be deleted
  3. CLICK the Delete icon for the customer
  4. CLICK Cancel on the confirmation dialog
- **Expected result (ADO):** "The confirmation dialog closes and the customer is not deleted."
- **Assertions:**
  - [x] ASSERT a confirmation dialog is displayed
  - [x] ASSERT the dialog text matches the ADO wording — **expected to FAIL, BUG-501** (deviation 1)
  - [x] ASSERT (BLOCKING) the dialog closes on the dismiss control
  - [x] ASSERT (BLOCKING) the customer is **still present** in the list afterwards

### TC-08 (#113355): Verify Customers Can Be Searched
- **Type:** Functional
- **Steps:**
  1. NAVIGATE to the Customers side menu
  2. TYPE a known customer name in the Search field
  3. EXECUTE the search
  4. REVIEW the search results
  5. CLEAR the search criteria
- **Expected result (ADO):** "The search criteria is accepted… The Customers list is filtered based on the
  typed search criteria… Only customers matching the search criteria are displayed… The search field is
  cleared."
- **Assertions:**
  - [x] ASSERT the search field accepts the typed criteria
  - [x] ASSERT (BLOCKING) the result count is lower than the unfiltered count
  - [x] ASSERT (BLOCKING) **every** returned row matches the search term — not merely the first
  - [x] ASSERT clearing the search field restores the unfiltered count

### TC-09 (#113356): Verify Customers Can Be Filtered
- **Type:** Functional
- **Steps:**
  1. NAVIGATE to the Customers side menu
  2. CLICK the Filter icon
  3. SELECT the required filter criteria
  4. APPLY the filter
  5. REVIEW the filtered results
- **Expected result (ADO):** "The filter options are displayed… The selected filter criteria are
  accepted… The Customers list is filtered according to the selected criteria… Only customers matching the
  selected criteria are displayed."
- **Assertions:**
  - [x] ASSERT (BLOCKING) the Filter icon reveals the `Table Columns` sidebar with `Filter by`,
        `Apply` and `Clear` (deviation 8)
  - [x] ASSERT the filterable columns are enumerated and logged, and include `First Name`
  - [x] ASSERT selecting a column reveals its value control and accepts the criteria
  - [x] ASSERT (BLOCKING) applying `First Name contains QAAuto` narrows the list below the baseline
  - [x] ASSERT **every** returned row matches the applied criterion — not merely the first

### TC-10 (#113357): Verify Customers Can Be Exported
- **Type:** Functional
- **Steps:**
  1. NAVIGATE to the Customers side menu
  2. CLICK the Export option
  3. OPEN the exported file
  4. REVIEW the exported customer records
- **Expected result (ADO):** "The customer data export is initiated… The exported file opens
  successfully… The exported file contains the customer records displayed in the Customers list."
- **Assertions:**
  - [x] ASSERT (BLOCKING) clicking Export initiates a download
  - [x] ASSERT the downloaded file has a name and a non-zero size, and both are logged
  - [x] ASSERT the file's records match the list — **NOT VERIFIED**, see deviation 4

### TC-11 (#113358): Verify Customer Search Returns No Results for Invalid Criteria
- **Type:** Negative
- **Steps:**
  1. NAVIGATE to the Customers side menu
  2. TYPE a value that does not match any existing customer in the Search field
  3. EXECUTE the search
  4. REVIEW the search results
- **Expected result (ADO):** "No customer records are displayed for the unmatched search criteria, and the
  system indicates that no results were found, if applicable."
- **Assertions:**
  - [x] ASSERT the search field accepts the unmatched criteria
  - [x] ASSERT (BLOCKING) **no** data rows are returned
  - [x] ASSERT the list indicates no results were found — the pager reads `0 items found`

## Teardown
- The customer deleted by TC-06 is **gone permanently** — it was a `QAAuto*` record created by this
  project, never a real customer.
- TC-05 leaves its target's Phone Number changed. The customer is otherwise intact.
- Each test case runs in its own isolated browser context, so no session teardown is required.

## Coverage not in this suite
ADO 113324 does not cover **creating** a customer (the screen has no Add affordance — customers originate
from case creation), the column chooser (`sliders`), pagination, the `Last Call` / `link to case` /
`Login` toolbar actions, the `Telephony` tab on the details panel, or the Notes field. None of these are
claimed as coverage.
