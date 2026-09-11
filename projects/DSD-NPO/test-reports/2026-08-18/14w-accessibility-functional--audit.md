# Report: NPO-14W-F — Accessibility & WCAG 2.1 AA audit

**Date:** 2026-08-18 14:50 UTC
**Plan:** test-plans/cross-cutting/14w-accessibility-functional.md
**Execution Mode:** ai-repair (computed DOM/CSS audit)
**Result:** FAILED — 4 fails, 1 partial, 1 pass of 6 audited; 3 deferred. Multiple app-wide WCAG 2.1 AA violations
**Duration:** ~700s
**Cases:** TC-14W-002, 003, 004, 008, 009, 010 (audited) · 005, 006, 007 (deferred)
**Environment:** QA · public portal · Sign In page + registration wizard Tabs 1–2

## Summary
| Case | Area | Verdict |
|---|---|---|
| TC-14W-002 | Sign In WCAG AA | 🔴 FAIL |
| TC-14W-003 | Wizard Tab 1 headings/keyboard | ⚠️ PARTIAL |
| TC-14W-004 | Wizard Tab 2 labels/errors | 🔴 FAIL |
| TC-14W-008 | Colour contrast AA | 🔴 FAIL |
| TC-14W-009 | 200% zoom reflow | ✅ PASS |
| TC-14W-010 | ARIA live regions | 🔴 FAIL |
| TC-14W-005/006/007 | Modal / upload / declaration | ⏸ DEFERRED |

Bug: `bugs/2026-08-18-accessibility-wcag-aa-violations.md`.

## 🔴 TC-14W-002 — Sign In page fails AA
- **Inputs have no programmatic label.** Neither the email nor password `<input>` has `<label for>`, `aria-label`,
  `aria-labelledby`, a wrapping `<label>`, or even a `placeholder`. The visible "Email address"/"Password" is an
  unassociated `<strong>`. A screen reader announces the fields as unlabelled edit boxes.
- **Email input has no visible focus indicator** (`outline:none`, no `box-shadow`); the Login button and Forgot link do.
- **No `autocomplete`** on either field (matches the DevTools warning).
- Combined with the contrast and live-region failures below → not AA-compliant.

## ⚠️ TC-14W-003 — Wizard Tab 1 (Read This): partial
- ✅ Keyboard progression works — Next is focusable with a visible focus ring.
- 🔴 **Heading structure is malformed:** the page has **no `<h1>`**; the first heading is an `<h4>`
  ("Initiate Registration:"), then it jumps to footer `<h5>`s. Screen-reader heading navigation is broken/again
  out of order (WCAG 1.3.1 / 2.4.6).
- 🔴 **The 7-step stepper carries no ARIA** (no `role`, no `aria-label`, no current-step indication) — progress is
  invisible to AT.

## 🔴 TC-14W-004 — Wizard Tab 2: broken label associations
The AntD field labels **do** render a `for` attribute (`for="npo_name"`, `for="npo_emailAddress"`,
`for="npo_contactMobileNo"`, `for="npo_physicalAddress_addressLine1"`, …) — **but no element with those ids exists**;
every input has `id: null`. So the `<label for>`→input linkage is broken across the tab: **4 of 16 inputs** resolved a
programmatic label; the rest rely on a `for` pointing at a non-existent id. No `aria-describedby` links errors to
fields either. Screen readers cannot associate the Organisation-Details fields with their labels (WCAG 1.3.1 / 3.3.2 /
4.1.2). Same class of defect as the Sign In page — **app-wide**.

## 🔴 TC-14W-008 — Colour contrast below AA
Computed (WCAG formula) on the Sign In page — the DSD ochre elements all measure **3.15:1** against their background,
below the **4.5:1** required for normal text:
| Element | Ratio | Size | Needs |
|---|---|---|---|
| **Login** button text | 3.15 | 18px | 4.5 |
| Forgot Password link | 3.15 | 14px | 4.5 |
| Home / Register links | 3.15 | 16px | 4.5 |
The primary action (Login) failing is the notable one. The ochre needs darkening (or larger/bolder text) to reach AA.

## ✅ TC-14W-009 — 200% zoom reflow: PASS
At a 960px viewport (≈200% zoom on 1920) and 640px (≈300%) there is **no horizontal body scroll**
(`scrollWidth == clientWidth`), and the email + Login controls remain visible and operable. Reflow is handled.

## 🔴 TC-14W-010 — no ARIA live regions for errors
When the login error toast ("Invalid user name or password") is displayed, **there is no `aria-live` anywhere on the
page**, and neither the `.ant-message` holder nor the `.ant-message-notice` carries `role="alert"`/`status` or
`aria-live`. A screen-reader user gets **no announcement** of the error (WCAG 4.1.3). Verified while the toast was live,
not just from a mutation snapshot.
📌 Worse on the empty-credentials path, which shows nothing at all (the 415 handler crash — separate bug
`2026-08-18-login-no-client-validation-and-415-crashes-error-handler.md`).

## ⏸ Deferred (need deep wizard navigation)
- **TC-14W-005** (Tab 4 OB modal keyboard-trap + Esc) — needs the wizard advanced to Tab 4 (objective + OB). AntD
  modals default to `role="dialog"` + focus-trap + Esc, so likely PASS, but not verified live this run.
- **TC-14W-006** (Tab 6 Documents upload a11y) — **partial evidence already exists**: the uploaded-file link renders as
  an `<a>` **with no `href`** (suite 05), so it is not keyboard-focusable and the filename isn't a proper link — an AT
  gap. Full check needs the Documents tab.
- **TC-14W-007** (Tab 7 declaration checkbox via Space) — the checkboxes are real `<input type=checkbox>` (toggle in
  earlier runs), so Space likely works; not verified via a real keypress this run.

## Observations for the test lead
1. 🔴 **Form fields are not programmatically labelled anywhere** — Sign In has no labels; the wizard's labels point
   `for` at ids that don't exist. This is the biggest AT blocker and it's app-wide.
2. 🔴 **DSD ochre fails AA contrast (3.15:1)** on buttons and links, including the primary Login button.
3. 🔴 **Error/status messages aren't announced** (no ARIA live region).
4. ⚠️ **No H1 / malformed heading order** and the wizard stepper isn't ARIA-exposed.
5. ✅ Reflow at 200%/300% zoom is fine.

## Method notes
- 🔑 "Screen reader announces X" verified via the DOM contract AT reads (label `for`/`id` resolution, `aria-*`,
  `role`, live regions) — a broken contract is a real AT failure.
- 🔑 Contrast computed with the WCAG relative-luminance formula from resolved `color`/`background-color`.
- 🔑 Live-region check done **while the toast was on screen** (re-triggered and read within 900ms), not inferred.
- 🔑 The broken label association was confirmed with `getElementById` on the `for` targets — all four returned null.
