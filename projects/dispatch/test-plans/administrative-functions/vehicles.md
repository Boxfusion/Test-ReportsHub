# Test Plan: ADMIN-2.4 — Vehicles

> **Status:** Ready
> **Owner:** QA
> **Last Updated:** 2026-06-25
> **Estimated Duration:** 360s

## Metadata
| Field | Value |
|-------|-------|
| App URL | https://ncdoh-dispatcher-adminportal-qa.shesha.app/login |
| Environment | QA |
| Login As | Admin / 123qwe |
| ADO Plan | [#65099](https://dev.azure.com/boxfusion/pd-dispatcher-V2/_testPlans/define?planId=65099&suiteId=65149) |
| ADO Suite | #65149 — 2.4 Vehicles (under 2. Administrative Functions) |
| Page | Dispatcher → Management → **Vehicles** (`/dynamic/Boxfusion.Ems/vehicles`) |

## Objective
> Validate the Vehicles admin area (Administrative Functions 2.4): searching by registration and by vehicle type/station, exporting, adding a new vehicle, viewing details, returning to the table, and the edit (from details view and via the row icon) / cancel / save flows.

## Preconditions
- [ ] App is reachable at the QA URL above
- [ ] Admin credentials are valid (Admin / 123qwe)
- [ ] The signed-in user can reach **Dispatcher → Management → Vehicles**

> **Note (2026-06-25, recorded live):** Vehicles is a **form-dialog data grid** (columns: *Vehicle Registration, Odometer Reading, Odometer Reading Date, Vehicle Resource Type, Driver Skill Type, Status, Station, Region*) with a quick-search + **search** button, an **Export** button, an **Add New** button that opens an **"Add New Vehicle"** dialog, and per-row **magnifying-glass** (details at `/vehicle-details?id=…`) and **edit pencil** (`…&mode=edit`) links. Details/edit view actions are toolbar buttons (`.sha-toolbar-btn`): **Back**, **Edit**, **Save**, **Cancel Form Edit**. The create dialog's mandatory fields: *Vehicle Registration\**, *Odometer Reading\**, *Odometer Reading Date\**, *Vehicle Type\**, *Driver Skill Type\**, *Station\**, *Vehicle Status\**, *Vehicle Capacity\** (plus optional *Resource Type*, *Device Installed?* → *Device IMEI No*, *Location Tracker Id*). AntD selects filled with real clicks.

## Test Cases

### TC-01 — Log in to NC Dispatch
*Authenticate as Admin and reach the landing page (auto-prepended).*

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE to https://ncdoh-dispatcher-adminportal-qa.shesha.app/login
  2. SNAPSHOT — confirm the login page is visible
  3. TYPE Username with `Admin`
  4. TYPE Password with `123qwe`
  5. CLICK Sign In
  6. WAIT for redirect away from `/login`
- **Expected result:** Valid credentials sign the user in.
- **Assertions:**
  - [x] ASSERT (BLOCKING) the app redirects away from `/login`

---

### TC-02 — Search for a vehicle by registration number (ADO #65739)
- **Type:** Happy path
- **Steps:**
  1. NAVIGATE to the Vehicles page (`/dynamic/Boxfusion.Ems/vehicles`)
  2. ASSERT (BLOCKING) the Vehicles grid is displayed
  3. TYPE a full/partial registration (e.g. `NC`) into the search box and trigger the search
  4. ASSERT matching vehicle(s) are displayed
- **Expected result:** Matching vehicle(s) are displayed.
- **Assertions:**
  - [x] ASSERT (BLOCKING) the grid is displayed
  - [x] ASSERT at least one matching row is shown

---

### TC-03 — Search by vehicle type or station (ADO #65740)
- **Type:** Happy path
- **Steps:**
  1. NAVIGATE to the Vehicles page
  2. TYPE a vehicle type or station keyword (e.g. `Kimberley`) and trigger the search
  3. ASSERT matching vehicles are displayed
- **Expected result:** Matching vehicles are displayed.
- **Assertions:**
  - [x] ASSERT at least one matching row is shown

---

### TC-04 — Click on 'Add New' button (ADO #65741)
- **Type:** Happy path
- **Steps:**
  1. NAVIGATE to the Vehicles page
  2. CLICK the **Add New** button
  3. ASSERT the "Add New Vehicle" create dialog appears
- **Expected result:** The "Create New Record" / "Add New Vehicle" dialog appears.
- **Assertions:**
  - [x] ASSERT (BLOCKING) the create dialog is displayed

---

### TC-05 — Add new vehicle with valid data (ADO #65742)
- **Type:** Happy path
- **Steps:**
  1. NAVIGATE to the Vehicles page
  2. CLICK **Add New**
  3. TYPE a unique Vehicle Registration (e.g. `QAV<timestamp>`), Odometer Reading, Odometer Reading Date (today)
  4. SELECT Vehicle Type, Driver Skill Type, Station, Vehicle Status (real clicks)
  5. TYPE Vehicle Capacity
  6. CLICK **OK** to save
  7. SEARCH the new registration and ASSERT it is listed
- **Expected result:** Vehicle is added and listed in the table.
- **Assertions:**
  - [x] ASSERT (BLOCKING) the new vehicle appears in the table

---

### TC-06 — View vehicle details (ADO #65743... magnifying glass)
*ADO #65744 — open a vehicle's details via the magnifying-glass icon.*

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE to the Vehicles page
  2. CLICK the row **magnifying-glass** icon on the first vehicle
  3. ASSERT the vehicle details view page is shown
- **Expected result:** Redirected to the vehicle details view page.
- **Assertions:**
  - [x] ASSERT (BLOCKING) the details view is shown (URL contains `vehicle-details`)

---

### TC-07 — Return to vehicle list from details view (ADO #65745)
- **Type:** Happy path
- **Steps:**
  1. From the details view, CLICK **Back**
  2. ASSERT the Vehicles grid is shown again
- **Expected result:** Redirected to the Vehicles table.
- **Assertions:**
  - [x] ASSERT the grid is displayed again

---

### TC-08 — Edit vehicle from details view (ADO #65746)
- **Type:** Happy path
- **Steps:**
  1. NAVIGATE to a vehicle details view (magnifying-glass)
  2. CLICK **Edit**
  3. ASSERT the edit form is displayed (Save + Cancel Form Edit available)
- **Expected result:** Edit form is displayed.
- **Assertions:**
  - [x] ASSERT (BLOCKING) the edit form is displayed

---

### TC-09 — Cancel vehicle edit (ADO #65747)
- **Type:** Happy path
- **Steps:**
  1. From the edit form, CLICK **Cancel Form Edit**
  2. ASSERT the edit form closes without saving
- **Expected result:** Edit form is closed without saving.
- **Assertions:**
  - [x] ASSERT the edit form closes without saving

---

### TC-10 — Save vehicle edit (ADO #65748)
- **Type:** Happy path
- **Steps:**
  1. NAVIGATE to a vehicle edit view
  2. MODIFY a field (e.g. Odometer Reading)
  3. CLICK **Save**
  4. ASSERT the change is saved and reflected
- **Expected result:** Changes are saved and reflected in the table.
- **Assertions:**
  - [x] ASSERT (BLOCKING) the edit is saved (returns to view mode)

---

### TC-11 — Edit vehicle using edit icon (ADO #65749)
- **Type:** Happy path
- **Steps:**
  1. NAVIGATE to the Vehicles page
  2. CLICK the row **edit pencil** icon on a target vehicle
  3. ASSERT the vehicle edit view is shown
- **Expected result:** Redirected to the vehicle edit view.
- **Assertions:**
  - [x] ASSERT (BLOCKING) the edit view is shown (URL contains `mode=edit`)

---

## Teardown
- The vehicle created in TC-05 uses a unique timestamped registration per run (no collision); optional manual cleanup. No destructive delete is performed.
