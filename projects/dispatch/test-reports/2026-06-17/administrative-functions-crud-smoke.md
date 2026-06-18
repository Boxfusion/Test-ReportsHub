# Report: NC Dispatch — Administrative Functions Create/Edit Smoke

**Date:** 2026-06-17
**Plan:** _Administrative Functions (ADO plan #65099 / suite #65100) — exploratory create+edit smoke_
**Spec:** _none — live MCP-driven execution (no paired .spec.ts)_
**Execution Mode:** mcp-live (headed)
**Result:** PASSED (1 app defect logged — see Bugs)

| App | URL | Environment |
|-----|-----|-------------|
| NC Dispatch (Dispatcher Admin Portal) | https://ncdoh-dispatcher-adminportal-qa.shesha.app/login | QA |

**Credentials:** Admin / 123qwe

## Scenario
End-to-end **create + edit** pass across the NC Dispatch *Administrative Functions* entities, driven live via Playwright MCP. Each entity was created with `Auto Test …` naming and then re-opened and re-saved (most with a representative field change) to exercise both the create and edit paths. The entities chain together: the **Shift Assignment** wires up the Vehicle, Station, Crew, Resource and Shift created earlier; the **Point of Interest** uses the **Site Type** created earlier.

## Summary
| Entity | Create | Edit | Record ID |
|--------|--------|------|-----------|
| Incident Type "Broken Arm" | ✅ | ✅ | _(inline grid — Call Types)_ |
| Vehicle Type "Auto Test Ambulance" | ✅ | ✅ | `87b72b36-50d4-48ef-9fc5-cf008e29afcb` |
| Device "Auto Test Device" (Device000045) | ✅ | ✅ | `a76a22a8-4b8d-413d-bf7c-019f7e415635` |
| Vehicle "AUTO TEST NC" | ✅ | ✅ | `131710b8-6a29-44ec-9b99-f124377291e5` |
| Agent "Auto Test Agent" | ✅ | ✅ | `3d0db54f-5303-42b8-bf19-d2c936b6aaeb` |
| Resource "Auto Test Resource" | ✅ | ✅ | `83c5b9fb-90ee-462d-b7a8-fbafd9fda1d3` |
| Station "Auto Test Station" | ✅ | ✅ | `b8f8947d-ccf2-48e6-9556-499da9202fc2` |
| Crew "AutoTestCrew 003" | ✅ | — | `9fe9d33a-8d94-422b-8f42-67dfde392b88` |
| Shift "Auto Test Shift" | ✅ | ✅ | `5f295e30-35cd-4f7f-93c7-cea28138af63` |
| Shift Assignment | ✅ | ✅ | `cbcc8a11-9ae1-41b7-b85a-9b6293de77d5` |
| Site Type "Auto Test Site Type" | ✅ | ✅ | `472d3ccb-ea03-4b71-952b-ce18115f7faf` |
| Point of Interest "Auto Test Point of Interest" | ✅ | ✅ | `a5ab13f9-e776-4f64-8974-c3f99451ca58` |

**Totals:** 12 entities created · 11 edited · 1 defect logged (Agents — Station required-only-on-edit).

## Detail

### Environment switch (start of session)
- NC Dispatch was moved from **Pre-Prod** to the new **QA** URL `https://ncdoh-dispatcher-adminportal-qa.shesha.app/login`. Project config (`projects/dispatch/CLAUDE.md`, `meta.json`, incident-types plan/spec) and the `nc-dispatch-admin-page-urls` reference were updated to QA; the old Pre-Prod URL is retained as a dated note.

### Incident Type — "Broken Arm"
- Page **Call Types** (`/dynamic/Boxfusion.Ems/incident-types`) — inline-edit grid. Created via the top add-row + plus-circle; edited via row pencil → Save.

### Vehicle Type — "Auto Test Ambulance"
- `/dynamic/Boxfusion.Ems/vehicle-types`. Created, then edited to set the four marker URLs:
  - On-Shift Online `/markers/vehicles/onshift/online/ambulance.svg`
  - On-Shift Offline `/markers/vehicles/onshift/offline/ambulance.svg`
  - Off-Shift Online `/markers/vehicles/offshift/online/ambulance.svg`
  - Off-Shift Offline `/markers/vehicles/offshift/offline/ambulance.svg`

### Device — "Auto Test Device" (Device000045)
- `/dynamic/Boxfusion.Dispatcher/mobile-devices`. Created + no-op edit save.

### Vehicle — "AUTO TEST NC"
- `/dynamic/Boxfusion.Ems/vehicles`. Created + edit. Region/Station are cascade-filtered.

### Agent — "Auto Test Agent"
- `/dynamic/Boxfusion.Dispatcher/agent-roles-table`. Created (username **not** "admin" per instruction; Station left blank — optional on create). Edit forced a Station selection (**Alexanderbay EMS Station**), later changed to **Auto Test Station** (Region switched to **Frances Baard** so the new station appears). **Defect found** — see Bugs.

### Resource — "Auto Test Resource"
- `/dynamic/Boxfusion.Ems/resources`. Created (username not "admin"; Dispatch Base cascade appeared after Dispatch Area selection → Alexanderbay EMS Station) + edit. This Resource is the crew member / crew leader used downstream.

### Station — "Auto Test Station"
- `/dynamic/Boxfusion.Dispatcher/dispatch-base`. Address is a Northern Cape place via Google Places autocomplete; **Latitude/Longitude auto-populate** from the address. Created + edit. Lives under Region **Frances Baard**.

### Crew — "AutoTestCrew 003"
- `/dynamic/Boxfusion.Ems/EmsDispatchTeam-Table`. Members are Resources at the crew's Station (search-driven picker). Created with **Auto Test Resource** at **Auto Test Station**.
- ⚠️ **Method note:** an early attempt 500'd on `CreateEmsDispatchTeam` — root cause was synthetic JS-event fills leaving React form state half-bound, **not** a backend defect (confirmed by a successful manual create). Re-doing with real MCP clicks/typing saved first try. (Captured as a standing lesson.)

### Shift — "Auto Test Shift"
- `/dynamic/boxfusion.shiftmanagement/shift-table`. Day shift, 08:00–17:00. Created earlier; **edited this session** (no-op Save → returned to read-only cleanly).

### Shift Assignment
- `/dynamic/Boxfusion.Dispatcher/dispatch-shift-assignment-table`. **Created this session**, wiring together the session's entities:
  - Assignment Date 17/06/2026 · Shift **Auto Test Shift (08:00-17:00)** · Region **Frances Baard** · Station **Auto Test Station** · Vehicle **AUTO TEST NC** · Crews **AutoTestCrew 003** · Crew Leader **Auto Test Resource**.
  - Crews field uses an ellipsis **"Select Item"** picker (search + double-click). Grid count 12,733 → 12,734; detail page logged an Event Book entry **Shift002176 "Shift Assignment Created"**.
  - **Edited this session** (no-op Save → read-only).

### Site Type — "Auto Test Site Type"
- `/dynamic/Boxfusion.Dispatcher/site-types` — inline-edit grid. Created (Levels 1, Marker Url `/markers/facilities/clinic.svg`, Category 1) via add-row + plus-circle. **Edited** — Levels **1 → 2** via row pencil → save; change persisted.

### Point of Interest — "Auto Test Point of Interest"
- `/dynamic/Boxfusion.Ems/emergency-site`. Created via Add New dialog:
  - Type **Hospital** · Site Type **Auto Test Site Type** (our record) · Address **Kimberley Hospital, Du Toitspan Road, … Northern Cape** (Google Places → lat **-28.74422** / long **24.77081** auto-filled) · Region **Frances Baard** · Mobile **0123456789** · Speciality **Medicine**.
  - **Edited** — Contact Number **0123456789 → 0987654321**; change persisted.

## Bugs
- **Agents — Station optional on create but required on edit** — confirmed app defect, reproduced live. An agent saved with no Station cannot be re-saved from the edit form until a Station is chosen (required-field rule inconsistent between `create-agent-roles` and `agent-roles-detailsV2`). Logged at `projects/dispatch/test-reports/bugs/2026-06-17-agent-station-required-only-on-edit.md` and reported to the module lead.

## Notes
- **Form-fill method:** all AntD dropdowns filled with **real** MCP clicks + typing (and ellipsis "Select Item" pickers via native double-click). Synthetic JS-event fills are avoided — they can malform the payload and 500 the save.
- **Grid styles vary:** Call Types and Site Types are **inline-edit** grids (top add-row + plus-circle to commit, row pencil → save to edit). Most others use an **Add New dialog** / detail page with a `&mode=edit` URL.
- **Cascade filtering:** Vehicle / Resource / Shift-Assignment Station dropdowns are filtered by the selected Region; Crew members are filtered by Crew Station.
- **Address → geocode:** Station and Point of Interest auto-populate Latitude/Longitude from a Google Places address (Northern Cape addresses used).
- View mode switched **Live → Latest** after each login; browser closed after each add/edit per standing instruction. No data-loss or save failures observed apart from the logged Agent defect and the self-inflicted (and corrected) crew-create 500.
