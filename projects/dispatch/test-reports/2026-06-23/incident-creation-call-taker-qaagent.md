# Report: NC Dispatch — Create Incident as Call Taker (our own agent + call type)

**Date:** 2026-06-23 09:30 UTC
**Plan:** test-plans/operational/incident-creation.md (TC-01)
**Spec:** n/a — driven live via Playwright MCP (headed)
**Execution Mode:** ai-driven (live MCP)
**Result:** PASSED — incident created (dispatch step out of scope, telephony-gated)
**Environment:** QA — https://ncdoh-dispatcher-adminportal-qa.shesha.app/

## Scenario
A Call Taker logs a new emergency incident from the Dispatcher console — using **records we created** for both the login and the call type (per the reuse-our-records rule).

- **Logged in as:** `qaagent2306` (Auto QA Agent 2306) — the Call Taker agent created earlier today.
- **Incident created:** **REF:20266/000585** (Not Assigned).

## Step results
- [PASS] Login as Call Taker `qaagent2306` / 123qwe → Dispatcher dashboard
- [PASS] Collapse left nav + expand incident-list panel (`#incidentListPanelId_toggleButton`) so **NEW** isn't intercepted by the overlapping sidebar/panels
- [PASS] **NEW → Incident** opens "Add a New Incident"
- [PASS] Caller Number `0820623306`; Address `Kimberley Hospital, Du Toitspan Road…` (Google Places, selected via keyboard ArrowDown+Enter); **Call Type = Broken Leg** (our created call type); Case Type = MVAPVA; Location Type = Urban
- [PASS] **Call Triage auto-filled to P2-Amber** — matches the triage we set when creating the Broken Leg call type (confirms the link took)
- [PASS] No "Possible Duplicate Incidents" modal appeared
- [PASS] (BLOCKING) Save Incident → opened with heading **REF:20266/000585**; incident shows Broken Leg / P2-Amber / Kimberley Hospital

## Notes
- Used our own records throughout: Call Taker login `qaagent2306` and Call Type `Broken Leg` (both created earlier this session).
- Two "Broken Leg" call types exist (the live one + a timestamped one from the `incident-types` spec TC-05 run); selected the exact `Broken Leg`.
- **NEW is role-gated** to Call Taker (disabled for Admin) — confirmed by logging in as the Call Taker.
- The left nav sidebar (even collapsed) overlaps the NEW button; expanding the incident-list panel is what clears it.
- Dispatch half (resource assignment) is gated behind Amazon Connect telephony — out of scope, as in the 2026-06-17 run.
