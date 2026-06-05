# Bug: Recommend/Approve leave detail throws `Cannot read properties of undefined` console errors on load

- **Plan**: `test-plans/eLeaveSmokeTest/recommend-leave.md`
- **Failing TC**: TC-09 — Leave application form fields load without JS errors (ADO #101980)
- **Step**: `SNAPSHOT Open the leave application and check the console for errors`
- **Expected**: Console is clean — no JS errors on opening a leave application detail.
- **Actual**: 17 console errors fire on form load: `executeScriptSync error TypeError: Cannot read properties of undefined (reading '<field>')` for `typeOfVerification`, `consentForm`, `leaveType`, `isAccumulatedLeave`, `notes`, `applicantComment`, `fileList`.
- **Suspected category**: `business-logic`
- **Playwright error**:
  ```
  expect(received).toHaveLength(expected)
  Expected length: 0
  Received length: 17
  executeScriptSync error TypeError: Cannot read properties of undefined (reading 'typeOfVerification')
      at ia (https://pd-hcm-adminportal-qa.shesha.app/_next/static/chunks/fd9d1056-f663fedf02e529ac.js:1:95165)
  ... (and 16 more for consentForm, leaveType, isAccumulatedLeave x2, notes, applicantComment, leaveType x2, fileList, ...)
  ```
- **Snapshot / screenshot**: `test-results/artifacts/` (Playwright writes one on failure for TC-09).
- **Suspected cause**: Form scripts (executeScriptSync) run before the leave-application data model is populated, so they dereference `undefined`. Null-guards / optional chaining are required on the recommend (`SaGov.Leave/sagov-recommend-leave-application v62`) and approve (`SaGov.Leave/sagov-approve-leave-application v66`) forms. This is the same defect recorded in ADO #101980 / #102029. The errors are non-fatal (the form still renders and the workflow is operable), but they pollute the console and indicate a load-order race.
