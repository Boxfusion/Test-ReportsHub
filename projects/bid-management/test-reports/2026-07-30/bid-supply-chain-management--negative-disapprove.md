# Report: BID-SCM — Review and Approve: Disapprove (NEGATIVE, 80/20)
**Date:** 2026-07-30 16:45 SAST
**Variant:** 80/20
**Plan:** test-plans/tender-process/bid-supply-chain-management.md (TC-20)
**Spec:** not encoded — see *Automation* below
**Execution Mode:** live via Playwright MCP (TC-01 automated to create the test data)
**Result:** 🔴 **BLOCKED — defect found**
**Tenders:** **REF2026-1106** and **REF2026-1110** (both created by automated TC-01 runs, 80/20)

## Summary
| Check | Result |
|---|---|
| Tender created and submitted to Review and Approve (TC-01 ×2, automated) | PASSED — 34.8s / 36.8s |
| All three decisions offered (Approve / Disapprove / footer Send Back) | PASSED |
| **Clicking Disapprove opens the reason-for-disapproval form** | 🔴 **FAILED — permanent loading spinner** |
| Root cause identified | YES — form bound to a non-existent entity type (Metadata 404) |
| Tender left in a safe state (no corruption) | PASSED — unchanged, same todoid |
| Reproducibility | **3 / 3** across two independent tenders |
| What Disapprove is *supposed* to do | **Still unknown — cannot be established until the form loads** |

## Scope

The last of the three decisions on **Review and Approve Tender Details** to be tested. TC-17 covered
**Send Back** (works), TC-18 mapped Send Back across every stage, and TC-19 covered the BAC's
re-evaluation loop. **Disapprove** was the cheapest remaining negative and is undocumented in ADO — the goal
was to establish whether it is a terminal rejection or another rework loop.

It never got that far.

## Step Results

### Test data (automated)
- [PASS] `--grep "TC-01"` created and submitted **REF2026-1106** — `TC-01 Automated Draft Tender
  run-ms7mebv0 - 80/20 Compulsory Hybrid` (34.8s), pinned in `test-results/chain-ref.json`
- [PASS] A second run created **REF2026-1110** — `run-ms7mjv1m - 80/20 Compulsory Hybrid` (36.8s), so the
  defect could be tested on an independent tender

### Reviewer (MhlotiM) — attempt to disapprove
- [PASS] REF2026-1106 is in MhlotiM's Inbox at **Review and Approve Tender Details**, status **Submitted**,
  "Received from Maand-awe Mamathuntsha a minute ago"
- [PASS] The item opens on `tender-wf-review-and-approve-details v27`
- [PASS] **Three** decisions are offered — **Approve** and **Disapprove** in the *Publish Tender* section,
  **Send Back** in the footer beside a disabled Submit
- 🔴 **[FAIL] Clicking Disapprove hangs.** The button switches to a **loading spinner that never resolves**
  (observed >50 s). No dialog. No toast. No validation message. **No workflow request is sent.**
- [PASS] *(negative confirmation)* The tender is **not** corrupted — still in the Inbox at *Review and
  Approve Tender Details*, **same todoid**, status still *Submitted*
- [PASS] **Approve** and **Send Back** on the same page are unaffected

### Reproduction
- [FAIL ×3] Reproduced **twice on REF2026-1106** (including once on a freshly reloaded page) and **once on
  REF2026-1110** — identical behaviour and identical network trace each time. **Not data-specific.**

## Root cause

Established from the network trace and console on the click, not inferred:

```
[GET] /api/services/Shesha/FormConfiguration/GetByName
        ?name=tender-reason%20for%20disapproval&module=Shesha.SupplyChainManagement   → 304 Not Modified
[GET] /api/services/app/Metadata/Get
        ?container=Boxfusion.BidManagement.Domain.Tenders.Tender                      → 404 Not Found

Failed to fetch metadata of type "Boxfusion.BidManagement.Domain.Tenders.Tender" AxiosError: 404
  at Bv.getMetadata → b7.applyFormSettingsAsync → b7.loadFormByIdAsync → b7.initByFormId
```

The form **`tender-reason for disapproval` exists** (304 = valid, cached). The **entity type it is bound
to does not**: `Boxfusion.BidManagement.Domain.Tenders.Tender` 404s. `applyFormSettingsAsync` throws inside
form initialisation, the dialog never renders, and because the throw is swallowed the button's loading state
is never cleared.

The same page's working calls bind to **`Shesha.SupplyChainManagement.Domain.RfxWorkflow`**
(`RfxWorkflow/Crud/Get` → 200, `StoredFile/EntityProperty?...ownerType=…RfxWorkflow` → 200), so the
disapproval form looks like it is carrying a **pre-rename namespace**.

**Logged as a Blocker:** [`test-reports/bugs/2026-07-30-disapprove-hangs-metadata-404.md`](../bugs/2026-07-30-disapprove-hangs-metadata-404.md)
— includes the suggested fix (repoint the form's model type) and a note that other form configurations
should be grepped for the same stale `Boxfusion.BidManagement.Domain.*` namespace.
Evidence: the network trace and console output quoted above. (A screenshot was attempted but not retained —
`test-results/` is gitignored, so there is none in the repo.)

## Findings

1. 🔴 **Blocker: Disapprove is completely unusable** at Review and Approve — no workaround. A reviewer who
   wants to reject a tender outright can only *Send Back* for rework, which is a different decision with a
   different meaning.
2. **Secondary (worth fixing with it): a form-initialisation failure is invisible to the user.** The button
   spins forever with no message and no reset. Any config error in a dialog-opening action will present as
   "the app is just stuck".
3. **Unrelated pre-existing page-load error, flagged so it isn't confused with the above:**
   `executeScriptSync error TypeError: Cannot read properties of undefined (reading 'isOnProcurementPlan')`
   fires on **load** of this page (before any click, on both tenders) and does **not** block the happy path.

## Automation

**TC-20 is deliberately NOT encoded in the spec.** The behaviour under test is broken, so a spec case would
be permanently red and would turn the demo-ready 16/16 happy-path suite into a 16/17 for the week of
2026-08-03. The plan documents the case, its blocked assertions and the exact retest steps instead.

Once dev repoints the form, encode it as a real spec case — the retest data is already parked:

| Tender | State | Purpose |
|---|---|---|
| **REF2026-1106** | Review and Approve Tender Details (MhlotiM's Inbox, untouched) | Disapprove retest |
| **REF2026-1110** | Review and Approve Tender Details (MhlotiM's Inbox, untouched) | Disapprove retest (second) |

## Not tested / next

- **What Disapprove actually does** — terminal rejection vs rework loop, whether the reason is mandatory, and
  whether the initiator sees it. **Blocked on the bug**; the expectation also needs a BA ruling rather than
  an assumption.
- **Non-Compliant** supplier at Verify Compliance (REF2026-0999 is parked at Consolidate; drives open
  finding #2 of `bugs/2026-07-29-finalise-compliance-action-fails.md`).
- BAC **Cancel Tender**, **Bid is Non-Responsive**, **Change Recommendation**, **Hold in abeyance** — the
  last two are undocumented (see TC-19).
