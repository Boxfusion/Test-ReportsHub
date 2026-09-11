# Report: NPO-10-F — Post Registration / Change Request (submitter run)

**Date:** 2026-08-18 11:00 UTC
**Plan:** test-plans/post-registration/10-post-registration-change-request-functional.md
**Execution Mode:** ai-repair
**Result:** FAILED — 1 passed, 1 failed of 2 verdicted; a Change Request cannot be cancelled/deleted (new defect)
**Duration:** ~700s
**Cases:** TC-10-003, TC-10-004 · TC-10-005 / TC-10-010 / TC-10-011 (deferred)
**Environment:** QA · public portal · registered NPO **`333-019-NPO`**

## Summary
| Verdicted | Passed | Failed | Deferred |
|---|---|---|---|
| 2 | 1 | 1 | 3 |

| Case | Title | Verdict |
|---|---|---|
| TC-10-003 | Cannot start a duplicate in-progress request | ✅ **PASS** |
| TC-10-004 | Cancel an unassigned active request | 🔴 **FAIL** — no cancel/delete control exists |
| TC-10-005 | Cancel an assigned request | ⚪ DEFERRED — needs admin assignment |
| TC-10-010 | Admin Accept Changes | ⚪ DEFERRED — needs a submitted (typed) request |
| TC-10-011 | Admin Decline requires reason | ⚪ DEFERRED — needs a submitted (typed) request |

## ✅ TC-10-003 — Duplicate in-progress request blocked
On the registered NPO `333-019` the Post Registration list shows the existing request **POST1317/17/08/2026**, the
**"Initiate Post Registration" button is disabled**, and a banner explains a request is already in Draft/In-progress
and blocks a new one. Request history shown + new initiation blocked → both assertions met. *Evidence: v20.*
📌 Copy defect: the banner reads *"Oops you it seems already have a change request…"* (garbled grammar).

## 🔴 TC-10-004 — Cannot cancel the request (new defect)
Bug: `bugs/2026-08-18-change-request-cannot-be-cancelled-or-deleted.md`.

The case expects *"click Cancel on the unassigned request → cancelled; user can create a new one."* There is **no
cancel/delete control** on any surface:
- change-request list row → only a view (magnifier) icon (`anticon-delete` absent),
- request details view → only a "Re-Send" letter button,
- dashboard "Draft Post Registration" panel → **"No Data"**.

So the blocking request cannot be removed and the user is permanently unable to raise a new one — even though the
banner tells them to *"delete it so you can create a new one."* *Evidence: v20, v21.*
🔑 Verified by enumerating all row/visible action icons — no delete/cancel exists. This turns TC-10-003's correct
duplicate-block into a dead-end.
📌 The blocking `POST1317` has **blank Type and blank Status** — it's the empty draft auto-created in suite 08 by the
*"Submit a Change Request instead?"* link, now un-clearable. And the list vs the dashboard "No Data" panel disagree on
whether a draft exists.

## ⚪ Deferred
- **TC-10-005** (cancel an *assigned* request) — needs an admin to assign the request first; and cancel doesn't work
  even unassigned (above).
- **TC-10-010 / TC-10-011** (admin Accept Changes / Decline-requires-reason) — need a **submitted, typed** change
  request in the admin queue. The only request here is an empty never-submitted draft, and it can't be completed +
  submitted cleanly (nor cancelled). Building a real typed change request end-to-end is a separate flow — defer.

## Observations for the test lead
1. 🔴 **A stray Change Request draft cannot be cancelled or deleted** — the user is told to delete it but no control
   exists, permanently blocking new requests (TC-10-004).
2. The suite-08 *"Submit a Change Request instead?"* link **auto-creates a typeless draft**; combined with (1), a user
   can be locked out of Post Registration without deliberately creating anything.
3. The change-request **list and the dashboard "Draft Post Registration" panel disagree** (one shows POST1317, the
   other "No Data").
4. Banner grammar: *"Oops you it seems already have…"*.

## 📸 Evidence — `test-reports/2026-08-18/evidence/`
| File | Shows |
|---|---|
| `v20-post-registration-request-table.png` | POST1317 in the list, Initiate disabled, blocking banner |
| `v21-draft-post-reg-panel-no-data.png` | Dashboard "Draft Post Registration" → "No Data" for the same NPO |

## Method notes
- 🔑 Change Request lives on the **registered** NPO's landing (`333-019`, npo id `4be65ab5-…`) → **Post Registration**
  → `portal-change-request-table`. The in-progress NPO (APPL26-00793) has no such action.
- 🔑 Confirmed the missing-cancel finding across three surfaces before calling it — not a single-view miss.
