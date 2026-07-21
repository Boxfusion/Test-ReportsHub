# Test Plan: ADMIN-2.13 — Crews

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
| ADO Plan | [#65099](https://dev.azure.com/boxfusion/pd-dispatcher-V2/_testPlans/define?planId=65099&suiteId=65141) |
| ADO Suite | #65141 — 2.13 Crews (under 2. Administrative Functions) |
| Page | Dispatcher → Management → **Crews** (`/dynamic/Boxfusion.Ems/EmsDispatchTeam-Table`) |

## Objective
> Validate the Crews admin area (Administrative Functions 2.13): searching, opening the Add dialog, exporting, viewing details, and the edit/cancel/save flows from both the details view and the index.

## Preconditions
- [ ] App is reachable at the QA URL above
- [ ] Admin credentials are valid (Admin / 123qwe)
- [ ] The signed-in user can reach **Dispatcher → Management → Crews**

> **Note (2026-06-25, recorded live):** Crews ("All Crews") is a **form-dialog data grid** (columns: *Crew Number, Crew Members, Crew Skill Type, Crew Station*) with a quick-search + **search** button, an **Export** button, an **Add New** button (opens the "Add New Crew" dialog — AntD selects must be filled with REAL clicks, synthetic events 500 the save), and a per-row **magnifying-glass** link to `/EMSDispatchTeam-Details-View?id=…`. **There is no row edit-pencil** — the "edit from index" view is reached by the details URL + `&mode=edit`. The grid is very large (~13k rows) and loads slowly. Details/edit view actions are toolbar buttons (`.sha-toolbar-btn`): **Back, Edit, Save, Cancel Form Edit** inside `#modalContainerId`. Edit form: *Crew Station\*, Crew Number\*, Crew Members\*, Crew Skill Type\** (Crew Number is the only free-text field).

## Test Cases

### TC-01 — Log in to NC Dispatch
- **Steps:** NAVIGATE to /login; TYPE Admin / 123qwe; CLICK Sign In; WAIT for redirect away from `/login`
- **Assertions:**
  - [x] ASSERT (BLOCKING) the app redirects away from `/login`

---

### TC-02 — Search for a crew (ADO #65881)
- **Steps:** NAVIGATE to the Crews page; TYPE a crew detail (e.g. `QA-CREW`) and trigger the search
- **Assertions:**
  - [x] ASSERT (BLOCKING) the grid is displayed
  - [x] ASSERT at least one matching row is shown

---

### TC-03 — Open Add Crew dialog (ADO #65882)
- **Steps:** NAVIGATE to the Crews page; CLICK **Add New**
- **Assertions:**
  - [x] ASSERT (BLOCKING) the "Add New Crew" create dialog is displayed

---

### TC-04 — Export crews (ADO #65883)
- **Steps:** NAVIGATE to the Crews page; CLICK **Export**
- **Assertions:**
  - [x] ASSERT (BLOCKING) a file download is triggered by Export

---

### TC-05 — View crew details (ADO #65884)
- **Steps:** CLICK the row **magnifying-glass** icon on the first crew
- **Assertions:**
  - [x] ASSERT (BLOCKING) the details view is shown (URL contains `EMSDispatchTeam-Details-View`)

---

### TC-06 — Edit crew from details view (ADO #65885)
- **Steps:** Open a crew details view, CLICK **Edit**
- **Assertions:**
  - [x] ASSERT (BLOCKING) the edit view is displayed (Save + Cancel Form Edit available)

---

### TC-07 — Cancel edit in details view (ADO #65886)
- **Steps:** From the edit view, CLICK **Cancel Form Edit**
- **Assertions:**
  - [x] ASSERT the edit view closes without saving

---

### TC-08 — Save edit in details view (ADO #65887)
- **Steps:** Open a crew details view → **Edit**; MODIFY a field (Crew Number); CLICK **Save**
- **Assertions:**
  - [x] ASSERT (BLOCKING) the edit is saved (returns to view mode)

---

### TC-09 — Edit crew from index (ADO #65888)
- **Steps:** Open the first crew's edit view via the details URL + `mode=edit` (no row edit-pencil exists)
- **Assertions:**
  - [x] ASSERT (BLOCKING) the edit view is shown (URL contains `mode=edit`, Save available)

---

### TC-10 — Save edit from index edit view (ADO #65889)
- **Steps:** Open a crew edit view; MODIFY a field (Crew Number); CLICK **Save**
- **Assertions:**
  - [x] ASSERT (BLOCKING) the edit is saved (returns to view mode)

---

### TC-11 — Cancel edit from index edit view (ADO #65890)
- **Steps:** Open a crew edit view; CLICK **Cancel Form Edit**
- **Assertions:**
  - [x] ASSERT the edit view closes without saving

---

## Teardown
- No records are created (TC-03 only opens the dialog). Edits in TC-08/TC-10 append a marker to the Crew Number of an existing crew (minor churn); no destructive delete.
