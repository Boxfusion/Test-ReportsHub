# Bug: New Leave Application Submit fails validation despite a fully-completed form

- **Plan**: `test-plans/eLeaveSmokeTest/application-for-leave.md`
- **Failing TC**: TC-10 / TC-11 (seeded submit flow, `SEED_SUBMIT=1`)
- **Step**: Fill all required fields (Category, Sub-Category, Duration=Days, Start/End Date, Address) + tick certification → click Submit
- **Expected**: Submit routes the application and the 'Delegate' modal appears (then 'Don't Delegate' returns to My Items).
- **Actual**: Submit shows *"The following errors were detected during validation"* and falsely flags **Sub-Category** and **Duration** as invalid; the Delegate modal never appears. The DOM confirms the values ARE set (`Sub-Category = Annual Leave`, `Duration = Days`, dates + Address populated, Submit enabled), so the rejection is incorrect.
- **Suspected category**: `business-logic`
- **Evidence**:
  - Verified live via DOM at submit time: exactly one Category/Sub-Category/Duration field, all with correct values, Submit enabled — yet Submit fails validation.
  - The flow **did** succeed once on a clean form load (application `LA2026/12385` was submitted end-to-end: Submit → Delegate modal → Don't Delegate → My Items), proving the path is valid and the failure is intermittent.
  - The form throws 100+ `executeScriptSync error TypeError: Cannot read properties of undefined` console errors on load (same defect as the removed recommend/approve TC-09 — `leaveType`, `isAccumulatedLeave`, etc.). The Submit-time validation appears to read this un-populated model rather than the bound UI values.
  - The form also intermittently renders **duplicate toolbars** (4 "Submit" buttons; 2 `display:none`), consistent with a re-render race.
- **Suspected cause**: A load-order / re-render race: the form's `executeScriptSync` field-binding scripts fail (undefined reads), so the validation model is not populated even though the UI controls show valid values. Submit then validates the empty model and rejects Sub-Category/Duration. Null-guards + ensuring the model binds before enabling Submit would fix both this and the console-error defect.
- **Repro reliability**: Intermittent — succeeds on a clean single-render load, fails when the form re-renders/duplicates. The seeded tests (`SEED_SUBMIT=1`) reproduce the failure most of the time on the current QA build.
