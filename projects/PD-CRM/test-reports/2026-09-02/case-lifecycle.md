# Report: Test Plan: Case Lifecycle
**Date:** 2026-09-02 09:26 UTC
**Plan:** test-plans/case-management/case-lifecycle.md
**Spec:** test-plans/case-management/case-lifecycle.spec.ts
**Execution Mode:** playwright-script (failures pending AI-repair)
**Result:** PARTIAL
**Duration:** 4954.1s

## Summary
| Total Steps | Passed | Failed | Skipped |
|-------------|--------|--------|---------|
| 27 | 14 | 12 | 1 |

## Step Results
### TC-01 (#112773): Verify Created Case Is Displayed in the Cases List
**Mode:** playwright-script
**Duration:** 134.9s
- [PASS] TC-01 (#112773): Verify Created Case Is Displayed in the Cases List

### TC-02 (#112774): Verify Case Details Are Displayed Correctly
**Mode:** playwright-script
**Duration:** 51.9s
- [PASS] TC-02 (#112774): Verify Case Details Are Displayed Correctly

### TC-03 (#112775): Verify Case Can Be Searched Using Case Reference Number
**Mode:** playwright-script
**Duration:** 45.9s
- [PASS] TC-03 (#112775): Verify Case Can Be Searched Using Case Reference Number

### TC-04 (#112776): Verify Case Can Be Assigned to an Agent
**Mode:** playwright-script
**Duration:** 140.7s
- [PASS] TC-04 (#112776): Verify Case Can Be Assigned to an Agent

### TC-05 (#112777): Verify Case Can Be Assigned to a Group of Agents
**Mode:** playwright-script
**Duration:** 163.6s
- [PASS] TC-05 (#112777): Verify Case Can Be Assigned to a Group of Agents

### TC-06 (#112778): Verify Agent Can Pick Up a Case Assigned to Another Agent
**Mode:** playwright-script
**Duration:** 0.4s
- [SKIP] TC-06 (#112778): Verify Agent Can Pick Up a Case Assigned to Another Agent

### TC-07 (#112779): Verify Cases Can Be Merged as Related Cases
**Mode:** playwright-script
**Duration:** 308.0s
- [FAIL] TC-07 (#112779): Verify Cases Can Be Merged as Related Cases

**Error:**
```
Error: the list should filter down to "REF003/02/09/2026" (was 1609 items)

the list should filter down to "REF003/02/09/2026" (was 1609 items)

[2mexpect([22m[31mreceived[39m[2m).[22mnot[2m.[22mtoBe[2m([22m[32mexpected[39m[2m) // Object.is equality[22m

Expected: not [32m1609[39m

Call Log:
- Test timeout of 300000ms exceeded

   95 |       message: `the list should filter down to "${term}" (was ${totalBefore} items)`,
   96 |     })
>  97 |     .not.toBe(totalBefore);
      |          ^
   98 |   await page.waitForTimeout(1_500);
   99 | }
  100 |
    at searchCases (C:\Users\NomfaneloNhleko\OneDrive\Test-ReportsHub\projects\PD-CRM\test-plans\case-management\case-lifecycle.spec.ts:97:10)
    at openDetails (C:\Users\NomfaneloNhleko\OneDrive\Test-ReportsHub\projects\PD-CRM\test-plans\case-management\case-lifecycle.spec.ts:227:3)
    at C:\Users\NomfaneloNhleko\OneDrive\Test-ReportsHub\projects\PD-CRM\test-plans\case-management\case-lifecycle.spec.ts:630:5
```
**Location:** C:\Users\NomfaneloNhleko\OneDrive\Test-ReportsHub\projects\PD-CRM\test-plans\case-management\case-lifecycle.spec.ts:97:10

### TC-08 (#112780): Verify Cases Can Be Merged as Single Cases
**Mode:** playwright-script
**Duration:** 307.4s
- [FAIL] TC-08 (#112780): Verify Cases Can Be Merged as Single Cases

**Error:**
```
[31mTest timeout of 300000ms exceeded.[39m
```

### TC-09 (#112781): Verify Related Case(s) Panel Is Displayed for a Merged Case
**Mode:** playwright-script
**Duration:** 286.7s
- [PASS] TC-09 (#112781): Verify Related Case(s) Panel Is Displayed for a Merged Case

### TC-10 (#112782): Verify Notifications Are Sent to the Correct Case After Single Case Merge
**Mode:** playwright-script
**Duration:** 327.1s
- [FAIL] TC-10 (#112782): Verify Notifications Are Sent to the Correct Case After Single Case Merge

**Error:**
```
[31mTest timeout of 300000ms exceeded.[39m
```

### TC-11 (#112783): Verify Notifications Are Sent to Both Cases After Related Case Merge
**Mode:** playwright-script
**Duration:** 322.7s
- [FAIL] TC-11 (#112783): Verify Notifications Are Sent to Both Cases After Related Case Merge

**Error:**
```
[31mTest timeout of 300000ms exceeded.[39m
```

### TC-12 (#112784): Verify Case Can Be Closed
**Mode:** playwright-script
**Duration:** 113.0s
- [PASS] TC-12 (#112784): Verify Case Can Be Closed

### TC-13 (#112785): Verify Case Closure Is Cancelled When No Is Selected
**Mode:** playwright-script
**Duration:** 222.5s
- [FAIL] TC-13 (#112785): Verify Case Closure Is Cancelled When No Is Selected

**Error:**
```
Error: No "QAAuto" case could be brought to IN PROGRESS. Confirmed statuses: REF009/02/09/2026=CLOSED/Close:no, REF007/02/09/2026=MERGED/Close:no, REF006/02/09/2026=MERGED/Close:no, REF005/02/09/2026=MERGED/Close:no, REF004/02/09/2026=CLOSED/Close:no, REF003/02/09/2026=MERGED/Close:no, REF002/02/09/2026=MERGED/Close:no, REF001/02/09/2026=MERGED/Close:no. Merges and closures leave cases in terminal states, so the pool may need topping up.

  210 |     // A NEW subject cannot be manufactured from a terminal case — move on to the next candidate.
  211 |   }
> 212 |   throw new Error(
      |         ^
  213 |     `No "${POOL_SEARCH}" case could be brought to ${target}. Confirmed statuses: ${tried.join(', ')}. ` +
  214 |     `Merges and closures leave cases in terminal states, so the pool may need topping up.`);
  215 | }
    at caseWithStatus (C:\Users\NomfaneloNhleko\OneDrive\Test-ReportsHub\projects\PD-CRM\test-plans\case-management\case-lifecycle.spec.ts:212:9)
    at C:\Users\NomfaneloNhleko\OneDrive\Test-ReportsHub\projects\PD-CRM\test-plans\case-management\case-lifecycle.spec.ts:750:17
```
**Location:** C:\Users\NomfaneloNhleko\OneDrive\Test-ReportsHub\projects\PD-CRM\test-plans\case-management\case-lifecycle.spec.ts:212:9

### TC-14 (#112786): Verify Closed Case Can Be Reopened
**Mode:** playwright-script
**Duration:** 136.1s
- [FAIL] TC-14 (#112786): Verify Closed Case Can Be Reopened

**Error:**
```
Error: ADO #112786 step 7 requires CLOSED -> OPEN

ADO #112786 step 7 requires CLOSED -> OPEN

[2mexpect([22m[31mreceived[39m[2m).[22mtoBe[2m([22m[32mexpected[39m[2m) // Object.is equality[22m

Expected: [32m"OPEN"[39m
Received: [31m"NEW"[39m

Call Log:
- Timeout 45000ms exceeded while waiting on the predicate

  793 |     await expect
  794 |       .poll(() => detailsStatus(page), { timeout: 45_000, message: 'ADO #112786 step 7 requires CLOSED -> OPEN' })
> 795 |       .toBe('OPEN');
      |        ^
  796 |
  797 |     // STEP 8: ReOpen is no longer available
  798 |     expect((await visibleActions(page)).join(' | '), 'ReOpen should be withdrawn once reopened')
    at C:\Users\NomfaneloNhleko\OneDrive\Test-ReportsHub\projects\PD-CRM\test-plans\case-management\case-lifecycle.spec.ts:795:8
```
**Location:** C:\Users\NomfaneloNhleko\OneDrive\Test-ReportsHub\projects\PD-CRM\test-plans\case-management\case-lifecycle.spec.ts:795:8

### TC-15 (#112787): Verify Case Reopening Is Cancelled When No Is Selected
**Mode:** playwright-script
**Duration:** 84.6s
- [PASS] TC-15 (#112787): Verify Case Reopening Is Cancelled When No Is Selected

### TC-16 (#112788): Verify Case Can Be Marked as In Progress
**Mode:** playwright-script
**Duration:** 83.1s
- [PASS] TC-16 (#112788): Verify Case Can Be Marked as In Progress

### TC-17 (#112789): Verify Case Is Not Marked as In Progress When No Is Selected
**Mode:** playwright-script
**Duration:** 139.8s
- [PASS] TC-17 (#112789): Verify Case Is Not Marked as In Progress When No Is Selected

### TC-18 (#112790): Verify Email Can Be Sent from Case Details
**Mode:** playwright-script
**Duration:** 182.5s
- [FAIL] TC-18 (#112790): Verify Email Can Be Sent from Case Details

**Error:**
```
Error: the sent email should be recorded in the case Timeline

[2mexpect([22m[31mreceived[39m[2m).[22mtoContain[2m([22m[32mexpected[39m[2m) // indexOf[22m

Expected substring: [32m"QA-LIFE REF005/01/09/2026 — TC-18 email "[39m
Received string:    [31m"Timeline Send Email Send SMS Add Notes Boxfusion.ServiceManagement/TimeLine-item-picker v7 LIVE ... From Lebos Lebos 01/09/2026 13:03:31 Hi QAAuto793509 Tester, Kindly note that the case you have reported was successfully submitted and has been assigned to the relevant department/unit responsible for resolution. Your Reference No : REF005/01/09/2026"[39m

  895 |     const tl = await timelineText(page);
  896 |     console.log(`TC-18 ${ref} timeline after send:\n${tl}`);
> 897 |     expect(tl, 'the sent email should be recorded in the case Timeline').toContain(message.slice(0, 40));
      |                                                                          ^
  898 |
  899 |     // STEP 9: MANUAL — confirm receipt.
  900 |     console.log(recipient
    at C:\Users\NomfaneloNhleko\OneDrive\Test-ReportsHub\projects\PD-CRM\test-plans\case-management\case-lifecycle.spec.ts:897:74
```
**Location:** C:\Users\NomfaneloNhleko\OneDrive\Test-ReportsHub\projects\PD-CRM\test-plans\case-management\case-lifecycle.spec.ts:897:74

### TC-19 (#112791): Verify CC Email Address Can Be Added
**Mode:** playwright-script
**Duration:** 182.2s
- [FAIL] TC-19 (#112791): Verify CC Email Address Can Be Added

**Error:**
```
Error: the email should be recorded in the Timeline

[2mexpect([22m[31mreceived[39m[2m).[22mtoContain[2m([22m[32mexpected[39m[2m) // indexOf[22m

Expected substring: [32m"QA-LIFE REF005/01/09/2026 — TC-19 email "[39m
Received string:    [31m"Timeline Send Email Send SMS Add Notes Boxfusion.ServiceManagement/TimeLine-item-picker v7 LIVE ... From Lebos Lebos 01/09/2026 13:03:31 Hi QAAuto793509 Tester, Kindly note that the case you have reported was successfully submitted and has been assigned to the relevant department/unit responsible for resolution. Your Reference No : REF005/01/09/2026"[39m

  927 |     const tl = await timelineText(page);
  928 |     console.log(`TC-19 ${ref} timeline:\n${tl}`);
> 929 |     expect(tl, 'the email should be recorded in the Timeline').toContain(message.slice(0, 40));
      |                                                                ^
  930 |
  931 |     // STEP 8-9: MANUAL — confirm both the primary and CC recipient received it.
  932 |     console.log(`TC-19 MANUAL CHECK: primary + cc (${ccAddress}) for ${ref}`);
    at C:\Users\NomfaneloNhleko\OneDrive\Test-ReportsHub\projects\PD-CRM\test-plans\case-management\case-lifecycle.spec.ts:929:64
```
**Location:** C:\Users\NomfaneloNhleko\OneDrive\Test-ReportsHub\projects\PD-CRM\test-plans\case-management\case-lifecycle.spec.ts:929:64

### TC-20 (#112792): Verify Email Attachment Can Be Uploaded
**Mode:** playwright-script
**Duration:** 177.0s
- [PASS] TC-20 (#112792): Verify Email Attachment Can Be Uploaded

### TC-21 (#112793): Verify Email Can Be Sent with CC Recipient and Attachment
**Mode:** playwright-script
**Duration:** 251.7s
- [PASS] TC-21 (#112793): Verify Email Can Be Sent with CC Recipient and Attachment

### TC-22 (#112794): Verify SMS Can Be Sent from Case Details Timeline
**Mode:** playwright-script
**Duration:** 207.4s
- [FAIL] TC-22 (#112794): Verify SMS Can Be Sent from Case Details Timeline

**Error:**
```
Error: the SMS should be recorded against the case

[2mexpect([22m[31mreceived[39m[2m).[22mtoContain[2m([22m[32mexpected[39m[2m) // indexOf[22m

Expected substring: [32m"QA-LIFE REF005/01/09/2026 — TC-22 SMS fr"[39m
Received string:    [31m"Timeline Send Email Send SMS Add Notes Boxfusion.ServiceManagement/TimeLine-item-picker v7 LIVE ... From Lebos Lebos 01/09/2026 13:03:31 Hi QAAuto793509 Tester, Kindly note that the case you have reported was successfully submitted and has been assigned to the relevant department/unit responsible for resolution. Your Reference No : REF005/01/09/2026"[39m

  1035 |     const tl = await timelineText(page);
  1036 |     console.log(`TC-22 ${ref} timeline after SMS:\n${tl}`);
> 1037 |     expect(tl, 'the SMS should be recorded against the case').toContain(message.slice(0, 40));
       |                                                               ^
  1038 |
  1039 |     // STEP 9: MANUAL — confirm receipt on the handset.
  1040 |     console.log(mobile
    at C:\Users\NomfaneloNhleko\OneDrive\Test-ReportsHub\projects\PD-CRM\test-plans\case-management\case-lifecycle.spec.ts:1037:63
```
**Location:** C:\Users\NomfaneloNhleko\OneDrive\Test-ReportsHub\projects\PD-CRM\test-plans\case-management\case-lifecycle.spec.ts:1037:63

### TC-23 (#112795): Verify Case Details Can Be Edited and Saved
**Mode:** playwright-script
**Duration:** 192.9s
- [FAIL] TC-23 (#112795): Verify Case Details Can Be Edited and Saved

**Error:**
```
Error: the updated value should be displayed

[2mexpect([22m[31mlocator[39m[2m).[22mtoContainText[2m([22m[32mexpected[39m[2m)[22m failed

Locator: locator('body')
Expected substring: [32m"Edited423280"[39m
Received string:    [31m"CasesAll CasesEventsFAQContactsFacilitiesCustomersBroadcast NotificationAmbulance RequestsCase MappingContent Item TypesManage Content LibrariesPublic LibrariesDashBoardsChat ConsoleReportsAdministrationConfigurationsedit-reported-userSocial MediaShesha/header v10LiveLast Callclearlink to caseOfflineLoginLive ModeLiveLebos Lebos  Boxfusion.ServiceManagement/case-request-details v10LiveCase Details: REF005/01/09/2026: Area Power FailureNewBackPick UpAssignMark In ProgressMergeCancelCancel Form EditSaveTurn On AI AssistantTimelineSend EmailSend SMSAdd NotesBoxfusion.ServiceManagement/TimeLine-item-picker v7Live......FromLebos Lebos01/09/2026 13:03:31Hi QAAuto793509 Tester, Kindly note that the case you have reported was successfully submitted and has been assigned to the relevant department/unit responsible for resolution. Your Reference No : REF005/01/09/2026ReplyReply Uploaded MediaRelated Case(s)Case OverviewCase Details EscalationSalesStatusOpenReported ByCall CentrePriorityMediumPriorityMediumCategoryElectricalCase TypeArea Power FailureAddressDescriptionAssigned To  GroupPMU-2Assigned ToMoshadi MothibaAssigned ToNo Agent/Group AssignedLatitudeLongitudeCustomer OverviewCustomer Information Boxfusion.ServiceManagement/edit-reported-
```
**Location:** C:\Users\NomfaneloNhleko\OneDrive\Test-ReportsHub\projects\PD-CRM\test-plans\case-management\case-lifecycle.spec.ts:1068:8

### TC-24 (#112796): Verify Case Category and Case Type Can Be Updated
**Mode:** playwright-script
**Duration:** 171.5s
- [PASS] TC-24 (#112796): Verify Case Category and Case Type Can Be Updated

### TC-25 (#112797): Verify Case Description Can Be Updated
**Mode:** playwright-script
**Duration:** 187.7s
- [FAIL] TC-25 (#112797): Verify Case Description Can Be Updated

**Error:**
```
Error: the updated description should display

[2mexpect([22m[31mlocator[39m[2m).[22mtoContainText[2m([22m[32mexpected[39m[2m)[22m failed

Locator: locator('body')
Expected substring: [32m"QA-LIFE REF005/01/09/2026 — description updated 786377"[39m
Received string:    [31m"CasesAll CasesEventsFAQContactsFacilitiesCustomersBroadcast NotificationAmbulance RequestsCase MappingContent Item TypesManage Content LibrariesPublic LibrariesDashBoardsChat ConsoleReportsAdministrationConfigurationsedit-reported-userSocial MediaShesha/header v10LiveLast Callclearlink to caseOfflineLoginLive ModeLiveLebos Lebos  Boxfusion.ServiceManagement/case-request-details v10LiveCase Details: REF005/01/09/2026: Burst PipeNewBackPick UpAssignMark In ProgressMergeCancelCancel Form EditSaveTurn On AI AssistantTimelineSend EmailSend SMSAdd NotesBoxfusion.ServiceManagement/TimeLine-item-picker v7Live......FromLebos Lebos01/09/2026 13:03:31Hi QAAuto793509 Tester, Kindly note that the case you have reported was successfully submitted and has been assigned to the relevant department/unit responsible for resolution. Your Reference No : REF005/01/09/2026ReplyReply Uploaded MediaRelated Case(s)Case OverviewCase Details EscalationLevel 1StatusOpenReported ByCall CentrePriorityHighPriorityHighCategoryWaterCase TypeBurst PipeAddressDescriptionAssigned To  GroupPMU-2Assigned ToMoshadi MothibaAssigned ToNo Agent/Group AssignedLatitudeLongitudeCustomer OverviewCustomer Information Boxfusion.ServiceManag
```
**Location:** C:\Users\NomfaneloNhleko\OneDrive\Test-ReportsHub\projects\PD-CRM\test-plans\case-management\case-lifecycle.spec.ts:1136:8

### TC-26 (#112798): Verify Customer Details Can Be Updated
**Mode:** playwright-script
**Duration:** 193.8s
- [FAIL] TC-26 (#112798): Verify Customer Details Can Be Updated

**Error:**
```
Error: the updated customer name should display

[2mexpect([22m[31mlocator[39m[2m).[22mtoContainText[2m([22m[32mexpected[39m[2m)[22m failed

Locator: locator('body')
Expected substring: [32m"QAUpd983264"[39m
Received string:    [31m"CasesAll CasesEventsFAQContactsFacilitiesCustomersBroadcast NotificationAmbulance RequestsCase MappingContent Item TypesManage Content LibrariesPublic LibrariesDashBoardsChat ConsoleReportsAdministrationConfigurationsedit-reported-userSocial MediaShesha/header v10LiveLast Callclearlink to caseOfflineLoginLive ModeLiveLebos Lebos  Boxfusion.ServiceManagement/case-request-details v10LiveCase Details: REF004/01/09/2026: Area Power FailureNewBackPick UpAssignMark In ProgressMergeCancelCancel Form EditSaveTurn On AI AssistantTimelineSend EmailSend SMSAdd NotesBoxfusion.ServiceManagement/TimeLine-item-picker v7Live......FromLebos Lebos01/09/2026 13:03:03Hi QAAuto765713 Tester, Kindly note that the case you have reported was successfully submitted and has been assigned to the relevant department/unit responsible for resolution. Your Reference No : REF004/01/09/2026ReplyReply Uploaded MediaRelated Case(s)Case OverviewCase Details EscalationLevel 2StatusOpenReported ByCall CentrePriorityMediumPriorityMediumCategoryElectricalCase TypeArea Power FailureAddressDescriptionAssigned To  GroupPMU-2Assigned ToMoshadi MothibaAssigned ToNo Agent/Group AssignedLatitudeLongitudeCustomer OverviewCustomer Information Boxfusion.ServiceManagement/edit-repor
```
**Location:** C:\Users\NomfaneloNhleko\OneDrive\Test-ReportsHub\projects\PD-CRM\test-plans\case-management\case-lifecycle.spec.ts:1167:8

### TC-27 (#112799): Verify Case Edit Can Be Cancelled Using Cancel Form Edit
**Mode:** playwright-script
**Duration:** 166.1s
- [PASS] TC-27 (#112799): Verify Case Edit Can Be Cancelled Using Cancel Form Edit
