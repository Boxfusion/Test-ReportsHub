# Test Plan: ADMIN-2.15 — Shifts

> **Status:** Ready
> **Owner:** QA
> **Last Updated:** 2026-06-25
> **Estimated Duration:** 300s

## Metadata
| Field | Value |
|-------|-------|
| App URL | https://ncdoh-dispatcher-adminportal-qa.shesha.app/login |
| Environment | QA |
| Login As | Admin / 123qwe |
| ADO Plan | [#65099](https://dev.azure.com/boxfusion/pd-dispatcher-V2/_testPlans/define?planId=65099&suiteId=65139) |
| ADO Suite | #65139 — 2.15 Shifts (under 2. Administrative Functions) |
| Page | Dispatcher → Management → **Shifts** (`/dynamic/boxfusion.shiftmanagement/shift-table`) |

## Objective
> Validate the Shifts admin area (Administrative Functions 2.15): searching, opening the Add dialog, exporting, viewing details, and the edit/cancel/save flows from both the details view and the index.

## Preconditions
- [ ] App is reachable at the QA URL above
- [ ] Admin credentials are valid (Admin / 123qwe)
- [ ] The signed-in user can reach **Dispatcher → Management → Shifts**

> **Note (2026-06-25, recorded live):** Shifts ("All Shifts") is a **form-dialog data grid** in the `boxfusion.shiftmanagement` module, with a quick-search + **search** button, an **Export** button, an **Add New** button (opens the "Add New Shift" dialog), and per-row **magnifying-glass** + **edit-pencil** links (both route to `/shifts-details-view?id=…`; edit adds `&mode=edit`). The grid loads its rows asynchronously. Details/edit view actions are toolbar buttons (`.sha-toolbar-btn`): **Back, Edit** (view) and **Back, Cancel Form Edit, Save** (edit) inside `#modalContainerId`. Edit form fields: *Shift Name\* (free text, pre-populated), Shift Category\* (select, pre-populated), Shift Start Time\*, Shift End Time\**. **Shift Name** is the free-text field tweaked for the save/cancel cases (Shift Category is pre-populated, so Save succeeds without re-supplying it).

## Test Cases

### TC-01 — Log in to NC Dispatch
- **Type:** Happy path
- **Steps:** NAVIGATE to /login; TYPE Admin / 123qwe; CLICK Sign In; WAIT for redirect away from `/login`
- **Assertions:**
  - [x] ASSERT (BLOCKING) the app redirects away from `/login`

---

### TC-02 — Search for a shift (ADO #65914)
- **Steps:** NAVIGATE to the Shifts page; TYPE a shift detail (e.g. `Shift`) and trigger the search
- **Assertions:**
  - [x] ASSERT (BLOCKING) the grid is displayed
  - [x] ASSERT at least one matching row is shown

---

### TC-03 — Open Add Shift dialog (ADO #65915)
- **Steps:** NAVIGATE to the Shifts page; CLICK **Add New**
- **Assertions:**
  - [x] ASSERT (BLOCKING) the "Add New Shift" create dialog is displayed

---

### TC-04 — Export shifts (ADO #65916)
- **Steps:** NAVIGATE to the Shifts page; CLICK **Export**
- **Assertions:**
  - [x] ASSERT (BLOCKING) a file download is triggered by Export

---

### TC-05 — View shift details (ADO #65917)
- **Steps:** CLICK the row **magnifying-glass** icon on the first shift
- **Assertions:**
  - [x] ASSERT (BLOCKING) the details view is shown (URL contains `shifts-details-view`)

---

### TC-06 — Edit shift from details view (ADO #65918)
- **Steps:** Open a shift details view, CLICK **Edit**
- **Assertions:**
  - [x] ASSERT (BLOCKING) the edit view is displayed (Save + Cancel Form Edit available)

---

### TC-07 — Cancel edit in details view (ADO #65919)
- **Steps:** From the edit view, CLICK **Cancel Form Edit**
- **Assertions:**
  - [x] ASSERT the edit view closes without saving

---

### TC-08 — Save edit in details view (ADO #65920)
- **Steps:** Open a shift details view → **Edit**; MODIFY a field (Shift Name); CLICK **Save**
- **Assertions:**
  - [x] ASSERT (BLOCKING) the edit is saved (returns to view mode)

---

### TC-09 — Edit shift from index (ADO #65921)
- **Steps:** CLICK the row **edit-pencil** icon on the first shift
- **Assertions:**
  - [x] ASSERT (BLOCKING) the edit view is shown (URL contains `mode=edit`, Save available)

---

### TC-10 — Save edit from index edit view (ADO #65922)
- **Steps:** Open a shift edit view via the row edit icon; MODIFY a field (Shift Name); CLICK **Save**
- **Assertions:**
  - [x] ASSERT (BLOCKING) the edit is saved (returns to view mode)

---

### TC-11 — Cancel edit from index edit view (ADO #65923)
- **Steps:** Open a shift edit view via the row edit icon; CLICK **Cancel Form Edit**
- **Assertions:**
  - [x] ASSERT the edit view closes without saving

---

## Teardown
- No records are created (TC-03 only opens the dialog). Edits in TC-08/TC-10 append a marker to the Shift Name of an existing shift (minor churn); no destructive delete.
