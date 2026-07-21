# Report: NC Dispatch — Operational incident-dispatch lifecycle, full chain to Released (live, headed) · incident 591

**Date:** 2026-06-25 08:21 UTC
**Plan:** test-plans/operational/incident-dispatch-lifecycle.md (reusing the 586/588 record set)
**Spec:** n/a — driven live via Playwright MCP
**Execution Mode:** ai-driven (live MCP)
**Result:** PASSED
**Summary:** incident created, owned, dispatched, **full status lifecycle driven Crew Informed → Released**, incident auto-closed
**Environment:** QA — https://ncdoh-dispatcher-adminportal-qa.shesha.app/

## Scenario
End-to-end emergency flow **reusing the existing 23–24 June records** (NOT the records created today): a Call Taker logs an incident, a Dispatcher takes ownership and dispatches the on-shift **AUTO TEST NC**, then drives the resource through its complete status lifecycle.

- **Incident:** **REF:20266/000591** (Broken Leg · P2-Amber · Kimberley Hospital · MVAPVA · Urban)
- **Caller:** 0818400598 → auto-recognised as existing contact **Nomfanelo Nhleko**
- **Dispatched resource:** **AUTO TEST NC** (Auto Test Ambulance) · Responder **Auto Test Resource**

## Reused details (per instruction — yesterday / day-before set)
Call Taker `autotestcalltaker` · Dispatcher `qaagent2306` · vehicle **AUTO TEST NC** · Call Type **Broken Leg** · Case Type **MVAPVA** · Location **Urban** · Address **Kimberley Hospital, Du Toitspan Road** · Caller **0818400598**. None of today's newly-created records were used in this run.

## Step results
- [PASS] **Shift gate:** refreshed AUTO TEST NC's existing shift assignment **24/06 → 25/06/2026** (08:00–17:00, Auto Test Station) — `PUT UpdateDispatchShiftAssignment 200`. On the Resources panel it then showed **AVAILABLE** (current time ~10:15 SAST, in-window).
- [PASS] Login as Call Taker `autotestcalltaker` → NEW → Incident.
- [PASS] Caller Number **0818400598** → dialog *"Existing Reporter Number … associated with Caller: Nomfanelo Nhleko"* → **OK** auto-filled caller name + prior Location Type **Urban**.
- [PASS] Address **Kimberley Hospital** (Google Places); Call Type **Broken Leg**; Case Type **MVAPVA**; Location **Urban**; Call Triage auto **P2-Amber**.
- [PASS] **Save Incident** → **REF:20266/000591** — `POST CreateIncident 200`.
- [PASS] Login as Dispatcher `qaagent2306` → open 591 → **Take Ownership** (double confirm) — `PUT TakeOwnershipOfIncident 200`.
- [PASS] Post-ownership edit form required **Delivery Point** + **Triage at Dispatch** — set **Delivery Point = Kimberly Hospital (0.22km)**, **Triage at Dispatch = P2-Amber** → **Save Incident** (`PUT UpdateIncident 200`) → **DISPATCH** enabled.
- [PASS] (BLOCKING) **DISPATCH** AUTO TEST NC → `POST CreateIncidentAssignment 200` → status **CREW INFORMED**, incident **NEW → OPEN**.

## Dispatch status lifecycle — fully driven (Update Dispatch Status → Time "Now" → Status → Update)
Each transition committed with the picker's "Now" timestamp; the resource card label updated live, finally moving to **Previously Allocated Resources** on Released.

| # | Status | REST call |
|---|--------|-----------|
| 1 | Crew Informed | (set on dispatch) |
| 2 | Accepted | `PUT UpdateIncidentAssignmentStatus 200` |
| 3 | Mobile To Scene | `PUT UpdateIncidentAssignmentStatus 200` |
| 4 | On Scene | `PUT UpdateIncidentAssignmentStatus 200` |
| 5 | Mobile From Scene | `PUT UpdateIncidentAssignmentStatus 200` |
| 6 | At Hospital | `PUT UpdateIncidentAssignmentStatus 200` |
| 7 | Released | `PUT UpdateIncidentAssignmentStatus 200` |

Six `UpdateIncidentAssignmentStatus` PUTs (one per manual transition), all 200.

## Key finding — no auto-release this run (contrast 24/06 incident 588)
On 2026-06-24 (incident 588) AUTO TEST NC **auto-released and the incident auto-closed on dispatch**, blocking the manual lifecycle. **This run it did NOT auto-release** — it sat at CREW INFORMED and the full manual chain ran to Released. This confirms the 588 auto-release was **intermittent**, not a permanent behaviour change. Setting **Released auto-closed** incident 591 (a **Reopen** button is now exposed and AUTO TEST NC sits under *Previously Allocated Resources*), matching the 586 behaviour.

## Open item — dispatch SMS to 0818400598 (unverified)
As on prior runs, the dispatch/notification SMS is sent server-side with no client-observable request, so receipt at **0818400598** cannot be confirmed from the browser. Still flagged for backend/team to confirm provider config on QA. (See 2026-06-24 incident-588 report.)

## Test-harness note (not an app bug)
The **incidents-dashboard** NEW button and incident cards render **behind the collapsed Shesha sidebar** at the automation viewport (panels positioned at negative x), so MCP clicks were intercepted. Worked around by neutralising the overlay's `pointer-events` before the real click and activating the NEW dropdown's rendered menu. The detail/dispatch view itself behaved normally. Worth recording for the spec author.
