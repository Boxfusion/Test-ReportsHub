# Control Structure step disappears when an international NPO resumes its draft

**Date raised:** 2026-08-17
**Severity:** High
**Area:** Public portal → Registration wizard → stepper / conditional tab rendering
**Form:** `boxfusion.dsdnpo/create-npo v61`
**Environment:** QA · view mode **Latest**
**Found on:** draft `APPL26-01216` (Trust, International = Cameroon)
**Relates to:** ADO #101679 (TC-05-003), and the Control Structure cases #101680 / #101681 / #101698

## What happens

The **Control Structure** step is rendered only when at least one country is selected under *International* (Area of
Operations) — correct per FDS 7.5.6. But that decision is made from the **change event on the field**, not from the
saved value. So when the applicant reopens a saved draft, the step is **absent**, even though the international country
is still stored and displayed.

## Reproduction

1. On a new draft, Tab 2, select a country under **International** (e.g. Cameroon).
   → the stepper becomes **8 steps** including **"6 Control Structure"**. ✅ correct
2. Save/leave, then reopen the draft from its workflow-action URL.
3. Observe the stepper: **7 steps — "Control Structure" is gone.** Documents becomes 6, Declaration 7.
4. Navigate to Tab 2 and read the fields: **`International = Cameroon` is still there**, along with Gauteng, Legal Form,
   IT number and the organisation name. The data is intact; only the step is missing.
5. **Touch the International field** (add a second country, or re-select) → the stepper **immediately returns to 8
   steps** with Control Structure restored.

Evidence: `test-reports/2026-08-17/evidence/v19-control-structure-lost-on-resume.png` (Tab 2 showing Cameroon with a
7-step stepper).

## Why it matters

An international NPO that fills in its details, leaves, and comes back **loses the entire Control Structure step** —
the partner organisations / control structure data that FDS 7.5.6 requires for international operations. The wizard then
runs straight from Admin & Operations to Documents, so the application can be **submitted with no control-structure
data at all** and nothing warns the applicant or the assessor that a required step was skipped.

Nobody would notice: the stepper simply shows 7 steps, which looks exactly like a legitimate domestic application.

## Expected

The conditional step should be derived from the **loaded application data**, so a resumed international draft still
shows Control Structure.

## Likely root cause, and a related symptom

Derived/conditional wizard state appears not to be recomputed when a draft is rehydrated — it is only set by user
interaction. That is consistent with a second observation the same day:

> On draft `APPL26-01212` (NPC), a resumed draft left **Tab 2's `Next` permanently disabled** with every required field
> populated and zero errors. Clearing the invalid tax number, re-firing the CIPC lookup and re-touching fields all
> failed to release it. A draft with no office bearers resumed normally.

⚠️ **The shared root cause is a hypothesis, not proven** — the two symptoms may be unrelated. Filed separately in
`test-reports/2026-08-17/04-wizard-office-bearers-functional--identity-validation.md`. Both point at the same area
(resume/rehydration), so they are worth investigating together.

## Workaround for testers

After resuming an international draft, **re-touch the International field** before continuing; the step comes back
immediately and the data is unaffected.
