# PD-Dispatch — Incident Actions (Call Taker) — mirror of NC 3.2

**Date:** 2026-07-13
**App:** PD-Dispatcher V2 Admin Portal (QA) — https://pd-dispatcher-v2-adminportal-qa.shesha.app
**Driver:** Live via Playwright MCP (headed), as Call Taker `QACallTaker`
**Mirrors:** NC Dispatch 3.2 incident-action suite (ADO #65970/#65971/#65972/#65973/#65974/#65976), run on NC 2026-07-10.
**Result:** PASSED (6/6) — every action confirmed at the API layer (endpoint + HTTP status) and in the UI.

**Records created this run (all our own, per policy):**
- **INC-A `20267/002451`** — P1-RED Chest Pain - Cardiac Arrest, Nelspruit Central (edited, +1 patient, cloned, then **merged-away**)
- **CLONE `20267/002452`** — clone of INC-A (**cancelled**)
- **INC-B `20267/002453`** — P1-RED, same caller/location (merge **survivor**)

Caller **0818400598** ("Nomfanelo Nhleko") reused for both incidents → same stored address (Nelspruit Central) → made INC-B a proximity merge candidate of INC-A.

## Summary

| Total | Passed | Failed |
|---|---|---|
| 6 | 6 | 0 |

## Case results

### #65970 — Priority icon colour — PASSED
INC-A created as Chest Pain - Cardiac Arrest → Call Triage auto **P1-Red**. Priority chip renders **red** (`background: rgb(255,0,0)`, white text) on the detail header; P1 map pin. ✔ (`assets/pd-incaction-002451-incA-detail.png`)

### #65971 — Edit patient — PASSED
INC-A → Patients tab → New Patient Info: **Test Patient-A / QACRUD**, Gender **Female** → Save Patient. **`POST …/EmsIncidentPerson/Crud/Create` → 200.** ✔ (`assets/pd-incaction-002451-patient-saved.png`)

### #65972 — Edit incident — PASSED
INC-A → Edit → Incident Notes changed to *"…edited via Edit Incident action (#65972 verify) 2026-07-13."* → Save Incident. **`PUT …/EmsIncidentActions/UpdateIncident` → 200**; notes persist. ✔

### #65974 — Clone — PASSED
INC-A → Clone → confirm → Clone Incident. **`POST …/EmsIncidentActions/CloneIncident?id=…` → 200.** New incident **20267/002452** labelled **"Cloned Incident"**, inheriting INC-A's caller + edited notes. ✔

### #65976 — Merge — PASSED
From **INC-A's** Merge dialog ("Select Incident to Merge"), candidate **20267/002453 (INC-B)** was listed → selected → Merge Incidents. **`PUT …/EmsIncidentActions/MergeIncident` → 200.** Result: **INC-A (002451) absorbed into INC-B (002453)** — INC-A → **CANCELLED**, now under INC-B → Child/Related Incidents; INC-B tagged **"Merged"**; INC-A dropped off the active dashboard list. ✔ (`assets/pd-incaction-merge-result.png`)
- **Semantics (same as NC):** from incident **X**'s dialog, selecting **Y** merges **X into Y** — **Y survives**, X is cancelled and linked as a child. Candidates populate on the earlier/primary incident.

### #65973 — Cancel — PASSED
Clone **002452** → Cancel → confirm *"Are you sure you want to Cancel Incident?"* → Yes. **`PUT …/EmsIncidentActions/CancelIncident?id=…` → 200.** Status → **CANCELLED** (header + card), detail now exposes **Reopen**. ✔ (`assets/pd-incaction-cancel-result.png`)

## Observations (non-blocking) — compared to NC

1. **Clone confirm typo reproduces on PD** — the Clone confirmation reads *"Are you sure you want to **cone**?"* (should be "clone"). Same cosmetic string defect as NC.
2. **List doesn't auto-refresh after Clone** — the new clone only appeared after a manual dashboard reload (same as NC obs #4).
3. **Merge modal DID auto-close on PD** after a successful merge (on NC it had to be closed manually — PD behaves better here).
4. **Merge candidate list** populated correctly on the primary/earlier incident (INC-A); no "no possible merges" glitch observed this run.

## Verdict
The full Call-Taker incident-action set works on PD-Dispatch with **no regressions vs NC** — all six endpoints returned success and every UI state matched expectations. Only the pre-existing cosmetic "cone" typo and the post-clone list-refresh lag carry over from NC.
