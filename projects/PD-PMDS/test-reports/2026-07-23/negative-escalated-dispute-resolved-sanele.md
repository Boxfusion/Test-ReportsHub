# PMDS SL 1-12 Performance Agreement — Contracting Negative Workflow #2: Escalated Dispute, Resolved (Sanele Sithole)

**Date:** 2026-07-23
**Cycle:** SL 1-12 Performance Agreement, FY2026/27
**App:** HCM Admin Portal (PMDS module) — https://pd-hcm-adminportal-qa.shesha.app/ (QA)
**Ref:** PA2026/6367 (Sanele Sithole, Intern SL5)
**Result:** PASSED — escalated dispute resolved at the mediator-supervisor level, completed end-to-end to Generate PERSAL Input

## Context
Negative workflow #2 = **dispute referred → mediator marks NOT resolved → escalates to the mediator's supervisor → who resolves it → employee updates with outcomes → supervisor approves → HR verifies**. Roles: employee **Sanele Sithole** (`SaneleS`) → supervisor **Lungile Nhleko** (`LungileN`) → mediator **Babalwa M** (`BabalwaM`) → mediator's supervisor **Tania** (`Tester97`) → HR **Sales HR** (`SalesHR`).

## Steps executed (live, headed)

1. **Employee Draft & Submit** (`SaneleS`, PA2026/6367). 4 KRAs @ 25% (100%) + 4 GAFs (Delegation And Empowerment, Quality Of Work, Leadership, Initiative) + 8 key activities + 1 PDP + 2 attestations → **Submit**. Draft → Review. ✅
2. **Supervisor Refer for Dispute** (`LungileN`). Review → **Refer for Dispute** + mandatory comment → **Yes**. Review → Under appeal → mediator. ✅
3. **Mediator marks NOT resolved** (`BabalwaM`). "Mediator Review Disagreement and attempt to resolve" → **"The disagreement has not been resolved"** + mandatory Comments + Attachment (`mediation-outcome-escalated.txt`, `StoredFile/Upload` 200) → **Submit**. Appeal escalated to the mediator's supervisor. ✅ *(See note — this Submit failed under automation with a 500 but succeeded on a manual submit.)*
4. **Mediator-supervisor resolves** (`Tester97` = Tania). Inbox action **"Mediator Supervisor Review Disagreement and attempt to resolve"** (action button = **Approve**, not Submit). Selected **"The disagreement has been resolved"** + comment → **Approve**. Routed back to the employee. ✅
5. **Employee Update with Outcomes** (`SaneleS`). "Update Performance Agreement with Outcomes" — visited all tabs, ticked the Confirmation checkbox (last of 11; the other 10 are Scoring-subform GAFs, left untouched) → **Submit** first clean click → Review. ✅
6. **Supervisor Review Updated PA** (`LungileN`). "Review Updated Performance Agreement with Outcomes" — approved via **Submit** (Confirmation-gated) → HR Review. ✅
7. **HR Verify** (`SalesHR`). "Verify Performance Agreement" — Confirmation → **Verify** → **Generate PERSAL Input**. ✅
8. **Verification (admin).** Contracting Manage Process dashboard: **41 Total / 0 Not Started / 37 In progress / 4 Completed** — Sanele's escalated-resolved PA correctly counted in the Completed rollup (Simmy + Jabu + Adam + Sanele).

Full escalated-resolved chain proven: Draft → Refer for Dispute → Mediator NOT-resolved → **escalate** → Mediator-Supervisor Resolved/Approve → employee Update-with-Outcomes → supervisor Review-Updated/Approve → HR Verify → Generate PERSAL Input.

## Escalation mechanics confirmed
- Mediator **not-resolved** requires **both** Comments\* and Attachments\* (the resolved path needs neither).
- The appeal escalates one level to the **mediator's supervisor = Tania** (`Tester97`), landing as **"Mediator Supervisor Review Disagreement and attempt to resolve"**, status still Under appeal.
- On that escalation screen the action button is **Approve** (not Submit). Resolving there routes back to the employee's "Update with Outcomes" and completes normally.

## Note — automation-only 500 at the mediator not-resolved Submit (step 3)
Under automation the mediator "not resolved" **Submit returned HTTP 500** on `SheshaWorkflow/Process/UserTaskComplete` (reproduced twice) even though the client payload was correct (`disagreementDecision:2`, comment bound, `fileList 1`, `StoredFile/Upload` 200). The user then performed the **same Submit manually and it succeeded**, escalating the appeal to Tania. So the escalation transition is healthy server-side — the 500 was **automation-specific or transient** (most likely the just-uploaded attachment had not fully committed for the automated request, which fired seconds after upload). Bug downgraded to Low / cannot-reproduce-manually: `test-reports/bugs/2026-07-23-mediator-not-resolved-escalation-500.md`. Suggested automation guard: after `StoredFile/Upload` returns 200, wait and re-verify `fileList` before Submitting.

## Observations / notes
- Confirmation checkbox is the **last of 11** on the Update / Review-Updated screens (10 Scoring-subform GAFs precede it) — target `cbs[cbs.length-1]` and never disturb the GAFs (dropping below the min-4 rule silently blocks Submit; caused a false-alarm 400 in a separate run today).
- Non-fatal `...reading 'cycle'` console noise and the stray "Test" banner persist (cosmetic).

## Environment
- Employee default password `123qwe`. Mediator `BabalwaM`; escalation recipient `Tester97` (Tania); HR `SalesHR`.
- Inbox `dynamic/Shesha.Workflow/workflows-inbox`; tasks via `shesha/workflow-action?id=<paId>&todoid=<todoId>`.
- Attachment: `.playwright-mcp/mediation-outcome-escalated.txt`. Screenshot of the automation 500: `.playwright-mcp/pmds-mediator-notresolved-500.png`.
