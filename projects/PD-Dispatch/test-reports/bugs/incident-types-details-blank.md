# Bug: Incident Types details/edit page renders blank (no data hydration)

> **DUPLICATE / KNOWN — not a new defect.** Per the team (2026-07-06): the empty Incident Types **View** is an **already-logged** issue, and **Incident Types are not intended to be edited** (Edit is not a supported action for this entity). This note is retained only for the root-cause detail below; it does **not** represent a new finding or a test failure. No new ticket needed — cross-reference the existing View bug.

**Logged:** 2026-07-06
**Project:** PD-Dispatch (Dispatcher Admin Portal — master/PD site)
**Environment:** QA — https://pd-dispatcher-v2-adminportal-qa.shesha.app
**View mode:** Latest
**Severity:** N/A here — already logged elsewhere; Edit is out of scope (not a supported action for Incident Types)
**Area:** Management → Incident Types → View (Edit not applicable)
**Form:** `Boxfusion.Ems/incident-types-details v2`
**Status:** Known / duplicate of an existing logged issue. Reproduced 2026-07-06 (direct URL + grid View link). Root cause captured below for reference.

## Root cause (from browser console)
The details form fails to load the entity's **metadata**, so no field binds:

```
GET .../api/services/app/Metadata/Get?container=Boxfusion.Dispatcher.Domain.IncidentTypeConfiguration → 404
Failed to fetch metadata of type "Boxfusion.Dispatcher.Domain.IncidentTypeConfiguration" (AxiosError 404)
  at applyFormSettingsAsync → loadFormByIdAsync → initByFormId
GET .../api/services/app/ReferenceList/GetByName?module=undefined&name=undefined → 401 (×4)
React error #419 (render bailout after the failed async form init)
```

**The `incident-types-details v2` form is bound to entity type `Boxfusion.Dispatcher.Domain.IncidentTypeConfiguration`, whose metadata returns 404 (that type isn't registered/served).** The actual Incident Type records live under the **`Boxfusion.Ems`** module (that's what the grid `/dynamic/Boxfusion.Ems/incident-types` and the working create form `Boxfusion.Ems/incident-type-create-form` use). Because metadata never resolves, the Priority/Incident-Life-Cycle reference lists are then requested with `module=undefined&name=undefined` (→ 401) and every field renders empty.

## Suggested fix
Point the `incident-types-details v2` form's model/entity type at the correct type/module (the `Boxfusion.Ems` incident-type entity used by the grid + create form), or register/expose metadata for `Boxfusion.Dispatcher.Domain.IncidentTypeConfiguration`. Compare against a working details form (e.g. `dispatch-base-details v10`) whose entity type resolves.

## Summary
Opening an existing Incident Type's **details** page loads the form chrome but **does not hydrate the record's data**. The page header shows "Title for" (missing the name), and the fields **Priority**, **Name**, and **Incident Life Cycle** are all empty. Entering **Edit** mode shows the same: empty Name textbox and unselected Priority / Incident Life Cycle comboboxes. Data does not appear after waiting.

## Steps to Reproduce
1. Log in as Admin; view mode = Latest.
2. Go to Incident Types (`/dynamic/Boxfusion.Ems/incident-types`) and confirm a record exists (e.g. **QA Automation Test - Heat Exhaustion**, P2-Amber, Close at Site).
3. Open its details page: `/dynamic/Boxfusion.Ems/incident-types-details?id=d5b4e7a7-4a79-44d0-8d7b-74eb21fe0f11` (or click the row's search/view icon).
4. Observe the Details panel.
5. Click **Edit**.

## Expected
Details panel shows the record's Priority (P2-Amber), Name (QA Automation Test - Heat Exhaustion), and Incident Life Cycle (Close at Site); Edit mode pre-fills those fields.

## Actual
- Header reads **"Title for"** (no record name appended).
- **Priority**, **Name**, **Incident Life Cycle** render with **no values**.
- Edit mode: **Name** textbox empty; **Priority** and **Incident Life Cycle** comboboxes unselected.
- No hydration after a ~2.5s wait. (Screenshot captured: `pd-incident-type-view.png`.)

## Evidence it is a real app defect (not the test harness)
- The `id` in the URL is correct and the record **is present in the grid** (verified same session).
- **Other entities' details pages hydrate correctly** with the same navigation approach and view mode — e.g. Stations (`dispatch-base-details v10`), Vehicle Types (`vehicle-types-detials v20`), POI, Devices, Vehicles, Agents, Shifts, Resources, Crews, Shift Assignments all show their data. Only Incident Types is blank.

## Impact
- Incident Type records **cannot be viewed** via the details page.
- Incident Type records **cannot be safely edited** — saving from the blank Edit form would likely overwrite Name/Priority/Life Cycle with empty values. (No edit/save was performed during testing to avoid data loss.)

## Notes
- Likely a data-binding/model-mapping issue in the `incident-types-details v2` form (field bindings not resolving the entity), or a form-version/publish mismatch specific to this configured form.
- Suggest comparing `incident-types-details v2` field bindings against a working details form such as `dispatch-base-details v10`.
