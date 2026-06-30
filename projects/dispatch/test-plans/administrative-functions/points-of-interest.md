# Test Plan: ADMIN-2.9 — Points of Interest

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
| ADO Plan | [#65099](https://dev.azure.com/boxfusion/pd-dispatcher-V2/_testPlans/define?planId=65099&suiteId=65145) |
| ADO Suite | #65145 — 2.9 Points of Interest (under 2. Administrative Functions) |
| Page | Dispatcher → Management → **Points of Interest** (`/dynamic/Boxfusion.Ems/emergency-site`) |

## Objective
> Validate the Points of Interest admin area (Administrative Functions 2.9): searching, opening the Add dialog, exporting, viewing details, navigating back, and the edit/cancel/save flows from both the details view and the index.

## Preconditions
- [ ] App is reachable at the QA URL above
- [ ] Admin credentials are valid (Admin / 123qwe)
- [ ] The signed-in user can reach **Dispatcher → Management → Points of Interest**

> **Note (2026-06-25, recorded live):** Points of Interest is a **form-dialog data grid** (heading "Points of Interest") with a quick-search + **search** button, an **Export** button, an **Add New** button (opens the "Add New Point of Interest" dialog), and per-row **magnifying-glass** + **edit-pencil** links (both route to `/emergency-site-details?id=…`; edit adds `&mode=edit`). The grid loads its rows asynchronously. Details/edit view actions are toolbar buttons (`.sha-toolbar-btn`): **Back, Edit** (view) and **Back, Cancel Form Edit, Save** (edit) inside `#modalContainerId`. Edit form fields: *Name\* (free text, pre-populated), Point Of Interest Type\* (select, pre-populated), Site Type\* (select, pre-populated), Address, Region\* (select, pre-populated), Marker Url, Contact Number\* (text, pre-populated), Specialities\* (select, pre-populated)*. **Name** is the free-text field tweaked for the save/cancel cases (all required selects are pre-populated, so Save succeeds without re-supplying them).

## Test Cases

### TC-01 — Log in to NC Dispatch
- **Type:** Happy path
- **Steps:** NAVIGATE to /login; TYPE Admin / 123qwe; CLICK Sign In; WAIT for redirect away from `/login`
- **Assertions:**
  - [x] ASSERT (BLOCKING) the app redirects away from `/login`

---

### TC-02 — Search POI by any detail (ADO #65822)
- **Steps:** NAVIGATE to the Points of Interest page; TYPE a keyword (e.g. `Public`) and trigger the search
- **Assertions:**
  - [x] ASSERT (BLOCKING) the grid is displayed
  - [x] ASSERT matching POIs are filtered and displayed

---

### TC-03 — Add new POI (ADO #65823)
- **Steps:** NAVIGATE to the Points of Interest page; CLICK **Add New**
- **Assertions:**
  - [x] ASSERT (BLOCKING) the "Add New Point of Interest" create dialog is displayed

---

### TC-04 — Export POIs (ADO #65824)
- **Steps:** NAVIGATE to the Points of Interest page; CLICK **Export**
- **Assertions:**
  - [x] ASSERT (BLOCKING) a file download is triggered by Export

---

### TC-05 — View POI details (ADO #65825)
- **Steps:** CLICK the row **magnifying-glass** icon on the first POI
- **Assertions:**
  - [x] ASSERT (BLOCKING) the details view is shown (URL contains `emergency-site-details`)

---

### TC-06 — Navigate back from details (ADO #65826)
- **Steps:** From the details view, CLICK **Back**
- **Assertions:**
  - [x] ASSERT the POI index table is shown again

---

### TC-07 — Edit POI from details view (ADO #65827)
- **Steps:** Open a POI details view, CLICK **Edit**
- **Assertions:**
  - [x] ASSERT (BLOCKING) the edit view is displayed (Save + Cancel Form Edit available)

---

### TC-08 — Cancel edit in details view (ADO #65828)
- **Steps:** From the edit view, CLICK **Cancel Form Edit**
- **Assertions:**
  - [x] ASSERT the edit view closes without saving

---

### TC-09 — Save edit in details view (ADO #65829)
- **Steps:** Open a POI details view → **Edit**; MODIFY a field (Name); CLICK **Save**
- **Assertions:**
  - [x] ASSERT (BLOCKING) the edit is saved (returns to view mode)

---

### TC-10 — Edit POI from index (ADO #65830)
- **Steps:** CLICK the row **edit-pencil** icon on the first POI
- **Assertions:**
  - [x] ASSERT (BLOCKING) the edit view is shown (URL contains `mode=edit`, Save available)

---

### TC-11 — Save edit from index edit view (ADO #65831)
- **Steps:** Open a POI edit view via the row edit icon; MODIFY a field (Name); CLICK **Save**
- **Assertions:**
  - [x] ASSERT (BLOCKING) the edit is saved (returns to view mode)

---

### TC-12 — Cancel edit from index edit view (ADO #65832)
- **Steps:** Open a POI edit view via the row edit icon; CLICK **Cancel Form Edit**
- **Assertions:**
  - [x] ASSERT the edit view closes without saving

---

## Teardown
- No records are created (TC-03 only opens the dialog). Edits in TC-09/TC-11 append a marker to the Name of an existing POI (minor churn); no destructive delete.
