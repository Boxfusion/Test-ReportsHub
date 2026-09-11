# Bug: Appeal and case-assignment letters render their reference number as empty

**Date:** 2026-08-24
**Severity:** Medium-High
**Area:** Notifications — `Denied of Appeal`, `Notice of Appeal`, `Acknowledgement Appeal`, case assignment
**Environment:** QA
**Found by:** TC-14T-019 (ADO #101846) and TC-14T-021 (ADO #101848)

## Summary
Four notification templates across two modules print a sentence built around a reference number, and the merge field
renders as nothing. The recipient is told an outcome without being told **which** appeal or case it refers to.

TC-14T-019 requires *"Email confirms appeal receipt **with appeal reference**"*; TC-14T-021 requires the denial to
identify the appeal. Neither holds.

## Evidence — the sentence collapses around the missing value

| Template | Rendered text | Rows | Latest |
|---|---|---|---|
| `Email Denied of Appeal` | *"The Appeal for Decline NPO Validation **with reference** has been denied."* | 8 | 2026-08-07 |
| `Email Notice of Appeal` | *"the appeal for Decline NPO Validation **with reference** has been assigned to a tribunal"* | 8 | 2026-08-07 |
| `Email Acknowledgement Appeal` | *"We acknowledge receipt of your Appeal for the Test Unsuccessful 03."* — no reference field at all | 27 | 2026-08-10 |
| Case assignment (investigations/CRM) | *"the case with reference number `<br><br>` has been assigned to you"* — and the **subject** collapses to `": Non-Compliance to NPO Act"` | 5 | 2026-08-06 |

The case-assignment subject is the clearest tell. Sibling messages render as
`REF003/07/08/2026: Appeal outcome`, so the pattern is `<reference>: <subject>`. When the reference is empty the
subject begins with a bare `": "`.

## Steps to reproduce
1. Harvest the notification store (query in `2026-08-24-ob-reminder-link-host-does-not-resolve.md`).
2. Filter `subject` for `Email Denied of Appeal` / `Email Notice of Appeal`, and separately for `/^\s*:\s/`.
3. Read the `message` field. The reference position is empty in every row.

## Expected
The appeal or case reference appears in the body, and in the subject where the template prefixes it.

## Actual
Empty. Two of the templates leave the grammar dangling (*"with reference has been denied"*), which is how the defect
becomes visible rather than merely unhelpful.

## Scope note recorded honestly
- `Acknowledgement Appeal` is a slightly different case from the other three: it never had a reference *slot*, it just
  names the NPO. Whether that is a missing field or an intentionally simpler template is for the template owner to
  say — but TC-14T-019 asks for a reference, so the case fails either way.
- The `<br><br>` in the case-assignment body shows the template does have a slot there and it is being fed an empty
  value, rather than the whole clause being absent.
- 📌 The same empty-merge-field pattern appears on the NPO name in `Email Denied Post Registration` — logged
  separately as `2026-08-24-denied-post-registration-letter-drops-npo-name.md`. Four modules, one shape of failure;
  worth checking whether they share a rendering path.

## Fix direction
Trace where the appeal/case reference is populated for these four templates. Given the same shape recurs on a
different field in a fifth template, look for a common cause in how the notification payload is assembled before
fixing each template individually.

## Verdict
TC-14T-019 **FAILED**, TC-14T-021 **FAILED** (this defect plus the missing claim attachment).
