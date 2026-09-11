# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: projects/Approvals/test-plans/Memo/verify-attachments-next-button-navigation.spec.ts >> TC-01 — Verify next button navigation (Attachments to Routing)
- Location: projects/Approvals/test-plans/Memo/verify-attachments-next-button-navigation.spec.ts:41:5

# Error details

```
TimeoutError: locator.click: Timeout 6000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: /create new/i })
    - locator resolved to <button type="button" class="ant-btn css-1lo1l9k css-var-R2kq ant-btn-link ant-dropdown-trigger">…</button>
  - attempting click action
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <a class="nav-links-renderer" href="/dynamic/Shesha.Workflow/workflows-inbox">Inbox</a> from <div>…</div> subtree intercepts pointer events
    - retrying click action
    - waiting 20ms
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <a class="nav-links-renderer" href="/dynamic/Shesha.Workflow/workflows-inbox">Inbox</a> from <div>…</div> subtree intercepts pointer events
    - retrying click action
      - waiting 100ms
    12 × waiting for element to be visible, enabled and stable
       - element is visible, enabled and stable
       - scrolling into view if needed
       - done scrolling
       - <a class="nav-links-renderer" href="/dynamic/Shesha.Workflow/workflows-inbox">Inbox</a> from <div>…</div> subtree intercepts pointer events
     - retrying click action
       - waiting 500ms

```

# Page snapshot

```yaml
- generic [active] [ref=f1e1]:
  - generic [ref=f1e4]:
    - complementary [ref=f1e5]:
      - menu [ref=f1e9]:
        - menuitem "profile Memos" [ref=f1e10] [cursor=pointer]:
          - img "profile" [ref=f1e11]
          - generic [ref=f1e14]: Memos
        - menuitem "apartment Workflows" [expanded] [ref=f1e15] [cursor=pointer]:
          - img "apartment" [ref=f1e16]
          - generic [ref=f1e19]: Workflows
        - menuitem "tool Administration" [ref=f1e20] [cursor=pointer]:
          - img "tool" [ref=f1e21]
          - generic [ref=f1e24]: Administration
        - menuitem "setting Configurations" [ref=f1e25] [cursor=pointer]:
          - img "setting" [ref=f1e26]
          - generic [ref=f1e29]: Configurations
      - img "menu-unfold" [ref=f1e32] [cursor=pointer]
    - generic [ref=f1e35]:
      - banner [ref=f1e36]:
        - generic [ref=f1e42]:
          - generic [ref=f1e44]:
            - button [ref=f1e45] [cursor=pointer]:
              - img "edit" [ref=f1e46]
            - paragraph [ref=f1e49] [cursor=pointer]: Shesha/header v8
            - generic [ref=f1e50]:
              - generic [ref=f1e51]: Draft
              - img "close" [ref=f1e52] [cursor=pointer]
          - generic [ref=f1e63]:
            - link [ref=f1e69] [cursor=pointer]:
              - /url: /
            - generic [ref=f1e81]:
              - generic [ref=f1e82]:
                - generic [ref=f1e84]:
                  - generic [ref=f1e85]: Live Mode
                  - switch "Switch to Edit mode" [ref=f1e87] [cursor=pointer]
                - generic "Click to change view mode" [ref=f1e91] [cursor=pointer]:
                  - img "block" [ref=f1e92]
                  - generic [ref=f1e95]: Latest
              - generic [ref=f1e97]:
                - generic [ref=f1e98] [cursor=pointer]:
                  - text: Ian Houvet
                  - img "down" [ref=f1e99]
                - img "user" [ref=f1e103]
      - main [ref=f1e106]:
        - generic [ref=f1e112]:
          - generic [ref=f1e114]:
            - button [ref=f1e115] [cursor=pointer]:
              - img "edit" [ref=f1e116]
            - paragraph [ref=f1e119] [cursor=pointer]: Shesha.Workflow/workflows-my-items v8
            - generic [ref=f1e120]:
              - generic [ref=f1e121]: Draft
              - img "close" [ref=f1e122] [cursor=pointer]
          - generic [ref=f1e135]:
            - generic [ref=f1e137]:
              - heading "My Items" [level=4] [ref=f1e143] [cursor=pointer]
              - generic [ref=f1e145]:
                - generic [ref=f1e148]:
                  - textbox [ref=f1e150]
                  - button [ref=f1e153] [cursor=pointer]:
                    - img "search" [ref=f1e155]
                - button [ref=f1e163] [cursor=pointer]:
                  - img "filter" [ref=f1e165]
                - button [ref=f1e173] [cursor=pointer]:
                  - img "sliders" [ref=f1e175]
                - list [ref=f1e178]:
                  - listitem [ref=f1e179]: 1-10 of 205 items
                  - listitem "Previous Page" [ref=f1e180]:
                    - button [disabled] [ref=f1e181]:
                      - img "left" [ref=f1e182]
                  - listitem "1" [ref=f1e185] [cursor=pointer]
                  - listitem "2" [ref=f1e187] [cursor=pointer]
                  - listitem "3" [ref=f1e189] [cursor=pointer]
                  - listitem "Next 3 Pages" [ref=f1e191] [cursor=pointer]:
                    - generic [ref=f1e193]:
                      - img "double-right" [ref=f1e194]
                      - generic [ref=f1e197]: •••
                  - listitem "21" [ref=f1e198] [cursor=pointer]
                  - listitem "Next Page" [ref=f1e200] [cursor=pointer]:
                    - button [ref=f1e201]:
                      - img "right" [ref=f1e202]
                  - listitem [ref=f1e205]:
                    - generic "Page Size" [ref=f1e206] [cursor=pointer]:
                      - generic [ref=f1e207]:
                        - combobox "Page Size" [ref=f1e209]
                        - generic "10 / page" [ref=f1e210]
                - button [ref=f1e216] [cursor=pointer]:
                  - img "reload" [ref=f1e218]
            - generic [ref=f1e226]:
              - button "plus Create New down" [ref=f1e228] [cursor=pointer]:
                - img "plus" [ref=f1e230]
                - generic [ref=f1e234]: Create New
                - img "down" [ref=f1e235]
              - button "download Export" [ref=f1e239] [cursor=pointer]:
                - img "download" [ref=f1e241]
                - generic [ref=f1e244]: Export
            - table [ref=f1e254]:
              - row [ref=f1e255]:
                - columnheader [ref=f1e256]
                - columnheader "Ref No" [ref=f1e257] [cursor=pointer]:
                  - text: Ref No
                  - separator [ref=f1e258]
                - columnheader "Type" [ref=f1e259] [cursor=pointer]:
                  - text: Type
                  - separator [ref=f1e260]
                - columnheader "Name" [ref=f1e261] [cursor=pointer]:
                  - text: Name
                  - separator [ref=f1e262]
                - columnheader "Initiated Date" [ref=f1e263] [cursor=pointer]:
                  - text: Initiated Date
                  - separator [ref=f1e264]
                - columnheader "Priority" [ref=f1e265] [cursor=pointer]:
                  - text: Priority
                  - separator [ref=f1e266]
                - columnheader "Status" [ref=f1e267] [cursor=pointer]:
                  - text: Status
                  - separator [ref=f1e268]
                - columnheader "Progress" [ref=f1e269]:
                  - text: Progress
                  - separator [ref=f1e270]
              - rowgroup [ref=f1e271]:
                - row [ref=f1e272]:
                  - cell [ref=f1e273]:
                    - link [ref=f1e274] [cursor=pointer]:
                      - /url: /shesha/workflow?id=74e95ceb-e3be-49d6-ac9e-d32cc4a658ab
                      - img "search" [ref=f1e275]
                  - cell "REF2026/08873" [ref=f1e278]
                  - cell "New Referrals" [ref=f1e279]
                  - cell "Test" [ref=f1e280]
                  - cell "11/05/2026 09:17" [ref=f1e281]
                  - cell "Urgent" [ref=f1e282]
                  - cell "In Progress" [ref=f1e289]
                  - cell [ref=f1e290]
                - row [ref=f1e313]:
                  - cell [ref=f1e314]:
                    - link [ref=f1e315] [cursor=pointer]:
                      - /url: /shesha/workflow?id=9eaf6785-de95-42da-b502-edb2f4dac4cc
                      - img "search" [ref=f1e316]
                  - cell "REF2026/08915" [ref=f1e319]
                  - cell "New Referrals" [ref=f1e320]
                  - cell "Test" [ref=f1e321]
                  - cell "12/05/2026 14:27" [ref=f1e322]
                  - cell "High" [ref=f1e323]
                  - cell "In Progress" [ref=f1e330]
                  - cell [ref=f1e331]
                - row [ref=f1e354]:
                  - cell [ref=f1e355]:
                    - link [ref=f1e356] [cursor=pointer]:
                      - /url: /shesha/workflow?id=f8edf2e5-bfff-4b5e-85cc-0f04c5293f52
                      - img "search" [ref=f1e357]
                  - cell "REF2026/08959" [ref=f1e360]
                  - cell "New Referrals" [ref=f1e361]
                  - cell "Test" [ref=f1e362]
                  - cell "13/05/2026 15:05" [ref=f1e363]
                  - cell "High" [ref=f1e364]
                  - cell "In Progress" [ref=f1e371]
                  - cell [ref=f1e372]
                - row [ref=f1e386]:
                  - cell [ref=f1e387]:
                    - link [ref=f1e388] [cursor=pointer]:
                      - /url: /shesha/workflow?id=16e1c1ea-b44f-4407-b674-3894754a27bb
                      - img "search" [ref=f1e389]
                  - cell "REF2026/08889" [ref=f1e392]
                  - cell "New Referrals" [ref=f1e393]
                  - cell "Test" [ref=f1e394]
                  - cell "11/05/2026 09:24" [ref=f1e395]
                  - cell "High" [ref=f1e396]
                  - cell "In Progress" [ref=f1e403]
                  - cell [ref=f1e404]
                - row [ref=f1e427]:
                  - cell [ref=f1e428]:
                    - link [ref=f1e429] [cursor=pointer]:
                      - /url: /shesha/workflow?id=b64dedc9-a43f-4552-ae3f-92022335de7d
                      - img "search" [ref=f1e430]
                  - cell "REF2026/08853" [ref=f1e433]
                  - cell "New Referrals" [ref=f1e434]
                  - cell "Test" [ref=f1e435]
                  - cell "11/05/2026 08:59" [ref=f1e436]
                  - cell "High" [ref=f1e437]
                  - cell "In Progress" [ref=f1e444]
                  - cell [ref=f1e445]
                - row [ref=f1e468]:
                  - cell [ref=f1e469]:
                    - link [ref=f1e470] [cursor=pointer]:
                      - /url: /shesha/workflow?id=b9bd7d5d-d328-4976-ad0e-a58dca2822b4
                      - img "search" [ref=f1e471]
                  - cell "REF2026/08963" [ref=f1e474]
                  - cell "New Referrals" [ref=f1e475]
                  - cell "Test" [ref=f1e476]
                  - cell "13/05/2026 15:34" [ref=f1e477]
                  - cell "High" [ref=f1e478]
                  - cell "Completed" [ref=f1e485]
                  - cell [ref=f1e486]
                - row [ref=f1e500]:
                  - cell [ref=f1e501]:
                    - link [ref=f1e502] [cursor=pointer]:
                      - /url: /shesha/workflow?id=7c012834-ae73-4414-818c-a68ab5cac18d
                      - img "search" [ref=f1e503]
                  - cell "REF2026/08998" [ref=f1e506]
                  - cell "New Referrals" [ref=f1e507]
                  - cell "dd" [ref=f1e508]
                  - cell "19/05/2026 09:50" [ref=f1e509]
                  - cell "Medium" [ref=f1e510]
                  - cell "In Progress" [ref=f1e517]
                  - cell [ref=f1e518]
                - row [ref=f1e529]:
                  - cell [ref=f1e530]:
                    - link [ref=f1e531] [cursor=pointer]:
                      - /url: /shesha/workflow?id=5f34fbde-e684-45b8-884e-a04e77a5ffdf
                      - img "search" [ref=f1e532]
                  - cell "REF2026/08989" [ref=f1e535]
                  - cell "New Referrals" [ref=f1e536]
                  - cell "rr" [ref=f1e537]
                  - cell "19/05/2026 08:25" [ref=f1e538]
                  - cell "Medium" [ref=f1e539]
                  - cell "In Progress" [ref=f1e546]
                  - cell [ref=f1e547]
                - row [ref=f1e558]:
                  - cell [ref=f1e559]:
                    - link [ref=f1e560] [cursor=pointer]:
                      - /url: /shesha/workflow?id=2ff2e812-4971-46f6-b6ba-a9211d1af0f8
                      - img "search" [ref=f1e561]
                  - cell "REF2026/08895" [ref=f1e564]
                  - cell "New Referrals" [ref=f1e565]
                  - cell "Test" [ref=f1e566]
                  - cell "11/05/2026 09:29" [ref=f1e567]
                  - cell "Medium" [ref=f1e568]
                  - cell "In Progress" [ref=f1e575]
                  - cell [ref=f1e576]
                - row [ref=f1e599]:
                  - cell [ref=f1e600]:
                    - link [ref=f1e601] [cursor=pointer]:
                      - /url: /shesha/workflow?id=b50e8334-4cc8-44e5-a102-aa4244b8937e
                      - img "search" [ref=f1e602]
                  - cell "REF2026/08951" [ref=f1e605]
                  - cell "New Referrals" [ref=f1e606]
                  - cell "Test" [ref=f1e607]
                  - cell "13/05/2026 14:54" [ref=f1e608]
                  - cell "Medium" [ref=f1e609]
                  - cell "In Progress" [ref=f1e616]
                  - cell [ref=f1e617]
  - alert [ref=f1e634]
  - menu [ref=f1e636]:
    - menuitem [ref=f1e637] [cursor=pointer]:
      - link "Inbox" [ref=f1e639]:
        - /url: /dynamic/Shesha.Workflow/workflows-inbox
    - menuitem [ref=f1e640] [cursor=pointer]:
      - link "My Items" [ref=f1e642]:
        - /url: /dynamic/Shesha.Workflow/workflows-my-items
    - menuitem [ref=f1e643] [cursor=pointer]:
      - link "Sent Items" [ref=f1e645]:
        - /url: /dynamic/Shesha.Workflow/workflows-sent
    - menuitem [ref=f1e646] [cursor=pointer]:
      - link "Drafts" [ref=f1e648]:
        - /url: /dynamic/Shesha.Workflow/workflows-drafts
```

# Test source

```ts
  1   | // AUTO-RECORDED from test-plans/Memo/verify-attachments-next-button-navigation.md
  2   | // Source: Azure DevOps test plan #100853, suite #100854, test case #102661
  3   | // The .md plan is canonical. AI-repair will patch failing lines in this file.
  4   | // Do not hand-edit unless you are also updating the .md plan.
  5   | 
  6   | import { test, expect, Page, Locator } from '@playwright/test';
  7   | 
  8   | const APP_URL = 'https://pd-approvals-adminportal-qa.azurewebsites.net';
  9   | const CREDS = { username: 'Ian', password: '123qwe' };
  10  | 
  11  | // This QA environment can sit on an "Initializing..." splash for well over the default 15s action
  12  | // timeout before the login form mounts. Give the username field a generous timeout rather than
  13  | // failing fast, since the app itself (verified via curl) is otherwise up.
  14  | async function login(page: Page) {
  15  |   await page.goto(`${APP_URL}/login`, { waitUntil: 'domcontentloaded', timeout: 60_000 });
  16  |   await page.getByPlaceholder(/username/i).fill(CREDS.username, { timeout: 60_000 });
  17  |   await page.getByPlaceholder(/password/i).fill(CREDS.password);
  18  |   await page.getByRole('button', { name: /log ?in|sign in/i }).click();
  19  |   await page.waitForURL(url => !url.toString().includes('/login'), { timeout: 30_000 });
  20  |   await page.waitForLoadState('networkidle');
  21  | }
  22  | 
  23  | // The Workflows sidebar item opens a hover-triggered flyout (Inbox/My Items/Sent Items/Drafts) that is
  24  | // appended to the end of <body> and intermittently stays mounted over the page, intercepting clicks on
  25  | // whatever is underneath. Click actions that land near it are wrapped in a retry that nudges the mouse
  26  | // away and tries again.
  27  | async function clickWithFlyoutRetry(page: Page, locator: Locator, attempts = 4) {
  28  |   for (let i = 0; i < attempts; i++) {
  29  |     try {
> 30  |       await locator.click({ timeout: 6_000 });
      |                     ^ TimeoutError: locator.click: Timeout 6000ms exceeded.
  31  |       return;
  32  |     } catch (err) {
  33  |       if (i === attempts - 1) throw err;
  34  |       await page.mouse.move(950, 450);
  35  |       await page.mouse.move(960, 470);
  36  |       await page.waitForTimeout(600);
  37  |     }
  38  |   }
  39  | }
  40  | 
  41  | test('TC-01 — Verify next button navigation (Attachments to Routing)', async ({ page }) => {
  42  |   test.setTimeout(240_000);
  43  | 
  44  |   // STEP 1: NAVIGATE to login page and log in with valid credentials
  45  |   await login(page);
  46  |   await expect(page).not.toHaveURL(/login/);
  47  | 
  48  |   // STEP 2: CLICK the "Click to change view mode" control to open the Live/Ready/Latest popover,
  49  |   // then CLICK the "Latest" option in that popover.
  50  |   const viewModeControl = page.locator('[title="Click to change view mode"]');
  51  |   await viewModeControl.click();
  52  |   await page.getByText('Latest', { exact: true }).click();
  53  |   await expect(viewModeControl).toContainText(/latest/i, { timeout: 10_000 });
  54  | 
  55  |   // STEP 3: CLICK the sidebar Toggle in the top-left corner
  56  |   const toggle = page.locator('.ant-layout-sider-trigger, [class*="trigger"], [aria-label*="toggle" i], [aria-label*="menu" i]').first();
  57  |   await toggle.click();
  58  | 
  59  |   // STEP 4: CLICK the Workflows dropdown
  60  |   await page.getByText(/^Workflows?$/i).first().click();
  61  |   await expect(page.getByText(/^Inbox$/i).first()).toBeVisible({ timeout: 10_000 });
  62  | 
  63  |   // STEP 5: CLICK the My Items menu item
  64  |   await page.goto(`${APP_URL}/dynamic/Shesha.Workflow/workflows-my-items`, { waitUntil: 'domcontentloaded', timeout: 30_000 });
  65  |   await page.waitForLoadState('networkidle');
  66  |   await expect(page.getByRole('button', { name: /create new/i })).toBeVisible({ timeout: 15_000 });
  67  | 
  68  |   // STEP 6: CLICK the Create New button
  69  |   await clickWithFlyoutRetry(page, page.getByRole('button', { name: /create new/i }));
  70  | 
  71  |   // STEP 7: CLICK the New Referrals subtype
  72  |   await expect(page.getByRole('menuitem', { name: /new referrals?/i })).toBeVisible({ timeout: 10_000 });
  73  |   await clickWithFlyoutRetry(page, page.getByRole('menuitem', { name: /new referrals?/i }));
  74  | 
  75  |   // STEP 8: CLICK the CC field and SELECT a signatory
  76  |   await expect(page.getByText(/subject/i).first()).toBeVisible({ timeout: 15_000 });
  77  |   const ccField = page.getByRole('combobox').nth(1);
  78  |   await ccField.click();
  79  |   const dropdownPanel = page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden)');
  80  |   await expect(dropdownPanel).toBeVisible({ timeout: 10_000 });
  81  |   await expect(page.getByRole('option').first()).toHaveCount(1);
  82  |   await page.keyboard.press('ArrowDown');
  83  |   await page.keyboard.press('Enter');
  84  |   const ccContainer = ccField.locator('xpath=../..');
  85  |   const signatoryName = (await ccContainer.textContent())?.trim();
  86  |   expect(signatoryName && signatoryName.length > 0).toBeTruthy();
  87  | 
  88  |   // STEP 9: CLICK the Subject text field and populate it with test input
  89  |   await page.getByRole('textbox').nth(1).fill('Test Subject');
  90  | 
  91  |   // STEP 10: CLICK each of the Purpose, Background, Discussion, Financial Implications, Risks and
  92  |   // Recommendation tabs individually, populating and verifying each one before moving to the next.
  93  |   const tabNames = ['Purpose', 'Background', 'Discussion', 'Financial Implications', 'Risks', 'Recommendation'];
  94  |   for (const name of tabNames) {
  95  |     const tab = page.getByRole('tab', { name: new RegExp(name, 'i') });
  96  |     for (let attempt = 0; attempt < 3; attempt++) {
  97  |       await tab.click();
  98  |       try {
  99  |         await expect(tab).toHaveAttribute('aria-selected', 'true', { timeout: 4_000 });
  100 |         break;
  101 |       } catch (err) {
  102 |         if (attempt === 2) throw err;
  103 |         await page.waitForTimeout(500);
  104 |       }
  105 |     }
  106 |     const editor = page.locator('[contenteditable="true"]:visible').first();
  107 |     await editor.click();
  108 |     const text = `Test ${name} input`;
  109 |     await page.keyboard.type(text);
  110 |     await expect(editor).toContainText(text, { timeout: 10_000 });
  111 |   }
  112 | 
  113 |   // STEP 11: CLICK the Next button (Compose -> Attachments)
  114 |   await page.getByRole('button', { name: /next/i }).click();
  115 |   await expect(page.getByRole('button', { name: /back/i })).toBeVisible({ timeout: 15_000 });
  116 |   await expect(page.getByRole('tab', { name: /purpose/i })).toHaveCount(0);
  117 | 
  118 |   // STEP 12: CLICK the Next button again (Attachments -> Routing)
  119 |   await page.getByRole('button', { name: /next/i }).click();
  120 | 
  121 |   // ASSERT (BLOCKING) Clicking Next again navigates the wizard from Attachments to the Routing step.
  122 |   // The Routing step replaces the Next button entirely with "Submit" (disabled until an approver is
  123 |   // added) and introduces a "Select approver" control with a "No Approvers" table — none of which exist
  124 |   // on Compose or Attachments — so these are genuine, unambiguous signals of the transition.
  125 |   await expect(page.getByRole('button', { name: /^next$/i })).toHaveCount(0, { timeout: 15_000 });
  126 |   await expect(page.getByRole('button', { name: /submit/i })).toBeVisible();
  127 |   await expect(page.getByText(/select approver/i).first()).toBeVisible();
  128 |   await expect(page.getByText(/no approvers/i).first()).toBeVisible();
  129 | });
  130 | 
```