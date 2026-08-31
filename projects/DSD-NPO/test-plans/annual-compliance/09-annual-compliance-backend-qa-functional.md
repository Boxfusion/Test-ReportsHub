# Test Plan: NPO-09-F — Annual Compliance backend / QA (functional)

> **Status:** Imported from Azure DevOps 2026-08-25
> **Owner:** QA
> **Last Updated:** 2026-08-25
> **Estimated Duration:** 300s

## Metadata
| Field | Value |
|-------|-------|
| App URL | https://dsd-npo-adminportal-qa.shesha.app/login |
| Environment | QA |
| Login As | mpenduloizwelinuk@gmail.com / 123qwe |
| Lead tester | **Thabiso Kegakwile** |
| ADO Plan | [planId 101543 — DSD-NPO Functional Test Plan](https://dev.azure.com/boxfusion/Boxfusion%20Test%20Plans/_testPlans/define?planId=101543&suiteId=101892) |
| ADO Suite | 101892 — *09 Annual Compliance backend/QA* (3 cases) |

## Objective
> Verify the backend quality-assurance step on a submitted annual report: that a "Not Aligned" outcome cannot be
> recorded without a reason and drives a resubmission, that a 30-day silence after a non-compliance notice ends in
> cancellation, and that trends analysis is available to a backend user.

## Provenance
Imported from the ADO functional plan on 2026-08-25; raw pull at `test-data/ado-functional-101543/ado-suite-101892.json`.
Expected results quoted verbatim. All three cases are `Src:FDS` and **all three carry `Drift-Risk`** — Thabiso's code
review contradicts the FDS somewhere in each. Expect the live vocabulary to differ from the case wording.

## ⚠️ Preconditions — read before starting, two of these have bitten already
- [ ] Admin portal sign-in
- [ ] 🔑 View mode **Live → Latest**, asserted not assumed (the toggler is `.sha-config-item-mode-toggler`; open it and
      read which item carries `ant-dropdown-menu-item-selected` — the collapsed tag alone is ambiguous)
- [ ] ⛔ **The account needs the `Annual Compliance Quality Assurer` role** (25 holders exist). The shared dev login
      does **not** have it, and without it the QA form renders entirely read-only. This is an outstanding ask.
- [ ] ⛔ **`CRUDS → Annual Compliance` does not list anything** — see the defect note below. Do not read its empty grid
      as "no data".

## 🔑 Two traps specific to this suite
1. **The admin grid lies.** `annual-compliances` renders *"No data is available for this table"* while the underlying
   entity holds **2 465 839** records. The grid is bound to a **non-existent entity alias**. Never take that screen as
   evidence of anything.
2. **Two different entities, two different ids.** The QA form takes an **`AnnualComplianceSubmission`** id, not an
   **`AnnualCompliance`** id. Passing the latter gives a `400` on
   `AnnualComplianceSubmission/Crud/Get` and the form hangs on *"Fetching data…"* with every control disabled — which
   looks exactly like a permissions problem and is not one. Confirm the id type before diagnosing anything else.

## Test Cases

### TC-01 — QA "Not Aligned" requires a reason; triggers resubmission (ADO #101759 · TC-09-004)

*Priority 1 · Negative · `Src:FDS` · `Drift-Risk` · Admin.*

- **Steps (ADO):** 1. Select 'Not Aligned', leave reason blank, Submit · 2. Enter reason and Submit
- **Expected result (ADO):** *"Validation error"* · *"Resubmission email with reason sent; report enters resubmission workflow"*
- **Assertions:**
  - [ ] (BLOCKING) ASSERT the not-aligned outcome cannot be submitted with an empty reason
  - [ ] ASSERT the reason is persisted against the submission
  - [ ] ASSERT a resubmission notification is raised carrying that reason
  - [ ] RECORD the live vocabulary — the case says *'Not Aligned'*; check what the form actually offers
- **📌 Vocabulary drift is expected here.** The live form asks *"Does the report align with captured information?"*
  with **Yes / No**, and the actions are **Decline / Approve** — not "Not Aligned" and not "Submit". Map the case onto
  the live control and say so; do not report the wording difference as a defect.
- **⚠️ Do not prove step 1 by pressing the button on a record we do not own.** If the control is disabled with the
  reason blank, that **is** the validation gate and it is proven without writing anything — the same way the POPIA
  gate was proven in 14Y TC-04. Only if the control is *enabled* with a blank reason is there a reason to press it,
  and then only on a record we created, because step 2 sends real mail to a real NPO.

---

### TC-02 — 30-day non-response after notice leads to cancellation (ADO #101760 · TC-09-005)

*Priority 1 · Negative · `Src:FDS` · `Drift-Risk` · Admin.*

- **Steps (ADO):** 1. Wait 30 days with no response
- **Expected result (ADO):** *"Org status moves to Cancelled per FDS Annual 6.2 rule 9 bullet 3"*
- **Assertions:**
  - [ ] The wait itself — **NOT EXECUTED**, and say so plainly rather than simulating it
  - [ ] RECORD whether a `Cancelled` organisation status exists and whether **any** record has ever reached it
  - [ ] RECORD whether a scheduled job or configurable period is visible anywhere
- **📌** A prior finding is directly relevant: status **7 (Cancelled) has zero records**, which already makes the
  related FDS Appeals rule unobservable. If nothing is ever Cancelled, the interesting question is not "did it take
  30 days" but "does this transition happen at all" — put that to Thabiso rather than parking the case.

---

### TC-03 — Trends analysis visible/accessible to a backend user (ADO #101761 · TC-09-006)

*Priority 1 · `Src:FDS` · `Drift-Risk` · Admin.*

- **Expected result (ADO):** trends analysis is visible/accessible to the backend user
- **Assertions:**
  - [ ] (BLOCKING) ASSERT whether any trends-analysis view exists for a backend user
  - [ ] Enumerate the **configured reports** rather than eyeballing a menu — `reports-table` in module
        `boxfusion.devexpressreporting` lists every report definition with its category
  - [ ] Search the **form registry** before concluding absence
- **📌** Three independent checks are cheap here and one is not enough: the reports registry, the form registry, and
  the Management Reports screen itself. Absence is only worth asserting when all three agree.

## Open questions for Thabiso
- Can we have an account with `Annual Compliance Quality Assurer`? Suite 09 cannot be executed without it.
- Is "trends analysis" a planned feature, or should TC-09-006 be withdrawn?
- Has any organisation ever been auto-Cancelled for annual non-compliance, and is the 30-day period configurable?
