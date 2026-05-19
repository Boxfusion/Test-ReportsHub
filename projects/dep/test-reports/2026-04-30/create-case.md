# Report: Create Case

**Date:** 2026-04-30 UTC
**Plan:** test-plans/cases/create-case.md
**Result:** PASSED
**Duration:** 120s

## Summary
| Total Steps | Passed | Failed | Skipped |
|-------------|--------|--------|---------|
| 3 | 3 | 0 | 0 |

---

## Step Results

### TC-01 — Login as Admin
**Action:** Navigated to https://linux-dep-adminportal-test.azurewebsites.net/, typed username `admin` and password `123qwe`, clicked the Sign In button, waited for dashboard to load.
**Expected:** User is logged in and sees the admin dashboard
**Actual:** Dashboard loaded at `/dynamic/Boxfusion.ServiceManagement/service-requests`
**Result:** [PASS]

**Assertions:**
- [PASS] Dashboard/home page is visible after login (observed: service-requests list page loaded)

---

### TC-02 — Open Create Case Form
**Action:** Clicked the "Create Case" button from the dashboard. Waited for the dialog to appear and took snapshot.
**Expected:** Create case form/dialog is displayed
**Actual:** "Create Case" dialog opened and confirmed visible
**Result:** [PASS]

**Assertions:**
- [PASS] Create case form is visible (observed: dialog with Channel, Mobile Number, and other fields present)

---

### TC-03 — Fill Mandatory Fields and Submit
**Action:** Selected Channel = "Call Centre", typed email `test@test.com` to trigger Possible Matches, double-clicked the first match ("- - - test@test.com"), used the edit flow to enter Mobile Number `0766791145` and confirmed, selected Category = "Electrical", selected Case Type = "Another Test", typed Address and selected suggestion "1 Main Street, Founders Hill, Lethabong, Johannesburg, South Africa", clicked OK and waited for case creation to complete.
**Expected:** Case is created successfully and a confirmation or case reference is shown
**Actual:** Case detail page loaded showing **REF001/30/04/2026: Another Test** (case ID: d23aaa91-e7dc-4a49-94ea-df6036a55143), status: New
**Result:** [PASS]

**Assertions:**
- [PASS] Channel is set to `Call Centre` (observed: "Call Centre" shown in Channel field)
- [PASS] Mobile Number shows `0766791145` (observed: confirmed on case detail page after submitter edit)
- [PASS] A person was selected from Possible Matches (observed: submitter details went read-only with email test@test.com)
- [PASS] Category is selected (non-empty) (observed: "Electrical")
- [PASS] Case Type is selected (non-empty) (observed: "Another Test")
- [PASS] Address is filled (observed: "1 Main Street, Founders Hill, Lethabong, Johannesburg, South Africa")
- [PASS] (BLOCKING) Case submitted successfully (observed: case detail page — REF001/30/04/2026: Another Test, status New)

---

## Notes
- Possible Matches did not populate from mobile number alone; email `test@test.com` was also entered to trigger person search results.
- The selected person had no stored mobile number — the edit flow in Submitter Details was used to enter `0766791145` before final submission.
