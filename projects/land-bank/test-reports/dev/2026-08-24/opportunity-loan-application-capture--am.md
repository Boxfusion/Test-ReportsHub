# Report: Test Plan: OPP-3.1 — Opportunity Loan Application Capture (Client Info, Party Tables, Loan Info, Documents) — am
**Date:** 2026-08-24 06:39 UTC
**Variant:** am
**Plan:** test-plans/opportunities/opportunity-loan-application-capture.md
**Spec:** test-plans/opportunities/opportunity-loan-application-capture.spec.ts
**Execution Mode:** playwright-script (failures pending AI-repair)
**Result:** FAILED
**Duration:** 802.7s

## Summary
| Total Steps | Passed | Failed | Skipped |
|-------------|--------|--------|---------|
| 13 | 1 | 12 | 0 |

## Step Results
### TC-01: Log in as an RM and open the Opportunities listing
**Mode:** playwright-script
**Duration:** 8.2s
- [PASS] TC-01: Log in as an RM and open the Opportunities listing

### TC-02: Open a DRAFT Opportunity and confirm the loan application tab structure
**Mode:** playwright-script
**Duration:** 11.1s
- [FAIL] TC-02: Open a DRAFT Opportunity and confirm the loan application tab structure

**Error:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator: locator('main').getByRole('button', { name: 'Edit' })
Expected: visible
Error: strict mode violation: locator('main').getByRole('button', { name: 'Edit' }) resolved to 3 elements:
    1) <button type="button" class="ant-btn css-1lo1l9k css-var-r0 ant-btn-link">…</button> aka getByRole('button', { name: 'edit' }).nth(1)
    2) <button type="button" class="ant-btn css-1lo1l9k css-var-r0 ant-btn-link sha-toolbar-btn sha-toolbar-btn-configurable">…</button> aka getByRole('button', { name: 'edit Edit' })
    3) <button type="button" class="ant-btn css-1lo1l9k css-var-r0 ant-btn-link">…</button> aka getByLabel('Loan Application Details').getByRole('button', { name: 'edit' })

Call log:
[2m  - Expect "toBeVisible" with timeout 10000ms[22m
[2m  - waiting for locator('main').getByRole('button', { name: 'Edit' })[22m


  360 |
  361 |     // ASSERT: the **Edit**, **Audit Log** and **Initiate Loan Application** actions are displayed
> 362 |     await expect(editButton(page)).toBeVisible();
      |                                    ^
  363 |     await expect(main(page).getByRole('button', { name: 'Audit Log' })).toBeVisible();
  364 |     await expect(initiateButton(page)).toBeVisible();
  365 |
    at /Users/Sanele/Downloads/Autotesting/Test-ReportsHub/projects/land-bank/test-plans/opportunities/opportunity-loan-application-capture.spec.ts:362:36
```
**Location:** /Users/Sanele/Downloads/Autotesting/Test-ReportsHub/projects/land-bank/test-plans/opportunities/opportunity-loan-application-capture.spec.ts:362:36

### TC-03: PERSONAL Opportunity Client Info — Individual via Online Digital Channel (LEAD TC-03)
**Mode:** playwright-script
**Duration:** 68.4s
- [FAIL] TC-03: PERSONAL Opportunity Client Info — Individual via Online Digital Channel (LEAD TC-03)

**Error:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator: locator('div[role="row"]').filter({ hasText: 'PERSONAL' }).filter({ hasText: 'DRAFT' }).first()
Expected: visible
Timeout: 60000ms
Error: element(s) not found

Call log:
[2m  - Expect "toBeVisible" with timeout 60000ms[22m
[2m  - waiting for locator('div[role="row"]').filter({ hasText: 'PERSONAL' }).filter({ hasText: 'DRAFT' }).first()[22m


  183 |     .filter({ hasText: 'DRAFT' })
  184 |     .first();
> 185 |   await expect(row).toBeVisible({ timeout: LONG });
      |                     ^
  186 |   await row.locator('a').first().click();
  187 |
  188 |   await page.waitForURL(new RegExp(OPP_DETAILS_PATH.replace(/\./g, '\\.')), { timeout: LONG });
    at openOpportunityOfType (/Users/Sanele/Downloads/Autotesting/Test-ReportsHub/projects/land-bank/test-plans/opportunities/opportunity-loan-application-capture.spec.ts:185:21)
    at /Users/Sanele/Downloads/Autotesting/Test-ReportsHub/projects/land-bank/test-plans/opportunities/opportunity-loan-application-capture.spec.ts:378:7
```
**Location:** /Users/Sanele/Downloads/Autotesting/Test-ReportsHub/projects/land-bank/test-plans/opportunities/opportunity-loan-application-capture.spec.ts:185:21

### TC-04: PERSONAL Opportunity Client Info — Individual via Landbank Branch, Upload Consent = True (LEAD TC-06)
**Mode:** playwright-script
**Duration:** 69.2s
- [FAIL] TC-04: PERSONAL Opportunity Client Info — Individual via Landbank Branch, Upload Consent = True (LEAD TC-06)

**Error:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator: locator('div[role="row"]').filter({ hasText: 'PERSONAL' }).filter({ hasText: 'DRAFT' }).first()
Expected: visible
Timeout: 60000ms
Error: element(s) not found

Call log:
[2m  - Expect "toBeVisible" with timeout 60000ms[22m
[2m  - waiting for locator('div[role="row"]').filter({ hasText: 'PERSONAL' }).filter({ hasText: 'DRAFT' }).first()[22m


  183 |     .filter({ hasText: 'DRAFT' })
  184 |     .first();
> 185 |   await expect(row).toBeVisible({ timeout: LONG });
      |                     ^
  186 |   await row.locator('a').first().click();
  187 |
  188 |   await page.waitForURL(new RegExp(OPP_DETAILS_PATH.replace(/\./g, '\\.')), { timeout: LONG });
    at openOpportunityOfType (/Users/Sanele/Downloads/Autotesting/Test-ReportsHub/projects/land-bank/test-plans/opportunities/opportunity-loan-application-capture.spec.ts:185:21)
    at /Users/Sanele/Downloads/Autotesting/Test-ReportsHub/projects/land-bank/test-plans/opportunities/opportunity-loan-application-capture.spec.ts:378:7
```
**Location:** /Users/Sanele/Downloads/Autotesting/Test-ReportsHub/projects/land-bank/test-plans/opportunities/opportunity-loan-application-capture.spec.ts:185:21

### TC-05: PERSONAL Opportunity Client Info — Individual via Landbank Branch, Upload Consent = False (LEAD TC-07)
**Mode:** playwright-script
**Duration:** 68.9s
- [FAIL] TC-05: PERSONAL Opportunity Client Info — Individual via Landbank Branch, Upload Consent = False (LEAD TC-07)

**Error:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator: locator('div[role="row"]').filter({ hasText: 'PERSONAL' }).filter({ hasText: 'DRAFT' }).first()
Expected: visible
Timeout: 60000ms
Error: element(s) not found

Call log:
[2m  - Expect "toBeVisible" with timeout 60000ms[22m
[2m  - waiting for locator('div[role="row"]').filter({ hasText: 'PERSONAL' }).filter({ hasText: 'DRAFT' }).first()[22m


  183 |     .filter({ hasText: 'DRAFT' })
  184 |     .first();
> 185 |   await expect(row).toBeVisible({ timeout: LONG });
      |                     ^
  186 |   await row.locator('a').first().click();
  187 |
  188 |   await page.waitForURL(new RegExp(OPP_DETAILS_PATH.replace(/\./g, '\\.')), { timeout: LONG });
    at openOpportunityOfType (/Users/Sanele/Downloads/Autotesting/Test-ReportsHub/projects/land-bank/test-plans/opportunities/opportunity-loan-application-capture.spec.ts:185:21)
    at /Users/Sanele/Downloads/Autotesting/Test-ReportsHub/projects/land-bank/test-plans/opportunities/opportunity-loan-application-capture.spec.ts:378:7
```
**Location:** /Users/Sanele/Downloads/Autotesting/Test-ReportsHub/projects/land-bank/test-plans/opportunities/opportunity-loan-application-capture.spec.ts:185:21

### TC-06: ENTITY Opportunity Client Info and party tables — Listed Company via Online Digital Channel (LEAD TC-04)
**Mode:** playwright-script
**Duration:** 73.8s
- [FAIL] TC-06: ENTITY Opportunity Client Info and party tables — Listed Company via Online Digital Channel (LEAD TC-04)

**Error:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoContainText[2m([22m[32mexpected[39m[2m)[22m failed

Locator: locator('main')
Timeout: 60000ms
[32m- Expected substring  - 1[39m
[31m+ Received string     + 8[39m

[32m- ENTITY[39m
[31m+  LandBank.Crm/LBOpportunity-details v95LiveAutoQA OnlineCloseCorpDraftQualificationOpportunityOpportunity OwnerKwanele ButheleziApplication TypeEntityAccount AutoQA OnlineCloseCorpAmountR Initiate Loan ApplicationEditAudit Log Loan Application Details Tasks Notes DocumentsLandBank.Crm/opportunity-loan-application v233LiveApplication TypeEntity Client Info Loan Info FarmsEntity InformationOpportunityClose Corporation (Entity)Auto VerifyEntity NameAutoQA Online Close Corp CCThis field is required[39m
[31m+ Company Registration NumberThis field is required[39m
[31m+ Annual TurnoverYears In OperationContact Person TitleMrContact Person NameAutoQAThis field is required[39m
[31m+ Contact Person SurnameOnlineCloseCorpContact Person Email Addressautoqa.online.closecorp@example.comThis field is required[39m
[31m+ Contact Person Mobile Number0820000602Preferred CommunicationEmailITC StatusTotal OwnersCountry Of ResidenceThis field is required[39m
[31m+ CitizenshipThis field is required[39m
[31m+ Existing RelationshipNational Credit Act (NCA) Client?Does the client have a surety? Does the client have a co-applicant?Entity Org TypeClient ClassificationBEEE LevelAddressProvinceGautengThis field is required[39m
[31m+ RegionCentr
```
**Location:** /Users/Sanele/Downloads/Autotesting/Test-ReportsHub/projects/land-bank/test-plans/opportunities/opportunity-loan-application-capture.spec.ts:190:28

### TC-07: ENTITY Opportunity Client Info and party tables — Listed Company via Landbank Branch (LEAD TC-08 / TC-09)
**Mode:** playwright-script
**Duration:** 73.4s
- [FAIL] TC-07: ENTITY Opportunity Client Info and party tables — Listed Company via Landbank Branch (LEAD TC-08 / TC-09)

**Error:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoContainText[2m([22m[32mexpected[39m[2m)[22m failed

Locator: locator('main')
Timeout: 60000ms
[32m- Expected substring  - 1[39m
[31m+ Received string     + 8[39m

[32m- ENTITY[39m
[31m+  LandBank.Crm/LBOpportunity-details v95LiveAutoQA OnlineCloseCorpDraftQualificationOpportunityOpportunity OwnerKwanele ButheleziApplication TypeEntityAccount AutoQA OnlineCloseCorpAmountR Initiate Loan ApplicationEditAudit Log Loan Application Details Tasks Notes DocumentsLandBank.Crm/opportunity-loan-application v233LiveApplication TypeEntity Client Info Loan Info FarmsEntity InformationOpportunityClose Corporation (Entity)Auto VerifyEntity NameAutoQA Online Close Corp CCThis field is required[39m
[31m+ Company Registration NumberThis field is required[39m
[31m+ Annual TurnoverYears In OperationContact Person TitleMrContact Person NameAutoQAThis field is required[39m
[31m+ Contact Person SurnameOnlineCloseCorpContact Person Email Addressautoqa.online.closecorp@example.comThis field is required[39m
[31m+ Contact Person Mobile Number0820000602Preferred CommunicationEmailITC StatusTotal OwnersCountry Of ResidenceThis field is required[39m
[31m+ CitizenshipThis field is required[39m
[31m+ Existing RelationshipNational Credit Act (NCA) Client?Does the client have a surety? Does the client have a co-applicant?Entity Org TypeClient ClassificationBEEE LevelAddressProvinceGautengThis field is required[39m
[31m+ RegionCentr
```
**Location:** /Users/Sanele/Downloads/Autotesting/Test-ReportsHub/projects/land-bank/test-plans/opportunities/opportunity-loan-application-capture.spec.ts:190:28

### TC-08: ENTITY Opportunity Client Info and party tables — Close Corporation via Online Digital Channel (LEAD TC-05)
**Mode:** playwright-script
**Duration:** 70.8s
- [FAIL] TC-08: ENTITY Opportunity Client Info and party tables — Close Corporation via Online Digital Channel (LEAD TC-05)

**Error:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoContainText[2m([22m[32mexpected[39m[2m)[22m failed

Locator: locator('main')
Timeout: 60000ms
[32m- Expected substring  - 1[39m
[31m+ Received string     + 8[39m

[32m- ENTITY[39m
[31m+  LandBank.Crm/LBOpportunity-details v95LiveAutoQA OnlineCloseCorpDraftQualificationOpportunityOpportunity OwnerKwanele ButheleziApplication TypeEntityAccount AutoQA OnlineCloseCorpAmountR Initiate Loan ApplicationEditAudit Log Loan Application Details Tasks Notes DocumentsLandBank.Crm/opportunity-loan-application v233LiveApplication TypeEntity Client Info Loan Info FarmsEntity InformationOpportunityClose Corporation (Entity)Auto VerifyEntity NameAutoQA Online Close Corp CCThis field is required[39m
[31m+ Company Registration NumberThis field is required[39m
[31m+ Annual TurnoverYears In OperationContact Person TitleMrContact Person NameAutoQAThis field is required[39m
[31m+ Contact Person SurnameOnlineCloseCorpContact Person Email Addressautoqa.online.closecorp@example.comThis field is required[39m
[31m+ Contact Person Mobile Number0820000602Preferred CommunicationEmailITC StatusTotal OwnersCountry Of ResidenceThis field is required[39m
[31m+ CitizenshipThis field is required[39m
[31m+ Existing RelationshipNational Credit Act (NCA) Client?Does the client have a surety? Does the client have a co-applicant?Entity Org TypeClient ClassificationBEEE LevelAddressProvinceGautengThis field is required[39m
[31m+ RegionCentr
```
**Location:** /Users/Sanele/Downloads/Autotesting/Test-ReportsHub/projects/land-bank/test-plans/opportunities/opportunity-loan-application-capture.spec.ts:190:28

### TC-09: ENTITY Opportunity Client Info and party tables — Close Corporation via Landbank Branch (LEAD TC-10 / TC-11)
**Mode:** playwright-script
**Duration:** 71.4s
- [FAIL] TC-09: ENTITY Opportunity Client Info and party tables — Close Corporation via Landbank Branch (LEAD TC-10 / TC-11)

**Error:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoContainText[2m([22m[32mexpected[39m[2m)[22m failed

Locator: locator('main')
Timeout: 60000ms
[32m- Expected substring  - 1[39m
[31m+ Received string     + 8[39m

[32m- ENTITY[39m
[31m+  LandBank.Crm/LBOpportunity-details v95LiveAutoQA OnlineCloseCorpDraftQualificationOpportunityOpportunity OwnerKwanele ButheleziApplication TypeEntityAccount AutoQA OnlineCloseCorpAmountR Initiate Loan ApplicationEditAudit Log Loan Application Details Tasks Notes DocumentsLandBank.Crm/opportunity-loan-application v233LiveApplication TypeEntity Client Info Loan Info FarmsEntity InformationOpportunityClose Corporation (Entity)Auto VerifyEntity NameAutoQA Online Close Corp CCThis field is required[39m
[31m+ Company Registration NumberThis field is required[39m
[31m+ Annual TurnoverYears In OperationContact Person TitleMrContact Person NameAutoQAThis field is required[39m
[31m+ Contact Person SurnameOnlineCloseCorpContact Person Email Addressautoqa.online.closecorp@example.comThis field is required[39m
[31m+ Contact Person Mobile Number0820000602Preferred CommunicationEmailITC StatusTotal OwnersCountry Of ResidenceThis field is required[39m
[31m+ CitizenshipThis field is required[39m
[31m+ Existing RelationshipNational Credit Act (NCA) Client?Does the client have a surety? Does the client have a co-applicant?Entity Org TypeClient ClassificationBEEE LevelAddressProvinceGautengThis field is required[39m
[31m+ RegionCentr
```
**Location:** /Users/Sanele/Downloads/Autotesting/Test-ReportsHub/projects/land-bank/test-plans/opportunities/opportunity-loan-application-capture.spec.ts:190:28

### TC-10: Populate the Loan Info tab and add a Loan Purpose
**Mode:** playwright-script
**Duration:** 70.4s
- [FAIL] TC-10: Populate the Loan Info tab and add a Loan Purpose

**Error:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoContainText[2m([22m[32mexpected[39m[2m)[22m failed

Locator: locator('main')
Timeout: 60000ms
[32m- Expected substring  - 1[39m
[31m+ Received string     + 8[39m

[32m- ENTITY[39m
[31m+  LandBank.Crm/LBOpportunity-details v95LiveAutoQA OnlineCloseCorpDraftQualificationOpportunityOpportunity OwnerKwanele ButheleziApplication TypeEntityAccount AutoQA OnlineCloseCorpAmountR Initiate Loan ApplicationEditAudit Log Loan Application Details Tasks Notes DocumentsLandBank.Crm/opportunity-loan-application v233LiveApplication TypeEntity Client Info Loan Info FarmsEntity InformationOpportunityClose Corporation (Entity)Auto VerifyEntity NameAutoQA Online Close Corp CCThis field is required[39m
[31m+ Company Registration NumberThis field is required[39m
[31m+ Annual TurnoverYears In OperationContact Person TitleMrContact Person NameAutoQAThis field is required[39m
[31m+ Contact Person SurnameOnlineCloseCorpContact Person Email Addressautoqa.online.closecorp@example.comThis field is required[39m
[31m+ Contact Person Mobile Number0820000602Preferred CommunicationEmailITC StatusTotal OwnersCountry Of ResidenceThis field is required[39m
[31m+ CitizenshipThis field is required[39m
[31m+ Existing RelationshipNational Credit Act (NCA) Client?Does the client have a surety? Does the client have a co-applicant?Entity Org TypeClient ClassificationBEEE LevelAddressProvinceGautengThis field is required[39m
[31m+ RegionCentr
```
**Location:** /Users/Sanele/Downloads/Autotesting/Test-ReportsHub/projects/land-bank/test-plans/opportunities/opportunity-loan-application-capture.spec.ts:190:28

### TC-11: Upload every required document on the Documents tab
**Mode:** playwright-script
**Duration:** 70.9s
- [FAIL] TC-11: Upload every required document on the Documents tab

**Error:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoContainText[2m([22m[32mexpected[39m[2m)[22m failed

Locator: locator('main')
Timeout: 60000ms
[32m- Expected substring  - 1[39m
[31m+ Received string     + 8[39m

[32m- ENTITY[39m
[31m+  LandBank.Crm/LBOpportunity-details v95LiveAutoQA OnlineCloseCorpDraftQualificationOpportunityOpportunity OwnerKwanele ButheleziApplication TypeEntityAccount AutoQA OnlineCloseCorpAmountR Initiate Loan ApplicationEditAudit Log Loan Application Details Tasks Notes DocumentsLandBank.Crm/opportunity-loan-application v233LiveApplication TypeEntity Client Info Loan Info FarmsEntity InformationOpportunityClose Corporation (Entity)Auto VerifyEntity NameAutoQA Online Close Corp CCThis field is required[39m
[31m+ Company Registration NumberThis field is required[39m
[31m+ Annual TurnoverYears In OperationContact Person TitleMrContact Person NameAutoQAThis field is required[39m
[31m+ Contact Person SurnameOnlineCloseCorpContact Person Email Addressautoqa.online.closecorp@example.comThis field is required[39m
[31m+ Contact Person Mobile Number0820000602Preferred CommunicationEmailITC StatusTotal OwnersCountry Of ResidenceThis field is required[39m
[31m+ CitizenshipThis field is required[39m
[31m+ Existing RelationshipNational Credit Act (NCA) Client?Does the client have a surety? Does the client have a co-applicant?Entity Org TypeClient ClassificationBEEE LevelAddressProvinceGautengThis field is required[39m
[31m+ RegionCentr
```
**Location:** /Users/Sanele/Downloads/Autotesting/Test-ReportsHub/projects/land-bank/test-plans/opportunities/opportunity-loan-application-capture.spec.ts:190:28

### TC-12: Document requirement sets differ by Application Type
**Mode:** playwright-script
**Duration:** 68.9s
- [FAIL] TC-12: Document requirement sets differ by Application Type

**Error:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator: locator('div[role="row"]').filter({ hasText: 'PERSONAL' }).filter({ hasText: 'DRAFT' }).first()
Expected: visible
Timeout: 60000ms
Error: element(s) not found

Call log:
[2m  - Expect "toBeVisible" with timeout 60000ms[22m
[2m  - waiting for locator('div[role="row"]').filter({ hasText: 'PERSONAL' }).filter({ hasText: 'DRAFT' }).first()[22m


  183 |     .filter({ hasText: 'DRAFT' })
  184 |     .first();
> 185 |   await expect(row).toBeVisible({ timeout: LONG });
      |                     ^
  186 |   await row.locator('a').first().click();
  187 |
  188 |   await page.waitForURL(new RegExp(OPP_DETAILS_PATH.replace(/\./g, '\\.')), { timeout: LONG });
    at openOpportunityOfType (/Users/Sanele/Downloads/Autotesting/Test-ReportsHub/projects/land-bank/test-plans/opportunities/opportunity-loan-application-capture.spec.ts:185:21)
    at /Users/Sanele/Downloads/Autotesting/Test-ReportsHub/projects/land-bank/test-plans/opportunities/opportunity-loan-application-capture.spec.ts:908:5
```
**Location:** /Users/Sanele/Downloads/Autotesting/Test-ReportsHub/projects/land-bank/test-plans/opportunities/opportunity-loan-application-capture.spec.ts:185:21

### TC-13: Initiate the loan application once capture is complete
**Mode:** playwright-script
**Duration:** 69.6s
- [FAIL] TC-13: Initiate the loan application once capture is complete

**Error:**
```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoContainText[2m([22m[32mexpected[39m[2m)[22m failed

Locator: locator('main')
Timeout: 60000ms
[32m- Expected substring  - 1[39m
[31m+ Received string     + 8[39m

[32m- ENTITY[39m
[31m+  LandBank.Crm/LBOpportunity-details v95LiveAutoQA OnlineCloseCorpDraftQualificationOpportunityOpportunity OwnerKwanele ButheleziApplication TypeEntityAccount AutoQA OnlineCloseCorpAmountR Initiate Loan ApplicationEditAudit Log Loan Application Details Tasks Notes DocumentsLandBank.Crm/opportunity-loan-application v233LiveApplication TypeEntity Client Info Loan Info FarmsEntity InformationOpportunityClose Corporation (Entity)Auto VerifyEntity NameAutoQA Online Close Corp CCThis field is required[39m
[31m+ Company Registration NumberThis field is required[39m
[31m+ Annual TurnoverYears In OperationContact Person TitleMrContact Person NameAutoQAThis field is required[39m
[31m+ Contact Person SurnameOnlineCloseCorpContact Person Email Addressautoqa.online.closecorp@example.comThis field is required[39m
[31m+ Contact Person Mobile Number0820000602Preferred CommunicationEmailITC StatusTotal OwnersCountry Of ResidenceThis field is required[39m
[31m+ CitizenshipThis field is required[39m
[31m+ Existing RelationshipNational Credit Act (NCA) Client?Does the client have a surety? Does the client have a co-applicant?Entity Org TypeClient ClassificationBEEE LevelAddressProvinceGautengThis field is required[39m
[31m+ RegionCentr
```
**Location:** /Users/Sanele/Downloads/Autotesting/Test-ReportsHub/projects/land-bank/test-plans/opportunities/opportunity-loan-application-capture.spec.ts:190:28
