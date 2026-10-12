# Bug: 'Add a New Public Holiday' OK button hangs if clicked before the dialog finishes loading

- **Plan**: `test-plans/HCM/eLeave/Holiday-calender.md`
- **Failing TC**: `TC-06 — A holiday can't be saved without a Name and a Date` (intermittent)
- **Step**: `STEP 2: Leave Name and Date empty and CLICK OK`
- **Expected**: "This field is required" is shown under both **Name** and **Date**
- **Actual**: OK button switches to a loading spinner and stays there indefinitely; no validation messages, no `PublicHoliday/Crud/Create` request. The dialog has to be cancelled.
- **Suspected category**: business-logic
- **Reproduction rate**: 2 of 3 runs when OK is clicked immediately after the dialog opens; 0 of 12 when OK is clicked after the dialog's network activity settles (~2s).

## Playwright error
```
expect(locator).toBeVisible() failed
Locator: getByRole('dialog', { name: 'Add a New Public Holiday' }).locator('.ant-form-item')
  .filter({ has: locator('label').filter({ hasText: /^Name/ }) }).getByText('This field is required')
Expected: visible
Timeout: 10000ms
Error: element(s) not found
  at Holiday-calender.spec.ts:200
```

## Snapshot / screenshot
`test-results/artifacts/HCM-eLeave-Holiday-calende-8aee4-d-without-a-Name-and-a-Date-chromium/test-failed-1.png` (OK button stuck on spinner, fields empty, no validation text)

## Suspected cause
The OK/submit handler runs while the dialog form (`FormConfiguration/GetByName?name=sagov-add-public-holiday` + `Entities/GetAll?entityType=...PublicHoliday`) is still initialising; validation never resolves, so the button's loading state is never cleared.

## Also seen in TC-07
`TC-07 — 'OK' adds the holiday` (Name + Date filled, OK clicked ~1s after the dialog opened): the dialog showed **"Saving data..."** with OK spinning and no `PublicHoliday/Crud/Create` response within 15s (`page.waitForResponse: Timeout 15000ms exceeded`). Screenshot: `test-results/artifacts/HCM-eLeave-Holiday-calende-a8448--returns-to-Public-Holidays-chromium/test-failed-1.png`. Passed after the same settle wait + 60s response timeout (the QA API was also slow at the time, so a slow Create can't be fully ruled out).

## Test workaround
`Holiday-calender.spec.ts` TC-06 STEP 2 waits 2.5s after the dialog opens before clicking OK, so the plan's validation assertions can be checked. Remove the wait once the app is fixed.
