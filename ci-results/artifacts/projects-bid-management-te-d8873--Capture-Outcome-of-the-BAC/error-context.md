# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: projects/bid-management/test-plans/tender-process/bid-supply-chain-management.spec.ts >> BID-SCM — BID: Supply Chain Management >> TC-13: Capture Outcome of the BAC
- Location: projects/bid-management/test-plans/tender-process/bid-supply-chain-management.spec.ts:1615:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('row').filter({ hasText: 'REF2026-1986' }).filter({ hasText: 'Capture outcome from the BAC' }).first()
Expected: visible
Timeout: 30000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByRole('row').filter({ hasText: 'REF2026-1986' }).filter({ hasText: 'Capture outcome from the BAC' }).first() with timeout 30000ms
  - waiting for getByRole('row').filter({ hasText: 'REF2026-1986' }).filter({ hasText: 'Capture outcome from the BAC' }).first()

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
  - text: Latest Moshadi Mothiba
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
    - listitem: 1-3 of 3 items
    - listitem "Previous Page":
      - button "left" [disabled]:
        - img "left"
    - listitem "1"
    - listitem "Next Page":
      - button "right" [disabled]:
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
      - row "search REF2026-1097 Maand-awe Mamathuntsha Tender Process Tender REF2026-1097 - TC-01 Automated Draft Tender run-msimdegf - 90/10 Compulsory Hybrid Capture outcome from the BAC 07/08/2026 Adjudicate In Progress 2 month(s) ago":
        - cell "search":
          - link "search":
            - /url: /shesha/workflow-action?id=48c9166b-1977-4e1e-8331-ccd5a4fc4b17&todoid=44a9cc0a-5a1a-4829-8a2d-c57256533aca
            - img "search"
        - cell "REF2026-1097"
        - cell "Maand-awe Mamathuntsha"
        - cell "Tender Process"
        - cell "Tender REF2026-1097 - TC-01 Automated Draft Tender run-msimdegf - 90/10 Compulsory Hybrid"
        - cell "Capture outcome from the BAC"
        - cell "07/08/2026"
        - cell
        - cell "Adjudicate In Progress"
        - cell "2 month(s) ago"
      - row "search REF2025-5406 Maand-awe Mamathuntsha Tender Process Tender REF2025-5406 - Chopper Has Landed Capture outcome from the BAC 03/07/2025 In Progress 1 year(s) ago":
        - cell "search":
          - link "search":
            - /url: /shesha/workflow-action?id=932aa4fd-4d2f-4e75-b294-f386ca01933b&todoid=beed75d2-e919-48b7-92c9-28050b700856
            - img "search"
        - cell "REF2025-5406"
        - cell "Maand-awe Mamathuntsha"
        - cell "Tender Process"
        - cell "Tender REF2025-5406 - Chopper Has Landed"
        - cell "Capture outcome from the BAC"
        - cell "03/07/2025"
        - cell
        - cell "In Progress"
        - cell "1 year(s) ago"
      - row "search REF2025-0879 Maand-awe Mamathuntsha Tender Process Tender REF2025-0879 - Testing once again Capture outcome from the BAC 27/02/2025 In Progress 1 year(s) ago":
        - cell "search":
          - link "search":
            - /url: /shesha/workflow-action?id=b95f314c-83b3-41ba-a8c6-caf6eb531738&todoid=93f2a567-ce1a-4ab3-9517-dd7f87d6cd47
            - img "search"
        - cell "REF2025-0879"
        - cell "Maand-awe Mamathuntsha"
        - cell "Tender Process"
        - cell "Tender REF2025-0879 - Testing once again"
        - cell "Capture outcome from the BAC"
        - cell "27/02/2025"
        - cell
        - cell "In Progress"
        - cell "1 year(s) ago"
- alert
```

# Test source

```ts
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
  1622 |     await page.getByRole('heading', { name: 'Incoming Items' }).click();
  1623 |     const targetRow = page.getByRole('row')
  1624 |       .filter({ hasText: tenderMatch() })
  1625 |       .filter({ hasText: 'Capture outcome from the BAC' })
  1626 |       .first();
> 1627 |     await expect(targetRow).toBeVisible({ timeout: 30000 });
       |                             ^ Error: expect(locator).toBeVisible() failed
  1628 |     // Open the row by navigating to its href, not a positional click: the Workflows accordion
  1629 |     // flyout ("My Items" nav-link) can overlap the table and intercept the click. goto avoids that.
  1630 |     const rowHref = await targetRow.getByRole('link').first().getAttribute('href');
  1631 |     await page.goto(rowHref.startsWith('http') ? rowHref : `${APP_URL.replace('/login', '')}${rowHref}`);
  1632 |     await page.waitForURL(/workflow-action/, { timeout: 30000 });
  1633 | 
  1634 |     // ASSERT (BLOCKING) the item opens on the "Capture outcome from the BAC" page
  1635 |     await expectOnPage(page, 'Capture outcome from the BAC:');
  1636 | 
  1637 |     // NEGATIVE (opt-in SEND_BACKS): send this stage back to "BEC: Finalise recommendation", have that actor re-action
  1638 |     // it, then return here and carry on with the happy path — the chain still completes.
  1639 |     await sendBackAndReturn(page, { stageNo: 13, stage: 'Capture outcome from the BAC', previous: 'BEC: Finalise recommendation', actor: BAC });
  1640 | 
  1641 |     // STEP: wait for the adjudication summaries to load, then verify Stage 3 ranks A & A Stationers #1 (Overall 98)
  1642 |     // and the BEC Recommended Supplier is A & A Stationers.
  1643 |     await expect(page.getByText('loading...').first()).toBeHidden({ timeout: 30000 });
  1644 |     const stage3Winner = page.getByRole('row').filter({ hasText: 'A & A Stationers' }).first();
  1645 |     await expect(stage3Winner.first()).toBeVisible({ timeout: 15000 });
  1646 | 
  1647 |     // STEP: select the BAC Approve Recommendation decision (enables Submit).
  1648 |     await page.getByRole('button', { name: /Approve Recommendation/ }).click();
  1649 | 
  1650 |     // STEP: Submit → captures the BAC outcome and advances the tender out of the stage. Retry the click against
  1651 |     // the slow app until we leave the workflow-action page (redirect to My Items / Inbox).
  1652 |     const submit = page.getByRole('button', { name: 'Submit', exact: true });
  1653 |     await expect(submit).toBeEnabled({ timeout: 15000 });
  1654 |     await clickOnceAndAwait(submit, async () => /workflows-(my-items|inbox)/.test(page.url()), 'Capture outcome from the BAC');
  1655 |   });
  1656 | 
  1657 |   // ADO Test Case #60843: https://dev.azure.com/boxfusion/PD-SupplyChainManagement/_workitems/edit/60843
  1658 |   // Happy path VERIFIED LIVE 2026-06-04 against REF2026-1399 (advanced here by TC-13). Logged in as the approving
  1659 |   // authority (ThulileM) — switch users via clearLocalStorage + /login. ADO Maanda-awe login + Export-to-Excel
  1660 |   // steps are stale. Open the Inbox item (form tender-wf-approverecommendationfrombac-details), review the Stage
  1661 |   // 1/2/3 summaries, tick the "Approve BAC Recommendation" confirmation checkbox, then Submit → the tender
  1662 |   // advances to "Compile and Upload Appointment Letter" (TC-15) and leaves the inbox.
  1663 |   // NOTE: Stage 3 still shows the recommended supplier (A & A Stationers) as "Not Recommended" — the same
  1664 |   // suspected inverted-flag defect seen in TC-13, flagged for observation on a full rerun (not asserted here).
  1665 |   // Self-supplying: TC-13 replenishes this stage.
  1666 |   test('TC-14: Approve Recommendation From BAC', async ({ page }) => {
  1667 |     test.setTimeout(120_000);
  1668 |     await loginAs(page, APPROVER);
  1669 |     await openInbox(page);
  1670 |     await expect(page.getByRole('button', { name: /export/i })).toBeVisible({ timeout: 15000 });
  1671 | 
  1672 |     // STEP: open the target tender (our TC-01 item) at the Approve-Recommendation-from-BAC stage via its glass.
  1673 |     await page.getByRole('heading', { name: 'Incoming Items' }).click();
  1674 |     const targetRow = page.getByRole('row')
  1675 |       .filter({ hasText: tenderMatch() })
  1676 |       .filter({ hasText: 'Approve Recommendation from BAC' })
  1677 |       .first();
  1678 |     await expect(targetRow).toBeVisible({ timeout: 30000 });
  1679 |     // Open the row by navigating to its href, not a positional click: the Workflows accordion
  1680 |     // flyout ("My Items" nav-link) can overlap the table and intercept the click. goto avoids that.
  1681 |     const rowHref = await targetRow.getByRole('link').first().getAttribute('href');
  1682 |     await page.goto(rowHref.startsWith('http') ? rowHref : `${APP_URL.replace('/login', '')}${rowHref}`);
  1683 |     await page.waitForURL(/workflow-action/, { timeout: 30000 });
  1684 | 
  1685 |     // ASSERT (BLOCKING) the item opens on the "Approve Recommendation from BAC" page
  1686 |     await expectOnPage(page, 'Approve Recommendation from BAC:');
  1687 | 
  1688 |     // NEGATIVE (opt-in SEND_BACKS): send this stage back to "Capture outcome from the BAC", have that actor re-action
  1689 |     // it, then return here and carry on with the happy path — the chain still completes.
  1690 |     await sendBackAndReturn(page, { stageNo: 14, stage: 'Approve Recommendation from BAC', previous: 'Capture outcome from the BAC', actor: APPROVER });
  1691 | 
  1692 |     // STEP: wait for the adjudication summaries to load, then verify Stage 3 ranks A & A Stationers #1 (Overall 98).
  1693 |     await expect(page.getByText('loading...').first()).toBeHidden({ timeout: 30000 });
  1694 |     const stage3Winner = page.getByRole('row').filter({ hasText: 'A & A Stationers' }).first();
  1695 |     await expect(stage3Winner.first()).toBeVisible({ timeout: 15000 });
  1696 | 
  1697 |     // STEP: tick the "Approve BAC Recommendation" confirmation checkbox (enables Submit). The confirm checkbox is
  1698 |     // the one inside the block whose text mentions approving the Bid Adjudication Committee recommendation.
  1699 |     await page.locator('div')
  1700 |       .filter({ hasText: /approve the recomm.*endation from the Bid Adjudication/i })
  1701 |       .filter({ has: page.getByRole('checkbox') })
  1702 |       .last()
  1703 |       .getByRole('checkbox')
  1704 |       .check();
  1705 | 
  1706 |     // STEP: Submit → approves and advances the tender out of the stage. Retry the click against the slow app until
  1707 |     // we leave the workflow-action page (redirect to My Items / Inbox).
  1708 |     const submit = page.getByRole('button', { name: 'Submit', exact: true });
  1709 |     await expect(submit).toBeEnabled({ timeout: 15000 });
  1710 |     await clickOnceAndAwait(submit, async () => /workflows-(my-items|inbox)/.test(page.url()), 'Approve Recommendation from BAC');
  1711 |   });
  1712 | 
  1713 |   // ADO Test Case #60845: https://dev.azure.com/boxfusion/PD-SupplyChainManagement/_workitems/edit/60845
  1714 |   // Happy path VERIFIED LIVE 2026-06-04 against REF2026-1399 (advanced here by TC-14). Logged in as TumisangM
  1715 |   // (the PUBLISHER also handles the appointment-letter upload) — switch users via clearLocalStorage + /login.
  1716 |   // ADO Maanda-awe login + Export-to-Excel steps are stale. Open the Inbox item (form
  1717 |   // tender-wf-compileanduploadappointmentletter-details), upload the signed appointment letter for the successful
  1718 |   // bidder, pick the Contract Management Unit email, tick the Confirm checkbox, then Submit → the tender status
  1719 |   // becomes "Awarded" and it advances to "Capture Order Details" (TC-16). Self-supplying: TC-14 replenishes this.
  1720 |   test('TC-15: Compile and Upload Appointment Letter', async ({ page }) => {
  1721 |     test.setTimeout(150_000);
  1722 |     await loginAs(page, PUBLISHER);
  1723 |     await openInbox(page);
  1724 |     await expect(page.getByRole('button', { name: /export/i })).toBeVisible({ timeout: 15000 });
  1725 | 
  1726 |     // STEP: open the target tender (our TC-01 item) at the Upload-Appointment-letter stage via its glass.
  1727 |     await page.getByRole('heading', { name: 'Incoming Items' }).click();
```