# Report: Resources — Add New (Management CRUD)

**Date:** 2026-07-06 11:39 UTC
**Plan:** (ad-hoc live run — no paired plan yet) Management → Resources → Add New
**Spec:** n/a
**Execution Mode:** live-mcp (Playwright MCP, manual drive)
**Result:** PASSED (with 1 observation to investigate)
**Duration:** ~2 min

## Environment
| Key | Value |
|-----|-------|
| App | PD-Dispatch (Dispatcher Admin Portal — master/PD site) |
| URL | https://pd-dispatcher-v2-adminportal-qa.shesha.app |
| Environment | QA |
| User | Admin (System Administrator) |
| View mode | Latest |
| Admin table | `/dynamic/Boxfusion.Ems/resources` (form `resources-create-form v15`) |

## Summary
| Total Steps | Passed | Failed | Skipped |
|-------------|--------|--------|---------|
| 2 | 2 | 0 | 0 |

Created **1 Resource**, linked to our **QA Automation Test Station** via Dispatch Base. Verified persisted via search (count 6 → 7).

## Step Results

### TC-01 — Re-login + navigate
**Mode:** live-mcp
- [PASS] Logged in as Admin (verified username was `Admin`, not the leftover agent name); view mode **Latest**. Reached Resources table via `/dynamic/Boxfusion.Ems/resources` (6 existing items).

### TC-02 — Create resource
**Mode:** live-mcp
- [PASS] First Name = **QA Resource**; Last Name = **Test**; Email = **qa.resource@test.com**; Mobile = **0823333333**; Username = **QAResource**; Password/Verify = Password@1.
- [PASS] Position = **Paramedic**; Skill Type = **Paramedics** (selected); Dispatch Area = **City of Mbombela Local Municipality**.
- [PASS] **Dispatch Base = QA Automation Test Station** (reused our record) — field appeared conditionally after Dispatch Area was set, filtered to that municipality's stations.
- [PASS] Saved; row confirmed via search. ID `e9753b47-32e6-4cda-937a-c3919a2501f6`. Count 6 → 7.

## Notes / Observations
- Form `resources-create-form v15` fields (all required*): First Name, Last Name, Email, Mobile Number, Position (combobox: roles), Skill Type (multi-select combobox: skills), Dispatch Area (municipality combobox), **Dispatch Base** (station combobox — appears only after Dispatch Area is chosen, and is filtered to stations in that area), Username (pre-fills "Admin" — overwrite), Password (pre-fills Password@1), Verify Password.
- ⚠️ **Possible data discrepancy (investigate):** Skill Type was selected as **Paramedics** (confirmed as a tag in the form before submit), but the saved row shows **"Basic Ambulance Assistants, Operational Emergency Care Orderly"** instead. The MCP harness did set Paramedics, so this is either (a) the app deriving/overriding Skill Type from the Position server-side, or (b) a save bug dropping the selection. Not classified as a confirmed bug — flagged for the user to confirm expected behavior. Ruled out harness cause (selection was visible pre-submit).
- Username pre-fill gotcha applies here too (defaults to logged-in user "Admin").

## Test Data Created (cleanup candidate)
Resource `QA Resource Test` (QAResource) — Dispatch Base = QA Automation Test Station.
