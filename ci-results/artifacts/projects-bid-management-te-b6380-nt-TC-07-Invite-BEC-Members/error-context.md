# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: projects/bid-management/test-plans/tender-process/bid-supply-chain-management.spec.ts >> BID-SCM — BID: Supply Chain Management >> TC-07: Invite BEC Members
- Location: projects/bid-management/test-plans/tender-process/bid-supply-chain-management.spec.ts:1302:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('row').filter({ hasText: 'REF2026-0982' }).filter({ hasText: 'Invite BEC members' }).first()
Expected: visible
Timeout: 30000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByRole('row').filter({ hasText: 'REF2026-0982' }).filter({ hasText: 'Invite BEC members' }).first() with timeout 30000ms
  - waiting for getByRole('row').filter({ hasText: 'REF2026-0982' }).filter({ hasText: 'Invite BEC members' }).first()

```

```yaml
- complementary:
  - menu:
    - menuitem "container Bid Management":
      - img "container"
      - text: Bid Management
    - menuitem "menu-unfold SupplyChain Management":
      - img "menu-unfold"
      - text: SupplyChain Management
    - menuitem "file-text Contract Management":
      - img "file-text"
      - text: Contract Management
    - menuitem "apartment Workflows":
      - img "apartment"
      - text: Workflows
    - menuitem "account-book Requisition":
      - img "account-book"
      - text: Requisition
    - menuitem "setting Configurations":
      - img "setting"
      - text: Configurations
    - menuitem "tool Administration":
      - img "tool"
      - text: Administration
  - img "menu-unfold"
- banner:
  - button "edit":
    - img "edit"
  - paragraph: Shesha/header v9
  - text: Live
  - img "close"
  - link:
    - /url: /
    - img
  - text: Live Mode
  - switch "Switch to Edit mode"
  - img "block"
  - text: Latest Thabiso Maake
  - img "down"
  - img "user"
- main:
  - button "edit":
    - img "edit"
  - paragraph: Shesha.Workflow/workflows-inbox v7
  - text: Live
  - img "close"
  - heading "Incoming Items" [level=4]
  - textbox
  - button "search":
    - img "search"
  - button "filter":
    - img "filter"
  - button "sliders":
    - img "sliders"
  - list:
    - listitem: 1-10 of 134 items
    - listitem "Previous Page":
      - button "left" [disabled]:
        - img "left"
    - listitem "1"
    - listitem "2"
    - listitem "3"
    - listitem "Next 3 Pages":
      - img "double-right"
      - text: •••
    - listitem "14"
    - listitem "Next Page":
      - button "right":
        - img "right"
    - listitem:
      - combobox "Page Size"
      - text: 10 / page
  - button "reload":
    - img "reload"
  - button "download Export":
    - img "download"
    - text: Export
  - table:
    - row "Ref No Initiator Type Name Action Required Received Date Target Date Status Period In Possession":
      - columnheader
      - columnheader "Ref No":
        - text: Ref No
        - separator
      - columnheader "Initiator":
        - text: Initiator
        - separator
      - columnheader "Type":
        - text: Type
        - separator
      - columnheader "Name":
        - text: Name
        - separator
      - columnheader "Action Required":
        - text: Action Required
        - separator
      - columnheader "Received Date":
        - text: Received Date
        - separator
      - columnheader "Target Date":
        - text: Target Date
        - separator
      - columnheader "Status":
        - text: Status
        - separator
      - columnheader "Period In Possession":
        - text: Period In Possession
        - separator
    - rowgroup:
      - row "search REF2026-1821 Maand-awe Mamathuntsha Tender Process Tender REF2026-1821 - Building Invite BEC members 31/08/2026 Evaluation In Progress 5 day(s) ago":
        - cell "search":
          - link "search":
            - /url: /shesha/workflow-action?id=30fa0790-3e61-46a2-bcac-d933a96333b8&todoid=43596ac3-e0d1-46e5-ae6a-f66236daf178
            - img "search"
        - cell "REF2026-1821"
        - cell "Maand-awe Mamathuntsha"
        - cell "Tender Process"
        - cell "Tender REF2026-1821 - Building"
        - cell "Invite BEC members"
        - cell "31/08/2026"
        - cell
        - cell "Evaluation In Progress"
        - cell "5 day(s) ago"
      - 'row "search REF2026-1764 Maand-awe Mamathuntsha Tender Process Tender REF2026-1764 - tender101 BEC: Monitor Evaluation Progress 30/08/2026 Evaluation In Progress 6 day(s) ago"':
        - cell "search":
          - link "search":
            - /url: /shesha/workflow-action?id=06c771f6-e027-475d-8752-6897fcce29df&todoid=8792a085-1d25-4706-907a-184ae385b43f
            - img "search"
        - cell "REF2026-1764"
        - cell "Maand-awe Mamathuntsha"
        - cell "Tender Process"
        - cell "Tender REF2026-1764 - tender101"
        - 'cell "BEC: Monitor Evaluation Progress"'
        - cell "30/08/2026"
        - cell
        - cell "Evaluation In Progress"
        - cell "6 day(s) ago"
      - 'row "search REF2026-1122 Maand-awe Mamathuntsha Tender Process Tender REF2026-1122 - TC-01 Automated Draft Tender run-msiqgav7 - 90/10 Compulsory Hybrid BEC: Monitor Evaluation Progress 07/08/2026 Evaluation In Progress 29 day(s) ago"':
        - cell "search":
          - link "search":
            - /url: /shesha/workflow-action?id=4e36f3ff-352d-4cf5-8fe8-9505b8e00ac4&todoid=23fc7213-b4dd-4e3c-ad97-73bdc0c50bb2
            - img "search"
        - cell "REF2026-1122"
        - cell "Maand-awe Mamathuntsha"
        - cell "Tender Process"
        - cell "Tender REF2026-1122 - TC-01 Automated Draft Tender run-msiqgav7 - 90/10 Compulsory Hybrid"
        - 'cell "BEC: Monitor Evaluation Progress"'
        - cell "07/08/2026"
        - cell
        - cell "Evaluation In Progress"
        - cell "29 day(s) ago"
      - row "search REF2026-6424 System Administrator Tender Process Tender REF2026-6424 - UFS construction Monitor calibration and finalise scoring 07/08/2026 In Progress 29 day(s) ago":
        - cell "search":
          - link "search":
            - /url: /shesha/workflow-action?id=bffe0eed-8908-4a71-82ea-f2693068a76b&todoid=bddfe5a1-d89c-4d66-9c23-7e02e2818b55
            - img "search"
        - cell "REF2026-6424"
        - cell "System Administrator"
        - cell "Tender Process"
        - cell "Tender REF2026-6424 - UFS construction"
        - cell "Monitor calibration and finalise scoring"
        - cell "07/08/2026"
        - cell
        - cell "In Progress"
        - cell "29 day(s) ago"
      - 'row "search REF2026-1088 Maand-awe Mamathuntsha Tender Process Tender REF2026-1088 - TC-01 Automated Draft Tender run-msi0f63c - 90/10 Compulsory Hybrid BEC: Finalise recommendation 07/08/2026 Evaluation In Progress 29 day(s) ago"':
        - cell "search":
          - link "search":
            - /url: /shesha/workflow-action?id=a980c03c-2e5c-42d4-a2ee-278d0c4ce0e3&todoid=36aaf337-aceb-48f2-9389-fe189ebfe7ad
            - img "search"
        - cell "REF2026-1088"
        - cell "Maand-awe Mamathuntsha"
        - cell "Tender Process"
        - cell "Tender REF2026-1088 - TC-01 Automated Draft Tender run-msi0f63c - 90/10 Compulsory Hybrid"
        - 'cell "BEC: Finalise recommendation"'
        - cell "07/08/2026"
        - cell
        - cell "Evaluation In Progress"
        - cell "29 day(s) ago"
      - 'row "search REF2026-1019 Thabiso Maake Tender Process Tender REF2026-1019 - Test statuses BEC: Monitor Evaluation Progress 06/08/2026 Evaluation In Progress 1 month(s) ago"':
        - cell "search":
          - link "search":
            - /url: /shesha/workflow-action?id=8bdb8d64-6afa-4626-bb1b-48d0e7a31a61&todoid=6d976e0e-5788-4012-861f-698faee9808b
            - img "search"
        - cell "REF2026-1019"
        - cell "Thabiso Maake"
        - cell "Tender Process"
        - cell "Tender REF2026-1019 - Test statuses"
        - 'cell "BEC: Monitor Evaluation Progress"'
        - cell "06/08/2026"
        - cell
        - cell "Evaluation In Progress"
        - cell "1 month(s) ago"
      - row "search REF2026-0924 Maand-awe Mamathuntsha Tender Process Tender REF2026-0924 - Close button not responding (Appprove Recommendation from BAC) Confirm Attendance and Open Evaluation 04/08/2026 Evaluation In Progress 1 month(s) ago":
        - cell "search":
          - link "search":
            - /url: /shesha/workflow-action?id=6238ae36-eedc-4c03-9c9f-375bf1c28177&todoid=e0029649-e4e7-4051-bf48-79a134576f81
            - img "search"
        - cell "REF2026-0924"
        - cell "Maand-awe Mamathuntsha"
        - cell "Tender Process"
        - cell "Tender REF2026-0924 - Close button not responding (Appprove Recommendation from BAC)"
        - cell "Confirm Attendance and Open Evaluation"
        - cell "04/08/2026"
        - cell
        - cell "Evaluation In Progress"
        - cell "1 month(s) ago"
      - row "search REF2026-1100 Maand-awe Mamathuntsha Tender Process Tender REF2026-1100 - testing supplier portal (expires withut submitting) Invite BEC members 31/07/2026 Evaluation In Progress 2 month(s) ago":
        - cell "search":
          - link "search":
            - /url: /shesha/workflow-action?id=e04f1ac4-3936-457c-8316-98e8d375e522&todoid=f6b42c81-cea7-41bf-9a78-5fe29a4b0707
            - img "search"
        - cell "REF2026-1100"
        - cell "Maand-awe Mamathuntsha"
        - cell "Tender Process"
        - cell "Tender REF2026-1100 - testing supplier portal (expires withut submitting)"
        - cell "Invite BEC members"
        - cell "31/07/2026"
        - cell
        - cell "Evaluation In Progress"
        - cell "2 month(s) ago"
      - 'row "search REF2026-0939 Maand-awe Mamathuntsha Tender Process Tender REF2026-0939 - TC-01 Automated Draft Tender run-ms61n9fs - 90/10 Compulsory Hybrid BEC: Monitor Evaluation Progress 29/07/2026 Evaluation In Progress 2 month(s) ago"':
        - cell "search":
          - link "search":
            - /url: /shesha/workflow-action?id=78d57452-5e36-46bb-867f-d3702465f163&todoid=3fc50e9f-aae3-4f03-b5a1-a2e67a02f36f
            - img "search"
        - cell "REF2026-0939"
        - cell "Maand-awe Mamathuntsha"
        - cell "Tender Process"
        - cell "Tender REF2026-0939 - TC-01 Automated Draft Tender run-ms61n9fs - 90/10 Compulsory Hybrid"
        - 'cell "BEC: Monitor Evaluation Progress"'
        - cell "29/07/2026"
        - cell
        - cell "Evaluation In Progress"
        - cell "2 month(s) ago"
      - row "search REF2026-0933 Maand-awe Mamathuntsha Tender Process Tender REF2026-0933 - TC-01 Automated Draft Tender run-ms60uytx - 90/10 Compulsory Hybrid Invite BEC members 29/07/2026 Evaluation In Progress 2 month(s) ago":
        - cell "search":
          - link "search":
            - /url: /shesha/workflow-action?id=2f285d0c-0405-494f-85e0-9addc1e2a4f8&todoid=bd189c4d-9904-4655-8993-31415bb1f292
            - img "search"
        - cell "REF2026-0933"
        - cell "Maand-awe Mamathuntsha"
        - cell "Tender Process"
        - cell "Tender REF2026-0933 - TC-01 Automated Draft Tender run-ms60uytx - 90/10 Compulsory Hybrid"
        - cell "Invite BEC members"
        - cell "29/07/2026"
        - cell
        - cell "Evaluation In Progress"
        - cell "2 month(s) ago"
- alert
```

# Test source

```ts
  1217 |       `tender ${tenderMatch()} is STILL at Verify Compliance after Submit — the stage did not advance`,
  1218 |     ).toHaveCount(0, { timeout: 30000 });
  1219 |   });
  1220 | 
  1221 |   // ADO Test Case #60812: https://dev.azure.com/boxfusion/PD-SupplyChainManagement/_workitems/edit/60812
  1222 |   // Happy path: TumisangM opens a tender at the Calculate-Specific-Goal-Points stage, captures a
  1223 |   // (different) Specific Goal Points score for each supplier response, uploads the calculation
  1224 |   // spreadsheet, confirms and submits — the tender advances. Self-supplying: targets a TC-01 test
  1225 |   // tender that a prior TC-05 run passed through compliance.
  1226 |   test('TC-06: Capture Pricing and Specific Goals', async ({ page }) => {
  1227 |     test.setTimeout(180_000);
  1228 |     await loginAs(page, PUBLISHER);
  1229 |     await openInbox(page);
  1230 | 
  1231 |     // ASSERT Inbox list and Export button are shown
  1232 |     await expect(page.getByRole('heading', { name: 'Incoming Items' })).toBeVisible({ timeout: 30000 });
  1233 |     await expect(page.getByRole('button', { name: /export/i })).toBeVisible({ timeout: 30000 });
  1234 | 
  1235 |     // STEP: open a "Calculate Specific Goal Points" tender (one of our TC-01 test tenders)
  1236 |     await page.getByRole('heading', { name: 'Incoming Items' }).click();
  1237 |     const targetRow = page.getByRole('row')
  1238 |       .filter({ hasText: tenderMatch() })
  1239 |       .filter({ hasText: 'Calculate Specific Goal Points' })
  1240 |       .first();
  1241 |     await expect(targetRow).toBeVisible({ timeout: 30000 });
  1242 |     // Open the row by navigating to its href, not a positional click: the Workflows accordion
  1243 |     // flyout ("My Items" nav-link) can overlap the table and intercept the click. goto avoids that.
  1244 |     const rowHref = await targetRow.getByRole('link').first().getAttribute('href');
  1245 |     await page.goto(rowHref.startsWith('http') ? rowHref : `${APP_URL.replace('/login', '')}${rowHref}`);
  1246 |     await page.waitForURL(/workflow-action/, { timeout: 30000 });
  1247 | 
  1248 |     // ASSERT (BLOCKING) the item opens on the Calculate Specific Goal Points page
  1249 |     await expectOnPage(page, 'Calculate Specific Goal Points:');
  1250 | 
  1251 |     // NEGATIVE (opt-in SEND_BACKS): send this stage back to "Verify Compliance", have that actor re-action
  1252 |     // it, then return here and carry on with the happy path — the chain still completes.
  1253 |     await sendBackAndReturn(page, { stageNo: 6, stage: 'Calculate Specific Goal Points', previous: 'Verify Compliance', actor: PUBLISHER });
  1254 | 
  1255 |     // STEP: capture a DIFFERENT Specific Goal Points score for each supplier (inline row edit).
  1256 |     // Scope to the responses table (the one with a Specific Goal Points column AND edit buttons).
  1257 |     const goalTable = page.getByRole('table')
  1258 |       .filter({ has: page.getByRole('columnheader', { name: 'Specific Goal Points' }) })
  1259 |       .filter({ has: page.getByRole('button', { name: 'edit' }) });
  1260 |     const editButtons = goalTable.getByRole('button', { name: 'edit' });
  1261 |     await expect(editButtons.first()).toBeVisible({ timeout: 30000 });
  1262 |     const supplierCount = await editButtons.count();
  1263 |     expect(supplierCount).toBeGreaterThan(0);
  1264 |     const scores = ['8', '10', '6', '9', '7', '5'];
  1265 |     for (let i = 0; i < supplierCount; i++) {
  1266 |       await editButtons.nth(i).click();
  1267 |       // Only the editing row exposes a spinbutton + comment textbox inside the table.
  1268 |       await goalTable.getByRole('spinbutton').fill(scores[i % scores.length]);
  1269 |       await goalTable.getByRole('textbox').first().fill(`Specific goal points for supplier ${i + 1}`);
  1270 |       await goalTable.getByRole('button', { name: 'save' }).click();
  1271 |       // Wait for the row to fully finish saving (it briefly shows a loading spinner and keeps its
  1272 |       // spinbutton); only then is the table clean for the next row's edit.
  1273 |       await expect(goalTable.getByRole('spinbutton')).toHaveCount(0, { timeout: 15000 });
  1274 |     }
  1275 | 
  1276 |     // STEP: upload the mandatory calculation spreadsheet
  1277 |     await uploadFile(page, formItem(page, 'Calculation spreadsheet').getByRole('button', { name: /press to upload/i }), PDF_FIXTURE);
  1278 | 
  1279 |     // STEP: confirm and submit
  1280 |     await page.locator('div')
  1281 |       .filter({ hasText: 'captured the information accurately' })
  1282 |       .filter({ has: page.getByRole('checkbox') })
  1283 |       .last()
  1284 |       .getByRole('checkbox')
  1285 |       .check();
  1286 |     const submit = page.getByRole('button', { name: 'Submit', exact: true });
  1287 |     await expect(submit).toBeEnabled({ timeout: 15000 });
  1288 | 
  1289 |     // ASSERT (BLOCKING) the scoring submits and advances out of the Calculate Specific Goal Points
  1290 |     // stage. The slow app sometimes swallows the first Submit, so retry the click until it advances.
  1291 |     await clickOnceAndAwait(submit, async () => {
  1292 |       const gone = !(await page.getByText('Calculate Specific Goal Points:').first().isVisible().catch(() => false));
  1293 |       return gone || /workflows-(my-items|inbox)/.test(page.url());
  1294 |     }, 'Calculate Specific Goal Points');
  1295 |   });
  1296 | 
  1297 |   // ADO Test Case #60813: https://dev.azure.com/boxfusion/PD-SupplyChainManagement/_workitems/edit/60813
  1298 |   // Happy path: the BEC chair (ThabisoM) opens a tender at the Invite-BEC-members stage, captures
  1299 |   // the meeting details, invites three evaluators, confirms and submits — the tender advances to
  1300 |   // Confirm Attendance & Open Evaluation. Self-supplying: targets a TC-01 test tender that a prior
  1301 |   // run advanced to this stage.
  1302 |   test('TC-07: Invite BEC Members', async ({ page }) => {
  1303 |     test.setTimeout(180_000);
  1304 |     await loginAs(page, BEC_CHAIR);
  1305 |     await openInbox(page);
  1306 | 
  1307 |     // ASSERT Inbox list and Export button are shown
  1308 |     await expect(page.getByRole('heading', { name: 'Incoming Items' })).toBeVisible({ timeout: 30000 });
  1309 |     await expect(page.getByRole('button', { name: /export/i })).toBeVisible({ timeout: 30000 });
  1310 | 
  1311 |     // STEP: open an "Invite BEC members" tender (one of our TC-01 test tenders)
  1312 |     await page.getByRole('heading', { name: 'Incoming Items' }).click();
  1313 |     const targetRow = page.getByRole('row')
  1314 |       .filter({ hasText: tenderMatch() })
  1315 |       .filter({ hasText: 'Invite BEC members' })
  1316 |       .first();
> 1317 |     await expect(targetRow).toBeVisible({ timeout: 30000 });
       |                             ^ Error: expect(locator).toBeVisible() failed
  1318 |     // Open the row by navigating to its href, not a positional click: the Workflows accordion
  1319 |     // flyout ("My Items" nav-link) can overlap the table and intercept the click. goto avoids that.
  1320 |     const rowHref = await targetRow.getByRole('link').first().getAttribute('href');
  1321 |     await page.goto(rowHref.startsWith('http') ? rowHref : `${APP_URL.replace('/login', '')}${rowHref}`);
  1322 |     await page.waitForURL(/workflow-action/, { timeout: 30000 });
  1323 | 
  1324 |     // ASSERT (BLOCKING) the item opens on the Invite BEC members page
  1325 |     await expectOnPage(page, 'Invite BEC members:');
  1326 | 
  1327 |     // NEGATIVE (opt-in SEND_BACKS): send this stage back to "Calculate Specific Goal Points", have that actor re-action
  1328 |     // it, then return here and carry on with the happy path — the chain still completes.
  1329 |     await sendBackAndReturn(page, { stageNo: 7, stage: 'Invite BEC members', previous: 'Calculate Specific Goal Points', actor: BEC_CHAIR });
  1330 | 
  1331 |     // STEP: invite the three evaluators FIRST (search by name; Job Title + Email auto-fill on
  1332 |     // select). Adding evaluators re-renders the form, so do this before filling the text fields.
  1333 |     await addBecEvaluator(page, 'Nathi', 'Nkosinathi Sibiya');
  1334 |     await addBecEvaluator(page, 'Nelly', 'Nelly Tears');
  1335 |     await addBecEvaluator(page, 'Thabitha', 'Thabitha Modula');
  1336 | 
  1337 |     // STEP: capture the BEC meeting details (link, venue, then date+time via picker)
  1338 |     await formItem(page, 'Meeting Link').getByRole('textbox').fill('https://teams.microsoft.com/l/meetup-join/tc08-bec-meeting');
  1339 |     await formItem(page, 'Venue').getByRole('textbox').fill('Boardroom B, Head Office');
  1340 |     await pickAntDateTime(page, formItem(page, 'Meeting date and time').getByRole('textbox'), BEC_MEETING_DATE, '14');
  1341 | 
  1342 |     // STEP: confirm and submit
  1343 |     await page.locator('div')
  1344 |       .filter({ hasText: 'invited all the relevant attendees' })
  1345 |       .filter({ has: page.getByRole('checkbox') })
  1346 |       .last()
  1347 |       .getByRole('checkbox')
  1348 |       .check();
  1349 |     const submit = page.getByRole('button', { name: 'Submit', exact: true });
  1350 |     await expect(submit).toBeEnabled({ timeout: 15000 });
  1351 | 
  1352 |     // The slow app sometimes swallows the first Submit, so retry until it advances.
  1353 |     await clickOnceAndAwait(submit, async () => {
  1354 |       const gone = !(await page.getByText('Invite BEC members:').first().isVisible().catch(() => false));
  1355 |       return gone || /workflows-(my-items|inbox)/.test(page.url());
  1356 |     }, 'Invite BEC members');
  1357 |   });
  1358 | 
  1359 |   // ADO Test Case #60814: https://dev.azure.com/boxfusion/PD-SupplyChainManagement/_workitems/edit/60814
  1360 |   // Happy path: ThabisoM opens a tender at the Confirm-Attendance stage, adds a backup evaluator
  1361 |   // (Maand-awe Mamathuntsha) marked present, marks the three invited evaluators present, then Opens
  1362 |   // Evaluation — the tender advances to BEC: Monitor Evaluation Progress. Self-supplying: targets a
  1363 |   // TC-01 test tender that a prior TC-07 run advanced to this stage.
  1364 |   // NOTE (2026-07-30): the add-row requires "Is Present?" to be ticked before it will commit — an
  1365 |   // attendee cannot be added as absent at this stage (test lead). See addBecEvaluator(…, markPresent).
  1366 |   test('TC-08: Confirm Attendance & Open Evaluation', async ({ page }) => {
  1367 |     test.setTimeout(180_000);
  1368 |     await loginAs(page, BEC_CHAIR);
  1369 |     await openInbox(page);
  1370 | 
  1371 |     await expect(page.getByRole('heading', { name: 'Incoming Items' })).toBeVisible({ timeout: 30000 });
  1372 |     await expect(page.getByRole('button', { name: /export/i })).toBeVisible({ timeout: 30000 });
  1373 | 
  1374 |     // STEP: open a "Confirm Attendance and Open Evaluation" tender (one of our TC-01 test tenders)
  1375 |     await page.getByRole('heading', { name: 'Incoming Items' }).click();
  1376 |     const targetRow = page.getByRole('row')
  1377 |       .filter({ hasText: tenderMatch() })
  1378 |       .filter({ hasText: 'Confirm Attendance and Open Evaluation' })
  1379 |       .first();
  1380 |     await expect(targetRow).toBeVisible({ timeout: 30000 });
  1381 |     // Open the row by navigating to its href, not a positional click: the Workflows accordion
  1382 |     // flyout ("My Items" nav-link) can overlap the table and intercept the click. goto avoids that.
  1383 |     const rowHref = await targetRow.getByRole('link').first().getAttribute('href');
  1384 |     await page.goto(rowHref.startsWith('http') ? rowHref : `${APP_URL.replace('/login', '')}${rowHref}`);
  1385 |     await page.waitForURL(/workflow-action/, { timeout: 30000 });
  1386 | 
  1387 |     // ASSERT (BLOCKING) the item opens on the Confirm Attendance & Open Evaluation page
  1388 |     await expectOnPage(page, 'Confirm Attendance and Open Evaluation:');
  1389 | 
  1390 |     // NEGATIVE (opt-in SEND_BACKS): send this stage back to "Invite BEC members", have that actor re-action
  1391 |     // it, then return here and carry on with the happy path — the chain still completes.
  1392 |     await sendBackAndReturn(page, { stageNo: 8, stage: 'Confirm Attendance and Open Evaluation', previous: 'Invite BEC members', actor: BEC_CHAIR });
  1393 | 
  1394 |     // STEP: add a backup evaluator (Maand-awe), MARKED PRESENT.
  1395 |     // Requirement clarified by the test lead on 2026-07-30: at this stage an attendee can only be
  1396 |     // added if "Is Present?" is ticked in the add-row. The add failing without it is the app enforcing
  1397 |     // that rule — NOT the inline-grid flakiness this step was blamed for from 2026-06-03 to
  1398 |     // 2026-07-29 (it was a soft failure for that reason; it is a hard assertion again now).
  1399 |     await addBecEvaluator(page, 'Mamathuntsha', 'Maand-awe Mamathuntsha', true);
  1400 | 
  1401 |     // STEP: mark the three invited evaluators as present
  1402 |     await markAttendeePresent(page, 'Nkosinathi Sibiya');
  1403 |     await markAttendeePresent(page, 'Nelly Tears');
  1404 |     await markAttendeePresent(page, 'Thabitha Modula');
  1405 | 
  1406 |     // STEP: open the evaluation
  1407 |     const openEval = page.getByRole('button', { name: 'Open Evaluation', exact: true });
  1408 |     await expect(openEval).toBeEnabled({ timeout: 15000 });
  1409 |     await clickOnceAndAwait(openEval, async () => {
  1410 |       const gone = !(await page.getByText('Confirm Attendance and Open Evaluation:').first().isVisible().catch(() => false));
  1411 |       return gone || /workflows-(my-items|inbox)/.test(page.url());
  1412 |     }, 'Confirm Attendance');
  1413 |   });
  1414 | 
  1415 |   // ADO Test Case #60821: https://dev.azure.com/boxfusion/PD-SupplyChainManagement/_workitems/edit/60821
  1416 |   // Happy path: each BEC evaluator (Nathi, Nelly, Thabitha) logs in and scores all three suppliers
  1417 |   // with distinct points so a best supplier (A & A Stationers) emerges.
```