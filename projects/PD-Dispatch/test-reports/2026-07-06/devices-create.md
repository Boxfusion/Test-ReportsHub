# Report: Devices (Mobile Devices) — Add New (Management CRUD)

**Date:** 2026-07-06 10:10 UTC
**Plan:** (ad-hoc live run — no paired plan yet) Management → Devices → Add New
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
| Admin table | `/dynamic/Boxfusion.Dispatcher/mobile-devices` (form `mobile-device-create-form v7`) |

## Summary
| Total Steps | Passed | Failed | Skipped |
|-------------|--------|--------|---------|
| 3 | 3 | 0 | 0 |

Created **1 Device** with all 5 required fields. First attempt was aborted by an Escape-key gotcha (see notes); redo succeeded. Verified persisted via grid (count 2 → 3).

## Step Results

### TC-01 — Re-login + navigate
**Mode:** live-mcp
- [PASS] Re-logged in as Admin; view mode **Latest**. Reached Devices table via `/dynamic/Boxfusion.Dispatcher/mobile-devices` (2 existing items).

### TC-02 — Create device
**Mode:** live-mcp
- [PASS] Name = **QA Automation Test Device**; IMEI No = **356938035643809**; Model = **Samsung Galaxy A54**; SIM-Card No = **0821234567**; Device Operating System = **Android**.
- [PASS] Saved on the second attempt; row confirmed in grid. Auto Ref No **Device000071**. ID `47608f15-4f30-4a21-9bb7-55ee4f5b719a`. Count 2 → 3.

## Notes / Observations
- Form `mobile-device-create-form v7` fields (all required*): Name, IMEI No, Model, SIM-Card No, Device Operating System (combobox: iOS / Android / Other).
- **Ref No is auto-generated** (DeviceNNNNNN) — not entered.
- **Registration Number** (grid column, links a device to a vehicle) is NOT on the create form — assigned later. New device shows a blank Registration Number.
- ⚠️ **Escape-key gotcha:** pressing Escape to dismiss the OS dropdown on this form **closed the entire dialog** and discarded the record (first attempt lost). Unlike Vehicle Types (where Escape only closed the option list), here just click the option then click OK directly — do NOT press Escape.

## Test Data Created (cleanup candidate)
Row named `QA Automation Test Device` (Ref No Device000071).
