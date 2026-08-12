# DDG draft wizard — observation on validation feedback (NOT raised as a defect)

> ## ⚠️ CORRECTED 2026-08-11 — the PDP behaviour below is BY DESIGN
>
> The test lead has confirmed that **DDG and Chief Director/Director employees have a default PDP
> that is supposed to be there, and they are expected to add their own PDP on top of it.**
>
> That means **"Blocker 3" below is not a defect — it is the intended requirement**, and the framing of
> Blocker 2 as a fault is also wrong: the pre-seeded row is legitimate content, not a data error.
>
> This file has therefore been **downgraded from a High defect to an observation** and moved out of
> `test-reports/bugs/`. The only point that may still be worth raising is the **absence of on-screen
> feedback** when Next is gated — and that is a question for the lead, not a defect claim.
>
> Retained below for the reproduction detail only. Read the original severity and "blocker" language as
> withdrawn.

**Logged:** 2026-08-11 · **Status:** Observation — not a defect
**Original (withdrawn) severity:** High
**Module:** SaGov PMDS — `SaGov.Pmds/sagov-performanceagreement-wf-draftperformanceagreement v53`
**Cycle:** **Deputy Director General Performance Agreement**, FY2026/27 — Contracting
**Environment:** HCM Admin Portal QA — https://pd-hcm-adminportal-qa.shesha.app/
**Status:** Open — reproduced on all 4 DDG employees driven (Kabelo Mabalane, Gail Mabalane, Thando Zide, Hennie Kruger)

## Summary

In the DDG Contracting draft wizard, **Next** becomes inert on two steps when a mandatory value is
missing, and in **neither case** does the form tell the user what is wrong. There is no error text, no
red field, no `aria-invalid`, no required-marker, and no toast. The button simply does nothing (step 1)
or stays `disabled` (step 4).

This is three related blockers behind one symptom.

## Blocker 1 — Confirm Details: blank default mediator

**Reproduce:** log in as `KabeloM` / `123qwe` → Workflows inbox → "Initiate Performance Agreement"
(PA2026/6619) → on **Confirm Details**, note **Default Mediator is empty** (name, position and salary
level all blank) → click **Next**.

- **Expected:** either Next proceeds, or a message states that a mediator is required and an
  Alternative Mediator must be assigned.
- **Actual:** the wizard stays on step 1. Nothing is rendered to explain it. Verified programmatically:
  `.ant-form-item-explain-error` → none; `[aria-invalid="true"]` → none; `.ant-form-item-required` → none.
- **Causation proven:** selecting an **Alternative Mediator** (+ reason) and clicking Next advances
  immediately to Scoring.

Note the blank mediator is itself *expected* — Kabelo's supervisor is top-of-line, so there is no
supervisor's-supervisor to default to, and the form provides the Alternative Mediator field for exactly
this case. The defect is purely the **absent feedback**. The on-screen hint compounds it by saying you
*"can assign an alternative mediator if you have valid reasons"* — implying optional, when it is
mandatory whenever the default is blank.

## Blocker 2 — Personal Development Plan: pre-seeded row missing its Commencement Date

The DDG PDP step arrives **pre-populated** with a row *"Service Delivery Improvement / Coal-face
Deployment to Service Site"* whose **Commencement Date is empty**. `Next` is `disabled` **on arrival**,
before the user touches anything (confirmed on Gail's PA2026/6615, where the step was untouched).

Console at that moment:

```
Create failed:  {values: Object, errorFields: Array(3), outOfDate: false}
executeScriptSync error TypeError: Cannot read properties of undefined (reading 'tableData')
    at executeBooleanExpression (...)
```

The `TypeError` is thrown out of `executeBooleanExpression` — the expression that computes the Next
button's enabled state — so the button never enables. Again: no message is shown to the user.

**Confirmed by the PD-PMDS test lead:** the missing **Commencement Date** is the cause.

**How a user fixes it (non-obvious):** the row is read-only in the grid and has no edit/delete control;
the only affordance is a small **search icon** in the row's first cell. Clicking it opens a *PDP*
detail modal (`SaGov.Pmds/details-performance-development-area v3`) with Development Area, Types of
intervention and the mandatory **Commencement Date**, plus Close / Delete / **Save**. Setting the date
and saving persists it to the row.

## ⚪ WITHDRAWN — "the PDP step also requires a user-added entry"

**This is by design.** DDG and CD/D employees are issued a **default PDP**, and are expected to add
their own PDP **on top of** it. The behaviour observed — Next enabling only once a further PDP is added
via **Add PDP** — is the intended requirement, not a fault.

Observed sequence, retained as a description of the correct behaviour: on Gail's PA the pre-seeded row's
Commencement Date saved correctly (`31/08/2026`) and survived a reload; Next then enabled after adding
her own PDP.

Corroborating observation: on Kabelo's first pass the pre-seeded row never saved (it failed the create),
and after a page reload the row had **vanished** while his own added PDP remained — at which point Next
was enabled. That is consistent with the rule above, and also means **an incomplete pre-seeded
development area is silently discarded on reload** rather than being preserved for the user to finish.

## Impact

Every DDG Contracting draft hits Blocker 2/3, and any employee whose supervisor is top-of-line hits
Blocker 1. Without prior knowledge the wizard looks broken — the user has no route to discovery except
guessing that a grid row hides an editor behind a search icon.

## Workaround

1. **Confirm Details** — if Default Mediator is blank, assign an **Alternative Mediator** and a reason.
2. **Personal Development Plan** — click the pre-seeded row's **search icon**, set the
   **Commencement Date**, **Save**; then add at least one PDP via **Add PDP**.

## Suggested fix

Surface the validation: mark the Alternative Mediator and Commencement Date as required when they gate
progression, render the standard field-level error, and guard the `tableData` reference in the Next
enable-expression so a missing table cannot throw and silently disable the control.

## Related

- Report: `2026-08-11/ddg-contracting-opened-and-drafts.md`
- Same no-feedback pattern previously seen on Draft Tender validation in bid-management (silent disable,
  console-only message, unmarked mandatory fields).
