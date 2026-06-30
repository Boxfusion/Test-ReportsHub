# Report: NC Dispatch — Create Incident → Dispatch chain (live, headed) · incident 588

**Date:** 2026-06-24 14:55 UTC
**Plan:** test-plans/operational/incident-creation.md (TC-01 + dispatch leg)
**Spec:** n/a — driven live via Playwright MCP
**Execution Mode:** ai-driven (live MCP)
**Result:** PASSED
**Summary:** incident created, owned, dispatched · SMS to caller/responder NOT received (open item) · resource auto-released
**Environment:** QA — https://ncdoh-dispatcher-adminportal-qa.shesha.app/

## Scenario
Full emergency flow using **our own records**, with the **user's phone number (0818400598)** as the caller number, to verify the dispatch SMS. Caller number was recognised by the app as existing contact **Nomfanelo Nhleko** (auto-filled caller name).

- **Incident:** **REF:20266/000588** (Broken Leg · P2-Amber · Kimberley Hospital · MVAPVA · Urban)
- **Caller:** 0818400598 (Nomfanelo Nhleko, auto-recognised)
- **Dispatched resource:** **AUTO TEST NC** (Auto Test Ambulance) · Responder **Auto Test Resource** (mobile set to 0818400598)

## Step results
- [PASS] Login as Call Taker **`autotestcalltaker`** → NEW → Incident
- [PASS] Caller Number **0818400598** → app dialog *"Existing Reporter Number … associated with Caller: Nomfanelo Nhleko"* → **OK** auto-filled caller name + prior Location Type (Urban)
- [PASS] Address **Kimberley Hospital, Du Toitspan Road** (Google Places); Call Type **Broken Leg**; Case Type **MVAPVA**; Location Type **Urban**; Call Triage auto **P2-Amber**
- [PASS] **Save Incident** → **REF:20266/000588** created (no duplicate modal)
- [PASS] Login as Dispatcher **`qaagent2306`** → open 588 → **Take Ownership** (double-confirm) — `PUT TakeOwnershipOfIncident 200`
- [PASS] Dispatch edit form required **Delivery Point** + **Triage at Dispatch** before DISPATCH enables — filled **Delivery Point = Kimberly Hospital (0.22km)**, **Triage at Dispatch = P2-Amber** → **Save Incident** (`PUT UpdateIncident 200`) → **DISPATCH** enabled
- [PASS] (BLOCKING) **DISPATCH** AUTO TEST NC → `POST CreateIncidentAssignment 200` → status **CREW INFORMED**, incident **NEW → OPEN**

## Auto-progression — resource released without manual lifecycle
After DISPATCH (CREW INFORMED), I attempted to drive the status lifecycle via **Update Dispatch Status**, but before I could, the assignment had already advanced to **RELEASED** and the incident **auto-CLOSED** (588 shows **CLOSED**, AUTO TEST NC under **Previously Allocated Resources → RELEASED**, *Crew: Not Specified*).

**Evidence it was server-side, not a UI action:** the only mutating dispatch call in the network log is `CreateIncidentAssignment` (the DISPATCH). There is **no** `UpdateIncidentAssignment`/status-change/release REST call from the browser. The release+close therefore came from the backend (most likely an auto-responder/simulator tied to the **AUTO TEST NC** test vehicle, delivered via the `signalr-dispatcherHub` push). Consequence: the manual En-route→On-scene→…→Released lifecycle can't be exercised on this particular resource because it self-releases on dispatch. (Contrast 2026-06-23 incident 586, where the lifecycle *was* manually driven — so this auto-release may be intermittent or was newly introduced.)

## Open item — dispatch SMS still not received
The user did **not** receive an SMS to **0818400598**, despite (a) the responder **Auto Test Resource** mobile being set to that number earlier today, and (b) the caller number also being that number. The SMS is sent server-side (no client-side SMS request is observable in the network), so this cannot be confirmed/debugged from the browser. Telephony `GetAgent` returns **500** (CCP Offline) throughout — though dispatch itself does not depend on telephony.
**Next steps (need backend/team):** confirm whether the dispatch SMS provider is configured/enabled on QA, which field it targets (responder vs caller), and whether the auto-release fires/cancels the notification before it sends.

## Notes
- Used our records: Call Taker `autotestcalltaker`, Dispatcher `qaagent2306`, vehicle **AUTO TEST NC**, responder **Auto Test Resource**.
- Dispatch gate (active shift assignment dated today) was satisfied — AUTO TEST NC shift was set to 24/06/2026 earlier today; it showed **AVAILABLE** and dispatched with CCP Offline (confirms dispatch is not telephony-gated).
- New since the 586 run: the post-ownership edit form now **requires Delivery Point + Triage at Dispatch** before DISPATCH enables.
- Incident exposes a **Reopen** button (it is closed).
