# Report: Stations — Add New (Management CRUD)

**Date:** 2026-07-06 10:05 UTC
**Plan:** (ad-hoc live run — no paired plan yet) Management → Stations → Add New
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
| Admin table | `/dynamic/Boxfusion.Dispatcher/dispatch-base` (form `dispatchbase-create-form v11`) |

## Summary
| Total Steps | Passed | Failed | Skipped |
|-------------|--------|--------|---------|
| 3 | 3 | 0 | 0 |

Created **1 Station** with a Mpumalanga address; the places-search autocomplete geocoded latitude/longitude and the Parent Dispatch Area (district) auto-derived. Verified persisted via table search.

## Step Results

### TC-01 — Re-login + navigate
**Mode:** live-mcp
- [PASS] Re-logged in as Admin; view mode **Latest**. Reached Stations table via `/dynamic/Boxfusion.Dispatcher/dispatch-base` (26 existing items).

### TC-02 — Open Create New Record + fill
**Mode:** live-mcp
- [PASS] Name = **QA Automation Test Station**.
- [PASS] Address = typed "Mbombela, Mpumalanga" → selected suggestion **Mbombela, Mpumalanga, South Africa**; geocoder populated **Latitude -25.4752984 / Longitude 30.9694163** after ~3s.
- [PASS] Dispatch Area = **City of Mbombela Local Municipality**; Contact Number = **0137654321**.

### TC-03 — Save + verify
**Mode:** live-mcp
- [PASS] Saved; row confirmed via search. ID `a184c087-6594-4c5e-a855-b31d826067cc`. Parent Dispatch Area auto-derived to **Ehlanzeni District**.

## Notes / Observations
- Form `dispatchbase-create-form v11` fields: Name* (required), Address (places autocomplete, optional), Lattitude/Longitude (spinbuttons, auto-populated by address; note the field is labelled "Lattitude" — a typo in the app), Dispatch Area* (required combobox of municipalities), Contact Number (optional).
- Only **Name** and **Dispatch Area** are hard-required; address/lat-long/contact are optional.
- Same address→geocode→lat/long behaviour as Points of Interest; Parent Dispatch Area (district) derives from the selected municipality/address.
- Grid columns: Name, Address, Dispatch Area, Parent Dispatch Area, Contact Number.

## Test Data Created (cleanup candidate)
Row named `QA Automation Test Station`.
