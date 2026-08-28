# Test Plan: NPO-14W-F — Accessibility & WCAG 2.1 AA (functional)

> **Status:** Imported from Azure DevOps 2026-08-18 — client-observable accessibility checks. Fully black-box runnable; the "screen reader announces…" assertions are verified via the ARIA plumbing a screen reader relies on (labels, roles, live regions, focus order).
> **Owner:** QA
> **Last Updated:** 2026-08-18
> **Estimated Duration:** 1200s

## Metadata
| Field | Value |
|-------|-------|
| App URL | Public: https://dsd-npo-publicportal-1-qa.shesha.app/login |
| Environment | QA |
| Login As | mpenduloizwelinuk@gmail.com / 123qwe |
| Lead tester | **Thabiso Kegakwile** |
| ADO Suite | 102151 — *14W Accessibility & WCAG* (10 cases; **9 owned here**, TC-14W-001 is smoke) |

## Objective
> Verify WCAG 2.1 AA basics across the sign-in page and registration wizard: programmatic labels + error association,
> visible focus, keyboard operability (incl. modal focus-trap), colour contrast, 200% zoom reflow, and ARIA live
> regions for status/error messages.

## Excluded — TC-14W-001 is smoke-owned
Work item **#102160 (TC-14W-001)** (wizard keyboard-only navigation) belongs to the smoke plan
(`14w-accessibility-wcag.md`). Excluded here.

## 🔑 Method — what "screen reader announces X" means for a black-box run
Without a live AT harness, each "announced correctly" assertion is verified through the **DOM contract a screen reader
reads**: `<label for>` / `aria-label` / `aria-labelledby` on inputs, `aria-describedby` linking errors, `role`/
`aria-live` on status regions, heading order, `:focus-visible` styles, and `tabindex`/focus-trap behaviour. A missing
contract = a real AT failure. Contrast is computed (WCAG formula) from resolved colours. Zoom via viewport resize.

## 🔑 Starting observations (from earlier suites — re-confirm here)
- Login inputs emit a **DevTools warning: "Input elements should have autocomplete attributes"** (→ TC-14W-002).
- An uploaded-file link renders as an `<a>` **with no `href`** (JS-only) (→ TC-14W-006). ⚠️ **The "→ not
  keyboard-focusable" half of this note is WRONG and is corrected (2026-08-27):** the anchor carries an explicit
  `tabindex="0"`, so it **is** focusable. The real defect is that an `<a>` without `href` has **no implicit ARIA
  role**, so it exposes as `generic` — the filename is announced as plain text, not as a control. **The fix is a
  `<button>`, not a `tabindex`.** What *is* genuinely keyboard-unreachable is the four file **action** controls
  (history ×2, replace, delete): `role="img"` spans at `tabindex="-1"` inside href-less anchors.
- **Only nav links lack a focus ring**; text inputs show focus on the `.ant-input-affix-wrapper` (from 08-14) (→ 002/003).

## Test Cases

### TC-01 — Sign In page WCAG AA (ADO #107408 · TC-14W-002)
*P2 · Src:Code.* ✅ Runnable.
- **Checks:** every field has a programmatic label; visible focus indicator on each control; form is keyboard-operable;
  error messages announced (role/aria-live). Run an in-page audit (labels, focusables, tab order, contrast).
- **Assertions:** [ ] all inputs labelled · [ ] visible focus on each · [ ] a login error is exposed to AT · [ ] no
  critical AA violations.

### TC-02 — Tab 1 Read This: reading order + keyboard progression (ADO #107409 · TC-14W-003)
*P2 · Src:Code.*
- **Checks:** heading structure present and ordered; content in DOM reading order; focus visible; keyboard reaches Next.
- **Assertions:** [ ] a logical heading order (h1→h2…) · [ ] Next reachable by keyboard.

### TC-03 — Tab 2 labels + error association (ADO #107410 · TC-14W-004)
*P2 · Src:Code.* ✅ Runnable.
- **Checks:** every Organisation-Details input has a programmatic label; validation errors linked via
  `aria-describedby`.
- **Assertions:** [ ] (BLOCKING) all inputs labelled · [ ] each error is associated to its field (`aria-describedby`).
- **⚠️** We already know Tab 2 validation is *touched-field* only and often silent — check whether the errors that DO
  appear are AT-associated.

### TC-04 — Tab 4 OB modal keyboard-trap + escape (ADO #107411 · TC-14W-005)
*P2 · Src:Code.*
- **Checks:** focus moves into the Add-Office-Bearer modal on open; Tab cycles within it (trap); **Esc** closes it;
  `role="dialog"` + `aria-modal`.
- **Assertions:** [ ] focus enters the modal · [ ] focus trapped · [ ] Esc closes · [ ] dialog role present.

### TC-05 — Tab 6 Documents: upload accessible (ADO #107412 · TC-14W-006)
*P2 · Src:Code.* ✅ Runnable.
- **Checks:** the upload control is keyboard-focusable and labelled; the selected filename is exposed to AT.
- **Assertions:** [ ] upload reachable by keyboard · [ ] labelled · [ ] filename exposed (not a bare `<a>` without href).
- **📌** Directly tests the queued no-`href` finding.

### TC-06 — Tab 7 Declaration: checkbox + submit accessible (ADO #107413 · TC-14W-007)
*P2 · Src:Code.*
- **Checks:** the 9 declaration checkboxes toggle via **Space**; Submit reachable/operable by keyboard.
- **Assertions:** [ ] checkbox toggles with Space · [ ] Submit keyboard-operable.

### TC-07 — Colour contrast AA (ADO #107414 · TC-14W-008)
*P2 · Src:Code.* ✅ Runnable (computed).
- **Checks:** compute contrast for text vs its background across the sign-in page (and a wizard step); body ≥ 4.5:1,
  large text ≥ 3:1.
- **Assertions:** [ ] RECORD any element below threshold with its ratio · [ ] zero critical violations to pass.

### TC-08 — Zoom 200% reflow (ADO #107415 · TC-14W-009)
*P2 · Src:Code.* ✅ Runnable.
- **Checks:** at 200% zoom (or 640px-equivalent viewport) content reflows with **no horizontal body scroll** and
  controls remain reachable.
- **Assertions:** [ ] (BLOCKING) no horizontal scroll on `body` · [ ] key controls still visible/operable.

### TC-09 — Error/status via ARIA live regions (ADO #107416 · TC-14W-010)
*P2 · Src:Code.* ✅ Runnable.
- **Checks:** login/validation error and success messages sit in an `aria-live` region (or `role="alert"`/`status`) so
  AT announces them without a focus change.
- **Assertions:** [ ] (BLOCKING) the error toast/message is in a live region · [ ] RECORD role/aria-live used.
- **📌** AntD `.ant-message` toasts default to `role="alert"` on the notice — confirm; the login-form 415 crash path
  showed nothing at all (already a bug).

## Coverage against ADO
| Plan case | ADO | TC id | Runnable? |
|---|---|---|---|
| TC-01 | #107408 | TC-14W-002 | ✅ audit |
| TC-02 | #107409 | TC-14W-003 | ✅ structure/keyboard |
| TC-03 | #107410 | TC-14W-004 | ✅ labels/aria |
| TC-04 | #107411 | TC-14W-005 | ✅ modal keyboard |
| TC-05 | #107412 | TC-14W-006 | ✅ upload a11y |
| TC-06 | #107413 | TC-14W-007 | ✅ keyboard |
| TC-07 | #107414 | TC-14W-008 | ✅ contrast (computed) |
| TC-08 | #107415 | TC-14W-009 | ✅ zoom reflow |
| TC-09 | #107416 | TC-14W-010 | ✅ live regions |

**9 cases owned.** Smoke counterpart: TC-14W-001.

## ADO anchors (machine-read — do not delete)
- ADO #107408 · TC-14W-002
- ADO #107409 · TC-14W-003
- ADO #107410 · TC-14W-004
- ADO #107411 · TC-14W-005
- ADO #107412 · TC-14W-006
- ADO #107413 · TC-14W-007
- ADO #107414 · TC-14W-008
- ADO #107415 · TC-14W-009
- ADO #107416 · TC-14W-010

---

## ✅ Executed 2026-08-18 — 6 audited (4 fail · 1 partial · 1 pass); 3 deferred
Report: `test-reports/2026-08-18/14w-accessibility-functional--audit.md` · Bug: `bugs/2026-08-18-accessibility-wcag-aa-violations.md`

| Case | Verdict | Note |
|---|---|---|
| TC-14W-002 | 🔴 FAIL | Sign In inputs unlabelled; email no focus ring; no autocomplete |
| TC-14W-003 | ⚠️ PARTIAL | keyboard OK; no H1/malformed headings; stepper not ARIA-exposed |
| TC-14W-004 | 🔴 FAIL | Tab 2 label `for` points to non-existent ids (broken assoc); no aria-describedby |
| TC-14W-008 | 🔴 FAIL | DSD ochre 3.15:1 (Login button, Forgot/Home/Register) vs AA 4.5:1 |
| TC-14W-009 | ✅ PASS | no horizontal scroll at 960/640px; controls reachable |
| TC-14W-010 | 🔴 FAIL | error toast has no aria-live/role=alert (verified live) |
| TC-14W-005 | ⏸ deferred | OB modal keyboard-trap — needs Tab 4 (AntD default likely OK) |
| TC-14W-006 | ⏸ deferred | upload a11y — partial: uploaded-file `<a>` has no href (suite 05) |
| TC-14W-007 | ⏸ deferred | declaration checkbox Space — needs Tab 7 |

🔑 **Labels broken app-wide** (Sign In none; wizard `for`→missing id) is the biggest finding. Contrast + live-region
fails too. Zoom reflow passes.
