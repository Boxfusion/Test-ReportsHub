# Bug: unstarred mandatory fields silently gate Next / Save / Reject — no field-level feedback anywhere

**Date:** 2026-08-20
**Severity:** **High** — not because any one field is hard to guess, but because the pattern repeats across the build
and each instance costs the user (and cost QA) an unbounded amount of time with no way to diagnose it.
**Area:** Public portal registration wizard (`create-npo`, `npo-office-bearer`) + admin portal Document Verification
(`document-verification-copied`)
**Environment:** QA
**Found by:** completing registration APPL26-01494 end-to-end and rejecting it as admin

## Summary
Three separate forms disable their forward action (**Next**, **Save**, **Reject**) until a field is filled that is
**not marked with a red star**, carries **no inline error**, sets **no `aria-invalid`**, and produces **no persistent
message**. The user sees a fully-completed form and a greyed-out button, with nothing on screen indicating which
field is at fault. In each case the form's own "all fields marked with a red star must be completed" instruction is
actively misleading, because the blocking field is not one of them.

**This single pattern is what made "fresh registration is blocked" look like an app-breaking regression for two days.**
It was not a regression; it was this.

## The three confirmed instances

### 1. Registration → Organisation Details → **National (SA)** (area of operations)
- All **9 red-starred fields** satisfied (Organisation Name, mobile, email, financial year end, both Full Addresses,
  Legal Form, Membership, Office Bearer Term), no inline errors, no `aria-invalid` on any control — **Next disabled**.
- Filling **National (SA)** (a province multi-select under the *"Area of operations: List of countries"* heading, **no
  red star**) enabled Next **immediately**.
- Screenshot of the misleading state: `../2026-08-20/evidence/address-works-but-next-disabled.png`.
- ⚠️ This is the field that was previously misdiagnosed as the lat/long defect — see
  `2026-08-20-registration-address-latlong-not-populated.md`.

### 2. Registration → Office Bearer modal → **duplicate mobile number**
- Second office bearer, every starred field filled, **Save disabled**.
- Cause: the mobile number duplicated office bearer 1's. Changing it to a distinct number enabled Save; changing it
  **back** disabled Save again — deterministic, verified both directions.
- **Partial mitigation:** there *is* a message — a transient toast **"OB With same mobile number exists"**. But it
  auto-dismisses, there is no error on the Mobile Number field, and if you look away or (as in automation) inspect the
  form a few seconds later, the form looks simply broken. A field-level error would cost nothing and would not vanish.
- Screenshot: `../2026-08-20/*(screenshot withheld — POPIA, see `audits/2026-08-21-evidence-popia-sweep.md`)* (taken before the toast was found —
  which is exactly the problem).

### 3. Admin → Document Verification → **Additional Reasons for rejection**
- Set *"Do you want to refuse/reject this application?"* = **Yes**, filled *"What is the reason for application
  rejection?"* → **Decline, Approve and Reject all stayed disabled.**
- The **"Additional Reasons for rejection"** control renders its Yes/No radio **pre-set to Yes and disabled**, with an
  adjacent free-text box that has **no red star**. Filling that box enabled **Reject** immediately.
- Because the radio is disabled and pre-answered, the control reads as *already satisfied* — the strongest possible
  visual cue that it is not the thing blocking you.
- ⚠️ Note this also **corrects** the "Case A dead state" reading in
  `2026-08-18-no-application-incomplete-first-reject-denies-outright.md`: at least on the refuse=Yes branch, the
  buttons are not permanently dead — there is a hidden required field. The refuse=**No** + verification-No branch of
  that bug has **not** been re-tested against this discovery and should be.

## Steps to reproduce (instance 1, the cheapest)
1. Public portal → Register NPO → accept POPIA → **Organisation Details**.
2. Fill every field marked with a red star, including both addresses via the `div.suggestion` autocomplete.
3. Observe **Next is disabled** with no error anywhere on the form.
4. Select any province in **National (SA)** → Next enables at once.

## Expected
Either mark the field with a red star like every other mandatory field, **or** surface a persistent, field-level
validation message when the forward action is blocked. A disabled button with no explanation is not a validation
message. Best practice for this build: enable the button and show the errors on submit, so the user is always told
*what* is wrong.

## Actual
Forward action silently disabled; the offending field is visually indistinguishable from an optional one (instance 3
looks *already answered*); diagnosis requires DOM inspection or brute-force field-by-field elimination.

## Impact
- Registration, office-bearer capture, and application rejection each have a state where a correct-looking form
  cannot be submitted and the product gives the user nothing to act on. Real applicants will abandon.
- For QA it is worse than a hard failure: it mimics a broken build. Two days of "registration is blocked" and one
  incorrectly-raised High defect trace directly to instance 1.
- Because the same pattern appears in three unrelated forms, it is likely a **form-builder-wide convention issue**,
  not three isolated bugs — worth fixing at the framework level.

## Question for the test lead (Thabiso)
Is the red star driven off the same metadata as the validation rule? If they are two independent settings in the form
builder, every mandatory field in the module is a candidate for this, and it would be worth an audit rather than
three point fixes.
