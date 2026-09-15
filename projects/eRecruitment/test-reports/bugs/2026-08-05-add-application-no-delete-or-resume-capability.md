# Bug/Gap: "Add New Application" wizard persists data early, with no way to resume or delete an incomplete draft

**Date logged:** 2026-08-05
**Logged by:** QA (automated run / live investigation)
**Plan:** test-plans/AdminPortal/verify-successful-manual-application.md / .spec.ts (the eventual successful run)
**Related ADO Test Case:** [#106172 — Verify successful manual application](https://dev.azure.com/boxfusion/pd-recruitment/_workitems/edit/106172) (Recruiter role, user Kwenas)
**Severity:** Medium — no functional regression in the happy path (the wizard does successfully create a Pre-Screened application when completed), but the lack of any resume/delete path for partial attempts means **any interrupted or investigative use of this wizard permanently pollutes shared candidate data with no cleanup mechanism**
**Environment:** QA — https://pd-recruitment-adminportal-qa.shesha.app/
**User:** Kwenas / "Kwena Semono" (Recruiter role)

## Expected
Per ADO #106172, the "Add New Application" wizard (Personal Details → Education → Experience → Category & Comments → Documents → Confirmation) should only create the application/candidate record when the user reaches the final "Done" button on step 6 (step 43's expected result: "the application should be added to the Applications table... status should change to pre-screened"). Implicitly, an abandoned/incomplete attempt (e.g. clicking Cancel, or just closing the browser) should leave no persistent trace, or at minimum should be resumable or deletable.

## Actual
Confirmed live 2026-08-05 against Job Posting Ref No 40:
1. **Early persistence:** clicking "Next" past step 1 (Personal Details) immediately shows an "Application created successfully!" toast and persists a new Person/Candidate record to the backend — long before any of the remaining 5 steps or the final "Done" click.
2. **No resume path:** closing the page/browser after this point and later re-opening "Add New Application" with the *same* Identity Number does not detect, warn about, or resume the existing record — it silently starts a completely new, separate blank wizard, in this case producing a duplicate.
3. **No delete path:** neither the Candidates list (Recruitment > Candidates) nor an individual candidate's detail page (opened via the list's "view"/magnifying-glass icon) exposes any Delete control. Confirmed via `.anticon-delete` element count = 0 on both. The Candidates list only exposes "view"; the detail page only exposes "Back".
4. **Invisible in the Job Posting's own Applications table:** an incomplete draft does **not** appear under any of Job Posting 40's 5 Applications tabs (All Applications/Pre-screened/Shortlisted/Interviewed/Appointed) — it is only visible via the global Candidates list, where the candidate's own detail page shows "Job Postings Applied For: 40 — Status: Draft".

## Consequence observed this session
Live investigation into how this wizard behaves (necessary because none of steps 2-6's exact field structure could be determined from ADO's step text alone) produced **5 permanent, undeletable stray candidate records** in the shared QA Candidates list, none of which can be cleaned up via the UI:
| # | Name | State |
|---|------|-------|
| 1-3 | AutoTest ManualApp (×3) | Personal Details only — abandoned at/after step 1, no Education/Experience data |
| 4 | AutoTest CompleteFlow | Personal Details + 1 Education qualification only — abandoned partway through step 3 (Experience) due to a selector bug |
| 5 | AutoTest CompleteFlow | Personal Details + 1 Education qualification only — same as #4, different ID number, also abandoned at step 3 |

A 6th "AutoTest CompleteFlow" record (ID `9401155123095`) is the genuine, successfully completed test execution — fully filled through all 6 steps, status **Pre Screened**, correctly linked and visible in Job Posting 40's Applications table. That one is a legitimate test artifact, not a bug byproduct — it's flagged here only for completeness so all 6 "AutoTest" records are accounted for.

## Additional stray record (2026-08-06)
A second run of this spec (to create a fresh application for ADMINPORTAL-106398, since the first application had already reached the terminal "Appointed" stage) hit a genuine test-authoring bug in the Education-row Add assertion (fixed in the spec) partway through TC-06 — but by that point the wizard had already advanced past Personal Details, so the same early-persistence behavior described above had already fired:
| # | Name | ID | State |
|---|------|----|-------|
| 7 | AutoTest Edit Last Name | `9204225432086` | Personal Details + 1 Education qualification only — abandoned partway through step 2 (Education) due to a since-fixed selector bug in the automation, not an app defect |

The spec was fixed and re-run to completion with a fresh ID (`8907115432088`) rather than reusing `9204225432086`, to avoid two candidate records sharing the same ID number.

## Repro
1. Log in as `Kwenas / 123qwe` at https://pd-recruitment-adminportal-qa.shesha.app/.
2. Navigate to Recruitment > Job Posting Dashboard, open any open Job Posting, click "Add New Application".
3. Fill Personal Details (any valid data, including a checksum-valid SA ID number) and click "Next".
4. Observe the "Application created successfully!" toast fires immediately.
5. Close the browser tab without completing the remaining steps.
6. Navigate to Recruitment > Candidates and search for the name just entered — the record exists, with no way to delete it. Open its detail page — again, no delete option, only "Back".
7. Re-open "Add New Application" on the same Job Posting and re-enter the *same* Identity Number from step 3 — observe the form starts blank rather than resuming the existing draft.

## Recommendation
- Add either (a) a proper "resume this draft" capability so re-entering the same Identity Number (or a "My Drafts" list) continues the same wizard session instead of creating a duplicate, or (b) a Delete/Cancel-and-discard capability for Draft-status candidate records, ideally both.
- Consider deferring backend persistence until the final "Done" step, matching the pattern used by every other stateful action in this application (Save/OK-gated writes), rather than persisting incrementally per wizard step.
- Recommend a BA/dev/DB review of the 5 stray records listed above for cleanup, since no UI path exists to remove them.

## Next steps for a future test run
- If a Delete or resume capability is added, re-test #106172's abandon/resume paths specifically, and clean up the 5 stray records via whatever new mechanism is introduced.
- If document-upload enforcement (ADO step 41) is confirmed as an actual requirement, dedicate a focused re-test to it — this session's successful run skipped it due to a timing bug in the automation, and the wizard did not block completion despite the missing uploads, suggesting upload may not currently be enforced at all.
