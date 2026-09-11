# Bug: public "Submit A Query" enquiry form cannot submit — NpoOrganisation Get?Id=null → 400

**Date:** 2026-08-18
**Severity:** High (the public Contact-Us / enquiry channel is non-functional)
**Area:** Public portal — `public-case-create` ("Submit A Query"), reached via footer **Enquiry** button
**Environment:** QA
**Found by:** Suite 15E (TC-15E-006)

## Summary
The public enquiry form (`boxfusion.dsdnpo/public-case-create`, form v16) never creates a case. With all required
fields satisfied, clicking **Submit** shows **"Error: Your request is not valid!"** and stays on the page. The submit
action unconditionally calls `GET /api/dynamic/boxfusion.dsdnpo/NpoOrganisation/Crud/Get?Id=null`, which returns
**400**, and **no `Case/Crud/Create` POST is ever attempted**. The enquiry is silently lost.

This is the portal's public Contact-Us / enquiry channel — the footer **Enquiry** button on every page routes here —
so members of the public cannot log a query.

## Steps to reproduce
1. Sign in to the public portal.
2. Click the **Enquiry** button in the footer (or navigate to `/dynamic/boxfusion.dsdnpo/public-case-create`).
3. Category = **Education and Awareness**; Description = any short text; Case type = **How to Register?**
   (Channel = Web, Priority = High, and Submitter details are prefilled.)
4. Submit becomes enabled. Click **Submit**.

**Expected:** the case/query is created and a confirmation is shown.
**Actual:** toast **"Error: Your request is not valid!"**; page unchanged; no case created.

## Evidence / root cause
On every Submit the network + console show:
```
GET .../api/dynamic/boxfusion.dsdnpo/NpoOrganisation/Crud/Get?Id=null   => 400
```
and **no** `POST .../Case/Crud/Create` (or equivalent). The submit handler tries to load an `NpoOrganisation` by a
**null id** before/instead of creating the case, and the 400 aborts the whole action.

Reproduced **3×** identically, ruling out the harness and data:
1. No NPO linked → `Get?Id=null` 400, "not valid".
2. Identical retry → same.
3. Linked our own **333-019-NPO** via the NPO-number search — the correct org resolved server-side
   (`NpoOrganisation/Crud/Get?...&id=4be65ab5-c421-4b22-a275-0a26ccd802f6` → **200**) — yet Submit **still** fired a
   separate `Get?Id=null` 400 and created no case. So the null-id Get is hardcoded in the submit action, independent
   of any linked organisation.

## Also reproduced for Category = Investigation (2026-08-18, suite 12) — and it's SILENT
The **same form is the whistleblowing / investigation channel** (landing → "Submit Query", Category = Investigation,
Case type e.g. "Theft"). Submitting as a logged-in user produced **no case-create POST, no confirmation, and — unlike
the E&A path — no error toast at all**: a completely silent no-op. The only related call was
`NpoOrganisation/Crud/Get?id=undefined` → 400. So the defect spans categories, and for Investigation the user gets
**zero feedback** that their report was lost. For a whistleblowing channel this is more serious than the E&A case.
🔑 This also **blocks the entire admin investigation lifecycle test** (validate / close / feedback) because no case
can be created through the public UI to process.

## Impact
The public enquiry / Contact-Us / **investigation (whistleblowing)** submission channel is down. No query or report
can be logged. Because there is no case-create POST at all, submissions are lost — with a generic client error for
Education & Awareness, and **silently** for Investigation.

## Fix direction
- In the submit action, stop calling `NpoOrganisation/Crud/Get` with a null id (guard for the no-org case; the
  Application Ref / NPO number are optional on the form). Then actually POST the case create.
- Surface a specific error if creation genuinely fails, rather than the generic "Your request is not valid!".

## Related / secondary (same form, lower severity)
- **Application Ref** and **NPO Number** pickers render **raw GUIDs** in the default (unfiltered) list; readable
  labels only appear after a typed search.
- The **NPO Number** list is **system-wide** (paged over all NPOs) on a public form, not scoped to the submitter.

## Method / evidence
Network log (`browser_network_requests`) + console errors captured live; toast text captured via a MutationObserver
armed before each Submit. The `Get?Id=null` 400 appears once per Submit and again on form init; the positive-path
`id=4be65ab5-…` 200 confirms the org resolves correctly when selected — the failure is the submit's own null-id Get.
