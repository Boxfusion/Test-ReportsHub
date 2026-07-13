# Report: Vehicle Types — Add New (Management CRUD)

**Date:** 2026-07-06 09:42 UTC
**Plan:** (ad-hoc live run — no paired plan yet) Management → Vehicle Types → Add New
**Spec:** n/a
**Execution Mode:** live-mcp (Playwright MCP, manual drive)
**Result:** PASSED
**Duration:** ~2 min

## Environment
| Key | Value |
|-----|-------|
| App | PD-Dispatch (Dispatcher Admin Portal — master/PD site) |
| URL | https://pd-dispatcher-v2-adminportal-qa.shesha.app |
| Environment | QA |
| User | Admin (System Administrator) |
| View mode | Latest |
| Admin table | `/dynamic/Boxfusion.Ems/vehicle-types` (form `vehicle-type-create-form v7`) |

## Summary
| Total Steps | Passed | Failed | Skipped |
|-------------|--------|--------|---------|
| 3 | 3 | 0 | 0 |

Created **1 Vehicle Type** with all 10 required fields, including the four map-marker SVG URLs supplied by the user. Verified persisted via table search (count 20 → 21).

## Step Results

### TC-01 — Re-login + confirm view mode
**Mode:** live-mcp
- [PASS] Re-logged in as Admin (credentials remembered by browser); view mode already **Latest** (persisted).

### TC-02 — Navigate to Vehicle Types admin table
**Mode:** live-mcp
- [PASS] Reached via direct URL `/dynamic/Boxfusion.Ems/vehicle-types`; table loaded with 20 existing items.

### TC-03 — Create vehicle type with marker URLs
**Mode:** live-mcp
- [PASS] Create New Record dialog opened; 10 required fields.
- [PASS] Name = **QA Automation Test - Response Vehicle**; Description = **QA Automation Test vehicle type**.
- [PASS] Vehicle Type Skill = **Ambulance Emergency Assistants**; Vehicle Occupation = **Emergency**.
- [PASS] On Shift Online = `/markers/vehicles/onshift/online/ambulance.svg`
- [PASS] On Shift Offline = `/markers/vehicles/onshift/offline/ambulance.svg`
- [PASS] Off Shift Online = `/markers/vehicles/offshift/online/ambulance.svg`
- [PASS] Off Shift Offline = `/markers/vehicles/offshift/offline/ambulance.svg`
- [PASS] Check List Required On Shift Start = checked; On Shift End = checked.
- [PASS] Saved; row confirmed via search. ID `204cfcfa-246c-4ea6-9d5e-f1d8f6091b81`. Table count 20 → 21.

## Notes / Observations
- **Add New** button dialog is titled "Create New Record" (Incident Types used "Add New Record") — form `vehicle-type-create-form v7`.
- Full field set (all required *): Name (text), Description (text), Vehicle Type Skill (combobox), 4× Marker Url (text), Check List Required On Shift Start/End (checkboxes), Vehicle Occupation (combobox).
- **Vehicle Type Skill** options: Basic Ambulance Assistants, Ambulance Emergency Assistants, Operational Emergency Care Orderly, Emergency Care Assistant, Paramedics, Emergency Care Technicians, Emergency Care Practitioners, Administrative, Intern.
- **Vehicle Occupation** options: Emergency, PPT.
- Combobox options render in a body-level portal (real click, not synthetic). After selecting the last combobox, press Escape to close the option list before clicking OK.
- Table columns surface Name, Description, Skill Type, Required On Shift Start, Required On Shift End (marker URLs not shown in the grid; visible on the details view).

## Test Data Created (cleanup candidate)
Row prefixed `QA Automation Test -` for easy identification/removal.
