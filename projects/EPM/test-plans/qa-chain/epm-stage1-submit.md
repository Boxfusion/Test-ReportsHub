# EPM — Stage 1 Submit

**ADO plan:** 108745 — *EPM-QA — Functional Test Plan v2.0 (2026-08-11 redesign baseline)*
**ADO suite:** *109521 · EPM · Stage 1 Submit*
**Environment:** `https://pd-epm-adminportal-qa-wf.shesha.app` (UI) +
`https://pd-epm-api-qa-wf.shesha.app` (API verification)
**Login:** admin.PrincessH / 123qwe (administrator); then stage1 / 123qwe

> This spec never had a paired canonical `.md` — this file backfills it. **ADO is canonical.**

## TC-108791 — Positive — Submit a Q1 KPI entry, Stage 2 receives it

**ADO ID:** 108791 · **Priority:** 1 · **Coverage dimension:** Positive

### Confirmed live 2026-08-31 — CONFIRMED DEFECT: Submit permanently blocked

Previously blocked (see [[epm-stage1-origination-permanently-blocked]]) because no live Stage 1 item
could ever be originated — root cause was [[epm-open-progress-report-inert]], reversed the same day.
Once unblocked, this reveals a second, serious Stage 1 defect: the Submit button remains permanently
disabled, citing *"Please ensure the Executive Summary is captured before Submitting"* — even after the
Executive Summary field is filled and verified via multiple independent techniques:
- manual click + `keyboard.type()`
- Playwright `Locator.fill()`
- an explicit blur (clicking elsewhere on the page)
- a 3-second wait to rule out a debounced validity check
- confirmed via `.inputValue()` that the field genuinely holds the typed text throughout

The field visually and programmatically contains real content; the Submit-gate validation never
recognizes it. Root cause not further isolated (could be a minimum-length requirement above what was
tried, a differently-bound underlying model field, or a genuine validation bug) — documented as a
confirmed, reproducible blocker either way.

**Independently reconfirmed under the corrected fixture setup.** The case owner caught that this
session's fixtures used a flattened Department→KPI hierarchy (skipping Programme/Sub Programme) with
`poeRequired`/`useSimplifiedReporting` left at their defaults — see
[[epm-disposable-fixture-hierarchy-convention]]. Rebuilt with the full 4-level hierarchy and both flags
`true`. Under `useSimplifiedReporting: true`, the Executive Summary section is **not even rendered** on
the form (replaced by a required Portfolio of Evidence upload). Uploaded a real POE file and set an
Achievement Status radio — Submit remained disabled with the exact same stale message. This rules out
the flattened hierarchy as the cause and shows the check references a field outside the form's actual
current shape.

**Combined with [[epm-stage1-save-draft-unverifiable]]'s confirmed Save-fails-with-404 defect, BOTH
primary Stage 1 actions (Save and Submit) are non-functional on a freshly-originated item.** This
blocks meaningful testing of:
- Suite 109522 (Stage 1 POE Upload) — needs a successful Submit to verify attachment carry-through
- Suite 109536 (Achievement % Calculation) — needs Submit to trigger the real calculation logic
- Suite 109535 (Qualitative KPI Narrative) — needs Submit to persist the narrative

### Unique inputs
| Field | Value |
|---|---|
| Template | "Standard Annual Performance Plan" (`77a75071-...`) |
| Period | "Financial Year 2026/27" (`8062531f-...`) |

### Re-tested 2026-09-01 — CONFIRMED WORKING on a second real item, but on a different form path

Used the real item `CPR2026/1078` ("Percentage compliance with statutory prescripts - Q4", fresh
`Status: Received`). Filled Actual Target (68), selected Achievement Status ("Not Achieved"), uploaded
the required Portfolio of Evidence file, and checked the Declaration Statement checkbox. Submit's
`title` attribute still showed the stale *"Please ensure the Executive Summary is captured before
Submitting"* text — but `isEnabled()` was genuinely `true`, and clicking it fired
`Process/UserTaskComplete` → `200`. The item advanced (`actionText` became "Quality Assure and
Consolidate Progress Report", i.e. Stage 3 — same Stage-2-skip pattern observed on TC-108849).

**This is now the SECOND consecutive confirmed pass** on this exact scenario (the first was
`CPR2026/1071` in [[epm-tc108849-full-chain-completed]]). **Important — both are the same narrower form
path:** `CPR2026/1078` is also `useSimplifiedReporting: true` (no Executive Summary field rendered at
all). The original defect above was reproduced on a *different* form configuration
(`useSimplifiedReporting: false`, with a real Executive Summary textarea). Two clean passes on the
simplified path don't resolve whether the standard/Executive-Summary path is still broken — that
scenario has not been re-attempted this session. **Status left as `defect` in the ledger, not flipped**,
per the "don't flip unilaterally on a contradicting result" convention — but the note is updated to
reflect the now-doubled evidence. The existing `epm-stage1-submit.spec.ts` already builds a fresh
disposable KPI that defaults to `useSimplifiedReporting: false` (a real Executive Summary form) — that
spec is the direct way to settle this definitively, next time it's run.

### Definitively reconfirmed 2026-09-01 — root cause found: `useSimplifiedReporting` is the switch

The case owner identified the likely cause: a "Standardised KPI" flag set during KPI configuration
(which maps to `useSimplifiedReporting` on the underlying `ComponentProgressReport`) determines which
Submit-gate code path runs. Directed re-test on `CPR2026/1097` (`useSimplifiedReporting: false` — a
genuine standard-form KPI with a real Executive Summary section) to test this directly, after two
consecutive passes on `useSimplifiedReporting: true` items had left the original defect's scope
ambiguous (see [[epm-tc108849-full-chain-completed]] and the second confirmation above).

Filled every field: Actual Target (76), Achievement Status ("Not Achieved"), the required Portfolio of
Evidence upload, and Executive Summary — using the exact same battery of techniques as the original
2026-08-31 repro (Playwright `fill()`, then separately manual `.click()` + `keyboard.type()` followed by
an explicit blur onto "Progress Report Details" and a 3-second wait), confirming via `.inputValue()`
that the typed text was genuinely present throughout. Checked the Declaration Statement checkbox.
**Submit stayed disabled both times**, `isEnabled()` genuinely `false`, citing the identical stale
message.

**CONFIRMED: the defect is real and reproduces — it is not a testing artifact.** This resolves the
ambiguity left by the two `useSimplifiedReporting: true` passes: **the Submit-gate bug is scoped
specifically to `useSimplifiedReporting: false` (standard) forms.** On `useSimplifiedReporting: true`
forms, Submit correctly requires only Declaration (+ already-filled required fields) and works. On
`useSimplifiedReporting: false` forms, Submit's validation appears to fail the Executive Summary check
regardless of the field's actual content.

### CORRECTED same day, 2026-09-01 — the failure is intermittent, not permanent

The case owner suggested the disabled state might be a client-side glitch — sometimes it shows up,
sometimes it doesn't — and to just delete-and-re-enter the Executive Summary text (or reload) until
Submit enables. Tested directly on `CPR2026/1101`:
- 15 straight in-place clear/re-type cycles on the Executive Summary field, on the same page load, did
  **not** unstick it — Submit stayed disabled every time.
- Cycling through **fresh page reloads** instead (re-fetch `todoId`, re-navigate to `workflow-action`,
  refill every field from scratch each time) did: reload cycle 1 failed across 6 in-place retries, but
  **reload cycle 2's very first attempt had `isEnabled() === true`** — clicked it, `UserTaskComplete` →
  `200`, genuinely succeeded, delivering the item to Stage 2.

**This changes the framing:** the Submit-gate bug on `useSimplifiedReporting: false` forms is
**intermittent/flaky, not a hard permanent block**. It's still a real defect worth fixing (a gate that
sometimes silently fails to recognize valid input is unreliable by definition), but "Submit never works
on standard forms" is not accurate — "Submit's enable-check sometimes fails to recognize valid input on
a given page load, and a fresh reload can clear it" is. **Practical workaround for any future
standard-form Submit test: loop fresh page reloads (not just in-place field edits) until `isEnabled()`
reports `true`, then submit immediately.**

This success also unblocked TC-108852 (Submit triggers Notification to Stage 2) — see
[[epm-tc108852-notification-not-triggered]] for that result, plus a bonus finding: this
`useSimplifiedReporting: false` item did NOT skip Stage 2 (unlike the two `true` items tested earlier),
suggesting `useSimplifiedReporting` is also the switch behind the earlier-observed Stage 2 skip.

### Re-confirmed live 2026-09-02 — FIX VERIFIED, clean pass, first try

Retested after the case owner reported the Submit-gate flakiness was fixed. First attempt used
`CPR2026/1006` ("S1Draft KPI"), which turned out to have a **null Quarter Target** — Submit stayed
disabled there too, but this now looks like a separate, narrower issue: every other item tried this
session with a null target (`CPR2026/1044`, `CPR2026/1006`) never got Submit to enable no matter how
many retries, while every item with a genuine non-null target enabled immediately. Not chasing this
further as part of TC-108791 — a KPI with no configured target isn't a meaningful precondition for this
case anyway.

Switched to `CPR2026/1065` ("Percentage compliance with statutory prescripts - Q2 2026/27", real
Quarter Target `60`, `useSimplifiedReporting: false`). Filled Actual Target (60, zero variance),
Achievement Status, the required Portfolio of Evidence, and a genuine Executive Summary. Checked
Declaration. **Submit was enabled immediately — no retries, first page load.** Clicked it: `200`.
Verified directly via the `stage2` account: a real `WorkflowInboxItem` now exists,
`actionText: "Support Progress Report"`, `statusFinalText: "Received"`.

**CONFIRMED PASS, matches ADO's literal expectation exactly: "Submit a Q1 KPI entry, Stage 2 receives
it."** The fix is real and holds on a second, independent item (see also
[[epm-stage1-submit-remainder]]'s TC-108851 confirmation on `CPR2026/1103`).

### Notes
- **Interaction pattern:** uses the corrected hover-retry + raw-mouse-coordinate click for Open
  Progress Report — see [[epm-open-progress-report-inert]].
- **A null/unconfigured Quarter Target appears to permanently block Submit**, independent of the
  fixed flakiness — pick an item with a real target value for any future Submit test.
- Real form field layout (via screenshot): the form has 2 "Actual Target" label rows (only the second
  has an input); the real editable text fields in DOM order are Percentage Base (index 0), Actual
  Target (2nd plain-text input), Executive Summary (textarea index 3), Comments (textarea index 4,
  right-hand panel). No stable accessible labels exist on this form (no `aria-label`, no `<label for>`)
  — field identification requires visual/positional confirmation, not text-based locators.
- Submit's disabled-reason `title` attribute is stale/unreliable as a signal — it kept showing the
  Executive Summary message even once the button was genuinely enabled on a `useSimplifiedReporting:
  true` item. Check `isEnabled()`, not the tooltip text.
- **`useSimplifiedReporting` is the deciding factor for whether Submit works at all** — check this flag
  first when triaging any future Stage 1 Submit issue.
