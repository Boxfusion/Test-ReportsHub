# Report: BID-SCM — Review and Approve: Send Back for rework (NEGATIVE, 80/20)
**Date:** 2026-07-30 11:58 UTC
**Variant:** 80/20
**Plan:** test-plans/tender-process/bid-supply-chain-management.md
**Cases:** TC-17
**Spec:** test-plans/tender-process/bid-supply-chain-management.spec.ts (TC-17)
**Execution Mode:** hybrid — driven live via Playwright MCP, then encoded as TC-17 and **verified as an automated spec (PASSED in 42.1s)**
**Result:** PASSED
**Duration:** 42.1s

## Summary
| Total Assertions | Passed | Failed | Skipped |
|------------------|--------|--------|---------|
| 18 | 18 | 0 | 0 |

## Scope

First **negative** branch recorded for this plan. Every TC-01→TC-16 case is a happy path; this one takes
the reviewer's **Send Back** decision instead of Approve, then follows the rework loop all the way back to
the reviewer.

**Tender under test:** **REF2026-1047** — `TC-01 Automated Draft Tender run-ms7g8w7x - 80/20 Compulsory
Hybrid`, created by an automated TC-01-only run so the negative branch had a clean, freshly-submitted
tender to work on.

## Step Results

### Reviewer (MhlotiM) — send it back
- [PASS] The tender is in the reviewer's Inbox at **Review and Approve Tender Details**, status Submitted
- [PASS] The item opens on `tender-wf-review-and-approve-details v27`
- [PASS] **Three** decisions are offered: **Approve**, **Disapprove**, **Send Back** — Approve/Disapprove
  in the *Publish Tender* section, **Send Back in the page footer** beside Submit
- [PASS] Send Back opens its own dialog `Shesha.Workflow/user-task-send-back v4` with two mandatory
  fields, **Step*** and **Comments***
- [PASS] The **Step** picker offers **exactly one** user task: *Capture Tender Details* — "Completed by
  Maand-awe Mamathuntsha on 30/07/2026 13:48", "Assigned to: Maand-awe Mamathuntsha". A tender can only
  be sent back to its originating draft step
- [PASS] Comments accepted; **OK commits the send-back immediately** and redirects to the Inbox
- [PASS] The page's own **Submit stays disabled and is never used** on this path (unlike Approve, where
  Submit is the commit)
- [PASS] REF2026-1047 has left the reviewer's Inbox

### Initiator (Maanda-awe) — rework
- [PASS] The tender arrives in the initiator's **Inbox** (not My Items) with Action Required
  **Capture Tender Details**, under a **new todoid** (`48e31b39…`)
- [PASS] The reviewer's comment is rendered **inline on the item**, attributed
  ("Mhloti Mabuza to Capture Tender Details, a minute ago") and with a **Reply** button
- [PASS] The item opens the **fully editable 5-step wizard** (24 editable inputs) with the draft intact —
  meeting link, supporting-document upload and 80/20 evaluation criteria all preserved
- [PASS] Corrected Briefing Session Venue: `Boardroom A, Head Office` → `Boardroom B, Head Office
  (corrected after send-back)`; the rest of the draft was untouched
- [PASS] Next through steps 2 (Tender Documents) → 3 (Response Documents) → 4 (Technical Evaluation) →
  5 (Summary) with **zero validation errors** — nothing had to be re-entered
- [PASS] The corrected venue appears on the Summary step; **Submit** is enabled
- [PASS] Submit returns the tender to My Items as **Submitted**

### Reviewer again (MhlotiM) — the correction must be there
- [PASS] The tender is back in the reviewer's Inbox at **Review and Approve Tender Details**, under a
  **third todoid** (`cb05750c…`)
- [PASS] The Publication tab shows **Boardroom B (corrected after send-back)**; the old `Boardroom A`
  value is **gone**
- [PASS] The send-back comment thread is visible to the reviewer too, preserving the audit trail

## Findings

**No defects in this branch — it behaves correctly throughout.** One observation:

- **Observation (minor, NOT logged as a bug): the workflow status never reflects the send-back.** The
  tender reads **Submitted** for the entire round trip — in the reviewer's Inbox, in the initiator's Inbox,
  in My Items and on the item header — even while it is sitting with the initiator awaiting rework. A
  sent-back tender is therefore indistinguishable from a freshly-submitted one by status alone, which
  matters for anyone triaging a queue or reporting on cycle time. **Question for the test lead / BA:** is
  a distinct state (e.g. "Sent Back" / "In Rework") intended here?

## Not tested on this branch

- **Disapprove** — the third decision on the same page, expected to be terminal rather than a rework loop.
  Recommended as the next negative to record.
- Whether Send Back is offered at **later** stages (Publish, Consolidate, Verify Compliance…) and, if so,
  whether the Step picker then offers **multiple** earlier tasks. Here it offered only one because
  Capture Tender Details was the only completed predecessor.

## Automation

Encoded as **TC-17** in both the plan and the spec. It is deliberately built to **skip with an explanatory
message** when no tender is pinned at Review and Approve, so it can never turn a clean 16/16 happy-path
chain into a 16/17 — a full-chain run consumes that stage in TC-02.

Run it with:
```
node scripts/run-plan.js projects/bid-management/test-plans/tender-process/bid-supply-chain-management.md --grep "TC-01"
node scripts/run-plan.js projects/bid-management/test-plans/tender-process/bid-supply-chain-management.md --grep "TC-17"
```
(the REF carries over in `test-results/chain-ref.json`), or pin an existing tender with
`RUN_REF=REF2026-nnnn … --grep "TC-17"`.

**Harness note:** the first automated attempt at TC-17 **skipped spuriously** even with the correct REF
pinned, because the guard used `locator.isVisible()` — which ignores a timeout and answers immediately,
racing the async inbox table. Replaced with `waitFor({ state: 'visible' })`. This is the same class of bug
as the TC-04 idempotence guard fixed earlier today; worth watching for anywhere a boolean check gates
behaviour in this suite.

**Automated verification:** after that fix, `RUN_REF=REF2026-1047 --grep "TC-17"` **PASSED in 42.1s**,
driving the whole loop unattended — send back → rework as the initiator → re-submit → confirm the
correction is visible to the reviewer. Note this put REF2026-1047 through the send-back loop a **second**
time (it was already back at Review and Approve after the live drive), which also demonstrates the branch
is repeatable on the same tender. REF2026-1047 is currently parked at **Review and Approve**, so it can be
reused for the Disapprove test or simply approved to continue the happy path.
