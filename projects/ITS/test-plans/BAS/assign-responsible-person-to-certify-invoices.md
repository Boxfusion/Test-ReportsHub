# Test Plan: BAS-102370 — Assign Responsible Person to Certify Invoices

> **Status:** Ready
> **Owner:** QA
> **Last Updated:** 2026-06-17
> **Estimated Duration:** 300s

## Metadata
| Field | Value |
|-------|-------|
| App URL | https://pd-invtracking-adminportal-qa.azurewebsites.net/ |
| Environment | QA |
| Login As | admin / 123qwe |
| ADO Plan | [#102133](https://dev.azure.com/boxfusion/PD-Shesha%203%20Migration/_testPlans/define?planId=102133&suiteId=102355) |
| ADO Suite | #102355 — BAS |

## Objective
> Validate the **Assign Responsible Person to Certify Invoices** workflow step of the BAS — covering invoice attachment viewing, audit history, assigning an official, and routing to Certify Invoice step.

## Preconditions
- [ ] App is reachable at https://pd-invtracking-adminportal-qa.azurewebsites.net/
- [ ] Admin credentials are valid (admin / 123qwe)
- [ ] An item is routed to the Assign Responsible Person to Certify Invoices step
- [ ] The acting user has the role required to perform this step

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

### TC-02 — Click on Invoice Attachment link (ADO #102370)

*The system should download the invoice attachment.*

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE to the Workflow inbox and open the item routed to this step
  2. SNAPSHOT — confirm the target element for: Click on Invoice Attachment link
  3. CLICK the Invoice Attachment link
- **Expected result:** The system should download the invoice attachment
- **Assertions:**
  - [x] ASSERT (BLOCKING) The invoice attachment is downloaded

---

### TC-03 — Click on the Invoice Attachment Audit icon (ADO #102370)

*The system should display the Invoice attachment audit history.*

- **Type:** Happy path
- **Steps:**
  1. SNAPSHOT — confirm the target element for: Click on the Invoice attachment Audit icon
  2. CLICK the Invoice attachment Audit icon
  3. SNAPSHOT — verify the audit history is displayed
- **Expected result:** The system should display the Invoice attachment audit history
- **Assertions:**
  - [x] ASSERT (BLOCKING) The Invoice attachment audit history is displayed

---

### TC-04 — Click on Official field (ADO #102370)

*The system should display a list of officials to select.*

- **Type:** Happy path
- **Steps:**
  1. SNAPSHOT — confirm the target element for: Click on Official field
  2. CLICK the Official field
  3. SNAPSHOT — verify the list of officials is displayed
- **Expected result:** The system should display a list of officials to select
- **Assertions:**
  - [x] ASSERT (BLOCKING) A list of officials is displayed

---

### TC-05 — Select/Search for the Official and select one (ADO #102370)

*The selected official should be displayed and the Submit button should become active.*

- **Type:** Happy path
- **Steps:**
  1. SNAPSHOT — confirm the target element for: Search for an official
  2. TYPE an official name in the search field
  3. SNAPSHOT — confirm the target element for: Select the official from results
  4. SELECT an official from the list
  5. SNAPSHOT — verify the official is displayed and Submit button is active
- **Expected result:** 1. Official should be displayed on the Official field. 2. The Submit button should be active.
- **Assertions:**
  - [x] ASSERT (BLOCKING) The selected official is displayed in the Official field
  - [x] ASSERT (BLOCKING) The Submit button is active

---

### TC-06 — Click on the Submit button (ADO #102370)

*The system should redirect to the landing page and route the item to Certify Invoice step.*

- **Type:** Happy path
- **Steps:**
  1. SNAPSHOT — confirm the target element for: Click on the Submit button
  2. CLICK the Submit button
  3. WAIT for redirect to the landing page
  4. SNAPSHOT — verify redirect to the landing page
- **Expected result:** 1. The system should redirect a user to the landing Page. 2. Item should be routed to Certify Invoice Step.
- **Assertions:**
  - [x] ASSERT (BLOCKING) The system redirects to the landing page
  - [x] ASSERT (BLOCKING) The item is routed to the Certify Invoice step

---

### TC-07 — Click on the Close button (ADO #102370)

*The system should close the details page and redirect a user to the landing page.*

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE to the Workflow inbox and open the item again
  2. SNAPSHOT — confirm the target element for: Click on the Close button
  3. CLICK the Close button
  4. SNAPSHOT — verify redirect to the landing page
- **Expected result:** The system should close the details page and redirect a user to the landing page
- **Assertions:**
  - [x] ASSERT (BLOCKING) The system closes the details page and redirects to the landing page

---

## Teardown
- Log out of the admin portal after test completion (optional for automated runs).
