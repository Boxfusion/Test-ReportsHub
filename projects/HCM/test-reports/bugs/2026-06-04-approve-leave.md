# Bug: Approve leave detail throws `Cannot read properties of undefined` console errors on load

- **Plan**: `test-plans/eLeaveSmokeTest/approve-leave.md`
- **Failing TC**: TC-09 — Leave application form fields load without JS errors (ADO #102029)
- **Step**: `SNAPSHOT Open the leave application and check the console for errors`
- **Expected**: Console is clean — no JS errors on opening a leave application detail.
- **Actual**: Multiple console errors fire on form load: `executeScriptSync error TypeError: Cannot read properties of undefined (reading '<field>')` for `typeOfVerification`, `consentForm`, `leaveType`, `isAccumulatedLeave`, `notes`, `applicantComment`, `fileList`.
- **Suspected category**: `business-logic`
- **Playwright error**:
  ```
  expect(received).toHaveLength(expected)
  Expected length: 0
  Received length: >0
  executeScriptSync error TypeError: Cannot read properties of undefined (reading 'typeOfVerification')
      at ia (https://pd-hcm-adminportal-qa.shesha.app/_next/static/chunks/fd9d1056-f663fedf02e529ac.js:1:95165)
  ```
- **Snapshot / screenshot**: `test-results/artifacts/` (Playwright writes one on failure for TC-09).
- **Suspected cause**: Same load-order race as the recommend form (see `2026-06-04-recommend-leave.md`). Form scripts (executeScriptSync) on `SaGov.Leave/sagov-approve-leave-application v66` run before the data model is populated and dereference `undefined`. Null-guards / optional chaining required. Errors are non-fatal but pollute the console (ADO #102029).
