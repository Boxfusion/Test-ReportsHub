# Report: Points of Interest — Add New (Management CRUD)

**Date:** 2026-07-06 10:01 UTC
**Plan:** (ad-hoc live run — no paired plan yet) Management → Points of Interest → Add New
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
| Admin table | `/dynamic/Boxfusion.Ems/emergency-site` (form `emergency-site-create-form v11`) |

## Summary
| Total Steps | Passed | Failed | Skipped |
|-------------|--------|--------|---------|
| 4 | 4 | 0 | 0 |

Created **1 Point of Interest** with a Mpumalanga address; the places-search autocomplete geocoded latitude/longitude and the district auto-derived. Verified persisted via the grid (count 27 → 28).

## Step Results

### TC-01 — Re-login + navigate
**Mode:** live-mcp
- [PASS] Re-logged in as Admin; view mode **Latest**. Reached POI table via `/dynamic/Boxfusion.Ems/emergency-site` (27 existing items).

### TC-02 — Open Create New Record + set type fields
**Mode:** live-mcp
- [PASS] Name = **QA Automation Test POI - Clinic**.
- [PASS] Emergency Site Type = **Clinic**.
- [PASS] Site Type = **QA Automation Test Site Type** — reused the record created earlier this session (per the reuse-our-own-records convention).

### TC-03 — Address geocoding (Mpumalanga)
**Mode:** live-mcp
- [PASS] Typed "Nelspruit, Mpumalanga" into the Address places-search; selected suggestion **Nelspruit, Mpumalanga, South Africa**.
- [PASS] After ~3s the geocoder populated **Latitude -25.4752984 / Longitude 30.9694163** (rounded in grid to -25.4753 / 30.96942).

### TC-04 — Remaining fields + save
**Mode:** live-mcp
- [PASS] Dispatch Area = **City of Mbombela Local Municipality**; Contact Number = **0131234567**; Marker Url = **/markers/facilities/clinic.svg**; Site Speciality = **Medicine**.
- [PASS] Saved; row confirmed in grid. ID `f3c7375e-eb64-4c9d-90fc-102770199494`. District auto-derived to **Ehlanzeni District**. Count 27 → 28.

## Notes / Observations
- Form `emergency-site-create-form v11` fields: Name*, Emergency Site Type* (Hospital/Clinic/Region/School/Police Station/Landmark/Ems Station), Site Type* (references the Site Types table), Address* (Google-places autocomplete), Latitude/Longitude (spinbuttons, auto-populated by address — the user noted this can take a moment; ~3s here), Dispatch Area* (municipalities/districts), Contact Number*, Marker Url (optional), Site Speciality* (Medicine, Surgery, Obstetrics, Paediatrics, Psychiatry, …).
- **Marker URL convention** (per user): clinic → `/markers/facilities/clinic.svg`, hospital → `/markers/facilities/Hospital.svg`.
- Address must be selected from the autocomplete suggestion list (not just typed) for geocoding to fire. Suggestions render in a portal.
- District is derived from the address/municipality — not entered manually.

## Test Data Created (cleanup candidate)
Row named `QA Automation Test POI - Clinic`; linked to the `QA Automation Test Site Type` site type.
