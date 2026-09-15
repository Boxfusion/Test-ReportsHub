# Bug: "Qualification Status" field described in ADO test cases does not exist anywhere in the Education panel

**Date logged:** 2026-08-05; extended same day to cover #106544
**Logged by:** QA (automated run)
**Plan:** N/A — no `.md`/`.spec.ts` pair was created for either affected test case, since the target control does not exist to automate against (blocked plans on file: test-plans/AdminPortal/verify-edit-qualification-status.md, test-plans/AdminPortal/verify-qualification-status-complete.md)
**Failing ADO Test Cases:**
- [#106543 — Verify edit qualification status (In Progress)](https://dev.azure.com/boxfusion/pd-recruitment/_workitems/edit/106543) (Recruiter role, user Kwenas)
- [#106544 — Verify qualification status (complete)](https://dev.azure.com/boxfusion/pd-recruitment/_workitems/edit/106544) (Recruiter role, user Kwenas) — same missing dropdown, this time selecting "Complete" plus an associated datepicker/previous-date step, neither of which could be reached either
**Related ADO Test Case:** [#106540 — Verify Edit institution](https://dev.azure.com/boxfusion/pd-recruitment/_workitems/edit/106540) step 8 also lists "Qualification status" as a field expected to appear in the Education panel's edit mode; already noted there as a discrepancy but not logged as a standalone bug until now, since #106543/#106544 make it the sole subject of a test case.
**Severity:** Low/Medium — no functional regression (nothing broken), but a test case cannot be executed at all because its target field is missing from the UI, and multiple ADO test cases in this family assume it exists
**Environment:** QA — https://pd-recruitment-adminportal-qa.shesha.app/
**User:** Kwenas / "Kwena Semono" (Recruiter role)

## Expected
Per ADO #106543: on a candidate application's Education panel, in the row-level edit mode entered via the Edit icon, there should be a "Qualification Status" dropdown that can be opened and set to "In Progress", then saved.

## Actual
Confirmed live 2026-08-05 against Job Posting Ref No 40's application (Education panel, both Secondary and Tertiary Qualifications tables):
- A page-wide text search for "Qualification Status" (and "Qualification status") returns **zero matches**, both before and after entering row edit mode via the Edit icon.
- The Secondary Qualifications table's edit mode exposes exactly 4 fields: Institution, Qualification Name, Qualification Type, Certificate.
- The Tertiary Qualifications table's edit mode exposes exactly 4 fields: Institution, Qualification Name, Date Obtained, Certificate.
- A full column-header scan of the page (`div[role="columnheader"]`) confirms the same — no "Status" column anywhere in either qualifications table.

There is no dropdown, hidden field, or alternate view (e.g. a modal) discovered anywhere on this page that corresponds to "Qualification Status". This was already observed as a discrepancy while automating #106540 (which lists the same 5 fields, one of which — "Qualification status" — doesn't exist), but #106543 makes this specific field the entire subject of a test case, so it cannot be executed at all, not just adjusted.

## Repro
1. Log in as `Kwenas / 123qwe` at https://pd-recruitment-adminportal-qa.shesha.app/.
2. Navigate to Recruitment > Job Posting Dashboard, open any Job Posting, open any candidate Application.
3. Scroll to the Education panel and click the Edit (pencil) icon on any Secondary or Tertiary Qualifications row.
4. Observe: the row's fields open in edit mode, but there is no "Qualification Status" dropdown among them (Secondary: Institution/Qualification Name/Qualification Type/Certificate; Tertiary: Institution/Qualification Name/Date Obtained/Certificate).

## Suspected cause
Either the "Qualification Status" field was planned/documented but never implemented, or it was implemented and later removed, or it exists on a different entity/form not reachable from this page (e.g. a different qualification type template). Since it's referenced consistently by name across at least two ADO test cases (#106540, #106543) in the same authoring batch, this reads as a documentation/implementation gap rather than a one-off typo.

## Recommendation
- Confirm with the BA/product owner whether "Qualification Status" was ever meant to ship for Secondary/Tertiary Qualifications, and either implement it or remove/update the ADO test cases (#106540 step 8, #106543 entirely) that reference it.
- If it's intentionally out of scope, #106543 should likely be retired or rewritten against whatever field actually captures qualification progress (if any equivalent exists elsewhere in the candidate record).

## Next steps for a future test run
- Re-check after any Education-panel schema changes in case the field is added later.
- If a BA clarifies the field lives elsewhere (e.g. a separate "Qualifications in progress" section not yet explored), re-run the search there before re-confirming this bug.
