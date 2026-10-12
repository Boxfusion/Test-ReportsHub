# Bug: My Leave Balances fails with HTTP 500 for GOV005 ("Nullable object must have a value.")

- **Plan**: `test-plans/HCM/eLeave/hourly-leave-lifecycle.md`
- **Failing TC**: `TC-02 — Applicant submits hourly leave A (2 hours)`
- **Step**: `STEP 1: NAVIGATE to My Leave Balances and EXTRACT the Annual Leaves balance (B0) and reserved (R0)`
- **Expected**: My Leave Balances shows GOV005's Annual Leaves card ("N Annual Leaves Days +N reserved but not approved/synchronized")
- **Actual**: The page shows "Current Leave Balances — No Data. No data is available for this list". The API call behind it fails
- **Suspected category**: data
- **Update (2026-10-08, re-run ~09:00)**: Not reproduced. GOV005's balances loaded and TC-02 passed. Leaving this open for a dev to confirm the cause
- **Blocks**: TC-02 to TC-10. TC-02 stops at its first step, before anything is submitted, so the run created no leave

## Evidence

Logged in as GOV005 (Andrew Smith), opened `/dynamic/Shesha.Leave/my-leave-balances`:

```
GET https://pd-hcm-api-qa.shesha.app/api/services/Leave/LeaveBalance/GetMyLeaveBalance?maxResultCount=10&skipCount=0&properties=&quickSearch=&sorting=&filter=
500 {"result":null,"success":false,"error":{"code":0,"message":"An internal error occurred during your request!","details":"Nullable object must have a value."}}
```

The same call as **GOV003** returns 200 with balances (127.9506 Annual Leaves Days), so the failure is specific to GOV005's data.

## Playwright error

```
Error: expect(locator).toBeVisible() failed
Locator: getByText(/Annual Leaves Days/).first()
Expected: visible
Timeout: 30000ms
Error: element(s) not found
  at readAnnualBalance (hourly-leave-lifecycle.spec.ts:176:22)
```

## Snapshot / screenshot

`test-results/artifacts/HCM-eLeave-hourly-leave-li-6b93f-its-hourly-leave-A-2-hours--chromium/` (`test-failed-1.png`, `error-context.md`, `trace.zip`, `video.webm`)

## Suspected cause

`GetMyLeaveBalance` reads a nullable value (for example a cycle end date, an accrual setting or the leave profile's calendar) without checking for null. One of GOV005's leave cycle balances or profile records has that value empty. This may come from the accumulated / charged leave written by the 2026-10-07 runs, or from a QA data change since then. On GOV005, check the leave profile and the current-cycle `LeaveCycleBalance` rows for null fields.
