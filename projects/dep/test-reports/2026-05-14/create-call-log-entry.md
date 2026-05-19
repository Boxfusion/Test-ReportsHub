# Report: Create Call Log Entry

**Date:** 2026-05-14 08:22 UTC
**Plan:** test-plans/cases/create-call-log-entry.md
**Result:** FAILED
**Duration:** ~37 min (incl. exploration of alternative UI)

## Summary
| Total Steps | Passed | Failed | Skipped |
|-------------|--------|--------|---------|
| 4 | 2 | 1 | 1 |

Failure cause: the "Call Log" section described by the plan does not exist on the case detail page. TC-03 BLOCKING assertion cannot be evaluated, so TC-04 was not executed. Bug filed at `test-reports/bugs/2026-05-14-call-log-section-missing-on-case-detail.md`.

---

## Step Results

### TC-01 — Login as Admin
**Action:** Navigated to https://linux-dep-adminportal-test.azurewebsites.net/, typed username `admin` and password `123qwe`, clicked Sign In, waited for dashboard.
**Expected:** User is logged in and sees the admin dashboard.
**Actual:** Logged in and landed on `/dynamic/Boxfusion.ServiceManagement/service-requests` (All Cases dashboard).
**Result:** [PASS]

**Assertions:**
- [PASS] (BLOCKING) Dashboard/home page is visible after login (observed: All Cases list with 3118 items, full side navigation visible)

---

### TC-02 — Open an Existing Case
**Action:** From the Cases (master) view, clicking the first case row only toggled its checkbox — no detail panel appeared. Navigated to the tabular "All Cases" view at `/dynamic/StarterTemplate/cases-table` and clicked the search icon on the first row (REF015/13/05/2026), which links to `/dynamic/Boxfusion.ServiceManagement/case-request-details?id=8d723abd-d40f-4911-a839-14580fcc6c67`.
**Expected:** Case detail page is displayed.
**Actual:** Case detail page loaded: "Case Details: REF015/13/05/2026: Case Type Missing", status `New`.
**Result:** [PASS]

**Assertions:**
- [PASS] (BLOCKING) Case detail page is visible (observed: "Case Details: REF015/13/05/2026: Case Type Missing", New chip, Back/Pick Up/Assign/Merge/Cancel/Edit toolbar, sections Timeline, Uploaded Media, Related Case(s), Case Overview, Customer Overview)

**Notes:**
- The plan's TC-02 step "CLICK the Cases section / navigate to the case list" → "CLICK the first case in the list to open it" does not work on the Cases (master) view at `/service-requests`; rows there are checkboxes, not links. The tabular `All Cases` view at `/dynamic/StarterTemplate/cases-table` is what actually exposes a row-level link to the detail page.

---

### TC-03 — Add Call Log Entry
**Action:** Inspected the case detail page for a "Call Log" section or "Add Call Log" button. The page contains the following sections only: Timeline (with buttons Send Email, Send SMS, Add Notes), Uploaded Media (collapsed), Related Case(s) (collapsed), Case Overview, Customer Overview. As a sanity check, clicked "Add Notes" — the form that appeared is a single textbox with Cancel/Add buttons. There is no Channel dropdown, no "Call Centre" option, and no "Call Log" section/list anywhere on the page.
**Expected:** "Add Call Log" button visible in a Call Log section; form opens with Channel dropdown and Notes field.
**Actual:** Neither the section, the button, nor the form exists on the case detail page.
**Result:** [FAIL]

**Assertions:**
- [FAIL] Channel is set to `Call Centre` (not evaluable — no Channel control found)
- [FAIL] Notes shows `Test call log entry created by automated test` (not evaluable — no call-log Notes control found; the Add Notes textbox is unrelated)
- [FAIL] (BLOCKING) Call log form closed and returned to case detail page (not evaluable — the call log form does not exist)

---

### TC-04 — Verify New Call Log Appears
**Action:** Not executed.
**Expected:** New call log entry visible in the case's call log list.
**Actual:** SKIPPED — TC-03 BLOCKING assertion failed; no call log entry was created and there is no call log list on the case detail page to inspect.
**Result:** [SKIPPED]

**Assertions:**
- [SKIPPED] The new call log entry is visible in the list
- [SKIPPED] (BLOCKING) The new entry shows channel `Call Centre` and notes `Test call log entry created by automated test`

---

## Notes
- Recent commits on the branch (`[feat]- callLog forms`, `[feat]: added forms for creating a case on a call`) and the sibling plan `test-plans/calls/create-call-log.md` suggest the shipped call-log flow is standalone — used to **create a case from a call** — not to add call log entries to an already-open case. The TC-03/TC-04 shape in this plan appears to assume a UI that has not been built on the case detail page.
- Per user decision, a bug has been filed rather than rewriting the plan: see `test-reports/bugs/2026-05-14-call-log-section-missing-on-case-detail.md`.
