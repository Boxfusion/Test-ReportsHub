# Report: Site Types — Add New (Management CRUD)

**Date:** 2026-07-06 09:45 UTC
**Plan:** (ad-hoc live run — no paired plan yet) Management → Site Types → inline add row
**Spec:** n/a
**Execution Mode:** live-mcp (Playwright MCP, manual drive)
**Result:** PASSED
**Duration:** ~1.5 min

## Environment
| Key | Value |
|-----|-------|
| App | PD-Dispatch (Dispatcher Admin Portal — master/PD site) |
| URL | https://pd-dispatcher-v2-adminportal-qa.shesha.app |
| Environment | QA |
| User | Admin (System Administrator) |
| View mode | Latest |
| Admin table | `/dynamic/Boxfusion.Dispatcher/site-types` (form `site-types v8`) |

## Summary
| Total Steps | Passed | Failed | Skipped |
|-------------|--------|--------|---------|
| 3 | 3 | 0 | 0 |

Created **1 Site Type** via the inline editable-grid add-row (no create dialog). Verified persisted via table search.

## Step Results

### TC-01 — Re-login + confirm view mode
**Mode:** live-mcp
- [PASS] Re-logged in as Admin; view mode **Latest** (persisted).

### TC-02 — Navigate to Site Types admin table
**Mode:** live-mcp
- [PASS] Reached via direct URL `/dynamic/Boxfusion.Dispatcher/site-types`; grid loaded with 19 existing items.

### TC-03 — Add site type via inline add-row
**Mode:** live-mcp
- [PASS] Filled add-row: Levels = **5**, Name = **QA Automation Test Site Type**, Marker Url = **/markers/facilities/clinic.svg**, Category = **2**.
- [PASS] Committed with the row's **plus-circle** button; row confirmed via search.

## Notes / Observations
- **Different pattern from Incident Types / Vehicle Types.** Site Types is an **inline editable grid** (`site-types v8`) — there is **no "Add New" button / dialog**. Instead the first grid row is an editable add-row with a **plus-circle** (commit) and **close-circle** (cancel) button.
- Columns / add-row inputs: **Levels** (number spinbutton), **Name** (text), **Marker Url** (text), **Category** (number spinbutton).
- Rows have an inline **edit** pencil (no search/detail link) and no GUID surfaced in the URL, so no record ID captured (unlike Incident/Vehicle types which expose `?id=<guid>` detail links).
- Existing marker URLs use `/markers/facilities/hospital.svg` and `/markers/facilities/clinic.svg`.

## Test Data Created (cleanup candidate)
Row named `QA Automation Test Site Type` for easy identification/removal.
