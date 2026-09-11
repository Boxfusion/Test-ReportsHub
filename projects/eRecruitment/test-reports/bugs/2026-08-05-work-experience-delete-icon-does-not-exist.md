# Bug: Work Experience rows have no Delete icon/capability

**Date logged:** 2026-08-05
**Logged by:** QA (automated run)
**Plan:** test-plans/AdminPortal/verify-delete-work-experience.md / .spec.ts (TC-07 fails on purpose to prove this)
**Failing ADO Test Cases:**
- [#106551 — Verify Delete Work Experience (Design)](https://dev.azure.com/boxfusion/pd-recruitment/_workitems/edit/106551) (Recruiter role, user Kwenas) — application "Edit Last Name F"
- [#106306 — Verify Delete Work Experience (Design)](https://dev.azure.com/boxfusion/pd-recruitment/_workitems/edit/106306) (Recruiter role, user Kwenas) — identical test case content, different ADO ID; re-confirmed 2026-08-06 on a second, separate application ("Edit Last Name A", created by ADMINPORTAL-106172) — same result, no `.anticon-delete` icon anywhere on the row
**Related ADO Test Case:** [#106545 — Delete Qualification](https://dev.azure.com/boxfusion/pd-recruitment/_workitems/edit/106545) — this one's Delete icon/confirm-dialog flow **does** work correctly on Education > Secondary Qualifications rows, confirming the missing control on Work Experience is a gap specific to that table, not a general regression.
**Severity:** Low/Medium — no functional regression (nothing broken), but a test case cannot be executed at all because its target control is missing from the UI
**Environment:** QA — https://pd-recruitment-adminportal-qa.shesha.app/
**User:** Kwenas / "Kwena Semono" (Recruiter role)

## Expected
Per ADO #106551 step 8: on a candidate application's Work Experience panel, each row should expose a Delete (trash) icon; clicking it opens an "Are you sure want to delete this item?" confirmation dialog with Cancel and OK, mirroring the Education > Secondary Qualifications delete flow (#106545).

## Actual
Confirmed live 2026-08-05 against Job Posting Ref No 40's application ("Edit Last Name F"), Work Experience panel, on both existing rows ("Automation" / "Edited Employer..." and "Senior Test Engineer" / "Edited Employer..."):
- In view (non-edit) mode, each row's only icon is `.anticon-edit` — no `.anticon-delete` present.
- Clicking the Edit icon switches the row into inline-edit mode, which exposes only `.anticon-calendar` (date pickers), `.anticon-close-circle` (clear date), and `.anticon-save` — still no `.anticon-delete` at any point.
- The automated check (`verify-delete-work-experience.spec.ts`, TC-07) asserts `.anticon-delete` exists within the target row and fails with "locator resolved to 0 elements", confirming there is no way to reach step 8's delete-confirmation flow at all.

## Repro
1. Log in as `Kwenas / 123qwe` at https://pd-recruitment-adminportal-qa.shesha.app/.
2. Navigate to Recruitment > Job Posting Dashboard, open Job Posting Ref No 40, open the application listed as "Edit Last Name F".
3. Scroll to the Work Experience panel.
4. Observe: each row shows only an Edit (pencil) icon. Click it — the row switches to inline edit mode showing Save/Cancel/date-clear icons, still no Delete/trash icon anywhere.

## Suspected cause
Delete was implemented for Education > Secondary Qualifications (#106545) but never implemented for the Work Experience table — likely a scope gap in that feature rather than a regression, since the working analogue exists elsewhere in the same candidate-profile screen.

## Recommendation
- Confirm with the BA/product owner whether Work Experience rows were meant to support deletion, and either implement the Delete icon + confirm dialog (mirroring #106545's pattern) or retire/rewrite #106551 if deletion is intentionally out of scope for this table.

## Next steps for a future test run
- Re-check after any Work Experience panel schema/UI changes in case a Delete icon is added later.
- If added, re-point `verify-delete-work-experience.spec.ts` TC-07's assertion from "icon does not exist" back to the full Cancel/OK confirm-dialog flow (same shape as `verify-delete-qualification.spec.ts`), and re-confirm real-delete confirmation with the requester before running TC-08-10 for real.
