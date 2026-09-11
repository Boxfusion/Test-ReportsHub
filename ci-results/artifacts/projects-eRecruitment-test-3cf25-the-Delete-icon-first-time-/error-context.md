# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: projects/eRecruitment/test-plans/Alerts/verify-delete-alert.spec.ts >> ALERTS-106360 — Verify Delete Alert >> TC-11: Click the Delete icon (first time)
- Location: projects/eRecruitment/test-plans/Alerts/verify-delete-alert.spec.ts:211:7

# Error details

```
Test timeout of 120000ms exceeded.
```

```
Error: locator.click: Test timeout of 120000ms exceeded.
Call log:
  - waiting for getByRole('row', { name: /DeleteAlertQA/ }).getByRole('button', { name: 'delete' }).first()
    - locator resolved to <button type="button" title="Delete" class="ant-btn css-1lo1l9k css-var-R4q ant-btn-circle ant-btn-link ant-btn-icon-only sha-link sha-action-button">…</button>
  - attempting click action
    - waiting for element to be visible, enabled and stable
    - element is visible, enabled and stable
    - scrolling into view if needed
    - done scrolling
    - <div aria-busy="true" aria-live="polite" class="ant-spin ant-spin-spinning css-1lo1l9k css-var-R4q">…</div> from <div>…</div> subtree intercepts pointer events
  - retrying click action
    - waiting for element to be visible, enabled and stable
    - element is visible, enabled and stable
    - scrolling into view if needed
    - done scrolling
    - element is not visible
  - retrying click action
    - waiting 20ms
    - waiting for element to be visible, enabled and stable
  - element was detached from the DOM, retrying

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e4]:
    - banner [ref=e5]:
      - generic [ref=e9]:
        - generic [ref=e11]:
          - button [ref=e12] [cursor=pointer]:
            - img "edit" [ref=e13]
          - paragraph [ref=e16] [cursor=pointer]: Shesha/header-public-portal v17
          - generic [ref=e17]:
            - generic [ref=e18]: Live
            - img "close" [ref=e19] [cursor=pointer]
        - generic [ref=e30]:
          - menu [ref=e46]:
            - menuitem [ref=e47] [cursor=pointer]:
              - link "Home" [ref=e49]:
                - /url: /no-auth/Shesha.Recruitment/landing-page
            - menuitem [ref=e50] [cursor=pointer]:
              - link "Dashboard" [ref=e52]:
                - /url: /dynamic/Shesha.Recruitment/dashboard
            - menuitem [ref=e53] [cursor=pointer]:
              - link "Jobs" [ref=e55]:
                - /url: /dynamic/Shesha.Recruitment/public-jobs
            - menuitem [ref=e56] [cursor=pointer]:
              - link "Manage Profile" [ref=e58]:
                - /url: /dynamic/Shesha.Recruitment/profile
            - menuitem [ref=e59] [cursor=pointer]:
              - link "Contact Us" [ref=e61]:
                - /url: /dynamic/Shesha.Recruitment/contact-us
            - menuitem [ref=e62] [cursor=pointer]:
              - link "Alerts" [ref=e64]:
                - /url: /dynamic/Shesha.Recruitment/alerts
            - menuitem [ref=e65] [cursor=pointer]:
              - link "Inbox" [ref=e67]:
                - /url: /dynamic/Shesha.Enterprise/publicportal-inbox
            - listitem [aria-hidden]:
              - menuitem [disabled]:
                - generic: Menu
          - generic [ref=e73]:
            - text: Hi Fred Everything!
            - img "down" [ref=e75]
            - img "user" [ref=e79]
    - main [ref=e82]:
      - generic [ref=e87]:
        - generic [ref=e89]:
          - button [ref=e90] [cursor=pointer]:
            - img "edit" [ref=e91]
          - paragraph [ref=e94] [cursor=pointer]: Shesha.Recruitment/alerts v26
          - generic [ref=e95]:
            - generic [ref=e96]: Live
            - img "close" [ref=e97] [cursor=pointer]
        - generic [ref=e108]:
          - generic [ref=e109]: Your Alerts
          - text: ":"
          - generic [ref=e118]:
            - button "Add Alert" [ref=e126] [cursor=pointer]
            - table [ref=e135]:
              - row [ref=e136]:
                - columnheader [ref=e137]
                - columnheader "Job Title" [ref=e138] [cursor=pointer]:
                  - text: Job Title
                  - separator [ref=e139]
                - columnheader "Location" [ref=e140] [cursor=pointer]:
                  - text: Location
                  - separator [ref=e141]
                - columnheader "Frequency" [ref=e142] [cursor=pointer]:
                  - text: Frequency
                  - separator [ref=e143]
                - columnheader "Min Salary Range" [ref=e144] [cursor=pointer]:
                  - text: Min Salary Range
                  - separator [ref=e145]
                - columnheader "Max Salary Range" [ref=e146] [cursor=pointer]:
                  - text: Max Salary Range
                  - separator [ref=e147]
              - rowgroup [ref=e148]:
                - row [ref=e149]:
                  - cell [ref=e150]:
                    - button [ref=e152] [cursor=pointer]:
                      - img "delete" [ref=e154]
                  - cell "Software Engineer" [ref=e157]
                  - cell "Head Office" [ref=e158]
                  - cell "Weekly" [ref=e159]
                  - cell "20000" [ref=e160]
                  - cell "60000" [ref=e161]
                - row [ref=e162]:
                  - cell [ref=e163]:
                    - button [ref=e165] [cursor=pointer]:
                      - img "delete" [ref=e167]
                  - cell "Developer" [ref=e170]
                  - cell "Head Office" [ref=e171]
                  - cell "Weekly" [ref=e172]
                  - cell "20000" [ref=e173]
                  - cell "60000" [ref=e174]
                - row [ref=e175]:
                  - cell [ref=e176]:
                    - button [ref=e178] [cursor=pointer]:
                      - img "delete" [ref=e180]
                  - cell "Analyst" [ref=e183]
                  - cell "Head Office" [ref=e184]
                  - cell "Daily" [ref=e185]
                  - cell "20000" [ref=e186]
                  - cell "60000" [ref=e187]
                - row [ref=e188]:
                  - cell [ref=e189]:
                    - button [ref=e191] [cursor=pointer]:
                      - img "delete" [ref=e193]
                  - cell "Developer" [ref=e196]
                  - cell "Head Office" [ref=e197]
                  - cell "Weekly" [ref=e198]
                  - cell "20000" [ref=e199]
                  - cell "60000" [ref=e200]
                - row [ref=e201]:
                  - cell [ref=e202]:
                    - button [ref=e204] [cursor=pointer]:
                      - img "delete" [ref=e206]
                  - cell "Test" [ref=e209]
                  - cell "Boxfusion Pty/Ltd" [ref=e210]
                  - cell "Daily" [ref=e211]
                  - cell "30000" [ref=e212]
                  - cell "15000" [ref=e213]
                - row [ref=e214]:
                  - cell [ref=e215]:
                    - button [ref=e217] [cursor=pointer]:
                      - img "delete" [ref=e219]
                  - cell "Analyst" [ref=e222]
                  - cell "Head Office" [ref=e223]
                  - cell "Daily" [ref=e224]
                  - cell "20000" [ref=e225]
                  - cell "60000" [ref=e226]
                - row [ref=e227]:
                  - cell [ref=e228]:
                    - button [ref=e230] [cursor=pointer]:
                      - img "delete" [ref=e232]
                  - cell "Analyst" [ref=e235]
                  - cell "Head Office" [ref=e236]
                  - cell "Daily" [ref=e237]
                  - cell "20000" [ref=e238]
                  - cell "60000" [ref=e239]
    - contentinfo [ref=e240]:
      - generic [ref=e244]:
        - generic [ref=e246]:
          - button [ref=e247] [cursor=pointer]:
            - img "edit" [ref=e248]
          - paragraph [ref=e251] [cursor=pointer]: Shesha/footer-public-portal v12
          - generic [ref=e252]:
            - generic [ref=e253]: Live
            - img "close" [ref=e254] [cursor=pointer]
        - generic [ref=e267]:
          - generic [ref=e268]: © 2023 Shesha. All rights reserved.
          - generic [ref=e285]:
            - heading "Connect with us" [level=5] [ref=e291]
            - generic [ref=e293]:
              - link [ref=e295] [cursor=pointer]:
                - /url: https://www.linkedin.com/company/department-of-home-affairs-za/
                - img "linkedin" [ref=e297]
              - link [ref=e301] [cursor=pointer]:
                - /url: " https://x.com/homeaffairssa?s=11&t=-1U2nsxjEi4uI8Cp0CqTGQ"
                - img "twitter" [ref=e303]
              - link [ref=e307] [cursor=pointer]:
                - /url: "https://www.facebook.com/HomeAffairsZA "
                - img "facebook" [ref=e309]
  - alert [ref=e312]
```

# Test source

```ts
  20  | const MAX_SALARY = '60000';
  21  | 
  22  | async function loginAsFred(page: Page) {
  23  |   await page.goto(`${APP_URL}login`);
  24  |   await page.locator('input[type="text"]').first().fill(APPLICANT.user);
  25  |   await page.locator('input[type="password"]').first().fill(APPLICANT.password);
  26  |   await page.getByRole('button', { name: /sign in/i }).click();
  27  |   await page.waitForURL(url => !url.href.includes('/login'), { timeout: 30000 });
  28  |   await page.waitForLoadState('networkidle');
  29  | }
  30  | 
  31  | async function goToAlerts(page: Page) {
  32  |   await page.getByRole('link', { name: 'Alerts', exact: true }).click();
  33  |   await page.waitForLoadState('networkidle');
  34  |   await page.waitForTimeout(1000);
  35  | }
  36  | 
  37  | function addAlertButton(page: Page): Locator {
  38  |   return page.getByRole('button', { name: 'Add Alert', exact: true });
  39  | }
  40  | 
  41  | function addAlertDialog(page: Page): Locator {
  42  |   return page.locator('.ant-modal-content').filter({ hasText: 'Add Alert' }).first();
  43  | }
  44  | 
  45  | function formItemByLabel(page: Page, forId: string): Locator {
  46  |   return addAlertDialog(page).locator('.ant-form-item').filter({ has: page.locator(`label[for="${forId}"]`) });
  47  | }
  48  | 
  49  | function keywordsField(page: Page): Locator {
  50  |   return formItemByLabel(page, 'keywords').locator('input[type="text"]');
  51  | }
  52  | 
  53  | function locationSelect(page: Page): Locator {
  54  |   return formItemByLabel(page, 'location').locator('.ant-select').first();
  55  | }
  56  | 
  57  | function minSalaryField(page: Page): Locator {
  58  |   return formItemByLabel(page, 'minSalaryRange').locator('input[role="spinbutton"]');
  59  | }
  60  | 
  61  | function maxSalaryField(page: Page): Locator {
  62  |   return formItemByLabel(page, 'maxSalaryRange').locator('input[role="spinbutton"]');
  63  | }
  64  | 
  65  | function dailyRadio(page: Page): Locator {
  66  |   return addAlertDialog(page).locator('.ant-radio-wrapper').filter({ hasText: 'Daily' }).locator('input[type="radio"]');
  67  | }
  68  | 
  69  | function dropdownList(page: Page): Locator {
  70  |   return page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden)').first();
  71  | }
  72  | 
  73  | function okButton(page: Page): Locator {
  74  |   return addAlertDialog(page).getByRole('button', { name: 'OK', exact: true });
  75  | }
  76  | 
  77  | async function selectAntOption(page: Page, select: Locator, optionText: string) {
  78  |   await select.click();
  79  |   const dropdown = dropdownList(page);
  80  |   await expect(dropdown).toBeVisible({ timeout: 10000 });
  81  |   await dropdown.getByText(optionText, { exact: true }).first().click();
  82  |   await page.waitForTimeout(500);
  83  | }
  84  | 
  85  | async function openAddAlertDialog(page: Page) {
  86  |   await loginAsFred(page);
  87  |   await goToAlerts(page);
  88  |   await addAlertButton(page).click();
  89  |   await expect(addAlertDialog(page)).toBeVisible({ timeout: 15000 });
  90  | }
  91  | 
  92  | function alertRow(page: Page): Locator {
  93  |   return page.getByRole('row', { name: new RegExp(JOB_TITLE) });
  94  | }
  95  | 
  96  | function deleteIcon(page: Page): Locator {
  97  |   return alertRow(page).getByRole('button', { name: 'delete' });
  98  | }
  99  | 
  100 | function confirmPopover(page: Page): Locator {
  101 |   return page.locator('.ant-popover, .ant-popconfirm').filter({ hasText: /delete/i });
  102 | }
  103 | 
  104 | // The alert list is real server-side state shared across test runs, so a
  105 | // prior run (or a prior TC in this same run) can leave stale "DeleteAlertQA"
  106 | // rows behind. Clear them all before creating a fresh one so every TC deals
  107 | // with exactly one matching row.
  108 | async function deleteAllMatchingAlertRows(page: Page) {
  109 |   // The Alerts table hydrates a moment after networkidle/goToAlerts settle,
  110 |   // so an immediate count() can read 0 on a table that's still populating.
  111 |   // Wait, then re-check once more before trusting a 0 count.
  112 |   await page.waitForLoadState('networkidle');
  113 |   await page.waitForTimeout(1500);
  114 |   if ((await alertRow(page).count()) === 0) {
  115 |     await page.waitForTimeout(1500);
  116 |   }
  117 |   let guard = 0;
  118 |   while ((await alertRow(page).count()) > 0 && guard < 10) {
  119 |     guard++;
> 120 |     await deleteIcon(page).first().click();
      |                                    ^ Error: locator.click: Test timeout of 120000ms exceeded.
  121 |     await page.waitForTimeout(500);
  122 |     const popover = confirmPopover(page);
  123 |     await expect(popover).toBeVisible({ timeout: 10000 });
  124 |     await popover.getByRole('button', { name: 'OK' }).click();
  125 |     await page.waitForLoadState('networkidle');
  126 |     await page.waitForTimeout(1000);
  127 |   }
  128 | }
  129 | 
  130 | async function createAlert(page: Page) {
  131 |   await loginAsFred(page);
  132 |   await goToAlerts(page);
  133 |   await deleteAllMatchingAlertRows(page);
  134 |   await addAlertButton(page).click();
  135 |   await expect(addAlertDialog(page)).toBeVisible({ timeout: 15000 });
  136 |   await keywordsField(page).fill(JOB_TITLE);
  137 |   await selectAntOption(page, locationSelect(page), LOCATION);
  138 |   await minSalaryField(page).fill(MIN_SALARY);
  139 |   await maxSalaryField(page).fill(MAX_SALARY);
  140 |   await dailyRadio(page).check();
  141 |   await okButton(page).click();
  142 |   await page.waitForLoadState('networkidle');
  143 |   await page.waitForTimeout(1500);
  144 |   await expect(alertRow(page)).toBeVisible({ timeout: 15000 });
  145 |   await expect(alertRow(page)).toHaveCount(1);
  146 | }
  147 | 
  148 | test.describe('ALERTS-106360 — Verify Delete Alert', () => {
  149 |   test.describe.configure({ mode: 'serial' });
  150 |   test.setTimeout(120_000);
  151 | 
  152 |   test('TC-01: Login as Fred', async ({ page }) => {
  153 |     await loginAsFred(page);
  154 |     await expect(page).not.toHaveURL(/login/i);
  155 |     await expect(page.getByText('Your Dashboard')).toBeVisible({ timeout: 30000 });
  156 |   });
  157 | 
  158 |   test('TC-02: Click on Alerts menu item', async ({ page }) => {
  159 |     await loginAsFred(page);
  160 |     await goToAlerts(page);
  161 |     await expect(addAlertButton(page)).toBeVisible({ timeout: 15000 });
  162 |   });
  163 | 
  164 |   test('TC-03: Click Add Alert button', async ({ page }) => {
  165 |     await openAddAlertDialog(page);
  166 |     await expect(addAlertDialog(page)).toBeVisible({ timeout: 15000 });
  167 |   });
  168 | 
  169 |   test('TC-04: Populate Job Title/Keywords', async ({ page }) => {
  170 |     await openAddAlertDialog(page);
  171 |     await keywordsField(page).fill(JOB_TITLE);
  172 |     await expect(keywordsField(page)).toHaveValue(JOB_TITLE);
  173 |   });
  174 | 
  175 |   test('TC-05: Click Location dropdown', async ({ page }) => {
  176 |     await openAddAlertDialog(page);
  177 |     await locationSelect(page).click();
  178 |     await expect(dropdownList(page)).toBeVisible({ timeout: 10000 });
  179 |   });
  180 | 
  181 |   test('TC-06: Select a location, e.g. Head Office', async ({ page }) => {
  182 |     await openAddAlertDialog(page);
  183 |     await selectAntOption(page, locationSelect(page), LOCATION);
  184 |     await expect(locationSelect(page).locator('.ant-select-selection-item')).toHaveText(LOCATION, { timeout: 10000 });
  185 |   });
  186 | 
  187 |   test('TC-07: Populate Min Salary', async ({ page }) => {
  188 |     await openAddAlertDialog(page);
  189 |     await minSalaryField(page).fill(MIN_SALARY);
  190 |     await expect(minSalaryField(page)).toHaveValue(MIN_SALARY);
  191 |   });
  192 | 
  193 |   test('TC-08: Populate Max Salary', async ({ page }) => {
  194 |     await openAddAlertDialog(page);
  195 |     await minSalaryField(page).fill(MIN_SALARY);
  196 |     await maxSalaryField(page).fill(MAX_SALARY);
  197 |     await expect(maxSalaryField(page)).toHaveValue(MAX_SALARY);
  198 |   });
  199 | 
  200 |   test('TC-09: Click Daily radio button', async ({ page }) => {
  201 |     await openAddAlertDialog(page);
  202 |     await dailyRadio(page).check();
  203 |     await expect(dailyRadio(page)).toBeChecked();
  204 |   });
  205 | 
  206 |   test('TC-10: Click OK button (create alert)', async ({ page }) => {
  207 |     await createAlert(page);
  208 |     await expect(alertRow(page)).toBeVisible();
  209 |   });
  210 | 
  211 |   test('TC-11: Click the Delete icon (first time)', async ({ page }) => {
  212 |     await createAlert(page);
  213 |     // STEP: CLICK the Delete icon on the newly-added alert row
  214 |     await deleteIcon(page).click();
  215 |     await page.waitForTimeout(500);
  216 |     // ASSERT (BLOCKING) confirmation popover is visible with Cancel and OK
  217 |     const popover = confirmPopover(page);
  218 |     await expect(popover).toBeVisible({ timeout: 10000 });
  219 |     await expect(popover.getByRole('button', { name: 'Cancel' })).toBeVisible();
  220 |     await expect(popover.getByRole('button', { name: 'OK' })).toBeVisible();
```