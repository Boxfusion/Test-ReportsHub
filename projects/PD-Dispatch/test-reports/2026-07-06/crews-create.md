# Report: Crews — Add New (Management CRUD)

**Date:** 2026-07-06 11:46 UTC
**Plan:** (ad-hoc live run — no paired plan yet) Management → Crews → Add New
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
| Admin table | `/dynamic/Boxfusion.Ems/EmsDispatchTeam-Table` (form `EmsDispatchTream-Create v11`) |

## Summary
| Total Steps | Passed | Failed | Skipped |
|-------------|--------|--------|---------|
| 2 | 2 | 0 | 0 |

Created **1 Crew** fully chained to our own records: Station → Resource → Crew. Verified persisted via grid (count 4 → 5).

## Step Results

### TC-01 — Re-login + navigate
**Mode:** live-mcp
- [PASS] Logged in as Admin; view mode **Latest**. Reached Crews table via `/dynamic/Boxfusion.Ems/EmsDispatchTeam-Table` (4 existing items).

### TC-02 — Create crew
**Mode:** live-mcp
- [PASS] Crew Station = **QA Automation Test Station** (reused our record, searchable combobox).
- [PASS] Crew Number = **QA Automation Test Crew**.
- [PASS] Crew Members = **QA Resource Test** (reused our record — the members dropdown is filtered to resources based at the chosen station, so only our resource showed).
- [PASS] Crew Skill Type = **BasicAmbulanceAssistants** (options are derived from the selected crew member's skills).
- [PASS] Saved; row confirmed in grid. ID `f3ea95a2-4619-4e71-bbe2-fec4cdad73d4`. Count 4 → 5.

## Notes / Observations
- Form `EmsDispatchTream-Create v11` [sic] fields (all required*): Crew Station (searchable combobox → Stations), Crew Number (text), Crew Members (multi-select combobox — **filtered to resources whose Dispatch Base = the chosen station**), Crew Skill Type (multi-select — options **derived from the chosen members' skills**).
- Order matters: choose Crew Station first (it scopes the Crew Members list), then members, then skill type (scoped by members).
- Used real MCP click+type throughout (per the known Shesha crew-create caveat that synthetic events malform the payload → 500 on save). Save succeeded.
- This crew ties together the full self-created chain from this session: Station → Resource (Dispatch Base) → Crew (Member + Station).

## Test Data Created (cleanup candidate)
Crew `QA Automation Test Crew` — member QA Resource Test, station QA Automation Test Station.
