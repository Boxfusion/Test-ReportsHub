# Bug: Acknowledge Leave without pay — Submit can hang on "Submitting..." with no error shown

- **ADO Bug**: [#117784](https://dev.azure.com/boxfusion/pd-Hcm/_workitems/edit/117784) — assigned to Tiyiselani Makhuvele

Two related defects seen on LA2026/13702 (Thabo Musa Victor Mthembu, Annual Leaves › Unpaid Leave Authorized, backdated 11/09/2026, 1 day). In both, the form was fully filled (Submit to PERSAL, HR Comments, declaration ticked, Submit enabled), the button spun on "Submitting..." indefinitely, **no error was shown to the user**, and the item stayed in admin's Inbox. The final run of the plan passed (13702 via Interface to PERSAL, 13698 via Process manually), so both are intermittent / state-dependent rather than a hard block.

## 1. Interface to PERSAL — UserTaskComplete intermittently never returns

- **Plan**: `test-plans/HCM/eLeave/acknowledge-leave-approved-without-pay.md`
- **Failing TC**: `TC-02 — Acknowledge leave without pay and submit via Interface to PERSAL`
- **Step**: `STEP 17: CLICK the Submit button`
- **Expected**: The leave application is successfully submitted ("Successfully Submitted", item leaves the Inbox)
- **Actual**: `saveTransactionParts` → 200, then `POST /api/services/SheshaWorkflow/Process/UserTaskComplete` got **no response** within 30s. Item still in Inbox afterwards. A later run submitted the same item successfully.
- **Suspected category**: infra
- **Network (from trace)**:
  ```
  POST 200  /api/services/Leave/LeaveCalendar/computeTransactionDates
  POST 200  /api/services/SaGovLeave/SaGovLeaveRequest/saveTransactionParts
  POST  --  /api/services/SheshaWorkflow/Process/UserTaskComplete   (no response)
  ```
- **Suspected cause**: slow/stalled PERSAL interface call behind UserTaskComplete on QA; the frontend has no timeout or error feedback.

**Re-occurrence (chained run, same day) — not backdated-specific**

LA2026/13696 (**future-dated** 14/12/2026) via Interface to PERSAL: this time `saveTransactionParts` itself never returned (no response at 30s), so UserTaskComplete was never reached. The same session's TC-02 had just submitted LA2026/13732 (backdated 25/09/2026) successfully. Together with the 13702 occurrences, the hang is intermittent across both backdated and future-dated leave, and hits whichever submit request is in flight, so the "backdated leave" theory above is unlikely. QA was also slow to respond throughout (cold front end ~10–18s, one connection time-out, blank pages).

```
POST 200  2312ms  /api/services/Leave/LeaveCalendar/computeTransactionDates
POST  --          /api/services/SaGovLeave/SaGovLeaveRequest/saveTransactionParts   (no response)
```

**Re-occurrence with Process manually (fresh item)**

LA2026/13736 (backdated 07/08/2026, freshly approved without pay) via **Process manually**: `UserTaskComplete` got no response within 30s (no `saveTransactionParts` call on this path). A few minutes later the item no longer appeared in admin's Inbox, so the submit most likely completed after >30s, which points to a very slow UserTaskComplete on QA rather than a hard hang. Either way the user sees "Submitting..." with no feedback for a long time.

```
POST 200  3169ms  /api/services/app/Settings/GetUserValue
POST  --          /api/services/SheshaWorkflow/Process/UserTaskComplete   (no response at 30s)
```

## 2. Process manually after an interrupted Interface to PERSAL submit — 400 swallowed by the UI

- **Failing TC**: `TC-03 — Acknowledge leave without pay and submit via Process Manually`
- **Step**: `STEP 15: CLICK the Submit button`
- **Expected**: The leave application is successfully submitted
- **Actual**: run straight after defect 1 on the same item (13702). `saveTransactionParts` → **400**; `UserTaskComplete` never called; UI stuck on "Submitting..." with no message. Process manually on a fresh item (13698) submitted fine.
- **Suspected category**: business-logic
- **Request / response**:
  ```
  POST /api/services/SaGovLeave/SaGovLeaveRequest/saveTransactionParts
  {"leaveRequestId":"212d1626-0af3-489d-8820-4690b1f48175","transactionParts":[]}

  400 {"success":false,"error":{"message":"Your request is not valid!",
       "validationErrors":[{"message":"Transactions total days should be exactly 1 day(s), but you configured 0 day(s)","members":["transactions"]}]}}
  ```
- **Suspected cause**: transaction parts saved by the earlier Interface to PERSAL attempt leave the request in a state where the transactions-total-days rule is enforced for Process manually. Regardless of cause, the form must surface validation errors instead of spinning.

## Playwright error (both TCs)
```
Error: expect(locator).toBeVisible() failed
Locator: getByText('Successfully Submitted')
Expected: visible
Timeout: 30000ms
Error: element(s) not found
```

## Snapshot / screenshot
Artifacts from the failing attempts were overwritten by the final (passing) run; the request/response evidence above was taken from their traces before that.
