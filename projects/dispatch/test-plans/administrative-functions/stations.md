# Test Plan: ADMIN-2.10 — Stations

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
| ADO Plan | [#65099](https://dev.azure.com/boxfusion/pd-dispatcher-V2/_testPlans/define?planId=65099&suiteId=65144) |
| ADO Suite | #65144 — 2.10 Stations (under 2. Administrative Functions) |
| Page | Dispatcher → Management → **Stations** (`/dynamic/Boxfusion.Dispatcher/dispatch-base`) |

## Objective
> Validate the Stations admin area (Administrative Functions 2.10): displaying the grid, searching, opening the Add dialog, exporting, viewing details, navigating back, and the edit/cancel/save flows from both the details view and the index.

## Preconditions
- [ ] App is reachable at the QA URL above
- [ ] Admin credentials are valid (Admin / 123qwe)
- [ ] The signed-in user can reach **Dispatcher → Management → Stations**

> **Note (2026-06-25, recorded live):** Stations is a **form-dialog data grid** (columns: *Name, Address, Region, Contact Number*) with a quick-search + **search** button, an **Export** button, an **Add New** button (opens the "Add New Station" dialog), and per-row **magnifying-glass** + **edit-pencil** links (both route to `/dispatch-base-details?id=…`; edit adds `&mode=edit`). The grid loads its rows asynchronously. Details/edit view actions are toolbar buttons (`.sha-toolbar-btn`): **Back, Edit** (view) and **Back, Cancel Form Edit, Save** (edit) inside `#modalContainerId`. Edit form fields: *Station Name\* (free text, pre-populated), Region\* (select, pre-populated), Contact Number, Parent Dispatch Area, Address, Latitude, Longitude*. **Station Name** is the free-text field tweaked for the save/cancel cases.

## Test Cases

### TC-01 — Log in to NC Dispatch
- **Type:** Happy path
- **Steps:** NAVIGATE to /login; TYPE Admin / 123qwe; CLICK Sign In; WAIT for redirect away from `/login`
- **Assertions:**
  - [x] ASSERT (BLOCKING) the app redirects away from `/login`

---

### TC-02 — Display all stations (ADO #65841)
- **Steps:** NAVIGATE to the Stations page
- **Assertions:**
  - [x] ASSERT (BLOCKING) all stations are displayed in a table (grid + at least one row visible)

---

### TC-03 — Search for a station (ADO #65842)
- **Steps:** NAVIGATE to the Stations page; TYPE a station detail (e.g. `EMS`) and trigger the search
- **Assertions:**
  - [x] ASSERT (BLOCKING) the grid is displayed
  - [x] ASSERT at least one matching row is shown

---

### TC-04 — Add new station (ADO #65843)
- **Steps:** NAVIGATE to the Stations page; CLICK **Add New**
- **Assertions:**
  - [x] ASSERT (BLOCKING) the "Add New Station" create dialog is displayed

---

### TC-05 — Export stations (ADO #65844)
- **Steps:** NAVIGATE to the Stations page; CLICK **Export**
- **Assertions:**
  - [x] ASSERT (BLOCKING) a file download is triggered by Export

---

### TC-06 — View station details (ADO #65845)
- **Steps:** CLICK the row **magnifying-glass** icon on the first station
- **Assertions:**
  - [x] ASSERT (BLOCKING) the details view is shown (URL contains `dispatch-base-details`)

---

### TC-07 — Navigate back from details (ADO #65846)
- **Steps:** From the details view, CLICK **Back**
- **Assertions:**
  - [x] ASSERT the Stations grid is shown again

---

### TC-08 — Edit station from details view (ADO #65847)
- **Steps:** Open a station details view, CLICK **Edit**
- **Assertions:**
  - [x] ASSERT (BLOCKING) the edit view is displayed (Save + Cancel Form Edit available)

---

### TC-09 — Cancel edit in details view (ADO #65848)
- **Steps:** From the edit view, CLICK **Cancel Form Edit**
- **Assertions:**
  - [x] ASSERT the edit view closes without saving

---

### TC-10 — Save edit in details view (ADO #65849)
- **Steps:** Open a station details view → **Edit**; MODIFY a field (Station Name); CLICK **Save**
- **Assertions:**
  - [x] ASSERT (BLOCKING) the edit is saved (returns to view mode)

---

### TC-11 — Edit station from index (ADO #65850)
- **Steps:** CLICK the row **edit-pencil** icon on the first station
- **Assertions:**
  - [x] ASSERT (BLOCKING) the edit view is shown (URL contains `mode=edit`, Save available)

---

### TC-12 — Save edit from index edit view (ADO #65851)
- **Steps:** Open a station edit view via the row edit icon; MODIFY a field (Station Name); CLICK **Save**
- **Assertions:**
  - [x] ASSERT (BLOCKING) the edit is saved (returns to view mode)

---

### TC-13 — Cancel edit from index edit view (ADO #65852)
- **Steps:** Open a station edit view via the row edit icon; CLICK **Cancel Form Edit**
- **Assertions:**
  - [x] ASSERT the edit view closes without saving

---

## Teardown
- No records are created (TC-04 only opens the dialog). Edits in TC-10/TC-12 append a marker to the Station Name of an existing station (minor churn); no destructive delete.
