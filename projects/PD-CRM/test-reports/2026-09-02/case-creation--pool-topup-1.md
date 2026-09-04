# Report: Test Plan: Case Creation — pool-topup-1
**Date:** 2026-09-02 10:32 UTC
**Variant:** pool-topup-1
**Plan:** test-plans/case-management/case-creation.md
**Spec:** test-plans/case-management/case-creation.spec.ts
**Execution Mode:** playwright-script (failures pending AI-repair)
**Result:** PARTIAL
**Duration:** 512.0s

## Summary
| Total Steps | Passed | Failed | Skipped |
|-------------|--------|--------|---------|
| 16 | 15 | 1 | 0 |

## Step Results
### TC-01 (#112757): Verify successful case creation using valid details
**Mode:** playwright-script
**Duration:** 52.7s
- [PASS] TC-01 (#112757): Verify successful case creation using valid details

### TC-02 (#112758): Verify mandatory Channel validation
**Mode:** playwright-script
**Duration:** 28.0s
- [PASS] TC-02 (#112758): Verify mandatory Channel validation

### TC-03 (#112759): Verify mandatory Mobile Number validation
**Mode:** playwright-script
**Duration:** 31.7s
- [PASS] TC-03 (#112759): Verify mandatory Mobile Number validation

### TC-04 (#112760): Verify Mobile Number accepts a valid number starting with 0
**Mode:** playwright-script
**Duration:** 36.6s
- [PASS] TC-04 (#112760): Verify Mobile Number accepts a valid number starting with 0

### TC-05 (#112761): Verify Mobile Number rejects a number with a country code
**Mode:** playwright-script
**Duration:** 15.4s
- [PASS] TC-05 (#112761): Verify Mobile Number rejects a number with a country code

### TC-06 (#112762): Verify mandatory Email Address validation
**Mode:** playwright-script
**Duration:** 29.0s
- [PASS] TC-06 (#112762): Verify mandatory Email Address validation

### TC-07 (#112763): Verify mandatory Category validation
**Mode:** playwright-script
**Duration:** 26.3s
- [PASS] TC-07 (#112763): Verify mandatory Category validation

### TC-08 (#112764): Verify Case type cascades based on selected Category
**Mode:** playwright-script
**Duration:** 25.1s
- [PASS] TC-08 (#112764): Verify Case type cascades based on selected Category

### TC-09 (#112765): Verify mandatory Case type validation
**Mode:** playwright-script
**Duration:** 28.6s
- [PASS] TC-09 (#112765): Verify mandatory Case type validation

### TC-10 (#112766): Verify successful address selection using geolocation
**Mode:** playwright-script
**Duration:** 32.1s
- [PASS] TC-10 (#112766): Verify successful address selection using geolocation

### TC-11 (#112767): Verify address outside Lesedi municipal bounds is rejected
**Mode:** playwright-script
**Duration:** 56.6s
- [FAIL] TC-11 (#112767): Verify address outside Lesedi municipal bounds is rejected

**Error:**
```
Error: ADO #112767 expects "Address is outside Lesedi municipal bounds. Please select an address within the Lesedi region"

[2mexpect([22m[31mlocator[39m[2m).[22mtoContainText[2m([22m[32mexpected[39m[2m)[22m failed

Locator: locator('body')
Expected pattern: [32m/outside Lesedi municipal bounds/i[39m
Received string:  [31m"CasesAll CasesEventsFAQContactsFacilitiesCustomersBroadcast NotificationAmbulance RequestsCase MappingContent Item TypesManage Content LibrariesPublic LibrariesDashBoardsChat ConsoleReportsAdministrationConfigurationsedit-reported-userSocial MediaShesha/header v10LiveLast Callclearlink to caseOfflineLoginLive ModeLiveLebos Lebos  Boxfusion.ServiceManagement/service-requests v55LiveAll Cases1-10 of 1612 items123•••16210 / pageCreate CaseBoxfusion.ServiceManagement/case-item-view v10LiveCall CentreREF013/02/09/2026: Burst PipeHeidelberg, Heidelberg - GP, South AfricaFrom:  QAAuto948249 TesterFrom:  Anonymous02/09/2026 10:29NewUserHighAssigned ToAssigned To GroupAssigned ToNone Call CentreREF012/02/09/2026: Area Power FailureHeidelberg, Heidelberg - GP, South AfricaFrom:  QAAuto788518 TesterFrom:  Anonymous02/09/2026 10:26NewAgentAssigned ToMoshadi MothibaAssigned To GroupAssigned ToNone Call CentreREF011/02/09/2026: Area Power FailureHeidelberg, Heidelberg - GP, South AfricaFrom:  QAAuto676913 TesterFrom:  Anonymous02/09/2026 10:25NewAgentAssigned ToMoshadi MothibaAssigned To GroupAssigned ToNone Call CentreREF010/02/09/2026: Area Power Failure
```
**Location:** C:\Users\NomfaneloNhleko\OneDrive\Test-ReportsHub\projects\PD-CRM\test-plans\case-management\case-creation.spec.ts:412:7

### TC-12 (#112768): Verify successful case creation when the address cannot be found
**Mode:** playwright-script
**Duration:** 35.0s
- [PASS] TC-12 (#112768): Verify successful case creation when the address cannot be found

### TC-13 (#112769): Verify mandatory fields when Can't Find Address is checked
**Mode:** playwright-script
**Duration:** 27.3s
- [PASS] TC-13 (#112769): Verify mandatory fields when Can't Find Address is checked

### TC-14 (#112770): Verify case creation without a Description
**Mode:** playwright-script
**Duration:** 31.2s
- [PASS] TC-14 (#112770): Verify case creation without a Description

### TC-15 (#112771): Verify case creation without selecting a Preferred Contact Method
**Mode:** playwright-script
**Duration:** 30.9s
- [PASS] TC-15 (#112771): Verify case creation without selecting a Preferred Contact Method

### TC-16 (#112772): Verify possible submitter matches are displayed
**Mode:** playwright-script
**Duration:** 20.0s
- [PASS] TC-16 (#112772): Verify possible submitter matches are displayed
