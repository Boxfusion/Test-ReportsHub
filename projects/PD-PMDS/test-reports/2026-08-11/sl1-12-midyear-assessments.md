# PMDS SL 1-12 — Mid-Year Assessment, 6 employees driven through self-assessment and supervisor review

**Date:** 2026-08-11
**Cycle:** SL 1-12 Performance Agreement, FY2026/27 — **Mid Year Assessment**
**App:** HCM Admin Portal (PMDS module) — https://pd-hcm-adminportal-qa.shesha.app/ (QA)
**Refs:** PR2026/7492 (Simmy) · PR2026/7480 (Tony) · PR2026/7444 (Lungile) · PR2026/7448 (Jabu) · PR2026/7490 (Sanele) · PR2026/7434 (Adam)
**Result:** PASSED — full 6-employee Mid-Year suite driven end to end. 5 reached **Awaiting PERSAL Sync**; the both-levels-unresolved dispute terminated correctly at **Not Required**. No defects found in the Mid-Year chain.

## Context

Continuation of the same-day SL 1-12 work after Contracting closed (43/43) and Mid-Year was opened
(43/43 initiated). Scenario spread agreed with the test lead: happy path ×2, resolved dispute,
escalated-resolved, escalated-unresolved, plus the manager path.

| Employee | Ref | Scenario | Final status (verified in Employee List) |
|---|---|---|---|
| Simmy Mthalane | PR2026/7492 | Happy | ✅ **Awaiting PERSAL sync** |
| Tony Dayimane | PR2026/7480 | Happy | ✅ **Awaiting PERSAL sync** |
| Lungile Nhleko (manager) | PR2026/7444 | Happy (manager) | ✅ **Awaiting PERSAL sync** |
| Jabu Hadebe | PR2026/7448 | Negative 1 — dispute resolved at mediator | ✅ **Awaiting PERSAL sync** |
| Sanele Sithole | PR2026/7490 | Negative 2 — escalated, resolved at tier 2 | ✅ **Awaiting PERSAL sync** |
| Adam Apple | PR2026/7434 | Negative 3 — escalated, unresolved at both tiers | ✅ **Not Required** (terminal, as designed) |

## Steps executed (live, headed)

1. **Six employee self-assessments.** Each: 4 KRAs × 2 key activities, **Own Score 3** on every activity
   with a per-activity comment, then page-level Employee Comments → **Submit**. All carried their
   Contracting KRAs through correctly.
2. **Supervisor reviews — Lungile Nhleko** for the five interns:
   - **Simmy, Tony** — Supervisor 3 on all 8 activities (agreement) → **Sign**.
   - **Jabu, Sanele, Adam** — deliberate disagreement on one activity (**Supervisor 4 vs Own 3**), which
     surfaced the inline **Agreed Score**; set Agreed 4, added the required comment and attachment,
     remaining activities at 3 → **Refer for dispute** (comment-gated **Ok**).
3. **Supervisor review — Babalwa M** for Lungile (manager path): Supervisor 3 on all activities → **Sign**.
4. **Mediation — Babalwa M** on all three disputes:
   - **Jabu** → *"The disagreement has been resolved"* → **Submit** (no comment or attachment required on
     this branch; Submit enabled by the radio alone).
   - **Sanele, Adam** → *"has not been resolved"*, which makes **Comments + Attachments mandatory**;
     `mediation-outcome-escalated.txt` uploaded with the post-upload wait guard → **Submit first click,
     no 500** on both.
5. **Escalation tier 2 — Sampha Sampha** (`Sampha`), form
   `sagov-performancereview-supervisor-mediatorreviewdisagreement v34`. Both escalations were waiting in
   this inbox as *"Review disagreement and attempt to resolve"*.
   - **Sanele** → *"has been resolved"* → **Submit** → routed back to the employee.
   - **Adam** → *"has not been resolved"* (comment + attachment) → **Submit** → **terminal**.
6. **Update with Outcomes** (`JabuH`, `SaneleS`) — Confirmation checkbox alone enables Submit; both
   processed **first click**.
7. **Review with Outcomes** (`LungileN`) for both — Confirmation → Submit, first click, inbox cleared.
8. **HR Verify** (`SalesHR`) — all **five** tasks; Confirmation → **Verify** → *Awaiting PERSAL Sync*.

## Confirmed behaviours

- **Score rules are stated on-screen** in the rating dialog: *"A rating of 1, 2 or 4 requires both a
  comment and attachment. A rating of 3 requires a comment."* Rating 3 is therefore the low-friction
  choice for bulk runs.
- **Employee and supervisor rating dialogs are different forms** — `sagov-rate-key-activities v21`
  vs `sagov-rate-key-activities-supervisor v18`. In the supervisor variant Own Score is read-only and
  only Supervisor (plus Agreed, when disputed) is editable.
- **The Agreed Score must be set explicitly.** Setting Supervisor 4 against Own 3 surfaces the Agreed
  control but leaves it **empty** — it does not default. Easy to miss.
- **Page-level Supervisor Comments gate BOTH Sign and Refer for dispute**, and need a real click+type;
  a scripted value-set does not register. Same for the employee's page-level Comments and Submit.
- **Overall Score quirk reproduced**: with all-3s the Own column reads **100%** while Supervisor and
  Agreed settle at **75%**. Treat Agreed as authoritative. Where a 4 was introduced, the row moved to 108%.
- **No silent KRA drop this run** — every KRA held its scores across all 12 rating passes (6 employee,
  6 supervisor), verified by re-reading the grid before each Sign/Refer.

## ⚠️ Automation note — the supervisor comment dialog has NO buttons

The per-activity Comments dialog (`sagov-key-activity-notes v17`) renders with a textarea and **no
Close/Submit buttons** in the supervisor flow, unlike the employee flow where it has Close + Submit. It
binds live and must be dismissed via the modal **X** (`.ant-modal-close`).

Looking for a Submit that does not exist caused three stacked comment dialogs to accumulate, which then
blocked pointer events on the page. Recovery was a page reload — no data was lost because the KRA had
not yet been Saved. Worth knowing for anyone scripting this step.

## 🔑 The Mid-Year HR verifier is `SalesHR` — the earlier Andrew/Sarah finding no longer holds

Previous Mid-Year runs (2026-07-16, 07-22) recorded HR verification routing to **Andrew Smith
(`GOV005`)** and **Sarah Johnson (`EMP001234`)**, explicitly *not* `SalesHR`, and that was written up as
the key difference between Contracting and Mid-Year. **That is not what happens now.**

All five Verify Performance Assessment tasks landed in **`SalesHR`**'s inbox. Both historic verifiers
were checked first and neither had any of them — Andrew's inbox held only his own self-assessment and an
unrelated leave item; Sarah's the same. So Mid-Year now verifies through the same HR user as Contracting.

Whether this is a deliberate routing change or a test-data reassignment is worth a question to the team.
Either way the previously documented Contracting-vs-Mid-Year distinction should be treated as **stale**.

## ✅ Retest — the Mid-Year Completed tile correctly EXCLUDES the terminal

This was the outstanding scope check on the Contracting over-count bug
(`2026-08-11-contracting-completed-tile-overcounts-dispute-unresolved.md`).

Final cycle state: **`43 Total · 1 Not Started · 37 In progress · 5 Completed`**.

Five completions counted against exactly five genuine *Awaiting PERSAL sync* rows — Adam's
**Not Required** terminal is **not** counted. Contracting counts its equivalent Dispute-Unresolved
terminal; Mid-Year does not. **The bug's "Contracting-specific" scope claim holds**, now on a second
independent data set.

## Other observations

- **The escalation "resolved" branch has no comment field at all.** Selecting *"has been resolved"*
  renders no Comments control and no Attachments control, and Submit enables on the radio alone. Only
  the *not-resolved* branch renders them (both then mandatory). So a tier-2 resolution is recorded with
  **no rationale captured anywhere**.
- Consequence: at HR Verify the Comments section still reads the **mediator's** text — *"Parties could
  not agree. Escalating to the mediator supervisor."* — with nothing indicating the escalation was
  subsequently resolved. HR verifies a resolved assessment whose only visible commentary says the
  parties could not agree. Not raised as a defect (the form gives no field to fill), but it is a
  traceability gap worth a design question.
- Every Submit/Verify in the tail processed on **first click**, no 500s, no stuck tasks.

## Environment

- All employee logins pwd `123qwe`. Supervisor for the five interns = `LungileN`; Lungile's supervisor
  and the interns' mediator = `BabalwaM`; escalation tier 2 = `Sampha`; HR verify = `SalesHR`.
- Attachment fixture: `.playwright-mcp/mediation-outcome-escalated.txt` (gitignored).
- Inbox `dynamic/Shesha.Workflow/workflows-inbox`; tasks via
  `shesha/workflow-action?id=<id>&todoid=<todoId>`; cycle view
  `dynamic/SaGov.Pmds/sagov-cycle-details-view?id=7cf9054b-8c69-4313-ae5c-8039bf495c04`.
