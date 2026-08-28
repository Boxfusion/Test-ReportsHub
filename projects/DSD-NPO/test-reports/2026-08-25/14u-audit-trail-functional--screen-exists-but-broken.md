# Report: NPO-14U-F — Audit trail & resubmission diff (functional)

**Date:** 2026-08-25 09:45 UTC
**Plan:** test-plans/cross-cutting/14u-audit-trail-functional.md
**Execution Mode:** ai-repair
**Result:** FAILED — 2 failed, 2 blocked of 4. The entity-change audit screen **exists and defines exactly the right columns** (`Date · Actioned By · Change Type · Description`) but returns **400** and shows "No Data". **This retracts the 08-18 claim that suite 14U is unexecutable** — it is blocked by a defect, and the routes it was written off on were guesses.
**Duration:** ~700s
**Cases:** TC-01, TC-02, TC-03, TC-04
**Environment:** QA · admin portal · **view mode Latest (asserted in-run)**
**Accounts used:** `mpenduloizwelinuk@gmail.com` (shared dev login)

## Summary
| Total attempted | Passed | Failed | Partial | Blocked |
|---|---|---|---|---|
| 4 | 0 | 2 | 0 | 2 |

| Case | ADO | Verdict | One-liner |
|---|---|---|---|
| TC-01 Audit trail captures who/when per transition | #101815 | 🔴 FAILED | The screen is built with the right columns and **400s** — `"The value '' is invalid."` |
| TC-02 Resubmission diff shows changed fields | #101816 | 🔴 FAILED | No diff anywhere on `npoapplication-details` v46; only a resubmission **count** is tracked |
| TC-03 OB CRUD writes audit entries | #107426 | ⛔ BLOCKED | Same broken screen — and our own `SelfConfirm` cannot be checked because of it |
| TC-04 Upload + state change written to audit | #107427 | ⛔ BLOCKED | Same broken screen |

## ⛔ First, a correction to our own record
On 2026-08-18 this suite was written off as *"no application audit view, all 6 entity-history routes 404 → suite 14U
is unexecutable"* (recorded as the rationale for TC-05-020 FAILED). **Those six routes were guesses, and the
conclusion was wrong.** Listing the `FormConfiguration` registry instead of guessing URLs shows the audit screens are
there:

| Route | State as at 2026-08-25 |
|---|---|
| `Shesha/entity-change-audit-log` **v32** | **400** — `"The value '' is invalid."`, renders *"No data is available for this list"* |
| `Shesha/logon-audit` · `Shesha/login-audit-table` | ✅ **work** — 60 451 records, real result values |
| `StarterTemplate/otp-audit-table` | renders **13 258 rows, every cell blank** |
| `Shesha/scheduled-jobs-logs-view` | **404** — `ScheduledJobExecutionDto` not found |

**TC-05-020's FAILED verdict still stands** — there is still no working entity-level audit view — but the reason must
be restated: *blocked by a defect, not absent by design.* Bug:
`../bugs/2026-08-25-audit-screens-otp-blank-and-entity-change-broken.md`

⚠️ I also could not reach `Audit-Trail`: `/dynamic/boxfusion.dsdnpo/Audit-Trail` returns **404 `form
'boxfusion.dsdnpo/Audit-Trail' not found`**. The registry lists that form under a module id I did not resolve
(`6fd17c25-…`), so **my route was the guess this time** — recorded as unresolved rather than as absence, which is the
same discipline this report is correcting elsewhere.

## Case detail

### TC-01 — Audit trail captures who/when for every state transition (#101815 · TC-14-003) — FAILED
**Mode:** ai-repair · `Shesha/entity-change-audit-log` v32, Latest mode
- [PASS] **The feature is designed.** The screen renders four column headers — **`Date · Actioned By · Change Type · Description`** — which is very nearly the actor/timestamp/from-state/to-state shape the case asks for
- [FAIL] (blocking) **It cannot load.** The grid's request returns:
  ```
  → 400  {"error":{"message":"Your request is not valid!",
           "details":"The following errors were detected during validation.\n - The value '' is invalid.\n"}}
  ```
  An empty value is being sent where the endpoint requires one. The page then displays *"No Data — No data is
  available for this list"*
- [FAIL] So no transition can be inspected, and none of actor / timestamp / from-state / to-state / comment is verifiable
- 🔑 **"No Data" is the dangerous part.** The 400 is swallowed and the screen presents an empty result set, which reads as *"this application has no audit history"* rather than *"the audit log is broken"*. Identical failure mode to the notification screens found earlier today

### TC-02 — Resubmission diff shows changed fields (#101816 · TC-14-004) — FAILED
**Mode:** ai-repair · `npoapplication-details` v46 opened on a real application
- [FAIL] (blocking) **No diff view exists.** The detail form has ten sections and none of them is a diff or a history:
  *Application Details · Organisation Details · Objectives · Particulars Of Office Bearers · Particulars Of Control
  Structure · NPO Admin and Operations · Area of Operation · Declarations · Comments · Documents*
- [FAIL] None of `Diff`, `Resubmi`, `Changed`, `Previous`, `History`, `Audit` appears anywhere in the rendered page
- [PASS] (record) **The count is tracked** — `Npo.Application` exposes `numOfResubmissions`, so the system knows how
  many times an application was resubmitted even though it cannot show what changed. Worth separating: the data to
  build a diff may exist; the view does not
- 📌 The detail view also threw **500 `"Non-static method requires a target."`** twice while loading — unrelated to
  this case's assertion, but it means the application detail view is not clean either

### TC-03 — Office Bearer CRUD writes audit entries (#107426 · TC-14U-003) — BLOCKED
**Mode:** ai-repair
- [BLOCKED] All four steps (Create / Update / **SelfConfirm** / Delete) assert the *content of an audit entry*, and
  the only screen that lists entity-change entries returns 400. There is no route to read an audit entry from
- 🔑 **Step 3's precondition is already satisfied and this is frustrating.** An OB self-verification was completed
  earlier today — `tempId eba499877cad` on `Nomfanelo_QA_NPO_2026-08-13`, verified as persisted (the resolver
  afterwards returns *"Office bearer has already verified themselves"*). So a `SelfConfirm` audit entry either exists
  or does not, and **the answer is one working screen away.** This case should be the first thing re-run once
  `entity-change-audit-log` loads
- 📌 Not verdicted FAILED: with no readable audit store, absence of evidence here is not evidence of absence

### TC-04 — Document upload + application state change written to audit (#107427 · TC-14U-004) — BLOCKED
**Mode:** ai-repair
- [BLOCKED] Both steps assert audit-entry content and depend on the same broken screen
- 📌 On step 1's *"file hash"* claim: suite 05 TC-05-011 already proved uploads round-trip **byte-identical**
  (SHA-256 match on a 413 B file), so a hash is computable — whether the audit records one is what remains untested
- 📌 On step 2, the transition itself is exercisable (suite 07 drove application state changes), so this case becomes
  runnable immediately once the audit view works

## What unblocks this suite
A single fix: make `Shesha/entity-change-audit-log` supply the parameter its query requires. That converts **TC-01,
TC-03 and TC-04** from blocked to runnable in one go — three of the four cases here, plus it is the screen suite 14U
exists to test. TC-02 needs a diff view built, which is a feature rather than a fix.

## Method
- Routes enumerated from the `FormConfiguration` registry (8 294 forms), **not** guessed — the discipline this report
  is correcting. Module ids resolved via `Shesha/Module/Crud/Get`.
- Every screen opened by direct URL with the view mode **asserted** as Latest, and every `>= 400` API response body
  captured rather than inferred from an empty grid.
- Read-only throughout; nothing was mutated for this suite.
