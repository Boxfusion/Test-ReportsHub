# Bug: Editing Personal Details on a freshly wizard-created application fails with HTTP 500 "No existing application found"

**Date logged:** 2026-08-06
**Logged by:** QA (automated run / live investigation)
**Related ADO Test Case:** [#106172 — Verify successful manual application](https://dev.azure.com/boxfusion/pd-recruitment/_workitems/edit/106172) (creation), discovered while retroactively filling Email Address / Mobile Number per requester feedback
**Severity:** High — blocks any Personal Details edit on a newly-created manual application, and may block other stateful actions (Decline, Shortlist, etc.) that share the same backend linkage
**Environment:** QA — https://pd-recruitment-adminportal-qa.shesha.app/
**User:** Kwenas / "Kwena Semono" (Recruiter role)
**Target application:** Job Posting Ref No 40 → "AutoTest Edit Last Name" (Identity Number `8907115432088`), created via ADMINPORTAL-106172's second run (2026-08-06), status **PRE-SCREENED**

## Expected
Clicking "Edit Personal Details" on the application's details page, changing a field (e.g. populating Email Address / Mobile Number), and clicking "Save" should persist the change — exactly as it does on the original wizard-created application ("Edit Last Name A" / "Appointed" — see the many successful edits logged throughout ADMINPORTAL-106246 through 106306).

## Actual
Confirmed live twice, from two independent fresh browser sessions (fresh login, fresh navigation each time):
1. Open the application (confirmed correct via Identity Number `8907115432088` visible on the page).
2. Click "Edit Personal Details".
3. Populate Email Address and Mobile Number.
4. Click "Save".
5. A `POST https://pd-recruitment-api-qa.shesha.app/api/services/Recruitment/ManualApplications/CreateOrUpdateApplication` request fires and returns **HTTP 500** with body:
   ```json
   {"result":null,"targetUrl":null,"success":false,"error":{"code":0,"message":"No existing application found for this applicant and job posting.","details":"No existing application found for this applicant and job posting.","validationErrors":null},"unAuthorizedRequest":false,"__abp":true}
   ```
6. The form stays in edit mode (Save does not succeed); a retry click produces the same result. After reload, neither Email Address nor Mobile Number persisted.

This is a **different** failure mode from the previously-documented intermittent Save bug (`2026-08-05-edit-personal-details-save-silently-fails.md`), which fires zero API calls and sometimes succeeds on a delayed retry. This is a hard, consistent backend rejection with a specific, informative error message — "No existing application found for this applicant and job posting" — despite the application visibly existing under the Pre-screened tab with the correct Identity Number displayed.

## Hypothesis
The application/candidate record created by the "Add New Application" wizard may not be linked to its Job Posting in the same way as an application submitted normally (e.g. via the Public Portal or an older/different creation path), OR there is a data-linkage ambiguity caused by having multiple similarly-named candidate records for this job posting (the original "Edit Last Name A"/Appointed, an orphaned "Edit Last Name" draft from an earlier interrupted attempt at Education step, and this new completed "Edit Last Name" record) — see `2026-08-05-add-application-no-delete-or-resume-capability.md` for the orphaned-draft context. Root cause is unconfirmed; this needs backend/DB investigation, not something resolvable from the UI.

## Impact
Any Recruiter workflow requiring a Personal Details edit on a manually-created application appears to be completely blocked, not just occasionally flaky. This may also affect other stateful actions (Decline, Shortlist) if they route through the same or a related backend linkage — flagged for verification before running ADMINPORTAL-106398 (Decline) against this application.

## Recommendation
- Backend/DB team should investigate why `CreateOrUpdateApplication` cannot resolve an existing Application record for this Person + Job Posting combination, despite the application being visible and correctly statused in the UI.
- Until resolved, avoid relying on Personal Details edits for manually-created ("Add New Application" wizard) applications in further test automation; verify whether Decline/Shortlist/other status-change actions are similarly affected before assuming they work.
