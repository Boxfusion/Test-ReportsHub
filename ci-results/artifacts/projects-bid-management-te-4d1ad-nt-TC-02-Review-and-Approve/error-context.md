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

Locator: getByRole('row').filter({ hasText: 'REF2026-1980' }).filter({ hasText: 'Review and Approve' }).first()
Expected: visible
Timeout: 30000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByRole('row').filter({ hasText: 'REF2026-1980' }).filter({ hasText: 'Review and Approve' }).first() with timeout 30000ms
  - waiting for getByRole('row').filter({ hasText: 'REF2026-1980' }).filter({ hasText: 'Review and Approve' }).first()

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
    - listitem: 1-10 of 165 items
    - listitem "Previous Page":
      - button "left" [disabled]:
        - img "left"
    - listitem "1"
    - listitem "2"
    - listitem "3"
    - listitem "Next 3 Pages":
      - img "double-right"
      - text: •••
    - listitem "17"
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
      - row "search REF2026-1928 Maand-awe Mamathuntsha Tender Process Tender REF2026-1928 - Purchase of 30 SmartGov Licenses Review and Approve Tender Details 22/10/2026 27/10/2026 Submitted 2 day(s) ago":
        - cell "search":
          - link "search":
            - /url: /shesha/workflow-action?id=7f2a0d4a-9e66-44f0-bcf2-c8d4f9de4c81&todoid=223fe62b-a6e5-4add-aca0-9944afdb27bc
            - img "search"
        - cell "REF2026-1928"
        - cell "Maand-awe Mamathuntsha"
        - cell "Tender Process"
        - cell "Tender REF2026-1928 - Purchase of 30 SmartGov Licenses"
        - cell "Review and Approve Tender Details"
        - cell "22/10/2026"
        - cell "27/10/2026"
        - cell "Submitted"
        - cell "2 day(s) ago"
      - row "search CTR4661/2026-NOT0364/2026 System Administrator Contract Notification Workflow Thabiso Confirm Action Taken 21/10/2026 In Progress 3 day(s) ago":
        - cell "search":
          - link "search":
            - /url: /shesha/workflow-action?id=deb08b82-0f22-417c-885d-208a8c183463&todoid=ab8084b1-23ac-42af-8f55-477f29cc5f41
            - img "search"
        - cell "CTR4661/2026-NOT0364/2026"
        - cell "System Administrator"
        - cell "Contract Notification Workflow"
        - cell "Thabiso"
        - cell "Confirm Action Taken"
        - cell "21/10/2026"
        - cell
        - cell "In Progress"
        - cell "3 day(s) ago"
      - row "search CTR3136/2026 Bonolo Botha Contract YH400 Legal Approver 12/10/2026 Vetting 12 day(s) ago":
        - cell "search":
          - link "search":
            - /url: /shesha/workflow-action?id=04f25136-6a59-4028-a416-ef7fc8918483&todoid=5bad48e5-c06c-4d05-8c05-42730de7ee5d
            - img "search"
        - cell "CTR3136/2026"
        - cell "Bonolo Botha"
        - cell "Contract"
        - cell "YH400"
        - cell "Legal Approver"
        - cell "12/10/2026"
        - cell
        - cell "Vetting"
        - cell "12 day(s) ago"
      - row "search CTR2373/2026 System Administrator Contract MONDAY Legal Approver 09/10/2026 Vetting 15 day(s) ago":
        - cell "search":
          - link "search":
            - /url: /shesha/workflow-action?id=7f2a035e-a556-4e83-ba46-d440a2ad0c33&todoid=0628e243-b704-41ba-be49-c5c094a531f2
            - img "search"
        - cell "CTR2373/2026"
        - cell "System Administrator"
        - cell "Contract"
        - cell "MONDAY"
        - cell "Legal Approver"
        - cell "09/10/2026"
        - cell
        - cell "Vetting"
        - cell "15 day(s) ago"
      - row "search CTR2185/2026 System Administrator Contract ACE ONE Legal Approver 09/10/2026 Vetted - Awaiting Signature 15 day(s) ago":
        - cell "search":
          - link "search":
            - /url: /shesha/workflow-action?id=32631828-1560-484c-8634-1fccba98da65&todoid=bcd9fc29-7a2a-457e-9eef-fe1aac68cb68
            - img "search"
        - cell "CTR2185/2026"
        - cell "System Administrator"
        - cell "Contract"
        - cell "ACE ONE"
        - cell "Legal Approver"
        - cell "09/10/2026"
        - cell
        - cell "Vetted - Awaiting Signature"
        - cell "15 day(s) ago"
      - row "search CTR2911/2026-NOT0346/2026 System Administrator Contract Notification Workflow BOXFUSION ONE Confirm Action Taken 09/10/2026 In Progress 15 day(s) ago":
        - cell "search":
          - link "search":
            - /url: /shesha/workflow-action?id=74c3e9d6-f6b2-45a0-af62-54c95cf124c2&todoid=ecbe18d2-4667-45e2-bff5-8d82323f6a73
            - img "search"
        - cell "CTR2911/2026-NOT0346/2026"
        - cell "System Administrator"
        - cell "Contract Notification Workflow"
        - cell "BOXFUSION ONE"
        - cell "Confirm Action Taken"
        - cell "09/10/2026"
        - cell
        - cell "In Progress"
        - cell "15 day(s) ago"
      - row "search CTR2715/2026-NOT0336/2026 System Administrator Contract Notification Workflow N300 Confirm Action Taken 06/10/2026 In Progress 18 day(s) ago":
        - cell "search":
          - link "search":
            - /url: /shesha/workflow-action?id=5dc720e6-e95f-492c-bb81-ed112601d711&todoid=f353fdff-68df-4eb1-818e-ba8e50b9f5a9
            - img "search"
        - cell "CTR2715/2026-NOT0336/2026"
        - cell "System Administrator"
        - cell "Contract Notification Workflow"
        - cell "N300"
        - cell "Confirm Action Taken"
        - cell "06/10/2026"
        - cell
        - cell "In Progress"
        - cell "18 day(s) ago"
      - row "search CTR2678/2026-NOT0332/2026 System Administrator Contract Notification Workflow End-to-end QA test of the contract workflow. Confirm Action Taken 06/10/2026 In Progress 18 day(s) ago":
        - cell "search":
          - link "search":
            - /url: /shesha/workflow-action?id=0c61c1b3-32fd-43ff-ac9e-8ac27fee3bb2&todoid=b6f47cdf-3649-4210-93c0-2c6f3e13e9af
            - img "search"
        - cell "CTR2678/2026-NOT0332/2026"
        - cell "System Administrator"
        - cell "Contract Notification Workflow"
        - cell "End-to-end QA test of the contract workflow."
        - cell "Confirm Action Taken"
        - cell "06/10/2026"
        - cell
        - cell "In Progress"
        - cell "18 day(s) ago"
      - row "search CTR2678/2026 System Administrator Contract E2E Test Contract - Plumbing Services Legal Approver 06/10/2026 Vetting 18 day(s) ago":
        - cell "search":
          - link "search":
            - /url: /shesha/workflow-action?id=c203ca79-a72e-4c5b-a6c6-8a0e5a2d93bb&todoid=819932b8-a57e-4828-ae54-377704ae557e
            - img "search"
        - cell "CTR2678/2026"
        - cell "System Administrator"
        - cell "Contract"
        - cell "E2E Test Contract - Plumbing Services"
        - cell "Legal Approver"
        - cell "06/10/2026"
        - cell
        - cell "Vetting"
        - cell "18 day(s) ago"
      - row "search CTR2437/2026-NOT0326/2026 System Administrator Contract Notification Workflow tuesaday one Confirm Action Taken 02/10/2026 In Progress 23 day(s) ago":
        - cell "search":
          - link "search":
            - /url: /shesha/workflow-action?id=bf7bd74b-b6f1-4636-9d32-9a3b7c1ac692&todoid=9cf330db-20e8-45f8-ab86-aadf0164c2b8
            - img "search"
        - cell "CTR2437/2026-NOT0326/2026"
        - cell "System Administrator"
        - cell "Contract Notification Workflow"
        - cell "tuesaday one"
        - cell "Confirm Action Taken"
        - cell "02/10/2026"
        - cell
        - cell "In Progress"
        - cell "23 day(s) ago"
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