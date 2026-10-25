# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: projects/bid-management/test-plans/tender-process/bid-supply-chain-management.spec.ts >> BID-SCM — BID: Supply Chain Management >> TC-05: Review Compliance
- Location: projects/bid-management/test-plans/tender-process/bid-supply-chain-management.spec.ts:1143:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('row').filter({ hasText: 'REF2026-1980' }).filter({ hasText: 'Verify Compliance' }).first()
Expected: visible
Timeout: 30000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByRole('row').filter({ hasText: 'REF2026-1980' }).filter({ hasText: 'Verify Compliance' }).first() with timeout 30000ms
  - waiting for getByRole('row').filter({ hasText: 'REF2026-1980' }).filter({ hasText: 'Verify Compliance' }).first()

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
    - listitem: 1-10 of 183 items
    - listitem "Previous Page":
      - button "left" [disabled]:
        - img "left"
    - listitem "1"
    - listitem "2"
    - listitem "3"
    - listitem "Next 3 Pages":
      - img "double-right"
      - text: •••
    - listitem "19"
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
      - row "search REF2026-1092 Maand-awe Mamathuntsha Tender Process Tender REF2026-1092 - Testing tender name email notification Consolidate Responses 22/10/2026 In Progress 2 day(s) ago":
        - cell "search":
          - link "search":
            - /url: /shesha/workflow-action?id=65bf04a1-3c1b-4107-9611-ef06c7cc58aa&todoid=f01ee6b0-320b-4dd5-a8c8-f0a43ae272e9
            - img "search"
        - cell "REF2026-1092"
        - cell "Maand-awe Mamathuntsha"
        - cell "Tender Process"
        - cell "Tender REF2026-1092 - Testing tender name email notification"
        - cell "Consolidate Responses"
        - cell "22/10/2026"
        - cell
        - cell "In Progress"
        - cell "2 day(s) ago"
      - row "search REF2026-1018 Maand-awe Mamathuntsha Tender Process Tender REF2026-1018 - TC-01 Automated Draft Tender run-muq1tt2e - 90/10 Compulsory Hybrid Calculate Specific Goal Points 02/10/2026 Evaluation In Progress 23 day(s) ago":
        - cell "search":
          - link "search":
            - /url: /shesha/workflow-action?id=a39d1ffa-0a0f-4ac4-a203-fc51f2f05c05&todoid=bbfad61c-d214-48e7-b7ee-f3103ce4dedd
            - img "search"
        - cell "REF2026-1018"
        - cell "Maand-awe Mamathuntsha"
        - cell "Tender Process"
        - cell "Tender REF2026-1018 - TC-01 Automated Draft Tender run-muq1tt2e - 90/10 Compulsory Hybrid"
        - cell "Calculate Specific Goal Points"
        - cell "02/10/2026"
        - cell
        - cell "Evaluation In Progress"
        - cell "23 day(s) ago"
      - row "search REF2026-2269 Maand-awe Mamathuntsha Tender Process Tender REF2026-2269 - TC-01 Automated Draft Tender run-munmxlvy - 90/10 Compulsory Hybrid Capture Order Details 30/09/2026 Awarded 24 day(s) ago":
        - cell "search":
          - link "search":
            - /url: /shesha/workflow-action?id=da8d52fd-7f03-4327-b531-9230c7d8bf1f&todoid=95013078-fe74-426b-b608-9d8fa6484960
            - img "search"
        - cell "REF2026-2269"
        - cell "Maand-awe Mamathuntsha"
        - cell "Tender Process"
        - cell "Tender REF2026-2269 - TC-01 Automated Draft Tender run-munmxlvy - 90/10 Compulsory Hybrid"
        - cell "Capture Order Details"
        - cell "30/09/2026"
        - cell
        - cell "Awarded"
        - cell "24 day(s) ago"
      - row "search REF2026-2263 Maand-awe Mamathuntsha Tender Process Tender REF2026-2263 - TC-01 Automated Draft Tender run-mungw4ld - 90/10 Compulsory Hybrid Capture Order Details 30/09/2026 Awarded 25 day(s) ago":
        - cell "search":
          - link "search":
            - /url: /shesha/workflow-action?id=db429f3b-9fe1-4f23-bafe-ecb9f92d1534&todoid=91a74fd4-30d4-427e-b8f1-9de6e06d22e6
            - img "search"
        - cell "REF2026-2263"
        - cell "Maand-awe Mamathuntsha"
        - cell "Tender Process"
        - cell "Tender REF2026-2263 - TC-01 Automated Draft Tender run-mungw4ld - 90/10 Compulsory Hybrid"
        - cell "Capture Order Details"
        - cell "30/09/2026"
        - cell
        - cell "Awarded"
        - cell "25 day(s) ago"
      - row "search REF2026-2237 Maand-awe Mamathuntsha Tender Process Tender REF2026-2237 - TC-01 Automated Draft Tender run-mum7zxim - 90/10 Compulsory Hybrid Capture Order Details 29/09/2026 Awarded 25 day(s) ago":
        - cell "search":
          - link "search":
            - /url: /shesha/workflow-action?id=78a3b420-0519-4f75-91e2-7bdc2b8e34e3&todoid=6cfcaedb-f132-440e-bddf-341716f5a98e
            - img "search"
        - cell "REF2026-2237"
        - cell "Maand-awe Mamathuntsha"
        - cell "Tender Process"
        - cell "Tender REF2026-2237 - TC-01 Automated Draft Tender run-mum7zxim - 90/10 Compulsory Hybrid"
        - cell "Capture Order Details"
        - cell "29/09/2026"
        - cell
        - cell "Awarded"
        - cell "25 day(s) ago"
      - row "search REF2026-2231 Maand-awe Mamathuntsha Tender Process Tender REF2026-2231 - TC-01 Automated Draft Tender run-mum1no3q - 90/10 Compulsory Hybrid Capture Order Details 29/09/2026 Awarded 26 day(s) ago":
        - cell "search":
          - link "search":
            - /url: /shesha/workflow-action?id=03fb7e6e-3a2d-415b-a007-4ff242c7ac46&todoid=049936af-ac05-4469-bb28-10018809851f
            - img "search"
        - cell "REF2026-2231"
        - cell "Maand-awe Mamathuntsha"
        - cell "Tender Process"
        - cell "Tender REF2026-2231 - TC-01 Automated Draft Tender run-mum1no3q - 90/10 Compulsory Hybrid"
        - cell "Capture Order Details"
        - cell "29/09/2026"
        - cell
        - cell "Awarded"
        - cell "26 day(s) ago"
      - row "search REF2026-2192 Maand-awe Mamathuntsha Tender Process Tender REF2026-2192 - TC-01 Automated Draft Tender run-mukrakui - 90/10 Compulsory Hybrid Capture Order Details 28/09/2026 Awarded 26 day(s) ago":
        - cell "search":
          - link "search":
            - /url: /shesha/workflow-action?id=e00d351c-b4a9-454a-ab04-eba42991e04c&todoid=575f06d3-21f2-4470-87e5-00101e41f6f0
            - img "search"
        - cell "REF2026-2192"
        - cell "Maand-awe Mamathuntsha"
        - cell "Tender Process"
        - cell "Tender REF2026-2192 - TC-01 Automated Draft Tender run-mukrakui - 90/10 Compulsory Hybrid"
        - cell "Capture Order Details"
        - cell "28/09/2026"
        - cell
        - cell "Awarded"
        - cell "26 day(s) ago"
      - row "search REF2026-2181 Maand-awe Mamathuntsha Tender Process Tender REF2026-2181 - TC-01 Automated Draft Tender run-muj704yv - 90/10 Compulsory Hybrid Capture Order Details 27/09/2026 Awarded 28 day(s) ago":
        - cell "search":
          - link "search":
            - /url: /shesha/workflow-action?id=9e7f420d-192b-47a2-b4e1-3cbf7aaece40&todoid=70d7b519-f03d-478f-a1fd-2c7b8a1b041b
            - img "search"
        - cell "REF2026-2181"
        - cell "Maand-awe Mamathuntsha"
        - cell "Tender Process"
        - cell "Tender REF2026-2181 - TC-01 Automated Draft Tender run-muj704yv - 90/10 Compulsory Hybrid"
        - cell "Capture Order Details"
        - cell "27/09/2026"
        - cell
        - cell "Awarded"
        - cell "28 day(s) ago"
      - row "search REF2026-2175 Maand-awe Mamathuntsha Tender Process Tender REF2026-2175 - TC-01 Automated Draft Tender run-muhw33cc - 90/10 Compulsory Hybrid Capture Order Details 26/09/2026 Awarded 28 day(s) ago":
        - cell "search":
          - link "search":
            - /url: /shesha/workflow-action?id=87476bca-4e4d-4358-9761-6f2f9cb40a5e&todoid=6cf57ad1-eea7-449a-ad3e-50dfb840129e
            - img "search"
        - cell "REF2026-2175"
        - cell "Maand-awe Mamathuntsha"
        - cell "Tender Process"
        - cell "Tender REF2026-2175 - TC-01 Automated Draft Tender run-muhw33cc - 90/10 Compulsory Hybrid"
        - cell "Capture Order Details"
        - cell "26/09/2026"
        - cell
        - cell "Awarded"
        - cell "28 day(s) ago"
      - row "search REF2026-2164 Maand-awe Mamathuntsha Tender Process Tender REF2026-2164 - TC-01 Automated Draft Tender run-muggimbp - 90/10 Compulsory Hybrid Capture Order Details 25/09/2026 Awarded 29 day(s) ago":
        - cell "search":
          - link "search":
            - /url: /shesha/workflow-action?id=59d7fa70-0a5a-487a-81f7-036972cb1d95&todoid=bbab33a6-d5c5-4651-a4d1-4c53a6e9cc62
            - img "search"
        - cell "REF2026-2164"
        - cell "Maand-awe Mamathuntsha"
        - cell "Tender Process"
        - cell "Tender REF2026-2164 - TC-01 Automated Draft Tender run-muggimbp - 90/10 Compulsory Hybrid"
        - cell "Capture Order Details"
        - cell "25/09/2026"
        - cell
        - cell "Awarded"
        - cell "29 day(s) ago"
- alert
```

# Test source

```ts
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
  1088 |     await expect(targetRow).toBeVisible({ timeout: 30000 });
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
> 1158 |     await expect(targetRow).toBeVisible({ timeout: 30000 });
       |                             ^ Error: expect(locator).toBeVisible() failed
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
  1189 |     // proof the dialog work took effect.
  1190 |     for (let i = 0; i < supplierCount; i++) {
  1191 |       await expect(
  1192 |         page.getByRole('row').filter({ hasText: 'COMPLIANT' }).nth(i),
  1193 |         `supplier response ${i + 1} of ${supplierCount} did not persist as COMPLIANT — the compliance `
  1194 |         + 'dialog silently failed to save (check the console for Checklist:Update)',
  1195 |       ).toBeVisible({ timeout: 20000 });
  1196 |     }
  1197 | 
  1198 |     // STEP: confirm the compliance review and submit
  1199 |     await page.locator('div')
  1200 |       .filter({ hasText: 'has been captured accurately' })
  1201 |       .filter({ has: page.getByRole('checkbox') })
  1202 |       .last()
  1203 |       .getByRole('checkbox')
  1204 |       .check();
  1205 |     const submit = page.getByRole('button', { name: 'Submit', exact: true });
  1206 |     await expect(submit).toBeEnabled({ timeout: 15000 });
  1207 |     await submit.click();
  1208 | 
  1209 |     // ASSERT (BLOCKING) the WORKFLOW actually advanced — not merely that the browser landed on a list.
  1210 |     // The previous assertion was `gone || listed`, which passed as soon as the URL looked like a list
  1211 |     // page even if the tender was still parked at Verify Compliance (2026-07-29: TC-05 reported PASS
  1212 |     // while the stage had to be completed by hand). Proof of advance = the tender is no longer offered
  1213 |     // at the Verify Compliance stage in this user's inbox.
  1214 |     await openInbox(page);
  1215 |     await expect(
  1216 |       page.getByRole('row').filter({ hasText: tenderMatch() }).filter({ hasText: 'Verify Compliance' }),
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
```