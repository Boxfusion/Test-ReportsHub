# Report: EC DEDEA — Bid Management Full Chain E2E — 90/10
**Date:** 2026-07-27
**Variant:** 90/10
**App:** EC DEDEA SmartGov2 Admin Portal — https://ecdedea-smartgov2-adminportal-qa.shesha.app/ (QA)
**Execution Mode:** ai-driven (live MCP browser, headed)
**Result:** PASSED — tender reached **Completed / Awarded** to **A & A Stationers** (R100,000), awarded 27/07/2026
**Tender:** `REF2026-2200` — "EC DEDEA Bid Management E2E - REF2026-2200"

## Scope

Drove the complete PD-Bid Management (Tender Process) workflow live from initiation to
Capture Order Details, switching between every role in the chain. Evaluation criteria 90/10,
Compulsory + Hybrid briefing.

## Suppliers & result

Three manual supplier responses captured (all marked Compliant at Verify Compliance):

| Supplier | Proposed price | Functionality avg (min 60) | Goal pts | Overall | Rank | Outcome |
|---|---|---|---|---|---|---|
| **A & A Stationers** | R100,000 | 90 (92/88/90) | 10 | **100** | **1** | **Recommended → Awarded** |
| Telkom | R120,000 | 74.33 (70/78/75) | 8 | 80 | 2 | Not Recommended |
| BOXFUSION | R150,000 | 60 (55/65/60) | 6 | 51 | 3 | Not Recommended |

Functionality scores by evaluator — Cedrick: A&A 90 / Telkom 75 / BOXFUSION 60; BokangN: 88 / 78 / 65; BonoloB: 92 / 70 / 55.

## Stages driven (role → action)

| # | Stage | User | Outcome |
|---|---|---|---|
| 1 | Tender Initiation (Draft, 5-step wizard) | Maanda-awe | Submitted → REF2026-2200 |
| 2 | Review and Approve Tender Details | MhlotiM | Approved → Publish |
| 3 | Publish Tender (Supplier Portal) | TumisangM | Advertised |
| 4 | Consolidate Responses (3 suppliers, docs) | TumisangM | Consolidated → Verify Compliance |
| 5 | Verify Compliance (all 3 → Compliant) | TumisangM | → Goal Points |
| 6 | Calculate Specific Goal Points (10 / 8 / 6) | TumisangM | → Invite BEC |
| 7 | Invite BEC Members (+ meeting details) | ThabisoM | 3 evaluators invited |
| 8 | Confirm Attendance & Open Evaluation | Thabiso(M) | All present → Evaluation opened |
| 9 | Capture Functionality Scores | Cedrick, BokangN, BonoloB | All scored & finalised |
| 10 | BEC: Monitor Evaluation Progress → Begin Calibration | ThabisoM | → Calibration |
| 11 | Monitor Calibration & Finalise Scoring | ThabisoM | Finalised |
| 12 | BEC: Finalise Recommendation (Approve + BEC report) | ThabisoM | A&A recommended |
| 13 | Capture Outcome from BAC (Approve Recommendation) | MoshadiM | Approved |
| 14 | Approve Recommendation from BAC (confirm) | ThulileM | Approved |
| 15 | Upload Appointment Letter (letter + CMU email) | TumisangM | Awarded |
| 16 | Capture Order Details (PO no / date / amount / attachment) | TumisangM | **Completed** |

Login password `123qwe` for all users. View mode switched Live → Latest for each config-editing user.

## Observations

- **Stage-3 "Recommendation Status" flag is correct here.** On the BAC / Approve / Appointment / Order pages the rank-1 recommended supplier (A & A Stationers) correctly shows **"Recommended"** while losers show "Not Recommended". This is the *opposite* of the previously-reported inverted-flag bug seen on the PD site — it appears **fixed** on EC DEDEA. Not logged as a bug.
- **Verify Compliance gotcha:** "Finalise Compliance" stays disabled until **every** document row's *Is Compliant?* checkbox is ticked (including the non-mandatory Cert / Test DOC rows), in addition to the 5 checklist N/A answers + Compliant status + dialog confirmation.
- **App auto-opens the next action** for the same user after several submits (Publish→Consolidate→Verify; Finalise Scoring→Finalise Recommendation; Appointment Letter→Capture Order Details) — the workflow-action URL stays put with a new todoid.
- No application defects encountered; every stage advanced cleanly on first submit.
- Console shows ~10-30 non-fatal JS errors per page (pre-existing on this Shesha build); none blocked the flow.

## Publication
- Published to the Test Reports Hub under the **EC-DEDEA-Bid-Management** project (2026-07-27).
