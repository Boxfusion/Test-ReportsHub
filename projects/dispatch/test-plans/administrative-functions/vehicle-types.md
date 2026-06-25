# Test Plan: ADMIN-2.5 — Vehicle Types

> **Status:** Ready
> **Owner:** QA
> **Last Updated:** 2026-06-25
> **Estimated Duration:** 330s

## Metadata
| Field | Value |
|-------|-------|
| App URL | https://ncdoh-dispatcher-adminportal-qa.shesha.app/login |
| Environment | QA |
| Login As | Admin / 123qwe |
| ADO Plan | [#65099](https://dev.azure.com/boxfusion/pd-dispatcher-V2/_testPlans/define?planId=65099&suiteId=65148) |
| ADO Suite | #65148 — 2.5 Vehicle Types (under 2. Administrative Functions) |
| Page | Dispatcher → Management → **Vehicle Types** (`/dynamic/Boxfusion.Ems/vehicle-types`) |

## Objective
> Validate the Vehicle Types admin area (Administrative Functions 2.5): searching by name and by description/category, exporting, adding a new vehicle type, viewing a record's details, returning to the table, and the edit (from details view and via the row icon) / cancel / save flows.

## Preconditions
- [ ] App is reachable at the QA URL above
- [ ] Admin credentials are valid (Admin / 123qwe)
- [ ] The signed-in user can reach **Dispatcher → Management → Vehicle Types**

> **Note (2026-06-25, recorded live):** Vehicle Types is a **form-dialog data grid** (columns: *Name*, *Description*, *Skill Type*, *Required On Shift Start*, *Required On Shift End*) with a quick-search box + **search** button, an **Export** button, an **Add New** button that opens an **"Add New Vehicle Type"** dialog, and per-row **magnifying-glass** (details view at `/vehicle-types-detials?id=…`) and **edit pencil** (`…&mode=edit`) links. The Add/Details/Edit flow matches the ADO steps. The create dialog fields are: *Name\**, *Description\**, *Vehicle Type Skill\**, four marker-URL fields (On/Off-Shift × Online/Offline), *Checklist Required On Shift Start/End* toggles, *Vehicle Occupation\**. AntD selects must be filled with real clicks (synthetic events 500 the save).

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

### TC-02 — Search for a vehicle type by name (ADO #65771)
*Search the Vehicle Types list by a known name and confirm matches are shown.*

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE to the Vehicle Types page (`/dynamic/Boxfusion.Ems/vehicle-types`)
  2. ASSERT (BLOCKING) the Vehicle Types grid is displayed
  3. TYPE a known vehicle type name (e.g. `Ambulance`) into the search box and trigger the search
  4. ASSERT matching vehicle types are displayed in the table
- **Expected result:** Matching vehicle types are displayed.
- **Assertions:**
  - [x] ASSERT (BLOCKING) the grid is displayed
  - [x] ASSERT the searched name appears in the results

---

### TC-03 — Search by description or category (ADO #65772)
*Enter a description/category keyword and confirm matches are listed.*

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE to the Vehicle Types page
  2. TYPE a description/category keyword (e.g. `Auto Test`) into the search box and trigger the search
  3. ASSERT matching vehicle types are displayed
- **Expected result:** Matching vehicle types are displayed.
- **Assertions:**
  - [x] ASSERT at least one matching row is shown

---

### TC-04 — Click on 'Add New' button (ADO #65773)
*Open the create dialog from the grid toolbar.*

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE to the Vehicle Types page
  2. CLICK the **Add New** button
  3. ASSERT the "Add New Vehicle Type" create dialog appears
- **Expected result:** The "Create New Record" / "Add New Vehicle Type" dialog appears.
- **Assertions:**
  - [x] ASSERT (BLOCKING) the create dialog is displayed

---

### TC-05 — Add new vehicle type with valid data (ADO #65774)
*Fill all required fields and save; the new vehicle type appears in the table.*

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE to the Vehicle Types page
  2. CLICK the **Add New** button
  3. TYPE a unique Name (e.g. `QA VT <timestamp>`) and Description
  4. SELECT a **Vehicle Type Skill** (e.g. Paramedics) — real click
  5. TYPE the four marker-URL fields
  6. SELECT a **Vehicle Occupation** (e.g. Emergency) — real click
  7. CLICK **OK** to save
  8. SEARCH the new Name and ASSERT it is listed
- **Expected result:** Vehicle type is added and listed in the table (`EmsVehicleType/Crud/Create` 200).
- **Assertions:**
  - [x] ASSERT (BLOCKING) the new vehicle type appears in the table

---

### TC-06 — View vehicle type details (ADO #65775)
*Open a record's details view via the magnifying-glass icon.*

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE to the Vehicle Types page
  2. CLICK the row **magnifying-glass** (search) icon on the first vehicle type
  3. ASSERT the vehicle type details view page is shown
- **Expected result:** Redirected to the vehicle type details view page.
- **Assertions:**
  - [x] ASSERT (BLOCKING) the details view is shown (URL contains `vehicle-types-detials`)

---

### TC-07 — Return to vehicle types table (ADO #65776)
*Return from the details view back to the grid.*

- **Type:** Happy path
- **Steps:**
  1. From the details view, CLICK the **Back** control (or navigate back)
  2. ASSERT the Vehicle Types grid is shown again
- **Expected result:** Redirected to the Vehicle Types table.
- **Assertions:**
  - [x] ASSERT the grid is displayed again

---

### TC-08 — Edit vehicle type from details view (ADO #65777)
*From the details view, open the edit form.*

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE to a vehicle type details view (magnifying-glass)
  2. CLICK the **Edit** button
  3. ASSERT the edit form is displayed (editable fields enabled)
- **Expected result:** Edit form is displayed.
- **Assertions:**
  - [x] ASSERT (BLOCKING) the edit form is displayed

---

### TC-09 — Cancel vehicle type edit (ADO #65778)
*Open the edit form and cancel without saving.*

- **Type:** Happy path
- **Steps:**
  1. From the edit form, CLICK **Cancel Form Edit** (cancel without saving)
  2. ASSERT the edit form closes with no changes persisted
- **Expected result:** Edit form is closed without saving.
- **Assertions:**
  - [x] ASSERT the edit form closes without saving

---

### TC-10 — Save vehicle type edit (ADO #65779)
*Edit a record, change a field, and save.*

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE to a vehicle type edit view
  2. MODIFY a field (e.g. Description)
  3. CLICK **Save**
  4. ASSERT the change is saved and reflected
- **Expected result:** Changes are saved and reflected in the table.
- **Assertions:**
  - [x] ASSERT (BLOCKING) the edit is saved (`EmsVehicleType/Crud/Update` 200 / value reflected)

---

### TC-11 — Edit vehicle type using edit icon (ADO #65780)
*Open the edit view directly from the row edit pencil.*

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE to the Vehicle Types page
  2. CLICK the row **edit pencil** icon on a target vehicle type
  3. ASSERT the vehicle type edit view is shown
- **Expected result:** Redirected to the vehicle type edit view.
- **Assertions:**
  - [x] ASSERT (BLOCKING) the edit view is shown (URL contains `mode=edit`)

---

## Teardown
- The vehicle type created in TC-05 uses a unique timestamped name per run (no collision); optional manual cleanup. No destructive delete is performed in this suite.
