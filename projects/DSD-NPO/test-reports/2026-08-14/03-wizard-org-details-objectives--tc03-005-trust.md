# Report: NPO Registration 03 — Wizard Tabs 2–3 (Organisation Details, Objectives)

**Date:** 2026-08-14 06:45 UTC
**Plan:** test-plans/npo-registration/03-wizard-org-details-objectives.md
**Spec:** test-plans/npo-registration/03-wizard-org-details-objectives.spec.ts
**Execution Mode:** ai-repair
**Result:** PASSED — TC-03-005 confirmed; one new High finding on the unmarked mandatory field
**Duration:** ~600s
**Cases:** TC-03-005
**Assessed-not-executed:** TC-03-001, TC-03-004, TC-03-006, TC-03-008, TC-03-016, TC-03-031, TC-03-032
**Environment:** QA · public portal · view mode **Latest** · form `boxfusion.dsdnpo/create-npo v61`
**Application under test:** APPL26-01106 (`QA Smoke NPO 2026-08-14`)

## Summary
| Total Steps | Passed | Failed | Skipped |
|-------------|--------|--------|---------|
| 2 | 2 | 0 | 0 |

## Step Results

### TC-04 — Legal Form 'Trust' reveals the IT Registration Number field (ADO #101629 · TC-03-005)
**Mode:** ai-repair
**Duration:** ~40s

- [PASS] Reached Organisation Details and clicked Legal Form = **Trust**
- [PASS] **(BLOCKING)** An **`ITRegistration No *`** field appears and is **required** — carries both the `*` in the
  label and the `ant-form-item-required` class. Visible form items went 22 → 23.

**All three Legal Form branches were captured in the same pass, and they are correctly mutually exclusive:**

| Legal Form | Conditional field revealed | Required |
|---|---|---|
| Voluntary Association | `Membership *` (radio) | yes |
| NPC | `NPCRegistration No *` | yes |
| Trust | `ITRegistration No *` | yes |

Switching Legal Form removes the previous branch's field, so no stale conditional survives.

## New finding — a mandatory field that is not marked mandatory

**`Area of Operations → National (SA)` gates the step but renders as optional.** With **all 9 asterisked fields
populated and zero validation errors**, `Next` stayed disabled. Selecting a single province (`Gauteng`) in
`National (SA)` flipped `Next` to enabled immediately.

That field carries **no `*` and no `ant-form-item-required` class**, so it is the one control the user cannot know
about — and it is the one blocking the step. This makes the long-standing "blocked with no feedback" pattern
concrete and reproducible, and it corroborates **ADO #101636 / #101654**, which make *Area of Operations*
mandatory. Severity **High** — a real applicant cannot get past Organisation Details without guessing.

The same shape appears twice more in the wizard: the **Objectives** modal's `Sector` and the **Declaration** tab's
**9 acknowledgement checkboxes** are all unmarked yet all gate their Save/Submit. Likely one form-configuration
habit rather than three bugs.

## Observations
1. 🔴 **The address blocker survives on `create-npo v61`.** Typing `18 South Street, Zwartkop, Centurion` with real
   keystrokes (value read back and confirmed) leaves `.dropdown-container` at **1 child / 0 height** throughout, and
   Province · District Municipality · Metropolitan Municipality · Area Code are never derived. The application
   submitted and reached the assessor with **no municipality or province captured**. Still fails ADO #101632 /
   TC-03-008 (P1).
2. ✅ **The `Financial year end month` list is complete — all 12 months.** The dropdown renders only 10 at a time
   because the list is **virtualised**; November and December are present on scroll and via type-to-search. I nearly
   filed this as missing reference data. **Screenshot or scroll before claiming a list is short.**
3. **Objectives is a working 3-level cascade** — Sector → Objective → Service, each populated from the previous, and
   `Description` auto-populates on save. `Save` correctly stays disabled until all three are set.
4. 📌 The Trust field label reads **`ITRegistration No`** (no space) and the NPC one **`NPCRegistration No`**, while
   ADO #101628 calls the latter the *CIPC* Registration Number. Cosmetic/naming only — recorded, not raised.

## Questions for the test lead (Thabiso)
1. **Is `Area of Operations` intended to be mandatory?** ADO #101636/#101654 say yes. If so the field needs its
   asterisk and required marker; if not, the server-side gate should be removed. Either way the current
   combination — mandatory in behaviour, optional in appearance — is the worst of both.
2. **Should the derived location fields be mandatory too?** They are the only record of municipality and province,
   and an application can currently reach `APPLICATION UNSUCCESSFUL` without any of them.
