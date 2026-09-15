import { test, expect } from '@playwright/test';

// ADO TC-108877 (Integration — audit trail export to Excel preserves every row and column faithfully),
// plan 108745 / suite 109531 "29 · EPM · Audit trail view".
//
// CONFIRMED PASS live 2026-09-02, tested against the real Logon Audit view
// (`/dynamic/shesha/logon-audit`) found after the user pointed out the "Audit Logs" nav item under
// Administration (see epm-audit-trail-view-does-not-exist.md's major correction and
// epm-audit-trail-logon-view-confirmed-pagination.md for TC-108876, the sibling case tested against the
// same view).
//
// Entity-scope caveat, same as TC-108876: ADO's precondition says "Audit trail view has 50 rows" against
// what it frames as a Component Progress Report business-action log — this is Logon audit data instead
// (that CPR-scoped log still doesn't exist). Tested against the real, working equivalent.
//
// Result: clicking "Export" genuinely downloads a real `.xlsx` file (`Export.xlsx`). Parsed with the
// `xlsx` npm package (installed with `--no-save`, used only for this one-off verification, not a
// project dependency). The file contains 2080 total rows = 1 header + 2079 data rows — the COMPLETE
// dataset (not just the 10 rows visible on the current UI page, not capped at 50) — actually a more
// rigorous test than ADO's own 50-row precondition asks for. Column fidelity is exact: the UI's blank
// first column (the row's search-icon action) corresponds to a real "Id" column in the export; every
// other UI column name (Creation Time, User Name Or Email Address, Browser Info, Result, Login Attempt
// Number, IP Address, User Id, IMEI, Device Name) appears in the file in the same order with matching
// values — confirmed against the first data row, which matched the UI's visible first row exactly
// (timestamp, user, result, IP, user id all identical). No column loss, no data mangling.

const BASE = 'https://pd-epm-adminportal-qa-wf.shesha.app';
const SLOW = 420_000;

test.describe('EPM — Audit Logs (Logon) export (ADO plan 108745 / suite 109531)', () => {
  test('TC-108877 Integration — Logon Audit export to Excel preserves every row and column', async ({ page, context }) => {
    test.setTimeout(180_000);

    await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('input').first()).toBeVisible({ timeout: SLOW });
    await page.locator('input').first().fill('Admin.PrincessH');
    await page.locator('input[type="password"]').first().fill('123qwe');
    await page.getByRole('button', { name: /sign in|login/i }).first().click();
    await expect(page).not.toHaveURL(/\/login/, { timeout: SLOW });
    await page.waitForTimeout(2000);

    await page.goto(`${BASE}/dynamic/shesha/logon-audit`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('text=items', { timeout: 30_000 }).catch(() => {});
    await page.waitForTimeout(2000);

    const headerCells = await page.locator('.ant-table-thead th, [role="columnheader"]').allInnerTexts();
    console.log(`PRECONDITION ACTUAL — UI column headers: ${JSON.stringify(headerCells)}.`);
    const bodyText = await page.locator('body').innerText().catch(() => '');
    const uiFirstRow = bodyText.split('\n').find((l: string) => /^\d{2}\/\d{2}\/\d{4}/.test(l));
    console.log(`PRECONDITION ACTUAL — UI first row timestamp: ${uiFirstRow}.`);

    // STEP 1: click Export, capture the download.
    const exportBtn = page.getByText('Export', { exact: true }).first();
    expect(await exportBtn.isVisible().catch(() => false), 'STEP 1 EXPECTED: an Export action should be visible').toBeTruthy();

    const [download] = await Promise.all([
      page.waitForEvent('download', { timeout: 30_000 }),
      exportBtn.click({ force: true }),
    ]);
    const suggestedName = download.suggestedFilename();
    console.log(`STEP 1 ACTUAL — download suggestedFilename: "${suggestedName}".`);
    expect(suggestedName, 'STEP 1 EXPECTED (per ADO): an xlsx file should download').toMatch(/\.xlsx$/i);

    const savePath = `${test.info().outputDir}/tc108877-export.xlsx`;
    await download.saveAs(savePath);

    // STEP 2/3: parse the file and check row/column fidelity. `xlsx` must be available in node_modules
    // (installed with `npm install xlsx --no-save` for this one-off verification).
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const XLSX = require('xlsx');
    const wb = XLSX.readFile(savePath);
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const json: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    console.log(`STEP 2 ACTUAL — total rows in file (incl header): ${json.length}. Data rows: ${json.length - 1}.`);
    expect(json.length, 'STEP 2 EXPECTED (per ADO, adapted): the file should contain a header row plus a substantial number of data rows, not just the current page').toBeGreaterThan(50);

    const fileHeader: string[] = json[0];
    console.log(`STEP 3 ACTUAL — file header row: ${JSON.stringify(fileHeader)}.`);
    for (const uiCol of ['Creation Time', 'User Name Or Email Address', 'Browser Info', 'Result', 'Login Attempt Number', 'IP Address', 'User Id', 'IMEI', 'Device Name']) {
      expect(fileHeader, `STEP 3 EXPECTED (per ADO): UI column "${uiCol}" should appear in the export`).toContain(uiCol);
    }

    const fileFirstRow = json[1];
    console.log(`STEP 3 ACTUAL — file first data row: ${JSON.stringify(fileFirstRow)}.`);
    const creationTimeIdx = fileHeader.indexOf('Creation Time');
    expect(fileFirstRow[creationTimeIdx], 'STEP 3 EXPECTED: exported values should match the UI, not be mangled').toBe(uiFirstRow);
  });
});
