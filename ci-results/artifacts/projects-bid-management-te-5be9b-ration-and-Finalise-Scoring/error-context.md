# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: projects/bid-management/test-plans/tender-process/bid-supply-chain-management.spec.ts >> BID-SCM — BID: Supply Chain Management >> TC-11: BEC Secretariat: Monitor Calibration and Finalise Scoring
- Location: projects/bid-management/test-plans/tender-process/bid-supply-chain-management.spec.ts:1509:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('row').filter({ hasText: 'REF2026-1986' }).filter({ hasText: 'Monitor calibration and finalise scoring' }).first()
Expected: visible
Timeout: 30000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByRole('row').filter({ hasText: 'REF2026-1986' }).filter({ hasText: 'Monitor calibration and finalise scoring' }).first() with timeout 30000ms
  - waiting for getByRole('row').filter({ hasText: 'REF2026-1986' }).filter({ hasText: 'Monitor calibration and finalise scoring' }).first()

```

```yaml
- complementary:
  - menu:
    - menuitem "menu-unfold SupplyChain Management":
      - img "menu-unfold"
      - text: SupplyChain Management
    - menuitem "container Bid Management":
      - img "container"
      - text: Bid Management
    - menuitem "file-text Contract Management":
      - img "file-text"
      - text: Contract Management
    - menuitem "account-book Requisition":
      - img "account-book"
      - text: Requisition
    - menuitem "apartment Workflows":
      - img "apartment"
      - text: Workflows
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
    - listitem: 1-10 of 141 items
    - listitem "Previous Page":
      - button "left" [disabled]:
        - img "left"
    - listitem "1"
    - listitem "2"
    - listitem "3"
    - listitem "Next 3 Pages":
      - img "double-right"
      - text: •••
    - listitem "15"
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
      - row "search REF2026-1986 Maand-awe Mamathuntsha Tender Process Tender REF2026-1986 - TC-01 Automated Draft Tender run-mvomywvk - 90/10 Compulsory Hybrid Invite BEC members 26/10/2026 Evaluation In Progress 7 minute(s) ago":
        - cell "search":
          - link "search":
            - /url: /shesha/workflow-action?id=15213ec2-5309-4bfb-83ca-d4365f8e1283&todoid=671954a0-2696-4a90-97fa-2b50e89f1adf
            - img "search"
        - cell "REF2026-1986"
        - cell "Maand-awe Mamathuntsha"
        - cell "Tender Process"
        - cell "Tender REF2026-1986 - TC-01 Automated Draft Tender run-mvomywvk - 90/10 Compulsory Hybrid"
        - cell "Invite BEC members"
        - cell "26/10/2026"
        - cell
        - cell "Evaluation In Progress"
        - cell "7 minute(s) ago"
      - 'row "search REF2026-1695 Maand-awe Mamathuntsha Tender Process Tender REF2026-1695 - TC-01 Automated Draft Tender run-mv6av5y1 - 90/10 Compulsory Hybrid BEC: Monitor Evaluation Progress 22/10/2026 Evaluation In Progress 3 day(s) ago"':
        - cell "search":
          - link "search":
            - /url: /shesha/workflow-action?id=7d579449-5974-40e5-9e26-6e91b6001941&todoid=81aa5965-1086-4d3f-9ddf-3b8075aac509
            - img "search"
        - cell "REF2026-1695"
        - cell "Maand-awe Mamathuntsha"
        - cell "Tender Process"
        - cell "Tender REF2026-1695 - TC-01 Automated Draft Tender run-mv6av5y1 - 90/10 Compulsory Hybrid"
        - 'cell "BEC: Monitor Evaluation Progress"'
        - cell "22/10/2026"
        - cell
        - cell "Evaluation In Progress"
        - cell "3 day(s) ago"
      - row "search REF2026-1283 Maand-awe Mamathuntsha Tender Process Tender REF2026-1283 - TC-01 Automated Draft Tender run-mv0bl1se - 90/10 Compulsory Hybrid Invite BEC members 09/10/2026 Evaluation In Progress 17 day(s) ago":
        - cell "search":
          - link "search":
            - /url: /shesha/workflow-action?id=dd42c260-3778-427c-901c-13744c858428&todoid=a23196e1-f6ee-4c0e-b0d8-7d3765985c72
            - img "search"
        - cell "REF2026-1283"
        - cell "Maand-awe Mamathuntsha"
        - cell "Tender Process"
        - cell "Tender REF2026-1283 - TC-01 Automated Draft Tender run-mv0bl1se - 90/10 Compulsory Hybrid"
        - cell "Invite BEC members"
        - cell "09/10/2026"
        - cell
        - cell "Evaluation In Progress"
        - cell "17 day(s) ago"
      - row "search REF2026-1054 Maand-awe Mamathuntsha Tender Process Tender REF2026-1054 - TC-01 Automated Draft Tender run-muw9i1xu - 90/10 Compulsory Hybrid Invite BEC members 06/10/2026 Evaluation In Progress 19 day(s) ago":
        - cell "search":
          - link "search":
            - /url: /shesha/workflow-action?id=0fe2020b-5bfa-4ca7-bb04-6242be0053bd&todoid=b0fea5ed-e77f-4e24-9630-267a8232adfc
            - img "search"
        - cell "REF2026-1054"
        - cell "Maand-awe Mamathuntsha"
        - cell "Tender Process"
        - cell "Tender REF2026-1054 - TC-01 Automated Draft Tender run-muw9i1xu - 90/10 Compulsory Hybrid"
        - cell "Invite BEC members"
        - cell "06/10/2026"
        - cell
        - cell "Evaluation In Progress"
        - cell "19 day(s) ago"
      - row "search REF2026-1029 Maand-awe Mamathuntsha Tender Process Tender REF2026-1029 - TC-01 Automated Draft Tender run-murqwjzg - 90/10 Compulsory Hybrid Invite BEC members 03/10/2026 Evaluation In Progress 23 day(s) ago":
        - cell "search":
          - link "search":
            - /url: /shesha/workflow-action?id=8a825ea2-e32d-47fc-84e2-20e896f51dd5&todoid=2f083945-7282-403e-9894-4ad5dbe88c17
            - img "search"
        - cell "REF2026-1029"
        - cell "Maand-awe Mamathuntsha"
        - cell "Tender Process"
        - cell "Tender REF2026-1029 - TC-01 Automated Draft Tender run-murqwjzg - 90/10 Compulsory Hybrid"
        - cell "Invite BEC members"
        - cell "03/10/2026"
        - cell
        - cell "Evaluation In Progress"
        - cell "23 day(s) ago"
      - row "search REF2026-1012 Maand-awe Mamathuntsha Tender Process Tender REF2026-1012 - TC-01 Automated Draft Tender run-muq0wyvp - 90/10 Compulsory Hybrid Confirm Attendance and Open Evaluation 01/10/2026 Evaluation In Progress 24 day(s) ago":
        - cell "search":
          - link "search":
            - /url: /shesha/workflow-action?id=ce23b6a1-33a3-4605-a4a4-fd503edc996e&todoid=24ffc60a-1709-4782-91bb-34fff0e68602
            - img "search"
        - cell "REF2026-1012"
        - cell "Maand-awe Mamathuntsha"
        - cell "Tender Process"
        - cell "Tender REF2026-1012 - TC-01 Automated Draft Tender run-muq0wyvp - 90/10 Compulsory Hybrid"
        - cell "Confirm Attendance and Open Evaluation"
        - cell "01/10/2026"
        - cell
        - cell "Evaluation In Progress"
        - cell "24 day(s) ago"
      - row "search REF2026-1831 Maand-awe Mamathuntsha Tender Process Tender REF2026-1831 - TC-01 Automated Draft Tender run-mu50z36z - 90/10 Compulsory Hybrid Invite BEC members 17/09/2026 Evaluation In Progress 1 month(s) ago":
        - cell "search":
          - link "search":
            - /url: /shesha/workflow-action?id=0e593980-1560-44c7-b776-819dfd6cb71d&todoid=db8bad5d-3160-400f-90b3-55f118a80220
            - img "search"
        - cell "REF2026-1831"
        - cell "Maand-awe Mamathuntsha"
        - cell "Tender Process"
        - cell "Tender REF2026-1831 - TC-01 Automated Draft Tender run-mu50z36z - 90/10 Compulsory Hybrid"
        - cell "Invite BEC members"
        - cell "17/09/2026"
        - cell
        - cell "Evaluation In Progress"
        - cell "1 month(s) ago"
      - row "search REF2026-1821 Maand-awe Mamathuntsha Tender Process Tender REF2026-1821 - Building Invite BEC members 31/08/2026 Evaluation In Progress 1 month(s) ago":
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
        - cell "1 month(s) ago"
      - 'row "search REF2026-1764 Maand-awe Mamathuntsha Tender Process Tender REF2026-1764 - tender101 BEC: Monitor Evaluation Progress 30/08/2026 Evaluation In Progress 1 month(s) ago"':
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
        - cell "1 month(s) ago"
      - 'row "search REF2026-1122 Maand-awe Mamathuntsha Tender Process Tender REF2026-1122 - TC-01 Automated Draft Tender run-msiqgav7 - 90/10 Compulsory Hybrid BEC: Monitor Evaluation Progress 07/08/2026 Evaluation In Progress 2 month(s) ago"':
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
        - cell "2 month(s) ago"
- alert
```

# Test source

```ts
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
  1481 |     // flyout ("My Items" nav-link) can overlap the table and intercept the click. goto avoids that.
  1482 |     const rowHref = await targetRow.getByRole('link').first().getAttribute('href');
  1483 |     await page.goto(rowHref.startsWith('http') ? rowHref : `${APP_URL.replace('/login', '')}${rowHref}`);
  1484 |     await page.waitForURL(/workflow-action/, { timeout: 30000 });
  1485 | 
  1486 |     // ASSERT (BLOCKING) the item opens on the "BEC: Monitor Evaluation Progress" page
  1487 |     await expectOnPage(page, 'Monitor Evaluation Progress');
  1488 | 
  1489 |     // NEGATIVE (opt-in SEND_BACKS): send this stage back to "Confirm Attendance and Open Evaluation", have that actor re-action
  1490 |     // it, then return here and carry on with the happy path — the chain still completes.
  1491 |     await sendBackAndReturn(page, { stageNo: 10, stage: 'BEC: Monitor Evaluation Progress', previous: 'Confirm Attendance and Open Evaluation', actor: BEC_CHAIR });
  1492 | 
  1493 |     // STEP: review the per-evaluator Evaluation Scores, then Begin Calibration → advances the tender to
  1494 |     // the Monitor-calibration & finalise-scoring stage. Single click (no re-click — see clickOnceAndAwait).
  1495 |     const begin = page.getByRole('button', { name: 'Begin Calibration', exact: true });
  1496 |     await expect(begin).toBeVisible({ timeout: 15000 });
  1497 |     await clickOnceAndAwait(begin, async () => {
  1498 |       const gone = !(await page.getByText('Monitor Evaluation Progress', { exact: false }).first().isVisible().catch(() => false));
  1499 |       return gone || /workflows-(inbox|my-items)/.test(page.url());
  1500 |     }, 'BEC: Monitor Evaluation Progress');
  1501 |   });
  1502 | 
  1503 |   // ADO Test Case #60822: https://dev.azure.com/boxfusion/PD-SupplyChainManagement/_workitems/edit/60822
  1504 |   // Happy path VERIFIED LIVE 2026-06-04 against REF2026-1399 (advanced to this stage by TC-10). Logged in as the
  1505 |   // BEC Secretariat (ThabisoM). The ADO steps (Maanda-awe login, Export-to-Excel, View-in-PDF, Download-Batch) are
  1506 |   // stale — the live page (form tender-wf-calibratescores) only offers Close / Send Back / Finalise Scoring. Open the
  1507 |   // Inbox item, review the read-only tabs + aggregated Evaluator Scores, then Finalise Scoring → the tender advances
  1508 |   // to "BEC: Finalise recommendation" (TC-12 stage). Self-supplying: TC-10 replenishes this stage.
  1509 |   test('TC-11: BEC Secretariat: Monitor Calibration and Finalise Scoring', async ({ page }) => {
  1510 |     test.setTimeout(120_000);
  1511 |     await loginAs(page, BEC_CHAIR);
  1512 |     await openInbox(page);
  1513 |     await expect(page.getByRole('button', { name: /export/i })).toBeVisible({ timeout: 15000 });
  1514 | 
  1515 |     // STEP: open the target tender (our TC-01 item) at the Monitor-calibration stage via its magnifying-glass.
  1516 |     await page.getByRole('heading', { name: 'Incoming Items' }).click();
  1517 |     const targetRow = page.getByRole('row')
  1518 |       .filter({ hasText: tenderMatch() })
  1519 |       .filter({ hasText: 'Monitor calibration and finalise scoring' })
  1520 |       .first();
> 1521 |     await expect(targetRow).toBeVisible({ timeout: 30000 });
       |                             ^ Error: expect(locator).toBeVisible() failed
  1522 |     // Open the row by navigating to its href, not a positional click: the Workflows accordion
  1523 |     // flyout ("My Items" nav-link) can overlap the table and intercept the click. goto avoids that.
  1524 |     const rowHref = await targetRow.getByRole('link').first().getAttribute('href');
  1525 |     await page.goto(rowHref.startsWith('http') ? rowHref : `${APP_URL.replace('/login', '')}${rowHref}`);
  1526 |     await page.waitForURL(/workflow-action/, { timeout: 30000 });
  1527 | 
  1528 |     // ASSERT (BLOCKING) the item opens on the "Monitor Calibration and Finalise Scoring" page
  1529 |     await expectOnPage(page, 'Monitor calibration and finalise scoring:');
  1530 | 
  1531 |     // NEGATIVE (opt-in SEND_BACKS): send this stage back to "BEC: Monitor Evaluation Progress", have that actor re-action
  1532 |     // it, then return here and carry on with the happy path — the chain still completes.
  1533 |     await sendBackAndReturn(page, { stageNo: 11, stage: 'Monitor calibration and finalise scoring', previous: 'BEC: Monitor Evaluation Progress', actor: BEC_CHAIR });
  1534 | 
  1535 |     // STEP: review the read-only tabs (Tender Details is the default; check Responses too).
  1536 |     await expect(page.getByRole('tab', { name: 'Tender Details' })).toBeVisible({ timeout: 15000 });
  1537 |     await expect(page.getByText(RUN_REF || tenderMatch()).first()).toBeVisible();
  1538 |     await page.getByRole('tab', { name: 'Responses' }).click();
  1539 |     // .first(): the Responses view can render the supplier in more than one cell/context — avoid a
  1540 |     // strict-mode violation; we only need to confirm the supplier surfaced.
  1541 |     await expect(page.getByRole('cell', { name: 'A & A Stationers' }).first()).toBeVisible({ timeout: 15000 });
  1542 | 
  1543 |     // STEP: Finalise Scoring → advances the tender to "BEC: Finalise recommendation". The slow app
  1544 |     // sometimes swallows the first click, so retry until the calibration heading is gone / we leave the page.
  1545 |     const finalise = page.getByRole('button', { name: 'Finalise Scoring', exact: true });
  1546 |     await expect(finalise).toBeVisible({ timeout: 15000 });
  1547 |     await clickOnceAndAwait(finalise, async () => {
  1548 |       const gone = !(await page.getByText('Monitor calibration and finalise scoring:').first().isVisible().catch(() => false));
  1549 |       return gone || /workflows-(inbox|my-items)/.test(page.url());
  1550 |     }, 'Monitor calibration');
  1551 |   });
  1552 | 
  1553 |   // ADO Test Case #60835: https://dev.azure.com/boxfusion/PD-SupplyChainManagement/_workitems/edit/60835
  1554 |   // Happy path VERIFIED LIVE 2026-06-04 against REF2026-1399 (advanced here by TC-11). Logged in as the BEC
  1555 |   // (ThabisoM). The ADO Maanda-awe login + Export-to-Excel steps are stale; View-in-PDF / Download-Batch buttons
  1556 |   // do exist but aren't on the happy path. Open the Inbox item (form tender-wf-finaliserecommendation-details),
  1557 |   // review the Final Evaluation ranking (A & A Stationers #1, Overall 98) + pre-selected Recommended Supplier,
  1558 |   // click Approve Recommendation, fill the required BEC Report, then Submit Recommendation → the tender advances
  1559 |   // to "Capture Outcome of the BAC" (TC-13) and leaves the inbox. Self-supplying: TC-11 replenishes this stage.
  1560 |   test('TC-12: BEC: Finalise Recommendation', async ({ page }) => {
  1561 |     test.setTimeout(120_000);
  1562 |     await loginAs(page, BEC_CHAIR);
  1563 |     await openInbox(page);
  1564 |     await expect(page.getByRole('button', { name: /export/i })).toBeVisible({ timeout: 15000 });
  1565 | 
  1566 |     // STEP: open the target tender (our TC-01 item) at the Finalise-recommendation stage via its magnifying-glass.
  1567 |     await page.getByRole('heading', { name: 'Incoming Items' }).click();
  1568 |     const targetRow = page.getByRole('row')
  1569 |       .filter({ hasText: tenderMatch() })
  1570 |       .filter({ hasText: 'BEC: Finalise recommendation' })
  1571 |       .first();
  1572 |     await expect(targetRow).toBeVisible({ timeout: 30000 });
  1573 |     // Open the row by navigating to its href, not a positional click: the Workflows accordion
  1574 |     // flyout ("My Items" nav-link) can overlap the table and intercept the click. goto avoids that.
  1575 |     const rowHref = await targetRow.getByRole('link').first().getAttribute('href');
  1576 |     await page.goto(rowHref.startsWith('http') ? rowHref : `${APP_URL.replace('/login', '')}${rowHref}`);
  1577 |     await page.waitForURL(/workflow-action/, { timeout: 30000 });
  1578 | 
  1579 |     // ASSERT (BLOCKING) the item opens on the "BEC: Finalise recommendation" page
  1580 |     await expectOnPage(page, 'BEC: Finalise recommendation:');
  1581 | 
  1582 |     // NEGATIVE (opt-in SEND_BACKS): send this stage back to "Monitor calibration and finalise scoring", have that actor re-action
  1583 |     // it, then return here and carry on with the happy path — the chain still completes.
  1584 |     await sendBackAndReturn(page, { stageNo: 12, stage: 'BEC: Finalise recommendation', previous: 'Monitor calibration and finalise scoring', actor: BEC_CHAIR });
  1585 | 
  1586 |     // STEP: wait for the score/evaluation tables to load, then verify A & A Stationers ranks #1 and is the
  1587 |     // pre-selected Recommended Supplier.
  1588 |     await expect(page.getByText('loading...').first()).toBeHidden({ timeout: 30000 });
  1589 |     const finalEval = page.getByRole('row').filter({ hasText: 'A & A Stationers' }).first();
  1590 |     await expect(finalEval).toBeVisible({ timeout: 15000 });
  1591 | 
  1592 |     // STEP: select the Approve Recommendation decision, then fill the required BEC Report.
  1593 |     await page.getByRole('button', { name: /Approve Recommendation/ }).click();
  1594 |     await page.getByRole('textbox').last().fill(
  1595 |       'BEC recommends the award to A & A Stationers, the top-ranked supplier. ' +
  1596 |       'All responses were above the functionality minimum and compliant. Automated TC-12 happy-path recommendation.');
  1597 | 
  1598 |     // STEP: Submit Recommendation (only enabled once a decision is picked + BEC Report filled) → advances the
  1599 |     // tender out of the stage. Retry the click against the slow app until we leave the workflow-action page.
  1600 |     const submit = page.getByRole('button', { name: 'Submit Recommendation', exact: true });
  1601 |     await expect(submit).toBeEnabled({ timeout: 15000 });
  1602 |     await clickOnceAndAwait(submit, async () => /workflows-(my-items|inbox)/.test(page.url()), 'Finalise recommendation');
  1603 |   });
  1604 | 
  1605 |   // ADO Test Case #60836: https://dev.azure.com/boxfusion/PD-SupplyChainManagement/_workitems/edit/60836
  1606 |   // Happy path VERIFIED LIVE 2026-06-04 against REF2026-1399 (advanced here by TC-12). Logged in as the BAC
  1607 |   // adjudicator (MoshadiM) — switch users via clearLocalStorage + /login (no working logout). ADO Maanda-awe
  1608 |   // login + Export-to-Excel steps are stale. Open the Inbox item (form
  1609 |   // tender-wf-captureoutcomeofthebac-finalrecommendation), review the Stage 1/2/3 adjudication summaries +
  1610 |   // read-only BEC Recommendation (A & A Stationers, Overall 98, Rank 1), select the BAC "Approve Recommendation"
  1611 |   // decision, then Submit → the tender advances to "Approve Recommendation From BAC" (TC-14) and leaves the inbox.
  1612 |   // NOTE: Stage 3 shows the recommended supplier (A & A Stationers) with Recommendation Status "Not Recommended"
  1613 |   // — a suspected inverted-flag defect, flagged for observation on a full rerun (not asserted here).
  1614 |   // Self-supplying: TC-12 replenishes this stage.
  1615 |   test('TC-13: Capture Outcome of the BAC', async ({ page }) => {
  1616 |     test.setTimeout(120_000);
  1617 |     await loginAs(page, BAC);
  1618 |     await openInbox(page);
  1619 |     await expect(page.getByRole('button', { name: /export/i })).toBeVisible({ timeout: 15000 });
  1620 | 
  1621 |     // STEP: open the target tender (our TC-01 item) at the Capture-outcome stage via its magnifying-glass.
```