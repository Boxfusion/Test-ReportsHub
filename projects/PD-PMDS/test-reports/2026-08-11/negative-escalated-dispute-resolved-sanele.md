# PMDS SL 1-12 — Contracting Negative #2: Escalated Dispute, RESOLVED (Sanele Sithole)

**Date:** 2026-08-11
**Cycle:** SL 1-12 Performance Agreement, FY2026/27 — **Contracting** stage
**App:** HCM Admin Portal (PMDS module) — https://pd-hcm-adminportal-qa.shesha.app/ (QA)
**Ref:** PA2026/6595 (Sanele Sithole, Intern 5, SL7)
**Result:** PASSED — two-level escalation resolved at the second level and completed to Generate PERSAL Input

## Context

Negative workflow #2 = dispute → mediator **cannot** resolve → **escalates to the mediator's supervisor**
→ that supervisor **resolves** → employee updates with outcomes → supervisor approves → HR verifies.

Chain: **SaneleS** → supervisor **Lungile Nhleko** (`LungileN`) → mediator **Babalwa M** (`BabalwaM`)
→ mediator-supervisor **Sampha Sampha** (`Sampha`, Director of Engineering SL13) → HR **Sales HR** (`SalesHR`).

## ⚠️ The escalation recipient has CHANGED — it is no longer Tania Smith

In every previous run the escalation above Babalwa M went to **Tania Smith** (`Tester97`). On this run
**Tania's inbox was empty** after the mediator submitted. Rather than conclude the dispute was stuck —
the mistake made on 2026-07-22 — the actual recipient was traced: both escalations had landed with
**Sampha Sampha**, whose task is "Mediator Supervisor Review Disagreement and attempts to resolve".

This is consistent with a wider org-structure change seen the same run: **Lungile's own mediator now
resolves to Sampha Sampha** (previously Tania Smith), and the mediator defaults to the supervisor's
supervisor. **Not a defect — a data/hierarchy change.** New login discovered: **`Sampha` / `123qwe`**.

## Steps executed (live, headed)

1. **Employee Draft & Submit** (`SaneleS`/`123qwe`, PA2026/6595). 4 KRAs @ 25% (Total 100%), 4 GAFs from
   his live list (Team Work, Acceptance Of Responsibility, Quality Of Work, Technical Skills), 8 key
   activities, 1 PDP (Supply Chain Management / Formal Course) → **Submit**. Status Draft → Review.
2. **Supervisor Refer for Dispute** (`LungileN`) — comment-gated Yes ("Targets on two KRAs are not
   achievable as drafted."). Status **Review → Under appeal**.
3. **Mediator NOT resolved** (`BabalwaM`). Selected **"The disagreement has not been resolved"** — this
   immediately surfaces **mandatory Comments\* + Attachments\*** and Submit goes `disabled`. Entered the
   comment, uploaded `mediation-outcome-escalated.txt` through the real Upload control, waited ~4s and
   re-verified the attachment was listed, then **Submit — first click, no 500**.
4. **Mediator-supervisor RESOLVES** (`Sampha`). Task "Mediator Supervisor Review Disagreement and
   attempts to resolve". Selected **"The disagreement has been resolved"** + comment → action button is
   **Approve** (not Submit) — matching the Contracting escalation pattern. Routed back to the employee.
5. **Employee Update with Outcomes** (`SaneleS`) — Confirmation ticked + all 5 tabs visited → **Submit**, first click.
6. **Supervisor Review Updated PA** (`LungileN`) → **Submit**. Status → HR Review.
7. **HR Verify** (`SalesHR`) → **Verify**. Status **HR Review → Generate PERSAL Input**.
8. **Verification (admin).** Employee List: **Sanele PA2026/6595 = Generate PERSAL Input**.

## Regression retest — mediator not-resolved Submit 500

The intermittent **500 on the mediator not-resolved Submit** (bug `2026-07-23-mediator-not-resolved-escalation-500.md`,
already downgraded to a timing artefact) **did not recur**. The post-upload wait guard — wait after the
upload completes and re-verify the attachment is listed before pressing Submit — again produced a clean
first-click submit, here and on the Thato run. That guard has now held on four consecutive attempts.

## Observations / notes

- Escalation action button is **Approve** at the mediator-supervisor level; the mediator level uses **Submit**.
- "Under appeal" remains the in-flight status while an escalation task is open — it is not terminal.
- Always locate the escalation recipient's actual inbox before judging a dispute stuck; the hierarchy moves.

## Environment

- `Sampha` / `123qwe` — Sampha Sampha, Director of Engineering SL13, current mediator-supervisor.
- Attachment fixture: `.playwright-mcp/mediation-outcome-escalated.txt` (gitignored).
