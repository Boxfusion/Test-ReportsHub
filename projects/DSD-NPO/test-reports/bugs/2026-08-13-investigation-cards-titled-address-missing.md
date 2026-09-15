# Bug: Every investigation case is titled "Address Missing" and cannot be opened from the list

**Date:** 2026-08-13
**Severity:** Medium
**Status:** Open — verified
**Portal:** Admin
**Found in:** NPO-12A TC-12-004 (ADO #101792)
**Page:** `CRUDS → Investigation` — `/dynamic/boxfusion.dsdnpo/investigations`

## Summary
Two faults on the same list, both making the investigations queue unusable:
1. **All 163 cases render the title `Address Missing`**
2. **No card can be opened** — the only route to a case is the workflow inbox

## 1. Every card is titled "Address Missing"
All ten cards on page 1 — and our own case — show the literal title `Address Missing`, with no case number, NPO
name, or case type to distinguish them.

**Our case demonstrably has an address.** `INV1283/13/08/2026` carries
`18 South Street, Zwartkop, Centurion, South Africa`, correctly displayed on the case **details** page. So the
title is not reporting a genuine data gap on this case — the list is rendering the wrong field, or a fallback.

Confirmed visually by screenshot, not just by text extraction.

## 2. Cases cannot be opened from the list
- The card contains **no `<a>`, no `<button>`, no `[role=button]`** — verified by querying the whole subtree
- The only React `onClick` in the card sits on `.sha-datalist-component-item`; clicking it (real click and a full
  synthetic pointer sequence) **does nothing** — no navigation, no modal
- The **only** working route is the magnifier link in the workflow inbox:
  `/shesha/workflow-action?id=<workflowId>&todoid=<todoId>`

**Impact:** the inbox holds **2,475 items** and shows only tasks assigned to the current user, so any case
without an outstanding task for you is effectively unreachable. Combined with fault 1, a staff member cannot
locate a specific investigation at all.

## Expected
Cards identify their case (ref no / NPO / case type) and open the case on click.

## Related
- `2026-08-13-investigation-assignee-not-displayed.md` — the same list also shows `Assigned to: (None)` for every
  case, including assigned ones. All three are defects in the same list template
  (`StarterTemplate/all-new-cases v14`) and are probably one fix.
- The list also has **no meaningful default sort** (page 1 runs 15/10/2025, 18/02/2026, 06/08/2026, 27/09/2025…),
  so a newly created case does not surface at the top.
