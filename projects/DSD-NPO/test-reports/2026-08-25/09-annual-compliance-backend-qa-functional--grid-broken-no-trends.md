# Report: NPO-09-F — Annual Compliance backend / QA (functional)

**Date:** 2026-08-25 15:15 UTC
**Plan:** test-plans/annual-compliance/09-annual-compliance-backend-qa-functional.md
**Execution Mode:** ai-repair
**Result:** FAILED — 1 of 3 verdicted, 2 blocked. **Trends analysis does not exist** (established three independent ways), and the QA step could not be exercised at all because the shared login has no `Annual Compliance Quality Assurer` role **and** the `Annual Compliance` grid is bound to a non-existent entity — it shows an empty table over **2 465 839** records.
**Duration:** ~500s
**Cases:** TC-01, TC-02, TC-03
**Environment:** QA · admin portal · **view mode Latest (asserted in-run — the toggler menu shows `Latest` carrying `ant-dropdown-menu-item-selected`)**
**Accounts used:** `mpenduloizwelinuk@gmail.com` (shared dev login — **lacks the role this suite needs**)

## Summary
| Total attempted | Passed | Failed | Partial | Blocked | Not executed |
|---|---|---|---|---|---|
| 3 | 0 | 1 | 0 | 1 | 1 |

| Case | ADO | Verdict | One-liner |
|---|---|---|---|
| TC-01 QA "Not Aligned" requires reason | #101759 | ⛔ BLOCKED | QA form is entirely read-only for this account; the intended navigation path is broken as well |
| TC-02 30-day non-response → cancellation | #101760 | ⬜ NOT EXECUTED | A 30-day wait; not simulable |
| TC-03 Trends analysis visible to backend user | #101761 | 🔴 FAILED | No trends view exists — confirmed against the reports registry, the form registry, and the screen itself |

---

## 🔴 The defect found on the way in — `Annual Compliance` shows an empty table over 2.4 million records

`CRUDS → Annual Compliance` (`/dynamic/boxfusion.dsdnpo/annual-compliances`, `v15 LIVE`) renders column headers and
**"No data is available for this table"**. That is not an empty result. The console shows the grid failing:

```
GET /api/services/app/Metadata/Get?container=Npo.AnnualCompliance          → 404
     "Type `Npo.AnnualCompliance` not found"
GET /api/services/app/Entities/GetAll?entityType=Npo.AnnualCompliance&…    → 500
     "Entity with class name or alias 'Npo.AnnualCompliance' not found"
```

The grid is configured against the alias **`Npo.AnnualCompliance`**, which does not exist on the server. The real
entity is reachable and populated:

```
GET /api/dynamic/boxfusion.dsdnpo/AnnualCompliance/Crud/GetAll  → 200, totalCount 2 465 839
```

**Verified before being called a bug**, per the standing rule:
- **Reproducible** — the identical request was issued twice in the same session and returned 500 both times, so it is
  not intermittent.
- **Not the harness** — the failure is a server response, visible in the console on a plain page load, not a
  selector or a timing problem.
- **Not the data layer** — the same data answers 200 on the correct route with 2 465 839 rows.

The user-visible consequence is the part that matters: **a 500 is being presented to an administrator as "no data".**
An admin looking at this screen concludes there are no annual compliance records at all. Filed as
`test-reports/bugs/2026-08-25-annual-compliances-grid-bound-to-nonexistent-entity.md`.

---

## Test Cases

### ⛔ TC-01 — QA "Not Aligned" requires a reason; triggers resubmission (#101759 · TC-09-004) — BLOCKED

*Priority 1 · Negative · `Src:FDS` · `Drift-Risk` · Admin.*

**The form exists and loads.** `annual-compliance-quality-assure v19 LIVE` renders correctly against a valid
`AnnualComplianceSubmission` id (42 such records exist):

| Live control | Case wording |
|---|---|
| *"Does the report align with captured information?"* — **Yes / No** radios | *'Not Aligned'* |
| **Description** field | *"reason"* |
| **Decline** / **Approve** buttons | *"Submit"* |

That is vocabulary drift, expected on a `Drift-Risk` case, and is **not** reported as a defect.

**Why it is blocked:** every control on the form is `disabled` — both radios, both buttons — and the Description field
does not render at all. This held across three different submission records and both compliance states, with the data
loading cleanly (no errors, no pending fetch). The form is read-only for this account.

The most likely cause is the missing **`Annual Compliance Quality Assurer`** role, which we have already asked for and
which 25 accounts already hold. A workflow-context requirement (the form being editable only when opened with a
`todoid`, as the registration wizard is) has **not** been ruled out — I am not claiming the role is definitely the
cause, only that the form cannot be driven by the account we have.

📌 **A diagnostic worth recording, because it cost time and looked like something else.** Opening the QA form with an
**`AnnualCompliance`** id instead of an **`AnnualComplianceSubmission`** id produces
`AnnualComplianceSubmission/Crud/Get → 400`, and the form then hangs on *"Fetching data…"* with every control
disabled — visually identical to the permissions symptom above. My first attempt did exactly this. The two are only
distinguishable from the console. This was my error, not an application fault, and it is now written into the plan's
preconditions.

⚠️ **Deliberately not attempted:** pressing Decline with a blank reason on a seed record we do not own. Step 2 of this
case sends a resubmission email to a real NPO, and the application is already known to discard server-side validation
errors silently — so a "test" of the gate could well have committed the decision and mailed someone. The gate would
have been proven the same way the POPIA gate was in 14Y TC-04 (by the control staying disabled), had the form been
editable at all.

---

### ⬜ TC-02 — 30-day non-response after notice leads to cancellation (#101760 · TC-09-005) — NOT EXECUTED

*Priority 1 · Negative · `Src:FDS` · `Drift-Risk` · Admin.*

The single prescribed step is *"Wait 30 days with no response"*. Not executable in a sitting, and not simulable from
the UI. Recorded as not executed rather than dressed up as something else.

What is worth carrying to Thabiso is the adjacent evidence: **status 7 (Cancelled) has zero records** across the
system. If nothing has ever reached Cancelled, the question is not whether the transition takes 30 days but whether
the transition fires at all — which is answerable without waiting a month, and is the better question to ask.

---

### 🔴 TC-03 — Trends analysis visible/accessible to a backend user (#101761 · TC-09-006) — FAILED

*Priority 1 · `Src:FDS` · `Drift-Risk` · Admin.*

Three independent checks, all agreeing:

**1. The configured report registry — all 14 report definitions enumerated** (`reports-table`, module
`boxfusion.devexpressreporting`, `v14 LIVE`):

| # | Display name | Category |
|---|---|---|
| 1 | Annual Reports Received | AnnualComplianceSubmission Reports |
| 2 | Migration Data | General Reports |
| 3 | Reports Received After Noncompliance Notice | AnnualComplianceSubmission Reports |
| 4 | Voluntary Deregistration Applications | Voluntary Deregistration Reports |
| 5 | Extensions Granted To NPOs | AnnualComplianceSubmission Reports |
| 6 | Application | Incident Management |
| 7 | Appeals | Appeals Reports |
| 8 | Registered Organisation via Appeal | Appeals Reports |
| 9 | Received Application2 | Incident Management |
| 10 | Received Applications | Incident Management |
| 11 | Incomplete Applications | Incident Management |
| 12 | Received Comebacks | Incident Management |
| 13 | Comebacks Not Dealt With | Incident Management |
| 14 | New Applications Not Dealt With | Incident Management |

Every one is a **list of records**. None is a trend, a time series, or an analysis.

**2. The form registry** — all **8 294** forms paged and searched for `trend|analytic|statistic|insight|chart|graph`:
**zero matches**. There is no trends form anywhere in the application.

**3. The screen itself** — `management-reports` (`v15 LIVE`) renders its title **"Management Reports"** and nothing
else. Main content is 64 characters. Whatever was intended to live there was never built or never wired up.

**Verdict:** FAILED — the feature prescribed by the case does not exist.

📌 Worth flagging separately: **all 14 report definitions have Report Type `test`**, `Report Visibility` is blank on
every row, and there are near-duplicates (`Received Applications` / `Received Application2`). The reporting module
looks unfinished rather than merely missing a trends view.

---

## Observations (not defects)
- `AnnualComplianceSubmission.reportMatches` is `false` on **all 42** submissions, including ones never quality-assured.
  It reads as a field defaulting to `false` rather than staying null until a QA decision is made — which would make
  "not aligned" indistinguishable from "not yet assessed" in the data. Not verified; worth a look.
- Two submissions carry QA descriptions (`"TEST"`, `"oooooooooooooooo"`), so the QA path **has** been exercised by
  someone with the right role — the flow is not dead, we simply cannot reach it.

## Open questions for Thabiso
1. **Can we get an account with `Annual Compliance Quality Assurer`?** Suite 09 is unexecutable without it, and this is
   now the third suite blocked on a role rather than on a defect.
2. Is the QA form meant to be reachable by direct link at all, or only from a workflow task with a `todoid`?
3. **Is trends analysis planned, or should TC-09-006 be withdrawn?** Nothing in the build suggests it was started.
4. Has any organisation ever been auto-Cancelled for annual non-compliance? Status 7 has no records.
5. Should `reportMatches` default to `false`, or stay null until assessed?

## Evidence
- Grid failure: `Metadata/Get → 404`, `Entities/GetAll → 500` (both reproduced), correct route `→ 200 / 2 465 839 rows`
- Report registry: 14 definitions, listed in full above
- Form registry sweep: 8 294 forms, 0 trends matches
