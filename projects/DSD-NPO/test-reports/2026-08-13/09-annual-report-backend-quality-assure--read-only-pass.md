# Report: NPO-08 / NPO-09 — Annual Compliance (submission blocked, backend read-only cases pass)

**Date:** 2026-08-13 14:54 UTC
**Plan:** test-plans/annual-compliance/09-annual-report-backend-quality-assure.md
**Spec:** test-plans/annual-compliance/09-annual-report-backend-quality-assure.spec.ts
**Execution Mode:** ai-repair
**Result:** PARTIAL — the two read-only backend cases pass with column defects; Quality Assure and all of suite 08 are unreachable
**Duration:** 400s
**Cases:** TC-09-001, TC-09-002, TC-09-003 (suite 101866)
**Assessed-not-executed:** suite 101865 — TC-08-007, TC-08-009, TC-08-011, TC-08-014, TC-08-017 (reachability only; none run)
**Environment:** QA · both portals · view mode **Latest**
**NPO under test:** **`333-018-NPO`** — `Nomfanelo QA NPO 2026-08-13`, REGISTERED today

## Summary
| Total Steps | Passed | Failed | Skipped |
|-------------|--------|--------|---------|
| 14 | 9 | 3 | 2 |

## ⛔ Suite 08 (Annual Report submission) cannot run — and that is CORRECT behaviour

The NPO's *Annual Reports* action opens
`/dynamic/boxfusion.dsdnpo/individual-npo-annual-compliance-table?npoId=<npoId>&initiateReport=`
which reports **0 items** and displays:

> *"No annual report can be initiated at this time. A report may already be in progress, or there may be no
> outstanding report due."*

**This is right.** `333-018-NPO` was registered **today (13/08/2026)** with a financial year end of **March**, so
its first reporting period has not closed and nothing is due. There is no defect here — all five suite-08 cases
(TC-08-007/009/011/014/017) simply have an unsatisfiable precondition against a freshly registered NPO.

### ✅ Positive finding — the guard is enforced SERVER-SIDE, not just hidden in the UI
The page takes an `initiateReport` query parameter, which was empty. Forcing **`initiateReport=true`** directly in
the URL produced **no change**: still *"No annual report can be initiated at this time"*, still **0 items**, and
**no report was created**.

So the "nothing due" rule is a real server-side control, not a hidden button. Worth recording positively — it is
exactly the class of thing Functional suite **14C** (session, read-only & access control) exists to test.

## ✅ TC-09-001 — All Annual Reports view (ADO #101756) — PASS with a column defect
`/dynamic/boxfusion.dsdnpo/annual-compliance` · **39 reports**

- [PASS] The list renders with rows
- [PASS] An **Add** action and **Export** are available (see the question below about Add)
- [PASS] A filter control is present (`.sha-global-table-filter`)
- [FAIL] ⚠️ **Two prescribed columns are missing.** #101756 requires
  *"NPO Name, **Year**, **Submission Date**, Status, **Risk**"*:

  | Prescribed | Present as |
  |---|---|
  | NPO Name | ✅ `Name` |
  | Year | ⚠️ `Financial Period Year` — **but blank on every row** |
  | **Submission Date** | 🔴 **absent** |
  | Status | ✅ `Compliance Status` (plus `Npo Status`) |
  | **Risk** | 🔴 **absent** |

  Full live column set: *Name · Npo Number · Npo Status · Compliance Status · Due Date Has Been Extended ·
  Financial Period Month · Financial Period Year*.
- [SKIP] The filter itself was not exercised — deferred with the same caution as TC-07-003 after the
  All Applications grid was seen hanging.

## ✅ TC-09-002 — Report details (ADO #101757) — PASS with a defect
Opened a report read-only (another tester's record — safe, nothing actioned):
`/dynamic/boxfusion.dsdnpo/Portal-Annual-Compliance-Details?id=<reportId>`

- [PASS] Header: *"Test Unsuccessful 05 - Annual Report (March / )"* · status **ANNUAL REPORTING IN PROGRESS**
- [PASS] **Organisation details** present (name, trading name, contacts, addresses, FY end, legal form)
- [PASS] **Financials** present — tabs *Financial Report* and *Financial Statement*
- [PASS] **OB list** present — tab *Particulars of Office Bearers*
- [PASS] **Status** present
- [FAIL] 🔴 **No risk status anywhere on the page.** #101757 prescribes *"org details, financials, OB list,
  status and **risk status**"*.
- Full tab set: *Programs and Employees · Particulars of Office Bearers · Financial Report · Financial Statement ·
  Documents · Declarations*
- ⚠️ **The financial period year is blank** — the header literally reads `Annual Report (March / )` with nothing
  after the slash, matching the empty `Financial Period Year` column in the list.

## ⛔ TC-09-003 — Quality Assure (ADO #101758) — NOT REACHABLE
- [FAIL] **There is no Quality Assure button on the report details page** — the page exposes **no action buttons
  at all**.
- Consistent with what suite 07 established: **assessor actions live on the workflow task**
  (`/shesha/workflow-action?id=…&todoid=…`), not on the details view. But **no Annual Compliance task appears in
  the admin inbox** (checked page 1 of 2,473; the visible types were Registration Process, Voluntary
  Deregistration Process, Appeal Definition and Investigation Process).
- So Quality Assure cannot be located or exercised without **our own** submitted annual report — which suite 08
  cannot produce for this NPO.
- ⚠️ Thabiso's own drift note on this case already warns: *"Code: no dedicated 'Quality Assure' endpoint; status
  transitions handled directly via `AcsStatusUpdateAndNotificationServiceTask`."* **That is consistent with what
  we see** — there may be no Quality Assure UI at all, and the case may need rewriting.

## 🔑 The `Risk` field is missing in THREE places — this is now a pattern
| Where | Prescribed by | Status |
|---|---|---|
| `All Applications` grid | ADO #101712 (Risk Status column) | 🔴 absent |
| `All Annual Reports` grid | ADO #101756 (Risk column) | 🔴 absent |
| Annual report details | ADO #101757 (risk status) | 🔴 absent |

Three separate cases across two suites all prescribe a risk indicator and none of them is implemented. That looks
like **one unbuilt feature rather than three display bugs**, and is worth raising as a single question: *is NPO
risk rating implemented at all?*

## ❓ Questions for the test lead
1. 🔑 **Is NPO risk rating implemented?** Three ADO cases across suites 07 and 09 prescribe it; it appears nowhere.
2. **How do we get an annual report to test against?** Options, in order of preference:
   a. A QA NPO that already has a report **due** (registered in a prior financial year);
   b. Confirmation that **`CRUDS → Annual Compliance → Add`** on admin is a supported way to capture a report —
      ⚠️ **not assumed**, given the ruling that `My Items → Create New` is *not* a supported path. **Asking first.**
   c. Adjusting `333-018-NPO`'s financial year end via a Post Registration change request (suite 10P) to bring a
      period into the past — slower, and may not trigger the due-date logic.
3. **Where does Quality Assure live?** No button on the details page and no annual-compliance task in the inbox.
   Given the drift note about there being no dedicated endpoint, **does the UI exist?**
4. **Why is `Financial Period Year` blank** on every row and in the details header (`Annual Report (March / )`)?
5. Should the annual reports list carry a **Submission Date** column (#101756)?

## ▶ Next
Suite 08 and TC-09-003 are parked pending question 2. Still fully open and independent:
- **15 Education & Awareness (4)** — includes a create, needs nothing we lack
- **12P → 12A Investigations (3)** — anonymous public submission, then admin triage
- **14S Public NPO search (1)** — and `333-018-NPO` is now a *registered* NPO to search for
- **10P / 10A Post Registration (6)** and **13P / 13A Deregistration (6)** — both actions are live on the NPO
