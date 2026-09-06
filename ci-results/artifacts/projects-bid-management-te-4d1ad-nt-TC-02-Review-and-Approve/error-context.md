# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: projects/bid-management/test-plans/tender-process/bid-supply-chain-management.spec.ts >> BID-SCM — BID: Supply Chain Management >> TC-02: Review and Approve
- Location: projects/bid-management/test-plans/tender-process/bid-supply-chain-management.spec.ts:965:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('row').filter({ hasText: 'REF2026-0988' }).filter({ hasText: 'Review and Approve' }).first()
Expected: visible
Timeout: 30000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByRole('row').filter({ hasText: 'REF2026-0988' }).filter({ hasText: 'Review and Approve' }).first() with timeout 30000ms
  - waiting for getByRole('row').filter({ hasText: 'REF2026-0988' }).filter({ hasText: 'Review and Approve' }).first()

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
  - text: Latest Mhloti Mabuza
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
    - listitem: 1-10 of 78 items
    - listitem "Previous Page":
      - button "left" [disabled]:
        - img "left"
    - listitem "1"
    - listitem "2"
    - listitem "3"
    - listitem "Next 3 Pages":
      - img "double-right"
      - text: •••
    - listitem "8"
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
      - row "search REF2026-0915 Maand-awe Mamathuntsha Tender Process Tender REF2026-0915 - testinggggg Review and Approve Tender Details 03/09/2026 08/09/2026 Submitted 3 day(s) ago":
        - cell "search":
          - link "search":
            - /url: /shesha/workflow-action?id=6eecfe85-be1b-49bd-ae59-c9809ae7ec2c&todoid=11e91e42-b6c4-471b-8771-8510c9b9c747
            - img "search"
        - cell "REF2026-0915"
        - cell "Maand-awe Mamathuntsha"
        - cell "Tender Process"
        - cell "Tender REF2026-0915 - testinggggg"
        - cell "Review and Approve Tender Details"
        - cell "03/09/2026"
        - cell "08/09/2026"
        - cell "Submitted"
        - cell "3 day(s) ago"
      - row "search REF2026-0908 System Administrator Tender Process Tender REF2026-0908 - test Review and Approve Tender Details 03/09/2026 08/09/2026 Submitted 3 day(s) ago":
        - cell "search":
          - link "search":
            - /url: /shesha/workflow-action?id=db55075b-9e1d-4a97-85f6-105041794082&todoid=2a6aab56-7a30-4503-9989-bd9f8ceb7843
            - img "search"
        - cell "REF2026-0908"
        - cell "System Administrator"
        - cell "Tender Process"
        - cell "Tender REF2026-0908 - test"
        - cell "Review and Approve Tender Details"
        - cell "03/09/2026"
        - cell "08/09/2026"
        - cell "Submitted"
        - cell "3 day(s) ago"
      - row "search REF2026-1114 Maand-awe Mamathuntsha Tender Process Tender REF2026-1114 - Testing timezone Review and Approve Tender Details 30/07/2026 Submitted 2 month(s) ago":
        - cell "search":
          - link "search":
            - /url: /shesha/workflow-action?id=9cafcca5-836c-42c1-b2fb-90e7e830b21a&todoid=4cc89553-4978-41f7-81da-123b8388dcb2
            - img "search"
        - cell "REF2026-1114"
        - cell "Maand-awe Mamathuntsha"
        - cell "Tender Process"
        - cell "Tender REF2026-1114 - Testing timezone"
        - cell "Review and Approve Tender Details"
        - cell "30/07/2026"
        - cell
        - cell "Submitted"
        - cell "2 month(s) ago"
      - row "search REF2026-0968 Maand-awe Mamathuntsha Tender Process Tender REF2026-0968 - testing BID is non responsive Review and Approve Tender Details 29/07/2026 Submitted 2 month(s) ago":
        - cell "search":
          - link "search":
            - /url: /shesha/workflow-action?id=9e5ddddb-2b2f-4c59-990d-404149c46ba2&todoid=a2524355-fd2f-4bf6-8f7e-c6394946e825
            - img "search"
        - cell "REF2026-0968"
        - cell "Maand-awe Mamathuntsha"
        - cell "Tender Process"
        - cell "Tender REF2026-0968 - testing BID is non responsive"
        - cell "Review and Approve Tender Details"
        - cell "29/07/2026"
        - cell
        - cell "Submitted"
        - cell "2 month(s) ago"
      - row "search REF2026-6699 Maand-awe Mamathuntsha Tender Process Tender REF2026-6699 - Testing pre-population V9 Review and Approve Tender Details 25/06/2026 Submitted 3 month(s) ago":
        - cell "search":
          - link "search":
            - /url: /shesha/workflow-action?id=0219e035-d700-4855-909f-45171ec108d8&todoid=83bbe02d-54c8-4b24-920d-c5f03275f64b
            - img "search"
        - cell "REF2026-6699"
        - cell "Maand-awe Mamathuntsha"
        - cell "Tender Process"
        - cell "Tender REF2026-6699 - Testing pre-population V9"
        - cell "Review and Approve Tender Details"
        - cell "25/06/2026"
        - cell
        - cell "Submitted"
        - cell "3 month(s) ago"
      - row "search REF2026-6670 Maand-awe Mamathuntsha Tender Process Tender REF2026-6670 - Testing pre-population V8 Review and Approve Tender Details 25/06/2026 Submitted 3 month(s) ago":
        - cell "search":
          - link "search":
            - /url: /shesha/workflow-action?id=77c43715-6b81-45b2-84b2-8bdd6ac067b8&todoid=aa851a23-27f0-423f-be94-d5f6f366d0e6
            - img "search"
        - cell "REF2026-6670"
        - cell "Maand-awe Mamathuntsha"
        - cell "Tender Process"
        - cell "Tender REF2026-6670 - Testing pre-population V8"
        - cell "Review and Approve Tender Details"
        - cell "25/06/2026"
        - cell
        - cell "Submitted"
        - cell "3 month(s) ago"
      - row "search REF2026-6644 Maand-awe Mamathuntsha Tender Process Tender REF2026-6644 - Testing re-populate data V6 Review and Approve Tender Details 25/06/2026 Submitted 3 month(s) ago":
        - cell "search":
          - link "search":
            - /url: /shesha/workflow-action?id=7bae083e-0624-4cc2-b393-7cee8c90c2d6&todoid=555909f6-64f0-41f4-950a-25dedf703b7b
            - img "search"
        - cell "REF2026-6644"
        - cell "Maand-awe Mamathuntsha"
        - cell "Tender Process"
        - cell "Tender REF2026-6644 - Testing re-populate data V6"
        - cell "Review and Approve Tender Details"
        - cell "25/06/2026"
        - cell
        - cell "Submitted"
        - cell "3 month(s) ago"
      - row "search REF2026-6613 Maand-awe Mamathuntsha Tender Process Tender REF2026-6613 - Testing re-populate data V6 Review and Approve Tender Details 25/06/2026 Submitted 3 month(s) ago":
        - cell "search":
          - link "search":
            - /url: /shesha/workflow-action?id=92ec44da-6eae-4c9a-9b17-8fb601338530&todoid=a9e111b5-18e9-4289-81f8-42180d89a9d3
            - img "search"
        - cell "REF2026-6613"
        - cell "Maand-awe Mamathuntsha"
        - cell "Tender Process"
        - cell "Tender REF2026-6613 - Testing re-populate data V6"
        - cell "Review and Approve Tender Details"
        - cell "25/06/2026"
        - cell
        - cell "Submitted"
        - cell "3 month(s) ago"
      - row "search REF2026-6610 Maand-awe Mamathuntsha Tender Process Tender REF2026-6610 - Testing re-populate data V4 Review and Approve Tender Details 25/06/2026 Submitted 3 month(s) ago":
        - cell "search":
          - link "search":
            - /url: /shesha/workflow-action?id=4b36908f-dd38-45e1-9eba-480888e52c48&todoid=7baabc51-73d3-4ddc-bfb8-59bad67552b7
            - img "search"
        - cell "REF2026-6610"
        - cell "Maand-awe Mamathuntsha"
        - cell "Tender Process"
        - cell "Tender REF2026-6610 - Testing re-populate data V4"
        - cell "Review and Approve Tender Details"
        - cell "25/06/2026"
        - cell
        - cell "Submitted"
        - cell "3 month(s) ago"
      - row "search REF2026-6602 Maand-awe Mamathuntsha Tender Process Tender REF2026-6602 - Testing re-populate data V3 Review and Approve Tender Details 25/06/2026 Submitted 3 month(s) ago":
        - cell "search":
          - link "search":
            - /url: /shesha/workflow-action?id=92c90f01-7e0b-4031-ad71-1572528ce622&todoid=f01d3b88-b8a7-4997-b6ec-933b7a3e18f7
            - img "search"
        - cell "REF2026-6602"
        - cell "Maand-awe Mamathuntsha"
        - cell "Tender Process"
        - cell "Tender REF2026-6602 - Testing re-populate data V3"
        - cell "Review and Approve Tender Details"
        - cell "25/06/2026"
        - cell
        - cell "Submitted"
        - cell "3 month(s) ago"
- alert
```

# Test source

```ts
  881  |     RUN_TENDER = `TC-01 Automated Draft Tender ${RUN_TAG} - ${EVAL_CRITERIA} Compulsory Hybrid`;
  882  |     // Re-log and re-persist now that the NAME exists: the earlier [CHAIN] line runs before this
  883  |     // assignment, so it always printed an empty name — which left the 2026-07-30 run report unable to
  884  |     // state which tender name went with REF2026-1014.
  885  |     persistChainRef(RUN_REF);
  886  |     console.log(`[CHAIN] TC-01 tender name: ${RUN_TENDER} (REF ${RUN_REF || 'UNKNOWN'})`);
  887  |     await formItem(page, 'Tender Name').getByRole('textbox').fill(RUN_TENDER);
  888  |     await formItem(page, 'Description').getByRole('textbox').fill('Automated TC-01 draft tender created via Playwright on the QA site.');
  889  |     await formItem(page, 'Meeting link').getByRole('textbox').fill('https://teams.microsoft.com/l/meetup-join/tc02-automated');
  890  |     await formItem(page, 'Briefing Session Venue').getByRole('textbox').fill('Boardroom A, Head Office');
  891  |     await formItem(page, 'Contact person name').getByRole('textbox').fill('Maanda Mamathuntsha');
  892  |     await formItem(page, 'Telephone').getByRole('textbox').fill('0123456789');
  893  |     await formItem(page, 'Email').getByRole('textbox').fill('maanda.test@example.com');
  894  |     // Guard: confirm the name actually stuck before proceeding
  895  |     await expect(formItem(page, 'Tender Name').getByRole('textbox')).toHaveValue(/TC-01/, { timeout: 10000 });
  896  | 
  897  |     // STEP: date + time pickers (briefing start, bid publication, bid closing) via the panel + OK
  898  |     await pickAntDateTime(page, formItem(page, 'Briefing Session Start Time').getByRole('textbox'), BRIEFING_DATE, '10');
  899  |     await pickAntDateTime(page, formItem(page, 'Bid publication Date').getByRole('textbox'), PUBLICATION_DATE, '09');
  900  |     await pickAntDateTime(page, formItem(page, 'Bid closing Date').getByRole('textbox'), CLOSING_DATE, '17');
  901  | 
  902  |     // STEP: attach the mandatory Supporting Document from test-data/
  903  |     await uploadFile(page, formItem(page, 'Supporting documents').getByRole('button', { name: /press to upload/i }), PDF_FIXTURE);
  904  | 
  905  |     // STEP: Next enables once all mandatory Tender Details fields are valid
  906  |     const next = page.getByRole('button', { name: 'Next', exact: true });
  907  |     await expect(next).toBeEnabled({ timeout: 15000 });
  908  |     await next.click();
  909  | 
  910  |     // Advance one wizard step to the step whose `signature` element is given. Idempotent and
  911  |     // resilient: if we're already on the target step (a prior Next already landed — e.g. the
  912  |     // standalone click above), do nothing; otherwise retry click→wait until the signature renders.
  913  |     // (A single Next can be swallowed mid-transition, and Next can flip enabled→disabled while the
  914  |     // form re-validates — but clicking Next on a step whose own mandatory field isn't filled yet
  915  |     // would hang forever, so we must NOT click when already on the target step.)
  916  |     const advance = async (signature: Locator) => {
  917  |       await expect(async () => {
  918  |         if (await signature.first().isVisible().catch(() => false)) return;
  919  |         await next.click({ timeout: 5000 });
  920  |         await signature.first().waitFor({ state: 'visible', timeout: 8000 });
  921  |       }).toPass({ timeout: 45000 });
  922  |     };
  923  | 
  924  |     // ---- Step 1 → 2: Tender Documents (mandatory Bid document upload) ------------
  925  |     await advance(formItem(page, 'Bid document'));
  926  |     await uploadFile(page, formItem(page, 'Bid document').getByRole('button', { name: /press to upload/i }), PDF_FIXTURE);
  927  |     // confirm the upload registered (Next enables) before advancing
  928  |     await expect(next).toBeEnabled({ timeout: 20000 });
  929  | 
  930  |     // ---- Step 2 → 3: Response Documents (pre-populated list) ---------------------
  931  |     // Signature: the "Instructions" column header is unique to this step.
  932  |     await advance(page.getByRole('columnheader', { name: 'Instructions' }));
  933  | 
  934  |     // ---- Step 3 → 4: Technical Evaluation ---------------------------------------
  935  |     await advance(page.getByText('Technical Evaluation Criteria'));
  936  | 
  937  |     // Add one criterion. Scope to the eval-criteria table (the one with a "Max Points"
  938  |     // column) so we don't hit the Response-Documents add-row, which looks similar.
  939  |     const evalTable = page.getByRole('table').filter({ has: page.getByRole('columnheader', { name: 'Max Points' }) });
  940  |     const addRow = evalTable.getByRole('row').filter({ has: page.getByRole('button', { name: 'plus-circle' }) });
  941  |     await addRow.getByRole('textbox').nth(0).fill('TEC-01');
  942  |     await addRow.getByRole('textbox').nth(1).fill('Technical Capability');
  943  |     await addRow.getByRole('textbox').nth(2).fill('Demonstrated technical capability and relevant experience');
  944  |     await addRow.getByRole('spinbutton').fill('100');
  945  |     await addRow.getByRole('button', { name: 'plus-circle' }).click();
  946  |     await expect(page.getByRole('cell', { name: 'TEC-01' })).toBeVisible({ timeout: 10000 });
  947  |     await formItem(page, 'Minimum score required').getByRole('spinbutton').fill('60');
  948  | 
  949  |     // ---- Step 4 → 5: Summary → Submit -------------------------------------------
  950  |     const submit = page.getByRole('button', { name: 'Submit', exact: true });
  951  |     await advance(submit);
  952  |     await expect(submit).toBeEnabled({ timeout: 15000 });
  953  |     await submit.click();
  954  | 
  955  |     // ASSERT (BLOCKING) submit succeeds and returns to the My Items workflow list
  956  |     await page.waitForURL(/workflows-my-items/, { timeout: 30000 });
  957  |     await expect(page.getByRole('cell', { name: 'Tender Process' }).first()).toBeVisible({ timeout: 15000 });
  958  |   });
  959  | 
  960  |   // ADO Test Case #57497: https://dev.azure.com/boxfusion/PD-SupplyChainManagement/_workitems/edit/57497
  961  |   // Happy path: the reviewer (MhlotiM) opens a submitted tender from the Inbox, reviews the
  962  |   // read-only tabs, approves it and submits — the item then leaves the Review-and-Approve inbox.
  963  |   // Targets a tender created by the TC-01 spec ("TC-01 Automated Draft Tender ...") so the test
  964  |   // is self-supplying and re-runnable (each run consumes one such item; TC-01 replenishes them).
  965  |   test('TC-02: Review and Approve', async ({ page }) => {
  966  |     test.setTimeout(120_000);
  967  |     await loginAs(page, REVIEWER);
  968  |     await openInbox(page);
  969  | 
  970  |     // ASSERT Inbox list and Export button are shown
  971  |     await expect(page.getByRole('heading', { name: 'Incoming Items' })).toBeVisible({ timeout: 30000 });
  972  |     await expect(page.getByRole('button', { name: /export/i })).toBeVisible({ timeout: 30000 });
  973  | 
  974  |     // STEP: open a "Review and Approve" tender (one of our TC-01 test tenders) via its
  975  |     // magnifying-glass link. Dismiss the Workflows flyout first so it can't intercept the click.
  976  |     await page.getByRole('heading', { name: 'Incoming Items' }).click();
  977  |     const targetRow = page.getByRole('row')
  978  |       .filter({ hasText: tenderMatch() })
  979  |       .filter({ hasText: 'Review and Approve' })
  980  |       .first();
> 981  |     await expect(targetRow).toBeVisible({ timeout: 30000 });
       |                             ^ Error: expect(locator).toBeVisible() failed
  982  |     // Open the row by navigating to its href, not a positional click: the Workflows accordion
  983  |     // flyout ("My Items" nav-link) can overlap the table and intercept the click. goto avoids that.
  984  |     const rowHref = await targetRow.getByRole('link').first().getAttribute('href');
  985  |     await page.goto(rowHref.startsWith('http') ? rowHref : `${APP_URL.replace('/login', '')}${rowHref}`);
  986  | 
  987  |     // ASSERT (BLOCKING) the item opens on the "Review and Approve" page
  988  |     await expectOnPage(page, 'Review and Approve Tender Details');
  989  | 
  990  |     // NEGATIVE (opt-in SEND_BACKS): send this stage back to "Capture Tender Details", have that actor re-action
  991  |     // it, then return here and carry on with the happy path — the chain still completes.
  992  |     await sendBackAndReturn(page, { stageNo: 2, stage: 'Review and Approve Tender Details', previous: 'Capture Tender Details', actor: REVIEWER });
  993  | 
  994  |     // STEP: review read-only details on the Tender Details tab, then the Publication tab
  995  |     await expect(page.getByText('Evaluation Criteria', { exact: true })).toBeVisible({ timeout: 15000 });
  996  |     await expect(page.getByText(EVAL_CRITERIA).first()).toBeVisible();
  997  |     await page.getByRole('tab', { name: 'Publication' }).click();
  998  |     await expect(page.getByText('Hybrid').first()).toBeVisible({ timeout: 15000 });
  999  | 
  1000 |     // STEP: approve the tender, then submit (Submit enables once a response is chosen)
  1001 |     await page.getByRole('button', { name: 'check-circle Approve' }).click();
  1002 |     const submit = page.getByRole('button', { name: 'Submit', exact: true });
  1003 |     await expect(submit).toBeEnabled({ timeout: 15000 });
  1004 |     await submit.click();
  1005 | 
  1006 |     // ASSERT (BLOCKING) the approval submits and returns to a workflow list (out of the inbox)
  1007 |     await page.waitForURL(/workflows-(my-items|inbox)/, { timeout: 30000 });
  1008 |   });
  1009 | 
  1010 |   // ADO Test Case #57500: https://dev.azure.com/boxfusion/PD-SupplyChainManagement/_workitems/edit/57500
  1011 |   // Happy path: the publisher (TumisangM) opens an approved tender from the Inbox, reviews the
  1012 |   // read-only details, selects a publication method, confirms and submits — the tender becomes
  1013 |   // Advertised and advances to the Consolidate Responses stage. Targets a TC-01 test tender
  1014 |   // (supplied by a prior TC-02 approval), so it's self-supplying and re-runnable.
  1015 |   test('TC-03: Publish Tender', async ({ page }) => {
  1016 |     test.setTimeout(120_000);
  1017 |     await loginAs(page, PUBLISHER);
  1018 |     await openInbox(page);
  1019 | 
  1020 |     // ASSERT Inbox list and Export button are shown
  1021 |     await expect(page.getByRole('heading', { name: 'Incoming Items' })).toBeVisible({ timeout: 30000 });
  1022 |     await expect(page.getByRole('button', { name: /export/i })).toBeVisible({ timeout: 30000 });
  1023 | 
  1024 |     // STEP: open a "Publish Tender" tender (one of our TC-01 test tenders) via its magnifying-glass.
  1025 |     await page.getByRole('heading', { name: 'Incoming Items' }).click();
  1026 |     const targetRow = page.getByRole('row')
  1027 |       .filter({ hasText: tenderMatch() })
  1028 |       .filter({ hasText: 'Publish Tender' })
  1029 |       .first();
  1030 |     await expect(targetRow).toBeVisible({ timeout: 30000 });
  1031 |     // Open the row by navigating to its href, not a positional click: the Workflows accordion
  1032 |     // flyout ("My Items" nav-link) can overlap the table and intercept the click. goto avoids that.
  1033 |     const rowHref = await targetRow.getByRole('link').first().getAttribute('href');
  1034 |     await page.goto(rowHref.startsWith('http') ? rowHref : `${APP_URL.replace('/login', '')}${rowHref}`);
  1035 | 
  1036 |     // ASSERT (BLOCKING) the item opens on the "Publish Tender" page
  1037 |     await expectOnPage(page, 'Publish Tender');
  1038 | 
  1039 |     // NEGATIVE (opt-in SEND_BACKS): send this stage back to "Review and Approve Tender Details", have that actor re-action
  1040 |     // it, then return here and carry on with the happy path — the chain still completes.
  1041 |     await sendBackAndReturn(page, { stageNo: 3, stage: 'Publish Tender', previous: 'Review and Approve Tender Details', actor: PUBLISHER });
  1042 |     await expect(page.getByText(EVAL_CRITERIA).first()).toBeVisible({ timeout: 15000 });
  1043 | 
  1044 |     // STEP: select a publication method (mandatory) and tick the confirmation checkbox.
  1045 |     // The confirmation checkbox has no accessible name; find the innermost block that holds
  1046 |     // both the confirm text and a checkbox (the app text uses "l" typos, so match a safe substring).
  1047 |     await page.getByRole('checkbox', { name: 'Supplier Portal' }).check();
  1048 |     await page.locator('div')
  1049 |       .filter({ hasText: 'publish the Tender' })
  1050 |       .filter({ has: page.getByRole('checkbox') })
  1051 |       .last()
  1052 |       .getByRole('checkbox')
  1053 |       .check();
  1054 | 
  1055 |     // STEP: submit to publish the tender
  1056 |     const submit = page.getByRole('button', { name: 'Submit', exact: true });
  1057 |     await expect(submit).toBeEnabled({ timeout: 15000 });
  1058 |     await submit.click();
  1059 | 
  1060 |     // ASSERT (BLOCKING) the tender is published and advances (Consolidate Responses) or returns to a list
  1061 |     await expect(async () => {
  1062 |       const advanced = await page.getByText('Consolidate Responses').first().isVisible().catch(() => false);
  1063 |       const listed = /workflows-(my-items|inbox)/.test(page.url());
  1064 |       expect(advanced || listed).toBeTruthy();
  1065 |     }).toPass({ timeout: 30000 });
  1066 |   });
  1067 | 
  1068 |   // ADO Test Case #57551: https://dev.azure.com/boxfusion/PD-SupplyChainManagement/_workitems/edit/57551
  1069 |   // Happy path: TumisangM opens an advertised tender at the Consolidate-Responses stage, captures
  1070 |   // three manual supplier responses (each with the mandatory documents attached), confirms the
  1071 |   // responses are consolidated and submits — the tender advances to the Review Compliance stage.
  1072 |   // Self-supplying: targets a TC-01 test tender advertised by a prior TC-03 run.
  1073 |   test('TC-04: Consolidate Supplier Responses', async ({ page }) => {
  1074 |     test.setTimeout(240_000);
  1075 |     await loginAs(page, PUBLISHER); // TumisangM also consolidates responses
  1076 |     await openInbox(page);
  1077 | 
  1078 |     // ASSERT Inbox list and Export button are shown
  1079 |     await expect(page.getByRole('heading', { name: 'Incoming Items' })).toBeVisible({ timeout: 30000 });
  1080 |     await expect(page.getByRole('button', { name: /export/i })).toBeVisible({ timeout: 30000 });
  1081 | 
```