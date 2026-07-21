# Blocker: BID-SCM tender-lifecycle cases cannot run — empty work queues

**Plan:** test-plans/tender-process/bid-supply-chain-management.md
**Spec:** test-plans/tender-process/bid-supply-chain-management.spec.ts
**Date:** 2026-06-02
**Suspected category:** data

## Affected test cases (12)
TC-04, TC-05, TC-06, TC-07, TC-09, TC-10, TC-11, TC-12, TC-13, TC-15, TC-16, TC-17
(plus the TC-03 / TC-08 / TC-14 / TC-18 "passes", which are unreliable — see *False positives* below.)

## Root cause
The signed-in user **Maanda-awe** has **no work items** in the queues these cases depend on:
- **Workflows → Inbox** (`/dynamic/Shesha.Workflow/workflows-inbox`) renders the *Incoming Items* grid with **0 rows**.
- **Bid Management → Evaluate Tenders** has no tender available to open.

Every review/evaluation case (TC-03…TC-18) begins by opening a specific tender from one of
these queues. With the queues empty there is nothing to open, so the `// STEP: open the target
item` interaction (a `// TODO[selector]` placeholder — it could not be recorded without a live
item) never executes, and the subsequent `(BLOCKING)` "item opens on the '<page>' page" assertion
times out.

## Expected
A seeded tender work item exists in the matching workflow state for Maanda-awe, so the magnifying-glass
(Inbox) / double-click (Evaluate Tenders) opens the item on the named workflow page.

## Actual
`expect(getByText('<page name>')).toBeVisible()` times out after 15s — *element(s) not found* — because
no item was opened. Inbox grid row count = 0.

## Playwright error (representative — TC-04)
```
expect(locator).toBeVisible() failed
Locator: getByText('Publish Tender').first()
Expected: visible
Timeout: 15000ms
Error: element(s) not found
  at expectOnPage (.../bid-supply-chain-management.spec.ts:42)
```

## Snapshot / screenshots
`projects/bid-management/test-results/artifacts/.../test-failed-1.png` (one per failing TC)
`projects/bid-management/test-results/inbox.png`, `landing.png` (recorded during authoring — empty Inbox)

## False positives
TC-03 (Review and Approve), TC-08 (Invite BEC Members), TC-14 (BEC: Finalise Recommendation) and
TC-18 (Capture Order Details) intermittently **pass** only because their page-name string appears
incidentally in the Inbox listing — they do **not** actually open an item. Across runs these flip
between pass and fail (TC-03 failed in run 1, passed in run 2). Treat them as **not yet validated**,
same as the explicit failures. Only **TC-01 (login)** and **TC-02 (Draft Tender navigation)** are
genuine passes (they are not queue-dependent).

## To unblock
1. Seed at least one tender per workflow stage assigned to Maanda-awe (or use an account whose
   Inbox / Evaluate-Tenders queues are populated).
2. With data present, record the real selectors for the data-dependent steps (open-item magnifier,
   document tabs / View-in-PDF / Download-Batch, the evaluation dialog) — via the Playwright MCP on
   a session where it is loaded — to replace the remaining `// TODO[selector]` markers.
3. Re-run `/RunTest bid-supply-chain-management`.

> Not an application defect — this is a test-data / test-readiness gap. Dev triage can dismiss if the
> queues are expected to be empty in QA for this account.
