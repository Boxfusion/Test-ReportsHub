# Bug: Hourly leave form — lunch hour no longer excluded from the duration

- **Plan**: `test-plans/HCM/eLeave/hourly-leave-form.md`
- **Failing TC**: `TC-03 — Duration is calculated in hours and minutes, excluding lunch`
- **Step**: `STEP 3: SELECT Start Time 11, End Time 14 (spans lunch)`
- **Expected**: ASSERT (BLOCKING) the alert reads "Great! You have selected to take 2 hours off" (the 12:00–13:00 lunch hour is excluded)
- **Actual**: the alert reads "Great! You have selected to take **3 hours** off" for 11:00–14:00 on 24/11/2026 (Tue). Date, Start Time (`11`) and End Time (`14`) were all set correctly. The 09–11 request in STEP 2 still showed "2 hours off". It failed the same way on a second run with another random weekday.
- **Suspected category**: business-logic (regression: TC-03 passed on 2026-10-07)
- **ADO**: [#117889](https://dev.azure.com/boxfusion/pd-Hcm/_workitems/edit/117889) (related to Feature #100661 and #117888)
- **Impact**: TC-04 did not run (serial mode stops after a blocking failure in TC-03)

## Playwright error
```
expect(locator).toBeVisible() failed
Locator: getByText('Great! You have selected to take 2 hours off')
Expected: visible
Timeout: 10000ms
Error: element(s) not found
  at hourly-leave-form.spec.ts:243:82
```

## Snapshot / screenshot
Playwright wrote these to `test-results/artifacts/HCM-eLeave-hourly-leave-fo-cca93-and-minutes-excluding-lunch-chromium/`, but they were not kept after the run. In the first run's error-context snapshot, Date = `24/11/2026`, Start Time = `11`, End Time = `14`, and the alert read "Great! You have selected to take 3 hours off". The failure is also in the Allure report and `test-results/junit.xml`.

## Suspected cause
The lunch overlap is no longer deducted from the hourly duration. Possible causes: a new QA deployment changed the duration calculation, or the lunch break was removed from the applicant 12345678's work calendar on QA. Check 12345678's calendar first.

## Update 2026-10-08 ~07:30 UTC (re-runs)
- **Lunch exclusion (#117889) did not reproduce.** On the next runs and on a manual check, 11–14 on 24/11/2026 showed "2 hours off". It failed on 3 runs in a row and then passed with no change on our side. Either it is intermittent or QA was redeployed in between. Leave #117889 open for the dev to confirm.
- **New, non-blocking (TC-03 step 4): a whole work day is not treated as a day.** 08–16 on 24/11/2026 shows "Great! You have selected to take **7 hours** off" (8-hour day minus the 1-hour lunch) and no "1 day" hint. On 2026-10-07 no hours alert was shown for 08–16. This matches the full-day conversion problems in #117888 and #117805. Not logged on ADO yet.
- **Row e is not a bug:** 12–13 now shows "The selected time falls entirely within the lunch break and contains no leave hours. Please select a period outside the lunch break." This is commit d9b7001b, now deployed on QA. The plan and spec were updated to expect it (#117807).
