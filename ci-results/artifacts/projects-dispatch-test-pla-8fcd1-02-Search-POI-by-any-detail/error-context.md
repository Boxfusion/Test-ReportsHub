# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: projects/dispatch/test-plans/administrative-functions/points-of-interest.spec.ts >> ADMIN-2.9 — Points of Interest >> TC-02: Search POI by any detail
- Location: projects/dispatch/test-plans/administrative-functions/points-of-interest.spec.ts:72:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('cell', { name: /Public/ }).first()
Expected: visible
Timeout: 15000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByRole('cell', { name: /Public/ }).first() with timeout 15000ms
  - waiting for getByRole('cell', { name: /Public/ }).first()

```

```yaml
- complementary:
  - menu:
    - menuitem "alert Dispatcher":
      - img "alert"
      - text: Dispatcher
    - menuitem "tool Administration":
      - img "tool"
      - text: Administration
    - menuitem "setting Configurations":
      - img "setting"
      - text: Configurations
  - img "menu-unfold"
- banner:
  - button "edit":
    - img "edit"
  - paragraph: Shesha/header v46
  - text: Live
  - img "close"
  - link:
    - /url: ""
    - img
  - strong: Offline
  - button "login Login":
    - img "login"
    - text: Login
  - text: Live Mode
  - switch "Switch to Edit mode"
  - img "block"
  - text: Live admin admin
  - img "down"
  - img "user"
- main:
  - button "edit":
    - img "edit"
  - paragraph: Boxfusion.Ems/emergency-site v5
  - text: Live
  - img "close"
  - heading "Points of Interest" [level=4]
  - textbox: Public
  - button "close-circle":
    - img "close-circle"
  - button "search":
    - img "search"
  - button "filter":
    - img "filter"
  - button "redo":
    - img "redo"
  - button "sliders":
    - img "sliders"
  - list:
    - listitem: 0 items found
    - listitem "Previous Page":
      - button "left" [disabled]:
        - img "left"
    - listitem "1"
    - listitem "Next Page":
      - button "right" [disabled]:
        - img "right"
    - listitem:
      - combobox "Page Size"
      - text: 10 / page
  - button "plus Add New":
    - img "plus"
    - text: Add New
  - button "Export"
  - table:
    - row "Name Category Category Type Address Latitude Longitude Contact Number Facility Speciality Region":
      - columnheader
      - columnheader
      - columnheader "Name":
        - text: Name
        - separator
      - columnheader "Category":
        - text: Category
        - separator
      - columnheader "Category Type":
        - text: Category Type
        - separator
      - columnheader "Address":
        - text: Address
        - separator
      - columnheader "Latitude":
        - text: Latitude
        - separator
      - columnheader "Longitude":
        - text: Longitude
        - separator
      - columnheader "Contact Number":
        - text: Contact Number
        - separator
      - columnheader "Facility Speciality":
        - text: Facility Speciality
        - separator
      - columnheader "Region":
        - text: Region
        - separator
    - rowgroup:
      - heading "No Data" [level=4]
      - text: No data is available for this table
- alert
```

# Test source

```ts
  1   | // AUTO-RECORDED from test-plans/administrative-functions/points-of-interest.md
  2   | // Source: Azure DevOps test plan #65099, suite #65145 (2.9 Points of Interest)
  3   | // The .md plan is canonical. AI-repair will patch failing lines in this file.
  4   | //
  5   | // Selectors recorded live against NC Dispatch QA on 2026-06-25. Points of Interest is a form-dialog
  6   | // grid: rows expose magnifying-glass + edit-pencil links (both /emergency-site-details?id=…; edit
  7   | // adds &mode=edit). Details/edit actions are .sha-toolbar-btn (Back/Edit/Save/Cancel Form Edit) in
  8   | // #modalContainerId. Edit form: Name* (free text, pre-populated), Point Of Interest Type*, Site Type*,
  9   | // Region*, Specialities* (all selects pre-populated), Marker Url, Contact Number*. Name is the field
  10  | // tweaked for save/cancel cases.
  11  | 
  12  | import { test, expect, Page, Locator } from '@playwright/test';
  13  | 
  14  | const BASE = 'https://ncdoh-dispatcher-adminportal-qa.shesha.app';
  15  | const APP_URL = `${BASE}/login`;
  16  | const GRID = `${BASE}/dynamic/Boxfusion.Ems/emergency-site`;
  17  | const ADMIN = { user: 'Admin', password: '123qwe' };
  18  | const DETAILS = 'a[href*="emergency-site-details"]:not([href*="mode=edit"])';
  19  | const ROW_EDIT = 'a[href*="emergency-site-details"][href*="mode=edit"]';
  20  | 
  21  | async function login(page: Page) {
  22  |   await page.goto(APP_URL);
  23  |   // The login page occasionally renders blank on first paint — reload once if the form isn't there.
  24  |   const user = page.getByPlaceholder('Username');
  25  |   try {
  26  |     await expect(user).toBeVisible({ timeout: 15000 });
  27  |   } catch {
  28  |     await page.reload();
  29  |     await expect(user).toBeVisible({ timeout: 20000 });
  30  |   }
  31  |   await user.fill(ADMIN.user);
  32  |   await page.getByPlaceholder('Password').fill(ADMIN.password);
  33  |   await page.getByRole('button', { name: 'Sign In' }).click();
  34  |   await page.waitForURL((url) => !url.href.includes('/login'), { timeout: 30000 });
  35  | }
  36  | 
  37  | async function gotoGrid(page: Page) {
  38  |   await page.goto(GRID);
  39  |   await expect(page.getByRole('table')).toBeVisible({ timeout: 30000 });
  40  |   await expect(page.getByRole('textbox').first()).toBeVisible({ timeout: 30000 });
  41  |   // POI grid rows load asynchronously — wait for detail links before clicking them.
  42  |   await expect(page.locator(DETAILS).first()).toBeVisible({ timeout: 30000 });
  43  | }
  44  | 
  45  | async function searchGrid(page: Page, term: string) {
  46  |   const box = page.getByRole('textbox').first();
  47  |   await box.click();
  48  |   await box.fill(term);
  49  |   await page.getByRole('button', { name: 'search' }).click();
  50  |   await page.waitForTimeout(2500);
  51  | }
  52  | 
  53  | function detailView(page: Page): Locator {
  54  |   return page.locator('#modalContainerId');
  55  | }
  56  | function toolBtn(page: Page, label: RegExp): Locator {
  57  |   return page.locator('#modalContainerId .sha-toolbar-btn').filter({ hasText: label });
  58  | }
  59  | // Name — free-text field on the POI edit form, pre-populated, no uniqueness/format constraint.
  60  | function nameField(page: Page): Locator {
  61  |   return detailView(page).locator('.ant-form-item').filter({ hasText: 'Name' }).getByRole('textbox').first();
  62  | }
  63  | 
  64  | test.describe('ADMIN-2.9 — Points of Interest', () => {
  65  | 
  66  |   test('TC-01: Log in to NC Dispatch', async ({ page }) => {
  67  |     await login(page);
  68  |     await expect(page).not.toHaveURL(/\/login/i);
  69  |   });
  70  | 
  71  |   // ADO Test Case #65822: https://dev.azure.com/boxfusion/pd-dispatcher-V2/_workitems/edit/65822
  72  |   test('TC-02: Search POI by any detail', async ({ page }) => {
  73  |     test.setTimeout(60_000);
  74  |     await login(page);
  75  |     await gotoGrid(page);
  76  |     await expect(page.getByRole('table')).toBeVisible();
  77  |     await searchGrid(page, 'Public');
> 78  |     await expect(page.getByRole('cell', { name: /Public/ }).first()).toBeVisible({ timeout: 15000 });
      |                                                                      ^ Error: expect(locator).toBeVisible() failed
  79  |   });
  80  | 
  81  |   // ADO Test Case #65823: https://dev.azure.com/boxfusion/pd-dispatcher-V2/_workitems/edit/65823
  82  |   test('TC-03: Add new POI (open dialog)', async ({ page }) => {
  83  |     test.setTimeout(60_000);
  84  |     await login(page);
  85  |     await gotoGrid(page);
  86  |     await page.getByRole('button', { name: /Add New/ }).click();
  87  |     await expect(page.locator('.ant-modal-content')).toBeVisible({ timeout: 15000 });
  88  |     await expect(page.getByText('Add New Point of Interest')).toBeVisible();
  89  |   });
  90  | 
  91  |   // ADO Test Case #65824: https://dev.azure.com/boxfusion/pd-dispatcher-V2/_workitems/edit/65824
  92  |   test('TC-04: Export POIs', async ({ page }) => {
  93  |     test.setTimeout(60_000);
  94  |     await login(page);
  95  |     await gotoGrid(page);
  96  |     const [download] = await Promise.all([
  97  |       page.waitForEvent('download', { timeout: 20000 }),
  98  |       page.getByRole('button', { name: /Export/ }).click(),
  99  |     ]);
  100 |     expect(download.suggestedFilename()).toBeTruthy();
  101 |   });
  102 | 
  103 |   // ADO Test Case #65825: https://dev.azure.com/boxfusion/pd-dispatcher-V2/_workitems/edit/65825
  104 |   test('TC-05: View POI details', async ({ page }) => {
  105 |     test.setTimeout(60_000);
  106 |     await login(page);
  107 |     await gotoGrid(page);
  108 |     await page.locator(DETAILS).first().click();
  109 |     await expect(page).toHaveURL(/emergency-site-details/);
  110 |     await expect(toolBtn(page, /^Edit$/)).toBeVisible({ timeout: 15000 });
  111 |   });
  112 | 
  113 |   // ADO Test Case #65826: https://dev.azure.com/boxfusion/pd-dispatcher-V2/_workitems/edit/65826
  114 |   test('TC-06: Navigate back from details', async ({ page }) => {
  115 |     test.setTimeout(60_000);
  116 |     await login(page);
  117 |     await gotoGrid(page);
  118 |     await page.locator(DETAILS).first().click();
  119 |     const back = detailView(page).getByRole('button', { name: 'Back' })
  120 |       .or(detailView(page).getByRole('link', { name: 'Back' }));
  121 |     await expect(back).toBeVisible({ timeout: 15000 });
  122 |     await back.click();
  123 |     await expect(page.getByRole('table')).toBeVisible({ timeout: 20000 });
  124 |   });
  125 | 
  126 |   // ADO Test Case #65827: https://dev.azure.com/boxfusion/pd-dispatcher-V2/_workitems/edit/65827
  127 |   test('TC-07: Edit POI from details view', async ({ page }) => {
  128 |     test.setTimeout(60_000);
  129 |     await login(page);
  130 |     await gotoGrid(page);
  131 |     await page.locator(DETAILS).first().click();
  132 |     await toolBtn(page, /^Edit$/).click();
  133 |     await expect(toolBtn(page, /^Save$/)).toBeVisible({ timeout: 15000 });
  134 |     await expect(toolBtn(page, /^Cancel Form Edit$/)).toBeVisible();
  135 |   });
  136 | 
  137 |   // ADO Test Case #65828: https://dev.azure.com/boxfusion/pd-dispatcher-V2/_workitems/edit/65828
  138 |   test('TC-08: Cancel edit in details view', async ({ page }) => {
  139 |     test.setTimeout(60_000);
  140 |     await login(page);
  141 |     await gotoGrid(page);
  142 |     await page.locator(DETAILS).first().click();
  143 |     await toolBtn(page, /^Edit$/).click();
  144 |     await expect(toolBtn(page, /^Cancel Form Edit$/)).toBeVisible({ timeout: 15000 });
  145 |     await toolBtn(page, /^Cancel Form Edit$/).click();
  146 |     await expect(toolBtn(page, /^Edit$/)).toBeVisible({ timeout: 15000 });
  147 |     await expect(toolBtn(page, /^Save$/)).toHaveCount(0);
  148 |   });
  149 | 
  150 |   // ADO Test Case #65829: https://dev.azure.com/boxfusion/pd-dispatcher-V2/_workitems/edit/65829
  151 |   test('TC-09: Save edit in details view', async ({ page }) => {
  152 |     test.setTimeout(60_000);
  153 |     await login(page);
  154 |     await gotoGrid(page);
  155 |     await page.locator(DETAILS).first().click();
  156 |     await toolBtn(page, /^Edit$/).click();
  157 |     await expect(toolBtn(page, /^Save$/)).toBeVisible({ timeout: 15000 });
  158 |     // STEP: MODIFY the Name field
  159 |     const name = nameField(page);
  160 |     // Bounded toggle (not an unbounded append): appending each run eventually overflows the
  161 |     // field's server-side length limit → 500. Oscillate a ' x' suffix instead.
  162 |     const _cur = await name.inputValue();
  163 |     await name.fill(_cur.endsWith(' x') ? _cur.slice(0, -2) : _cur + ' x');
  164 |     // STEP: CLICK Save
  165 |     await toolBtn(page, /^Save$/).click();
  166 |     // ASSERT (BLOCKING) saved — returns to view mode (Edit visible again)
  167 |     await expect(toolBtn(page, /^Edit$/)).toBeVisible({ timeout: 20000 });
  168 |   });
  169 | 
  170 |   // ADO Test Case #65830: https://dev.azure.com/boxfusion/pd-dispatcher-V2/_workitems/edit/65830
  171 |   test('TC-10: Edit POI from index', async ({ page }) => {
  172 |     test.setTimeout(60_000);
  173 |     await login(page);
  174 |     await gotoGrid(page);
  175 |     await page.locator(ROW_EDIT).first().click();
  176 |     await expect(page).toHaveURL(/mode=edit/);
  177 |     await expect(toolBtn(page, /^Save$/)).toBeVisible({ timeout: 15000 });
  178 |   });
```