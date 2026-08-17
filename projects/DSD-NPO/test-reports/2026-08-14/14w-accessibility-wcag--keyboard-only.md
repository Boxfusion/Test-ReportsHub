# Report: Cross-Cutting 14W — Accessibility (WCAG 2.1 AA)

**Date:** 2026-08-14 06:35 UTC
**Plan:** test-plans/cross-cutting/14w-accessibility-wcag.md
**Spec:** test-plans/cross-cutting/14w-accessibility-wcag.spec.ts
**Execution Mode:** ai-repair
**Result:** FAILED — BLOCKING step 6: a keyboard/AT user cannot trigger or perceive the validation error
**Duration:** ~300s
**Cases:** TC-14W-001
**Environment:** QA · public portal · view mode **Latest** · form `boxfusion.dsdnpo/create-npo v61`
**Application under test:** APPL26-01106 (`QA Smoke NPO 2026-08-14`)

## Summary
| Total Steps | Passed | Failed | Skipped |
|-------------|--------|--------|---------|
| 8 | 4 | 3 | 1 |

> **Scope caveat.** This is one case from the **smoke** plan (101541), exercising Tabs 1–2 of the registration
> wizard only. It is not an accessibility audit of the portal, and the Functional plan's 314 cases remain untouched.

## Step Results

### TC-14W-001 — Keyboard-only navigation across all wizard tabs (ADO #102160)
**Mode:** ai-repair — driven with real `Tab` / `Enter` key events, no mouse, focus state read at each stop
**Duration:** ~300s

- [PASS] Step 1–2 (Tab 1 *Read This*) — **18 tab stops**, every one reachable and visible. No keyboard trap; the
  sequence exits the page cleanly.
- [PASS] Step 3–4 (Tab 2 *Organisation Details*) — **34 tab stops**. **All 17 form controls are reachable** and each
  reports its correct accessible label (`Organisation Name *`, `Financial year end month *`, `Full Address *` ×2,
  `Legal Form *`, `Office Bearer Term (Year(s)) *`, …). `Back` is reachable.
- [FAIL] Step 2/4 — **focus is NOT visible on every interactive element.** Measured while focused:
  | Element type | Focused style | Visible indicator? |
  |---|---|---|
  | Buttons (`Next`, `Back`, `Enquiry`) | `outline: solid 4px rgb(237,210,147)` | yes, but low contrast (below) |
  | Text / search inputs | wrapper border + shading changes | **yes** |
  | Checkboxes, radios | outline ring | **yes** |
  | **Nav links** (`Dashboard`, `Register NPO`, `Education and Awareness`, `Contact Us`, `FAQs`, footer `Contact Us`, `FAQ`) | `outline: none`, `box-shadow: none`, no colour or underline change | **NO — none at all** |
- [FAIL] Step 4 — **the 7 wizard stepper tabs are not keyboard-reachable.** Each `.ant-steps-item` has no
  `tabindex` and contains no focusable child, so `Read This … Declaration` never receive focus. The case requires
  *"all tabs … reachable by keyboard alone"*. (Consequence: the tab-tick navigation that TC-05-028 exercises is
  **mouse-only**.)
- [FAIL] **(BLOCKING)** Step 5–6 — **the validation error can neither be triggered nor announced.** On Tab 2 with
  required fields blank: `Next` is `disabled`, there are **zero** `.ant-form-item-explain-error` nodes, and the only
  `role="alert"` on the page is a **static informational note** (*"Note: Please complete the organisation
  information below…"*) that never changes. Because `Next` is disabled it is **removed from the tab order** — a
  keyboard-only user cannot reach it, cannot fire the validation, and receives no announcement and no focus move.
- [SKIPPED] Step 7–8 — keyboard-only submission not attempted in this case; the blocking failure at step 6 stops
  the test per RULES.md §3.

## Evidence

**Focus indicator, measured not eyeballed.** Screenshot-diffing the header region with and without focus on the
`Register NPO` nav link gives **0 differing bytes** — the rendered pixels are byte-identical. The same routine
applied to the `Next` button as a control gives **897 differing bytes**, so the method does detect a real ring.
The nav-link finding is therefore a measurement, not an inference.

**Focus-ring contrast (WCAG 2.1 SC 1.4.11 Non-text Contrast, requires 3:1).** The button ring is
`rgb(237,210,147)` (relative luminance 0.662):
- against the button's own background `rgb(198,131,27)` (luminance 0.283) → **2.14:1**
- against the white page behind it → **1.47:1**

Both are below 3:1, so even where a focus indicator exists it does not meet AA.

**A correction worth recording:** my first pass flagged text inputs as having no focus ring too, because I tested
`outline`/`box-shadow` on the `<input>` itself. The indicator is applied to the wrapping
`.ant-input-affix-wrapper`, and the pixel diff (646 bytes) shows the change is real. **Inputs are fine** — only
nav links are unindicated.

## Assertions
- [x] ASSERT every control on Read This is keyboard-reachable — **PASS** (18/18)
- [ ] ASSERT visible focus on each — **FAIL** (7 nav links have no indicator; button rings fail 1.4.11 contrast)
- [x] ASSERT every control on Organisation Details is keyboard-reachable — **PASS** (17/17 fields)
- [ ] ASSERT (BLOCKING) a validation error is announced and takes focus — **FAIL**
- [ ] ASSERT the remaining tabs are keyboard-navigable — **FAIL** for the stepper itself
- [ ] ASSERT submission completes keyboard-only — **SKIPPED**

## Observations
1. **Registration is no longer blocked, so this case ran further than the plan anticipated.** The plan expected
   steps 3–8 to report `SKIPPED` behind the address blocker. Tabs 1–2 were fully exercised; the plan's
   "expect SKIPPED" note should be updated.
2. **The disabled-`Next` pattern is an accessibility problem, not only a usability one.** It was already recorded
   five times as "blocked with no feedback". Removing the only actionable control from the tab order means an
   assistive-technology user gets *no* signal — no error text, no live region, no focusable target. Whatever fix is
   chosen for the sighted case (enable `Next` and validate on click, or render per-field errors) would also resolve
   this, so it is likely one fix rather than two.
3. **Several buttons have no accessible name** — the header avatar, the view-mode toggle and the three social-media
   buttons all expose an empty label. Relevant to SC 4.1.2 but outside this case's assertions; noted, not asserted.
4. The wizard's informational `role="alert"` is used for **static guidance**. A permanently-present alert region
   is announced on load and then never updates, which trains AT users to ignore it — worth flagging if a real
   live region is added later.

## Questions for the test lead (Thabiso)
1. **Is WCAG 2.1 AA the contractual target for this portal?** For a South African government service it normally
   is, and it decides whether the focus-visible and contrast findings above are **defects** or **advisories**.
   Everything in this report is measured, so the measurements stand either way — only the severity depends on this.
2. **Are the wizard stepper tabs intended to be interactive at all?** They are clickable by mouse (TC-05-028
   depends on that), but they are not buttons or links in the markup. If they are meant to be navigation, they need
   roles and keyboard access; if they are meant to be a read-only progress indicator, TC-05-028 needs rewriting.
3. **Should `Next` be disabled at all?** The alternative — always enabled, validate on click, focus the first
   offending field — would satisfy TC-03-003's *"each required field shows its own validation error"*, this case's
   step 6, and the five earlier "no feedback" observations in one change.
