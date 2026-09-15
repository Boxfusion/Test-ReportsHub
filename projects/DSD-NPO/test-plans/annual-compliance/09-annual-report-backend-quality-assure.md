# Test Plan: NPO-09 — Annual Compliance: Backend Processing & Quality Assure (smoke)

> **Status:** Imported from Azure DevOps — **partially reachable** (TC-01 runnable now)
> **Owner:** QA
> **Last Updated:** 2026-08-13
> **Estimated Duration:** 120s

## Metadata
| Field | Value |
|-------|-------|
| App URL | https://dsd-npo-adminportal-qa.shesha.app/login |
| Environment | QA |
| Login As | mpenduloizwelinuk@gmail.com / 123qwe |
| Lead tester | **Thabiso Kegakwile** |
| ADO Plan | [planId 101541 — DSD-NPO Smoke Test Plan](https://dev.azure.com/boxfusion/Boxfusion%20Test%20Plans/_testPlans/execute?planId=101541&suiteId=101866) |
| ADO Suite | 101866 — *09 - Annual Compliance - Backend Processing & Quality Assure* (3 cases) |

## Objective
> Verify the DSD-staff side of annual compliance: listing and filtering submitted annual reports, opening a report's details, and running the Quality Assure decision that issues a compliance letter and moves the NPO to Compliant.

## Reachability
**TC-01 is runnable now** — `CRUDS → Annual Compliance` exists on the admin portal and has an **Add** action, so the register is reachable. TC-02 and TC-03 need **our own** submitted report to act on (plan NPO-08), which is blocked.

⚠️ **Do not Quality Assure another tester's report.** TC-03 is a state-changing decision.

## Provenance
Imported from the ADO smoke plan on 2026-08-13. Expected results quoted from the ADO cases; all state `Design`.

## Preconditions
- [ ] Admin portal signed in; view mode **Live → Latest**
- [ ] TC-02/TC-03: at least one annual report submitted **by us**

## Test Cases

### TC-01 — All Annual Reports view lists submissions with filterable status (ADO #101756 · TC-09-001)

*Priority 1 · Positive.* ✅ **Runnable now.**

- **Type:** Happy path (structural)
- **Steps:**
  1. NAVIGATE to **CRUDS → Annual Compliance**
  2. WAIT for the grid — remember it is a `sha-react-table`, so use `[role=table]` / `[role=row]`
  3. ASSERT (BLOCKING) the list displays columns **NPO Name · Year · Submission Date · Status · Risk** *(FDS Annual 8.1)*
  4. Apply a status filter → ASSERT it narrows the list
  5. Clear it → ASSERT the original count returns
- **Expected result:** *"List displayed with NPO Name, Year, Submission Date, Status, Risk; filters work (FDS Annual 8.1)"*
- **Assertions:**
  - [ ] ASSERT (BLOCKING) the grid renders
  - [ ] ASSERT all five prescribed columns are present
  - [ ] ASSERT the status filter narrows and clears correctly
- **📌** Read the row count from the grid caption (*"1-10 of N items"*) before and after filtering.

---

### TC-02 — Report details show all captured data and statuses (ADO #101757 · TC-09-002)

*Priority 1 · Positive.* ⚠️ Read-only, so runnable against an existing report if one exists.

- **Type:** Happy path (structural)
- **Steps:**
  1. On the annual reports list, CLICK a report row
  2. ASSERT (BLOCKING) the details page *(FDS Annual 8.2)* shows **organisation details · financials · OB list · status · risk status**
- **Expected result:** *"Details page (FDS Annual 8.2) shows org details, financials, OB list, status and risk status"*
- **Assertions:**
  - [ ] ASSERT (BLOCKING) the details page opens
  - [ ] ASSERT all five prescribed sections are present
- **📌** If our own report exists, cross-check the values against what plan NPO-08 captured — that turns a structural check into a real data-integrity check across the two portals.

---

### TC-03 — Quality Assure allows confirming correctness or capturing non-alignment (ADO #101758 · TC-09-003)

*Priority 1 · Positive.* ⛔ Needs our own report. ⚠️ Drift-Risk case.

- **Type:** Happy path (decision)
- **Steps:**
  1. Open **our** report's detail page
  2. CLICK **Quality Assure**
  3. ASSERT (BLOCKING) the dialog is shown *(FDS Annual 8.3)*
  4. RECORD the options offered — the case names **'Aligned'**; note whatever the non-alignment option is called
  5. SELECT **Aligned** and CLICK **Submit**
  6. ASSERT a **compliance letter** is issued to the organisation
  7. ASSERT the status becomes **Compliant**
- **Expected result:** *"Dialog shown (FDS Annual 8.3)"* then *"Compliance letter issued to org; status -> Compliant"*
- **Assertions:**
  - [ ] ASSERT (BLOCKING) the Quality Assure dialog opens
  - [ ] ASSERT selecting Aligned issues a compliance letter
  - [ ] ASSERT the status is exactly `Compliant`
- **⚠️ ADO drift note (Thabiso's own):** *"Code: no dedicated 'Quality Assure' endpoint; status transitions handled directly via `AcsStatusUpdateAndNotificationServiceTask`."* So the dialog in step 3 may not exist as described — **confirm the intended UI before logging a failure.**
- **❓ Question for Thabiso:** the case only exercises **Aligned**. What is the non-alignment path, what does the NPO receive, and does it reopen the report for correction? That is the branch that actually matters for compliance enforcement, and neither plan covers it.

---

## Coverage against ADO

| Plan TC | ADO id | ADO TC | Reachable today |
|---|---|---|---|
| TC-01 | #101756 | TC-09-001 | ✅ yes |
| TC-02 | #101757 | TC-09-002 | ⚠️ read-only, if any report exists |
| TC-03 | #101758 | TC-09-003 | ⛔ needs our own report |

**Not in this plan** (Functional suite 101892, 3 cases, to import later).
