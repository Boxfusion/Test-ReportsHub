# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: projects/bid-management/test-plans/tender-process/bid-supply-chain-management.spec.ts >> BID-SCM — BID: Supply Chain Management >> TC-06: Capture Pricing and Specific Goals
- Location: projects/bid-management/test-plans/tender-process/bid-supply-chain-management.spec.ts:1226:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('row').filter({ hasText: 'REF2026-1153' }).filter({ hasText: 'Calculate Specific Goal Points' }).first()
Expected: visible
Timeout: 30000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByRole('row').filter({ hasText: 'REF2026-1153' }).filter({ hasText: 'Calculate Specific Goal Points' }).first() with timeout 30000ms
  - waiting for getByRole('row').filter({ hasText: 'REF2026-1153' }).filter({ hasText: 'Calculate Specific Goal Points' }).first()

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
> 1241 |     await expect(targetRow).toBeVisible({ timeout: 30000 });
       |                             ^ Error: expect(locator).toBeVisible() failed
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
```