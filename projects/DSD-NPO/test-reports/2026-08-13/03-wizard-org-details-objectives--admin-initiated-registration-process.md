# Report: NPO-03 — Application Wizard, Tabs 1–3 (admin-initiated Registration Process)

**Date:** 2026-08-13 09:28 UTC
**Plan:** test-plans/npo-registration/03-wizard-org-details-objectives.md
**Spec:** test-plans/npo-registration/03-wizard-org-details-objectives.spec.ts
**Execution Mode:** ai-repair
**Result:** PARTIAL — the registration blocker is RETRACTED; the wizard advances past Organisation Details
**Duration:** 500s
**Cases:** TC-03-004, TC-03-006, TC-03-008, TC-03-016, TC-03-032 (smoke suite 101860)
**Environment:** QA · admin portal · view mode **Latest**
**Instance:** `Registration Process` · Ref **APPL26-00793** · `id=525fb3ec-be80-428b-9e80-2bfa30525846` `todoid=5c7c7c7e-454c-4973-8fc8-e4af53d70d31`

## Summary
| Total Steps | Passed | Failed | Skipped |
|-------------|--------|--------|---------|
| 24 | 20 | 3 | 1 |

## 🔴 HEADLINE — the "registration is blocked" finding is RETRACTED

**The address autocomplete defect does NOT block registration.** With all 10 mandatory fields populated using
**real keystrokes**, `Next` enabled and the wizard **advanced from Organisation Details to Objectives**, with
Organisation Details marked `ant-steps-item-finish`.

**What actually happened on 2026-08-12:** `fill()` does not bind on this form — it sets the DOM value but React
state never updates, so the fields were **genuinely empty** and `Next` was **correctly disabled**. We then
attributed the disabled button to the unresolved address. That inference was wrong.

This retracts three claims that are currently published across the plan, the bug file and the project notes:

| Claim (2026-08-12) | Status now |
|---|---|
| 🔴 "The wizard cannot get past Organisation Details" | **RETRACTED** — it advances |
| 🔴 "No resolvable address → derived fields stay empty → Next can never enable" | **RETRACTED** — Next enables with the derived fields still empty; they are **not required** |
| ⚠️ "Blocks with NO field-level and NO summary validation message at all" | **RETRACTED as stated** — see below |

**The wizard DOES show field-level validation.** `Income Tax Number` rendered a proper inline error,
*"Please enter a valid tax number"*, in `.ant-form-item-explain-error`. So the "no feedback anywhere" claim is
false as a general statement about this form.

🔑 **Lesson (already a project rule, and it cost us the whole conclusion): assert the value actually landed with
`inputValue()` before drawing any inference from a disabled control.** A disabled `Next` evidences only "some
mandatory field is unsatisfied" — never *which*, and never *why*.

## What IS still a real defect

**The address lookup is genuinely broken** — it just isn't a blocker. Fails **ADO #101632 / TC-03-008**
(*"type 'Pretoria' → Suggestions are returned"*), Priority 1:

- Typed `Pretoria`, then the full `18 South Street, Zwartkop, Centurion, South Africa` — **both verified landed**
  via `inputValue()`.
- `.pac-container` is **never created**. `pacItems: 0`, on both attempts.
- `google.maps` ✅, `google.maps.places` ✅, `places.Autocomplete` ✅ — the library is loaded and the constructor
  exists.
- All **7 derived fields remain empty**: `Province`, `District Municipality` ×2, `Metropolitan Municipality` ×2,
  `Area Code` ×2 — and they carry **no input control at all** (label + empty div), so they can never be completed
  by hand. Severity downgraded **Blocker → High**: an NPO can register, but with no municipality or area data.

## Step Results

### TC-01 / TC-02 — reaching the wizard
**Mode:** ai-repair · **Duration:** 90s
- [PASS] `My Items → Create New` lists **13** initiable workflow definitions
- [PASS] Selecting `Registration Process` creates an instance **immediately, with no confirmation step**
- [PASS] Opens *"Initiate Registration:"*, status `DRAFT`, Ref `APPL26-00793`, form `boxfusion.dsdnpo/create-npo v60`
- [PASS] Stepper renders; `Read This` active, no Back button; Next advances to Organisation Details

### TC-03 / TC-04 / TC-05 — Legal Form conditional fields (ADO #101628 / #101629 / #101630)
**Mode:** ai-repair · **Duration:** 40s
- [PASS] Legal Form = **Voluntary Association** revealed a required **`Membership *`** radio (Membership / Non Membership) — the mandatory set is conditional, as the plan states
- [SKIP] NPC → CIPC field and Trust → IT field not exercised this run (one draft, one legal form)

### TC-06 — Address search (ADO #101632 · TC-03-008)
**Mode:** ai-repair · **Duration:** 120s
- [FAIL] **(BLOCKING)** ASSERT suggestions are returned for `Pretoria` — `.pac-container` was never created
- [FAIL] ASSERT selecting a suggestion populates Physical Address — no suggestion to select
- [FAIL] ASSERT the derived location fields populate — all 7 empty, and none has an input control
- [PASS] ASSERT the typed text landed — `inputValue()` returned the full string on both attempts

### TC-07 — Conditional toggles (ADO #102154 · TC-03-032)
**Mode:** ai-repair · **Duration:** 50s
- [PASS] Ticking **Have Income tax no?** revealed a **required `Income Tax Number`** — a 10th mandatory field
- [PASS] Field-level validation fired on it: *"Please enter a valid tax number"* for `9123456789`
- [SKIP] The hide-and-clear branch, and the RSA ID / Passport swap on the Office Bearer tab, were not exercised

### TC-08 — Add Objective (ADO #101640 · TC-03-016)
**Mode:** ai-repair · **Duration:** 30s
- [PASS] Objectives step reached — **this was previously believed unreachable**
- [PASS] **Add Objective** opens a dialog (FDS Fig.15) carrying a **`Sector`** select, with Save / Cancel
- [SKIP] Saving an objective not exercised (dialog cancelled to leave the draft clean)

## Data used — the tester's own details, not the dev account's
| Field | Value |
|---|---|
| Organisation Name | `Nomfanelo QA Test NPO 2026-08-13` |
| Trading Name/Short Name | `Nomfanelo QA NPO` |
| Organisation mobile / WhatsApp | `0818400598` |
| Organisation Telephone | `0123456789` |
| Organisation Email Address | `Nomfanelo.Nhleko@boxfusion.io` |
| Financial year end month | `March` |
| Full Address ×2 | `18 South Street, Zwartkop, Centurion, South Africa` |
| Income Tax Number | `9123456789` |
| Legal Form / Membership | `Voluntary Association` / `Membership` |
| National (SA) / International | `Eastern Cape` / `Afghanistan` |
| Office Bearer Term (Year(s)) | `3` |

⚠️ The **session is still Mpendulo's** (`mpenduloizwelinuk@gmail.com`) — the instance reads *"Created by: Mpendulo
ntshangase"*. Only the **form data** is the tester's. There is no portal account under the tester's own
credentials; see the questions below.

## New observations for the test lead

1. **The stepper is DYNAMIC — there are 8 steps, not 7.** After completing Organisation Details a **`Control
   Structure`** step appeared between *Admin & Operations* and *Documents*. Our published 7-step list was taken
   before that point. **The ADO cases were right all along** — suite 05's "Tabs 5-8 incl. Control Structure" is
   correct, and our note questioning the tab count should be withdrawn.
2. **`Next` advanced while a visible validation error was on screen.** The Income Tax Number error was displayed
   and the step still completed. Either the error is advisory, or invalid data is being accepted past the step.
   **Worth a ruling** — this is the shape of defect that reaches production.
3. **`Create New` creates a live workflow instance on a single click**, with no confirm step and no way to
   discard from that screen. Combined with 13 definitions in the list, accidental instances are easy to make.
4. **13 definitions are offered, and the list is not clean:**
   `Deregistration Appeal Definition` **appears twice**, and there is one literally named **`test44`**.
   Also present: `Annual Compliance Submission Definition · Appeal Definition · Change Request Definition ·
   deregistration-appeal · Investigation Process · Npo Application Create · Registration Definition ·
   Registration Definition2 · Registration Process · Voluntary Deregistration Process`.
   That is **13, up from 11 on 2026-08-12** — the list is growing, not being curated.
5. **"Created by … 2 hours ago" on an instance created seconds earlier.** SAST is UTC+2, so this looks like a UTC
   timestamp rendered as local time. Cosmetic, but it will misreport age on every workflow item.
6. **`Office Bearer Term` is captured in `Year(s)`** — ADO #101637 / TC-03-013 prescribes **months**. One of the
   two needs changing.
7. **`National (SA)` = the 9 SA provinces; `International` = a country list.** That answers our standing question
   about those two fields. Both render as **optional**, yet ADO #101636 / #101654 make *Area of Operations*
   **mandatory** — if these are that field, the requirement is not enforced.
8. **Reference-data typo:** the International list contains **`Cryprus`** (Cyprus).
9. **`My Items` shows `0 items found`** for this user even though instances have been created from it. The new
   `APPL26-00793` did not appear in the list behind it. Worth confirming whether My Items filters by something
   other than initiator.

## ❓ Questions for the test lead
1. Which of the 13 workflow definitions are **live**? `test44`, the duplicated `Deregistration Appeal Definition`
   and `Registration Definition2` look like dev leftovers on a QA environment.
2. Should `Next` be permitted while a field-level validation error is displayed?
3. Are `District Municipality`, `Metropolitan Municipality`, `Area Code` and `Province` **meant** to be
   auto-derived only? With the lookup broken they are permanently unpopulated and cannot be entered manually.
4. Can we get a **portal account under the tester's own identity**? Everything currently runs as the developer's
   broadly-privileged account, so no role-scoped behaviour is being tested.

## Artefacts
- Draft left resumable at **Objectives**: `APPL26-00793` — resume rather than creating another.
- No records were deleted or actioned; the Add Objective dialog was cancelled.
