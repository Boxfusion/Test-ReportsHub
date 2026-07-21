# Report: Shift Assignments — Add New (Management CRUD)

**Date:** 2026-07-06 11:51 UTC
**Plan:** (ad-hoc live run — no paired plan yet) Management → Shift Assignments → Add New
**Spec:** n/a
**Execution Mode:** live-mcp (Playwright MCP, manual drive)
**Result:** PASSED
**Duration:** ~2.5 min

## Environment
| Key | Value |
|-----|-------|
| App | PD-Dispatch (Dispatcher Admin Portal — master/PD site) |
| URL | https://pd-dispatcher-v2-adminportal-qa.shesha.app |
| Environment | QA |
| User | Admin (System Administrator) |
| View mode | Latest |
| Admin table | `/dynamic/Boxfusion.Dispatcher/dispatch-shift-assignment-table` (form `dispatch-shift-assignment-create v22`) |

## Summary
| Total Steps | Passed | Failed | Skipped |
|-------------|--------|--------|---------|
| 2 | 2 | 0 | 0 |

Created **1 Shift Assignment** that ties together the full self-created chain (Station + Vehicle + Shift + Crew + Resource), dated today. Verified persisted via grid (count 6 → 7).

## Step Results

### TC-01 — Re-login + navigate
**Mode:** live-mcp
- [PASS] Logged in as Admin; view mode **Latest**. Reached table via `/dynamic/Boxfusion.Dispatcher/dispatch-shift-assignment-table` (6 existing items).

### TC-02 — Create shift assignment
**Mode:** live-mcp
- [PASS] Assignment Date = **06/07/2026** (pre-filled today).
- [PASS] Shift = **QA Automation Test Shift 08:00-16:00** (our record).
- [PASS] Dispatch Area = **City of Mbombela Local Municipality**; Dispatch Base = **QA Automation Test Station** (our record).
- [PASS] Vehicle = **QA-TEST-001** (our record — dropdown filtered to vehicles at the chosen base).
- [PASS] Crews = **QA Automation Test Crew** (our record — selected via the "Select Item" double-click picker).
- [PASS] Crew Leader = **QA Resource Test** (our record — options scoped to the chosen crew's members).
- [PASS] Saved; row confirmed in grid. ID `78342667-23db-45a6-bc79-31de93458425`. Shift Start/End auto-filled 08:00/16:00 from the shift. Count 6 → 7.

## Notes / Observations
- Form `dispatch-shift-assignment-create v22` fields (all required*): Assignment Date (date, pre-filled today), Shift (combobox, shows "Name HH:MM-HH:MM"), Dispatch Area (municipality), Dispatch Base (station, scoped by area), Vehicle (combobox, scoped to base), Crews (multi-select via **ellipsis "Select Item" modal — double-click a row to select**), Crew Leader (combobox, scoped to the chosen crew's members).
- Cascade/scoping order: Dispatch Area → Dispatch Base → Vehicle & Crews; Crew → Crew Leader. Fill top-to-bottom.
- The **Crews** picker is the double-click "Select Item" modal pattern (same as other Shesha person/record pickers), NOT a plain dropdown.
- Shift Start/End Time columns are derived from the selected Shift.
- High console-error count during this flow (pre-existing page noise, ~5 on load); the save still succeeded and persisted.
- Per dispatch rules, an assignment dated **today** with our vehicle+resource is what makes them live/dispatchable — this closes the full data chain built this session.

## Test Data Created (cleanup candidate)
Shift Assignment for QA-TEST-001 / QA Automation Test Shift / 06/07/2026 — Crew QA Automation Test Crew, Leader QA Resource Test, Base QA Automation Test Station.
