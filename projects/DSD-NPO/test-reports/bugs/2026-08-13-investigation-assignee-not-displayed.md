# Bug: Investigation assignee and reviewer are saved but never displayed

**Date:** 2026-08-13
**Severity:** High
**Status:** Open — verified
**Portal:** Admin
**Found in:** NPO-12A TC-12-006 (ADO #101794)
**Case:** INV1283/13/08/2026 · NPO `333-018-NPO`

## Summary
Assigning an investigator and reviewer **succeeds and persists**, but the assignment is **not rendered anywhere
in the UI**. Every investigation — all 163 — displays `Assigned to: (None)`.

## Steps to reproduce
1. Admin portal → workflow inbox → open an investigation task with *Assign Investigator and Reviewer*
2. Click **Assign Case**, choose an investigator and a reviewer, **Submit**
3. Go to `CRUDS → Investigation` and find the case
4. Open the case details page (`/dynamic/boxfusion.dsdnpo/investigation-details?id=<id>`)

## Expected
The assigned investigator (and reviewer) are visible on the case — ADO #101794 requires
*"the assignment is visible on re-opening the case"*.

## Actual
- List card: **`Assigned to: (None)`** — unchanged after assignment, and identical on all 163 cases
- Details page: **neither name appears anywhere** in the rendered page

## Evidence — the data IS correct
The details page's own API call returns both values:
```
GET /api/dynamic/boxfusion.dsdnpo/Investigation/Crud/Get?properties=…investigator…reviewer…&id=240354fe-…
{
  "investigator": "5876d452-0c21-4c31-a13c-1a2f8c62f99a",
  "reviewer":     "3e0bc0eb-f583-487d-8af9-2a0ba0b7c86f",
  "isValidForInvestigation": true,
  "investigationStatus": 4
}
```
The workflow also advanced correctly (**SUBMITTED FOR ASSIGNMENT → AWAITING INVESTIGATION OUTCOME**) and the task
left the assigning user's inbox. **This is purely a presentation gap over correct data.**

## Impact
DSD staff cannot tell who owns any investigation, or whether one has been assigned at all. Because the list is
the only overview of the 163 cases, workload cannot be managed from the UI.

## Notes
Likely a missing field binding on `investigation-details v13` and on the case list template
(`StarterTemplate/all-new-cases v14`). Both `investigator` and `reviewer` are plain user references already
returned by the existing query, so no new endpoint is needed.
