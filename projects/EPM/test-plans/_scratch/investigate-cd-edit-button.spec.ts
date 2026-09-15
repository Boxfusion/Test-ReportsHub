import { test, expect } from '@playwright/test';
const BASE = 'https://pd-epm-adminportal-qa-wf.shesha.app';
const API = 'https://pd-epm-api-qa-wf.shesha.app';

test('investigate - find real Edit button + edit-mode field structure', async ({ page }) => {
  test.setTimeout(300_000);
  await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('input').first()).toBeVisible({ timeout: 420_000 });
  await page.locator('input').first().fill('admin.PrincessH');
  await page.locator('input[type="password"]').first().fill('123qwe');
  await page.getByRole('button', { name: /sign in|login/i }).first().click();
  await expect(page).not.toHaveURL(/\/login/, { timeout: 420_000 });

  const token = await page.evaluate(() => {
    for (const k of Object.keys(localStorage)) { const v = localStorage.getItem(k); if (v && /^ey[A-Za-z0-9]/.test(v)) return v; }
    return null;
  });
  const auth = { Authorization: `Bearer ${token}` };
  const cdResp = await (await page.request.get(`${API}/api/dynamic/Epm/ComponentDefinition/Crud/GetAll?maxResultCount=5`, { headers: auth })).json();
  const sample = cdResp?.result?.items?.find((c:any) => c.name);

  await page.goto(`${BASE}/dynamic/Epm/component-definition-details-view?id=${sample.id}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(6000);

  const allButtons = page.locator('.ant-btn');
  const btnCount = await allButtons.count();
  for (let i = 0; i < btnCount; i++) {
    const text = await allButtons.nth(i).innerText().catch(() => '');
    console.log(`  btn[${i}]: "${text}"`);
  }

  const editBtn = page.locator('.ant-btn').filter({ hasText: /^Edit$/ }).first();
  await editBtn.click({ force: true });
  await page.waitForTimeout(3000);
  const editText = await page.locator('body').innerText().catch(() => '');
  console.log(`AFTER EDIT CLICK: ${editText.slice(0, 2000)}`);

  const inputs = page.getByRole('textbox');
  const inputCount = await inputs.count();
  console.log(`TEXTBOX COUNT: ${inputCount}`);
  for (let i = 0; i < inputCount; i++) {
    const val = await inputs.nth(i).inputValue().catch(() => 'ERR');
    console.log(`  textbox[${i}] value="${val}"`);
  }
});
