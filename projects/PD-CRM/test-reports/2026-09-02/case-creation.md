# Report: Test Plan: Case Creation
**Date:** 2026-09-02 14:05 UTC
**Plan:** test-plans/case-management/case-creation.md
**Spec:** test-plans/case-management/case-creation.spec.ts
**Execution Mode:** playwright-script (failures pending AI-repair)
**Result:** PARTIAL
**Duration:** 612.0s

## Summary
| Total Steps | Passed | Failed | Skipped |
|-------------|--------|--------|---------|
| 16 | 15 | 1 | 0 |

## Step Results
### TC-01 (#112757): Verify successful case creation using valid details
**Mode:** playwright-script
**Duration:** 57.3s
- [PASS] TC-01 (#112757): Verify successful case creation using valid details

### TC-02 (#112758): Verify mandatory Channel validation
**Mode:** playwright-script
**Duration:** 32.5s
- [PASS] TC-02 (#112758): Verify mandatory Channel validation

### TC-03 (#112759): Verify mandatory Mobile Number validation
**Mode:** playwright-script
**Duration:** 39.7s
- [PASS] TC-03 (#112759): Verify mandatory Mobile Number validation

### TC-04 (#112760): Verify Mobile Number accepts a valid number starting with 0
**Mode:** playwright-script
**Duration:** 39.9s
- [PASS] TC-04 (#112760): Verify Mobile Number accepts a valid number starting with 0

### TC-05 (#112761): Verify Mobile Number rejects a number with a country code
**Mode:** playwright-script
**Duration:** 22.1s
- [PASS] TC-05 (#112761): Verify Mobile Number rejects a number with a country code

### TC-06 (#112762): Verify mandatory Email Address validation
**Mode:** playwright-script
**Duration:** 35.8s
- [PASS] TC-06 (#112762): Verify mandatory Email Address validation

### TC-07 (#112763): Verify mandatory Category validation
**Mode:** playwright-script
**Duration:** 31.7s
- [PASS] TC-07 (#112763): Verify mandatory Category validation

### TC-08 (#112764): Verify Case type cascades based on selected Category
**Mode:** playwright-script
**Duration:** 29.5s
- [PASS] TC-08 (#112764): Verify Case type cascades based on selected Category

### TC-09 (#112765): Verify mandatory Case type validation
**Mode:** playwright-script
**Duration:** 33.8s
- [PASS] TC-09 (#112765): Verify mandatory Case type validation

### TC-10 (#112766): Verify successful address selection using geolocation
**Mode:** playwright-script
**Duration:** 43.6s
- [PASS] TC-10 (#112766): Verify successful address selection using geolocation

### TC-11 (#112767): Verify address outside Lesedi municipal bounds is rejected
**Mode:** playwright-script
**Duration:** 61.3s
- [FAIL] TC-11 (#112767): Verify address outside Lesedi municipal bounds is rejected

**Error:**
```
Error: ADO #112767 expects "Address is outside Lesedi municipal bounds. Please select an address within the Lesedi region"

[2mexpect([22m[31mlocator[39m[2m).[22mtoContainText[2m([22m[32mexpected[39m[2m)[22m failed

Locator: locator('body')
Expected pattern: [32m/outside Lesedi municipal bounds/i[39m
Received string:  [31m"CasesAll CasesEventsFAQContactsFacilitiesCustomersBroadcast NotificationAmbulance RequestsCase MappingContent Item TypesManage Content LibrariesPublic LibrariesDashBoardsChat ConsoleReportsAdministrationConfigurationsedit-reported-userSocial MediaShesha/header v10LiveLast Callclearlink to caseOfflineLoginLive ModeLatestLebos Lebos  Boxfusion.ServiceManagement/service-requests v55LiveAll Cases1-10 of 1633 items123•••16410 / pageCreate CaseBoxfusion.ServiceManagement/case-item-view v10LiveCall CentreREF034/02/09/2026: Burst PipeHeidelberg, Heidelberg - GP, South AfricaFrom:  QAAuto643360 TesterFrom:  Anonymous02/09/2026 14:01NewUserHighAssigned ToAssigned To GroupAssigned ToNone Call CentreREF033/02/09/2026: Area Power FailureHeidelberg, Heidelberg - GP, South AfricaFrom:  QAAuto443146 TesterFrom:  Anonymous02/09/2026 13:57NewAgentAssigned ToMoshadi MothibaAssigned To GroupAssigned ToNone Call CentreREF032/02/09/2026: Area Power FailureHeidelberg, Heidelberg - GP, South AfricaFrom:  QAAuto314041 TesterFrom:  Anonymous02/09/2026 13:55NewAgentAssigned ToMoshadi MothibaAssigned To GroupAssigned ToNone Call CentreREF031/02/09/2026: Area Power Failu
```
**Location:** C:\Users\NomfaneloNhleko\OneDrive\Test-ReportsHub\projects\PD-CRM\test-plans\case-management\case-creation.spec.ts:417:7

### TC-12 (#112768): Verify successful case creation when the address cannot be found
**Mode:** playwright-script
**Duration:** 41.7s
- [PASS] TC-12 (#112768): Verify successful case creation when the address cannot be found

### TC-13 (#112769): Verify mandatory fields when Can't Find Address is checked
**Mode:** playwright-script
**Duration:** 32.1s
- [PASS] TC-13 (#112769): Verify mandatory fields when Can't Find Address is checked

### TC-14 (#112770): Verify case creation without a Description
**Mode:** playwright-script
**Duration:** 35.9s
- [PASS] TC-14 (#112770): Verify case creation without a Description

### TC-15 (#112771): Verify case creation without selecting a Preferred Contact Method
**Mode:** playwright-script
**Duration:** 36.6s
- [PASS] TC-15 (#112771): Verify case creation without selecting a Preferred Contact Method

### TC-16 (#112772): Verify possible submitter matches are displayed
**Mode:** playwright-script
**Duration:** 24.3s
- [PASS] TC-16 (#112772): Verify possible submitter matches are displayed
