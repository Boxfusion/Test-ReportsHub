# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: projects/EC-DEDEA-Bid-Management/test-plans/tender-process/ecdedea-tender-process.spec.ts >> ECDEDEA-TP — EC DEDEA Bid Management (Tender Process) >> TC-16: Capture Order Details
- Location: projects/EC-DEDEA-Bid-Management/test-plans/tender-process/ecdedea-tender-process.spec.ts:765:7

# Error details

```
Error: expect(locator).toBeEnabled() failed

Locator:  getByRole('button', { name: 'Submit', exact: true })
Expected: enabled
Received: disabled
Timeout:  15000ms

Call log:
  - Expect "toBeEnabled" getByRole('button', { name: 'Submit', exact: true }) with timeout 15000ms
  - waiting for getByRole('button', { name: 'Submit', exact: true })
    33 × locator resolved to <button title="" disabled type="button" class="ant-btn css-1lo1l9k css-var-Rkq ant-btn-primary sha-toolbar-btn sha-toolbar-btn-configurable">…</button>
       - unexpected value "disabled"

```

```yaml
- button "Submit" [disabled]
```

# Test source

```ts
  713 |     await assertWinnerFlaggedRecommended(page);
  714 | 
  715 |     await page.getByRole('button', { name: /Approve Recommendation/ }).click();
  716 |     const submit = page.getByRole('button', { name: 'Submit', exact: true });
  717 |     await expect(submit).toBeEnabled({ timeout: 15000 });
  718 |     await clickOnceAndAwait(submit, async () => /workflows-(my-items|inbox)/.test(page.url()), 'Capture outcome from the BAC');
  719 |   });
  720 | 
  721 |   test('TC-14: Approve Recommendation from BAC', async ({ page }) => {
  722 |     test.setTimeout(120_000);
  723 |     await loginAs(page, APPROVER);
  724 |     await openInbox(page);
  725 |     await openInboxItem(page, 'Approve Recommendation from BAC');
  726 |     await expectOnPage(page, 'Approve Recommendation from BAC:');
  727 | 
  728 |     await expect(page.getByText('loading...').first()).toBeHidden({ timeout: 30000 });
  729 |     await assertWinnerFlaggedRecommended(page);
  730 | 
  731 |     await checkConfirmation(page, /approve the recomm.*endation from the Bid Adjudication/i);
  732 |     const submit = page.getByRole('button', { name: 'Submit', exact: true });
  733 |     await expect(submit).toBeEnabled({ timeout: 15000 });
  734 |     await clickOnceAndAwait(submit, async () => /workflows-(my-items|inbox)/.test(page.url()), 'Approve Recommendation from BAC');
  735 |   });
  736 | 
  737 |   test('TC-15: Upload Appointment Letter', async ({ page }) => {
  738 |     test.setTimeout(150_000);
  739 |     await loginAs(page, PUBLISHER);
  740 |     await openInbox(page);
  741 |     await openInboxItem(page, 'Upload Appointment letter');
  742 |     await expectOnPage(page, 'Upload Appointment letter:');
  743 |     await expect(page.getByText('Fetching data...').first()).toBeHidden({ timeout: 30000 });
  744 | 
  745 |     await uploadFile(page, page.getByRole('button', { name: /press to upload/i }), PDF_FIXTURE);
  746 |     await expect(page.getByTitle('pdf-test.pdf').first()).toBeVisible({ timeout: 30000 });
  747 | 
  748 |     // Contract Management Unit Email — required AntD select.
  749 |     // TODO[selector]: NOT yet recorded on EC DEDEA — the 2026-07-27 recording pass stopped at TC-09,
  750 |     // so the option list for this build is unverified. Any option satisfies the happy path; pin it
  751 |     // to a named contact once this stage is driven live.
  752 |     await formItem(page, 'Contract Management Unit Email').getByRole('combobox').click();
  753 |     await openOption(page, '').first().click();
  754 | 
  755 |     await checkConfirmation(page, 'appointment letter has been compiled and signed');
  756 |     const submit = page.getByRole('button', { name: 'Submit', exact: true });
  757 |     await expect(submit).toBeEnabled({ timeout: 15000 });
  758 |     await clickOnceAndAwait(submit, async () => {
  759 |       const awarded = await page.getByText('Awarded', { exact: false }).first().isVisible().catch(() => false);
  760 |       const capture = await page.getByText('Capture Order Details', { exact: false }).first().isVisible().catch(() => false);
  761 |       return awarded || capture || /workflows-(my-items|inbox)/.test(page.url());
  762 |     }, 'Upload Appointment letter');
  763 |   });
  764 | 
  765 |   test('TC-16: Capture Order Details', async ({ page }) => {
  766 |     test.setTimeout(150_000);
  767 |     await loginAs(page, PUBLISHER);
  768 |     await openInbox(page);
  769 |     await openInboxItem(page, 'Capture Order Details');
  770 |     await expectOnPage(page, 'Capture Order Details:');
  771 |     await expect(page.getByText('Fetching data...').first()).toBeHidden({ timeout: 30000 });
  772 | 
  773 |     // This Shesha/AntD form is timing-sensitive — a value typed before the field finishes mounting
  774 |     // silently fails to commit and leaves Submit disabled. Fill then VERIFY each field.
  775 |     const poNumber = `PO-${RUN_REF || 'ECDEDEA'}`;
  776 |     const poNo = formItem(page, 'Purchase Order No').getByRole('textbox');
  777 |     await expect(poNo).toBeVisible({ timeout: 30000 });
  778 |     await expect(async () => {
  779 |       await poNo.fill(poNumber);
  780 |       await expect(poNo).toHaveValue(poNumber, { timeout: 3000 });
  781 |     }).toPass({ timeout: 20000 });
  782 | 
  783 |     // Date-only picker — no time panel / OK button.
  784 |     const poDate = formItem(page, 'Purchase Order Date').getByRole('textbox');
  785 |     await expect(async () => {
  786 |       await poDate.click();
  787 |       const dropdown = page.locator('.ant-picker-dropdown:not(.ant-picker-dropdown-hidden)').last();
  788 |       await dropdown.locator('td.ant-picker-cell-today').click();
  789 |       await expect(poDate).not.toHaveValue('', { timeout: 3000 });
  790 |     }).toPass({ timeout: 20000 });
  791 | 
  792 |     const poAmt = formItem(page, 'Purchase Order Amount').getByRole('spinbutton');
  793 |     await expect(async () => {
  794 |       await poAmt.fill('100000');
  795 |       await poAmt.blur();
  796 |       await expect(poAmt).toHaveValue(/100[ ,]?000/, { timeout: 3000 });
  797 |     }).toPass({ timeout: 20000 });
  798 | 
  799 |     // The "press to upload" chooser is flaky on this form; the control is a standard AntD upload
  800 |     // with a hidden <input type="file">, so set that directly and fall back to the chooser.
  801 |     const orderAttach = formItem(page, 'Order Attachment');
  802 |     await expect(async () => {
  803 |       const fileInput = orderAttach.locator('input[type="file"]');
  804 |       if (await fileInput.count()) {
  805 |         await fileInput.setInputFiles(PDF_FIXTURE);
  806 |       } else {
  807 |         await uploadFile(page, orderAttach.getByRole('button', { name: /press to upload/i }), PDF_FIXTURE);
  808 |       }
  809 |       await expect(page.getByTitle('pdf-test.pdf').first()).toBeVisible({ timeout: 8000 });
  810 |     }).toPass({ timeout: 45000 });
  811 | 
  812 |     const submit = page.getByRole('button', { name: 'Submit', exact: true });
> 813 |     await expect(submit).toBeEnabled({ timeout: 15000 });
      |                          ^ Error: expect(locator).toBeEnabled() failed
  814 |     await clickOnceAndAwait(submit, async () => /workflows-(my-items|inbox)/.test(page.url()), 'Capture Order Details');
  815 |   });
  816 | });
  817 | 
```