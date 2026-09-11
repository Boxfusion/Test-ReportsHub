# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: projects/PD-PMDS/test-plans/contracting/sl1-12-contracting-scenarios.spec.ts >> TC-00 — Contracting is opened for the full population >> TC-00 — admin verifies the population is fully in progress
- Location: projects/PD-PMDS/test-plans/contracting/sl1-12-contracting-scenarios.spec.ts:45:7

# Error details

```
Error: Contracting status

expect(received).toBe(expected) // Object.is equality

Expected: "IN PROGRESS"
Received: "NOT STARTED"
```

# Page snapshot

```yaml
- generic [active] [ref=f2e1]:
  - generic [ref=f2e4]:
    - complementary [ref=f2e5]:
      - menu [ref=f2e9]:
        - menuitem "calendar Leave Management" [ref=f2e10] [cursor=pointer]:
          - img "calendar" [ref=f2e11]
          - generic [ref=f2e14]: Leave Management
        - menuitem "calendar SaGov Leave Management" [ref=f2e15] [cursor=pointer]:
          - img "calendar" [ref=f2e16]
          - generic [ref=f2e19]: SaGov Leave Management
        - menuitem "book SaGov PMDS" [ref=f2e20] [cursor=pointer]:
          - img "book" [ref=f2e21]
          - generic [ref=f2e24]: SaGov PMDS
        - menuitem "snippets QMS" [ref=f2e25] [cursor=pointer]:
          - img "snippets" [ref=f2e26]
          - generic [ref=f2e29]: QMS
        - menuitem "bank Organisational Structure" [ref=f2e30] [cursor=pointer]:
          - img "bank" [ref=f2e31]
          - generic [ref=f2e34]: Organisational Structure
        - menuitem "apartment Workflows" [ref=f2e35] [cursor=pointer]:
          - img "apartment" [ref=f2e36]
          - generic [ref=f2e39]: Workflows
        - menuitem "tool Administration" [ref=f2e40] [cursor=pointer]:
          - img "tool" [ref=f2e41]
          - generic [ref=f2e44]: Administration
        - menuitem "setting Configurations" [ref=f2e45] [cursor=pointer]:
          - img "setting" [ref=f2e46]
          - generic [ref=f2e49]: Configurations
      - img "menu-unfold" [ref=f2e52] [cursor=pointer]
    - generic [ref=f2e55]:
      - banner [ref=f2e56]:
        - generic [ref=f2e62]:
          - generic [ref=f2e64]:
            - button [ref=f2e65] [cursor=pointer]:
              - img "edit" [ref=f2e66]
            - paragraph [ref=f2e69] [cursor=pointer]: Shesha/header v14
            - generic [ref=f2e70]:
              - generic [ref=f2e71]: Live
              - img "close" [ref=f2e72] [cursor=pointer]
          - generic [ref=f2e83]:
            - link [ref=f2e89] [cursor=pointer]:
              - /url: /
            - generic [ref=f2e101]:
              - generic [ref=f2e102]:
                - generic [ref=f2e104]:
                  - generic [ref=f2e105]: Live Mode
                  - switch "Switch to Edit mode" [ref=f2e107] [cursor=pointer]
                - generic "Click to change view mode" [ref=f2e111] [cursor=pointer]:
                  - img "block" [ref=f2e112]
                  - generic [ref=f2e115]: Live
              - generic [ref=f2e117]:
                - generic [ref=f2e118] [cursor=pointer]:
                  - text: System Administrator
                  - img "down" [ref=f2e119]
                - img "user" [ref=f2e123]
      - main [ref=f2e126]:
        - generic [ref=f2e132]:
          - generic [ref=f2e134]:
            - button [ref=f2e135] [cursor=pointer]:
              - img "edit" [ref=f2e136]
            - paragraph [ref=f2e139] [cursor=pointer]: SaGov.Pmds/sagov-cycle-details-view v38
            - generic [ref=f2e140]:
              - generic [ref=f2e141]: Live
              - img "close" [ref=f2e142] [cursor=pointer]
          - generic [ref=f2e155]:
            - separator [ref=f2e156]
            - generic [ref=f2e157]: SL 1-12 Performance Agreement for FY2026/27
            - generic [ref=f2e165]:
              - tablist [ref=f2e166]:
                - generic [ref=f2e168]:
                  - tab "Manage Process" [selected] [ref=f2e170] [cursor=pointer]
                  - tab "Employee List" [ref=f2e172] [cursor=pointer]
                  - tab "Score Sheet" [ref=f2e174] [cursor=pointer]
              - tabpanel "Manage Process" [ref=f2e177]:
                - generic [ref=f2e179]:
                  - alert [ref=f2e180]:
                    - img "info-circle" [ref=f2e181]
                    - generic [ref=f2e184]: "Hint: You can keep track of and manage the PMDS process using the dashboard below. To initiate the Performance management Process, click on the 'Open Process' link below"
                  - generic [ref=f2e194]:
                    - generic [ref=f2e196]:
                      - button [ref=f2e197] [cursor=pointer]:
                        - img "edit" [ref=f2e198]
                      - paragraph [ref=f2e201] [cursor=pointer]: SaGov.Pmds/sagov-cycle-details-item v33
                      - generic [ref=f2e202]:
                        - generic [ref=f2e203]: Live
                        - img "close" [ref=f2e204] [cursor=pointer]
                    - generic [ref=f2e211]:
                      - generic [ref=f2e212]:
                        - generic [ref=f2e221]:
                          - generic [ref=f2e224]:
                            - generic [ref=f2e228]:
                              - generic [ref=f2e229]: Contracting
                              - generic [ref=f2e235]: Not Started
                            - button "Open process" [ref=f2e248] [cursor=pointer]
                          - generic [ref=f2e254]:
                            - generic [ref=f2e255]: "45"
                            - generic [ref=f2e261]: Total
                          - generic [ref=f2e273]:
                            - generic [ref=f2e274]: "45"
                            - generic [ref=f2e280]: Not Started
                          - generic [ref=f2e292]:
                            - generic [ref=f2e293]: "0"
                            - generic [ref=f2e299]: In progress
                          - generic [ref=f2e311]:
                            - generic [ref=f2e312]: "0"
                            - generic [ref=f2e318]: Completed
                        - separator [ref=f2e324]
                      - generic [ref=f2e325]:
                        - generic [ref=f2e334]:
                          - generic [ref=f2e341]:
                            - generic [ref=f2e342]: Mid Year Assessment
                            - generic [ref=f2e348]: Not Started
                          - generic [ref=f2e359]:
                            - generic [ref=f2e360]: "45"
                            - generic [ref=f2e366]: Total
                          - generic [ref=f2e378]:
                            - generic [ref=f2e379]: "45"
                            - generic [ref=f2e385]: Not Started
                          - generic [ref=f2e397]:
                            - generic [ref=f2e398]: "0"
                            - generic [ref=f2e404]: In progress
                          - generic [ref=f2e416]:
                            - generic [ref=f2e417]: "0"
                            - generic [ref=f2e423]: Completed
                        - separator [ref=f2e429]
                      - generic [ref=f2e439]:
                        - generic [ref=f2e446]:
                          - generic [ref=f2e447]: Annual Assessment
                          - generic [ref=f2e453]: Not Started
                        - generic [ref=f2e464]:
                          - generic [ref=f2e465]: "45"
                          - generic [ref=f2e471]: Total
                        - generic [ref=f2e483]:
                          - generic [ref=f2e484]: "45"
                          - generic [ref=f2e490]: Not Started
                        - generic [ref=f2e502]:
                          - generic [ref=f2e503]: "0"
                          - generic [ref=f2e509]: In progress
                        - generic [ref=f2e521]:
                          - generic [ref=f2e522]: "0"
                          - generic [ref=f2e528]: Completed
  - alert [ref=f2e534]
```

# Test source

```ts
  1   | /**
  2   |  * Derived from sl1-12-contracting-scenarios.md — the .md plan is canonical.
  3   |  * Selectors reuse pmds.ts (captured live on 2026-08-02, extended 2026-08-13 with tier-2/outcomes
  4   |  * helpers). This run was driven live on 2026-08-13 against a freshly-opened Contracting stage;
  5   |  * the spec is checked in as a derived, re-runnable artefact for the next cycle.
  6   |  */
  7   | import { test, expect, Page } from '@playwright/test';
  8   | import * as path from 'path';
  9   | import * as P from './pmds';
  10  | 
  11  | const MEDIATION_FILE = path.resolve(__dirname, '../../../../test-data/mediation-outcome.txt');
  12  | 
  13  | // One Contracting chain per employee; the draft wizard is slow (8 key-activity modals), so the
  14  | // hub's 90s default timeout is raised here rather than globally.
  15  | test.describe.configure({ mode: 'serial', timeout: 900_000 });
  16  | 
  17  | const ADMIN = { user: 'admin', pwd: 'P@ssw0rd' };
  18  | const SUPERVISOR = 'LungileN';
  19  | const MEDIATOR = 'BabalwaM';
  20  | const TIER2 = 'Sampha';
  21  | const HR = 'SalesHR';
  22  | 
  23  | const CYCLE_URL =
  24  |   `${P.APP}/dynamic/SaGov.Pmds/sagov-cycle-details-view?id=7cf9054b-8c69-4313-ae5c-8039bf495c04` +
  25  |   `&name=SL%201-12%20Performance%20Agreement&fy=FY2026/27`;
  26  | 
  27  | async function tickVisibleCheckboxes(page: Page) {
  28  |   const boxes = page.locator('input[type="checkbox"]');
  29  |   const n = await boxes.count();
  30  |   for (let i = 0; i < n; i++) {
  31  |     const box = boxes.nth(i);
  32  |     if (await box.isVisible().catch(() => false)) {
  33  |       await box.check({ force: true });
  34  |       await page.waitForTimeout(800);
  35  |     }
  36  |   }
  37  | }
  38  | 
  39  | // ---------------------------------------------------------------------------
  40  | test.describe('TC-00 — Contracting is opened for the full population', () => {
  41  |   let page: Page;
  42  |   test.beforeAll(async ({ browser }) => (page = await browser.newPage({ viewport: { width: 1600, height: 950 } })));
  43  |   test.afterAll(async () => page.close());
  44  | 
  45  |   test('TC-00 — admin verifies the population is fully in progress', async () => {
  46  |     // STEP 1-3: NAVIGATE, log in as admin, open the process (performed manually this run — see
  47  |     // the plan; this TC only re-verifies the resulting state so the spec stays idempotent).
  48  |     await P.login(page, ADMIN.user, ADMIN.pwd);
  49  |     const c = await P.contractingCounters(page);
  50  |     console.log('Contracting counters:', JSON.stringify(c));
  51  |     // STEP 4: ASSERT IN PROGRESS, 0 Not Started (BLOCKING)
> 52  |     expect(c.status, 'Contracting status').toBe('IN PROGRESS');
      |                                            ^ Error: Contracting status
  53  |     expect(c.notStarted, 'Not Started').toBe(0);
  54  |     expect(c.inProgress + c.completed).toBe(c.total);
  55  |   });
  56  | });
  57  | 
  58  | // ---------------------------------------------------------------------------
  59  | function positiveScenario(label: string, employeeLogin: string, employeeName: RegExp) {
  60  |   test.describe(`${label} — plain happy path`, () => {
  61  |     let page: Page;
  62  |     test.beforeAll(async ({ browser }) => (page = await browser.newPage({ viewport: { width: 1600, height: 950 } })));
  63  |     test.afterAll(async () => page.close());
  64  | 
  65  |     test(`${label} — draft, submit, sign, verify`, async () => {
  66  |       // STEP 1-2: NAVIGATE, log in as the employee, open the Initiate task
  67  |       await P.login(page, employeeLogin);
  68  |       const row = await P.waitForInboxRow(page, /Initiate Performance Agreement/i);
  69  |       await P.openTask(page, row);
  70  |       // STEP 3-4: TYPE the full agreement and Submit
  71  |       await P.completeDraftAndSubmit(page);
  72  |       await page.context().close();
  73  | 
  74  |       // STEP 5: supervisor Sign
  75  |       const supPage = await page.context().browser()!.newPage({ viewport: { width: 1600, height: 950 } });
  76  |       await P.login(supPage, SUPERVISOR);
  77  |       const supRow = await P.waitForInboxRow(supPage, employeeName);
  78  |       await P.openTask(supPage, supRow);
  79  |       await P.writeReviewComment(supPage, `Reviewed and agreed with the submitted KRAs and workplan.`);
  80  |       await P.signBtn(supPage).click();
  81  |       await supPage.waitForTimeout(15_000);
  82  |       await supPage.context().close();
  83  | 
  84  |       // STEP 6: HR Verify (BLOCKING)
  85  |       const hrPage = await page.context().browser()!.newPage({ viewport: { width: 1600, height: 950 } });
  86  |       await P.login(hrPage, HR);
  87  |       const hrRow = await P.waitForInboxRow(hrPage, employeeName);
  88  |       await P.openTask(hrPage, hrRow);
  89  |       await P.hrVerify(hrPage);
  90  |       await hrPage.context().close();
  91  |     });
  92  |   });
  93  | }
  94  | 
  95  | positiveScenario('TC-01 — Positive 1 (Simmy Mthalane)', 'Simmy', /Simmy/i);
  96  | positiveScenario('TC-02 — Positive 2 (Tony Dayimane)', 'TonyD', /Tony/i);
  97  | 
  98  | // ---------------------------------------------------------------------------
  99  | test.describe('TC-03 — Negative 1: Jabu Hadebe, resolved dispute', () => {
  100 |   test('TC-03 — refer, mediator resolves, employee updates, supervisor approves, HR verifies', async ({ browser }) => {
  101 |     let page = await browser.newPage({ viewport: { width: 1600, height: 950 } });
  102 |     await P.login(page, 'JabuH');
  103 |     const row = await P.waitForInboxRow(page, /Initiate Performance Agreement/i);
  104 |     await P.openTask(page, row);
  105 |     await P.completeDraftAndSubmit(page);
  106 |     await page.context().close();
  107 | 
  108 |     // STEP 2: supervisor refers for dispute (BLOCKING — task must leave the supervisor's inbox)
  109 |     page = await browser.newPage({ viewport: { width: 1600, height: 950 } });
  110 |     await P.login(page, SUPERVISOR);
  111 |     let taskRow = await P.waitForInboxRow(page, /Jabu/i);
  112 |     await P.openTask(page, taskRow);
  113 |     await P.referForDispute(page, 'Disagree with the weighting on KRA 2 — referring for mediation.');
  114 |     await page.context().close();
  115 | 
  116 |     // STEP 3: mediator resolves
  117 |     page = await browser.newPage({ viewport: { width: 1600, height: 950 } });
  118 |     await P.login(page, MEDIATOR);
  119 |     taskRow = await P.waitForInboxRow(page, /Jabu/i, 90_000);
  120 |     await P.openTask(page, taskRow);
  121 |     await P.mediatorResolve(page, 'Discussed with both parties; agreed the KRA 2 weighting stands as submitted.');
  122 |     await page.context().close();
  123 | 
  124 |     // STEP 4: employee updates with outcomes
  125 |     page = await browser.newPage({ viewport: { width: 1600, height: 950 } });
  126 |     await P.login(page, 'JabuH');
  127 |     taskRow = await P.waitForInboxRow(page, /Update.*Outcome/i, 90_000);
  128 |     await P.openTask(page, taskRow);
  129 |     await P.updateWithOutcomes(page);
  130 |     await page.context().close();
  131 | 
  132 |     // STEP 5: supervisor reviews updated agreement
  133 |     page = await browser.newPage({ viewport: { width: 1600, height: 950 } });
  134 |     await P.login(page, SUPERVISOR);
  135 |     taskRow = await P.waitForInboxRow(page, /Jabu/i, 90_000);
  136 |     await P.openTask(page, taskRow);
  137 |     await P.reviewUpdatedWithOutcomes(page);
  138 |     await page.context().close();
  139 | 
  140 |     // STEP 6: HR verifies (BLOCKING)
  141 |     page = await browser.newPage({ viewport: { width: 1600, height: 950 } });
  142 |     await P.login(page, HR);
  143 |     taskRow = await P.waitForInboxRow(page, /Jabu/i, 90_000);
  144 |     await P.openTask(page, taskRow);
  145 |     await P.hrVerify(page);
  146 |     await page.context().close();
  147 |   });
  148 | });
  149 | 
  150 | // ---------------------------------------------------------------------------
  151 | test.describe('TC-04 — Negative 2: Sanele Sithole, escalated dispute resolved at tier 2', () => {
  152 |   test('TC-04 — refer, mediator not-resolved, tier-2 resolves, updates, HR verifies', async ({ browser }) => {
```