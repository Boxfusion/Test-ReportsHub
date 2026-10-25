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

Locator: getByRole('row').filter({ hasText: 'REF2026-1980' }).filter({ hasText: 'Calculate Specific Goal Points' }).first()
Expected: visible
Timeout: 30000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByRole('row').filter({ hasText: 'REF2026-1980' }).filter({ hasText: 'Calculate Specific Goal Points' }).first() with timeout 30000ms
  - waiting for getByRole('row').filter({ hasText: 'REF2026-1980' }).filter({ hasText: 'Calculate Specific Goal Points' }).first()

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