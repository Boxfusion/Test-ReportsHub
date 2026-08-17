# Report: NPO-REG — TC-04 retry (Organisation Details cannot be completed)

**Date:** 2026-08-12
**Plan:** test-plans/npo-registration/register-new-npo.md
**Cases:** TC-04
**Execution Mode:** ai-driven (Playwright via Node)
**Result:** BLOCKED — every asterisked mandatory field was populated and verified, yet Next stayed disabled with no validation message. Root cause appears to be a non-functioning Google Places address lookup.
**Duration:** not instrumented

## Summary
| Total Assertions | Passed | Failed | Skipped |
|---|---|---|---|
| 5 | 4 | 1 | 0 |

Resumed the existing draft `b65b2d71-e108-42d6-bfe5-eb81a02b9724` rather than creating a new one.
Run on the developer's account (`mpenduloizwelinuk@gmail.com`).

## What was fixed since the first attempt
Two harness faults from the earlier run were found and corrected — **neither was an app defect**:

1. **AntD select handling.** A closed `.ant-select-dropdown` stays **mounted**, so a global
   `.ant-select-item-option` lookup matched stale hidden options and only the first select was ever set. Fixed by
   scoping options to `.ant-select-dropdown:not(.ant-select-dropdown-hidden)` and verifying via
   `.ant-select-selection-item`. *Financial year end month* now sets reliably.
2. **`fill()` does not bind on this form.** A scripted `fill()` sets the DOM value but React state never updates, so
   the next re-render blanks the field — which is how the first run reported "9 fields filled" and then read
   entirely empty. Fixed with click → clear → `pressSequentially` → Tab, then read the value back. All 9 targeted
   fields now verify.

## Step Results

### TC-04 — Organisation Details happy path
**Mode:** ai-driven · **Result:** BLOCKED

- [PASS] Resumed at *Organisation Details*
- [PASS] **The mandatory set is conditional on Legal Form** — 8 required fields before choosing one, **9 after**: a
  `Membership *` radio appears once *Voluntary Association* is selected
- [PASS] All 9 targeted text fields accepted real keystrokes and retained their values
- [PASS] *Financial year end month* set to January and verified
- [FAIL] (BLOCKING) **Next is still disabled with every mandatory field populated**

Final state immediately before the check — all nine satisfied:

| Mandatory field | Value |
|---|---|
| Organisation Name | `QA Test NPO 2026-08-12` |
| Organisation mobile number | `0818400598` |
| Organisation Email Address | `mpenduloizwelinuk@gmail.com` |
| Financial year end month | `January` |
| Full Address (1) | `18 South Street, Zwartkop, Centurion, South Africa` |
| Full Address (2) | `18 South Street, Zwartkop, Centurion, South Africa` |
| Legal Form | `Voluntary Association` |
| Membership | selected |
| Office Bearer Term (Year(s)) | `3` |

`nextDisabled = true`. **No validation message anywhere in the DOM** — `.ant-form-item-has-error`,
`.ant-form-item-explain` and `.ant-form-item-explain-error` were all empty. Button markup:
`<button type="button" class="ant-btn … ant-btn-primary" disabled=""><span>Next</span></button>`

## 🔴 Probable root cause — the address lookup is not functioning

A structural inspection of the step (30 visible form items) found **seven fields that render a label and an empty
div, with no input control of any kind**:

`District Municipality` ×2 · `Metropolitan Municipality` ×2 · `Area Code` ×2 · `Province`

A probe established why they are meant to be uneditable — and why they never populate. **Full Address is a Google
Places autocomplete**, and those seven fields are **derived** from the resolved address.

> ⚠️ **A first probe concluded the Places widget was dead and the API key probably rejected. That conclusion was
> WRONG and is retracted.** Its typing had gone to the input's wrapper rather than the input, so nothing was ever
> typed — "no suggestions" proved nothing. Re-run with the typing method already proven to land text, plus console
> capture, the picture reverses.

**What is actually true (probe 2, text confirmed in the field):**

| Check | Result |
|---|---|
| `google.maps.places.Autocomplete` present | ✅ yes |
| `AuthenticationService.Authenticate` | ✅ **200** — the key **is** authorised for this host |
| Prediction calls while typing | ✅ **`AutocompletionService.GetPredictionsJson` fires on every keystroke**, country-restricted to `za`, all **200** |
| `.pac-container` in the DOM | 🔴 **never exists** — `{exists: false}` at +2s, +5s and +9s |
| Suggestions selectable | 🔴 none, by mouse or ArrowDown; retried with a broad query (`Pretoria`) — same |
| Derived fields after typing | 🔴 District Municipality / Metropolitan Municipality / Area Code / Province all remain `""` |

So the lookup **works and Google answers** — the suggestion list is simply **never rendered**, so no address can be
resolved, the seven derived fields stay empty, and `Next` never enables.

**Two app-side console errors name the likely causes:**

1. 🔴 **`You have included the Google Maps JavaScript API multiple times on this page. This may cause unexpected
   errors.`** — Google's own error. A duplicate Maps load is a well-known cause of exactly this failure mode: the
   second load clobbers the first instance's bindings, so an `Autocomplete` object still exists and still queries,
   but its dropdown is never attached to the DOM.
2. 🔴 **`executeScriptSync error TypeError: Cannot read properties of null (reading 'incomeTaxNumber')`** — a custom
   Shesha script on this form throwing on a null object, alongside
   `Failed to execute action 'shesha.common:Execute Script'`. If that script is what binds or applies the address
   result, it would abort before the derived fields are populated.

Also worth passing on: the form uses the **legacy `google.maps.places.AutocompleteService`**, which Google warns is
*"not available to new customers"* as of 1 March 2025 and recommends replacing with `AutocompleteSuggestion`. It
still functions here, so this is technical debt rather than the cause.

**This is now evidenced as an application-side blocker, not an automation limitation** — both failing errors are
thrown by the application's own scripts, and the harness demonstrably typed real text that Google acted on.
Logged as `test-reports/bugs/2026-08-12-address-autocomplete-renders-no-suggestions.md`. Thabiso still owns the
final call on intended behaviour.

Form version in play: `boxfusion.dsdnpo/create-npo v60 LIVE`.

## Observations for Thabiso
1. **No validation feedback at all.** Next is disabled with nothing indicating which field is unsatisfied — on an
   empty step, a partial step, and a step where every visible mandatory field is filled. Whatever the address
   outcome, this is what turns a five-minute problem into an hour.
2. **The mandatory set changes with Legal Form** (`Membership` appears for *Voluntary Association*). Whether **NPC**
   and **Trust** reveal different fields again is untested.
3. `Office Bearer Term (Year(s))` is an `ant-input-number`, not a text field.
4. `National (SA)` and `International` are optional selects; their purpose is unclear.
5. `404 GET /api/services/dsdnpo/NpoPerson/CurrentPersonLogin` persists on every page load — unrelated to this
   blocker as far as could be told, but still a missing endpoint.

## Test data
No new draft was created. Draft `b65b2d71-e108-42d6-bfe5-eb81a02b9724` remains parked at *Organisation Details*;
nothing was saved, because saving requires Next. Draft `1c4cab6f-ba3d-496f-917c-0548e0fed241` also remains.

## Coverage not reached
TC-03's format validation (invalid email, non-numeric mobile, non-numeric term) and TC-05 → TC-10 remain
**untested** — the wizard cannot currently be advanced past *Organisation Details*.
