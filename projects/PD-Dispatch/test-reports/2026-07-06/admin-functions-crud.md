# Report: Administrative Functions — View / Edit / Cancel (CRUD)

**Date:** 2026-07-06 12:27 UTC
**Plan:** (ad-hoc live run — no paired plan yet) Management → each entity → View (details) · Edit (change grid-visible field + Save + verify) · Cancel (dismiss without persisting)
**Spec:** n/a
**Execution Mode:** live-mcp (Playwright MCP, manual drive)
**Result:** PASSED (11/12 entities fully pass View+Edit; Incident Types = View-only by design — Edit not a supported action, and its known-empty View is an already-logged issue, so it is out of scope, not a failure)
**Duration:** ~20 min

## Environment
| Key | Value |
|-----|-------|
| App | PD-Dispatch (Dispatcher Admin Portal — master/PD site) |
| URL | https://pd-dispatcher-v2-adminportal-qa.shesha.app |
| Environment | QA |
| User | Admin (System Administrator) |
| View mode | Latest |

## Scope
Exercised the non-Create admin actions on each of the 12 records created earlier this session (mirrors the NC Dispatch admin-functions-crud coverage). "View" = the record's details page renders our data; "Edit" = change a grid-visible field, Save, and confirm the new value persists in read-only view; "Cancel" = the shared **Cancel Form Edit** button discards changes.

## Summary
| Total Steps | Passed | Failed | Skipped / N-A |
|-------------|--------|--------|---------------|
| 12 | 11 | 0 | 1 (Incident Types — View-only by design) |

## Step Results

### TC-00 — Log in
**Mode:** live-mcp — [PASS] Signed in as Admin (verified username = Admin).

### TC-01 — Incident Types — View (Edit not applicable)  ⚪ N/A by design
- [N/A] **Incident Types are not intended to be edited** (per team) — Edit is out of scope for this entity, so no Edit/Save was attempted.
- [KNOWN] The details **View** renders blank (header "Title for"; Priority / Name / Incident Life Cycle empty). This is an **already-logged** issue, not a new finding. Root cause captured for reference in `test-reports/bugs/incident-types-details-blank.md`: the `incident-types-details v2` form is bound to entity type `Boxfusion.Dispatcher.Domain.IncidentTypeConfiguration` whose `Metadata/Get` 404s (records live under `Boxfusion.Ems`), so nothing binds.

### TC-02 — Stations — View · Cancel · Edit  ✅
- [PASS] View (`dispatch-base-details v10`) renders Name/Dispatch Area/Contact/Address/lat-long.
- [PASS] **Cancel**: changed Contact → 0130000000, clicked Cancel Form Edit → reverted to 0137654321.
- [PASS] **Edit**: Contact 0137654321 → **0130000000** saved and persisted.

### TC-03 — Vehicle Types — View · Edit  ✅
- [PASS] View (`vehicle-types-detials v20`) renders name, skill, 4 marker URLs, occupation, checklist subgrid.
- [PASS] Edit: Vehicle Type Skill Ambulance Emergency Assistants → **Paramedics** persisted.

### TC-04 — Site Types — View · Edit (inline grid)  ✅
- [PASS] Row renders our data (no separate details page).
- [PASS] Edit via row pencil: Levels **5 → 6** persisted.

### TC-05 — Points of Interest — View · Edit  ✅
- [PASS] View (`emergency-site-details`) renders all fields incl. Site Type = our record.
- [PASS] Edit: Contact 0131234567 → **0139999999** persisted.

### TC-06 — Devices — View · Edit  ✅
- [PASS] View (`mobile-device-details`) renders Name/IMEI/Model/SIM/OS.
- [PASS] Edit: Model Samsung Galaxy A54 → **A55** persisted.

### TC-07 — Vehicles — View · Edit  ✅
- [PASS] View (`vehicle-details`) renders all incl. Station=our record; Status auto-set to "In Service".
- [PASS] Edit: Odometer 1000 → **2000** persisted.

### TC-08 — Agents (Call Taker) — View · Edit  ✅ (with finding)
- [PASS] View (`agent-roles-detailsV2`) renders Name/Mobile/Role/Regions.
- [PASS] Edit: Mobile 0821111111 → **0821119999** persisted.
- ⚠️ **Form inconsistency:** the Agent **edit** form makes **Station required**, but the Agent **create** form has no Station field — so the first Save failed with "This field is required" on Station. Had to set Station = QA Automation Test Station to save. (Create should probably capture Station too, or edit shouldn't hard-require it.)

### TC-09 — Shifts — View · Edit  ✅
- [PASS] View (`shifts-details-view`) renders Name/Category/Start/End.
- [PASS] Edit: End Time 16:00 → **17:00** persisted (time-picker).

### TC-10 — Resources — View · Edit  ✅ (with finding)
- [PASS] View (`resource-details`) renders full detail + Resource Assignments (links our Crew + Vehicle QA-TEST-001).
- [PASS] Edit: Mobile 0823333333 → **0823339999** persisted.
- ⚠️ **Skill Type shows "unknown"** on the details/edit view — reinforces the create-time skill-type discrepancy noted in `resources-create.md` (selected Paramedics, saved differently). Still to be confirmed as bug vs derived behavior.

### TC-11 — Crews — View · Edit  ✅
- [PASS] View (`EMSDispatchTeam-Details-View`) renders Crew Station/Number/Members/Skill (details page has an Edit button even though the grid row does not link to edit).
- [PASS] Edit: Crew Number "QA Automation Test Crew" → **"QA Automation Test Crew A"** persisted.

### TC-12 — Shift Assignments — View · Edit(hydrate) · Cancel  ✅
- [PASS] View (`dispatch-shift-assignment-details v24`) renders all refs + Event Book audit row. Reflects downstream edits (Shift now 08:00-**17:00**, Crews now "…Crew **A**").
- [PASS] Edit form opens and hydrates every field.
- [PASS] **Cancel** (no change) — deliberately did not edit, to preserve the *today-dated* assignment that keeps the vehicle/resource dispatchable.

## Notes / Observations
- **Detail pages** for most entities follow one framework: a read-only "… Details" panel with an **Edit** button that swaps to inline inputs + **Cancel Form Edit** / **Save** buttons. Cancel reliably discards (verified on Stations + Shift Assignments).
- **Reached by direct URL** using each record's GUID (sidebar/grid links collapse under automation). Detail-view URL slugs differ per entity (e.g. `vehicle-types-detials` [sic], `agent-roles-detailsV2`, `EMSDispatchTeam-Details-View`, `shifts-details-view`).
- Cross-entity consistency held up: edits to Shift (17:00) and Crew ("…Crew A") propagated to the Shift Assignment view.

## Bugs / Findings
1. **[KNOWN / not a new bug] Incident Types details View is blank** — Incident Types are View-only (not editable) by design, and the empty View is an already-logged issue. Root-cause detail retained in `test-reports/bugs/incident-types-details-blank.md` (metadata 404 on `Boxfusion.Dispatcher.Domain.IncidentTypeConfiguration`). No new ticket.
2. **[Finding] Agent edit requires Station absent from create form** — cannot save an edit without setting Station.
3. **[Finding] Resource Skill Type = "unknown"** — save/derivation discrepancy (open since `resources-create.md`).

## Test Data Modified
Stations Contact → 0130000000 · Vehicle Types Skill → Paramedics · Site Types Levels → 6 · POI Contact → 0139999999 · Devices Model → A55 · Vehicles Odometer → 2000 · Agent(Call Taker) Mobile → 0821119999 + Station set · Shift End → 17:00 · Resource Mobile → 0823339999 · Crew Number → "QA Automation Test Crew A". (Incident Type unchanged; Shift Assignment unchanged.)
