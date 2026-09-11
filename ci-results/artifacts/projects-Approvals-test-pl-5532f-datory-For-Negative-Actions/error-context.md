# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: projects/Approvals/test-plans/Memo/verify-comments-mandatory-for-negative-actions.spec.ts >> TC-01 — Verify Comments Field Is Mandatory For Negative Actions
- Location: projects/Approvals/test-plans/Memo/verify-comments-mandatory-for-negative-actions.spec.ts:62:5

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
    11 × waiting for element to be visible, enabled and stable
       - element is visible, enabled and stable
       - scrolling into view if needed
       - done scrolling
       - <a class="nav-links-renderer" href="/dynamic/Shesha.Workflow/workflows-inbox">Inbox</a> from <div>…</div> subtree intercepts pointer events
     - retrying click action
       - waiting 500ms
    - waiting for element to be visible, enabled and stable
    - element is visible, enabled and stable
    - scrolling into view if needed
    - done scrolling

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
            - paragraph [ref=f1e49] [cursor=pointer]: Shesha/header v7
            - generic [ref=f1e50]:
              - generic [ref=f1e51]: Live
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
                  - generic [ref=f1e95]: Live
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
            - paragraph [ref=f1e119] [cursor=pointer]: Shesha.Workflow/workflows-my-items v7
            - generic [ref=f1e120]:
              - generic [ref=f1e121]: Live
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
                - columnheader "Status" [ref=f1e265] [cursor=pointer]:
                  - text: Status
                  - separator [ref=f1e266]
                - columnheader "Progress" [ref=f1e267]:
                  - text: Progress
                  - separator [ref=f1e268]
              - rowgroup [ref=f1e269]:
                - row [ref=f1e270]:
                  - cell [ref=f1e271]:
                    - link [ref=f1e272] [cursor=pointer]:
                      - /url: /shesha/workflow?id=a648fe51-f6ed-4662-a60a-8a0218dc162c
                      - img "search" [ref=f1e273]
                  - cell "REF2026/09772" [ref=f1e276]
                  - cell "New Referrals" [ref=f1e277]
                  - cell "Test Subject" [ref=f1e278]
                  - cell "15/07/2026 16:50" [ref=f1e279]
                  - cell "In Progress" [ref=f1e280]
                  - cell [ref=f1e281]
                - row [ref=f1e292]:
                  - cell [ref=f1e293]:
                    - link [ref=f1e294] [cursor=pointer]:
                      - /url: /shesha/workflow?id=2ec5df03-d676-4444-a9b2-4782d588d6e3
                      - img "search" [ref=f1e295]
                  - cell "REF2026/09768" [ref=f1e298]
                  - cell "New Referrals" [ref=f1e299]
                  - cell "Test Subject" [ref=f1e300]
                  - cell "15/07/2026 16:47" [ref=f1e301]
                  - cell "In Progress" [ref=f1e302]
                  - cell [ref=f1e303]
                - row [ref=f1e314]:
                  - cell [ref=f1e315]:
                    - link [ref=f1e316] [cursor=pointer]:
                      - /url: /shesha/workflow?id=8e9d2664-7e2e-48d5-8a3c-fddd0b808438
                      - img "search" [ref=f1e317]
                  - cell "REF2026/09747" [ref=f1e320]
                  - cell "New Referrals" [ref=f1e321]
                  - cell "Test Subject" [ref=f1e322]
                  - cell "15/07/2026 15:48" [ref=f1e323]
                  - cell "In Progress" [ref=f1e324]
                  - cell [ref=f1e325]
                - row [ref=f1e336]:
                  - cell [ref=f1e337]:
                    - link [ref=f1e338] [cursor=pointer]:
                      - /url: /shesha/workflow?id=a481479e-d22a-471b-8ef6-64420d94c8e3
                      - img "search" [ref=f1e339]
                  - cell "REF2026/09743" [ref=f1e342]
                  - cell "New Referrals" [ref=f1e343]
                  - cell "Test Subject" [ref=f1e344]
                  - cell "15/07/2026 15:22" [ref=f1e345]
                  - cell "In Progress" [ref=f1e346]
                  - cell [ref=f1e347]
                - row [ref=f1e358]:
                  - cell [ref=f1e359]:
                    - link [ref=f1e360] [cursor=pointer]:
                      - /url: /shesha/workflow?id=ae045e44-29cb-4315-b89c-af525dd09587
                      - img "search" [ref=f1e361]
                  - cell "REF2026/09739" [ref=f1e364]
                  - cell "New Referrals" [ref=f1e365]
                  - cell "Test Subject" [ref=f1e366]
                  - cell "15/07/2026 15:17" [ref=f1e367]
                  - cell "In Progress" [ref=f1e368]
                  - cell [ref=f1e369]
                - row [ref=f1e380]:
                  - cell [ref=f1e381]:
                    - link [ref=f1e382] [cursor=pointer]:
                      - /url: /shesha/workflow?id=efd68574-68fc-4822-ad5a-26c55cd56a09
                      - img "search" [ref=f1e383]
                  - cell "REF2026/09735" [ref=f1e386]
                  - cell "New Referrals" [ref=f1e387]
                  - cell "Test Subject" [ref=f1e388]
                  - cell "15/07/2026 15:10" [ref=f1e389]
                  - cell "In Progress" [ref=f1e390]
                  - cell [ref=f1e391]
                - row [ref=f1e402]:
                  - cell [ref=f1e403]:
                    - link [ref=f1e404] [cursor=pointer]:
                      - /url: /shesha/workflow?id=c4d762be-cba9-44dd-8fac-c84a9c26b9cc
                      - img "search" [ref=f1e405]
                  - cell "REF2026/09731" [ref=f1e408]
                  - cell "New Referrals" [ref=f1e409]
                  - cell "Test Subject" [ref=f1e410]
                  - cell "15/07/2026 15:07" [ref=f1e411]
                  - cell "In Progress" [ref=f1e412]
                  - cell [ref=f1e413]
                - row [ref=f1e424]:
                  - cell [ref=f1e425]:
                    - link [ref=f1e426] [cursor=pointer]:
                      - /url: /shesha/workflow?id=8f1280f8-f2f5-426c-ae6e-88dd13d04ce5
                      - img "search" [ref=f1e427]
                  - cell "REF2026/09727" [ref=f1e430]
                  - cell "New Referrals" [ref=f1e431]
                  - cell "Test Subject" [ref=f1e432]
                  - cell "15/07/2026 15:04" [ref=f1e433]
                  - cell "In Progress" [ref=f1e434]
                  - cell [ref=f1e435]
                - row [ref=f1e446]:
                  - cell [ref=f1e447]:
                    - link [ref=f1e448] [cursor=pointer]:
                      - /url: /shesha/workflow?id=e082c739-8ab3-4202-a62c-e45aa43e895f
                      - img "search" [ref=f1e449]
                  - cell "REF2026/09722" [ref=f1e452]
                  - cell "New Referrals" [ref=f1e453]
                  - cell "Test Subject" [ref=f1e454]
                  - cell "15/07/2026 14:59" [ref=f1e455]
                  - cell "In Progress" [ref=f1e456]
                  - cell [ref=f1e457]
                - row [ref=f1e468]:
                  - cell [ref=f1e469]:
                    - link [ref=f1e470] [cursor=pointer]:
                      - /url: /shesha/workflow?id=98c12ca5-a4b7-459a-8260-22769e6afec1
                      - img "search" [ref=f1e471]
                  - cell "REF2026/09718" [ref=f1e474]
                  - cell "New Referrals" [ref=f1e475]
                  - cell "Test Subject" [ref=f1e476]
                  - cell "15/07/2026 14:55" [ref=f1e477]
                  - cell "In Progress" [ref=f1e478]
                  - cell [ref=f1e479]
  - alert [ref=f1e490]
  - menu [ref=f1e492]:
    - menuitem [ref=f1e493] [cursor=pointer]:
      - link "Inbox" [ref=f1e495]:
        - /url: /dynamic/Shesha.Workflow/workflows-inbox
    - menuitem [ref=f1e496] [cursor=pointer]:
      - link "My Items" [ref=f1e498]:
        - /url: /dynamic/Shesha.Workflow/workflows-my-items
    - menuitem [ref=f1e499] [cursor=pointer]:
      - link "Sent Items" [ref=f1e501]:
        - /url: /dynamic/Shesha.Workflow/workflows-sent
    - menuitem [ref=f1e502] [cursor=pointer]:
      - link "Drafts" [ref=f1e504]:
        - /url: /dynamic/Shesha.Workflow/workflows-drafts
```

# Test source

```ts
  1   | // AUTO-RECORDED from test-plans/Memo/verify-comments-mandatory-for-negative-actions.md
  2   | // Source: Azure DevOps test plan #100853, suite #100854, test case #105893
  3   | // The .md plan is canonical. AI-repair will patch failing lines in this file.
  4   | // Do not hand-edit unless you are also updating the .md plan.
  5   | 
  6   | import { test, expect, Page, Locator } from '@playwright/test';
  7   | 
  8   | const APP_URL = 'https://pd-approvals-adminportal-qa.azurewebsites.net';
  9   | const IAN = { username: 'Ian', password: '123qwe' };
  10  | 
  11  | // This QA environment can sit on an "Initializing..." splash for well over the default 15s action
  12  | // timeout before the login form mounts. Give the username field a generous timeout rather than
  13  | // failing fast, since the app itself (verified via curl) is otherwise up.
  14  | async function login(page: Page, creds: { username: string; password: string }) {
  15  |   await page.goto(`${APP_URL}/login`, { waitUntil: 'domcontentloaded', timeout: 60_000 });
  16  |   await page.getByPlaceholder(/username/i).fill(creds.username, { timeout: 60_000 });
  17  |   await page.getByPlaceholder(/password/i).fill(creds.password);
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
  41  | // The Routing step's approver dropdown is virtualized (rc-virtual-list) and the first rendered "option"
  42  | // is sometimes an off-screen measurement placeholder that happens to carry the real first item's
  43  | // aria-label — clicking it (even with force) fails with "Element is outside of the viewport" because it
  44  | // genuinely isn't on screen. The reliable approach is pure keyboard traversal: read the currently
  45  | // highlighted option via aria-activedescendant, step forward with ArrowDown until it matches, then
  46  | // press Enter — this never depends on any option's visibility or bounding box.
  47  | async function selectApproverOption(page: Page, matcher: RegExp, maxPresses = 20) {
  48  |   for (let i = 0; i < maxPresses; i++) {
  49  |     const activeId = await page.evaluate(() => document.activeElement?.getAttribute('aria-activedescendant') ?? null);
  50  |     if (activeId) {
  51  |       const label = await page.locator(`#${activeId}`).getAttribute('aria-label').catch(() => null);
  52  |       if (label && matcher.test(label)) {
  53  |         await page.keyboard.press('Enter');
  54  |         return;
  55  |       }
  56  |     }
  57  |     await page.keyboard.press('ArrowDown');
  58  |   }
  59  |   throw new Error(`Could not find an approver option matching ${matcher} within ${maxPresses} ArrowDown presses`);
  60  | }
  61  | 
  62  | test('TC-01 — Verify Comments Field Is Mandatory For Negative Actions', async ({ page }) => {
  63  |   test.setTimeout(300_000);
  64  | 
  65  |   // STEP 1: LOGIN to the system as initiator (Ian)
  66  |   await login(page, IAN);
  67  |   await expect(page).not.toHaveURL(/login/);
  68  | 
  69  |   // STEP 2: CLICK the Toggle from the top-left corner of the screen
  70  |   const toggle = page.locator('.ant-layout-sider-trigger, [class*="trigger"], [aria-label*="toggle" i], [aria-label*="menu" i]').first();
  71  |   await toggle.click();
  72  | 
  73  |   // STEP 3: CLICK the Workflows dropdown
  74  |   await page.getByText(/^Workflows?$/i).first().click();
  75  |   await expect(page.getByText(/^Inbox$/i).first()).toBeVisible({ timeout: 10_000 });
  76  | 
  77  |   // STEP 4: CLICK the My Items menu item
  78  |   await page.goto(`${APP_URL}/dynamic/Shesha.Workflow/workflows-my-items`, { waitUntil: 'domcontentloaded', timeout: 30_000 });
  79  |   await page.waitForLoadState('networkidle');
  80  |   await expect(page.getByRole('button', { name: /create new/i })).toBeVisible({ timeout: 15_000 });
  81  | 
  82  |   // STEP 5: CLICK the Create New button. Retried: this occasionally doesn't open its menu on the first
  83  |   // click if the page is still settling.
  84  |   const newReferralsItem = page.getByRole('menuitem', { name: /new referrals?/i });
  85  |   for (let attempt = 0; attempt < 3; attempt++) {
  86  |     await clickWithFlyoutRetry(page, page.getByRole('button', { name: /create new/i }));
  87  |     try {
  88  |       await expect(newReferralsItem).toBeVisible({ timeout: 6_000 });
  89  |       break;
  90  |     } catch (err) {
  91  |       if (attempt === 2) throw err;
  92  |     }
  93  |   }
  94  | 
  95  |   // STEP 6: CLICK the New Referrals subtype
  96  |   await clickWithFlyoutRetry(page, newReferralsItem);
  97  | 
  98  |   // STEP 7: POPULATE all mandatory fields and under CC field ADD "Ian" (self-referential — Ian routes
  99  |   // to himself, unlike sibling test cases which route to Craig).
  100 |   await expect(page.getByText(/subject/i).first()).toBeVisible({ timeout: 15_000 });
  101 |   const ccField = page.getByRole('combobox').nth(1);
  102 |   await ccField.click();
  103 |   const ccDropdownPanel = page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden)');
  104 |   await expect(ccDropdownPanel).toBeVisible({ timeout: 10_000 });
  105 |   await selectApproverOption(page, /ian/i);
  106 |   const ccContainer = ccField.locator('xpath=../..');
  107 |   await expect(ccContainer).toContainText(/ian/i, { timeout: 10_000 });
  108 | 
  109 |   await page.getByRole('textbox').nth(1).fill('Test Subject');
  110 | 
  111 |   const tabNames = ['Purpose', 'Background', 'Discussion', 'Financial Implications', 'Risks', 'Recommendation'];
  112 |   for (const name of tabNames) {
  113 |     const tab = page.getByRole('tab', { name: new RegExp(name, 'i') });
  114 |     for (let attempt = 0; attempt < 3; attempt++) {
  115 |       await tab.click();
  116 |       try {
  117 |         await expect(tab).toHaveAttribute('aria-selected', 'true', { timeout: 4_000 });
  118 |         break;
  119 |       } catch (err) {
  120 |         if (attempt === 2) throw err;
  121 |         await page.waitForTimeout(500);
  122 |       }
  123 |     }
  124 |     const editor = page.locator('[contenteditable="true"]:visible').first();
  125 |     const text = `Test ${name} input`;
  126 |     for (let attempt = 0; attempt < 3; attempt++) {
  127 |       await editor.click();
  128 |       await page.keyboard.type(text);
  129 |       try {
  130 |         await expect(editor).toContainText(text, { timeout: 6_000 });
```