# Bug: Approve Without Pay TC-03 times out intermittently on QA

- **Plan**: `test-plans/HCM/eLeave/approve-without-pay-dialog.md`
- **Failing TC**: `TC-03 — Approver can approve a leave application Without Pay from the Workflows Inbox`
- **Step**: varies per attempt — `login.1` (page.goto /login), `STEP 2: CLICK Workflows in the side menu, then CLICK Inbox`, `STEP 6: ASSERT the details page opens…`
- **Expected**: GOV022 opens the Approve Leave item from the Inbox and approves it without pay
- **Actual**: every attempt timed out at a different point — login page stuck on the loading spinner (>15s / >30s), Inbox link unstable, Approve Leave form blank after 30s. TC-01 and TC-02 (same user, same Inbox item, same details page) passed in the same runs.
- **Suspected category**: infra
- **Playwright error** (last attempt):
  ```
  TimeoutError: page.goto: Timeout 30000ms exceeded.
    - navigating to "https://pd-hcm-adminportal-qa.shesha.app/login", waiting until "load"
  ```
  Earlier attempts:
  ```
  TimeoutError: locator.fill: Timeout 15000ms exceeded. — waiting for getByRole('textbox', { name: 'Username' })
  expect(getByRole('heading', { name: /^Approve Leave:/ })).toBeVisible() — element(s) not found (30000ms)
  ```
- **Snapshot / screenshot**: `test-results/artifacts/HCM-eLeave-approve-without-74036-ay-from-the-Workflows-Inbox-chromium/test-failed-1.png`
- **Suspected cause**: QA front end intermittently slow to serve/render (the capture plan's backdated submit also hung >30s once in the same session, then passed on retry). `curl` of /login between attempts returned 200 in 0.2–2s, so it is intermittent rather than an outage.
- **Knock-on effect**: the leave application stays at Approve Leave in GOV022's Inbox, so nothing reaches the Acknowledge Leave Approved Without Pay step.
