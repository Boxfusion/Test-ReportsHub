# Report: NC Dispatch — Create Incident as Call Taker

**Date:** 2026-06-17
**Plan:** _Dispatcher console — operational incident logging (exploratory)_
**Spec:** _none — live MCP-driven execution (headed)_
**Execution Mode:** mcp-live (headed)
**Result:** PASSED (incident created) — dispatch step BLOCKED (telephony-gated)

| App | URL | Environment |
|-----|-----|-------------|
| NC Dispatch (Dispatcher Admin Portal) | https://ncdoh-dispatcher-adminportal-qa.shesha.app/login | QA |

**Logged in as:** Auto Test Call Taker (`autotestcalltaker` / 123qwe) — role **Call Taker**

## Scenario
Log a new emergency incident from the Dispatcher console as a **Call Taker**, using the test data
created earlier in the session, then attempt to dispatch a resource to it.

## Result — Incident created ✅
A new incident was saved and appears at the top of the Incidents list (count 9 → **10**):

| Field | Value |
|---|---|
| **Ref No** | **20266/000581** |
| Call Type | Broken Arm |
| Case Type | MVAPVA |
| Location Type | Urban |
| Call Triage | P3-Green (auto-set from Call Type) |
| Status | NEW (Not Assigned) |
| Caller Number | 0820000099 |
| Address | North Cape Mall, Memorial Road, Royldene, Kimberley, Northern Cape (Google Places) |
| Date Reported | 2026/06/17 16:49 |
| Call Taker | Auto Test Call Taker (recorded automatically) |
| Incident Notes | "Auto test incident logged by Call Taker — broken arm at North Cape Mall." |

The detail panel (`Boxfusion.Ems/ems-incident-details`) confirmed all values persisted.

## The working create-incident flow (important)
Incident creation is **role- and layout-gated**. The reliable sequence is:

1. **Log in as a Call Taker** — the **NEW** button is **disabled for Admin**; it only enables for the
   Call Taker role. (Dispatchers/Call Takers are Agents distinguished by the **Roles** field.)
2. **Expand the incident list panel** first (`#incidentListPanelId_toggleButton`). Until expanded, the
   collapsed Resources panel, map canvas, and left sidebar overlap the **NEW** button and intercept the
   click. Expanding the panel reflows the layout so NEW is clickable.
3. Click **NEW → Incident** → the "Add a New Incident" form (`Boxfusion.Ems/incident-create`) opens.
4. Required fields (`*`): **Caller Number, Address, Call Type, Case Type, Location Type, Call Triage**
   (Call Triage auto-populates from the Call Type). Patient/vitals section is optional.
5. **Save Incident**.

Option lists observed:
- **Case Type:** MVAPVA, Assault, Burns, Electric Shock, Shooting, Train Casualty, Rape, Drowning Sea,
  Drowning Fresh, Bites Stings.
- **Location Type:** Urban, Rural, Other.
- **Call Type** includes our **Broken Arm** (created earlier this session).

## Blocker — Dispatch is telephony-gated ❌
After saving, the incident's **Available Resources** panel listed our **AUTO TEST NC / Auto Test
Ambulance** (Auto Test Resource + AutoTestCrew 003, AVAILABLE) and BXS879NC, but **every DISPATCH
button is disabled** (and "Alternative Dispatch" too). Selecting a resource card does not enable them.

Root cause: the operator presence is **Offline** — the console's **Login** is an **Amazon Connect**
telephony (CCP) agent login (`pd-contactcentre.awsapps.com`) requiring agent credentials we don't have.
The same gate disables **NEW** for non-online users and now **DISPATCH**. Dispatching can't be completed
under automation without a telephony agent session.

## Pre-staged data used (all created earlier on 2026-06-17)
- Call Type **Broken Arm**; Vehicle **AUTO TEST NC** / Vehicle Type **Auto Test Ambulance**;
  Resource **Auto Test Resource** (Paramedic); Crew **AutoTestCrew 003**; Station **Auto Test Station**;
  Call Taker + Dispatcher agents provisioned to Auto Test Station.

## Notes / lessons
- **Call Taker role is required to create incidents** — Admin cannot (NEW disabled).
- **Expand the incident list panel before clicking NEW** — otherwise overlapping panels block the click
  (Playwright reports the sidebar/resources/map "intercepts pointer events"). This is the single most
  important step for automating this screen.
- AntD **NEW** is a dropdown (Incident / Scheduled Transfer) needing a real click; synthetic JS events
  don't open it.
- **Dispatch + telephony (Dial/End Call, DISPATCH) require Amazon Connect agent login** — out of reach
  for this automated session.
- Browser closed after the incident was saved.
