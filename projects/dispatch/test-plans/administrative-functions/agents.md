# Test Plan: ADMIN-2.14 — Agents

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
| ADO Plan | [#65099](https://dev.azure.com/boxfusion/pd-dispatcher-V2/_testPlans/define?planId=65099&suiteId=65140) |
| ADO Suite | #65140 — 2.14 Agents (under 2. Administrative Functions) |
| Page | Dispatcher → Management → **Agents** (`/dynamic/Boxfusion.Dispatcher/agent-roles-table`) |

## Objective
> Validate the Agents admin area (Administrative Functions 2.14): searching, opening the Add dialog, exporting, viewing details, and the edit/cancel/save flows from **both** the details view and the row (index) edit icon.

## Preconditions
- [ ] App is reachable at the QA URL above
- [ ] Admin credentials are valid (Admin / 123qwe)
- [ ] The signed-in user can reach **Dispatcher → Management → Agents**

> **Note (2026-06-25, recorded live):** Agents ("All Agents") is a **form-dialog data grid** (columns: *Name, Surname, Roles, Username, Email Address, Mobile Number*) with a quick-search + **search** button, an **Export** button, an **Add New** button that opens an **"Add New Agent"** dialog, and per-row **magnifying-glass** + **edit-pencil** links (both route to `/agent-roles-detailsV2?id=…`; the edit pencil adds `&mode=edit`). Details/edit view actions are toolbar buttons (`.sha-toolbar-btn`): **Back, Edit, Save, Cancel Form Edit** inside `#modalContainerId`. The agent edit form fields: *Name\*, Surname\*, Mobile Number\*, Email Address\*, Username, Roles\*, Regions\*, Station\**. This suite has no "add with valid data" case (TC-03 only opens the dialog) and no "navigate back" case; it covers edit/cancel/save from both the details view and the index. (Agent creation itself is covered live + in `admin-functions-crud` "Add Agent".)

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

### TC-02 — Search for an agent (ADO #65898)
- **Steps:**
  1. NAVIGATE to the Agents page
  2. ASSERT (BLOCKING) the Agents grid is displayed
  3. TYPE an agent detail (e.g. `Auto`) and trigger the search
  4. ASSERT matching agents are displayed
- **Assertions:**
  - [x] ASSERT (BLOCKING) the grid is displayed
  - [x] ASSERT at least one matching row is shown

---

### TC-03 — Open Add Agent dialog (ADO #65899)
- **Steps:**
  1. NAVIGATE to the Agents page
  2. CLICK **Add New**
  3. ASSERT the "Add New Agent" create dialog appears
- **Assertions:**
  - [x] ASSERT (BLOCKING) the create dialog is displayed

---

### TC-04 — Export agents (ADO #65900)
- **Steps:**
  1. NAVIGATE to the Agents page
  2. CLICK **Export**
  3. ASSERT an Excel file is downloaded
- **Assertions:**
  - [x] ASSERT (BLOCKING) a file download is triggered by Export

---

### TC-05 — View agent details (ADO #65901)
- **Steps:**
  1. NAVIGATE to the Agents page
  2. CLICK the row **magnifying-glass** icon on the first agent
  3. ASSERT the agent details view is shown
- **Assertions:**
  - [x] ASSERT (BLOCKING) the details view is shown (URL contains `agent-roles-detailsV2`)

---

### TC-06 — Edit agent from details view (ADO #65902)
- **Steps:**
  1. Open an agent details view, CLICK **Edit**
  2. ASSERT the edit view is displayed (Save + Cancel Form Edit available)
- **Assertions:**
  - [x] ASSERT (BLOCKING) the edit view is displayed

---

### TC-07 — Cancel edit in details view (ADO #65903)
- **Steps:**
  1. From the edit view, CLICK **Cancel Form Edit**
  2. ASSERT the edit view closes, no changes saved
- **Assertions:**
  - [x] ASSERT the edit view closes without saving

---

### TC-08 — Save edit in details view (ADO #65904)
- **Steps:**
  1. Open an agent details view → **Edit**
  2. MODIFY a field (e.g. Surname)
  3. CLICK **Save**
  4. ASSERT the change is saved (returns to view mode)
- **Assertions:**
  - [x] ASSERT (BLOCKING) the edit is saved

---

### TC-09 — Edit agent from index (ADO #65905)
- **Steps:**
  1. NAVIGATE to the Agents page
  2. CLICK the row **edit-pencil** icon on the first agent
  3. ASSERT the agent edit view is shown
- **Assertions:**
  - [x] ASSERT (BLOCKING) the edit view is shown (URL contains `mode=edit`)

---

### TC-10 — Save edit from index edit view (ADO #65906)
- **Steps:**
  1. Open an agent edit view via the row edit icon
  2. MODIFY a field (e.g. Surname)
  3. CLICK **Save**
  4. ASSERT the change is saved and reflected
- **Assertions:**
  - [x] ASSERT (BLOCKING) the edit is saved (returns to view mode)

---

### TC-11 — Cancel edit from index edit view (ADO #65907)
- **Steps:**
  1. Open an agent edit view via the row edit icon
  2. CLICK **Cancel Form Edit**
  3. ASSERT the edit view closes, no changes saved
- **Assertions:**
  - [x] ASSERT the edit view closes without saving

---

## Teardown
- No records are created in this suite (TC-03 only opens the dialog). Edits in TC-08/TC-10 append a marker to the Surname of an existing agent (minor churn); no destructive delete.
