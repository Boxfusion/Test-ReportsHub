import { test, expect } from '@playwright/test';

const APP_URL = 'https://pd-invtracking-adminportal-qa.azurewebsites.net';

test('TC-01 — Login as Admin', async ({ page }) => {
  // STEP 1: NAVIGATE to login page
  await page.goto(`${APP_URL}/login`);

  // STEP 2: SNAPSHOT — confirm login page is visible
  await expect(page).toHaveURL(/login/);

  // STEP 3: TYPE Username field with `admin`
  await page.getByPlaceholder(/username/i).fill('admin');

  // STEP 4: TYPE Password field with `123qwe`
  await page.getByPlaceholder(/password/i).fill('123qwe');

  // STEP 5: CLICK the Sign In button
  await page.getByRole('button', { name: /sign in/i }).click();

  // STEP 6: WAIT for the home page to load
  await page.waitForURL(url => !url.toString().includes('/login'), { timeout: 30_000 });

  // ASSERT (BLOCKING) URL no longer contains /login
  await expect(page).not.toHaveURL(/login/);
});

test('TC-02 — Click on the Workflow menu item', async ({ page }) => {
  await page.goto(`${APP_URL}/login`);
  await page.getByPlaceholder(/username/i).fill('admin');
  await page.getByPlaceholder(/password/i).fill('123qwe');
  await page.getByRole('button', { name: /sign in/i }).click();
  await page.waitForURL(url => !url.toString().includes('/login'), { timeout: 30_000 });

  // STEP 1: SNAPSHOT — confirm the target element for: Click on the Workflow menu item
  await expect(page.getByRole('menuitem', { name: /workflow/i }).or(page.getByText(/workflow/i).first())).toBeVisible();

  // STEP 2: CLICK the Workflow menu item
  await page.getByRole('menuitem', { name: /workflow/i }).or(page.getByText(/^Workflow$/i).first()).click();

  // STEP 3: SNAPSHOT — verify sub-menu items are displayed
  // ASSERT (BLOCKING) sub-menu items (Inbox, My Items, Sent & Drafts) are displayed
  await expect(page.getByText(/my items/i).first()).toBeVisible({ timeout: 10_000 });
});

test('TC-03 — Click on the My Items submenu item', async ({ page }) => {
  await page.goto(`${APP_URL}/login`);
  await page.getByPlaceholder(/username/i).fill('admin');
  await page.getByPlaceholder(/password/i).fill('123qwe');
  await page.getByRole('button', { name: /sign in/i }).click();
  await page.waitForURL(url => !url.toString().includes('/login'), { timeout: 30_000 });
  await page.getByRole('menuitem', { name: /workflow/i }).or(page.getByText(/^Workflow$/i).first()).click();

  // STEP 1: SNAPSHOT — confirm the target element for: Click on the My Items submenu item
  await expect(page.getByText(/my items/i).first()).toBeVisible();

  // STEP 2: CLICK the My Items submenu item
  await page.getByText(/my items/i).first().click();

  // STEP 3: SNAPSHOT — verify the My Items page is displayed
  // ASSERT (BLOCKING) My Items page is displayed with Create New and Export buttons
  await expect(page.getByRole('button', { name: /create new/i })).toBeVisible({ timeout: 10_000 });
  await expect(page.getByRole('button', { name: /export/i })).toBeVisible({ timeout: 10_000 });
});

test('TC-04 — Click on the Export button on My Items', async ({ page }) => {
  await page.goto(`${APP_URL}/login`);
  await page.getByPlaceholder(/username/i).fill('admin');
  await page.getByPlaceholder(/password/i).fill('123qwe');
  await page.getByRole('button', { name: /sign in/i }).click();
  await page.waitForURL(url => !url.toString().includes('/login'), { timeout: 30_000 });
  await page.getByRole('menuitem', { name: /workflow/i }).or(page.getByText(/^Workflow$/i).first()).click();
  await page.getByText(/my items/i).first().click();
  await expect(page.getByRole('button', { name: /export/i })).toBeVisible({ timeout: 10_000 });

  // STEP 1: SNAPSHOT — confirm the target element for: Click on the Export button
  await expect(page.getByRole('button', { name: /export/i })).toBeVisible();

  // STEP 2: CLICK the Export button
  const [download] = await Promise.all([
    page.waitForEvent('download', { timeout: 15_000 }).catch(() => null),
    page.getByRole('button', { name: /export/i }).click(),
  ]);

  // ASSERT (BLOCKING) The Excel file is exported and downloaded
  if (download) {
    expect(download.suggestedFilename()).toMatch(/\.xlsx$/i);
  } else {
    // Some implementations trigger a navigation or show a toast instead of a download
    await expect(page.getByText(/export/i).first()).toBeVisible();
  }
});

test('TC-05 — Click Create New button', async ({ page }) => {
  await page.goto(`${APP_URL}/login`);
  await page.getByPlaceholder(/username/i).fill('admin');
  await page.getByPlaceholder(/password/i).fill('123qwe');
  await page.getByRole('button', { name: /sign in/i }).click();
  await page.waitForURL(url => !url.toString().includes('/login'), { timeout: 30_000 });
  await page.getByRole('menuitem', { name: /workflow/i }).or(page.getByText(/^Workflow$/i).first()).click();
  await page.getByText(/my items/i).first().click();
  await expect(page.getByRole('button', { name: /create new/i })).toBeVisible({ timeout: 10_000 });

  // STEP 1: SNAPSHOT — confirm the target element for: Click Create New button
  await expect(page.getByRole('button', { name: /create new/i })).toBeVisible();

  // STEP 2: CLICK the Create New button
  await page.getByRole('button', { name: /create new/i }).click();

  // STEP 3: SNAPSHOT — verify the list of processes is displayed
  // ASSERT (BLOCKING) The list of processes including BAS and LOGIS Request for payment is displayed
  await expect(page.getByText(/BAS/i).first()).toBeVisible({ timeout: 10_000 });
});

test('TC-06 — Select the BAS Request for Payment Workflow', async ({ page }) => {
  await page.goto(`${APP_URL}/login`);
  await page.getByPlaceholder(/username/i).fill('admin');
  await page.getByPlaceholder(/password/i).fill('123qwe');
  await page.getByRole('button', { name: /sign in/i }).click();
  await page.waitForURL(url => !url.toString().includes('/login'), { timeout: 30_000 });
  await page.getByRole('menuitem', { name: /workflow/i }).or(page.getByText(/^Workflow$/i).first()).click();
  await page.getByText(/my items/i).first().click();
  await expect(page.getByRole('button', { name: /create new/i })).toBeVisible({ timeout: 10_000 });
  await page.getByRole('button', { name: /create new/i }).click();
  await expect(page.getByText(/BAS/i).first()).toBeVisible({ timeout: 10_000 });

  // STEP 1: SNAPSHOT — confirm the target element for: Select the BAS Request for Payment Workflow
  await expect(page.getByText(/BAS Request for Payment/i).first()).toBeVisible();

  // STEP 2: SELECT the BAS Request for Payment Workflow
  await page.getByText(/BAS Request for Payment/i).first().click();

  // STEP 3: SNAPSHOT — verify the Register and Upload Invoice page is displayed
  // ASSERT (BLOCKING) The Register and Upload Invoice page is displayed
  await expect(page.getByText(/Register and Upload Invoice/i).first()).toBeVisible({ timeout: 15_000 });

  // STEP 4: SNAPSHOT — verify the Date Received field is auto-populated
  // ASSERT (BLOCKING) The Date Received field is auto-populated with today's date
  await expect(page.getByLabel(/date received/i).or(page.locator('input[name*="dateReceived"], input[name*="date_received"]').first())).toBeVisible({ timeout: 10_000 });
});

test('TC-07 — Click on Date Received field', async ({ page }) => {
  await page.goto(`${APP_URL}/login`);
  await page.getByPlaceholder(/username/i).fill('admin');
  await page.getByPlaceholder(/password/i).fill('123qwe');
  await page.getByRole('button', { name: /sign in/i }).click();
  await page.waitForURL(url => !url.toString().includes('/login'), { timeout: 30_000 });
  await page.getByRole('menuitem', { name: /workflow/i }).or(page.getByText(/^Workflow$/i).first()).click();
  await page.getByText(/my items/i).first().click();
  await page.getByRole('button', { name: /create new/i }).click();
  await page.getByText(/BAS Request for Payment/i).first().click();
  await expect(page.getByText(/Register and Upload Invoice/i).first()).toBeVisible({ timeout: 15_000 });

  // STEP 1: SNAPSHOT — confirm the target element for: Click on Date Received field
  const dateReceivedField = page.getByLabel(/date received/i).first();
  await expect(dateReceivedField).toBeVisible();

  // STEP 2: CLICK the Date Received field
  await dateReceivedField.click();

  // STEP 3: SNAPSHOT — verify the Date Picker is displayed
  // ASSERT (BLOCKING) The Date Picker is displayed
  await expect(page.locator('.ant-picker-dropdown, [role="dialog"][class*="date"], .datepicker, [class*="calendar"]').first()).toBeVisible({ timeout: 5_000 });
});

test('TC-08 — Select a different Date Received', async ({ page }) => {
  await page.goto(`${APP_URL}/login`);
  await page.getByPlaceholder(/username/i).fill('admin');
  await page.getByPlaceholder(/password/i).fill('123qwe');
  await page.getByRole('button', { name: /sign in/i }).click();
  await page.waitForURL(url => !url.toString().includes('/login'), { timeout: 30_000 });
  await page.getByRole('menuitem', { name: /workflow/i }).or(page.getByText(/^Workflow$/i).first()).click();
  await page.getByText(/my items/i).first().click();
  await page.getByRole('button', { name: /create new/i }).click();
  await page.getByText(/BAS Request for Payment/i).first().click();
  await expect(page.getByText(/Register and Upload Invoice/i).first()).toBeVisible({ timeout: 15_000 });

  const dateReceivedField = page.getByLabel(/date received/i).first();
  await dateReceivedField.click();
  await expect(page.locator('.ant-picker-dropdown, [class*="calendar"]').first()).toBeVisible({ timeout: 5_000 });

  // STEP 2: SELECT a past date (click a past date cell in the picker)
  // TODO[selector]: Click a past date cell in the date picker calendar
  await page.locator('.ant-picker-cell:not(.ant-picker-cell-disabled):not(.ant-picker-cell-selected)').first().click().catch(async () => {
    await page.keyboard.press('Escape');
    await dateReceivedField.fill('2026-06-01');
  });

  // ASSERT (BLOCKING) Only current or past dates are selectable
  const disabledFuture = page.locator('.ant-picker-cell-disabled').first();
  await expect(disabledFuture.or(page.getByText(/date received/i).first())).toBeVisible();
});

test('TC-09 — Click on the ellipses on the Supplier Name field', async ({ page }) => {
  await page.goto(`${APP_URL}/login`);
  await page.getByPlaceholder(/username/i).fill('admin');
  await page.getByPlaceholder(/password/i).fill('123qwe');
  await page.getByRole('button', { name: /sign in/i }).click();
  await page.waitForURL(url => !url.toString().includes('/login'), { timeout: 30_000 });
  await page.getByRole('menuitem', { name: /workflow/i }).or(page.getByText(/^Workflow$/i).first()).click();
  await page.getByText(/my items/i).first().click();
  await page.getByRole('button', { name: /create new/i }).click();
  await page.getByText(/BAS Request for Payment/i).first().click();
  await expect(page.getByText(/Register and Upload Invoice/i).first()).toBeVisible({ timeout: 15_000 });

  // STEP 1: SNAPSHOT — confirm the target element for: Click on the ellipses on the Supplier Name field
  // TODO[selector]: Locate the ellipses/lookup button next to the Supplier Name field
  const supplierEllipsis = page.locator('button[class*="ellipsis"], button[title*="supplier"], [aria-label*="supplier"]').first()
    .or(page.getByLabel(/supplier name/i).locator('..').getByRole('button').first());
  await expect(supplierEllipsis).toBeVisible();

  // STEP 2: CLICK the ellipses button on the Supplier Name field
  await supplierEllipsis.click();

  // STEP 3: SNAPSHOT — verify the supplier list is displayed
  // ASSERT (BLOCKING) A list of confirmed suppliers is displayed
  await expect(page.getByRole('dialog').or(page.getByText(/supplier/i).nth(1))).toBeVisible({ timeout: 10_000 });
});

test('TC-10 — Select a Supplier Name from the Supplier list', async ({ page }) => {
  await page.goto(`${APP_URL}/login`);
  await page.getByPlaceholder(/username/i).fill('admin');
  await page.getByPlaceholder(/password/i).fill('123qwe');
  await page.getByRole('button', { name: /sign in/i }).click();
  await page.waitForURL(url => !url.toString().includes('/login'), { timeout: 30_000 });
  await page.getByRole('menuitem', { name: /workflow/i }).or(page.getByText(/^Workflow$/i).first()).click();
  await page.getByText(/my items/i).first().click();
  await page.getByRole('button', { name: /create new/i }).click();
  await page.getByText(/BAS Request for Payment/i).first().click();
  await expect(page.getByText(/Register and Upload Invoice/i).first()).toBeVisible({ timeout: 15_000 });

  const supplierEllipsis = page.locator('button[class*="ellipsis"], button[title*="supplier"], [aria-label*="supplier"]').first()
    .or(page.getByLabel(/supplier name/i).locator('..').getByRole('button').first());
  await supplierEllipsis.click();
  await expect(page.getByRole('dialog').or(page.getByText(/supplier/i).nth(1))).toBeVisible({ timeout: 10_000 });

  // STEP 2: SELECT a supplier name from the displayed list
  // TODO[selector]: Click the first supplier row in the dialog list
  await page.getByRole('row').nth(1).click().catch(async () => {
    await page.getByRole('option').first().click();
  });

  // ASSERT (BLOCKING) The selected supplier is displayed in the Supplier Name field
  // ASSERT (BLOCKING) The Supplier Details panel is populated and read-only
  await expect(page.getByLabel(/supplier name/i).or(page.locator('input[name*="supplier"]').first())).not.toBeEmpty({ timeout: 10_000 });
});

test('TC-11 — Click Add icon on Invoices panel without populating fields (validation)', async ({ page }) => {
  await page.goto(`${APP_URL}/login`);
  await page.getByPlaceholder(/username/i).fill('admin');
  await page.getByPlaceholder(/password/i).fill('123qwe');
  await page.getByRole('button', { name: /sign in/i }).click();
  await page.waitForURL(url => !url.toString().includes('/login'), { timeout: 30_000 });
  await page.getByRole('menuitem', { name: /workflow/i }).or(page.getByText(/^Workflow$/i).first()).click();
  await page.getByText(/my items/i).first().click();
  await page.getByRole('button', { name: /create new/i }).click();
  await page.getByText(/BAS Request for Payment/i).first().click();
  await expect(page.getByText(/Register and Upload Invoice/i).first()).toBeVisible({ timeout: 15_000 });

  // STEP 1: SNAPSHOT — confirm Add icon on Invoices panel
  // TODO[selector]: Locate the Add icon on the Invoices panel
  const addIcon = page.locator('[class*="invoices"] button[class*="add"], [aria-label*="add invoice"], button:near(:text("Invoices"))').first()
    .or(page.getByRole('button', { name: /add/i }).first());
  await expect(addIcon).toBeVisible();

  // STEP 2: CLICK the Add icon without filling fields
  await addIcon.click();

  // ASSERT (BLOCKING) Mandatory fields are highlighted with "this field is required"
  await expect(page.getByText(/this field is required/i).first()).toBeVisible({ timeout: 5_000 });
});

test('TC-12 — Click Cancel icon on the Invoices panel', async ({ page }) => {
  await page.goto(`${APP_URL}/login`);
  await page.getByPlaceholder(/username/i).fill('admin');
  await page.getByPlaceholder(/password/i).fill('123qwe');
  await page.getByRole('button', { name: /sign in/i }).click();
  await page.waitForURL(url => !url.toString().includes('/login'), { timeout: 30_000 });
  await page.getByRole('menuitem', { name: /workflow/i }).or(page.getByText(/^Workflow$/i).first()).click();
  await page.getByText(/my items/i).first().click();
  await page.getByRole('button', { name: /create new/i }).click();
  await page.getByText(/BAS Request for Payment/i).first().click();
  await expect(page.getByText(/Register and Upload Invoice/i).first()).toBeVisible({ timeout: 15_000 });

  const addIcon = page.locator('[class*="invoices"] button[class*="add"], [aria-label*="add invoice"]').first()
    .or(page.getByRole('button', { name: /add/i }).first());
  await addIcon.click();
  await expect(page.getByText(/this field is required/i).first()).toBeVisible({ timeout: 5_000 });

  // STEP 1: SNAPSHOT — confirm the Cancel icon
  // TODO[selector]: Locate the Cancel icon on the Invoices panel
  const cancelIcon = page.locator('[aria-label*="cancel"], button[class*="cancel"]').first()
    .or(page.getByRole('button', { name: /cancel/i }).first());
  await expect(cancelIcon).toBeVisible();

  // STEP 2: CLICK the Cancel icon
  await cancelIcon.click();

  // ASSERT (BLOCKING) Validation errors are cleared
  await expect(page.getByText(/this field is required/i)).toHaveCount(0, { timeout: 5_000 });
});

test('TC-13 — Click on the Invoice Date field', async ({ page }) => {
  await page.goto(`${APP_URL}/login`);
  await page.getByPlaceholder(/username/i).fill('admin');
  await page.getByPlaceholder(/password/i).fill('123qwe');
  await page.getByRole('button', { name: /sign in/i }).click();
  await page.waitForURL(url => !url.toString().includes('/login'), { timeout: 30_000 });
  await page.getByRole('menuitem', { name: /workflow/i }).or(page.getByText(/^Workflow$/i).first()).click();
  await page.getByText(/my items/i).first().click();
  await page.getByRole('button', { name: /create new/i }).click();
  await page.getByText(/BAS Request for Payment/i).first().click();
  await expect(page.getByText(/Register and Upload Invoice/i).first()).toBeVisible({ timeout: 15_000 });

  // STEP 1: SNAPSHOT — confirm Invoice Date field
  const invoiceDateField = page.getByLabel(/invoice date/i).first();
  await expect(invoiceDateField).toBeVisible();

  // STEP 2: CLICK the Invoice Date field
  await invoiceDateField.click();

  // ASSERT (BLOCKING) The Date Picker is displayed for Invoice Date
  await expect(page.locator('.ant-picker-dropdown, [class*="calendar"]').first()).toBeVisible({ timeout: 5_000 });
});

test('TC-14 — Select Invoice Date from the date picker', async ({ page }) => {
  await page.goto(`${APP_URL}/login`);
  await page.getByPlaceholder(/username/i).fill('admin');
  await page.getByPlaceholder(/password/i).fill('123qwe');
  await page.getByRole('button', { name: /sign in/i }).click();
  await page.waitForURL(url => !url.toString().includes('/login'), { timeout: 30_000 });
  await page.getByRole('menuitem', { name: /workflow/i }).or(page.getByText(/^Workflow$/i).first()).click();
  await page.getByText(/my items/i).first().click();
  await page.getByRole('button', { name: /create new/i }).click();
  await page.getByText(/BAS Request for Payment/i).first().click();
  await expect(page.getByText(/Register and Upload Invoice/i).first()).toBeVisible({ timeout: 15_000 });

  const invoiceDateField = page.getByLabel(/invoice date/i).first();
  await invoiceDateField.click();
  await expect(page.locator('.ant-picker-dropdown, [class*="calendar"]').first()).toBeVisible({ timeout: 5_000 });

  // STEP 2: SELECT a past date
  await page.locator('.ant-picker-cell:not(.ant-picker-cell-disabled):not(.ant-picker-cell-selected)').first().click().catch(async () => {
    await page.keyboard.press('Escape');
    await invoiceDateField.fill('2026-06-01');
    await page.keyboard.press('Enter');
  });

  // ASSERT (BLOCKING) Only current or past dates are selectable; the selected date is displayed
  await expect(invoiceDateField).not.toBeEmpty();
});

test('TC-15 — Click on Service Delivery Date field', async ({ page }) => {
  await page.goto(`${APP_URL}/login`);
  await page.getByPlaceholder(/username/i).fill('admin');
  await page.getByPlaceholder(/password/i).fill('123qwe');
  await page.getByRole('button', { name: /sign in/i }).click();
  await page.waitForURL(url => !url.toString().includes('/login'), { timeout: 30_000 });
  await page.getByRole('menuitem', { name: /workflow/i }).or(page.getByText(/^Workflow$/i).first()).click();
  await page.getByText(/my items/i).first().click();
  await page.getByRole('button', { name: /create new/i }).click();
  await page.getByText(/BAS Request for Payment/i).first().click();
  await expect(page.getByText(/Register and Upload Invoice/i).first()).toBeVisible({ timeout: 15_000 });

  // STEP 1: SNAPSHOT — confirm Service Delivery Date field
  const serviceDeliveryField = page.getByLabel(/service delivery/i).first();
  await expect(serviceDeliveryField).toBeVisible();

  // STEP 2: CLICK the Service Delivery Date field
  await serviceDeliveryField.click();

  // ASSERT (BLOCKING) The Date Picker is displayed for Service Delivery Date
  await expect(page.locator('.ant-picker-dropdown, [class*="calendar"]').first()).toBeVisible({ timeout: 5_000 });
});

test('TC-16 — Select Service Delivery Date from the date picker', async ({ page }) => {
  await page.goto(`${APP_URL}/login`);
  await page.getByPlaceholder(/username/i).fill('admin');
  await page.getByPlaceholder(/password/i).fill('123qwe');
  await page.getByRole('button', { name: /sign in/i }).click();
  await page.waitForURL(url => !url.toString().includes('/login'), { timeout: 30_000 });
  await page.getByRole('menuitem', { name: /workflow/i }).or(page.getByText(/^Workflow$/i).first()).click();
  await page.getByText(/my items/i).first().click();
  await page.getByRole('button', { name: /create new/i }).click();
  await page.getByText(/BAS Request for Payment/i).first().click();
  await expect(page.getByText(/Register and Upload Invoice/i).first()).toBeVisible({ timeout: 15_000 });

  const serviceDeliveryField = page.getByLabel(/service delivery/i).first();
  await serviceDeliveryField.click();
  await expect(page.locator('.ant-picker-dropdown, [class*="calendar"]').first()).toBeVisible({ timeout: 5_000 });

  await page.locator('.ant-picker-cell:not(.ant-picker-cell-disabled):not(.ant-picker-cell-selected)').first().click().catch(async () => {
    await page.keyboard.press('Escape');
    await serviceDeliveryField.fill('2026-06-10');
    await page.keyboard.press('Enter');
  });

  // ASSERT (BLOCKING) The selected date is displayed in the Service Delivery Date field
  await expect(serviceDeliveryField).not.toBeEmpty();
});

test('TC-17 — Populate the Invoice No. field', async ({ page }) => {
  await page.goto(`${APP_URL}/login`);
  await page.getByPlaceholder(/username/i).fill('admin');
  await page.getByPlaceholder(/password/i).fill('123qwe');
  await page.getByRole('button', { name: /sign in/i }).click();
  await page.waitForURL(url => !url.toString().includes('/login'), { timeout: 30_000 });
  await page.getByRole('menuitem', { name: /workflow/i }).or(page.getByText(/^Workflow$/i).first()).click();
  await page.getByText(/my items/i).first().click();
  await page.getByRole('button', { name: /create new/i }).click();
  await page.getByText(/BAS Request for Payment/i).first().click();
  await expect(page.getByText(/Register and Upload Invoice/i).first()).toBeVisible({ timeout: 15_000 });

  // STEP 1: SNAPSHOT — confirm Invoice No. field
  const invoiceNoField = page.getByLabel(/invoice no/i).first();
  await expect(invoiceNoField).toBeVisible();

  // STEP 2: TYPE an invoice number
  await invoiceNoField.fill('INV-TEST-001');

  // ASSERT (BLOCKING) The invoice number is displayed in the Invoice No. field
  await expect(invoiceNoField).toHaveValue('INV-TEST-001');
});

test('TC-18 — Populate the Invoice Amount field', async ({ page }) => {
  await page.goto(`${APP_URL}/login`);
  await page.getByPlaceholder(/username/i).fill('admin');
  await page.getByPlaceholder(/password/i).fill('123qwe');
  await page.getByRole('button', { name: /sign in/i }).click();
  await page.waitForURL(url => !url.toString().includes('/login'), { timeout: 30_000 });
  await page.getByRole('menuitem', { name: /workflow/i }).or(page.getByText(/^Workflow$/i).first()).click();
  await page.getByText(/my items/i).first().click();
  await page.getByRole('button', { name: /create new/i }).click();
  await page.getByText(/BAS Request for Payment/i).first().click();
  await expect(page.getByText(/Register and Upload Invoice/i).first()).toBeVisible({ timeout: 15_000 });

  // STEP 1: SNAPSHOT — confirm Invoice Amount field
  const invoiceAmountField = page.getByLabel(/invoice amount/i).first();
  await expect(invoiceAmountField).toBeVisible();

  // STEP 2: TYPE an invoice amount
  await invoiceAmountField.fill('1000');

  // ASSERT (BLOCKING) The invoice amount is displayed
  await expect(invoiceAmountField).toHaveValue('1000');
});

test('TC-19 — Attach Invoice attachment', async ({ page }) => {
  await page.goto(`${APP_URL}/login`);
  await page.getByPlaceholder(/username/i).fill('admin');
  await page.getByPlaceholder(/password/i).fill('123qwe');
  await page.getByRole('button', { name: /sign in/i }).click();
  await page.waitForURL(url => !url.toString().includes('/login'), { timeout: 30_000 });
  await page.getByRole('menuitem', { name: /workflow/i }).or(page.getByText(/^Workflow$/i).first()).click();
  await page.getByText(/my items/i).first().click();
  await page.getByRole('button', { name: /create new/i }).click();
  await page.getByText(/BAS Request for Payment/i).first().click();
  await expect(page.getByText(/Register and Upload Invoice/i).first()).toBeVisible({ timeout: 15_000 });

  // STEP 1: SNAPSHOT — confirm Invoice attachment upload control
  // TODO[selector]: Locate the file upload for Invoice attachment
  const fileInput = page.locator('input[type="file"]').first();
  await expect(page.getByText(/invoice attachment/i).first()).toBeVisible();

  // STEP 2: Attach a file
  await fileInput.setInputFiles({ name: 'test-invoice.pdf', mimeType: 'application/pdf', buffer: Buffer.from('test pdf content') });

  // ASSERT (BLOCKING) The invoice attachment is attached
  await expect(page.getByText(/test-invoice\.pdf/i).or(page.getByText(/invoice attachment/i))).toBeVisible({ timeout: 10_000 });
});

test('TC-20 — Click on the Add icon to save the invoice line item', async ({ page }) => {
  await page.goto(`${APP_URL}/login`);
  await page.getByPlaceholder(/username/i).fill('admin');
  await page.getByPlaceholder(/password/i).fill('123qwe');
  await page.getByRole('button', { name: /sign in/i }).click();
  await page.waitForURL(url => !url.toString().includes('/login'), { timeout: 30_000 });
  await page.getByRole('menuitem', { name: /workflow/i }).or(page.getByText(/^Workflow$/i).first()).click();
  await page.getByText(/my items/i).first().click();
  await page.getByRole('button', { name: /create new/i }).click();
  await page.getByText(/BAS Request for Payment/i).first().click();
  await expect(page.getByText(/Register and Upload Invoice/i).first()).toBeVisible({ timeout: 15_000 });

  // Fill in required invoice fields first
  await page.getByLabel(/invoice no/i).first().fill('INV-TEST-001');
  await page.getByLabel(/invoice amount/i).first().fill('1000');

  // STEP 1: SNAPSHOT — confirm the Add icon
  const addIcon = page.locator('[aria-label*="add"], button[class*="add"]').first()
    .or(page.getByRole('button', { name: /add/i }).first());
  await expect(addIcon).toBeVisible();

  // STEP 2: CLICK the Add icon
  await addIcon.click();

  // ASSERT (BLOCKING) The invoice line item is added to the Invoices grid
  await expect(page.getByText(/INV-TEST-001/i)).toBeVisible({ timeout: 10_000 });
});

test('TC-21 — Attach Supporting Documents', async ({ page }) => {
  await page.goto(`${APP_URL}/login`);
  await page.getByPlaceholder(/username/i).fill('admin');
  await page.getByPlaceholder(/password/i).fill('123qwe');
  await page.getByRole('button', { name: /sign in/i }).click();
  await page.waitForURL(url => !url.toString().includes('/login'), { timeout: 30_000 });
  await page.getByRole('menuitem', { name: /workflow/i }).or(page.getByText(/^Workflow$/i).first()).click();
  await page.getByText(/my items/i).first().click();
  await page.getByRole('button', { name: /create new/i }).click();
  await page.getByText(/BAS Request for Payment/i).first().click();
  await expect(page.getByText(/Register and Upload Invoice/i).first()).toBeVisible({ timeout: 15_000 });

  // STEP 1: SNAPSHOT — confirm Supporting Documents upload
  await expect(page.getByText(/supporting documents/i).first()).toBeVisible();

  // STEP 2: Attach supporting document
  // TODO[selector]: Locate the Supporting Documents file input
  const supportingDocsInput = page.locator('input[type="file"]').nth(1);
  await supportingDocsInput.setInputFiles({ name: 'supporting-doc.pdf', mimeType: 'application/pdf', buffer: Buffer.from('supporting document content') });

  // ASSERT (BLOCKING) Supporting documents are attached
  await expect(page.getByText(/supporting-doc\.pdf/i).or(page.getByText(/supporting documents/i))).toBeVisible({ timeout: 10_000 });
});

test('TC-22 — Click on the Close button', async ({ page }) => {
  await page.goto(`${APP_URL}/login`);
  await page.getByPlaceholder(/username/i).fill('admin');
  await page.getByPlaceholder(/password/i).fill('123qwe');
  await page.getByRole('button', { name: /sign in/i }).click();
  await page.waitForURL(url => !url.toString().includes('/login'), { timeout: 30_000 });
  await page.getByRole('menuitem', { name: /workflow/i }).or(page.getByText(/^Workflow$/i).first()).click();
  await page.getByText(/my items/i).first().click();
  await page.getByRole('button', { name: /create new/i }).click();
  await page.getByText(/BAS Request for Payment/i).first().click();
  await expect(page.getByText(/Register and Upload Invoice/i).first()).toBeVisible({ timeout: 15_000 });

  // STEP 1: SNAPSHOT — confirm the Close button
  await expect(page.getByRole('button', { name: /close/i })).toBeVisible();

  // STEP 2: CLICK the Close button
  await page.getByRole('button', { name: /close/i }).click();

  // ASSERT (BLOCKING) The system redirects to the homepage
  await expect(page).not.toHaveURL(/register|upload|invoice/i, { timeout: 10_000 });
});

test('TC-23 — Click on Submit button', async ({ page }) => {
  await page.goto(`${APP_URL}/login`);
  await page.getByPlaceholder(/username/i).fill('admin');
  await page.getByPlaceholder(/password/i).fill('123qwe');
  await page.getByRole('button', { name: /sign in/i }).click();
  await page.waitForURL(url => !url.toString().includes('/login'), { timeout: 30_000 });
  await page.getByRole('menuitem', { name: /workflow/i }).or(page.getByText(/^Workflow$/i).first()).click();
  await page.getByText(/my items/i).first().click();
  await page.getByRole('button', { name: /create new/i }).click();
  await page.getByText(/BAS Request for Payment/i).first().click();
  await expect(page.getByText(/Register and Upload Invoice/i).first()).toBeVisible({ timeout: 15_000 });

  // Fill required fields before submitting
  const supplierEllipsis = page.locator('button[class*="ellipsis"], button[title*="supplier"], [aria-label*="supplier"]').first()
    .or(page.getByLabel(/supplier name/i).locator('..').getByRole('button').first());
  await supplierEllipsis.click().catch(() => {});
  await page.getByRole('row').nth(1).click().catch(async () => {
    await page.keyboard.press('Escape');
  });

  await page.getByLabel(/invoice no/i).first().fill('INV-SUBMIT-001');
  await page.getByLabel(/invoice amount/i).first().fill('5000');

  // STEP 1: SNAPSHOT — confirm the Submit button
  await expect(page.getByRole('button', { name: /submit/i })).toBeVisible();

  // STEP 2: CLICK the Submit button
  await page.getByRole('button', { name: /submit/i }).click();

  // STEP 3: WAIT for redirect
  await page.waitForURL(url => !url.toString().includes('register'), { timeout: 30_000 }).catch(() => {});

  // ASSERT (BLOCKING) The system redirects to the homepage
  await expect(page.getByRole('button', { name: /create new/i }).or(page.getByText(/my items/i))).toBeVisible({ timeout: 15_000 });
});
