# Report: Shifts — Add New (Management CRUD)

**Date:** 2026-07-06 11:28 UTC
**Plan:** (ad-hoc live run — no paired plan yet) Management → Shifts → Add New
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
| Admin table | `/dynamic/boxfusion.shiftmanagement/shift-table` (form `shifts-create-form v3`) |

## Summary
| Total Steps | Passed | Failed | Skipped |
|-------------|--------|--------|---------|
| 2 | 2 | 0 | 0 |

Created **1 Shift**. Verified persisted via grid (count 2 → 3).

## Step Results

### TC-01 — Re-login + navigate
**Mode:** live-mcp
- [PASS] Re-logged in as Admin (login had auto-filled a leftover username `QADispatcher` — corrected to `Admin`); view mode **Latest**. Reached Shifts table via `/dynamic/boxfusion.shiftmanagement/shift-table` (2 existing items).

### TC-02 — Create shift
**Mode:** live-mcp
- [PASS] Name = **QA Automation Test Shift**; Shift Category = **Day**; Start Time = **08:00**; End Time = **16:00**.
- [PASS] Saved; row confirmed in grid. ID `652e60aa-3007-4430-80da-64b02652a47d`. Count 2 → 3.

## Notes / Observations
- Form `shifts-create-form v3` fields (all required*): Name (text), Shift Category (combobox: Night / Day / Swing), Start Time (time picker), End Time (time picker).
- **Time pickers**: clicking the field opens an hours-column + minutes-column panel with a per-picker **OK** button (distinct from the dialog's OK). Select hour, select minute, then click the picker's OK to commit. The picker OK stays disabled until both hour and minute are chosen.
- ⚠️ **Login gotcha:** after creating agents, the login page auto-filled the last-entered username (`QADispatcher`) — re-verify the Username is `Admin` before signing in.

## Test Data Created (cleanup candidate)
Shift `QA Automation Test Shift` (Day, 08:00–16:00).
