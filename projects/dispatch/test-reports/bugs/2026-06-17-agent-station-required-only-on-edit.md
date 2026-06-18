# Bug: Agents — Station is optional on create but required on edit (blocks re-saving an agent created without a Station)

- **Date:** 2026-06-17
- **Status:** ❌ OPEN — confirmed app defect (form-validation inconsistency between the create and edit forms). Reproduced live via Playwright MCP.
- **Module:** NC Dispatch — Administrative Functions → Agents (`All Agents`)
- **Environment:** QA — https://ncdoh-dispatcher-adminportal-qa.shesha.app/
- **Forms / components:**
  - Create: `Boxfusion.Dispatcher/create-agent-roles` (v10) — the "Add New Agent" dialog
  - Edit: `Boxfusion.Dispatcher/agent-roles-detailsV2` (v7) — the agent detail/edit page
- **Severity:** Medium — any agent created without a Station cannot be re-saved from the edit form until a Station is added; the required-field rule is also inconsistent between the two forms.
- **Category:** App business-logic / form-validation defect (NOT a test-harness artifact — reproduced manually in the UI).

## Summary
The **Station** field is **not required on the "Add New Agent" create dialog** (no asterisk; the agent saves successfully with Station left blank) but is **required on the agent edit form** (marked `*`; Save is blocked with *"This field is required"* when Station is empty). As a result, an agent created without a Station is in a state where the **very next edit-and-save fails** until a Station is chosen — even if the user changed nothing else.

## Expected
The Station field's required/optional status is **consistent** between the create and edit forms. Either:
- Station is required on **both** forms (so an agent can never be created without one), **or**
- Station is optional on **both** forms (so an existing agent without a Station can be edited/saved without being forced to add one).

## Actual
- **Create** (`Add New Agent` dialog): Station has **no `*`**; submitting with Station blank **succeeds** — agent is created (e.g. `Auto Test Agent`, username `autotestagent`, id `3d0db54f-5303-42b8-bf19-d2c936b6aaeb`, no Station).
- **Edit** (`agent-roles-detailsV2?...&mode=edit`): Station shows **`*` (required)**; clicking **Save** with Station still empty is **rejected** with inline error **"This field is required"** under the Station dropdown. Save only succeeds after selecting a Station.

## Reproduction
1. Log in as **Admin** and open **Dispatcher → Management → Agents** (`/dynamic/Boxfusion.Dispatcher/agent-roles-table`).
2. Click **Add New**. Fill Name, Surname, Mobile, Email, Username, Password + Verify Password, pick **Roles** and **Regions**, and **leave Station blank** (it is not marked required).
3. Click **OK** → the agent **is created** and appears in the grid. ✅ (confirms Station optional on create)
4. Find the agent, click the **edit** pencil (opens `agent-roles-detailsV2?id=<id>&mode=edit`).
5. Without changing anything, click **Save**.
6. → Save is **blocked**; the **Station** field (now marked `*`) shows **"This field is required."** ❌
7. Select any **Station** (e.g. *Alexanderbay EMS Station*) → click **Save** → saves successfully.

## Evidence
- Reproduced 2026-06-17 on QA while editing `Auto Test Agent` (id `3d0db54f-5303-42b8-bf19-d2c936b6aaeb`): first Save returned the inline "This field is required" alert on the Station dropdown; after setting Station = **Alexanderbay EMS Station**, Save succeeded and the record returned to read-only view with Station populated.
- Create-form snapshot: "Add New Agent" dialog — Station label has no `*` (optional); Roles, Regions, Password, Verify Password are `*`.
- Edit-form snapshot: Station label rendered with `*` and, on failed Save, an `alert` reading "This field is required" under the Station combobox.

## Impact / why it matters
- Agents legitimately created via the create dialog **without a Station** are immediately in a non-re-savable state on the edit form — a user trying to make any unrelated change is forced to also assign a Station.
- The inconsistency is a data-integrity smell: if Station is genuinely mandatory for an agent, the **create** form should enforce it too (preventing station-less agents from ever existing).

## Suggested fix
Make the Station `required` rule identical on both `create-agent-roles` and `agent-roles-detailsV2`. Preferred: require Station on **create** as well (align create with edit), or relax it on **edit** if station-less agents are valid.

## Notes
- Separate minor UX footgun observed on the same create form (not this bug): the **Username** field **pre-fills with "Admin"** by default, and the **login page** later pre-fills the last-created agent username — both easy to submit by accident. Worth a separate look.
