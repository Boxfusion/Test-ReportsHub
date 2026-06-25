# Test Plan: ADMIN-2.12 — Resources

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
| ADO Plan | [#65099](https://dev.azure.com/boxfusion/pd-dispatcher-V2/_testPlans/define?planId=65099&suiteId=65142) |
| ADO Suite | #65142 — 2.12 Resources (under 2. Administrative Functions) |
| Page | Dispatcher → Management → **Resources** (`/dynamic/Boxfusion.Ems/resources`) |

## Objective
> Validate the Resources admin area (Administrative Functions 2.12): searching, opening the Add dialog, exporting, viewing details, navigating back, the edit/cancel/save flows from both the details view and the index, and uploading a facial photo.

## Preconditions
- [ ] App is reachable at the QA URL above
- [ ] Admin credentials are valid (Admin / 123qwe)
- [ ] The signed-in user can reach **Dispatcher → Management → Resources**

> **Note (2026-06-25, recorded live):** Resources is a **form-dialog data grid** (columns: *Name, Surname, Username, Email Address, Mobile Number, Position, Skills, Station, Regions*) with a quick-search + **search** button, an **Export** button, an **Add New** button (opens the create dialog), and per-row **magnifying-glass** + **edit-pencil** links (both route to `/resource-details?id=…`; edit adds `&mode=edit`). The grid loads its rows asynchronously (~5-8s). Details/edit view actions are toolbar buttons (`.sha-toolbar-btn`): **Back, Edit, Save, Cancel Form Edit** inside `#modalContainerId`. The details view also has a **"User Facial Photos"** panel with an **Upload** button → file chooser → an **"Edit image"** crop modal (zoom slider) → **OK** adds the photo. Edit form fields: *Name\*, Surname, Email\*, User Name, Mobile Number\*, Position\*, Skill, Region, Station, …*

## Test Cases

### TC-01 — Log in to NC Dispatch
- **Type:** Happy path
- **Steps:** NAVIGATE to /login; TYPE Admin / 123qwe; CLICK Sign In; WAIT for redirect away from `/login`
- **Assertions:**
  - [x] ASSERT (BLOCKING) the app redirects away from `/login`

---

### TC-02 — Search for a resource (ADO #66513)
- **Steps:** NAVIGATE to the Resources page; TYPE a resource detail (e.g. `Paramedic`) and trigger the search
- **Assertions:**
  - [x] ASSERT (BLOCKING) the grid is displayed
  - [x] ASSERT at least one matching row is shown

---

### TC-03 — Open Add Resource dialog (ADO #66514)
- **Steps:** NAVIGATE to the Resources page; CLICK **Add New**
- **Assertions:**
  - [x] ASSERT (BLOCKING) the create dialog ("Create New Record" popup) is displayed

---

### TC-04 — Export resources (ADO #66515)
- **Steps:** NAVIGATE to the Resources page; CLICK **Export**
- **Assertions:**
  - [x] ASSERT (BLOCKING) a file download is triggered by Export

---

### TC-05 — View resource details (ADO #66516)
- **Steps:** CLICK the row **magnifying-glass** icon on the first resource
- **Assertions:**
  - [x] ASSERT (BLOCKING) the details view is shown (URL contains `resource-details`)

---

### TC-06 — Navigate back from details (ADO #66517)
- **Steps:** From the details view, CLICK **Back**
- **Assertions:**
  - [x] ASSERT the Resources grid is shown again

---

### TC-07 — Edit resource from details view (ADO #66518)
- **Steps:** Open a resource details view, CLICK **Edit**
- **Assertions:**
  - [x] ASSERT (BLOCKING) the edit view is displayed (Save + Cancel Form Edit available)

---

### TC-08 — Cancel edit in details view (ADO #66519)
- **Steps:** From the edit view, CLICK **Cancel Form Edit**
- **Assertions:**
  - [x] ASSERT the edit view closes without saving

---

### TC-09 — Save edit in details view (ADO #66520)
- **Steps:** Open a resource details view → **Edit**; MODIFY a field (e.g. Surname); CLICK **Save**
- **Assertions:**
  - [x] ASSERT (BLOCKING) the edit is saved (returns to view mode)

---

### TC-10 — Upload facial photo (ADO #66521)
- **Steps:**
  1. Open a resource details view
  2. CLICK **Upload** in the "User Facial Photos" panel → choose a valid image
  3. In the **"Edit image"** crop modal, CLICK **OK**
  4. ASSERT the image is accepted (crop modal closes / photo shown in the panel)
- **Assertions:**
  - [x] ASSERT (BLOCKING) the image is uploaded (the Edit-image modal closes after OK)

---

### TC-11 — Edit resource from index (ADO #66522)
- **Steps:** CLICK the row **edit-pencil** icon on the first resource
- **Assertions:**
  - [x] ASSERT (BLOCKING) the edit view is shown (URL contains `mode=edit`)

---

### TC-12 — Save edit from index edit view (ADO #66523)
- **Steps:** Open a resource edit view via the row edit icon; MODIFY a field (e.g. Surname); CLICK **Save**
- **Assertions:**
  - [x] ASSERT (BLOCKING) the edit is saved (returns to view mode)

---

### TC-13 — Cancel edit from index edit view (ADO #66524)
- **Steps:** Open a resource edit view via the row edit icon; CLICK **Cancel Form Edit**
- **Assertions:**
  - [x] ASSERT the edit view closes without saving

---

## Teardown
- No records are created (TC-03 only opens the dialog). Edits in TC-09/TC-12 append a marker to the Surname of an existing resource, and TC-10 adds a facial photo to one resource (minor churn); no destructive delete. Test image: `test-data/qa-face.png`.
