# Bug: Recalculate Family Leave Balances shows no confirmation dialog

- **Plan:** projects/HCM/test-plans/eLeave/leave-balances-administration.md
- **Failing TC:** TC-05 — Display confirmation dialog when 'Recalculate Family Leave Balances' button is clicked
- **Step:** CLICK Click on the 'Recalculate Family Leave Balances' button (SaGov Leave Balances page, /dynamic/SaGov.Leave/sagov-personal-balances)
- **Expected:** Clicking 'Recalculate Family Leave Balances' displays a confirmation dialog
- **Actual:** No dialog / modal / popconfirm / toast appears; a console error is logged on click. No confirmation surface is rendered.
- **Suspected category:** business-logic
- **Playwright error:**
```
expect(locator).toBeVisible() failed
Locator: locator('[role="dialog"], .ant-modal, .ant-modal-confirm, .ant-popover').first()
Error: element(s) not found (timeout 15000ms)
```
- **Snapshot / screenshot:** projects/HCM/test-results/artifacts/projects-HCM-test-plans-eL-25c04--Balances-button-is-clicked-chromium/test-failed-1.png
- **Suspected cause:** The Recalculate action either fails silently (backend request errors — see console error) or the confirmation dialog component is not wired up on the SaGov Leave Balances page. Needs dev triage.
