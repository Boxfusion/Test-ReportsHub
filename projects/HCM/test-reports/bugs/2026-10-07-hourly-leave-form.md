# Bug: Hourly leave form — lunch-only request shows the wrong message; public-holiday check; no full-day hint

- **Plan**: `test-plans/HCM/eLeave/hourly-leave-form.md` (split from `hourly-leave.md` on 2026-10-07; TC numbers are unchanged)
- **Failing TCs**: `TC-03` (non-blocking); `TC-04 row e` was a false alarm (issue 3) — found while recording the spec on QA (2026-10-07) and confirmed on every run that day
- **Suspected category**: business-logic
- **Azure DevOps**: issue 3 → #117807, issue 4 → #117808, issue 5 → #117809 (all related to Feature #100661). Issues 1 and 2 are in [2026-10-07-hourly-leave-lifecycle.md](2026-10-07-hourly-leave-lifecycle.md)

## 3. Lunch-only request shows the wrong message (TC-04 row e) — NOT A BUG
> **Update 2026-10-07:** confirmed with QA — a setting stops users applying for weekends, and it rejects any request with no working hours in it (including lunch only) with the weekend/public-holiday message. That message is the expected one; the plan now expects it for rows c and e, and row e is blocking again. ADO #117807 can be closed.

- **Expected**: 12–13 → "The selected time falls entirely within the lunch break and contains no leave hours. Please select a period outside the lunch break."
- **Actual**: "Please make sure that the hours entered are working hours. The selected period contains only weekends or public holidays." Row c (06–08) also shows this weekend message in addition to the working-hours message.
- **Re-confirmed 2026-10-07 (full run after merging main):** TC-04 fails at row e with the same weekend message. `main` now has commit `d9b7001b` ("lunch hour validation message"); QA probably isn't running that build yet. Row e is non-blocking until it's deployed; make it blocking again afterwards.

## 4. Possible missing public-holiday check (TC-04 row g, not in the spec)
- 16/12/2026 (Wednesday, Day of Reconciliation) 09–11 was accepted and submitted as `LA2026/13782` (cancelled afterwards). Either QA's holiday calendar doesn't have 16 Dec, or "You cannot apply for hourly leave on a public holiday." isn't enforced. Check the QA calendar first.

## 5. Display gaps (non-blocking)
- **TC-03**: a whole-work-day request (08–16) shows no "1 day" hint — only the Available days alert.
- The Recommend Leave view part of #117809 is in the lifecycle bug log.

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
