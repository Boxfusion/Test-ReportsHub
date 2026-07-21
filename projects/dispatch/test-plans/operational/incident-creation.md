# NC Dispatch — Operational: Create Incident (Call Taker)

> **Source of truth.** This markdown plan is canonical; the paired `incident-creation.spec.ts` is the
> derived runtime artefact. This test **creates a new incident on QA each run** (stateful create).

| App | URL | Environment |
|-----|-----|-------------|
| NC Dispatch (Dispatcher Admin Portal) | https://ncdoh-dispatcher-adminportal-qa.shesha.app/login | QA |

**Logged in as:** Auto Test Call Taker (`autotestcalltaker` / 123qwe) — role **Call Taker**

## Scenario
A Call Taker logs a new emergency incident from the Dispatcher console.

## Test Cases
- **TC-01 — Call Taker logs a new incident.**
  1. Log in as the Call Taker; the Dispatcher dashboard loads.
  2. **Expand the incident list panel** (`#incidentListPanelId_toggleButton`) — required so the
     overlapping Resources/map/sidebar panels don't intercept the **NEW** button.
  3. **NEW → Incident** opens the "Add a New Incident" form.
  4. Fill required fields: Caller Number (unique per run), Address (Google Places), Call Type
     (**Heart Attack**), Case Type (**MVAPVA**), Location Type (**Urban**); Call Triage auto-fills.
  5. Dismiss the **"Possible Duplicate Incidents"** modal if it appears (address-proximity check).
  6. **Save Incident**.
  7. ASSERT (BLOCKING) the new incident opens with a `REF:NNNNN/NNNNNN` heading and shows Call Type
     **Heart Attack**.

## Notes
- **Role-gated:** NEW is disabled for Admin; only the Call Taker role can create incidents.
- **Expand the panel before NEW** — otherwise the click is intercepted by overlapping panels.
- No `networkidle` waits (this Shesha app never settles); waits are on concrete elements.
- The dispatch half (assigning a resource) is gated behind Amazon Connect telephony and is out of
  scope for this automated test.
