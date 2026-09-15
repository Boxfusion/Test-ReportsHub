# EPM — Stage 1 Submit — remainder (TC-108850/851/852)

**ADO plan:** 108745 — *EPM-QA — Functional Test Plan v2.0 (2026-08-11 redesign baseline)*
**ADO suite:** *109521 · EPM · Stage 1 Submit*
**Environment:** `https://pd-epm-adminportal-qa-wf.shesha.app` (UI) +
`https://pd-epm-api-qa-wf.shesha.app` (API verification)
**Login:** stage1 / 123qwe

> All three cases fundamentally require a *successful* Submit to test their real claims. See
> [[epm-stage1-submit-permanently-blocked]] (TC-108791): Submit never becomes enabled, confirmed even
> on a fully correct, fully filled real KPI. This file reconfirms that root blocker on a completely
> fresh, previously-untouched real item (Q2) before ledgering all three as blocked by it.

## TC-108850 — Negative — Reject Submit when required POE is missing

### Confirmed live 2026-08-31 — the rejection is generic, not POE-specific

Filled every other field (Actual Target, Achievement Status, Executive Summary, Declaration checkbox)
on a fresh Q2 item, deliberately leaving Portfolio of Evidence unattached. Submit stayed disabled with
the same generic message — *"Please ensure the Executive Summary is captured before Submitting"* — not
a POE-specific rejection. This can't be distinguished from the same root Submit-gate defect; ADO's
literal expectation (a POE-specific rejection) isn't met, but not because POE enforcement fails —
because Submit is blocked for an unrelated, always-present reason regardless of what's filled.

## TC-108851 — Edge — Concurrent Submit from two tabs, second is a no-op

### Confirmed live 2026-09-02 — CLEAN PASS, Submit-gate flakiness confirmed fixed

Previously blocked because Submit's enable-check was intermittent (see
[[epm-stage1-submit-permanently-blocked]]) — getting even one successful Submit took dozens of retries
across two prior sessions. Retried after the case owner reported the flakiness was fixed: opened
`CPR2026/1103` in two separate tabs (same browser context, independently fetched `todoId`s), filled
identical required fields in both. **Submit was genuinely enabled in both tabs on the very first load —
no retries needed at all**, confirming the fix.

Submitted Tab A first — `200`, genuine success. Immediately submitted Tab B (which still showed an
enabled Submit button, stale client state from before Tab A's completion) — **`400`**, with a precise,
correct rejection: *"User Task `Capture Progress Report` already completed on 9/2/2026 9:46:42 AM"*.
The workflow engine correctly recognized the task was already completed and rejected the duplicate,
rather than silently no-op'ing, double-advancing, or corrupting state. **This exactly matches ADO's
expected result — clean pass.**

Final check: item genuinely advanced to Stage 2 (`actionText: "Support Progress Report"`, `Status:
Received`) — another data point (4th) confirming `useSimplifiedReporting: false` items route through
Stage 2 normally, unlike the `true` items that skip it.

## TC-108852 — Integration — Submit triggers Notification to Stage 2

### Re-confirmed live 2026-09-01, then UNBLOCKED same day — CONFIRMED DEFECT

First pass on `CPR2026/1101` (`useSimplifiedReporting: false`) ruled out every field-state confound one
at a time — zero Variance (Actual Target = Quarter Target, avoiding a variance-triggered required
"Reason for Deviation" field), Achievement Status radio explicitly checked (`isChecked()` confirmed
`true`), POE attached, Executive Summary filled and confirmed via `.inputValue()`, Declaration checked —
and Submit still stayed disabled every time.

Following the case owner's insight that the disabled check might be an intermittent glitch (see
[[epm-stage1-submit-permanently-blocked]]'s "CORRECTED" update), retried with **fresh page reloads**
instead of in-place edits — Submit genuinely enabled on the 2nd reload cycle and the click succeeded
(`UserTaskComplete` → `200`). This finally made TC-108852 testable:

- `ComponentProgressReport.progressReportStatus`: `30` (Stage 2).
- A genuine `WorkflowInboxItem` exists for `stage2`/`123qwe`, `actionText: "Support Progress Report"`,
  `statusFinalText: "Received"` — Stage 2 really did receive the item.
- `Shesha/NotificationMessage` total: **`0`**, unchanged from the pre-Submit baseline (also `0`
  tenant-wide).

**CONFIRMED DEFECT:** Submit genuinely delivered the item to Stage 2, but zero notifications were ever
triggered. See [[epm-tc108852-notification-not-triggered]] for full detail, including a bonus finding:
this `useSimplifiedReporting: false` item did NOT skip Stage 2 (unlike the two `true` items tested
earlier for TC-108849/108791) — 3-for-3 evidence that `useSimplifiedReporting` is also the switch behind
the Stage 2 skip, not a separate anomaly.

### Re-confirmed live 2026-09-02, post-fix — same defect, now cleanly reproducible

Retested on a fresh item, `CPR2026/1059` (real Quarter Target `40`, `useSimplifiedReporting: false`),
after the case owner's Submit-gate flakiness fix. Filled everything (Actual Target, Achievement Status,
POE, Executive Summary, Declaration) — **Submit enabled on the first page load, no retries at all**
(3rd consecutive clean confirmation of the fix, alongside TC-108791 and TC-108851). Clicked Submit:
`200`. `stage2` genuinely received the item (`actionText: "Support Progress Report"`). Checked
`Shesha/NotificationMessage`: `0` before, `0` after — unchanged. **The notification gap is real and
independent of the fixed flakiness** — this is now a clean, reproducible defect finding rather than one
tangled up with retry noise.

### Unique inputs
| Field | Value |
|---|---|
| Quantitative KPI | "Number of Provinces and Metros supported to complete Phase 1..." (Q2, workflowInstanceId `f79d942f-...`) — original 2026-08-31 attempt |
| Report | "ProperHier 99402236" |
| Re-test 2026-09-01 | `CPR2026/1101` (workflowInstanceId `6c611f48-1a9f-48bc-b800-dbf9cc3adaed`, `useSimplifiedReporting: false`) |

### Notes
- Used the Q2 period specifically (not Q1, already exercised by TC-108789/845) to guarantee a
  completely untouched item for this reconfirmation.
- `todoId` fetched fresh in the same session immediately before navigating.
- A non-zero Variance triggers a required "Reason for Deviation" field — set Actual Target equal to
  Quarter Target to avoid that confound when isolating the Executive Summary issue specifically.
