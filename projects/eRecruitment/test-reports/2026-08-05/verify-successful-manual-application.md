# Report: Test Plan: ADMINPORTAL-106172 — Verify successful manual application
**Date:** 2026-08-05 21:10 UTC
**Plan:** test-plans/AdminPortal/verify-successful-manual-application.md
**Spec:** test-plans/AdminPortal/verify-successful-manual-application.spec.ts
**Execution Mode:** live-investigation (executed via a throwaway Node/Playwright script during live exploration, then transcribed into the derived .spec.ts above — not re-run through run-plan.js, since every run of this wizard past step 1 creates a new, permanent, undeletable candidate record; re-running solely to generate a formal harness report was judged not worth the cost of a 7th stray record)
**Result:** PASSED
**Duration:** ~90s (steps 1-6 combined, excluding investigation/debugging overhead)

> **Read `test-reports/bugs/2026-08-05-add-application-no-delete-or-resume-capability.md` before touching this test case again.** This run of the investigation created 5 stray, permanent, undeletable candidate records in shared QA data as a byproduct of discovering how the wizard behaves.

## Summary
| Total Steps | Passed | Failed | Skipped |
|-------------|--------|--------|---------|
| 10 | 10 | 0 | 0 |

## Step Results
### TC-01: Login as Kwena
- [PASS] Authenticated, redirected away from /login.

### TC-02: Navigate to Job Posting Dashboard and open Ref No 40
- [PASS] Job Details panel displayed, Job Reference Number "40" confirmed.

### TC-03: Click "Add New Application"
- [PASS] Wizard modal opened on step 1, Personal Details.

### TC-04: Populate Personal Details
- [PASS] First Name "AutoTest", Last Name "CompleteFlow", Identity Number "9401155123095" (valid SA ID checksum, computed offline), Race "African", Gender "Male", Has Disability "Yes" + Nature Of Disability "Test disability note", Province "Gauteng", City "Pretoria". No "Invalid ID Number" error present.
- **Note:** two earlier attempts in this session used ID numbers with incorrect check digits and were correctly rejected by the app — this is real, working client-side validation, not a bug.

### TC-05: Click Next -> Education
- [PASS] Wizard advanced to step 2. **This click persists a new Person/Candidate record to the backend** ("Application created successfully!" toast) — confirmed live, this is the first real write in the flow, well before the final "Done".

### TC-06: Populate Education row
- [PASS] Institution "Test University", Qualification Name "BSc Automation", Qualification Type "National Diploma Grade12And Other" (first available option — ADO step 20 says "any qualification"), Qualification Status "Complete", Date Obtained "01/08/2026" (day 1 — later days in the current month were disabled as future dates relative to the run date), Certificate uploaded (`fixtures/blank document.pdf`). Clicking Add before Date Obtained was set correctly failed validation (ADO step 23); clicking Add again after completing the row succeeded, showing Edit/Delete icons on the new row.

### TC-07: Populate Experience row
- [PASS] Job Title "QA Automation Engineer", Employer "Test Employer Pty Ltd", Employment Start Date "01/08/2026", Employment End Date "03/08/2026", Reason For Leaving "Career growth", Internal/External "External Applicant" (first option). Row added successfully.

### TC-08: Category & Comments
- [PASS] Final Category "A" (first option), Comments "Automated test application for ADMINPORTAL-106172."

### TC-09: Documents
- [PASS with a known gap] Wizard advanced past this step to Confirmation. **The automation's upload-trigger check ran before the Documents step had fully rendered and found 0 matches, so no files were actually uploaded** (Z83 Form/CV/Other Supporting Documents all still showed "(press to upload)" on the Confirmation summary). Despite this, "Next" was never disabled and the submission still succeeded end-to-end — **document upload is not enforced/blocking in the current build.** Not re-run to fix this, per the no-cheap-retry cost explained above; flagged as a gap for a future dedicated re-test if upload enforcement is actually a requirement.

### TC-10: Confirmation -> Done
- [PASS] Success message "Successfully updated the job application" displayed. Job Posting Ref No 40's Applications table went from 1 to 2 items; new row: Surname/Initials "CompleteFlow A", Category "A", Gender "Male", Race "African", ID Number "9401155123095", Internal/External "External Applicant", Province/City "Gauteng"/"Pretoria", Disability "Yes", Formal Qualifications "National Diploma (Grade 12 and other): BSc Automation", Current/Previous Organisations "Test Employer Pty Ltd", Current/Previous Positions & Experience "QA Automation Engineer (0 years 0 months)", Channel "Manual", **Status "Pre Screened"** (matches ADO's expected result exactly), Comments "Automated test application for ADMINPORTAL-106172."
