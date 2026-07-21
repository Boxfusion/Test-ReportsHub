# Test Plan: ADMIN-2.16 — Shift Assignment

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
| ADO Plan | [#65099](https://dev.azure.com/boxfusion/pd-dispatcher-V2/_testPlans/define?planId=65099&suiteId=65138) |
| ADO Suite | #65138 — 2.16 Shift Assignment (under 2. Administrative Functions) |
| Page | Dispatcher → Management → **Shift Assignments** (`/dynamic/Boxfusion.Dispatcher/dispatch-shift-assignment-table`) |

## Objective
> Validate the Shift Assignment admin area (Administrative Functions 2.16): searching, opening the Add dialog, exporting, viewing details, and the edit/cancel/save flows from both the details view and the index.

## Preconditions
- [ ] App is reachable at the QA URL above
- [ ] Admin credentials are valid (Admin / 123qwe)
- [ ] The signed-in user can reach **Dispatcher → Management → Shift Assignments**

> **Note (2026-06-25, recorded live):** Shift Assignments is a **form-dialog data grid** (columns: *Vehicle Registration, Shift Name, Assignment Date, Shift Start Time, Shift End Time, Region, Station, Crew Leader*) with a quick-search + **search** button, an **Export** button, an **Add New** button (opens the "Add New Shift Assignment" dialog), and per-row **magnifying-glass** + **edit-pencil** links (both route to `/dispatch-shift-assignment-details?id=…`; edit adds `&mode=edit`). Details/edit view actions are toolbar buttons (`.sha-toolbar-btn`): **Back, Edit** (view) and **Back, Cancel Form Edit, Save** (edit) inside `#modalContainerId`. **The edit form has NO free-text field** — it is *Assignment Date (date picker), Shift Name, Region, Station, Vehicle Reg. No, Crews, Crew Leader (all pre-populated selects)*. To honour the "modify a field" step without breaking the cascading select dependencies (Region → Station → Vehicle → Crew), the save cases change the **Assignment Date** (open the picker, pick a different in-view day) — a single-field change that leaves the selects valid.

## Test Cases

### TC-01 — Log in to NC Dispatch
- **Type:** Happy path
- **Steps:** NAVIGATE to /login; TYPE Admin / 123qwe; CLICK Sign In; WAIT for redirect away from `/login`
- **Assertions:**
  - [x] ASSERT (BLOCKING) the app redirects away from `/login`

---

### TC-02 — Search for a shift assignment (ADO #65929)
- **Steps:** NAVIGATE to the Shift Assignments page; TYPE a detail (e.g. `Kimberley`) and trigger the search
- **Assertions:**
  - [x] ASSERT (BLOCKING) the grid is displayed
  - [x] ASSERT at least one matching row is shown

---

### TC-03 — Open Add Shift Assignment dialog (ADO #65930)
- **Steps:** NAVIGATE to the Shift Assignments page; CLICK **Add New**
- **Assertions:**
  - [x] ASSERT (BLOCKING) the "Add New Shift Assignment" create dialog is displayed

---

### TC-04 — Export shift assignments (ADO #65931)
- **Steps:** NAVIGATE to the Shift Assignments page; CLICK **Export**
- **Assertions:**
  - [x] ASSERT (BLOCKING) a file download is triggered by Export

---

### TC-05 — View shift assignment details (ADO #65932)
- **Steps:** CLICK the row **magnifying-glass** icon on the first shift assignment
- **Assertions:**
  - [x] ASSERT (BLOCKING) the details view is shown (URL contains `dispatch-shift-assignment-details`)

---

### TC-06 — Edit shift assignment from details view (ADO #65933)
- **Steps:** Open a shift assignment details view, CLICK **Edit**
- **Assertions:**
  - [x] ASSERT (BLOCKING) the edit view is displayed (Save + Cancel Form Edit available)

---

### TC-07 — Cancel edit in details view (ADO #65934)
- **Steps:** From the edit view, CLICK **Cancel Form Edit**
- **Assertions:**
  - [x] ASSERT the edit view closes without saving

---

### TC-08 — Save edit in details view (ADO #65935)
- **Steps:** Open a shift assignment details view → **Edit**; MODIFY a field (Assignment Date); CLICK **Save**
- **Assertions:**
  - [x] ASSERT (BLOCKING) the edit is saved (returns to view mode)

---

### TC-09 — Edit shift assignment from index (ADO #65936)
- **Steps:** CLICK the row **edit-pencil** icon on the first shift assignment
- **Assertions:**
  - [x] ASSERT (BLOCKING) the edit view is shown (URL contains `mode=edit`, Save available)

---

### TC-10 — Save edit from index edit view (ADO #65937)
- **Steps:** Open a shift assignment edit view via the row edit icon; MODIFY a field (Assignment Date); CLICK **Save**
- **Assertions:**
  - [x] ASSERT (BLOCKING) the edit is saved (returns to view mode)

---

### TC-11 — Cancel edit from index edit view (ADO #65938)
- **Steps:** Open a shift assignment edit view via the row edit icon; CLICK **Cancel Form Edit**
- **Assertions:**
  - [x] ASSERT the edit view closes without saving

---

## Teardown
- No records are created (TC-03 only opens the dialog). Edits in TC-08/TC-10 change the Assignment Date of an existing assignment (minor churn); no destructive delete.
