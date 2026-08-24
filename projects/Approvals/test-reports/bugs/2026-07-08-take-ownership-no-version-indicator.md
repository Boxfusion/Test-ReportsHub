# Bug: Taking Ownership does not create/show a new memo version (no "/V2" indicator)

**Date logged:** 2026-07-08
**Logged by:** QA (automated run)
**Plan:** test-plans/Memo/verify-new-version-created.md
**Failing TC / step:** TC-01, step 19 (`CLICK the OK button on the Take Ownership popup` → expected "system auto refresh and open the Memo in draft mode with new V2 ref number indication")
**Severity:** Low/Medium — the Take Ownership action itself works (button correctly disables during the request and re-enables after refresh); only the version-indicator/draft-mode aspect of the expected result is missing
**Environment:** QA — https://pd-approvals-adminportal-qa.azurewebsites.net/
**ADO Test Case:** [#104767](https://dev.azure.com/boxfusion/pd-approvals/_workitems/edit/104767) — New Version Created

## Expected
Per ADO's expected result: "The popup closes and the Take Ownership button becomes disabled. The system should auto refresh and open the Memo in draft mode with new V2 ref number indication a new version e.g. (Ref2026/01732/V2)."

## Actual
Confirmed live over 3 separate runs (Ref Nos REF2026/09413, REF2026/09419, REF2026/09425):
- Clicking Take Ownership → OK does disable the button immediately (request in flight).
- The page does auto-refresh shortly after, and the button returns to an enabled state.
- However, **no version indicator ever appears anywhere in the UI** — the header still reads the original Ref No with no `/V2` (or any) suffix, and the screen remains the same "Approve: Test Subject" screen (not a draft-mode edit form).
- Checked both visible tabs on the Approve screen: "Memo Action" (the default tab, action bar) and "Memo Contents" — the latter shows "No Data" both before and after taking ownership, so the version indicator isn't merely hidden in a different tab either.

## Repro
1. Log in as `Ian / 123qwe`, switch view mode to "Latest".
2. Create a New Referrals memo, assign "Craig M" as routing signatory, submit.
3. Log out, log in as `Craig / 123qwe`.
4. Navigate to Workflows → Inbox, open the submitted item by its Ref No.
5. Click "Take Ownership" → "OK" in the confirmation dialog.
6. Observe: button disables then re-enables after refresh, but the Ref No / page content shows no version bump (no `/V2`), and the "Memo Contents" tab shows "No Data".

## Recommendation
- Confirm with the product owner whether a "V2" version indicator is meant to be visible in this specific screen, or whether it's tracked elsewhere (e.g. a version-history panel/API field not surfaced in this UI) — if the latter, ADO's expected result text should be corrected to describe the actual visible behavior.
- If a version bump is genuinely expected here, check why "Memo Contents" renders "No Data" after ownership is taken — this may be the same underlying issue (the new version's content isn't being loaded into this view).
