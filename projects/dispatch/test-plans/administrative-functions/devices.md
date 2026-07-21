# Test Plan: ADMIN-2.11 — Devices

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
| ADO Plan | [#65099](https://dev.azure.com/boxfusion/pd-dispatcher-V2/_testPlans/define?planId=65099&suiteId=65143) |
| ADO Suite | #65143 — 2.11 Devices (under 2. Administrative Functions) |
| Page | Dispatcher → Management → **Devices** (`/dynamic/Boxfusion.Dispatcher/mobile-devices`) |

## Objective
> Validate the Devices admin area (Administrative Functions 2.11): searching, opening the Add dialog, exporting, viewing details, navigating back, and the edit/cancel/save flows from **both** the details view and the row (index) edit icon.

## Preconditions
- [ ] App is reachable at the QA URL above
- [ ] Admin credentials are valid (Admin / 123qwe)
- [ ] The signed-in user can reach **Dispatcher → Management → Devices**

> **Note (2026-06-25, recorded live):** Devices is a **form-dialog data grid** (columns: *Ref No, Name, Model, SIM-Card No, OS, Registration Number*) with a quick-search + **search** button, an **Export** button, an **Add New** button that opens an **"Add New Device"** dialog (fields: *Name\**, *IMEI No\**, *Model\**, *SIM-Card No\**, *Device Operating System\**), a per-row **magnifying-glass** link (details at `/mobile-device-details?id=…`) and a per-row **edit pencil button** (navigates to the edit view — note: a button, not an href, unlike Vehicles). Details/edit view actions are toolbar buttons (`.sha-toolbar-btn`): **Back, Edit, Save, Cancel Form Edit** inside `#modalContainerId`. This suite has no "add with valid data" case (TC-03 only opens the dialog) but covers edit/cancel/save from both the details view and the index.

## Test Cases

### TC-01 — Log in to NC Dispatch
*Authenticate as Admin (auto-prepended).*

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE to https://ncdoh-dispatcher-adminportal-qa.shesha.app/login
  2. TYPE Username `Admin`, Password `123qwe`; CLICK Sign In
  3. WAIT for redirect away from `/login`
- **Assertions:**
  - [x] ASSERT (BLOCKING) the app redirects away from `/login`

---

### TC-02 — Search for a device (ADO #65858)
- **Steps:**
  1. NAVIGATE to the Devices page
  2. ASSERT (BLOCKING) the Devices grid is displayed
  3. TYPE a device detail (e.g. `Galaxy`) into the search box and trigger the search
  4. ASSERT matching devices are displayed
- **Assertions:**
  - [x] ASSERT (BLOCKING) the grid is displayed
  - [x] ASSERT at least one matching row is shown

---

### TC-03 — Open Add Device dialog (ADO #65859)
- **Steps:**
  1. NAVIGATE to the Devices page
  2. CLICK **Add New**
  3. ASSERT the "Add New Device" create dialog appears
- **Assertions:**
  - [x] ASSERT (BLOCKING) the create dialog is displayed

---

### TC-04 — Export devices (ADO #65860)
- **Steps:**
  1. NAVIGATE to the Devices page
  2. CLICK **Export**
  3. ASSERT an Excel file is downloaded
- **Assertions:**
  - [x] ASSERT (BLOCKING) a file download is triggered by Export

---

### TC-05 — View device details (ADO #65861)
- **Steps:**
  1. NAVIGATE to the Devices page
  2. CLICK the row **magnifying-glass** icon on the first device
  3. ASSERT the device details view is shown
- **Assertions:**
  - [x] ASSERT (BLOCKING) the details view is shown (URL contains `mobile-device-details`)

---

### TC-06 — Navigate back from details (ADO #65862)
- **Steps:**
  1. From the details view, CLICK **Back**
  2. ASSERT the Devices grid is shown again
- **Assertions:**
  - [x] ASSERT the grid is displayed again

---

### TC-07 — Edit device from details view (ADO #65863)
- **Steps:**
  1. Open a device details view, CLICK **Edit**
  2. ASSERT the edit view is displayed (Save + Cancel Form Edit available)
- **Assertions:**
  - [x] ASSERT (BLOCKING) the edit view is displayed

---

### TC-08 — Cancel edit in details view (ADO #65864)
- **Steps:**
  1. From the edit view, CLICK **Cancel Form Edit**
  2. ASSERT the edit view closes, no changes saved
- **Assertions:**
  - [x] ASSERT the edit view closes without saving

---

### TC-09 — Save edit in details view (ADO #65865)
- **Steps:**
  1. Open a device details view → **Edit**
  2. MODIFY a field (e.g. Model)
  3. CLICK **Save**
  4. ASSERT the change is saved (returns to view mode)
- **Assertions:**
  - [x] ASSERT (BLOCKING) the edit is saved

---

### TC-10 — Edit device from index (ADO #65866)
- **Steps:**
  1. NAVIGATE to the Devices page
  2. CLICK the row **edit pencil** button on the first device
  3. ASSERT the device edit view is shown
- **Assertions:**
  - [x] ASSERT (BLOCKING) the edit view is shown (Save available)

---

### TC-11 — Save edit from index edit view (ADO #65867)
- **Steps:**
  1. Open a device edit view via the row edit icon
  2. MODIFY a field (e.g. Model)
  3. CLICK **Save**
  4. ASSERT the change is saved and reflected
- **Assertions:**
  - [x] ASSERT (BLOCKING) the edit is saved (returns to view mode)

---

### TC-12 — Cancel edit from index edit view (ADO #65868)
- **Steps:**
  1. Open a device edit view via the row edit icon
  2. CLICK **Cancel Form Edit**
  3. ASSERT the edit view closes, no changes saved
- **Assertions:**
  - [x] ASSERT the edit view closes without saving

---

## Teardown
- No records are created in this suite (TC-03 only opens the dialog). Edits in TC-09/TC-11 append a marker to a free-text field on an existing device (minor churn); no destructive delete.
