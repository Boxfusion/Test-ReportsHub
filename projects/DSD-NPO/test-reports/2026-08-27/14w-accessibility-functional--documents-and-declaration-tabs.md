# Report: NPO-14W-F — Accessibility & WCAG 2.1 AA (functional) — tab 6 Documents fails, tab 7 Declaration passes

**Date:** 2026-08-27 10:22 UTC
**Plan:** test-plans/cross-cutting/14w-accessibility-functional.md
**Execution Mode:** ai-mcp
**Result:** PARTIAL — the two remaining unverdicted 14W cases are now run. **TC-14W-007 PASSES cleanly**: all 9 declaration checkboxes toggle with Space, Submit is reached by Tab, and the whole application was submitted using the keyboard alone. **TC-14W-006 FAILS**: both upload controls are programmatically unlabelled — their `<label for>` targets IDs that do not exist — the attached filename is an href-less `<a>` exposed to AT as a bare `generic`, and all four document action controls (history ×2, replace, delete) are `role="img"` spans at `tabindex="-1"`, unreachable by keyboard.
**Duration:** ~900s
**Cases:** TC-05, TC-06
**Environment:** QA · public portal · view mode Latest · our own draft application **APPL26-01570** (`6c02e52c-…`)
**Accounts used:** `npo.qa.applicant.b@example.org` (Account B)

## Summary
| Total attempted | Passed | Failed | Partial | Not executed |
|---|---|---|---|---|
| 2 | 1 | 1 | 0 | 0 |

| Case | ADO | Verdict | One-liner |
|---|---|---|---|
| TC-05 Tab 6 Documents: upload accessible | #107412 | ❌ FAILED | Labels point at non-existent IDs; filename is a role-less `<a>`; all file action icons keyboard-unreachable |
| TC-06 Tab 7 Declaration: checkbox + submit accessible | #107413 | ✅ PASSED | 9/9 checkboxes toggle with Space; Submit reached by Tab and fired by Enter — full submission, keyboard only |

## Method

Per the plan's 🔑 note, "announced correctly" is verified through the DOM contract a screen reader reads — `label for`
resolution, `aria-label`, `role`, computed accessibility role, and real `tabindex`/Tab behaviour. Keyboard assertions
were driven with **real key presses**, and the resulting accessibility tree was read back, not inferred.

---

### TC-05 — Tab 6 Documents: upload accessible (#107412 · TC-14W-006) — FAILED

Tab 6 holds two upload fields: **Constitution File \*** (auto-populated with a generated PDF, and `ant-upload-disabled`
— replacement is by design not available) and **Additional Documents File**. A 193-byte probe PDF was uploaded through
the real file chooser to get a second, user-supplied filename to inspect.

**Assertion results**

| Assertion | Result | Evidence |
|---|---|---|
| Upload reachable by keyboard | ⚠️ **partly** | The `(press to upload)` trigger is a native `<button>`, `tabIndex 0`, and **is** the first element in tab order on this tab. But it is the *only* keyboard-reachable upload affordance, and it **disappears once a file is attached** |
| Labelled | ❌ **FAIL** | Both `<label for>` attributes reference IDs that do not exist |
| Filename exposed (not a bare `<a>` without href) | ❌ **FAIL** | Exactly that — `<a>` with no `href`, no `role`, no `aria-label` |

#### 1. Both upload controls are programmatically unlabelled

The visible labels are correct and the `for` attributes are present — but they resolve to nothing:

| Visible label | `label[for]` | Does that element exist? |
|---|---|---|
| Constitution File\* | `constitutionFile` | **No** — `getElementById('constitutionFile')` → null |
| Additional Documents File | `additionalDocumentsFile` | **No** — `getElementById('additionalDocumentsFile')` → null |

Neither `input[type=file]` carries an `id`, a `name`, or an `aria-label`. A search of every `[id]` in the document for
`/constitution|additional/i` returned **zero** matches. So the accessible name of both upload controls is empty, and
the only announceable text on the trigger is the literal string **"(press to upload)"** — identical for both fields,
with nothing to say *which* document is being uploaded. WCAG 1.3.1 and 4.1.2.

#### 2. The attached filename is a link that is not a link

Confirms the plan's queued starting observation, with one correction.

```html
<div class="sha-upload-list-item-info">
  <a tabindex="0">NpoQa Bravo Wizard Test 2026-08-27 - ApplicationNonMembershipConstitution.pdf (79.55 kB)</a>
```

No `href`, no `role`, no `aria-label` — on both the generated constitution and the uploaded probe file. The
accessibility tree renders both as:

```
- generic "NpoQa Bravo Wizard Test 2026-08-27 - ApplicationNonMembershipConstitution.pdf" [cursor=pointer]
- generic "qa-a11y-probe.pdf" [cursor=pointer]
```

⚠️ **Correcting the 2026-08-18 wording.** The earlier observation recorded this as "not keyboard-focusable". That is
not accurate — the anchor carries an explicit `tabindex="0"`, so it **is** focusable. The real defect is narrower and
worth stating precisely: an `<a>` without `href` has **no implicit ARIA role**, so it exposes as `generic`. A screen
reader user hears the filename as plain text with no indication it is actionable, even though it is clickable. The
fix is a `<button>` (or an `href`), not a `tabindex`.

#### 3. Every file action control is keyboard-unreachable

Four icon controls sit beside the attached files:

| Control | Markup | `role` | `tabindex` | In a `<button>`? | In an `<a href>`? |
|---|---|---|---|---|---|
| history (constitution) | `<span aria-label="history">` in `a.sha-upload-history-control` | `img` | **-1** | no | no |
| history (probe file) | same | `img` | **-1** | no | no |
| replace | `<span aria-label="sync">` in `a.sha-upload-replace-control` | `img` | **-1** | no | no |
| delete | `<span aria-label="delete">` in `a.sha-upload-remove-control` | `img` | **-1** | no | no |

All four are `role="img"` at `tabindex="-1"`, wrapped in href-less anchors. They cannot be focused or activated by
keyboard at all — WCAG 2.1.1 (Keyboard). And their accessible names are the **icon glyph names** (`history`, `sync`,
`delete`), not the actions, so even reached by a pointer-plus-AT user they announce as images called "sync".

A real Tab traversal of tab 6 confirms how little is reachable:

```
(press to upload) → Back → Next → [empty link button] → footer Contact Us → footer FAQ
```

Neither the delete nor the replace control appears anywhere in that order. **A keyboard-only applicant can attach a
document but cannot remove or replace it.**

Bug filed: `bugs/2026-08-27-document-upload-controls-unlabelled-and-keyboard-unreachable.md`.

---

### TC-06 — Tab 7 Declaration: checkbox + submit accessible (#107413 · TC-14W-007) — PASSED

Tab 7 renders exactly the **9** declaration checkboxes the case expects, plus `Capacity *` and Submit.

**Assertion results**

| Assertion | Result |
|---|---|
| Checkbox toggles with Space | ✅ **PASS** — verified on **all 9**, not a sample |
| Submit keyboard-operable | ✅ **PASS** — reached by Tab, activated by Enter, submission completed |

#### Checkboxes

Each checkbox is a real `input[type=checkbox]`, `tabIndex 0`, not CSS-hidden, and **wrapped in its own `<label>`** so
the statutory text is its accessible name — e.g. *"Keep accounting records - section 17(1)(a)"*,
*"Details of any changes of its constitution or its name - section 19"*. That is the correct pattern.

Driven with keyboard only — focus the first, then `Space`, `Tab`, `Space`, … — the checked state advanced cleanly:

```
[T,F,F,F,F,F,F,F,F] → [T,T,T,F,F,F,F,F,F] → … → [T,T,T,T,T,T,T,T,T]   allChecked: true
```

Tab order runs through the nine in visual order, and `Space` toggles the focused one every time. No focus loss, no
skipped control.

#### Submit

`Submit` is a native `<button type="button">`, `tabIndex 0`, and gated (correctly) until the 9 declarations and
`Capacity *` are set — it is genuinely `disabled`, not merely `aria-disabled`, so AT reports its state accurately.

With Capacity set to `Chairperson`, Tab from the last checkbox reached it in two steps:

```
input#W5uKObqSbJIHjJ-R3fgR6 (checkbox 9) → BUTTON "Back" → BUTTON "Submit"
```

`Enter` on the focused button submitted the application — the app navigated to
`npo-landing-view?id=be7125b8-…` showing **Application Ref.: APPL26-01570 · NPO Status: APPLICATION IN PROGRESS**.

**The entire declaration-and-submit step is completable with the keyboard alone.** That is the assertion, proven by
execution rather than by semantics.

## Suite position

14W now stands at **8 of 9 owned cases verdicted**. The only one left is **TC-14W-005** (#107411, tab 4 OB modal
keyboard-trap + escape), still DEFERRED from 2026-08-18. 📌 Worth noting for whoever picks it up: this run opened and
closed that OB modal six times and never saw focus escape the dialog or get stuck — but focus-trap behaviour was not
tested deliberately, so that is an impression, **not a verdict**.

## Notes for the test lead

- Tab 6 is the weakest accessibility surface found in the suite so far, and the three defects are independent — the
  broken `for` targets, the role-less filename anchor, and the `tabindex="-1"` action icons each need their own fix.
- The `for`/`id` mismatch looks like a generated-form wiring issue rather than hand-written markup. If the same
  generator drives other upload fields (annual compliance, change requests, appeals attachments), the same defect is
  likely there too and is worth a sweep rather than a per-form fix.
- 📌 `Additional Documents File` accepts only one file — the upload trigger vanishes after the first attachment.
  Whether that is intended is a question, not a finding.
