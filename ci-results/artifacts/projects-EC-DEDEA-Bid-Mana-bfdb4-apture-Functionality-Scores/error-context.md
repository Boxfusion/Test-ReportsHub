# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: projects/EC-DEDEA-Bid-Management/test-plans/tender-process/ecdedea-tender-process.spec.ts >> ECDEDEA-TP — EC DEDEA Bid Management (Tender Process) >> TC-09: Capture Functionality Scores
- Location: projects/EC-DEDEA-Bid-Management/test-plans/tender-process/ecdedea-tender-process.spec.ts:622:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('link', { name: 'ECDEDEA Automated Tender' }).first()
Expected: visible
Timeout: 30000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByRole('link', { name: 'ECDEDEA Automated Tender' }).first() with timeout 30000ms
  - waiting for getByRole('link', { name: 'ECDEDEA Automated Tender' }).first()

```

```yaml
- complementary:
  - menu:
    - menuitem "appstore EPM":
      - img "appstore"
      - text: EPM
    - menuitem "apartment Workflows":
      - img "apartment"
      - text: Workflows
    - menuitem "snippets Leave Gratuity":
      - img "snippets"
      - text: Leave Gratuity
    - menuitem "database Sundry Payments":
      - img "database"
      - text: Sundry Payments
    - menuitem "pic-center Bid Management":
      - img "pic-center"
      - text: Bid Management
    - menuitem "menu-unfold SupplyChain Management":
      - img "menu-unfold"
      - text: SupplyChain Management
    - menuitem "area-chart Reports and Dashboards":
      - img "area-chart"
      - text: Reports and Dashboards
    - menuitem "tool Administration":
      - img "tool"
      - text: Administration
    - menuitem "setting Configurations":
      - img "setting"
      - text: Configurations
  - img "menu-unfold"
- banner:
  - button "edit":
    - img "edit"
  - paragraph: Shesha.Enterprise/header v3
  - text: Live
  - img "close"
  - link:
    - /url: /
    - img
  - text: Cedrick Maake
  - img "down"
  - img "user"
- main:
  - button "edit":
    - img "edit"
  - paragraph: Shesha.SupplyChainManagement/tenders-to-evaluate v7
  - text: Live
  - img "close"
  - text: Tenders to Evaluate
  - img "right"
  - text: Click on a Tender to continue
  - textbox
  - button "search":
    - img "search"
  - list:
    - listitem: 0 items found
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
  - heading "No Data" [level=4]
  - text: No data is available for this list
- alert
```

# Test source

```ts
  537 |       await finaliseOpenComplianceDialog(page);
  538 |     }
  539 | 
  540 |     await checkConfirmation(page, /reviewed all the provided information|captured accurately/);
  541 |     const submit = page.getByRole('button', { name: 'Submit', exact: true });
  542 |     await expect(submit).toBeEnabled({ timeout: 15000 });
  543 |     await clickOnceAndAwait(submit, async () => {
  544 |       const gone = !(await page.getByText('Verify Compliance:').first().isVisible().catch(() => false));
  545 |       return gone || /workflows-(my-items|inbox)/.test(page.url());
  546 |     }, 'Verify Compliance');
  547 |   });
  548 | 
  549 |   test('TC-06: Calculate Specific Goal Points', async ({ page }) => {
  550 |     test.setTimeout(180_000);
  551 |     await loginAs(page, PUBLISHER);
  552 |     await openInbox(page);
  553 |     await openInboxItem(page, 'Calculate Specific Goal Points');
  554 |     await expectOnPage(page, 'Calculate Specific Goal Points:');
  555 | 
  556 |     // Score each supplier by NAME, never by row index — recorded live, the grid does not keep
  557 |     // insertion order (it rendered Telkom, BOXFUSION, A & A).
  558 |     await expect(page.getByRole('row').filter({ hasText: SUPPLIERS[0].name }).first()).toBeVisible({ timeout: 30000 });
  559 | 
  560 |     for (const s of SUPPLIERS) {
  561 |       const row = page.getByRole('row').filter({ hasText: s.name }).first();
  562 |       await iconButton(row, 'edit').click();
  563 |       await row.locator('.ant-input-number-input').fill(s.goalPoints);
  564 |       await iconButton(row, 'save').click();
  565 |       // The save is async — the row shows a loading spinner and keeps its editor until the PUT
  566 |       // returns. Wait for the value to land, which also proves it persisted.
  567 |       await expect(row).toContainText(s.goalPoints, { timeout: 60000 });
  568 |     }
  569 | 
  570 |     await uploadFile(page, formItem(page, 'Calculation spreadsheet').getByRole('button', { name: /press to upload/i }), PDF_FIXTURE);
  571 |     await checkConfirmation(page, 'captured the information accurately');
  572 | 
  573 |     const submit = page.getByRole('button', { name: 'Submit', exact: true });
  574 |     await expect(submit).toBeEnabled({ timeout: 15000 });
  575 |     await clickOnceAndAwait(submit, async () => {
  576 |       const gone = !(await page.getByText('Calculate Specific Goal Points:').first().isVisible().catch(() => false));
  577 |       return gone || /workflows-(my-items|inbox)/.test(page.url());
  578 |     }, 'Calculate Specific Goal Points');
  579 |   });
  580 | 
  581 |   test('TC-07: Invite BEC Members', async ({ page }) => {
  582 |     test.setTimeout(180_000);
  583 |     await loginAs(page, BEC_CHAIR);
  584 |     await openInbox(page);
  585 |     await openInboxItem(page, 'Invite BEC members');
  586 |     await expectOnPage(page, 'Invite BEC members:');
  587 | 
  588 |     // Evaluators FIRST — adding rows re-renders the form and would wipe the text fields.
  589 |     for (const e of EVALUATORS) await addBecEvaluator(page, e.search, e.fullName);
  590 | 
  591 |     await formItem(page, 'Meeting Link').getByRole('textbox').fill('https://teams.microsoft.com/l/meetup-join/ecdedea-bec');
  592 |     await formItem(page, 'Venue').getByRole('textbox').fill('Boardroom B, Head Office');
  593 |     await pickAntDateTime(page, formItem(page, 'Meeting date and time').getByRole('textbox'), '2026-08-05', '14');
  594 | 
  595 |     await checkConfirmation(page, 'invited all the relevant attendees');
  596 |     const submit = page.getByRole('button', { name: 'Submit', exact: true });
  597 |     await expect(submit).toBeEnabled({ timeout: 15000 });
  598 |     await clickOnceAndAwait(submit, async () => {
  599 |       const gone = !(await page.getByText('Invite BEC members:').first().isVisible().catch(() => false));
  600 |       return gone || /workflows-(my-items|inbox)/.test(page.url());
  601 |     }, 'Invite BEC members');
  602 |   });
  603 | 
  604 |   test('TC-08: Confirm Attendance & Open Evaluation', async ({ page }) => {
  605 |     test.setTimeout(180_000);
  606 |     await loginAs(page, BEC_CHAIR);
  607 |     await openInbox(page);
  608 |     await openInboxItem(page, 'Confirm Attendance and Open Evaluation');
  609 |     await expectOnPage(page, 'Confirm Attendance and Open Evaluation:');
  610 | 
  611 |     // EC DEDEA: no backup evaluator — mark the three invited evaluators present.
  612 |     for (const e of EVALUATORS) await markAttendeePresent(page, e.fullName);
  613 | 
  614 |     const openEval = page.getByRole('button', { name: 'Open Evaluation', exact: true });
  615 |     await expect(openEval).toBeEnabled({ timeout: 15000 });
  616 |     await clickOnceAndAwait(openEval, async () => {
  617 |       const gone = !(await page.getByText('Confirm Attendance and Open Evaluation:').first().isVisible().catch(() => false));
  618 |       return gone || /workflows-(my-items|inbox)/.test(page.url());
  619 |     }, 'Confirm Attendance');
  620 |   });
  621 | 
  622 |   test('TC-09: Capture Functionality Scores', async ({ page }) => {
  623 |     test.setTimeout(420_000);
  624 |     for (const evaluator of EVALUATORS) {
  625 |       await loginAs(page, { user: evaluator.user, password: '123qwe' });
  626 | 
  627 |       // No usable menu under automation — reach the list by URL and search by REF (the search
  628 |       // matches the Ref No, not the tender name, and the list is paginated).
  629 |       await page.goto(EVALUATE_TENDERS_URL);
  630 |       if (RUN_REF) {
  631 |         const search = page.getByRole('textbox').first();
  632 |         await search.fill(RUN_REF);
  633 |         await search.press('Enter');
  634 |         await page.waitForLoadState('networkidle');
  635 |       }
  636 |       const card = page.getByRole('link', { name: RUN_REF || tenderMatch() }).first();
> 637 |       await expect(card).toBeVisible({ timeout: 30000 });
      |                          ^ Error: expect(locator).toBeVisible() failed
  638 |       const href = await card.getAttribute('href');
  639 |       await page.goto(`${BASE}${href}`);
  640 | 
  641 |       await expect(page.getByText('Capture Functionality Scores', { exact: false }).first()).toBeVisible({ timeout: 30000 });
  642 |       await expect(page.getByRole('cell', { name: WINNER }).first()).toBeVisible({ timeout: 30000 });
  643 | 
  644 |       for (const [supplier, score] of Object.entries(evaluator.scores)) {
  645 |         await scoreSupplier(page, supplier, score);
  646 |         await expect(page.getByRole('row').filter({ hasText: supplier }).filter({ hasText: score }).first()).toBeVisible({ timeout: 15000 });
  647 |       }
  648 |     }
  649 |   });
  650 | 
  651 |   test('TC-10: BEC: Monitor Evaluation Progress → Begin Calibration', async ({ page }) => {
  652 |     test.setTimeout(120_000);
  653 |     await loginAs(page, BEC_CHAIR);
  654 |     await openInbox(page);
  655 |     await openInboxItem(page, 'Monitor Evaluation Progress');
  656 |     await expectOnPage(page, 'Monitor Evaluation Progress');
  657 | 
  658 |     const begin = page.getByRole('button', { name: 'Begin Calibration', exact: true });
  659 |     await expect(begin).toBeVisible({ timeout: 15000 });
  660 |     await clickOnceAndAwait(begin, async () => {
  661 |       const gone = !(await page.getByText('Monitor Evaluation Progress', { exact: false }).first().isVisible().catch(() => false));
  662 |       return gone || /workflows-(inbox|my-items)/.test(page.url());
  663 |     }, 'BEC: Monitor Evaluation Progress');
  664 |   });
  665 | 
  666 |   test('TC-11: Monitor Calibration and Finalise Scoring', async ({ page }) => {
  667 |     test.setTimeout(120_000);
  668 |     await loginAs(page, BEC_CHAIR);
  669 |     await openInbox(page);
  670 |     await openInboxItem(page, 'Monitor calibration and finalise scoring');
  671 |     await expectOnPage(page, 'Monitor calibration and finalise scoring:');
  672 | 
  673 |     // Aggregated averages: A & A 90, Telkom 74.33, BOXFUSION 60 — all above the minimum of 60.
  674 |     await expect(page.getByRole('row').filter({ hasText: WINNER }).first()).toBeVisible({ timeout: 20000 });
  675 | 
  676 |     const finalise = page.getByRole('button', { name: 'Finalise Scoring', exact: true });
  677 |     await expect(finalise).toBeVisible({ timeout: 15000 });
  678 |     await clickOnceAndAwait(finalise, async () => {
  679 |       const gone = !(await page.getByText('Monitor calibration and finalise scoring:').first().isVisible().catch(() => false));
  680 |       return gone || /workflows-(inbox|my-items)/.test(page.url());
  681 |     }, 'Monitor calibration');
  682 |   });
  683 | 
  684 |   test('TC-12: BEC: Finalise Recommendation', async ({ page }) => {
  685 |     test.setTimeout(120_000);
  686 |     await loginAs(page, BEC_CHAIR);
  687 |     await openInbox(page);
  688 |     await openInboxItem(page, 'BEC: Finalise recommendation');
  689 |     await expectOnPage(page, 'BEC: Finalise recommendation:');
  690 | 
  691 |     await expect(page.getByText('loading...').first()).toBeHidden({ timeout: 30000 });
  692 |     await expect(page.getByRole('row').filter({ hasText: WINNER }).first()).toBeVisible({ timeout: 20000 });
  693 | 
  694 |     await page.getByRole('button', { name: /Approve Recommendation/ }).click();
  695 |     await page.getByRole('textbox').last().fill(
  696 |       `BEC recommends the award to ${WINNER}, the top-ranked supplier. All responses were compliant ` +
  697 |       'and above the functionality minimum. Automated EC DEDEA TC-12 happy-path recommendation.');
  698 | 
  699 |     const submit = page.getByRole('button', { name: 'Submit Recommendation', exact: true });
  700 |     await expect(submit).toBeEnabled({ timeout: 15000 });
  701 |     await clickOnceAndAwait(submit, async () => /workflows-(my-items|inbox)/.test(page.url()), 'Finalise recommendation');
  702 |   });
  703 | 
  704 |   test('TC-13: Capture Outcome from the BAC', async ({ page }) => {
  705 |     test.setTimeout(120_000);
  706 |     await loginAs(page, BAC);
  707 |     await openInbox(page);
  708 |     await openInboxItem(page, 'Capture outcome from the BAC');
  709 |     await expectOnPage(page, 'Capture outcome from the BAC:');
  710 | 
  711 |     await expect(page.getByText('loading...').first()).toBeHidden({ timeout: 30000 });
  712 |     // EC DEDEA regression guard — the rank-1 supplier must be flagged "Recommended".
  713 |     await assertWinnerFlaggedRecommended(page);
  714 | 
  715 |     await page.getByRole('button', { name: /Approve Recommendation/ }).click();
  716 |     const submit = page.getByRole('button', { name: 'Submit', exact: true });
  717 |     await expect(submit).toBeEnabled({ timeout: 15000 });
  718 |     await clickOnceAndAwait(submit, async () => /workflows-(my-items|inbox)/.test(page.url()), 'Capture outcome from the BAC');
  719 |   });
  720 | 
  721 |   test('TC-14: Approve Recommendation from BAC', async ({ page }) => {
  722 |     test.setTimeout(120_000);
  723 |     await loginAs(page, APPROVER);
  724 |     await openInbox(page);
  725 |     await openInboxItem(page, 'Approve Recommendation from BAC');
  726 |     await expectOnPage(page, 'Approve Recommendation from BAC:');
  727 | 
  728 |     await expect(page.getByText('loading...').first()).toBeHidden({ timeout: 30000 });
  729 |     await assertWinnerFlaggedRecommended(page);
  730 | 
  731 |     await checkConfirmation(page, /approve the recomm.*endation from the Bid Adjudication/i);
  732 |     const submit = page.getByRole('button', { name: 'Submit', exact: true });
  733 |     await expect(submit).toBeEnabled({ timeout: 15000 });
  734 |     await clickOnceAndAwait(submit, async () => /workflows-(my-items|inbox)/.test(page.url()), 'Approve Recommendation from BAC');
  735 |   });
  736 | 
  737 |   test('TC-15: Upload Appointment Letter', async ({ page }) => {
```