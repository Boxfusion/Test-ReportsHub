# Report: CRM-CASE — TC-01 Create a case

**Date:** 2026-08-12
**Plan:** test-plans/crm/create-and-resolve-case.md
**Cases:** TC-01
**Execution Mode:** ai-driven (Playwright via Node)
**Result:** FAILED — the Create Case modal accepted all seven mandatory fields, closed cleanly with no error, and persisted nothing. Three independent checks found no case.
**Duration:** not instrumented

## Summary
| Total Assertions | Passed | Failed | Skipped |
|---|---|---|---|
| 5 | 4 | 1 | 0 |

Run on the developer's account (`mpenduloizwelinuk@gmail.com`). **View mode was switched to `Latest`** — unlike the
registration runs earlier the same day, which used the published `LIVE` version by mistake.

## Step Results

### TC-01 — Create a case
**Mode:** ai-driven · **Result:** FAILED

- [PASS] View mode switched Live → Latest
- [PASS] (BLOCKING) Create Case modal opened, titled **Create Case**, actions **Cancel** / **Ok**
- [PASS] All four required selects offered option sets:

  | Select | Options |
  |---|---|
  | Channel | Mobile App · Call Centre · Web · Walkin · Telephone · SMS (+3) |
  | Priority | High · Medium · Low · Urgent |
  | Category | Application · Annual Compliance · Appeals · Voluntary Deregistration · Post Registration · Investigation (+1) |
  | Case type | Appeal outcome · Appeal Status · Application Outcome · Application Status · Auth Person Link · Compliance Outcome (+4) |

- [PASS] All **7** mandatory fields verified populated immediately before submit:
  Channel `Mobile App` · Priority `High` · First Name `QA` · Mobile Number `0818400598` ·
  Email Address `mpenduloizwelinuk@gmail.com` · Category `Application` · Case type `Appeal outcome`
  (plus optional Last Name `Tester`, Description `QA Test Case 2026-08-12`)
- [PASS] The modal closed after **Ok** with **no validation error and no error toast**
- [FAIL] **(BLOCKING) The case is not retrievable.** Nothing was persisted.

## 🔴 Silent failure on save

The modal closing cleanly is what makes this dangerous: to a user it is indistinguishable from success. Three
independent routes were checked afterwards, all in **Latest** mode:

| Check | Result |
|---|---|
| Case register (`cases-table v21`) | *"Assigned to Me · **0 items found** · No data is available for this list"* |
| Global filter search for the description | 0 rows; the tag is not present on the page |
| Assigned Cases (`assigned-cases v6`) | *"Cases · **0 items found**"*, column headers present |
| CRM Dashboard (`/dashboards/reportedcases`) | all five cards: *"There is no data for the selected period"* |
| API `GET /api/dynamic/Boxfusion.ServiceManagement/Case/Crud/GetAll` | **200**, empty |

Note this is **not** a rendering fault: the register drew a proper empty state, so the grid works and is genuinely
empty. That is a different situation from the earlier `.ant-table` false negatives.

⚠️ **Two caveats, stated so the finding is not overclaimed.** The register defaults to an **"Assigned to Me"** view,
and the dashboard cards are scoped to a **selected period**. A case created but left unassigned, or dated outside
that period, could in principle be hidden from all of these. "Not persisted" is the strongest reading of the
evidence, not a certainty. It would be settled by capturing the response of the create POST, or by an unfiltered
query on `SM.Case`.

## Observations for Thabiso
1. **A save that silently does nothing** is the fourth instance today of a control giving no feedback — after the
   POPIA gate, the Organisation Details step and the Link-to-existing-NPO submit. On this one the consequence is
   worse: the user believes a case was logged.
2. **The Case entity sits in a different module** — `Boxfusion.ServiceManagement` (`SM.Case`), not
   `boxfusion.dsdnpo`, and is served by `Boxfusion.ServiceManagement/Case/Crud/GetAll`. Is the DSD CRM meant to use
   the shared ServiceManagement module, and could the create be writing to a different entity than the register
   reads?
3. **The register's default "Assigned to Me" view** means a newly captured case is invisible to its creator until
   assigned. Intended?
4. **`Category` and `Case type` overlap confusingly** — Category offers *Appeals*, while Case type offers *Appeal
   outcome* and *Appeal Status*. Which drives routing?
5. A console error appeared on the register during the first attempt:
   `executeScriptSync error TypeError: Cannot read properties of undefined (reading 'id')`.

## Corrections to my own earlier output
⚠️ A first attempt at this run recorded **"case submitted without error — PASS"**. That was wrong on two counts and
is retracted: four required selects were still empty, and the "submit" clicked **Create Case** — the button that
*opens* the modal — rather than the modal's **Ok**. Both faults were mine, not the application's. This report
reflects the corrected run, in which every mandatory field was verified populated and `Ok` was used.

## Coverage not reached
TC-02 (Pick Up) and TC-03 (Resolve and Close) are **blocked** — with no case created there is nothing to select.
