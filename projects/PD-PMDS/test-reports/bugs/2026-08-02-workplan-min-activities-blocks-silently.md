# Workplan Agreement: "minimum 2 key activities" blocks Next with no message

**Date:** 2026-08-02
**Severity:** Low (UX) — no data loss, no functional block, but the user is given no reason
**Status:** Open — regression against 2026-07-16
**Form:** `SaGov.Pmds/sagov-performanceagreement-wf-draftperformanceagreement v52`
**Step:** Draft Performance Agreement → **3. Workplan Agreement**
**Found by:** `test-plans/contracting/contracting-lifecycle.md` TC-06

## What happens

With at least one KRA holding fewer than 2 key activities, clicking **Next** on the Workplan
Agreement step does nothing:

- the wizard stays on *Workplan Agreement* (correct — the rule is being enforced),
- **no** `ant-message` toast is raised,
- **no** `ant-form-item-explain-error` or `ant-alert` is rendered,
- **no** spinner or any other visual acknowledgement of the click.

The step hint states the rule (*"Capture a minimum of 2 key activities and maximum of 10 key
activities that will enable you to achieve each KRA"*), but nothing points at **which** KRA is short,
and nothing tells the user that the click was rejected rather than lost.

## Why it is a regression

On 2026-07-16 the same condition produced a visible validation banner naming the offending KRA —
recorded in `test-reports/2026-07-16/refer-for-dispute-jabu.md`:

> the Workplan step correctly **blocked Next with a validation banner** ("KRA '…' must have at least
> 2 Key Activities") when one KRA had only 1 activity — fixed by adding the 2nd, then it advanced.
> (Good validation behaviour.)

That banner no longer appears.

## Steps to reproduce

1. Log in as an employee with an open *Initiate Performance Agreement* task (e.g. `SaneleS` / `123qwe`).
2. Complete **Confirm Details** and **Scoring** (4 KRAs totalling 100%, 4 GAFs) and advance to
   **Workplan Agreement**.
3. Add exactly **one** key activity to the first KRA; leave the other KRAs empty.
4. Click **Next**.

**Expected:** a validation message identifying the KRA that needs more key activities.
**Actual:** the click is silently swallowed; the wizard stays on the step with no feedback.

## Evidence

Captured by TC-06, which asserts the block and records the feedback that accompanies it:

```
after Next with 1 activity -> step: 3Workplan Agreement | toasts: [] | errors: []
```

The annotation attached to the test reads `NONE — Next is blocked silently`.

## Notes

The rest of the wizard gates the same way — Scoring disables **Next** until the weights total 100%
and 4 GAFs are ticked, the Summary disables **Submit** until both attestations are ticked. Those are
at least visibly disabled controls. The Workplan step is the odd one out: **Next stays enabled** and
simply does nothing, which reads as an unresponsive button rather than a rule.
