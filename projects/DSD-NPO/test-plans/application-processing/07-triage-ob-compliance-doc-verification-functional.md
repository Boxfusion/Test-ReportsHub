# Test Plan: NPO-07-F — Backend Triage, OB Compliance & Document Verification (functional)

> **Status:** Imported from Azure DevOps 2026-08-18 — admin portal; **~10 of 15 UI-runnable** with the shared admin login and our own submitted application. The rest need role-scoped users, API access, or an audit trail that does not exist.
> **Owner:** QA
> **Last Updated:** 2026-08-18
> **Estimated Duration:** 1800s

## Metadata
| Field | Value |
|-------|-------|
| App URL | Admin: https://dsd-npo-adminportal-qa.shesha.app/login · Public: https://dsd-npo-publicportal-1-qa.shesha.app/login |
| Environment | QA |
| Login As | mpenduloizwelinuk@gmail.com / 123qwe (shared broadly-privileged admin) |
| Lead tester | **Thabiso Kegakwile** |
| ADO Plan | [planId 101543](https://dev.azure.com/boxfusion/Boxfusion%20Test%20Plans/_testPlans/define?planId=101543&suiteId=101890) |
| ADO Suite | 101890 — *07 - Backend - Application Triage, OB Compliance & Document Verification* (15 cases, **all owned here**) |

## Objective
> Verify the DSD-staff processing of a submitted application on the admin portal: adding comments, Office-Bearer
> compliance outcomes and the statuses they drive, Document Verification (the "No + reason" rules and the incomplete /
> resubmission / denial flow), and the risk / compulsory / SLA indicators on the application detail.

## No overlap with the smoke plan
Smoke plan `07-application-triage-and-verification.md` owns **TC-07-001/002/003/004/006/010/013** (executed 2026-08-14).
This functional plan owns the other 15 — no case is shared, nothing to exclude.

## 🔑 Use our OWN application — never action another tester's
Drive everything against **`APPL26-01270`** (`50cc1481-e38e-436d-97df-d7bf89d6f984`), the Trust application **we
submitted 2026-08-18** (org name is the XSS-probe string; 3 office bearers). Acting on it is destructive — OB
compliance and Document Verification move its status and cannot be cleanly undone — so **only ever process a record we
created** ([[always-create-own-invoice-never-others]] applies here too). If a fresh application is needed mid-suite,
register + submit one first.
🔑 Known from this morning's admin view of APPL26-01270: the workflow-action page shows **`OB Compliance`** (enabled)
and **`Verification`** (disabled until OB Compliance is done), a **read-only tabbed detail** + a **Comments** box, and
**`HIGH RISK`** + **`COMPULSORY`** classification chips in the header.

## 🔑 What the smoke run already established (starting knowledge — re-confirm per case)
- **`OB Compliance` must run before `Verification`** — Verification stays disabled until OB Compliance is submitted.
- **Document Verification asks 5 questions + 2 conditionals**; answering *reject = Yes* reveals a
  **rejection-reason textarea** + an **`Additional Reasons`** field, and **`Reject` enables only when both are set**;
  `Reject` then raises a nested `.ant-modal-confirm` to action.
- 🔴 **Open finding to re-check:** `Approve` **stayed enabled** on an application marked for refusal; `Decline` never
  enabled in any combination. TC-07-008/011 touch this — watch the outcome buttons.

## Testability at a glance
| Runnable now (admin UI + our app) | Needs setup / chained | Not UI / blocked |
|---|---|---|
| 005, 007, 008, 009, 011, 012, 017, 018, 019 | 014 (3× resubmit), 015 (submitter edit mode) | 016 (no audit trail), 020 (needs non-admin user), 021 (API), 022 (API) |

## Preconditions
- [ ] Admin portal reachable; signed in with the admin account.
- [ ] Our submitted application `APPL26-01270` present and at the OB-Compliance stage (it was, this morning).
- [ ] For TC-07-015: public-portal login for the submitter (same shared account owns APPL26-01270).

## Test Cases

### TC-01 — Admin can add a comment (ADO #101715 · TC-07-005)
*P2 · Positive · Src:FDS.*
- **Steps:** 1. Open the application in admin → 2. Enter a comment in the Comments box and submit
- **Expected result:** *"Comment is saved with author and timestamp; visible to other admins"*
- **Assertions:** [ ] (BLOCKING) the comment persists on reload · [ ] it shows an author · [ ] it shows a timestamp
- **📌** The Comments box was the one editable control on the read-only detail this morning — this is the natural first
  case, non-destructive.

### TC-02 — OB marked Non-Compliant requires a reason (ADO #101717 · TC-07-007)
*P1 · Negative · Src:FDS.*
- **Steps:** 1. In OB Compliance, mark an OB **Non-Compliant** with **no reason**, Submit
- **Expected result:** *"Validation error - reason required (FDS 8.3 rule 3)"*
- **Assertions:** [ ] (BLOCKING) submit blocked · [ ] a reason-required message shows
- **⚠️** Touched-field caveat may apply (as on the wizard). Confirm whether the block is a real message or a silent
  disabled button — record which.

### TC-03 — All OBs non-compliant → 'OB Failed Compliance' (ADO #101718 · TC-07-008)
*P2 · Negative · Src:Both.*
- **Steps:** 1. Mark **all** OBs Non-Compliant **with reasons**, Submit
- **Expected result:** *"Status → 'OB Failed Compliance' (RefList=10); resubmission email triggered (FDS 8.4 rule 2b)"*
- **Assertions:** [ ] (BLOCKING) status becomes OB Failed Compliance · [ ] RECORD whether the resubmission
  notification is created (`NotificationMessage`)
- **🔑 Destructive** — run **after** TC-02 (which needs an OB still editable) and near the end of the OB-compliance
  cases, since it terminates that path for APPL26-01270.
- ✅ **RUN 2026-08-27, verdict PARTIAL — and APPL26-01270 was NOT used.** It ran against **APPL26-01570**, an
  application we submitted ourselves that morning, so 01270's path is still intact and TC-02/TC-04/TC-09 remain
  available on it. `applicationStatus` = **10** confirmed; `OB Compliance` then disables and `Verification` unlocks.
  ❌ **No resubmission notification is created** (validated against `NotificationMessage` with controls), so the
  FDS 8.4 rule 2b email does not fire. 📌 `numOfResubmissions` also stays `null`.
- 🔑 **How to reach this action:** the applications grid cannot find a record (see below), so open the **Workflows
  inbox** and use the row's own `/shesha/workflow-action?id=<instance>&todoid=<todo>` link. The admin inbox is
  **populated** (2 476 items) — the "every inbox renders empty" claim applies to the applicant portal, not here.
- ⚠️ **`boxfusion.dsdnpo/npoapplication` renders no data in 7 of 8 columns.** Its own request returns `"npo": null`
  for every row on the default page, and those columns project through `npo { … }`. Sorting is also ignored. Do not
  expect to locate a specimen through that grid.

### TC-04 — Mixed OB compliance → 'OB Partially Compliance' (ADO #101719 · TC-07-009)
*P2 · Edge · Src:FDS · `Drift-Risk`.*
- **Steps:** 1. Mark some OBs compliant, some not, Submit
- **Expected result:** *"Status = 'OB Partially Compliance' (RefList=12)"*
- **Assertions:** [ ] (BLOCKING) status becomes OB Partially Compliance
- **🔑 Conflicts with TC-03 on the same application** — a single app can only take one OB-compliance outcome. Run TC-04
  on APPL26-01270 and TC-03 on a second application, or accept that only one is verdicted per record. Note it.

### TC-05 — Any 'No' in Document Verification → Incomplete (ADO #101721 · TC-07-011)
*P1 · Negative · Src:FDS.*
- **Steps:** 1. In Document Verification mark one document **No** with a reason, Submit
- **Expected result:** *"Status → 'Application Incomplete' (RefList=4); Incomplete notification sent to chairperson
  with comments to amend/resubmit"*
- **Assertions:** [ ] (BLOCKING) status becomes Application Incomplete · [ ] RECORD the notification
- **📌** Requires OB Compliance done first. This also sets up TC-07-015 (submitter edit mode).

### TC-06 — 'No' without a reason is blocked (ADO #101722 · TC-07-012)
*P2 · Negative · Src:FDS.*
- **Steps:** 1. Mark a document **No**, leave the reason empty, Submit
- **Expected result:** *"Validation error requires reason"*
- **Assertions:** [ ] (BLOCKING) submit blocked · [ ] a reason-required message shows
- **📌** Smoke run indicated `Reject` only enables once both reason fields are set — confirm that is the mechanism here
  (disabled button vs explicit message).

### TC-07 — Third resubmission failure → 'Application Unsuccessful' (ADO #101724 · TC-07-014)
*P1 · Negative · Src:FDS.* ⚠️ **Heavy setup — needs 3 resubmission cycles.**
- **Steps:** 1. Process the 3rd resubmission and fail Document Verification
- **Expected result:** *"Status = 'Application Unsuccessful' (RefList=5); denied letter sent to chairperson with
  appeal-process information"*
- **Assertions:** [ ] (BLOCKING) status becomes Application Unsuccessful after the 3rd failure · [ ] a denied letter is
  generated
- **📌** Requires driving incomplete → submitter resubmit → fail, three times. Defer unless time allows; our earlier
  denied application `APPL26-01106` may already sit near this state — check before rebuilding it.

### TC-08 — Application reopens in edit mode on resubmission (ADO #101725 · TC-07-015)
*P2 · Positive · Src:FDS.*
- **Steps:** 1. After TC-05 marks it Incomplete, the **submitter** signs in and opens the application
- **Expected result:** *"Wizard reopens in edit mode showing only the relevant changes section; submitter can amend and
  resubmit (FDS 6.2)"*
- **Assertions:** [ ] the wizard reopens editable · [ ] RECORD whether it shows *only* the relevant section or the
  whole wizard
- **🔑 Chains off TC-05.** Same shared account is the submitter of APPL26-01270, so switch to the public portal after
  TC-05.

### TC-09 — Audit trail: original vs revised (ADO #101726 · TC-07-016)
*P2 · Edge · Src:Both.* 🔴 **Expected FAIL — no audit trail exists.**
- **Steps:** 1. Open the audit log
- **Expected result:** *"Both original and revised snapshots visible; diff or both versions retrievable"*
- **Assertions:** [ ] (BLOCKING) a snapshot of the original submission exists
- **🔴** Already established in suite 05 (TC-05-020, `bugs/2026-08-18-no-submission-snapshot-or-application-audit-log.md`):
  Admin → Audit Logs is only Logon/OTPs/Notifications and no entity-history exists. **Verdict carries: FAIL.**

### TC-10 — Risk Status flag visible (ADO #101727 · TC-07-017)
*P2 · Positive · Src:FDS.* ✅ **Likely PASS — already sighted.**
- **Steps:** 1. Open the application detail
- **Expected result:** *"Risk Status field visible (e.g., Low/Medium/High) per FDS 8.2 rule 4"*
- **Assertions:** [ ] a Risk Status indicator is visible · [ ] RECORD its value
- **📌** The **`HIGH RISK`** chip was visible on APPL26-01270 this morning — confirm it is the Risk Status field and
  capture it.

### TC-11 — 'Compulsory to Register' flag displayed (ADO #101728 · TC-07-018)
*P3 · Edge · Src:FDS.* ✅ **Likely PASS — already sighted.**
- **Steps:** 1. Open the application detail
- **Expected result:** *"Compulsory-Register indicator visible (FDS 8.2 rule 6)"*
- **Assertions:** [ ] a Compulsory-Register indicator is visible
- **📌** The **`COMPULSORY`** chip was visible this morning — confirm and capture. ⚠️ Ask Thabiso what drives it (we do
  not know the rule).

### TC-12 — Two-month SLA timer tracked (ADO #101729 · TC-07-019)
*P3 · Edge · Src:FDS · `Drift-Risk`.*
- **Steps:** 1. Open the application detail
- **Expected result:** *"SLA countdown / due-date visible, reflects 2 months (FDS 6.1 rule 8)"*
- **Assertions:** [ ] an SLA/due-date is visible · [ ] it reflects ~2 months from submission
- **⚠️** Drift-Risk, and note the `submissionDate` defect (`bugs/2026-08-18-submission-date-stamped-at-draft-creation.md`)
  — if the SLA is computed from that wrong date, the due-date will be off. Cross-check.

### TC-13 — Non-admin cannot access admin views (ADO #101730 · TC-07-020)
*P1 · Negative · Src:FDS.* ✅ **RUNNABLE since 2026-08-26 — and RUN on 08-27, verdict FAILED.** The blocker was the
missing non-admin account; **Account D** (`npo.qa.clerk.d@example.org`, `Dsd.Npo.Registry Clerk` only) is it.
🔑 The route is **`/dynamic/boxfusion.dsdnpo/npoapplication`** — *not* `all-applications`, which 404s. The menu label
is "All Apllications" (product typo) and CRUDS is a flyout that renders no anchors until clicked.
- **Steps:** 1. As a **non-admin**, navigate to `/all-applications`
- **Expected result:** *"Access denied / redirect; no application data leaks"*
- **Assertions:** [ ] (BLOCKING) access denied · [ ] no data leaks
- **⚠️ The old ⛔ reason is retired** — role-scoped users exist now (`test-data/qa-accounts.md`, accounts C and D).
- ⚠️ **The "API answers anonymously so gating is moot" note is HALF WRONG and should not be repeated as written.**
  The *OTP* endpoint does answer anonymously (`bugs/2026-08-18-api-reachable-without-authentication.md`), but the
  **admin portal perimeter holds**: an unauthenticated route request redirects to `/login?returnUrl=…` with no data,
  and a public-portal credential is rejected at `POST /api/TokenAuth/Authenticate` → **403**. The exposure is to
  **internal users of any of the ~46 roles**, not to the public internet — a materially different severity.
- 🔑 **Do not "log out" by clearing `localStorage`** — the token is not held there, and an apparent anonymous probe
  can silently still be the shared dev account with full admin rights. Use the user-menu **Logout**.

### TC-14 — BackfillDocuments regenerates missing letters (ADO #101731 · TC-07-021)
*P2 · Positive · Src:Code · `Drift-Risk`.* ⛔ **NOT UI — direct API POST.**
- **Steps:** 1. `POST …/npoapplications/BackfillDocuments`
- **⛔** Out of the UI-only scope (same endpoint as suite 08's TC-08-019). Listed for the dev team; **not scheduled.**

### TC-15 — Reallocation bulk-notify via Excel upload (ADO #101732 · TC-07-022)
*P3 · Positive · Src:Code · `Drift-Risk`.* ⛔ **NOT UI — admin API endpoint.**
- **Steps:** 1. Upload Excel via the admin reallocation endpoint
- **⛔** Out of UI-only scope; **not scheduled.** Dev/automation.

## Coverage against ADO
| Plan case | ADO | TC id | P | Src | Runnable? |
|---|---|---|---|---|---|
| TC-01 | #101715 | TC-07-005 | 2 | FDS | ✅ yes (non-destructive) |
| TC-02 | #101717 | TC-07-007 | 1 | FDS | ✅ yes |
| TC-03 | #101718 | TC-07-008 | 2 | Both | ✅ yes (destructive) |
| TC-04 | #101719 | TC-07-009 | 2 | FDS | ✅ yes (needs a 2nd app vs TC-03) |
| TC-05 | #101721 | TC-07-011 | 1 | FDS | ✅ yes |
| TC-06 | #101722 | TC-07-012 | 2 | FDS | ✅ yes |
| TC-07 | #101724 | TC-07-014 | 1 | FDS | ⚠️ heavy (3× resubmit) |
| TC-08 | #101725 | TC-07-015 | 2 | FDS | ⚠️ chains off TC-05 |
| TC-09 | #101726 | TC-07-016 | 2 | Both | 🔴 FAIL — no audit trail |
| TC-10 | #101727 | TC-07-017 | 2 | FDS | ✅ yes (sighted) |
| TC-11 | #101728 | TC-07-018 | 3 | FDS | ✅ yes (sighted) |
| TC-12 | #101729 | TC-07-019 | 3 | FDS | ✅ yes |
| TC-13 | #101730 | TC-07-020 | 1 | FDS | ⛔ needs non-admin user |
| TC-14 | #101731 | TC-07-021 | 2 | Code | ⛔ API-only |
| TC-15 | #101732 | TC-07-022 | 3 | Code | ⛔ API-only |

**15 cases owned.** Smoke counterparts: TC-07-001/002/003/004/006/010/013.

## Suggested run order (this session)
1. **TC-10, TC-11, TC-12** — read-only detail checks (risk, compulsory, SLA), non-destructive, confirm the sighted chips.
2. **TC-01** — add a comment, confirm author + timestamp persist.
3. **TC-02** then **TC-06** — the "reason required" negatives (OB compliance, doc verification) before any terminal outcome.
4. **TC-05** — mark a document No → Incomplete; capture the notification. Then **TC-08** (submitter edit mode) off it.
5. **TC-03** or **TC-04** last — terminal OB-compliance outcomes (one per application).
6. **TC-09** — record the audit-trail FAIL (already known).
7. Leave **TC-07** (3× resubmit), **TC-13/14/15** for dependencies / dev.

---

## ✅ Executed 2026-08-18 — 9 verdicted (5 pass · 3 fail · 1 deferred)
Report: `test-reports/2026-08-18/07-triage-ob-compliance-doc-verification-functional--admin-run.md`
Ran on our own **APPL26-01270**; left recoverable (Doc Verification closed without submitting).

| Case | Verdict | Note |
|---|---|---|
| TC-01 (TC-07-005) | ✅ PASS | comment saved with author + timestamp |
| TC-02 (TC-07-007) | ✅ PASS | OB reason required (disabled Submit gate) |
| TC-04 (TC-07-009) | 🔴 FAIL | mixed OB → **"Failed Compliance"** not "Partially" (`bugs/2026-08-18-mixed-ob-compliance-recorded-as-failed-not-partially.md`) |
| TC-06 (TC-07-012) | ✅ PASS | doc 'No'/reject blocked without reason; Reject enables only with reasons |
| TC-09 (TC-07-016) | 🔴 FAIL | no audit trail (carried from suite 05) |
| TC-10 (TC-07-017) | ✅ PASS | HIGH RISK chip visible |
| TC-11 (TC-07-018) | ✅ PASS | COMPULSORY chip visible |
| TC-12 (TC-07-019) | 🔴 FAIL | no SLA/due-date shown anywhere |
| TC-05 (TC-07-011) | ⚪ DEFERRED | verify path dead-ends on an OB-failed app — needs a 2nd app with compliant OBs |

**Corrections:** smoke's "Approve stays enabled on refusal-marked app" is **context-specific** — Approve was correctly
disabled here whenever OBs failed/refuse=Yes. `Decline` never enabled (consistent with smoke — query if it's dead).
**Still open:** TC-03/08 (need a 2nd submitted app with compliant OBs), TC-07 (3× resubmit), TC-13 (non-admin user),
TC-14/15 (API — on the scope-exceptions list).

---

## ✅ Follow-up run 2026-08-18 — fresh compliant-OB app APPL26-01482 (2nd sitting)
Report: `test-reports/2026-08-18/07-triage-doc-verification-outcomes--fresh-app-APPL26-01482.md`
Registered + submitted a fresh VA/Membership app with 3 compliant OBs to reach the Document-Verification path.

| Case | Verdict | Note |
|---|---|---|
| TC-05 (TC-07-011) | 🔴 FAIL | **no "Application Incomplete" outcome** — verification No dead-ends (all buttons disabled) or reject → App Failed. `bugs/2026-08-18-no-application-incomplete-first-reject-denies-outright.md` |
| TC-07 (TC-07-014) | 🔴 evidenced | app denied on the **first** reject (NPO status 3), not the 3rd resubmission; `numOfResubmissions` null — resubmission cycle absent |
| TC-08 (TC-07-015) | ⚪ BLOCKED | no resubmission/edit-mode state is ever reached |
| TC-03 (TC-07-008) | ✅ evidenced | all-compliant → status 9; all-non-compliant/mixed → 10 (see TC-07-009) |

🔴 **Data-consistency defect:** after reject `NpoApplication.applicationStatus=9 (Compliant)` vs `NpoOrganisation.status=3 (Failed)` — the two disagree.
🔑 **Corrections/corroborations:** TC-07-009 mixed-defect reinforced (9 vs 10, never 12). Smoke "Approve stays enabled
on refusal-marked app" **DOES reproduce** when OBs are compliant (my earlier "correctly disabled" was because those OBs
had failed). Risk/Compulsory chips are per-application (01482 had neither).
🔑 **Fresh registration IS automatable:** Places address = type-slowly → ArrowDown → Enter (physical + postal both);
date pickers via panel (year-btn → decade-prev → year → month → day). VA/Membership auto-generates the constitution.
**Suite 07 now: 11 of 15 verdicted** (TC-07-005/007/008/009/011/012/014/016/017/018/019). Remaining: TC-07-015 (blocked),
TC-07-020 (needs non-admin user), TC-07-021/022 (API — scope-exceptions).
