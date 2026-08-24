# Bug: Retract from My Items grid toolbar fails server-side (500) but the dialog closes as if it succeeded

**Date logged:** 2026-07-09
**Logged by:** QA (automated run, ad-hoc verification)
**Plan:** test-plans/Memo/verify-retract-functionality.md (ad-hoc variant — see Repro)
**Failing step:** Equivalent of ADO step 9 (id8) — "Click on Retract button" on the Retract Memo dialog
**Severity:** High — the retract action fails and never changes the item's status, despite the dialog closing as if it completed
**Environment:** QA — https://pd-approvals-adminportal-qa.azurewebsites.net/
**ADO Test Case:** [#105186](https://dev.azure.com/boxfusion/pd-approvals/_workitems/edit/105186) — Verify successful retract functionality

## Expected
Per ADO's expected result: confirming the Retract Memo dialog "terminates the workflow and updates the status of the item to 'Retracted'."

## Actual
Confirmed live over 4 separate attempts against 3 different items (REF2026/05425 ×2, REF2026/05177 ×1, REF2026/05431 ×1), all as `Craig / 123qwe`:
- Highlighting an "In Progress" row in My Items (without opening the item's detail view) enables a **Retract** button in the grid's own toolbar.
- Clicking it opens the Retract Memo dialog; typing a comment and clicking the dialog's Retract button closes the dialog — visually indistinguishable from a successful confirm.
- The underlying API call reveals the real outcome:
  ```
  POST https://pd-approvals-api-qa.azurewebsites.net/api/services/Memos/MemoWorkflow/Retract -> 500
  {"result":null,"targetUrl":null,"success":false,"error":{"code":0,"message":"An internal error occurred during your request!","details":"Task decision retract not found.","validationErrors":null},"unAuthorizedRequest":false,"__abp":true}
  ```
- A generic error toast **is** shown on screen — `"An internal error occurred during your request!"` — briefly, right after the click. However, the Retract Memo dialog still closes regardless, exactly as it would on success, so the toast is easy to miss and the overall flow reads as "completed."
- Reloading the My Items grid afterward confirms the item is still "In Progress" in all 4 attempts — the retract never actually took effect.

## Repro
1. Log in as `Craig / 123qwe`, switch view mode to "Latest".
2. Navigate to Workflows → My Items.
3. Click an "In Progress" row's status cell to highlight/select it (do **not** open the item's detail view).
4. The grid toolbar's Retract button becomes enabled — click it.
5. In the Retract Memo dialog, enter a comment, click Retract.
6. A toast reading "An internal error occurred during your request!" appears briefly; the dialog closes anyway.
7. Reload the grid: the item is still "In Progress".
8. Inspect network traffic: `POST .../MemoWorkflow/Retract` returns HTTP 500, `details: "Task decision retract not found."`.

## Recommendation
- Backend: "Task decision retract not found" suggests the highlight-and-toolbar-button retract path sends a different/incomplete payload (e.g. missing a task/decision id that the item's own detail-view Retract button supplies) — compare the request payload from this path against the detail-view path's payload.
- Frontend: the dialog should not close/dismiss as if successful when the underlying request returns an error — keep it open (or otherwise block the "success" UI state) so the toast isn't the only, easily-missed signal that the action failed.
- Not yet confirmed whether the detail-view Retract button (the ADO-documented path, exercised as the initiator) suffers the same backend error — worth checking as a follow-up.
