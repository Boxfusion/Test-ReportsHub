# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: projects/bid-management/test-plans/tender-process/bid-supply-chain-management.spec.ts >> BID-SCM — BID: Supply Chain Management >> TC-04: Consolidate Supplier Responses
- Location: projects/bid-management/test-plans/tender-process/bid-supply-chain-management.spec.ts:1073:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('row').filter({ hasText: 'REF2026-1153' }).filter({ hasText: 'Consolidate Responses' }).first()
Expected: visible
Timeout: 30000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByRole('row').filter({ hasText: 'REF2026-1153' }).filter({ hasText: 'Consolidate Responses' }).first() with timeout 30000ms
  - waiting for getByRole('row').filter({ hasText: 'REF2026-1153' }).filter({ hasText: 'Consolidate Responses' }).first()

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
  - text: Latest Tumisang Modula
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
    - listitem: 1-10 of 164 items
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
      - row "search REF2026-1052 Maand-awe Mamathuntsha Tender Process Tender REF2026-1052 - 9TH TENDER Consolidate Responses 07/09/2026 Advertised 17 hour(s) ago":
        - cell "search":
          - link "search":
            - /url: /shesha/workflow-action?id=aba7c56d-8b32-4bc6-be6c-4f9d7ec19563&todoid=bdd4cfc6-8305-4106-b71d-649a708863e9
            - img "search"
        - cell "REF2026-1052"
        - cell "Maand-awe Mamathuntsha"
        - cell "Tender Process"
        - cell "Tender REF2026-1052 - 9TH TENDER"
        - cell "Consolidate Responses"
        - cell "07/09/2026"
        - cell
        - cell "Advertised"
        - cell "17 hour(s) ago"
      - row "search REF2026-1047 Maand-awe Mamathuntsha Tender Process Tender REF2026-1047 - 8TH TENDER Consolidate Responses 07/09/2026 Advertised 17 hour(s) ago":
        - cell "search":
          - link "search":
            - /url: /shesha/workflow-action?id=499a22c8-8ec9-4e49-994d-911e8e8a1717&todoid=19b98d97-46da-46d6-9d44-e66dcb425a1d
            - img "search"
        - cell "REF2026-1047"
        - cell "Maand-awe Mamathuntsha"
        - cell "Tender Process"
        - cell "Tender REF2026-1047 - 8TH TENDER"
        - cell "Consolidate Responses"
        - cell "07/09/2026"
        - cell
        - cell "Advertised"
        - cell "17 hour(s) ago"
      - row "search REF2026-1042 Maand-awe Mamathuntsha Tender Process Tender REF2026-1042 - SEVENTH TENDER Consolidate Responses 07/09/2026 Advertised 17 hour(s) ago":
        - cell "search":
          - link "search":
            - /url: /shesha/workflow-action?id=5ad3677d-e0e5-4dbd-a6c2-b0093d06e786&todoid=0cd8c045-4329-4b8f-8765-06b6119724a2
            - img "search"
        - cell "REF2026-1042"
        - cell "Maand-awe Mamathuntsha"
        - cell "Tender Process"
        - cell "Tender REF2026-1042 - SEVENTH TENDER"
        - cell "Consolidate Responses"
        - cell "07/09/2026"
        - cell
        - cell "Advertised"
        - cell "17 hour(s) ago"
      - row "search REF2026-1037 Maand-awe Mamathuntsha Tender Process Tender REF2026-1037 - SIXITH TENDER Consolidate Responses 07/09/2026 Advertised 17 hour(s) ago":
        - cell "search":
          - link "search":
            - /url: /shesha/workflow-action?id=e6f899e9-0c17-4521-a697-1a7f5772c483&todoid=fb4ca7dc-7e67-43a9-b080-5567d14474bb
            - img "search"
        - cell "REF2026-1037"
        - cell "Maand-awe Mamathuntsha"
        - cell "Tender Process"
        - cell "Tender REF2026-1037 - SIXITH TENDER"
        - cell "Consolidate Responses"
        - cell "07/09/2026"
        - cell
        - cell "Advertised"
        - cell "17 hour(s) ago"
      - row "search REF2026-1032 Maand-awe Mamathuntsha Tender Process Tender REF2026-1032 - FIFTH TENDER Consolidate Responses 07/09/2026 Advertised 17 hour(s) ago":
        - cell "search":
          - link "search":
            - /url: /shesha/workflow-action?id=92633f2a-3a8b-4280-8c1d-deb94a7b296c&todoid=cdf3e5a2-9489-4292-bce9-61fcdc85ca19
            - img "search"
        - cell "REF2026-1032"
        - cell "Maand-awe Mamathuntsha"
        - cell "Tender Process"
        - cell "Tender REF2026-1032 - FIFTH TENDER"
        - cell "Consolidate Responses"
        - cell "07/09/2026"
        - cell
        - cell "Advertised"
        - cell "17 hour(s) ago"
      - row "search REF2026-1024 Maand-awe Mamathuntsha Tender Process Tender REF2026-1024 - FOURTH TENDER Consolidate Responses 07/09/2026 Advertised 17 hour(s) ago":
        - cell "search":
          - link "search":
            - /url: /shesha/workflow-action?id=e8f4e423-9288-4b6c-8759-2fa3403deee3&todoid=b9bd9ce3-610b-4ddc-8468-d4cbbcd43e87
            - img "search"
        - cell "REF2026-1024"
        - cell "Maand-awe Mamathuntsha"
        - cell "Tender Process"
        - cell "Tender REF2026-1024 - FOURTH TENDER"
        - cell "Consolidate Responses"
        - cell "07/09/2026"
        - cell
        - cell "Advertised"
        - cell "17 hour(s) ago"
      - row "search REF2026-1019 Maand-awe Mamathuntsha Tender Process Tender REF2026-1019 - THIRD TENDER Consolidate Responses 07/09/2026 Advertised 17 hour(s) ago":
        - cell "search":
          - link "search":
            - /url: /shesha/workflow-action?id=792fdb76-d008-48c8-b672-ea315a689da4&todoid=7c7de4f3-795d-4553-8829-7f0a02017115
            - img "search"
        - cell "REF2026-1019"
        - cell "Maand-awe Mamathuntsha"
        - cell "Tender Process"
        - cell "Tender REF2026-1019 - THIRD TENDER"
        - cell "Consolidate Responses"
        - cell "07/09/2026"
        - cell
        - cell "Advertised"
        - cell "17 hour(s) ago"
      - row "search REF2026-1014 Maand-awe Mamathuntsha Tender Process Tender REF2026-1014 - SECOND TENDER Consolidate Responses 07/09/2026 Advertised 17 hour(s) ago":
        - cell "search":
          - link "search":
            - /url: /shesha/workflow-action?id=40ba2b26-7275-49f0-ba57-32161aa50ba5&todoid=b0502928-062e-40e8-9bf5-697c6dc0f672
            - img "search"
        - cell "REF2026-1014"
        - cell "Maand-awe Mamathuntsha"
        - cell "Tender Process"
        - cell "Tender REF2026-1014 - SECOND TENDER"
        - cell "Consolidate Responses"
        - cell "07/09/2026"
        - cell
        - cell "Advertised"
        - cell "17 hour(s) ago"
      - row "search REF2026-1008 Maand-awe Mamathuntsha Tender Process Tender REF2026-1008 - FIRST TENDER Consolidate Responses 07/09/2026 Advertised 17 hour(s) ago":
        - cell "search":
          - link "search":
            - /url: /shesha/workflow-action?id=c9b69a6c-af04-4fdc-9a07-abe0332e01a2&todoid=49ee9d07-0543-4062-bdbf-3f07f2ddda7c
            - img "search"
        - cell "REF2026-1008"
        - cell "Maand-awe Mamathuntsha"
        - cell "Tender Process"
        - cell "Tender REF2026-1008 - FIRST TENDER"
        - cell "Consolidate Responses"
        - cell "07/09/2026"
        - cell
        - cell "Advertised"
        - cell "17 hour(s) ago"
      - row "search REF2026-0997 Maand-awe Mamathuntsha Tender Process Tender REF2026-0997 - TC-01 Automated Draft Tender run-mtqq9vy7 - 90/10 Compulsory Hybrid Capture Order Details 07/09/2026 Awarded 20 hour(s) ago":
        - cell "search":
          - link "search":
            - /url: /shesha/workflow-action?id=009a5e92-08b7-44fa-acd4-d2435a12fab0&todoid=708e38f2-36ea-4e23-841d-ce42f80075dd
            - img "search"
        - cell "REF2026-0997"
        - cell "Maand-awe Mamathuntsha"
        - cell "Tender Process"
        - cell "Tender REF2026-0997 - TC-01 Automated Draft Tender run-mtqq9vy7 - 90/10 Compulsory Hybrid"
        - cell "Capture Order Details"
        - cell "07/09/2026"
        - cell
        - cell "Awarded"
        - cell "20 hour(s) ago"
- alert
```

# Test source

```ts
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
  1082 |     // STEP: open a "Consolidate Responses" tender (one of our TC-01 test tenders)
  1083 |     await page.getByRole('heading', { name: 'Incoming Items' }).click();
  1084 |     const targetRow = page.getByRole('row')
  1085 |       .filter({ hasText: tenderMatch() })
  1086 |       .filter({ hasText: 'Consolidate Responses' })
  1087 |       .first();
> 1088 |     await expect(targetRow).toBeVisible({ timeout: 30000 });
       |                             ^ Error: expect(locator).toBeVisible() failed
  1089 |     // Open the row by navigating to its href, not a positional click: the Workflows accordion
  1090 |     // flyout ("My Items" nav-link) can overlap the table and intercept the click. goto avoids that.
  1091 |     const rowHref = await targetRow.getByRole('link').first().getAttribute('href');
  1092 |     await page.goto(rowHref.startsWith('http') ? rowHref : `${APP_URL.replace('/login', '')}${rowHref}`);
  1093 | 
  1094 |     // ASSERT (BLOCKING) the item opens on the Consolidate Responses page
  1095 |     await expectOnPage(page, 'Consolidate Responses');
  1096 | 
  1097 |     // NEGATIVE (opt-in SEND_BACKS): send this stage back to "Publish Tender", have that actor re-action
  1098 |     // it, then return here and carry on with the happy path — the chain still completes.
  1099 |     await sendBackAndReturn(page, { stageNo: 4, stage: 'Consolidate Responses', previous: 'Publish Tender', actor: PUBLISHER });
  1100 | 
  1101 |     // STEP: capture three different manual supplier responses, each with the mandatory docs attached
  1102 |     await addSupplierResponse(page, { supplier: 'A & A Stationers', method: 'Email', price: '30000' });
  1103 |     await addSupplierResponse(page, { supplier: 'BOXFUSION', method: 'Physical', price: '40000' });
  1104 |     await addSupplierResponse(page, { supplier: 'Telkom', method: 'Email', price: '50000' });
  1105 |     await expect(page.getByText('A & A Stationers').first()).toBeVisible({ timeout: 15000 });
  1106 |     await expect(page.getByText('BOXFUSION').first()).toBeVisible();
  1107 |     await expect(page.getByText('Telkom').first()).toBeVisible();
  1108 | 
  1109 |     // REGRESSION GUARD (opt-in via CHECK_SUPPLIER_DEDUPE=1): a captured supplier must not be re-offered
  1110 |     // in the Add-Response dropdown. Runs AFTER all three adds so its dialog open/close can't disrupt the
  1111 |     // add sequence, and is OFF by default so it never destabilises the lifecycle chain. Covers the
  1112 |     // SEPARATE dropdown-dedup defect, not the functionality-score duplication. See
  1113 |     // test-reports/bugs/2026-06-04-bid-supply-chain-management-evaluate-duplicate-supplier.md.
  1114 |     if (process.env.CHECK_SUPPLIER_DEDUPE === '1') {
  1115 |       await assertCapturedSupplierNotReselectable(page, 'A & A Stationers', 'Coca-cola');
  1116 |     }
  1117 | 
  1118 |     // STEP: confirm the responses are consolidated, then submit
  1119 |     await page.locator('div')
  1120 |       .filter({ hasText: 'received and consolidated' })
  1121 |       .filter({ has: page.getByRole('checkbox') })
  1122 |       .last()
  1123 |       .getByRole('checkbox')
  1124 |       .check();
  1125 |     const submit = page.getByRole('button', { name: 'Submit', exact: true });
  1126 |     await expect(submit).toBeEnabled({ timeout: 15000 });
  1127 |     await submit.click();
  1128 | 
  1129 |     // ASSERT (BLOCKING) consolidation submits and advances (Review Compliance) or leaves the page
  1130 |     await expect(async () => {
  1131 |       const advanced = await page.getByText('Review Compliance').first().isVisible().catch(() => false);
  1132 |       const listed = /workflows-(my-items|inbox)/.test(page.url());
  1133 |       const gone = !(await page.getByText('Consolidate Responses:').first().isVisible().catch(() => false));
  1134 |       expect(advanced || listed || gone).toBeTruthy();
  1135 |     }).toPass({ timeout: 30000 });
  1136 |   });
  1137 | 
  1138 |   // ADO Test Case #57553: https://dev.azure.com/boxfusion/PD-SupplyChainManagement/_workitems/edit/57553
  1139 |   // Happy path: TumisangM opens a tender at the Verify-Compliance stage, marks every consolidated
  1140 |   // supplier response Compliant (per-supplier dialog), confirms the review and submits — the tender
  1141 |   // advances to the next evaluation stage. Self-supplying: targets a TC-01 test tender that a prior
  1142 |   // TC-04 run consolidated (so it carries supplier responses to assess).
  1143 |   test('TC-05: Review Compliance', async ({ page }) => {
  1144 |     test.setTimeout(240_000);
  1145 |     await loginAs(page, PUBLISHER); // TumisangM also verifies compliance
  1146 |     await openInbox(page);
  1147 | 
  1148 |     // ASSERT Inbox list and Export button are shown
  1149 |     await expect(page.getByRole('heading', { name: 'Incoming Items' })).toBeVisible({ timeout: 30000 });
  1150 |     await expect(page.getByRole('button', { name: /export/i })).toBeVisible({ timeout: 30000 });
  1151 | 
  1152 |     // STEP: open a "Verify Compliance" tender (one of our TC-01 test tenders)
  1153 |     await page.getByRole('heading', { name: 'Incoming Items' }).click();
  1154 |     const targetRow = page.getByRole('row')
  1155 |       .filter({ hasText: tenderMatch() })
  1156 |       .filter({ hasText: 'Verify Compliance' })
  1157 |       .first();
  1158 |     await expect(targetRow).toBeVisible({ timeout: 30000 });
  1159 |     // Open the row by navigating to its href, not a positional click: the Workflows accordion
  1160 |     // flyout ("My Items" nav-link) can overlap the table and intercept the click. goto avoids that.
  1161 |     const rowHref = await targetRow.getByRole('link').first().getAttribute('href');
  1162 |     await page.goto(rowHref.startsWith('http') ? rowHref : `${APP_URL.replace('/login', '')}${rowHref}`);
  1163 |     // Wait for the actual navigation — the Inbox row's "Verify Compliance" action text would
  1164 |     // otherwise satisfy a text assertion before the item page even loads.
  1165 |     await page.waitForURL(/workflow-action/, { timeout: 30000 });
  1166 | 
  1167 |     // ASSERT (BLOCKING) the item opens on the Verify Compliance page (heading has a colon)
  1168 |     await expectOnPage(page, 'Verify Compliance:');
  1169 | 
  1170 |     // NEGATIVE (opt-in SEND_BACKS): send this stage back to "Consolidate Responses", have that actor re-action
  1171 |     // it, then return here and carry on with the happy path — the chain still completes.
  1172 |     await sendBackAndReturn(page, { stageNo: 5, stage: 'Verify Compliance', previous: 'Consolidate Responses', actor: PUBLISHER });
  1173 | 
  1174 |     // STEP: assess every consolidated supplier response as Compliant (one dialog per supplier).
  1175 |     // The Manual Responses table loads asynchronously, so wait for the per-row edit icons first.
  1176 |     const editIcons = page.locator('.sha-link:has(.anticon-edit)');
  1177 |     await expect(editIcons.first()).toBeVisible({ timeout: 30000 });
  1178 |     const supplierCount = await editIcons.count();
  1179 |     expect(supplierCount).toBeGreaterThan(0);
  1180 |     for (let i = 0; i < supplierCount; i++) {
  1181 |       await editIcons.nth(i).click();
  1182 |       await finaliseOpenComplianceDialog(page);
  1183 |     }
  1184 | 
  1185 |     // ASSERT (BLOCKING) every supplier response actually PERSISTED as Compliant. This is the guard
  1186 |     // against the silent-failure mode found on 2026-07-29: if a document row's Comments are missing,
  1187 |     // Finalise Compliance throws `Checklist:Update` in the console, the dialog closes/stays without a
  1188 |     // message and NOTHING is saved. Reading the Compliance Status column back is the only reliable
```