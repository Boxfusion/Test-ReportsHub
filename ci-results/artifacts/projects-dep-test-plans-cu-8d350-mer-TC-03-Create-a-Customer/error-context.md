# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: projects/dep/test-plans/customers/create-customer.spec.ts >> Create Customer >> TC-03: Create a Customer
- Location: projects/dep/test-plans/customers/create-customer.spec.ts:67:7

# Error details

```
Test timeout of 90000ms exceeded.
```

```
Error: locator.click: Test timeout of 90000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: /^Create/i }).first()

```

# Page snapshot

```yaml
- generic [ref=e1]:
  - alert [ref=e2]
  - generic [ref=e5]:
    - complementary [ref=e6]:
      - menu [ref=e10]:
        - menuitem [ref=e11] [cursor=pointer]:
          - img "home" [ref=e12]
          - link "Cases" [ref=e16]:
            - /url: /dynamic/Boxfusion.ServiceManagement/service-requests
        - menuitem [ref=e17] [cursor=pointer]:
          - img "menu-unfold" [ref=e18]
          - link "All Cases" [ref=e22]:
            - /url: /dynamic/StarterTemplate/cases-table
        - menuitem [ref=e23] [cursor=pointer]:
          - img "calendar" [ref=e24]
          - link "Events" [ref=e28]:
            - /url: /dynamic/Boxfusion.Dep/events-table
        - menuitem [ref=e29] [cursor=pointer]:
          - img "question-circle" [ref=e30]
          - link "FAQ" [ref=e35]:
            - /url: /dynamic/Boxfusion.ServiceManagement/new-faqs-table
        - menuitem [ref=e36] [cursor=pointer]:
          - img "contacts" [ref=e37]
          - link "Contacts" [ref=e41]:
            - /url: /dynamic/Boxfusion.ServiceManagement/contacts-table
        - menuitem [ref=e42] [cursor=pointer]:
          - img "home" [ref=e43]
          - link "Facilities" [ref=e47]:
            - /url: /dynamic/Boxfusion.Dep/facilities-table
        - menuitem [ref=e48] [cursor=pointer]:
          - img "usergroup-delete" [ref=e49]
          - link "Customers" [active] [ref=e53]:
            - /url: /dynamic/Boxfusion.Dep/table-customers
        - menuitem [ref=e54] [cursor=pointer]:
          - img "notification" [ref=e55]
          - link "Broadcast Notification" [ref=e59]:
            - /url: /dynamic/Boxfusion.Dep/broad-cast-notificationstableView
        - menuitem [ref=e60] [cursor=pointer]:
          - img "pic-left" [ref=e61]
          - link "Ambulance Requests" [ref=e65]:
            - /url: /dynamic/Boxfusion.PatientEngagement/ambulance-requests-tableview
        - menuitem [ref=e66] [cursor=pointer]:
          - img "environment" [ref=e67]
          - link "Case Mapping" [ref=e71]:
            - /url: /dynamic/Boxfusion.ServiceManagement/Spartial_Map
        - menuitem [ref=e72] [cursor=pointer]:
          - img "wechat" [ref=e73]
          - link "Social Media" [ref=e77]:
            - /url: /dynamic/Boxfusion.Dep/dep-libraries
        - menuitem [ref=e78] [cursor=pointer]:
          - img "appstore" [ref=e79]
          - link "Content Item Types" [ref=e83]:
            - /url: /dynamic/boxfusion.content/content-item-types
        - menuitem [ref=e84] [cursor=pointer]:
          - img "windows" [ref=e85]
          - link "Manage Content Libraries" [ref=e89]:
            - /url: /dynamic/boxfusion.content/manage-libraries-list
        - menuitem [ref=e90] [cursor=pointer]:
          - img "windows" [ref=e91]
          - link "Public Libraries" [ref=e95]:
            - /url: /dynamic/boxfusion.content/public-libraries
        - menuitem [ref=e96] [cursor=pointer]:
          - img "check" [ref=e97]
          - link "Service Ratings" [ref=e101]:
            - /url: /dynamic/Boxfusion.ServiceManagement/case-service-ratings-table
        - menuitem "area-chart DashBoards" [ref=e102] [cursor=pointer]:
          - img "area-chart" [ref=e103]
          - generic [ref=e106]: DashBoards
        - menuitem [ref=e107] [cursor=pointer]:
          - img "message" [ref=e108]
          - link "Chat Console" [ref=e112]:
            - /url: /dynamic/boxfusion.chat/chat-customer-info
        - menuitem "area-chart Reports" [ref=e113] [cursor=pointer]:
          - img "area-chart" [ref=e114]
          - generic [ref=e117]: Reports
        - menuitem "Surveys" [ref=e118] [cursor=pointer]
        - menuitem "tool Administration" [ref=e120] [cursor=pointer]:
          - img "tool" [ref=e121]
          - generic [ref=e124]: Administration
        - menuitem "setting Configurations" [ref=e125] [cursor=pointer]:
          - img "setting" [ref=e126]
          - generic [ref=e129]: Configurations
        - menuitem [ref=e130] [cursor=pointer]:
          - link "edit-reported-user" [ref=e132]:
            - /url: /dynamic/Boxfusion.ServiceManagement/edit-reported-user
        - menuitem [ref=e133] [cursor=pointer]:
          - link "Test Desktop Notif" [ref=e135]:
            - /url: /dynamic/Boxfusion.Dep/test-site-desk-notif
      - img "menu-unfold" [ref=e138] [cursor=pointer]
    - generic [ref=e141]:
      - banner [ref=e142]:
        - generic [ref=e148]:
          - generic [ref=e150]:
            - button [ref=e151] [cursor=pointer]:
              - img "edit" [ref=e152]
            - paragraph [ref=e155] [cursor=pointer]: Shesha/header v11
            - generic [ref=e156]:
              - generic [ref=e157]: Live
              - img "close" [ref=e158] [cursor=pointer]
          - generic [ref=e169]:
            - link [ref=e175] [cursor=pointer]:
              - /url: /
            - generic [ref=e187]:
              - generic [ref=e188]:
                - generic [ref=e190]:
                  - generic [ref=e191]: Live Mode
                  - switch "Switch to Edit mode" [ref=e193] [cursor=pointer]
                - generic "Click to change view mode" [ref=e197] [cursor=pointer]:
                  - img "block" [ref=e198]
                  - generic [ref=e201]: Live
              - generic [ref=e203]:
                - generic [ref=e204] [cursor=pointer]:
                  - text: Lebos Lebos
                  - img "down" [ref=e205]
                - img "user" [ref=e209]
      - main [ref=e212]:
        - generic [ref=e218]:
          - generic [ref=e220]:
            - button [ref=e221] [cursor=pointer]:
              - img "edit" [ref=e222]
            - paragraph [ref=e225] [cursor=pointer]: Boxfusion.Dep/table-customers v22
            - generic [ref=e226]:
              - generic [ref=e227]: Live
              - img "close" [ref=e228] [cursor=pointer]
          - generic [ref=e241]:
            - generic [ref=e243]:
              - heading "Customers" [level=4] [ref=e249] [cursor=pointer]
              - generic [ref=e251]:
                - generic [ref=e254]:
                  - textbox [ref=e256]
                  - button [ref=e259] [cursor=pointer]:
                    - img "search" [ref=e261]
                - button [ref=e269] [cursor=pointer]:
                  - img "filter" [ref=e271]
                - button [ref=e279] [cursor=pointer]:
                  - img "sliders" [ref=e281]
                - list [ref=e284]:
                  - listitem [ref=e285]: 1-10 of 2677 items
                  - listitem "Previous Page" [ref=e286]:
                    - button [disabled] [ref=e287]:
                      - img "left" [ref=e288]
                  - listitem "1" [ref=e291] [cursor=pointer]
                  - listitem "2" [ref=e293] [cursor=pointer]
                  - listitem "3" [ref=e295] [cursor=pointer]
                  - listitem "Next 3 Pages" [ref=e297] [cursor=pointer]:
                    - generic [ref=e299]:
                      - img "double-right" [ref=e300]
                      - generic [ref=e303]: •••
                  - listitem "268" [ref=e304] [cursor=pointer]
                  - listitem "Next Page" [ref=e306] [cursor=pointer]:
                    - button [ref=e307]:
                      - img "right" [ref=e308]
                  - listitem [ref=e311]:
                    - generic "Page Size" [ref=e312] [cursor=pointer]:
                      - generic [ref=e313]:
                        - combobox "Page Size" [ref=e315]
                        - generic "10 / page" [ref=e316]
                - button [ref=e322] [cursor=pointer]:
                  - img "reload" [ref=e324]
            - button "download Export" [ref=e334] [cursor=pointer]:
              - img "download" [ref=e336]
              - generic [ref=e339]: Export
            - table [ref=e349]:
              - row [ref=e350]:
                - columnheader [ref=e351]
                - columnheader [ref=e352]
                - columnheader [ref=e353]
                - columnheader "First Name" [ref=e354] [cursor=pointer]:
                  - text: First Name
                  - separator [ref=e355]
                - columnheader "Last Name" [ref=e356] [cursor=pointer]:
                  - text: Last Name
                  - separator [ref=e357]
                - columnheader "Mobile Number" [ref=e358] [cursor=pointer]:
                  - text: Mobile Number
                  - separator [ref=e359]
                - columnheader "Email Address" [ref=e360] [cursor=pointer]:
                  - text: Email Address
                  - separator [ref=e361]
              - rowgroup [ref=e362]:
                - row [ref=e363]:
                  - cell [ref=e364]:
                    - link [ref=e365] [cursor=pointer]:
                      - /url: /dynamic/Boxfusion.Dep/customer-details-v1?id=e3127a86-0abb-403b-af18-0029d2978831
                      - img "search" [ref=e366]
                  - cell [ref=e369]:
                    - link [ref=e370] [cursor=pointer]:
                      - /url: /dynamic/Boxfusion.Dep/customer-details-v1?id=e3127a86-0abb-403b-af18-0029d2978831&mode=edit
                      - img "edit" [ref=e371]
                  - cell [ref=e374]:
                    - img "delete" [ref=e376] [cursor=pointer]
                  - cell "jim" [ref=e379]
                  - cell "test" [ref=e380]
                  - cell "123123123" [ref=e381]
                  - cell "test@334.com" [ref=e382]
                - row [ref=e383]:
                  - cell [ref=e384]:
                    - link [ref=e385] [cursor=pointer]:
                      - /url: /dynamic/Boxfusion.Dep/customer-details-v1?id=c552c705-d9f7-43a4-9a92-00472c335b32
                      - img "search" [ref=e386]
                  - cell [ref=e389]:
                    - link [ref=e390] [cursor=pointer]:
                      - /url: /dynamic/Boxfusion.Dep/customer-details-v1?id=c552c705-d9f7-43a4-9a92-00472c335b32&mode=edit
                      - img "edit" [ref=e391]
                  - cell [ref=e394]:
                    - img "delete" [ref=e396] [cursor=pointer]
                  - cell "jim" [ref=e399]
                  - cell "test" [ref=e400]
                  - cell "123123123" [ref=e401]
                  - cell "test@334.com" [ref=e402]
                - row [ref=e403]:
                  - cell [ref=e404]:
                    - link [ref=e405] [cursor=pointer]:
                      - /url: /dynamic/Boxfusion.Dep/customer-details-v1?id=0e19bb2f-b623-44cb-a681-00499c01654f
                      - img "search" [ref=e406]
                  - cell [ref=e409]:
                    - link [ref=e410] [cursor=pointer]:
                      - /url: /dynamic/Boxfusion.Dep/customer-details-v1?id=0e19bb2f-b623-44cb-a681-00499c01654f&mode=edit
                      - img "edit" [ref=e411]
                  - cell [ref=e414]:
                    - img "delete" [ref=e416] [cursor=pointer]
                  - cell "jim" [ref=e419]
                  - cell "test" [ref=e420]
                  - cell "123123123" [ref=e421]
                  - cell "test@334.com" [ref=e422]
                - row [ref=e423]:
                  - cell [ref=e424]:
                    - link [ref=e425] [cursor=pointer]:
                      - /url: /dynamic/Boxfusion.Dep/customer-details-v1?id=de8e3a76-abf8-4de4-a0a1-007bab27ebf1
                      - img "search" [ref=e426]
                  - cell [ref=e429]:
                    - link [ref=e430] [cursor=pointer]:
                      - /url: /dynamic/Boxfusion.Dep/customer-details-v1?id=de8e3a76-abf8-4de4-a0a1-007bab27ebf1&mode=edit
                      - img "edit" [ref=e431]
                  - cell [ref=e434]:
                    - img "delete" [ref=e436] [cursor=pointer]
                  - cell "jim" [ref=e439]
                  - cell "test" [ref=e440]
                  - cell "123123123" [ref=e441]
                  - cell "test@334.com" [ref=e442]
                - row [ref=e443]:
                  - cell [ref=e444]:
                    - link [ref=e445] [cursor=pointer]:
                      - /url: /dynamic/Boxfusion.Dep/customer-details-v1?id=989ae933-0ea0-4d44-a7f3-007c14731ff1
                      - img "search" [ref=e446]
                  - cell [ref=e449]:
                    - link [ref=e450] [cursor=pointer]:
                      - /url: /dynamic/Boxfusion.Dep/customer-details-v1?id=989ae933-0ea0-4d44-a7f3-007c14731ff1&mode=edit
                      - img "edit" [ref=e451]
                  - cell [ref=e454]:
                    - img "delete" [ref=e456] [cursor=pointer]
                  - cell "jim" [ref=e459]
                  - cell "test" [ref=e460]
                  - cell "123123123" [ref=e461]
                  - cell "test@334.com" [ref=e462]
                - row [ref=e463]:
                  - cell [ref=e464]:
                    - link [ref=e465] [cursor=pointer]:
                      - /url: /dynamic/Boxfusion.Dep/customer-details-v1?id=0da7c778-c125-449a-8450-00a605fb8e13
                      - img "search" [ref=e466]
                  - cell [ref=e469]:
                    - link [ref=e470] [cursor=pointer]:
                      - /url: /dynamic/Boxfusion.Dep/customer-details-v1?id=0da7c778-c125-449a-8450-00a605fb8e13&mode=edit
                      - img "edit" [ref=e471]
                  - cell [ref=e474]:
                    - img "delete" [ref=e476] [cursor=pointer]
                  - cell "jim" [ref=e479]
                  - cell "test" [ref=e480]
                  - cell "123123123" [ref=e481]
                  - cell "test@334.com" [ref=e482]
                - row [ref=e483]:
                  - cell [ref=e484]:
                    - link [ref=e485] [cursor=pointer]:
                      - /url: /dynamic/Boxfusion.Dep/customer-details-v1?id=90ab77f6-cbd2-4eea-a13f-00e731f50607
                      - img "search" [ref=e486]
                  - cell [ref=e489]:
                    - link [ref=e490] [cursor=pointer]:
                      - /url: /dynamic/Boxfusion.Dep/customer-details-v1?id=90ab77f6-cbd2-4eea-a13f-00e731f50607&mode=edit
                      - img "edit" [ref=e491]
                  - cell [ref=e494]:
                    - img "delete" [ref=e496] [cursor=pointer]
                  - cell "jim" [ref=e499]
                  - cell "test" [ref=e500]
                  - cell "123123123" [ref=e501]
                  - cell "test@334.com" [ref=e502]
                - row [ref=e503]:
                  - cell [ref=e504]:
                    - link [ref=e505] [cursor=pointer]:
                      - /url: /dynamic/Boxfusion.Dep/customer-details-v1?id=a9d0aa72-8c3a-443c-bba6-00f58c79441d
                      - img "search" [ref=e506]
                  - cell [ref=e509]:
                    - link [ref=e510] [cursor=pointer]:
                      - /url: /dynamic/Boxfusion.Dep/customer-details-v1?id=a9d0aa72-8c3a-443c-bba6-00f58c79441d&mode=edit
                      - img "edit" [ref=e511]
                  - cell [ref=e514]:
                    - img "delete" [ref=e516] [cursor=pointer]
                  - cell "Microsoft" [ref=e519]
                  - cell "Teams" [ref=e520]
                  - cell [ref=e521]
                  - cell "noreply@emeaemail.teams.microsoft.com" [ref=e522]
                - row [ref=e523]:
                  - cell [ref=e524]:
                    - link [ref=e525] [cursor=pointer]:
                      - /url: /dynamic/Boxfusion.Dep/customer-details-v1?id=38f773d4-ea25-4282-9778-011bd6d8f3c9
                      - img "search" [ref=e526]
                  - cell [ref=e529]:
                    - link [ref=e530] [cursor=pointer]:
                      - /url: /dynamic/Boxfusion.Dep/customer-details-v1?id=38f773d4-ea25-4282-9778-011bd6d8f3c9&mode=edit
                      - img "edit" [ref=e531]
                  - cell [ref=e534]:
                    - img "delete" [ref=e536] [cursor=pointer]
                  - cell "jim" [ref=e539]
                  - cell "test" [ref=e540]
                  - cell "123123123" [ref=e541]
                  - cell "test@334.com" [ref=e542]
                - row [ref=e543]:
                  - cell [ref=e544]:
                    - link [ref=e545] [cursor=pointer]:
                      - /url: /dynamic/Boxfusion.Dep/customer-details-v1?id=9ad97b04-7c18-4163-8da8-016299e99c05
                      - img "search" [ref=e546]
                  - cell [ref=e549]:
                    - link [ref=e550] [cursor=pointer]:
                      - /url: /dynamic/Boxfusion.Dep/customer-details-v1?id=9ad97b04-7c18-4163-8da8-016299e99c05&mode=edit
                      - img "edit" [ref=e551]
                  - cell [ref=e554]:
                    - img "delete" [ref=e556] [cursor=pointer]
                  - cell "jim" [ref=e559]
                  - cell "test" [ref=e560]
                  - cell "123123123" [ref=e561]
                  - cell "test@334.com" [ref=e562]
  - generic:
    - generic:
      - generic:
        - tooltip "Customers":
          - link "Customers":
            - /url: /dynamic/Boxfusion.Dep/table-customers
```

# Test source

```ts
  1   | // AUTO-SCAFFOLDED from test-plans/customers/create-customer.md
  2   | // The .md plan is canonical. AI-repair will patch failing lines in this file.
  3   | // Do not hand-edit unless you are also updating the .md plan.
  4   | //
  5   | // NOTE: MCP browser was locked at create time, so Customers-specific selectors
  6   | // could not be recorded live. Login selectors are reused from
  7   | // create-service-request-v2.spec.ts (validated). All other selectors are
  8   | // emitted as `// TODO[selector]:` markers — AI-repair resolves them on first run.
  9   | 
  10  | import { test, expect, Page } from '@playwright/test';
  11  | 
  12  | const APP_URL = 'https://pd-dep-adminportal-test.shesha.app/';
  13  | const ADMIN = { user: 'admin', password: '123qwe' };
  14  | 
  15  | async function loginAsAdmin(page: Page) {
  16  |   await page.goto(APP_URL);
  17  |   await page.getByRole('textbox', { name: 'Username' }).fill(ADMIN.user);
  18  |   await page.getByRole('textbox', { name: 'Password' }).fill(ADMIN.password);
  19  |   await page.getByRole('button', { name: 'Sign In' }).click();
  20  |   await page.waitForLoadState('networkidle');
  21  | }
  22  | 
  23  | test.describe('Create Customer', () => {
  24  |   test('TC-01: Login as Admin', async ({ page }) => {
  25  |     // STEP 1: NAVIGATE to https://linux-dep-adminportal-test.azurewebsites.net/
  26  |     await page.goto(APP_URL);
  27  | 
  28  |     // STEP 2: SNAPSHOT — confirm login form is visible
  29  |     // SNAPSHOT: login form is visible
  30  | 
  31  |     // STEP 3: TYPE username field with `admin`
  32  |     await page.getByRole('textbox', { name: 'Username' }).fill(ADMIN.user);
  33  | 
  34  |     // STEP 4: TYPE password field with `123qwe`
  35  |     await page.getByRole('textbox', { name: 'Password' }).fill(ADMIN.password);
  36  | 
  37  |     // STEP 5: CLICK the login / sign-in button
  38  |     await page.getByRole('button', { name: 'Sign In' }).click();
  39  | 
  40  |     // STEP 6: WAIT for dashboard/home page to load
  41  |     await page.waitForLoadState('networkidle');
  42  | 
  43  |     // ASSERT (BLOCKING) dashboard or home page is visible after login
  44  |     await expect(page).not.toHaveURL(/login/i);
  45  |   });
  46  | 
  47  |   test('TC-02: Navigate to Customers', async ({ page }) => {
  48  |     await loginAsAdmin(page);
  49  | 
  50  |     // STEP 1: SNAPSHOT — confirm dashboard is loaded
  51  |     // SNAPSHOT: dashboard is loaded
  52  | 
  53  |     // STEP 2: CLICK the Customers tab in the navigation bar
  54  |     // TODO[selector]: Customers tab in nav bar — MCP unavailable at create time
  55  |     await page.getByRole('menuitem', { name: /Customers/i }).first().click();
  56  | 
  57  |     // STEP 3: WAIT for the Customers list page to load
  58  |     await page.waitForLoadState('networkidle');
  59  | 
  60  |     // STEP 4: SNAPSHOT — confirm Customers page is visible
  61  |     // SNAPSHOT: Customers page is visible
  62  | 
  63  |     // ASSERT (BLOCKING) Customers page is visible
  64  |     await expect(page).toHaveURL(/customers/i);
  65  |   });
  66  | 
  67  |   test('TC-03: Create a Customer', async ({ page }) => {
  68  |     await loginAsAdmin(page);
  69  |     // TODO[selector]: Customers tab in nav bar — MCP unavailable at create time
  70  |     await page.getByRole('menuitem', { name: /Customers/i }).first().click();
  71  |     await page.waitForLoadState('networkidle');
  72  | 
  73  |     // STEP 1: SNAPSHOT — confirm Customers page is loaded
  74  |     // SNAPSHOT: Customers page is loaded
  75  | 
  76  |     // STEP 2: CLICK the Create button
  77  |     // TODO[selector]: Create button on Customers page — MCP unavailable at create time
> 78  |     await page.getByRole('button', { name: /^Create/i }).first().click();
      |                                                                  ^ Error: locator.click: Test timeout of 90000ms exceeded.
  79  | 
  80  |     // STEP 3: WAIT for the create customer form/dialog to appear
  81  |     // TODO[selector]: create customer dialog — MCP unavailable at create time
  82  |     const dialog = page.getByRole('dialog');
  83  |     await expect(dialog).toBeVisible();
  84  | 
  85  |     // STEP 4: SNAPSHOT — confirm form is open and mandatory fields are visible
  86  |     // SNAPSHOT: form is open with mandatory fields
  87  | 
  88  |     // ASSERT create customer form is visible
  89  |     await expect(dialog).toBeVisible();
  90  | 
  91  |     // STEP 5: TYPE / SELECT each mandatory field on the form with valid values
  92  |     // TODO[selector]: mandatory customer fields — MCP unavailable at create time
  93  |     // AI-repair will replace these with the actual recorded selectors on first run.
  94  |     await dialog.getByRole('textbox').nth(0).fill('Automation Test Customer');
  95  | 
  96  |     // STEP 6: SNAPSHOT — confirm each mandatory field is populated
  97  |     // SNAPSHOT: mandatory fields populated
  98  | 
  99  |     // ASSERT all mandatory fields are populated before submit
  100 |     await expect(dialog.getByRole('textbox').nth(0)).not.toHaveValue('');
  101 | 
  102 |     // STEP 7: CLICK the OK button to submit
  103 |     // TODO[selector]: OK / submit button on customer form — MCP unavailable at create time
  104 |     await dialog.getByRole('button', { name: /^OK$/ }).click();
  105 | 
  106 |     // ASSERT OK button was clicked and form was submitted
  107 |     // (covered by waiting for confirmation below)
  108 | 
  109 |     // STEP 8: WAIT for the success message or customer reference to appear
  110 |     await page.waitForLoadState('networkidle');
  111 | 
  112 |     // STEP 9: SNAPSHOT — confirm success message is visible
  113 |     // SNAPSHOT: success message visible
  114 | 
  115 |     // ASSERT (BLOCKING) success message is visible after submit
  116 |     // TODO[assertion]: success message text/locator — MCP unavailable at create time
  117 |     await expect(dialog).toBeHidden({ timeout: 30_000 });
  118 |   });
  119 | });
  120 | 
```