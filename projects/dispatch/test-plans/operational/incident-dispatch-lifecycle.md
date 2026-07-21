# NC Dispatch — Operational: Incident Dispatch Lifecycle (Call Taker → Dispatcher)

> **Source of truth.** This markdown plan is canonical; the paired `incident-dispatch-lifecycle.spec.ts`
> is the derived runtime artefact and **still needs a live `/CreateTest` recording pass** (see Status).
> This plan **creates a new incident and dispatches a resource on QA each run** (stateful).
>
> **Status:** plan authored 2026-06-24 from the live MCP run on incident **REF:20266/000588**; spec NOT yet recorded.

| App | URL | Environment |
|-----|-----|-------------|
| NC Dispatch (Dispatcher Admin Portal) | https://ncdoh-dispatcher-adminportal-qa.shesha.app/login | QA |

**Logins:** Call Taker `autotestcalltaker` / 123qwe · Dispatcher `qaagent2306` / 123qwe
**ADO:** plan #65099 — suites **4.2 Incident Details (Take Ownership)**, **4.3 Update Dispatch Information**, **4.4 Resources Panel**, **4.5 Dispatching a Resource** (covers the gap beyond `incident-creation`, which is only the Call-Taker create step / 3.2).

## Scenario
End-to-end emergency flow: a **Call Taker** logs an incident, a **Dispatcher** takes ownership, completes the dispatch details, dispatches an on-shift vehicle, drives the dispatch-status lifecycle, and the incident closes.

## Preconditions (live setup — REQUIRED before the dispatch leg)
- A vehicle+crew on an **active shift assignment dated *today*, within its time window** (e.g. **AUTO TEST NC** on `Auto Test Shift` 08:00–17:00). Dispatch availability depends on this, **not** on telephony (CCP can be Offline). Set via `/dynamic/Boxfusion.Dispatcher/dispatch-shift-assignment-table`.
- (For SMS verification only) the responder's mobile set to the target number under `/dynamic/Boxfusion.Ems/resources`.

## Test Cases

- **TC-01 — Call Taker logs a new incident.**
  1. Log in as Call Taker; neutralise overlay panels (collapsed left `aside`, the mapbox canvas, and the non-incident `.sidebar-container`s all intercept clicks under automation).
  2. **NEW → Incident**; fill Caller Number (unique per run), Address (Google Places — type, then ArrowDown+Enter), Call Type **Broken Leg**, Case Type **MVAPVA**, Location Type **Urban**; Call Triage auto-fills **P2-Amber**.
  3. **Save Incident.**
  - ASSERT (BLOCKING) the incident opens with a `REF:NNNNN/NNNNNN` heading, status **NEW**.

- **TC-02 — Dispatcher takes ownership (ADO 4.2).**
  1. Log out; log in as Dispatcher `qaagent2306`; widen viewport; expand the incident-list panel; open the new incident.
  2. Click **Take Ownership** → confirm on the red **Take Ownership** dialog (double-confirm).
  - ASSERT (BLOCKING) heading shows owner `(Auto QA Agent 2306)`; the view flips to the dispatch edit form.

- **TC-03 — Complete dispatch details (ADO 4.3).**
  1. On the post-ownership edit form, fill the **newly-required** fields **Delivery Point** (nearest destination, e.g. *Kimberly Hospital (0.22km)*) and **Triage at Dispatch** (**P2-Amber**).
  2. **Save Incident.**
  - ASSERT (BLOCKING) both saved; **DISPATCH** becomes enabled. *(These two fields did not exist in the 2026-06-17 form — DISPATCH stays disabled until they're set.)*

- **TC-04 — Dispatch a resource (ADO 4.4 + 4.5).**
  1. In **Available Resources**, confirm the on-shift vehicle (**AUTO TEST NC / Auto Test Ambulance — AVAILABLE**, responder + crew listed).
  2. Click **DISPATCH**.
  - ASSERT (BLOCKING) `POST …/EmsIncidentAssignmentActions/CreateIncidentAssignment` → 200; resource shows **CREW INFORMED** under *Allocated Resources*; incident status **NEW → OPEN**.

- **TC-05 — Drive dispatch-status lifecycle (ADO 4.3).** *(BLOCKED on AUTO TEST NC — see Notes)*
  1. **Update Dispatch Status** → set **Time = "Now"** → Status, committing each: Accepted → Mobile To Scene → On Scene → Mobile From Scene → At Hospital → **Released**.
  - ASSERT each transition stamps and the resource card label updates.

- **TC-06 — Auto-close on Released + Reopen.**
  - ASSERT on **Released** the resource moves to *Previously Allocated Resources* and the incident **auto-CLOSES**; the detail exposes **Reopen** (CLOSED → OPEN) and an explicit **Close** (confirm dialog).

## Notes / known blockers (record the spec around these)
- **Cross-role:** TC-01 is Call Taker; TC-02+ are Dispatcher. The spec needs two logins (or two `test.describe` blocks with a re-auth helper) — not a single linear session.
- **AUTO TEST NC auto-releases on dispatch (2026-06-24):** after CREW INFORMED the assignment advanced to **RELEASED** and the incident auto-closed **with no UI status calls** (server-side, likely an auto-responder/simulator on this test vehicle via `signalr-dispatcherHub`). So **TC-05 cannot be driven deterministically on AUTO TEST NC** — either use a different (non-auto-releasing) test vehicle, or assert the auto-release path explicitly. On 2026-06-23 (incident 586) the lifecycle WAS manually drivable, so this may be intermittent/new — confirm before recording TC-05.
- **Overlap gotcha:** the dashboard layers map/resources panels over the form; clicks get "pointer events intercepted". Neutralise the offending overlay (disable `pointer-events` on the `aside`, `.mapboxgl-map`, and the non-active `.sidebar-container`) before interacting; the action buttons (NEW, Take Ownership, DISPATCH, Save Incident) often need a JS `.click()` fallback.
- **Dispatch is not telephony-gated:** `Telephony/GetAgent` returns 500 (CCP Offline) throughout, yet dispatch succeeds — the gate is the shift assignment.
- No `networkidle` waits (this Shesha app never settles) — wait on concrete elements.
