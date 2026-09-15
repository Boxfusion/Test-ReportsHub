# 🟠 Medium — Document upload: labels point at non-existent IDs, and every file action control is keyboard-unreachable

**Raised:** 2026-08-27
**Found in:** NPO-14W-F TC-05 (ADO #107412 · TC-14W-006)
**Environment:** QA · public portal · registration wizard tab 6 — Documents · view mode Latest
**Specimen:** our own draft application **APPL26-01570** (`6c02e52c-…`), Account B; generated `ApplicationNonMembershipConstitution.pdf` plus an uploaded 193-byte probe PDF
**Severity:** 🟠 Medium — WCAG 2.1 AA failures on 1.3.1, 2.1.1 and 4.1.2; a keyboard-only applicant can attach a document but cannot remove or replace it

Three independent defects on the same tab. They need separate fixes.

## 1. Both upload controls are programmatically unlabelled

The visible labels are correct and `for` attributes are present, but they resolve to nothing:

| Visible label | `label[for]` | Target element exists? |
|---|---|---|
| Constitution File\* | `constitutionFile` | **No** — `getElementById('constitutionFile')` → `null` |
| Additional Documents File | `additionalDocumentsFile` | **No** — `getElementById('additionalDocumentsFile')` → `null` |

Neither `input[type=file]` carries an `id`, a `name`, or an `aria-label`. Sweeping every `[id]` in the document for
`/constitution|additional/i` returns **zero** matches.

Consequence: both upload controls have an **empty accessible name**. The only announceable text on the trigger is the
literal `"(press to upload)"` — **identical for both fields**, with nothing to indicate which document it belongs to.
WCAG 1.3.1 (Info and Relationships), 4.1.2 (Name, Role, Value).

This looks like generated-form wiring rather than hand-authored markup. **If the same generator drives other upload
fields — annual compliance, change requests, appeals attachments — the defect is probably there too.** Worth a sweep
rather than a per-form fix.

## 2. The attached filename is a link that is not a link

```html
<div class="sha-upload-list-item-info">
  <a tabindex="0">NpoQa Bravo Wizard Test 2026-08-27 - ApplicationNonMembershipConstitution.pdf (79.55 kB)</a>
```

No `href`, no `role`, no `aria-label` — on both the generated constitution and the uploaded probe file. The
accessibility tree exposes both as bare containers:

```
- generic "NpoQa Bravo Wizard Test 2026-08-27 - ApplicationNonMembershipConstitution.pdf" [cursor=pointer]
- generic "qa-a11y-probe.pdf" [cursor=pointer]
```

⚠️ **Correcting an earlier note.** The 2026-08-18 starting observation recorded this as *"not keyboard-focusable"*.
That is inaccurate — the anchor carries an explicit `tabindex="0"`, so it **is** focusable. The actual defect is
narrower: an `<a>` with no `href` has **no implicit ARIA role**, so it exposes as `generic`. A screen-reader user
hears the filename as plain text with no indication that it is actionable, even though it is clickable.

**The fix is a `<button>` (or a real `href`) — not a `tabindex`.** Adding focusability to a role-less element is what
produced the current half-state.

## 3. Every file action control is unreachable by keyboard

Four icon controls sit beside the attached files:

| Control | Markup | `role` | `tabindex` | In `<button>`? | In `<a href>`? |
|---|---|---|---|---|---|
| history (constitution) | `<span aria-label="history">` in `a.sha-upload-history-control` | `img` | **-1** | no | no |
| history (probe file) | same | `img` | **-1** | no | no |
| replace | `<span aria-label="sync">` in `a.sha-upload-replace-control` | `img` | **-1** | no | no |
| delete | `<span aria-label="delete">` in `a.sha-upload-remove-control` | `img` | **-1** | no | no |

All four are `role="img"` at `tabindex="-1"` inside href-less anchors — they cannot be focused or activated by
keyboard at all. WCAG 2.1.1 (Keyboard).

Their accessible names are also the **icon glyph names**, not the actions: a user who does reach one by pointer plus
AT hears *"sync, image"*, not *"replace Constitution File"*.

A real Tab traversal of tab 6 shows how little is reachable:

```
(press to upload) → Back → Next → [empty link button] → footer Contact Us → footer FAQ
```

Neither delete nor replace appears anywhere in that order.

## Practical impact, stated plainly

**A keyboard-only applicant can attach a supporting document but cannot then remove or replace it.** The only
recovery is a pointer. For a statutory registration form that is a real barrier, not a cosmetic one.

## What is correct on this tab

Recorded so the fix does not regress it:

- The `(press to upload)` trigger **is** a native `<button>` at `tabIndex 0`, and it is genuinely first in tab order.
- The Constitution File upload is `ant-upload-disabled` by design — the PDF is system-generated, so no replacement
  control is expected there.

## Reproduction

1. As a public applicant, drive a registration to wizard **tab 6 — Documents**.
2. Upload any file to **Additional Documents File**.
3. In DevTools: `document.getElementById('constitutionFile')` → `null`; same for `additionalDocumentsFile`.
4. Inspect the attached filename → `<a>` with no `href`.
5. From the page top, Tab through and observe that the history/replace/delete icons are never focused.

## 📌 Separate question, not a defect

`Additional Documents File` accepts only **one** file — the upload trigger disappears after the first attachment.
Whether that is intended for a form that says *"Please download/Upload all required documents"* is a question for the
test lead.
