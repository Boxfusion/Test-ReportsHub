# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: projects/PD-PMDS/test-plans/contracting/contracting-lifecycle.spec.ts >> Contracting — admin process state >> TC-01 — Contracting stage is open with the full employee population in progress
- Location: projects/PD-PMDS/test-plans/contracting/contracting-lifecycle.spec.ts:39:7

# Error details

```
Error: Contracting stage status

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
  2   |  * Derived from contracting-lifecycle.md — the .md plan is canonical.
  3   |  * Selectors captured live on 2026-08-02 against
  4   |  * SaGov.Pmds/sagov-performanceagreement-wf-draftperformanceagreement v52.
  5   |  */
  6   | import { test, expect, Page } from '@playwright/test';
  7   | import * as path from 'path';
  8   | import * as P from './pmds';
  9   | 
  10  | /** Evidence attached on the unresolved-mediation branch (Attachments is mandatory there). */
  11  | const MEDIATION_FILE = path.resolve(__dirname, '../../../../test-data/mediation-outcome.txt');
  12  | 
  13  | // Serial: this is one Contracting chain — a failed step invalidates everything after it.
  14  | // The draft wizard is genuinely slow (8 key-activity modals per agreement), so the 90s default
  15  | // timeout in the hub's playwright.config is raised here rather than globally.
  16  | test.describe.configure({ mode: 'serial', timeout: 900_000 });
  17  | 
  18  | const ADMIN = { user: 'admin', pwd: 'P@ssw0rd' };
  19  | const SANELE = 'SaneleS';
  20  | const SIMMY = 'Simmy';
  21  | const JABU = 'JabuH';
  22  | const ADAM = 'adam';
  23  | const SUPERVISOR = 'LungileN';
  24  | const MEDIATOR = 'BabalwaM';
  25  | const HR = 'SalesHR';
  26  | 
  27  | /** Pick the supervisor/HR inbox row for a named employee — these inboxes hold several PAs. */
  28  | const rowFor = (rows: P.InboxRow[], action: RegExp, employee: RegExp) =>
  29  |   rows.find((r) => action.test(r.text) && employee.test(r.text));
  30  | 
  31  | // ---------------------------------------------------------------------------
  32  | test.describe('Contracting — admin process state', () => {
  33  |   let page: Page;
  34  |   test.beforeAll(async ({ browser }) => {
  35  |     page = await browser.newPage({ viewport: { width: 1600, height: 950 } });
  36  |   });
  37  |   test.afterAll(async () => page.close());
  38  | 
  39  |   test('TC-01 — Contracting stage is open with the full employee population in progress', async () => {
  40  |     // STEP 1: NAVIGATE to the portal and log in as admin
  41  |     await P.login(page, ADMIN.user, ADMIN.pwd);
  42  |     // STEP 2: NAVIGATE to SL 1-12 Performance Agreement FY2026/27 cycle details
  43  |     const c = await P.contractingCounters(page);
  44  |     console.log('Contracting counters:', JSON.stringify(c));
  45  |     // STEP 3: ASSERT Contracting is IN PROGRESS (BLOCKING)
> 46  |     expect(c.status, 'Contracting stage status').toBe('IN PROGRESS');
      |                                                  ^ Error: Contracting stage status
  47  |     // STEP 4: ASSERT nobody is left Not Started
  48  |     expect(c.notStarted, 'Not Started count').toBe(0);
  49  |     // STEP 5: ASSERT the whole population is in progress
  50  |     expect(c.inProgress, 'In Progress count').toBeGreaterThan(0);
  51  |     expect(c.inProgress + c.completed).toBe(c.total);
  52  |   });
  53  | });
  54  | 
  55  | // ---------------------------------------------------------------------------
  56  | test.describe('Contracting — draft wizard validation and submit (Sanele Sithole)', () => {
  57  |   let page: Page;
  58  | 
  59  |   test.beforeAll(async ({ browser }) => {
  60  |     page = await browser.newPage({ viewport: { width: 1600, height: 950 } });
  61  |     await P.login(page, SANELE);
  62  |     const row = await P.waitForInboxRow(page, /Initiate Performance Agreement/i);
  63  |     await P.openTask(page, row);
  64  |     await P.installToastSpy(page);
  65  |   });
  66  |   test.afterAll(async () => page.close());
  67  | 
  68  |   test('TC-02 — Confirm Details defaults the supervisor and mediator from the reporting line', async () => {
  69  |     // STEP 1: ASSERT the wizard opens on Confirm Details (BLOCKING)
  70  |     await P.expectStep(page, /Confirm Details/i);
  71  |     // STEP 2: ASSERT the default supervisor is the employee's line manager
  72  |     const supervisor = await P.detailValue(page, 'Default Supervisor');
  73  |     console.log('Default Supervisor =', supervisor);
  74  |     expect(supervisor).toBe('Lungile Nhleko');
  75  |     // STEP 3: ASSERT the mediator defaults to the supervisor's supervisor
  76  |     const mediator = await P.detailValue(page, 'Default Mediator');
  77  |     console.log('Default Mediator =', mediator);
  78  |     expect(mediator).toBe('Babalwa M');
  79  |     // STEP 4: CLICK Next to advance to Scoring
  80  |     await P.gotoStep(page, /Scoring/i);
  81  |     await P.expectStep(page, /Scoring/i);
  82  |   });
  83  | 
  84  |   test('TC-03 — NEGATIVE: Next stays disabled while the KRA weights total less than 100%', async () => {
  85  |     // STEP 1: ASSERT Next is disabled with an empty KRA table (BLOCKING)
  86  |     expect(await P.nextBtn(page).isEnabled(), 'Next with no KRAs').toBe(false);
  87  |     // STEP 2: TYPE three KRAs at 25% each (75% total)
  88  |     await P.ensureKras(page, P.KRAS.slice(0, 3));
  89  |     const total = await P.kraWeightTotal(page);
  90  |     console.log('KRA weight total after 3 KRAs =', total);
  91  |     // STEP 3: ASSERT the running total is 75%
  92  |     expect(total).toBe(75);
  93  |     // STEP 4: ASSERT Next is still disabled — the form must not allow an under-weighted PA
  94  |     expect(await P.nextBtn(page).isEnabled(), 'Next at 75%').toBe(false);
  95  |   });
  96  | 
  97  |   test('TC-04 — NEGATIVE: Next stays disabled at 100% until the minimum 4 GAFs are checked', async () => {
  98  |     // STEP 1: TYPE the fourth KRA to reach 100%
  99  |     await P.ensureKras(page, P.KRAS);
  100 |     expect(await P.kraWeightTotal(page), 'KRA weight total').toBe(100);
  101 |     // STEP 2: ASSERT fewer than 4 GAFs are checked
  102 |     const checked = await P.gafCheckedCount(page);
  103 |     console.log('GAFs checked =', checked);
  104 |     // STEP 3: ASSERT Next is disabled while the GAF minimum is unmet (BLOCKING)
  105 |     if (checked < 4) {
  106 |       expect(await P.nextBtn(page).isEnabled(), 'Next at 100% with <4 GAFs').toBe(false);
  107 |     } else {
  108 |       test.info().annotations.push({ type: 'note', description: `Draft already had ${checked} GAFs checked` });
  109 |     }
  110 |   });
  111 | 
  112 |   test('TC-05 — Scoring completes once 4 KRAs total 100% and 4 GAFs are checked', async () => {
  113 |     // STEP 1: CLICK 4 Generic Assessment Factors
  114 |     const ticked = await P.tickGafs(page, 4);
  115 |     console.log('GAFs ticked this run:', JSON.stringify(ticked));
  116 |     // STEP 2: ASSERT 4 GAFs are checked
  117 |     expect(await P.gafCheckedCount(page), 'GAFs checked').toBeGreaterThanOrEqual(4);
  118 |     // STEP 3: ASSERT Next is now enabled (BLOCKING)
  119 |     expect(await P.nextBtn(page).isEnabled(), 'Next after valid scoring').toBe(true);
  120 |     // STEP 4: CLICK Next to advance to Workplan Agreement
  121 |     await P.gotoStep(page, /Workplan/i);
  122 |     await P.expectStep(page, /Workplan/i);
  123 |   });
  124 | 
  125 |   test('TC-06 — NEGATIVE: the workplan cannot be left with fewer than 2 key activities per KRA', async () => {
  126 |     // STEP 1: ASSERT the workplan renders one section per KRA
  127 |     const sections = await P.workplanKraCount(page);
  128 |     console.log('Workplan KRA sections =', sections);
  129 |     expect(sections).toBe(4);
  130 |     // STEP 2: TYPE a single key activity against the first KRA
  131 |     if ((await P.workplanRows(page, 0)).length < 1) {
  132 |       await P.addKeyActivity(page, 0, P.keyActivity(0, 1));
  133 |     }
  134 |     expect((await P.workplanRows(page, 0)).length, 'KRA 1 activities').toBe(1);
  135 |     // STEP 3: CLICK Next
  136 |     await P.drainToasts(page);
  137 |     await P.nextBtn(page).click();
  138 |     await page.waitForTimeout(4000);
  139 |     // STEP 4: ASSERT the wizard refuses to advance (BLOCKING)
  140 |     const step = await P.activeStep(page);
  141 |     const toasts = await P.drainToasts(page);
  142 |     const errors = await P.formErrors(page);
  143 |     console.log('after Next with 1 activity -> step:', step, '| toasts:', JSON.stringify(toasts), '| errors:', JSON.stringify(errors));
  144 |     expect(step, 'wizard must stay on Workplan Agreement').toMatch(/Workplan/i);
  145 |     // STEP 5: ASSERT the refusal is explained to the user
  146 |     // (recorded rather than asserted hard — see the plan's "known issues" note)
```