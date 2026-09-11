# Admin → CRUDS → Annual Compliance → "Add" opens a completely empty modal

**Date raised:** 2026-08-17
**Severity:** Medium (blocks the only staff workaround for a bigger gap)
**Area:** Admin portal → CRUDS → Annual Compliance
**Form:** `boxfusion.dsdnpo/annual-compliance v13`
**Environment:** QA · view mode **Latest**
**Relates to:** the `AnnualComplianceGeneratorJob` finding (0 records created register-wide)

## What happens

The Annual Compliance list exposes an **`Add`** button. Clicking it opens a dialog titled **"Add New Record"** whose body
is **completely empty** — zero inputs, zero form items, no content of any kind. Only `Cancel` and `OK` are present.

Measured on the open dialog: `inputs: 0`, `.ant-form-item` count `0`, modal body `innerHTML` length `0`.

## Reproduction

1. Admin portal → **CRUDS → Annual Compliance** (`/dynamic/boxfusion.dsdnpo/annual-compliance`).
2. Click **Add**.
3. Observe an empty "Add New Record" modal with only Cancel/OK.

## Why it matters

This is not merely a cosmetic dead end. As of today **nothing in the product can create an `AnnualCompliance` reporting
period**:

- `AnnualComplianceGeneratorJob` runs successfully and reports *"Created 0 Annual Compliance record(s)"* — for the
  entire 361 000-NPO register.
- Registering and approving a new NPO does not create one.
- This `Add` form is empty.

So no NPO on this build would ever be asked for an annual report, and **staff have no way to correct that by hand**.
The `Add` button is the obvious place a DSD user would go, and it silently does nothing.

## Expected

Either a working capture form (NPO, financial period ending, period year/month, due date, compliance status), or the
button removed if creating periods by hand is not intended.

## Notes

- 📌 This **closes an open question from 2026-08-13**, which asked whether `CRUDS → Annual Compliance → Add` was a
  supported capture path and cautioned against assuming so (after the `My Items → Create New` ruling). The answer is
  that it is **not wired up at all** — so the caution was right, but for a different reason than expected.
- ▶ **The bigger question for the test lead stands:** what is meant to create a newly registered NPO's first reporting
  period? Until that is answered, suite 08 in both plans depends on a harness workaround.
- `OK` on the empty modal was **not clicked** — it is unknown whether it posts an empty record.
