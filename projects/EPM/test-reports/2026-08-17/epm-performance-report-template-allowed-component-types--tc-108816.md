# Report: EPM — TC-108816 Integration — Publishing a Performance Report using a template with wrong canBeRoot flags fails validation

**Date:** 2026-08-17 08:34 UTC
**Plan:** test-plans/hierarchy-definitions/epm-performance-report-template-allowed-component-types.md
**Spec:** test-plans/hierarchy-definitions/epm-performance-report-template-allowed-component-types.spec.ts
**Cases:** TC-108816
**Execution Mode:** ai-driven (headed Chromium via Playwright, single test case only, `-g "TC-108816"`)
**Result:** FAILED (by design — confirmed genuine defect against ADO's expected behavior)
**Duration:** ~20–35s per run (multiple runs during investigation; final run `1 failed (37.5s)`)
**Verdict:** Publish has **no canBeRoot validation at all**. A Performance Report whose Reporting Tree
root is a Component Type marked `canBeRoot=false` on its template publishes successfully (`HTTP 200`,
report status flips from PLANNING to REPORTING IN PROGRESS, the details view's action flips from
"Publish Performance Report" to "Unpublish Performance Report") — with no rejection, no warning, nothing.
This is a genuine missing business-rule validation, in the same family as other confirmed-missing
invariants in this project (see the `.md` plan for links).

**ADO:** org `boxfusion` · project **PD-Epm** · plan **108745** (*EPM-QA — Functional Test Plan v2.0*) ·
suite **109508** (*03 · EPM · Performance Report Template — allowed Component Type + canBeRoot invariants*) ·
case **108816**
**Environment:** QA — `https://pd-epm-adminportal-qa.shesha.app` · API `https://pd-epm-api-qa.shesha.app`
**Login:** admin.PrincessH / 123qwe (administrator)
**Navigation:** Epm › Adminstration › Performance Report Template (precondition build) → Epm › Adminstration
› Manage Performance Reports (`/dynamic/Epm/perfomance-report-v2`) → report's details view → **Publish
Performance Report**

## Summary

| Total Assertions | Passed | Failed | Skipped |
|------------------|--------|--------|---------|
| 4 | 3 | 1 (soft) | 0 |

Only test case 108816 was executed. The one failure is `expect.soft` — recorded but non-blocking, so
STEP 3/4 still ran and were verified in the same pass.

## Precondition — literally unreachable via the UI (load-bearing context, not the graded claim)

ADO's precondition ("A Performance Report Template has Department set with canBeRoot equal to false.
Reporting Tree is seeded with Department as the root.") **cannot be built through the app's own UI at
all.** Confirmed live: the Reporting Tree builder's **"Add Top Level Item"** action only offers component
types where the template's Allowed Component Type row has `canBeRoot=true`. With Department set to
`canBeRoot=false` (exactly what this precondition calls for), clicking "Add Top Level Item" does
**nothing observable** — no dropdown, no modal, no error toast — and (confirmed via a direct
`Component/Crud/GetAll` diff before/after) no orphan record is created either. As a control, the same
button on an otherwise-identical disposable template where Department's junction has `canBeRoot=true`
immediately added "Department" to the tree with no picker at all (there was only one eligible type, so it
auto-added). This means the client silently enforces canBeRoot **on the way in** — you cannot construct
the very state ADO's precondition describes through the app itself.

To reach the state at all, the whole precondition was built directly via the API instead (Performance
Report Template + two `PerformanceReportAllowedComponentType` rows + the disposable Performance Report +
a root `Component` (Department, parent=null) + a child `Component` (Quantitative KPI) + one
`ComponentActioner` row). Two more UI-invisible gates were discovered and satisfied along the way,
confirmed live by omitting them one at a time:
- Publishing a tree with **no KPI-type descendant at all** rejects with *"The report has no reportable
  KPIs. Add at least one KPI before publishing."*
- Publishing a KPI with **no assigned actioner** rejects with *"N KPI(s) have no assigned Process Owner:
  \<name\>."*

Both of those are genuine, correctly-enforced validations — not defects. canBeRoot is not one of them.

## Step Results

### PRECONDITION
- [PASS] Built disposable PRT, two Allowed Component Type rows (Department canBeRoot=false, Quantitative
  KPI canBeRoot=false), a disposable Performance Report, a root Department `Component`, a child
  Quantitative KPI `Component`, and one `ComponentActioner` row (level 20) — all via direct API calls,
  since the UI cannot reach this state (see above)

### STEP 2 — Attempt to Publish the Performance Report via the User Interface Publish action.
- Clicked the real **"Publish Performance Report"** button on the details view
- **[FAIL, CONFIRMED BUG — soft] EXPECTED: the publish is rejected by ValidateReadyToPublishAsync with an
  error citing canBeRoot invariants** — publish **succeeded** instead: `PUT
  .../PerformanceReports/PublishPerformanceReport?id=...` → HTTP 200, no error body, report status badge
  flipped from PLANNING to **REPORTING IN PROGRESS**

### STEP 3 — Fix the template so Department has canBeRoot equal to true.
- **[PASS] EXPECTED: the correction is saved** — `PerformanceReportAllowedComponentType/Crud/Update` →
  HTTP 200 (applied via the API — the grid's own inline-edit affordance for an existing row was not
  established live in this session; only its Add flow was confirmed working, in TC-108779)

### STEP 4 — Retry Publish. Confirm success + audit trail.
- Unreachable as ADO literally describes it — a direct consequence of the STEP 2 defect: the report was
  already published by STEP 2, so there is no "Publish Performance Report" button left to retry; the
  details view now shows "Unpublish Performance Report" instead
- **[PASS] Sanity check: the report is genuinely in a published state** — confirmed the "Unpublish
  Performance Report" action is visible, proving STEP 2's HTTP 200 was a real state change, not a no-op
- Audit-trail content was not independently inspected (out of scope once STEP 2 itself is the confirmed
  defect — there is no rejection-then-correction sequence for an audit trail to record)

## A note on a transient false lead (not a reproducible finding)

During manual API-level investigation of this precondition (before the final automated spec existed),
repeatedly calling `PublishPerformanceReport` — once via raw `curl` with no session, once via an
authenticated Playwright request — consistently returned `HTTP 500` with `"Evaluation failure on
value(Shesha.Enterprise.Session.ClaimsEnterpriseSession).GetUserId()"`, regardless of the assigned
actioner's identity or canBeRoot's value. This looked like a severe, blocking crash. The final, clean
automated run (real browser click, freshly-built disposable data) published successfully on the first
attempt with **no crash at all**, and a second full run reproduced that success identically. This was not
re-investigated further given it did not reproduce in the deterministic path — noted here only so a future
session doesn't waste time chasing it as if it were confirmed reproducible.

## Cross-check against a second, real environment (2026-08-17, later same day)

At the user's direction, re-verified directly against `pd-epm-adminportal-qa-wf.shesha.app` (login
`admin.PrincessH`) — the host the ADO test case's own Description field names, distinct from
`pd-epm-adminportal-qa.shesha.app` used for the rest of this suite — using the **real, pre-existing**
"DHS APP 2026-27" report rather than disposable data.

Its state as found: template already had Department/Programme/Sub Programme all at `canBeRoot=true`
(not `false`), and the report's tree had exactly one bare, unnamed Programme root with no children.
Clicking Publish rejected with *"The report has no reportable KPIs"* — an earlier gate, not canBeRoot.

To actually test the invariant, temporarily (with the user's explicit go-ahead): flipped Department to
`canBeRoot=false` on the DHS template, added a real Department root Component + Quantitative KPI child +
one Process Owner `ComponentActioner` row, then clicked **Publish Performance Report** for real.

**Result: identical to the disposable-data run above.** `HTTP 200`, `"Successfully published report."`,
status flipped PLANNING → REPORTING IN PROGRESS, Publication Date stamped. No canBeRoot rejection.
Confirms the defect is real and not an artifact of the disposable-template setup on the other host.

**Reverted afterward** (per the user's choice): unpublished via the real "Unpublish Performance Report"
action (confirmed back to PLANNING), deleted the added Component/Component/ComponentActioner rows,
restored Department's `canBeRoot` back to `true`. One residual noted and left alone rather than
force-edited: the report's `publicationDate` field still carries the timestamp from this test
(`2026-08-17T13:01:16`) — the app's own Unpublish action reverts status but does not null that field back
out, and clearing it directly via a raw API write would mean editing an audit-trail field by hand rather
than through any app-provided action.

## Test data left in QA

None. The disposable template, its two junction rows, the report, both components, and the actioner row
were deleted in `finally` regardless of outcome. Swept and confirmed empty across all five touched
entities (`Component`, `PerformanceReport`, `PerformanceReportAllowedComponentType`,
`PerformanceReportTemplate`, `ComponentActioner`) after the run.

## Reproduction

```bash
# from the hub root
HUB_PROJECT=EPM HEADED=1 PW_CHANNEL=chromium npx playwright test \
  projects/EPM/test-plans/hierarchy-definitions/epm-performance-report-template-allowed-component-types.spec.ts -g "TC-108816"
```

## Azure DevOps publication

Not attempted — the ADO PAT used for this project is deliberately read-only by design.
