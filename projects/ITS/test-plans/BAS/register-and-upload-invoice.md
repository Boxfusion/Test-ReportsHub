# Test Plan: BAS-102362 — Register and Upload Invoice

> **Status:** Ready
> **Owner:** QA
> **Last Updated:** 2026-06-17
> **Estimated Duration:** 600s

## Metadata
| Field | Value |
|-------|-------|
| App URL | https://pd-invtracking-adminportal-qa.azurewebsites.net/ |
| Environment | QA |
| Login As | admin / 123qwe |
| ADO Plan | [#102133](https://dev.azure.com/boxfusion/PD-Shesha%203%20Migration/_testPlans/define?planId=102133&suiteId=102355) |
| ADO Suite | #102355 — BAS |

## Objective
> Validate the **Register and Upload Invoice** workflow step of the BAS (Budget and Accounting System) — covering navigation to My Items, creating a new BAS Request for Payment, capturing invoice details, supplier selection, date validation, invoice line items, supporting documents, and submission routing.

## Preconditions
- [ ] App is reachable at https://pd-invtracking-adminportal-qa.azurewebsites.net/
- [ ] Admin credentials are valid (admin / 123qwe)
- [ ] At least one confirmed supplier exists in the system
- [ ] The acting user has the role required to perform the Register and Upload Invoice step

## Test Cases

### TC-01 — Login as Admin

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE to https://pd-invtracking-adminportal-qa.azurewebsites.net/login
  2. SNAPSHOT — confirm login page is visible
  3. TYPE Username field with `admin`
  4. TYPE Password field with `123qwe`
  5. CLICK the Sign In button
  6. WAIT for the home page / workflow inbox to load
- **Expected result:** User is logged in and the homepage is reachable
- **Assertions:**
  - [x] ASSERT (BLOCKING) URL no longer contains `/login` and the authenticated home page is visible

---

### TC-02 — Click on the Workflow menu item (ADO #102362)

*The system should display the sub-menu items for Workflow.*

- **Type:** Happy path
- **Steps:**
  1. SNAPSHOT — confirm the target element for: Click on the Workflow menu item
  2. CLICK the Workflow menu item
  3. SNAPSHOT — verify sub-menu items are displayed
- **Expected result:** The system should display the sub-menu item names (Inbox, My Items, Sent & Drafts)
- **Assertions:**
  - [x] ASSERT (BLOCKING) The sub-menu items (Inbox, My Items, Sent & Drafts) are displayed

---

### TC-03 — Click on the My Items submenu item (ADO #102362)

*The system should display the My Items page with Create New and Export buttons.*

- **Type:** Happy path
- **Steps:**
  1. SNAPSHOT — confirm the target element for: Click on the My Items submenu item
  2. CLICK the My Items submenu item
  3. SNAPSHOT — verify the My Items page is displayed
- **Expected result:** The system should display the My Items page with Create New and Export buttons
- **Assertions:**
  - [x] ASSERT (BLOCKING) My Items page is displayed with Create New and Export buttons

---

### TC-04 — Click on the Export button on My Items (ADO #102362)

*The system should export and download the list of incoming items as an Excel file.*

- **Type:** Happy path
- **Steps:**
  1. SNAPSHOT — confirm the target element for: Click on the Export button
  2. CLICK the Export button
- **Expected result:** The system should export and download the list of incoming items as an Excel (.xlsx) file containing all records currently displayed based on the applied filters and search criteria
- **Assertions:**
  - [x] ASSERT (BLOCKING) The Excel (.xlsx) file is exported and downloaded

---

### TC-05 — Click Create New button (ADO #102362)

*The system should display a list of all available processes.*

- **Type:** Happy path
- **Steps:**
  1. SNAPSHOT — confirm the target element for: Click Create New button
  2. CLICK the Create New button
  3. SNAPSHOT — verify the list of processes is displayed
- **Expected result:** List of all processes should be displayed (BAS / LOGIS Request for payment)
- **Assertions:**
  - [x] ASSERT (BLOCKING) The list of processes including BAS and LOGIS Request for payment is displayed

---

### TC-06 — Select the BAS Request for Payment Workflow (ADO #102362)

*The Register and Upload Invoice page should open with Date Received auto-populated.*

- **Type:** Happy path
- **Steps:**
  1. SNAPSHOT — confirm the target element for: Select the BAS Request for Payment Workflow
  2. SELECT the BAS Request for Payment Workflow
  3. SNAPSHOT — verify the Register and Upload Invoice page is displayed
  4. SNAPSHOT — verify the Date Received field is auto-populated with today's date
- **Expected result:** 1. The Register and Upload Invoice page should be displayed. 2. The system should automatically populate the Date Received field with the current date. 3. The system should allow the user to modify the Date Received field and select a valid past date. 4. The system should not allow the selection of a future date in the Date Received field.
- **Assertions:**
  - [x] ASSERT (BLOCKING) The Register and Upload Invoice page is displayed
  - [x] ASSERT (BLOCKING) The Date Received field is auto-populated with today's date

---

### TC-07 — Click on Date Received field (ADO #102362)

*The system should display a Date Picker.*

- **Type:** Happy path
- **Steps:**
  1. SNAPSHOT — confirm the target element for: Click on Date Received field
  2. CLICK the Date Received field
  3. SNAPSHOT — verify the Date Picker is displayed
- **Expected result:** The system should display a Date Picker
- **Assertions:**
  - [x] ASSERT (BLOCKING) The Date Picker is displayed

---

### TC-08 — Select a different Date Received (ADO #102362)

*The system should only allow selection of the current date or a past date; future dates must not be selectable.*

- **Type:** Happy path
- **Steps:**
  1. SNAPSHOT — confirm the Date Picker is visible
  2. SELECT a past date from the Date Picker
  3. SNAPSHOT — verify the selected date is displayed and future dates are not selectable
- **Expected result:** The system should allow users to select only the current date or a past date in the Date Received field. Future dates must not be selectable or accepted.
- **Assertions:**
  - [x] ASSERT (BLOCKING) Only current or past dates are selectable; future dates are disabled

---

### TC-09 — Click on the ellipses on the Supplier Name field (ADO #102362)

*A list of confirmed suppliers should be displayed.*

- **Type:** Happy path
- **Steps:**
  1. SNAPSHOT — confirm the target element for: Click on the ellipses on the Supplier Name field
  2. CLICK the ellipses button on the Supplier Name field
  3. SNAPSHOT — verify the supplier list is displayed
- **Expected result:** A list of confirmed suppliers should be displayed. NB: An invoice capturer has an option to search the supplier name by populating it on the search bar.
- **Assertions:**
  - [x] ASSERT (BLOCKING) A list of confirmed suppliers is displayed

---

### TC-10 — Select a Supplier Name from the Supplier list (ADO #102362)

*The selected supplier should be displayed and the Supplier Details panel should populate as read-only.*

- **Type:** Happy path
- **Steps:**
  1. SNAPSHOT — confirm the target element for: Select a Supplier Name from the Supplier list
  2. SELECT a supplier name from the displayed list
  3. SNAPSHOT — verify the supplier is displayed in the Supplier Name field
  4. SNAPSHOT — verify the Supplier Details information is displayed
- **Expected result:** 1. The selected Supplier should be displayed on the Supplier Name field. 2. The Supplier Details information should be displayed upon selecting the supplier name. NB: The Supplier Details should be read-only.
- **Assertions:**
  - [x] ASSERT (BLOCKING) The selected supplier is displayed in the Supplier Name field
  - [x] ASSERT (BLOCKING) The Supplier Details panel is populated and read-only

---

### TC-11 — Click on the Add icon on the Invoices panel without populating fields (ADO #102362)

*All mandatory fields should be highlighted in red with a validation error message.*

- **Type:** Negative
- **Steps:**
  1. SNAPSHOT — confirm the target element for: Click on the Add icon on the Invoices panel
  2. CLICK the Add icon on the Invoices panel
  3. SNAPSHOT — verify mandatory field validation errors are displayed
- **Expected result:** All mandatory fields are highlighted in red with an error message that reads "this field is required"
- **Assertions:**
  - [x] ASSERT (BLOCKING) Mandatory fields are highlighted in red with "this field is required" error messages

---

### TC-12 — Click on the Cancel icon on the Invoices panel (ADO #102362)

*The system should reset and clear the validation errors.*

- **Type:** Happy path
- **Steps:**
  1. SNAPSHOT — confirm the target element for: Click on the Cancel icon on the Invoices panel
  2. CLICK the Cancel icon on the Invoices panel
  3. SNAPSHOT — verify validation errors are cleared
- **Expected result:** The system should reset and clear the validation errors
- **Assertions:**
  - [x] ASSERT (BLOCKING) Validation errors are cleared from the Invoices panel

---

### TC-13 — Click on the Invoice Date field (ADO #102362)

*The system should display a Date Picker.*

- **Type:** Happy path
- **Steps:**
  1. SNAPSHOT — confirm the target element for: Click on the Invoice Date field
  2. CLICK the Invoice Date field
  3. SNAPSHOT — verify the Date Picker is displayed
- **Expected result:** The system should display a Date Picker
- **Assertions:**
  - [x] ASSERT (BLOCKING) The Date Picker is displayed for Invoice Date

---

### TC-14 — Select Invoice Date from the date picker (ADO #102362)

*Only the current date or a past date should be selectable; the selected date should be displayed.*

- **Type:** Happy path
- **Steps:**
  1. SNAPSHOT — confirm the Date Picker is visible
  2. SELECT a past date from the date picker
  3. SNAPSHOT — verify the selected date is displayed and future dates are not selectable
- **Expected result:** 1. The system should allow users to select only the current date or a past date in the Invoice Date field. Future dates must not be selectable or accepted. 2. The specified date should be displayed.
- **Assertions:**
  - [x] ASSERT (BLOCKING) Only current or past dates are selectable; the selected date is displayed

---

### TC-15 — Click on Service Delivery Date field (ADO #102362)

*The system should display a Date Picker.*

- **Type:** Happy path
- **Steps:**
  1. SNAPSHOT — confirm the target element for: Click on Service Delivery Date field
  2. CLICK the Service Delivery Date field
  3. SNAPSHOT — verify a Date Picker is displayed
- **Expected result:** The system should display a Date Picker
- **Assertions:**
  - [x] ASSERT (BLOCKING) The Date Picker is displayed for Service Delivery Date

---

### TC-16 — Select Service Delivery Date from the date picker (ADO #102362)

*The selected date should be displayed in the Service Delivery Date field.*

- **Type:** Happy path
- **Steps:**
  1. SNAPSHOT — confirm the Date Picker is visible
  2. SELECT a valid date from the date picker
  3. SNAPSHOT — verify the selected date is displayed in the Service Delivery Date field
- **Expected result:** The system should display the selected date on the Service Delivery Date field
- **Assertions:**
  - [x] ASSERT (BLOCKING) The selected date is displayed in the Service Delivery Date field

---

### TC-17 — Populate the Invoice No. field (ADO #102362)

*The populated invoice number should be displayed.*

- **Type:** Happy path
- **Steps:**
  1. SNAPSHOT — confirm the target element for: Populate the Invoice No. field
  2. TYPE an invoice number into the Invoice No. field
  3. SNAPSHOT — verify the invoice number is displayed
- **Expected result:** The populated invoice number should be displayed
- **Assertions:**
  - [x] ASSERT (BLOCKING) The invoice number is displayed in the Invoice No. field

---

### TC-18 — Populate the Invoice Amount field (ADO #102362)

*The Invoice Amount should be displayed.*

- **Type:** Happy path
- **Steps:**
  1. SNAPSHOT — confirm the target element for: Populate the Invoice Amount field
  2. TYPE an invoice amount into the Invoice Amount field
  3. SNAPSHOT — verify the invoice amount is displayed
- **Expected result:** The Invoice Amount should be displayed
- **Assertions:**
  - [x] ASSERT (BLOCKING) The invoice amount is displayed in the Invoice Amount field

---

### TC-19 — Attach Invoice attachment (ADO #102362)

*The invoice attachment should be attached successfully.*

- **Type:** Happy path
- **Steps:**
  1. SNAPSHOT — confirm the target element for: Attach Invoice attachment
  2. CLICK the file upload control for Invoice attachment
  3. TYPE the file path of a valid invoice document
  4. SNAPSHOT — verify the invoice attachment is attached
- **Expected result:** Invoice attachment should be attached
- **Assertions:**
  - [x] ASSERT (BLOCKING) The invoice attachment is attached

---

### TC-20 — Click on the Add icon to save the invoice line item (ADO #102362)

*All populated information on the Invoices panel should be added; multiple invoices should be supported.*

- **Type:** Happy path
- **Steps:**
  1. SNAPSHOT — confirm the target element for: Click on the Add icon
  2. CLICK the Add icon on the Invoices panel
  3. SNAPSHOT — verify the invoice line item is added to the grid
- **Expected result:** 1. All the populated information on the Invoices panel should be added. NB: An Invoice capturer should be allowed to add multiple invoices and the Total amount should sum up all the Invoice amounts.
- **Assertions:**
  - [x] ASSERT (BLOCKING) The invoice line item is added to the Invoices grid

---

### TC-21 — Attach Supporting Documents (ADO #102362)

*Supporting documents should be attached to the request.*

- **Type:** Happy path
- **Steps:**
  1. SNAPSHOT — confirm the target element for: Attach Supporting Documents
  2. CLICK the file upload control for Supporting Documents
  3. TYPE the file path of a valid supporting document
  4. SNAPSHOT — verify the supporting document is attached
- **Expected result:** Supporting documents are attached to the request
- **Assertions:**
  - [x] ASSERT (BLOCKING) Supporting documents are attached

---

### TC-22 — Click on the Close button (ADO #102362)

*The system should redirect to the homepage.*

- **Type:** Happy path
- **Steps:**
  1. SNAPSHOT — confirm the target element for: Click on the Close button
  2. CLICK the Close button
  3. SNAPSHOT — verify the system redirects to the homepage
- **Expected result:** The system redirects to the homepage
- **Assertions:**
  - [x] ASSERT (BLOCKING) The system redirects to the homepage

---

### TC-23 — Click on Submit button (ADO #102362)

*The system should redirect to the homepage and route the item to Assign Branch Finance Admin to Assign Certifier step.*

- **Type:** Happy path
- **Steps:**
  1. SNAPSHOT — confirm the target element for: Click on Submit button
  2. CLICK the Submit button
  3. WAIT for the page to redirect to the homepage
  4. SNAPSHOT — verify the system redirects to the homepage
- **Expected result:** 1. The system should redirect to the homepage. 2. The item should be routed to Assign Branch Finance Admin to Assign Certifier step.
- **Assertions:**
  - [x] ASSERT (BLOCKING) The system redirects to the homepage
  - [x] ASSERT (BLOCKING) The item is routed to the Assign Branch Finance Admin to Assign Certifier step

---

## Teardown
- Log out of the admin portal after test completion (optional for automated runs).
