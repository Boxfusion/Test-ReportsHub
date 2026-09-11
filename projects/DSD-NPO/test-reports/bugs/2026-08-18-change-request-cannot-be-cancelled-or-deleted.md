# Bug: an in-progress Change Request cannot be cancelled or deleted through the UI

**Date:** 2026-08-18
**Severity:** Medium-High
**Area:** Public portal → Post Registration / Change Request
**Environment:** QA
**Found by:** TC-10-004 (ADO #101765)
**NPO:** `333-019-NPO` (`Nomfanelo QA Annual NPO`) · request **POST1317/17/08/2026**

## Summary
A registered NPO has an in-progress Change Request (`POST1317`) that **blocks creating any new request** (correct, per
TC-10-003). But there is **no UI control anywhere to cancel or delete that request**, so the user is permanently
blocked from raising a new one — despite the on-screen instruction telling them to delete it.

## Steps to reproduce
1. Public portal → open a **registered** NPO → **Post Registration**.
2. The change-request list shows `POST1317` and the **"Initiate Post Registration" button is disabled**, with a banner:
   *"Oops you it seems already have a change request that either left on Draft or one that is still Inprogress … If you
   have one on Draft please go back to the dashboard to complete and submit that change request or delete it so you can
   create a new one!"*
3. Try to find a cancel/delete control:
   - **Change-request list row** → only a **view (magnifier)** icon; no delete/cancel icon.
   - **Request details view** (`public--portal-change-request-details`) → only a **"Re-Send"** letter button; no cancel.
   - **Dashboard → "Draft Post Registration" panel** → **"No Data"** (empty), so nothing to open/delete there.

## Expected (ADO #101765)
> *"Open request history and click **Cancel** on the unassigned request → request cancelled; user can now create a new
> one."*

## Actual
No Cancel or Delete control exists on any of the three surfaces. The blocking request cannot be removed, so the user
can never create a new change request. The banner's *"delete it so you can create a new one"* instruction has **no
corresponding control**.

## Verified
Enumerated all row-level and visible action icons on the change-request list — the only row action is `anticon-search`
(view); there is **no `anticon-delete`** or cancel control. Checked across the list, the details view, and the
dashboard draft panel. *Evidence: v20 (list + disabled Initiate + banner), v21 (dashboard draft "No Data").*

## Contributing observations
- The blocking request `POST1317` shows a **blank "Type Of Change Request"** and **blank "Change Request Status"** — it
  is the empty draft auto-created in suite 08 by the *"Submit a Change Request instead?"* link
  (`bugs/2026-08-17-...` note: that link "instantly creates a Post Registration draft" and discards the current step).
  So a typeless, statusless draft was created automatically and now cannot be cleared.
- **Inconsistency:** the change-request list treats `POST1317` as an active blocking request, while the dashboard's
  "Draft Post Registration" panel reports **"No Data"** for the same NPO.

## Impact
Blocks TC-10-004 outright, and turns TC-10-003's (correct) duplicate-block into a permanent dead-end: an NPO with a
stray draft can never raise another change request. Combined with the suite-08 auto-draft behaviour, a user can be
locked out of Post Registration entirely without having deliberately created anything.

## Copy defect (same screen)
The banner reads *"Oops you it seems already have a change request…"* — garbled grammar; should be e.g. *"It seems you
already have a change request…"*.
