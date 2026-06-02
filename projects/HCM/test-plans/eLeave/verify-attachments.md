# Test Plan: ELEAVE-VERIFY-ATTACHMENTS — Verify Attachments

> **Status:** Ready
> **Owner:** QA
> **Last Updated:** 2026-06-02
> **Estimated Duration:** 165s

## Metadata
| Field | Value |
|-------|-------|
| App URL | https://pd-hcm-adminportal-qa.azurewebsites.net/ |
| Environment | QA |
| Login As | admin / P@ssw0rd |
| ADO Plan | [#79625](https://dev.azure.com/boxfusion/pd-Hcm/_testPlans/define?planId=79625&suiteId=86562) |
| ADO Suite | #86562 — eleave-wf-verifyattachments-details |

## Objective
> Validate the **Verify Attachments** workflow step of eLeave — viewing captured details and downloading documents, the Verify-button activation gated on document download, the enforcement preventing verification before download/review, and the Verify / Refer Back / Close actions with their routing.

## Preconditions
- [ ] App is reachable at https://pd-hcm-adminportal-qa.azurewebsites.net/
- [ ] Admin credentials are valid (admin / P@ssw0rd)
- [ ] At least one leave application exists and is routed to the **Verify Attachments** step with supporting documents attached
- [ ] The acting user has the role required to perform the Verify Attachments step

## Test Cases

### TC-01 — Login as Admin

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE to https://pd-hcm-adminportal-qa.azurewebsites.net/
  2. SNAPSHOT — confirm login page is visible
  3. TYPE Username field with `admin`
  4. TYPE Password field with `P@ssw0rd`
  5. CLICK the Sign In button
  6. WAIT for the home page / workflow inbox to load
- **Expected result:** User is logged in and the eLeave workflow inbox is reachable
- **Assertions:**
  - [x] ASSERT (BLOCKING) URL no longer contains `/login` and the authenticated home page is visible

---

### TC-02 — Verify button routes the item to the next step (ADO #86564)

*When a user clicks on the 'Verify' button, the system should route the item to the next step and redirect the user to the Home page*

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE Navigate to the eleave-wf-verifyattachments-details view
  2. SNAPSHOT — confirm the target element for: Click on the 'Verify' button
  3. CLICK Click on the 'Verify' button
- **Expected result:** The item is routed to the next step
- **Assertions:**
  - [x] ASSERT (BLOCKING) The item is routed to the next step

---

### TC-03 — Verify button redirects the user to the Home page (ADO #86565)

*When a user clicks on the 'Verify' button, the system should route the item to the next step and redirect the user to the Home page*

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE Navigate to the eleave-wf-verifyattachments-details view
  2. SNAPSHOT — confirm the target element for: Click on the 'Verify' button
  3. CLICK Click on the 'Verify' button
- **Expected result:** The user is redirected to the Home page
- **Assertions:**
  - [x] ASSERT (BLOCKING) The user is redirected to the Home page

---

### TC-04 — Display 'Refer Back' dialog when 'Refer Back' button is clicked (ADO #86567)

*When a user clicks on the 'Refer Back' button, the system should display a 'Refer Back' dialog*

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE Navigate to the eleave-wf-verifyattachments-details view
  2. SNAPSHOT — confirm the target element for: Click on the 'Refer Back' button
  3. CLICK Click on the 'Refer Back' button
- **Expected result:** The system displays a 'Refer Back' dialog
- **Assertions:**
  - [x] ASSERT (BLOCKING) The system displays a 'Refer Back' dialog

---

### TC-05 — Display 'Close Leave Application' dialog when 'Close' button is clicked (ADO #86569)

*When a user clicks on the 'Close' button, the system should display a 'Close Leave Application' dialog*

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE Navigate to the eleave-wf-verifyattachments-details view
  2. SNAPSHOT — confirm the target element for: Click on the 'Close' button
  3. CLICK Click on the 'Close' button
- **Expected result:** The system displays a 'Close Leave Application' dialog
- **Assertions:**
  - [x] ASSERT (BLOCKING) The system displays a 'Close Leave Application' dialog

---

### TC-06 — Verify button should be activated after a user downloads the supporting documents (ADO #86571)

*The 'Verify' button should be activated after a user downloads the supporting documents*

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE Navigate to the eleave-wf-verifyattachments-details view
  2. SNAPSHOT — confirm the target element for: Download the supporting documents
  3. CLICK Download the supporting documents
  4. SNAPSHOT — confirm whether the 'Verify' button is activated
- **Expected result:** The 'Verify' button is activated after the supporting documents are downloaded
- **Assertions:**
  - [x] ASSERT (BLOCKING) The 'Verify' button is activated after the supporting documents are downloaded

---

### TC-07 — User cannot verify attachments without downloading them first (ADO #86573)

*A user should not be able to verify attachments without first downloading the attached documents and viewing them*

- **Type:** Negative
- **Steps:**
  1. NAVIGATE Navigate to the eleave-wf-verifyattachments-details view
  2. SNAPSHOT — confirm the target element for: Attempt to verify an attachment without downloading it first
  3. CLICK Attempt to verify an attachment without downloading it first
- **Expected result:** The user is unable to verify the attachment without downloading it first
- **Assertions:**
  - [x] ASSERT (BLOCKING) The user is unable to verify the attachment without downloading it first

---

### TC-08 — User cannot verify attachments without viewing them after downloading (ADO #86574)

*A user should not be able to verify attachments without first downloading the attached documents and viewing them*

- **Type:** Negative
- **Steps:**
  1. NAVIGATE Navigate to the eleave-wf-verifyattachments-details view
  2. SNAPSHOT — confirm the target element for: Download an attachment
  3. CLICK Download an attachment
  4. SNAPSHOT — confirm the target element for: Attempt to verify the attachment without viewing it
  5. CLICK Attempt to verify the attachment without viewing it
- **Expected result:** The user is unable to verify the attachment without viewing it after downloading
- **Assertions:**
  - [x] ASSERT (BLOCKING) The user is unable to verify the attachment without viewing it after downloading

---

### TC-09 — User should be able to view captured leave application details (ADO #86576)

*The user should be able to view the captured leave application details and download the attached documents*

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE Navigate to the eleave-wf-verifyattachments-details view
  2. SNAPSHOT — confirm the captured leave application details are displayed
- **Expected result:** The captured leave application details are displayed to the user
- **Assertions:**
  - [x] ASSERT (BLOCKING) The captured leave application details are displayed to the user

---

### TC-10 — User should be able to download attached documents (ADO #86577)

*The user should be able to view the captured leave application details and download the attached documents*

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE Navigate to the eleave-wf-verifyattachments-details view
  2. SNAPSHOT — confirm the target element for: Click the download option
  3. CLICK Click the download option
- **Expected result:** The attached documents are successfully downloaded
- **Assertions:**
  - [x] ASSERT (BLOCKING) The attached documents are successfully downloaded

---

## Teardown
- Log out of the admin portal after test completion (optional for automated runs).
