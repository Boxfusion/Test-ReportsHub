# Report: Incident Types — Add New (Management CRUD)

**Date:** 2026-07-06 09:08 UTC
**Plan:** (ad-hoc live run — no paired plan yet) Management → Incident Types → Add New
**Spec:** n/a
**Execution Mode:** live-mcp (Playwright MCP, manual drive)
**Result:** PASSED
**Duration:** ~6 min

## Environment
| Key | Value |
|-----|-------|
| App | PD-Dispatch (Dispatcher Admin Portal — master/PD site) |
| URL | https://pd-dispatcher-v2-adminportal-qa.shesha.app |
| Environment | QA |
| User | Admin (System Administrator) |
| View mode | Latest (switched from Live after login) |
| Admin table | `/dynamic/Boxfusion.Ems/incident-types` (form `incident-type-create-form v10`) |

## Summary
| Total Steps | Passed | Failed | Skipped |
|-------------|--------|--------|---------|
| 6 | 6 | 0 | 0 |

Created **4 Incident Types**, one per triage level, each with a required Triage Level + Incident Type and an (optional) Incident Life Cycle. All four verified persisted via table search after save.

## Step Results

### TC-01 — Login + switch view mode Live → Latest
**Mode:** live-mcp
- [PASS] Logged in as Admin at the QA login page.
- [PASS] View-mode selector switched from **Live** to **Latest** (confirmed in header).

### TC-02 — Navigate to Incident Types admin table
**Mode:** live-mcp
- [PASS] Sidebar flyout (Dispatch → Management) collapsed under automation (expected Shesha behavior); reached the table via direct URL `/dynamic/Boxfusion.Ems/incident-types`.
- [PASS] Table loaded — 160 existing items; columns Triage Level, Incident Types, Incident Life Cycle.

### TC-03 — Create P2-Amber incident type
**Mode:** live-mcp
- [PASS] Add New dialog opened (Triage Level*, Incident Type*, Incident Life Cycle).
- [PASS] Triage Level = **P2-Amber**, Incident Type = **QA Automation Test - Heat Exhaustion**, Life Cycle = **Close at Site**.
- [PASS] Saved; row confirmed in table search. ID `d5b4e7a7-4a79-44d0-8d7b-74eb21fe0f11`.

### TC-04 — Create P1-Red incident type
**Mode:** live-mcp
- [PASS] Triage Level = **P1-Red**, Incident Type = **QA Automation Test - Severe Haemorrhage**, Life Cycle = **Close at Delivery Point**.
- [PASS] Saved; row confirmed. ID `d6f9d6f5-e92b-4edb-86e7-e5f7cdbd4933`.

### TC-05 — Create P3-Green incident type
**Mode:** live-mcp
- [PASS] Triage Level = **P3-Green**, Incident Type = **QA Automation Test - Minor Laceration**, Life Cycle = **Close at Site**.
- [PASS] Saved; row confirmed. ID `55891613-c307-4ccf-a8b5-0bd02bd2425c`.

### TC-06 — Create P4-Blue incident type
**Mode:** live-mcp
- [PASS] Triage Level = **P4-Blue**, Incident Type = **QA Automation Test - Non-Urgent Patient Transfer**, Life Cycle = **Close at Delivery Point**.
- [PASS] Saved; row confirmed. ID `362b5a8d-d26d-4f7f-98d7-78118bf5e178`.

## Notes / Observations
- The **Add New** button is disabled while the create dialog is open (expected); re-enables after save.
- The Incident Type field is a `textarea`; Triage Level and Incident Life Cycle are AntD comboboxes whose options render in a body-level portal — filled via real click, not synthetic events.
- Triage Level options: P1-Red, P2-Amber, P3-Green, P4-Blue. Incident Life Cycle options: Close at Site, Close at Delivery Point.
- PD-Dispatch domain admin lives under the **Dispatch → Management** flyout (17 items — richer than NC Dispatch).

## Test Data Created (cleanup candidates)
All four rows are prefixed `QA Automation Test -` for easy identification/removal.
