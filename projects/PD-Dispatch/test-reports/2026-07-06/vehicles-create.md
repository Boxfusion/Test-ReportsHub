# Report: Vehicles — Add New (Management CRUD)

**Date:** 2026-07-06 11:18 UTC
**Plan:** (ad-hoc live run — no paired plan yet) Management → Vehicles → Add New
**Spec:** n/a
**Execution Mode:** live-mcp (Playwright MCP, manual drive)
**Result:** PASSED
**Duration:** ~3 min

## Environment
| Key | Value |
|-----|-------|
| App | PD-Dispatch (Dispatcher Admin Portal — master/PD site) |
| URL | https://pd-dispatcher-v2-adminportal-qa.shesha.app |
| Environment | QA |
| User | Admin (System Administrator) |
| View mode | Latest |
| Admin table | `/dynamic/Boxfusion.Ems/vehicles` (form `vehicles-create-form v12`) |

## Summary
| Total Steps | Passed | Failed | Skipped |
|-------------|--------|--------|---------|
| 2 | 2 | 0 | 0 |

Created **1 Vehicle**, reusing our own Vehicle Type and Station created earlier this session. Verified persisted via grid (count 3 → 4).

## Step Results

### TC-01 — Re-login + navigate
**Mode:** live-mcp
- [PASS] Re-logged in as Admin; view mode **Latest**. Reached Vehicles table via `/dynamic/Boxfusion.Ems/vehicles` (3 existing items).

### TC-02 — Create vehicle
**Mode:** live-mcp
- [PASS] Vehicle Registration = **QA-TEST-001**; Odometer Reading = **1000**; Odometer Reading Date = **06/07/2026**.
- [PASS] Vehicle Type = **QA Automation Test - Response Vehicle** (reused our record); Resource Type = **Paramedic**; Driver Skill Type = **Paramedics**.
- [PASS] **Station = QA Automation Test Station** (reused our record, per instruction); Capacity = **4**.
- [PASS] Saved; row confirmed via grid. ID `329e0d2e-0956-4f93-b2b4-200dd4369162`. Municipality/District auto-derived from station → City of Mbombela / Ehlanzeni. Count 3 → 4.

## Notes / Observations
- Form `vehicles-create-form v12` fields: Vehicle Registration* (text), Odometer Reading* (number), Odometer Reading Date* (date DD/MM/YYYY), Vehicle Type* (searchable combobox → references Vehicle Types table), Resource Type* (combobox: Call Taker/Dispatcher/Paramedic/…roles), Driver Skill Type* (combobox: skill types), Device Installed? (checkbox, optional), Station* (searchable combobox → references Stations table), Status (optional), Capacity* (number), Location Tracker Id (optional).
- Long comboboxes (Vehicle Type, Station) are **searchable** — type to filter, then click the option.
- Local Municipality + District columns derive from the chosen Station.

## Test Data Created (cleanup candidate)
Vehicle `QA-TEST-001` — linked to our `QA Automation Test - Response Vehicle` type and `QA Automation Test Station`.
