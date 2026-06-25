# Report: NC Dispatch — Dispatch + full status lifecycle on incident 585 (SMS test)

**Date:** 2026-06-23 12:52 UTC
**Plan:** test-plans/operational/incident-creation.md (dispatch + status lifecycle leg)
**Spec:** n/a — driven live via Playwright MCP (headed)
**Execution Mode:** ai-driven (live MCP)
**Result:** PASSED (dispatch + lifecycle) · SMS notification NOT yet received (open item)
**Environment:** QA — https://ncdoh-dispatcher-adminportal-qa.shesha.app/

## Scenario
Re-use the pre-existing incident **REF:20266/000585** (Broken Leg · P2-Amber), which `qaagent2306` already owned, to dispatch a vehicle and drive the full dispatch-status lifecycle — partly to verify the **dispatch SMS notification** (the user set a phone number to receive an SMS when a vehicle is dispatched).

## Step results
- [PASS] Login Dispatcher `qaagent2306` → open incident **585** (already owned by *Auto QA Agent 2306*)
- [PASS] **AUTO TEST NC / Auto Test Ambulance** available again (released from 586 earlier) → **DISPATCH** → allocated, **CREW INFORMED**
- [PASS] Drove the full status lifecycle via Update Dispatch Status (Time = picker "Now" each step):

| # | Status | ~Time |
|---|---|---|
| 1 | Crew Informed | 14:58 |
| 2 | Accepted | 14:59 |
| 3 | Mobile To Scene | 14:59 |
| 4 | On Scene | 15:00 |
| 5 | Mobile From Scene | 15:01 |
| 6 | At Hospital | 15:01 |
| 7 | Released | 15:02 |

- [PASS] On **Released**, AUTO TEST NC moved to **Previously Allocated Resources** (incident auto-closes, as seen on 586)

## Open item — dispatch SMS not received
The user did not receive the dispatch SMS through dispatch or any status change. Likely cause: the SMS targets the **mobile number on the responder record (Auto Test Resource)** assigned to AUTO TEST NC, not a number entered on the incident/caller. Next steps proposed (not yet done): (a) check/update the **Auto Test Resource** phone number under Admin → Resources to the user's number and re-dispatch; (b) inspect the dispatch network/console to confirm whether an SMS request is emitted. (Times shown in the app's +2 timezone.)

## Notes
- Same mechanics as the 586 run — see `dispatch-vehicle-incident-586.md` for the dispatch gate (active shift assignment), Take Ownership double-confirm, and the "Now"-picker behaviour.
- Used our records: Dispatcher `qaagent2306`, vehicle **AUTO TEST NC**, crew incl. **QA-CREW-2306**.
