# Registration wizard Tab 2: validation is advisory — invalid values pass Next and persist

**Date raised:** 2026-08-17
**Severity:** High
**Area:** Public portal → Registration wizard → Tab 2 *Organisation Details*
**Form:** `boxfusion.dsdnpo/create-npo v61`
**Environment:** QA · view mode **Latest**
**Found on:** draft `APPL26-01212`
**Fails:** ADO #101627 (TC-03-003), #101635 (TC-03-011), #101636 (TC-03-012), #101650 (TC-03-026), #101654 (TC-03-030)

## Screenshot evidence

Captured on a second run (draft `APPL26-01214`) in `test-reports/2026-08-17/evidence/`:

| File | Shows |
|---|---|
| `v2-blank-tab2-no-messages.png` | Blank Tab 2 — 8 fields starred, `Next` **greyed out**, **not one validation message on the page**. Also shows `National (SA)` carrying **no** asterisk. |
| `v4-tax-error-but-next-enabled.png` | `Income Tax Number = 12345`, red border, **"Please enter a valid tax number"** beneath it — and `Next` **solid orange / enabled**. |
| `v5-advanced-despite-error.png` | The wizard **on step 3 Objectives**, with **Organisation Details ticked green** despite holding the invalid value. |
| `v6-invalid-value-kept-error-gone.png` | Back on Tab 2 — `12345` still there, **black border, no message**. Looks clean. |

The v2 ↔ v4 pair is the whole finding: `Next` is greyed when nothing is filled and *enabled* when something is invalid.

## What happens

Tab 2 has two validation behaviours and neither one actually protects the data:

| Situation | `Next` | Message shown |
|---|---|---|
| Required field **empty** | **disabled** | **none** |
| Field value **invalid** | **enabled** | per-field error |

So a user who leaves something out is blocked with no idea why, and a user who types something invalid is told — and
then allowed to proceed anyway.

## Reproduction — the invalid-value path (clearest case)

1. Open a fresh draft, reach Tab 2, fill every required field validly.
2. Tick **Have Income tax no?** → `Income Tax Number*` appears, marked required.
3. Enter **`12345`**.
   → the field shows **"Please enter a valid tax number"**
   → **`Next` is enabled** (`disabled === false`)
4. Click **Next** → the wizard **advances to Objectives**. No toast, no block.
5. Click **Back** → `Income Tax Number` still holds **`12345`**, and **the error is no longer displayed**.
6. Refresh the page and walk back to Tab 2 → **`12345` is still there**, still no error.

The invalid value is flagged once, saved, and then presents as clean.

## Reproduction — the empty-required path

On a completely blank Tab 2, click nothing and inspect:

```
Next .disabled                        = true
.ant-form-item-explain-error  count   = 0
.ant-form-item-has-error      count   = 0
[aria-invalid="true"]         count   = 0
```

ADO #101627 prescribes *"Each required field shows **its own** validation error; navigation to Step 2 is blocked."*
Navigation is blocked; **no field shows anything.**

🔑 **The form is capable of per-field errors** — `Email = invalid` correctly renders *"Please enter a valid email
address"*. So this is not a missing error mechanism; empty-required specifically produces no feedback.

## 🔑 ROOT CAUSE (identified 2026-08-17 while running suite 04) — touched vs pristine

The Office Bearer dialog **does** show required-field errors. Clearing a field *after typing in it* gives:

```
Email Address cleared  → "This field is required" + "Please enter a valid email address"
Mobile Number cleared  → "This field is required"
```

So the application is not missing required-field validation — **it relies on AntD validating only fields the user has
touched.** A user who lands on a pristine Tab 2 and presses `Next` has touched nothing, so nothing validates, and the
only signal is a disabled button.

▶ **The fix is therefore specific:** call `validateFields()` on the submit/Next attempt rather than depending on touch
state. That single change would close **TC-03-003, TC-03-012, TC-03-030** and the Tab 4 silence together.

Evidence: `test-reports/2026-08-17/evidence/v12-ob-required-errors-shown.png` (errors shown once touched) against
`v2-blank-tab2-no-messages.png` (pristine form, nothing shown).

⚠️ **This supersedes the original framing of this bug** as "empty-required produces no feedback". It does produce
feedback — but only after interaction, which is precisely when the user no longer needs it.

## Same shape on two more fields

- **Area of Operations** (#101636 / #101654): mandatory and enforced — with everything else valid `Next` stayed
  disabled, and selecting one province enabled it instantly — but the field has **no `*`, no
  `ant-form-item-required` class**, and never shows an error.
- **NPC Registration Number** (#101650): `19/123456/08` and `2019-123456-08` are both malformed, show **no error**,
  and do **not** block `Next`. Interestingly the CIPC lookup only fires for a well-formed value, so the format *is*
  evaluated — just never surfaced to the user.

## Why it matters

These are the fields DSD assessors later verify. An application can reach *Document Verification* carrying an invalid
tax number and a malformed CIPC registration number, with nothing in the record showing that the portal already knew
they were wrong. And the empty-required case is the top complaint shape on this build: users are stopped by a disabled
button with no indication of which field is at fault.

## Expected

`Next` should be gated by validation state, and every unsatisfied required field should identify itself — per #101627.
One fix here would close five cases.

## Notes

- This is the Tab 2 counterpart of the already-recorded *"server validation errors are silently discarded"* behaviour.
  Here it is client-side and fully reproducible with no API involvement.
- **Tab 3 does better and is worth copying:** with zero objectives, `Next` is disabled **and** the step displays
  *"Please click on the Add Objective button…"*. The same build guides the user there and says nothing on Tab 2.
