# Bug: "Edit Personal Details" Save is intermittent/unreliable and can pick up stray field values (wizard-created applications)

> **Revised 2026-08-05, later the same day:** further investigation showed this is not a complete, permanent no-op as first documented. A retry with a longer post-click wait (15s instead of ~2-3s) eventually fired a real, successful save. The finding is now: Save is **intermittent** for this application (most clicks do nothing; occasionally one works), and separately, an unrelated data-corruption issue (stray Email/Mobile values, and a mangled Last Name) was observed on whichever attempt first succeeded unnoticed. Both aspects are documented below.

**Date logged:** 2026-08-05
**Logged by:** QA (automated run / live investigation)
**Plans affected:** test-plans/AdminPortal/verify-edit-first-name.md / .spec.ts (ADMINPORTAL-106240), test-plans/AdminPortal/verify-edit-last-name-completeflow.md / .spec.ts (ADMINPORTAL-106246)
**Affected/related ADO Test Cases:**
- [#106240 — Edit First Name](https://dev.azure.com/boxfusion/pd-recruitment/_workitems/edit/106240) (Recruiter role, user Kwenas) — originally mis-reported PASSED (false positive), corrected to FAILED; the First Name edit was never actually retried to success and remains "AutoTest"
- [#106246 — Verify Edit Last Name](https://dev.azure.com/boxfusion/pd-recruitment/_workitems/edit/106246) (Recruiter role, user Kwenas) — eventually PASSED after several flaky Save attempts
**Related (working correctly, for contrast):** [#106529 — Verify Edit Last Name](https://dev.azure.com/boxfusion/pd-recruitment/_workitems/edit/106529) — the equivalent edit on a normal/pre-existing candidate ("Everything F" / Fred Everything) saves and persists reliably on the first attempt.
**Severity:** Medium-High — a core, frequently-used feature (editing a candidate's own name via Personal Details) is unreliable for this class of application (created via the "Add New Application" wizard), requiring multiple attempts to succeed, with no error shown to the user when it silently fails, and a separate, unconfirmed risk of picking up stray/incorrect field values on whichever attempt succeeds
**Environment:** QA — https://pd-recruitment-adminportal-qa.shesha.app/
**User:** Kwenas / "Kwena Semono" (Recruiter role)

## Expected
Per ADO #106240/#106246: clicking "Edit Personal Details", editing a field (First Name or Last Name), and clicking Save should persist the change — the field should show the new value after a page refresh, per both test cases' explicit expected results.

## Actual
Confirmed live 2026-08-05 against Job Posting Ref No 40's application created by ADMINPORTAL-106172 ("AutoTest CompleteFlow" → later "AutoTest CompleteFlows" → later "AutoTest Edit Last Name", Identity Number `9401155123095`, status PRE-SCREENED):

### 1. Intermittent Save failure
1. Clicking "Edit Personal Details" correctly opens all fields as editable inputs.
2. Editing a field (verified for both First Name and Last Name) and clicking Save usually produces **no visible error, but also no effect**:
   - The Personal Details panel **never exits edit mode** — it stays showing input fields with Cancel/Save still present.
   - Network monitoring during the Save click typically shows **zero API requests fire** — not a failed request, no request at all.
   - Browser console logs an "Editing details" message showing the payload being assembled with the **original, untouched** values, not the value just typed into the input field — consistent with the click not having registered as a real submit at all.
   - This happened across ~4-5 independent attempts, including with an explicit blur (Tab key) before Save and with `click({ force: true })`.
3. **However**, one retry — identical in every way except waiting 15 seconds after the click instead of ~2-3 seconds — did fire a real `POST https://pd-recruitment-api-qa.shesha.app/api/services/Recruitment/ManualApplications/CreateOrUpdateApplication` (200 OK), and the edit persisted correctly after reload.

This suggests the click handler and/or its resulting save request has unusually high latency or an unreliable event binding for this application specifically — most attempts appear to just not register, while occasionally one goes through after a longer delay than this project's usual 2-3s post-action wait.

### 2. Stray/corrupted field values on a successful save — since resolved by re-confirming as a deliberate edit
At some point across the flaky attempts, a save DID go through with unintended data: Last Name changed from "CompleteFlow" to "CompleteFlow**s**" (an extra character never typed by this automation, since fixed to "Edit Last Name" — see part 1), and the previously-empty Email Address and Mobile Number fields were populated with values never deliberately entered in any script at the time (`Reuben.mashifane@boxfusion.io`, `0876543245` — resembling the actual human operator's own contact details, not test data). Root cause never confirmed — plausible causes include browser-level autofill interference or a backend default-value bug substituting the acting user's own contact info for empty fields.
**Resolved 2026-08-05 (later the same day):** at the requester's explicit instruction, these same two values were re-entered deliberately via "Edit Personal Details" → Save, and this save succeeded immediately (POST fired ~0.2s after the click, unlike the multi-attempt delay seen elsewhere in this bug). Confirmed via reload: Email Address `Reuben.mashifane@boxfusion.io` and Mobile Number `0876543245` are now genuine, intentional, confirmed data on this application — no longer unexplained corruption, just coincidentally the same values. The underlying "why did they appear unrequested the first time" question remains unanswered, but is no longer an open data-integrity concern on this specific record.

## False positive this caused
ADMINPORTAL-106240's automated run originally reported **PASSED**, because its final assertion used a substring match (`getByText('Test', { exact: false })`) which also matches "Test" as a substring of the untouched original value "AutoTest". ADMINPORTAL-106246's equivalent assertion for Last Name correctly failed, since "Edit Last Name" is not a substring of "CompleteFlow" — this is what surfaced the underlying bug. ADMINPORTAL-106240's report and plan have been corrected to FAILED with this explanation; its spec's assertion has been fixed to use an exact match to prevent this recurring.

## Suspected cause
This application was created via the "Add New Application" wizard (ADMINPORTAL-106172), which is known (see `2026-08-05-add-application-no-delete-or-resume-capability.md`) to persist candidate data differently/incrementally compared to normal candidate creation. It's plausible the wizard stores Personal Details inside a JSON blob (`applicantProfileJson`) on the JobApplication entity rather than a standard relational Person record, and the "Edit Personal Details" Save handler's request/serialization path is slower or less reliably wired up for this JSON-blob-backed shape — consistent with both the intermittent silent failures and the eventual successful-but-slow save observed. The stray Email/Mobile/Last-Name corruption on the successful attempt is a separate, unconfirmed issue — possibly browser autofill, possibly a backend default-value bug; not root-caused.

## Repro
1. Log in as `Kwenas / 123qwe` at https://pd-recruitment-adminportal-qa.shesha.app/.
2. Navigate to Recruitment > Job Posting Dashboard, open Job Posting Ref No 40, open the application created via ADMINPORTAL-106172 (currently listed under whatever Last Name it was most recently and successfully saved as).
3. Click "Edit Personal Details".
4. Click into First Name or Last Name, clear it, type a new value.
5. Click Save, then wait only 2-3 seconds (the default for most edits elsewhere in this app).
6. Observe: panel most likely stays in edit mode; refresh the page — the field is usually unchanged. Retry with a much longer wait (10-15s) after the Save click — it may eventually succeed.
7. For contrast, repeat the same steps on the "Edit Last Name F" application (a normal/pre-existing candidate, not created via the wizard) — Save works reliably and immediately there.

## Recommendation
- Investigate the "Edit Personal Details" Save handler's latency/reliability for JobApplications created via the "Add New Application" wizard specifically — clicks frequently do not register at all within a normal wait window.
- Add a visible loading/success indicator so a real Recruiter isn't left wondering whether Save worked (currently: no error, no success message, just silently stays in edit mode until/unless a delayed save eventually lands).
- Separately investigate why Email/Mobile fields picked up unrequested values, and why Last Name picked up an extra character, on the save that did succeed — this could indicate a more serious data-integrity issue beyond just latency.

## Next steps for a future test run
- ADMINPORTAL-106246 now passes (Last Name correctly shows "Edit Last Name" after a retry with a longer wait). ADMINPORTAL-106240 (First Name) has NOT been successfully re-verified — First Name is still "AutoTest" and needs its own retry with a longer post-Save wait if picked up again.
- When re-testing either, prefer an exact-match assertion (`{ exact: true }`) for any short new value that could be a substring of the original value, to avoid a repeat of the #106240 false positive.
- If picking this up again, budget for Save clicks to need up to ~15s before concluding failure, and check for stray Email/Mobile/Name corruption after any successful save on this specific application.
