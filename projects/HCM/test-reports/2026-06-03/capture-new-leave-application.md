# Report: Test Plan: ELEAVE-CAPTURE — Capture New Leave Application
**Date:** 2026-06-03 11:08 UTC
**Plan:** test-plans/eLeave/capture-new-leave-application.md
**Spec:** test-plans/eLeave/capture-new-leave-application.spec.ts
**Execution Mode:** playwright-script
**Result:** PASSED
**Duration:** 233.3s

## Summary
| Total Steps | Passed | Failed | Skipped |
|-------------|--------|--------|---------|
| 53 | 23 | 0 | 30 |

## Step Results
### TC-01: Login as Admin
**Mode:** playwright-script
**Duration:** 5.9s
- [PASS] TC-01: Login as Admin

### TC-02: Park hourly leave request that does not accumulate to 8 hours
**Mode:** playwright-script
**Duration:** 0.2s
- [SKIP] TC-02: Park hourly leave request that does not accumulate to 8 hours

### TC-03: Create a leave request for one day when hourly leave request accumulates to 8 hours
**Mode:** playwright-script
**Duration:** 0.2s
- [SKIP] TC-03: Create a leave request for one day when hourly leave request accumulates to 8 hours

### TC-04: Route the leave request to the recommender when hourly leave request accumulates to 8 hours
**Mode:** playwright-script
**Duration:** 0.2s
- [SKIP] TC-04: Route the leave request to the recommender when hourly leave request accumulates to 8 hours

### TC-05: System should check if hourly leave request amounts to 8 hours
**Mode:** playwright-script
**Duration:** 0.2s
- [SKIP] TC-05: System should check if hourly leave request amounts to 8 hours

### TC-06: The attached consent form should appear throughout the workflow steps
**Mode:** playwright-script
**Duration:** 0.2s
- [SKIP] TC-06: The attached consent form should appear throughout the workflow steps

### TC-07: Submit leave request to the next step when 'OK' clicked after capturing OTP
**Mode:** playwright-script
**Duration:** 0.2s
- [SKIP] TC-07: Submit leave request to the next step when 'OK' clicked after capturing OTP

### TC-08: Display error message when OTP has expired
**Mode:** playwright-script
**Duration:** 0.2s
- [SKIP] TC-08: Display error message when OTP has expired

### TC-09: 'Close' button removes the dialog and displays 'New Leave Application' page
**Mode:** playwright-script
**Duration:** 0.2s
- [SKIP] TC-09: 'Close' button removes the dialog and displays 'New Leave Application' page

### TC-10: Remove 'Send Code' dialog when 'Cancel' button is clicked
**Mode:** playwright-script
**Duration:** 0.2s
- [SKIP] TC-10: Remove 'Send Code' dialog when 'Cancel' button is clicked

### TC-11: Return to 'SMS Verification' dialog when 'Cancel' button is clicked
**Mode:** playwright-script
**Duration:** 0.2s
- [SKIP] TC-11: Return to 'SMS Verification' dialog when 'Cancel' button is clicked

### TC-12: Send a code to the registered applicant cell number when 'OK' clicked
**Mode:** playwright-script
**Duration:** 0.2s
- [SKIP] TC-12: Send a code to the registered applicant cell number when 'OK' clicked

### TC-13: Display 'Send code' dialog when user clicks the 'Click Here' link
**Mode:** playwright-script
**Duration:** 0.2s
- [SKIP] TC-13: Display 'Send code' dialog when user clicks the 'Click Here' link

### TC-14: Display pop-up dialog on 'Click here' link click
**Mode:** playwright-script
**Duration:** 0.2s
- [SKIP] TC-14: Display pop-up dialog on 'Click here' link click

### TC-15: OTP should expire in 3 minutes
**Mode:** playwright-script
**Duration:** 0.2s
- [SKIP] TC-15: OTP should expire in 3 minutes

### TC-16: The system should show the time remaining for an OTP to expire
**Mode:** playwright-script
**Duration:** 0.2s
- [SKIP] TC-16: The system should show the time remaining for an OTP to expire

### TC-17: Display 'SMS Verification' dialog on 'Submit' when 'OTP' option is selected
**Mode:** playwright-script
**Duration:** 0.2s
- [SKIP] TC-17: Display 'SMS Verification' dialog on 'Submit' when 'OTP' option is selected

### TC-18: Send OTP to the applicant's cell number on 'Submit' when 'OTP' option is selected
**Mode:** playwright-script
**Duration:** 0.2s
- [SKIP] TC-18: Send OTP to the applicant's cell number on 'Submit' when 'OTP' option is selected

### TC-19: Display 'Consent Form' field when 'Consent Form' option is selected
**Mode:** playwright-script
**Duration:** 9.9s
- [PASS] TC-19: Display 'Consent Form' field when 'Consent Form' option is selected

### TC-20: Allow attachment of a signed consent form in the 'Consent Form' field
**Mode:** playwright-script
**Duration:** 0.3s
- [SKIP] TC-20: Allow attachment of a signed consent form in the 'Consent Form' field

### TC-21: The 'Type of Verification' field should have an option to choose OTP
**Mode:** playwright-script
**Duration:** 9.5s
- [PASS] TC-21: The 'Type of Verification' field should have an option to choose OTP

### TC-22: The 'Type of Verification' field should have an option to choose Consent Form
**Mode:** playwright-script
**Duration:** 10.4s
- [PASS] TC-22: The 'Type of Verification' field should have an option to choose Consent Form

### TC-23: Display 'Type of Verification' when 'someone else' option is selected
**Mode:** playwright-script
**Duration:** 10.0s
- [PASS] TC-23: Display 'Type of Verification' when 'someone else' option is selected

### TC-24: Clicking the 'Submit' button routes the item to the next step
**Mode:** playwright-script
**Duration:** 0.2s
- [SKIP] TC-24: Clicking the 'Submit' button routes the item to the next step

### TC-25: Clicking the 'Submit' button redirects the user to the Home page
**Mode:** playwright-script
**Duration:** 0.2s
- [SKIP] TC-25: Clicking the 'Submit' button redirects the user to the Home page

### TC-26: Clicking the 'Submit' button changes the status to 'In Progress'
**Mode:** playwright-script
**Duration:** 0.2s
- [SKIP] TC-26: Clicking the 'Submit' button changes the status to 'In Progress'

### TC-27: System should not allow submission without all mandatory fields
**Mode:** playwright-script
**Duration:** 0.2s
- [SKIP] TC-27: System should not allow submission without all mandatory fields

### TC-28: Display 'Close Leave Application' dialog when 'Close' button is clicked
**Mode:** playwright-script
**Duration:** 10.0s
- [PASS] TC-28: Display 'Close Leave Application' dialog when 'Close' button is clicked

### TC-29: Prevent leave application when there is a pending Change of Supervisor request
**Mode:** playwright-script
**Duration:** 0.3s
- [SKIP] TC-29: Prevent leave application when there is a pending Change of Supervisor request

### TC-30: System should prepopulate the recommender from the organisational structure
**Mode:** playwright-script
**Duration:** 9.9s
- [PASS] TC-30: System should prepopulate the recommender from the organisational structure

### TC-31: System should prepopulate the approver from the organisational structure
**Mode:** playwright-script
**Duration:** 10.2s
- [PASS] TC-31: System should prepopulate the approver from the organisational structure

### TC-32: The telephone field should be a read-only field
**Mode:** playwright-script
**Duration:** 10.3s
- [PASS] TC-32: The telephone field should be a read-only field

### TC-33: The telephone field should contain the mobile number of the applicant
**Mode:** playwright-script
**Duration:** 10.1s
- [PASS] TC-33: The telephone field should contain the mobile number of the applicant

### TC-34: Display 'Start Date' field when 'Days' option is selected
**Mode:** playwright-script
**Duration:** 9.5s
- [PASS] TC-34: Display 'Start Date' field when 'Days' option is selected

### TC-35: Display 'End Date' field when 'Days' option is selected
**Mode:** playwright-script
**Duration:** 9.9s
- [PASS] TC-35: Display 'End Date' field when 'Days' option is selected

### TC-36: Display 'Date' field when 'Hours' option is selected
**Mode:** playwright-script
**Duration:** 0.3s
- [SKIP] TC-36: Display 'Date' field when 'Hours' option is selected

### TC-37: Display 'Start Time' field when 'Hours' option is selected
**Mode:** playwright-script
**Duration:** 0.2s
- [SKIP] TC-37: Display 'Start Time' field when 'Hours' option is selected

### TC-38: Display 'End Time' field when 'Hours' option is selected
**Mode:** playwright-script
**Duration:** 0.2s
- [SKIP] TC-38: Display 'End Time' field when 'Hours' option is selected

### TC-39: Display 'Duration' field when 'Annual Leave' is selected
**Mode:** playwright-script
**Duration:** 10.7s
- [PASS] TC-39: Display 'Duration' field when 'Annual Leave' is selected

### TC-40: Display 'Type of Illness' field when 'Normal Sick Leave' is selected
**Mode:** playwright-script
**Duration:** 0.3s
- [SKIP] TC-40: Display 'Type of Illness' field when 'Normal Sick Leave' is selected

### TC-41: 'Type of Illness' field should be a dropdown list
**Mode:** playwright-script
**Duration:** 0.2s
- [SKIP] TC-41: 'Type of Illness' field should be a dropdown list

### TC-42: Display 'Family Relationship' field when 'Family Responsibility Leave' is selected
**Mode:** playwright-script
**Duration:** 10.1s
- [PASS] TC-42: Display 'Family Relationship' field when 'Family Responsibility Leave' is selected

### TC-43: 'Family Relationship' field should be a dropdown
**Mode:** playwright-script
**Duration:** 0.2s
- [SKIP] TC-43: 'Family Relationship' field should be a dropdown

### TC-44: The system should allow a user to select a leave type
**Mode:** playwright-script
**Duration:** 10.4s
- [PASS] TC-44: The system should allow a user to select a leave type

### TC-45: The system should require additional information based on the selected leave type
**Mode:** playwright-script
**Duration:** 10.2s
- [PASS] TC-45: The system should require additional information based on the selected leave type

### TC-46: Applicant Name field should be an auto-search field
**Mode:** playwright-script
**Duration:** 9.6s
- [PASS] TC-46: Applicant Name field should be an auto-search field

### TC-47: System prepopulates address and telephone of selected applicant
**Mode:** playwright-script
**Duration:** 0.2s
- [SKIP] TC-47: System prepopulates address and telephone of selected applicant

### TC-48: Display 'Applicant Name' field when 'someone else' option is selected
**Mode:** playwright-script
**Duration:** 10.1s
- [PASS] TC-48: Display 'Applicant Name' field when 'someone else' option is selected

### TC-49: Prepopulate address when 'Myself' option is selected
**Mode:** playwright-script
**Duration:** 10.0s
- [PASS] TC-49: Prepopulate address when 'Myself' option is selected

### TC-50: Prepopulate telephone when 'Myself' option is selected
**Mode:** playwright-script
**Duration:** 9.8s
- [PASS] TC-50: Prepopulate telephone when 'Myself' option is selected

### TC-51: Prepopulate recommender when 'Myself' option is selected
**Mode:** playwright-script
**Duration:** 9.7s
- [PASS] TC-51: Prepopulate recommender when 'Myself' option is selected

### TC-52: Prepopulate approver when 'Myself' option is selected
**Mode:** playwright-script
**Duration:** 10.0s
- [PASS] TC-52: Prepopulate approver when 'Myself' option is selected

### TC-53: Clicking create new leave opens the draft step of a leave application
**Mode:** playwright-script
**Duration:** 8.6s
- [PASS] TC-53: Clicking create new leave opens the draft step of a leave application
