# Test Plan: ADMIN-2.2 — Incident Types

> **Status:** Ready
> **Owner:** QA
> **Last Updated:** 2026-06-08
> **Estimated Duration:** 300s

## Metadata
| Field | Value |
|-------|-------|
| App URL | https://ncdoh-dispatcher-adminportal-qa.shesha.app/login |
| Environment | QA |
| Login As | Admin / 123qwe |
| ADO Plan | [#65099](https://dev.azure.com/boxfusion/pd-dispatcher-V2/_testPlans/define?planId=65099&suiteId=65132) |
| ADO Suite | #65132 — 2.2 Incident Types (under 2. Administrative Functions) |
| Page | Dispatcher → Management → **Incident Types** (`/dynamic/Boxfusion.Ems/incident-types`) |

## Objective
> Validate the Incident Types admin area (Administrative Functions 2.2): searching the list, exporting, adding a new incident type, viewing/editing/deleting a record, and the cancel/save flows.

## Preconditions
- [ ] App is reachable at the Pre-Prod URL above
- [ ] Admin credentials are valid (Admin / 123qwe)
- [ ] The signed-in user can reach **Dispatcher → Management → Incident Types**

> **Note (2026-06-08, recorded live):** The menu item **"Incident Types"** opens a page headed **"Call Types"** — an inline-edit data grid (columns: *Triage Level*, *Call Types*, *Resolution SLA*) with a search box, an **Export** button, per-row **edit** pencils, and an **inline add-row** (a `plus-circle` add control with Triage Level / Call Types / Resolution SLA inputs). It is **not** the dialog + magnifying-glass "details view" flow the original ADO steps describe. Steps that assume an "Add New Record" dialog, a magnifying-glass details view, or a "Back" button are marked with `TODO` in the paired spec and will be reconciled by AI-repair (plan-correction) on the first `/RunTest`.

## Test Cases

### TC-01 — Log in to NC Dispatch
*Authenticate as Admin and reach the landing page (auto-prepended; the suite needs an authenticated session).*

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE to https://ncdoh-dispatcher-adminportal-qa.shesha.app/login
  2. SNAPSHOT — confirm the login page (Username, Password, Sign In) is visible
  3. TYPE Username with `Admin`
  4. TYPE Password with `123qwe`
  5. CLICK Sign In
  6. WAIT for the landing page to load (redirect away from `/login`)
- **Expected result:** Valid credentials sign the user in and redirect away from `/login`.
- **Assertions:**
  - [x] ASSERT (BLOCKING) the app redirects away from `/login` after sign-in

---

### TC-02 — Search for incident type by name (ADO #65701)
*Search the Incident Types (Call Types) list by a known name and confirm it is shown.*

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE to the Incident Types page (`/dynamic/Boxfusion.Ems/incident-types`)
  2. ASSERT (BLOCKING) the **Call Types** grid is displayed
  3. TYPE a known Call Type name (e.g. `Stomach Cramps`) into the search box and trigger the search
  4. ASSERT the matching incident type is displayed in the table
- **Expected result:** Matching incident type is displayed in the table.
- **Assertions:**
  - [x] ASSERT (BLOCKING) the Call Types grid is displayed
  - [x] ASSERT the searched name appears in the results

---

### TC-03 — Search using partial match (ADO #65702)
*Enter part of an incident type name and confirm partial matches are listed.*

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE to the Incident Types page
  2. TYPE a partial name (e.g. `Burn`) into the search box and trigger the search
  3. ASSERT all partially matching incident types are displayed
- **Expected result:** All partially matching incident types are displayed.
- **Assertions:**
  - [x] ASSERT at least one row containing the partial term is shown

---

### TC-04 — Export incident types (ADO #65703)
*Click Export and confirm a download is produced.*

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE to the Incident Types page
  2. CLICK the **Export** button
  3. ASSERT an Excel file with the incident types is downloaded
- **Expected result:** Excel file with all incident types is downloaded.
- **Assertions:**
  - [x] ASSERT (BLOCKING) a file download is triggered by Export

---

### TC-05 — Add new incident type (ADO #65704)
*Add a new incident type. (ADO describes an "Add New" dialog; the live page uses an inline add-row — see plan note.)*

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE to the Incident Types page
  2. CLICK the inline **add** (`plus-circle`) control on the grid's add-row
  3. SELECT a Triage Level, TYPE a Call Type name, and (optionally) a Resolution SLA in the add-row
  4. SAVE the new row
  5. ASSERT the new incident type is added to the table
- **Expected result:** A new incident type is created and appears in the table.
- **Assertions:**
  - [x] ASSERT (BLOCKING) the new incident type appears in the table

---

### TC-06 — View incident type details (ADO #65705)
*Open a record's detail/edit view. (ADO describes a magnifying-glass details view; the live page exposes a per-row edit pencil — see plan note.)*

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE to the Incident Types page
  2. CLICK the row **edit** pencil on the first incident type
  3. ASSERT the record's editable detail view is shown
- **Expected result:** The incident type's detail/edit view opens.
- **Assertions:**
  - [x] ASSERT (BLOCKING) the record's detail/edit view is shown

---

### TC-07 — Return to incident types table (ADO #65706)
*Return from the detail/edit view back to the grid.*

- **Type:** Happy path
- **Steps:**
  1. From the detail/edit view, CLICK Back / Cancel to return to the list
  2. ASSERT the Call Types grid is shown again
- **Expected result:** The user is returned to the incident types table.
- **Assertions:**
  - [x] ASSERT the Call Types grid is displayed again

---

### TC-08 — Edit / Delete incident type (ADO #65707)
*Edit a record, then delete it.*

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE to the Incident Types page
  2. CLICK the row **edit** pencil on a target incident type
  3. ASSERT the edit form/row is displayed
  4. DELETE the incident type (row delete / `close-circle` control)
  5. ASSERT the incident type is removed
- **Expected result:** The record can be edited and then deleted.
- **Assertions:**
  - [x] ASSERT (BLOCKING) the targeted incident type is deleted

---

### TC-09 — Cancel edit form (ADO #65708)
*Open the edit form/row and cancel without saving.*

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE to the Incident Types page
  2. CLICK the row **edit** pencil
  3. CLICK Cancel (cancel the inline edit / form)
  4. ASSERT the edit is closed without saving changes
- **Expected result:** Edit form is closed without saving changes.
- **Assertions:**
  - [x] ASSERT the edit row/form closes with no changes persisted

---

### TC-10 — Save changes to incident type (ADO #65709)
*Edit a record, change a field, and save.*

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE to the Incident Types page
  2. CLICK the row **edit** pencil
  3. MODIFY a field (e.g. Resolution SLA)
  4. SAVE the row
  5. ASSERT the change is saved and reflected in the table
- **Expected result:** Changes are saved and reflected in the table.
- **Assertions:**
  - [x] ASSERT (BLOCKING) the modified value is reflected in the table

---

### TC-11 — Export with no incident types (ADO #65710)
*Edge case: export when no incident types exist — the file should be empty / headers only.*

- **Type:** Edge case
- **Steps:**
  1. NAVIGATE to the Incident Types page
  2. (Precondition) the list is empty — e.g. filter to a term with no matches
  3. CLICK the **Export** button
  4. ASSERT the exported file is empty or contains headers only
- **Expected result:** Exported Excel file is empty or contains headers only.
- **Assertions:**
  - [x] ASSERT (BLOCKING) Export still produces a file when the list is empty

---

## Teardown
- Remove any incident type created during TC-05 (optional for automated runs; the delete in TC-08 covers cleanup of its target).
