# Report: LOGIS — Invoice Tracking Process — downstream-existing-item
**Date:** 2026-09-14 09:33 UTC
**Variant:** downstream-existing-item
**Plan:** test-plans/invoice-process/logis.md
**Spec:** test-plans/invoice-process/logis.spec.ts
**Execution Mode:** playwright-script (failures pending AI-repair)
**Result:** PARTIAL
**Duration:** 59.1s

## Summary
| Total Steps | Passed | Failed | Skipped |
|-------------|--------|--------|---------|
| 5 | 2 | 1 | 2 |

## Step Results
### TC-01: Login (JohanV)
**Mode:** playwright-script
**Duration:** 2.5s
- [PASS] TC-01: Login (JohanV)

### TC-03: Certify Invoice (ADO #102216)
**Mode:** playwright-script
**Duration:** 19.3s
- [PASS] TC-03: Certify Invoice (ADO #102216)

### TC-05: Approve Invoice (ADO #102232)
**Mode:** playwright-script
**Duration:** 20.5s
- [FAIL] TC-05: Approve Invoice (ADO #102232)

**Error:**
```
Error: no inbox row for refNo="PAY4750/2026" / step="Approve Invoice" as FatimaP. Inbox holds:


  86 |     if ((await row.count()) === 0) {
  87 |       const rows = await page.getByRole('row').allInnerTexts();
> 88 |       throw new Error(
     |             ^
  89 |         `no inbox row for refNo="${refNo || '(none)'}" / step="${stepText}" as ${currentUser}. Inbox holds:\n` +
  90 |         rows.slice(0, 15).map(r => '  - ' + r.replace(/\s+/g, ' ').trim()).join('\n')
  91 |       );
    at openChainItem (C:\Users\NomfaneloNhleko\OneDrive\Test-ReportsHub\projects\PD-Invoice-Tracking\test-plans\invoice-process\logis.spec.ts:88:13)
    at C:\Users\NomfaneloNhleko\OneDrive\Test-ReportsHub\projects\PD-Invoice-Tracking\test-plans\invoice-process\logis.spec.ts:375:5
```
**Location:** C:\Users\NomfaneloNhleko\OneDrive\Test-ReportsHub\projects\PD-Invoice-Tracking\test-plans\invoice-process\logis.spec.ts:88:13

### TC-07: Assign Responsible Official (ADO #102242)
**Mode:** playwright-script
**Duration:** 0.0s
- [SKIP] TC-07: Assign Responsible Official (ADO #102242)

### TC-08: Verify Invoice (ADO #102246)
**Mode:** playwright-script
**Duration:** 0.0s
- [SKIP] TC-08: Verify Invoice (ADO #102246)
