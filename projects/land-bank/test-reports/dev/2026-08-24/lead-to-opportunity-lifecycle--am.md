# Report: Test Plan: LEAD-2.1 — Lead to Opportunity Lifecycle (Client Type × Lead Channel × Consent Matrix) — am
**Date:** 2026-08-24 06:22 UTC
**Variant:** am
**Plan:** test-plans/leads/lead-to-opportunity-lifecycle.md
**Spec:** test-plans/leads/lead-to-opportunity-lifecycle.spec.ts
**Execution Mode:** playwright-script (failures pending AI-repair)
**Result:** FAILED
**Duration:** 727.5s

## Summary
| Total Steps | Passed | Failed | Skipped |
|-------------|--------|--------|---------|
| 14 | 3 | 11 | 0 |

## Step Results
### TC-01: Log in to Land Bank CRM as an RM
**Mode:** playwright-script
**Duration:** 4.6s
- [PASS] TC-01: Log in to Land Bank CRM as an RM

### TC-02: Navigate to Leads from the side menu
**Mode:** playwright-script
**Duration:** 6.7s
- [PASS] TC-02: Navigate to Leads from the side menu

### TC-03: Individual (Individual) lead via Online Digital Channel converts to a PERSONAL Opportunity
**Mode:** playwright-script
**Duration:** 24.8s
- [FAIL] TC-03: Individual (Individual) lead via Online Digital Channel converts to a PERSONAL Opportunity

**Error:**
```
TimeoutError: locator.click: Timeout 15000ms exceeded.
Call log:
[2m  - waiting for locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option[title="Individual (Individual)"]')[22m


  143 | async function selectOption(scope: Page | Locator, page: Page, name: string, option: string) {
  144 |   await field(scope, name).locator('.ant-select-selector').click();
> 145 |   await openOption(page, option).click();
      |                                  ^
  146 | }
  147 |
  148 | const modal = (page: Page) => page.locator('.ant-modal-content');
    at selectOption (/Users/Sanele/Downloads/Autotesting/Test-ReportsHub/projects/land-bank/test-plans/leads/lead-to-opportunity-lifecycle.spec.ts:145:34)
    at /Users/Sanele/Downloads/Autotesting/Test-ReportsHub/projects/land-bank/test-plans/leads/lead-to-opportunity-lifecycle.spec.ts:386:7
```
**Location:** /Users/Sanele/Downloads/Autotesting/Test-ReportsHub/projects/land-bank/test-plans/leads/lead-to-opportunity-lifecycle.spec.ts:145:34

### TC-04: Listed Company (Entity) lead via Online Digital Channel converts to a ENTITY Opportunity
**Mode:** playwright-script
**Duration:** 74.5s
- [FAIL] TC-04: Listed Company (Entity) lead via Online Digital Channel converts to a ENTITY Opportunity

**Error:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoContainText[2m([22m[32mexpected[39m[2m)[22m failed

Locator: locator('main')
Expected substring: [32m"NEW"[39m
Received string:    [31m" LandBank.Crm/LBLead-details v58LiveListedOnline, AutoQALeadStatusNewAssessmentLead OwnerKwanele ButheleziProvinceGautengRegionCentral RegionEditDisqualifyAudit LogInitiate Pre-Screening Details Tasks NotesFirst NameAutoQAMobile Number0820000103Client TypeListed Company (Entity)Lead ChannelOnline Digital ChannelDescriptionReason DisqualifiedLast NameListedOnlineEmail Addressautoqa.listedonline@example.comProvinceGautengPreferred CommunicationEmailRejection Reason"[39m
Timeout: 60000ms

Call log:
[2m  - Expect "toContainText" with timeout 60000ms[22m
[2m  - waiting for locator('main')[22m
[2m    121 × locator resolved to <main class="ant-layout-content acss-jxn9xj collapsed css-1lo1l9k css-var-r0">…</main>[22m
[2m        - unexpected value " LandBank.Crm/LBLead-details v58LiveListedOnline, AutoQALeadStatusNewAssessmentLead OwnerKwanele ButheleziProvinceGautengRegionCentral RegionEditDisqualifyAudit LogInitiate Pre-Screening Details Tasks NotesFirst NameAutoQAMobile Number0820000103Client TypeListed Company (Entity)Lead ChannelOnline Digital ChannelDescriptionReason DisqualifiedLast NameListedOnlineEmail Addressautoqa.listedonline@example.comProvinceGautengPreferred CommunicationEmailRejection Reason"[22m


  437 |
  438 |       // ASSERT: the newly created lead shows status
```
**Location:** /Users/Sanele/Downloads/Autotesting/Test-ReportsHub/projects/land-bank/test-plans/leads/lead-to-opportunity-lifecycle.spec.ts:439:26

### TC-05: Close Corporation (Entity) lead via Online Digital Channel converts to a ENTITY Opportunity
**Mode:** playwright-script
**Duration:** 77.3s
- [FAIL] TC-05: Close Corporation (Entity) lead via Online Digital Channel converts to a ENTITY Opportunity

**Error:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoContainText[2m([22m[32mexpected[39m[2m)[22m failed

Locator: locator('main')
Expected substring: [32m"NEW"[39m
Received string:    [31m" LandBank.Crm/LBLead-details v58LiveCloseCorpOnline, AutoQALeadStatusNewAssessmentLead OwnerKwanele ButheleziProvinceGautengRegionCentral RegionEditDisqualifyAudit LogInitiate Pre-Screening Details Tasks NotesFirst NameAutoQAMobile Number0820000105Client TypeClose Corporation (Entity)Lead ChannelOnline Digital ChannelDescriptionReason DisqualifiedLast NameCloseCorpOnlineEmail Addressautoqa.closecorponline@example.comProvinceGautengPreferred CommunicationEmailRejection Reason"[39m
Timeout: 60000ms

Call log:
[2m  - Expect "toContainText" with timeout 60000ms[22m
[2m  - waiting for locator('main')[22m
[2m    121 × locator resolved to <main class="ant-layout-content acss-jxn9xj collapsed css-1lo1l9k css-var-r0">…</main>[22m
[2m        - unexpected value " LandBank.Crm/LBLead-details v58LiveCloseCorpOnline, AutoQALeadStatusNewAssessmentLead OwnerKwanele ButheleziProvinceGautengRegionCentral RegionEditDisqualifyAudit LogInitiate Pre-Screening Details Tasks NotesFirst NameAutoQAMobile Number0820000105Client TypeClose Corporation (Entity)Lead ChannelOnline Digital ChannelDescriptionReason DisqualifiedLast NameCloseCorpOnlineEmail Addressautoqa.closecorponline@example.comProvinceGautengPreferred CommunicationEmailRejection Reason"[22m


  437 |
  438 |       // ASSERT: the newly c
```
**Location:** /Users/Sanele/Downloads/Autotesting/Test-ReportsHub/projects/land-bank/test-plans/leads/lead-to-opportunity-lifecycle.spec.ts:439:26

### TC-06: Individual lead via Landbank Branch with Upload Consent = True
**Mode:** playwright-script
**Duration:** 71.3s
- [FAIL] TC-06: Individual lead via Landbank Branch with Upload Consent = True

**Error:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoHaveClass[2m([22m[32mexpected[39m[2m)[22m failed

Locator: locator('.ant-modal-content').locator('.ant-form-item:has(> .ant-row > .ant-col.ant-form-item-label > label[for="firstName"])')
Expected pattern: [32m/ant-form-item-hidden/[39m
Timeout: 60000ms
Error: element(s) not found

Call log:
[2m  - Expect "toHaveClass" with timeout 60000ms[22m
[2m  - waiting for locator('.ant-modal-content').locator('.ant-form-item:has(> .ant-row > .ant-col.ant-form-item-label > label[for="firstName"])')[22m


  128 | }
  129 | async function expectFieldHidden(scope: Page | Locator, name: string) {
> 130 |   await expect(field(scope, name)).toHaveClass(/ant-form-item-hidden/, { timeout: LONG });
      |                                    ^
  131 | }
  132 |
  133 | // FRAGILE: dropdown options render no role=option; the title attribute is the only stable handle,
    at expectFieldHidden (/Users/Sanele/Downloads/Autotesting/Test-ReportsHub/projects/land-bank/test-plans/leads/lead-to-opportunity-lifecycle.spec.ts:130:36)
    at /Users/Sanele/Downloads/Autotesting/Test-ReportsHub/projects/land-bank/test-plans/leads/lead-to-opportunity-lifecycle.spec.ts:517:11
```
**Location:** /Users/Sanele/Downloads/Autotesting/Test-ReportsHub/projects/land-bank/test-plans/leads/lead-to-opportunity-lifecycle.spec.ts:130:36

### TC-07: Individual lead via Landbank Branch with Upload Consent = False (OTP route)
**Mode:** playwright-script
**Duration:** 24.6s
- [FAIL] TC-07: Individual lead via Landbank Branch with Upload Consent = False (OTP route)

**Error:**
```
TimeoutError: locator.click: Timeout 15000ms exceeded.
Call log:
[2m  - waiting for locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option[title="Individual (Individual)"]')[22m


  143 | async function selectOption(scope: Page | Locator, page: Page, name: string, option: string) {
  144 |   await field(scope, name).locator('.ant-select-selector').click();
> 145 |   await openOption(page, option).click();
      |                                  ^
  146 | }
  147 |
  148 | const modal = (page: Page) => page.locator('.ant-modal-content');
    at selectOption (/Users/Sanele/Downloads/Autotesting/Test-ReportsHub/projects/land-bank/test-plans/leads/lead-to-opportunity-lifecycle.spec.ts:145:34)
    at /Users/Sanele/Downloads/Autotesting/Test-ReportsHub/projects/land-bank/test-plans/leads/lead-to-opportunity-lifecycle.spec.ts:633:5
```
**Location:** /Users/Sanele/Downloads/Autotesting/Test-ReportsHub/projects/land-bank/test-plans/leads/lead-to-opportunity-lifecycle.spec.ts:145:34

### TC-08: Listed Company (Entity) lead via Landbank Branch with Upload Resolution and Consent = True
**Mode:** playwright-script
**Duration:** 70.2s
- [FAIL] TC-08: Listed Company (Entity) lead via Landbank Branch with Upload Resolution and Consent = True

**Error:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoHaveClass[2m([22m[32mexpected[39m[2m)[22m failed

Locator: locator('.ant-modal-content').locator('.ant-form-item:has(> .ant-row > .ant-col.ant-form-item-label > label[for="firstName"])')
Expected pattern: [32m/ant-form-item-hidden/[39m
Timeout: 60000ms
Error: element(s) not found

Call log:
[2m  - Expect "toHaveClass" with timeout 60000ms[22m
[2m  - waiting for locator('.ant-modal-content').locator('.ant-form-item:has(> .ant-row > .ant-col.ant-form-item-label > label[for="firstName"])')[22m


  128 | }
  129 | async function expectFieldHidden(scope: Page | Locator, name: string) {
> 130 |   await expect(field(scope, name)).toHaveClass(/ant-form-item-hidden/, { timeout: LONG });
      |                                    ^
  131 | }
  132 |
  133 | // FRAGILE: dropdown options render no role=option; the title attribute is the only stable handle,
    at expectFieldHidden (/Users/Sanele/Downloads/Autotesting/Test-ReportsHub/projects/land-bank/test-plans/leads/lead-to-opportunity-lifecycle.spec.ts:130:36)
    at /Users/Sanele/Downloads/Autotesting/Test-ReportsHub/projects/land-bank/test-plans/leads/lead-to-opportunity-lifecycle.spec.ts:753:13
```
**Location:** /Users/Sanele/Downloads/Autotesting/Test-ReportsHub/projects/land-bank/test-plans/leads/lead-to-opportunity-lifecycle.spec.ts:130:36

### TC-10: Close Corporation (Entity) lead via Landbank Branch with Upload Resolution and Consent = True
**Mode:** playwright-script
**Duration:** 70.5s
- [FAIL] TC-10: Close Corporation (Entity) lead via Landbank Branch with Upload Resolution and Consent = True

**Error:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoHaveClass[2m([22m[32mexpected[39m[2m)[22m failed

Locator: locator('.ant-modal-content').locator('.ant-form-item:has(> .ant-row > .ant-col.ant-form-item-label > label[for="firstName"])')
Expected pattern: [32m/ant-form-item-hidden/[39m
Timeout: 60000ms
Error: element(s) not found

Call log:
[2m  - Expect "toHaveClass" with timeout 60000ms[22m
[2m  - waiting for locator('.ant-modal-content').locator('.ant-form-item:has(> .ant-row > .ant-col.ant-form-item-label > label[for="firstName"])')[22m


  128 | }
  129 | async function expectFieldHidden(scope: Page | Locator, name: string) {
> 130 |   await expect(field(scope, name)).toHaveClass(/ant-form-item-hidden/, { timeout: LONG });
      |                                    ^
  131 | }
  132 |
  133 | // FRAGILE: dropdown options render no role=option; the title attribute is the only stable handle,
    at expectFieldHidden (/Users/Sanele/Downloads/Autotesting/Test-ReportsHub/projects/land-bank/test-plans/leads/lead-to-opportunity-lifecycle.spec.ts:130:36)
    at /Users/Sanele/Downloads/Autotesting/Test-ReportsHub/projects/land-bank/test-plans/leads/lead-to-opportunity-lifecycle.spec.ts:753:13
```
**Location:** /Users/Sanele/Downloads/Autotesting/Test-ReportsHub/projects/land-bank/test-plans/leads/lead-to-opportunity-lifecycle.spec.ts:130:36

### TC-09: Listed Company (Entity) lead via Landbank Branch with Upload Resolution and Consent = False
**Mode:** playwright-script
**Duration:** 72.1s
- [FAIL] TC-09: Listed Company (Entity) lead via Landbank Branch with Upload Resolution and Consent = False

**Error:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoHaveClass[2m([22m[32mexpected[39m[2m)[22m failed

Locator: locator('.ant-modal-content').locator('.ant-form-item:has(> .ant-row > .ant-col.ant-form-item-label > label[for="signatoryConsent"])')
Expected pattern: [32m/ant-form-item-hidden/[39m
Timeout: 60000ms
Error: element(s) not found

Call log:
[2m  - Expect "toHaveClass" with timeout 60000ms[22m
[2m  - waiting for locator('.ant-modal-content').locator('.ant-form-item:has(> .ant-row > .ant-col.ant-form-item-label > label[for="signatoryConsent"])')[22m


  128 | }
  129 | async function expectFieldHidden(scope: Page | Locator, name: string) {
> 130 |   await expect(field(scope, name)).toHaveClass(/ant-form-item-hidden/, { timeout: LONG });
      |                                    ^
  131 | }
  132 |
  133 | // FRAGILE: dropdown options render no role=option; the title attribute is the only stable handle,
    at expectFieldHidden (/Users/Sanele/Downloads/Autotesting/Test-ReportsHub/projects/land-bank/test-plans/leads/lead-to-opportunity-lifecycle.spec.ts:130:36)
    at /Users/Sanele/Downloads/Autotesting/Test-ReportsHub/projects/land-bank/test-plans/leads/lead-to-opportunity-lifecycle.spec.ts:859:13
```
**Location:** /Users/Sanele/Downloads/Autotesting/Test-ReportsHub/projects/land-bank/test-plans/leads/lead-to-opportunity-lifecycle.spec.ts:130:36

### TC-11: Close Corporation (Entity) lead via Landbank Branch with Upload Resolution and Consent = False
**Mode:** playwright-script
**Duration:** 70.3s
- [FAIL] TC-11: Close Corporation (Entity) lead via Landbank Branch with Upload Resolution and Consent = False

**Error:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoHaveClass[2m([22m[32mexpected[39m[2m)[22m failed

Locator: locator('.ant-modal-content').locator('.ant-form-item:has(> .ant-row > .ant-col.ant-form-item-label > label[for="signatoryConsent"])')
Expected pattern: [32m/ant-form-item-hidden/[39m
Timeout: 60000ms
Error: element(s) not found

Call log:
[2m  - Expect "toHaveClass" with timeout 60000ms[22m
[2m  - waiting for locator('.ant-modal-content').locator('.ant-form-item:has(> .ant-row > .ant-col.ant-form-item-label > label[for="signatoryConsent"])')[22m


  128 | }
  129 | async function expectFieldHidden(scope: Page | Locator, name: string) {
> 130 |   await expect(field(scope, name)).toHaveClass(/ant-form-item-hidden/, { timeout: LONG });
      |                                    ^
  131 | }
  132 |
  133 | // FRAGILE: dropdown options render no role=option; the title attribute is the only stable handle,
    at expectFieldHidden (/Users/Sanele/Downloads/Autotesting/Test-ReportsHub/projects/land-bank/test-plans/leads/lead-to-opportunity-lifecycle.spec.ts:130:36)
    at /Users/Sanele/Downloads/Autotesting/Test-ReportsHub/projects/land-bank/test-plans/leads/lead-to-opportunity-lifecycle.spec.ts:859:13
```
**Location:** /Users/Sanele/Downloads/Autotesting/Test-ReportsHub/projects/land-bank/test-plans/leads/lead-to-opportunity-lifecycle.spec.ts:130:36

### TC-12: Capture Loan Info and initiate the loan application workflow
**Mode:** playwright-script
**Duration:** 72.6s
- [FAIL] TC-12: Capture Loan Info and initiate the loan application workflow

**Error:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoContainText[2m([22m[32mexpected[39m[2m)[22m failed

Locator: locator('main')
Timeout: 60000ms
[32m- Expected substring  - 1[39m
[31m+ Received string     + 8[39m

[32m- DRAFT[39m
[31m+  LandBank.Crm/LBOpportunity-details v95LiveBOXFUSION (PTY)LTDDraftQualificationOpportunityOpportunity OwnerKwanele ButheleziApplication TypeEntityAccount BOXFUSION (PTY)LTDAmountR Initiate Loan ApplicationEditAudit Log Loan Application Details Tasks Notes DocumentsLandBank.Crm/opportunity-loan-application v233LiveApplication TypeEntity Client Info Loan Info FarmsEntity InformationOpportunityClose Corporation (Entity)Auto VerifyEntity NameBOXFUSION (PTY)LTDThis field is required[39m
[31m+ Company Registration NumberK2012/225386/07This field is required[39m
[31m+ Annual TurnoverYears In Operation14Contact Person TitleMrContact Person NameAutoQAThis field is required[39m
[31m+ Contact Person SurnameBranchCloseCorpUploadContact Person Email Addressautoqa.branch.closecorp@example.comThis field is required[39m
[31m+ Contact Person Mobile Number0820000502Preferred CommunicationEmailITC StatusTotal OwnersCountry Of ResidenceThis field is required[39m
[31m+ CitizenshipThis field is required[39m
[31m+ Existing RelationshipNational Credit Act (NCA) Client?Does the client have a surety? Does the client have a co-applicant?Entity Org TypeClient ClassificationBEEE LevelAddressProvinceGautengThis field is required[39m
[31m+ Region
```
**Location:** /Users/Sanele/Downloads/Autotesting/Test-ReportsHub/projects/land-bank/test-plans/leads/lead-to-opportunity-lifecycle.spec.ts:952:24

### TC-13: Action the Complete Onboarding Checklist task from the RM Inbox
**Mode:** playwright-script
**Duration:** 12.5s
- [PASS] TC-13: Action the Complete Onboarding Checklist task from the RM Inbox

### TC-14: Confirm the Opportunity reflects the completed Inbox step
**Mode:** playwright-script
**Duration:** 67.3s
- [FAIL] TC-14: Confirm the Opportunity reflects the completed Inbox step

**Error:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoContainText[2m([22m[32mexpected[39m[2m)[22m failed

Locator: locator('main')
Expected substring: [32m"IndivOnline"[39m
Received string:    [31m" LandBank.Crm/LBOpportunity-table v25LiveAll Opportunities1-10 of 33 items123410 / pageTableExportDate CreatedAccountApplication TypeReference NoApplication NumberLoan AmountApplication StatusSubmission DateOpportunity OwnerProvinceFirst NameLast NameContactFrom Lead24/08/2026 08:10 BOXFUSION (PTY)LTDEntityOPP-2026-001398LA-2026-001398Draft24/08/2026 08:10Kwanele ButheleziGautengAutoQABranchCloseCorpUpload BOXFUSION (PTY)LTD21/08/2026 14:03 AutoQA OnlineCloseCorpEntityOPP-2026-001396LA-2026-001396Draft21/08/2026 14:03Kwanele ButheleziGautengAutoQAOnlineCloseCorp LD-2026-00189221/08/2026 14:01 BOXFUSION (PTY)LTDEntityOPP-2026-001395LA-2026-001395Draft21/08/2026 14:01Kwanele ButheleziGautengAutoQABranchCloseCorpUpload BOXFUSION (PTY)LTD21/08/2026 13:57 BOXFUSION (PTY)LTDEntityOPP-2026-001394LA-2026-001394Draft21/08/2026 13:57Kwanele ButheleziGautengAutoQABranchCloseCorpUpload BOXFUSION (PTY)LTD21/08/2026 13:56 BOXFUSION (PTY)LTDEntityOPP-2026-001393LA-2026-001393Draft21/08/2026 13:56Kwanele ButheleziGautengAutoQABranchCloseCorpUpload BOXFUSION (PTY)LTD21/08/2026 12:12 AutoQA OnlineCloseCorpEntityOPP-2026-001392LA-2026-001392Draft21/08/2026 12:12Kwanele ButheleziGautengAutoQAOnlineCloseCorp LD-2026-00187421/08/2026 11:39 AutoQA OnlineCloseCorpEntityOPP-2026-001391LA-2026-00139
```
**Location:** /Users/Sanele/Downloads/Autotesting/Test-ReportsHub/projects/land-bank/test-plans/leads/lead-to-opportunity-lifecycle.spec.ts:1137:26
