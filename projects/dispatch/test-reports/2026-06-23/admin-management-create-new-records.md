# Report: NC Dispatch — Administrative/Management Create NEW Records (live, headed)

**Date:** 2026-06-23 09:12 UTC
**Plan:** _Administrative Functions (ADO #65099 / suite #65100) — live create of NEW records per entity_
**Spec:** n/a — driven live via Playwright MCP (headed, user-observed)
**Execution Mode:** ai-driven (live MCP)
**Result:** PASSED
**Summary:** a new record created for every targeted entity
**Environment:** QA — https://ncdoh-dispatcher-adminportal-qa.shesha.app/ (Admin)

## Context
The existing `admin-functions-crud` plan only **verifies** the 2026-06-17 `Auto Test…` records still persist — it does not create anything (re-adding the same names would fail as duplicates). This run instead **creates brand-new, uniquely-named records** for each Management entity, driven live in a visible browser so the flows could be watched.

Also this session: `incident-types` re-run **PASSED 11/11** (TC-05 reconciled to genuinely create + assert a Call Type), and `admin-functions-crud` re-run was **23/24** with the lone "Edit Agent" failure confirmed a **grid-search timing flake** (passed on single-test retry; "Add Agent" found the same record in the same run).

## New records created (all verified live)
| Entity | New record | Key fields |
|---|---|---|
| Incident Type (Call Types) | **Broken Leg** | Triage P2-Amber · Resolution SLA 45 (inline add-row) |
| Vehicle Type | **QA Rescue Boat 2306** | Skill: Basic Ambulance Assistants · Occupation: Emergency · both checklist flags Yes |
| Device | **QA Test Device 2306** | IMEI 356938035643809 · Model QA Tablet X · SIM 8927000000023060 · OS iOS |
| Vehicle | **QA-NC-2306** | Type: Auto Test Ambulance · Driver Skill: Paramedics · Station: Alexanderbay EMS · In Service · Capacity 4 · Odometer 12345 @ 20/06/2026 |
| Agent | **Auto QA Agent 2306** | username `qaagent2306` · Role: Call Taker · Region: Frances Baard · **no Station** (optional on create) |
| Resource | **Auto QA Resource 2306** | username `qaresource2306` · Position: Paramedic · Skill: Paramedics · Dispatch Area: Frances Baard · Dispatch Base: Barkley West EMS |
| Crew | **QA-CREW-2306** | Station: Auto Test Station · Member: Auto QA Resource 2306 · Skill: BasicAmbulanceAssistants |

## Findings / quirks observed
1. **Vehicle Type — required boolean checkboxes reject the untouched default.** "Checklist Required On Shift Start/End" are marked `*` and the first OK was rejected with *"This field is required"* until both were explicitly clicked. A required checkbox that won't accept its default `false` is a UX footgun (consider defaulting or relaxing).
2. **Agent create has no Station field** — confirms the open bug `2026-06-17-agent-station-required-only-on-edit` (Station optional on create, required on edit → a station-less agent can't be re-saved). The Username field also pre-fills with "Admin" (easy to submit by accident).
3. **Resource — conditional required field:** selecting a **Dispatch Area** reveals a required **Dispatch Base** dropdown that isn't present until then; the first OK flagged it required.
4. **AntD date pickers:** pressing Escape to dismiss the calendar **closes the whole modal** (lost a partially-filled Vehicle form once). Dismiss the picker by clicking the next field instead.
5. Grids use an **"Add New" dialog** (Vehicle Type/Device/Vehicle/Agent/Resource/Crew) except **Incident Types**, which uses an **inline add-row** (Triage / Call Types / Resolution SLA + plus-circle).

## Notes
- Browser was run **headed** (MCP server registered without `--headless`) so the creates were observable; `run-plan.js` spec runs remain headless unless `HEADED=1`.
- "etc." entities not yet covered this session: Station, Shift, Shift Assignment, Site Type, Point of Interest — can be added on request the same way.
