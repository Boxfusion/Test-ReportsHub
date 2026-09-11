# Bug: multiple app-wide WCAG 2.1 AA violations (labels, contrast, live regions, headings)

**Date:** 2026-08-18
**Severity:** High (accessibility / POPIA-adjacent; legal exposure for a government portal)
**Area:** Public portal — Sign In page and registration wizard (app-wide patterns)
**Environment:** QA
**Found by:** Suite 14W (TC-14W-002/003/004/008/010)

## Summary
The public portal has several WCAG 2.1 AA failures that recur across pages: form fields are not programmatically
labelled, the brand ochre fails colour-contrast, error messages are not announced to assistive technology, and the
heading structure is malformed. For a government service portal these are compliance and access-equity issues.

## Findings

### 1. Form fields have no working programmatic label (WCAG 1.3.1 / 3.3.2 / 4.1.2)
- **Sign In:** the email and password `<input>`s have **no** `<label for>`, `aria-label`, `aria-labelledby`, wrapping
  `<label>`, or `placeholder`. The visible text is an unassociated `<strong>`.
- **Wizard Tab 2 (Organisation Details):** field labels render `for="npo_name"`, `for="npo_emailAddress"`,
  `for="npo_contactMobileNo"`, `for="npo_physicalAddress_addressLine1"` … **but no element has those ids** (every input
  has `id: null`). `getElementById` on all four `for` targets returns null. So the label/input association is broken.
- Errors are not linked via `aria-describedby`.
- **Impact:** screen-reader users hear unlabelled edit boxes and cannot tell which field is which.

### 2. Colour contrast below AA (WCAG 1.4.3)
The DSD ochre measures **3.15:1** against its background (needs 4.5:1 for normal text): the **Login** button,
"Forgot Password", "Home", "Register". Computed with the WCAG relative-luminance formula.
- **Impact:** low-vision users struggle to read the primary action and navigation.

### 3. Error/status messages not announced (WCAG 4.1.3)
The login error toast ("Invalid user name or password") appears with **no `aria-live` anywhere on the page** and no
`role="alert"`/`status` on the `.ant-message` holder or notice. Verified while the toast was on screen.
- **Impact:** a screen-reader user gets no feedback that sign-in failed. (Worse on empty credentials, which show
  nothing at all — see `2026-08-18-login-no-client-validation-and-415-crashes-error-handler.md`.)

### 4. Malformed heading structure + non-exposed stepper (WCAG 1.3.1 / 2.4.6)
The wizard's Read-This tab has **no `<h1>`** (first heading is `<h4>`, then footer `<h5>`s), and the 7-step stepper
carries no `role`/`aria-label`/current-step semantics.
- **Impact:** heading navigation is broken; progress through the wizard is invisible to AT.

## What passes
- **200% / 300% zoom reflow** — no horizontal scroll, controls remain reachable (WCAG 1.4.10). ✅

## Also relevant (from other suites)
- Uploaded-file links render as `<a>` with **no `href`** (suite 05) — not keyboard-focusable (WCAG 2.1.1).
- The email input on Sign In has **no visible focus indicator** (WCAG 2.4.7).

## Fix direction
- Give every input a real programmatic label (ensure AntD `Form.Item` sets the input `id` matching the label `for`,
  or add `aria-label`). Add `autocomplete`.
- Darken the ochre (or enlarge/bolden the affected text) to reach 4.5:1.
- Render error/status toasts inside an `aria-live="assertive"` / `role="alert"` region.
- Add a single `<h1>` per page and a logical heading order; expose the stepper with `role`/`aria-current`.

## Method / evidence
Computed DOM+CSS audit (no live AT): label `for`→id resolution via `getElementById`, WCAG contrast formula on resolved
colours, live-region check while the toast was displayed, heading enumeration, viewport-resize reflow check. Detail in
`test-reports/2026-08-18/14w-accessibility-functional--audit.md`.
