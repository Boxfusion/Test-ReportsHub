# Report: EC DEDEA — Tender Process plan port + live selector recording
**Date:** 2026-07-27
**Plan:** test-plans/tender-process/ecdedea-tender-process.md
**Spec:** test-plans/tender-process/ecdedea-tender-process.spec.ts
**App:** EC DEDEA SmartGov2 Admin Portal — https://ecdedea-smartgov2-adminportal-qa.shesha.app/ (QA)
**Execution Mode:** ai-driven (live MCP browser) — recording pass, not a pass/fail run
**Result:** PARTIAL — TC-01…TC-09 recorded live and green; TC-10…TC-16 ported but not yet re-recorded
**Tender:** `REF2026-2223` — "ECDEDEA Automated Tender rec-2223 - 90/10"

## Scope

Ported the PD Bid Management plan + spec
(`projects/bid-management/test-plans/tender-process/bid-supply-chain-management.*`) into this
project as `ecdedea-tender-process.*`, then re-recorded the selectors by driving a brand-new tender
live against the EC DEDEA SmartGov2 build, role by role.

## Stages driven (recording pass)

| TC | Stage | User | Outcome |
|---|---|---|---|
| 01 | Draft Tender (5-step wizard) | Maanda-awe | Submitted → **REF2026-2223** |
| 02 | Review and Approve Tender Details | MhlotiM | Approved |
| 03 | Publish Tender (Supplier Portal) | TumisangM | Advertised |
| 04 | Consolidate Responses (3 suppliers × RFQ + TAX) | TumisangM | Consolidated |
| 05 | Verify Compliance (all 3 → COMPLIANT) | TumisangM | → Goal Points |
| 06 | Calculate Specific Goal Points (10 / 8 / 6) | TumisangM | → Invite BEC |
| 07 | Invite BEC Members (3 evaluators + meeting) | ThabisoM | Invited |
| 08 | Confirm Attendance & Open Evaluation | ThabisoM | Evaluation opened |
| 09 | Capture Functionality Scores | Cedrick | A & A Stationers scored **90**, finalised |
| 10–16 | Calibration → Award → Order Details | — | **not driven this pass** |

Suppliers and prices: A & A Stationers R100,000 · Telkom R120,000 · BOXFUSION R150,000.
Evaluators resolved live: **Cedrick Maake**, **Bokang Ngoetjane**, **Bonolo Botha**.

## Selector findings baked into the spec

- **Grid icon buttons have no accessible name** on this build — `getByRole('button', { name: 'edit' })`
  matches nothing. Targeted by icon class (`button:has(.anticon-edit|save|plus-circle)`); the inline
  add-row is `[role="row"].sha-new-row`.
- **Stale AntD dropdowns stay mounted** hidden in the DOM — option lookups scoped to
  `.ant-select-dropdown:not(.ant-select-dropdown-hidden)`.
- **Grids reorder** after edits/uploads — every row matched by text, never by index.
- **Form items matched by exact `<label>`**, not substring: "Email" collides with "Email Address"
  and "Minimum score required" renders twice.
- **Compliance dialog needs one real click per control.** Batch-ticking leaves the DOM checked but
  the form model stale → *"A comment is required when the document is not marked as compliant"* on
  Finalise, after which the dialog wedges and must be cancelled and reopened.
- **The sidebar accordion collapses under automation** — all pages reached by URL.

## Build deltas vs PD (confirmed live)

| Delta | EC DEDEA |
|---|---|
| Mandatory response documents | **RFQ Document + TAX Clearance Cert** only (PD also required "Test") |
| Finalise Compliance gating | needs **every** document row's *Is Compliant?* ticked, incl. Test DOC / Cert |
| Step-1 Supporting documents | **optional** here (mandatory on PD) |
| Step-1 extra fields | adds **Is On Procurement Plan** + **Procurement plan** upload |
| Auto-open next action | Publish→Consolidate→Verify→Goal Points, Attendance→Monitor Progress |

## Issues observed

1. **Specific-Goal-Points save hung (~2 min).** The row's `PUT RfxResponse/Crud/Update` never
   returned, the app fell back to "Initializing…", and the value did not persist; it saved cleanly on
   retry once the environment recovered. Transient environment slowness rather than a reproducible
   defect — the same stage was fine on the two earlier runs today. The spec now waits on the saved
   *value* with a 60s budget rather than on the spinner.
2. **Duplicate-supplier dropdown defect is present on EC DEDEA too** — A & A Stationers remained
   selectable in the Add-Response supplier list after being captured (same defect class as the PD
   REF2026-1172 finding). Not logged separately; noted in the plan.
3. Console shows 10–40 non-fatal JS errors per page on this build; none blocked the flow.

## Outcome of the runner passes that followed

This recording pass was immediately followed by three `run-plan.js` executions, which supersede the
caveats originally listed here:

| Run | Result | Note |
|---|---|---|
| 90/10 (13:06 UTC) | PARTIAL 15/16 | TC-16 failed — `formItem()` matched labels exactly, but this build renders the field as **"Purchase Order No:"** with a trailing colon |
| 80/20 (13:14 UTC) | **PASSED 16/16** | after the label fix; no AI-repair needed |
| 90/10 (13:20 UTC) | **PASSED 16/16** | re-run after the fix; replaced the PARTIAL report of the same name |

- **TC-10 … TC-16 did NOT need re-recording after all.** They passed first time on the PD locators —
  the prediction in the earlier draft of this report was wrong. The only failure came from a helper
  that *had* been recorded (`formItem`), not from the un-recorded stages.
- **TC-15's Contract Management Unit Email** `TODO[selector]` still stands — the spec picks the first
  option, which satisfies the happy path but is not pinned to a named contact.
- **REF2026-2223 (this recording pass) is parked** at *BEC: Monitor Evaluation Progress* with only
  Cedrick's A & A score captured. Not a completed lifecycle; do not count it as one. The three
  runner passes each created and completed their own tender.
- **Allure reports now exist** for both variants: `allure-report--90-10/` and `allure-report--80-20/`.
