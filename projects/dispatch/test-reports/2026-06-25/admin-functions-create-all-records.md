# Report: NC Dispatch — Administrative Functions, create one new record of every type (live, headed)

**Date:** 2026-06-25 08:15 UTC
**Plan:** Administrative Functions CRUD (ADO suite "2. Administrative Functions", plan #65099) — create leg
**Spec:** n/a — driven live via Playwright MCP
**Execution Mode:** ai-driven (live MCP)
**Result:** PASSED — 11/11 record types created, every field populated (incl. non-mandatory)
**Environment:** QA — https://ncdoh-dispatcher-adminportal-qa.shesha.app/ (logged in as **Admin**)

## Scenario
Add one **new** record under each Administrative-Functions entity, populating **all** fields including the optional ones. All AntD dropdowns filled with **real clicks/typing** (never synthetic JS events) per the crew-create 500 lesson. Each grid reached by direct URL (sidebar flyouts don't open under automation).

## Records created (all saves returned HTTP 200)

| # | Type | Name / key | Key field values | Create endpoint |
|---|------|------------|------------------|-----------------|
| 1 | Incident Type (Call Type) | **QA Test Call Type 250625** | Triage P2-Amber · Resolution SLA 45 | `EmsIncidentTypeConfiguration/Crud/Create` |
| 2 | Station | **QA Test Station 250625** | Addr Kimberley Hospital, Du Toitspan Rd · Lat -28.7442231 / Long 24.7708114 (auto) · Region Frances Baard · Contact 0531234567 | `DispatchBase/Crud/Create` |
| 3 | Site Type | **QA Test Site Type 250625** | Levels 5 · Marker /markers/facilities/hospital.svg · Category 1 | `DispatchSiteType/Crud/Create` |
| 4 | Point of Interest | **QA Test POI 250625** | POI Type Hospital · Site Type *QA Test Site Type 250625* · Kimberley Hospital · Lat/Long auto · Region Frances Baard · Mobile 0531234567 · Marker /markers/facilities/hospital.svg · Speciality Medicine | `EmergencySite/Crud/Create` |
| 5 | Vehicle Type | **QA Test Vehicle Type 250625** | Skill Paramedics · Occupation Emergency · 4 marker URLs (on/off-shift × online/offline) · Checklist on Start = Yes · on End = Yes | `EmsVehicleType/Crud/Create` |
| 6 | Device | **QA Test Device 250625** | IMEI 356938035643809 · Model Galaxy Tab A8 · SIM 89370000000022090625 · OS Android | `DispatchDevice/Crud/Create` |
| 7 | Agent | **QA Test Agent 250625** (`qatestagent250625`) | Mobile 0818400111 · qatestagent250625@test.com · Role Call Taker · Region Frances Baard · Station *QA Test Station 250625* · password set | `AgentsRoleAppointmentActions/RegisterAgent` |
| 8 | Resource | **QA Test Resource 250625** (`qatestresource250625`) | Mobile 0818400222 · qatestresource250625@test.com · Position Paramedic · Skill Paramedics · Dispatch Area Frances Baard · Dispatch Base *QA Test Station 250625* · password set | `EmsResponderRoleAppointmentActions/CreateResponder` |
| 9 | Crew | **QA-CREW-250625** | Station *QA Test Station 250625* · Member *QA Test Resource 250625* · Skill BasicAmbulanceAssistants | `EmsDispatchTeamActions/CreateEmsDispatchTeam` |
| 10 | Shift | **QA Test Shift 250625** | Category Day · 08:00–17:00 | `DispatchShift/Crud/Create` |
| 11 | Shift Assignment | (25/06/2026) | Shift *QA Test Shift 250625* · Region Frances Baard · Station Kimberley EMS Station · Vehicle BCP 001 NC · Crew *QA-CREW-250625* · Crew Leader *QA Test Resource 250625* | `CreateDispatchShiftAssignment` |

## Records chained on each other (proves the creates are usable downstream)
- POI #4 referenced Site Type #3.
- Agent #7 and Resource #8 referenced Station #2.
- Crew #9 referenced Station #2 + Resource #8.
- Shift Assignment #11 referenced Shift #10 + Crew #9 + (crew member as) Crew Leader #8.

## Notes / findings
- **Shift Assignment vehicle is Station-filtered.** Our new *QA Test Station 250625* has no vehicles (a Vehicle *Type* was created, not a Vehicle), so the Vehicle Reg. No dropdown returned "No data". Switched the assignment's Station to **Kimberley EMS Station** (Frances Baard) to pick a real vehicle (BCP 001 NC) and complete the record with all fields. The other 10 records used our own newly-created references.
- **Crew create succeeded first try with real clicks** (`CreateEmsDispatchTeam` 200) — re-confirms the [synthetic-events → 500] lesson; no synthetic dispatch used anywhere.
- Crew "Crew Skill Type" and Shift-Assignment "Crews" each render a hidden + a visible variant of the same field; only the visible mandatory one is fillable. The "Crews" picker on Shift Assignment is a **"Select Item" table modal** (double-click to select), not a plain dropdown.
- Grids are inline-edit (Incident Types, Site Types) vs form-dialog (Station, POI, Vehicle Type, Device, Agent, Resource, Crew, Shift, Shift Assignment).
