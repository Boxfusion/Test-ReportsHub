# Bug: Close Leave Application — 'OK' does not close the draft or redirect to Home (API 404)

- **Plan**: `test-plans/HCM/eLeave/close-leave-application.md`
- **Failing TCs**: `TC-02 — System should close the leave application when 'Ok' button is clicked` (ADO #86518), `TC-03 — System should redirect the user to the Home page when 'Ok' button is clicked` (ADO #86519)
- **Step**: `// STEP 9: CLICK the 'OK' button`
- **Expected**: The 'Close Leave Application' dialog closes, the leave application is closed, and the user is redirected to the Home page
- **Actual**: The dialog stays open and the page stays on `/dynamic/SaGov.Leave/sagov-leave-application-draft?mode=edit`. Clicking OK sends `POST https://pd-hcm-api-qa.shesha.app/api/dynamic/SaGov.Leave/SaGovLeaveApplicationWorkflow/Crud/Update`, which returns **HTTP 404**. The console logs `Failed to execute action 'shesha.common:Execute Script', error: AxiosError: Request failed with status code 404`. The draft's Close button becomes disabled.
- **Suspected category**: business-logic
- **Azure DevOps**: Bug #117871 (assigned to Tiyiselani Makhuvele; tested by test cases #86518, #86519)
- **Reproduced**: while recording the spec (blank draft, and again with Category = Annual Leaves selected) and on the first full run (2026-10-07), as GOV003 on QA
- **Not affected**: the Cancel button works (TC-04 and TC-05 pass)

## Playwright error (TC-02)
```
expect(locator).toBeHidden() failed
Locator:  getByRole('dialog', { name: 'Close Leave Application' })
Expected: hidden
Received: visible
Timeout:  15000ms
  at close-leave-application.spec.ts:91
```

## Playwright error (TC-03)
```
expect(page).not.toHaveURL(expected) failed
Expected pattern: not /sagov-leave-application-draft/
Received string: "https://pd-hcm-adminportal-qa.shesha.app/dynamic/SaGov.Leave/sagov-leave-application-draft?mode=edit"
Timeout: 30000ms
  at close-leave-application.spec.ts:105
```

## Snapshot / screenshot
- `test-results/artifacts/HCM-eLeave-close-leave-app-64a57-e-when-Ok-button-is-clicked-chromium/` (test-failed-1.png, trace.zip, video.webm)
- `test-results/artifacts/HCM-eLeave-close-leave-app-dde78-n-when-Ok-button-is-clicked-chromium/`

## Suspected cause
The close dialog (`SaGov.Leave/sagov-wf-leave-application close dialog` v36) runs a script that calls the `SaGovLeaveApplicationWorkflow` CRUD Update endpoint. A new draft has no saved workflow record, so either the record id is missing or the dynamic CRUD endpoint isn't exposed for this entity. The 404 comes from that call.

## Re-occurrence — 2026-10-08
- Full run of the plan: **PARTIAL** (TC-01, TC-04, TC-05 pass; TC-02 and TC-03 fail at the same assertions, lines 91 and 105).
- Reproduced again live as GOV003 on a fresh blank draft: clicking **OK** sends `PUT /api/dynamic/SaGov.Leave/SaGovLeaveApplicationWorkflow/Crud/Update` → **404**. The dialog stays open and the URL stays on `sagov-leave-application-draft?mode=edit`. (The request method is now `PUT`; the 2026-10-07 entry said `POST`.)
- Still tracked by ADO Bug #117871 — no new bug logged.
