# Report: BID-SCM — Send-back sweep + BAC re-evaluation loop (NEGATIVE, 80/20)
**Date:** 2026-07-30 16:35 SAST
**Variant:** 80/20
**Plan:** test-plans/tender-process/bid-supply-chain-management.md (TC-18, TC-19)
**Spec:** test-plans/tender-process/bid-supply-chain-management.spec.ts (`SEND_BACKS=` branches)
**Execution Mode:** hybrid — mapped and driven live via Playwright MCP, then encoded as opt-in spec branches and re-run automated
**Result:** PASSED
**Tenders:** **REF2026-1047** (full lifecycle with 7 send-backs woven in) · **REF2026-1053** (BAC re-evaluation loop)

## Summary
| Area | Result |
|---|---|
| Footer Send Back — availability mapped across all 16 stages | PASSED |
| Footer Send Back — rework loops driven end-to-end (7 stages) | 7 / 7 PASSED |
| Full lifecycle survives the send-backs (REF2026-1047 → Awarded + order captured) | PASSED |
| BAC "Send back for re-evaluation" loop (REF2026-1053) | PASSED — closed, no dead end |
| TC-12 re-action to close the loop (automated, `RUN_REF=REF2026-1053 --grep "TC-12"`) | PASSED in 27.4s |

## Scope

Follow-on from TC-17 (the single Review-and-Approve send-back). This run answers the two questions that
report left open: **which stages actually offer Send Back**, and **what the BAC's own "send back for
re-evaluation" decision does**.

## 1. Where Send Back exists (TC-18)

Mapped non-destructively first with the `PROBE_SENDBACK=1` discovery pass (it opens the dialog only to read
the Step options, then cancels), then confirmed by driving each one.

**The footer Send Back exists ONLY on the pre-evaluation stages.** Seven loops driven end-to-end —
send back → previous actor re-actions → tender returns → happy action → chain continues — all passing:

| Stage sending back | Target step | Re-actioned by | Result |
|---|---|---|---|
| TC-02 Review and Approve Tender Details | Capture Tender Details | Maand-awe (draft wizard) | PASS |
| TC-03 Publish Tender | Review and Approve Tender Details | MhlotiM | PASS |
| TC-04 Consolidate Responses | Publish Tender | Tumisang | PASS |
| TC-05 Verify Compliance | Consolidate Responses | Tumisang | PASS |
| TC-06 Calculate Specific Goal Points | Verify Compliance | Tumisang | PASS |
| TC-07 Invite BEC members | Calculate Specific Goal Points | Tumisang | PASS |
| TC-08 Confirm Attendance and Open Evaluation | Invite BEC members | ThabisoM | PASS |

**No footer Send Back at TC-10, TC-11, TC-12, TC-13, TC-14, TC-15 or TC-16.**

- [PASS] Each dialog offers **every completed predecessor**, not only the previous step — Review&Approve 1
  target, Publish 2, Consolidate 3, Verify Compliance 4, Calculate SGP 5, Invite BEC 6.
- [PASS] **Send Back preserves all captured data and clears only the confirmation checkbox**, so recovery is
  usually "re-tick the confirmation and Submit". Recovery for the draft wizard, Approve and Publish is
  handled explicitly.
- [PASS] **REF2026-1047 completed the FULL lifecycle** with all seven send-backs woven in — TC-16 passed,
  tender **Awarded**, order captured, item left the inbox. Rework does not corrupt the forward chain.

### Plan correction

The plan's 2026-06-04 note claiming **TC-11 has a Send Back is STALE and now corrected.** Verified twice —
automated probe and live page inspection — the only buttons on `tender-wf-calibratescores` are Reply, Hide,
Download Zip, the three per-supplier expanders and **Finalise Scoring**.

## 2. The BAC "Send back for re-evaluation" loop (TC-19)

Driven on **REF2026-1053**.

- [PASS] It is **not** the generic send-back. The decision opens its own form
  `Shesha.SupplyChainManagement/re-evaluation-user-task-send-back v3` (not
  `Shesha.Workflow/user-task-send-back v4`), with mandatory **Step** and **Comments**; **OK commits** and the
  page's Submit is never used.
- [PASS] The Step picker offers a **curated three**, not every predecessor: *Verify Compliance*
  (→ Tumisang), *Confirm Attendance and Open Evaluation* (→ ThabisoM), *Monitor calibration and finalise
  scoring* (→ ThabisoM).
- [PASS] Taking the **calibration** route: the item left MoshadiM's inbox and arrived in **ThabisoM's inbox
  properly ASSIGNED** under a new todoid, with the **BAC's comment visible** and **Finalise Scoring
  enabled** → advanced to *BEC: Finalise recommendation*.
- [PASS] **Loop closed.** Re-actioning that stage automated (`RUN_REF=REF2026-1053 EVAL_CRITERIA=80/20
  --grep "TC-12"`, **passed in 27.4s**) returned the tender to the BAC. Verified live in MoshadiM's Inbox:
  **REF2026-1053 · "Capture outcome from the BAC" · 30/07/2026 · Adjudicate In Progress**, assigned under
  its own todoid. **No dead end.**
- Notable contrast: in **DHA Invoice Tracking** the equivalent re-route is an unassigned dead end
  (PAY3076 stuck). This app routes it correctly.

## Findings

### For the BA / test lead
1. **A backup evaluator BLOCKS calibration (open).** Since an attendee can only be added with *Is Present?*
   ticked, a backup becomes a full evaluator — fourth column in Evaluation Scores, own scorecard — and
   **"Begin Calibration" stays DISABLED with no on-screen reason until they score.** Proven both ways on
   REF2026-1047 and REF2026-1053: disabled at 3-of-4 scored, passing ~12s after the fourth scored.
   **The "add a backup, leave them absent as a stand-in" intent is no longer achievable — needs a ruling.**
2. **The BAC stage carries undocumented decisions** — "**Hold In abeyance pending further due dilligence**"
   (sic) and **Cancel Tender rendered TWICE** (duplicate button). Neither is in the ADO case; both need an
   intended-behaviour decision before they can be covered.
3. **Copy defects in confirmation labels: lowercase `l` where `I` belongs** — Invite BEC reads "*l confirm
   that l have invited…*" against Publish's "*I can confirm…*"; "should be send to" also appears. Same
   family as the known "recommmendation" / "Commitee" typos → **copy review recommended.**
4. **Post-send-back redirect is inconsistent (minor)** — three destinations observed after OK: the Inbox
   list, `/shesha/workflow`, and `/shesha/workflow-action` (auto-opening the next action).
5. **Status never reflects rework (observation, as in TC-17)** — stays *Submitted* / *Adjudicate In Progress*
   through every loop, so a tender in rework is indistinguishable from one freshly submitted.

## Automation

All branches are **opt-in** so they can never turn a clean 16/16 happy-path run into something slower or
redder:

```
SEND_BACKS=all  …            # every stage that offers Send Back
SEND_BACKS=2,3,5 …           # a chosen subset, by stage number
SEND_BACKS=13 …              # the BAC re-evaluation branch
PROBE_SENDBACK=1 …           # non-destructive availability mapping only
```

Machinery added: `sendBackAndReturn()` wired into all 14 candidate stages · `sendBackTo()` ·
`reActionStage()` with `STAGE_ACTOR` / `STAGE_COMMIT` maps · `tickAllConfirmations()` (confirmation-only,
hydration-aware) · `probeSendBack()` · TC-17.

### Harness lessons from this run
- **Never edit the spec while a run is in flight** — Playwright re-read the file mid-run and corrupted the
  tail of the discovery pass, producing a bogus TC-10 failure.
- **`locator.isVisible()` ignores its timeout** — it answers immediately and races the async tables. Use
  `waitFor({ state: 'visible' })` for any presence gate. This caused both a spurious TC-17 skip and the
  TC-04 duplicate-supplier re-add.
- **Don't define "advanced" as "landed on a workflows list"** — the app frequently auto-opens the next
  action instead (see finding 4).
- **Match confirmation labels on `/confirm/i`**, never the literal "I confirm" (see finding 3) — the
  lowercase-`l` typo caused a false "no checkbox" failure.

## Not tested

Remaining negatives from the catalogue, in cheapest-first order:
- **Disapprove** at Review and Approve (undocumented; drafts REF2026-1059/1062 are free)
- **Non-Compliant** supplier at Verify Compliance (REF2026-0999 is parked there; drives open finding #2 of
  `test-reports/bugs/2026-07-29-finalise-compliance-action-fails.md`)
- BAC **Cancel Tender**, **Bid is Non-Responsive**, **Change Recommendation**, **Hold in abeyance**
