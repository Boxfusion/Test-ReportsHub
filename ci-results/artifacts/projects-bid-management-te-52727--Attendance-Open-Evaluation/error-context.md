# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: projects/bid-management/test-plans/tender-process/bid-supply-chain-management.spec.ts >> BID-SCM — BID: Supply Chain Management >> TC-08: Confirm Attendance & Open Evaluation
- Location: projects/bid-management/test-plans/tender-process/bid-supply-chain-management.spec.ts:1366:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('row').filter({ hasText: 'REF2026-0988' }).filter({ hasText: 'Confirm Attendance and Open Evaluation' }).first()
Expected: visible
Timeout: 30000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByRole('row').filter({ hasText: 'REF2026-0988' }).filter({ hasText: 'Confirm Attendance and Open Evaluation' }).first() with timeout 30000ms
  - waiting for getByRole('row').filter({ hasText: 'REF2026-0988' }).filter({ hasText: 'Confirm Attendance and Open Evaluation' }).first()

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
      - row "search REF2026-1821 Maand-awe Mamathuntsha Tender Process Tender REF2026-1821 - Building Invite BEC members 31/08/2026 Evaluation In Progress 6 day(s) ago":
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
        - cell "6 day(s) ago"
      - 'row "search REF2026-1764 Maand-awe Mamathuntsha Tender Process Tender REF2026-1764 - tender101 BEC: Monitor Evaluation Progress 30/08/2026 Evaluation In Progress 7 day(s) ago"':
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
        - cell "7 day(s) ago"
      - 'row "search REF2026-1122 Maand-awe Mamathuntsha Tender Process Tender REF2026-1122 - TC-01 Automated Draft Tender run-msiqgav7 - 90/10 Compulsory Hybrid BEC: Monitor Evaluation Progress 07/08/2026 Evaluation In Progress 1 month(s) ago"':
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
        - cell "1 month(s) ago"
      - row "search REF2026-6424 System Administrator Tender Process Tender REF2026-6424 - UFS construction Monitor calibration and finalise scoring 07/08/2026 In Progress 1 month(s) ago":
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
        - cell "1 month(s) ago"
      - 'row "search REF2026-1088 Maand-awe Mamathuntsha Tender Process Tender REF2026-1088 - TC-01 Automated Draft Tender run-msi0f63c - 90/10 Compulsory Hybrid BEC: Finalise recommendation 07/08/2026 Evaluation In Progress 1 month(s) ago"':
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
        - cell "1 month(s) ago"
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
  1317 |     await expect(targetRow).toBeVisible({ timeout: 30000 });
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
> 1380 |     await expect(targetRow).toBeVisible({ timeout: 30000 });
       |                             ^ Error: expect(locator).toBeVisible() failed
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
  1418 |   // VERIFIED LIVE; spec PENDING a green run — see the navigation/click notes on the helpers
  1419 |   // (collapsed-sidebar submenus don't open under automation, so the page is reached by URL; Shesha
  1420 |   // toolbar buttons need a DOM click). Targets the TC-01 test tender at the Evaluate-Tenders stage.
  1421 |   test('TC-09: Capture Functionality Score', async ({ page }) => {
  1422 |     test.setTimeout(300_000);
  1423 |     for (const evaluator of EVALUATORS) {
  1424 |       await loginViaStorage(page, { user: evaluator.user, password: '123qwe' });
  1425 | 
  1426 |       // Reach the Capture Functionality Scores page for our tender (no usable menu — use the tender
  1427 |       // card's link from the tenders-to-evaluate list). That list is paginated and its search box
  1428 |       // matches the REF, so filter by RUN_REF first (our tender is rarely on page 1).
  1429 |       await page.goto(EVALUATE_TENDERS_URL);
  1430 |       if (RUN_REF) {
  1431 |         const search = page.getByRole('textbox').first();
  1432 |         await search.fill(RUN_REF);
  1433 |         await search.press('Enter');
  1434 |         await page.waitForLoadState('networkidle');
  1435 |       }
  1436 |       const card = page.getByRole('link', { name: RUN_REF || tenderMatch() }).first();
  1437 |       // The BACKUP evaluator only has a scorecard on tenders where TC-08 actually added them, so treat a
  1438 |       // missing card as "nothing to score for this evaluator" rather than a failure.
  1439 |       const hasCard = await card.waitFor({ state: 'visible', timeout: 30000 })
  1440 |         .then(() => true).catch(() => false);
  1441 |       if (!hasCard) {
  1442 |         console.log(`[SCORE] ${evaluator.user}: no evaluation card for ${RUN_REF || tenderMatch()} — skipping`);
  1443 |         continue;
  1444 |       }
  1445 |       const href = await card.getAttribute('href');
  1446 |       await page.goto(`${APP_URL.replace('/login', '')}${href}`);
  1447 | 
  1448 |       // ASSERT (BLOCKING) the My Score table lists the three suppliers
  1449 |       await expect(page.getByText('Capture Functionality Scores', { exact: false }).first()).toBeVisible({ timeout: 30000 });
  1450 |       await expect(page.getByRole('cell', { name: 'A & A Stationers' }).first()).toBeVisible({ timeout: 30000 });
  1451 | 
  1452 |       // Score every supplier with this evaluator's distinct points, then verify all are finalised.
  1453 |       for (const [supplier, score] of Object.entries(scoresFor(evaluator))) {
  1454 |         await scoreSupplier(page, supplier, score);
  1455 |         await expect(page.getByRole('row').filter({ hasText: supplier }).filter({ hasText: score }).first()).toBeVisible({ timeout: 15000 });
  1456 |       }
  1457 |     }
  1458 |   });
  1459 | 
  1460 |   // ADO Test Case #60815: https://dev.azure.com/boxfusion/PD-SupplyChainManagement/_workitems/edit/60815
  1461 |   // Happy path: the BEC Secretariat (ThabisoM) opens the tender at the "BEC: Monitor Evaluation Progress"
  1462 |   // stage from the Inbox, reviews the per-evaluator functionality scores, and clicks Begin Calibration to
  1463 |   // advance it to the Monitor-calibration & finalise-scoring stage (TC-11). Form
  1464 |   // tender-wf-monitor-progress-and-begin-calibration. Self-supplying: TC-09 leaves the tender here.
  1465 |   // Implemented 2026-06-05 (was a TODO stub) modelled on TC-11 + the live-verified plan note.
  1466 |   test('TC-10: BEC Secretariat: Monitor Evaluation and Begin Calibration', async ({ page }) => {
  1467 |     test.setTimeout(120_000);
  1468 |     await loginAs(page, BEC_CHAIR);
  1469 |     await openInbox(page);
  1470 |     await expect(page.getByRole('heading', { name: 'Incoming Items' })).toBeVisible({ timeout: 30000 });
  1471 |     await expect(page.getByRole('button', { name: /export/i })).toBeVisible({ timeout: 30000 });
  1472 | 
  1473 |     // STEP: open the target tender at the "BEC: Monitor Evaluation Progress" stage via its magnifying-glass.
  1474 |     await page.getByRole('heading', { name: 'Incoming Items' }).click();
  1475 |     const targetRow = page.getByRole('row')
  1476 |       .filter({ hasText: tenderMatch() })
  1477 |       .filter({ hasText: 'Monitor Evaluation Progress' })
  1478 |       .first();
  1479 |     await expect(targetRow).toBeVisible({ timeout: 30000 });
  1480 |     // Open the row by navigating to its href, not a positional click: the Workflows accordion
```