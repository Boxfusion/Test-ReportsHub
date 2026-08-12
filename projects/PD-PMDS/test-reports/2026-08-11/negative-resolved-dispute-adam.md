# PMDS SL 1-12 — Contracting Negative #1: Resolved Dispute (Adam Apple)

**Date:** 2026-08-11
**Cycle:** SL 1-12 Performance Agreement, FY2026/27 — **Contracting** stage
**App:** HCM Admin Portal (PMDS module) — https://pd-hcm-adminportal-qa.shesha.app/ (QA)
**Ref:** PA2026/6539 (Adam Apple, Intern 4, SL7)
**Result:** PASSED — full resolved-dispute chain completed to Generate PERSAL Input; the old Update-Submit bug did not recur

## Context

Negative workflow #1 = dispute referred to mediation → **mediator resolves at the first level** →
employee updates the PA with outcomes → supervisor approves → HR verifies.

Chain: **adam** → supervisor **Lungile Nhleko** (`LungileN`) → mediator **Babalwa M** (`BabalwaM`,
Chief Director SL14) → HR **Sales HR** (`SalesHR`).

## Steps executed (live, headed)

1. **Employee Draft & Submit** (`adam`/`123qwe`, PA2026/6539). 4 KRAs @ 25% (Total 100%), GAFs picked
   from Adam's own live list (Acceptance Of Responsibility, Quality Of Work, Communication, Technical
   Skills — his list uniquely included Interpersonal Relationships and Leadership), 8 key activities,
   1 PDP (Ethics in the Public Service / Workshop). 2 attestations → **Submit**. Status Draft → Review.
2. **Supervisor Refer for Dispute** (`LungileN`). Review task → **Refer for Dispute** → confirm dialog
   "Are you sure you wish to refer this Performance Agreement for Mediation?". **Yes is disabled until
   a comment is entered** — entered "KRA weightings need review before sign off." → **Yes**.
   Status **Review → Under appeal**, routed to the mediator.
3. **Mediator resolves** (`BabalwaM`). Action "Mediator Review Disagreement and attempt to resolve".
   Selected **"The disagreement has been resolved"** + comment → **Submit**. On this path Submit is
   enabled by the radio alone — **no mandatory attachment**, unlike the not-resolved path. Routed back
   to the employee.
4. **Employee Update with Outcomes** (`adam`). Action "Update Performance Agreement with Outcomes".
   Ticked the Confirmation checkbox; Submit stayed disabled until **every tab had been visited**
   (Details / Scoring / Workplan Agreement / Personal Development Plan / Supporting Documents). After
   the tab sweep → **Submit processed on the first clean click**. Status → Review.
5. **Supervisor Review Updated PA** (`LungileN`). Action "Review Updated Performance Agreement with
   Outcomes" — approved via **Submit** (not Sign), same confirmation + tab-visit gate. Status → HR Review.
6. **HR Verify** (`SalesHR`). Confirmation → **Verify**. Status **HR Review → Generate PERSAL Input**.
7. **Verification (admin).** Employee List: **Adam PA2026/6539 = Generate PERSAL Input**.

## Regression retest — Update-with-Outcomes Submit

The historically broken **Update-with-Outcomes Submit** (bug `2026-07-16-update-pa-with-outcomes-submit-fails.md`)
processed on the first clean click again. **Verdict: fix continues to hold.**

## Observations / notes

- **The Update / Review-Updated screens now render only ONE checkbox** (the Confirmation). The old trap
  — 10 Scoring-subform GAF checkboxes ahead of the Confirmation, where `querySelector('input[type=checkbox]')`
  silently hit a GAF and corrupted the GAF selection — **no longer applies on this form version**.
  The real gate now is the tab sweep, not checkbox ordering.
- Refer-for-Dispute confirmation is genuinely comment-gated: Yes is `disabled` until the textarea has content.
- Resolved path needs no attachment; the not-resolved path adds mandatory Comments + Attachments (see the
  Sanele and Thato reports).

## Environment

- Employee default password `123qwe`; `SalesHR` is the Contracting HR-verify role.
