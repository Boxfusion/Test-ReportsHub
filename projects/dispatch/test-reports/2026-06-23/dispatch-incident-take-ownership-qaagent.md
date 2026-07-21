# Report: NC Dispatch — Dispatcher Take Ownership + Dispatch attempt (live, headed)

**Date:** 2026-06-23 09:42 UTC
**Plan:** test-plans/operational/incident-creation.md (TC-01 continuation — dispatch leg)
**Spec:** n/a — driven live via Playwright MCP (headed)
**Execution Mode:** ai-driven (live MCP)
**Result:** PARTIAL
**Summary:** Take Ownership PASSED; Dispatch BLOCKED (no on-shift/online resources — telephony/shift gating
**Environment:** QA — https://ncdoh-dispatcher-adminportal-qa.shesha.app/

## Scenario
Continuing from the Call Taker incident **REF:20266/000585** (Broken Leg, P2-Amber, Kimberley Hospital), log in as a **Dispatcher**, take ownership of the incident, and dispatch it to a responder — using **our created records** where a resource is referenced.

- **Logged in as:** `qaagent2306` (Auto QA Agent 2306) — granted the **Dispatcher** role + **Auto Test Station** (edited earlier this session; agent id `e99faf6c-…`).
- **Incident:** **REF:20266/000585**.

## Step results
- [PASS] Login as `qaagent2306` / 123qwe → Dispatcher dashboard
- [PASS] Open incident **REF:20266/000585** (Broken Leg · P2-Amber · Call Taker = Auto QA Agent 2306 · Kimberley Hospital)
- [PASS] **Take Ownership** → required a **second confirm click** on the red danger button (`button.ant-btn-dangerous`); incident flipped into the dispatcher edit/dispatch view (form `Boxfusion.Ems/incident-create` v14). Ownership now held by `qaagent2306`.
- [INFO] Dispatch view surfaced new required fields **Delivery Point\*** and **Triage at Dispatch\***; **Alternative Disptach** button became enabled.
- [BLOCKED] **Resources panel** showed *"There are currently no resources."* Selecting Resource Type **Auto Test Ambulance** (our vehicle QA-NC-2306's type) surfaced no resource — only on-shift/online resources appear.
- [BLOCKED] **Alternative Disptach → "Manual Dispatching"** modal opened (Resource selector + Dispatch/Cancel). The Resource picker returned **"No data"** for both a `QA` filter and an unfiltered list — there are **no dispatchable resources at all** in QA.

## Conclusion
**Take Ownership works end-to-end.** The actual **dispatch-to-responder step cannot be exercised** in QA: a resource only becomes dispatchable when a **crew + vehicle is on an active, online shift**, and bringing a resource *online* requires the responder mobile app / **Amazon Connect telephony** — the same gating documented in the 2026-06-17 run. Confirmed via **two independent paths** (live Resources panel **and** the Manual Dispatching picker) — both empty.

## What would be needed to unblock dispatch
1. Create + start a **Shift** and a **Shift Assignment** placing our crew **QA-CREW-2306** (member Auto QA Resource 2306) on an active shift with vehicle **QA-NC-2306**.
2. The assigned resource must come **online** — which (per prior findings) requires the mobile responder app / telephony layer not available from the admin portal.

So even with a shift set up, dispatch likely remains gated without the mobile/telephony piece. Flagged for the user to decide whether to attempt the shift route.

## Notes
- Used our own records throughout: Dispatcher login `qaagent2306`, and attempted to assign our resource type **Auto Test Ambulance** (vehicle QA-NC-2306) per the reuse-our-records rule.
- **Take Ownership requires a double confirmation** (initial button → red danger confirm). Worth noting for the operational plan.
- The Resource Type dropdown intercepts clicks (overlay) — dismiss with Escape before clicking sibling controls; Escape inside the Manual Dispatching modal must target the open dropdown, not the modal.
