# Test Plan: ELEAVE-CAPTURE — Capture New Leave Application

> **Status:** Ready
> **Owner:** QA
> **Last Updated:** 2026-06-02
> **Estimated Duration:** 1050s

## Metadata
| Field | Value |
|-------|-------|
| App URL | https://pd-hcm-adminportal-qa.shesha.app/ |
| Environment | QA |
| Login As | admin / P@ssw0rd |
| ADO Plan | [#79625](https://dev.azure.com/boxfusion/pd-Hcm/_testPlans/define?planId=79625&suiteId=86340) |
| ADO Suite | #86340 — eleave-wf-capture-newleaveaplication |

## Objective
> Validate the **Capture New Leave Application** workflow step of eLeave — leave-type driven field behaviour, applicant selection, duration handling (days vs hours), verification method (OTP / Consent Form), mandatory-field enforcement, hourly-leave accumulation, and submission routing.

## Preconditions
- [ ] App is reachable at https://pd-hcm-adminportal-qa.shesha.app/
- [ ] Admin credentials are valid (admin / P@ssw0rd)
- [ ] At least one leave application exists and is routed to the **Capture New Leave Application** step (for the action/verification cases)
- [ ] The acting user has the role required to perform the Capture New Leave Application step

## Test Cases

### TC-01 — Login as Admin

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE to https://pd-hcm-adminportal-qa.shesha.app/
  2. SNAPSHOT — confirm login page is visible
  3. TYPE Username field with `admin`
  4. TYPE Password field with `P@ssw0rd`
  5. CLICK the Sign In button
  6. WAIT for the home page / workflow inbox to load
- **Expected result:** User is logged in and the eLeave workflow inbox is reachable
- **Assertions:**
  - [x] ASSERT (BLOCKING) URL no longer contains `/login` and the authenticated home page is visible

---

### TC-02 — Park hourly leave request that does not accumulate to 8 hours (ADO #86342)

*Hourly Leave When a user submits an hourly leave request that does not accumulate to 8 hours, the system should park the item and await for leave requests that will accumulate to 8 hours*

- **Type:** Happy path
- **Steps:**
  1. SNAPSHOT — confirm the target element for: Submit an hourly leave request for less than 8 hours
  2. CLICK Submit an hourly leave request for less than 8 hours
  3. SNAPSHOT Verify the system parks the leave request
- **Expected result:** The leave request is parked by the system and awaits further leave requests to accumulate to 8 hours
- **Assertions:**
  - [x] ASSERT (BLOCKING) The leave request is parked by the system and awaits further leave requests to accumulate to 8 hours

---

### TC-03 — Create a leave request for one day when hourly leave request accumulates to 8 hours (ADO #86344)

*Hourly Leave When a user submits an hourly leave request that accumulate to 8 hours, the system should create a leave request for one day and route it to the recommender*

- **Type:** Happy path
- **Steps:**
  1. SNAPSHOT — confirm the target element for: Submit an hourly leave request that totals exactly 8 hours
  2. CLICK Submit an hourly leave request that totals exactly 8 hours
  3. SNAPSHOT Verify the system creates a leave request for one day
- **Expected result:** A leave request for one day is created
- **Assertions:**
  - [x] ASSERT (BLOCKING) A leave request for one day is created

---

### TC-04 — Route the leave request to the recommender when hourly leave request accumulates to 8 hours (ADO #86345)

*Hourly Leave When a user submits an hourly leave request that accumulate to 8 hours, the system should create a leave request for one day and route it to the recommender*

- **Type:** Happy path
- **Steps:**
  1. SNAPSHOT — confirm the target element for: Submit an hourly leave request that totals exactly 8 hours
  2. CLICK Submit an hourly leave request that totals exactly 8 hours
  3. SNAPSHOT Verify the leave request is routed to the recommender
- **Expected result:** The leave request is routed to the recommender
- **Assertions:**
  - [x] ASSERT (BLOCKING) The leave request is routed to the recommender

---

### TC-05 — System should check if hourly leave request amounts to 8 hours (ADO #86347)

*Hourly Leave When a user submits an hourly leave request, the system should check if it amounts to 8 hours or not*

- **Type:** Happy path
- **Steps:**
  1. SNAPSHOT — confirm the target element for: Submit an hourly leave request.
  2. CLICK Submit an hourly leave request.
  3. SNAPSHOT Verify the system checks if the total hours requested equals 8 hours.
- **Expected result:** The system checks and confirms if the hourly leave request amounts to 8 hours.
- **Assertions:**
  - [x] ASSERT (BLOCKING) The system checks and confirms if the hourly leave request amounts to 8 hours.

---

### TC-06 — The attached consent form should appear throughout the workflow steps (ADO #86349)

*The attached consent form should appear through out the workflow steps*

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE Start the workflow for a new leave application in the eleave-wf-capture-newleaveaplication view
  2. NAVIGATE Navigate through each step of the workflow
  3. SNAPSHOT Verify that the attached consent form is displayed at each step
- **Expected result:** The attached consent form is displayed throughout all steps of the workflow
- **Assertions:**
  - [x] ASSERT (BLOCKING) The attached consent form is displayed throughout all steps of the workflow

---

### TC-07 — Submit leave request to the next step when 'OK' button is clicked after capturing OTP (ADO #86351)

*When a user clicks on the 'OK' button after capturing an OTP, the system should submit the leave request to the next step*

- **Type:** Happy path
- **Steps:**
  1. SNAPSHOT — confirm the target element for: Capture the OTP as required in the system.
  2. TYPE Capture the OTP as required in the system.
  3. SNAPSHOT — confirm the target element for: Click on the 'OK' button.
  4. CLICK Click on the 'OK' button.
- **Expected result:** The system submits the leave request to the next step.
- **Assertions:**
  - [x] ASSERT (BLOCKING) The system submits the leave request to the next step.

---

### TC-08 — Display error message when OTP has expired (ADO #86353)

*SMS Verification Dialog When a user captures an OTP that has expired, the system should display an error message, 'This OTP has expired, request for a new OTP by clicking on the 'Click...*

- **Type:** Negative
- **Steps:**
  1. SNAPSHOT — confirm the target element for: Capture an OTP that has expired
  2. TYPE Capture an OTP that has expired
  3. SNAPSHOT Observe the system's response
- **Expected result:** The system displays an error message: 'This OTP has expired, request for a new OTP by clicking on the 'Click Here' link'
- **Assertions:**
  - [x] ASSERT (BLOCKING) The system displays an error message: 'This OTP has expired, request for a new OTP by clicking on the 'Click Here' link'

---

### TC-09 — Verify 'Close' button removes the dialog and displays 'New Leave Application' page (ADO #86355)

*SMS Verification Dialog When a user clicks on the 'Close' button, the system should remove the dialog and display the 'New Leave Application'' page*

- **Type:** Happy path
- **Steps:**
  1. SNAPSHOT — confirm the target element for: Open the SMS Verification Dialog.
  2. CLICK Open the SMS Verification Dialog.
  3. SNAPSHOT — confirm the target element for: Click on the 'Close' button.
  4. CLICK Click on the 'Close' button.
- **Expected result:** The dialog is removed and the 'New Leave Application' page is displayed.
- **Assertions:**
  - [x] ASSERT (BLOCKING) The dialog is removed and the 'New Leave Application' page is displayed.

---

### TC-10 — Remove 'Send Code' dialog when 'Cancel' button is clicked (ADO #86357)

*'Send Code' dilaog, when a use clicks on the 'Cancel' button, the system should remove the dialog and return to the 'SMS Verification' dialog*

- **Type:** Happy path
- **Steps:**
  1. SNAPSHOT — confirm the target element for: Open the 'Send Code' dialog
  2. CLICK Open the 'Send Code' dialog
  3. SNAPSHOT — confirm the target element for: Click on the 'Cancel' button
  4. CLICK Click on the 'Cancel' button
- **Expected result:** The 'Send Code' dialog is removed
- **Assertions:**
  - [x] ASSERT (BLOCKING) The 'Send Code' dialog is removed

---

### TC-11 — Return to 'SMS Verification' dialog when 'Cancel' button is clicked (ADO #86358)

*'Send Code' dilaog, when a use clicks on the 'Cancel' button, the system should remove the dialog and return to the 'SMS Verification' dialog*

- **Type:** Happy path
- **Steps:**
  1. SNAPSHOT — confirm the target element for: Open the 'Send Code' dialog
  2. CLICK Open the 'Send Code' dialog
  3. SNAPSHOT — confirm the target element for: Click on the 'Cancel' button
  4. CLICK Click on the 'Cancel' button
- **Expected result:** The system returns to the 'SMS Verification' dialog
- **Assertions:**
  - [x] ASSERT (BLOCKING) The system returns to the 'SMS Verification' dialog

---

### TC-12 — Send a code to the registered applicant cell number when 'OK' button is clicked (ADO #86360)

*'Send Code' dialog When a user clicks on the 'OK' button, the system should send a code to the registered applicant cell number*

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE Navigate to the 'Send Code' dialog
  2. SNAPSHOT — confirm the target element for: Click on the 'OK' button
  3. CLICK Click on the 'OK' button
- **Expected result:** A code is sent to the registered applicant cell number
- **Assertions:**
  - [x] ASSERT (BLOCKING) A code is sent to the registered applicant cell number

---

### TC-13 — Display 'Send code' dialog when user clicks on 'Click Here' link (ADO #86362)

*SMS Verification Dialog When a user clicks on the 'Click Here' link, the system should display a 'Send code' dialog*

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE Navigate to the parent view 'eleave-wf-capture-newleaveaplication'
  2. SNAPSHOT — confirm the target element for: Locate the 'Click Here' link
  3. CLICK Locate the 'Click Here' link
  4. SNAPSHOT — confirm the target element for: Click on the 'Click Here' link
  5. CLICK Click on the 'Click Here' link
- **Expected result:** The system displays the 'Send code' dialog
- **Assertions:**
  - [x] ASSERT (BLOCKING) The system displays the 'Send code' dialog

---

### TC-14 — Display pop-up dialog on 'Click here' link click (ADO #86364)

*SMS Verification Dialog When a user clicks on the 'Click here' link, the system should display a pop-up dialog allowing a user to send an OTP*

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE Navigate to the page with the 'Click here' link
  2. SNAPSHOT — confirm the target element for: Click on the 'Click here' link
  3. CLICK Click on the 'Click here' link
- **Expected result:** A pop-up dialog is displayed allowing the user to send an OTP
- **Assertions:**
  - [x] ASSERT (BLOCKING) A pop-up dialog is displayed allowing the user to send an OTP

---

### TC-15 — OTP should expire in 3 minutes (ADO #86366)

*SMS Verification Dialog 1. An OTP should expire in 3 minutes*

- **Type:** Negative
- **Steps:**
  1. SNAPSHOT Trigger the SMS verification process to receive an OTP.
  2. WAIT Wait for 3 minutes.
  3. SNAPSHOT — confirm the target element for: Attempt to use the OTP after 3 minutes.
  4. CLICK Attempt to use the OTP after 3 minutes.
- **Expected result:** The OTP is expired and cannot be used after 3 minutes.
- **Assertions:**
  - [x] ASSERT (BLOCKING) The OTP is expired and cannot be used after 3 minutes.

---

### TC-16 — The system should show the time remaining for an OTP to expire (ADO #86368)

*SMS Verification Dialog 1. The system should show the time remaining for an OTP to expire*

- **Type:** Happy path
- **Steps:**
  1. SNAPSHOT Trigger the SMS Verification Dialog.
  2. SNAPSHOT Verify that the time remaining for the OTP to expire is displayed on the dialog.
- **Expected result:** The SMS Verification Dialog displays the time remaining for the OTP to expire.
- **Assertions:**
  - [x] ASSERT (BLOCKING) The SMS Verification Dialog displays the time remaining for the OTP to expire.

---

### TC-17 — Display 'SMS Verification' dialog on 'Submit' when 'OTP' option is selected (ADO #86370)

*When a user selects the 'OTP' option, on 'Submit', the system should display a 'SMS Verification' dialog and send an OTP to the applicant's cell number*

- **Type:** Happy path
- **Steps:**
  1. SNAPSHOT — confirm the target element for: Select the 'OTP' option
  2. SELECT Select the 'OTP' option
  3. SNAPSHOT — confirm the target element for: Click 'Submit'
  4. CLICK Click 'Submit'
  5. SNAPSHOT Verify that the 'SMS Verification' dialog is displayed
- **Expected result:** The 'SMS Verification' dialog is displayed upon clicking 'Submit' after selecting the 'OTP' option
- **Assertions:**
  - [x] ASSERT (BLOCKING) The 'SMS Verification' dialog is displayed upon clicking 'Submit' after selecting the 'OTP' option

---

### TC-18 — Send OTP to the applicant's cell number on 'Submit' when 'OTP' option is selected (ADO #86371)

*When a user selects the 'OTP' option, on 'Submit', the system should display a 'SMS Verification' dialog and send an OTP to the applicant's cell number*

- **Type:** Happy path
- **Steps:**
  1. SNAPSHOT — confirm the target element for: Select the 'OTP' option
  2. SELECT Select the 'OTP' option
  3. SNAPSHOT — confirm the target element for: Click 'Submit'
  4. CLICK Click 'Submit'
  5. SNAPSHOT Verify that an OTP is sent to the applicant's cell number
- **Expected result:** An OTP is sent to the applicant's cell number upon clicking 'Submit' after selecting the 'OTP' option
- **Assertions:**
  - [x] ASSERT (BLOCKING) An OTP is sent to the applicant's cell number upon clicking 'Submit' after selecting the 'OTP' option

---

### TC-19 — Display 'Consent Form' field when 'Consent Form' option is selected (ADO #86373)

*When a user selects the 'Consent Form' option, the system should display the 'Consent Form' field, allowing a user to attach a signed consent form*

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE Navigate to the application form
  2. SNAPSHOT — confirm the target element for: Select the 'Consent Form' option
  3. SELECT Select the 'Consent Form' option
- **Expected result:** The 'Consent Form' field is displayed
- **Assertions:**
  - [x] ASSERT (BLOCKING) The 'Consent Form' field is displayed

---

### TC-20 — Allow attachment of a signed consent form in the 'Consent Form' field (ADO #86374)

*When a user selects the 'Consent Form' option, the system should display the 'Consent Form' field, allowing a user to attach a signed consent form*

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE Navigate to the application form
  2. SNAPSHOT — confirm the target element for: Select the 'Consent Form' option
  3. SELECT Select the 'Consent Form' option
  4. SNAPSHOT Attach a signed consent form in the 'Consent Form' field
- **Expected result:** The signed consent form is successfully attached in the 'Consent Form' field
- **Assertions:**
  - [x] ASSERT (BLOCKING) The signed consent form is successfully attached in the 'Consent Form' field

---

### TC-21 — The 'Type of Verification' field should have an option to choose OTP (ADO #86376)

*The 'Type of Verification' field should have two options to choose from - OTP - Consent Form*

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE Navigate to the eleave-wf-capture-newleaveapplication form
  2. SNAPSHOT Locate the 'Type of Verification' field
  3. SNAPSHOT Verify that 'OTP' is an available option in the 'Type of Verification' field
- **Expected result:** 'OTP' is present as an option in the 'Type of Verification' field
- **Assertions:**
  - [x] ASSERT (BLOCKING) 'OTP' is present as an option in the 'Type of Verification' field

---

### TC-22 — The 'Type of Verification' field should have an option to choose Consent Form (ADO #86377)

*The 'Type of Verification' field should have two options to choose from - OTP - Consent Form*

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE Navigate to the eleave-wf-capture-newleaveapplication form
  2. SNAPSHOT Locate the 'Type of Verification' field
  3. SNAPSHOT Verify that 'Consent Form' is an available option in the 'Type of Verification' field
- **Expected result:** 'Consent Form' is present as an option in the 'Type of Verification' field
- **Assertions:**
  - [x] ASSERT (BLOCKING) 'Consent Form' is present as an option in the 'Type of Verification' field

---

### TC-23 — Display 'Type of Verification' when 'someone else' option is selected (ADO #86379)

*Who are you requesting the leave for? If the 'someone else' option is selected, the system should display the 'Type of Verification'*

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE Navigate to the leave request form
  2. SNAPSHOT — confirm the target element for: Select the 'someone else' option
  3. SELECT Select the 'someone else' option
  4. SNAPSHOT Verify the 'Type of Verification' is displayed
- **Expected result:** The 'Type of Verification' is displayed when the 'someone else' option is selected
- **Assertions:**
  - [x] ASSERT (BLOCKING) The 'Type of Verification' is displayed when the 'someone else' option is selected

---

### TC-24 — Clicking the 'Submit' button routes the item to the next step (ADO #86381)

*When a user clicks on the 'Submit' button, the system should route the item to the next step and redirect the user to the Home page - The status should change to 'In Progress'*

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE Navigate to the application where the 'Submit' button is present
  2. SNAPSHOT — confirm the target element for: Click on the 'Submit' button
  3. CLICK Click on the 'Submit' button
- **Expected result:** The item is routed to the next step
- **Assertions:**
  - [x] ASSERT (BLOCKING) The item is routed to the next step

---

### TC-25 — Clicking the 'Submit' button redirects the user to the Home page (ADO #86382)

*When a user clicks on the 'Submit' button, the system should route the item to the next step and redirect the user to the Home page - The status should change to 'In Progress'*

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE Navigate to the application where the 'Submit' button is present
  2. SNAPSHOT — confirm the target element for: Click on the 'Submit' button
  3. CLICK Click on the 'Submit' button
- **Expected result:** The user is redirected to the Home page
- **Assertions:**
  - [x] ASSERT (BLOCKING) The user is redirected to the Home page

---

### TC-26 — Clicking the 'Submit' button changes the status to 'In Progress' (ADO #86383)

*When a user clicks on the 'Submit' button, the system should route the item to the next step and redirect the user to the Home page - The status should change to 'In Progress'*

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE Navigate to the application where the 'Submit' button is present
  2. SNAPSHOT — confirm the target element for: Click on the 'Submit' button
  3. CLICK Click on the 'Submit' button
  4. SNAPSHOT Verify the status of the item
- **Expected result:** The status of the item changes to 'In Progress'
- **Assertions:**
  - [x] ASSERT (BLOCKING) The status of the item changes to 'In Progress'

---

### TC-27 — The system should not allow submission of a leave application without populating all mandatory fields (ADO #86385)

*The system should not allow a user to submit a leave application without populating all the mandatory fields*

- **Type:** Negative
- **Steps:**
  1. NAVIGATE Open the leave application form
  2. SNAPSHOT — confirm the target element for: Attempt to submit the form without filling any fields
  3. CLICK Attempt to submit the form without filling any fields
  4. SNAPSHOT Verify that the submission is not allowed
- **Expected result:** The leave application form cannot be submitted without populating all mandatory fields
- **Assertions:**
  - [x] ASSERT (BLOCKING) The leave application form cannot be submitted without populating all mandatory fields

---

### TC-28 — Display 'Close Leave Application' dialog when 'Close' button is clicked (ADO #86387)

*When a user clicks on the 'Close' button, the system should display a 'Close Leave Application' dialog*

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE Navigate to the 'eleave-wf-capture-newleaveaplication' view
  2. SNAPSHOT — confirm the target element for: Click on the 'Close' button
  3. CLICK Click on the 'Close' button
- **Expected result:** The system displays a 'Close Leave Application' dialog
- **Assertions:**
  - [x] ASSERT (BLOCKING) The system displays a 'Close Leave Application' dialog

---

### TC-29 — System should prevent starting leave application process when there is a pending Change of Supervisor request (ADO #86389)

*A user should not be able to start leave application process while there is a pending item on the Change of Supervisor process on Submit, The system should display this error message 'P...*

- **Type:** Negative
- **Steps:**
  1. SNAPSHOT Ensure there is a pending Change of Supervisor request for the user.
  2. SNAPSHOT — confirm the target element for: Attempt to start a new leave application process.
  3. CLICK Attempt to start a new leave application process.
- **Expected result:** The system prevents the leave application process from starting and displays the error message: 'Please note that you currently have a change of supervisor request in progress. You will only be able to submit a leave request once the change of supervisor process has been completed.'
- **Assertions:**
  - [x] ASSERT (BLOCKING) The system prevents the leave application process from starting and displays the error message: 'Please note that you currently have a change of supervisor request in progress. You will only be able to submit a leave request once the change of supervisor process has been completed.'

---

### TC-30 — The system should prepopulate the recommender of the applicant from the organisational structure (ADO #86391)

*The system should prepopulate the recommender and the approver of the applicant from the organisational structure*

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE Navigate to the new leave application form
  2. SNAPSHOT Verify that the recommender field is prepopulated with data from the organisational structure
- **Expected result:** The recommender field is prepopulated with the correct data from the organisational structure
- **Assertions:**
  - [x] ASSERT (BLOCKING) The recommender field is prepopulated with the correct data from the organisational structure

---

### TC-31 — The system should prepopulate the approver of the applicant from the organisational structure (ADO #86392)

*The system should prepopulate the recommender and the approver of the applicant from the organisational structure*

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE Navigate to the new leave application form
  2. SNAPSHOT Verify that the approver field is prepopulated with data from the organisational structure
- **Expected result:** The approver field is prepopulated with the correct data from the organisational structure
- **Assertions:**
  - [x] ASSERT (BLOCKING) The approver field is prepopulated with the correct data from the organisational structure

---

### TC-32 — The telephone field should be a read-only field (ADO #86394)

*The telephone field should be a read-only field with mobile number of the applicant*

- **Type:** Negative
- **Steps:**
  1. NAVIGATE Navigate to the eleave-wf-capture-newleaveapplication view
  2. SNAPSHOT Locate the telephone field
  3. SNAPSHOT — confirm the target element for: Attempt to edit the telephone field
  4. CLICK Attempt to edit the telephone field
- **Expected result:** The telephone field is displayed as read-only and cannot be edited
- **Assertions:**
  - [x] ASSERT (BLOCKING) The telephone field is displayed as read-only and cannot be edited

---

### TC-33 — The telephone field should contain the mobile number of the applicant (ADO #86395)

*The telephone field should be a read-only field with mobile number of the applicant*

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE Navigate to the eleave-wf-capture-newleaveapplication view
  2. SNAPSHOT Locate the telephone field
  3. SNAPSHOT Verify the field contains the mobile number of the applicant
- **Expected result:** The telephone field contains the mobile number of the applicant
- **Assertions:**
  - [x] ASSERT (BLOCKING) The telephone field contains the mobile number of the applicant

---

### TC-34 — Display 'Start Date' field when 'Days' option is selected (ADO #86397)

*'Duration' field When a user selects the 'Days' option, the system should display the 'Start Date', and 'End Date' fields*

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE Navigate to the 'Duration' field in the application
  2. SNAPSHOT — confirm the target element for: Select the 'Days' option
  3. SELECT Select the 'Days' option
  4. SNAPSHOT Verify the 'Start Date' field is displayed
- **Expected result:** The 'Start Date' field is displayed when the 'Days' option is selected
- **Assertions:**
  - [x] ASSERT (BLOCKING) The 'Start Date' field is displayed when the 'Days' option is selected

---

### TC-35 — Display 'End Date' field when 'Days' option is selected (ADO #86398)

*'Duration' field When a user selects the 'Days' option, the system should display the 'Start Date', and 'End Date' fields*

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE Navigate to the 'Duration' field in the application
  2. SNAPSHOT — confirm the target element for: Select the 'Days' option
  3. SELECT Select the 'Days' option
  4. SNAPSHOT Verify the 'End Date' field is displayed
- **Expected result:** The 'End Date' field is displayed when the 'Days' option is selected
- **Assertions:**
  - [x] ASSERT (BLOCKING) The 'End Date' field is displayed when the 'Days' option is selected

---

### TC-36 — Display 'Date' field when 'Hours' option is selected (ADO #86400)

*'Duration' field When a user selects the 'Hours' option, the system should display the 'Date', 'Start Time', and 'End Time' fields*

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE Navigate to the leave application form
  2. SNAPSHOT — confirm the target element for: Select the 'Hours' option in the 'Duration' field
  3. SELECT Select the 'Hours' option in the 'Duration' field
  4. SNAPSHOT Verify the 'Date' field is displayed
- **Expected result:** The 'Date' field is displayed when the 'Hours' option is selected
- **Assertions:**
  - [x] ASSERT (BLOCKING) The 'Date' field is displayed when the 'Hours' option is selected

---

### TC-37 — Display 'Start Time' field when 'Hours' option is selected (ADO #86401)

*'Duration' field When a user selects the 'Hours' option, the system should display the 'Date', 'Start Time', and 'End Time' fields*

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE Navigate to the leave application form
  2. SNAPSHOT — confirm the target element for: Select the 'Hours' option in the 'Duration' field
  3. SELECT Select the 'Hours' option in the 'Duration' field
  4. SNAPSHOT Verify the 'Start Time' field is displayed
- **Expected result:** The 'Start Time' field is displayed when the 'Hours' option is selected
- **Assertions:**
  - [x] ASSERT (BLOCKING) The 'Start Time' field is displayed when the 'Hours' option is selected

---

### TC-38 — Display 'End Time' field when 'Hours' option is selected (ADO #86402)

*'Duration' field When a user selects the 'Hours' option, the system should display the 'Date', 'Start Time', and 'End Time' fields*

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE Navigate to the leave application form
  2. SNAPSHOT — confirm the target element for: Select the 'Hours' option in the 'Duration' field
  3. SELECT Select the 'Hours' option in the 'Duration' field
  4. SNAPSHOT Verify the 'End Time' field is displayed
- **Expected result:** The 'End Time' field is displayed when the 'Hours' option is selected
- **Assertions:**
  - [x] ASSERT (BLOCKING) The 'End Time' field is displayed when the 'Hours' option is selected

---

### TC-39 — Display 'Duration' field when 'Annual Leave' is selected (ADO #86404)

*When a user selects an 'Annual Leave', the system should display the 'Duration' field*

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE Navigate to the leave application form
  2. SNAPSHOT — confirm the target element for: Select 'Annual Leave' from the leave type options
  3. SELECT Select 'Annual Leave' from the leave type options
- **Expected result:** The 'Duration' field is displayed on the form
- **Assertions:**
  - [x] ASSERT (BLOCKING) The 'Duration' field is displayed on the form

---

### TC-40 — Display 'Type of Illness' field when 'Normal Sick Leave' is selected (ADO #86406)

*When a user selects a 'Normal Sick Leave' the system should display the 'Type of Illness' field - This field should be a dropdown list, allowing a user to select the type of illness*

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE Navigate to the leave application form
  2. SNAPSHOT — confirm the target element for: Select 'Normal Sick Leave' from the leave type options
  3. SELECT Select 'Normal Sick Leave' from the leave type options
  4. SNAPSHOT Verify the 'Type of Illness' field is displayed
- **Expected result:** The 'Type of Illness' field is displayed when 'Normal Sick Leave' is selected
- **Assertions:**
  - [x] ASSERT (BLOCKING) The 'Type of Illness' field is displayed when 'Normal Sick Leave' is selected

---

### TC-41 — 'Type of Illness' field should be a dropdown list (ADO #86407)

*When a user selects a 'Normal Sick Leave' the system should display the 'Type of Illness' field - This field should be a dropdown list, allowing a user to select the type of illness*

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE Navigate to the leave application form
  2. SNAPSHOT — confirm the target element for: Select 'Normal Sick Leave' from the leave type options
  3. SELECT Select 'Normal Sick Leave' from the leave type options
  4. SNAPSHOT Verify the 'Type of Illness' field is a dropdown list
- **Expected result:** The 'Type of Illness' field is a dropdown list
- **Assertions:**
  - [x] ASSERT (BLOCKING) The 'Type of Illness' field is a dropdown list

---

### TC-42 — Display 'Family Relationship' field when 'Family Responsibility Leave' is selected (ADO #86409)

*When a user selects a 'Family Responsibility Leave', the system should display a 'Family Relationship' field - This field should be a dropdown field, allowing a user to select a relatio...*

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE Navigate to the leave application form.
  2. SNAPSHOT — confirm the target element for: Select 'Family Responsibility Leave' from the leave type options.
  3. SELECT Select 'Family Responsibility Leave' from the leave type options.
- **Expected result:** The 'Family Relationship' field is displayed on the form.
- **Assertions:**
  - [x] ASSERT (BLOCKING) The 'Family Relationship' field is displayed on the form.

---

### TC-43 — 'Family Relationship' field should be a dropdown (ADO #86410)

*When a user selects a 'Family Responsibility Leave', the system should display a 'Family Relationship' field - This field should be a dropdown field, allowing a user to select a relatio...*

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE Navigate to the leave application form.
  2. SNAPSHOT — confirm the target element for: Select 'Family Responsibility Leave' from the leave type options.
  3. SELECT Select 'Family Responsibility Leave' from the leave type options.
  4. SNAPSHOT Verify the 'Family Relationship' field is a dropdown.
- **Expected result:** The 'Family Relationship' field is a dropdown allowing selection of a relationship.
- **Assertions:**
  - [x] ASSERT (BLOCKING) The 'Family Relationship' field is a dropdown allowing selection of a relationship.

---

### TC-44 — The system should allow a user to select a leave type (ADO #86412)

*The system should allow a user to select a leave type and require additional information based on the selected leave type*

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE Navigate to the leave application form
  2. SNAPSHOT Verify the presence of a dropdown or selection field for leave type
  3. SNAPSHOT — confirm the target element for: Select a leave type from the available options
  4. SELECT Select a leave type from the available options
- **Expected result:** The user is able to select a leave type from the available options
- **Assertions:**
  - [x] ASSERT (BLOCKING) The user is able to select a leave type from the available options

---

### TC-45 — The system should require additional information based on the selected leave type (ADO #86413)

*The system should allow a user to select a leave type and require additional information based on the selected leave type*

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE Navigate to the leave application form
  2. SNAPSHOT — confirm the target element for: Select a specific leave type from the leave type selection
  3. SELECT Select a specific leave type from the leave type selection
  4. SNAPSHOT Verify that additional information fields appear based on the selected leave type
- **Expected result:** Additional information fields are displayed based on the selected leave type
- **Assertions:**
  - [x] ASSERT (BLOCKING) Additional information fields are displayed based on the selected leave type

---

### TC-46 — Applicant Name field should be an auto-search field (ADO #86415)

*The 'Applicant Name' field should be an auto-search field - The system should prepopulate the address together with the telephone of the selected applicant when a user selects the appli...*

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE Navigate to the eleave-wf-capture-newleaveaplication view
  2. NAVIGATE Focus on the 'Applicant Name' field
  3. SNAPSHOT — confirm the target element for: Begin typing a known applicant name
  4. TYPE Begin typing a known applicant name
  5. SNAPSHOT Verify that a list of suggested applicant names appears
- **Expected result:** A list of suggested applicant names is displayed as the user types in the 'Applicant Name' field
- **Assertions:**
  - [x] ASSERT (BLOCKING) A list of suggested applicant names is displayed as the user types in the 'Applicant Name' field

---

### TC-47 — System prepopulates address and telephone of selected applicant (ADO #86416)

*The 'Applicant Name' field should be an auto-search field - The system should prepopulate the address together with the telephone of the selected applicant when a user selects the appli...*

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE Navigate to the eleave-wf-capture-newleaveaplication view
  2. NAVIGATE Focus on the 'Applicant Name' field and type a known applicant name
  3. SNAPSHOT — confirm the target element for: Select an applicant name from the suggested list
  4. SELECT Select an applicant name from the suggested list
  5. SNAPSHOT Verify that the address and telephone fields are prepopulated with the selected applicant's information
- **Expected result:** The address and telephone fields are prepopulated with the selected applicant's information
- **Assertions:**
  - [x] ASSERT (BLOCKING) The address and telephone fields are prepopulated with the selected applicant's information

---

### TC-48 — Display 'Applicant Name' field when 'someone else' option is selected (ADO #86418)

*Who are you requesting the leave for? If the 'someone else' option is selected, the system should display the 'Applicant Name' field that allows a user to select the name of the applicant.*

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE Navigate to the leave application form.
  2. SNAPSHOT — confirm the target element for: Select the 'someone else' option for requesting leave.
  3. SELECT Select the 'someone else' option for requesting leave.
  4. SNAPSHOT Verify the 'Applicant Name' field is displayed.
- **Expected result:** The 'Applicant Name' field is displayed when the 'someone else' option is selected.
- **Assertions:**
  - [x] ASSERT (BLOCKING) The 'Applicant Name' field is displayed when the 'someone else' option is selected.

---

### TC-49 — Prepopulate address when 'Myself' option is selected (ADO #86420)

*Who are you requesting the leave for? If the 'Myself' option is selected, the system should prepopulate the address, telephone, recommender and approver from the user profile and organi...*

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE Navigate to the leave request form
  2. SNAPSHOT — confirm the target element for: Select the 'Myself' option
  3. SELECT Select the 'Myself' option
  4. SNAPSHOT Verify the address field is prepopulated from the user profile
- **Expected result:** The address field is prepopulated with the user's profile address
- **Assertions:**
  - [x] ASSERT (BLOCKING) The address field is prepopulated with the user's profile address

---

### TC-50 — Prepopulate telephone when 'Myself' option is selected (ADO #86421)

*Who are you requesting the leave for? If the 'Myself' option is selected, the system should prepopulate the address, telephone, recommender and approver from the user profile and organi...*

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE Navigate to the leave request form
  2. SNAPSHOT — confirm the target element for: Select the 'Myself' option
  3. SELECT Select the 'Myself' option
  4. SNAPSHOT Verify the telephone field is prepopulated from the user profile
- **Expected result:** The telephone field is prepopulated with the user's profile telephone number
- **Assertions:**
  - [x] ASSERT (BLOCKING) The telephone field is prepopulated with the user's profile telephone number

---

### TC-51 — Prepopulate recommender when 'Myself' option is selected (ADO #86422)

*Who are you requesting the leave for? If the 'Myself' option is selected, the system should prepopulate the address, telephone, recommender and approver from the user profile and organi...*

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE Navigate to the leave request form
  2. SNAPSHOT — confirm the target element for: Select the 'Myself' option
  3. SELECT Select the 'Myself' option
  4. SNAPSHOT Verify the recommender field is prepopulated from the organisational structure
- **Expected result:** The recommender field is prepopulated with the appropriate recommender from the organisational structure
- **Assertions:**
  - [x] ASSERT (BLOCKING) The recommender field is prepopulated with the appropriate recommender from the organisational structure

---

### TC-52 — Prepopulate approver when 'Myself' option is selected (ADO #86423)

*Who are you requesting the leave for? If the 'Myself' option is selected, the system should prepopulate the address, telephone, recommender and approver from the user profile and organi...*

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE Navigate to the leave request form
  2. SNAPSHOT — confirm the target element for: Select the 'Myself' option
  3. SELECT Select the 'Myself' option
  4. SNAPSHOT Verify the approver field is prepopulated from the organisational structure
- **Expected result:** The approver field is prepopulated with the appropriate approver from the organisational structure
- **Assertions:**
  - [x] ASSERT (BLOCKING) The approver field is prepopulated with the appropriate approver from the organisational structure

---

### TC-53 — When a user clicks create new leave, the system should open the draft step of a leave application (ADO #86425)

*When a user clicks create new leave, the system should open the draft step of a leave application*

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE Navigate to the leave management system
  2. SNAPSHOT — confirm the target element for: Click on the 'Create New Leave' button
  3. CLICK Click on the 'Create New Leave' button
- **Expected result:** The system opens the draft step of a leave application
- **Assertions:**
  - [x] ASSERT (BLOCKING) The system opens the draft step of a leave application

---

## Teardown
- Log out of the admin portal after test completion (optional for automated runs).
