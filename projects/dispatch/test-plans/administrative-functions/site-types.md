# Test Plan: ADMIN-2.7 — Site Types

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
| ADO Plan | [#65099](https://dev.azure.com/boxfusion/pd-dispatcher-V2/_testPlans/define?planId=65099&suiteId=65136) |
| ADO Suite | #65136 — 2.7 Site Types (under 2. Administrative Functions) |
| Page | Dispatcher → Management → **Site Types** (`/dynamic/Boxfusion.Dispatcher/site-types`) |

## Objective
> Validate the Site Types admin area (Administrative Functions 2.7): searching, exporting, and the **inline add-row / edit / save / cancel** flows (this grid is an inline-edit grid, not a form-dialog).

## Preconditions
- [ ] App is reachable at the QA URL above
- [ ] Admin credentials are valid (Admin / 123qwe)
- [ ] The signed-in user can reach **Dispatcher → Management → Site Types**

> **Note (2026-06-25, recorded live):** Site Types is an **inline-edit data grid** (columns: *Levels, Name, Marker Url, Category*) — **NOT** a form-dialog with magnifying-glass/details views like the other admin entities. The toolbar has a quick-search + **search** button and an **Export** button (there is **no "Add New" button** and **no details/edit page**). The **first table row is an always-present inline add-row**: a **Levels** spinbutton, **Name** textbox, **Marker Url** textbox, **Category** spinbutton, plus a **plus-circle** (commit) and **close-circle** (clear) button. Each data row has an **edit pencil**; clicking it turns that row's cells into editable inputs and swaps the pencil for **save** + **close-circle** (cancel) buttons. Committing the empty add-row shows **"This field is required"** on all four fields and blocks submission. The quick-search matches the text columns (Name / Marker Url). Edit/cancel/save tests target **"Savana Hospital"** (a non-canonical seed) to minimise churn on real master data.

## Test Cases

### TC-01 — Log in to NC Dispatch
- **Type:** Happy path
- **Steps:** NAVIGATE to /login; TYPE Admin / 123qwe; CLICK Sign In; WAIT for redirect away from `/login`
- **Assertions:**
  - [x] ASSERT (BLOCKING) the app redirects away from `/login`

---

### TC-02 — Search for a site type by name (ADO #65805)
- **Steps:** NAVIGATE to the Site Types page; TYPE a name (e.g. `Hospital`) and trigger the search
- **Assertions:**
  - [x] ASSERT (BLOCKING) the grid is displayed
  - [x] ASSERT matching site types are displayed

---

### TC-03 — Search by category or level (ADO #65806)
- **Steps:** NAVIGATE to the Site Types page; TYPE a representative term (e.g. `Clinic`) and trigger the search
- **Note:** The single quick-search box matches the text columns (Name / Marker Url); it can't isolate the numeric Category/Level columns, so a representative category term (`Clinic`) is used (plan-correction).
- **Assertions:**
  - [x] ASSERT (BLOCKING) matching site types are filtered and displayed

---

### TC-04 — Export site types (ADO #65807)
- **Steps:** NAVIGATE to the Site Types page; CLICK **Export**
- **Assertions:**
  - [x] ASSERT (BLOCKING) a file download is triggered by Export

---

### TC-05 — Attempt to add site type with missing fields (ADO #65808)
- **Steps:** Leave the inline add-row fields empty; CLICK the **plus-circle** (commit) control
- **Assertions:**
  - [x] ASSERT (BLOCKING) the system shows a validation error ("This field is required") and prevents submission

---

### TC-06 — Add new site type (ADO #65809)
- **Steps:** Fill the add-row **Levels**, **Name** (unique), **Marker Url**, **Category**; CLICK **plus-circle**; search the new name
- **Assertions:**
  - [x] ASSERT (BLOCKING) the new site type is added to the list (appears on search)

---

### TC-07 — Cancel site type addition (ADO #65810)
- **Steps:** Type into the add-row fields; CLICK the **close-circle** (clear) control
- **Assertions:**
  - [x] ASSERT the entered fields are cleared and nothing is added (add-row Name textbox is empty again)

---

### TC-08 — Edit existing site type (ADO #65811)
- **Steps:** Search `Savana`; CLICK the row's **edit pencil**
- **Assertions:**
  - [x] ASSERT (BLOCKING) the row's fields become editable (Save + Cancel controls shown)

---

### TC-09 — Save edited site type (ADO #65812)
- **Steps:** Search `Savana`; edit the row; MODIFY the Name; CLICK **save**
- **Assertions:**
  - [x] ASSERT (BLOCKING) the change is saved and reflected (row returns to read mode)

---

### TC-10 — Edit and cancel changes (ADO #65813)
- **Steps:** Search `Savana`; edit the row; type a change; CLICK **close-circle** (cancel) without saving
- **Assertions:**
  - [x] ASSERT the original data remains unchanged (row returns to read mode, edit pencil shown)

---

### TC-11 — Export with no site types (ADO #65814)
- **Steps:** Search a term with no matches (forcing an empty grid); CLICK **Export**
- **Note:** The system always contains seed site types, so a no-match search is used to drive the empty-list path (plan-correction — the true "no site types exist" precondition can't be met non-destructively).
- **Assertions:**
  - [x] ASSERT (BLOCKING) Export still produces a file when the list is empty

---

## Teardown
- TC-06 adds one uniquely-named site type (left in place; harmless). TC-09 appends a marker to the Name of "Savana Hospital" (minor churn on a non-canonical seed). No destructive delete.
