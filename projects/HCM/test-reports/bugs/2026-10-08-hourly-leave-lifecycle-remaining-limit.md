# Bug: Full-day hourly request skips the remaining-hours limit and becomes a 1-day leave

- **Plan**: `test-plans/HCM/eLeave/hourly-leave-lifecycle.md`
- **Failing TC**: `TC-05 — Remaining hours: note, limit and hourly leave B`
- **Step**: `STEP 3: SELECT a Start/End longer than {remaining} inside the work day, Submit`
- **Expected**: "Leave duration should not be more than 6 hours." is shown and nothing is submitted
- **Actual**: No validation error. The Delegate pop-up opened and the request was saved as **LA2026/13908**, "1 day Annual Leaves … from Mon 16 Nov 26 to Mon 16 Nov 26", In Progress
- **Suspected category**: business-logic (regression since 2026-10-07)
- **ADO**: [#117888](https://dev.azure.com/boxfusion/pd-Hcm/_workitems/edit/117888)

## Steps / data

1. GOV005 has hourly leave A **LA2026/13904** (2 hours, 24/11/2026, Hourly Parked).
2. New Leave Application › Annual Leaves › **Hours**, Date 16/11/2026. The note says: "You have applied for 2 hours of leave before. You have 6 hours left to reach a full day (8 hours)."
3. Start Time `08`, End Time `16`, Address, certify, **Submit**.

On GOV005's calendar (08:00–16:00, lunch excluded) 08–16 is the whole working day, which is more than the 6 hours left. Instead of being refused, the request was turned into a 1-day leave. The 2 parked hours of A were ignored, so A + this request add up to more than one day.

## Regression evidence

The same spec passed TC-05 for GOV005 on 2026-10-07 (`test-reports/2026-10-07/hourly-leave-lifecycle.md`). That day 08–16 was refused with the "should not be more than" message. B was then 08–15 (6 working hours) and TC-08 charged 120 + 360 = 480 minutes for the day.

## Playwright error

```
Error: expect(locator).toContainText(expected) failed
Locator: locator('.markdown-body').filter({ hasText: 'The following errors were detected during validation.' }).first()
Expected substring: "Leave duration should not be more than 6 hours."
Error: element(s) not found
  at hourly-leave-lifecycle.spec.ts:437
```

## Snapshot / screenshot

`test-results/artifacts/HCM-eLeave-hourly-leave-li-017c9-te-limit-and-hourly-leave-B-chromium/` (`test-failed-1.png` shows the Delegate pop-up, `trace.zip`, `video.webm`)

## Suspected cause

The remaining-hours check is skipped when the hourly request covers a full working day, probably because such a request is converted to a 1-day leave before the hourly validation runs. Check recent changes to the hourly-leave validation and duration conversion. GOV005's `GetMyLeaveBalance` also returned HTTP 500 earlier today ([2026-10-08-hourly-leave-lifecycle.md](2026-10-08-hourly-leave-lifecycle.md)), which suggests a QA deployment happened this morning.

## Left on QA

LA2026/13908 (1 day, In Progress) and LA2026/13904 (2 hours, Hourly Parked) were left on GOV005 on purpose. 13904 becomes `{prior}` = 2 hours on the next run.
