# Report: EC DEDEA — Bid Management Full Chain E2E — 80/20
**Date:** 2026-07-27
**Variant:** 80/20
**App:** EC DEDEA SmartGov2 Admin Portal — https://ecdedea-smartgov2-adminportal-qa.shesha.app/ (QA)
**Execution Mode:** ai-driven (live MCP browser, headed)
**Result:** PASSED — tender reached **Awarded → Completed**, awarded to **A & A Stationers** (R100,000), 27/07/2026
**Tender:** `REF2026-2210` — "EC DEDEA Bid Management E2E 80/20 - REF2026-2210" (workflow id `d0270673-5b1c-4612-a073-49a71fa106fe`)

## Scope

Second full PD-Bid Management (Tender Process) run on EC DEDEA, this time with
**Evaluation Criteria = 80/20** (price-weight 80, specific-goal-weight 20) instead of the
90/10 run (REF2026-2200) done earlier the same day. Same role mapping, same three suppliers,
Compulsory + Hybrid briefing, single technical criterion TEC-01 (max 100, min 60).

## Suppliers & result

Three manual supplier responses captured (all marked Compliant at Verify Compliance):

| Supplier | Proposed price | Functionality avg (min 60) | Goal pts | Price pts | Overall | Rank | Outcome |
|---|---|---|---|---|---|---|---|
| **A & A Stationers** | R100,000 | 90 (Bokang 88 / Cedrick 90 / Bonolo 92) | 10 | 80 | **90** | **1** | **Recommended → Awarded** |
| Telkom | R120,000 | 74.33 (78 / 75 / 70) | 8 | 64 | 72 | 2 | Not Recommended |
| BOXFUSION | R150,000 | 60 (65 / 60 / 55) | 6 | 40 | 46 | 3 | Not Recommended |

Under 80/20 the price weight dominates: A & A (cheapest + highest functionality) wins comfortably,
overall 90 vs Telkom 72 vs BOXFUSION 46 — a wider spread than the 90/10 run (100 / 80 / 51).

## Stages driven (role → action)

| # | Stage | User | Outcome |
|---|---|---|---|
| 1 | Tender Initiation (Draft, 5-step wizard, 80/20) | Maanda-awe | Submitted → REF2026-2210 |
| 2 | Review and Approve Tender Details | MhlotiM | Approved → Publish |
| 3 | Publish Tender (Supplier Portal) | TumisangM | Advertised |
| 4 | Consolidate Responses (3 suppliers, RFQ + TAX docs each) | TumisangM | Consolidated → Verify Compliance |
| 5 | Verify Compliance (all 3 → Compliant) | TumisangM | → Goal Points |
| 6 | Calculate Specific Goal Points (10 / 8 / 6, spreadsheet upload) | TumisangM | → Invite BEC |
| 7 | Invite BEC Members (+ meeting details) | ThabisoM | 3 evaluators invited |
| 8 | Confirm Attendance & Open Evaluation | ThabisoM | All present → Evaluation opened |
| 9 | Capture Functionality Scores (TEC-01) | Cedrick, BokangN, BonoloB | All scored & finalised |
| 10 | BEC: Monitor Evaluation Progress → Begin Calibration | ThabisoM | → Calibration |
| 11 | Monitor Calibration & Finalise Scoring | ThabisoM | Finalised (averages 90 / 74.33 / 60, all above min) |
| 12 | BEC: Finalise Recommendation (Approve A&A + BEC report) | ThabisoM | A&A recommended |
| 13 | Capture Outcome from BAC (Approve Recommendation) | MoshadiM | Approved |
| 14 | Approve Recommendation from BAC (confirm) | ThulileM | Approved |
| 15 | Upload Appointment Letter (letter + CMU contact) | TumisangM | Awarded |
| 16 | Capture Order Details (PO-2210-8020 / 27-07-2026 / R100,000 / attachment) | TumisangM | **Completed** |

Login password `123qwe` for all users. View mode switched Live → Latest for each config-editing user.

## Observations

- **80/20 vs 90/10 behaves correctly.** With the price weight raised from 10→80, the pricing-score
  component drives the ranking; A & A's low price (R100k) plus top functionality keeps it rank 1, and
  the overall-score gaps widen (90 / 72 / 46). No calculation anomalies.
- **Stage-3 "Recommendation Status" flag is correct here too.** Rank-1 A & A shows **"Recommended"**,
  losers "Not Recommended", on the BAC / Approve / Appointment / Order pages — consistent with the
  90/10 run; the previously-reported inverted-flag bug remains **fixed** on EC DEDEA.
- **Verify Compliance gotcha (unchanged):** "Finalise Compliance" stays disabled until every document
  row's *Is Compliant?* checkbox is ticked (incl. non-mandatory Cert / Test DOC rows), plus the 5
  checklist N/A answers + Compliant status + dialog confirmation.
- **App auto-opens the next same-user action** after several submits (Publish→Consolidate→Verify;
  Finalise Scoring→Finalise Recommendation; Appointment Letter→Capture Order Details).
- No application defects encountered; every stage advanced cleanly on first submit.
- Console shows ~10-40 non-fatal JS errors per page (pre-existing on this Shesha build); none blocked the flow.

## Publication
- Published to the Test Reports Hub under the **EC-DEDEA-Bid-Management** project (2026-07-27).
