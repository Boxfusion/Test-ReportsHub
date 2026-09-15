# 🔴 Admin "Create Case" does nothing, silently, when Category = Investigation

**Date found:** 2026-08-31
**Environment:** QA — admin portal (`dsd-npo-adminportal-qa.shesha.app`), CRM → Cases
**Form:** `boxfusion.dsdnpo/case-create-two v4`
**Severity:** Medium-High — the only admin route to create an investigation case is unusable, and it fails with no feedback of any kind
**Status:** Open · **CONFIRMED** by control test
**Found during:** suite 12 (Investigations) — attempting to create a case for TC-12-007
**Report:** `test-reports/2026-08-31/12-investigations-functional--both-creation-routes-down.md`

## What happens

CRM → **Cases** → **Create Case**. Complete every required field validly (Channel, Priority, submitter First/Last/
Mobile/Email, NPO Number, Category = **Investigation**, Case type, Description) and click **Ok**:

- **Nothing happens.** The modal stays open.
- **No POST is issued.**
- **No validation error** — `.ant-form-item-has-error` count is **0**, no field is flagged, no explain text.
- **No toast, no notification, no console error.**
- **Ok remains enabled**, inviting the user to keep clicking. Clicked 3×, including after committing the submitter
  sub-form with its ✓ control. Same result each time.

## The click is landing — this is not a harness artefact

A capturing click listener was attached to the Ok button, and `window.fetch` / `XMLHttpRequest.prototype.open` were
patched to record every request (rather than trusting a filtered network panel):

```
{ clicks: 1,
  fetches: [],
  xhrs: [ "GET .../Boxfusion.ServiceManagement/CaseRouting/Crud/GetAll?filter={\"and\":[{\"==\":[..." ] },
  modalStillOpen: true }
```

The click registers, fires **one GET** to the case-routing lookup, and then the handler stops. No create request is
ever made.

## Root cause — no CaseRouting is configured for the Investigation category

`GET /api/dynamic/Boxfusion.ServiceManagement/CaseRouting/Crud/GetAll?filter=caseCategory==<n>`:

| Category | `caseCategory` | Routing rows |
|---|---|---|
| Application | 1 | 6 |
| Annual Compliance | 2 | 3 |
| Appeals | 3 | 2 |
| Voluntary Deregistration | 4 | 1 |
| Post Registration | 5 | 2 |
| **Investigation** | **6** | **0** |
| Education and Awareness | 7 | 1 |

**Investigation is the only category of the seven with zero routing rows**, and it is the only category on which
Create Case fails.

## Control test — causation, not correlation

The **same form with the same data** was resubmitted with **only the Category changed** to *Post Registration*
(2 routing rows) and Case type set to *Post Registration Status*:

- **It created immediately.** Case count went **119 → 120**, new record at `2026-08-31T07:45:01` carrying the same
  synthetic description and the same NPO (333-018).

So the form, the data, the submitter block and the account are all fine. The failure is specific to the category
that has no routing configured — and the form handles that condition by doing nothing at all.

## Steps to reproduce

1. Sign in to the admin portal.
2. CRM → **Cases** → **Create Case**.
3. Fill: Channel *Web*, Priority *Medium*, submitter first/last/mobile/email, tick **Search using NPO Number**,
   pick any NPO, Category **Investigation**, any Case type, any Description.
4. Click **Ok** → nothing happens, no error, modal stays open.
5. Change **only** Category to *Post Registration* (and re-pick a Case type) → click **Ok** → the case is created.

## Expected

Either the case is created, or the user is told why it cannot be — e.g. *"No routing is configured for Investigation
cases."* A required-but-missing configuration should not present as an inert button.

## Impact

- **The only admin route to create an investigation case is unusable.** Combined with
  `2026-08-31-whistleblowing-intake-cannot-start-its-workflow.md`, there is currently **no way at all** to create an
  investigation case in QA.
- Blocks TC-12-007, and any suite 12 case needing a fresh case at validation stage.
- The silent-failure pattern is the more general risk: a user cannot distinguish "not saved" from "saved".

## Related observation (logged, lower severity)

Typing into the submitter text fields on this form throws **once per keystroke**:
`executeScriptSync error TypeError: Cannot read properties of null (reading 'id')` — 25+ occurrences for a single
field. The form still works; the volume of noise makes genuine errors easy to miss.

## Questions for the test lead
1. Is the missing Investigation `CaseRouting` a configuration gap in QA, or is admin-created investigation
   intentionally unsupported?
2. If unsupported, should the Investigation option be removed from the Category list on this form rather than
   offered and then silently refused?
