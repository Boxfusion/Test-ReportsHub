# Bug: Hourly leave — full day can never be reached; declined cancellation blocks re-cancel; validation and display gaps

- **Plan**: `test-plans/HCM/eLeave/hourly-leave.md`
- **Failing TCs**: `TC-03` (non-blocking), `TC-04 row e`, `TC-06` (non-blocking), `TC-09`, `TC-13 step 6` — found while recording the spec on QA (2026-10-07) and confirmed for TC-03 on the first run
- **Suspected category**: business-logic
- **Azure DevOps**: issue 1 → #117805, issue 2 → #117806, issue 3 → #117807, issue 4 → #117808, issue 5 → #117809 (all related to Feature #100661)
- **Test data left on QA**: `LA2026/13780` (GOV003, 5 hours on Tue 24 Nov 2026) is stuck in **Hourly Parked** and can't be cancelled (see issue 2). It breaks the plan's precondition (no outstanding hourly leave) — every run will fail TC-05 step 5 until it's removed.

## 1. Hourly leaves never add up to a full working day (blocks TC-09, TC-10, TC-11)
- **Step**: `TC-08 STEP 2` / `TC-09 STEP 2`
- **Expected**: A (2 hours) + B (the remaining hours) reach a full day, and a 1-day accumulated leave is created
- **Actual**: the form reports the full day as **"7 hours 1 minute"** ("You have applied for 2 hours of leave before. You have 5 hours 1 minute left to reach a full day (7 hours 1 minute)."). The time picker only offers whole hours, so the closest B is 08–14 = 5 hours. After B was recommended, A (`LA2026/13762`) and B (`LA2026/13780`) both stayed **Hourly Parked**, and no accumulated leave appeared in 2.5 minutes. 08–15 (6 hours) is rejected with "Leave duration should not be more than 5 hours 1 minute."
- **Also**: the admin Charges grid shows the reserving hourly charge as **Minutes Count 480** (8 hours), which doesn't match the 7 h 1 min full day either.
- **Suspected cause**: the work-day length is computed with an off-by-one (e.g. lunch 12:00–12:59 or an inclusive end minute), so whole-hour requests can never meet the threshold.

## 2. Re-cancelling after a declined cancellation fails (TC-13 step 6) — BY DESIGN
> **Update 2026-10-07:** confirmed by the product owner that a leave application can be cancelled only once; after a declined cancellation the leave returns to its previous status. The refusal is expected, and TC-13 now asserts it. ADO #117806 still needs triage on the ADO side (close as By Design, or keep open only for the generic "Failed to cancel leave" message / HTTP 500).

- **Expected**: after GOV012 declines the cancellation, GOV003 can cancel the Hourly Parked leave again
- **Actual**: "Failed to cancel leave" toast. `POST /api/services/SaGovLeave/SaGovLeaveCancellationWorkflow/CancelApplication` → **HTTP 500**: `"A cancellation request already exists for this application."` The existing cancellation (`LC:2026-21394`) has status **Declined**.
- **Suspected cause**: the "cancellation already exists" check doesn't exclude declined cancellations.

## 3. Lunch-only request shows the wrong message (TC-04 row e)
- **Expected**: 12–13 → "The selected time falls entirely within the lunch break and contains no leave hours. Please select a period outside the lunch break."
- **Actual**: "Please make sure that the hours entered are working hours. The selected period contains only weekends or public holidays." Row c (06–08) also shows this weekend message in addition to the working-hours message.
- **Re-confirmed 2026-10-07 (full run after merging main):** TC-04 fails (BLOCKING) at row e with the same weekend message, so TC-05–TC-13 are skipped. `main` now has commit `d9b7001b` ("lunch hour validation message"); QA probably isn't running that build yet. Re-run once it's deployed.

## 4. Possible missing public-holiday check (TC-04 row g, not in the spec)
- 16/12/2026 (Wednesday, Day of Reconciliation) 09–11 was accepted and submitted as `LA2026/13782` (cancelled afterwards). Either QA's holiday calendar doesn't have 16 Dec, or "You cannot apply for hourly leave on a public holiday." isn't enforced. Check the QA calendar first.

## 5. Display gaps (non-blocking)
- **TC-03**: a whole-work-day request (08–16) shows no "1 day" hint — only the Available days alert.
- **TC-06**: the Recommend Leave view shows Start/End as dates only (`19/11/2026`); the plan expects `09:00` / `11:00`. The applicant's details view does show times (`24/11/2026 08:00`).

## Playwright error (TC-03, first run)
```
expect(locator).toBeVisible() failed
Locator: getByRole... getByText(/You have selected to take 1 day/)
Expected: visible
Timeout: 10000ms
Error: element(s) not found
  at hourly-leave.spec.ts:368
```

## Snapshot / screenshot
`test-results/artifacts/HCM-eLeave-hourly-leave-EL-bc4ec-and-minutes-excluding-lunch-chromium/` (screenshot, trace, error-context.md)
